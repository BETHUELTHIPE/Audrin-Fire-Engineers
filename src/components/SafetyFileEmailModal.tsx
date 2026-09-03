import React, { useState } from 'react';
import { SafetyFile } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import {
  X,
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  User
} from 'lucide-react';

interface SafetyFileEmailModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  onSuccess?: () => void;
}

export const SafetyFileEmailModal: React.FC<SafetyFileEmailModalProps> = ({
  safetyFile,
  isOpen,
  onClose,
  currentUserRole = 'customer',
  currentUserName = 'Current User',
  onSuccess
}) => {
  const [recipientEmail, setRecipientEmail] = useState(safetyFile.clientSafetyOfficerEmail);
  const [recipientName, setRecipientName] = useState(safetyFile.clientSafetyOfficerName);
  const [recipientRole, setRecipientRole] = useState('Client Safety Officer');
  const [subject, setSubject] = useState(
    `Official Fire Detection Safety File - ${safetyFile.projectName} (Ref: ${safetyFile.safetyFileNumber})`
  );
  const [message, setMessage] = useState(
    `Dear ${safetyFile.clientSafetyOfficerName},\n\nPlease find attached the official Fire Detection Safety File for ${safetyFile.projectName} located at ${safetyFile.siteName}.\n\nThis dossier contains all 16 statutory sections, including SANS 10139 Certificate of Compliance (COC), commissioning logs, calibration certificates, and as-built drawings in accordance with SANS 10400-T.\n\nKind regards,\n${currentUserName}\nAudrin Fire Engineers (Pty) Ltd`
  );
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      safetyFileService.recordEmailDelivery(
        safetyFile.id,
        recipientEmail,
        recipientName,
        recipientRole,
        currentUserName,
        currentUserRole,
        'Direct automated email from Client Portal'
      );
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xs border-2 border-[#0A192F] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
              Email Safety File to Client Safety Officer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-mono font-bold text-base text-slate-900 uppercase">
              Safety File Dispatched Successfully!
            </h4>
            <p className="text-xs text-slate-600 font-mono">
              Sent to <strong>{recipientEmail}</strong>. An immutable audit record has been appended to the compliance log.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
            {/* Project Quick Info */}
            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Project</span>
                <strong className="text-slate-800 font-bold">{safetyFile.projectName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase text-[10px] block">Dossier Ref</span>
                <strong className="text-[#CC0000]">{safetyFile.safetyFileNumber}</strong>
              </div>
            </div>

            {/* Recipient info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xs text-slate-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xs text-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-900 bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Message Body
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-900 bg-white font-sans text-xs leading-relaxed"
                required
              />
            </div>

            {/* Attached Statutory Files */}
            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
              <label className="block text-slate-700 font-bold uppercase mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Statutory Enclosures Included (Auto-Generated):</span>
              </label>
              <ul className="space-y-1.5 text-[11px] text-slate-700">
                <li className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{safetyFile.safetyFileNumber}_Compiled_Full_Safety_File.pdf (Complete 16 Sections)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SANS_10139_COC_{safetyFile.projectRef}.pdf (Certificate of Compliance)</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs uppercase font-bold cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Dossier</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
