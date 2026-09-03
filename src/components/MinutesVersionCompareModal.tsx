import React, { useState } from 'react';
import {
  GitCompare,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Hash,
  Database,
  User,
  Calendar,
  Info,
  CheckCheck
} from 'lucide-react';
import { MeetingMinutesVersion, StructuredMeetingMinutes } from '../types/meetingMinutes';
import { meetingMinutesService } from '../services/meetingMinutesService';

interface MinutesVersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionA: MeetingMinutesVersion;
  versionB: MeetingMinutesVersion;
  allVersions?: MeetingMinutesVersion[];
  onSelectVersionA?: (v: MeetingMinutesVersion) => void;
  onSelectVersionB?: (v: MeetingMinutesVersion) => void;
}

export const MinutesVersionCompareModal: React.FC<MinutesVersionCompareModalProps> = ({
  isOpen,
  onClose,
  versionA: initialVersionA,
  versionB: initialVersionB,
  allVersions = [],
  onSelectVersionA,
  onSelectVersionB,
}) => {
  const [selectedVerAId, setSelectedVerAId] = useState<string>(initialVersionA?.id || '');
  const [selectedVerBId, setSelectedVerBId] = useState<string>(initialVersionB?.id || '');
  const [activeTab, setActiveTab] = useState<'all' | 'discussions' | 'actions' | 'decisions' | 'metadata'>('all');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVerA = allVersions.find(v => v.id === selectedVerAId) || initialVersionA;
  const currentVerB = allVersions.find(v => v.id === selectedVerBId) || initialVersionB;

  if (!currentVerA || !currentVerB) return null;

  const dataA = currentVerA.structuredData;
  const dataB = currentVerB.structuredData;

  const handleDownload = (ver: MeetingMinutesVersion) => {
    meetingMinutesService.downloadPdf(ver.id);
    setDownloadToast(`Downloaded Version ${ver.minutesVersion}.0 PDF (${ver.serviceRequestRef})`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  // Compute diff counts
  const diffDiscussions = Math.abs((dataB.discussionPoints?.length || 0) - (dataA.discussionPoints?.length || 0));
  const diffActions = Math.abs((dataB.actionItems?.length || 0) - (dataA.actionItems?.length || 0));
  const diffDecisions = Math.abs((dataB.decisions?.length || 0) - (dataA.decisions?.length || 0));
  const diffDocs = Math.abs((dataB.documentsDiscussed?.length || 0) - (dataA.documentsDiscussed?.length || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-6xl w-full h-[94vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  SANS 10139 AI Minutes • Version Comparison Engine
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-mono">
                  {currentVerA.serviceRequestRef}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Comparing Version {currentVerA.minutesVersion}.0 with Version {currentVerB.minutesVersion}.0
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {downloadToast && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {downloadToast}
            </span>
            <button onClick={() => setDownloadToast(null)} className="text-emerald-400 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Version Pickers & Summary Ribbon */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shrink-0">
          {/* Version A Selector */}
          <div className="md:col-span-5 p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Version A (Base)</span>
              {currentVerA.isSuperseded ? (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono">
                  Superseded
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono">
                  Active Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentVerA.id}
                onChange={e => {
                  setSelectedVerAId(e.target.value);
                  const found = allVersions.find(v => v.id === e.target.value);
                  if (found && onSelectVersionA) onSelectVersionA(found);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 font-mono font-bold"
              >
                {allVersions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.minutesVersion}.0 ({v.isSuperseded ? 'Superseded' : 'Active'}) — {new Date(v.generatedAt).toLocaleDateString('en-ZA')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDownload(currentVerA)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer shrink-0"
                title="Download Version A PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                PDF
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Gen: {new Date(currentVerA.generatedAt).toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span>{(currentVerA.fileSizeBytes / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          {/* Comparison Delta Indicator */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center gap-1">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-full text-purple-400">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">DIFF DELTA</span>
            <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] font-mono">
              {diffDiscussions > 0 && <span className="text-emerald-400">+{diffDiscussions} points</span>}
              {diffActions > 0 && <span className="text-blue-400">+{diffActions} actions</span>}
              {diffDocs > 0 && <span className="text-amber-400">+{diffDocs} docs</span>}
            </div>
          </div>

          {/* Version B Selector */}
          <div className="md:col-span-5 p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Version B (Compare)</span>
              {currentVerB.isSuperseded ? (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono">
                  Superseded
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono">
                  Active Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentVerB.id}
                onChange={e => {
                  setSelectedVerBId(e.target.value);
                  const found = allVersions.find(v => v.id === e.target.value);
                  if (found && onSelectVersionB) onSelectVersionB(found);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 font-mono font-bold"
              >
                {allVersions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.minutesVersion}.0 ({v.isSuperseded ? 'Superseded' : 'Active'}) — {new Date(v.generatedAt).toLocaleDateString('en-ZA')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDownload(currentVerB)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer shrink-0"
                title="Download Version B PDF"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                PDF
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Gen: {new Date(currentVerB.generatedAt).toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span>{(currentVerB.fileSizeBytes / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'discussions'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Discussion Points ({dataA.discussionPoints.length} vs {dataB.discussionPoints.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'actions'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Action Items ({dataA.actionItems.length} vs {dataB.actionItems.length})
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'decisions'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Decisions ({dataA.decisions.length} vs {dataB.decisions.length})
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'metadata'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            S3 & Audit Metadata
          </button>
        </div>

        {/* Content Comparison Area (Side-by-side) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Correction Trigger Alert if present in B */}
          {currentVerB.correctionReason && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-bold font-mono text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Version {currentVerB.minutesVersion}.0 Revision Reason / Correction Trigger</span>
              </div>
              <p className="leading-relaxed pl-6">{currentVerB.correctionReason}</p>
            </div>
          )}

          {/* S3 & Cryptographic Metadata Matrix */}
          {(activeTab === 'all' || activeTab === 'metadata') && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Storage, Model & Cryptographic Verification</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column A */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                  <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>Version {currentVerA.minutesVersion}.0</span>
                    <span className="text-slate-400 text-[10px]">ID: {currentVerA.id}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div><span className="text-slate-500">Status: </span>{currentVerA.approvalStatus}</div>
                    <div><span className="text-slate-500">AI Model: </span>{currentVerA.aiModelIdentifier}</div>
                    <div><span className="text-slate-500">Prompt Ver: </span>{currentVerA.promptTemplateVersion}</div>
                    <div className="truncate"><span className="text-slate-500">S3 Key: </span>{currentVerA.s3PdfKey}</div>
                    <div className="truncate"><span className="text-slate-500">S3 Ver ID: </span>{currentVerA.s3PdfVersionId}</div>
                    <div className="truncate"><span className="text-slate-500">SHA-256: </span>{currentVerA.fileHash}</div>
                  </div>
                </div>

                {/* Column B */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                  <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>Version {currentVerB.minutesVersion}.0</span>
                    <span className="text-slate-400 text-[10px]">ID: {currentVerB.id}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div><span className="text-slate-500">Status: </span>{currentVerB.approvalStatus}</div>
                    <div><span className="text-slate-500">AI Model: </span>{currentVerB.aiModelIdentifier}</div>
                    <div><span className="text-slate-500">Prompt Ver: </span>{currentVerB.promptTemplateVersion}</div>
                    <div className="truncate"><span className="text-slate-500">S3 Key: </span>{currentVerB.s3PdfKey}</div>
                    <div className="truncate"><span className="text-slate-500">S3 Ver ID: </span>{currentVerB.s3PdfVersionId}</div>
                    <div className="truncate"><span className="text-slate-500">SHA-256: </span>{currentVerB.fileHash}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Discussion Points */}
          {(activeTab === 'all' || activeTab === 'discussions') && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Discussion Points & Technical Notes</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Points A */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                    Version {currentVerA.minutesVersion}.0 ({dataA.discussionPoints.length} points)
                  </div>
                  <div className="space-y-2.5">
                    {dataA.discussionPoints.map((dp, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-xs">
                        <div className="font-bold text-white">{dp.topic}</div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{dp.summary}</p>
                        <div className="text-[10px] font-mono text-slate-500">{dp.speakerRef} • {dp.transcriptTimestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points B */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>Version {currentVerB.minutesVersion}.0 ({dataB.discussionPoints.length} points)</span>
                    {dataB.discussionPoints.length > dataA.discussionPoints.length && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono rounded">
                        +{dataB.discussionPoints.length - dataA.discussionPoints.length} Added
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {dataB.discussionPoints.map((dp, idx) => {
                      const isNew = !dataA.discussionPoints.some(p => p.topic === dp.topic);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg space-y-1 text-xs ${
                            isNew
                              ? 'bg-emerald-950/40 border border-emerald-500/40 shadow-xs'
                              : 'bg-slate-900 border border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{dp.topic}</span>
                            {isNew && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold rounded">
                                NEW / REVISED
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{dp.summary}</p>
                          <div className="text-[10px] font-mono text-slate-500">{dp.speakerRef} • {dp.transcriptTimestamp}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Action Items */}
          {(activeTab === 'all' || activeTab === 'actions') && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Assigned Action Items & Due Dates</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Actions A */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                    Version {currentVerA.minutesVersion}.0 ({dataA.actionItems.length} items)
                  </div>
                  <div className="space-y-2.5">
                    {dataA.actionItems.map((act, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Item {act.actionNumber}: {act.action}</span>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">{act.status}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Assignee: <span className="text-slate-200">{act.responsibleParty}</span> | Due: <span className="text-amber-300">{act.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions B */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>Version {currentVerB.minutesVersion}.0 ({dataB.actionItems.length} items)</span>
                    {dataB.actionItems.length > dataA.actionItems.length && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono rounded">
                        +{dataB.actionItems.length - dataA.actionItems.length} Added
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {dataB.actionItems.map((act, idx) => {
                      const isNew = !dataA.actionItems.some(a => a.action === act.action);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg space-y-1 text-xs ${
                            isNew
                              ? 'bg-blue-950/40 border border-blue-500/40 shadow-xs'
                              : 'bg-slate-900 border border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Item {act.actionNumber}: {act.action}</span>
                            <div className="flex items-center gap-1.5">
                              {isNew && (
                                <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 text-[9px] font-mono font-bold rounded">
                                  NEW ACTION
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">{act.status}</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Assignee: <span className="text-slate-200">{act.responsibleParty}</span> | Due: <span className="text-amber-300">{act.dueDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Decisions */}
          {(activeTab === 'all' || activeTab === 'decisions') && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Decisions & Statutory Agreements</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                    Version {currentVerA.minutesVersion}.0
                  </div>
                  {dataA.decisions.map((dec, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-xs">
                      <div className="font-bold text-white">Decision #{dec.decisionNumber}: {dec.description}</div>
                      <p className="text-[11px] text-slate-400">{dec.context}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                    Version {currentVerB.minutesVersion}.0
                  </div>
                  {dataB.decisions.map((dec, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-xs">
                      <div className="font-bold text-white">Decision #{dec.decisionNumber}: {dec.description}</div>
                      <p className="text-[11px] text-slate-400">{dec.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Direct PDF Download Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            SANS 10139 Statutory Record Retention • Both PDFs stored immutably in private S3 bucket
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(currentVerA)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download V{currentVerA.minutesVersion}.0 PDF</span>
            </button>

            <button
              onClick={() => handleDownload(currentVerB)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download V{currentVerB.minutesVersion}.0 PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
