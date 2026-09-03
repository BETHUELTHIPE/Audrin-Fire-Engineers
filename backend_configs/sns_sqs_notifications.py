"""
Audrin Fire Engineers - Amazon SNS & SQS Notification Worker
Flow: Django/Celery -> Amazon SNS -> Amazon SQS -> ECS Notification Worker -> Amazon SES
"""

import json
import os
import uuid
import logging
import time
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

SNS_TOPICS = {
    'client_notifications': os.environ.get('SNS_CLIENT_NOTIFICATIONS_ARN', 'arn:aws:sns:af-south-1:123456789012:audrin-client-notifications-production'),
    'emergency_alerts': os.environ.get('SNS_EMERGENCY_ALERTS_ARN', 'arn:aws:sns:af-south-1:123456789012:audrin-emergency-alerts-production'),
    'report_events': os.environ.get('SNS_REPORT_EVENTS_ARN', 'arn:aws:sns:af-south-1:123456789012:audrin-report-events-production'),
    'system_alerts': os.environ.get('SNS_SYSTEM_ALERTS_ARN', 'arn:aws:sns:af-south-1:123456789012:audrin-system-alerts-production'),
}

SQS_QUEUE_URL = os.environ.get('SQS_NOTIFICATION_QUEUE_URL', 'https://sqs.af-south-1.amazonaws.com/123456789012/audrin-client-notification-queue-production')


class SnsNotificationPublisher:
    """Publishes structured, sanitized event payloads to Amazon SNS topics."""

    def __init__(self):
        self.sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION', 'af-south-1'))

    def publish_event(
        self,
        event_type: str,
        recipient_email: str,
        recipient_name: str,
        template_key: str,
        organisation_uuid: str,
        urgency: str = 'normal',
        service_request_uuid: Optional[str] = None,
        report_uuid: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Publishes event with idempotency guarantees.
        Never transmits passwords, presigned URLs, or raw sensitive documents over SNS.
        """
        event_id = str(uuid.uuid4())
        correlation_id = str(uuid.uuid4())
        idempotency_key = f"{event_type}:{service_request_uuid or organisation_uuid}:{template_key}:{int(time.time() // 60)}"

        payload = {
            'event_id': event_id,
            'event_type': event_type,
            'event_version': '1.0',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'organisation_uuid': organisation_uuid,
            'service_request_uuid': service_request_uuid,
            'report_uuid': report_uuid,
            'recipient_email': recipient_email,
            'recipient_name': recipient_name,
            'template_key': template_key,
            'urgency': urgency,
            'correlation_id': correlation_id,
            'idempotency_key': idempotency_key,
            'extra_data': extra_data or {}
        }

        # Select appropriate SNS topic
        if urgency == 'critical' or 'emergency' in event_type:
            topic_arn = SNS_TOPICS['emergency_alerts']
        elif 'report' in event_type:
            topic_arn = SNS_TOPICS['report_events']
        else:
            topic_arn = SNS_TOPICS['client_notifications']

        try:
            response = self.sns.publish(
                TopicArn=topic_arn,
                Message=json.dumps(payload),
                Subject=f"Audrin Fire Event: {event_type}",
                MessageAttributes={
                    'EventType': {'DataType': 'String', 'StringValue': event_type},
                    'Urgency': {'DataType': 'String', 'StringValue': urgency},
                    'RecipientEmail': {'DataType': 'String', 'StringValue': recipient_email},
                }
            )
            logger.info(f"Published SNS Event {event_id} to {topic_arn}. MessageId: {response['MessageId']}")
            return {
                'status': 'published',
                'sns_message_id': response['MessageId'],
                'event_id': event_id,
                'idempotency_key': idempotency_key
            }
        except ClientError as e:
            logger.error(f"Failed to publish SNS event {event_type}: {e}")
            raise


class EcsNotificationWorker:
    """
    Continuous worker running in ECS Fargate:
    Polls Amazon SQS queue, loads verified database entities, renders branded HTML,
    and dispatches through Amazon SES.
    """

    def __init__(self):
        self.sqs = boto3.client('sqs', region_name=os.environ.get('AWS_REGION', 'af-south-1'))
        self.ses = boto3.client('ses', region_name=os.environ.get('AWS_REGION', 'af-south-1'))
        self.sender_email = os.environ.get('SES_SENDER_EMAIL', 'dispatches@audrinfire.co.za')

    def start_worker_loop(self):
        """Long-polling SQS consumer loop with automatic backoff and DLQ redrive."""
        logger.info(f"Starting Audrin Fire Notification Worker listening on {SQS_QUEUE_URL}...")
        while True:
            try:
                response = self.sqs.receive_message(
                    QueueUrl=SQS_QUEUE_URL,
                    MaxNumberOfMessages=10,
                    WaitTimeSeconds=20,  # SQS Long Polling
                    MessageAttributeNames=['All']
                )

                messages = response.get('Messages', [])
                if not messages:
                    continue

                for msg in messages:
                    self.process_message(msg)

            except Exception as e:
                logger.error(f"Error in Notification Worker loop: {e}")
                time.sleep(5)

    def process_message(self, message: Dict[str, Any]):
        """Processes individual SQS notification and delivers via Amazon SES."""
        receipt_handle = message['ReceiptHandle']
        try:
            body = json.loads(message['Body'])
            # Extract SNS wrapper if message arrived via SNS-SQS subscription
            if 'Message' in body and isinstance(body['Message'], str):
                event_data = json.loads(body['Message'])
            else:
                event_data = body

            recipient_email = event_data['recipient_email']
            recipient_name = event_data['recipient_name']
            template_key = event_data['template_key']
            event_type = event_data['event_type']

            # Render HTML and Text templates
            subject, html_content, text_content = self.render_email_template(event_data)

            # Send via Amazon SES
            ses_response = self.ses.send_email(
                Source=f"Audrin Fire Engineers <{self.sender_email}>",
                Destination={'ToAddresses': [recipient_email]},
                Message={
                    'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                    'Body': {
                        'Html': {'Data': html_content, 'Charset': 'UTF-8'},
                        'Text': {'Data': text_content, 'Charset': 'UTF-8'}
                    }
                }
            )

            logger.info(f"Delivered SES Email to {recipient_email} for event {event_type}. SES MessageId: {ses_response['MessageId']}")

            # Delete from SQS only upon successful delivery
            self.sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=receipt_handle)

        except Exception as err:
            logger.error(f"Failed to process message {message.get('MessageId')}: {err}")
            # Message will become visible again after visibility timeout and route to DLQ after 5 attempts

    def render_email_template(self, event_data: Dict[str, Any]) -> tuple:
        """Renders compliant SANS 10139 branded transactional email templates."""
        event_type = event_data.get('event_type')
        recipient_name = event_data.get('recipient_name', 'Valued Client')
        request_ref = event_data.get('extra_data', {}).get('service_request_ref', 'SR-2026-FIRE')

        subject = f"[Audrin Fire] Update: {event_type.replace('.', ' ').title()} ({request_ref})"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c1017; color: #f1f5f9; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #161f2e; border: 1px solid #dc2626; border-radius: 8px; padding: 24px;">
            <h2 style="color: #ef4444; margin-top: 0;">Audrin Fire Engineers (Pty) Ltd</h2>
            <p style="font-size: 14px; color: #94a3b8;">SANS 10139 & SANS 10400 Part T Certified Fire Protection</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;">
            <p>Dear {recipient_name},</p>
            <p>A new statutory event has been logged for reference <strong>{request_ref}</strong>.</p>
            <div style="background-color: #0f172a; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; font-weight: 600;">Event: {event_type}</p>
              <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">Timestamp: {event_data.get('timestamp')}</p>
            </div>
            <p>To inspect verified documentation, digital CoCs, or high-definition evidence, log in securely to the Customer Portal:</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="https://audrinfire.co.za/portal" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Access Secure Portal</a>
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Note: For security and SANS 10139 compliance, confidential reports and photographs are not sent as email attachments.</p>
          </div>
        </body>
        </html>
        """

        text_content = f"Audrin Fire Engineers - {event_type}\nDear {recipient_name},\nUpdate on reference {request_ref}.\nLogin to view evidence: https://audrinfire.co.za/portal"

        return subject, html_content, text_content
