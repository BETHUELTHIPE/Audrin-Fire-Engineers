import React from 'react';
import {
  Calendar,
  Clock,
  Play,
  ShieldCheck,
  Radio,
  FileText,
  Sparkles,
  FileCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react';
import { LiveMeetingStatus, ZoomMeetingRecord } from '../types/meetingMinutes';

interface LiveMeetingStatusPanelProps {
  meetingRecord: ZoomMeetingRecord;
  onRefresh?: () => void;
  onSimulateAdvanceStatus?: (nextStatus: LiveMeetingStatus) => void;
  isAdmin?: boolean;
}

const STATUS_STEPS: {
  status: LiveMeetingStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    status: 'scheduled',
    label: 'Meeting Scheduled',
    description: 'Calendar invite & Zoom PMI provisioned',
    icon: Calendar,
    color: 'text-slate-500',
  },
  {
    status: 'waiting_for_host',
    label: 'Waiting for Host',
    description: 'Waiting Room active & host controls enabled',
    icon: Clock,
    color: 'text-amber-500',
  },
  {
    status: 'in_progress',
    label: 'Meeting Started',
    description: 'Participants connected to secure room',
    icon: Play,
    color: 'text-blue-500',
  },
  {
    status: 'consent_confirmed',
    label: 'Consent Confirmed',
    description: 'Client accepted AI recording notice',
    icon: ShieldCheck,
    color: 'text-emerald-500',
  },
  {
    status: 'recording_active',
    label: 'Recording Active',
    description: 'Cloud recording initiated by host',
    icon: Radio,
    color: 'text-rose-500',
  },
  {
    status: 'transcription_active',
    label: 'Transcription Active',
    description: 'Zoom live audio transcription streaming',
    icon: FileText,
    color: 'text-indigo-500',
  },
  {
    status: 'meeting_ended',
    label: 'Meeting Ended',
    description: 'Session closed; waiting for webhook',
    icon: CheckCircle2,
    color: 'text-slate-600',
  },
  {
    status: 'transcript_processing',
    label: 'Transcript Processing',
    description: 'Celery worker parsing VTT & speakers',
    icon: Loader2,
    color: 'text-purple-500',
  },
  {
    status: 'ai_generating',
    label: 'AI Minutes Generating',
    description: 'Amazon Bedrock extracting structured JSON',
    icon: Sparkles,
    color: 'text-cyan-500',
  },
  {
    status: 'pdf_generating',
    label: 'PDF Generating',
    description: 'Rendering branded 16-section PDF to S3',
    icon: FileCheck,
    color: 'text-blue-600',
  },
  {
    status: 'email_queued',
    label: 'Email Queued',
    description: 'SES preparing separate MIME dispatches',
    icon: Send,
    color: 'text-amber-600',
  },
  {
    status: 'minutes_delivered',
    label: 'Minutes Delivered',
    description: 'PDF sent to client & superusers separately',
    icon: CheckCircle2,
    color: 'text-emerald-600',
  },
];

export const LiveMeetingStatusPanel: React.FC<LiveMeetingStatusPanelProps> = ({
  meetingRecord,
  onRefresh,
  onSimulateAdvanceStatus,
  isAdmin = false,
}) => {
  const currentStatus = meetingRecord.liveStatus;
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
              Live Meeting Lifecycle Tracker
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Confidential Stream (Content Masked)</span>
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-tight">
            {meetingRecord.topic}
          </h3>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            Ref: <strong className="text-blue-400">{meetingRecord.serviceRequestRef}</strong> • Appt: {meetingRecord.appointmentRef} • Site: {meetingRecord.siteName}
          </p>
        </div>

        {/* Current status pill */}
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-sm">
            {currentStatus === 'minutes_delivered' ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50" />
            ) : currentStatus === 'processing_failed' ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            )}
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {currentStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Updated: {new Date(meetingRecord.updatedAt).toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST
          </div>
        </div>
      </div>

      {/* Progress Stepper Grid / Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex > idx || currentStatus === 'minutes_delivered';
          const isCurrent = currentStatus === step.status;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className={`p-2.5 rounded-sm border transition-all text-left flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-950/80 border-blue-500 text-white shadow-lg ring-1 ring-blue-400/40'
                  : isCompleted
                  ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`p-1 rounded ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-950/80 text-emerald-400'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono font-bold">
                  {idx + 1}/{STATUS_STEPS.length}
                </span>
              </div>

              <div>
                <h4
                  className={`font-mono text-[11px] font-bold truncate ${
                    isCurrent ? 'text-blue-300' : isCompleted ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-[9px] text-slate-400 font-sans mt-0.5 line-clamp-2 leading-tight">
                  {step.description}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                {isCurrent ? (
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> In Progress
                  </span>
                ) : isCompleted ? (
                  <span className="text-emerald-400 font-semibold">Done</span>
                ) : (
                  <span className="text-slate-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Step Simulator Controls (if in admin view) */}
      {isAdmin && onSimulateAdvanceStatus && (
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-400">
            Pipeline Simulation Dispatcher:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_STEPS.map(s => (
              <button
                key={s.status}
                onClick={() => onSimulateAdvanceStatus(s.status)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                  currentStatus === s.status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {s.status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
