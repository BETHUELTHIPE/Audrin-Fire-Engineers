import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FilePlus,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  Wrench,
  Paperclip,
  MessageSquare,
  ChevronRight,
  Send,
  Upload,
  FileText,
  User,
  Shield,
  AlertTriangle,
  Video,
  Play,
  BookmarkPlus,
  ShieldCheck,
  Lock,
  ExternalLink,
  Camera,
  ShieldAlert,
  Layers,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Download,
  Eye,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  Scale,
  Award,
  BookOpen,
  Presentation,
  LogIn
} from 'lucide-react';
import { ServiceRequest, RequestStatus, RequestAttachment, Appointment } from '../types';
import { DocumentUploadZone } from '../components/DocumentUploadZone';
import { DocumentEvidenceVault } from '../components/DocumentEvidenceVault';
import { ComplianceCalendar } from '../components/ComplianceCalendar';
import { StatutoryFormsVault } from '../components/StatutoryFormsVault';
import { ComplianceProgressTracker } from '../components/ComplianceProgressTracker';
import { SANS10139ComplianceTimeline } from '../components/SANS10139ComplianceTimeline';
import { PushNotificationPermissionBanner } from '../components/PushNotificationPermissionBanner';
import { ZoomPmiControlCard } from '../components/ZoomPmiControlCard';
import { AppointmentCreateModal } from '../components/AppointmentCreateModal';
import { PowerPointPresentationViewerModal } from '../components/PowerPointPresentationViewerModal';
import { RescheduleAppointmentModal } from '../components/RescheduleAppointmentModal';
import { MeetingOutcomeModal } from '../components/MeetingOutcomeModal';
import { MeetingConsentModal } from '../components/MeetingConsentModal';
import { MeetingMinutesViewerModal } from '../components/MeetingMinutesViewerModal';
import { MeetingMinutesCorrectionModal } from '../components/MeetingMinutesCorrectionModal';
import { MinutesVersionHistoryModal } from '../components/MinutesVersionHistoryModal';
import { meetingMinutesService } from '../services/meetingMinutesService';
import { MeetingMinutesVersion } from '../types/meetingMinutes';
import { calendarZoomService } from '../services/calendarZoomService';
import { APPOINTMENT_TYPE_LABELS } from '../data/calendarZoomData';
import { getFileTypeMeta, formatFileSize } from '../utils/fileTypes';
import { SafetyFileCard } from '../components/SafetyFileCard';
import { SafetyFileDashboard } from '../components/SafetyFileDashboard';
import { SafetyFileCover } from '../components/SafetyFileCover';
import { ComplianceAuditLog } from '../components/ComplianceAuditLog';
import { SafetyFileViewerModal } from '../components/SafetyFileViewerModal';
import { SafetyFilePrintPreviewModal } from '../components/SafetyFilePrintPreviewModal';
import { SafetyFileEmailModal } from '../components/SafetyFileEmailModal';
import { safetyFileService } from '../services/safetyFileService';
import { SafetyFile } from '../types/safetyFile';
import { LegalView } from './LegalView';

export interface CustomerPortalViewProps {
  initialSection?: 'requests' | 'safety_file' | 'compliance_tracker' | 'compliance_timeline' | 'statutory_forms' | 'compliance_calendar' | 'zoom_consultations' | 'appointments' | 'sans_legal_hub';
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ initialSection = 'requests' }) => {
  const {
    currentUser,
    switchRole,
    registerUser,
    setActiveView,
    serviceRequests,
    selectedRequestId,
    setSelectedRequestId,
    setIsRequestModalOpen,
    addCustomerMessage,
    addRequestAttachment,
    serviceVideos,
    setIsUploadVideoModalOpen,
    setSelectedVideoForDetail,
    setPreselectedRequestIdForVideo,
    conditionReports,
    setSelectedReportForDetail,
    setIsSubmitBeforeWorkModalOpen,
    setIsSubmitPostWorkModalOpen,
    setPreselectedRequestIdForReport,
    technicalDocuments,
    setIsUploadDocModalOpen,
    setPreselectedRequestIdForDoc,
    complianceInspections,
    setIsScheduleInspectionModalOpen,
    setPreselectedSiteForSchedule
  } = useApp();

  const [activePortalSection, setActivePortalSection] = useState<'requests' | 'safety_file' | 'compliance_tracker' | 'compliance_timeline' | 'statutory_forms' | 'compliance_calendar' | 'zoom_consultations' | 'appointments' | 'sans_legal_hub'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActivePortalSection(initialSection);
    }
  }, [initialSection]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'safety_file' | 'coc_tracker' | 'compliance_timeline' | 'statutory_forms' | 'zoom_consultations' | 'appointments' | 'reports' | 'documents' | 'videos' | 'timeline' | 'messages' | 'visits' | 'calendar'>('safety_file');
  const [videoStatusFilter, setVideoStatusFilter] = useState<string>('all');
  const [newMessageText, setNewMessageText] = useState('');

  // Unauthenticated client auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regFullName, setRegFullName] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Fire Detection Safety File state
  const [safetyFiles, setSafetyFiles] = useState<SafetyFile[]>(() => safetyFileService.getAllSafetyFiles());
  const [safetyFileSubModule, setSafetyFileSubModule] = useState<'dashboard' | 'cover' | 'audit'>('dashboard');
  const [activeCoverSafetyFile, setActiveCoverSafetyFile] = useState<SafetyFile | null>(() => safetyFiles[0] || null);
  const [selectedSafetyFileForViewer, setSelectedSafetyFileForViewer] = useState<SafetyFile | null>(null);
  const [selectedSafetyFileForPrint, setSelectedSafetyFileForPrint] = useState<SafetyFile | null>(null);
  const [selectedSafetyFileForEmail, setSelectedSafetyFileForEmail] = useState<SafetyFile | null>(null);
  const [safetyFileSearchQuery, setSafetyFileSearchQuery] = useState('');
  const [safetyFileStatusFilter, setSafetyFileStatusFilter] = useState<string>('all');

  // Zoom and Google Calendar appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    calendarZoomService.getAppointments('customer', currentUser?.id || 'client-001')
  );
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<string>('all');
  const [isScheduleAppointmentOpen, setIsScheduleAppointmentOpen] = useState(false);
  const [selectedAppointmentForPpt, setSelectedAppointmentForPpt] = useState<Appointment | null>(null);
  const [selectedAppointmentForOutcome, setSelectedAppointmentForOutcome] = useState<Appointment | null>(null);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState<Appointment | null>(null);
  const [rescheduleMode, setRescheduleMode] = useState<'reschedule' | 'cancel'>('reschedule');
  const [appointmentToast, setAppointmentToast] = useState<string | null>(null);

  // AI Meeting Minutes & Consent Modals State
  const [consentModalAppointment, setConsentModalAppointment] = useState<Appointment | null>(null);
  const [viewerMinutesId, setViewerMinutesId] = useState<string | null>(null);
  const [correctionTargetVersion, setCorrectionTargetVersion] = useState<MeetingMinutesVersion | null>(null);
  const [selectedAppointmentForVersionHistory, setSelectedAppointmentForVersionHistory] = useState<Appointment | null>(null);

  const showApptToast = (msg: string) => {
    setAppointmentToast(msg);
    setTimeout(() => setAppointmentToast(null), 4000);
  };

  const refreshAppointments = () => {
    setAppointments(calendarZoomService.getAppointments('customer', currentUser?.id || 'client-001'));
  };

  // Filter requests for the current customer or display all demo customer requests
  const userRequests = serviceRequests.filter(req => {
    const matchesUser = currentUser?.role === 'customer'
      ? (req.customerId === currentUser.id || req.email.toLowerCase() === currentUser.email.toLowerCase() || req.organisationName === currentUser.organisationName)
      : true; // Admins / Staff see all in simulator

    const matchesSearch =
      req.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesUser && matchesSearch && matchesStatus;
  });

  const activeRequest: ServiceRequest | undefined = selectedRequestId
    ? serviceRequests.find(r => r.id === selectedRequestId || r.referenceNumber === selectedRequestId)
    : userRequests[0];

  // Filter videos for the active service request (or all customer videos)
  const activeRequestVideos = serviceVideos.filter(v => {
    const matchesReq = activeRequest ? (v.serviceRequestId === activeRequest.id || v.serviceRequestRef === activeRequest.referenceNumber) : true;
    const matchesCustomer = currentUser?.role === 'customer' ? v.isCustomerVisible : true;
    const matchesStatus = videoStatusFilter === 'all' ? true : v.reviewStatus === videoStatusFilter;
    return matchesReq && matchesCustomer && matchesStatus;
  });

  // Technical documents count for active request
  const activeRequestTechnicalDocs = technicalDocuments.filter(d => {
    const matchesReq = activeRequest ? (d.serviceRequestId === activeRequest.id || d.serviceRequestRef === activeRequest.referenceNumber) : true;
    const matchesCustomer = currentUser?.role === 'customer' ? d.isCustomerVisible : true;
    return matchesReq && matchesCustomer;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !newMessageText.trim()) return;
    addCustomerMessage(activeRequest.id, newMessageText.trim());
    setNewMessageText('');
  };

  const handleOpenUploadDoc = () => {
    if (activeRequest) {
      setPreselectedRequestIdForDoc(activeRequest.id);
    }
    setIsUploadDocModalOpen(true);
  };

  const handleOpenUploadVideo = () => {
    if (activeRequest) {
      setPreselectedRequestIdForVideo(activeRequest.id);
    }
    setIsUploadVideoModalOpen(true);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Site survey scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quotation issued':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Work in progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[85vh] bg-[#071322] text-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#0D213F] border-2 border-slate-700 rounded-sm p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-950/80 border-2 border-[#CC0000] text-[#CC0000] mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Registered &amp; Logged-In Clients Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Client Portal &amp; SANS Legal Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              In accordance with South African National Standards statutory compliance governance, the Client Dashboard, 16-section Fire Detection Safety Files, and the SANS Legal Hub are restricted exclusively to registered and logged-in commercial clients.
            </p>
          </div>

          <div className="bg-[#071322] p-1.5 rounded-sm flex border border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In as Commercial Client
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Facility Account
            </button>
          </div>

          {authMode === 'login' ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Client Account (Commercial Partner)</span>
                </div>
                <p className="text-slate-300">
                  Account: <strong className="text-white">Marcus Ndlovu</strong> (Tshwane Logistics Park)
                </p>
                <p className="text-slate-400 text-[11px]">
                  Immediate access to commercial fire safety files, compliance dossiers, and the SANS Legal Hub on your Client Dashboard.
                </p>
              </div>

              <button
                id="btn-login-commercial-client"
                onClick={() => switchRole('customer')}
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono font-bold uppercase text-xs tracking-wider py-3 px-4 rounded-sm transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In &amp; Open Client Dashboard</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!regFullName.trim() || !regEmail.trim()) return;
                registerUser(
                  regFullName.trim(),
                  regEmail.trim(),
                  regOrgName.trim() || 'Commercial Property Partner',
                  regPhone.trim() || '071 415 6665'
                );
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Representative Full Name *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Marcus Ndlovu"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Company / Facility Name *</label>
                <input
                  type="text"
                  required
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="e.g. Tshwane Logistics Park (Pty) Ltd"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.co.za"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Direct Phone *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="082 555 1290"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono font-bold uppercase text-xs tracking-wider py-3 px-4 rounded-sm transition-all shadow-md cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Register &amp; Open Client Dashboard</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <button
              onClick={() => setActiveView('home')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Public Website
            </button>
            <div className="text-slate-500 text-[11px]">
              Audrin Fire Engineers • Registered Client Verification
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Portal Header */}
      <section className="bg-[#0A192F] text-white py-10 sm:py-12 border-b-4 border-[#CC0000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-mono text-slate-200 font-bold mb-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Audrin Client Portal • SANS 10139 Compliance &amp; Request Operations</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                Customer Service Portal
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-mono">
                Authenticated Account: <strong className="text-white">{currentUser?.fullName || 'Client User'}</strong> ({currentUser?.organisationName || 'Client Organisation'})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                id="btn-quick-sans-legal-hub"
                data-testid="btn-quick-sans-legal-hub"
                onClick={() => setActivePortalSection('sans_legal_hub')}
                className={`inline-flex items-center gap-1.5 border px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  activePortalSection === 'sans_legal_hub'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40 text-amber-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>SANS Legal Hub</span>
              </button>

              <button
                onClick={() => {
                  setPreselectedSiteForSchedule(null);
                  setIsScheduleInspectionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Schedule SANS Inspection</span>
              </button>

              <button
                onClick={handleOpenUploadDoc}
                className="inline-flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Upload CAD / Vault</span>
              </button>

              <button
                onClick={() => {
                  if (activeRequest) {
                    setPreselectedRequestIdForReport(activeRequest.id);
                  }
                  setIsSubmitBeforeWorkModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Pre-Work</span>
              </button>

              <button
                onClick={() => {
                  if (activeRequest) {
                    setPreselectedRequestIdForReport(activeRequest.id);
                  }
                  setIsSubmitPostWorkModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Post-Work</span>
              </button>

              <button
                onClick={handleOpenUploadVideo}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#CC0000]" />
                <span>Video Evidence</span>
              </button>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A30000] text-white px-4 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>New Request</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-700/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActivePortalSection('requests')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'requests'
                  ? 'bg-white text-[#0A192F] shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#CC0000]" />
              <span>Service Requests &amp; Vault ({userRequests.length})</span>
            </button>

            <button
              id="btn-nav-safety-files"
              onClick={() => setActivePortalSection('safety_file')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'safety_file'
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:text-white border border-emerald-400/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fire Detection Safety Files ({safetyFiles.length})</span>
              <span className="bg-emerald-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                16 Sections
              </span>
            </button>

            <button
              onClick={() => setActivePortalSection('compliance_tracker')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'compliance_tracker'
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>COC Compliance Progress &amp; Sign-Off</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                Action Required
              </span>
            </button>

            <button
              onClick={() => setActivePortalSection('compliance_timeline')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'compliance_timeline'
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>SANS 10139 Compliance Timeline</span>
              <span className="bg-emerald-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                Cycles &amp; Deadlines
              </span>
            </button>

            <button
              onClick={() => setActivePortalSection('statutory_forms')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'statutory_forms'
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4 text-[#FFB703]" />
              <span>SANS Statutory Forms &amp; Compliance Vault</span>
              <span className="bg-[#FFB703] text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                4 SANS Books
              </span>
            </button>

            <button
              onClick={() => setActivePortalSection('compliance_calendar')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'compliance_calendar'
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-300" />
              <span>SANS 10139 Compliance Calendar ({complianceInspections.length})</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                Active
              </span>
            </button>

            <button
              id="btn-nav-appointments"
              data-testid="btn-nav-zoom-consultations"
              onClick={() => setActivePortalSection('appointments')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'appointments' || activePortalSection === 'zoom_consultations'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 hover:text-white border border-blue-400/30'
              }`}
            >
              <Video className="w-4 h-4 text-blue-400" />
              <span>Appointments ({appointments.length})</span>
              <span className="bg-emerald-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                {appointments.filter(a => a.status === 'confirmed').length} Confirmed
              </span>
            </button>

            <button
              id="btn-nav-sans-legal-hub"
              data-testid="btn-nav-sans-legal-hub"
              onClick={() => setActivePortalSection('sans_legal_hub')}
              className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activePortalSection === 'sans_legal_hub'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 hover:text-white border border-amber-400/30'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>SANS Legal &amp; Regulatory Hub</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                Client Access
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Portal Dashboard Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Push Alert Permission & SLA Watchdog Banner */}
        <PushNotificationPermissionBanner className="mb-6" />

        {activePortalSection === 'sans_legal_hub' ? (
          <div className="space-y-6">
            <LegalView isEmbedded={true} />
          </div>
        ) : activePortalSection === 'safety_file' ? (
          <div className="space-y-5 font-sans">
            {/* 3-Module Sub-Navigation Header */}
            <div className="bg-slate-900 border-2 border-slate-800 p-2 sm:p-2.5 rounded-xs shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  id="btn-submodule-dashboard"
                  onClick={() => setSafetyFileSubModule('dashboard')}
                  className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    safetyFileSubModule === 'dashboard'
                      ? 'bg-[#CC0000] text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>1. Safety File Dashboard</span>
                </button>

                <button
                  id="btn-submodule-cover"
                  onClick={() => setSafetyFileSubModule('cover')}
                  className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    safetyFileSubModule === 'cover'
                      ? 'bg-[#CC0000] text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>2. Statutory Cover &amp; 5-Role Matrix</span>
                </button>

                <button
                  id="btn-submodule-audit"
                  onClick={() => setSafetyFileSubModule('audit')}
                  className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    safetyFileSubModule === 'audit'
                      ? 'bg-[#CC0000] text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>3. Compliance Audit Trail</span>
                </button>
              </div>

              {/* Cover Page Project Picker when on Cover sub-module */}
              {safetyFileSubModule === 'cover' && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-slate-400 text-[11px] hidden md:inline">Project Dossier:</span>
                  <select
                    value={activeCoverSafetyFile?.id || ''}
                    onChange={e => {
                      const found = safetyFiles.find(f => f.id === e.target.value);
                      if (found) setActiveCoverSafetyFile(found);
                    }}
                    className="py-1.5 px-2.5 bg-slate-800 border border-slate-700 rounded-xs text-white font-bold text-xs focus:outline-none"
                  >
                    {safetyFiles.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.safetyFileNumber} - {f.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Sub-Module 1: Safety File Dashboard */}
            {safetyFileSubModule === 'dashboard' && (
              <SafetyFileDashboard
                safetyFiles={safetyFiles}
                onOpenSafetyFile={file => {
                  setActiveCoverSafetyFile(file);
                  setSelectedSafetyFileForViewer(file);
                }}
                onPrintPreview={file => setSelectedSafetyFileForPrint(file)}
                onDownloadPdf={file => setSelectedSafetyFileForPrint(file)}
                onEmail={file => setSelectedSafetyFileForEmail(file)}
                onViewComplianceAudit={() => setSafetyFileSubModule('audit')}
                onViewCover={file => {
                  setActiveCoverSafetyFile(file);
                  setSafetyFileSubModule('cover');
                }}
                currentUserRole={currentUser?.role || 'customer'}
                currentUserName={currentUser?.fullName || 'Client Safety Officer'}
              />
            )}

            {/* Sub-Module 2: Statutory Cover & 5-Role Matrix */}
            {safetyFileSubModule === 'cover' && (
              <div className="space-y-4">
                <SafetyFileCover
                  safetyFile={activeCoverSafetyFile || safetyFiles[0]}
                  onPrint={() => setSelectedSafetyFileForPrint(activeCoverSafetyFile || safetyFiles[0])}
                  onDownloadPdf={() => setSelectedSafetyFileForPrint(activeCoverSafetyFile || safetyFiles[0])}
                />
              </div>
            )}

            {/* Sub-Module 3: Cryptographic Compliance Audit Trail */}
            {safetyFileSubModule === 'audit' && (
              <div className="space-y-4">
                <ComplianceAuditLog
                  onViewSafetyFile={sfNum => {
                    const found = safetyFiles.find(f => f.safetyFileNumber === sfNum);
                    if (found) {
                      setActiveCoverSafetyFile(found);
                      setSelectedSafetyFileForViewer(found);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : activePortalSection === 'compliance_tracker' ? (
          <div className="space-y-6">
            <ComplianceProgressTracker />
          </div>
        ) : activePortalSection === 'compliance_timeline' ? (
          <div className="space-y-6">
            <SANS10139ComplianceTimeline />
          </div>
        ) : activePortalSection === 'statutory_forms' ? (
          <div className="space-y-6">
            <StatutoryFormsVault />
          </div>
        ) : activePortalSection === 'compliance_calendar' ? (
          <div className="space-y-6">
            <ComplianceCalendar />
          </div>
        ) : activePortalSection === 'zoom_consultations' || activePortalSection === 'appointments' ? (
          <div className="space-y-6">
            {/* Appointment feedback toast */}
            {appointmentToast && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{appointmentToast}</span>
                </div>
                <button onClick={() => setAppointmentToast(null)} className="text-emerald-400 hover:text-white text-xs cursor-pointer">Dismiss</button>
              </div>
            )}

            {/* Header & Metric Summary Cards for Appointments */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-mono font-bold uppercase">
                      Zoom PMI & Google Calendar
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-mono font-bold uppercase">
                      SANS 10139 Consultations
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      AI Meeting Minutes
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wide">Appointments & Remote Reviews</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    View and manage confirmed remote engineering reviews, live Zoom sessions, and SANS 10139 consultations. Meeting credentials remain encrypted and masked until authenticated reveal.
                  </p>
                </div>

                <button
                  id="btn-customer-schedule-consultation"
                  onClick={() => setIsScheduleAppointmentOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-950/60 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request Zoom Consultation</span>
                </button>
              </div>

              {/* Statistical Indicators Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Confirmed Meetings
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Live Zoom PMI Ready</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Google Calendar
                  </div>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                    {appointments.filter(a => a.googleCalendarHtmlLink).length || appointments.length}
                  </div>
                  <div className="text-[10px] text-slate-500">Synced Real-Time</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Encrypted Access
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    100%
                  </div>
                  <div className="text-[10px] text-slate-500">Masked IDs & Passcodes</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-orange-400" />
                    S3 Presentations
                  </div>
                  <div className="text-xl font-bold font-mono text-orange-400 mt-1">
                    {appointments.filter(a => a.hasPowerPoint).length}
                  </div>
                  <div className="text-[10px] text-slate-500">SANS 10139 Slides</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appointmentSearchQuery}
                    onChange={e => setAppointmentSearchQuery(e.target.value)}
                    placeholder="Search appointments by title, reference, site name, purpose, or engineer..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {appointmentSearchQuery && (
                    <button
                      onClick={() => setAppointmentSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Consultation Type Selector */}
                <div className="w-full sm:w-auto">
                  <select
                    value={appointmentTypeFilter}
                    onChange={e => setAppointmentTypeFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Consultation Types</option>
                    <option value="pre_work_review">Pre-Work Site Review</option>
                    <option value="post_work_presentation">Post-Work Report Presentation</option>
                    <option value="fault_consultation">Fault & Failure Consultation</option>
                    <option value="site_survey_planning">Site Survey Planning</option>
                    <option value="design_review">Design & SANS 10139 Review</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold mr-1">Status:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'rescheduled', label: 'Rescheduled' },
                  { id: 'cancelled', label: 'Cancelled' },
                ].map(tab => {
                  const count = tab.id === 'all'
                    ? appointments.length
                    : appointments.filter(a => a.status === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAppointmentStatusFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        appointmentStatusFilter === tab.id
                          ? 'bg-[#0A192F] text-white shadow-sm font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appointments list */}
            {(() => {
              const filteredList = appointments.filter(appt => {
                const matchesSearch =
                  appt.title.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                  appt.serviceRequestRef.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                  appt.siteName.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                  appt.purpose.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                  appt.assignedStaffName.toLowerCase().includes(appointmentSearchQuery.toLowerCase());

                const matchesStatus =
                  appointmentStatusFilter === 'all' || appt.status === appointmentStatusFilter;

                const matchesType =
                  appointmentTypeFilter === 'all' || appt.appointmentType === appointmentTypeFilter;

                return matchesSearch && matchesStatus && matchesType;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 space-y-4">
                    <Video className="w-12 h-12 text-slate-300 mx-auto" />
                    <div>
                      <p className="font-mono font-bold text-slate-800 text-base">No Matching Zoom Consultations</p>
                      <p className="text-xs text-slate-500 font-sans mt-1 max-w-md mx-auto">
                        No appointments match your filter criteria. You can clear filters or schedule a new consultation with our certified fire engineers.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      {(appointmentSearchQuery || appointmentStatusFilter !== 'all' || appointmentTypeFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setAppointmentSearchQuery('');
                            setAppointmentStatusFilter('all');
                            setAppointmentTypeFilter('all');
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                      <button
                        onClick={() => setIsScheduleAppointmentOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase px-4 py-2 rounded-lg cursor-pointer shadow-md shadow-blue-900/30"
                      >
                        + Request Consultation
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredList.map(appt => (
                    <ZoomPmiControlCard
                      key={appt.id}
                      appointment={appt}
                      userRole="customer"
                      currentUserId={currentUser?.id || 'client-001'}
                      currentUserName={currentUser?.fullName || 'Client User'}
                      onReschedule={target => {
                        setSelectedAppointmentForReschedule(target);
                        setRescheduleMode('reschedule');
                      }}
                      onCancel={target => {
                        setSelectedAppointmentForReschedule(target);
                        setRescheduleMode('cancel');
                      }}
                      onRecordOutcome={target => setSelectedAppointmentForOutcome(target)}
                      onOpenPowerPoint={target => setSelectedAppointmentForPpt(target)}
                      onOpenConsent={target => setConsentModalAppointment(target)}
                      onOpenMinutes={(target, minId) => setViewerMinutesId(minId)}
                      onOpenVersionHistory={(target, minId) => setSelectedAppointmentForVersionHistory(target)}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Requests List & Search */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search & Filter Header */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ref, site name, service..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-slate-200 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono pb-1 no-scrollbar">
                {['all', 'Submitted', 'Under review', 'Site survey scheduled', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#0A192F] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Cards List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {userRequests.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-sm p-6">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-700 font-mono uppercase">No matching requests</p>
                  <p className="text-xs text-slate-500 mt-1">Submit a new service request to track progress here.</p>
                </div>
              ) : (
                userRequests.map((req) => {
                  const isSelected = activeRequest?.id === req.id;
                  const reqVideosCount = serviceVideos.filter(v => v.serviceRequestId === req.id || v.serviceRequestRef === req.referenceNumber).length;
                  const reqDocsCount = technicalDocuments.filter(d => (d.serviceRequestId === req.id || d.serviceRequestRef === req.referenceNumber) && (currentUser?.role === 'customer' ? d.isCustomerVisible : true)).length;

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-4 rounded-sm border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-l-4 border-l-[#CC0000] border-t-2 border-r-2 border-b-2 border-[#0A192F] shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs text-[#0A192F]">
                          {req.referenceNumber}
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-[#0A192F] mb-1 uppercase line-clamp-1">
                        {req.siteName}
                      </h4>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                        {req.serviceTitle}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          {reqDocsCount > 0 && (
                            <span className="flex items-center gap-1 text-cyan-700 font-bold">
                              <Layers className="w-3 h-3" />
                              <span>{reqDocsCount} doc{reqDocsCount > 1 ? 's' : ''}</span>
                            </span>
                          )}
                          {reqVideosCount > 0 && (
                            <span className="flex items-center gap-1 text-[#CC0000] font-bold">
                              <Video className="w-3 h-3" />
                              <span>{reqVideosCount}</span>
                            </span>
                          )}
                          <span className="text-[#0A192F] font-bold flex items-center gap-0.5">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Selected Request Details & Interactive Tabs */}
          <div className="lg:col-span-7">
            {activeRequest ? (
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                
                {/* Detail Header */}
                <div className="bg-[#0A192F] text-white p-6 space-y-4 border-b-2 border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-black text-sm bg-white/10 px-3 py-1 rounded-sm text-red-400 border border-white/10">
                      {activeRequest.referenceNumber}
                    </span>
                    <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-sm border ${getStatusColor(activeRequest.status)}`}>
                      {activeRequest.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black uppercase text-white mb-1">
                      {activeRequest.siteName}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono">
                      {activeRequest.streetAddress}, {activeRequest.city} • Building: {activeRequest.buildingType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Service Scope:</span>
                      <strong className="text-white text-xs truncate block font-sans">{activeRequest.serviceTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Assigned Engineer:</span>
                      <strong className="text-white text-xs">{activeRequest.assignedStaff || 'Operations Desk'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Urgency:</span>
                      <strong className={activeRequest.urgency === 'urgent_emergency' ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {activeRequest.urgency === 'urgent_emergency' ? 'Critical Emergency' : 'Standard'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 px-4 bg-slate-50 text-xs font-mono font-bold overflow-x-auto no-scrollbar">
                  <button
                    id="tab-btn-request-safety-file"
                    onClick={() => setActiveTab('safety_file')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'safety_file'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safety File (16 Sections)</span>
                    <span className="bg-[#CC0000] text-white text-[9px] px-1.5 py-0.2 rounded font-bold ml-0.5">
                      SANS 10139
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coc_tracker')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'coc_tracker'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Compliance Progress (COC Workflow)</span>
                    <span className="bg-[#CC0000] text-white text-[9px] px-1.5 py-0.2 rounded font-bold ml-0.5">
                      SANS 10139
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('compliance_timeline')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'compliance_timeline'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Compliance Timeline &amp; Cycles</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('statutory_forms')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'statutory_forms'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-[#FFB703]" />
                    <span>Statutory Forms &amp; Certs (4 Books)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'reports'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Condition Reports ({conditionReports.filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber).length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'documents'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Documents &amp; CAD Vault ({activeRequestTechnicalDocs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'videos'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Evidence ({activeRequestVideos.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'timeline'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timeline ({activeRequest.statusHistory.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'messages'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Messages ({activeRequest.customerMessages.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('visits')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'visits'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Visits ({activeRequest.siteVisits.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'calendar'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#CC0000]" />
                    <span>SANS 10139 Calendar ({complianceInspections.filter(i => i.siteName === activeRequest.siteName).length})</span>
                  </button>

                  <button
                    id="tab-btn-request-zoom-consultations"
                    onClick={() => setActiveTab('zoom_consultations')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'zoom_consultations'
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zoom Consultations ({appointments.filter(a => a.serviceRequestId === activeRequest.id || a.serviceRequestRef === activeRequest.referenceNumber).length})</span>
                  </button>
                </div>

                {/* Tab Content Panes */}
                <div className="p-6 text-xs flex-1 min-h-[350px]">
                  
                  {/* TAB: Fire Detection Safety File for Active Request */}
                  {activeTab === 'safety_file' && (
                    <div className="space-y-4">
                      {(() => {
                        const matchingSf = safetyFiles.find(
                          sf => sf.projectId === activeRequest.id ||
                                sf.projectRef === activeRequest.referenceNumber ||
                                sf.projectName.toLowerCase().includes(activeRequest.siteName.toLowerCase())
                        ) || safetyFiles[0];

                        return (
                          <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Site Safety Dossier • {activeRequest.siteName}</span>
                                </h4>
                                <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                                  Complete 16-section SANS 10139 dossier with SAQCC technician registrations, method statements, risk assessments, and commissioner certification.
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedSafetyFileForViewer(matchingSf)}
                                className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#152a4a] text-white font-mono font-bold text-xs uppercase rounded-xs cursor-pointer"
                              >
                                View Complete 16 Sections
                              </button>
                            </div>

                            <SafetyFileCard
                              safetyFile={matchingSf}
                              onOpenSafetyFile={sf => setSelectedSafetyFileForViewer(sf)}
                              onPrintPreview={sf => setSelectedSafetyFileForPrint(sf)}
                              onDownloadPdf={sf => setSelectedSafetyFileForPrint(sf)}
                              onEmail={sf => setSelectedSafetyFileForEmail(sf)}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB: Zoom Consultations & Google Calendar for Active Request */}
                  {activeTab === 'zoom_consultations' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-950/20 border border-blue-200/50 p-4 rounded-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs">
                              Zoom Online Reviews for {activeRequest.referenceNumber}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Remote site-information reviews, drawing reviews, and report presentations synced with Google Calendar.
                          </p>
                        </div>

                        <button
                          onClick={() => setIsScheduleAppointmentOpen(true)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Schedule Review</span>
                        </button>
                      </div>

                      {appointments.filter(a => a.serviceRequestId === activeRequest.id || a.serviceRequestRef === activeRequest.referenceNumber).length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-2">
                          <Video className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="font-mono font-bold text-slate-700 text-xs">No Zoom Consultations for this Request</p>
                          <p className="text-[11px] text-slate-500">
                            Book an approved Zoom consultation for drawing reviews, condition reports, or fire-alarm fault discussions.
                          </p>
                          <button
                            onClick={() => setIsScheduleAppointmentOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-sm mt-2 cursor-pointer"
                          >
                            Schedule Consultation
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {appointments
                            .filter(a => a.serviceRequestId === activeRequest.id || a.serviceRequestRef === activeRequest.referenceNumber)
                            .map(appt => (
                              <ZoomPmiControlCard
                                key={appt.id}
                                appointment={appt}
                                userRole="customer"
                                currentUserId={currentUser?.id || 'client-001'}
                                currentUserName={currentUser?.fullName || 'Client User'}
                                onReschedule={target => {
                                  setSelectedAppointmentForReschedule(target);
                                  setRescheduleMode('reschedule');
                                }}
                                onCancel={target => {
                                  setSelectedAppointmentForReschedule(target);
                                  setRescheduleMode('cancel');
                                }}
                                onOpenPowerPoint={target => setSelectedAppointmentForPpt(target)}
                                onOpenConsent={target => setConsentModalAppointment(target)}
                                onOpenMinutes={(target, minId) => setViewerMinutesId(minId)}
                                onOpenVersionHistory={(target, minId) => setSelectedAppointmentForVersionHistory(target)}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* TAB: Compliance Progress Tracker (COC Approval Workflow) */}
                  {activeTab === 'coc_tracker' && (
                    <div className="space-y-4">
                      <ComplianceProgressTracker
                        serviceRequestId={activeRequest.id}
                        serviceRequestRef={activeRequest.referenceNumber}
                        siteName={activeRequest.siteName}
                        buildingAddress={activeRequest.streetAddress}
                        organisationName={activeRequest.organisationName}
                      />
                    </div>
                  )}

                  {/* TAB: SANS 10139 Compliance Timeline */}
                  {activeTab === 'compliance_timeline' && (
                    <div className="space-y-4">
                      <SANS10139ComplianceTimeline initialSiteFilter={activeRequest.siteName} />
                    </div>
                  )}

                  {/* TAB: Statutory Forms & Compliance Vault */}
                  {activeTab === 'statutory_forms' && (
                    <div className="space-y-4">
                      <StatutoryFormsVault currentRequestId={activeRequest.id} />
                    </div>
                  )}

                  {/* TAB 0: Condition Reports (Pre-Work & Post-Work) */}
                  {activeTab === 'reports' && (
                    <div className="space-y-5">
                      {/* Top Action Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-sm">
                        <div>
                          <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs">
                            Automated Photographic Condition Reports
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Standardised Pre-Work and Post-Work condition records based on submitted site evidence.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPreselectedRequestIdForReport(activeRequest.id);
                              setIsSubmitBeforeWorkModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>+ Pre-Work</span>
                          </button>

                          <button
                            onClick={() => {
                              setPreselectedRequestIdForReport(activeRequest.id);
                              setIsSubmitPostWorkModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>+ Post-Work</span>
                          </button>
                        </div>
                      </div>

                      {/* Disclaimer banner */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-sm flex items-start gap-2.5 text-amber-900 font-mono text-[11px]">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="italic">
                          "This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records visible condition shown in evidence and does not replace a physical site inspection or statutory SANS compliance certificate."
                        </p>
                      </div>

                      {/* Reports List */}
                      {conditionReports.filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber).length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-3">
                          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                          <div>
                            <p className="font-mono font-bold text-slate-700 text-sm">No Condition Reports Generated Yet</p>
                            <p className="text-xs text-slate-500 mt-1 font-sans">
                              Submit before-work photographs to generate an automated Pre-Work Condition Report and trigger client delivery.
                            </p>
                          </div>
                          <div className="flex justify-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setPreselectedRequestIdForReport(activeRequest.id);
                                setIsSubmitBeforeWorkModalOpen(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase px-4 py-2 rounded-sm cursor-pointer"
                            >
                              Submit Before-Work Photos
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conditionReports
                            .filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber)
                            .map((report) => (
                              <div
                                key={report.id}
                                className="p-4 rounded-sm border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                                      report.reportType === 'pre_work'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    }`}>
                                      {report.reportType === 'pre_work' ? 'Pre-Work Condition Report' : 'Post-Work Condition Report'}
                                    </span>
                                    <span className="font-mono font-black text-xs text-[#0A192F]">
                                      {report.referenceNumber}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                      v{report.currentVersionNumber.toFixed(1)}
                                    </span>
                                  </div>

                                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm capitalize ${
                                    report.status === 'acknowledged_by_client'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : report.status === 'more_info_required'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {report.status.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Generated:</span>
                                    <span>{new Date(report.generatedAt).toLocaleDateString('en-ZA')}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Photographic Evidence:</span>
                                    <span className="font-bold text-slate-800">{report.currentVersion.snapshot.photos.length} photos</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Equipment Ref:</span>
                                    <span className="truncate block">{report.equipmentReference}</span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-700 font-sans line-clamp-2 bg-slate-50 p-2 rounded-sm border border-slate-100">
                                  {report.reportSummary}
                                </p>

                                {/* Photo thumbnails preview */}
                                <div className="flex items-center gap-2 overflow-x-auto py-1">
                                  {report.currentVersion.snapshot.photos.slice(0, 4).map((p) => (
                                    <img
                                      key={p.id}
                                      src={p.photoUrl}
                                      alt={p.caption}
                                      className="w-14 h-10 object-cover rounded-sm border border-slate-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                  {report.currentVersion.snapshot.photos.length > 4 && (
                                    <div className="w-14 h-10 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center font-mono text-[10px] text-slate-600 font-bold">
                                      +{report.currentVersion.snapshot.photos.length - 4} more
                                    </div>
                                  )}
                                </div>

                                {/* Footer actions */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Emailed to: {report.clientEmail}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedReportForDetail(report)}
                                      className="px-3 py-1 bg-[#0A192F] hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1 cursor-pointer"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>View Report &amp; PDF</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Technical Documents & CAD Vault */}
                  {activeTab === 'documents' && (
                    <div className="space-y-4">
                      <DocumentEvidenceVault filterByRequestId={activeRequest.id} readOnlyCustomerMode={currentUser?.role === 'customer'} />
                    </div>
                  )}

                  {/* TAB 1: Status Timeline */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-6">
                      <div className="border-l-2 border-slate-200 pl-4 space-y-6 ml-2">
                        {activeRequest.statusHistory.map((item, idx) => (
                          <div key={item.id} className="relative space-y-1">
                            <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-sm bg-[#CC0000] border-2 border-white"></div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-[#0A192F] font-mono">{item.status}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{item.notes}</p>
                            <span className="text-[10px] text-slate-400 font-mono block">Logged by: {item.changedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Video Evidence Gallery */}
                  {activeTab === 'videos' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-sm">
                        <div>
                          <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs">
                            During-Work Video Evidence
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Technical recordings of sensor testing, cabling, and panel status
                          </p>
                        </div>

                        <button
                          onClick={handleOpenUploadVideo}
                          className="px-3.5 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Upload Video</span>
                        </button>
                      </div>

                      {/* Video Status Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                        {[
                          { id: 'all', label: 'All Evidence' },
                          { id: 'awaiting_review', label: 'Awaiting Review' },
                          { id: 'approved', label: 'Approved' },
                          { id: 'included_in_report', label: 'In SANS Report' }
                        ].map((flt) => (
                          <button
                            key={flt.id}
                            onClick={() => setVideoStatusFilter(flt.id)}
                            className={`px-2.5 py-1 rounded-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              videoStatusFilter === flt.id
                                ? 'bg-[#0A192F] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {flt.label}
                          </button>
                        ))}
                      </div>

                      {/* Video Cards Grid */}
                      {activeRequestVideos.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-3">
                          <Video className="w-10 h-10 text-slate-400 mx-auto" />
                          <div>
                            <p className="font-mono font-bold text-slate-700 text-sm">No Video Evidence Uploaded</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Technicians and authorized facility managers can upload site recordings for technical review.
                            </p>
                          </div>
                          <button
                            onClick={handleOpenUploadVideo}
                            className="inline-block bg-[#0A192F] text-white text-xs font-mono font-bold uppercase px-4 py-2 rounded-sm cursor-pointer hover:bg-slate-800"
                          >
                            Upload First Video
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeRequestVideos.map((vid) => (
                            <div
                              key={vid.id}
                              onClick={() => setSelectedVideoForDetail(vid)}
                              className="bg-white border border-slate-200 hover:border-[#CC0000] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
                            >
                              {/* Video Thumbnail with duration and play button */}
                              <div className="relative aspect-video bg-black overflow-hidden">
                                <img
                                  src={vid.thumbnailUrl}
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-[#CC0000]/90 group-hover:bg-[#CC0000] text-white flex items-center justify-center rounded-sm shadow-md transition-transform group-hover:scale-110">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>

                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
                                  {vid.duration}s
                                </span>

                                <span className="absolute top-2 left-2 bg-[#0A192F]/90 text-white text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm">
                                  {vid.category.replace(/_/g, ' ')}
                                </span>
                              </div>

                              {/* Video Meta Body */}
                              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {vid.referenceNumber}
                                    </span>
                                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                                      vid.reviewStatus === 'approved' || vid.reviewStatus === 'included_in_report'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : vid.reviewStatus === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {vid.customerVisibleStatus}
                                    </span>
                                  </div>

                                  <h5 className="font-bold text-xs text-[#0A192F] line-clamp-1 uppercase">
                                    {vid.title}
                                  </h5>

                                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                                    {vid.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <BookmarkPlus className="w-3 h-3 text-[#CC0000]" />
                                    <span>{vid.timestampMarkers.length} Markers</span>
                                  </span>

                                  {vid.includedInReport && (
                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>In Report</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Messages Thread */}
                  {activeTab === 'messages' && (
                    <div className="space-y-4 flex flex-col h-full justify-between">
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {activeRequest.customerMessages.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p>No messages yet. Send a direct query to your assigned fire engineer.</p>
                          </div>
                        ) : (
                          activeRequest.customerMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3.5 rounded-sm text-xs space-y-1 ${
                                msg.senderRole === 'customer'
                                  ? 'bg-red-50 text-slate-800 border border-red-200 ml-6 border-l-4 border-l-[#CC0000]'
                                  : 'bg-slate-100 text-slate-800 mr-6 border border-slate-200 border-l-4 border-l-[#0A192F]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                <strong>{msg.senderName} ({msg.senderRole === 'customer' ? 'Client' : 'Audrin Engineering'})</strong>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-800 font-sans">{msg.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Send Message Form */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type your message or technical question..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-[#0A192F] hover:bg-[#1E293B] text-white px-4 py-2 rounded-sm font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 5: Site Visits */}
                  {activeTab === 'visits' && (
                    <div className="space-y-4">
                      <h4 className="font-mono font-bold uppercase text-[#0A192F]">Scheduled Site Inspections</h4>
                      {activeRequest.siteVisits.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-sm border border-dashed border-slate-200 font-mono">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>No physical site inspections scheduled at this stage.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeRequest.siteVisits.map((v) => (
                            <div key={v.id} className="p-4 rounded-sm bg-slate-50 border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 text-slate-800 space-y-1.5 font-mono text-xs">
                              <div className="flex items-center justify-between font-bold">
                                <span>{v.purpose || 'Site Inspection'} - {v.scheduledDate}</span>
                                <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-200 text-slate-800 rounded-sm">{v.status}</span>
                              </div>
                              <p>Window: <strong>{v.scheduledTimeWindow}</strong></p>
                              <p>Technician: <strong>{v.technicianName}</strong></p>
                              {v.notes && <p className="text-[11px] text-slate-600 font-sans">{v.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: SANS 10139 Compliance Calendar */}
                  {activeTab === 'calendar' && (
                    <div className="space-y-4">
                      <ComplianceCalendar initialSiteFilter={activeRequest.siteName} />
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-slate-400 font-mono">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-base text-slate-700 uppercase">Select a Service Request to view details</p>
              </div>
            )}
          </div>

        </div>
        )}
      </section>

      {/* Appointment Creation Modal */}
      <AppointmentCreateModal
        isOpen={isScheduleAppointmentOpen}
        onClose={() => setIsScheduleAppointmentOpen(false)}
        onSuccess={newAppt => {
          refreshAppointments();
          showApptToast(`Scheduled "${newAppt.title}" and synced to Google Calendar.`);
        }}
        currentUserRole="customer"
        currentUserId={currentUser?.id || 'client-001'}
        currentUserName={currentUser?.fullName || 'Client User'}
        preselectedServiceRequestId={activeRequest?.id}
        preselectedSiteName={activeRequest?.siteName}
      />

      {/* S3 PowerPoint Presentation Viewer */}
      {selectedAppointmentForPpt && (
        <PowerPointPresentationViewerModal
          isOpen={!!selectedAppointmentForPpt}
          onClose={() => setSelectedAppointmentForPpt(null)}
          appointment={selectedAppointmentForPpt}
          currentUserRole="customer"
          currentUserId={currentUser?.id || 'client-001'}
          currentUserName={currentUser?.fullName || 'Client User'}
        />
      )}

      {/* Reschedule / Cancellation Modal */}
      {selectedAppointmentForReschedule && (
        <RescheduleAppointmentModal
          isOpen={!!selectedAppointmentForReschedule}
          onClose={() => setSelectedAppointmentForReschedule(null)}
          appointment={selectedAppointmentForReschedule}
          onSuccess={() => {
            refreshAppointments();
            showApptToast(
              rescheduleMode === 'reschedule'
                ? 'Appointment rescheduled and Google Calendar updated.'
                : 'Appointment cancelled and removed from Google Calendar.'
            );
          }}
          mode={rescheduleMode}
          currentUserRole="customer"
          currentUserId={currentUser?.id || 'client-001'}
          currentUserName={currentUser?.fullName || 'Client User'}
        />
      )}

      {/* Pre-Meeting Participant Recording Consent Modal */}
      {consentModalAppointment && (
        <MeetingConsentModal
          isOpen={!!consentModalAppointment}
          onClose={() => setConsentModalAppointment(null)}
          appointmentId={consentModalAppointment.id}
          appointmentRef={consentModalAppointment.serviceRequestRef}
          serviceRequestId={consentModalAppointment.serviceRequestId}
          serviceRequestRef={consentModalAppointment.serviceRequestRef}
          siteName={consentModalAppointment.siteName}
          userId={currentUser?.id || 'client-001'}
          userName={currentUser?.fullName || 'Client Representative'}
          userEmail={currentUser?.email || 'client@example.com'}
          userRole="customer"
          onConsentSuccess={() => {
            refreshAppointments();
            showApptToast('Meeting recording & transcription consent confirmed.');
            // Automatically launch Zoom meeting join
            calendarZoomService
              .revealZoomMeetingSecret(
                consentModalAppointment.id,
                'join_url',
                currentUser?.id || 'client-001',
                currentUser?.fullName || 'Client User',
                'customer'
              )
              .then(res => {
                if (res.joinUrl) {
                  window.open(res.joinUrl, '_blank', 'noopener,noreferrer');
                }
              })
              .catch(() => {});
          }}
          onConsentDeclined={() => {
            refreshAppointments();
            showApptToast('Consent declined. Automated AI meeting minutes will be disabled.');
          }}
        />
      )}

      {/* AI Meeting Minutes & PDF Viewer Modal */}
      {viewerMinutesId && (
        <MeetingMinutesViewerModal
          isOpen={!!viewerMinutesId}
          onClose={() => setViewerMinutesId(null)}
          minutesId={viewerMinutesId}
          currentUserRole="customer"
          currentUserId={currentUser?.id || 'client-001'}
          currentUserName={currentUser?.fullName || 'Client User'}
          onRequestCorrection={version => {
            setCorrectionTargetVersion(version);
          }}
        />
      )}

      {/* Meeting Minutes Correction / Feedback Modal */}
      {correctionTargetVersion && (
        <MeetingMinutesCorrectionModal
          isOpen={!!correctionTargetVersion}
          onClose={() => setCorrectionTargetVersion(null)}
          targetVersion={correctionTargetVersion}
          currentUserId={currentUser?.id || 'client-001'}
          currentUserName={currentUser?.fullName || 'Client User'}
          currentUserRole="customer"
          onCorrectionSubmitted={() => {
            showApptToast('Correction request submitted to lead fire engineer.');
            refreshAppointments();
          }}
        />
      )}

      {/* Meeting Outcome & Action Item Modal */}
      {selectedAppointmentForOutcome && (
        <MeetingOutcomeModal
          isOpen={!!selectedAppointmentForOutcome}
          onClose={() => setSelectedAppointmentForOutcome(null)}
          appointment={selectedAppointmentForOutcome}
          onSuccess={outcome => {
            refreshAppointments();
            showApptToast(`Meeting outcome and action items saved to PostgreSQL.`);
          }}
          currentUserId={currentUser?.id || 'staff-001'}
          currentUserName={currentUser?.fullName || 'Bethuel Moukangwe (Lead Fire Engineer)'}
        />
      )}

      {/* Minutes Version History Modal */}
      {selectedAppointmentForVersionHistory && (
        <MinutesVersionHistoryModal
          isOpen={!!selectedAppointmentForVersionHistory}
          onClose={() => setSelectedAppointmentForVersionHistory(null)}
          appointment={selectedAppointmentForVersionHistory}
          currentUserRole="customer"
          currentUserId={currentUser?.id || 'client-001'}
          currentUserName={currentUser?.fullName || 'Client User'}
          onViewMinutes={version => {
            setViewerMinutesId(version.minutesId);
          }}
          onRequestCorrection={version => {
            setCorrectionTargetVersion(version);
          }}
        />
      )}

      {/* Safety File 16-Section Interactive Viewer Modal */}
      {selectedSafetyFileForViewer && (
        <SafetyFileViewerModal
          safetyFile={selectedSafetyFileForViewer}
          isOpen={!!selectedSafetyFileForViewer}
          onClose={() => setSelectedSafetyFileForViewer(null)}
          onPrintPreview={sf => setSelectedSafetyFileForPrint(sf)}
          onDownloadPdf={sf => setSelectedSafetyFileForPrint(sf)}
          onEmail={sf => setSelectedSafetyFileForEmail(sf)}
          currentUserRole={currentUser?.role || 'customer'}
          currentUserName={currentUser?.fullName || 'Client Safety Officer'}
          onFileUpdated={updated => {
            setSafetyFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
            setSelectedSafetyFileForViewer(updated);
          }}
        />
      )}

      {/* Safety File Print Preview / PDF Export Modal */}
      {selectedSafetyFileForPrint && (
        <SafetyFilePrintPreviewModal
          safetyFile={selectedSafetyFileForPrint}
          isOpen={!!selectedSafetyFileForPrint}
          onClose={() => setSelectedSafetyFileForPrint(null)}
          onDownloadPdf={sf => {
            window.print();
          }}
        />
      )}

      {/* Safety File Dispatch / Email to Safety Officer Modal */}
      {selectedSafetyFileForEmail && (
        <SafetyFileEmailModal
          safetyFile={selectedSafetyFileForEmail}
          isOpen={!!selectedSafetyFileForEmail}
          onClose={() => setSelectedSafetyFileForEmail(null)}
          currentUserRole={currentUser?.role || 'customer'}
          currentUserName={currentUser?.fullName || 'Client Safety Officer'}
          onSuccess={() => {
            const refreshed = safetyFileService.getAllSafetyFiles();
            setSafetyFiles(refreshed);
          }}
        />
      )}

    </div>
  );
};
