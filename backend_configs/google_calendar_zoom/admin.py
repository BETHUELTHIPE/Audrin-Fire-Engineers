"""
Audrin Fire Engineers - Django Admin Configuration for Calendar & Zoom
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Appointment,
    AppointmentAttendee,
    MeetingOutcome,
    ZoomMeetingAccessLog,
    CalendarSyncJob
)
from .celery_tasks import sync_appointment_to_google_calendar_task


class AppointmentAttendeeInline(admin.TabularInline):
    model = AppointmentAttendee
    extra = 1


class MeetingOutcomeInline(admin.StackedInline):
    model = MeetingOutcome
    can_delete = False
    extra = 0


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'service_request_ref',
        'title',
        'appointment_type',
        'status_badge',
        'scheduled_start',
        'organisation',
        'assigned_staff',
        'google_calendar_sync_status',
        'has_powerpoint'
    ]
    list_filter = ['status', 'appointment_type', 'google_calendar_sync_status', 'has_powerpoint']
    search_fields = ['service_request_ref', 'title', 'organisation__name', 'client_user__email', 'assigned_staff__email']
    inlines = [AppointmentAttendeeInline, MeetingOutcomeInline]
    actions = ['resync_to_google_calendar']

    def status_badge(self, obj):
        colors = {
            'confirmed': 'green',
            'completed': 'blue',
            'rescheduled': 'orange',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(f'<span style="color: {color}; font-weight: bold;">{obj.status.upper()}</span>')
    status_badge.short_description = 'Status'

    def resync_to_google_calendar(self, request, queryset):
        for appt in queryset:
            sync_appointment_to_google_calendar_task.delay(str(appt.id))
        self.message_user(request, f"Dispatched Google Calendar synchronization for {queryset.count()} appointments.")
    resync_to_google_calendar.short_description = "Force Re-sync to Google Calendar"


@admin.register(ZoomMeetingAccessLog)
class ZoomMeetingAccessLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'appointment_ref', 'user_name', 'user_role', 'action', 'ip_address', 'success']
    list_filter = ['action', 'user_role', 'success']
    search_fields = ['appointment_ref', 'user_name', 'ip_address']
    readonly_fields = [f.name for f in ZoomMeetingAccessLog._meta.fields]


@admin.register(CalendarSyncJob)
class CalendarSyncJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment_ref', 'job_type', 'status', 'retry_count', 'created_at', 'processed_at']
    list_filter = ['status', 'job_type']
    search_fields = ['appointment_ref']
    readonly_fields = [f.name for f in CalendarSyncJob._meta.fields]
