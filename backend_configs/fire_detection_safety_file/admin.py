"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File Django Admin
Registration No: K2026089596
Standards Alignment: SANS 10139:2012 & SANS 10400-T:2011 Edition 3
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SafetyFileDossier,
    SafetyFileSectionModel,
    SafetyFileDocumentModel,
    DocumentRevisionRecordModel,
    StatutorySignatoryApprovalModel,
    ComplianceAuditLogModel
)


class SafetyFileDocumentInline(admin.TabularInline):
    model = SafetyFileDocumentModel
    extra = 0
    fields = ('document_number', 'title', 'revision', 'status', 'is_mandatory', 'is_approved', 'is_expired', 'expiry_date')
    readonly_fields = ('document_number',)


class StatutorySignatoryApprovalInline(admin.TabularInline):
    model = StatutorySignatoryApprovalModel
    extra = 0
    fields = ('signatory_role', 'name', 'registration_or_id', 'is_signed', 'signed_at')
    readonly_fields = ('signed_at',)


@admin.register(SafetyFileDossier)
class SafetyFileDossierAdmin(admin.ModelAdmin):
    list_display = (
        'safety_file_number',
        'project_name',
        'client_company_name',
        'status_badge',
        'revision_number',
        'authorised_commissioner',
        'issue_date',
        'last_updated_at'
    )
    list_filter = ('status', 'building_classification', 'issue_date')
    search_fields = ('safety_file_number', 'project_name', 'client_company_name', 'authorised_commissioner')
    inlines = [StatutorySignatoryApprovalInline]
    readonly_fields = ('id', 'file_checksum_sha256', 'last_updated_at')

    def status_badge(self, obj):
        colors = {
            'draft': '#6b7280',
            'under_review': '#eab308',
            'approved': '#3b82f6',
            'issued': '#22c55e',
            'archived': '#9ca3af',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 9999px; font-weight: bold; text-transform: uppercase; font-size: 11px;">{}</span>',
            color,
            obj.status.replace('_', ' ')
        )
    status_badge.short_description = 'Status'


@admin.register(SafetyFileSectionModel)
class SafetyFileSectionAdmin(admin.ModelAdmin):
    list_display = ('section_number', 'title', 'category', 'governing_standard', 'dossier')
    list_filter = ('category', 'governing_standard')
    search_fields = ('title', 'dossier__safety_file_number')
    inlines = [SafetyFileDocumentInline]


@admin.register(SafetyFileDocumentModel)
class SafetyFileDocumentAdmin(admin.ModelAdmin):
    list_display = ('document_number', 'title', 'section', 'revision', 'status_badge', 'is_mandatory', 'is_approved', 'is_expired')
    list_filter = ('status', 'is_mandatory', 'is_approved', 'is_expired')
    search_fields = ('document_number', 'title', 'section__dossier__safety_file_number')

    def status_badge(self, obj):
        colors = {
            'missing': '#ef4444',
            'draft': '#f59e0b',
            'submitted': '#3b82f6',
            'under_review': '#8b5cf6',
            'awaiting_signature': '#ec4899',
            'approved': '#10b981',
            'rejected': '#b91c1c',
            'issued': '#059669',
            'superseded': '#64748b',
            'expired': '#dc2626',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">{}</span>',
            color,
            obj.status.replace('_', ' ')
        )
    status_badge.short_description = 'Status'


@admin.register(ComplianceAuditLogModel)
class ComplianceAuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'dossier', 'action', 'from_status', 'to_status', 'actor_name', 'actor_role')
    list_filter = ('action', 'actor_role', 'timestamp')
    search_fields = ('dossier__safety_file_number', 'actor_name', 'details')
    readonly_fields = ('id', 'timestamp', 'dossier', 'action', 'from_status', 'to_status', 'actor_name', 'actor_role', 'registration_number', 'details', 'prerequisites_verified', 'ip_address')
