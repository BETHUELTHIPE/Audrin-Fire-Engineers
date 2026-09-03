import React, { useState } from 'react';
import {
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Appointment, UserRole } from '../types';
import { calendarZoomService } from '../services/calendarZoomService';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: (updated: Appointment) => void;
  mode: 'reschedule' | 'cancel';
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  mode,
  currentUserRole,
  currentUserId,
  currentUserName
}) => {
  const [date, setDate] = useState(
    new Date(appointment.scheduledStart).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    new Date(appointment.scheduledStart).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      if (mode === 'reschedule') {
        const startDateTime = new Date(`${date}T${startTime}:00+02:00`);
        const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

        const updated = await calendarZoomService.rescheduleAppointment(
          appointment.id,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          currentUserId,
          currentUserName,
          currentUserRole,
          reason
        );
        onSuccess(updated);
      } else {
        const cancelled = await calendarZoomService.cancelAppointment(
          appointment.id,
          currentUserId,
          currentUserName,
          currentUserRole,
          reason
        );
        onSuccess(cancelled);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                mode === 'reschedule'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {mode === 'reschedule' ? <RefreshCw className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'reschedule' ? 'Reschedule Appointment' : 'Cancel Appointment'}
              </h2>
              <p className="text-xs text-slate-400">{appointment.serviceRequestRef} • Google Calendar Synced</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'reschedule' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    New Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    New Start Time (SAST)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>
            </>
          ) : (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200">
              Are you sure you want to cancel this appointment? Google Calendar events will be marked cancelled and all attendees notified via email.
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {mode === 'reschedule' ? 'Reason for Rescheduling' : 'Reason for Cancellation'}
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              placeholder={mode === 'reschedule' ? 'e.g. Client requested postponement due to on-site audit' : 'e.g. Issue resolved on-site prior to meeting'}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all text-white ${
                mode === 'reschedule'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950/60'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/60'
              }`}
            >
              {mode === 'reschedule' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
