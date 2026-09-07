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

// -------------------------------------------------------------
// SANS 10139 COMPLIANCE CALENDAR & INSPECTION SCHEDULING TYPES
// -------------------------------------------------------------

export type SANS10139InspectionType =
  | 'weekly_user_test'
  | 'quarterly_periodic_inspection'
  | 'biannual_inspection'
  | 'annual_comprehensive_servicing'
  | 'site_survey'
  | 'commissioning_verification'
  | 'emergency_fault_attendance';

export type InspectionStatus =
  | 'scheduled'
  | 'due_soon'
  | 'overdue'
  | 'completed'
  | 'in_progress'
  | 'rescheduled';

export interface TechnicianProfile {
  id: string;
  name: string;
  role: string;
  saqccNumber: string;
  saqccLevel: 'Level 1 - Cabler' | 'Level 2 - Installer' | 'Level 3 - Servicing / Commissioner' | 'Level 4 - Designer / Master';
  phone: string;
  email: string;
  specialties: string[];
  currentAssignedCount: number;
  baseLocation: string;
  avatarColor: string;
}

export interface ComplianceInspection {
  id: string;
  title: string;
  inspectionType: SANS10139InspectionType;
  standardClause: string; // e.g. "SANS 10139:2012 Clause 25.3"
  siteId: string;
  siteName: string;
  organisationId: string;
  organisationName: string;
  streetAddress: string;
  city: string;
  serviceRequestId?: string;
  serviceRequestRef?: string;
  systemCategory: string; // "Category L1", "Category L2", "Category M", "Category P1"
  panelMakeModel: string;
  zonesOrLoopsCount?: string;
  scheduledDate: string; // "YYYY-MM-DD"
  scheduledTimeWindow: string; // "09:00 - 12:00"
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  technicianSaqccNumber: string;
  technicianPhone: string;
  status: InspectionStatus;
  complianceChecklistSummary: string[];
  estimatedDurationHours: number;
  notes?: string;
  completionDate?: string;
  findingsSummary?: string;
  certificateIssued?: boolean;
  certificateNumber?: string;
  createdAt: string;
}

export interface SuggestedTimeSlot {
  id: string;
  date: string; // "YYYY-MM-DD"
  timeWindow: string; // "09:00 - 12:00" or "13:30 - 16:30"
  technician: TechnicianProfile;
  suitabilityScore: number; // e.g. 98
  reasons: string[];
  travelZone: string;
  conflictRisk: 'none' | 'low';
}

export interface CalendarFilterState {
  searchQuery: string;
  selectedSite: string; // 'all' or siteId/siteName
  selectedType: string; // 'all' or SANS10139InspectionType
  selectedStatus: string; // 'all' or InspectionStatus
  selectedTechnician: string; // 'all' or technicianId
}

// -------------------------------------------------------------
// SOUTH AFRICAN STATUTORY FORMS & CLIENT COMPLIANCE ENGINE TYPES
// (SANS 10139, SANS 322, SANS 246, SANS 10400-T)
// -------------------------------------------------------------

export type StatutoryStandardCode = 
  | 'SANS_10139' 
  | 'SANS_322' 
  | 'SANS_246' 
  | 'SANS_10400_T';

export type StatutoryFormCategory =
  | 'routine_maintenance'
  | 'false_alarm_management'
  | 'handover_commissioning'
  | 'healthcare_specification'
  | 'healthcare_evacuation'
  | 'server_room_risk'
  | 'server_room_asd'
  | 'server_room_disaster'
  | 'building_reg_appointment'
  | 'equipment_allocation'
  | 'escape_compliance';

export type StatutorySubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'verified_by_engineer'
  | 'approved'
  | 'requires_rectification';

export interface StatutoryFormFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface StatutoryFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'radio' | 'heading';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: StatutoryFormFieldOption[];
  helpText?: string;
  standardClause?: string;
  unit?: string;
}

export interface StatutoryFormSection {
  title: string;
  description?: string;
  fields: StatutoryFormField[];
}

export interface StatutoryFormTemplate {
  id: string;
  formNumber: string; // e.g. "SANS 10139 - Form 1"
  title: string;
  standardCode: StatutoryStandardCode;
  standardTitle: string;
  standardClauseRef: string;
  category: StatutoryFormCategory;
  description: string;
  statutoryMandate: string; // Statutory legal context (e.g. "Mandatory under OHS Act & SANS 10139 Clause 25.2")
  frequency?: string; // "Weekly", "Quarterly", "Annual", "Per Incident", "Once-off"
  targetAudience: 'Responsible Person (Client)' | 'Building Owner' | 'Hospital Facility Manager' | 'IT / Data Center Manager' | 'Fire Engineer';
  estimatedMinutesToComplete: number;
  badgeColor: string;
  sections: StatutoryFormSection[];
}

export interface StatutoryFormSubmission {
  id: string;
  formTemplateId: string;
  formNumber: string;
  formTitle: string;
  standardCode: StatutoryStandardCode;
  standardClauseRef: string;
  category: StatutoryFormCategory;
  serviceRequestId?: string;
  serviceRequestRef?: string;
  siteId: string;
  siteName: string;
  organisationName: string;
  submittedBy: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    designation: string; // e.g. "Responsible Person", "Facility Manager", "Pr.Eng"
  };
  values: Record<string, any>;
  status: StatutorySubmissionStatus;
  certificateNumber?: string;
  submissionDate: string; // ISO String
  lastUpdated: string;
  signedAt?: string;
  signatureName?: string;
  reviewedByEngineer?: {
    name: string;
    saqccNumber: string;
    ecsaNumber?: string;
    comments?: string;
    reviewDate: string;
    status: 'compliant' | 'minor_defects_noted' | 'non_compliant';
  };
  attachments?: string[];
}

// -------------------------------------------------------------
// CERTIFICATE OF COMPLIANCE (COC) APPROVAL WORKFLOW TYPES
// SANS 10139 / SANS 10400-T / SANS 246 / SANS 322 Compliance
// -------------------------------------------------------------

export type COCWorkflowStageId =
  | 'stage_1_inspection'
  | 'stage_2_defects_clearance'
  | 'stage_3_engineer_review'
  | 'stage_4_client_signature'
  | 'stage_5_coc_issuance';

export type COCWorkflowStageStatus =
  | 'pending'
  | 'in_progress'
  | 'action_required'
  | 'completed'
  | 'rejected'
  | 'waived';

export type COCOverallStatus =
  | 'inspection_pending'
  | 'technician_signed'
  | 'engineer_review'
  | 'awaiting_client_signature'
  | 'fully_certified'
  | 'rectification_required';

export interface COCChecklistItem {
  id: string;
  label: string;
  standardClause: string;
  passed: boolean;
  notes?: string;
  testedAt?: string;
  testedBy?: string;
}

export interface COCTechnicianSignOff {
  technicianName: string;
  saqccNumber: string;
  saqccLevel: string;
  phone: string;
  signedAt: string;
  digitalSignatureUrl?: string;
  verificationHash: string;
  panelMakeModel: string;
  loopSensorsTestedCount: number;
  sounderAudibilityDba: number;
  standbyBatteryVoltage: number;
  batteryLoadTestPassed: boolean;
  notes?: string;
}

export interface COCEngineerReview {
  engineerName: string;
  role: string;
  ecsaNumber: string;
  saqccNumber: string;
  digitalSealId: string;
  reviewedAt: string;
  decision: 'approved' | 'rectification_required';
  systemCategory: string; // e.g. "Category L1", "Category L2", "Category M"
  standardReference: string; // e.g. "SANS 10139:2012 / SANS 10400-T"
  endorsementNotes: string;
  verificationHash: string;
}

export interface COCClientDigitalSignature {
  signatoryName: string;
  signatoryEmail: string;
  signatoryRole: string; // e.g. "Responsible Person (SANS 10139)", "Building Owner / Facility Manager"
  organisationName: string;
  signatureType: 'canvas_drawn' | 'crypto_seal';
  signatureDataUrl: string;
  signedAt: string;
  ipAddress: string;
  browserFingerprint: string;
  statutoryDeclarationAccepted: boolean;
  declarationText: string;
}

export interface COCWorkflowStage {
  id: COCWorkflowStageId;
  stageNumber: number;
  title: string;
  shortLabel: string;
  description: string;
  requiredRole: 'Technician (SAQCC)' | 'Remediation Lead' | 'Lead Fire Systems Engineer (Pr.Eng)' | 'Client Responsible Person' | 'Compliance Registrar';
  status: COCWorkflowStageStatus;
  completedAt?: string;
  updatedAt?: string;
  checklist?: COCChecklistItem[];
  technicianSignOff?: COCTechnicianSignOff;
  engineerReview?: COCEngineerReview;
  clientSignature?: COCClientDigitalSignature;
  defectsSummary?: {
    totalLogged: number;
    rectified: number;
    criticalRemaining: number;
    clearanceNotes?: string;
  };
  notes?: string;
}

export interface COCApprovalWorkflow {
  id: string;
  certificateNumber: string; // e.g. "COC-SANS10139-2026-0891-A"
  serviceRequestId: string;
  serviceRequestRef: string;
  siteId: string;
  siteName: string;
  buildingAddress: string;
  city: string;
  province: string;
  organisationName: string;
  systemCategory: string; // "Category L1 (Life Safety)", "Category L2", "Category M", "Category P1"
  standardReference: string; // "SANS 10139:2012 / SANS 10400-T"
  overallStatus: COCOverallStatus;
  progressPercentage: number; // 0 to 100
  currentStageId: COCWorkflowStageId;
  createdAt: string;
  lastUpdated: string;
  issuedAt?: string;
  validUntil?: string; // e.g. 1 year from issuedAt
  qrVerificationCode: string;
  qrVerificationUrl: string;
  stages: COCWorkflowStage[];
  dispatchedRecipients?: {
    name: string;
    entity: string; // e.g. "City of Joburg Fire Department", "Santam Commercial Underwriting", "Client Archive"
    email: string;
    dispatchedAt: string;
    method: 'Automated Webhook' | 'Encrypted PDF Dispatch';
  }[];
}

// -------------------------------------------------------------
// BROWSER PUSH NOTIFICATION & BACKGROUND ALERT ENGINE TYPES
// SANS 10139 Urgent SLA & Maintenance Deadlines
// -------------------------------------------------------------

export type PushNotificationType =
  | 'urgent_dispatch'
  | 'maintenance_deadline'
  | 'coc_action'
  | 'sans_lifecycle'
  | 'report_ready'
  | 'video_review'
  | 'system_alert'
  | 'general';

export type PushNotificationSeverity = 'critical' | 'high' | 'medium' | 'info';

export type NotificationTargetRole = 'all' | 'technician' | 'client' | 'admin';

export interface PushNotificationActionPayload {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotificationItem {
  id: string; // UUID
  title: string;
  body: string;
  type: PushNotificationType;
  severity: PushNotificationSeverity;
  targetRole: NotificationTargetRole;
  timestamp: string; // ISO String
  isRead: boolean;
  siteName?: string;
  serviceRequestId?: string;
  serviceRequestRef?: string;
  inspectionId?: string;
  cocWorkflowId?: string;
  standardClause?: string; // e.g. "SANS 10139:2012 Clause 25.3"
  slaDeadline?: string; // e.g. "2h Emergency Response" or "2026-09-03 14:00"
  technicianName?: string;
  technicianSaqcc?: string;
  actionUrl?: string;
  actionLabel?: string;
  actions?: PushNotificationActionPayload[];
  isDeliveredViaSW: boolean;
  audioChimePlayed: boolean;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  urgentDispatches: boolean; // SANS 10139 Emergency Faults & SLA Dispatches
  maintenanceDeadlines: boolean; // 24h & 7d Quarterly Periodic Tests (Clause 25.3)
  cocSignatures: boolean; // Digital CoC Sign-offs (Responsible Person & Pr.Eng)
  sansLifecycleAlerts: boolean; // 5-Year Battery & Detector Recalibrations
  reportAndEvidenceAlerts: boolean; // Pre/Post-Work Condition Reports
  backgroundPollingIntervalMinutes: number; // 0.5 (30s), 1, 5, 15
  userRoleScope: NotificationTargetRole;
  desktopStickyBanner: boolean;
  // SANS 10139 Routine Inspection Reminders based on device last-serviced dates
  deviceInspectionRemindersEnabled?: boolean;
  reminderLeadDays?: number[]; // e.g. [30, 14, 7, 0]
  deviceTypeFilters?: string[]; // e.g. ['optical_smoke', 'heat_detector', 'battery_bank']
}

export interface PushNotificationSimulationScenario {
  id: string;
  label: string;
  category: 'technician' | 'client' | 'admin' | 'statutory';
  title: string;
  body: string;
  type: PushNotificationType;
  severity: PushNotificationSeverity;
  targetRole: NotificationTargetRole;
  siteName: string;
  serviceRequestRef?: string;
  standardClause?: string;
  slaDeadline?: string;
  technicianName?: string;
  actionLabel: string;
  actionView: string;
}

// AWS ECS Fargate & Infrastructure Types
export interface AwsEcsServiceStatus {
  id: string;
  name: string;
  serviceName: string;
  taskDefinition: string;
  launchType: 'FARGATE' | 'FARGATE_SPOT';
  desiredCount: number;
  runningCount: number;
  pendingCount: number;
  cpu: number; // in vCPU or units (e.g. 256, 512, 1024)
  memory: number; // in MB (e.g. 512, 1024, 2048, 4096)
  cpuUtilization: number; // percentage
  memoryUtilization: number; // percentage
  status: 'ACTIVE' | 'DRAINING' | 'INACTIVE' | 'DEPLOYING';
  healthStatus: 'HEALTHY' | 'UNHEALTHY' | 'INITIALIZING';
  isSingleton?: boolean; // For Celery Beat (strictly 1 instance)
  lastDeploymentAt: string;
  logGroup: string;
  roleArn: string;
}

// Amazon S3 Bucket & Storage Types
export type S3BucketType = 'static_assets' | 'private_media' | 'quarantine';
export type S3StorageClass = 'STANDARD' | 'INTELLIGENT_TIERING' | 'GLACIER_FLEXIBLE' | 'DEEP_ARCHIVE';
export type S3MalwareStatus = 'clean' | 'scanning' | 'quarantined' | 'suspicious' | 'rejected';

export interface S3BucketConfig {
  bucketName: string;
  type: S3BucketType;
  region: string;
  encryption: 'SSE-KMS' | 'AES256';
  kmsKeyArn: string;
  blockPublicAccess: boolean;
  versioningEnabled: boolean;
  objectCount: number;
  totalSizeBytes: number;
  cloudFrontDistributionId?: string;
  cloudFrontDomain?: string;
  lifecycleRules: {
    id: string;
    description: string;
    transitionDays?: number;
    targetStorageClass?: S3StorageClass;
    expirationDays?: number;
    abortIncompleteMultipartDays?: number;
  }[];
}

export interface S3StoredObject {
  id: string;
  key: string;
  bucketName: string;
  sizeBytes: number;
  lastModified: string;
  contentType: string;
  storageClass: S3StorageClass;
  encryption: 'aws:kms' | 'AES256';
  kmsKeyId?: string;
  etag: string;
  sha256Checksum?: string;
  malwareStatus: S3MalwareStatus;
  category: 
    | 'photo_before'
    | 'photo_during'
    | 'photo_after'
    | 'video_original'
    | 'video_processed'
    | 'video_thumbnail'
    | 'cad_drawing'
    | 'report_pre_work'
    | 'report_post_work'
    | 'report_service'
    | 'document_technical'
    | 'static_asset'
    | 'voice_guide';
  organisationUuid: string;
  siteUuid?: string;
  requestUuid?: string;
  fileUuid: string;
  presignedUrl?: string;
  presignedExpiresAt?: string;
  isArchived: boolean;
  accessLogCount: number;
}

// Amazon SNS / SQS / SES Notification System Types
export type SnsEventType =
  | 'client.registered'
  | 'email.verification'
  | 'password.reset'
  | 'contact.enquiry'
  | 'request.submitted'
  | 'survey.requested'
  | 'fault.reported'
  | 'emergency.fault'
  | 'documents.uploaded'
  | 'images.uploaded'
  | 'videos.uploaded'
  | 'evidence.processed'
  | 'evidence.rejected'
  | 'evidence.missing'
  | 'report.pre_work_generated'
  | 'report.post_work_generated'
  | 'site_visit.scheduled'
  | 'request.status_changed'
  | 'quotation.available'
  | 'work.scheduled'
  | 'work.completed'
  | 'report.updated'
  | 'report.acknowledged'
  | 'celery.task_failed'
  | 'ecs.service_alarm'
  | 'malware.detected';

export type SnsDeliveryStatus = 
  | 'pending'
  | 'published_to_sns'
  | 'queued_in_sqs'
  | 'processing'
  | 'sent_ses'
  | 'delivered'
  | 'bounced'
  | 'complained'
  | 'suppressed'
  | 'dead_lettered';

export interface SnsNotificationEvent {
  id: string;
  eventId: string;
  eventType: SnsEventType;
  topicArn: string;
  topicName: string;
  timestamp: string;
  organisationUuid: string;
  userUuid?: string;
  recipientEmail: string;
  recipientName: string;
  serviceRequestUuid?: string;
  serviceRequestRef?: string;
  reportUuid?: string;
  templateKey: string;
  urgency: 'critical' | 'high' | 'normal' | 'low';
  correlationId: string;
  idempotencyKey: string;
  status: SnsDeliveryStatus;
  attemptsCount: number;
  snsMessageId?: string;
  sqsMessageId?: string;
  sesMessageId?: string;
  errorMessage?: string;
  deliveredAt?: string;
  bounceType?: string;
}

export interface SqsQueueStatus {
  queueName: string;
  queueUrl: string;
  topicSubscriptionArn: string;
  approximateNumberOfMessages: number;
  approximateNumberOfMessagesNotVisible: number;
  deadLetterQueueName: string;
  deadLetterMessageCount: number;
  encryption: 'AWS_KMS' | 'SQS_MANAGED';
  visibilityTimeoutSeconds: number;
  messageRetentionPeriodDays: number;
}

export interface SesConfiguration {
  verifiedDomain: string;
  spfRecord: string;
  dkimStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
  dmarcPolicy: 'v=DMARC1; p=reject; rua=mailto:dmarc@audrinfire.co.za';
  dailySendingQuota: number;
  sentLast24Hours: number;
  bounceRatePercent: number;
  complaintRatePercent: number;
  suppressionListCount: number;
}

// ==========================================
// GOOGLE CALENDAR & ZOOM PMI INTEGRATION TYPES
// ==========================================

export type AppointmentType =
  | 'initial_consultation'
  | 'site_survey_planning'
  | 'remote_system_review'
  | 'fault_consultation'
  | 'design_review'
  | 'quotation_discussion'
  | 'work_progress'
  | 'testing_commissioning_review'
  | 'pre_work_report_review'
  | 'post_work_report_presentation'
  | 'handover_meeting'
  | 'maintenance_planning'
  | 'other_fire_detection';

export type AppointmentStatus =
  | 'requested'
  | 'approved'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'rescheduled'
  | 'cancelled'
  | 'no_show';

export type GoogleCalendarSyncStatus =
  | 'pending'
  | 'synced'
  | 'sync_failed'
  | 'conflict_detected'
  | 'deleted_remotely'
  | 'channel_renewed';

export type ZoomMeetingStatus =
  | 'ready'
  | 'active'
  | 'locked'
  | 'completed'
  | 'waiting_room_active';

export interface AppointmentAttendee {
  id: string;
  appointmentId: string;
  userId?: string;
  name: string;
  email: string;
  role: 'client' | 'staff' | 'admin' | 'observer';
  rsvpStatus: 'needsAction' | 'accepted' | 'tentative' | 'declined';
  isRequired: boolean;
  isHost: boolean;
  attended?: boolean;
  joinedAt?: string;
  leftAt?: string;
}

export interface AssignedFollowUpAction {
  id: string;
  description: string;
  responsiblePerson: string;
  responsiblePersonEmail?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  sans10139Category?: string;
}

export interface MeetingOutcome {
  id: string;
  appointmentId: string;
  serviceRequestId?: string;
  serviceRequestRef?: string;
  siteId?: string;
  siteName?: string;
  clientId?: string;
  organisationId?: string;
  recordedByUserId: string;
  recordedByName: string;
  recordedAt: string;
  actualStartTime: string;
  actualEndTime: string;
  discussionSummary: string;
  clientRequirements: string[];
  documentsRequested: string[];
  decisionsMade: string[];
  nextWorkflowStep: string;
  assignedAction: string;
  assignedFollowUpActions?: AssignedFollowUpAction[];
  responsiblePerson: string;
  dueDate: string;
  followUpAppointmentRequired: boolean;
  followUpDate?: string;
  presentationVersionUsed?: string;
  statutoryComplianceDisclaimer: string;
  
  // PostgreSQL Database Linkage Metadata
  postgresRecordId?: string;
  postgresTableName?: string;
  syncedToPostgresAt?: string;
  postgresForeignKeyLinks?: {
    appointmentId: string;
    serviceRequestId: string;
    clientId: string;
    recordedByUserId: string;
  };
}

export interface Appointment {
  id: string;
  title: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  serviceRequestId: string;
  serviceRequestRef: string;
  organisationId: string;
  organisationName: string;
  siteId: string;
  siteName: string;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: 'Africa/Johannesburg';
  clientId: string;
  clientName: string;
  clientEmail: string;
  assignedStaffId: string;
  assignedStaffName: string;
  assignedStaffEmail: string;
  purpose: string;
  safePreparationInstructions: string;
  attendees: AppointmentAttendee[];
  
  // Google Calendar Integration
  googleCalendarEventId?: string;
  googleCalendarSyncStatus: GoogleCalendarSyncStatus;
  googleCalendarHtmlLink?: string;
  googleCalendarIcsUrl?: string;
  lastSyncedAt?: string;
  syncErrorMessage?: string;

  // Zoom PMI Integration (AWS Secrets Manager backed)
  zoomConfigId?: string;
  zoomMeetingStatus: ZoomMeetingStatus;
  
  // PowerPoint Presentation Linkage (Private S3)
  hasPowerPoint: boolean;
  powerPointS3Key?: string;
  powerPointFilename?: string;
  powerPointVersion?: string;

  // Automated Reminders
  remindersConfig: {
    twentyFourHour: boolean;
    oneHour: boolean;
    fifteenMinute: boolean;
    sentHistory: string[];
  };

  // Outcome & Notes
  outcomes?: MeetingOutcome;
  notes?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ZoomSecretConfiguration {
  secretArn: string;
  secretName: string;
  pmiMasked: string;
  passcodeMasked: string;
  waitingRoomEnabled: boolean;
  hostApprovalRequired: boolean;
  meetingLockedOnJoin: boolean;
  muteOnEntry: boolean;
  screenShareHostOnly: boolean;
  authRequired: boolean;
  lastRotated: string;
  rotationIntervalDays: number;
}

export interface ZoomMeetingAccessLog {
  id: string;
  appointmentId: string;
  appointmentRef: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'reveal_pmi'
    | 'reveal_passcode'
    | 'copy_pmi'
    | 'copy_passcode'
    | 'copy_join_url'
    | 'copy_invitation'
    | 'join_meeting'
    | 'start_meeting'
    | 'open_presentation'
    | 'record_outcome';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  notes?: string;
}

export interface CalendarSyncJob {
  id: string;
  appointmentId: string;
  appointmentRef: string;
  jobType: 'create' | 'update' | 'cancel' | 'rsvp_sync' | 'reconcile';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  errorLog?: string;
  createdAt: string;
  processedAt?: string;
}

export interface CalendarWebhookChannel {
  channelId: string;
  resourceId: string;
  resourceUri: string;
  expirationTimestamp: string;
  isActive: boolean;
  lastNotificationAt?: string;
  validationToken: string;
}

export interface GoogleCalendarConnection {
  id: string;
  serviceAccountEmail: string;
  calendarId: string;
  primaryTimezone: 'Africa/Johannesburg';
  syncEnabled: boolean;
  pushNotificationChannelActive: boolean;
  lastSyncAuditAt: string;
}

export interface IntegrationMetrics {
  calendarEventsCreated: number;
  calendarSyncFailures: number;
  appointmentsScheduled: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  clientRsvpAccepted: number;
  remindersDelivered: number;
  zoomCardAccessCount: number;
  failedSecretRetrievals: number;
  webhookProcessingFailures: number;
}

export * from './types/remedialActions';

