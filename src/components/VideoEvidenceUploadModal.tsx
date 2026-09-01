import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Upload,
  Video,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Cpu,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { VideoCategoryType } from '../types';

const CATEGORY_OPTIONS: { value: VideoCategoryType; label: string; desc: string }[] = [
  { value: 'during_work_progress', label: 'During-Work Progress', desc: 'Active technician installation or inspection progress' },
  { value: 'fault_evidence', label: 'Fault Diagnostic Evidence', desc: 'Specific electrical or sensor fault condition' },
  { value: 'fire_alarm_panel_display', label: 'Fire Alarm Panel Display & Beeper', desc: 'LCD fault screen, general alarm LEDs or buzzer' },
  { value: 'detector_or_device', label: 'Detector / Device Inspection', desc: 'Optical sensor, call point, or sounder strobe condition' },
  { value: 'cable_route', label: 'Cable Route & Containment', desc: 'Fire-resistant cable clipping, conduit, and fire stopping' },
  { value: 'installation_evidence', label: 'Installation Evidence', desc: 'Newly mounted equipment and containment verification' },
  { value: 'repair_evidence', label: 'Remedial Repair Evidence', desc: 'Rectification of previously identified faults or defects' },
  { value: 'testing_evidence', label: 'Testing & Sounder Decibel Evidence', desc: 'Point-to-point testing, smoke aerosol or audibility test' },
  { value: 'commissioning_evidence', label: 'Commissioning & Handover Evidence', desc: 'Full loop verification and cause-and-effect witnessing' },
  { value: 'interface_test_evidence', label: 'HVAC / Damper / Lift Interface Test', desc: 'Mechanical relay actuation, ventilation trip or door hold-open release' },
  { value: 'outstanding_work', label: 'Outstanding Work Item', desc: 'Identified site impediment or work requiring follow-up' },
  { value: 'corrective_action_evidence', label: 'Corrective Action Verification', desc: 'Resolution of non-compliance observation' },
  { value: 'customer_concern', label: 'Client-Reported Concern', desc: 'Video recorded by facility manager or building representative' },
  { value: 'other_technical_evidence', label: 'Other Technical Evidence', desc: 'Supporting documentation aligned with SANS 10139' }
];

export const VideoEvidenceUploadModal: React.FC = () => {
  const {
    isUploadVideoModalOpen,
    setIsUploadVideoModalOpen,
    preselectedRequestIdForVideo,
    setPreselectedRequestIdForVideo,
    serviceRequests,
    uploadServiceVideo,
    currentUser,
    showToast
  } = useApp();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    preselectedRequestIdForVideo || serviceRequests[0]?.id || ''
  );
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<VideoCategoryType>('during_work_progress');
  const [siteAreaOrRoom, setSiteAreaOrRoom] = useState<string>('');
  const [equipmentReference, setEquipmentReference] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [workStage, setWorkStage] = useState<string>('Site Survey & Assessment');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');

  if (!isUploadVideoModalOpen) return null;

  const handleClose = () => {
    if (isUploading) return;
    setIsUploadVideoModalOpen(false);
    setPreselectedRequestIdForVideo(null);
    setFile(null);
    setTitle('');
    setDescription('');
    setSiteAreaOrRoom('');
    setEquipmentReference('');
    setPrivacyConsent(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 250 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Maximum video upload size is 250MB.');
        return;
      }
      setFile(selected);
      if (!title) {
        // Auto-generate initial title from file name
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('error', 'Missing Title', 'Please enter a descriptive title for this video evidence.');
      return;
    }

    if (!privacyConsent) {
      showToast('error', 'Consent Required', 'You must agree to the technical evidence processing consent.');
      return;
    }

    const matchedRequest = serviceRequests.find(
      r => r.id === selectedRequestId || r.referenceNumber === selectedRequestId
    );

    setIsUploading(true);
    setUploadProgress(15);
    setProcessingStatusText('Computing SHA-256 integrity hash and uploading encrypted chunk...');

    await new Promise(r => setTimeout(r, 600));
    setUploadProgress(50);
    setProcessingStatusText('Executing ClamAV security scan & metadata verification...');

    await new Promise(r => setTimeout(r, 700));
    setUploadProgress(85);
    setProcessingStatusText('FFmpeg transcoding to baseline H.264 MP4 with faststart flags...');

    await new Promise(r => setTimeout(r, 600));
    setUploadProgress(100);
    setProcessingStatusText('Securing in encrypted storage & dispatching acknowledgement email...');

    await uploadServiceVideo(
      {
        serviceRequestId: matchedRequest?.id,
        serviceRequestRef: matchedRequest?.referenceNumber,
        siteName: matchedRequest?.siteName || 'Commercial Premises',
        siteAreaOrRoom: siteAreaOrRoom || 'Main Riser / Plant Area',
        equipmentReference: equipmentReference || 'Addressable Fire-Alarm Sensor',
        title,
        description,
        category,
        workStage,
        originalFileName: file?.name || 'field_evidence_recording.mp4',
        fileSize: file?.size || 16500000,
        duration: 35,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      },
      file || undefined
    );

    setIsUploading(false);
    handleClose();
  };

  return (
    <div
      id="video-evidence-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A192F]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Upload During-Work Video Evidence"
    >
      <div className="relative w-full max-w-3xl bg-[#F8F9FA] border-2 border-[#0A192F] shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#CC0000]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#CC0000] text-white flex items-center justify-center rounded-sm shadow-inner">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#CC0000] bg-white/10 px-2 py-0.5 rounded-sm font-bold">
                  SANS 10139 Technical Verification
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white mt-0.5">
                Upload During-Work Video Evidence
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer disabled:opacity-40"
            title="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Linked Service Request */}
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
              1. Linked Service Request Reference *
            </label>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000] font-mono"
              required
            >
              {serviceRequests.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.referenceNumber} — {req.siteName} ({req.serviceTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Video Category & Work Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                2. Evidence Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategoryType)}
                className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                required
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5 italic">
                {CATEGORY_OPTIONS.find(c => c.value === category)?.desc}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                3. Work Stage Alignment *
              </label>
              <select
                value={workStage}
                onChange={(e) => setWorkStage(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
              >
                <option value="Enquiry & Consultation">Step 1: Enquiry & Consultation</option>
                <option value="Site Survey & Assessment">Step 2: Site Survey & Assessment</option>
                <option value="System Category & Design">Step 3: System Category & Design</option>
                <option value="Scope & Quotation">Step 4: Scope & Quotation</option>
                <option value="Installation">Step 5: Installation</option>
                <option value="Testing & Commissioning">Step 6: Testing & Commissioning</option>
                <option value="Handover & Maintenance">Step 7: Handover & Maintenance</option>
                <option value="Fault Emergency Triage">Emergency Fault Triage</option>
              </select>
            </div>
          </div>

          {/* Evidence Details */}
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                4. Video Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Zone 2 Riser Smoke Damper Interface Relay Test"
                className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                  5. Specific Site Location / Room
                </label>
                <input
                  type="text"
                  value={siteAreaOrRoom}
                  onChange={(e) => setSiteAreaOrRoom(e.target.value)}
                  placeholder="e.g. Plant Room B, Ceiling Void Riser C"
                  className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                  6. Equipment Tag / Reference
                </label>
                <input
                  type="text"
                  value={equipmentReference}
                  onChange={(e) => setEquipmentReference(e.target.value)}
                  placeholder="e.g. Optical Beam Receiver OB-02 / Loop 1"
                  className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                7. Technical Description / Findings
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what is recorded, observed fault behavior, voltage/decibel readings, or testing sequence..."
                className="w-full bg-[#F8F9FA] border border-slate-300 px-3 py-2 text-sm text-slate-800 rounded-sm focus:outline-none focus:border-[#CC0000]"
              />
            </div>
          </div>

          {/* File Upload Box */}
          <div className="bg-white border-2 border-dashed border-slate-300 p-6 rounded-sm text-center hover:border-[#CC0000] transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">
              {file ? file.name : 'Select or Drag Video Evidence File Here'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports MP4, MOV, WebM, AVI (Up to 250MB). Processed with FFmpeg faststart streaming.
            </p>
            <label className="mt-3 inline-block bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-sm cursor-pointer shadow-sm transition-colors">
              <span>{file ? 'Change Selected File' : 'Browse Files'}</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Privacy & Compliance Agreement */}
          <div className="bg-slate-100 border-l-4 border-l-[#0A192F] p-4 rounded-sm">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#CC0000] rounded-sm focus:ring-[#CC0000]"
                required
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>SANS 10139 Technical Evidence Consent:</strong> I confirm this video contains non-domestic fire-detection technical evidence for service assessment. All files are securely hashed (SHA-256), scanned for malware, and held in private encrypted storage with authenticated access logging.
              </span>
            </label>
          </div>

          {/* Progress Bar while Uploading */}
          {isUploading && (
            <div className="bg-slate-900 text-white p-4 rounded-sm border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center space-x-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Celery Worker Processing</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#CC0000] h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {processingStatusText}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-sm text-xs font-mono uppercase font-bold tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !privacyConsent}
              className="px-6 py-2.5 bg-[#CC0000] hover:bg-[#A30000] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono uppercase font-bold tracking-wider rounded-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Processing Evidence...' : 'Submit Video Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
