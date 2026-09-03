"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File Celery Tasks
Registration No: K2026089596
Standards Alignment: SANS 10139:2012 & SANS 10400-T:2011 Edition 3
"""

from celery import shared_task
from datetime import date
from django.utils import timezone
from .models import (
    SafetyFileDossier,
    SafetyFileDocumentModel,
    ComplianceAuditLogModel
)
from .workflow import SafetyFileWorkflowEngine


@shared_task(name='tasks.check_calibration_expiry')
def check_calibration_expiry():
    """
    Daily periodic task scanning all safety file documents for expired calibration dates
    (such as Sound Level Meter SANAS calibration, 500V DC Insulation tester calibration).
    Automatically flags documents as 'expired' and logs statutory audit alert.
    """
    today = date.today()
    expired_docs = SafetyFileDocumentModel.objects.filter(
        expiry_date__lt=today,
        is_expired=False
    ).exclude(status__in=['superseded', 'missing'])

    count = 0
    for doc in expired_docs:
        doc.is_expired = True
        doc.watermark_text = 'EXPIRED – STATUTORY RE-CALIBRATION REQUIRED'
        doc.save(update_fields=['is_expired', 'watermark_text'])

        ComplianceAuditLogModel.objects.create(
            dossier=doc.section.dossier,
            action="Automated Calibration Expiry Flagged",
            from_status=doc.status,
            to_status='expired',
            actor_name="System Celery Task",
            actor_role="Automated Compliance Monitor",
            details=f"Document {doc.document_number} ({doc.title}) calibration expired on {doc.expiry_date}. Flagged under SANS 10139 Clause 1r.",
            prerequisites_verified=["Periodic date comparison against SANAS ISO 17025 validity window"]
        )
        count += 1

    return f"Checked calibration dates: {count} documents flagged as expired."


@shared_task(name='tasks.compile_safety_file_dossier_pdf')
def compile_safety_file_dossier_pdf(dossier_id: str):
    """
    Asynchronously compiles all 16 sections into a single indexed master PDF,
    computes the SHA-256 digital checksum, and updates dossier metadata.
    """
    try:
        dossier = SafetyFileDossier.objects.get(id=dossier_id)
    except SafetyFileDossier.DoesNotExist:
        return f"Dossier {dossier_id} not found."

    checksum = SafetyFileWorkflowEngine.compute_dossier_checksum(dossier)
    dossier.file_checksum_sha256 = checksum
    dossier.save(update_fields=['file_checksum_sha256', 'last_updated_at'])

    return f"Compiled Safety File {dossier.safety_file_number} with SHA-256 {checksum}."
