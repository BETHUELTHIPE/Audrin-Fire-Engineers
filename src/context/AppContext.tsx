import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  ServiceItem,
  ServiceRequest,
  ContactEnquiry,
  EmailTemplate,
  EmailDeliveryLog,
  FAQItem,
  GalleryItem,
  HowWeWorkStep,
  AuditEvent,
  SystemMetrics,
  RequestStatus,
  SiteVisit,
  InternalNote,
  CustomerMessage,
  RequestAttachment,
  VoiceGuideData,
  VoiceGuideMetrics,
  VoiceConfiguration,
  ServiceVideo,
  VideoEvidenceMetrics,
  VideoReviewStatus,
  VideoTimestampMarker,
  ConditionReport,
  ReportPhotoSelection,
  ConditionReportMetrics,
  ConditionReportStatus,
  ClientReportAcknowledgement,
  TechnicalDocument,
  DocumentVersion,
  TechnicalDocumentCategory,
  DocumentEvidenceStage,
  ConfidentialityLevel,
  PermittedFileTypeConfig,
  QuarantinedFileRecord,
  DocumentSystemMetrics
} from '../types';
import {
  COMPANY_DETAILS,
  INITIAL_SERVICES,
  HOW_WE_WORK_STEPS,
  INITIAL_FAQS,
  INITIAL_GALLERY,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_DEMO_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VOICE_GUIDE,
  INITIAL_VOICE_METRICS,
  INITIAL_SERVICE_VIDEOS,
  INITIAL_VIDEO_METRICS,
  INITIAL_CONDITION_REPORTS,
  INITIAL_REPORT_PHOTOS,
  INITIAL_CONDITION_REPORT_METRICS,
  INITIAL_TECHNICAL_DOCUMENTS,
  INITIAL_QUARANTINED_FILES,
  INITIAL_DOCUMENT_METRICS
} from '../data/initialData';
import { INITIAL_PERMITTED_FILE_TYPES } from '../utils/fileTypes';
import { generateAutomatedReply, EmailGenerationInput } from '../services/emailAutomationEngine';
import {
  generatePreWorkConditionReport,
  generatePostWorkConditionReport,
  buildPreWorkEmail,
  buildPostWorkEmail,
  validatePreWorkReportEligibility,
  validatePostWorkReportEligibility,
  createNewReportVersion
} from '../services/conditionReportEngine';
import {
  executeDocumentProcessingPipeline,
  executeDocumentRevisionPipeline,
  DocumentUploadInput,
  DocumentRevisionInput,
  ProcessingResult
} from '../services/documentSecurityEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description: string;
}

interface AppContextType {
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  selectedServiceSlug: string | null;
  setSelectedServiceSlug: (slug: string | null) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;

  // Modals
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  preselectedServiceForModal: string | null;
  setPreselectedServiceForModal: (slug: string | null) => void;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  previewEmailLog: EmailDeliveryLog | null;
  setPreviewEmailLog: (log: EmailDeliveryLog | null) => void;

  // Voice AI Guide State
  isVoicePlayerOpen: boolean;
  setIsVoicePlayerOpen: (open: boolean) => void;
  activeVoiceStepNumber: number | null;
  setActiveVoiceStepNumber: (step: number | null) => void;
  voiceGuideData: VoiceGuideData;
  voiceMetrics: VoiceGuideMetrics;
  updateVoiceScript: (introText: string, steps: { stepNumber: number; title: string; narrationText: string }[], conclusionText: string) => void;
  updateVoiceConfig: (config: Partial<VoiceConfiguration>) => void;
  generateNewVoiceAudio: (voiceName?: string) => Promise<void>;
  publishVoiceVersion: (changeSummary: string) => void;
  rollbackVoiceVersion: (versionNumber: number) => void;
  recordVoiceMetric: (metricType: 'play' | 'complete' | 'step' | 'error', stepNum?: number) => void;

  // During-Work Video Evidence State
  serviceVideos: ServiceVideo[];
  videoMetrics: VideoEvidenceMetrics;
  selectedVideoForDetail: ServiceVideo | null;
  setSelectedVideoForDetail: (video: ServiceVideo | null) => void;
  isUploadVideoModalOpen: boolean;
  setIsUploadVideoModalOpen: (open: boolean) => void;
  preselectedRequestIdForVideo: string | null;
  setPreselectedRequestIdForVideo: (id: string | null) => void;
  uploadServiceVideo: (videoData: Partial<ServiceVideo>, videoFile?: File) => Promise<ServiceVideo>;
  reviewServiceVideo: (videoId: string, status: VideoReviewStatus, notes?: string, rejectionReason?: string, customerVisible?: boolean, includeInReport?: boolean) => void;
  addTimestampMarker: (videoId: string, marker: Omit<VideoTimestampMarker, 'id' | 'createdAt'>) => void;
  toggleTimestampReportApproval: (videoId: string, markerId: string) => void;
  deleteServiceVideo: (videoId: string) => void;
  lockVideoEvidence: (videoId: string) => void;

  // Automated Condition Reports State (Pre-Work & Post-Work)
  conditionReports: ConditionReport[];
  reportPhotos: ReportPhotoSelection[];
  conditionReportMetrics: ConditionReportMetrics;
  selectedReportForDetail: ConditionReport | null;
  setSelectedReportForDetail: (report: ConditionReport | null) => void;
  isSubmitBeforeWorkModalOpen: boolean;
  setIsSubmitBeforeWorkModalOpen: (open: boolean) => void;
  isSubmitPostWorkModalOpen: boolean;
  setIsSubmitPostWorkModalOpen: (open: boolean) => void;
  preselectedRequestIdForReport: string | null;
  setPreselectedRequestIdForReport: (id: string | null) => void;

  // Condition Report Actions
  triggerSubmitBeforeWorkEvidence: (requestId: string, photos: ReportPhotoSelection[], clientNotes?: string) => Promise<ConditionReport>;
  triggerSubmitPostWorkEvidence: (requestId: string, afterPhotos: ReportPhotoSelection[], duringPhotos: ReportPhotoSelection[], workActivities: string[]) => Promise<{ success: boolean; report?: ConditionReport; error?: string }>;
  acknowledgeConditionReport: (reportId: string, ackType: 'acknowledged_satisfied' | 'correction_requested' | 'post_work_concern' | 'disputed', notes?: string) => void;
  submitReportConcernOrDispute: (reportId: string, concernText: string, notes?: string) => void;
  createNewReportVersionManual: (reportId: string, reason: string, updatedPhotos: ReportPhotoSelection[]) => void;
  resendConditionReportEmail: (reportId: string) => void;
  uploadReportPhoto: (photoData: Partial<ReportPhotoSelection>) => ReportPhotoSelection;

  // Technical Document & Evidence Vault State
  technicalDocuments: TechnicalDocument[];
  permittedFileTypes: PermittedFileTypeConfig[];
  quarantinedFiles: QuarantinedFileRecord[];
  documentMetrics: DocumentSystemMetrics;
  selectedDocumentForDetail: TechnicalDocument | null;
  setSelectedDocumentForDetail: (doc: TechnicalDocument | null) => void;
  isUploadDocModalOpen: boolean;
  setIsUploadDocModalOpen: (open: boolean) => void;
  isRevisionModalOpen: boolean;
  setIsRevisionModalOpen: (open: boolean) => void;
  selectedDocForRevision: TechnicalDocument | null;
  setSelectedDocForRevision: (doc: TechnicalDocument | null) => void;
  preselectedRequestIdForDoc: string | null;
  setPreselectedRequestIdForDoc: (id: string | null) => void;

  // Technical Document Actions
  uploadTechnicalDocument: (input: DocumentUploadInput) => Promise<ProcessingResult>;
  submitDocumentRevision: (input: DocumentRevisionInput) => Promise<ProcessingResult>;
  reviewTechnicalDocument: (docId: string, decision: 'approved' | 'rejected' | 'requires_revision', notes?: string, rejectionReason?: string) => void;
  toggleDocumentCustomerVisibility: (docId: string, visible: boolean) => void;
  toggleDocumentReportInclusion: (docId: string, include: boolean) => void;
  updateDocumentCategory: (docId: string, newCategory: TechnicalDocumentCategory) => void;
  deleteUnreviewedDocument: (docId: string) => boolean;
  replaceUnreviewedDocument: (docId: string, newFile: File) => Promise<ProcessingResult>;
  restoreQuarantinedFile: (quarantineId: string) => void;
  purgeQuarantinedFile: (quarantineId: string) => void;
  updatePermittedFileType: (configId: string, updates: Partial<PermittedFileTypeConfig>) => void;
  requestMissingDocument: (requestId: string, category: TechnicalDocumentCategory, instructions: string) => void;
  generateSignedDownloadToken: (docId: string, versionId?: string) => { downloadUrl: string; expiresAt: string; token: string };
  exportDocumentRegisterCSV: () => string;

  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: 'customer' | 'staff' | 'admin' | 'superadmin') => void;
  logout: () => void;
  registerUser: (name: string, email: string, orgName: string, phone: string) => User;

  // Data Collections
  services: ServiceItem[];
  howWeWorkSteps: HowWeWorkStep[];
  faqs: FAQItem[];
  galleryItems: GalleryItem[];
  serviceRequests: ServiceRequest[];
  contactEnquiries: ContactEnquiry[];
  emailTemplates: EmailTemplate[];
  emailDeliveryLogs: EmailDeliveryLog[];
  auditLogs: AuditEvent[];
  systemMetrics: SystemMetrics;

  // Actions
  submitServiceRequest: (formData: any) => Promise<ServiceRequest>;
  submitContactEnquiry: (formData: any) => Promise<ContactEnquiry>;
  updateRequestStatus: (requestId: string, newStatus: RequestStatus, noteText?: string) => void;
  assignStaffToRequest: (requestId: string, staffName: string, staffEmail: string) => void;
  scheduleSiteVisit: (requestId: string, visit: Omit<SiteVisit, 'id' | 'createdAt'>) => void;
  addInternalNote: (requestId: string, content: string, priority?: 'low' | 'normal' | 'high') => void;
  addCustomerMessage: (requestId: string, content: string) => void;
  addRequestAttachment: (requestId: string, attachment: Omit<RequestAttachment, 'id' | 'uploadedAt'>) => void;
  
  // CMS Updates
  updateService: (updated: ServiceItem) => void;
  toggleServiceActive: (id: string) => void;
  updateFAQ: (updated: FAQItem) => void;
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  deleteFAQ: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  toggleGalleryActive: (id: string) => void;
  updateEmailTemplate: (updated: EmailTemplate) => void;
  testSendEmailTemplate: (templateId: string, testRecipient: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [preselectedServiceForModal, setPreselectedServiceForModal] = useState<string | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [previewEmailLog, setPreviewEmailLog] = useState<EmailDeliveryLog | null>(null);

  // Auth User (Default demo admin/customer switcher)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-admin-01',
    email: 'bethuelmoukangwe8@gmail.com',
    fullName: 'Bethuel Moukangwe',
    role: 'superadmin',
    organisationName: 'Audrin Fire Engineers (Pty) Ltd',
    phone: '071 415 6665',
    isVerified: true,
    createdAt: '2026-08-01T08:00:00Z'
  });

  // Collections State
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [howWeWorkSteps, setHowWeWorkSteps] = useState<HowWeWorkStep[]>(HOW_WE_WORK_STEPS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(INITIAL_DEMO_REQUESTS);
  const [contactEnquiries, setContactEnquiries] = useState<ContactEnquiry[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(INITIAL_EMAIL_TEMPLATES);
  const [emailDeliveryLogs, setEmailDeliveryLogs] = useState<EmailDeliveryLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

  // Voice AI Guide State
  const [isVoicePlayerOpen, setIsVoicePlayerOpen] = useState<boolean>(false);
  const [activeVoiceStepNumber, setActiveVoiceStepNumber] = useState<number | null>(null);
  const [voiceGuideData, setVoiceGuideData] = useState<VoiceGuideData>(INITIAL_VOICE_GUIDE);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceGuideMetrics>(INITIAL_VOICE_METRICS);

  // During-Work Video Evidence State
  const [serviceVideos, setServiceVideos] = useState<ServiceVideo[]>(INITIAL_SERVICE_VIDEOS);
  const [videoMetrics, setVideoMetrics] = useState<VideoEvidenceMetrics>(INITIAL_VIDEO_METRICS);
  const [selectedVideoForDetail, setSelectedVideoForDetail] = useState<ServiceVideo | null>(null);
  const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState<boolean>(false);
  const [preselectedRequestIdForVideo, setPreselectedRequestIdForVideo] = useState<string | null>(null);

  // Automated Condition Reports State
  const [conditionReports, setConditionReports] = useState<ConditionReport[]>(INITIAL_CONDITION_REPORTS);
  const [reportPhotos, setReportPhotos] = useState<ReportPhotoSelection[]>(INITIAL_REPORT_PHOTOS);
  const [conditionReportMetrics, setConditionReportMetrics] = useState<ConditionReportMetrics>(INITIAL_CONDITION_REPORT_METRICS);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<ConditionReport | null>(null);
  const [isSubmitBeforeWorkModalOpen, setIsSubmitBeforeWorkModalOpen] = useState<boolean>(false);
  const [isSubmitPostWorkModalOpen, setIsSubmitPostWorkModalOpen] = useState<boolean>(false);
  const [preselectedRequestIdForReport, setPreselectedRequestIdForReport] = useState<string | null>(null);

  // Technical Document & Evidence Vault State
  const [technicalDocuments, setTechnicalDocuments] = useState<TechnicalDocument[]>(INITIAL_TECHNICAL_DOCUMENTS);
  const [permittedFileTypes, setPermittedFileTypes] = useState<PermittedFileTypeConfig[]>(INITIAL_PERMITTED_FILE_TYPES);
  const [quarantinedFiles, setQuarantinedFiles] = useState<QuarantinedFileRecord[]>(INITIAL_QUARANTINED_FILES);
  const [documentMetrics, setDocumentMetrics] = useState<DocumentSystemMetrics>(INITIAL_DOCUMENT_METRICS);
  const [selectedDocumentForDetail, setSelectedDocumentForDetail] = useState<TechnicalDocument | null>(null);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [selectedDocForRevision, setSelectedDocForRevision] = useState<TechnicalDocument | null>(null);
  const [preselectedRequestIdForDoc, setPreselectedRequestIdForDoc] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, description: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditLog = (action: string, model: string, recordId: string, details: string) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}`,
      actor: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Anonymous Guest',
      action,
      model,
      recordId,
      details,
      ipAddress: '105.22.140.8',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: 'customer' | 'staff' | 'admin' | 'superadmin') => {
    if (role === 'customer') {
      setCurrentUser({
        id: 'usr-cust-01',
        email: 'marcus.n@tshwanelogistics.co.za',
        fullName: 'Marcus Ndlovu',
        role: 'customer',
        organisationId: 'org-01',
        organisationName: 'Tshwane Logistics Park',
        phone: '082 555 1290',
        isVerified: true,
        createdAt: '2026-08-28T09:00:00Z'
      });
      showToast('info', 'Switched to Customer Account', 'Logged in as Marcus Ndlovu (Tshwane Logistics Park).');
    } else if (role === 'staff') {
      setCurrentUser({
        id: 'usr-staff-01',
        email: 'field.tech@audrinfire.co.za',
        fullName: 'Thabo Mokoena',
        role: 'staff',
        organisationName: 'Audrin Fire Engineers',
        phone: '071 415 6665',
        isVerified: true,
        createdAt: '2026-08-15T08:00:00Z'
      });
      showToast('info', 'Switched to Field Staff Account', 'Logged in as Thabo Mokoena (Lead Field Technician).');
    } else if (role === 'admin' || role === 'superadmin') {
      setCurrentUser({
        id: 'usr-admin-01',
        email: 'bethuelmoukangwe8@gmail.com',
        fullName: 'Bethuel Moukangwe',
        role: 'superadmin',
        organisationName: 'Audrin Fire Engineers (Pty) Ltd',
        phone: '071 415 6665',
        isVerified: true,
        createdAt: '2026-08-01T08:00:00Z'
      });
      showToast('info', 'Switched to Super Administrator', 'Full access to Django admin, service tickets, and email engine.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('info', 'Logged Out', 'You have been safely logged out.');
  };

  const registerUser = (name: string, email: string, orgName: string, phone: string): User => {
    const newUser: User = {
      id: `usr-cust-${Date.now()}`,
      email,
      fullName: name,
      role: 'customer',
      organisationName: orgName,
      phone,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    addAuditLog('REGISTER', 'User', newUser.id, `New customer registration: ${name} (${orgName})`);
    showToast('success', 'Account Registered', `Welcome ${name}! You can now submit and track fire-detection service requests.`);
    return newUser;
  };

  // Submit Service Request with automated Celery/Email trigger
  const submitServiceRequest = async (formData: any): Promise<ServiceRequest> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNum = `AFE-REQ-2026-${randomSuffix}`;
    const matchedService = services.find(s => s.slug === formData.serviceSlug);

    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      referenceNumber: refNum,
      customerId: currentUser?.id,
      customerName: formData.fullName || currentUser?.fullName || 'Client Representative',
      organisationName: formData.organisationName || currentUser?.organisationName || 'Commercial Client',
      email: formData.email || currentUser?.email || 'client@example.co.za',
      phone: formData.phone || currentUser?.phone || '071 415 6665',
      preferredContactMethod: formData.preferredContactMethod || 'email',

      siteName: formData.siteName || 'Commercial Premises',
      streetAddress: formData.streetAddress || '',
      city: formData.city || 'Pretoria',
      province: formData.province || 'Gauteng',
      postalCode: formData.postalCode || '0008',
      buildingType: formData.buildingType || 'Commercial Office Building',
      approximateBuildingSize: formData.approximateBuildingSize || '',
      numberOfFloors: Number(formData.numberOfFloors) || 1,

      serviceSlug: formData.serviceSlug || 'fire-detection-site-surveys',
      serviceTitle: matchedService?.title || 'Fire-Detection Service Scope',
      systemType: formData.systemType || 'Addressable Fire Alarm System',
      panelMakeModel: formData.panelMakeModel || 'To be identified on site',
      zonesOrLoopsCount: formData.zonesOrLoopsCount || '',
      existingFaultOrRequirement: formData.existingFaultOrRequirement || formData.message || 'Fire-detection service request',
      urgency: formData.urgency || 'standard',
      preferredSiteVisitDate: formData.preferredSiteVisitDate,
      additionalInformation: formData.additionalInformation || '',

      status: formData.urgency === 'urgent_emergency' ? 'Submitted' : 'Submitted',
      assignedStaff: 'Bethuel Moukangwe',
      assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      attachments: formData.attachments || [],
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'Submitted',
          changedBy: 'Client Web Submission',
          timestamp: new Date().toISOString(),
          notes: formData.urgency === 'urgent_emergency' 
            ? 'Urgent Fire-Alarm Fault ticket submitted with high priority.'
            : 'Service request registered via online portal.',
          visibleToCustomer: true
        }
      ],
      siteVisits: [],
      internalNotes: [],
      customerMessages: []
    };

    setServiceRequests(prev => [newRequest, ...prev]);

    // 1. Asynchronously Trigger Email Automation Engine (Simulating Celery Task)
    const emailInput: EmailGenerationInput = {
      clientName: newRequest.customerName,
      organisationName: newRequest.organisationName,
      clientEmail: newRequest.email,
      clientPhone: newRequest.phone,
      requestReference: newRequest.referenceNumber,
      selectedServiceSlug: newRequest.serviceSlug,
      buildingType: newRequest.buildingType,
      panelModel: newRequest.panelMakeModel,
      urgency: newRequest.urgency,
      siteName: newRequest.siteName,
      message: newRequest.existingFaultOrRequirement
    };

    const replyResult = generateAutomatedReply(emailInput, services, howWeWorkSteps);

    const deliveryLog: EmailDeliveryLog = {
      id: `eml-${Date.now()}`,
      idempotencyKey: replyResult.idempotencyKey,
      recipient: newRequest.email,
      subject: replyResult.subject,
      category: replyResult.classification,
      relatedReferenceNumber: newRequest.referenceNumber,
      deliveryStatus: replyResult.requiresHumanReview ? 'Human Review Required' : 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: replyResult.htmlBody,
      plainTextBody: replyResult.plainTextBody,
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [deliveryLog, ...prev]);

    // 2. Add Audit Log
    addAuditLog(
      'CREATE_SERVICE_REQUEST',
      'ServiceRequest',
      newRequest.referenceNumber,
      `Service request created for ${newRequest.siteName} (${newRequest.serviceTitle}) [Urgency: ${newRequest.urgency}]`
    );

    showToast(
      'success',
      'Request Registered Successfully',
      `Reference: ${newRequest.referenceNumber}. Automated acknowledgment sent to ${newRequest.email}.`
    );

    return newRequest;
  };

  // Submit Contact Enquiry
  const submitContactEnquiry = async (formData: any): Promise<ContactEnquiry> => {
    const refNum = `AFE-ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry: ContactEnquiry = {
      id: `enq-${Date.now()}`,
      referenceNumber: refNum,
      fullName: formData.fullName,
      companyOrOrganisation: formData.companyOrOrganisation || '',
      email: formData.email,
      telephone: formData.telephone,
      preferredContactMethod: formData.preferredContactMethod || 'email',
      subject: formData.subject || 'General Fire-Detection Consultation',
      message: formData.message,
      popiaConsentAccepted: formData.popiaConsentAccepted || true,
      popiaConsentTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'New',
      isEmergencyFault: formData.isEmergencyFault || false
    };

    setContactEnquiries(prev => [newEnquiry, ...prev]);

    // Trigger Email reply
    const emailInput: EmailGenerationInput = {
      clientName: newEnquiry.fullName,
      organisationName: newEnquiry.companyOrOrganisation,
      clientEmail: newEnquiry.email,
      clientPhone: newEnquiry.telephone,
      requestReference: newEnquiry.referenceNumber,
      subject: newEnquiry.subject,
      message: newEnquiry.message,
      urgency: newEnquiry.isEmergencyFault ? 'urgent_emergency' : 'standard'
    };

    const reply = generateAutomatedReply(emailInput, services, howWeWorkSteps);

    const log: EmailDeliveryLog = {
      id: `eml-enq-${Date.now()}`,
      idempotencyKey: reply.idempotencyKey,
      recipient: newEnquiry.email,
      subject: reply.subject,
      category: reply.classification,
      relatedReferenceNumber: newEnquiry.referenceNumber,
      deliveryStatus: reply.requiresHumanReview ? 'Human Review Required' : 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: reply.htmlBody,
      plainTextBody: reply.plainTextBody,
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [log, ...prev]);

    addAuditLog('CREATE_ENQUIRY', 'ContactEnquiry', newEnquiry.referenceNumber, `Contact submission from ${newEnquiry.fullName}`);
    showToast('success', 'Enquiry Received', `Reference: ${newEnquiry.referenceNumber}. A confirmation email has been dispatched.`);

    return newEnquiry;
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus, noteText?: string) => {
    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        const historyItem = {
          id: `sh-${Date.now()}`,
          status: newStatus,
          changedBy: currentUser ? currentUser.fullName : 'Administrator',
          timestamp: new Date().toISOString(),
          notes: noteText || `Status updated to ${newStatus}`,
          visibleToCustomer: true
        };

        const updated = {
          ...req,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusHistory: [historyItem, ...req.statusHistory]
        };

        addAuditLog('UPDATE_STATUS', 'ServiceRequest', req.referenceNumber, `Status changed to ${newStatus}`);
        return updated;
      }
      return req;
    }));

    showToast('success', 'Status Updated', `Request status updated to "${newStatus}".`);
  };

  const assignStaffToRequest = (requestId: string, staffName: string, staffEmail: string) => {
    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        addAuditLog('ASSIGN_STAFF', 'ServiceRequest', req.referenceNumber, `Assigned to ${staffName}`);
        return {
          ...req,
          assignedStaff: staffName,
          assignedStaffEmail: staffEmail,
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));
    showToast('info', 'Staff Assigned', `Assigned ${staffName} to request.`);
  };

  const scheduleSiteVisit = (requestId: string, visitData: Omit<SiteVisit, 'id' | 'createdAt'>) => {
    const newVisit: SiteVisit = {
      ...visitData,
      id: `sv-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        return {
          ...req,
          status: 'Site survey scheduled',
          siteVisits: [newVisit, ...req.siteVisits],
          updatedAt: new Date().toISOString(),
          statusHistory: [
            {
              id: `sh-${Date.now()}`,
              status: 'Site survey scheduled',
              changedBy: currentUser?.fullName || 'Operations Manager',
              timestamp: new Date().toISOString(),
              notes: `Site visit scheduled for ${visitData.scheduledDate} (${visitData.scheduledTimeWindow}) with technician ${visitData.technicianName}.`,
              visibleToCustomer: true
            },
            ...req.statusHistory
          ]
        };
      }
      return req;
    }));

    addAuditLog('SCHEDULE_SITE_VISIT', 'SiteVisit', requestId, `Site visit booked for ${visitData.scheduledDate}`);
    showToast('success', 'Site Visit Scheduled', `Visit confirmed for ${visitData.scheduledDate}. Customer notified.`);
  };

  const addInternalNote = (requestId: string, content: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    const note: InternalNote = {
      id: `in-${Date.now()}`,
      authorName: currentUser?.fullName || 'Staff Member',
      content,
      createdAt: new Date().toISOString(),
      priority
    };

    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        return {
          ...req,
          internalNotes: [note, ...req.internalNotes],
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    addAuditLog('ADD_INTERNAL_NOTE', 'ServiceRequest', requestId, `Internal note added by ${note.authorName}`);
    showToast('info', 'Internal Note Saved', 'Confidential staff note added.');
  };

  const addCustomerMessage = (requestId: string, content: string) => {
    const msg: CustomerMessage = {
      id: `cm-${Date.now()}`,
      senderName: currentUser?.fullName || 'Audrin Fire Support',
      senderRole: (currentUser?.role === 'customer' ? 'customer' : 'staff'),
      content,
      timestamp: new Date().toISOString()
    };

    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        return {
          ...req,
          customerMessages: [...req.customerMessages, msg],
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    showToast('success', 'Message Sent', 'Message posted to the request communication thread.');
  };

  const addRequestAttachment = (requestId: string, attachmentData: Omit<RequestAttachment, 'id' | 'uploadedAt'>) => {
    const attachment: RequestAttachment = {
      ...attachmentData,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    setServiceRequests(prev => prev.map(req => {
      if (req.id === requestId || req.referenceNumber === requestId) {
        return {
          ...req,
          attachments: [attachment, ...req.attachments],
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    addAuditLog('UPLOAD_ATTACHMENT', 'RequestAttachment', requestId, `File uploaded: ${attachment.fileName} (${attachment.isInternalOnly ? 'Internal' : 'Customer Visible'})`);
    showToast('success', 'Document Attached', `${attachment.fileName} has been safely saved.`);
  };

  // CMS Updates
  const updateService = (updated: ServiceItem) => {
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAuditLog('UPDATE_SERVICE', 'ServiceItem', updated.slug, `Updated service details: ${updated.title}`);
    showToast('success', 'Service Updated', `Changes to "${updated.title}" have been saved.`);
  };

  const toggleServiceActive = (id: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        addAuditLog('TOGGLE_SERVICE', 'ServiceItem', s.slug, `Service ${s.title} active status set to ${nextState}`);
        return { ...s, isActive: nextState };
      }
      return s;
    }));
  };

  const updateFAQ = (updated: FAQItem) => {
    setFaqs(prev => prev.map(f => f.id === updated.id ? updated : f));
    addAuditLog('UPDATE_FAQ', 'FAQItem', updated.id, `FAQ updated`);
    showToast('success', 'FAQ Saved', 'FAQ item updated successfully.');
  };

  const addFAQ = (faqData: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = {
      ...faqData,
      id: `faq-${Date.now()}`
    };
    setFaqs(prev => [...prev, newFaq]);
    addAuditLog('CREATE_FAQ', 'FAQItem', newFaq.id, `Created FAQ: ${newFaq.question}`);
    showToast('success', 'FAQ Added', 'New FAQ published to the knowledge base.');
  };

  const deleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    addAuditLog('DELETE_FAQ', 'FAQItem', id, `Deleted FAQ`);
    showToast('info', 'FAQ Removed', 'FAQ item deleted.');
  };

  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`
    };
    setGalleryItems(prev => [newItem, ...prev]);
    addAuditLog('CREATE_GALLERY', 'GalleryItem', newItem.id, `Added gallery item: ${newItem.title}`);
    showToast('success', 'Gallery Image Added', 'New technical image published.');
  };

  const toggleGalleryActive = (id: string) => {
    setGalleryItems(prev => prev.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  const updateEmailTemplate = (updated: EmailTemplate) => {
    setEmailTemplates(prev => prev.map(t => t.id === updated.id ? { ...updated, version: updated.version + 1, updatedAt: new Date().toISOString() } : t));
    addAuditLog('UPDATE_EMAIL_TEMPLATE', 'EmailTemplate', updated.name, `Updated email template version to ${updated.version + 1}`);
    showToast('success', 'Template Saved', `Template "${updated.name}" version incremented.`);
  };

  const testSendEmailTemplate = (templateId: string, testRecipient: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    const testLog: EmailDeliveryLog = {
      id: `eml-test-${Date.now()}`,
      idempotencyKey: `test_${template.id}_${Date.now()}`,
      recipient: testRecipient || 'bethuelmoukangwe8@gmail.com',
      subject: `[TEST] ${template.subjectTemplate.replace('{{request_reference}}', 'AFE-TEST-0001').replace('{{client_name}}', 'Test Client')}`,
      category: template.category,
      relatedReferenceNumber: 'AFE-TEST-0001',
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: template.htmlBodyTemplate
        .replace(/{{client_name}}/g, 'Test Client')
        .replace(/{{request_reference}}/g, 'AFE-TEST-0001')
        .replace(/{{site_name}}/g, 'Sample Commercial Office')
        .replace(/{{request_summary}}/g, 'Test Fire-Alarm System Evaluation')
        .replace(/{{panel_model}}/g, 'Addressable Control Panel')
        .replace(/{{client_phone}}/g, '071 415 6665'),
      plainTextBody: template.plainTextBodyTemplate
        .replace(/{{client_name}}/g, 'Test Client')
        .replace(/{{request_reference}}/g, 'AFE-TEST-0001'),
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [testLog, ...prev]);
    showToast('success', 'Test Email Dispatched', `Test email sent to ${testRecipient}. View in Email Logs.`);
  };

  // -------------------------------------------------------------
  // VOICE AI GUIDE ACTIONS (Django Admin & Celery Backend)
  // -------------------------------------------------------------

  const updateVoiceScript = (
    introText: string,
    steps: { stepNumber: number; title: string; narrationText: string }[],
    conclusionText: string
  ) => {
    setVoiceGuideData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        text: introText
      },
      steps: prev.steps.map(s => {
        const matching = steps.find(item => item.stepNumber === s.stepNumber);
        if (matching) {
          return {
            ...s,
            title: matching.title,
            narrationText: matching.narrationText
          };
        }
        return s;
      }),
      conclusion: {
        ...prev.conclusion,
        text: conclusionText
      },
      publicationStatus: 'draft'
    }));

    addAuditLog('UPDATE_VOICE_SCRIPT', 'VoiceGuideData', voiceGuideData.id, 'Narration script edited. Status shifted to Draft.');
    showToast('info', 'Voice Script Draft Saved', 'Narration text updated. Re-generate audio to publish changes.');
  };

  const updateVoiceConfig = (config: Partial<VoiceConfiguration>) => {
    setVoiceGuideData(prev => ({
      ...prev,
      voiceConfig: {
        ...prev.voiceConfig,
        ...config
      },
      publicationStatus: 'draft'
    }));
    showToast('info', 'Voice Configuration Updated', `Voice set to ${config.displayName || config.voiceName || 'custom'}.`);
  };

  const generateNewVoiceAudio = async (voiceName?: string) => {
    showToast('info', 'Celery TTS Task Queued', 'Dispatching audio generation worker job...');

    const taskId = `celery-tts-${Date.now()}`;
    const newJob = {
      jobId: `job-${Date.now()}`,
      celeryTaskId: taskId,
      status: 'processing' as const,
      durationSeconds: 2.8,
      timestamp: new Date().toISOString()
    };

    setVoiceGuideData(prev => ({
      ...prev,
      generationJobs: [newJob, ...prev.generationJobs]
    }));

    // Simulate Celery worker execution
    await new Promise(resolve => setTimeout(resolve, 1400));

    setVoiceGuideData(prev => {
      const nextVersion = prev.version + 1;
      const effectiveVoice = voiceName || prev.voiceConfig.voiceName;
      const completedJob = { ...newJob, status: 'completed' as const };

      return {
        ...prev,
        version: nextVersion,
        publicationStatus: 'published',
        lastGeneratedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        publishedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'System Administrator',
        generationJobs: [completedJob, ...prev.generationJobs.slice(1)],
        versionHistory: [
          {
            version: nextVersion,
            publishedAt: new Date().toISOString(),
            publishedBy: currentUser?.fullName || 'System',
            changeSummary: `Re-generated audio stream with ${effectiveVoice}.`,
            voiceName: effectiveVoice,
            status: 'published'
          },
          ...prev.versionHistory.map(vh => ({ ...vh, status: 'superseded' as const }))
        ]
      };
    });

    setVoiceMetrics(prev => ({
      ...prev,
      audioGenerationSuccesses: prev.audioGenerationSuccesses + 1
    }));

    addAuditLog('GENERATE_VOICE_AUDIO', 'VoiceGuideData', voiceGuideData.id, `Celery worker synthesized narration audio.`);
    showToast('success', 'Voice Audio Generated', 'New audio stream compiled and published successfully.');
  };

  const publishVoiceVersion = (changeSummary: string) => {
    setVoiceGuideData(prev => {
      const nextVersion = prev.version + 1;
      return {
        ...prev,
        version: nextVersion,
        publicationStatus: 'published',
        publishedAt: new Date().toISOString(),
        publishedBy: currentUser?.fullName || 'Admin',
        versionHistory: [
          {
            version: nextVersion,
            publishedAt: new Date().toISOString(),
            publishedBy: currentUser?.fullName || 'Admin',
            changeSummary,
            voiceName: prev.voiceConfig.voiceName,
            status: 'published'
          },
          ...prev.versionHistory.map(vh => ({ ...vh, status: 'superseded' as const }))
        ]
      };
    });
    addAuditLog('PUBLISH_VOICE_VERSION', 'VoiceGuideData', voiceGuideData.id, `Published version: ${changeSummary}`);
    showToast('success', 'Voice Guide Published', 'Changes are now live on the homepage player.');
  };

  const rollbackVoiceVersion = (versionNumber: number) => {
    const historical = voiceGuideData.versionHistory.find(v => v.version === versionNumber);
    if (!historical) return;

    setVoiceGuideData(prev => ({
      ...prev,
      version: versionNumber,
      publicationStatus: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser?.fullName || 'Admin'
    }));

    addAuditLog('ROLLBACK_VOICE_VERSION', 'VoiceGuideData', voiceGuideData.id, `Rolled back to v${versionNumber}`);
    showToast('warning', 'Version Rolled Back', `Restored voice guide configuration v${versionNumber}.`);
  };

  const recordVoiceMetric = (metricType: 'play' | 'complete' | 'step' | 'error', stepNum?: number) => {
    setVoiceMetrics(prev => {
      if (metricType === 'play') {
        return { ...prev, playCount: prev.playCount + 1 };
      }
      if (metricType === 'complete') {
        return { ...prev, completedNarrations: prev.completedNarrations + 1 };
      }
      if (metricType === 'error') {
        return { ...prev, playbackErrors: prev.playbackErrors + 1 };
      }
      if (metricType === 'step' && stepNum !== undefined) {
        return {
          ...prev,
          stepSelections: {
            ...prev.stepSelections,
            [stepNum]: (prev.stepSelections[stepNum] || 0) + 1
          }
        };
      }
      return prev;
    });
  };

  // -------------------------------------------------------------
  // DURING-WORK VIDEO EVIDENCE ACTIONS (FFmpeg & Celery)
  // -------------------------------------------------------------

  const uploadServiceVideo = async (
    videoData: Partial<ServiceVideo>,
    videoFile?: File
  ): Promise<ServiceVideo> => {
    const randomRef = `AFE-VID-2026-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const matchedReq = serviceRequests.find(r => r.id === videoData.serviceRequestId || r.referenceNumber === videoData.serviceRequestRef);

    const fileSize = videoFile ? videoFile.size : (videoData.fileSize || 15400000);
    const fileSizeFormatted = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;

    const newVideo: ServiceVideo = {
      id: `vid-${Date.now()}`,
      referenceNumber: randomRef,
      serviceRequestId: videoData.serviceRequestId || matchedReq?.id || 'req-gen',
      serviceRequestRef: videoData.serviceRequestRef || matchedReq?.referenceNumber || 'AFE-REQ-2026-0104',
      siteName: videoData.siteName || matchedReq?.siteName || 'Commercial Site Premises',
      siteAreaOrRoom: videoData.siteAreaOrRoom || 'Zone Plant / Riser Corridor',
      equipmentReference: videoData.equipmentReference || 'Optical Fire Alarm Sensor / Relay Module',
      clientId: currentUser?.id || matchedReq?.customerId || 'usr-cust-01',
      clientName: videoData.clientName || currentUser?.fullName || matchedReq?.customerName || 'Client Representative',
      organisationName: videoData.organisationName || currentUser?.organisationName || matchedReq?.organisationName || 'Client Organisation',
      uploadedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Client Representative',
      uploaderRole: (currentUser?.role === 'staff' ? 'staff' : currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? 'admin' : 'customer'),
      originalFileName: videoFile?.name || videoData.originalFileName || 'evidence_recording.mp4',
      secureStoredFileName: `secure_${randomRef.toLowerCase().replace(/-/g, '_')}_transcoded.mp4`,
      mimeType: videoFile?.type || videoData.mimeType || 'video/mp4',
      fileSize,
      fileSizeFormatted,
      duration: videoData.duration || 32,
      dateRecorded: videoData.dateRecorded || new Date().toISOString().split('T')[0],
      uploadTimestamp: new Date().toISOString(),
      title: videoData.title || 'Service Inspection Video Evidence',
      description: videoData.description || 'Recorded technical evidence during fire-alarm inspection and testing.',
      category: videoData.category || 'during_work_progress',
      workStage: videoData.workStage || 'Inspection & Testing',
      reviewStatus: 'awaiting_review',
      customerVisibleStatus: 'Client-submitted video evidence — awaiting review',
      isCustomerVisible: true,
      includedInReport: false,
      isLockedAfterReport: false,
      privacyConsentAccepted: true,
      privacyConsentTimestamp: new Date().toISOString(),
      videoUrl: videoData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: videoData.thumbnailUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      signedUrlExpiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      timestampMarkers: [],
      processingJob: {
        jobId: `job-proc-${Date.now()}`,
        celeryTaskId: `celery-ffmpeg-${Date.now()}`,
        status: 'completed',
        progressPercentage: 100,
        sha256Hash: '7d4a2e8c56f9b103a89e4c19d453b708e9a2f6c01e9987da12b98e1f5a432b01',
        malwareScanStatus: 'clean',
        ffmpegTranscodeStatus: 'completed',
        extractedMetadata: {
          codec: 'h264 (High Profile)',
          width: 1920,
          height: 1080,
          fps: 30,
          durationSec: 32,
          audioChannels: 2,
          bitrateKbps: 3800
        },
        processingLogs: [
          '[Celery-Worker] Task received: process_video_evidence_job',
          '[Security] SHA-256 computed and recorded',
          '[ClamAV Engine] Malware scan clean: 0 signatures flagged',
          '[FFmpeg] Transcoded to baseline H.264 MP4 with faststart flags: OK',
          '[FFmpeg] Extracted reference preview poster thumbnail: OK',
          '[Storage] Secured in private encrypted bucket storage: OK'
        ],
        completedAt: new Date().toISOString()
      },
      accessLogs: [
        {
          id: `acc-${Date.now()}`,
          userId: currentUser?.id || 'usr-cust-01',
          userName: currentUser?.fullName || 'Client User',
          userRole: currentUser?.role || 'customer',
          action: 'UPLOAD_COMPLETED',
          timestamp: new Date().toISOString(),
          ipAddress: '105.22.140.12'
        }
      ]
    };

    setServiceVideos(prev => [newVideo, ...prev]);

    // Update Video Metrics
    setVideoMetrics(prev => ({
      ...prev,
      uploadsStarted: prev.uploadsStarted + 1,
      uploadsCompleted: prev.uploadsCompleted + 1,
      processingSuccesses: prev.processingSuccesses + 1,
      totalStorageBytes: prev.totalStorageBytes + fileSize,
      videosAwaitingReview: prev.videosAwaitingReview + 1
    }));

    // Trigger Automated Email Acknowledgement for Video Upload
    const emailRecipient = matchedReq?.email || currentUser?.email || 'bethuelmoukangwe8@gmail.com';
    const emailClientName = matchedReq?.customerName || currentUser?.fullName || 'Valued Client';
    const reqRef = matchedReq?.referenceNumber || newVideo.serviceRequestRef;

    const emailLog: EmailDeliveryLog = {
      id: `eml-vid-${Date.now()}`,
      idempotencyKey: `vid_ack_${newVideo.id}`,
      recipient: emailRecipient,
      subject: `[AUDRIN FIRE] Video Evidence Acknowledged: Ref ${newVideo.referenceNumber} (${reqRef})`,
      category: 'video_upload_acknowledgement',
      relatedReferenceNumber: reqRef,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background-color: #0A192F; padding: 20px; text-align: left; border-bottom: 4px solid #CC0000;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">AUDRIN FIRE ENGINEERS (PTY) LTD</h2>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Commercial & Non-Domestic Fire-Detection Services (SANS 10139)</p>
          </div>
          <div style="padding: 24px 20px; background-color: #ffffff; border: 1px solid #e2e8f0;">
            <p style="font-size: 15px; margin-top: 0;">Dear ${emailClientName},</p>
            <p>Thank you for submitting technical video evidence for service request <strong>${reqRef}</strong>.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0A192F; padding: 14px 16px; margin: 18px 0;">
              <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 14px;">Video Evidence Details:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">
                <li><strong>Video Reference:</strong> ${newVideo.referenceNumber}</li>
                <li><strong>Title:</strong> ${newVideo.title}</li>
                <li><strong>Site Location:</strong> ${newVideo.siteName} (${newVideo.siteAreaOrRoom})</li>
                <li><strong>Processing Status:</strong> Transcoded & Security-Verified (Clean)</li>
                <li><strong>Current Review Status:</strong> Client-submitted video evidence — awaiting review</li>
              </ul>
            </div>

            <p style="font-size: 14px;"><strong>Next Action:</strong></p>
            <p style="font-size: 13px; color: #475569;">Our engineering desk will review the video against applicable SANS 10139 technical considerations and correlate it with on-site inspection logs. You can monitor review progress directly in your secure client portal.</p>

            <div style="margin: 22px 0;">
              <a href="#" style="background-color: #CC0000; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">Open Client Portal Dashboard</a>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              Audrin Fire Engineers (Pty) Ltd | 27 Tshivhase Street, Pretoria West, 0008<br/>
              Tel: 071 415 6665 | Operating Hours: Mon–Sun 07:00–20:00
            </p>
          </div>
        </div>
      `,
      plainTextBody: `AUDRIN FIRE ENGINEERS - VIDEO EVIDENCE ACKNOWLEDGEMENT\n\nDear ${emailClientName},\n\nYour video evidence "${newVideo.title}" for request ${reqRef} has been successfully uploaded and processed.\n\nVideo Ref: ${newVideo.referenceNumber}\nStatus: Client-submitted video evidence — awaiting review\n\nOur engineering desk will review the evidence. Log into your customer portal to view real-time status updates.\n\nAudrin Fire Engineers (Pty) Ltd | 071 415 6665`,
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [emailLog, ...prev]);

    addAuditLog('UPLOAD_VIDEO_EVIDENCE', 'ServiceVideo', newVideo.referenceNumber, `Uploaded video: ${newVideo.title} (${newVideo.fileSizeFormatted})`);
    showToast('success', 'Video Evidence Processed', `Video ${newVideo.referenceNumber} uploaded and verified clean.`);

    return newVideo;
  };

  const reviewServiceVideo = (
    videoId: string,
    status: VideoReviewStatus,
    notes?: string,
    rejectionReason?: string,
    customerVisible: boolean = true,
    includeInReport: boolean = false
  ) => {
    let customerVisibleStatus: any = 'Client-submitted video evidence — awaiting review';
    if (status === 'approved') customerVisibleStatus = 'Approved by Audrin Engineering';
    if (status === 'rejected') customerVisibleStatus = 'Rejected — See notes';
    if (status === 'more_info_required') customerVisibleStatus = 'Additional evidence requested';
    if (status === 'included_in_report' || includeInReport) customerVisibleStatus = 'Included in Final Report';

    setServiceVideos(prev => prev.map(v => {
      if (v.id === videoId || v.referenceNumber === videoId) {
        return {
          ...v,
          reviewStatus: status,
          customerVisibleStatus,
          isCustomerVisible: customerVisible,
          includedInReport: includeInReport || status === 'included_in_report',
          internalNotes: notes || v.internalNotes,
          rejectionReason: rejectionReason || v.rejectionReason,
          reviewedBy: currentUser?.fullName || 'Bethuel Moukangwe',
          reviewTimestamp: new Date().toISOString(),
          accessLogs: [
            {
              id: `acc-${Date.now()}`,
              userId: currentUser?.id || 'usr-admin-01',
              userName: currentUser?.fullName || 'Admin',
              userRole: currentUser?.role || 'superadmin',
              action: `SET_REVIEW_STATUS_${status.toUpperCase()}`,
              timestamp: new Date().toISOString(),
              ipAddress: '197.185.12.8'
            },
            ...v.accessLogs
          ]
        };
      }
      return v;
    }));

    addAuditLog('REVIEW_VIDEO_EVIDENCE', 'ServiceVideo', videoId, `Review status set to ${status}. Visible: ${customerVisible}`);
    showToast('info', 'Video Review Updated', `Video status set to ${status.replace(/_/g, ' ')}.`);
  };

  const addTimestampMarker = (videoId: string, markerData: Omit<VideoTimestampMarker, 'id' | 'createdAt'>) => {
    const newMarker: VideoTimestampMarker = {
      ...markerData,
      id: `tm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setServiceVideos(prev => prev.map(v => {
      if (v.id === videoId || v.referenceNumber === videoId) {
        return {
          ...v,
          timestampMarkers: [...v.timestampMarkers, newMarker]
        };
      }
      return v;
    }));

    addAuditLog('ADD_VIDEO_TIMESTAMP', 'VideoTimestampMarker', videoId, `Added marker at ${markerData.timestampFormatted}: ${markerData.title}`);
    showToast('success', 'Timestamp Marker Added', `Point of interest bookmarked at ${markerData.timestampFormatted}.`);
  };

  const toggleTimestampReportApproval = (videoId: string, markerId: string) => {
    setServiceVideos(prev => prev.map(v => {
      if (v.id === videoId || v.referenceNumber === videoId) {
        return {
          ...v,
          timestampMarkers: v.timestampMarkers.map(m => {
            if (m.id === markerId) {
              return { ...m, approvedForReport: !m.approvedForReport };
            }
            return m;
          })
        };
      }
      return v;
    }));
    showToast('info', 'Report Inclusion Toggled', 'Timestamp marker report inclusion preference updated.');
  };

  const deleteServiceVideo = (videoId: string) => {
    const target = serviceVideos.find(v => v.id === videoId || v.referenceNumber === videoId);
    if (target?.isLockedAfterReport) {
      showToast('error', 'Action Restricted', 'This video evidence is permanently locked as part of an issued SANS 10139 report pack.');
      return;
    }

    setServiceVideos(prev => prev.filter(v => v.id !== videoId && v.referenceNumber !== videoId));
    addAuditLog('DELETE_VIDEO_EVIDENCE', 'ServiceVideo', videoId, 'Deleted service video evidence');
    showToast('info', 'Video Deleted', 'Evidence file removed from storage index.');
  };

  const lockVideoEvidence = (videoId: string) => {
    setServiceVideos(prev => prev.map(v => {
      if (v.id === videoId || v.referenceNumber === videoId) {
        return { ...v, isLockedAfterReport: true };
      }
      return v;
    }));
    addAuditLog('LOCK_VIDEO_EVIDENCE', 'ServiceVideo', videoId, 'Permanently locked video evidence post-handover');
    showToast('warning', 'Evidence Locked', 'Video record is now locked against modification or deletion.');
  };

  // ----------------------------------------------------------------------
  // CONDITION REPORTS AUTOMATION METHODS
  // ----------------------------------------------------------------------

  const uploadReportPhoto = (photoData: Partial<ReportPhotoSelection>): ReportPhotoSelection => {
    const newPhoto: ReportPhotoSelection = {
      id: `pht-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      photoUrl: photoData.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: photoData.thumbnailUrl || photoData.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      originalFileName: photoData.originalFileName || 'evidence_photo.jpg',
      stage: photoData.stage || 'before_work',
      category: photoData.category || 'general_site_area',
      roomOrLocation: photoData.roomOrLocation || 'Main Facility Area',
      caption: photoData.caption || 'Photographic evidence recorded.',
      visibleConditionNotes: photoData.visibleConditionNotes || 'Visible condition recorded in photograph.',
      clientReportedFault: photoData.clientReportedFault,
      dateRecorded: photoData.dateRecorded || new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString(),
      uploadedBy: photoData.uploadedBy || currentUser?.fullName || 'Client / User',
      uploaderRole: photoData.uploaderRole || (currentUser?.role === 'customer' ? 'customer' : 'staff'),
      reviewStatus: photoData.reviewStatus || 'included_in_report',
      sha256Hash: photoData.sha256Hash || `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      isApprovedForReport: true,
      equipmentReference: photoData.equipmentReference
    };

    setReportPhotos(prev => [newPhoto, ...prev]);
    return newPhoto;
  };

  const triggerSubmitBeforeWorkEvidence = async (
    requestId: string,
    photos: ReportPhotoSelection[],
    clientNotes?: string
  ): Promise<ConditionReport> => {
    const req = serviceRequests.find(r => r.id === requestId || r.referenceNumber === requestId);
    if (!req) {
      showToast('error', 'Request Not Found', 'Could not locate matching service request.');
      throw new Error('Request not found');
    }

    const validation = validatePreWorkReportEligibility(req, photos);
    if (!validation.isEligible) {
      showToast('error', 'Evidence Required', validation.errors.join(', '));
      throw new Error(validation.errors.join(', '));
    }

    // Generate Pre-Work Condition Report using the automated engine
    const report = generatePreWorkConditionReport(
      req,
      photos,
      [],
      currentUser?.fullName ? `${currentUser.fullName} (${currentUser.role})` : 'Celery Worker Task'
    );

    if (clientNotes) {
      report.customerSubmittedComments = [clientNotes];
    }

    // Build automated email
    const emailData = buildPreWorkEmail(report);

    // Save report in state
    setConditionReports(prev => [report, ...prev]);

    // Save/merge photos in state
    setReportPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newItems = photos.filter(p => !existingIds.has(p.id));
      return [...newItems, ...prev];
    });

    // Record email delivery log
    const emailLog: EmailDeliveryLog = {
      id: `eml-log-rep-${Date.now()}`,
      idempotencyKey: `idem-rep-${report.id}-${Date.now()}`,
      recipient: req.email,
      subject: emailData.subject,
      category: 'request_status_update',
      relatedReferenceNumber: report.referenceNumber,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: emailData.body,
      plainTextBody: emailData.plainText,
      createdAt: new Date().toISOString()
    };
    setEmailDeliveryLogs(prev => [emailLog, ...prev]);

    // Update metrics
    setConditionReportMetrics(prev => ({
      ...prev,
      preWorkReportsGenerated: prev.preWorkReportsGenerated + 1,
      emailDeliverySuccesses: prev.emailDeliverySuccesses + 1,
      reportsAwaitingEvidence: Math.max(0, prev.reportsAwaitingEvidence - 1)
    }));

    // Update service request internal notes and audit
    addAuditLog(
      'GENERATE_PRE_WORK_CONDITION_REPORT',
      'ConditionReport',
      report.referenceNumber,
      `Pre-Work Condition Report generated for ${req.referenceNumber}. Email dispatched to ${req.email}.`
    );

    showToast(
      'success',
      'Pre-Work Report Generated',
      `Report ${report.referenceNumber} created and emailed to ${req.email}.`
    );

    return report;
  };

  const triggerSubmitPostWorkEvidence = async (
    requestId: string,
    afterPhotos: ReportPhotoSelection[],
    duringPhotos: ReportPhotoSelection[] = [],
    workActivities: string[] = []
  ): Promise<{ success: boolean; report?: ConditionReport; error?: string }> => {
    const req = serviceRequests.find(r => r.id === requestId || r.referenceNumber === requestId);
    if (!req) {
      showToast('error', 'Request Not Found', 'Could not locate matching service request.');
      return { success: false, error: 'Request not found' };
    }

    const validation = validatePostWorkReportEligibility(req, afterPhotos);
    if (!validation.isEligible) {
      if (validation.isPostWorkEvidenceIncomplete) {
        showToast(
          'warning',
          'Post-work evidence incomplete',
          'At least one approved after-work photograph is required before generating a Post-Work Condition Report.'
        );
        setConditionReportMetrics(prev => ({
          ...prev,
          postWorkEvidenceIncompleteCount: prev.postWorkEvidenceIncompleteCount + 1
        }));
      } else {
        showToast('error', 'Validation Error', validation.errors.join(', '));
      }
      return { success: false, error: validation.errors.join(', ') };
    }

    // Match existing before photos
    const relatedPreWork = conditionReports.find(
      r => (r.serviceRequestId === req.id || r.serviceRequestRef === req.referenceNumber) && r.reportType === 'pre_work'
    );

    const beforePhotosForPost = relatedPreWork
      ? relatedPreWork.currentVersion.snapshot.photos
      : reportPhotos.filter(p => p.stage === 'before_work');

    const videosForRequest = serviceVideos
      .filter(v => v.serviceRequestId === req.id || v.serviceRequestRef === req.referenceNumber)
      .map(v => ({
        id: v.id,
        videoReference: v.referenceNumber,
        title: v.title,
        durationSeconds: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        category: v.category,
        stillImageUrls: v.timestampMarkers.map(m => m.stillImageUrl).filter(Boolean) as string[],
        markersCount: v.timestampMarkers.length,
        recordedStage: v.workStage,
        reviewStatus: v.reviewStatus
      }));

    // Generate Post-Work Condition Report
    const report = generatePostWorkConditionReport(
      req,
      beforePhotosForPost,
      duringPhotos,
      afterPhotos,
      videosForRequest,
      relatedPreWork?.referenceNumber,
      workActivities,
      currentUser?.fullName ? `${currentUser.fullName} (${currentUser.role})` : 'Celery Worker Task'
    );

    // Build automated email
    const emailData = buildPostWorkEmail(report);

    // Save report in state
    setConditionReports(prev => [report, ...prev]);

    // Save/merge photos in state
    setReportPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newItems = [...duringPhotos, ...afterPhotos].filter(p => !existingIds.has(p.id));
      return [...newItems, ...prev];
    });

    // Record email delivery log
    const emailLog: EmailDeliveryLog = {
      id: `eml-log-post-${Date.now()}`,
      idempotencyKey: `idem-post-${report.id}-${Date.now()}`,
      recipient: req.email,
      subject: emailData.subject,
      category: 'work_completed',
      relatedReferenceNumber: report.referenceNumber,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: emailData.body,
      plainTextBody: emailData.plainText,
      createdAt: new Date().toISOString()
    };
    setEmailDeliveryLogs(prev => [emailLog, ...prev]);

    // Update metrics
    setConditionReportMetrics(prev => ({
      ...prev,
      postWorkReportsGenerated: prev.postWorkReportsGenerated + 1,
      emailDeliverySuccesses: prev.emailDeliverySuccesses + 1
    }));

    addAuditLog(
      'GENERATE_POST_WORK_CONDITION_REPORT',
      'ConditionReport',
      report.referenceNumber,
      `Post-Work Condition Report generated for ${req.referenceNumber}. Email dispatched to ${req.email}.`
    );

    showToast(
      'success',
      'Post-Work Report Generated',
      `Report ${report.referenceNumber} compiled with paired comparisons and emailed.`
    );

    return { success: true, report };
  };

  const acknowledgeConditionReport = (
    reportId: string,
    ackType: 'acknowledged_satisfied' | 'correction_requested' | 'post_work_concern' | 'disputed',
    notes?: string
  ) => {
    const newAck: ClientReportAcknowledgement = {
      id: `ack-${Date.now()}`,
      reportId,
      clientId: currentUser?.id || 'usr-cust-01',
      clientName: currentUser?.fullName || 'Marcus Ndlovu',
      clientEmail: currentUser?.email || 'client@example.co.za',
      acknowledgedAt: new Date().toISOString(),
      acknowledgementType: ackType,
      clientNotes: notes,
      ipAddress: '105.22.140.12',
      userAgent: navigator.userAgent
    };

    setConditionReports(prev => prev.map(rep => {
      if (rep.id === reportId || rep.referenceNumber === reportId) {
        const nextStatus: ConditionReportStatus =
          ackType === 'acknowledged_satisfied' ? 'acknowledged_by_client' : 'more_info_required';
        return {
          ...rep,
          status: nextStatus,
          acknowledgements: [newAck, ...rep.acknowledgements]
        };
      }
      return rep;
    }));

    setConditionReportMetrics(prev => ({
      ...prev,
      reportsAcknowledgedByClients: prev.reportsAcknowledgedByClients + 1
    }));

    addAuditLog(
      'ACKNOWLEDGE_CONDITION_REPORT',
      'ConditionReport',
      reportId,
      `Client acknowledged report (${ackType}). Note: ${notes || 'None'}`
    );

    showToast('success', 'Acknowledgement Recorded', 'Your response has been securely saved and sent to Audrin Fire Engineers.');
  };

  const submitReportConcernOrDispute = (reportId: string, concernText: string, notes?: string) => {
    const newAck: ClientReportAcknowledgement = {
      id: `ack-concern-${Date.now()}`,
      reportId,
      clientId: currentUser?.id || 'usr-cust-01',
      clientName: currentUser?.fullName || 'Client',
      clientEmail: currentUser?.email || 'client@example.co.za',
      acknowledgedAt: new Date().toISOString(),
      acknowledgementType: 'post_work_concern',
      submittedCorrectionText: concernText,
      clientNotes: notes,
      ipAddress: '105.22.140.12',
      userAgent: navigator.userAgent
    };

    setConditionReports(prev => prev.map(rep => {
      if (rep.id === reportId || rep.referenceNumber === reportId) {
        return {
          ...rep,
          status: 'more_info_required',
          customerSubmittedComments: [...(rep.customerSubmittedComments || []), concernText],
          acknowledgements: [newAck, ...rep.acknowledgements]
        };
      }
      return rep;
    }));

    addAuditLog(
      'CLIENT_REPORT_CONCERN_SUBMITTED',
      'ConditionReport',
      reportId,
      `Client submitted concern: ${concernText}`
    );

    showToast('info', 'Concern Submitted', 'Our engineering team has received your note and will review the evidence.');
  };

  const createNewReportVersionManual = (
    reportId: string,
    reason: string,
    updatedPhotos: ReportPhotoSelection[]
  ) => {
    const target = conditionReports.find(r => r.id === reportId || r.referenceNumber === reportId);
    if (!target) return;

    const updatedReport = createNewReportVersion(
      target,
      updatedPhotos,
      target.currentVersion.snapshot.videos,
      reason,
      currentUser?.fullName || 'Staff Member'
    );

    setConditionReports(prev => prev.map(r => (r.id === target.id ? updatedReport : r)));

    addAuditLog(
      'CREATE_REPORT_VERSION',
      'ConditionReportVersion',
      `${updatedReport.referenceNumber}_v${updatedReport.currentVersionNumber}`,
      `Created version ${updatedReport.currentVersionNumber}. Reason: ${reason}`
    );

    showToast('success', 'New Version Created', `Report updated to version ${updatedReport.currentVersionNumber.toFixed(1)}.`);
  };

  const resendConditionReportEmail = (reportId: string) => {
    const target = conditionReports.find(r => r.id === reportId || r.referenceNumber === reportId);
    if (!target) return;

    const emailData = target.reportType === 'pre_work' ? buildPreWorkEmail(target) : buildPostWorkEmail(target);

    const emailLog: EmailDeliveryLog = {
      id: `eml-resend-${Date.now()}`,
      idempotencyKey: `idem-resend-${target.id}-${Date.now()}`,
      recipient: target.clientEmail,
      subject: emailData.subject,
      category: target.reportType === 'pre_work' ? 'request_status_update' : 'work_completed',
      relatedReferenceNumber: target.referenceNumber,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: emailData.body,
      plainTextBody: emailData.plainText,
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [emailLog, ...prev]);

    setConditionReports(prev => prev.map(r => {
      if (r.id === target.id) {
        return {
          ...r,
          deliveries: [
            {
              id: `del-resend-${Date.now()}`,
              reportId: target.id,
              recipientEmail: target.clientEmail,
              recipientName: target.clientName,
              subject: emailData.subject,
              deliveryStatus: 'sent',
              sentAt: new Date().toISOString(),
              authDashboardLink: target.secureDashboardLink,
              sanitizedPdfAttached: false,
              retryCount: 0
            },
            ...r.deliveries
          ]
        };
      }
      return r;
    }));

    addAuditLog('RESEND_REPORT_EMAIL', 'ReportDelivery', target.referenceNumber, `Email resent to ${target.clientEmail}`);
    showToast('success', 'Email Resent', `Condition report emailed to ${target.clientEmail}.`);
  };

  // ----------------------------------------------------------------------
  // TECHNICAL DOCUMENT & EVIDENCE VAULT HANDLERS
  // ----------------------------------------------------------------------

  const uploadTechnicalDocument = async (input: DocumentUploadInput): Promise<ProcessingResult> => {
    setDocumentMetrics(prev => ({ ...prev, uploadsStarted: prev.uploadsStarted + 1 }));

    try {
      const result = await executeDocumentProcessingPipeline(input, technicalDocuments);

      if (!result.success && result.quarantinedRecord) {
        setQuarantinedFiles(prev => [result.quarantinedRecord!, ...prev]);
        setDocumentMetrics(prev => ({
          ...prev,
          filesQuarantined: prev.filesQuarantined + 1,
          malwareDetections: prev.malwareDetections + 1,
          uploadFailures: prev.uploadFailures + 1
        }));

        addAuditLog(
          'DOCUMENT_SECURITY_QUARANTINE',
          'QuarantinedFileRecord',
          result.quarantinedRecord.id,
          `File ${result.quarantinedRecord.originalFileName} blocked: ${result.quarantinedRecord.detectedThreat}`
        );

        showToast(
          'error',
          'Security Policy Violation: File Quarantined',
          `${result.errorMessage || 'Prohibited file type or executable code detected.'} Upload blocked and logged.`
        );

        return result;
      }

      if (result.success && result.document) {
        const newDoc = result.document;
        setTechnicalDocuments(prev => [newDoc, ...prev]);
        setDocumentMetrics(prev => ({
          ...prev,
          uploadsCompleted: prev.uploadsCompleted + 1,
          totalStorageBytes: prev.totalStorageBytes + newDoc.currentVersion.fileSize,
          totalStorageFormatted: `${((prev.totalStorageBytes + newDoc.currentVersion.fileSize) / 1048576).toFixed(1)} MB`,
          documentsAwaitingReview: newDoc.reviewStatus === 'pending_review' ? prev.documentsAwaitingReview + 1 : prev.documentsAwaitingReview,
          approvedDocumentsCount: newDoc.reviewStatus === 'approved' ? prev.approvedDocumentsCount + 1 : prev.approvedDocumentsCount
        }));

        addAuditLog(
          'DOCUMENT_UPLOADED',
          'TechnicalDocument',
          newDoc.id,
          `Uploaded ${newDoc.title} (${newDoc.currentVersion.originalFileName}) - SANS Category: ${newDoc.category}`
        );

        // Simulated Automated Email Notification
        const emailLog: EmailDeliveryLog = {
          id: `eml-doc-${Date.now()}`,
          idempotencyKey: `idem-doc-${newDoc.id}-${Date.now()}`,
          recipient: newDoc.uploaderEmail,
          subject: `Document Received Confirmation: ${newDoc.title} [${newDoc.serviceRequestRef}]`,
          category: 'request_status_update',
          relatedReferenceNumber: newDoc.serviceRequestRef,
          deliveryStatus: 'Sent',
          sendAttemptCount: 1,
          sentAt: new Date().toISOString(),
          htmlBody: `<p>Dear ${newDoc.uploadedBy},</p><p>We have successfully received and processed your technical document <strong>${newDoc.title}</strong> (${newDoc.currentVersion.originalFileName}) under request <strong>${newDoc.serviceRequestRef}</strong>.</p><p>SHA-256 Checksum: <code>${newDoc.currentVersion.fileHash}</code></p>`,
          plainTextBody: `Document ${newDoc.title} received under ${newDoc.serviceRequestRef}. SHA-256: ${newDoc.currentVersion.fileHash}`,
          createdAt: new Date().toISOString()
        };
        setEmailDeliveryLogs(prev => [emailLog, ...prev]);

        showToast(
          'success',
          'Technical Document Processed & Stored',
          `"${newDoc.title}" passed malware scanning and Celery preview generation successfully.`
        );

        if (result.isDuplicate) {
          showToast(
            'warning',
            'Duplicate Check Notice',
            'A file with identical name/hash was previously registered for this service request.'
          );
        }

        return result;
      }

      return result;
    } catch (err: any) {
      setDocumentMetrics(prev => ({ ...prev, uploadFailures: prev.uploadFailures + 1 }));
      showToast('error', 'Upload Processing Failed', err?.message || 'An error occurred during Celery background processing.');
      return { success: false, errorMessage: err?.message || 'Processing error' };
    }
  };

  const submitDocumentRevision = async (input: DocumentRevisionInput): Promise<ProcessingResult> => {
    try {
      const result = await executeDocumentRevisionPipeline(input);

      if (!result.success && result.quarantinedRecord) {
        setQuarantinedFiles(prev => [result.quarantinedRecord!, ...prev]);
        setDocumentMetrics(prev => ({
          ...prev,
          filesQuarantined: prev.filesQuarantined + 1,
          malwareDetections: prev.malwareDetections + 1
        }));
        showToast('error', 'Revision Blocked & Quarantined', result.errorMessage || 'Prohibited content detected in revision file.');
        return result;
      }

      if (result.success && result.document) {
        const updatedDoc = result.document;
        setTechnicalDocuments(prev => prev.map(d => (d.id === updatedDoc.id ? updatedDoc : d)));
        if (selectedDocumentForDetail?.id === updatedDoc.id) {
          setSelectedDocumentForDetail(updatedDoc);
        }

        setDocumentMetrics(prev => ({
          ...prev,
          revisionsActiveCount: prev.revisionsActiveCount + 1,
          totalStorageBytes: prev.totalStorageBytes + updatedDoc.currentVersion.fileSize,
          totalStorageFormatted: `${((prev.totalStorageBytes + updatedDoc.currentVersion.fileSize) / 1048576).toFixed(1)} MB`
        }));

        addAuditLog(
          'DOCUMENT_REVISION_SUBMITTED',
          'TechnicalDocument',
          updatedDoc.id,
          `Submitted revision ${updatedDoc.currentVersion.revisionNumber} (v${updatedDoc.currentVersionNumber}): ${input.changeDescription}`
        );

        showToast(
          'success',
          'New Revision Registered',
          `Revision ${updatedDoc.currentVersion.revisionNumber} processed. Prior versions preserved in immutable history.`
        );

        return result;
      }

      return result;
    } catch (err: any) {
      showToast('error', 'Revision Failed', err?.message || 'Could not process document revision.');
      return { success: false, errorMessage: err?.message };
    }
  };

  const reviewTechnicalDocument = (
    docId: string,
    decision: 'approved' | 'rejected' | 'requires_revision',
    notes?: string,
    rejectionReason?: string
  ) => {
    const doc = technicalDocuments.find(d => d.id === docId);
    if (!doc) return;

    const reviewerName = currentUser?.fullName || 'Managing Director Bethuel Moukangwe';
    const timestamp = new Date().toISOString();

    const auditAction = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'reviewed';
    const newLog = {
      id: `log-${Date.now()}`,
      documentId: doc.id,
      timestamp,
      action: auditAction as any,
      performedBy: reviewerName,
      userRole: currentUser?.role || 'staff',
      userEmail: currentUser?.email || 'bethuelmoukangwe8@gmail.com',
      details: `Staff review decision: ${decision.toUpperCase()}. ${rejectionReason ? `Reason: ${rejectionReason}. ` : ''}${notes ? `Notes: ${notes}` : ''}`
    };

    const updatedDoc: TechnicalDocument = {
      ...doc,
      reviewStatus: decision,
      reviewNotes: notes || doc.reviewNotes,
      rejectionReason: rejectionReason || doc.rejectionReason,
      reviewedBy: reviewerName,
      reviewedAt: timestamp,
      currentVersion: {
        ...doc.currentVersion,
        reviewStatus: decision,
        reviewedBy: reviewerName,
        reviewedAt: timestamp,
        reviewNotes: notes,
        rejectionReason
      },
      auditLogs: [newLog, ...doc.auditLogs]
    };

    setTechnicalDocuments(prev => prev.map(d => (d.id === docId ? updatedDoc : d)));
    if (selectedDocumentForDetail?.id === docId) {
      setSelectedDocumentForDetail(updatedDoc);
    }

    setDocumentMetrics(prev => ({
      ...prev,
      documentsAwaitingReview: Math.max(0, prev.documentsAwaitingReview - 1),
      approvedDocumentsCount: decision === 'approved' ? prev.approvedDocumentsCount + 1 : prev.approvedDocumentsCount
    }));

    addAuditLog(
      `DOCUMENT_${decision.toUpperCase()}`,
      'TechnicalDocument',
      doc.id,
      `Reviewed document ${doc.title} (${doc.currentVersion.originalFileName}): ${decision}`
    );

    // Automated Email Dispatch on Decision
    const emailSubject =
      decision === 'approved'
        ? `Technical Document Approved: ${doc.title} [${doc.serviceRequestRef}]`
        : decision === 'rejected'
        ? `Document Submission Rejected: ${doc.title} [${doc.serviceRequestRef}]`
        : `New Document Revision Requested: ${doc.title} [${doc.serviceRequestRef}]`;

    const emailLog: EmailDeliveryLog = {
      id: `eml-rev-${Date.now()}`,
      idempotencyKey: `idem-rev-${doc.id}-${decision}-${Date.now()}`,
      recipient: doc.uploaderEmail,
      subject: emailSubject,
      category: 'request_status_update',
      relatedReferenceNumber: doc.serviceRequestRef,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: timestamp,
      htmlBody: `<p>Dear ${doc.uploadedBy},</p><p>Your document <strong>${doc.title}</strong> (${doc.currentVersion.revisionNumber}) has been marked as <strong>${decision.toUpperCase()}</strong> by ${reviewerName}.</p>${rejectionReason ? `<p><strong>Feedback / Reason:</strong> ${rejectionReason}</p>` : ''}${notes ? `<p><strong>Engineer Notes:</strong> ${notes}</p>` : ''}`,
      plainTextBody: `Document ${doc.title} status updated to ${decision} by ${reviewerName}. Notes: ${notes || rejectionReason || 'N/A'}`,
      createdAt: timestamp
    };
    setEmailDeliveryLogs(prev => [emailLog, ...prev]);

    showToast(
      decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'warning',
      `Document ${decision.toUpperCase().replace('_', ' ')}`,
      `Document "${doc.title}" review status updated to ${decision}. Client notified.`
    );
  };

  const toggleDocumentCustomerVisibility = (docId: string, visible: boolean) => {
    setTechnicalDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const updated = { ...d, customerVisible: visible };
          if (selectedDocumentForDetail?.id === docId) setSelectedDocumentForDetail(updated);
          return updated;
        }
        return d;
      })
    );
    showToast('info', 'Visibility Updated', `Customer portal visibility set to ${visible ? 'VISIBLE' : 'HIDDEN'}.`);
  };

  const toggleDocumentReportInclusion = (docId: string, include: boolean) => {
    setTechnicalDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const updated = { ...d, includeInReport: include };
          if (selectedDocumentForDetail?.id === docId) setSelectedDocumentForDetail(updated);
          return updated;
        }
        return d;
      })
    );
    showToast('info', 'Report Attachment Setting', `Condition report reference set to ${include ? 'INCLUDED' : 'EXCLUDED'}.`);
  };

  const updateDocumentCategory = (docId: string, newCategory: TechnicalDocumentCategory) => {
    setTechnicalDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const updated = { ...d, category: newCategory };
          if (selectedDocumentForDetail?.id === docId) setSelectedDocumentForDetail(updated);
          return updated;
        }
        return d;
      })
    );
    showToast('success', 'Category Updated', `Technical document reclassified under ${newCategory}.`);
  };

  const deleteUnreviewedDocument = (docId: string): boolean => {
    const doc = technicalDocuments.find(d => d.id === docId);
    if (!doc) return false;

    // Safety rule: Never delete approved documents or locked documents
    if (doc.reviewStatus === 'approved' || doc.isLockedByReport) {
      showToast('error', 'Deletion Prevented', 'Approved or report-locked technical documents cannot be deleted from the statutory archive.');
      return false;
    }

    setTechnicalDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDocumentForDetail?.id === docId) {
      setSelectedDocumentForDetail(null);
    }

    addAuditLog('DOCUMENT_DELETED', 'TechnicalDocument', doc.id, `Deleted unreviewed document ${doc.title}`);
    showToast('success', 'Document Removed', `Unreviewed document "${doc.title}" deleted.`);
    return true;
  };

  const replaceUnreviewedDocument = async (docId: string, newFile: File): Promise<ProcessingResult> => {
    const doc = technicalDocuments.find(d => d.id === docId);
    if (!doc) return { success: false, errorMessage: 'Document not found' };

    if (doc.reviewStatus === 'approved' || doc.isLockedByReport) {
      showToast('warning', 'Immutable Version Enforced', 'Approved document cannot be replaced directly; submit a formal Revision instead.');
      return { success: false, errorMessage: 'Use revision workflow for approved documents.' };
    }

    const sReq = serviceRequests.find(r => r.id === doc.serviceRequestId) || serviceRequests[0];
    const uploadInput: DocumentUploadInput = {
      file: newFile,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      evidenceStage: doc.evidenceStage,
      serviceRequest: sReq,
      drawingNumber: doc.drawingNumber,
      revisionNumber: doc.revisionNumber,
      uploader: currentUser || { id: 'usr', fullName: 'Uploader', email: 'user@test.co.za', role: 'customer', organisationName: 'Org', phone: '0714156665', isVerified: true, createdAt: '' },
      customerVisible: doc.customerVisible,
      includeInReport: doc.includeInReport
    };

    const res = await executeDocumentProcessingPipeline(uploadInput, technicalDocuments.filter(d => d.id !== docId));
    if (res.success && res.document) {
      setTechnicalDocuments(prev => prev.map(d => (d.id === docId ? { ...res.document!, id: docId } : d)));
      showToast('success', 'File Replaced', `Unreviewed document file successfully replaced with ${newFile.name}.`);
    }
    return res;
  };

  const restoreQuarantinedFile = (quarantineId: string) => {
    setQuarantinedFiles(prev =>
      prev.map(q => (q.id === quarantineId ? { ...q, status: 'released_override' } : q))
    );
    addAuditLog('QUARANTINE_OVERRIDE', 'QuarantinedFileRecord', quarantineId, `Administrator manual security override granted.`);
    showToast('warning', 'Quarantine Override', `File ${quarantineId} marked for manual inspection override by Director.`);
  };

  const purgeQuarantinedFile = (quarantineId: string) => {
    setQuarantinedFiles(prev => prev.filter(q => q.id !== quarantineId));
    addAuditLog('QUARANTINE_PURGED', 'QuarantinedFileRecord', quarantineId, `Permanently purged quarantined malware binary.`);
    showToast('success', 'Threat Purged', 'Suspicious payload permanently shredded from quarantine isolation.');
  };

  const updatePermittedFileType = (configId: string, updates: Partial<PermittedFileTypeConfig>) => {
    setPermittedFileTypes(prev => prev.map(c => (c.id === configId ? { ...c, ...updates } : c)));
    addAuditLog('FILE_TYPE_CONFIG_UPDATE', 'PermittedFileTypeConfig', configId, `Updated configuration for file extension.`);
    showToast('success', 'Security Policy Updated', 'File format permissions and maximum size limit updated.');
  };

  const requestMissingDocument = (requestId: string, category: TechnicalDocumentCategory, instructions: string) => {
    const sReq = serviceRequests.find(r => r.id === requestId);
    if (!sReq) return;

    const emailLog: EmailDeliveryLog = {
      id: `eml-req-doc-${Date.now()}`,
      idempotencyKey: `idem-req-${requestId}-${category}-${Date.now()}`,
      recipient: sReq.contactEmail,
      subject: `Technical Document Requested: ${category.replace(/_/g, ' ').toUpperCase()} [${sReq.referenceNumber}]`,
      category: 'request_status_update',
      relatedReferenceNumber: sReq.referenceNumber,
      deliveryStatus: 'Sent',
      sendAttemptCount: 1,
      sentAt: new Date().toISOString(),
      htmlBody: `<p>Dear ${sReq.contactPerson},</p><p>Audrin Fire Engineers has requested the following document for your site <strong>${sReq.siteName}</strong>:</p><p><strong>Required Document:</strong> ${category.replace(/_/g, ' ').toUpperCase()}</p><p><strong>Instructions from Engineering Team:</strong> ${instructions}</p><p>Please upload your approved CAD drawing, PDF, or specification via your secure client portal.</p>`,
      plainTextBody: `Document request for ${sReq.referenceNumber}: ${category}. Instructions: ${instructions}`,
      createdAt: new Date().toISOString()
    };

    setEmailDeliveryLogs(prev => [emailLog, ...prev]);
    addAuditLog('REQUEST_MISSING_DOCUMENT', 'ServiceRequest', sReq.referenceNumber, `Requested ${category} from ${sReq.contactEmail}`);
    showToast('success', 'Document Request Sent', `Email notification and upload task dispatched to ${sReq.contactEmail}.`);
  };

  const generateSignedDownloadToken = (docId: string, versionId?: string) => {
    const doc = technicalDocuments.find(d => d.id === docId);
    const token = `sig_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
    const targetVer = versionId ? doc?.versionHistory.find(v => v.id === versionId) || doc?.currentVersion : doc?.currentVersion;

    addAuditLog(
      'SIGNED_DOWNLOAD_GENERATED',
      'TechnicalDocument',
      docId,
      `Generated 15-minute time-limited HMAC signed URL for ${targetVer?.originalFileName}`
    );

    return {
      downloadUrl: targetVer?.fileUrl || '',
      expiresAt,
      token
    };
  };

  const exportDocumentRegisterCSV = (): string => {
    const headers = ['Document ID', 'Title', 'Category', 'Stage', 'Service Request', 'Site Name', 'Drawing No', 'Current Rev', 'File Name', 'Size', 'SHA256 Hash', 'Uploaded By', 'Review Status', 'Upload Date'];
    const rows = technicalDocuments.map(d => [
      `"${d.id}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.evidenceStage}"`,
      `"${d.serviceRequestRef}"`,
      `"${d.siteName.replace(/"/g, '""')}"`,
      `"${d.drawingNumber}"`,
      `"${d.currentVersion.revisionNumber}"`,
      `"${d.currentVersion.originalFileName}"`,
      `"${d.currentVersion.fileSizeFormatted}"`,
      `"${d.currentVersion.fileHash}"`,
      `"${d.uploadedBy}"`,
      `"${d.reviewStatus}"`,
      `"${d.uploadedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csvContent;
  };

  // Real-time System Metrics calculation
  const systemMetrics: SystemMetrics = {
    requestsCountTotal: serviceRequests.length,
    activeRequestsCount: serviceRequests.filter(r => !['Completed', 'Closed', 'Cancelled'].includes(r.status)).length,
    emergencyFaultsCount: serviceRequests.filter(r => r.urgency === 'urgent_emergency').length,
    emailsSentTotal: emailDeliveryLogs.filter(e => e.deliveryStatus === 'Sent').length,
    emailsQueuedCount: emailDeliveryLogs.filter(e => e.deliveryStatus === 'Queued').length,
    emailsFailedCount: emailDeliveryLogs.filter(e => e.deliveryStatus === 'Failed').length,
    redisHealth: 'healthy',
    postgresHealth: 'healthy',
    celeryWorkerHealth: 'healthy',
    celeryBeatHealth: 'healthy',
    uptimeSeconds: 86400 * 14 + 3600 * 6
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedServiceSlug,
        setSelectedServiceSlug,
        selectedRequestId,
        setSelectedRequestId,

        isRequestModalOpen,
        setIsRequestModalOpen,
        preselectedServiceForModal,
        setPreselectedServiceForModal,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        previewEmailLog,
        setPreviewEmailLog,

        // Voice AI Guide
        isVoicePlayerOpen,
        setIsVoicePlayerOpen,
        activeVoiceStepNumber,
        setActiveVoiceStepNumber,
        voiceGuideData,
        voiceMetrics,
        updateVoiceScript,
        updateVoiceConfig,
        generateNewVoiceAudio,
        publishVoiceVersion,
        rollbackVoiceVersion,
        recordVoiceMetric,

        // During-Work Video Evidence
        serviceVideos,
        videoMetrics,
        selectedVideoForDetail,
        setSelectedVideoForDetail,
        isUploadVideoModalOpen,
        setIsUploadVideoModalOpen,
        preselectedRequestIdForVideo,
        setPreselectedRequestIdForVideo,
        uploadServiceVideo,
        reviewServiceVideo,
        addTimestampMarker,
        toggleTimestampReportApproval,
        deleteServiceVideo,
        lockVideoEvidence,

        // Automated Condition Reports
        conditionReports,
        reportPhotos,
        conditionReportMetrics,
        selectedReportForDetail,
        setSelectedReportForDetail,
        isSubmitBeforeWorkModalOpen,
        setIsSubmitBeforeWorkModalOpen,
        isSubmitPostWorkModalOpen,
        setIsSubmitPostWorkModalOpen,
        preselectedRequestIdForReport,
        setPreselectedRequestIdForReport,
        triggerSubmitBeforeWorkEvidence,
        triggerSubmitPostWorkEvidence,
        acknowledgeConditionReport,
        submitReportConcernOrDispute,
        createNewReportVersionManual,
        resendConditionReportEmail,
        uploadReportPhoto,

        // Technical Document & Evidence Vault State & Actions
        technicalDocuments,
        permittedFileTypes,
        quarantinedFiles,
        documentMetrics,
        selectedDocumentForDetail,
        setSelectedDocumentForDetail,
        isUploadDocModalOpen,
        setIsUploadDocModalOpen,
        isRevisionModalOpen,
        setIsRevisionModalOpen,
        selectedDocForRevision,
        setSelectedDocForRevision,
        preselectedRequestIdForDoc,
        setPreselectedRequestIdForDoc,
        uploadTechnicalDocument,
        submitDocumentRevision,
        reviewTechnicalDocument,
        toggleDocumentCustomerVisibility,
        toggleDocumentReportInclusion,
        updateDocumentCategory,
        deleteUnreviewedDocument,
        replaceUnreviewedDocument,
        restoreQuarantinedFile,
        purgeQuarantinedFile,
        updatePermittedFileType,
        requestMissingDocument,
        generateSignedDownloadToken,
        exportDocumentRegisterCSV,

        currentUser,
        setCurrentUser,
        switchRole,
        logout,
        registerUser,

        services,
        howWeWorkSteps,
        faqs,
        galleryItems,
        serviceRequests,
        contactEnquiries,
        emailTemplates,
        emailDeliveryLogs,
        auditLogs,
        systemMetrics,

        submitServiceRequest,
        submitContactEnquiry,
        updateRequestStatus,
        assignStaffToRequest,
        scheduleSiteVisit,
        addInternalNote,
        addCustomerMessage,
        addRequestAttachment,

        updateService,
        toggleServiceActive,
        updateFAQ,
        addFAQ,
        deleteFAQ,
        addGalleryItem,
        toggleGalleryActive,
        updateEmailTemplate,
        testSendEmailTemplate,

        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
