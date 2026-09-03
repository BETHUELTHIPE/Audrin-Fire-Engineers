"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File REST API Views
Registration No: K2026089596
Standards Alignment: SANS 10139:2012 & SANS 10400-T:2011 Edition 3
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    SafetyFileDossier,
    SafetyFileSectionModel,
    SafetyFileDocumentModel,
    StatutorySignatoryApprovalModel,
    ComplianceAuditLogModel
)
from .workflow import SafetyFileWorkflowEngine, WorkflowTransitionException
from .compliance_rules import SANS_10139_SOURCE_CLAUSES, SANS_10400_T_SOURCE_CLAUSES


class SafetyFileDossierViewSet(viewsets.ModelViewSet):
    """
    REST API ViewSet managing master Safety File Dossiers.
    Provides endpoints for compliance evaluation, statutory approvals, and state machine transitions.
    """
    queryset = SafetyFileDossier.objects.all().prefetch_related('sections__documents', 'approvals')
    lookup_field = 'safety_file_number'

    @action(detail=True, methods=['get'], url_path='compliance-report')
    def compliance_report(self, request, safety_file_number=None):
        """
        Evaluates the dossier against the two approved statutory source PDFs (SANS 10139 and SANS 10400-T).
        """
        dossier = self.get_object()
        report = SafetyFileWorkflowEngine.validate_dossier_compliance(dossier)
        return Response(report, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='transition-status')
    def transition_status(self, request, safety_file_number=None):
        """
        Transitions the dossier lifecycle (Draft -> Under Review -> Approved -> Issued -> Archived).
        Strictly enforces Commissioner approval before marking dossier as Approved.
        """
        dossier = self.get_object()
        target_status = request.data.get('target_status')
        actor_name = request.data.get('actor_name', 'Authorized Officer')
        actor_role = request.data.get('actor_role', 'Audrin Engineer')
        credential_number = request.data.get('credential_number')
        justification = request.data.get('justification')
        ip_address = request.META.get('REMOTE_ADDR')

        if not target_status:
            return Response(
                {"error": "target_status is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = SafetyFileWorkflowEngine.transition_dossier_status(
                dossier_id=str(dossier.id),
                target_status=target_status,
                actor_name=actor_name,
                actor_role=actor_role,
                credential_number=credential_number,
                justification=justification,
                ip_address=ip_address
            )
            return Response(result, status=status.HTTP_200_OK)
        except WorkflowTransitionException as e:
            return Response(
                {"error": str(e), "validation_errors": e.validation_errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

    @action(detail=True, methods=['post'], url_path='sign-approval')
    def sign_approval(self, request, safety_file_number=None):
        """
        Records a statutory digital signature for one of the five approved roles:
        technician, project_manager, commissioner, client_representative, client_safety_officer.
        """
        dossier = self.get_object()
        role = request.data.get('signatory_role')
        name = request.data.get('name')
        role_title = request.data.get('role_title', 'Designated Officer')
        registration_or_id = request.data.get('registration_or_id', '')
        signature_text = request.data.get('signature_text', '')
        signature_data_url = request.data.get('signature_data_url', '')

        if not role or not name:
            return Response(
                {"error": "signatory_role and name are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        approval, created = StatutorySignatoryApprovalModel.objects.update_or_create(
            dossier=dossier,
            signatory_role=role,
            defaults={
                'name': name,
                'role_title': role_title,
                'registration_or_id': registration_or_id,
                'accreditation_authority': 'SAQCC Fire South Africa' if 'SAQCC' in registration_or_id else 'ECSA / OHS Inspectorate',
                'signature_text': f"{signature_text} [Digitally Signed]",
                'signature_data_url': signature_data_url,
                'signed_at': timezone.now(),
                'is_signed': True,
                'ip_address': request.META.get('REMOTE_ADDR')
            }
        )

        ComplianceAuditLogModel.objects.create(
            dossier=dossier,
            action=f"Approval Signed: {role.upper()}",
            from_status=dossier.status,
            to_status=dossier.status,
            actor_name=name,
            actor_role=role_title,
            registration_number=registration_or_id,
            details=f"Statutory approval signed by {name} ({registration_or_id}) for role {role}.",
            prerequisites_verified=[f"Signatory credentials registered: {registration_or_id}"]
        )

        return Response({
            "success": True,
            "signatory_role": role,
            "name": name,
            "registration_or_id": registration_or_id,
            "signed_at": approval.signed_at.isoformat()
        }, status=status.HTTP_200_OK)


class SafetyFileDocumentViewSet(viewsets.ModelViewSet):
    """
    REST API ViewSet managing individual controlled documents and their state machine.
    """
    queryset = SafetyFileDocumentModel.objects.all().select_related('section__dossier')

    @action(detail=True, methods=['post'], url_path='transition-status')
    def transition_status(self, request, pk=None):
        """
        Transitions a document's status (Draft -> Submitted -> Under Review -> Awaiting Signature -> Approved -> Issued).
        """
        document = self.get_object()
        target_status = request.data.get('target_status')
        actor_name = request.data.get('actor_name', 'Inspector')
        actor_role = request.data.get('actor_role', 'Lead Technician')
        credential_number = request.data.get('credential_number')
        justification = request.data.get('justification')
        ip_address = request.META.get('REMOTE_ADDR')

        if not target_status:
            return Response({"error": "target_status is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = SafetyFileWorkflowEngine.transition_document_status(
                document_id=str(document.id),
                target_status=target_status,
                actor_name=actor_name,
                actor_role=actor_role,
                credential_number=credential_number,
                justification=justification,
                ip_address=ip_address
            )
            return Response(result, status=status.HTTP_200_OK)
        except WorkflowTransitionException as e:
            return Response(
                {"error": str(e), "validation_errors": e.validation_errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )


class ApprovedStandardsViewSet(viewsets.ViewSet):
    """
    Exposes the verbatim statutory clauses and deemed-to-satisfy requirements
    from the two approved source PDFs (SANS 10139:2012 and SANS 10400-T:2011).
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        return Response({
            "approved_sources": [
                {
                    "standard_code": "SANS_10139_2012",
                    "title": "Code of Practice for Fire Detection and Alarm Systems for Buildings",
                    "edition": "Edition 1.0 (Amended)",
                    "clauses": SANS_10139_SOURCE_CLAUSES
                },
                {
                    "standard_code": "SANS_10400_T_2011",
                    "title": "National Building Regulations Part T: Fire Protection",
                    "edition": "Edition 3",
                    "clauses": SANS_10400_T_SOURCE_CLAUSES
                }
            ]
        })
