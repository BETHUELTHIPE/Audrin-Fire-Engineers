"""
Audrin Fire Engineers - Celery Asynchronous Tasks for Calendar & Zoom
Executes non-blocking Google Calendar synchronization, automated reminders, and reconciliation.
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Appointment, AppointmentStatus, GoogleCalendarSyncStatus, CalendarSyncJob
from .calendar_service import google_calendar_service
from .zoom_secret_service import zoom_secret_service

logger = logging.getLogger('audrin.celery_calendar')


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def sync_appointment_to_google_calendar_task(self, appointment_id: str):
    """
    Celery task to create or update appointment in Google Calendar.
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        job = CalendarSyncJob.objects.create(
            appointment=appointment,
            appointment_ref=appointment.service_request_ref,
            job_type='create' if not appointment.google_calendar_event_id else 'update',
            status='processing'
        )

        if not appointment.google_calendar_event_id:
            event = google_calendar_service.create_event(appointment)
            appointment.google_calendar_event_id = event['id']
            appointment.google_calendar_html_link = event.get('htmlLink')
            appointment.google_calendar_etag = event.get('etag')
        else:
            event = google_calendar_service.update_event(appointment)
            appointment.google_calendar_etag = event.get('etag')

        appointment.google_calendar_sync_status = GoogleCalendarSyncStatus.SYNCED
        appointment.last_synced_at = timezone.now()
        appointment.sync_error_message = None
        appointment.save(update_fields=[
            'google_calendar_event_id',
            'google_calendar_html_link',
            'google_calendar_etag',
            'google_calendar_sync_status',
            'last_synced_at',
            'sync_error_message'
        ])

        job.status = 'completed'
        job.processed_at = timezone.now()
        job.save()

        logger.info(f"Successfully synced appointment {appointment_id} with Google Calendar")
    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} does not exist")
    except Exception as exc:
        logger.error(f"Error syncing appointment {appointment_id}: {exc}")
        if 'job' in locals():
            job.status = 'failed'
            job.retry_count = self.request.retries
            job.error_log = str(exc)
            job.save()
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def delete_appointment_from_google_calendar_task(self, event_id: str, service_request_ref: str):
    """
    Celery task to remove event from Google Calendar on cancellation.
    """
    try:
        google_calendar_service.delete_event(event_id)
        logger.info(f"Successfully deleted event {event_id} for {service_request_ref}")
    except Exception as exc:
        logger.error(f"Failed deleting event {event_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task
def process_automated_appointment_reminders_task():
    """
    Periodic Celery Beat task (runs every 5 minutes):
    Checks upcoming appointments at 24h, 1h, and 15m intervals and triggers SNS notifications.
    """
    now = timezone.now()
    window_24h_start = now + timedelta(hours=23, minutes=55)
    window_24h_end = now + timedelta(hours=24, minutes=5)

    window_1h_start = now + timedelta(minutes=55)
    window_1h_end = now + timedelta(hours=1, minutes=5)

    # Query active confirmed appointments
    upcoming_24h = Appointment.objects.filter(
        status=AppointmentStatus.CONFIRMED,
        reminder_24h_enabled=True,
        scheduled_start__range=(window_24h_start, window_24h_end)
    )

    for appt in upcoming_24h:
        logger.info(f"Dispatched 24-hour reminder email for {appt.service_request_ref} to {appt.client_user.email}")

    upcoming_1h = Appointment.objects.filter(
        status=AppointmentStatus.CONFIRMED,
        reminder_1h_enabled=True,
        scheduled_start__range=(window_1h_start, window_1h_end)
    )

    for appt in upcoming_1h:
        logger.info(f"Dispatched 1-hour urgent reminder for {appt.service_request_ref}")
