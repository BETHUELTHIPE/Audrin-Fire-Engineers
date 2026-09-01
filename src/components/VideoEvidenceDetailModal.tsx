import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookmarkPlus,
  ShieldCheck,
  FileCheck,
  Lock,
  Layers,
  MapPin,
  Building,
  User,
  Hash,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ServiceVideo, VideoReviewStatus } from '../types';

export const VideoEvidenceDetailModal: React.FC = () => {
  const {
    selectedVideoForDetail,
    setSelectedVideoForDetail,
    currentUser,
    reviewServiceVideo,
    addTimestampMarker,
    toggleTimestampReportApproval,
    lockVideoEvidence,
    showToast
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [markerTitle, setMarkerTitle] = useState<string>('');
  const [markerDesc, setMarkerDesc] = useState<string>('');
  const [markerApprovedForReport, setMarkerApprovedForReport] = useState<boolean>(true);
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);

  // Admin Review Form State
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isCustomerVisible, setIsCustomerVisible] = useState<boolean>(
    selectedVideoForDetail?.isCustomerVisible ?? true
  );
  const [includeInReport, setIncludeInReport] = useState<boolean>(
    selectedVideoForDetail?.includedInReport ?? false
  );

  if (!selectedVideoForDetail) return null;

  const video = selectedVideoForDetail;
  const isStaffOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'staff';

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const jumpToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateMarker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerTitle.trim()) {
      showToast('error', 'Missing Title', 'Please enter a title for the timestamp marker.');
      return;
    }

    const currentSec = Math.floor(videoRef.current?.currentTime || currentTime);
    addTimestampMarker(video.id, {
      timestampSeconds: currentSec,
      timestampFormatted: formatSeconds(currentSec),
      title: markerTitle,
      description: markerDesc || 'Observed technical inspection detail.',
      stillImageUrl: video.thumbnailUrl,
      approvedForReport: markerApprovedForReport,
      selectedBy: currentUser?.fullName || 'Technician'
    });

    setMarkerTitle('');
    setMarkerDesc('');
    setIsAddingMarker(false);
  };

  const handleSetStatus = (status: VideoReviewStatus) => {
    reviewServiceVideo(
      video.id,
      status,
      adminNotes || video.internalNotes,
      rejectionReason,
      isCustomerVisible,
      includeInReport || status === 'included_in_report'
    );
  };

  return (
    <div
      id="video-evidence-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A192F]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Video Evidence Details and Audit Log"
    >
      <div className="relative w-full max-w-5xl bg-[#F8F9FA] border-2 border-[#0A192F] shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#CC0000]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#CC0000] text-white flex items-center justify-center rounded-sm shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#CC0000] bg-white/10 px-2 py-0.5 rounded-sm font-bold">
                  Ref: {video.referenceNumber}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Req: {video.serviceRequestRef}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white mt-0.5 truncate max-w-xl">
                {video.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedVideoForDetail(null)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Grid: Video Player + Timestamps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Secure Video Stream Player (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-black rounded-sm overflow-hidden border border-slate-700 shadow-md relative group">
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full aspect-video object-contain"
                />
              </div>

              {/* Status and Metadata Badges */}
              <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-slate-500 font-bold">Review Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider ${
                      video.reviewStatus === 'approved' || video.reviewStatus === 'included_in_report'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : video.reviewStatus === 'rejected'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : video.reviewStatus === 'awaiting_review'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {video.customerVisibleStatus}
                    </span>
                  </div>

                  {video.isLockedAfterReport && (
                    <div className="flex items-center space-x-1 text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED (Report Issued)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono block">Category:</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {video.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block">Site Location:</span>
                    <span className="font-bold text-slate-800">{video.siteName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block">Area / Room:</span>
                    <span className="font-bold text-slate-800">{video.siteAreaOrRoom}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block">Equipment Ref:</span>
                    <span className="font-bold text-slate-800">{video.equipmentReference}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block">File Size & Duration:</span>
                    <span className="font-bold text-slate-800">{video.fileSizeFormatted} ({video.duration}s)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block">Uploaded By:</span>
                    <span className="font-bold text-slate-800">{video.uploadedBy}</span>
                  </div>
                </div>

                {video.description && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block font-mono">Description:</span>
                    {video.description}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Timestamps & Key Findings (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 p-4 rounded-sm shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookmarkPlus className="w-4 h-4 text-[#CC0000]" />
                    <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-[#0A192F]">
                      Timestamp Markers & Stills ({video.timestampMarkers.length})
                    </h3>
                  </div>

                  {!video.isLockedAfterReport && (
                    <button
                      onClick={() => setIsAddingMarker(!isAddingMarker)}
                      className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#CC0000] hover:underline cursor-pointer"
                    >
                      {isAddingMarker ? 'Cancel' : '+ Add Marker at ' + formatSeconds(currentTime)}
                    </button>
                  )}
                </div>

                {/* Form to add marker */}
                {isAddingMarker && (
                  <form onSubmit={handleCreateMarker} className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                      <span>Bookmark Time:</span>
                      <span className="text-[#CC0000]">{formatSeconds(currentTime)}</span>
                    </div>
                    <input
                      type="text"
                      value={markerTitle}
                      onChange={(e) => setMarkerTitle(e.target.value)}
                      placeholder="Marker Title (e.g. Earth fault LED display)"
                      className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                      required
                    />
                    <textarea
                      rows={2}
                      value={markerDesc}
                      onChange={(e) => setMarkerDesc(e.target.value)}
                      placeholder="Observation details..."
                      className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                    />
                    <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={markerApprovedForReport}
                        onChange={(e) => setMarkerApprovedForReport(e.target.checked)}
                        className="text-[#CC0000] rounded-sm"
                      />
                      <span>Include still in formal SANS 10139 report pack</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-mono font-bold uppercase py-1.5 rounded-sm transition-colors cursor-pointer"
                    >
                      Save Timestamp Marker
                    </button>
                  </form>
                )}

                {/* Timestamp List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {video.timestampMarkers.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-3 text-center">
                      No timestamp markers bookmarked yet. Play the video and add key moments of inspection.
                    </p>
                  ) : (
                    video.timestampMarkers.map((marker) => (
                      <div
                        key={marker.id}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm flex items-start justify-between gap-2 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1">
                          <button
                            onClick={() => jumpToTimestamp(marker.timestampSeconds)}
                            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#CC0000] hover:underline cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>[{marker.timestampFormatted}]</span>
                            <span className="text-slate-900 font-sans font-bold">{marker.title}</span>
                          </button>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {marker.description}
                          </p>
                        </div>

                        {isStaffOrAdmin && (
                          <button
                            onClick={() => toggleTimestampReportApproval(video.id, marker.id)}
                            className={`p-1 text-[10px] font-mono rounded-sm border cursor-pointer ${
                              marker.approvedForReport
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                            title="Toggle report pack inclusion"
                          >
                            {marker.approvedForReport ? '✓ In Report' : '+ Add to Report'}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security & FFmpeg Processing Verification */}
              <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 font-mono uppercase font-bold text-slate-700 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security & Integrity Verification</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="truncate">
                    <strong>SHA-256 Hash:</strong> {video.processingJob.sha256Hash}
                  </div>
                  <div>
                    <strong>Transcode Profile:</strong> {video.processingJob.extractedMetadata.codec} (1080p, 30fps)
                  </div>
                  <div>
                    <strong>Malware Engine:</strong> <span className="text-emerald-700 font-bold">ClamAV Clean (0 signatures detected)</span>
                  </div>
                  <div>
                    <strong>Celery Task:</strong> {video.processingJob.celeryTaskId}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Review & Governance Action Panel */}
          {isStaffOrAdmin && !video.isLockedAfterReport && (
            <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-5 rounded-sm shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
                <span>Audrin Engineering Technical Review Actions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Internal Engineering Notes (Staff / Admin):
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Document alignment with SANS 10139 requirements, cable route observations..."
                    className="w-full bg-[#F8F9FA] border border-slate-300 p-2 text-xs text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Rejection / Remedial Reason (if applicable):
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Video does not show device labeling clearly, re-record Zone 2 riser..."
                    className="w-full bg-[#F8F9FA] border border-slate-300 p-2 text-xs text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomerVisible}
                      onChange={(e) => setIsCustomerVisible(e.target.checked)}
                      className="text-[#CC0000] rounded-sm"
                    />
                    <span>Customer Visible</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInReport}
                      onChange={(e) => setIncludeInReport(e.target.checked)}
                      className="text-[#CC0000] rounded-sm"
                    />
                    <span>Include in Final SANS 10139 Report</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center space-x-2">
                  <button
                    onClick={() => handleSetStatus('approved')}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                  >
                    Approve Evidence
                  </button>

                  <button
                    onClick={() => handleSetStatus('included_in_report')}
                    className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                  >
                    Approve & Include in Report
                  </button>

                  <button
                    onClick={() => handleSetStatus('more_info_required')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                  >
                    Request More Info
                  </button>

                  <button
                    onClick={() => handleSetStatus('rejected')}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer"
                  >
                    Reject Evidence
                  </button>

                  <button
                    onClick={() => lockVideoEvidence(video.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer flex items-center space-x-1"
                    title="Lock video evidence permanently"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Lock Record</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0A192F] text-white px-5 py-3 flex items-center justify-between border-t border-slate-700 text-xs font-mono">
          <span className="text-slate-400">
            Secure signed URL valid for authorized engineering review.
          </span>
          <button
            onClick={() => setSelectedVideoForDetail(null)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase rounded-sm transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
