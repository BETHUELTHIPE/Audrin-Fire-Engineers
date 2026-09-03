import React, { useState } from 'react';
import {
  Edit3,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Send,
  ShieldAlert,
  HelpCircle,
  Check,
  Ban,
} from 'lucide-react';
import { MeetingMinutesVersion, MeetingMinutesCorrection } from '../types/meetingMinutes';
import { UserRole } from '../types';
import { meetingMinutesService } from '../services/meetingMinutesService';

interface MeetingMinutesCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutesVersion: MeetingMinutesVersion;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  pendingCorrectionToReview?: MeetingMinutesCorrection | null;
  onCorrectionProcessed?: () => void;
}

const SECTIONS = [
  'Attendees & Apologies',
  'Purpose & Agenda',
  'Discussion Summary',
  'Client Concerns',
  'Documents Discussed',
  'Decisions Made',
  'Action-Item Register',
  'Outstanding Information & Risks',
  'Workflow Stage & Follow-Up',
  'Other Section',
];

export const MeetingMinutesCorrectionModal: React.FC<MeetingMinutesCorrectionModalProps> = ({
  isOpen,
  onClose,
  minutesVersion,
  currentUserRole,
  currentUserId,
  currentUserName,
  currentUserEmail,
  pendingCorrectionToReview,
  onCorrectionProcessed,
}) => {
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'superadmin';
  const isReviewMode = !!pendingCorrectionToReview && isAdmin;

  const [sectionToCorrect, setSectionToCorrect] = useState(SECTIONS[0]);
  const [currentText, setCurrentText] = useState('');
  const [requestedCorrection, setRequestedCorrection] = useState('');
  const [reasonOrEvidence, setReasonOrEvidence] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitClientCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedCorrection.trim() || !reasonOrEvidence.trim()) return;

    setIsSubmitting(true);
    try {
      meetingMinutesService.submitCorrection({
        minutesId: minutesVersion.minutesId,
        minutesVersionId: minutesVersion.id,
        versionNumber: minutesVersion.minutesVersion,
        submittedByUserId: currentUserId,
        submittedByUserName: currentUserName,
        submittedByUserEmail: currentUserEmail,
        sectionToCorrect,
        currentText,
        requestedCorrection,
        reasonOrEvidence,
      });

      setFeedback('Your correction request has been submitted for engineering review. Audrin administrators will verify the transcript and issue a revised version.');
      setTimeout(() => {
        if (onCorrectionProcessed) onCorrectionProcessed();
        onClose();
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminDecision = (decision: 'approved' | 'rejected') => {
    if (!pendingCorrectionToReview) return;
    setIsSubmitting(true);
    try {
      const result = meetingMinutesService.reviewCorrection({
        correctionId: pendingCorrectionToReview.id,
        reviewedByUserId: currentUserId,
        reviewedByUserName: currentUserName,
        decision,
        adminNotes: adminNotes || (decision === 'approved' ? 'Verified against meeting transcript.' : 'Correction declined based on transcript evidence.'),
      });

      setFeedback(
        decision === 'approved'
          ? `Correction approved! Version ${result.newVersion?.minutesVersion}.0 has been generated and emailed separately to client & superusers.`
          : 'Correction request rejected. Audit trail updated.'
      );
      setTimeout(() => {
        if (onCorrectionProcessed) onCorrectionProcessed();
        onClose();
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                {isReviewMode ? 'Super Administrator Review' : 'Client Correction Request'}
              </span>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                {isReviewMode ? 'Review & Issue Corrected Version' : 'Request Minutes Correction'}
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

        {/* Feedback banner */}
        {feedback ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">{feedback}</h4>
            <p className="text-xs text-slate-500 font-mono">Closing modal...</p>
          </div>
        ) : isReviewMode ? (
          /* Admin Review View */
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-1">
              <div className="font-bold font-mono">
                Correction Requested by {pendingCorrectionToReview?.submittedByUserName} ({pendingCorrectionToReview?.submittedByUserEmail})
              </div>
              <div className="text-[11px]">
                Target Section: <strong>{pendingCorrectionToReview?.sectionToCorrect}</strong> (Version {pendingCorrectionToReview?.versionNumber}.0)
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-slate-700">Client's Requested Correction:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800">
                "{pendingCorrectionToReview?.requestedCorrection}"
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-slate-700">Reason / Transcript Reference Provided:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                {pendingCorrectionToReview?.reasonOrEvidence}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-slate-700">Admin Review Notes / Justification:</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Enter engineering notes or transcript verification details..."
                className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAdminDecision('rejected')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>Reject Request</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdminDecision('approved')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve &amp; Issue Next Version</span>
              </button>
            </div>
          </div>
        ) : (
          /* Client Request Form */
          <form onSubmit={handleSubmitClientCorrection} className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] leading-relaxed">
              If any discussion item, decision, or action item in Version {minutesVersion.minutesVersion}.0 is inaccurate, describe the correction below. Approved changes will generate a revised minutes document.
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">Select Section:</label>
              <select
                value={sectionToCorrect}
                onChange={e => setSectionToCorrect(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              >
                {SECTIONS.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Current Text in Document (optional):
              </label>
              <textarea
                rows={2}
                value={currentText}
                onChange={e => setCurrentText(e.target.value)}
                placeholder="Paste the excerpt you wish to correct..."
                className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Requested Correction <span className="text-rose-600">*</span>:
              </label>
              <textarea
                rows={2}
                required
                value={requestedCorrection}
                onChange={e => setRequestedCorrection(e.target.value)}
                placeholder="State the accurate wording or detail..."
                className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Reason / Clarification <span className="text-rose-600">*</span>:
              </label>
              <textarea
                rows={2}
                required
                value={reasonOrEvidence}
                onChange={e => setReasonOrEvidence(e.target.value)}
                placeholder="Explain why this change is required (e.g., audio was inaudible, action owner was misidentified)..."
                className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase rounded cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase rounded shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Correction Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
