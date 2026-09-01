import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Layers,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileCheck,
  History,
  Lock,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Building2,
  Calendar,
  User,
  ShieldAlert,
  Send,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  TechnicalDocument,
  DocumentVersion,
  DocumentCadLayer,
  TechnicalDocumentCategory
} from '../types';
import {
  getCategoryDefinition,
  getFileTypeMeta,
  formatFileSize
} from '../utils/fileTypes';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: TechnicalDocument | null;
  onOpenRevisionModal?: (doc: TechnicalDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  onOpenRevisionModal
}) => {
  const {
    currentUser,
    reviewTechnicalDocument,
    toggleDocumentCustomerVisibility,
    toggleDocumentReportInclusion,
    generateSignedDownloadToken,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'security' | 'audit'>('preview');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedHash, setCopiedHash] = useState(false);

  // Review Dialog State
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'requires_revision'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // CAD interactive layer toggles state
  const [cadLayers, setCadLayers] = useState<DocumentCadLayer[]>([]);

  // Initialize CAD layers when document opens
  React.useEffect(() => {
    if (document?.currentVersion?.cadLayers) {
      setCadLayers(document.currentVersion.cadLayers);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const activeVersion: DocumentVersion = selectedVersionId
    ? document.versionHistory.find(v => v.id === selectedVersionId) || document.currentVersion
    : document.currentVersion;

  const catDef = getCategoryDefinition(document.category);
  const fileMeta = getFileTypeMeta(activeVersion.originalFileName, activeVersion.mimeType);
  const isStaffOrAdmin = currentUser && ['staff', 'admin', 'superadmin'].includes(currentUser.role);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activeVersion.fileHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    showToast('info', 'Checksum Copied', 'SHA-256 fingerprint copied to clipboard.');
  };

  const handleDownload = () => {
    const tokenData = generateSignedDownloadToken(document.id, activeVersion.id);
    showToast('success', 'Signed Download Link Generated', '15-minute secure access token created for statutory audit log.');
    // Simulated direct download link trigger
    window.open(tokenData.downloadUrl || activeVersion.fileUrl, '_blank');
  };

  const handleToggleCadLayer = (layerName: string) => {
    setCadLayers(prev =>
      prev.map(l => (l.name === layerName ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleSaveReview = () => {
    reviewTechnicalDocument(
      document.id,
      reviewDecision,
      reviewNotes.trim() || undefined,
      rejectionReason.trim() || undefined
    );
    setIsReviewDialogOpen(false);
  };

  return (
    <div id="modal-doc-viewer" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94vh]">
        
        {/* TOP HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              {fileMeta.isCad ? <Layers className="w-6 h-6" /> :
               fileMeta.isSpreadsheet ? <FileSpreadsheet className="w-6 h-6" /> :
               fileMeta.isWord ? <FileText className="w-6 h-6" /> :
               <FileCheck className="w-6 h-6" />}
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {document.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {activeVersion.revisionNumber}
                </span>
                {document.reviewStatus === 'approved' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                )}
                {document.reviewStatus === 'pending_review' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                )}
                {document.reviewStatus === 'rejected' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{catDef.label} ({catDef.code})</span>
                <span>•</span>
                <span>Req: <strong>{document.serviceRequestRef}</strong></span>
                <span>•</span>
                <span>Site: {document.siteName}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ClamAV Clean
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              id="btn-doc-download-signed"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              title="Download with 15-minute HMAC signed URL"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Signed Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                activeTab === 'preview'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Safe Vector Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('versions')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                activeTab === 'versions'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Revisions Register ({document.versionHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                activeTab === 'security'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Cryptography</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                activeTab === 'audit'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Audit Trail Logs ({document.auditLogs.length})</span>
            </button>
          </div>

          {/* Quick Version Switcher pill */}
          {document.versionHistory.length > 1 && (
            <div className="flex items-center space-x-2 text-xs py-2">
              <span className="text-slate-500">Viewing:</span>
              <select
                value={activeVersion.id}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 focus:ring-1 focus:ring-amber-500"
              >
                {document.versionHistory.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.revisionNumber} (v{v.versionNumber}) — {new Date(v.uploadedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* MAIN BODY VIEWPORT */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950">

          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Main Canvas Viewport */}
              <div className="flex-1 flex flex-col overflow-hidden relative border-r border-slate-200 dark:border-slate-800 bg-slate-900">
                {/* Canvas Controls Bar */}
                <div className="px-4 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 z-10">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-amber-400 font-bold">
                      {activeVersion.originalFileName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{activeVersion.fileSizeFormatted}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] w-12 text-center text-slate-300">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(250, prev + 15))}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Canvas Rendering Area */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                  {/* Vector CAD Overlay / Rendering */}
                  {fileMeta.isCad ? (
                    <div
                      className="relative transition-transform duration-150 rounded-lg shadow-2xl border border-slate-700 bg-slate-950 overflow-hidden"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center', width: '880px', height: '520px' }}
                    >
                      {/* Architectural Vector Canvas Mock */}
                      <svg className="w-full h-full" viewBox="0 0 880 520">
                        {/* Grid */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="#090d16" />
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Layer: ARCH_WALLS_STRUCTURAL */}
                        {(cadLayers.find(l => l.name.includes('WALLS'))?.visible ?? true) && (
                          <g stroke="#64748b" strokeWidth="3" fill="none">
                            <rect x="60" y="50" width="760" height="420" rx="4" />
                            <line x1="60" y1="200" x2="480" y2="200" />
                            <line x1="480" y1="50" x2="480" y2="470" />
                            <line x1="480" y1="320" x2="820" y2="320" />
                            <line x1="260" y1="50" x2="260" y2="200" />
                          </g>
                        )}

                        {/* Layer: SANS_10139_ZONE_BOUNDARIES */}
                        {(cadLayers.find(l => l.name.includes('ZONE'))?.visible ?? true) && (
                          <g fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4">
                            <rect x="65" y="55" width="410" height="140" fill="#10b981" fillOpacity="0.05" />
                            <text x="80" y="80" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE 01: GROUND OFFICE WING</text>

                            <rect x="65" y="205" width="410" height="260" fill="#f59e0b" fillOpacity="0.05" stroke="#f59e0b" />
                            <text x="80" y="230" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE 02: HIGH-BAY DISPATCH MEZZANINE</text>

                            <rect x="485" y="55" width="330" height="410" fill="#3b82f6" fillOpacity="0.05" stroke="#3b82f6" />
                            <text x="500" y="80" fill="#3b82f6" fontSize="11" fontFamily="monospace" fontWeight="bold">ZONE 03: RACKING WAREHOUSE</text>
                          </g>
                        )}

                        {/* Layer: Addressable Detectors */}
                        {(cadLayers.find(l => l.name.includes('DETECTORS'))?.visible ?? true) && (
                          <g>
                            {/* Loop Detectors Zone 1 */}
                            <circle cx="160" cy="120" r="10" fill="#cc0000" stroke="#fff" strokeWidth="1.5" />
                            <text x="154" y="124" fill="#fff" fontSize="9" fontWeight="bold">D1</text>
                            <circle cx="360" cy="120" r="10" fill="#cc0000" stroke="#fff" strokeWidth="1.5" />
                            <text x="354" y="124" fill="#fff" fontSize="9" fontWeight="bold">D2</text>

                            {/* Loop Detectors Zone 2 */}
                            <circle cx="160" cy="300" r="10" fill="#cc0000" stroke="#fff" strokeWidth="1.5" />
                            <text x="154" y="304" fill="#fff" fontSize="9" fontWeight="bold">D3</text>
                            <circle cx="360" cy="300" r="10" fill="#cc0000" stroke="#fff" strokeWidth="1.5" />
                            <text x="354" y="304" fill="#fff" fontSize="9" fontWeight="bold">D4</text>
                            <circle cx="260" cy="400" r="10" fill="#cc0000" stroke="#fff" strokeWidth="1.5" />
                            <text x="254" y="404" fill="#fff" fontSize="9" fontWeight="bold">D5</text>

                            {/* Beam detectors in Warehouse */}
                            <rect x="520" y="150" width="260" height="6" fill="#cc0000" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="520" cy="153" r="7" fill="#cc0000" />
                            <rect x="770" y="146" width="14" height="14" fill="#38bdf8" />
                            <text x="540" y="142" fill="#ef4444" fontSize="9" fontWeight="bold">OPTICAL BEAM 01 (TX/RX)</text>
                          </g>
                        )}

                        {/* Layer: Manual Call Points */}
                        {(cadLayers.find(l => l.name.includes('CALL_POINTS') || l.name.includes('MCP'))?.visible ?? true) && (
                          <g fill="#ffb703" stroke="#000" strokeWidth="1">
                            <rect x="55" y="190" width="14" height="14" />
                            <text x="75" y="202" fill="#ffb703" fontSize="9" fontWeight="bold">MCP-01</text>
                            <rect x="473" y="190" width="14" height="14" />
                            <text x="493" y="202" fill="#ffb703" fontSize="9" fontWeight="bold">MCP-02</text>
                            <rect x="813" y="310" width="14" height="14" />
                            <text x="760" y="305" fill="#ffb703" fontSize="9" fontWeight="bold">MCP-03</text>
                          </g>
                        )}

                        {/* Layer: Sounder Beacons */}
                        {(cadLayers.find(l => l.name.includes('SOUNDER'))?.visible ?? true) && (
                          <g fill="#0077b6" stroke="#fff" strokeWidth="1">
                            <polygon points="160,160 170,180 150,180" />
                            <text x="175" y="175" fill="#38bdf8" fontSize="9" fontWeight="bold">SND-01 (85dBA)</text>
                            <polygon points="650,260 660,280 640,280" />
                            <text x="665" y="275" fill="#38bdf8" fontSize="9" fontWeight="bold">SND-02 (95dBA)</text>
                          </g>
                        )}

                        {/* Title Block */}
                        <g fill="#0f172a" stroke="#334155" strokeWidth="1">
                          <rect x="580" y="410" width="235" height="55" rx="3" />
                          <text x="590" y="426" fill="#e2e8f0" fontSize="10" fontWeight="bold">{document.title.substring(0, 30)}</text>
                          <text x="590" y="440" fill="#94a3b8" fontSize="9">DWG NO: {document.drawingNumber || 'AFE-DWG-001'} • {activeVersion.revisionNumber}</text>
                          <text x="590" y="454" fill="#fbbf24" fontSize="8" fontWeight="bold">AUDRIN FIRE ENGINEERS (PTY) LTD • SANS 10139</text>
                        </g>
                      </svg>
                    </div>
                  ) : fileMeta.isSpreadsheet ? (
                    // Spreadsheets / CSV View
                    <div
                      className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    >
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>Extracted Spreadsheet Table (LibreOffice Calc Engine)</span>
                        <span className="font-mono text-[11px] text-slate-500">Sheet 1: SANS 10139 Point Register</span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                            <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">Point #</th>
                            <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">Loop</th>
                            <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">Device Type</th>
                            <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">Zone</th>
                            <th className="p-2.5 border-r border-slate-200 dark:border-slate-700">Location Tag</th>
                            <th className="p-2.5">Cause & Effect Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          <tr>
                            <td className="p-2.5 font-mono">001</td>
                            <td className="p-2.5">Loop 1</td>
                            <td className="p-2.5 font-semibold text-red-600 dark:text-red-400">Optical Smoke Detector</td>
                            <td className="p-2.5">Zone 01</td>
                            <td className="p-2.5">Reception Entrance Foyer</td>
                            <td className="p-2.5 text-xs text-slate-500">Pulse local sounder, signal BMS, HVAC Trip</td>
                          </tr>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="p-2.5 font-mono">002</td>
                            <td className="p-2.5">Loop 1</td>
                            <td className="p-2.5 font-semibold text-red-600 dark:text-red-400">Optical Smoke Detector</td>
                            <td className="p-2.5">Zone 01</td>
                            <td className="p-2.5">Managing Director Office</td>
                            <td className="p-2.5 text-xs text-slate-500">Pulse local sounder, signal BMS, HVAC Trip</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-mono">003</td>
                            <td className="p-2.5">Loop 1</td>
                            <td className="p-2.5 font-semibold text-amber-600 dark:text-amber-400">Manual Call Point (MCP)</td>
                            <td className="p-2.5">Zone 01</td>
                            <td className="p-2.5">Ground Exit Door 1</td>
                            <td className="p-2.5 text-xs text-slate-500">Continuous sounder alarm, Door release, Fire Brigade auto-dial</td>
                          </tr>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="p-2.5 font-mono">004</td>
                            <td className="p-2.5">Loop 2</td>
                            <td className="p-2.5 font-semibold text-blue-600 dark:text-blue-400">Optical Beam Receiver</td>
                            <td className="p-2.5">Zone 02</td>
                            <td className="p-2.5">High-Bay Racking Apex</td>
                            <td className="p-2.5 text-xs text-slate-500">Warehouse EVAC sounder, Sectional Shutter Door Release</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // Standard PDF / Image / Doc Preview
                    <div
                      className="max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    >
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <FileCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {document.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activeVersion.originalFileName} • {activeVersion.fileSizeFormatted}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Description:</strong> {document.description || 'Statutory technical documentation.'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Category:</strong> {catDef.label}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Prepared By:</strong> {document.preparedBy} ({document.documentDate})
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download Original Document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: CAD Layer Controls or Metadata Panel */}
              <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col p-4 overflow-y-auto space-y-5 flex-shrink-0">
                
                {/* CAD Layer Controller */}
                {fileMeta.isCad && cadLayers.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-500" />
                        CAD Drawing Layers
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{cadLayers.length} Layers</span>
                    </div>

                    <div className="space-y-1.5">
                      {cadLayers.map((layer) => (
                        <label
                          key={layer.name}
                          onClick={() => handleToggleCadLayer(layer.name)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition border ${
                            layer.visible
                              ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                              : 'bg-transparent border-dashed border-slate-300 dark:border-slate-800 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: layer.color }}
                            ></span>
                            <span className="truncate text-[11px]">{layer.name.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {layer.itemCount ? `${layer.itemCount} items` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Information Card */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Document Specification
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Revision:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeVersion.revisionNumber} (v{activeVersion.versionNumber})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Drawing Ref:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{document.drawingNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Uploaded By:</span>
                      <span className="text-slate-900 dark:text-white">{activeVersion.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Upload Date:</span>
                      <span className="text-slate-900 dark:text-white">{new Date(activeVersion.uploadedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Confidentiality:</span>
                      <span className="text-slate-900 dark:text-white capitalize">{document.confidentialityLevel.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Client Comments / Review Notes */}
                {document.clientComments && (
                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Client Submission Comments:</p>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{document.clientComments}"</p>
                  </div>
                )}

                {document.reviewNotes && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Staff Review Notes:</p>
                    <p className="text-slate-600 dark:text-slate-300">{document.reviewNotes}</p>
                  </div>
                )}

                {/* Revision Trigger */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onOpenRevisionModal) onOpenRevisionModal(document);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <History className="w-4 h-4" />
                    <span>Upload New Revision</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSION HISTORY */}
          {activeTab === 'versions' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Immutable Revision Register (SANS 10139 Requirement)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No approved engineering document or CAD layout is ever overwritten. All revisions are preserved.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenRevisionModal) onOpenRevisionModal(document);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <History className="w-4 h-4" /> Upload New Revision
                </button>
              </div>

              <div className="space-y-4">
                {document.versionHistory.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className={`p-5 rounded-xl border transition ${
                      ver.id === document.currentVersion.id
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 rounded bg-slate-900 text-amber-400 text-xs font-mono font-bold">
                            {ver.revisionNumber} (v{ver.versionNumber})
                          </span>
                          {ver.id === document.currentVersion.id && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                              Current Active Version
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {ver.originalFileName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          <strong>Change Log:</strong> {ver.changeDescription || 'Initial upload.'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Uploaded by <strong>{ver.uploadedBy}</strong> ({ver.uploadedByRole}) on {new Date(ver.uploadedAt).toLocaleString()} • {ver.fileSizeFormatted}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-xl">
                          SHA-256: {ver.fileHash}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVersionId(ver.id);
                            setActiveTab('preview');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition"
                        >
                          View Preview
                        </button>
                        <button
                          onClick={handleDownload}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="Download this version"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & CRYPTOGRAPHY */}
          {activeTab === 'security' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cryptographic Hash Card */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Cryptographic SHA-256 Integrity Fingerprint</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 break-all border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
                    <span>{activeVersion.fileHash}</span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 flex-shrink-0"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    The SHA-256 checksum proves this technical document has not been tampered with or modified since statutory submission.
                  </p>
                </div>

                {/* Storage & Retention Card */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Private Storage & Statutory Retention</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Vault Path:</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300 break-all">{document.storagePath}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Statutory Policy:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{document.retentionPolicy}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Malware Scanner Result:</span>
                      <p className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ClamAV & Heuristic Sandbox: PASS (Zero Threats)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Celery Worker Log */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Celery Worker Conversion & Processing Diagnostics
                </span>
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs space-y-1">
                  <p>[CELERY-TASK-2026] Ingestion started: {activeVersion.originalFileName}</p>
                  <p>[SECURITY-SCAN] ClamAV Engine scan: CLEAN (Exit code 0)</p>
                  <p>[PREVIEW-ENGINE] {activeVersion.conversionLog || 'Isolated preview rendered.'}</p>
                  <p>[STATUS-READY] File locked and archived under SANS 10139 repository.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL LOGS */}
          {activeTab === 'audit' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chronological Statutory Audit Trail Log
              </h3>
              <div className="space-y-3">
                {document.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">{log.details}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Performed by: <strong>{log.performedBy}</strong> ({log.userRole}) • {log.userEmail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM GOVERNANCE & REVIEW BAR */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          
          {/* Quick Visibility & Report Toggles */}
          <div className="flex items-center space-x-6 text-xs font-medium">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={document.customerVisible}
                onChange={(e) => toggleDocumentCustomerVisibility(document.id, e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span>Customer Portal Visible</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={document.includeInReport}
                onChange={(e) => toggleDocumentReportInclusion(document.id, e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span>Attach Reference to Condition Reports</span>
            </label>
          </div>

          {/* Admin Review Actions */}
          {isStaffOrAdmin && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setReviewDecision('approved');
                  setIsReviewDialogOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => {
                  setReviewDecision('requires_revision');
                  setIsReviewDialogOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Request Revision</span>
              </button>

              <button
                onClick={() => {
                  setReviewDecision('rejected');
                  setIsReviewDialogOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>

        {/* REVIEW DECISION DIALOG MODAL */}
        {isReviewDialogOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                Staff Review Decision: {reviewDecision.replace(/_/g, ' ')}
              </h3>
              
              {reviewDecision === 'rejected' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Rejection Reason (Sent to Client) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Drawing scale does not match SANS 10139 standard."
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Engineering Notes / Action Items
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Notes for the compliance record..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review & Notify Client</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
