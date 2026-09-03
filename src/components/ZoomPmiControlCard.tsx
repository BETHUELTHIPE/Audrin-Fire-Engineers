import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Building,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Play,
  Presentation,
  CheckCircle2,
  CalendarDays,
  UserCheck,
  RefreshCw,
  XCircle,
  HelpCircle,
  Sparkles,
  Shield,
  Layers,
  GitCompare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Appointment, UserRole } from '../types';
import { calendarZoomService } from '../services/calendarZoomService';
import { APPOINTMENT_TYPE_LABELS } from '../data/calendarZoomData';
import { meetingMinutesService } from '../services/meetingMinutesService';
import { MinutesVersionHistory } from './MinutesVersionHistory';

interface ZoomPmiControlCardProps {
  appointment: Appointment;
  userRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onRecordOutcome?: (appointment: Appointment) => void;
  onOpenPowerPoint?: (appointment: Appointment) => void;
  onOpenConsent?: (appointment: Appointment) => void;
  onOpenMinutes?: (appointment: Appointment, minutesId: string) => void;
  onOpenVersionHistory?: (appointment: Appointment, minutesId?: string) => void;
}

export const ZoomPmiControlCard: React.FC<ZoomPmiControlCardProps> = ({
  appointment,
  userRole,
  currentUserId,
  currentUserName,
  onReschedule,
  onCancel,
  onRecordOutcome,
  onOpenPowerPoint,
  onOpenConsent,
  onOpenMinutes,
  onOpenVersionHistory,
}) => {
  // Transient reveal states (in-memory only, never persisted)
  const [isPmiRevealed, setIsPmiRevealed] = useState(false);
  const [isPasscodeRevealed, setIsPasscodeRevealed] = useState(false);
  const [unmaskedPmi, setUnmaskedPmi] = useState<string | null>(null);
  const [unmaskedPasscode, setUnmaskedPasscode] = useState<string | null>(null);
  const [unmaskedJoinUrl, setUnmaskedJoinUrl] = useState<string | null>(null);
  const [showInlineVersionHistory, setShowInlineVersionHistory] = useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const typeMeta = APPOINTMENT_TYPE_LABELS[appointment.appointmentType] || {
    label: appointment.appointmentType,
    description: '',
    requiresPowerPoint: false
  };

  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin' || userRole === 'superadmin';

  // Check consent and minutes
  const meetingRecord = meetingMinutesService.getMeetingRecordByAppointmentId(appointment.id);
  const existingConsent = meetingMinutesService.getConsent(appointment.id, currentUserId);
  const hasConsent = existingConsent && existingConsent.consentStatus === 'consented' && !existingConsent.isWithdrawn;
  const versions = meetingMinutesService.getMinutesVersionsByAppointmentId(appointment.id);
  const hasMinutes = Boolean((meetingRecord && meetingRecord.currentMinutesId) || versions.length > 0);
  const activeVersion = versions.find(v => !v.isSuperseded) || versions[0];

  // Format dates in South African SAST format
  const startDate = new Date(appointment.scheduledStart);
  const endDate = new Date(appointment.scheduledEnd);
  const dateFormatted = startDate.toLocaleDateString('en-ZA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const timeFormatted = `${startDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} SAST`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTogglePmiReveal = async () => {
    if (isPmiRevealed) {
      setIsPmiRevealed(false);
      return;
    }

    try {
      setIsLoadingSecret(true);
      setErrorMessage(null);
      const res = await calendarZoomService.revealZoomMeetingSecret(
        appointment.id,
        'pmi',
        currentUserId,
        currentUserName,
        userRole
      );
      if (res.pmi) {
        setUnmaskedPmi(res.pmi);
        setIsPmiRevealed(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoadingSecret(false);
    }
  };

  const handleTogglePasscodeReveal = async () => {
    if (isPasscodeRevealed) {
      setIsPasscodeRevealed(false);
      return;
    }

    try {
      setIsLoadingSecret(true);
      setErrorMessage(null);
      const res = await calendarZoomService.revealZoomMeetingSecret(
        appointment.id,
        'passcode',
        currentUserId,
        currentUserName,
        userRole
      );
      if (res.passcode) {
        setUnmaskedPasscode(res.passcode);
        setIsPasscodeRevealed(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoadingSecret(false);
    }
  };

  const handleCopyJoinUrl = async () => {
    try {
      setIsLoadingSecret(true);
      const res = await calendarZoomService.revealZoomMeetingSecret(
        appointment.id,
        'join_url',
        currentUserId,
        currentUserName,
        userRole
      );
      if (res.joinUrl) {
        setUnmaskedJoinUrl(res.joinUrl);
        handleCopy(res.joinUrl, 'join_url');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoadingSecret(false);
    }
  };

  const handleCopyFullInvitation = () => {
    try {
      const invitation = calendarZoomService.generateMeetingInvitationText(
        appointment,
        currentUserId,
        currentUserName,
        userRole
      );
      handleCopy(invitation, 'invitation');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleJoinMeeting = async () => {
    // For clients, prompt for consent if not yet consented
    if (!isStaffOrAdmin && !hasConsent && onOpenConsent) {
      onOpenConsent(appointment);
      return;
    }

    try {
      const res = await calendarZoomService.revealZoomMeetingSecret(
        appointment.id,
        'join_url',
        currentUserId,
        currentUserName,
        userRole
      );
      if (res.joinUrl) {
        window.open(res.joinUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Audrin Fire Engineers//SANS 10139 Calendar System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${appointment.id}@audrinfire.co.za
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.purpose}\\n\\nOrganisations: ${appointment.organisationName}\\nSite: ${appointment.siteName}\\nRequest Ref: ${appointment.serviceRequestRef}\\n\\nAccess approved Zoom meeting room securely from client portal: https://portal.audrinfire.co.za
LOCATION:${appointment.siteName} (Remote Online Video Review)
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:24-Hour Reminder: ${appointment.title}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:1-Hour Reminder: ${appointment.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${appointment.serviceRequestRef}-audrin-fire-appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id={`zoom-control-card-${appointment.id}`}
      className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden text-slate-100 transition-all hover:border-slate-600"
    >
      {/* Top Banner & Status Header */}
      <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {typeMeta.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {appointment.serviceRequestRef}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">{appointment.title}</h3>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${
              appointment.status === 'confirmed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : appointment.status === 'completed'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : appointment.status === 'rescheduled'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {appointment.status.toUpperCase()}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Google Cal: Synced
          </span>

          {/* Consent status indicator */}
          {hasConsent ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Recording Consented
            </span>
          ) : (
            <button
              onClick={() => onOpenConsent?.(appointment)}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-colors"
              title="Click to review and grant AI recording consent"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              Consent Required
            </button>
          )}
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 space-y-5">
        {/* Date, Time & Site Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Date & Time (SAST)</span>
            </div>
            <div className="font-bold text-white">{dateFormatted}</div>
            <div className="text-[11px] text-amber-300 font-mono">{timeFormatted}</div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Organisation & Site</span>
            </div>
            <div className="font-bold text-white truncate">{appointment.organisationName}</div>
            <div className="text-[11px] text-slate-400 truncate">{appointment.siteName}</div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assigned Engineer</span>
            </div>
            <div className="font-bold text-white">{appointment.assignedStaffName}</div>
            <div className="text-[11px] text-slate-400">{appointment.assignedStaffEmail}</div>
          </div>
        </div>

        {/* Purpose & Safe Preparation Notice */}
        <div className="p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Meeting Purpose & Statutory Context:
          </div>
          <p className="text-slate-300 leading-relaxed">{appointment.purpose}</p>
          {appointment.safePreparationInstructions && (
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-amber-400 font-semibold">Preparation: </span>
              {appointment.safePreparationInstructions}
            </p>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECURE ZOOM PMI & PASSCODE INTERACTIVE VAULT */}
        <div className="p-4 bg-slate-950 border border-blue-900/40 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Zoom Personal Meeting Room (PMI) Access</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-mono">
              AWS Secrets Manager Encrypted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Masked Meeting ID Box */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Meeting ID</div>
                <div className="font-mono text-sm font-bold text-white tracking-widest mt-0.5">
                  {isPmiRevealed && unmaskedPmi ? unmaskedPmi : '••• ••• ••••'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id={`btn-reveal-pmi-${appointment.id}`}
                  onClick={handleTogglePmiReveal}
                  disabled={isLoadingSecret}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title={isPmiRevealed ? 'Hide Meeting ID' : 'Show Meeting ID'}
                >
                  {isPmiRevealed ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  id={`btn-copy-pmi-${appointment.id}`}
                  onClick={async () => {
                    if (!unmaskedPmi) {
                      const res = await calendarZoomService.revealZoomMeetingSecret(
                        appointment.id,
                        'pmi',
                        currentUserId,
                        currentUserName,
                        userRole
                      );
                      if (res.pmi) {
                        setUnmaskedPmi(res.pmi);
                        handleCopy(res.pmi, 'pmi');
                      }
                    } else {
                      handleCopy(unmaskedPmi, 'pmi');
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title="Copy Meeting ID"
                >
                  {copiedKey === 'pmi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Masked Passcode Box */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Passcode</div>
                <div className="font-mono text-sm font-bold text-white tracking-widest mt-0.5">
                  {isPasscodeRevealed && unmaskedPasscode ? unmaskedPasscode : '••••••'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id={`btn-reveal-passcode-${appointment.id}`}
                  onClick={handleTogglePasscodeReveal}
                  disabled={isLoadingSecret}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title={isPasscodeRevealed ? 'Hide Passcode' : 'Show Passcode'}
                >
                  {isPasscodeRevealed ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  id={`btn-copy-passcode-${appointment.id}`}
                  onClick={async () => {
                    if (!unmaskedPasscode) {
                      const res = await calendarZoomService.revealZoomMeetingSecret(
                        appointment.id,
                        'passcode',
                        currentUserId,
                        currentUserName,
                        userRole
                      );
                      if (res.passcode) {
                        setUnmaskedPasscode(res.passcode);
                        handleCopy(res.passcode, 'passcode');
                      }
                    } else {
                      handleCopy(unmaskedPasscode, 'passcode');
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title="Copy Passcode"
                >
                  {copiedKey === 'passcode' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Direct Join Link & Full Invitation Copy Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id={`btn-copy-joinurl-${appointment.id}`}
                onClick={handleCopyJoinUrl}
                disabled={isLoadingSecret}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === 'join_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Direct Join URL
              </button>

              <button
                id={`btn-copy-invitation-${appointment.id}`}
                onClick={handleCopyFullInvitation}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === 'invitation' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Complete Invitation
              </button>
            </div>

            {/* Security Guard Notice */}
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Waiting Room & Host Approval Enabled</span>
            </div>
          </div>
        </div>

        {/* Linked PowerPoint Presentation Card (If Available) */}
        {appointment.hasPowerPoint && (
          <div className="p-3.5 bg-gradient-to-r from-orange-950/40 to-amber-950/30 border border-orange-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{appointment.powerPointFilename}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded font-mono">
                    {appointment.powerPointVersion}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Private S3 Evidence Vault • SANS 10139 Verification Slides</p>
              </div>
            </div>

            <button
              id={`btn-open-presentation-${appointment.id}`}
              onClick={() => onOpenPowerPoint?.(appointment)}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Presentation className="w-3.5 h-3.5" />
              Launch Presentation
            </button>
          </div>
        )}

        {/* Completed Outcome Review Banner (If Completed) */}
        {appointment.outcomes && (
          <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-2.5 text-xs shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Meeting Concluded • Outcome Recorded</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded text-[10px] font-mono">
                  PG: {appointment.outcomes.postgresRecordId || 'public.meeting_outcomes'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Recorded by {appointment.outcomes.recordedByName}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              <span className="text-slate-400 font-semibold">Technical Summary: </span>
              {appointment.outcomes.discussionSummary}
            </p>

            {/* Decisions and Actions Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
              {appointment.outcomes.decisionsMade?.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                  {appointment.outcomes.decisionsMade.length} Decisions Logged
                </span>
              )}
              {appointment.outcomes.assignedFollowUpActions && appointment.outcomes.assignedFollowUpActions.length > 0 ? (
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded">
                  {appointment.outcomes.assignedFollowUpActions.length} Actions Assigned
                </span>
              ) : null}
              {appointment.outcomes.clientRequirements?.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded">
                  {appointment.outcomes.clientRequirements.length} Client Requirements
                </span>
              )}
              {appointment.outcomes.followUpAppointmentRequired && (
                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded">
                  Follow-Up Req: {appointment.outcomes.followUpDate || 'Pending'}
                </span>
              )}
            </div>

            <div className="text-[11px] text-amber-300/90 font-mono pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="text-slate-400">Next Step: </span>
                {appointment.outcomes.nextWorkflowStep} ({appointment.outcomes.responsiblePerson})
              </span>
              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => onRecordOutcome?.(appointment)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-sans cursor-pointer"
                >
                  View / Edit PostgreSQL Record
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Meeting Minutes & Version History Banner */}
        {hasMinutes && (
          <div className="space-y-2">
            <div className="p-3.5 bg-slate-950 border border-purple-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>AI Meeting Minutes &amp; Action Items</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono">
                      v{activeVersion ? activeVersion.minutesVersion : (meetingRecord?.currentMinutesVersion || 1)}.0 Current
                    </span>
                    {versions.length > 1 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">
                        {versions.length} versions ({versions.filter(v => v.isSuperseded).length} superseded)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    SANS 10139 transcription with speaker identification &amp; immutable PDF version archiving in S3 vault.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Latest Minutes */}
                <button
                  onClick={() => onOpenMinutes?.(appointment, activeVersion?.minutesId || meetingRecord?.currentMinutesId!)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Minutes &amp; PDF</span>
                </button>

                {/* Version History Button */}
                <button
                  onClick={() => {
                    if (onOpenVersionHistory) {
                      onOpenVersionHistory(appointment, activeVersion?.minutesId || meetingRecord?.currentMinutesId);
                    } else {
                      setShowInlineVersionHistory(!showInlineVersionHistory);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-purple-950/60 text-slate-200 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="View all generated PDF versions and comparison"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Version History ({versions.length || 1})</span>
                  {showInlineVersionHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Inline Version History Drawer if toggled */}
            {showInlineVersionHistory && (
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl">
                <MinutesVersionHistory
                  appointmentId={appointment.id}
                  minutesId={activeVersion?.minutesId || meetingRecord?.currentMinutesId}
                  currentUserRole={userRole}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onViewMinutes={(ver) => onOpenMinutes?.(appointment, ver.minutesId)}
                  compact={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Join / Start Zoom Meeting Button */}
            <button
              id={`btn-join-zoom-${appointment.id}`}
              onClick={handleJoinMeeting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-950/50 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              {isStaffOrAdmin ? 'Start Zoom Meeting (Host)' : 'Join Zoom Meeting'}
            </button>

            {/* Google Calendar Link Button */}
            {appointment.googleCalendarHtmlLink && (
              <a
                href={appointment.googleCalendarHtmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                Google Calendar
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            {/* Add to Calendar (.ICS download) */}
            <button
              id={`btn-download-ics-${appointment.id}`}
              onClick={handleDownloadIcs}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Add to iCal / Outlook
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Record Outcome Button for Staff & Admin */}
            {isStaffOrAdmin && appointment.status !== 'cancelled' && (
              <button
                id={`btn-record-outcome-${appointment.id}`}
                onClick={() => onRecordOutcome?.(appointment)}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                {appointment.outcomes ? 'Edit Outcome' : 'Record Outcome'}
              </button>
            )}

            {/* Reschedule Button */}
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <button
                id={`btn-reschedule-${appointment.id}`}
                onClick={() => onReschedule?.(appointment)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                Reschedule
              </button>
            )}

            {/* Cancel Button */}
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <button
                id={`btn-cancel-${appointment.id}`}
                onClick={() => onCancel?.(appointment)}
                className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

