import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Info,
  Sparkles,
  Lock,
  CheckSquare,
  Square
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportPhotoSelection, ReportPhotoCategory } from '../types';

interface SafetyCheckItem {
  id: string;
  clause: string;
  title: string;
  description: string;
  isConfirmed: boolean;
}

const INITIAL_PRE_START_SAFETY_CHECKS: SafetyCheckItem[] = [
  {
    id: 'panel_isolation',
    clause: 'SANS 10139 Clause 25.1',
    title: 'Control Panel Isolated / Placed in Test Mode',
    description: 'Repeater & master panel switched to test/engineer mode; 24/7 monitoring room notified to prevent false brigade dispatch.',
    isConfirmed: false
  },
  {
    id: 'interlocks_isolated',
    clause: 'SANS 10139 Clause 25.3.4',
    title: 'Auxiliary Gas Suppression & HVAC Interlocks Isolated',
    description: 'Clean agent gas discharge circuits, smoke damper trip relays, magnetic door holders, and lift homing verified disarmed.',
    isConfirmed: false
  },
  {
    id: 'responsible_person_notified',
    clause: 'SANS 10139 Clause 25.3.1',
    title: 'Site Responsible Person & Facility Manager Briefed',
    description: 'On-site safety officer notified of arrival, audibility test zones, and expected physical inspection itinerary.',
    isConfirmed: false
  },
  {
    id: 'ppe_electrical_safety',
    clause: 'OHS Act / SANS 10139',
    title: 'Electrical PPE & Calibrated Test Equipment Verified',
    description: 'Insulated multimeters (CAT III), optical aerosol test poles, safety stepladders, and electrical LOTO verified intact.',
    isConfirmed: false
  },
  {
    id: 'logbook_initial_entry',
    clause: 'SANS 10139 Clause 25.4',
    title: 'Statutory Fire Logbook Countersigned on Arrival',
    description: 'Physical building SANS logbook inspected, initial entry stamped with SAQCC registration, and arrival timestamp recorded.',
    isConfirmed: false
  }
];

interface SubmitBeforeWorkEvidenceModalProps {
  initialRequestId?: string | null;
  onClose: () => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    title: 'Control Panel - Fault Indicator Visible',
    category: 'control_panel' as ReportPhotoCategory,
    notes: 'Zone 3 amber fault LED illuminated on main repeater panel. No physical heat damage visible.',
    room: 'Main Security Reception'
  },
  {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    title: 'Optical Smoke Detector in Warehouse B',
    category: 'smoke_detector' as ReportPhotoCategory,
    notes: 'Visible dust accumulation observed around chamber vents. Unit mounted at 4.5m height.',
    room: 'Warehouse Aisle 4'
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    title: 'Manual Call Point with Broken Frangible Element',
    category: 'manual_call_point' as ReportPhotoCategory,
    notes: 'Plastic test element observed in triggered position. No tamper seal intact.',
    room: 'Exit Stairwell 2'
  },
  {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    title: 'Strobe & Sounder Beacon Unit',
    category: 'sounder_beacon' as ReportPhotoCategory,
    notes: 'Beacon lens appears intact; wiring termination box sealed.',
    room: 'Level 1 Server Room'
  }
];

export const SubmitBeforeWorkEvidenceModal: React.FC<SubmitBeforeWorkEvidenceModalProps> = ({
  initialRequestId,
  onClose
}) => {
  const {
    serviceRequests,
    triggerSubmitBeforeWorkEvidence,
    uploadReportPhoto,
    showToast
  } = useApp();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    initialRequestId || (serviceRequests.length > 0 ? serviceRequests[0].id : '')
  );

  const [photos, setPhotos] = useState<ReportPhotoSelection[]>([]);
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive SANS 10139 Pre-Start Safety Checklist State
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheckItem[]>(INITIAL_PRE_START_SAFETY_CHECKS);

  const allSafetyChecksConfirmed = safetyChecks.every(check => check.isConfirmed);
  const confirmedSafetyCount = safetyChecks.filter(check => check.isConfirmed).length;

  const handleToggleSafetyCheck = (id: string) => {
    setSafetyChecks(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isConfirmed: !item.isConfirmed } : item
      )
    );
  };

  const handleConfirmAllSafety = () => {
    setSafetyChecks(prev => prev.map(item => ({ ...item, isConfirmed: true })));
    showToast('success', 'Safety Protocols Confirmed', 'All 5 SANS 10139 pre-start safety checklist items marked complete.');
  };

  // New photo field inputs
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [photoCategoryInput, setPhotoCategoryInput] = useState<ReportPhotoCategory>('control_panel');
  const [photoLocationInput, setPhotoLocationInput] = useState('Ground Floor Main Lobby');
  const [photoNotesInput, setPhotoNotesInput] = useState('Visible condition recorded upon arrival.');

  const handleAddPresetPhoto = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    const newPhoto = uploadReportPhoto({
      photoUrl: preset.url,
      caption: preset.title,
      category: preset.category,
      roomOrLocation: preset.room,
      visibleConditionNotes: preset.notes,
      stage: 'before_work'
    });
    setPhotos(prev => [...prev, newPhoto]);
    showToast('info', 'Sample Photo Added', `Loaded "${preset.title}".`);
  };

  const handleAddCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoCaptionInput.trim()) {
      showToast('error', 'Caption Required', 'Please enter a descriptive caption for this photograph.');
      return;
    }

    const fallbackUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
    const newPhoto = uploadReportPhoto({
      photoUrl: photoUrlInput.trim() || fallbackUrl,
      caption: photoCaptionInput.trim(),
      category: photoCategoryInput,
      roomOrLocation: photoLocationInput.trim() || 'Facility Area',
      visibleConditionNotes: photoNotesInput.trim() || 'Visible condition recorded on photograph.',
      stage: 'before_work'
    });

    setPhotos(prev => [...prev, newPhoto]);
    setPhotoUrlInput('');
    setPhotoCaptionInput('');
    setPhotoNotesInput('');
    showToast('success', 'Photo Added', 'Photograph added to Pre-Work evidence collection.');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateReport = async () => {
    if (!selectedRequestId) {
      showToast('error', 'Select Request', 'Please select an eligible service request.');
      return;
    }
    if (!allSafetyChecksConfirmed) {
      showToast(
        'error',
        'Safety Checklist Incomplete',
        'You must complete and confirm all 5 SANS 10139 Pre-Start Safety protocols before submitting evidence.'
      );
      return;
    }
    if (photos.length === 0) {
      showToast('error', 'Photographs Required', 'Please attach at least 1 before-work photograph to generate the condition report.');
      return;
    }

    setIsSubmitting(true);
    try {
      await triggerSubmitBeforeWorkEvidence(selectedRequestId, photos, clientNotes);
      onClose();
    } catch (err: any) {
      // Toast already shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRequest = serviceRequests.find(r => r.id === selectedRequestId || r.referenceNumber === selectedRequestId);

  return (
    <div id="submit-before-work-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRE-WORK EVIDENCE SUBMISSION
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Automated Pre-Work Condition Report Generator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload initial visible site photographs to generate a preliminary condition report and dispatch client notification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Mandatory Disclaimer Reminder */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">MANDATORY AUTOMATED REPORTING RULE:</p>
              <p className="italic">
                “This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records the visible condition shown in the submitted evidence and does not replace a physical site inspection, testing, commissioning or formal compliance assessment.”
              </p>
            </div>
          </div>

          {/* Service Request Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              1. Select Service Request
            </label>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 font-medium"
            >
              {serviceRequests.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.referenceNumber} — {req.serviceType} ({req.customerName} - {req.facilityName || req.siteAddress})
                </option>
              ))}
            </select>

            {selectedRequest && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500">Client:</span> <strong className="text-slate-900 dark:text-white">{selectedRequest.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span> <strong className="text-slate-900 dark:text-white">{selectedRequest.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span> <span className="font-mono text-amber-600 dark:text-amber-400">{selectedRequest.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: SANS 10139 Interactive Pre-Start Safety Checklist */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
                    2. SANS 10139 Pre-Start Safety Checklist
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      allSafetyChecksConfirmed
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {allSafetyChecksConfirmed
                      ? '5/5 PASSED - SUBMISSION UNLOCKED'
                      : `${confirmedSafetyCount}/5 CONFIRMED - SUBMISSION LOCKED`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Engineers must complete and sign off on all statutory isolation and safety protocols before submitting 'Before Work' evidence.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmAllSafety}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                Confirm All Checks
              </button>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-1">
              {safetyChecks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleSafetyCheck(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.isConfirmed
                      ? 'bg-emerald-950/20 border-emerald-800/80 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Toggle check for ${item.title}`}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  >
                    {item.isConfirmed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold">{item.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                        {item.clause}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.isConfirmed && (
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0 uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Preset Photo Picker for Fast Testing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                3. Quick Sample Evidence Presets (Click to add)
              </label>
              <span className="text-[11px] text-slate-500">Pre-configured site test cases</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPresetPhoto(preset)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all flex items-start gap-2.5 group"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      + {preset.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{preset.room}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">{preset.notes}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Photograph Upload Form */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-red-600" />
              Or Add Custom Photograph Evidence
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Photo Caption / Subject *
                </label>
                <input
                  type="text"
                  value={photoCaptionInput}
                  onChange={(e) => setPhotoCaptionInput(e.target.value)}
                  placeholder="e.g., Repeater Panel Fault Indicator"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Equipment Category
                </label>
                <select
                  value={photoCategoryInput}
                  onChange={(e) => setPhotoCategoryInput(e.target.value as ReportPhotoCategory)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="control_panel">Control / Indicating Panel</option>
                  <option value="smoke_detector">Smoke / Heat Detector</option>
                  <option value="manual_call_point">Manual Call Point</option>
                  <option value="sounder_beacon">Sounder / Strobe Beacon</option>
                  <option value="extinguisher">Fire Extinguisher</option>
                  <option value="hose_reel">Fire Hose Reel / Hydrant</option>
                  <option value="power_supply">Power Supply / Battery Bank</option>
                  <option value="general_site_area">General Site Area</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Room / Location
                </label>
                <input
                  type="text"
                  value={photoLocationInput}
                  onChange={(e) => setPhotoLocationInput(e.target.value)}
                  placeholder="e.g. Server Room Floor 2"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Photo Image URL (Optional or uses demo image)
                </label>
                <input
                  type="text"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://... or leave blank for sample"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Visible Condition Observations (Factual description only):
              </label>
              <textarea
                value={photoNotesInput}
                onChange={(e) => setPhotoNotesInput(e.target.value)}
                placeholder="e.g. Zone 3 indicator illuminated; plastic casing intact; no soot marks visible."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Photo to Evidence Pack
              </button>
            </div>
          </div>

          {/* Attached Evidence Queue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                3. Attached Before-Work Photographs ({photos.length})
              </label>
              {photos.length === 0 && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> At least 1 photo required
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No photos added yet. Click one of the quick presets above or enter a custom photo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 relative group"
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <img
                        src={p.photoUrl}
                        alt={p.caption}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1 left-1 text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                        BEFORE
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{p.caption}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.roomOrLocation}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.visibleConditionNotes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Client Scope Comments */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              4. Additional Initial Client Notes (Optional)
            </label>
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="e.g. Alarm panel sounded intermittently around 08:30 during generator test."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {!allSafetyChecksConfirmed ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Pre-start safety checklist incomplete ({confirmedSafetyCount}/5 confirmed)
              </span>
            ) : photos.length === 0 ? (
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Attach at least 1 photograph to submit
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Safety confirmed & evidence attached ({photos.length} photos)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || photos.length === 0 || !allSafetyChecksConfirmed}
              onClick={handleGenerateReport}
              className="px-5 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <>Generating Pre-Work Report...</>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Pre-Work Report & Email Client
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
