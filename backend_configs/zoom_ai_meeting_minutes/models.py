"""
Audrin Fire Engineers (Pty) Ltd - Zoom AI Meeting Minutes Django Models
Registration No: K2026089596
SANS 10139 Aligned Architecture
"""

import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class MeetingConsent(models.Model):
    """
    Participant consent for meeting recording and AI transcription.
    Mandatory prior to automated recording and transcription.
    """
    STATUS_CHOICES = [
        ('consented', 'Consented'),
        ('declined', 'Declined'),
        ('withdrawn', 'Withdrawn'),
        ('pending', 'Pending Notice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment_id = models.CharField(max_length=64, db_index=True)
    appointment_ref = models.CharField(max_length=64)
    service_request_id = models.CharField(max_length=64, db_index=True)
    service_request_ref = models.CharField(max_length=64)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    consent_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    consent_text_version = models.CharField(max_length=64, default='v1.2-2026.09-SANS10139')
    consent_text = models.TextField()
    consented_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    is_withdrawn = models.BooleanField(default=False)
    withdrawn_at = models.DateTimeField(null=True, blank=True)
    withdrawal_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-consented_at']
        verbose_name = 'Meeting Consent Record'
        verbose_name_plural = 'Meeting Consent Records'

    def __str__(self):
        return f"Consent {self.consent_status} - {self.appointment_ref} ({self.user_email})"


class ZoomMeetingRecord(models.Model):
    """
    Authorised Zoom meeting session linked to appointment and service request.
    """
    LIVE_STATUS_CHOICES = [
        ('scheduled', 'Meeting Scheduled'),
        ('waiting_for_host', 'Waiting for Host'),
        ('in_progress', 'Meeting Started'),
        ('consent_confirmed', 'Consent Confirmed'),
        ('recording_active', 'Recording Active'),
        ('transcription_active', 'Transcription Active'),
        ('meeting_ended', 'Meeting Ended'),
        ('transcript_processing', 'Transcript Processing'),
        ('ai_generating', 'AI Minutes Generating'),
        ('pdf_generating', 'PDF Generating'),
        ('email_queued', 'Email Queued'),
        ('minutes_delivered', 'Minutes Delivered'),
        ('processing_failed', 'Processing Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment_id = models.CharField(max_length=64, unique=True, db_index=True)
    appointment_ref = models.CharField(max_length=64)
    service_request_id = models.CharField(max_length=64, db_index=True)
    service_request_ref = models.CharField(max_length=64)
    zoom_meeting_id = models.CharField(max_length=64)
    zoom_pmi_used = models.BooleanField(default=True)
    host_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='hosted_zoom_meetings')
    host_email = models.EmailField(default='bethuelmoukangwe8@gmail.com')
    topic = models.CharField(max_length=255)
    site_name = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    live_status = models.CharField(max_length=32, choices=LIVE_STATUS_CHOICES, default='scheduled')
    consent_record = models.ForeignKey(MeetingConsent, on_delete=models.SET_NULL, null=True, blank=True)
    cloud_recording_enabled = models.BooleanField(default=True)
    audio_transcription_enabled = models.BooleanField(default=True)
    transcript_available = models.BooleanField(default=False)
    current_minutes_version = models.PositiveIntegerField(default=0)
    recording_deleted_at = models.DateTimeField(null=True, blank=True, help_text="Audio purge timestamp for privacy compliance")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Zoom Meeting Record'
        verbose_name_plural = 'Zoom Meeting Records'

    def __str__(self):
        return f"{self.service_request_ref} - {self.topic} ({self.live_status})"


class MeetingTranscript(models.Model):
    """
    Original VTT transcript downloaded via authorized credentials, encrypted in S3.
    """
    SOURCE_CHOICES = [
        ('zoom_cloud_vtt', 'Zoom Cloud VTT Transcript'),
        ('amazon_transcribe_fallback', 'Amazon Transcribe Fallback'),
        ('manual_upload', 'Manual Authorised Upload'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(ZoomMeetingRecord, on_delete=models.CASCADE, related_name='transcripts')
    version = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default='zoom_cloud_vtt')
    s3_raw_transcript_key = models.CharField(max_length=512)
    s3_encrypted_bucket = models.CharField(max_length=128, default='audrin-fire-private-docs')
    file_hash = models.CharField(max_length=64, help_text="SHA-256 hash of raw transcript file")
    total_duration_seconds = models.PositiveIntegerField(default=0)
    word_count = models.PositiveIntegerField(default=0)
    retained_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['meeting', 'version']
        ordering = ['-version']

    def __str__(self):
        return f"Transcript v{self.version} for {self.meeting.service_request_ref}"


class TranscriptSpeaker(models.Model):
    """
    Speaker labels identified from Zoom VTT or realigned by superuser.
    """
    ROLE_CHOICES = [
        ('host', 'Host (Audrin Fire Engineers)'),
        ('client', 'Client / Property Manager'),
        ('engineer', 'Fire Systems Engineer'),
        ('guest', 'Guest Participant'),
        ('unknown', 'Unknown / Unidentified'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transcript = models.ForeignKey(MeetingTranscript, on_delete=models.CASCADE, related_name='speakers')
    speaker_label = models.CharField(max_length=128, help_text="Original VTT label e.g. Unknown Speaker 1")
    identified_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='unknown')
    confidence = models.FloatField(default=1.0)
    is_manually_corrected = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.speaker_label} -> {self.identified_name or 'Unassigned'}"


class AIMinutesGenerationJob(models.Model):
    """
    Celery task tracking record for Bedrock LLM invocation.
    """
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing in Bedrock'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(ZoomMeetingRecord, on_delete=models.CASCADE)
    transcript = models.ForeignKey(MeetingTranscript, on_delete=models.CASCADE)
    ai_model_identifier = models.CharField(max_length=128, default='anthropic.claude-3-5-sonnet-20241022-v2:0')
    prompt_template_version = models.CharField(max_length=64, default='sans10139-prompt-v2.4')
    idempotency_key = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    duration_seconds = models.FloatField(default=0.0)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"AI Job {self.id} ({self.status}) - {self.meeting.service_request_ref}"


class MeetingMinutes(models.Model):
    """
    Parent container for all versions of meeting minutes for an appointment.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.OneToOneField(ZoomMeetingRecord, on_delete=models.CASCADE, related_name='minutes_root')
    service_request_ref = models.CharField(max_length=64, db_index=True)
    client_name = models.CharField(max_length=255)
    site_name = models.CharField(max_length=255)
    latest_version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Minutes Root {self.service_request_ref} (Latest v{self.latest_version})"


class MeetingMinutesVersion(models.Model):
    """
    Immutable version of AI-generated minutes. Never overwritten silently.
    """
    APPROVAL_CHOICES = [
        ('auto_generated', 'Auto-Generated by AI'),
        ('admin_approved', 'Superuser Approved'),
        ('client_acknowledged', 'Client Acknowledged'),
        ('correction_requested', 'Correction Requested'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    minutes = models.ForeignKey(MeetingMinutes, on_delete=models.CASCADE, related_name='versions')
    transcript_version = models.PositiveIntegerField(default=1)
    ai_model_identifier = models.CharField(max_length=128)
    prompt_template_version = models.CharField(max_length=64)
    minutes_version = models.PositiveIntegerField()
    pdf_version = models.PositiveIntegerField()
    s3_pdf_key = models.CharField(max_length=512)
    s3_pdf_version_id = models.CharField(max_length=128)
    file_hash = models.CharField(max_length=64, help_text="SHA-256 hash of PDF")
    file_size_bytes = models.PositiveIntegerField(default=0)
    is_superseded = models.BooleanField(default=False)
    superseded_by_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='superseded_versions')
    correction_reason = models.TextField(blank=True)
    structured_data_json = models.JSONField(help_text="16-section structured JSON output")
    approval_status = models.CharField(max_length=32, choices=APPROVAL_CHOICES, default='auto_generated')
    created_by = models.CharField(max_length=128, default='bedrock-celery-worker')
    generated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ['minutes', 'minutes_version']
        ordering = ['-minutes_version']

    def __str__(self):
        return f"{self.minutes.service_request_ref} Minutes v{self.minutes_version}.0 ({self.approval_status})"


class MeetingAgendaItem(models.Model):
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE, related_name='agenda_items')
    item_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        ordering = ['item_number']


class MeetingDecision(models.Model):
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE, related_name='decisions')
    decision_number = models.PositiveIntegerField()
    description = models.TextField()
    context = models.TextField(blank=True)
    transcript_evidence = models.TextField(help_text="Direct quote from transcript")

    class Meta:
        ordering = ['decision_number']


class MeetingActionItem(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Pending Review', 'Pending Review'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE, related_name='action_items')
    action_number = models.PositiveIntegerField()
    action = models.TextField()
    responsible_party = models.CharField(max_length=255, default='Owner to be confirmed.')
    due_date = models.CharField(max_length=64, default='Due date to be confirmed.')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    transcript_evidence = models.TextField(help_text="Direct transcript evidence reference")

    class Meta:
        ordering = ['action_number']


class MeetingMinutesCorrection(models.Model):
    """
    Client correction request workflow.
    """
    STATUS_CHOICES = [
        ('submitted', 'Submitted by Client'),
        ('under_review', 'Under Superuser Review'),
        ('approved', 'Approved & Next Version Issued'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    minutes = models.ForeignKey(MeetingMinutes, on_delete=models.CASCADE)
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    submitted_by_name = models.CharField(max_length=255)
    submitted_by_email = models.EmailField()
    section_to_correct = models.CharField(max_length=128)
    current_text = models.TextField(blank=True)
    requested_correction = models.TextField()
    reason_or_evidence = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_corrections')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    resulting_new_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.SET_NULL, null=True, blank=True, related_name='source_corrections')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class MeetingMinutesAcknowledgement(models.Model):
    """
    Formal receipt acknowledgement by client or authorized user.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    minutes = models.ForeignKey(MeetingMinutes, on_delete=models.CASCADE)
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=255)
    user_role = models.CharField(max_length=32)
    acknowledged_at = models.DateTimeField(default=timezone.now)
    client_comments = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)

    class Meta:
        ordering = ['-acknowledged_at']


class MeetingMinutesDelivery(models.Model):
    """
    Separate Amazon SES MIME email delivery records.
    Never uses CC or BCC between client and superusers.
    """
    RECIPIENT_CHOICES = [
        ('client', 'Client'),
        ('superuser', 'Super Administrator (receive_all_meeting_minutes)'),
    ]
    METHOD_CHOICES = [
        ('ses_mime_attachment', 'SES MIME PDF Attachment'),
        ('ses_secure_portal_link', 'SES Secure Authenticated Link (Size Exceeded)'),
    ]
    STATUS_CHOICES = [
        ('queued', 'Queued in Celery'),
        ('sent', 'Sent via SES'),
        ('delivered', 'Delivered to Recipient'),
        ('bounced', 'Bounced'),
        ('failed', 'Delivery Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    minutes = models.ForeignKey(MeetingMinutes, on_delete=models.CASCADE)
    minutes_version = models.ForeignKey(MeetingMinutesVersion, on_delete=models.CASCADE)
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_CHOICES)
    recipient_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    recipient_name = models.CharField(max_length=255)
    recipient_email = models.EmailField()
    delivery_method = models.CharField(max_length=32, choices=METHOD_CHOICES, default='ses_mime_attachment')
    subject = models.CharField(max_length=255)
    body_snippet = models.TextField()
    idempotency_key = models.CharField(max_length=128, unique=True)
    ses_message_id = models.CharField(max_length=128, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    is_separate_dispatch = models.BooleanField(default=True, help_text="Always True - No CC/BCC used")
    dispatched_at = models.DateTimeField(default=timezone.now)
    delivery_confirmed_at = models.DateTimeField(null=True, blank=True)
    attachment_size_bytes = models.PositiveIntegerField(default=0)
    exceeded_size_limit = models.BooleanField(default=False)
    error_log = models.TextField(blank=True)

    class Meta:
        ordering = ['-dispatched_at']

    def __str__(self):
        return f"Delivery to {self.recipient_email} ({self.status})"
