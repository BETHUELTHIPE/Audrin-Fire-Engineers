import React from 'react';
import { X, Layers, Shield, FileText } from 'lucide-react';
import { MinutesVersionHistory } from './MinutesVersionHistory';
import { UserRole, Appointment } from '../types';
import { MeetingMinutesVersion } from '../types/meetingMinutes';

interface MinutesVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  minutesId?: string;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onViewMinutes?: (version: MeetingMinutesVersion) => void;
  onRequestCorrection?: (version: MeetingMinutesVersion) => void;
}

export const MinutesVersionHistoryModal: React.FC<MinutesVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  appointment,
  minutesId,
  currentUserRole,
  currentUserId,
  currentUserName,
  onViewMinutes,
  onRequestCorrection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  SANS 10139 AI Minutes Audit Registry
                </span>
                {appointment?.serviceRequestRef && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-mono">
                    {appointment.serviceRequestRef}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {appointment?.siteName ? `${appointment.siteName} • Version History` : 'Meeting Minutes Version History'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <MinutesVersionHistory
            appointmentId={appointment?.id}
            minutesId={minutesId || (appointment as any)?.currentMinutesId}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onViewMinutes={ver => {
              if (onViewMinutes) onViewMinutes(ver);
              onClose();
            }}
            onRequestCorrection={ver => {
              if (onRequestCorrection) onRequestCorrection(ver);
              onClose();
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <span>All versions generated from Zoom transcripts are archived with SHA-256 integrity verification.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
