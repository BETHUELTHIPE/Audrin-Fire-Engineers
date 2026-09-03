/**
 * Regulatory Compliance Audit Log Types
 * SANS 10139, SANS 10400-T, OHS Act (Act 85 of 1993), SAQCC Fire & POPIA Compliance
 */

export type ComplianceAuditCategory =
  | 'document_creation_upload'
  | 'document_status_transition'
  | 'review_approval_rejection'
  | 'electronic_signature'
  | 'signature_request'
  | 'download_print_email'
  | 'template_version_change'
  | 'popia_data_access';

export type RegulatoryStandard =
  | 'SANS 10139:2012'
  | 'SANS 10400-T'
  | 'OHS Act 85 of 1993'
  | 'SAQCC Fire 1475/FD'
  | 'POPIA Act 4 of 2013'
  | 'ECSA Code of Practice';

export interface AuditActor {
  name: string;
  role: string;
  registrationNumber: string; // e.g. SAQCC-FD-14289 or ECSA Pr.Eng 2026991
  organization: string;
  email: string;
  ipAddress: string;
  location: string;
}

export interface DocumentStatusTransitionDetail {
  fromStatus: string;
  toStatus: string;
  documentNumber: string;
  documentTitle: string;
  sectionNumber: number;
  sectionTitle: string;
  revision: string;
  justification: string;
  prerequisitesMet: string[];
}

export interface DocumentCreationUploadDetail {
  documentNumber: string;
  documentTitle: string;
  sectionNumber: number;
  sectionTitle: string;
  revision: string;
  fileName: string;
  fileSize: number;
  fileChecksumSha256: string;
  uploadSource: string;
}

export interface ReviewApprovalRejectionDetail {
  documentNumber: string;
  documentTitle: string;
  decision: 'Approved' | 'Rejected' | 'Requires Revision';
  reviewerName: string;
  reviewerRole: string;
  comments: string;
  statutoryClauseReference?: string;
}

export interface SignatureRequestDetail {
  signatoryRole: string;
  recipientName: string;
  recipientEmail: string;
  requestToken: string;
  verificationStatus: 'Pending' | 'Verified' | 'Expired' | 'Revoked';
  expiresAt: string;
}

export interface DownloadPrintEmailDetail {
  actionType: 'pdf_download' | 'single_document_download' | 'print_preview' | 'email_dispatch';
  documentOrDossierRef: string;
  documentTitle?: string;
  recipientEmail?: string;
  deliveryResult?: 'Delivered' | 'Pending' | 'Failed' | 'Downloaded' | 'Printed';
  ipAddress?: string;
  deviceSessionMetadata?: string;
}

export interface ElectronicSignatureDetail {
  signatoryRole: 'preparedBy' | 'reviewedBy' | 'approvedBy' | 'clientAcknowledgement' | 'commissioner' | 'technician' | 'projectManager' | 'clientRepresentative' | 'clientSafetyOfficer' | string;
  roleTitle: string;
  signatoryName: string;
  credentialNumber: string;
  credentialAuthority: string;
  signatureDigest: string; // SHA-256 HMAC digest
  certificateThumbprint: string;
  sansComplianceDeclaration: string;
  signatureTimestamp: string;
  biometricOrDigitalType: 'Cryptographic Vector Signature' | 'Hardware Token Key' | 'SANS Digital Seal';
}

export interface TemplateFieldDiff {
  fieldName: string;
  previousValue: string;
  updatedValue: string;
}

export interface TemplateVersionChangeDetail {
  templateId: string;
  templateCode: string;
  templateName: string;
  previousVersion: string;
  newVersion: string;
  changeType: 'Major Statutory Revision' | 'Minor Standard Alignment' | 'Clause Amendment' | 'Mandatory Checklist Update';
  governingClauses: string[];
  changeRationale: string;
  approvedByAuthority: string;
  fieldModifications: TemplateFieldDiff[];
}

export interface ComplianceAuditEntry {
  id: string;
  sequence: number;
  timestamp: string;
  category: ComplianceAuditCategory;
  action: string;
  title: string;
  summary: string;
  safetyFileNumber: string;
  projectRef: string;
  projectName: string;
  siteName: string;
  clientCompanyName?: string;
  documentVersion?: string;
  previousValue?: string;
  newValue?: string;
  emailRecipient?: string;
  deliveryResult?: string;
  ipAddress?: string;
  deviceSessionMetadata?: string;
  fileChecksumSha256?: string;
  actor: AuditActor;
  regulatoryStandards: RegulatoryStandard[];
  statusTransition?: DocumentStatusTransitionDetail;
  documentCreationUpload?: DocumentCreationUploadDetail;
  reviewApprovalRejection?: ReviewApprovalRejectionDetail;
  signatureRequest?: SignatureRequestDetail;
  downloadPrintEmail?: DownloadPrintEmailDetail;
  electronicSignature?: ElectronicSignatureDetail;
  templateVersion?: TemplateVersionChangeDetail;
  sha256Hash: string;
  previousHash: string;
  immutabilityVerified: boolean;
  tamperProofProofLevel: 'SHA-256 Merkle Chained' | 'HMAC-SHA256 Cryptosealed';
  verificationSeal: string;
  rawPayloadSnippet?: string;
}

export interface ComplianceAuditFilterOptions {
  category: ComplianceAuditCategory | 'all';
  searchQuery: string;
  projectRef: string;
  actorRole: string;
  regulatoryStandard: string;
  dateRange: 'all' | 'today' | 'last7' | 'last30';
}
