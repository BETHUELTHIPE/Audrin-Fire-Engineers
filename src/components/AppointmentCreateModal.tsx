import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Building,
  User,
  FileText,
  Video,
  Presentation,
  CheckCircle2,
  X,
  Mail,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Appointment, AppointmentType, UserRole } from '../types';
import { APPOINTMENT_TYPE_LABELS } from '../data/calendarZoomData';
import { calendarZoomService } from '../services/calendarZoomService';

interface AppointmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAppointment: Appointment) => void;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  prefillServiceRequestId?: string;
  prefillClientName?: string;
  prefillClientEmail?: string;
  prefillOrganisationName?: string;
  prefillSiteName?: string;
}

export const AppointmentCreateModal: React.FC<AppointmentCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserRole,
  currentUserId,
  currentUserName,
  prefillServiceRequestId = 'SR-2026-0895',
  prefillClientName = 'Sarah Jenkins',
  prefillClientEmail = 'sarah.j@mercantile.co.za',
  prefillOrganisationName = 'Mercantile Properties Ltd',
  prefillSiteName = 'Sandton City Financial Tower'
}) => {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('pre_work_report_review');
  const [serviceRequestRef, setServiceRequestRef] = useState(prefillServiceRequestId);
  const [organisationName, setOrganisationName] = useState(prefillOrganisationName);
  const [siteName, setSiteName] = useState(prefillSiteName);
  const [clientName, setClientName] = useState(prefillClientName);
  const [clientEmail, setClientEmail] = useState(prefillClientEmail);
  const [assignedStaffName, setAssignedStaffName] = useState('Bethuel Moukangwe (Lead Fire Engineer)');
  const [assignedStaffEmail, setAssignedStaffEmail] = useState('bethuelmoukangwe8@gmail.com');

  // Dates (Default to tomorrow at 10:00 SAST)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(dateStr);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [purpose, setPurpose] = useState('Review SANS 10139 statutory inspection findings, photographic baseline evidence, and agree on remedial scope.');
  const [safePrep, setSafePrep] = useState('Ensure building floorplans and previous SANS 10139 logbook entries are available during the call.');

  // PowerPoint linkage
  const [hasPowerPoint, setHasPowerPoint] = useState(true);
  const [powerPointVersion, setPowerPointVersion] = useState('v1.0 (Statutory Pre-Work Deck)');

  // Reminders
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder1h, setReminder1h] = useState(true);
  const [reminder15m, setReminder15m] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTypeChange = (newType: AppointmentType) => {
    setAppointmentType(newType);
    const meta = APPOINTMENT_TYPE_LABELS[newType];
    if (meta) {
      setDurationMinutes(meta.durationMinutes);
      setHasPowerPoint(meta.requiresPowerPoint);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      // Compute SAST start and end timestamps
      const startDateTime = new Date(`${date}T${startTime}:00+02:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      const typeMeta = APPOINTMENT_TYPE_LABELS[appointmentType] || { label: appointmentType };
      const title = `Audrin Fire Engineers – ${typeMeta.label} – ${serviceRequestRef}`;

      const newAppt = await calendarZoomService.createAppointment(
        {
          title,
          appointmentType,
          status: 'confirmed',
          serviceRequestId: 'req-' + Date.now(),
          serviceRequestRef,
          organisationId: 'org-001',
          organisationName,
          siteId: 'site-001',
          siteName,
          scheduledStart: startDateTime.toISOString(),
          scheduledEnd: endDateTime.toISOString(),
          timezone: 'Africa/Johannesburg',
          clientId: 'client-user-' + Date.now(),
          clientName,
          clientEmail,
          assignedStaffId: 'staff-001',
          assignedStaffName,
          assignedStaffEmail,
          purpose,
          safePreparationInstructions: safePrep,
          attendees: [
            {
              id: 'att-' + Date.now() + '-1',
              appointmentId: '',
              name: clientName,
              email: clientEmail,
              role: 'client',
              rsvpStatus: 'accepted',
              isRequired: true,
              isHost: false
            },
            {
              id: 'att-' + Date.now() + '-2',
              appointmentId: '',
              name: assignedStaffName,
              email: assignedStaffEmail,
              role: 'staff',
              rsvpStatus: 'accepted',
              isRequired: true,
              isHost: true
            }
          ],
          hasPowerPoint,
          powerPointS3Key: hasPowerPoint ? `organisations/org-001/sites/site-001/reports/presentations/${serviceRequestRef}-presentation.pptx` : undefined,
          powerPointFilename: hasPowerPoint ? `Audrin-Fire-${appointmentType}-${serviceRequestRef}.pptx` : undefined,
          powerPointVersion: hasPowerPoint ? powerPointVersion : undefined,
          remindersConfig: {
            twentyFourHour: reminder24h,
            oneHour: reminder1h,
            fifteenMinute: reminder15m,
            sentHistory: []
          },
          createdBy: currentUserId
        },
        currentUserRole,
        currentUserName
      );

      onSuccess(newAppt);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schedule Zoom Video Appointment</h2>
              <p className="text-xs text-slate-400">Google Calendar & AWS Secrets Manager Zoom PMI Synchronized</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Appointment Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Appointment Type (SANS 10139 Workflow)</label>
            <select
              value={appointmentType}
              onChange={e => handleTypeChange(e.target.value as AppointmentType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {Object.entries(APPOINTMENT_TYPE_LABELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label} ({meta.durationMinutes} min)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {APPOINTMENT_TYPE_LABELS[appointmentType]?.description}
            </p>
          </div>

          {/* Service Request & Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Service Request Reference</label>
              <input
                type="text"
                value={serviceRequestRef}
                onChange={e => setServiceRequestRef(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="e.g. SR-2026-0895"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Client Organisation</label>
              <input
                type="text"
                value={organisationName}
                onChange={e => setOrganisationName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Mercantile Properties Ltd"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Client Email (Google Calendar Invite)</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Site Location</label>
            <input
              type="text"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Sandton City Financial Tower"
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Start Time (SAST)</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Duration</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 hr)</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          {/* Purpose & Safe Preparation Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Meeting Purpose & Discussion Items</label>
            <textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              rows={2}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Safe Preparation Instructions</label>
            <input
              type="text"
              value={safePrep}
              onChange={e => setSafePrep(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Private S3 PowerPoint Presentation Attachment */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPowerPoint}
                  onChange={e => setHasPowerPoint(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <Presentation className="w-4 h-4 text-orange-400" />
                Attach PowerPoint Slide Presentation (Private S3)
              </label>
              {hasPowerPoint && (
                <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded font-mono">
                  S3 Encrypted
                </span>
              )}
            </div>

            {hasPowerPoint && (
              <div className="pt-1">
                <input
                  type="text"
                  value={powerPointVersion}
                  onChange={e => setPowerPointVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. v1.0 (Statutory Pre-Work Deck)"
                />
              </div>
            )}
          </div>

          {/* Automated Reminders */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Automated Email & SMS Reminders (SNS/SES):
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder24h}
                  onChange={e => setReminder24h(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                24 Hours Prior
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder1h}
                  onChange={e => setReminder1h(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                1 Hour Prior
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder15m}
                  onChange={e => setReminder15m(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                15 Minutes Prior
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Meeting will be provisioned with Waiting Room, Host Authorization, and Screen Sharing lock. Credentials are held in AWS Secrets Manager and never exposed on public pages.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-950/60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Creating & Syncing...' : 'Confirm & Sync Google Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
