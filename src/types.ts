export type UserRole = 'customer' | 'staff' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organisationId?: string;
  organisationName?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  registrationNumber?: string;
  vatNumber?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  createdAt: string;
}

export interface Site {
  id: string;
  organisationId: string;
  name: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  buildingType: string;
  approximateSizeM2?: number;
  numberOfFloors: number;
  fireAlarmPanelModel?: string;
  systemType?: string;
  zonesCount?: number;
  loopsCount?: number;
  createdAt: string;
}

export type ServiceCategory = 
  | 'design_planning'
  | 'installation_commissioning'
  | 'maintenance_testing'
  | 'fault_emergency'
  | 'modifications_upgrades'
  | 'documentation_compliance';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory | string;
  shortDescription: string;
  fullOverview: string;
  detailedDescription?: string;
  sansReference?: string;
  suitableBuildingTypes: string[];
  scopeOfWork: string[];
  scopePoints?: string[];
  processSteps: string[];
  deliverables: string[];
  clientResponsibilities: string[];
  prerequisites?: string[];
  relatedServiceSlugs: string[];
  frequentlyAskedQuestions: { question: string; answer: string }[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type RequestStatus =
  | 'Submitted'
  | 'Under review'
  | 'More information required'
  | 'Site survey scheduled'
  | 'Survey completed'
  | 'Quotation in preparation'
  | 'Quotation issued'
  | 'Approved'
  | 'Work scheduled'
  | 'Work in progress'
  | 'Testing and commissioning'
  | 'Documentation in preparation'
  | 'Completed'
  | 'Closed'
  | 'Cancelled';

export type RequestUrgency = 'standard' | 'high' | 'urgent_emergency';

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileSize: number | string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  category:
    | 'site_photo'
    | 'panel_photo'
    | 'drawings'
    | 'report'
    | 'fault_screenshot'
    | 'cad_drawing'
    | 'word_document'
    | 'spreadsheet'
    | 'specification'
    | 'other';
  isInternalOnly: boolean;
}

export interface StatusHistoryItem {
  id: string;
  status: RequestStatus;
  changedBy: string;
  timestamp: string;
  notes?: string;
  visibleToCustomer: boolean;
}

export interface SiteVisit {
  id: string;
  serviceRequestId: string;
  scheduledDate: string;
  scheduledTimeWindow: string;
  technicianName: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface InternalNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  priority: 'low' | 'normal' | 'high';
}

export interface CustomerMessage {
  id: string;
  senderName: string;
  senderRole: 'customer' | 'staff' | 'admin';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface ServiceRequest {
  id: string;
  referenceNumber: string; // e.g. AFE-REQ-2026-0891
  customerId?: string;
  customerName: string;
  organisationName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'either';

  // Site details
  siteName: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  buildingType: string;
  approximateBuildingSize?: string;
  numberOfFloors: number;

  // Service details
  serviceSlug: string;
  serviceTitle: string;
  systemType?: string; // Conventional, Addressable, Analogue Addressable, Wireless/Hybrid, Aspirating, etc.
  panelMakeModel?: string;
  zonesOrLoopsCount?: string;
  existingFaultOrRequirement: string;
  urgency: RequestUrgency;
  preferredSiteVisitDate?: string;
  additionalInformation?: string;

  // Status & Management
  status: RequestStatus;
  assignedStaff?: string;
  assignedStaffEmail?: string;
  createdAt: string;
  updatedAt: string;

  // Attached sub-resources
  attachments: RequestAttachment[];
  statusHistory: StatusHistoryItem[];
  siteVisits: SiteVisit[];
  internalNotes: InternalNote[];
  customerMessages: CustomerMessage[];
  
  // Classification info
  classificationCategory?: string;
  requiresHumanReview?: boolean;
}

export interface ContactEnquiry {
  id: string;
  referenceNumber: string;
  fullName: string;
  companyOrOrganisation: string;
  email: string;
  telephone: string;
  preferredContactMethod: 'email' | 'phone';
  subject: string;
  message: string;
  popiaConsentAccepted: boolean;
  popiaConsentTimestamp: string;
  createdAt: string;
  status: 'New' | 'In Review' | 'Responded' | 'Closed';
  isEmergencyFault: boolean;
}

export type EmailCategory =
  | 'general_enquiry'
  | 'site_survey'
  | 'design_enquiry'
  | 'installation_enquiry'
  | 'testing_commissioning'
  | 'maintenance'
  | 'fire_alarm_fault'
  | 'emergency_fault'
  | 'repairs'
  | 'system_modification'
  | 'false_alarm_investigation'
  | 'fire_alarm_interface'
  | 'documentation_logbook'
  | 'operator_training'
  | 'existing_request_followup'
  | 'missing_information'
  | 'site_visit_scheduled'
  | 'request_status_update'
  | 'quotation_available'
  | 'work_scheduled'
  | 'work_completed'
  | 'video_upload_acknowledgement'
  | 'out_of_scope'
  | 'unclear_human_review';

export interface EmailTemplate {
  id: string;
  name: string;
  category: EmailCategory;
  subjectTemplate: string;
  htmlBodyTemplate: string;
  plainTextBodyTemplate: string;
  requiredVariables: string[];
  isActive: boolean;
  version: number;
  requiresHumanReview: boolean;
  updatedAt: string;
}

export interface EmailDeliveryLog {
  id: string;
  idempotencyKey: string;
  recipient: string;
  subject: string;
  category: EmailCategory;
  relatedReferenceNumber: string;
  deliveryStatus: 'Queued' | 'Sent' | 'Failed' | 'Delivered' | 'Human Review Required';
  sendAttemptCount: number;
  failureReason?: string;
  sentAt?: string;
  htmlBody: string;
  plainTextBody: string;
  humanReviewStatus?: 'Pending' | 'Approved' | 'Overridden';
  adminOverrideNotes?: string;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'panels' | 'detectors' | 'installation' | 'testing' | 'maintenance' | 'documentation' | 'projects';
  description: string;
  imageUrl: string;
  isPlaceholder: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface HowWeWorkStep {
  stepNumber: number;
  step?: number;
  title: string;
  summary: string;
  detailedDescription: string;
  typicalDeliverables: string[];
  deliverable?: string;
  clientResponsibilities: string[];
  iconName: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  model: string;
  recordId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SystemMetrics {
  requestsCountTotal: number;
  activeRequestsCount: number;
  emergencyFaultsCount: number;
  emailsSentTotal: number;
  emailsQueuedCount: number;
  emailsFailedCount: number;
  redisHealth: 'healthy' | 'degraded';
  postgresHealth: 'healthy' | 'degraded';
  celeryWorkerHealth: 'healthy' | 'degraded';
  celeryBeatHealth: 'healthy' | 'degraded';
  uptimeSeconds: number;
}

// -------------------------------------------------------------
// VOICE AI GUIDE TYPES (Django Admin & Celery Architecture)
// -------------------------------------------------------------

export interface VoiceGuideStep {
  stepNumber: number;
  stepId: string;
  title: string;
  shortLabel: string;
  narrationText: string;
  durationSeconds: number;
  wordTimestamps?: { word: string; start: number; end: number }[];
  iconName: string;
  typicalDeliverables: string[];
  clientResponsibilities: string[];
}

export interface VoiceConfiguration {
  id: string;
  voiceName: string;
  displayName: string;
  language: string;
  accent: string;
  gender: 'Female' | 'Male';
  engine: 'celery_tts_edge' | 'wavenet_sa' | 'browser_speech';
  speakingRate: number; // 0.75 - 1.5
  pitch: number;
  sampleRateHz: number;
  audioFormat: 'mp3' | 'aac' | 'wav';
}

export interface VoiceGuideData {
  id: string;
  title: string;
  language: string;
  introduction: {
    title: string;
    text: string;
    durationSeconds: number;
  };
  steps: VoiceGuideStep[];
  conclusion: {
    title: string;
    text: string;
    durationSeconds: number;
    ctaLabel: string;
    phoneHotline: string;
    operatingHours: string;
  };
  version: number;
  publicationStatus: 'draft' | 'pending_approval' | 'published' | 'archived';
  voiceConfig: VoiceConfiguration;
  audioDurationTotal: number;
  lastGeneratedAt: string;
  publishedAt: string;
  publishedBy: string;
  checksumSha256: string;
  versionHistory: {
    version: number;
    publishedAt: string;
    publishedBy: string;
    changeSummary: string;
    voiceName: string;
    status: 'published' | 'superseded';
  }[];
  generationJobs: {
    jobId: string;
    celeryTaskId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    durationSeconds: number;
    errorDetails?: string;
    timestamp: string;
  }[];
}

export interface VoiceGuideMetrics {
  playCount: number;
  completedNarrations: number;
  stepSelections: Record<number, number>;
  playbackErrors: number;
  audioGenerationSuccesses: number;
  audioGenerationFailures: number;
  avgGenerationDurationSec: number;
}

// -------------------------------------------------------------
// DURING-WORK VIDEO EVIDENCE TYPES (FFmpeg, Celery & SANS 10139)
// -------------------------------------------------------------

export type VideoCategoryType =
  | 'during_work_progress'
  | 'fault_evidence'
  | 'fire_alarm_panel_display'
  | 'detector_or_device'
  | 'cable_route'
  | 'installation_evidence'
  | 'repair_evidence'
  | 'testing_evidence'
  | 'commissioning_evidence'
  | 'interface_test_evidence'
  | 'outstanding_work'
  | 'corrective_action_evidence'
  | 'customer_concern'
  | 'other_technical_evidence';

export type VideoReviewStatus =
  | 'uploading'
  | 'uploaded'
  | 'processing'
  | 'awaiting_review'
  | 'approved'
  | 'rejected'
  | 'more_info_required'
  | 'included_in_report'
  | 'archived'
  | 'processing_failed';

export interface VideoTimestampMarker {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string; // e.g. "00:14"
  title: string;
  description: string;
  stillImageUrl: string;
  approvedForReport: boolean;
  selectedBy: string;
  createdAt: string;
}

export interface VideoProcessingJob {
  jobId: string;
  celeryTaskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  sha256Hash: string;
  malwareScanStatus: 'clean' | 'scanning' | 'flagged';
  ffmpegTranscodeStatus: 'completed' | 'processing' | 'pending' | 'failed';
  extractedMetadata: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    durationSec: number;
    audioChannels: number;
    bitrateKbps: number;
  };
  processingLogs: string[];
  completedAt?: string;
}

export interface ServiceVideo {
  id: string; // UUID
  referenceNumber: string; // e.g. AFE-VID-2026-0891-01
  serviceRequestId: string;
  serviceRequestRef: string;
  siteId?: string;
  siteName: string;
  siteAreaOrRoom: string;
  equipmentReference: string;
  siteVisitId?: string;
  
  // Ownership & Upload
  clientId: string;
  clientName: string;
  organisationName: string;
  uploadedBy: string;
  uploaderRole: 'customer' | 'staff' | 'admin';
  originalFileName: string;
  secureStoredFileName: string;
  mimeType: string;
  fileSize: number; // bytes
  fileSizeFormatted: string;
  duration: number; // seconds
  dateRecorded?: string;
  uploadTimestamp: string;

  // Content Description
  title: string;
  description: string;
  category: VideoCategoryType;
  workStage: string;

  // Review & Governance
  reviewStatus: VideoReviewStatus;
  customerVisibleStatus: 'Client-submitted video evidence — awaiting review' | 'Approved by Audrin Engineering' | 'Rejected — See notes' | 'Additional evidence requested' | 'Included in Final Report';
  isCustomerVisible: boolean;
  includedInReport: boolean;
  reviewedBy?: string;
  reviewTimestamp?: string;
  rejectionReason?: string;
  internalNotes?: string;
  isLockedAfterReport: boolean;

  // Privacy & Compliance Consent
  privacyConsentAccepted: boolean;
  privacyConsentTimestamp: string;

  // Media URLs & Playback
  videoUrl: string;
  thumbnailUrl: string;
  previewUrl?: string;
  signedUrlExpiresAt: string;

  // Sub-entities
  timestampMarkers: VideoTimestampMarker[];
  processingJob: VideoProcessingJob;
  accessLogs: {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    timestamp: string;
    ipAddress: string;
  }[];
}

export interface VideoEvidenceMetrics {
  uploadsStarted: number;
  uploadsCompleted: number;
  failedUploads: number;
  processingSuccesses: number;
  processingFailures: number;
  avgProcessingDurationSec: number;
  totalStorageBytes: number;
  videosAwaitingReview: number;
}

// ----------------------------------------------------------------------
// AUTOMATED CONDITION REPORTS TYPES (Pre-Work & Post-Work Celery Engine)
// ----------------------------------------------------------------------

export type ConditionReportType = 'pre_work' | 'post_work';

export type ConditionReportStatus =
  | 'evidence_being_collected'
  | 'evidence_processing'
  | 'ready_for_generation'
  | 'generating'
  | 'generated'
  | 'emailed'
  | 'viewed_by_client'
  | 'acknowledged_by_client'
  | 'more_info_required'
  | 'superseded'
  | 'generation_failed'
  | 'archived';

export type EvidenceStage = 'before_work' | 'during_work' | 'after_work';

export type PhotoCategoryType =
  | 'fire_alarm_panel'
  | 'smoke_heat_detector'
  | 'manual_call_point'
  | 'sounder_beacon'
  | 'cable_route_containment'
  | 'ceiling_void_riser'
  | 'interface_relay_module'
  | 'fault_indicator_display'
  | 'general_site_area'
  | 'other_fire_component';

export type ReportPhotoCategory = 
  | 'control_panel'
  | 'power_supply'
  | 'detection_device'
  | 'manual_call_point'
  | 'sounder_beacon'
  | 'cable_containment'
  | 'zone_chart_documentation'
  | 'obstruction_damage'
  | 'work_in_progress'
  | 'completed_installation'
  | 'other';

export interface ReportPhotoSelection {
  id: string; // UUID
  photoUrl: string;
  thumbnailUrl: string;
  originalFileName: string;
  stage: EvidenceStage;
  category: PhotoCategoryType;
  roomOrLocation: string;
  caption: string;
  visibleConditionNotes: string;
  clientReportedFault?: string;
  dateRecorded: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderRole: 'customer' | 'staff' | 'admin';
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'included_in_report';
  sha256Hash: string;
  isApprovedForReport: boolean;
  equipmentReference?: string;
}

export interface ReportVideoSelection {
  id: string;
  videoReference: string;
  title: string;
  durationSeconds: number;
  thumbnailUrl: string;
  category: VideoCategoryType;
  stillImageUrls: string[];
  markersCount: number;
  recordedStage: string;
  reviewStatus: string;
}

export interface PairedBeforeAfterComparison {
  id: string;
  beforePhoto: ReportPhotoSelection;
  afterPhoto: ReportPhotoSelection;
  siteArea: string;
  equipmentOrDevice: string;
  beforeConditionCaption: string;
  recordedWorkPerformed: string;
  afterConditionCaption: string;
  evidenceDates: string;
  evidenceSource: string;
  reviewStatus: 'approved' | 'verified_by_staff' | 'pending_client_review';
}

export interface ReportFinding {
  id: string;
  category: string;
  findingText: string; // Must strictly use safe wording (e.g. "The submitted photograph appears to show...")
  visibleEvidenceSummary: string;
  requiresPhysicalAssessment: boolean;
  severity: 'info' | 'advisory' | 'attention_required';
  relatedPhotoId?: string;
}

export interface ReportRecommendation {
  id: string;
  workflowStepNumber: number; // 1 to 7
  workflowStepTitle: string; // from the 7 approved steps
  recommendationText: string;
  rationale: string;
  priority: 'standard' | 'high' | 'urgent';
}

export interface ReportEvidenceSnapshot {
  id: string; // UUID
  snapshotTimestamp: string;
  lockedBy: string;
  photosCount: number;
  videosCount: number;
  photos: ReportPhotoSelection[];
  videos: ReportVideoSelection[];
  snapshotSha256: string;
  isLocked: boolean;
}

export interface ReportDelivery {
  id: string;
  reportId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  deliveryStatus: 'queued' | 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed' | 'retrying';
  sentAt: string;
  authDashboardLink: string;
  sanitizedPdfAttached: boolean;
  retryCount: number;
  errorMessage?: string;
}

export interface ClientReportAcknowledgement {
  id: string;
  reportId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  acknowledgedAt: string;
  acknowledgementType: 'acknowledged_satisfied' | 'correction_requested' | 'post_work_concern' | 'disputed';
  clientNotes?: string;
  submittedCorrectionText?: string;
  ipAddress: string;
  userAgent: string;
}

export interface ConditionReportVersion {
  id: string; // UUID
  versionNumber: number; // 1.0, 1.1, 2.0
  versionTag: string; // "v1.0"
  reportReference: string;
  fileHashSha256: string;
  generatedAt: string;
  generatedByTask: string; // e.g. "celery.tasks.condition_report_worker_v2"
  reasonForVersion?: string;
  snapshot: ReportEvidenceSnapshot;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  pairedComparisons?: PairedBeforeAfterComparison[];
  isCurrent: boolean;
  supersededAt?: string;
  supersededByVersion?: number;
}

export interface ConditionReport {
  id: string; // UUID
  referenceNumber: string; // e.g. AFE-REP-PRE-2026-0104-01 or AFE-REP-POST-2026-0104-01
  reportType: ConditionReportType;
  serviceRequestId: string;
  serviceRequestRef: string;
  relatedPreWorkReportRef?: string; // For Post-Work reports
  status: ConditionReportStatus;

  // Client and Site Information
  clientName: string;
  clientOrganisation: string;
  clientEmail: string;
  clientPhone: string;
  siteName: string;
  siteAddress: string;
  selectedServiceSlug: string;
  selectedServiceTitle: string;
  scopeOfWorkSummary: string[];
  buildingType: string;
  panelMakeModel?: string;
  zonesOrLoopsCount?: string;
  problemDescription: string;

  // Dates and Workflow
  evidenceSubmittedDate: string;
  reportGeneratedDate: string;
  recommendedWorkflowStep: {
    stepNumber: number;
    stepTitle: string;
    rationale: string;
  };

  // Structured Sections
  missingRequiredInfo: string[];
  itemsRequiringPhysicalAssessment: string[];
  workActivitiesRecorded?: string[];
  customerSubmittedComments?: string[];
  outstandingItems?: string[];
  itemsRequiringFurtherTesting?: string[];
  requiredMaintenanceFollowup?: string[];

  // Mandatory Statutory Limitation Disclaimer
  statutoryDisclaimer: string;
  secureDashboardLink: string;

  // Versioning and Deliveries
  currentVersionNumber: number;
  currentVersion: ConditionReportVersion;
  versionHistory: ConditionReportVersion[];
  deliveries: ReportDelivery[];
  acknowledgements: ClientReportAcknowledgement[];
  isLocked: boolean;
}

export interface ConditionReportMetrics {
  preWorkReportsGenerated: number;
  postWorkReportsGenerated: number;
  failedGenerations: number;
  avgGenerationDurationSec: number;
  emailDeliverySuccesses: number;
  emailDeliveryFailures: number;
  reportsAwaitingEvidence: number;
  reportsViewedByClients: number;
  reportsAcknowledgedByClients: number;
  postWorkEvidenceIncompleteCount: number;
}

// ----------------------------------------------------------------------
// CLIENT TECHNICAL DOCUMENT UPLOAD & REVISION CONTROL TYPES
// ----------------------------------------------------------------------

export type TechnicalDocumentCategory =
  | 'site_drawing'
  | 'floor_plan'
  | 'fire_alarm_layout'
  | 'zone_drawing'
  | 'loop_drawing'
  | 'as_built_drawing'
  | 'cause_and_effect'
  | 'device_schedule'
  | 'equipment_datasheet'
  | 'panel_manual'
  | 'existing_service_report'
  | 'previous_inspection_report'
  | 'quotation'
  | 'purchase_order'
  | 'work_instruction'
  | 'risk_assessment'
  | 'method_statement'
  | 'site_access_document'
  | 'commissioning_document'
  | 'test_result'
  | 'completion_document'
  | 'before_work_evidence'
  | 'during_work_evidence'
  | 'after_work_evidence'
  | 'customer_supplied_info'
  | 'other_supporting_doc';

export type DocumentEvidenceStage =
  | 'before_work'
  | 'during_work'
  | 'after_work'
  | 'commissioning'
  | 'general_supporting';

export type ConfidentialityLevel =
  | 'public'
  | 'restricted_client'
  | 'confidential_engineering'
  | 'internal_only';

export type DocumentProcessingStatus =
  | 'queued'
  | 'validating'
  | 'scanning'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'quarantined';

export type DocumentMalwareStatus =
  | 'pending'
  | 'clean'
  | 'suspicious'
  | 'infected'
  | 'quarantined';

export type DocumentReviewStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'requires_revision';

export type DocumentPreviewType =
  | 'cad_vector'
  | 'pdf'
  | 'image'
  | 'office_html'
  | 'spreadsheet_table'
  | 'text'
  | 'archive'
  | 'video'
  | 'unavailable';

export interface DocumentCadLayer {
  name: string;
  visible: boolean;
  color: string;
  itemCount: number;
}

export interface DocumentVersion {
  id: string; // UUID
  documentId: string;
  versionNumber: number; // 1, 2, 3...
  revisionNumber: string; // e.g. "Rev A", "Rev 01", "Draft 2"
  originalFileName: string;
  secureStorageFileName: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number; // bytes
  fileSizeFormatted: string;
  fileUrl: string;
  fileHash: string; // SHA-256
  changeDescription: string;
  uploadedBy: string;
  uploadedByRole: 'customer' | 'staff' | 'admin';
  uploaderEmail: string;
  uploadedAt: string;
  reviewStatus: DocumentReviewStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  previewUrl?: string;
  previewType: DocumentPreviewType;
  previewStatus: 'ready' | 'generating' | 'unavailable' | 'failed';
  cadLayers?: DocumentCadLayer[];
  conversionLog?: string;
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  timestamp: string;
  action:
    | 'uploaded'
    | 'scanned'
    | 'reviewed'
    | 'approved'
    | 'rejected'
    | 'revision_requested'
    | 'new_version_uploaded'
    | 'downloaded'
    | 'previewed'
    | 'quarantined'
    | 'restored'
    | 'visibility_toggled'
    | 'report_link_updated';
  performedBy: string;
  userRole: string;
  userEmail: string;
  ipAddress?: string;
  details: string;
}

export interface TechnicalDocument {
  id: string; // UUID
  title: string;
  description: string;
  category: TechnicalDocumentCategory;
  evidenceStage: DocumentEvidenceStage;
  
  // Linkages (Mandatory)
  serviceRequestId: string;
  serviceRequestRef: string;
  siteId?: string;
  siteName: string;
  organisationId: string;
  organisationName: string;
  siteVisitId?: string;
  siteVisitDate?: string;

  // Engineering & Revision details
  drawingNumber?: string;
  revisionNumber: string; // e.g. "Rev A", "Rev 01"
  documentDate: string;
  preparedBy: string;
  
  // Ownership & Uploader
  uploadedBy: string;
  uploadedByRole: 'customer' | 'staff' | 'admin';
  uploaderEmail: string;
  uploadedAt: string;

  // Visibility & Governance
  customerVisible: boolean;
  includeInReport: boolean;
  confidentialityLevel: ConfidentialityLevel;
  clientComments?: string;
  
  // Review & Admin Workflow
  reviewStatus: DocumentReviewStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;

  // Security & Celery Processing
  processingStatus: DocumentProcessingStatus;
  malwareScanStatus: DocumentMalwareStatus;
  quarantineReason?: string;
  storagePath: string;
  retentionPolicy: string; // e.g. "SANS 10139 5-Year Statutory Archive"

  // Version Control
  currentVersionNumber: number;
  currentVersion: DocumentVersion;
  versionHistory: DocumentVersion[];

  // Meta Flags
  isAudrinSupplied: boolean; // True if supplied by Audrin Fire Engineers, False if customer-supplied
  isLockedByReport: boolean; // True if attached to a sealed / published Condition Report
  linkedReportId?: string;

  // Audit Logs
  auditLogs: DocumentAuditLog[];
}

export interface PermittedFileTypeConfig {
  id: string;
  extension: string; // e.g. 'dwg', 'pdf', 'docx'
  categoryName: string; // 'CAD', 'PDF', 'Office', 'Images', etc.
  mimeType: string;
  maxSizeBytes: number;
  maxSizeFormatted: string;
  isPermitted: boolean;
  requiresMacroScan: boolean;
  cadPreviewSupported: boolean;
  securityNotes: string;
}

export interface QuarantinedFileRecord {
  id: string;
  originalFileName: string;
  fileExtension: string;
  fileSizeFormatted: string;
  detectedThreat: string;
  quarantineDate: string;
  uploaderEmail: string;
  uploaderName: string;
  organisationName: string;
  serviceRequestRef: string;
  sha256Hash: string;
  status: 'quarantined' | 'purged' | 'whitelisted';
  sandboxAnalysis: string;
}

export interface DocumentSystemMetrics {
  uploadsStarted: number;
  uploadsCompleted: number;
  uploadFailures: number;
  filesQuarantined: number;
  malwareDetections: number;
  avgProcessingDurationSec: number;
  previewGenerationFailures: number;
  cadConversionFailures: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  documentsAwaitingReview: number;
  approvedDocumentsCount: number;
  revisionsActiveCount: number;
}

