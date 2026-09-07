import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Activity,
  Server,
  Database,
  Mail,
  Users,
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Plus,
  Edit2,
  Calendar,
  Lock,
  RefreshCw,
  Search,
  Headphones,
  Video,
  Play,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  ShieldCheck,
  Radio,
  Download,
  Trash2,
  Sliders,
  Volume2,
  Camera,
  ShieldAlert,
  Copy,
  ExternalLink,
  Layers,
  Cloud,
  HardDrive,
  Terminal
} from 'lucide-react';
import { RequestStatus, ServiceItem, FAQItem, VideoReviewStatus } from '../types';
import { DocumentEvidenceVault } from '../components/DocumentEvidenceVault';
import { PushNotificationPermissionBanner } from '../components/PushNotificationPermissionBanner';
import { AwsCloudArchitectureModal } from '../components/AwsCloudArchitectureModal';
import { AwsArchitectureDiagram } from '../components/AwsArchitectureDiagram';
import { GoogleCalendarZoomAdminHub } from '../components/GoogleCalendarZoomAdminHub';
import { SafetyFileDashboard } from '../components/SafetyFileDashboard';
import { ComplianceAuditLog } from '../components/ComplianceAuditLog';
import { RemedialActionDashboard } from '../components/RemedialActionDashboard';
import { SiteComplianceMap } from '../components/SiteComplianceMap';
import { DeviceRegisterAndLabelManager } from '../components/DeviceRegisterAndLabelManager';
import { TechnicianSchedulingModule } from '../components/TechnicianSchedulingModule';
import { Bell, MapPin, QrCode, CalendarRange } from 'lucide-react';

export const AdminPortalView: React.FC = () => {
  const {
    currentUser,
    serviceRequests,
    updateRequestStatus,
    assignStaffToRequest,
    scheduleSiteVisit,
    addInternalNote,
    emailDeliveryLogs,
    emailTemplates,
    testSendEmailTemplate,
    services,
    updateService,
    toggleServiceActive,
    faqs,
    addFAQ,
    deleteFAQ,
    auditLogs,
    systemMetrics,
    setPreviewEmailLog,
    showToast,
    // Voice AI
    voiceGuideData,
    updateVoiceScript,
    generateNewVoiceAudio,
    updateVoiceConfiguration,
    voiceMetrics,
    // Video Evidence
    serviceVideos,
    videoEvidenceMetrics,
    reviewServiceVideo,
    setSelectedVideoForDetail,
    setIsUploadVideoModalOpen,
    // Automated Condition Reports
    conditionReports,
    conditionReportMetrics,
    setSelectedReportForDetail,
    resendConditionReportEmail,
    setIsSubmitBeforeWorkModalOpen,
    setIsSubmitPostWorkModalOpen,
    setPreselectedRequestIdForReport,
    // Technical Documents & CAD Vault
    technicalDocuments,
    setIsPushCenterOpen,
    // SANS Remedial Actions
    remedialTasks,
    // Device Register & QR Labels
    fireDetectionDevices,
    openDeviceQRGenerator
  } = useApp();

  const [activeSection, setActiveSection] = useState<'remedials' | 'technician_scheduling' | 'site_map' | 'device_qr_codes' | 'requests' | 'reports' | 'safety_files' | 'calendar_zoom' | 'documents' | 'videos' | 'voice' | 'emails' | 'cms' | 'audit' | 'metrics' | 'aws_cloud'>('remedials');
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(serviceRequests[0]?.id || null);

  // Condition reports filter state
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'pre_work' | 'post_work'>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');

  // Status update dialog
  const [newStatus, setNewStatus] = useState<RequestStatus>('Under review');
  const [statusNote, setStatusNote] = useState('');

  // Assign staff
  const [staffName, setStaffName] = useState('Bethuel Moukangwe');
  const [staffEmail, setStaffEmail] = useState('bethuelmoukangwe8@gmail.com');

  // Site visit
  const [visitDate, setVisitDate] = useState('');
  const [visitWindow, setVisitWindow] = useState('09:00 - 12:00');
  const [techName, setTechName] = useState('Thabo Mokoena');
  const [techContact, setTechContact] = useState('071 415 6665');
  const [visitNotes, setVisitNotes] = useState('');

  // Internal Note
  const [internalNoteText, setInternalNoteText] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'normal' | 'high'>('normal');

  // Test Email
  const [testEmailAddress, setTestEmailAddress] = useState('bethuelmoukangwe8@gmail.com');
  const [selectedTemplateId, setSelectedTemplateId] = useState(emailTemplates[0]?.id || '');

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('SANS 10139 Guidelines');

  // Voice AI Admin state
  const [editingVoiceStep, setEditingVoiceStep] = useState<number | 'intro' | 'conclusion'>('intro');
  const [voiceScriptDraft, setVoiceScriptDraft] = useState<string>(voiceGuideData.introduction.text);
  const [voiceSpeedDraft, setVoiceSpeedDraft] = useState<number>(voiceGuideData.configuration.speakingRate);
  const [voiceLocaleDraft, setVoiceLocaleDraft] = useState<string>(voiceGuideData.configuration.languageCode);

  // Video filter in Admin
  const [videoFilterStatus, setVideoFilterStatus] = useState<string>('all');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');

  const selectedRequest = serviceRequests.find(r => r.id === selectedReqId) || serviceRequests[0];

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    updateRequestStatus(selectedRequest.id, newStatus, statusNote);
    setStatusNote('');
  };

  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    assignStaffToRequest(selectedRequest.id, staffName, staffEmail);
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !visitDate) return;
    scheduleSiteVisit(selectedRequest.id, {
      requestId: selectedRequest.id,
      scheduledDate: visitDate,
      scheduledTimeWindow: visitWindow,
      technicianName: techName,
      technicianPhone: techContact,
      status: 'scheduled',
      purpose: 'SANS 10139 Physical Assessment & Survey',
      notes: visitNotes
    });
    setVisitNotes('');
    setVisitDate('');
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !internalNoteText.trim()) return;
    addInternalNote(selectedRequest.id, internalNoteText.trim(), notePriority);
    setInternalNoteText('');
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    testSendEmailTemplate(selectedTemplateId, testEmailAddress);
  };

  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    addFAQ({
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory
    });
    setNewQuestion('');
    setNewAnswer('');
  };

  // Voice AI Handlers
  const handleSaveVoiceScript = (e: React.FormEvent) => {
    e.preventDefault();
    updateVoiceScript(editingVoiceStep, voiceScriptDraft);
    showToast('success', 'Voice Script Updated', `Voice AI narration text for ${editingVoiceStep} saved.`);
  };

  const handleSelectVoiceStepToEdit = (stepKey: number | 'intro' | 'conclusion') => {
    setEditingVoiceStep(stepKey);
    if (stepKey === 'intro') {
      setVoiceScriptDraft(voiceGuideData.introduction.text);
    } else if (stepKey === 'conclusion') {
      setVoiceScriptDraft(voiceGuideData.conclusion.text);
    } else {
      const targetStep = voiceGuideData.steps.find(s => s.stepNumber === stepKey);
      setVoiceScriptDraft(targetStep?.narrationText || '');
    }
  };

  const filteredAdminVideos = serviceVideos.filter(v => {
    const matchesFilter = videoFilterStatus === 'all' ? true : v.reviewStatus === videoFilterStatus;
    const matchesQuery =
      v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      v.referenceNumber.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      v.siteName.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      v.equipmentReference.toLowerCase().includes(videoSearchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Admin Operations Top Bar */}
      <section className="bg-[#0A192F] text-white py-8 border-b-4 border-[#CC0000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-mono text-red-300 font-bold mb-2">
                <Shield className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Django REST Framework • Celery Worker Hub • SANS 10139</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Audrin Fire Engineers Administrative Center
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Authenticated Admin: <strong className="text-white">{currentUser?.fullName}</strong> ({currentUser?.role.toUpperCase()})
              </p>
            </div>

            {/* Health Indicators & AWS / Push Trigger Badges */}
            <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-700 p-2.5 rounded-sm self-start md:self-auto font-mono flex-wrap">
              <button
                type="button"
                id="btn-open-aws-cloud-modal"
                onClick={() => setIsAwsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-bold transition-all cursor-pointer shadow-xs"
                title="Open AWS ECS Fargate & Amazon S3 Production Architecture Hub"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-200" />
                <span>AWS ECS & S3 Hub</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPushCenterOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#CC0000] hover:bg-red-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                title="Open SANS 10139 Browser Push Notification Center & Dispatch Simulator"
              >
                <Bell className="w-3.5 h-3.5 text-[#FFB703] animate-pulse" />
                <span>Push SLA Center</span>
              </button>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>RDS Multi-AZ</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Server className="w-3 h-3 text-emerald-400" />
                <span>ECS: 10 Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Operations Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PushNotificationPermissionBanner className="mb-4" />

        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-mono font-bold no-scrollbar">
          <button
            id="admin-nav-remedials"
            onClick={() => setActiveSection('remedials')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'remedials'
                ? 'bg-[#CC0000] text-white shadow-sm border-b-2 border-b-white'
                : 'bg-red-50 text-red-950 hover:bg-red-100 border border-red-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#CC0000]" />
            <span>SANS Remedial Actions ({remedialTasks.length})</span>
            {remedialTasks.filter(t => t.status === 'pending_assignment').length > 0 && (
              <span className="bg-[#CC0000] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {remedialTasks.filter(t => t.status === 'pending_assignment').length}
              </span>
            )}
          </button>

          <button
            id="admin-nav-technician-scheduling"
            onClick={() => setActiveSection('technician_scheduling')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'technician_scheduling'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-amber-600" />
            <span>Technician Scheduling &amp; Weekly Capacity</span>
          </button>

          <button
            id="admin-nav-site-map"
            onClick={() => setActiveSection('site_map')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'site_map'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Interactive Site Map (8 Sites)</span>
          </button>

          <button
            id="admin-nav-device-qr-codes"
            onClick={() => setActiveSection('device_qr_codes')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'device_qr_codes'
                ? 'bg-[#CC0000] text-white shadow-sm border-b-2 border-b-white'
                : 'bg-red-50 text-red-950 hover:bg-red-100 border border-red-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#CC0000]" />
            <span>QR Device Labels &amp; Logbook ({fireDetectionDevices.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'requests'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Requests ({serviceRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'reports'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Condition Reports ({conditionReports.length})</span>
          </button>

          <button
            id="admin-nav-safety-files"
            onClick={() => setActiveSection('safety_files')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'safety_files'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Files (Site Dossiers)</span>
          </button>

          <button
            id="admin-nav-calendar-zoom"
            onClick={() => setActiveSection('calendar_zoom')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'calendar_zoom'
                ? 'bg-blue-600 text-white shadow-sm border-b-2 border-b-blue-400'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 font-bold'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Google Calendar &amp; Zoom PMI</span>
          </button>

          <button
            onClick={() => setActiveSection('aws_cloud')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'aws_cloud'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-amber-500'
                : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-amber-600" />
            <span>AWS ECS & S3 Architecture</span>
          </button>

          <button
            onClick={() => setActiveSection('documents')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'documents'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Documents & CAD Vault ({technicalDocuments.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('videos')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'videos'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Video className="w-4 h-4 text-[#CC0000]" />
            <span>Video Evidence ({serviceVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('voice')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'voice'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4 text-[#CC0000]" />
            <span>Voice AI & TTS (v{voiceGuideData.version})</span>
          </button>

          <button
            onClick={() => setActiveSection('emails')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'emails'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Automated Email Logs ({emailDeliveryLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('cms')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'cms'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Content CMS (Services & FAQs)</span>
          </button>

          <button
            onClick={() => setActiveSection('audit')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'audit'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Audit & POPIA Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('metrics')}
            className={`px-4 py-2.5 rounded-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'metrics'
                ? 'bg-[#0A192F] text-white shadow-sm border-b-2 border-b-[#CC0000]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry</span>
          </button>
        </div>
      </section>

      {/* SECTION 0: SANS Remedial Actions & Immediate Technician Dispatch */}
      {activeSection === 'remedials' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RemedialActionDashboard />
        </section>
      )}

      {/* SECTION 0.5: SANS 10139 Client Sites Interactive Map Visualization */}
      {activeSection === 'site_map' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SiteComplianceMap />
        </section>
      )}

      {/* SECTION 0.6: SANS 10139 Printable QR Device Labels & Maintenance Logbook */}
      {activeSection === 'device_qr_codes' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DeviceRegisterAndLabelManager />
        </section>
      )}

      {/* SECTION 0.7: SANS 10139 Technician Scheduling & Capacity Hub */}
      {activeSection === 'technician_scheduling' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TechnicianSchedulingModule />
        </section>
      )}

      {/* SECTION 1: Service Requests Management */}
      {activeSection === 'requests' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Request Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Operational Tickets Queue
                </h3>
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 text-xs">
                  {serviceRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedReqId(req.id)}
                        className={`p-3.5 rounded-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0A192F] text-white border-[#CC0000] border-l-4 shadow-md'
                            : 'bg-[#F8F9FA] border-slate-200 hover:bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 font-mono">
                          <span className="font-bold text-xs">{req.referenceNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                            req.urgency === 'urgent_emergency' ? 'bg-[#CC0000] text-white' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {req.urgency === 'urgent_emergency' ? 'EMERGENCY' : req.status}
                          </span>
                        </div>
                        <p className="font-bold text-sm truncate uppercase">{req.siteName}</p>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {req.customerName} • {req.serviceTitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Ticket Action Workspace */}
            <div className="lg:col-span-7 space-y-6">
              {selectedRequest && (
                <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm space-y-6 text-xs">
                  
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-mono font-black text-base text-[#CC0000]">
                        {selectedRequest.referenceNumber}
                      </span>
                      <h2 className="text-lg font-bold text-[#0A192F] uppercase">{selectedRequest.siteName}</h2>
                      <p className="text-slate-500 font-mono">{selectedRequest.customerName} ({selectedRequest.organisationName}) • {selectedRequest.phone}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 uppercase block">Current Status:</span>
                      <strong className="text-sm text-[#0A192F]">{selectedRequest.status}</strong>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Update Status Form */}
                    <form onSubmit={handleUpdateStatus} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3">
                      <h4 className="font-mono font-bold uppercase text-[#0A192F] flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                        <span>1. Progress SANS Lifecycle</span>
                      </h4>
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">New Status:</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under review">Under review</option>
                          <option value="Site survey scheduled">Site survey scheduled</option>
                          <option value="Quotation issued">Quotation issued</option>
                          <option value="Work in progress">Work in progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Status Transition Notes:</label>
                        <textarea
                          rows={2}
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="State actions taken or next deliverable..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white font-mono font-bold uppercase text-xs rounded-sm transition-colors cursor-pointer"
                      >
                        Commit Status Update
                      </button>
                    </form>

                    {/* 2. Assign Staff Form */}
                    <form onSubmit={handleAssignStaff} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3">
                      <h4 className="font-mono font-bold uppercase text-[#0A192F] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>2. Assign Engineer</span>
                      </h4>
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Staff Name:</label>
                        <input
                          type="text"
                          value={staffName}
                          onChange={(e) => setStaffName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Staff Email:</label>
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white font-mono font-bold uppercase text-xs rounded-sm transition-colors cursor-pointer"
                      >
                        Assign Lead Technician
                      </button>
                    </form>

                    {/* 3. Schedule Site Visit */}
                    <form onSubmit={handleScheduleVisit} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3 md:col-span-2">
                      <h4 className="font-mono font-bold uppercase text-[#0A192F] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>3. Schedule SANS 10139 Physical Assessment / Inspection Visit</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Inspection Date *</label>
                          <input
                            type="date"
                            required
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Time Window</label>
                          <input
                            type="text"
                            value={visitWindow}
                            onChange={(e) => setVisitWindow(e.target.value)}
                            placeholder="09:00 - 12:00"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Field Technician</label>
                          <input
                            type="text"
                            value={techName}
                            onChange={(e) => setTechName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold uppercase text-xs rounded-sm transition-colors cursor-pointer"
                      >
                        Dispatch Schedule Confirmation Email
                      </button>
                    </form>

                    {/* 4. Automated Condition Reports Quick Panel */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3 md:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div>
                          <h4 className="font-mono font-bold uppercase text-[#0A192F] flex items-center gap-1.5 text-xs">
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>4. Automated Condition Reports (Pre-Work & Post-Work)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Auto-compiled PDF reports based on submitted photographic evidence.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreselectedRequestIdForReport(selectedRequest.id);
                              setIsSubmitBeforeWorkModalOpen(true);
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>+ Pre-Work Report</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreselectedRequestIdForReport(selectedRequest.id);
                              setIsSubmitPostWorkModalOpen(true);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>+ Post-Work Report</span>
                          </button>
                        </div>
                      </div>

                      {/* Linked Reports list for this request */}
                      {conditionReports.filter(r => r.serviceRequestId === selectedRequest.id || r.serviceRequestRef === selectedRequest.referenceNumber).length === 0 ? (
                        <p className="text-xs text-slate-500 font-mono italic py-2">
                          No condition reports generated for this request yet. Click above to submit photographic evidence and generate report.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {conditionReports
                            .filter(r => r.serviceRequestId === selectedRequest.id || r.serviceRequestRef === selectedRequest.referenceNumber)
                            .map((rep) => (
                              <div
                                key={rep.id}
                                className="p-3 bg-white border border-slate-200 rounded-sm space-y-2 hover:border-slate-300 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                                    rep.reportType === 'pre_work' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                                  }`}>
                                    {rep.reportType === 'pre_work' ? 'Pre-Work' : 'Post-Work'}
                                  </span>
                                  <span className="font-mono font-bold text-xs text-[#0A192F]">{rep.referenceNumber}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-sans line-clamp-2">{rep.reportSummary}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono">
                                  <span className="text-slate-500">{rep.currentVersion.snapshot.photos.length} Photos</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReportForDetail(rep)}
                                    className="text-[#CC0000] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <span>Inspect Report</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* SECTION: Automated Pre-Work & Post-Work Condition Reports Desk */}
      {activeSection === 'reports' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Total Reports Generated</span>
              <p className="text-2xl font-black text-[#0A192F] mt-1">{conditionReportMetrics.totalReportsGenerated}</p>
              <p className="text-slate-500 text-[11px]">{conditionReportMetrics.preWorkReportsCount} Pre / {conditionReportMetrics.postWorkReportsCount} Post</p>
            </div>

            <div className="bg-white border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Pre-Work Condition Reports</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{conditionReportMetrics.preWorkReportsCount}</p>
              <p className="text-amber-700 text-[11px]">Before-work baseline records</p>
            </div>

            <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Post-Work Condition Reports</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{conditionReportMetrics.postWorkReportsCount}</p>
              <p className="text-emerald-800 text-[11px]">Work completed records</p>
            </div>

            <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Client Acknowledged Rate</span>
              <p className="text-2xl font-black text-[#CC0000] mt-1">{conditionReportMetrics.acknowledgedRate}%</p>
              <p className="text-slate-500 text-[11px]">Avg. Delivery: {conditionReportMetrics.averageDeliveryTimeMinutes}m</p>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  placeholder="Filter by ref, site, client, engineer..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-slate-200 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono no-scrollbar">
                {[
                  { id: 'all', label: 'All Stages' },
                  { id: 'pre_work', label: 'Pre-Work' },
                  { id: 'post_work', label: 'Post-Work' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setReportTypeFilter(st.id as any)}
                    className={`px-2.5 py-1.5 rounded-sm font-bold uppercase whitespace-nowrap transition-colors cursor-pointer ${
                      reportTypeFilter === st.id
                        ? 'bg-[#0A192F] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => {
                  setPreselectedRequestIdForReport(selectedReqId || undefined);
                  setIsSubmitBeforeWorkModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Pre-Work Report</span>
              </button>

              <button
                onClick={() => {
                  setPreselectedRequestIdForReport(selectedReqId || undefined);
                  setIsSubmitPostWorkModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+ Post-Work Report</span>
              </button>
            </div>
          </div>

          {/* Disclaimer compliance verification pill */}
          <div className="p-3 bg-slate-900 text-slate-200 border border-slate-800 rounded-sm flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Mandatory Anti-SANS Disclaimer Enforcement:</strong> All reports strictly state photographic-only scope and prohibit compliance certification claims.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Active Enforcement
            </span>
          </div>

          {/* Condition Reports List */}
          <div className="space-y-4">
            {conditionReports
              .filter((rep) => {
                const matchesType = reportTypeFilter === 'all' || rep.reportType === reportTypeFilter;
                const matchesStatus = reportStatusFilter === 'all' || rep.status === reportStatusFilter;
                const matchesQuery =
                  rep.referenceNumber.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                  rep.siteName.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                  rep.clientName.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                  rep.assignedEngineer.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                  rep.equipmentReference.toLowerCase().includes(reportSearchQuery.toLowerCase());
                return matchesType && matchesStatus && matchesQuery;
              })
              .map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-sm border ${
                        rep.reportType === 'pre_work'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {rep.reportType === 'pre_work' ? 'Pre-Work Condition Report' : 'Post-Work Condition Report'}
                      </span>
                      <span className="font-mono font-black text-sm text-[#0A192F]">
                        {rep.referenceNumber}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        v{rep.currentVersionNumber.toFixed(1)}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        • Ticket Ref: <strong>{rep.serviceRequestRef}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-sm ${
                        rep.status === 'acknowledged_by_client'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.status === 'more_info_required'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rep.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Client:</span>
                      <strong className="text-slate-900 truncate block">{rep.clientName}</strong>
                      <span className="text-[10px] text-slate-500 truncate block">{rep.clientEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Facility / Site:</span>
                      <strong className="text-slate-900 truncate block">{rep.siteName}</strong>
                      <span className="text-[10px] text-slate-500 truncate block">{rep.buildingNameArea}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Lead Engineer:</span>
                      <strong className="text-slate-900 truncate block">{rep.assignedEngineer}</strong>
                      <span className="text-[10px] text-slate-500 truncate block">Generated {new Date(rep.generatedAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Evidence Snapshot:</span>
                      <strong className="text-slate-900">{rep.currentVersion.snapshot.photos.length} Photos</strong>
                      <span className="text-[10px] text-slate-500 block">{rep.currentVersion.snapshot.findings.length} findings recorded</span>
                    </div>
                  </div>

                  {/* Summary & Disclaimer */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-800 font-sans leading-relaxed">
                      {rep.reportSummary}
                    </p>

                    {/* Photos Preview */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {rep.currentVersion.snapshot.photos.map((p) => (
                        <div key={p.id} className="relative group shrink-0">
                          <img
                            src={p.photoUrl}
                            alt={p.caption}
                            className="w-20 h-14 object-cover rounded-sm border border-slate-200 group-hover:border-[#CC0000] transition-colors"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-mono px-1 py-0.5 truncate text-center">
                            {p.locationTag || p.equipmentTag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-mono">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>Email Delivery: <strong>{rep.currentVersion.deliveryLogs[0]?.status || 'sent'}</strong></span>
                      {rep.clientAcknowledgedAt && (
                        <span className="text-emerald-700 font-bold">
                          ✓ Acknowledged {new Date(rep.clientAcknowledgedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resendConditionReportEmail(rep.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-slate-500" />
                        <span>Resend Email</span>
                      </button>

                      <button
                        onClick={() => setSelectedReportForDetail(rep)}
                        className="px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold rounded-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Report & PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* SECTION: Fire Detection Safety Files Dashboard (SANS 10139 Dossiers) */}
      {activeSection === 'safety_files' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <SafetyFileDashboard
            currentUserRole={currentUser?.role || 'admin'}
            currentUserName={currentUser?.fullName || 'Senior Fire Engineer'}
            onViewComplianceAudit={() => setActiveSection('audit')}
          />
        </section>
      )}

      {/* SECTION: Technical Documents & CAD Evidence Vault */}
      {activeSection === 'documents' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <DocumentEvidenceVault readOnlyCustomerMode={false} />
        </section>
      )}

      {/* SECTION 2: During-Work Video Evidence Desk */}
      {activeSection === 'videos' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Total Recorded Videos</span>
              <p className="text-2xl font-black text-[#0A192F] mt-1">{videoEvidenceMetrics.totalVideosUploaded}</p>
              <p className="text-slate-500 text-[11px]">{videoEvidenceMetrics.totalStorageConsumedMb} MB Securely Held</p>
            </div>

            <div className="bg-white border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Awaiting Engineering Review</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{videoEvidenceMetrics.awaitingReviewCount}</p>
              <p className="text-amber-700 text-[11px]">Requires staff approval</p>
            </div>

            <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Approved in SANS Reports</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{videoEvidenceMetrics.includedInReportCount}</p>
              <p className="text-emerald-800 text-[11px]">Included in handover packs</p>
            </div>

            <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">FFmpeg / Security Scan</span>
              <p className="text-2xl font-black text-[#CC0000] mt-1">{videoEvidenceMetrics.transcodeSuccessRate}%</p>
              <p className="text-slate-500 text-[11px]">ClamAV Clean & SHA-256 Hashed</p>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  placeholder="Filter by ref, room, equipment..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-slate-200 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono no-scrollbar">
                {['all', 'awaiting_review', 'approved', 'included_in_report', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setVideoFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-sm font-bold uppercase whitespace-nowrap transition-colors cursor-pointer ${
                      videoFilterStatus === st
                        ? 'bg-[#0A192F] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsUploadVideoModalOpen(true)}
              className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload New Evidence</span>
            </button>
          </div>

          {/* Video Table List */}
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A192F] text-white text-[10px] uppercase font-mono font-bold tracking-wider">
                    <th className="p-3">Ref / Thumbnail</th>
                    <th className="p-3">Title & Site Location</th>
                    <th className="p-3">Category & Equipment</th>
                    <th className="p-3">Markers</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
                  {filteredAdminVideos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No video evidence matches your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminVideos.map((vid) => (
                      <tr key={vid.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div
                            onClick={() => setSelectedVideoForDetail(vid)}
                            className="relative w-24 h-14 bg-black rounded-sm overflow-hidden cursor-pointer group"
                          >
                            <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] px-1 font-bold">
                              {vid.duration}s
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">{vid.referenceNumber}</span>
                        </td>

                        <td className="p-3">
                          <p className="font-bold text-slate-900 font-sans text-xs uppercase">{vid.title}</p>
                          <p className="text-[11px] text-slate-500 font-sans">{vid.siteName} — {vid.siteAreaOrRoom}</p>
                          <span className="text-[10px] text-slate-400">Req: {vid.serviceRequestRef} • Uploaded by {vid.uploadedBy}</span>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-slate-800 capitalize block">{vid.category.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-500">{vid.equipmentReference}</span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1 text-[#CC0000] font-bold">
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>{vid.timestampMarkers.length} bookmarked</span>
                          </div>
                          {vid.timestampMarkers.filter(m => m.approvedForReport).length > 0 && (
                            <span className="text-[10px] text-emerald-700 block">
                              {vid.timestampMarkers.filter(m => m.approvedForReport).length} in report pack
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${
                            vid.reviewStatus === 'approved' || vid.reviewStatus === 'included_in_report'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : vid.reviewStatus === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {vid.reviewStatus.replace(/_/g, ' ')}
                          </span>
                          {vid.isLockedAfterReport && (
                            <span className="block text-[9px] text-red-600 font-bold mt-0.5">LOCKED</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedVideoForDetail(vid)}
                              className="px-2.5 py-1 bg-[#0A192F] hover:bg-[#1E293B] text-white text-[10px] uppercase font-bold rounded-sm cursor-pointer"
                            >
                              Review / Play
                            </button>

                            {!vid.isLockedAfterReport && (
                              <button
                                onClick={() => reviewServiceVideo(vid.id, 'included_in_report', 'Approved for SANS 10139 handover pack', '', true, true)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-bold rounded-sm cursor-pointer"
                                title="Approve & Include in SANS Report"
                              >
                                + Report
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: Voice AI Guide Management & Celery TTS */}
      {activeSection === 'voice' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Total Voice AI Sessions</span>
              <p className="text-2xl font-black text-[#0A192F] mt-1">{voiceMetrics.totalPlays}</p>
              <p className="text-slate-500 text-[11px]">Homepage user engagements</p>
            </div>

            <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Completion Rate</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{voiceMetrics.completionRate}%</p>
              <p className="text-emerald-800 text-[11px]">Listened through to Step 7 & CTA</p>
            </div>

            <div className="bg-white border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Celery TTS Engine</span>
              <p className="text-2xl font-black text-[#0A192F] mt-1">v{voiceGuideData.version}</p>
              <p className="text-slate-500 text-[11px]">{voiceGuideData.configuration.engine} ({voiceGuideData.configuration.languageCode})</p>
            </div>

            <div className="bg-white border-l-4 border-l-purple-600 border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Worker Latency</span>
              <p className="text-2xl font-black text-purple-700 mt-1">{voiceMetrics.celeryWorkerLatencyMs}ms</p>
              <p className="text-purple-800 text-[11px]">Average Edge synthesis time</p>
            </div>
          </div>

          {/* Voice Script Editor & TTS Task Trigger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Step Selector (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#0A192F]">
                    7-Step Narration Units
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-[#CC0000] bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">
                    Active: v{voiceGuideData.version}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <button
                    onClick={() => handleSelectVoiceStepToEdit('intro')}
                    className={`w-full text-left p-2.5 rounded-sm border transition-colors cursor-pointer ${
                      editingVoiceStep === 'intro'
                        ? 'bg-[#0A192F] text-white border-[#CC0000] font-bold'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 uppercase">Introduction</span>
                    <span className="truncate block font-sans">{voiceGuideData.introduction.title}</span>
                  </button>

                  {voiceGuideData.steps.map((step) => (
                    <button
                      key={step.stepNumber}
                      onClick={() => handleSelectVoiceStepToEdit(step.stepNumber)}
                      className={`w-full text-left p-2.5 rounded-sm border transition-colors cursor-pointer ${
                        editingVoiceStep === step.stepNumber
                          ? 'bg-[#0A192F] text-white border-[#CC0000] font-bold'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-[10px] text-slate-400 uppercase">Step 0{step.stepNumber}</span>
                      <span className="truncate block font-sans">{step.title}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => handleSelectVoiceStepToEdit('conclusion')}
                    className={`w-full text-left p-2.5 rounded-sm border transition-colors cursor-pointer ${
                      editingVoiceStep === 'conclusion'
                        ? 'bg-[#0A192F] text-white border-[#CC0000] font-bold'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 uppercase">Conclusion & CTA</span>
                    <span className="truncate block font-sans">{voiceGuideData.conclusion.title}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Script Editor & Synthesis Actions (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <form onSubmit={handleSaveVoiceScript} className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#CC0000]">
                      Editing Narration Script
                    </span>
                    <h3 className="text-sm font-black uppercase text-[#0A192F]">
                      {editingVoiceStep === 'intro' ? 'Introduction' : editingVoiceStep === 'conclusion' ? 'Conclusion & CTA' : `Step ${editingVoiceStep}`}
                    </h3>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    SANS 10139 Code Aligned
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                    Narration Script Text (Spoken by AI Voice Guide):
                  </label>
                  <textarea
                    rows={4}
                    value={voiceScriptDraft}
                    onChange={(e) => setVoiceScriptDraft(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-slate-300 p-3 text-sm text-slate-900 rounded-sm font-serif leading-relaxed focus:outline-none focus:border-[#CC0000]"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                    >
                      Save Script Draft
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => generateNewVoiceAudio()}
                    className="px-5 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Synthesize New Audio (Celery Task)</span>
                  </button>
                </div>
              </form>

              {/* Voice Configuration Panel */}
              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm space-y-3 text-xs font-mono">
                <h4 className="font-bold uppercase text-[#0A192F] flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-[#CC0000]" />
                  <span>Speech Synthesis Configuration (TTS Engine)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Locale & Accent</label>
                    <select
                      value={voiceLocaleDraft}
                      onChange={(e) => {
                        setVoiceLocaleDraft(e.target.value);
                        updateVoiceConfiguration({ languageCode: e.target.value });
                      }}
                      className="w-full bg-[#F8F9FA] border border-slate-300 p-2 text-xs rounded-sm"
                    >
                      <option value="en-ZA">South African English (en-ZA)</option>
                      <option value="en-GB">British English (en-GB)</option>
                      <option value="en-US">US English (en-US)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Synthesis Engine</label>
                    <input
                      type="text"
                      disabled
                      value="Edge-TTS / Neural WaveNet"
                      className="w-full bg-slate-100 border border-slate-200 p-2 text-xs rounded-sm text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Target Duration</label>
                    <input
                      type="text"
                      disabled
                      value={`${voiceGuideData.totalDurationSeconds} seconds total`}
                      className="w-full bg-slate-100 border border-slate-200 p-2 text-xs rounded-sm text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Email Logs */}
      {activeSection === 'emails' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* Test Send Box */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-sm p-4 shadow-sm space-y-3">
              <h3 className="font-mono font-bold text-xs uppercase text-[#0A192F]">Test Email Dispatch (Celery)</h3>
              <form onSubmit={handleSendTestEmail} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Select Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-sm font-mono text-xs"
                  >
                    {emailTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.templateType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">Recipient Address</label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-sm font-mono text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                >
                  Trigger Worker Dispatch
                </button>
              </form>
            </div>

            {/* Email Logs Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-mono font-bold text-xs uppercase text-[#0A192F]">
                Celery SMTP Delivery Log ({emailDeliveryLogs.length})
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Recipient</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {emailDeliveryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setPreviewEmailLog(log)}>
                        <td className="p-2.5 text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-2.5 font-bold text-slate-900">{log.recipientEmail}</td>
                        <td className="p-2.5 text-slate-700 max-w-xs truncate font-sans">{log.subject}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm text-[10px] font-bold">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: CMS */}
      {activeSection === 'cms' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs font-mono">
          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#0A192F] uppercase">Manage Frequently Asked Questions (FAQ)</h3>
            <form onSubmit={handleAddFAQ} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Question *</label>
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. How often does SANS 10139 require detector sensitivity testing?"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs"
                  >
                    <option value="SANS 10139 Guidelines">SANS 10139 Guidelines</option>
                    <option value="System Categories (L & P)">System Categories (L & P)</option>
                    <option value="Service & Maintenance">Service & Maintenance</option>
                    <option value="Pricing & Quotations">Pricing & Quotations</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Answer Body *</label>
                <textarea
                  required
                  rows={2}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Provide precise technical answer aligned with SANS 10139..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs font-sans"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0A192F] text-white font-bold rounded-sm uppercase cursor-pointer"
              >
                Add Knowledge Base Item
              </button>
            </form>

            <div className="space-y-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between font-sans">
                  <div className="overflow-hidden pr-3">
                    <p className="font-bold text-slate-900 text-xs">{faq.question}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{faq.answer}</p>
                  </div>
                  <button
                    onClick={() => deleteFAQ(faq.id)}
                    className="text-[#CC0000] hover:text-red-800 font-bold text-xs cursor-pointer font-mono uppercase"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: Audit Logs & Regulatory Traceability */}
      {activeSection === 'audit' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Statutory Compliance Audit Log Component */}
          <ComplianceAuditLog
            onViewSafetyFile={() => {
              setActiveSection('safety_files');
            }}
          />

          {/* Collapsible / Secondary Platform Operations & POPIA Log */}
          <div className="bg-white border-2 border-slate-200 rounded-xs overflow-hidden shadow-2xs text-xs font-mono">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#0A192F] uppercase">
                  Platform Operations &amp; Legacy Web Activity Log
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  General background ticket events, enquiry submissions, and operational telemetry ({auditLogs.length} Records)
                </p>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-xs font-bold uppercase">
                Worker Stream
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Record Key</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-slate-900">{log.actor}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-xs bg-slate-200 text-slate-900 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">{log.model}</td>
                      <td className="p-3 font-bold text-[#CC0000]">{log.recordId}</td>
                      <td className="p-3 text-slate-600 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: Telemetry */}
      {activeSection === 'metrics' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Service Requests</span>
              <p className="text-2xl font-black text-slate-900">{systemMetrics.requestsCountTotal}</p>
              <p className="text-emerald-600 font-medium">{systemMetrics.activeRequestsCount} In Active Engineering Pipeline</p>
            </div>
            <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Emergency Faults</span>
              <p className="text-2xl font-black text-[#CC0000]">{systemMetrics.emergencyFaultsCount}</p>
              <p className="text-red-500 font-medium">Prioritized Triage</p>
            </div>
            <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Automated Emails Dispatched</span>
              <p className="text-2xl font-black text-slate-900">{systemMetrics.emailsSentTotal}</p>
              <p className="text-slate-500 font-medium">100% Celery Delivery Success</p>
            </div>
            <div className="bg-white border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">System Uptime</span>
              <p className="text-2xl font-black text-slate-900">99.98%</p>
              <p className="text-emerald-600 font-medium">Docker / Nginx Microservices Healthy</p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION: Google Calendar & Zoom Personal Meeting Room Administration Hub */}
      {activeSection === 'calendar_zoom' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GoogleCalendarZoomAdminHub
            currentUserRole={currentUser?.role || 'admin'}
            currentUserId={currentUser?.id || 'admin-001'}
            currentUserName={currentUser?.fullName || 'Lead Administrator'}
          />
        </section>
      )}

      {/* SECTION 8: AWS ECS Fargate, S3 & Cloud Architecture */}
      {activeSection === 'aws_cloud' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-400" />
                AWS Production Cloud Architecture & Deployment Control
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Terraform IaC, Amazon ECS Fargate Multi-AZ cluster, S3 Evidence Vault, SNS/SQS event bus, and Docker Hub pipeline.
              </p>
            </div>
            <button
              onClick={() => setIsAwsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Terminal className="w-3.5 h-3.5" />
              Launch Cloud Control Center
            </button>
          </div>

          <AwsArchitectureDiagram onSelectNode={() => setIsAwsModalOpen(true)} />
        </section>
      )}

      {/* AWS Cloud Architecture & ECS Fargate Modal */}
      <AwsCloudArchitectureModal 
        isOpen={isAwsModalOpen} 
        onClose={() => setIsAwsModalOpen(false)} 
      />

    </div>
  );
};

