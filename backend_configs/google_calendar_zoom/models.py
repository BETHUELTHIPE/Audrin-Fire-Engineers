"""
Audrin Fire Engineers - Google Calendar & Zoom PMI Data Models
Implements PostgreSQL source of truth for SANS 10139 online consultations,
Celery background synchronization, and AWS Secrets Manager integration.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone


class AppointmentType(models.TextChoices):
    INITIAL_CONSULTATION = 'initial_consultation', _('Initial Consultation')
    SITE_SURVEY_PLANNING = 'site_survey_planning', _('Site-Survey Planning')
    REMOTE_SYSTEM_REVIEW = 'remote_system_review', _('Remote System Review')
    FAULT_CONSULTATION = 'fault_consultation', _('Fire-Alarm Fault Consultation')
    DESIGN_REVIEW = 'design_review', _('Design Review')
    QUOTATION_DISCUSSION = 'quotation_discussion', _('Quotation Discussion')
    WORK_PROGRESS = 'work_progress', _('Work-Progress Meeting')
    TESTING_COMMISSIONING_REVIEW = 'testing_commissioning_review', _('Testing & Commissioning Review')
    PRE_WORK_REPORT_REVIEW = 'pre_work_report_review', _('Pre-Work Condition Report Review')
    POST_WORK_REPORT_PRESENTATION = 'post_work_report_presentation', _('Post-Work Report Presentation')
    HANDOVER_MEETING = 'handover_meeting', _('Handover Meeting')
    MAINTENANCE_PLANNING = 'maintenance_planning', _('Maintenance-Planning Meeting')
    OTHER_FIRE_DETECTION = 'other_fire_detection', _('Other Fire-Detection Meeting')


class AppointmentStatus(models.TextChoices):
    REQUESTED = 'requested', _('Requested')
    APPROVED = 'approved', _('Approved')
    CONFIRMED = 'confirmed', _('Confirmed')
    IN_PROGRESS = 'in_progress', _('In Progress')
    COMPLETED = 'completed', _('Completed')
    RESCHEDULED = 'rescheduled', _('Rescheduled')
    CANCELLED = 'cancelled', _('Cancelled')
    NO_SHOW = 'no_show', _('No Show')


class GoogleCalendarSyncStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    SYNCED = 'synced', _('Synced')
    SYNC_FAILED = 'sync_failed', _('Sync Failed')
    CONFLICT_DETECTED = 'conflict_detected', _('Conflict Detected')
    DELETED_REMOTELY = 'deleted_remotely', _('Deleted Remotely')
    CHANNEL_RENEWED = 'channel_renewed', _('Channel Renewed')


class ZoomMeetingStatus(models.TextChoices):
    READY = 'ready', _('Ready')
    ACTIVE = 'active', _('Active')
    LOCKED = 'locked', _('Locked')
    COMPLETED = 'completed', _('Completed')
    WAITING_ROOM_ACTIVE = 'waiting_room_active', _('Waiting Room Active')


class Appointment(models.Model):
    """
    Primary appointment record linked to SANS 10139 fire detection service requests.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, help_text="Format: Audrin Fire Engineers – [TYPE] – [REF]")
    appointment_type = models.CharField(max_length=50, choices=AppointmentType.choices)
    status = models.CharField(max_length=30, choices=AppointmentStatus.choices, default=AppointmentStatus.REQUESTED)
    
    # Context Relations
    service_request = models.ForeignKey(
        'service_requests.ServiceRequest',
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    service_request_ref = models.CharField(max_length=64, db_index=True)
    organisation = models.ForeignKey(
        'accounts.Organisation',
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    site = models.ForeignKey(
        'sites.Site',
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    # Schedule Times (Operational timezone: Africa/Johannesburg)
    scheduled_start = models.DateTimeField(db_index=True)
    scheduled_end = models.DateTimeField()
    timezone = models.CharField(max_length=64, default='Africa/Johannesburg')

    # Users
    client_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='client_appointments'
    )
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='staff_appointments'
    )

    purpose = models.TextField(help_text="Clear technical scope for SANS 10139 consultation")
    safe_preparation_instructions = models.TextField(blank=True, default="")

    # Google Calendar Sync Metadata
    google_calendar_event_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    google_calendar_sync_status = models.CharField(
        max_length=30,
        choices=GoogleCalendarSyncStatus.choices,
        default=GoogleCalendarSyncStatus.PENDING
    )
    google_calendar_html_link = models.URLField(max_length=500, blank=True, null=True)
    google_calendar_etag = models.CharField(max_length=255, blank=True, null=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    sync_error_message = models.TextField(blank=True, null=True)

    # Zoom Personal Meeting Room Status
    zoom_meeting_status = models.CharField(
        max_length=30,
        choices=ZoomMeetingStatus.choices,
        default=ZoomMeetingStatus.READY
    )

    # PowerPoint Report Presentation (Private S3)
    has_powerpoint = models.BooleanField(default=False)
    powerpoint_s3_key = models.CharField(max_length=512, blank=True, null=True)
    powerpoint_filename = models.CharField(max_length=255, blank=True, null=True)
    powerpoint_version = models.CharField(max_length=64, blank=True, null=True)

    # Reminder Configuration
    reminder_24h_enabled = models.BooleanField(default=True)
    reminder_1h_enabled = models.BooleanField(default=True)
    reminder_15m_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_appointments'
    )

    class Meta:
        db_table = 'audrin_appointments'
        ordering = ['-scheduled_start']
        indexes = [
            models.Index(fields=['scheduled_start', 'status']),
            models.Index(fields=['service_request_ref']),
        ]

    def __str__(self):
        return self.title


class AppointmentAttendee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(
        max_length=20,
        choices=[('client', 'Client'), ('staff', 'Staff'), ('admin', 'Admin'), ('observer', 'Observer')],
        default='client'
    )
    rsvp_status = models.CharField(
        max_length=20,
        choices=[('needsAction', 'Needs Action'), ('accepted', 'Accepted'), ('tentative', 'Tentative'), ('declined', 'Declined')],
        default='needsAction'
    )
    is_required = models.BooleanField(default=True)
    is_host = models.BooleanField(default=False)
    attended = models.BooleanField(default=False)
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'audrin_appointment_attendees'
        unique_together = ('appointment', 'email')


class MeetingOutcome(models.Model):
    """
    Records formal technical meeting outcomes, client requests, and next steps.
    Statutory Safeguard: Attendance does NOT equal statutory COC sign-off.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='outcome')
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    recorded_at = models.DateTimeField(auto_now_add=True)
    actual_start_time = models.DateTimeField()
    actual_end_time = models.DateTimeField()
    
    discussion_summary = models.TextField()
    client_requirements = models.JSONField(default=list, help_text="List of requirements requested by client")
    documents_requested = models.JSONField(default=list, help_text="List of technical documents requested")
    decisions_made = models.JSONField(default=list, help_text="List of engineering/commercial decisions")

    next_workflow_step = models.CharField(max_length=255)
    assigned_action = models.CharField(max_length=255)
    responsible_person = models.CharField(max_length=255)
    due_date = models.DateField()

    follow_up_appointment_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    presentation_version_used = models.CharField(max_length=128, blank=True, null=True)

    statutory_compliance_disclaimer = models.TextField(
        default=(
            "Attendance and discussions recorded during this meeting do not constitute statutory acceptance, "
            "SANS 10139 Certificate of Compliance (COC), or regulatory sign-off until formal on-site physical "
            "inspection, calibrated sound pressure testing, and signed certification are completed."
        )
    )

    class Meta:
        db_table = 'audrin_meeting_outcomes'


class ZoomMeetingAccessLog(models.Model):
    """
    Security audit log for Zoom credential reveals, joins, and copies.
    STRICT POLICY: Zero raw passcode or meeting token leakage in log records.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='access_logs')
    appointment_ref = models.CharField(max_length=64)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    user_name = models.CharField(max_length=255)
    user_role = models.CharField(max_length=30)
    action = models.CharField(
        max_length=50,
        choices=[
            ('reveal_pmi', 'Reveal PMI'),
            ('reveal_passcode', 'Reveal Passcode'),
            ('copy_pmi', 'Copy PMI'),
            ('copy_passcode', 'Copy Passcode'),
            ('copy_join_url', 'Copy Join URL'),
            ('copy_invitation', 'Copy Complete Invitation'),
            ('join_meeting', 'Join Meeting'),
            ('start_meeting', 'Start Meeting (Host)'),
            ('open_presentation', 'Open S3 Presentation'),
            ('record_outcome', 'Record Outcome')
        ]
    )
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    success = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = 'audrin_zoom_meeting_access_logs'
        ordering = ['-timestamp']


class CalendarSyncJob(models.Model):
    """
    Celery background worker queue job for resilient Google Calendar API interactions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='sync_jobs')
    appointment_ref = models.CharField(max_length=64)
    job_type = models.CharField(
        max_length=30,
        choices=[
            ('create', 'Create Event'),
            ('update', 'Update Event'),
            ('cancel', 'Cancel Event'),
            ('rsvp_sync', 'RSVP Sync'),
            ('reconcile', 'Full Reconcile')
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[('queued', 'Queued'), ('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')],
        default='queued'
    )
    retry_count = models.PositiveIntegerField(default=0)
    error_log = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'audrin_calendar_sync_jobs'
        ordering = ['-created_at']
