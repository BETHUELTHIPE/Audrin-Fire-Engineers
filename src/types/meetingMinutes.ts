import { UserRole } from '../types';

export type ConsentStatus = 'consented' | 'declined' | 'withdrawn' | 'pending';

export interface MeetingConsent {
  id: string;
  appointmentId: string;
  appointmentRef: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  consentStatus: ConsentStatus;
  consentTextVersion: string;
  consentText: string;
  consentedAt: string;
  ipAddress: string;
  userAgent: string;
  isWithdrawn: boolean;
  withdrawnAt?: string;
  withdrawalReason?: string;
}

export type LiveMeetingStatus =
  | 'scheduled'
  | 'waiting_for_host'
  | 'in_progress'
  | 'consent_confirmed'
  | 'recording_active'
  | 'transcription_active'
  | 'meeting_ended'
  | 'transcript_processing'
  | 'ai_generating'
  | 'pdf_generating'
  | 'email_queued'
  | 'minutes_delivered'
  | 'processing_failed';

export interface TranscriptSpeaker {
  id: string;
  speakerLabel: string; // e.g. "Speaker 1", "Bethuel Moukangwe (Host)", "Unknown Speaker 1"
  identifiedName?: string;
  role?: 'host' | 'client' | 'engineer' | 'guest' | 'unknown';
  confidence?: number;
  isManuallyCorrected?: boolean;
}

export interface TranscriptUtterance {
  id: string;
  speakerId: string;
  speakerName: string;
  startTime: string; // "00:01:23.450"
  endTime: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  isInaudibleOrUncertain?: boolean;
  confidence?: number;
}

export interface MeetingTranscript {
  id: string;
  meetingId: string;
  appointmentId: string;
  version: number;
  source: 'zoom_cloud_vtt' | 'amazon_transcribe_fallback' | 'manual_upload';
  s3RawTranscriptKey: string;
  s3EncryptedBucket: string;
  fileHash: string;
  totalDurationSeconds: number;
  speakers: TranscriptSpeaker[];
  utterances: TranscriptUtterance[];
  wordCount: number;
  createdAt: string;
}

export interface StructuredMeetingMinutes {
  meetingTitle: string;
  appointmentType: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  client: string;
  organisation: string;
  site: string;
  serviceRequestRef: string;
  attendees: { name: string; role: string; email?: string; present: boolean }[];
  apologies: string[];
  agenda: { itemNumber: number; title: string; description: string }[];
  discussionPoints: { topic: string; summary: string; speakerRef?: string; transcriptTimestamp?: string }[];
  clientConcerns: { concern: string; context: string; transcriptRef?: string }[];
  informationSupplied: string[];
  documentsDiscussed: string[];
  decisions: { decisionNumber: number; description: string; context: string; transcriptEvidence: string }[];
  actionItems: {
    id: string;
    actionNumber: number;
    action: string;
    responsibleParty: string;
    dueDate: string;
    status: 'Open' | 'In Progress' | 'Completed' | 'Pending Review';
    transcriptEvidence: string;
  }[];
  outstandingInformation: string[];
  risksOrBlockers: { risk: string; severity: 'Low' | 'Medium' | 'High'; transcriptEvidence: string }[];
  nextHowWeWorkStage: string;
  followUpMeetingRequirement: {
    required: boolean;
    suggestedType?: string;
    targetTimeframe?: string;
    details?: string;
  };
  nextSteps: string[];
  uncertainOrInaudibleSections: { timestamp: string; note: string; transcriptSnippet: string }[];
  fireDetectionDisclaimer: string;
  aiGenerationNotice: string;
}

export interface MeetingMinutesVersion {
  id: string;
  minutesId: string;
  meetingId: string;
  appointmentId: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  transcriptVersion: number;
  aiModelIdentifier: string;
  promptTemplateVersion: string;
  minutesVersion: number;
  pdfVersion: number;
  s3PdfKey: string;
  s3PdfVersionId: string;
  fileHash: string;
  fileSizeBytes: number;
  isSuperseded: boolean;
  supersededByVersionId?: string;
  supersedesVersionId?: string;
  correctionReason?: string;
  structuredData: StructuredMeetingMinutes;
  generatedAt: string;
  createdBy: string;
  approvalStatus: 'auto_generated' | 'admin_approved' | 'client_acknowledged' | 'correction_requested';
}

export interface MeetingMinutesCorrection {
  id: string;
  minutesId: string;
  minutesVersionId: string;
  versionNumber: number;
  submittedByUserId: string;
  submittedByUserName: string;
  submittedByUserEmail: string;
  sectionToCorrect: string;
  currentText: string;
  requestedCorrection: string;
  reasonOrEvidence: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  resultingNewVersionId?: string;
  createdAt: string;
}

export interface MeetingMinutesAcknowledgement {
  id: string;
  minutesId: string;
  minutesVersionId: string;
  versionNumber: number;
  acknowledgedByUserId: string;
  acknowledgedByUserName: string;
  acknowledgedByUserRole: UserRole;
  acknowledgedAt: string;
  clientComments?: string;
  ipAddress: string;
  userAgent: string;
}

export interface MeetingMinutesDelivery {
  id: string;
  minutesId: string;
  minutesVersionId: string;
  recipientType: 'client' | 'superuser';
  recipientUserId: string;
  recipientName: string;
  recipientEmail: string;
  deliveryMethod: 'ses_mime_attachment' | 'ses_secure_portal_link';
  subject: string;
  bodySnippet: string;
  idempotencyKey: string;
  sesMessageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  isSeparateDispatch: boolean;
  dispatchedAt: string;
  deliveryConfirmedAt?: string;
  attachmentSizeBytes: number;
  exceededSizeLimit: boolean;
  errorLog?: string;
}

export interface ZoomMeetingRecord {
  id: string;
  appointmentId: string;
  appointmentRef: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  siteName: string;
  clientName: string;
  clientEmail: string;
  zoomMeetingId: string;
  topic: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes: number;
  liveStatus: LiveMeetingStatus;
  consentRecorded: boolean;
  consentStatus?: ConsentStatus;
  consentId?: string;
  cloudRecordingEnabled: boolean;
  audioTranscriptionEnabled: boolean;
  transcriptAvailable: boolean;
  transcriptId?: string;
  currentMinutesId?: string;
  currentMinutesVersion: number;
  versionsCount: number;
  recordingDeletedAt?: string;
  transcriptRetainedUntil?: string;
  pdfRetainedUntil?: string;
  updatedAt: string;
}

export interface MeetingMinutesMetrics {
  meetingsAwaitingTranscripts: number;
  transcriptDownloadFailures: number;
  aiGenerationSuccesses: number;
  aiGenerationFailures: number;
  pdfGenerationFailures: number;
  minutesDeliverySuccesses: number;
  minutesDeliveryFailures: number;
  correctionRequests: number;
  minutesAcknowledged: number;
  avgProcessingDurationSeconds: number;
}

export interface VerifiedSuperuserRecipient {
  userId: string;
  name: string;
  email: string;
  hasReceiveAllMeetingMinutesPermission: boolean;
  isVerified: boolean;
  isActive: boolean;
}
