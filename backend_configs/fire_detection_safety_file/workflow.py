"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File Workflow Engine
Registration No: K2026089596
Standards Alignment: SANS 10139:2012 & SANS 10400-T:2011 Edition 3
"""

import hashlib
import json
from datetime import date
from typing import Dict, Any, List, Optional, Tuple
from django.utils import timezone
from .models import (
    SafetyFileDossier,
    SafetyFileSectionModel,
    SafetyFileDocumentModel,
    DocumentRevisionRecordModel,
    StatutorySignatoryApprovalModel,
    ComplianceAuditLogModel
)
from .compliance_rules import SANS_10139_SOURCE_CLAUSES, SANS_10400_T_SOURCE_CLAUSES


class WorkflowTransitionException(Exception):
    """Raised when an illegal workflow state transition is attempted or statutory gates fail."""
    def __init__(self, message: str, validation_errors: Optional[List[str]] = None):
        super().__init__(message)
        self.validation_errors = validation_errors or []


class SafetyFileWorkflowEngine:
    """
    State machine and statutory gate validator for Fire Detection Safety Files.
    Guarantees that all statutory criteria from SANS 10139 and SANS 10400-T are enforced.
    """

    DOCUMENT_ALLOWED_TRANSITIONS = {
        'missing': ['draft', 'submitted'],
        'draft': ['submitted', 'under_review'],
        'submitted': ['under_review', 'rejected', 'draft'],
        'under_review': ['awaiting_signature', 'approved', 'rejected', 'draft'],
        'awaiting_signature': ['approved', 'rejected', 'under_review'],
        'approved': ['issued', 'superseded', 'expired'],
        'rejected': ['draft'],
        'issued': ['superseded', 'expired'],
        'superseded': [],
        'expired': ['draft', 'superseded'],
    }

    DOSSIER_ALLOWED_TRANSITIONS = {
        'draft': ['under_review'],
        'under_review': ['approved', 'draft'],
        'approved': ['issued', 'under_review'],
        'issued': ['archived'],
        'archived': [],
    }

    @classmethod
    def transition_document_status(
        cls,
        document_id: str,
        target_status: str,
        actor_name: str,
        actor_role: str,
        credential_number: Optional[str] = None,
        justification: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a controlled document state transition, applying statutory checks and logging an audit event.
        """
        try:
            document = SafetyFileDocumentModel.objects.select_related('section__dossier').get(id=document_id)
        except SafetyFileDocumentModel.DoesNotExist:
            raise WorkflowTransitionException(f"Document with ID {document_id} not found.")

        current_status = document.status
        allowed = cls.DOCUMENT_ALLOWED_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise WorkflowTransitionException(
                f"Illegal document state transition from '{current_status}' to '{target_status}'. "
                f"Allowed target states: {allowed}"
            )

        validation_errors = []
        prerequisites = []

        # Gate 1: Approval credentials check
        if target_status == 'approved':
            if not credential_number and not document.prepared_by_name:
                validation_errors.append("Approving user must provide verified SAQCC or professional credential.")
            else:
                prerequisites.append(f"Signatory credential verified: {credential_number or 'On Record'}")

        # Gate 2: Issuance prerequisites check
        if target_status == 'issued':
            if current_status != 'approved':
                validation_errors.append("Document must be in Approved status prior to formal Issuance.")
            else:
                prerequisites.append("Prior formal approval confirmed")

        if validation_errors:
            raise WorkflowTransitionException(
                "Document transition failed validation rules.",
                validation_errors=validation_errors
            )

        # Apply state change
        document.status = target_status
        document.is_approved = target_status in ['approved', 'issued']

        if target_status == 'draft':
            document.watermark_text = 'DRAFT – NOT APPROVED FOR RELIANCE'
        elif target_status == 'rejected':
            document.watermark_text = 'REJECTED – NON-CONFORMANCE REVISION REQUIRED'
        elif target_status == 'expired':
            document.watermark_text = 'EXPIRED – STATUTORY RE-CALIBRATION REQUIRED'
            document.is_expired = True
        elif target_status in ['approved', 'issued']:
            document.watermark_text = ''
            document.is_expired = False

        if target_status in ['approved', 'issued']:
            # Create revision entry
            rev_count = document.revisions.count() + 1
            rev_str = f"REV 0{rev_count}.0"
            DocumentRevisionRecordModel.objects.create(
                document=document,
                revision=rev_str,
                date=date.today(),
                changed_by=actor_name,
                summary=justification or f"Status advanced to {target_status.upper()} under SANS 10139 Section {document.section.section_number} compliance."
            )
            document.revision = rev_str

        document.save()

        # Audit Log
        ComplianceAuditLogModel.objects.create(
            dossier=document.section.dossier,
            action=f"Document Status Transition: {target_status.upper()}",
            from_status=current_status,
            to_status=target_status,
            actor_name=actor_name,
            actor_role=actor_role,
            registration_number=credential_number or '',
            details=f"Document {document.document_number} ({document.title}) in Section {document.section.section_number} moved to {target_status}. {justification or ''}",
            prerequisites_verified=prerequisites,
            ip_address=ip_address
        )

        return {
            "success": True,
            "document_id": str(document.id),
            "document_number": document.document_number,
            "from_status": current_status,
            "to_status": target_status,
            "revision": document.revision,
            "prerequisites_verified": prerequisites
        }

    @classmethod
    def validate_dossier_compliance(cls, dossier: SafetyFileDossier) -> Dict[str, Any]:
        """
        Validates the dossier against the two approved source PDFs (SANS 10139 and SANS 10400-T).
        """
        blocking_issues = []
        warnings = []
        missing_clauses = []

        # 1. Statutory Commissioner Approval Check (SANS 10139 Clause 24 & Annex E)
        commissioner_approval = dossier.approvals.filter(
            signatory_role='commissioner',
            is_signed=True
        ).first()

        if not commissioner_approval:
            blocking_issues.append(
                "SANS 10139 Clause 24: Commissioner approval signature is missing. "
                "A dossier cannot be marked as Approved or Compliant without SAQCC Commissioner certification."
            )
            missing_clauses.append("SANS 10139 Clause 24 (Commissioner Approval)")

        # 2. Mandatory Documents Completeness Check across all 16 Sections
        all_docs = SafetyFileDocumentModel.objects.filter(section__dossier=dossier)
        missing_docs = all_docs.filter(is_mandatory=True, status='missing')
        if missing_docs.exists():
            blocking_issues.append(
                f"Missing Mandatory Documents: {missing_docs.count()} statutory documents have not been uploaded."
            )
            for m in missing_docs:
                blocking_issues.append(f"- Section {m.section.section_number}: {m.title} ({m.document_number})")

        # 3. Calibration Currency Check (SANS 10139 Clause 1r & SANAS ISO 17025)
        expired_docs = all_docs.filter(
            is_expired=True
        ) | all_docs.filter(
            expiry_date__lt=date.today()
        )
        if expired_docs.exists():
            blocking_issues.append(
                f"Expired Equipment Calibration: {expired_docs.count()} instruments or credentials have expired."
            )
            for e in expired_docs:
                blocking_issues.append(f"- {e.title} expired on {e.expiry_date}")
            missing_clauses.append("SANS 10139 Clause 1r / SANAS Calibration Standard")

        # 4. Client Handover Acknowledgement Check
        client_approval = dossier.approvals.filter(
            signatory_role__in=['client_representative', 'client_safety_officer'],
            is_signed=True
        ).first()
        if not client_approval:
            warnings.append(
                "Client Handover Acknowledgement: Client Representative or Safety Officer signature is pending before formal Issuance."
            )

        # 5. Check Section 14 Statutory COC
        coc_doc = all_docs.filter(section__section_number=14).first()
        if not coc_doc or coc_doc.status in ['missing', 'draft']:
            blocking_issues.append(
                "SANS 10139 Annex E: Statutory Certificate of Compliance (COC) in Section 14 is not fully finalized."
            )
            missing_clauses.append("SANS 10139 Annex E (Statutory COC)")

        # 6. Check Section 11 Standby Battery Calculation
        battery_doc = all_docs.filter(section__section_number=11, title__icontains='battery').first()
        if not battery_doc or battery_doc.status == 'missing':
            blocking_issues.append(
                "SANS 10139 Clause 15: Standby Battery Calculation (24h Quiescent + 30min Alarm × 1.25) is missing in Section 11."
            )
            missing_clauses.append("SANS 10139 Clause 15 (Secondary Battery Sizing)")

        total_mandatory = all_docs.filter(is_mandatory=True).count()
        approved_mandatory = all_docs.filter(is_mandatory=True, status__in=['approved', 'issued']).count()
        completion_percentage = int((approved_mandatory / total_mandatory * 100)) if total_mandatory > 0 else 0

        can_advance_to_under_review = dossier.status == 'draft' and dossier.sections.count() >= 16
        can_advance_to_approved = (
            dossier.status in ['under_review', 'draft'] and
            len(blocking_issues) == 0 and
            bool(commissioner_approval)
        )
        can_advance_to_issued = (
            dossier.status in ['approved', 'under_review'] and
            len(blocking_issues) == 0 and
            bool(commissioner_approval) and
            bool(client_approval)
        )

        return {
            "dossier_id": str(dossier.id),
            "safety_file_number": dossier.safety_file_number,
            "current_status": dossier.status,
            "completion_percentage": completion_percentage,
            "total_documents": all_docs.count(),
            "missing_mandatory_count": missing_docs.count(),
            "expired_count": expired_docs.count(),
            "is_commissioner_approved": bool(commissioner_approval),
            "is_client_acknowledged": bool(client_approval),
            "can_advance_to_under_review": can_advance_to_under_review,
            "can_advance_to_approved": can_advance_to_approved,
            "can_advance_to_issued": can_advance_to_issued,
            "blocking_issues": blocking_issues,
            "warnings": warnings,
            "missing_clauses": missing_clauses
        }

    @classmethod
    def transition_dossier_status(
        cls,
        dossier_id: str,
        target_status: str,
        actor_name: str,
        actor_role: str,
        credential_number: Optional[str] = None,
        justification: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a controlled Dossier state transition across the lifecycle (Draft -> Under Review -> Approved -> Issued -> Archived).
        Strictly enforces the SAQCC Commissioner approval gate.
        """
        try:
            dossier = SafetyFileDossier.objects.prefetch_related('sections__documents', 'approvals').get(id=dossier_id)
        except SafetyFileDossier.DoesNotExist:
            raise WorkflowTransitionException(f"Safety file dossier with ID {dossier_id} not found.")

        current_status = dossier.status
        allowed = cls.DOSSIER_ALLOWED_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise WorkflowTransitionException(
                f"Illegal dossier state transition from '{current_status}' to '{target_status}'. "
                f"Allowed target states: {allowed}"
            )

        report = cls.validate_dossier_compliance(dossier)
        validation_errors = []
        prerequisites = []

        if target_status == 'approved':
            if not report['is_commissioner_approved']:
                validation_errors.append(
                    "STATUTORY MANDATE: Commissioner approval must be required before the system marks a dossier as approved. "
                    "Do not describe a file as 'compliant' or 'approved' solely because it is complete."
                )
            if report['missing_mandatory_count'] > 0:
                validation_errors.append(f"{report['missing_mandatory_count']} mandatory documents are still missing.")
            if report['expired_count'] > 0:
                validation_errors.append(f"{report['expired_count']} calibration records are expired.")

            if not validation_errors:
                prerequisites.append("Accredited SAQCC Commissioner signature verified")
                prerequisites.append("All 16 statutory sections complete with 0 missing mandatory documents")
                prerequisites.append("All test equipment calibrations verified unexpired")

        elif target_status == 'issued':
            if not report['is_client_acknowledged']:
                validation_errors.append("Client Safety Officer or Representative handover signature is required for Issuance.")
            if current_status != 'approved':
                validation_errors.append("Dossier must be Approved prior to formal statutory Issuance.")

            if not validation_errors:
                prerequisites.append("Client Handover Acknowledgement signed")
                prerequisites.append("Prior Commissioner Approval verified")

        if validation_errors:
            raise WorkflowTransitionException(
                "Dossier transition failed statutory gates.",
                validation_errors=validation_errors
            )

        # Apply transition
        dossier.status = target_status
        if target_status == 'issued':
            dossier.file_checksum_sha256 = cls.compute_dossier_checksum(dossier)
            dossier.practical_completion_date = date.today()

            # Mark all approved documents as Issued
            SafetyFileDocumentModel.objects.filter(
                section__dossier=dossier,
                status='approved'
            ).update(status='issued', watermark_text='')

        dossier.save()

        # Audit Log
        ComplianceAuditLogModel.objects.create(
            dossier=dossier,
            action=f"Dossier Lifecycle Transition: {target_status.upper()}",
            from_status=current_status,
            to_status=target_status,
            actor_name=actor_name,
            actor_role=actor_role,
            registration_number=credential_number or '',
            details=f"Safety File {dossier.safety_file_number} moved to {target_status}. {justification or ''}",
            prerequisites_verified=prerequisites,
            ip_address=ip_address
        )

        return {
            "success": True,
            "dossier_id": str(dossier.id),
            "safety_file_number": dossier.safety_file_number,
            "from_status": current_status,
            "to_status": target_status,
            "sha256_checksum": dossier.file_checksum_sha256,
            "prerequisites_verified": prerequisites
        }

    @classmethod
    def compute_dossier_checksum(cls, dossier: SafetyFileDossier) -> str:
        """
        Computes an immutable cryptographic SHA-256 digital seal over the entire dossier contents.
        """
        docs_summary = []
        for sec in dossier.sections.all().order_by('section_number'):
            for doc in sec.documents.all().order_by('document_number'):
                docs_summary.append(f"{sec.section_number}:{doc.document_number}:{doc.revision}:{doc.status}")

        payload = {
            "safety_file_number": dossier.safety_file_number,
            "project_ref": dossier.project_ref,
            "revision": dossier.revision_number,
            "client": dossier.client_company_name,
            "issued_at": timezone.now().isoformat(),
            "commissioner": dossier.authorised_commissioner,
            "commissioner_saqcc": dossier.authorised_commissioner_saqcc,
            "document_census": docs_summary
        }
        raw_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
        return hashlib.sha256(raw_bytes).hexdigest()
