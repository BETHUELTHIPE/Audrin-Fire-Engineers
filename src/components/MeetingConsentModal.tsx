import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  UserCheck,
  X,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  meetingMinutesService,
  CONSENT_LEGAL_NOTICE,
  CONSENT_CHECKBOX_LABEL,
  CONSENT_TEXT_VERSION,
} from '../services/meetingMinutesService';
import { MeetingConsent, ConsentStatus } from '../types/meetingMinutes';
import { UserRole } from '../types';

interface MeetingConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  appointmentRef: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserRole: UserRole;
  onConsentRecorded?: (consent: MeetingConsent) => void;
}

export const MeetingConsentModal: React.FC<MeetingConsentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  appointmentRef,
  serviceRequestId,
  serviceRequestRef,
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserRole,
  onConsentRecorded,
}) => {
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declinedMode, setDeclinedMode] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');

  const existingConsent = meetingMinutesService.getConsent(appointmentId, currentUserId);

  if (!isOpen) return null;

  const handleConfirmConsent = (status: ConsentStatus) => {
    setIsSubmitting(true);
    try {
      const consent = meetingMinutesService.recordConsent({
        appointmentId,
        appointmentRef,
        serviceRequestId,
        serviceRequestRef,
        userId: currentUserId,
        userName: currentUserName,
        userEmail: currentUserEmail,
        userRole: currentUserRole,
        consentStatus: status,
      });

      if (onConsentRecorded) {
        onConsentRecorded(consent);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawConsent = () => {
    if (!existingConsent) return;
    setIsSubmitting(true);
    try {
      meetingMinutesService.withdrawConsent(
        existingConsent.id,
        withdrawalReason || 'Client withdrew recording consent via portal.'
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                Audrin Fire Engineers • Participant Privacy
              </span>
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                Zoom Recording &amp; AI Transcription Consent
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs leading-relaxed">
          {/* Appointment Context Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-500">APPOINTMENT:</span>{' '}
              <strong className="text-[#0A192F]">{appointmentRef}</strong>
            </div>
            <div>
              <span className="text-slate-500">REQUEST:</span>{' '}
              <strong className="text-[#CC0000]">{serviceRequestRef}</strong>
            </div>
            <div>
              <span className="text-slate-500">USER:</span>{' '}
              <strong className="text-slate-800">{currentUserName}</strong>
            </div>
          </div>

          {/* Active Consent Status if already consented */}
          {existingConsent && !existingConsent.isWithdrawn && !declinedMode ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-sm space-y-3">
              <div className="flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Consent Active &amp; Recorded</h4>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Recorded on {new Date(existingConsent.consentedAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} (SAST). AI meeting minutes, action items and private S3 PDF generation are enabled.
                  </p>
                  <p className="text-[10px] font-mono text-emerald-700 mt-1">
                    Consent Version: {existingConsent.consentTextVersion} | IP: {existingConsent.ipAddress}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <button
                  onClick={() => setDeclinedMode(true)}
                  className="text-[11px] font-mono font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  Withdraw Recording Consent
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-emerald-700 text-white font-mono text-xs font-bold uppercase rounded-sm hover:bg-emerald-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : declinedMode ? (
            /* Withdrawal Mode */
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-sm space-y-3">
              <div className="flex items-start gap-2.5 text-rose-900">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Withdraw or Decline Consent</h4>
                  <p className="text-[11px] text-rose-800 mt-1">
                    If recording consent is declined, automated AI minutes and cloud transcripts will <strong>not</strong> be processed. Authorised Audrin staff will record manual minutes, and the system will log that automated minutes were unavailable because consent was not provided.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Reason for declining or withdrawing (optional):
                </label>
                <textarea
                  rows={2}
                  value={withdrawalReason}
                  onChange={e => setWithdrawalReason(e.target.value)}
                  placeholder="e.g. Confidential client security requirements / manual minutes requested..."
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setDeclinedMode(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-mono underline cursor-pointer"
                >
                  Back to Consent Notice
                </button>
                <button
                  onClick={existingConsent ? handleWithdrawConsent : () => handleConfirmConsent('declined')}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-mono text-xs font-bold uppercase rounded-sm shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Decline / Withdrawal'}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Consent Notice */
            <>
              <div className="p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Mandatory Participant Notice</span>
                </div>
                <blockquote className="text-slate-800 font-serif text-[13px] leading-relaxed italic pl-1">
                  “{CONSENT_LEGAL_NOTICE}”
                </blockquote>
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 border border-slate-200 rounded-sm">
                <h4 className="font-mono font-bold uppercase text-[11px] text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Security &amp; Processing Standards</span>
                </h4>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Anti-Hallucination:</strong> Minutes are derived strictly from the Zoom transcript with qualified SANS 10139 fire-detection disclaimers.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Private Amazon S3 Storage:</strong> PDFs and encrypted transcripts are stored in restricted S3 buckets and never made public.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Separate Dispatches:</strong> The PDF is emailed separately to your verified email and authorized Audrin superusers (no shared recipient exposure).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Consent Checkbox */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-sm">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="chk-recording-consent"
                    checked={hasCheckedConsent}
                    onChange={e => setHasCheckedConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    {CONSENT_CHECKBOX_LABEL}
                  </span>
                </label>
                <p className="text-[10px] font-mono text-slate-500 mt-2 ml-7">
                  Consent Version: {CONSENT_TEXT_VERSION} • Timestamp and client IP address will be recorded in the audit log.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!existingConsent && !declinedMode && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setDeclinedMode(true)}
              className="text-xs font-mono text-slate-600 hover:text-rose-700 underline cursor-pointer"
            >
              Decline Recording
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase rounded-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-consent-submit"
                onClick={() => handleConfirmConsent('consented')}
                disabled={!hasCheckedConsent || isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase rounded-sm shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording...' : 'Confirm & Proceed to Meeting'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
