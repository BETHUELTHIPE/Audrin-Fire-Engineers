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
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportPhotoSelection, ReportPhotoCategory } from '../types';

interface SubmitPostWorkEvidenceModalProps {
  initialRequestId?: string | null;
  onClose: () => void;
}

const PRESET_AFTER_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    title: 'Control Panel - Healthy Green Power LED',
    category: 'control_panel' as ReportPhotoCategory,
    notes: 'Zone 3 fault cleared. Main panel shows healthy quiescent green LED status.',
    room: 'Main Security Reception'
  },
  {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    title: 'Cleaned Optical Smoke Chamber Head',
    category: 'smoke_detector' as ReportPhotoCategory,
    notes: 'Optical chamber vacuumed and cleaned. Vent aperture free of debris.',
    room: 'Warehouse Aisle 4'
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    title: 'Reset Manual Call Point with Security Seal',
    category: 'manual_call_point' as ReportPhotoCategory,
    notes: 'Frangible test element replaced; operating lever restored; seal attached.',
    room: 'Exit Stairwell 2'
  }
];

const PRESET_DURING_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    title: 'Technician Terminal Continuity Testing',
    category: 'power_supply' as ReportPhotoCategory,
    notes: 'Multimeter measurement on loop end-of-line resistor terminals.',
    room: 'Server Room Distribution Board'
  }
];

export const SubmitPostWorkEvidenceModal: React.FC<SubmitPostWorkEvidenceModalProps> = ({
  initialRequestId,
  onClose
}) => {
  const {
    serviceRequests,
    triggerSubmitPostWorkEvidence,
    uploadReportPhoto,
    showToast
  } = useApp();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    initialRequestId || (serviceRequests.length > 0 ? serviceRequests[0].id : '')
  );

  const [afterPhotos, setAfterPhotos] = useState<ReportPhotoSelection[]>([]);
  const [duringPhotos, setDuringPhotos] = useState<ReportPhotoSelection[]>([]);
  const [workActivities, setWorkActivities] = useState<string[]>([
    'Zone 3 loop circuit continuity isolated and re-terminated',
    'Optical smoke detector chamber disassembled, de-dusted, and optical calibration checked',
    'Manual call point operating mechanism tested with reset key and restored',
    'Final quiescent lamp test completed across all repeater zones'
  ]);
  const [newActivityInput, setNewActivityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom photo inputs
  const [customPhotoCaption, setCustomPhotoCaption] = useState('');
  const [customPhotoCategory, setCustomPhotoCategory] = useState<ReportPhotoCategory>('control_panel');
  const [customPhotoLocation, setCustomPhotoLocation] = useState('Main Plant Area');
  const [customPhotoNotes, setCustomPhotoNotes] = useState('Visible condition post-rectification.');
  const [customPhotoStage, setCustomPhotoStage] = useState<'after_work' | 'during_work'>('after_work');

  const handleAddPresetAfter = (preset: typeof PRESET_AFTER_PHOTOS[0]) => {
    const newPhoto = uploadReportPhoto({
      photoUrl: preset.url,
      caption: preset.title,
      category: preset.category,
      roomOrLocation: preset.room,
      visibleConditionNotes: preset.notes,
      stage: 'after_work'
    });
    setAfterPhotos(prev => [...prev, newPhoto]);
    showToast('info', 'After Photo Added', `Loaded "${preset.title}".`);
  };

  const handleAddPresetDuring = (preset: typeof PRESET_DURING_PHOTOS[0]) => {
    const newPhoto = uploadReportPhoto({
      photoUrl: preset.url,
      caption: preset.title,
      category: preset.category,
      roomOrLocation: preset.room,
      visibleConditionNotes: preset.notes,
      stage: 'during_work'
    });
    setDuringPhotos(prev => [...prev, newPhoto]);
    showToast('info', 'During-Work Photo Added', `Loaded "${preset.title}".`);
  };

  const handleAddCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoCaption.trim()) {
      showToast('error', 'Caption Required', 'Please enter a caption for this photograph.');
      return;
    }

    const fallbackUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
    const newPhoto = uploadReportPhoto({
      photoUrl: fallbackUrl,
      caption: customPhotoCaption.trim(),
      category: customPhotoCategory,
      roomOrLocation: customPhotoLocation.trim() || 'Facility Area',
      visibleConditionNotes: customPhotoNotes.trim() || 'Visible condition recorded.',
      stage: customPhotoStage
    });

    if (customPhotoStage === 'after_work') {
      setAfterPhotos(prev => [...prev, newPhoto]);
    } else {
      setDuringPhotos(prev => [...prev, newPhoto]);
    }

    setCustomPhotoCaption('');
    setCustomPhotoNotes('');
    showToast('success', 'Photo Added', `Added to ${customPhotoStage.replace('_', ' ')} evidence.`);
  };

  const handleAddActivity = () => {
    if (!newActivityInput.trim()) return;
    setWorkActivities(prev => [...prev, newActivityInput.trim()]);
    setNewActivityInput('');
  };

  const handleRemoveActivity = (index: number) => {
    setWorkActivities(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateReport = async () => {
    if (!selectedRequestId) {
      showToast('error', 'Select Request', 'Please select an eligible service request.');
      return;
    }
    if (afterPhotos.length === 0) {
      showToast('warning', 'Post-work evidence incomplete', 'At least one approved after-work photograph is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await triggerSubmitPostWorkEvidence(
        selectedRequestId,
        afterPhotos,
        duringPhotos,
        workActivities
      );
      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRequest = serviceRequests.find(r => r.id === selectedRequestId || r.referenceNumber === selectedRequestId);

  return (
    <div id="submit-post-work-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                POST-WORK EVIDENCE SUBMISSION
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Automated Post-Work Condition Report Generator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compile rectified visible conditions, paired before/after comparisons, and activities conducted into a completed report.
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
          
          {/* Mandatory Disclaimer Box */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">MANDATORY POST-WORK REPORTING RULE:</p>
              <p className="italic">
                “This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records the visible condition shown in the submitted evidence and does not replace a physical site inspection, testing, commissioning or formal compliance assessment.”
              </p>
            </div>
          </div>

          {/* Request Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              1. Select Service Request for Handover
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
          </div>

          {/* Preset After-Work Photos for Quick Testing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                2. Quick Sample After-Work Evidence (Click to add)
              </label>
              <span className="text-[11px] text-slate-500">Post-rectification states</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_AFTER_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPresetAfter(preset)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all flex items-start gap-2 group"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      + {preset.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate italic">{preset.notes}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Attached After-Work Photos List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                3. Attached After-Work Photographs ({afterPhotos.length}) *
              </label>
              {afterPhotos.length === 0 && (
                <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> At least 1 After-Work photo is mandatory
                </span>
              )}
            </div>

            {afterPhotos.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-rose-300 dark:border-rose-800/60 rounded-xl bg-rose-50/20 dark:bg-rose-950/10">
                <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  No after-work photographs attached yet. Click the preset above to add completed state photos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {afterPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/20 dark:bg-emerald-950/20 relative"
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <img
                        src={p.photoUrl}
                        alt={p.caption}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1 left-1 text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                        AFTER WORK
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{p.caption}</p>
                      <p className="text-[10px] text-slate-500 truncate">{p.roomOrLocation}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.visibleConditionNotes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAfterPhotos(prev => prev.filter(x => x.id !== p.id))}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Activities Conducted List */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              4. Work Activities Conducted on Site
            </label>
            <div className="space-y-1.5">
              {workActivities.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-800 dark:text-slate-200">{act}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(i)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newActivityInput}
                onChange={(e) => setNewActivityInput(e.target.value)}
                placeholder="Add another work activity..."
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActivity();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddActivity}
                className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Add Activity
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || afterPhotos.length === 0}
            onClick={handleGenerateReport}
            className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            {isSubmitting ? (
              <>Generating Post-Work Report...</>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Post-Work Report & Email Client
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
