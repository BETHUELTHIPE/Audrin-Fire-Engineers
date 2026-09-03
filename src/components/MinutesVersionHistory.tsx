import React, { useState, useEffect } from 'react';
import {
  Layers,
  Download,
  GitCompare,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Hash,
  Database,
  Mail,
  User,
  CheckCheck,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Info,
  Building,
  Calendar
} from 'lucide-react';
import {
  MeetingMinutesVersion,
  MeetingMinutesDelivery,
  MeetingMinutesAcknowledgement,
  MeetingMinutesCorrection
} from '../types/meetingMinutes';
import { UserRole } from '../types';
import { meetingMinutesService } from '../services/meetingMinutesService';
import { MinutesVersionCompareModal } from './MinutesVersionCompareModal';

interface MinutesVersionHistoryProps {
  appointmentId?: string;
  minutesId?: string;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onViewMinutes?: (version: MeetingMinutesVersion) => void;
  onRequestCorrection?: (version: MeetingMinutesVersion) => void;
  compact?: boolean;
}

export const MinutesVersionHistory: React.FC<MinutesVersionHistoryProps> = ({
  appointmentId,
  minutesId,
  currentUserRole,
  currentUserId,
  currentUserName,
  onViewMinutes,
  onRequestCorrection,
  compact = false,
}) => {
  const [versions, setVersions] = useState<MeetingMinutesVersion[]>([]);
  const [selectedVersionForCompareA, setSelectedVersionForCompareA] = useState<MeetingMinutesVersion | null>(null);
  const [selectedVersionForCompareB, setSelectedVersionForCompareB] = useState<MeetingMinutesVersion | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'superseded'>('all');

  const loadVersions = () => {
    let list: MeetingMinutesVersion[] = [];
    if (minutesId) {
      list = meetingMinutesService.getMinutesVersionsByMinutesId(minutesId);
    } else if (appointmentId) {
      list = meetingMinutesService.getMinutesVersionsByAppointmentId(appointmentId);
    } else {
      list = meetingMinutesService.getAllMinutesVersions();
    }
    setVersions(list);
  };

  useEffect(() => {
    loadVersions();
  }, [appointmentId, minutesId]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleDownloadPdf = (e: React.MouseEvent, version: MeetingMinutesVersion) => {
    e.stopPropagation();
    try {
      meetingMinutesService.downloadPdf(version.id);
      showToast(`Downloaded Version ${version.minutesVersion}.0 PDF (${version.serviceRequestRef})`);
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF download.');
    }
  };

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenCompare = (verA: MeetingMinutesVersion, verB?: MeetingMinutesVersion) => {
    setSelectedVersionForCompareA(verA);
    // Default verB to the newest active version or previous version
    const otherVer = verB || versions.find(v => v.id !== verA.id) || verA;
    setSelectedVersionForCompareB(otherVer);
    setIsCompareModalOpen(true);
  };

  // Filtered versions
  const filteredVersions = versions.filter(v => {
    if (statusFilter === 'active' && v.isSuperseded) return false;
    if (statusFilter === 'superseded' && !v.isSuperseded) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = v.structuredData.meetingTitle.toLowerCase().includes(q);
      const matchRef = v.serviceRequestRef.toLowerCase().includes(q);
      const matchReason = v.correctionReason?.toLowerCase().includes(q) || false;
      const matchModel = v.aiModelIdentifier.toLowerCase().includes(q);
      const matchHash = v.fileHash.toLowerCase().includes(q);
      if (!matchTopic && !matchRef && !matchReason && !matchModel && !matchHash) return false;
    }
    return true;
  });

  const activeVersion = versions.find(v => !v.isSuperseded) || versions[0];
  const supersededCount = versions.filter(v => v.isSuperseded).length;

  if (versions.length === 0) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Minutes PDF Versions Generated Yet</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          When this remote consultation concludes and AI transcript processing completes, immutable PDF versions and delivery logs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {actionToast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionToast}
          </span>
          <button onClick={() => setActionToast(null)} className="text-emerald-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header & Metrics Ribbon */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Minutes Version History</h3>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-mono font-bold">
                {versions.length} {versions.length === 1 ? 'Version' : 'Versions'} Total
              </span>
              {supersededCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono">
                  {supersededCount} Superseded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audrin Fire Engineers • SANS 10139 5-Year S3 Private Vault Audit Trail
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {versions.length >= 2 && (
            <button
              onClick={() => handleOpenCompare(versions[1] || versions[0], versions[0])}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/50 cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Versions (Diff)</span>
            </button>
          )}

          <button
            onClick={() => loadVersions()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Refresh Versions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (If not ultra-compact) */}
      {!compact && versions.length > 1 && (
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search version history by ref, topic, correction reason, model..."
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses ({versions.length})</option>
              <option value="active">Active Only ({versions.filter(v => !v.isSuperseded).length})</option>
              <option value="superseded">Superseded Only ({supersededCount})</option>
            </select>
          </div>
        </div>
      )}

      {/* Versions List Table / Cards */}
      <div className="space-y-3">
        {filteredVersions.map(version => {
          const isExpanded = expandedVersionId === version.id;
          const deliveries = meetingMinutesService.getDeliveriesByMinutesId(version.minutesId);
          const versionDeliveries = deliveries.filter(d => d.minutesVersionId === version.id);
          const acknowledgements = meetingMinutesService.getAcknowledgementsByMinutesId(version.minutesId);
          const verAck = acknowledgements.find(a => a.minutesVersionId === version.id);

          return (
            <div
              key={version.id}
              className={`border rounded-2xl transition-all overflow-hidden ${
                version.isSuperseded
                  ? 'bg-slate-950/60 border-slate-800/80'
                  : 'bg-slate-900 border-purple-500/40 shadow-lg shadow-purple-950/20'
              }`}
            >
              {/* Primary Version Row */}
              <div
                onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  {/* Version Pill */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 min-w-[62px]">
                    <span className="font-mono text-xs font-black text-white">
                      v{version.minutesVersion}.0
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {version.isSuperseded ? 'Old' : 'Active'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white tracking-wide">
                        {version.structuredData.meetingTitle || `Meeting Minutes – ${version.serviceRequestRef}`}
                      </h4>

                      {/* Status Badges */}
                      {version.isSuperseded ? (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Superseded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Current Active
                        </span>
                      )}

                      {/* Approval Status Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        version.approvalStatus === 'admin_approved'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : version.approvalStatus === 'client_acknowledged'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : version.approvalStatus === 'correction_requested'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {version.approvalStatus.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Meta Row: Generation Timestamp & File Size */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {new Date(version.generatedAt).toLocaleString('en-ZA', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                          timeZone: 'Africa/Johannesburg'
                        })} SAST
                      </span>

                      <span>•</span>
                      <span>{(version.fileSizeBytes / 1024).toFixed(1)} KB PDF</span>

                      <span>•</span>
                      <span className="text-slate-400 truncate max-w-[200px]" title={version.aiModelIdentifier}>
                        {version.aiModelIdentifier.split('/')[0]}
                      </span>

                      {version.isSuperseded && version.supersededByVersionId && (
                        <span className="text-rose-400 font-bold">
                          • Superseded by Version {versions.find(v => v.id === version.supersededByVersionId)?.minutesVersion || 'Newer'}.0
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {/* Download PDF Button */}
                  <button
                    onClick={e => handleDownloadPdf(e, version)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Download Generated PDF Document"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download PDF</span>
                  </button>

                  {/* View Structured Minutes */}
                  {onViewMinutes && (
                    <button
                      onClick={() => onViewMinutes(version)}
                      className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  )}

                  {/* Compare Button if multiple versions exist */}
                  {versions.length >= 2 && (
                    <button
                      onClick={() => {
                        const otherVer = version.isSuperseded ? activeVersion : versions.find(v => v.id !== version.id) || version;
                        handleOpenCompare(version, otherVer);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Compare against active version"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Compare</span>
                    </button>
                  )}

                  {/* Expand / Collapse Icon */}
                  <button
                    onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-all"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Correction Reason Callout (Visible on summary) */}
              {version.correctionReason && (
                <div className="px-4 py-2.5 bg-amber-500/10 border-t border-slate-800 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-mono text-amber-300">Correction Reason: </span>
                    <span>{version.correctionReason}</span>
                  </div>
                </div>
              )}

              {/* Expanded Inspection Drawer */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-4 text-xs">
                  {/* Detailed S3 & Cryptographic Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Storage & Cryptography */}
                    <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 font-mono">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-400" />
                        <span>S3 Private Vault & Hash Integrity</span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">S3 Object URI:</span>
                          <button
                            onClick={e => handleCopy(version.s3PdfKey, `s3-${version.id}`, e)}
                            className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[220px]"
                            title={version.s3PdfKey}
                          >
                            <span className="truncate">{version.s3PdfKey}</span>
                            {copiedKey === `s3-${version.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">S3 Version ID:</span>
                          <span className="font-mono text-slate-200">{version.s3PdfVersionId}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">SHA-256 Checksum:</span>
                          <button
                            onClick={e => handleCopy(version.fileHash, `hash-${version.id}`, e)}
                            className="text-slate-300 hover:text-white flex items-center gap-1"
                            title="Click to copy full SHA-256 hash"
                          >
                            <span>{version.fileHash.substring(0, 16)}...</span>
                            {copiedKey === `hash-${version.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Document Size:</span>
                          <span className="text-slate-200">{(version.fileSizeBytes / 1024).toFixed(1)} KB ({version.fileSizeBytes.toLocaleString()} bytes)</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Engine & Pipeline Trigger */}
                    <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 font-mono">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>AI Processing & Provenance</span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">AI Model Identifier:</span>
                          <span className="text-purple-300 truncate max-w-[200px]" title={version.aiModelIdentifier}>{version.aiModelIdentifier}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Prompt Template:</span>
                          <span className="text-slate-200 font-bold">{version.promptTemplateVersion}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transcript Version:</span>
                          <span className="text-slate-200">v{version.transcriptVersion}.0</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Generated By:</span>
                          <span className="text-slate-200">{version.createdBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Separate SES Email Dispatches for this version */}
                  {versionDeliveries.length > 0 && (
                    <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Amazon SES Separate Email Dispatches ({versionDeliveries.length})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {versionDeliveries.map(del => (
                          <div key={del.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{del.recipientName}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                                  del.recipientType === 'client' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {del.recipientType}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">{del.recipientEmail}</div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Delivered
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Formal Acknowledgement */}
                  {verAck && (
                    <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-bold text-white">Client Formally Acknowledged Receipt</div>
                          <p className="text-[11px] text-slate-300">
                            By {verAck.acknowledgedByUserName} on {new Date(verAck.acknowledgedAt).toLocaleString('en-ZA')}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px]">
                        IP: {verAck.ipAddress}
                      </span>
                    </div>
                  )}

                  {/* Summary & Content Highlights */}
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">
                      Structured Content Matrix (Version {version.minutesVersion}.0)
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-lg font-bold text-blue-400">{version.structuredData.discussionPoints.length}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Discussion Points</div>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-lg font-bold text-emerald-400">{version.structuredData.actionItems.length}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Action Items</div>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-lg font-bold text-purple-400">{version.structuredData.decisions.length}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Decisions Made</div>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-lg font-bold text-amber-400">{version.structuredData.documentsDiscussed.length}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Documents</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Action Bar inside Drawer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono text-slate-500">
                      SANS 10139 Qualified Non-Certification Notice Enforced
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Request correction if allowed */}
                      {onRequestCorrection && (
                        <button
                          onClick={() => onRequestCorrection(version)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Request Correction</span>
                        </button>
                      )}

                      <button
                        onClick={e => handleDownloadPdf(e, version)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Version {version.minutesVersion}.0 PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {isCompareModalOpen && selectedVersionForCompareA && selectedVersionForCompareB && (
        <MinutesVersionCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          versionA={selectedVersionForCompareA}
          versionB={selectedVersionForCompareB}
          allVersions={versions}
          onSelectVersionA={setSelectedVersionForCompareA}
          onSelectVersionB={setSelectedVersionForCompareB}
        />
      )}
    </div>
  );
};
