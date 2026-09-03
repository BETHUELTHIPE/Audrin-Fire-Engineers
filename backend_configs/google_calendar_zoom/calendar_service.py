"""
Audrin Fire Engineers - Google Calendar API Integration Service
Handles Google Calendar API v3 synchronization via Google Service Account.
OPERATIONAL TIMEZONE: Africa/Johannesburg (UTC+2)
"""

import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger('audrin.google_calendar')

SCOPES = ['https://www.googleapis.com/auth/calendar']
CALENDAR_ID = getattr(settings, 'GOOGLE_CALENDAR_PRIMARY_ID', 'c_audrin_fire_appointments_af_south_1@group.calendar.google.com')
SERVICE_ACCOUNT_FILE = getattr(settings, 'GOOGLE_SERVICE_ACCOUNT_KEY_PATH', '/secrets/google_calendar_service_account.json')


class GoogleCalendarService:
    """
    Google Calendar v3 Service wrapper
    """

    def __init__(self):
        self._service = None

    @property
    def service(self):
        if not self._service:
            credentials = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE, scopes=SCOPES
            )
            self._service = build('calendar', 'v3', credentials=credentials)
        return self._service

    def build_event_body(self, appointment) -> dict:
        """
        Builds compliant Google Calendar Event payload.
        STRICT EXCLUSIONS: No CAD, No videos, No unmasked passwords, No S3 URLs in description.
        """
        title = f"Audrin Fire Engineers – {appointment.get_appointment_type_display()} – {appointment.service_request_ref}"
        
        # Build safe description
        safe_description = (
            f"Online Engineering Review – SANS 10139 Consultation\n\n"
            f"Organisation: {appointment.organisation.name}\n"
            f"Site: {appointment.site.name}\n"
            f"Service Request: {appointment.service_request_ref}\n"
            f"Purpose: {appointment.purpose}\n\n"
            f"Preparation: {appointment.safe_preparation_instructions}\n\n"
            f"Access approved Zoom Personal Meeting Room securely via customer portal: "
            f"https://portal.audrinfire.co.za/customer/appointments/{appointment.id}\n\n"
            f"Audrin Fire Engineers | Contact: 071 415 6665 | bethuelmoukangwe8@gmail.com"
        )

        attendees_list = [
            {'email': att.email, 'displayName': att.name}
            for att in appointment.attendees.all()
        ]

        return {
            'summary': title,
            'description': safe_description,
            'start': {
                'dateTime': appointment.scheduled_start.isoformat(),
                'timeZone': 'Africa/Johannesburg'
            },
            'end': {
                'dateTime': appointment.scheduled_end.isoformat(),
                'timeZone': 'Africa/Johannesburg'
            },
            'attendees': attendees_list,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 24 hours prior
                    {'method': 'popup', 'minutes': 60},        # 1 hour prior
                    {'method': 'popup', 'minutes': 15}         # 15 minutes prior
                ]
            },
            'extendedProperties': {
                'private': {
                    'audrin_appointment_id': str(appointment.id),
                    'service_request_ref': appointment.service_request_ref
                }
            }
        }

    def create_event(self, appointment) -> dict:
        """
        Inserts new event into Google Calendar
        """
        body = self.build_event_body(appointment)
        try:
            event = self.service.events().insert(
                calendarId=CALENDAR_ID,
                body=body,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Created Google Calendar event {event.get('id')} for {appointment.service_request_ref}")
            return event
        except HttpError as err:
            logger.error(f"Google Calendar API Error creating event: {err.resp.status} - {err.content}")
            raise

    def update_event(self, appointment) -> dict:
        """
        Updates existing Google Calendar event
        """
        if not appointment.google_calendar_event_id:
            return self.create_event(appointment)

        body = self.build_event_body(appointment)
        try:
            event = self.service.events().update(
                calendarId=CALENDAR_ID,
                eventId=appointment.google_calendar_event_id,
                body=body,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Updated Google Calendar event {appointment.google_calendar_event_id}")
            return event
        except HttpError as err:
            logger.error(f"Google Calendar API Error updating event: {err.resp.status}")
            raise

    def delete_event(self, event_id: str):
        """
        Deletes event upon cancellation
        """
        try:
            self.service.events().delete(
                calendarId=CALENDAR_ID,
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            logger.info(f"Deleted Google Calendar event {event_id}")
        except HttpError as err:
            if err.resp.status == 404:
                logger.warning(f"Google Calendar event {event_id} already deleted")
            else:
                logger.error(f"Google Calendar API Error deleting event: {err.resp.status}")
                raise


google_calendar_service = GoogleCalendarService()
