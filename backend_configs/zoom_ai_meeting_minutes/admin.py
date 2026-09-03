"""
Audrin Fire Engineers (Pty) Ltd - Zoom AI Meeting Minutes Django Admin Registrations
Registration No: K2026089596
"""

from django.contrib import admin
from .models import (
    MeetingConsent,
    ZoomMeetingRecord,
    MeetingTranscript,
    TranscriptSpeaker,
    AIMinutesGenerationJob,
    MeetingMinutes,
    MeetingMinutesVersion,
    MeetingAgendaItem,
    MeetingDecision,
    MeetingActionItem,
    MeetingMinutesCorrection,
    MeetingMinutesAcknowledgement,
    MeetingMinutesDelivery,
)


@admin.register(MeetingConsent)
class MeetingConsentAdmin(admin.ModelAdmin):
    list_display = ['appointment_ref', 'service_request_ref', 'user_email', 'consent_status', 'consent_text_version', 'consented_at', 'is_withdrawn']
    list_filter = ['consent_status', 'is_withdrawn', 'consent_text_version']
    search_fields = ['appointment_ref', 'service_request_ref', 'user_name', 'user_email', 'ip_address']
    readonly_fields = ['id', 'consented_at', 'ip_address', 'user_agent']


@admin.register(ZoomMeetingRecord)
class ZoomMeetingRecordAdmin(admin.ModelAdmin):
    list_display = ['service_request_ref', 'topic', 'client_name', 'site_name', 'live_status', 'current_minutes_version', 'updated_at']
    list_filter = ['live_status', 'cloud_recording_enabled', 'audio_transcription_enabled', 'transcript_available']
    search_fields = ['service_request_ref', 'appointment_ref', 'topic', 'client_name', 'client_email', 'site_name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(MeetingTranscript)
class MeetingTranscriptAdmin(admin.ModelAdmin):
    list_display = ['meeting', 'version', 'source', 'word_count', 'total_duration_seconds', 'created_at']
    list_filter = ['source']
    search_fields = ['meeting__service_request_ref', 's3_raw_transcript_key', 'file_hash']
    readonly_fields = ['id', 'file_hash', 'created_at']


@admin.register(TranscriptSpeaker)
class TranscriptSpeakerAdmin(admin.ModelAdmin):
    list_display = ['transcript', 'speaker_label', 'identified_name', 'role', 'confidence', 'is_manually_corrected']
    list_filter = ['role', 'is_manually_corrected']
    search_fields = ['speaker_label', 'identified_name']


@admin.register(AIMinutesGenerationJob)
class AIMinutesGenerationJobAdmin(admin.ModelAdmin):
    list_display = ['meeting', 'ai_model_identifier', 'status', 'duration_seconds', 'created_at', 'completed_at']
    list_filter = ['status', 'ai_model_identifier']
    search_fields = ['meeting__service_request_ref', 'idempotency_key']
    readonly_fields = ['id', 'created_at', 'completed_at']


class MeetingAgendaItemInline(admin.TabularInline):
    model = MeetingAgendaItem
    extra = 0


class MeetingDecisionInline(admin.TabularInline):
    model = MeetingDecision
    extra = 0


class MeetingActionItemInline(admin.TabularInline):
    model = MeetingActionItem
    extra = 0


@admin.register(MeetingMinutes)
class MeetingMinutesAdmin(admin.ModelAdmin):
    list_display = ['service_request_ref', 'client_name', 'site_name', 'latest_version', 'updated_at']
    search_fields = ['service_request_ref', 'client_name', 'site_name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(MeetingMinutesVersion)
class MeetingMinutesVersionAdmin(admin.ModelAdmin):
    list_display = ['minutes', 'minutes_version', 'ai_model_identifier', 'approval_status', 'is_superseded', 'generated_at']
    list_filter = ['approval_status', 'is_superseded', 'ai_model_identifier']
    search_fields = ['minutes__service_request_ref', 's3_pdf_key', 'file_hash']
    readonly_fields = ['id', 'file_hash', 'generated_at']
    inlines = [MeetingAgendaItemInline, MeetingDecisionInline, MeetingActionItemInline]


@admin.register(MeetingMinutesCorrection)
class MeetingMinutesCorrectionAdmin(admin.ModelAdmin):
    list_display = ['minutes', 'version_number', 'section_to_correct', 'submitted_by_email', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status', 'section_to_correct']
    search_fields = ['minutes__service_request_ref', 'submitted_by_email', 'submitted_by_name', 'requested_correction']
    readonly_fields = ['id', 'created_at', 'reviewed_at']


@admin.register(MeetingMinutesAcknowledgement)
class MeetingMinutesAcknowledgementAdmin(admin.ModelAdmin):
    list_display = ['minutes', 'version_number', 'user_name', 'user_role', 'acknowledged_at', 'ip_address']
    list_filter = ['user_role']
    search_fields = ['minutes__service_request_ref', 'user_name', 'ip_address']
    readonly_fields = ['id', 'acknowledged_at']


@admin.register(MeetingMinutesDelivery)
class MeetingMinutesDeliveryAdmin(admin.ModelAdmin):
    list_display = ['minutes', 'recipient_type', 'recipient_name', 'recipient_email', 'delivery_method', 'status', 'is_separate_dispatch', 'dispatched_at']
    list_filter = ['recipient_type', 'delivery_method', 'status', 'is_separate_dispatch']
    search_fields = ['minutes__service_request_ref', 'recipient_name', 'recipient_email', 'ses_message_id', 'idempotency_key']
    readonly_fields = ['id', 'ses_message_id', 'idempotency_key', 'dispatched_at', 'delivery_confirmed_at']
