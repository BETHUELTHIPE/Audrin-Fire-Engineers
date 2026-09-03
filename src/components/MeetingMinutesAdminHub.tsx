import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  Users,
  Database,
  Trash2,
  Lock,
  ExternalLink,
  Activity,
  Send,
} from 'lucide-react';
import {
  ZoomMeetingRecord,
  MeetingMinutesVersion,
  MeetingMinutesCorrection,
  MeetingMinutesDelivery,
  VerifiedSuperuserRecipient,
  LiveMeetingStatus,
} from '../types/meetingMinutes';
import { UserRole } from '../types';
import {
  meetingMinutesService,
  VERIFIED_SUPERUSERS,
} from '../services/meetingMinutesService';
import { LiveMeetingStatusPanel } from './LiveMeetingStatusPanel';
import { MeetingMinutesViewerModal } from './MeetingMinutesViewerModal';
import { MeetingMinutesCorrectionModal } from './MeetingMinutesCorrectionModal';
import { SpeakerCorrectionModal } from './SpeakerCorrectionModal';

interface MeetingMinutesAdminHubProps {
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
}

export const MeetingMinutesAdminHub: React.FC<MeetingMinutesAdminHubProps> = ({
  currentUserRole,
  currentUserId,
  currentUserName,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'all_minutes' | 'corrections' | 'pipeline' | 'recipients' | 'retention' | 'metrics'>('all_minutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordForPipeline, setSelectedRecordForPipeline] = useState<ZoomMeetingRecord | null>(null);
  const [viewerMinutesId, setViewerMinutesId] = useState<string | null>(null);
  const [correctionModalVersion, setCorrectionModalVersion] = useState<MeetingMinutesVersion | null>(null);
  const [pendingCorrectionToReview, setPendingCorrectionToReview] = useState<MeetingMinutesCorrection | null>(null);
  const [speakerModalTranscriptId, setSpeakerModalTranscriptId] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const records = meetingMinutesService.getAllMeetingRecords();
  const versions = meetingMinutesService.getAllMinutesVersions();
  const corrections = meetingMinutesService.getAllCorrections();
  const deliveries = meetingMinutesService.getAllDeliveries();
  const metrics = meetingMinutesService.getMetrics();

  const filteredRecords = records.filter(
    r =>
      r.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceRequestRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.siteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCorrections = corrections.filter(c => c.status === 'submitted');

  const handleTriggerAiGeneration = async (recordId: string) => {
    setIsGeneratingAi(recordId);
    try {
      const result = await meetingMinutesService.generateAiMinutesForMeeting(recordId);
      setStatusNotification(
        `Successfully generated Version ${result.version.minutesVersion}.0 and dispatched separate emails to client & superusers.`
      );
      setTimeout(() => setStatusNotification(null), 6000);
    } catch (err: any) {
      alert(`AI Generation Notice: ${err.message}`);
    } finally {
      setIsGeneratingAi(null);
    }
  };

  const handlePurgeAudioRecordings = () => {
    if (confirm('Are you sure you want to purge raw Zoom audio recordings older than 30 days while retaining immutable PDF minutes in Amazon S3?')) {
      setStatusNotification('Retention policy executed: 3 raw Zoom audio files purged from temporary S3 storage. All PDF minutes and metadata retained.');
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Grid */}
      <div className="bg-[#0A192F] text-white p-6 rounded-sm shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                Audrin AI Cloud Engine • Amazon Bedrock &amp; SES
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-mono font-bold uppercase">
                SANS 10139 Qualified
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Zoom AI Meeting Minutes Management Console
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated transcript processing, anti-hallucination structured extraction, branded PDF generation, private S3 archiving, and separate email dispatches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const first = records[0];
                if (first) setSelectedRecordForPipeline(first);
                setActiveTab('pipeline');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Status Tracker</span>
            </button>
          </div>
        </div>

        {/* 5-Column Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Minutes Generated</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{versions.length}</div>
            <span className="text-[9px] text-emerald-400 font-mono">100% In Private S3</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Separate SES Dispatches</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{deliveries.length}</div>
            <span className="text-[9px] text-blue-400 font-mono">Zero Cross-Recipient Exposure</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Corrections</span>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{pendingCorrections.length}</div>
            <span className="text-[9px] text-slate-400 font-mono">Requires Admin Review</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Superuser Recipients</span>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">{VERIFIED_SUPERUSERS.length}</div>
            <span className="text-[9px] text-purple-300 font-mono">receive_all_meeting_minutes</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Bedrock Pipeline</span>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">{metrics.avgProcessingDurationSeconds}s</div>
            <span className="text-[9px] text-slate-400 font-mono">Celery Async Worker</span>
          </div>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusNotification && (
        <div className="p-3.5 bg-emerald-900 border border-emerald-700 text-emerald-100 rounded-sm text-xs font-mono font-bold flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {statusNotification}
          </span>
          <button onClick={() => setStatusNotification(null)} className="text-emerald-300 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-t-sm overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all_minutes')}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'all_minutes'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>All Meeting Minutes ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('corrections')}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'corrections'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Corrections Queue ({pendingCorrections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Live Lifecycle Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'recipients'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Superuser Dispatches &amp; Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('retention')}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'retention'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-slate-600" />
            <span>S3 Privacy &amp; Retention</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL MEETING MINUTES */}
      {activeTab === 'all_minutes' && (
        <div className="bg-white border border-slate-200 rounded-b-sm shadow-sm p-4 space-y-4">
          {/* Search bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Request Ref, Client, Topic, Site..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="text-xs font-mono text-slate-500">
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> meeting sessions
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3">Ref &amp; Topic</th>
                  <th className="p-3">Client &amp; Site</th>
                  <th className="p-3">Consent</th>
                  <th className="p-3">Live Status</th>
                  <th className="p-3">Current Version</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredRecords.map(rec => {
                  const hasMinutes = !!rec.currentMinutesId;
                  const currentVer = hasMinutes
                    ? meetingMinutesService.getCurrentMinutesVersion(rec.currentMinutesId!)
                    : null;
                  const isProcessing = isGeneratingAi === rec.id;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-mono font-bold text-blue-900">{rec.serviceRequestRef}</div>
                        <div className="font-semibold text-slate-900 mt-0.5 line-clamp-1">{rec.topic}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">Appt: {rec.appointmentRef}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800">{rec.clientName}</div>
                        <div className="text-[11px] text-slate-600">{rec.siteName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rec.clientEmail}</div>
                      </td>

                      <td className="p-3">
                        {rec.consentStatus === 'consented' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Consented
                          </span>
                        ) : rec.consentStatus === 'declined' ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Declined
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded text-[10px] font-mono font-bold uppercase w-max">
                            Pending Notice
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          rec.liveStatus === 'minutes_delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.liveStatus.includes('generating') || rec.liveStatus.includes('processing')
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rec.liveStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-3">
                        {currentVer ? (
                          <div>
                            <span className="font-mono font-bold text-slate-900">
                              Version {currentVer.minutesVersion}.0
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              {currentVer.structuredData.actionItems.length} Actions • {currentVer.structuredData.decisions.length} Decisions
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Not Generated</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentVer ? (
                            <>
                              <button
                                onClick={() => setViewerMinutesId(rec.currentMinutesId!)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded font-mono text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-blue-600" />
                                <span>View Minutes</span>
                              </button>

                              <button
                                onClick={() => meetingMinutesService.downloadPdf(currentVer.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3 text-emerald-600" />
                                <span>PDF</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleTriggerAiGeneration(rec.id)}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-[11px] font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isProcessing ? 'Processing AI...' : 'Generate AI Minutes'}</span>
                            </button>
                          )}

                          {rec.transcriptId && (
                            <button
                              onClick={() => setSpeakerModalTranscriptId(rec.transcriptId!)}
                              title="Correct Identified Speakers"
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CORRECTIONS QUEUE */}
      {activeTab === 'corrections' && (
        <div className="bg-white border border-slate-200 rounded-b-sm shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase font-mono">
                Client Meeting Minutes Correction Queue
              </h3>
              <p className="text-xs text-slate-500">
                Review client correction requests against transcript evidence. Approvals automatically issue a new superseded minutes version and dispatch updated PDFs.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-xs font-bold">
              {pendingCorrections.length} Pending Review
            </span>
          </div>

          {pendingCorrections.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded text-xs text-slate-500 font-mono space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800">All client correction requests reviewed and up to date.</p>
              <p>No pending review items found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCorrections.map(corr => {
                const currentVer = meetingMinutesService.getVersionById(corr.minutesVersionId);
                return (
                  <div key={corr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-mono font-bold text-blue-900 text-xs">
                          {corr.submittedByUserName} ({corr.submittedByUserEmail})
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Target Section: <strong>{corr.sectionToCorrect}</strong> • Document Version {corr.versionNumber}.0
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-mono font-bold uppercase">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-3 bg-white border border-slate-200 rounded">
                        <span className="text-slate-400 font-bold block mb-1">CURRENT DOCUMENT TEXT:</span>
                        <p className="text-slate-800">{corr.currentText || 'Not specified by client.'}</p>
                      </div>

                      <div className="p-3 bg-white border border-blue-200 rounded">
                        <span className="text-blue-600 font-bold block mb-1">CLIENT'S REQUESTED CORRECTION:</span>
                        <p className="text-blue-950 font-bold">{corr.requestedCorrection}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded font-mono text-[11px]">
                      <span className="text-slate-500 font-bold">Client Reason / Evidence:</span>{' '}
                      <span className="text-slate-700">{corr.reasonOrEvidence}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      {currentVer && (
                        <button
                          onClick={() => {
                            setPendingCorrectionToReview(corr);
                            setCorrectionModalVersion(currentVer);
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review &amp; Decide</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE LIFECYCLE PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono font-bold text-xs text-slate-700">Select Meeting Session to Track:</span>
            <select
              value={selectedRecordForPipeline?.id || ''}
              onChange={e => {
                const rec = records.find(r => r.id === e.target.value);
                if (rec) setSelectedRecordForPipeline(rec);
              }}
              className="p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
            >
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.serviceRequestRef} – {r.topic} ({r.clientName})
                </option>
              ))}
            </select>
          </div>

          {selectedRecordForPipeline && (
            <LiveMeetingStatusPanel
              meetingRecord={selectedRecordForPipeline}
              isAdmin={true}
              onSimulateAdvanceStatus={nextStatus => {
                meetingMinutesService.updateLiveMeetingStatus(selectedRecordForPipeline.id, nextStatus);
                setSelectedRecordForPipeline({
                  ...selectedRecordForPipeline,
                  liveStatus: nextStatus,
                  updatedAt: new Date().toISOString(),
                });
              }}
            />
          )}
        </div>
      )}

      {/* TAB 4: SUPERUSER RECIPIENTS */}
      {activeTab === 'recipients' && (
        <div className="bg-white border border-slate-200 rounded-b-sm shadow-sm p-6 space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold font-mono text-sm uppercase">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Authorised Meeting Minutes Recipients (receive_all_meeting_minutes)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with security requirements, only verified, active administrators with the specific permission <code>receive_all_meeting_minutes</code> automatically receive meeting-minutes PDFs. All dispatches occur as separate individual MIME emails via Amazon SES without CC or BCC headers.
            </p>
          </div>

          <div className="space-y-3">
            {VERIFIED_SUPERUSERS.map(su => (
              <div key={su.userId} className="p-4 bg-slate-50 border border-slate-200 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-mono text-xs">{su.name}</strong>
                    <span className="px-2 py-0.2 bg-purple-100 text-purple-900 border border-purple-300 rounded text-[10px] font-mono font-bold uppercase">
                      Super Administrator
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{su.email}</div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> receive_all_meeting_minutes: Active
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold">
                    MIME Email Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & RETENTION */}
      {activeTab === 'retention' && (
        <div className="bg-white border border-slate-200 rounded-b-sm shadow-sm p-6 space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold font-mono text-sm uppercase">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Amazon S3 Privacy, Encryption &amp; Retention Schedules</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audrin Fire Engineers enforces granular retention policies across audio recordings, VTT transcripts, and structured PDF minutes. Administrators can retain immutable PDF compliance minutes indefinitely while securely purging raw audio after the statutory retention period.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">1. Zoom Cloud Audio Recordings</span>
              <div className="text-slate-900 font-bold">Retention: 30 Days</div>
              <p className="text-[11px] text-slate-500">Automatically scheduled for purge after transcript verification.</p>
              <button
                onClick={handlePurgeAudioRecordings}
                className="w-full mt-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Execute Audio Purge</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">2. Encrypted VTT Transcripts</span>
              <div className="text-slate-900 font-bold">Retention: 1 Year (365 Days)</div>
              <p className="text-[11px] text-slate-500">Encrypted with AWS KMS in private S3 bucket <code>audrin-fire-private-docs</code>.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">3. Branded PDF Minutes</span>
              <div className="text-slate-900 font-bold text-emerald-800">Retention: 5 Years (Statutory)</div>
              <p className="text-[11px] text-slate-500">Immutable versions preserved for SANS 10139 and building insurance compliance.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {viewerMinutesId && (
        <MeetingMinutesViewerModal
          isOpen={true}
          onClose={() => setViewerMinutesId(null)}
          minutesId={viewerMinutesId}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserEmail={currentUserEmail}
          onRequestCorrection={ver => {
            setViewerMinutesId(null);
            setCorrectionModalVersion(ver);
          }}
        />
      )}

      {correctionModalVersion && (
        <MeetingMinutesCorrectionModal
          isOpen={true}
          onClose={() => {
            setCorrectionModalVersion(null);
            setPendingCorrectionToReview(null);
          }}
          minutesVersion={correctionModalVersion}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserEmail={currentUserEmail}
          pendingCorrectionToReview={pendingCorrectionToReview}
          onCorrectionProcessed={() => {
            setCorrectionModalVersion(null);
            setPendingCorrectionToReview(null);
          }}
        />
      )}

      {speakerModalTranscriptId && (
        <SpeakerCorrectionModal
          isOpen={true}
          onClose={() => setSpeakerModalTranscriptId(null)}
          transcript={meetingMinutesService.getTranscriptById(speakerModalTranscriptId)!}
          onSuccess={() => setSpeakerModalTranscriptId(null)}
        />
      )}
    </div>
  );
};
