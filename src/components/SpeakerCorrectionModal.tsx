import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  X,
  UserCheck,
  AlertCircle,
  Save,
  HelpCircle,
} from 'lucide-react';
import { MeetingTranscript, TranscriptSpeaker } from '../types/meetingMinutes';
import { meetingMinutesService } from '../services/meetingMinutesService';

interface SpeakerCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: MeetingTranscript;
  onSuccess?: () => void;
}

export const SpeakerCorrectionModal: React.FC<SpeakerCorrectionModalProps> = ({
  isOpen,
  onClose,
  transcript,
  onSuccess,
}) => {
  const [speakers, setSpeakers] = useState<TranscriptSpeaker[]>(transcript.speakers || []);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpeakerChange = (id: string, field: 'identifiedName' | 'role', val: string) => {
    setSpeakers(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      speakers.forEach(spk => {
        if (spk.identifiedName) {
          meetingMinutesService.correctSpeaker(
            transcript.id,
            spk.id,
            spk.identifiedName,
            spk.role
          );
        }
      });
      setFeedback('Speaker mappings saved and aligned with all transcript utterances.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                Transcript Speaker Realignment
              </span>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Correct Identified Speakers
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-900 text-[11px] leading-relaxed">
            Where Zoom provides speaker labels or where participants were marked as "Unknown Speaker", you can assign verified attendee names here. Unidentified speakers should remain labelled as "Unknown Speaker" or "Unidentified participant" per privacy requirements.
          </div>

          {feedback ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {speakers.map((spk, idx) => (
                <div key={spk.id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                    <span>Original Label: <strong>{spk.speakerLabel}</strong></span>
                    <span className="text-slate-400">Confidence: {((spk.confidence || 0.95) * 100).toFixed(0)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-700 mb-0.5">
                        Verified Name:
                      </label>
                      <input
                        type="text"
                        value={spk.identifiedName || ''}
                        onChange={e => handleSpeakerChange(spk.id, 'identifiedName', e.target.value)}
                        placeholder="e.g. Thabo Mokoena"
                        className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-700 mb-0.5">
                        Role:
                      </label>
                      <select
                        value={spk.role || 'unknown'}
                        onChange={e => handleSpeakerChange(spk.id, 'role', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
                      >
                        <option value="host">Host (Audrin)</option>
                        <option value="client">Client</option>
                        <option value="engineer">Fire Engineer</option>
                        <option value="guest">Guest</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!feedback && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase rounded cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-mono text-xs font-bold uppercase rounded shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Realign Transcript'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
