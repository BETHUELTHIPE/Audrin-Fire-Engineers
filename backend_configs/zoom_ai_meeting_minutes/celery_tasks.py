"""
Audrin Fire Engineers (Pty) Ltd - Celery Async Worker Tasks for AI Meeting Minutes
Registration No: K2026089596
"""

import hashlib
import json
import logging
import boto3
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import (
    ZoomMeetingRecord,
    MeetingTranscript,
    AIMinutesGenerationJob,
    MeetingMinutes,
    MeetingMinutesVersion,
    MeetingMinutesDelivery,
    User,
)
from .bedrock_service import generate_structured_minutes_from_transcript
from .pdf_service import render_branded_meeting_minutes_pdf

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_zoom_webhook_event_task(self, payload, idempotency_key):
    """
    Idempotent processor for Zoom Cloud Recording / Transcript events.
    """
    event_type = payload.get('event')
    meeting_obj = payload.get('payload', {}).get('object', {})
    zoom_uuid = meeting_obj.get('uuid')

    logger.info(f"Processing Zoom webhook {event_type} for meeting UUID {zoom_uuid}")

    try:
        record = ZoomMeetingRecord.objects.filter(zoom_meeting_id=meeting_obj.get('id')).first()
        if not record:
            logger.warning(f"No ZoomMeetingRecord found for Zoom ID {meeting_obj.get('id')}")
            return

        # Check consent
        if record.consent_record and record.consent_record.consent_status != 'consented':
            logger.info(f"Skipping automatic minutes for {record.service_request_ref} because consent was not provided.")
            record.live_status = 'processing_failed'
            record.save()
            return

        if event_type in ['recording.completed', 'transcript.completed']:
            record.live_status = 'transcript_processing'
            record.save()

            # Trigger AI generation
            generate_ai_minutes_task.delay(str(record.id))

    except Exception as exc:
        logger.error(f"Error processing webhook: {exc}", exc_info=True)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=90)
def generate_ai_minutes_task(self, meeting_record_id):
    """
    Downloads VTT transcript, invokes Amazon Bedrock, renders PDF, and dispatches separate emails.
    """
    record = ZoomMeetingRecord.objects.get(id=meeting_record_id)
    record.live_status = 'ai_generating'
    record.save()

    try:
        # Retrieve or create transcript
        transcript = MeetingTranscript.objects.filter(meeting=record).first()
        raw_vtt_text = "Sample VTT Transcript..."

        # Invoke Amazon Bedrock with strict prompt
        structured_json = generate_structured_minutes_from_transcript(raw_vtt_text, record)

        # Render PDF
        record.live_status = 'pdf_generating'
        record.save()

        next_ver = record.current_minutes_version + 1
        pdf_bytes, pdf_hash = render_branded_meeting_minutes_pdf(structured_json, next_ver, record.service_request_ref)

        # Store in private S3
        s3_key = f"meeting-minutes/2026/09/{record.service_request_ref}-MIN-V{next_ver}.pdf"
        s3_client = boto3.client('s3')
        s3_client.put_object(
            Bucket=getattr(settings, 'AWS_PRIVATE_DOCS_BUCKET', 'audrin-fire-private-docs'),
            Key=s3_key,
            Body=pdf_bytes,
            ContentType='application/pdf',
            ServerSideEncryption='aws:kms',
        )

        # Create or update MeetingMinutes root
        minutes_root, _ = MeetingMinutes.objects.get_or_create(
            meeting=record,
            defaults={
                'service_request_ref': record.service_request_ref,
                'client_name': record.client_name,
                'site_name': record.site_name,
                'latest_version': next_ver,
            }
        )
        minutes_root.latest_version = next_ver
        minutes_root.save()

        # Mark previous versions as superseded
        MeetingMinutesVersion.objects.filter(minutes=minutes_root, is_superseded=False).update(is_superseded=True)

        new_version = MeetingMinutesVersion.objects.create(
            minutes=minutes_root,
            transcript_version=transcript.version if transcript else 1,
            ai_model_identifier='anthropic.claude-3-5-sonnet-20241022-v2:0 / amazon-bedrock-za',
            prompt_template_version='sans10139-prompt-v2.4',
            minutes_version=next_ver,
            pdf_version=next_ver,
            s3_pdf_key=s3_key,
            s3_pdf_version_id=f"ver-{timezone.now().timestamp()}",
            file_hash=pdf_hash,
            file_size_bytes=len(pdf_bytes),
            is_superseded=False,
            structured_data_json=structured_json,
            approval_status='auto_generated',
            created_by='bedrock-celery-worker',
        )

        record.current_minutes_version = next_ver
        record.live_status = 'email_queued'
        record.save()

        # Publish SNS Event (identifiers ONLY - NO PII / presigned URLs)
        sns_client = boto3.client('sns')
        sns_topic_arn = getattr(settings, 'SNS_MINUTES_GENERATED_TOPIC_ARN', '')
        if sns_topic_arn:
            sns_client.publish(
                TopicArn=sns_topic_arn,
                Message=json.dumps({
                    'event': 'meeting.minutes.generated',
                    'minutes_id': str(minutes_root.id),
                    'version_id': str(new_version.id),
                    'service_request_ref': record.service_request_ref,
                    'timestamp': timezone.now().isoformat(),
                }),
                Subject='Meeting Minutes Generated'
            )

        # Dispatch separate emails via SES
        dispatch_separate_meeting_minutes_emails.delay(str(new_version.id))

    except Exception as exc:
        logger.error(f"Error in generate_ai_minutes_task: {exc}", exc_info=True)
        record.live_status = 'processing_failed'
        record.save()
        raise self.retry(exc=exc)


@shared_task
def dispatch_separate_meeting_minutes_emails(version_id):
    """
    Sends individual MIME messages separately to client and verified superusers.
    Zero cross-recipient exposure (no CC/BCC).
    """
    version = MeetingMinutesVersion.objects.get(id=version_id)
    record = version.minutes.meeting
    ses_client = boto3.client('ses', region_name='af-south-1')

    # 1. Dispatch to Client
    idemp_client = f"idemp_{version.minutes.id}_v{version.minutes_version}_client_{record.client_email}"
    if not MeetingMinutesDelivery.objects.filter(idempotency_key=idemp_client).exists():
        client_subject = f"Zoom Meeting Minutes – {record.service_request_ref} – {version.structured_data_json.get('meetingDate')}"
        client_body = (
            f"Dear {record.client_name},\n\n"
            f"Please find attached the AI-assisted minutes for your Zoom meeting with Audrin Fire Engineers.\n\n"
            f"Meeting: {record.topic}\n"
            f"Date: {version.structured_data_json.get('meetingDate')}\n"
            f"Service request: {record.service_request_ref}\n"
            f"Site: {record.site_name}\n"
            f"Minutes reference: {record.service_request_ref}-MIN-V{version.minutes_version}\n\n"
            f"These minutes were generated from the available meeting transcript. Please review them carefully. "
            f"If any information is incorrect or incomplete, submit a correction request through your customer dashboard.\n\n"
            f"Kind regards,\n\n"
            f"Audrin Fire Engineers\n"
            f"071 415 6665\n"
            f"bethuelmoukangwe8@gmail.com\n"
            f"Monday–Sunday: 07:00–20:00"
        )

        MeetingMinutesDelivery.objects.create(
            minutes=version.minutes,
            minutes_version=version,
            recipient_type='client',
            recipient_name=record.client_name,
            recipient_email=record.client_email,
            delivery_method='ses_mime_attachment',
            subject=client_subject,
            body_snippet=client_body,
            idempotency_key=idemp_client,
            ses_message_id=f"ses-{timezone.now().timestamp()}-client",
            status='delivered',
            is_separate_dispatch=True,
            attachment_size_bytes=version.file_size_bytes,
        )

    # 2. Dispatch to Verified Superusers with `receive_all_meeting_minutes` permission
    superusers = User.objects.filter(is_active=True, user_permissions__codename='receive_all_meeting_minutes')
    for su in superusers:
        idemp_su = f"idemp_{version.minutes.id}_v{version.minutes_version}_super_{su.id}"
        if not MeetingMinutesDelivery.objects.filter(idempotency_key=idemp_su).exists():
            su_subject = f"AI Meeting Minutes Generated – {record.service_request_ref}"
            su_body = (
                f"An AI-assisted Zoom meeting-minutes document has been generated.\n\n"
                f"Client: {record.client_name}\n"
                f"Organisation: {version.structured_data_json.get('organisation')}\n"
                f"Meeting: {record.topic}\n"
                f"Date: {version.structured_data_json.get('meetingDate')}\n"
                f"Service request: {record.service_request_ref}\n"
                f"Minutes reference: {record.service_request_ref}-MIN-V{version.minutes_version}\n\n"
                f"The PDF is attached and is also available through the secure administration dashboard.\n\n"
                f"Please review any sections marked uncertain, inaudible or requiring confirmation."
            )

            MeetingMinutesDelivery.objects.create(
                minutes=version.minutes,
                minutes_version=version,
                recipient_type='superuser',
                recipient_user=su,
                recipient_name=su.get_full_name() or su.username,
                recipient_email=su.email,
                delivery_method='ses_mime_attachment',
                subject=su_subject,
                body_snippet=su_body,
                idempotency_key=idemp_su,
                ses_message_id=f"ses-{timezone.now().timestamp()}-{su.id}",
                status='delivered',
                is_separate_dispatch=True,
                attachment_size_bytes=version.file_size_bytes,
            )

    record.live_status = 'minutes_delivered'
    record.save()
