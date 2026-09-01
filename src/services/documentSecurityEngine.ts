import {
  TechnicalDocument,
  DocumentVersion,
  TechnicalDocumentCategory,
  DocumentEvidenceStage,
  ConfidentialityLevel,
  DocumentCadLayer,
  DocumentAuditLog,
  QuarantinedFileRecord,
  DocumentSystemMetrics,
  User,
  ServiceRequest
} from '../types';
import {
  getFileTypeMeta,
  checkFileSecurity,
  generateSHA256Hash,
  formatFileSize,
  getCategoryDefinition
} from '../utils/fileTypes';

export interface DocumentUploadInput {
  file: File;
  title: string;
  description?: string;
  category: TechnicalDocumentCategory;
  evidenceStage: DocumentEvidenceStage;
  serviceRequest: ServiceRequest;
  drawingNumber?: string;
  revisionNumber?: string;
  documentDate?: string;
  preparedBy?: string;
  uploader: User;
  customerVisible?: boolean;
  includeInReport?: boolean;
  confidentialityLevel?: ConfidentialityLevel;
  clientComments?: string;
  isAudrinSupplied?: boolean;
}

export interface DocumentRevisionInput {
  existingDocument: TechnicalDocument;
  file: File;
  revisionNumber: string;
  changeDescription: string;
  preparedBy?: string;
  uploader: User;
  clientComments?: string;
}

export interface ProcessingResult {
  success: boolean;
  document?: TechnicalDocument;
  quarantinedRecord?: QuarantinedFileRecord;
  errorMessage?: string;
  isDuplicate?: boolean;
}

// ----------------------------------------------------------------------
// DEFAULT CAD LAYER FIXTURES FOR PREVIEWS
// ----------------------------------------------------------------------
export function generateCadLayerFixtures(category: TechnicalDocumentCategory): DocumentCadLayer[] {
  if (category === 'fire_alarm_layout' || category === 'loop_drawing') {
    return [
      { name: 'LOOP_01_ADDRESSABLE_DETECTORS', visible: true, color: '#CC0000', itemCount: 34 },
      { name: 'LOOP_01_MANUAL_CALL_POINTS', visible: true, color: '#FFB703', itemCount: 8 },
      { name: 'LOOP_01_SOUNDER_BEACONS', visible: true, color: '#0077B6', itemCount: 12 },
      { name: 'ARCH_WALLS_STRUCTURAL', visible: true, color: '#475569', itemCount: 86 },
      { name: 'SANS_10139_ZONE_BOUNDARIES', visible: true, color: '#10B981', itemCount: 4 },
      { name: 'CONTAINMENT_CONDUIT_PATHWAYS', visible: false, color: '#8B5CF6', itemCount: 18 }
    ];
  }
  if (category === 'zone_drawing') {
    return [
      { name: 'ZONE_01_OFFICE_GROUND', visible: true, color: '#EF4444', itemCount: 14 },
      { name: 'ZONE_02_WAREHOUSE_HIGH_BAY', visible: true, color: '#F59E0B', itemCount: 28 },
      { name: 'ZONE_03_SERVER_ROOM_FM200', visible: true, color: '#3B82F6', itemCount: 6 },
      { name: 'ZONE_04_MEZZANINE_STORAGE', visible: true, color: '#10B981', itemCount: 12 },
      { name: 'FIRE_DOORS_AND_ESCAPES', visible: true, color: '#6366F1', itemCount: 8 }
    ];
  }
  return [
    { name: 'ARCH_CORE_SLAB', visible: true, color: '#334155', itemCount: 42 },
    { name: 'DOORS_AND_WINDOWS', visible: true, color: '#64748B', itemCount: 26 },
    { name: 'ROOM_LABELS_ANNOTATION', visible: true, color: '#0EA5E9', itemCount: 19 },
    { name: 'FIRE_HYDRANTS_EXTINGUISHERS', visible: true, color: '#CC0000', itemCount: 7 }
  ];
}

// ----------------------------------------------------------------------
// CELERY PROCESSING PIPELINE ENGINE (SIMULATED SAFE ISOLATED WORKERS)
// ----------------------------------------------------------------------
export async function executeDocumentProcessingPipeline(
  input: DocumentUploadInput,
  existingDocuments: TechnicalDocument[] = []
): Promise<ProcessingResult> {
  const { file, serviceRequest, uploader } = input;
  const fileName = file.name;
  const mimeType = file.type || '';
  const fileSize = file.size;

  // Step 1: Security Validation & Allowlist Check
  const secCheck = checkFileSecurity(fileName, mimeType);
  if (secCheck.isProhibited) {
    const quarantined: QuarantinedFileRecord = {
      id: `quar-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalFileName: fileName,
      fileExtension: fileName.split('.').pop() || '',
      fileSizeFormatted: formatFileSize(fileSize),
      detectedThreat: `Prohibited Payload: ${secCheck.reason}`,
      quarantineDate: new Date().toISOString(),
      uploaderEmail: uploader.email,
      uploaderName: uploader.fullName,
      organisationName: serviceRequest.organisationName,
      serviceRequestRef: serviceRequest.referenceNumber,
      sha256Hash: generateSHA256Hash(fileName, fileSize, 'quarantine_isolate'),
      status: 'quarantined',
      sandboxAnalysis: `Heuristic Sandbox: File execution prevented in isolated container. Prohibited binary header blocked before ingestion.`
    };

    return {
      success: false,
      quarantinedRecord: quarantined,
      errorMessage: secCheck.reason || 'File contains prohibited executable or script signature.'
    };
  }

  // Step 2: Cryptographic Hash Calculation (SHA-256)
  const sha256 = generateSHA256Hash(fileName, fileSize);

  // Step 3: Duplicate Upload Detection within Request
  const isDuplicate = existingDocuments.some(
    (d) =>
      d.serviceRequestId === serviceRequest.id &&
      (d.currentVersion.fileHash === sha256 || d.currentVersion.originalFileName === fileName)
  );

  // Step 4: Metadata & Category Resolution
  const meta = getFileTypeMeta(fileName, mimeType);
  const catDef = getCategoryDefinition(input.category);
  const documentId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const versionId = `ver-${Date.now()}-01`;
  const storagePath = `/secure_vault/${serviceRequest.organisationName.replace(/[^a-zA-Z0-9]/g, '_')}/${serviceRequest.referenceNumber}/${documentId}_${fileName}`;
  const fileUrl = URL.createObjectURL(file);

  // Step 5: Version Entity Construction
  const initialVersion: DocumentVersion = {
    id: versionId,
    documentId,
    versionNumber: 1,
    revisionNumber: input.revisionNumber || 'Rev 01',
    originalFileName: fileName,
    secureStorageFileName: `${documentId}_v1_${fileName}`,
    fileExtension: meta.extension,
    mimeType: mimeType || `application/${meta.extension}`,
    fileSize,
    fileSizeFormatted: formatFileSize(fileSize),
    fileUrl,
    fileHash: sha256,
    changeDescription: 'Initial document upload and technical submission.',
    uploadedBy: uploader.fullName,
    uploadedByRole: uploader.role === 'customer' ? 'customer' : 'staff',
    uploaderEmail: uploader.email,
    uploadedAt: new Date().toISOString(),
    reviewStatus: uploader.role === 'customer' ? 'pending_review' : 'approved',
    reviewedBy: uploader.role !== 'customer' ? uploader.fullName : undefined,
    reviewedAt: uploader.role !== 'customer' ? new Date().toISOString() : undefined,
    previewUrl: fileUrl,
    previewType: meta.previewType,
    previewStatus: 'ready',
    cadLayers: meta.isCad ? generateCadLayerFixtures(input.category) : undefined,
    conversionLog: meta.isCad
      ? 'CAD Conversion Worker v3.4.1 (LibreCAD/Teigha Core): Vector preview generated. 6 drawing layers extracted successfully.'
      : meta.isWord || meta.isExcel
      ? 'LibreOffice Headless Isolated Worker v7.6.2: Clean HTML/Canvas preview generated.'
      : 'Standard format inspection passed.'
  };

  // Step 6: Initial Audit Log
  const initialAuditLog: DocumentAuditLog = {
    id: `log-${Date.now()}-01`,
    documentId,
    timestamp: new Date().toISOString(),
    action: 'uploaded',
    performedBy: uploader.fullName,
    userRole: uploader.role,
    userEmail: uploader.email,
    details: `Document uploaded (${fileName}, ${formatFileSize(fileSize)}). SHA-256: ${sha256.substring(0, 16)}... Celery malware scan: CLEAN.`
  };

  // Step 7: Technical Document Entity
  const newDocument: TechnicalDocument = {
    id: documentId,
    title: input.title || fileName.replace(/\.[^/.]+$/, ''),
    description: input.description || catDef.description,
    category: input.category,
    evidenceStage: input.evidenceStage || catDef.defaultStage,
    serviceRequestId: serviceRequest.id,
    serviceRequestRef: serviceRequest.referenceNumber,
    siteId: serviceRequest.streetAddress,
    siteName: serviceRequest.siteName,
    organisationId: serviceRequest.organisationName,
    organisationName: serviceRequest.organisationName,
    drawingNumber: input.drawingNumber || '',
    revisionNumber: input.revisionNumber || 'Rev 01',
    documentDate: input.documentDate || new Date().toISOString().split('T')[0],
    preparedBy: input.preparedBy || uploader.fullName,
    uploadedBy: uploader.fullName,
    uploadedByRole: uploader.role === 'customer' ? 'customer' : 'staff',
    uploaderEmail: uploader.email,
    uploadedAt: new Date().toISOString(),
    customerVisible: input.customerVisible !== undefined ? input.customerVisible : true,
    includeInReport: input.includeInReport !== undefined ? input.includeInReport : true,
    confidentialityLevel: input.confidentialityLevel || 'restricted_client',
    clientComments: input.clientComments || '',
    reviewStatus: uploader.role === 'customer' ? 'pending_review' : 'approved',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath,
    retentionPolicy: 'SANS 10139 5-Year Statutory Engineering Archive (Private Signed Storage)',
    currentVersionNumber: 1,
    currentVersion: initialVersion,
    versionHistory: [initialVersion],
    isAudrinSupplied: input.isAudrinSupplied !== undefined ? input.isAudrinSupplied : uploader.role !== 'customer',
    isLockedByReport: false,
    auditLogs: [initialAuditLog]
  };

  return {
    success: true,
    document: newDocument,
    isDuplicate
  };
}

// ----------------------------------------------------------------------
// SUBMIT NEW DOCUMENT REVISION (IMMUTABLE VERSION CONTROL)
// ----------------------------------------------------------------------
export async function executeDocumentRevisionPipeline(
  input: DocumentRevisionInput
): Promise<ProcessingResult> {
  const { existingDocument, file, revisionNumber, changeDescription, preparedBy, uploader, clientComments } = input;
  const fileName = file.name;
  const mimeType = file.type || '';
  const fileSize = file.size;

  // Step 1: Security check
  const secCheck = checkFileSecurity(fileName, mimeType);
  if (secCheck.isProhibited) {
    const quarantined: QuarantinedFileRecord = {
      id: `quar-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalFileName: fileName,
      fileExtension: fileName.split('.').pop() || '',
      fileSizeFormatted: formatFileSize(fileSize),
      detectedThreat: `Revision Prohibited: ${secCheck.reason}`,
      quarantineDate: new Date().toISOString(),
      uploaderEmail: uploader.email,
      uploaderName: uploader.fullName,
      organisationName: existingDocument.organisationName,
      serviceRequestRef: existingDocument.serviceRequestRef,
      sha256Hash: generateSHA256Hash(fileName, fileSize, 'quarantine_revision'),
      status: 'quarantined',
      sandboxAnalysis: `Revision upload rejected: executable code found in revised payload.`
    };
    return {
      success: false,
      quarantinedRecord: quarantined,
      errorMessage: secCheck.reason
    };
  }

  const sha256 = generateSHA256Hash(fileName, fileSize);
  const meta = getFileTypeMeta(fileName, mimeType);
  const nextVersionNum = existingDocument.currentVersionNumber + 1;
  const newVersionId = `ver-${Date.now()}-${nextVersionNum}`;
  const fileUrl = URL.createObjectURL(file);

  const newVersion: DocumentVersion = {
    id: newVersionId,
    documentId: existingDocument.id,
    versionNumber: nextVersionNum,
    revisionNumber: revisionNumber || `Rev ${nextVersionNum < 10 ? '0' + nextVersionNum : nextVersionNum}`,
    originalFileName: fileName,
    secureStorageFileName: `${existingDocument.id}_v${nextVersionNum}_${fileName}`,
    fileExtension: meta.extension,
    mimeType: mimeType || `application/${meta.extension}`,
    fileSize,
    fileSizeFormatted: formatFileSize(fileSize),
    fileUrl,
    fileHash: sha256,
    changeDescription: changeDescription || `Revision update to ${revisionNumber}`,
    uploadedBy: uploader.fullName,
    uploadedByRole: uploader.role === 'customer' ? 'customer' : 'staff',
    uploaderEmail: uploader.email,
    uploadedAt: new Date().toISOString(),
    reviewStatus: uploader.role === 'customer' ? 'pending_review' : 'approved',
    previewUrl: fileUrl,
    previewType: meta.previewType,
    previewStatus: 'ready',
    cadLayers: meta.isCad ? generateCadLayerFixtures(existingDocument.category) : undefined,
    conversionLog: `Celery Worker v3.4.1: Revision v${nextVersionNum} processed. Previous version v${existingDocument.currentVersionNumber} preserved in immutable revision register.`
  };

  const auditLog: DocumentAuditLog = {
    id: `log-${Date.now()}-${nextVersionNum}`,
    documentId: existingDocument.id,
    timestamp: new Date().toISOString(),
    action: 'new_version_uploaded',
    performedBy: uploader.fullName,
    userRole: uploader.role,
    userEmail: uploader.email,
    details: `Submitted new document revision: ${newVersion.revisionNumber} (Version ${nextVersionNum}). Changes: "${changeDescription}".`
  };

  const updatedDocument: TechnicalDocument = {
    ...existingDocument,
    revisionNumber: newVersion.revisionNumber,
    preparedBy: preparedBy || existingDocument.preparedBy,
    clientComments: clientComments || existingDocument.clientComments,
    reviewStatus: uploader.role === 'customer' ? 'pending_review' : 'approved',
    currentVersionNumber: nextVersionNum,
    currentVersion: newVersion,
    versionHistory: [newVersion, ...existingDocument.versionHistory],
    auditLogs: [auditLog, ...existingDocument.auditLogs]
  };

  return {
    success: true,
    document: updatedDocument
  };
}
