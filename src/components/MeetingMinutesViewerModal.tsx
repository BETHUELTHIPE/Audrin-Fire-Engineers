import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Send,
  User,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
  X,
  History,
  Info,
  CheckCheck,
  Edit3,
  Mail,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  MeetingMinutesVersion,
  MeetingMinutesDelivery,
  MeetingMinutesCorrection,
  MeetingMinutesAcknowledgement,
} from '../types/meetingMinutes';
import { UserRole } from '../types';
import { meetingMinutesService } from '../services/meetingMinutesService';
import { MinutesVersionHistory } from './MinutesVersionHistory';

interface MeetingMinutesViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutesId: string;
  initialVersionId?: string;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  onRequestCorrection: (version: MeetingMinutesVersion) => void;
}

export const MeetingMinutesViewerModal: React.FC<MeetingMinutesViewerModalProps> = ({
  isOpen,
  onClose,
  minutesId,
  initialVersionId,
  currentUserRole,
  currentUserId,
  currentUserName,
  currentUserEmail,
  onRequestCorrection,
}) => {
  const versions = meetingMinutesService.getMinutesVersionsByMinutesId(minutesId);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    initialVersionId || versions[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'minutes' | 'deliveries' | 'history' | 'transcript'>('minutes');
  const [ackToast, setAckToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVersion =
    versions.find(v => v.id === selectedVersionId) || versions[0];

  if (!currentVersion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
        <div className="bg-white p-6 rounded shadow-xl text-center space-y-4">
          <p className="text-slate-800 font-bold">No minutes found for this session.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-xs">Close</button>
        </div>
      </div>
    );
  }

  const structured = currentVersion.structuredData;
  const deliveries = meetingMinutesService.getDeliveriesByMinutesId(minutesId);
  const acknowledgements = meetingMinutesService.getAcknowledgementsByMinutesId(minutesId);
  const corrections = meetingMinutesService.getCorrectionsByMinutesId(minutesId);
  const isClient = currentUserRole === 'customer';
  const hasUserAcknowledged = acknowledgements.some(a => a.acknowledgedByUserId === currentUserId);

  const handleDownloadPdf = () => {
    meetingMinutesService.downloadPdf(currentVersion.id);
  };

  const handleAcknowledge = () => {
    meetingMinutesService.recordAcknowledgement({
      minutesId: currentVersion.minutesId,
      minutesVersionId: currentVersion.id,
      versionNumber: currentVersion.minutesVersion,
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });
    setAckToast(`Formally acknowledged Version ${currentVersion.minutesVersion}.0. Record logged to compliance audit trail.`);
    setTimeout(() => setAckToast(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-100 border border-slate-300 rounded-sm shadow-2xl max-w-5xl w-full h-[94vh] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                  Audrin Fire Engineers • AI Meeting Minutes
                </span>
                {currentVersion.isSuperseded ? (
                  <span className="px-2 py-0.2 bg-rose-500/30 text-rose-300 border border-rose-400/40 rounded-full text-[9px] font-mono font-bold uppercase">
                    Superseded by V{versions.find(v => v.id === currentVersion.supersededByVersionId)?.minutesVersion || 'Newer'}
                  </span>
                ) : (
                  <span className="px-2 py-0.2 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-full text-[9px] font-mono font-bold uppercase">
                    Current Version {currentVersion.minutesVersion}.0
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white line-clamp-1">
                {structured.meetingTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version Switcher */}
            {versions.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                <span className="text-[10px] font-mono text-slate-400">VERSION:</span>
                <select
                  value={currentVersion.id}
                  onChange={e => setSelectedVersionId(e.target.value)}
                  className="bg-slate-900 text-blue-400 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-slate-600 focus:outline-none cursor-pointer"
                >
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.minutesVersion}.0 {v.isSuperseded ? '(Superseded)' : '(Current)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="btn-download-minutes-pdf"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase rounded-sm flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('minutes')}
              className={`py-3 px-3.5 border-b-2 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'minutes'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>16-Section Meeting Minutes</span>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-3 px-3.5 border-b-2 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deliveries'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Separate Email Dispatches ({deliveries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3.5 border-b-2 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>Version History &amp; S3 Audit</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            {/* Acknowledge Button */}
            {!currentVersion.isSuperseded && !hasUserAcknowledged && (
              <button
                id="btn-acknowledge-minutes"
                onClick={handleAcknowledge}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded font-mono text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Acknowledge Receipt</span>
              </button>
            )}

            {/* Request Correction Button */}
            {!currentVersion.isSuperseded && (
              <button
                id="btn-request-correction"
                onClick={() => onRequestCorrection(currentVersion)}
                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Request Correction</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {ackToast && (
          <div className="p-2.5 bg-emerald-900 text-emerald-100 text-xs font-mono font-bold flex items-center justify-between px-6 border-b border-emerald-700">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {ackToast}
            </span>
            <button onClick={() => setAckToast(null)} className="text-emerald-300 hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'minutes' && (
            <div className="bg-white border border-slate-300 rounded-sm shadow-md p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
              {/* SECTION 1: COVER & LETTERHEAD */}
              <div className="border-b-2 border-[#0A192F] pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-bold text-xl text-[#0A192F] tracking-tight">AUDRIN FIRE ENGINEERS</h1>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Commercial Fire Protection • SANS 10139 Aligned Engineering Services
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-slate-500">MINUTES REF: <strong className="text-[#CC0000]">{currentVersion.serviceRequestRef}-MIN-V{currentVersion.minutesVersion}</strong></div>
                  <div className="text-slate-500">DATE: {structured.meetingDate}</div>
                </div>
              </div>

              {/* Title & Document Status Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                    AI-Assisted Zoom Meeting Minutes
                  </span>
                  <h2 className="text-base font-bold uppercase text-white mt-0.5">{structured.meetingTitle}</h2>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">
                    Version {currentVersion.minutesVersion}.0
                  </span>
                </div>
              </div>

              {/* SECTION 2 & 3: MEETING, CLIENT & SITE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5 text-xs">
                  <h3 className="font-mono font-bold uppercase text-[#0A192F] text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. Meeting Information</span>
                  </h3>
                  <p><span className="text-slate-500">Type:</span> <strong>{structured.appointmentType}</strong></p>
                  <p><span className="text-slate-500">Date &amp; Time:</span> {structured.meetingDate} ({structured.startTime} – {structured.endTime} SAST)</p>
                  <p><span className="text-slate-500">Duration:</span> {structured.durationMinutes} Minutes</p>
                  <p><span className="text-slate-500">Service Request:</span> <strong className="text-blue-700">{structured.serviceRequestRef}</strong></p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5 text-xs">
                  <h3 className="font-mono font-bold uppercase text-[#0A192F] text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Client &amp; Site Details</span>
                  </h3>
                  <p><span className="text-slate-500">Client:</span> <strong>{structured.client}</strong></p>
                  <p><span className="text-slate-500">Organisation:</span> {structured.organisation}</p>
                  <p><span className="text-slate-500">Site Name:</span> <strong>{structured.site}</strong></p>
                  <p><span className="text-slate-500">Participant Consent:</span> <span className="text-emerald-700 font-bold">Confirmed Prior to Join</span></p>
                </div>
              </div>

              {/* SECTION 4: ATTENDEES & APOLOGIES */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">3. Attendees &amp; Apologies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {structured.attendees.map((att, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <strong className="text-slate-900">{att.name}</strong>
                          <div className="text-[10px] text-slate-500">{att.role}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${att.present ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {att.present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
                {structured.apologies.length > 0 && (
                  <p className="text-xs text-slate-500 font-mono">Apologies: {structured.apologies.join(', ')}</p>
                )}
              </div>

              {/* SECTION 5: PURPOSE & AGENDA */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">4. Purpose &amp; Agenda</h3>
                <div className="space-y-2">
                  {structured.agenda.map((ag) => (
                    <div key={ag.itemNumber} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                      <strong className="text-blue-900 font-mono">{ag.itemNumber}. {ag.title}:</strong>
                      <p className="text-slate-700 mt-0.5">{ag.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: DISCUSSION SUMMARY */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">5. Discussion Summary</h3>
                <div className="space-y-3">
                  {structured.discussionPoints.map((dp, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border-l-4 border-blue-600 rounded-r text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700">
                        <span>{dp.topic}</span>
                        {dp.transcriptTimestamp && <span className="text-slate-400">[{dp.transcriptTimestamp}]</span>}
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed">{dp.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: CLIENT CONCERNS */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">6. Client Concerns &amp; Specific Requirements</h3>
                {structured.clientConcerns.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unresolved client concerns recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {structured.clientConcerns.map((cc, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs space-y-1">
                        <strong className="text-amber-900 font-mono">Concern: {cc.concern}</strong>
                        <p className="text-slate-700">{cc.context}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 8: DOCUMENTS DISCUSSED */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">7. Documents &amp; Evidence Discussed</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                  {structured.documentsDiscussed.map((doc, idx) => (
                    <li key={idx} className="font-mono">{doc}</li>
                  ))}
                </ul>
              </div>

              {/* SECTION 9: DECISIONS MADE */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">8. Decisions Made</h3>
                <div className="space-y-2">
                  {structured.decisions.map(dec => (
                    <div key={dec.decisionNumber} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <strong className="text-[#0A192F] font-mono">DECISION {dec.decisionNumber}: {dec.description}</strong>
                      <p className="text-slate-600 text-[11px]">Context: {dec.context}</p>
                      <p className="text-[10px] font-mono text-slate-500 italic">Transcript Evidence: "{dec.transcriptEvidence}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 10: ACTION-ITEM REGISTER */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">9. Action-Item Register</h3>
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A192F] text-white font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Responsible Party</th>
                        <th className="p-2.5">Due Date</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans">
                      {structured.actionItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold">{item.actionNumber}</td>
                          <td className="p-2.5">
                            <div>{item.action}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 italic">Ref: "{item.transcriptEvidence}"</div>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">{item.responsibleParty}</td>
                          <td className="p-2.5 font-mono text-slate-600">{item.dueDate}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] rounded font-bold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 11, 12, 13, 14: OUTSTANDING INFO, RISKS & NEXT HOW WE WORK STAGE */}
              <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">
                <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs">10. Outstanding Information, Risks &amp; Workflow Stage</h3>
                {structured.outstandingInformation.length > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-mono font-bold text-slate-700">Outstanding Items Required:</span>
                    <ul className="list-disc list-inside mt-1 text-slate-600">
                      {structured.outstandingInformation.map((info, idx) => (
                        <li key={idx}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {structured.risksOrBlockers.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded space-y-1">
                    <span className="font-mono font-bold text-rose-900">Technical Risks &amp; Blockers:</span>
                    {structured.risksOrBlockers.map((rb, idx) => (
                      <div key={idx} className="text-rose-800 font-mono text-[11px]">
                        • [{rb.severity.toUpperCase()}] {rb.risk}
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-500">Next "How We Work" Stage:</span>{' '}
                    <strong className="text-blue-900">{structured.nextHowWeWorkStage}</strong>
                  </div>
                  {structured.followUpMeetingRequirement.required && (
                    <span className="text-emerald-800 font-bold">Follow-Up Required</span>
                  )}
                </div>
              </div>

              {/* SECTION 15: AI-GENERATION NOTICE & SANS 10139 DISCLAIMER */}
              <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Important AI Notice &amp; SANS 10139 Disclaimer</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed italic">
                  {structured.aiGenerationNotice}
                </p>
                <p className="text-slate-700 text-[11px] leading-relaxed font-semibold">
                  {structured.fireDetectionDisclaimer}
                </p>
              </div>

              {/* SECTION 16: FOOTER & CLIENT CORRECTION INSTRUCTIONS */}
              <div className="border-t border-slate-300 pt-4 text-center font-mono text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-800">
                  Audrin Fire Engineers (Pty) Ltd • Registration No: K2026089596
                </div>
                <div>
                  071 415 6665 • bethuelmoukangwe8@gmail.com • Monday–Sunday: 07:00–20:00 (SAST)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEPARATE EMAIL DISPATCHES */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold font-mono text-xs uppercase">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Amazon SES Separate Email Delivery Records</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In accordance with privacy mandates, each recipient receives a <strong>separate MIME message</strong> directly. No client or superuser email addresses are exposed to one another via CC or BCC.
                </p>
              </div>

              <div className="space-y-3">
                {deliveries.map(del => (
                  <div key={del.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-sm space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          del.recipientType === 'client' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}>
                          {del.recipientType === 'client' ? 'Client Recipient' : 'Super Administrator (receive_all_meeting_minutes)'}
                        </span>
                        <strong className="text-slate-900">{del.recipientName}</strong>
                        <span className="text-slate-500 font-mono">({del.recipientEmail})</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {del.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-700">
                      <strong>Subject:</strong> {del.subject}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] text-slate-700 whitespace-pre-line">
                      {del.bodySnippet}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>SES ID: {del.sesMessageId}</span>
                      <span>MIME Size: {(del.attachmentSizeBytes / 1024).toFixed(1)} KB</span>
                      <span>Dispatched: {new Date(del.dispatchedAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERSION HISTORY & S3 AUDIT */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <MinutesVersionHistory
                minutesId={minutesId}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onViewMinutes={(ver) => {
                  setSelectedVersionId(ver.id);
                  setActiveTab('minutes');
                }}
                onRequestCorrection={(ver) => {
                  onRequestCorrection(ver);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
