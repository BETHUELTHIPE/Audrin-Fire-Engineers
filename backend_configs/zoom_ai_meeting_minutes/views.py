"""
Audrin Fire Engineers (Pty) Ltd - Zoom Webhook & AI Minutes API Views
Registration No: K2026089596
"""

import hmac
import hashlib
import json
import logging
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import (
    MeetingConsent,
    ZoomMeetingRecord,
    MeetingTranscript,
    MeetingMinutes,
    MeetingMinutesVersion,
    MeetingMinutesCorrection,
    MeetingMinutesAcknowledgement,
    MeetingMinutesDelivery,
)
from .celery_tasks import process_zoom_webhook_event_task, generate_ai_minutes_task

logger = logging.getLogger(__name__)


def verify_zoom_webhook_signature(request):
    """
    Verifies Zoom HMAC-SHA256 signature from AWS Secrets Manager webhook secret.
    Zero exposure of secret keys.
    """
    zoom_signature = request.headers.get('x-zm-signature')
    zoom_timestamp = request.headers.get('x-zm-request-timestamp')
    if not zoom_signature or not zoom_timestamp:
        return False

    webhook_secret = getattr(settings, 'ZOOM_WEBHOOK_SECRET_TOKEN', '')
    if not webhook_secret:
        logger.error("ZOOM_WEBHOOK_SECRET_TOKEN is not configured.")
        return False

    message = f"v0:{zoom_timestamp}:{request.body.decode('utf-8')}"
    computed_hash = hmac.new(
        webhook_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    expected_signature = f"v0={computed_hash}"

    return hmac.compare_digest(zoom_signature, expected_signature)


@csrf_exempt
def zoom_webhook_receiver(request):
    """
    Endpoint for Zoom cloud recording and transcript completion events:
    - endpoint.url_validation (CRC check)
    - recording.completed
    - transcript.completed
    """
    if request.method != 'POST':
        return HttpResponse(status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    event_type = payload.get('event')

    # Zoom CRC Validation
    if event_type == 'endpoint.url_validation':
        plain_token = payload.get('payload', {}).get('plainToken', '')
        webhook_secret = getattr(settings, 'ZOOM_WEBHOOK_SECRET_TOKEN', '')
        encrypted_token = hmac.new(
            webhook_secret.encode('utf-8'),
            plain_token.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return JsonResponse({
            'plainToken': plain_token,
            'encryptedToken': encrypted_token
        })

    # Verify signature for data events
    if not verify_zoom_webhook_signature(request):
        logger.warning("Invalid Zoom Webhook signature received.")
        return JsonResponse({'error': 'Signature verification failed'}, status=401)

    # Queue Celery task for async processing
    idempotency_key = f"zoom_evt_{payload.get('payload', {}).get('object', {}).get('uuid', '')}_{event_type}"
    process_zoom_webhook_event_task.delay(payload, idempotency_key)

    return JsonResponse({'status': 'queued', 'idempotency_key': idempotency_key}, status=200)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def record_meeting_consent(request):
    """
    Records explicit client consent or withdrawal for Zoom recording and AI transcription.
    """
    appointment_id = request.data.get('appointment_id')
    appointment_ref = request.data.get('appointment_ref')
    service_request_id = request.data.get('service_request_id')
    service_request_ref = request.data.get('service_request_ref')
    consent_status = request.data.get('consent_status', 'consented')
    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()

    if not appointment_id or not consent_status:
        return Response({'error': 'appointment_id and consent_status are required.'}, status=status.HTTP_400_BAD_REQUEST)

    consent_obj, created = MeetingConsent.objects.update_or_create(
        appointment_id=appointment_id,
        user=request.user,
        defaults={
            'appointment_ref': appointment_ref or appointment_id,
            'service_request_id': service_request_id or '',
            'service_request_ref': service_request_ref or '',
            'user_name': request.user.get_full_name() or request.user.username,
            'user_email': request.user.email,
            'consent_status': consent_status,
            'consent_text_version': 'v1.2-2026.09-SANS10139',
            'consent_text': 'This meeting may be recorded and transcribed to prepare AI-assisted meeting minutes, action items and service records. The generated minutes will be provided to the client and authorised Audrin Fire Engineers administrators.',
            'ip_address': ip_address,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'is_withdrawn': consent_status == 'withdrawn',
        }
    )

    # Update Zoom record if exists
    ZoomMeetingRecord.objects.filter(appointment_id=appointment_id).update(
        consent_record=consent_obj,
        live_status='consent_confirmed' if consent_status == 'consented' else 'scheduled'
    )

    return Response({
        'status': 'success',
        'consent_id': str(consent_obj.id),
        'consent_status': consent_obj.consent_status,
        'consented_at': consent_obj.consented_at,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_minutes_correction(request, minutes_id):
    """
    Submits a client correction request against an existing minutes version.
    """
    try:
        minutes = MeetingMinutes.objects.get(id=minutes_id)
    except MeetingMinutes.DoesNotExist:
        return Response({'error': 'Meeting minutes not found.'}, status=status.HTTP_404_NOT_FOUND)

    version_number = request.data.get('version_number', minutes.latest_version)
    current_version = minutes.versions.get(minutes_version=version_number)

    correction = MeetingMinutesCorrection.objects.create(
        minutes=minutes,
        minutes_version=current_version,
        version_number=version_number,
        submitted_by=request.user,
        submitted_by_name=request.user.get_full_name() or request.user.username,
        submitted_by_email=request.user.email,
        section_to_correct=request.data.get('section_to_correct', 'Discussion Summary'),
        current_text=request.data.get('current_text', ''),
        requested_correction=request.data.get('requested_correction', ''),
        reason_or_evidence=request.data.get('reason_or_evidence', ''),
        status='submitted',
    )

    current_version.approval_status = 'correction_requested'
    current_version.save(update_fields=['approval_status'])

    return Response({
        'status': 'success',
        'correction_id': str(correction.id),
        'message': 'Correction request submitted for engineering review.',
    })
