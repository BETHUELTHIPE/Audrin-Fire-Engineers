/**
 * Types and Interfaces for Audrin Fire Detection Safety File Module
 * Aligned with SANS 10139, SANS 10400-T, OHS Act (Act 85 of 1993), and SAQCC Fire Regulations.
 */

export type SafetyFileStatus =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Issued'
  | 'Archived';

export type SafetyFileDocumentStatus =
  | 'Missing'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Awaiting Signature'
  | 'Approved'
  | 'Rejected'
  | 'Issued'
  | 'Superseded'
  | 'Expired';

export interface SafetyFileSignatory {
  name: string;
  role: string;
  registrationOrId?: string;
  signature?: string;
  signedAt?: string;
  timestamp?: string;
  isSigned: boolean;
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected' | 'Pending Verification';
}

export interface SafetyFileApprovalTable {
  // 5 Statutory Roles
  technician?: SafetyFileSignatory;
  projectManager?: SafetyFileSignatory;
  commissioner?: SafetyFileSignatory;
  clientRepresentative?: SafetyFileSignatory;
  clientSafetyOfficer?: SafetyFileSignatory;

  // Backward-compatible aliases
  preparedBy: SafetyFileSignatory;
  reviewedBy: SafetyFileSignatory;
  approvedBy: SafetyFileSignatory;
  clientAcknowledgement: SafetyFileSignatory;
}

export interface StatutoryMilestone {
  id: string;
  name: string;
  category: 'SANS 10139' | 'SANS 10400-T' | 'OHS Act';
  standardClause: string;
  responsiblePerson: string;
  responsibleRole: string;
  targetDate: string;
  completionDate?: string;
  status: 'Completed' | 'In Progress' | 'Overdue' | 'Scheduled';
  evidenceDocumentNumber?: string;
  notes?: string;
}

export interface SafetyFileEmergencyContacts {
  controlRoom24h: string;
  fireDepartmentStation: string;
  fireDepartmentPhone: string;
  standbyEngineerName: string;
  standbyEngineerPhone: string;
  siteSafetyOfficerName: string;
  siteSafetyOfficerPhone: string;
}

export interface SafetyFileDocumentRevision {
  revision: string;
  date: string;
  changedBy: string;
  summary: string;
  fileUrl?: string;
}

export interface SafetyFileDocumentAuditEntry {
  id: string;
  timestamp: string;
  action: 'Created' | 'Uploaded' | 'Edited' | 'Submitted' | 'Approved' | 'Rejected' | 'Issued' | 'Superseded' | 'Signed' | 'Downloaded';
  actorName: string;
  actorRole: string;
  notes?: string;
}

export interface SafetyFileDocument {
  id: string;
  sectionNumber: number;
  title: string;
  documentNumber: string;
  revision: string;
  status: SafetyFileDocumentStatus;
  isMandatory: boolean;
  isApproved: boolean;
  preparedBy?: {
    name: string;
    role: string;
    saqccNo?: string;
    date: string;
  };
  reviewedBy?: {
    name: string;
    role: string;
    date: string;
  };
  approvedBy?: {
    name: string;
    role: string;
    saqccNo?: string;
    date: string;
  };
  issueDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileCategory?: 'pdf' | 'word' | 'excel' | 'image' | 'cad';
  url?: string;
  pageCount: number;
  calculatedStartPage?: number;
  description?: string;
  watermarkText?: string;
  contentSummary?: string;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
  auditHistory: SafetyFileDocumentAuditEntry[];
  revisions: SafetyFileDocumentRevision[];
  clientAcknowledgement?: {
    signedByName: string;
    signedByRole: string;
    signatureDataUrl?: string;
    signedAt: string;
    comments?: string;
  };
}

export interface SafetyFileSection {
  sectionNumber: number;
  title: string;
  description: string;
  iconName: string;
  documents: SafetyFileDocument[];
}

export interface SafetyFileEmailDelivery {
  id: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: string;
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Failed';
  subject: string;
  attachments: string[];
}

export interface SafetyFileAuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  role: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface SafetyFile {
  id: string;
  projectId: string;
  projectRef: string;
  projectName: string;
  siteName: string;
  physicalAddress: string;
  safetyFileNumber: string; // e.g. AFE-SF-2026-001
  revisionNumber: string; // REV 01.0
  status: SafetyFileStatus;
  scopeOfWork: string;
  poNumber: string;
  contractNumber?: string;
  startDate: string;
  expectedCompletionDate: string;
  practicalCompletionDate?: string;
  buildingClassification?: string;
  systemType?: string;
  fireAlarmPanelDetails?: string;
  principalContractor: string;
  principalContractorReg?: string;
  clientCompanyName: string;
  clientLogoUrl?: string;
  clientAddress?: string;
  clientRepresentativeName?: string;
  clientRepresentativePhone?: string;
  clientRepresentativeEmail?: string;
  clientSafetyOfficerName: string;
  clientSafetyOfficerEmail: string;
  clientSafetyOfficerPhone: string;
  audrinProjectManager: string;
  responsibleTechnician: string;
  responsibleTechnicianSaqcc: string;
  authorisedCommissioner: string;
  authorisedCommissionerSaqcc: string;
  issueDate: string;
  lastUpdatedAt: string;
  confidentialityNotice: string;
  qrVerificationUrl: string;
  emergencyContacts?: SafetyFileEmergencyContacts;
  statutoryMilestones?: StatutoryMilestone[];
  fileChecksumSha256?: string;
  approvals: SafetyFileApprovalTable;
  sections: SafetyFileSection[];
  auditTrail: SafetyFileAuditLog[];
  emailDeliveries: SafetyFileEmailDelivery[];
}

export type StatutoryStandardSource =
  | 'SANS_10139_2012'
  | 'SANS_10400_T_2011'
  | 'OHS_ACT_85_1993'
  | 'SAQCC_COMMISSIONER';

export interface SourceComplianceClause {
  standard: StatutoryStandardSource;
  clauseRef: string;
  clauseTitle: string;
  exactWording: string;
  statutoryMandate: string;
  applicableSection: number;
}

export interface SectionChecklistItem {
  id: string;
  clauseRef: string;
  requirementText: string;
  isMandatory: boolean;
  standard: StatutoryStandardSource;
}

export interface MandatoryDocumentTemplate {
  templateCode: string;
  title: string;
  documentNumberPattern: string;
  standardClause: string;
  governingStandard: StatutoryStandardSource;
  requiredRole: string;
  description: string;
  exactComplianceWording: string;
  isMandatory: boolean;
}

export interface SectionDefinition {
  sectionNumber: number;
  title: string;
  category: 'Administrative' | 'Technical' | 'Statutory' | 'Handover';
  standardReference: string;
  governingStandard: StatutoryStandardSource;
  description: string;
  iconName: string;
  mandatoryDocumentTemplates: MandatoryDocumentTemplate[];
  signatoryRolesRequired: string[];
  complianceChecklist: SectionChecklistItem[];
}

export interface WorkflowTransitionValidation {
  ruleCode: string;
  ruleDescription: string;
  passed: boolean;
  failureReason?: string;
  remedialAction?: string;
}

export interface WorkflowTransitionResult {
  success: boolean;
  fromStatus: string;
  toStatus: string;
  entityId: string;
  entityType: 'dossier' | 'document';
  timestamp: string;
  performedBy: {
    name: string;
    role: string;
    credentialNumber?: string;
  };
  validations: WorkflowTransitionValidation[];
  errorMessage?: string;
}

export interface DossierValidationReport {
  fileId: string;
  safetyFileNumber: string;
  currentStatus: SafetyFileStatus;
  canAdvanceToUnderReview: boolean;
  canAdvanceToApproved: boolean;
  canAdvanceToIssued: boolean;
  blockingIssues: string[];
  warnings: string[];
  totalSections: number;
  completedSections: number;
  mandatoryDocumentsCount: number;
  approvedDocumentsCount: number;
  issuedDocumentsCount: number;
  missingDocumentsCount: number;
  expiredDocumentsCount: number;
  isCommissionerApproved: boolean;
  isClientAcknowledged: boolean;
  sans10139ComplianceRate: number;
  sans10400TComplianceRate: number;
  overallComplianceScore: number;
  statutorySourceValidation: {
    sans10139Adherence: boolean;
    sans10400TAdherence: boolean;
    missingMandatoryClauses: string[];
  };
}

export interface ApprovedSourcePDFDefinition {
  id: 'SANS_10139_2012' | 'SANS_10400_T_2011';
  documentName: string;
  officialReference: string;
  edition: string;
  issuingBody: string;
  statutoryEnforcement: string;
  scopeSummary: string;
  approvedSectionsMapped: number[];
  mandatoryVerbatimClauses: SourceComplianceClause[];
}
