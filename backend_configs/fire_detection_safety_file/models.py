"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File Models
Registration No: K2026089596
Standards Alignment: SANS 10139:2012 & SANS 10400-T:2011 Edition 3
"""

import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class SafetyFileDossier(models.Model):
    """
    Master statutory Safety File Dossier governing a Fire Detection & Alarm System project.
    Strictly conforms to SANS 10139:2012, SANS 10400-T, and OHS Act Construction Regulations.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft (Dossier Assembling)'),
        ('under_review', 'Under Review (QA & Peer Inspection)'),
        ('approved', 'Approved (Commissioner Certified)'),
        ('issued', 'Issued (Handed Over & Sealed)'),
        ('archived', 'Archived (Superseded/Historical)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    safety_file_number = models.CharField(max_length=64, unique=True, db_index=True)  # e.g., AFE-SF-2026-001
    project_ref = models.CharField(max_length=64, db_index=True)                       # e.g., AFE-2026-001
    project_name = models.CharField(max_length=255)
    site_name = models.CharField(max_length=255)
    physical_address = models.TextField()
    revision_number = models.CharField(max_length=32, default='REV 01.0')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='draft')
    scope_of_work = models.TextField()
    po_number = models.CharField(max_length=64)
    contract_number = models.CharField(max_length=64, blank=True)
    start_date = models.DateField()
    expected_completion_date = models.DateField()
    practical_completion_date = models.DateField(null=True, blank=True)
    building_classification = models.CharField(max_length=128, default='Class J1 (High-Hazard Storage/Warehousing)')
    system_type = models.CharField(max_length=255, default='Addressable Fire Detection, SANS 10139 Category L1')
    fire_alarm_panel_details = models.CharField(max_length=255, default='Ziton ZP3 8-Loop Networked CIE, Dual Redundant PSU')
    
    # Contractor & Client Information
    principal_contractor = models.CharField(max_length=255, default='Audrin Fire Engineers (Pty) Ltd')
    principal_contractor_reg = models.CharField(max_length=64, default='K2026089596')
    client_company_name = models.CharField(max_length=255)
    client_address = models.TextField(blank=True)
    client_representative_name = models.CharField(max_length=255, blank=True)
    client_representative_email = models.EmailField(blank=True)
    client_representative_phone = models.CharField(max_length=64, blank=True)
    client_safety_officer_name = models.CharField(max_length=255)
    client_safety_officer_email = models.EmailField()
    client_safety_officer_phone = models.CharField(max_length=64)

    # Key Statutory Personnel
    audrin_project_manager = models.CharField(max_length=255)
    responsible_technician = models.CharField(max_length=255)
    responsible_technician_saqcc = models.CharField(max_length=64)
    authorised_commissioner = models.CharField(max_length=255)
    authorised_commissioner_saqcc = models.CharField(max_length=64)

    # Security, Sealing & Tracking
    issue_date = models.DateField(default=timezone.now)
    last_updated_at = models.DateTimeField(auto_now=True)
    file_checksum_sha256 = models.CharField(max_length=64, blank=True)
    confidentiality_notice = models.TextField(
        default='STATUTORY SAFETY DOSSIER. CONFIDENTIAL & PROPERTY OF CLIENT. PROTECTED UNDER SANS 10139:2012.'
    )
    qr_verification_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-last_updated_at']
        verbose_name = 'Safety File Dossier'
        verbose_name_plural = 'Safety File Dossiers'

    def __str__(self):
        return f"{self.safety_file_number} - {self.project_name} ({self.status.upper()})"


class SafetyFileSectionModel(models.Model):
    """
    One of the 16 standard statutory sections in an Audrin Fire Detection Safety File.
    """
    CATEGORY_CHOICES = [
        ('Administrative', 'Administrative'),
        ('Technical', 'Technical'),
        ('Statutory', 'Statutory'),
        ('Handover', 'Handover'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(SafetyFileDossier, on_delete=models.CASCADE, related_name='sections')
    section_number = models.PositiveSmallIntegerField()  # 1 to 16
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    governing_standard = models.CharField(max_length=64, default='SANS_10139_2012')
    standard_reference = models.CharField(max_length=255)
    description = models.TextField()
    icon_name = models.CharField(max_length=64, default='FileText')
    is_mandatory = models.BooleanField(default=True)

    class Meta:
        ordering = ['section_number']
        unique_together = ('dossier', 'section_number')
        verbose_name = 'Safety File Section'
        verbose_name_plural = 'Safety File Sections'

    def __str__(self):
        return f"Section {self.section_number}: {self.title}"


class SafetyFileDocumentModel(models.Model):
    """
    Individual controlled document record inside a safety file section.
    Governs revisioning, lifecycle status, expiry, and cryptographic checksum.
    """
    STATUS_CHOICES = [
        ('missing', 'Missing (Mandatory Document Not Uploaded)'),
        ('draft', 'Draft (Authoring in Progress)'),
        ('submitted', 'Submitted (Awaiting Internal Review)'),
        ('under_review', 'Under Review (QA Inspection)'),
        ('awaiting_signature', 'Awaiting Signature (Sign-off Pending)'),
        ('approved', 'Approved (Authorized Signatory Confirmed)'),
        ('rejected', 'Rejected (Snag / Non-Conformance)'),
        ('issued', 'Issued (Published in Active Dossier)'),
        ('superseded', 'Superseded (Replaced by Later Revision)'),
        ('expired', 'Expired (Calibration / Periodic Expiry)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(SafetyFileSectionModel, on_delete=models.CASCADE, related_name='documents')
    document_number = models.CharField(max_length=64, db_index=True)  # e.g., AFE-SF-DOC-01.01
    title = models.CharField(max_length=255)
    revision = models.CharField(max_length=32, default='REV 01.0')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='draft')
    is_mandatory = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    is_expired = models.BooleanField(default=False)
    
    # Workflow Roles
    prepared_by_name = models.CharField(max_length=255, blank=True)
    prepared_by_role = models.CharField(max_length=128, blank=True)
    prepared_by_date = models.DateField(null=True, blank=True)
    reviewed_by_name = models.CharField(max_length=255, blank=True)
    reviewed_by_role = models.CharField(max_length=128, blank=True)
    reviewed_by_date = models.DateField(null=True, blank=True)
    approved_by_name = models.CharField(max_length=255, blank=True)
    approved_by_role = models.CharField(max_length=128, blank=True)
    approved_by_date = models.DateField(null=True, blank=True)

    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    page_count = models.PositiveIntegerField(default=1)
    file_type = models.CharField(max_length=64, default='application/pdf')
    file_name = models.CharField(max_length=255, blank=True)
    s3_storage_key = models.CharField(max_length=512, blank=True)
    file_checksum_sha256 = models.CharField(max_length=64, blank=True)
    content_summary = models.TextField(blank=True)
    watermark_text = models.CharField(max_length=128, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['document_number']
        verbose_name = 'Safety File Document'
        verbose_name_plural = 'Safety File Documents'

    def __str__(self):
        return f"{self.document_number} - {self.title} ({self.status.upper()})"


class DocumentRevisionRecordModel(models.Model):
    """
    Historical revision record for a safety file document.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(SafetyFileDocumentModel, on_delete=models.CASCADE, related_name='revisions')
    revision = models.CharField(max_length=32)  # e.g., REV 02.0
    date = models.DateField(default=timezone.now)
    changed_by = models.CharField(max_length=255)
    summary = models.TextField()
    diff_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Document Revision'
        verbose_name_plural = 'Document Revisions'


class StatutorySignatoryApprovalModel(models.Model):
    """
    Digital signature record for the 5 statutory safety file sign-off roles.
    Includes accredited registration numbers and legal SANS compliance declaration.
    """
    ROLE_CHOICES = [
        ('technician', 'Lead Fire Technician (Prepared By)'),
        ('project_manager', 'Project Manager (Reviewed By)'),
        ('commissioner', 'Accredited SAQCC Commissioner (Approved By)'),
        ('client_representative', 'Client Project Representative'),
        ('client_safety_officer', 'Client Safety Officer (Handover Acknowledged)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(SafetyFileDossier, on_delete=models.CASCADE, related_name='approvals')
    signatory_role = models.CharField(max_length=32, choices=ROLE_CHOICES)
    name = models.CharField(max_length=255)
    role_title = models.CharField(max_length=128)
    registration_or_id = models.CharField(max_length=64)  # e.g., SAQCC-FD-14289 or ECSA Pr.Eng
    accreditation_authority = models.CharField(max_length=128, default='SAQCC Fire South Africa')
    signature_text = models.CharField(max_length=255)
    signature_data_url = models.TextField(blank=True)
    signed_at = models.DateTimeField(default=timezone.now)
    is_signed = models.BooleanField(default=True)
    compliance_declaration = models.TextField(
        default='I hereby certify under statutory penalty that this Fire Detection Safety File adheres strictly to SANS 10139 and SANS 10400-T.'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        unique_together = ('dossier', 'signatory_role')
        verbose_name = 'Statutory Signatory Approval'
        verbose_name_plural = 'Statutory Signatory Approvals'

    def __str__(self):
        return f"{self.signatory_role}: {self.name} ({self.registration_or_id})"


class ComplianceAuditLogModel(models.Model):
    """
    Immutable audit trail for all workflow transitions, approvals, and statutory checks.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(SafetyFileDossier, on_delete=models.CASCADE, related_name='audit_trail')
    action = models.CharField(max_length=255)
    from_status = models.CharField(max_length=64, blank=True)
    to_status = models.CharField(max_length=64, blank=True)
    actor_name = models.CharField(max_length=255)
    actor_role = models.CharField(max_length=128)
    registration_number = models.CharField(max_length=64, blank=True)
    details = models.TextField()
    prerequisites_verified = models.JSONField(default=list)
    timestamp = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Compliance Audit Log'
        verbose_name_plural = 'Compliance Audit Logs'
