"""
Audrin Fire Engineers - REST API Views & Google Calendar Webhook Handler
Provides authenticated endpoints for appointments, secret reveal, and push webhook receiver.
"""

import json
import logging
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import (
    Appointment,
    AppointmentStatus,
    MeetingOutcome,
    ZoomMeetingAccessLog,
    CalendarSyncJob
)
from .zoom_secret_service import zoom_secret_service
from .celery_tasks import sync_appointment_to_google_calendar_task

logger = logging.getLogger('audrin.calendar_views')


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Appointments with Google Calendar triggers and AWS Secrets Manager integration.
    """
    queryset = Appointment.objects.all().select_related('organisation', 'site', 'client_user', 'assigned_staff')
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        appointment = serializer.save(created_by=self.request.user)
        # Dispatch non-blocking Celery sync task
        sync_appointment_to_google_calendar_task.delay(str(appointment.id))

    @action(detail=True, methods=['post'], url_path='reveal-zoom-secrets')
    def reveal_zoom_secrets(self, request, pk=None):
        """
        Securely returns decrypted Zoom Personal Meeting Room information for authenticated session.
        ZERO PERSISTENCE: Data is logged without credential leakage.
        """
        appointment = self.get_object()
        user = request.user

        # Security check: User must be client, assigned engineer, or admin
        is_client = appointment.client_user_id == user.id
        is_staff = appointment.assigned_staff_id == user.id
        is_admin = user.is_staff or user.is_superuser

        if not (is_client or is_staff or is_admin):
            return Response(
                {"error": "Unauthorized to access Zoom room credentials for this appointment"},
                status=status.HTTP_403_FORBIDDEN
            )

        field = request.data.get('field', 'all')
        creds = zoom_secret_service.get_zoom_credentials()

        # Audit log creation (ZERO PASSCODE IN LOGS)
        ZoomMeetingAccessLog.objects.create(
            appointment=appointment,
            appointment_ref=appointment.service_request_ref,
            user=user,
            user_name=user.get_full_name() or user.username,
            user_role='client' if is_client else 'staff' if is_staff else 'admin',
            action='reveal_pmi' if field == 'pmi' else 'reveal_passcode' if field == 'passcode' else 'join_meeting',
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            user_agent=request.META.get('HTTP_USER_AGENT', 'Unknown'),
            success=True,
            notes="Decrypted from AWS Secrets Manager"
        )

        response_payload = {}
        if field in ('pmi', 'all'):
            response_payload['pmi'] = creds.get('ZOOM_PERSONAL_MEETING_ID')
        if field in ('passcode', 'all'):
            response_payload['passcode'] = creds.get('ZOOM_PERSONAL_MEETING_PASSCODE')
        if field in ('join_url', 'all'):
            response_payload['join_url'] = creds.get('ZOOM_PERSONAL_JOIN_URL')

        return Response(response_payload)


class GoogleCalendarWebhookView(APIView):
    """
    Webhook endpoint receiving Google Calendar Push Notifications for resource changes.
    Path: /api/webhooks/google-calendar/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        channel_id = request.headers.get('X-Goog-Channel-ID')
        resource_state = request.headers.get('X-Goog-Resource-State')
        resource_id = request.headers.get('X-Goog-Resource-ID')

        logger.info(f"Received Google Calendar webhook notification. State: {resource_state}, Channel: {channel_id}")

        if resource_state == 'sync':
            # Verification ping from Google on channel registration
            return Response(status=status.HTTP_200_OK)

        if resource_state == 'exists':
            # Trigger background reconciliation
            logger.info(f"Triggering sync reconciliation for resource {resource_id}")

        return Response(status=status.HTTP_200_OK)
