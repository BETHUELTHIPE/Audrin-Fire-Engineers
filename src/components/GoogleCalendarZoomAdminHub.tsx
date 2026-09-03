import React, { useState } from 'react';
import {
  Calendar,
  Video,
  ShieldCheck,
  Lock,
  Activity,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  Users,
  Server,
  Layers,
  Key,
  ShieldAlert,
  Database,
  Sliders,
  Check,
  Download
} from 'lucide-react';
import {
  Appointment,
  UserRole,
  ZoomSecretConfiguration,
  GoogleCalendarConnection,
  ZoomMeetingAccessLog,
  CalendarSyncJob,
  IntegrationMetrics,
  MeetingOutcome
} from '../types';
import { calendarZoomService } from '../services/calendarZoomService';
import { ZoomPmiControlCard } from './ZoomPmiControlCard';
import { AppointmentCreateModal } from './AppointmentCreateModal';
import { MeetingOutcomeModal } from './MeetingOutcomeModal';
import { PowerPointPresentationViewerModal } from './PowerPointPresentationViewerModal';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { MinutesVersionHistoryModal } from './MinutesVersionHistoryModal';
import { MeetingMinutesViewerModal } from './MeetingMinutesViewerModal';
import { APPOINTMENT_TYPE_LABELS } from '../data/calendarZoomData';

interface GoogleCalendarZoomAdminHubProps {
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const GoogleCalendarZoomAdminHub: React.FC<GoogleCalendarZoomAdminHubProps> = ({
  currentUserRole,
  currentUserId,
  currentUserName
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'gcal_sync' | 'zoom_secrets' | 'audit_logs' | 'metrics'>('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    calendarZoomService.getAppointments(currentUserRole, currentUserId)
  );
  const [zoomSecretConfig, setZoomSecretConfig] = useState<ZoomSecretConfiguration>(() =>
    calendarZoomService.getZoomSecretConfig()
  );
  const [gcalConn, setGcalConn] = useState<GoogleCalendarConnection>(() =>
    calendarZoomService.getGoogleCalendarConnection()
  );
  const [accessLogs, setAccessLogs] = useState<ZoomMeetingAccessLog[]>(() =>
    calendarZoomService.getAccessLogs()
  );
  const [syncJobs, setSyncJobs] = useState<CalendarSyncJob[]>(() =>
    calendarZoomService.getSyncJobs()
  );
  const [metrics, setMetrics] = useState<IntegrationMetrics>(() =>
    calendarZoomService.getMetrics()
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAppointmentForOutcome, setSelectedAppointmentForOutcome] = useState<Appointment | null>(null);
  const [selectedAppointmentForPpt, setSelectedAppointmentForPpt] = useState<Appointment | null>(null);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState<Appointment | null>(null);
  const [rescheduleMode, setRescheduleMode] = useState<'reschedule' | 'cancel'>('reschedule');

  // Notification / Feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = () => {
    setAppointments(calendarZoomService.getAppointments(currentUserRole, currentUserId));
    setAccessLogs(calendarZoomService.getAccessLogs());
    setSyncJobs(calendarZoomService.getSyncJobs());
    setMetrics(calendarZoomService.getMetrics());
  };

  const handleReconcile = async () => {
    try {
      setIsReconciling(true);
      const res = await calendarZoomService.reconcileGoogleCalendar();
      refreshData();
      showToast(`Reconciliation complete: ${res.reconciledCount} events validated with Google Calendar.`);
    } catch (err: any) {
      showToast(`Reconciliation error: ${err.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch =
      appt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.serviceRequestRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.organisationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.siteName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const matchesType = typeFilter === 'all' || appt.appointmentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div id="google-calendar-zoom-admin-hub" className="space-y-6 text-slate-100">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Integration Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Google Calendar & Zoom PMI Administration</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Central orchestration hub for SANS 10139 online appointments, Google Calendar service accounts, AWS Secrets Manager Zoom credentials, Celery sync queues, and meeting outcome audits.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="btn-reconcile-gcal"
            onClick={handleReconcile}
            disabled={isReconciling}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling...' : 'Reconcile Sync'}
          </button>

          <button
            id="btn-create-appointment-modal"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-950/60"
          >
            <Plus className="w-4 h-4" />
            Schedule New Appointment
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments Register ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('gcal_sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'gcal_sync'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Google Calendar & Celery Queue
        </button>

        <button
          onClick={() => setActiveTab('zoom_secrets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'zoom_secrets'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          AWS Secrets & Zoom Security
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit_logs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Trail ({accessLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'metrics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          CloudWatch / Metrics
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS REGISTER */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search appointments by title, client, org, or request ref..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Type:</span>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All SANS 10139 Types</option>
                  {Object.entries(APPOINTMENT_TYPE_LABELS).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List of Appointment Cards */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Appointments Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or schedule a new appointment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(appt => (
                <ZoomPmiControlCard
                  key={appt.id}
                  appointment={appt}
                  userRole={currentUserRole}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
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
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOOGLE CALENDAR & CELERY QUEUE */}
      {activeTab === 'gcal_sync' && (
        <div className="space-y-5">
          {/* Connection Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Google Calendar API Connection</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono">
                  ACTIVE • 2-WAY SYNC
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Account:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[280px]">{gcalConn.serviceAccountEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operational Timezone:</span>
                  <span className="font-mono text-amber-300 font-bold">{gcalConn.primaryTimezone} (SAST / UTC+2)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Push Webhook Channel:</span>
                  <span className="font-mono text-emerald-400 font-semibold">chan-gcal-af-south-1-prod-001</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Audit Reconciled:</span>
                  <span className="font-mono text-slate-300">{new Date(gcalConn.lastSyncAuditAt).toLocaleString('en-ZA')}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Celery Asynchronous Tasks & Webhooks</h3>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-mono">
                  REDIS BROKER
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Queue Worker:</span>
                  <span className="font-mono text-white">celery_calendar_sync_worker (4 concurrency)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scheduled Reminders Beat:</span>
                  <span className="font-mono text-emerald-400">Active (Evaluates every 60s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Webhook Receiver Route:</span>
                  <span className="font-mono text-blue-300 text-[11px]">POST /api/webhooks/google-calendar/</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Idempotency & Retry:</span>
                  <span className="font-mono text-slate-300">Exponential backoff (3 retries max)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Celery Sync Jobs Table */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Celery Calendar Synchronization Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2">Job ID</th>
                    <th className="pb-2">Request Ref</th>
                    <th className="pb-2">Operation Type</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Retries</th>
                    <th className="pb-2">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {syncJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-300">{job.id}</td>
                      <td className="py-2.5 text-blue-400 font-bold">{job.appointmentRef}</td>
                      <td className="py-2.5 uppercase font-semibold text-slate-200">{job.jobType}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          {job.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">{job.retryCount}</td>
                      <td className="py-2.5 text-slate-400">{job.processedAt ? new Date(job.processedAt).toLocaleTimeString('en-ZA') : 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AWS SECRETS & ZOOM SECURITY */}
      {activeTab === 'zoom_secrets' && (
        <div className="space-y-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">AWS Secrets Manager Configuration</h3>
                  <p className="text-xs text-slate-400">Zoom Personal Meeting Room (PMI) secret storage policy</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-xs font-mono">
                AF-SOUTH-1 (CAPE TOWN)
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">AWS Secret ARN:</div>
              <div className="text-emerald-400 break-all">{zoomSecretConfig.secretArn}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold">Masked PMI Pattern</div>
                <div className="font-mono text-sm font-bold text-white">{zoomSecretConfig.pmiMasked}</div>
                <div className="text-[10px] text-slate-500">Unmasked solely via authenticated IAM session</div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold">Masked Passcode Pattern</div>
                <div className="font-mono text-sm font-bold text-white">{zoomSecretConfig.passcodeMasked}</div>
                <div className="text-[10px] text-slate-500">Never stored in frontend local storage</div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold">Rotation Schedule</div>
                <div className="font-mono text-sm font-bold text-white">Every 90 Days</div>
                <div className="text-[10px] text-slate-500">Last rotated: {new Date(zoomSecretConfig.lastRotated).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Security Enforcement Matrix */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zoom Security Hardening Policies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Waiting Room Enabled</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Host Approval on Entry</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Lock Meeting After Join</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Mute Participants on Entry</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Screen Share Host-Only</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Authenticated Users Only</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">ENFORCED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Access & Modification Audit Trail</h3>
              <p className="text-xs text-slate-400">Strict zero-passcode leakage logging for all appointment interactions</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono">
              COMPLIANT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Request Ref</th>
                  <th className="pb-2">IP & Origin</th>
                  <th className="pb-2">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {accessLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-400">{new Date(log.timestamp).toLocaleString('en-ZA')}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-white font-sans font-semibold">{log.userName}</td>
                    <td className="py-2.5 uppercase text-slate-400">{log.userRole}</td>
                    <td className="py-2.5 text-amber-400 font-bold">{log.appointmentRef}</td>
                    <td className="py-2.5 text-slate-400">{log.ipAddress}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CLOUDWATCH & PROMETHEUS METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Calendar Events Created</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.calendarEventsCreated}</div>
              <div className="text-[10px] text-slate-500 font-mono">100% Google Cal synced</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Sync Failures</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.calendarSyncFailures}</div>
              <div className="text-[10px] text-emerald-500 font-mono">0.00% error rate</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Scheduled</div>
              <div className="text-2xl font-bold font-mono text-blue-400">{metrics.appointmentsScheduled}</div>
              <div className="text-[10px] text-slate-500 font-mono">Completed: {metrics.appointmentsCompleted}</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Reminders Delivered</div>
              <div className="text-2xl font-bold font-mono text-indigo-400">{metrics.remindersDelivered}</div>
              <div className="text-[10px] text-slate-500 font-mono">SNS / SES dispatch</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Secret Vault Accesses</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{metrics.zoomCardAccessCount}</div>
              <div className="text-[10px] text-slate-500 font-mono">0 unauthorized blocks</div>
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">CloudWatch Synthetic Health Alarms</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">GoogleCalendarSyncLag &gt; 120s</div>
                  <div className="text-[11px] text-slate-400">Evaluates Celery background queue processing latency</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">OK (4.2s)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">SecretsManagerDecryptionFailures &gt; 1</div>
                  <div className="text-[11px] text-slate-400">Monitors IAM access errors on Zoom secret ARN</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono text-[10px]">OK (0 errors)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AppointmentCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={newAppt => {
          refreshData();
          showToast(`Scheduled "${newAppt.title}" and synchronized with Google Calendar.`);
        }}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />

      {selectedAppointmentForOutcome && (
        <MeetingOutcomeModal
          isOpen={!!selectedAppointmentForOutcome}
          onClose={() => setSelectedAppointmentForOutcome(null)}
          appointment={selectedAppointmentForOutcome}
          onSuccess={outcome => {
            refreshData();
            showToast(`Outcome recorded for ${selectedAppointmentForOutcome.serviceRequestRef}.`);
          }}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {selectedAppointmentForPpt && (
        <PowerPointPresentationViewerModal
          isOpen={!!selectedAppointmentForPpt}
          onClose={() => setSelectedAppointmentForPpt(null)}
          appointment={selectedAppointmentForPpt}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {selectedAppointmentForReschedule && (
        <RescheduleAppointmentModal
          isOpen={!!selectedAppointmentForReschedule}
          onClose={() => setSelectedAppointmentForReschedule(null)}
          appointment={selectedAppointmentForReschedule}
          onSuccess={updated => {
            refreshData();
            showToast(
              rescheduleMode === 'reschedule'
                ? `Appointment rescheduled and Google Calendar updated.`
                : `Appointment cancelled and removed from Google Calendar.`
            );
          }}
          mode={rescheduleMode}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  );
};
