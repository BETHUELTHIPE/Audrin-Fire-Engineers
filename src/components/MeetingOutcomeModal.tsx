import React, { useState } from 'react';
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Calendar,
  ShieldAlert,
  Presentation,
  Database,
  CheckSquare,
  Sparkles,
  Layers,
  Link2,
  Code2,
  Copy,
  Check,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Appointment, MeetingOutcome, AssignedFollowUpAction } from '../types';
import { calendarZoomService } from '../services/calendarZoomService';

interface MeetingOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: (outcome: MeetingOutcome) => void;
  currentUserId: string;
  currentUserName: string;
}

const SANS_ACTION_CATEGORIES = [
  'SANS 10139 Category L1/L2 Remedials',
  'Optical Smoke Detector Replacement',
  'Calibrated Sound Level dB(A) Test',
  'DB Riser Conduit & Cabling Inspection',
  'Fire Alarm Control Panel PSU Replacement',
  'Zone Chart CAD Draughting & Framing',
  'Audible Sounder & Strobe Beacon Addition',
  'Manual Call Point (Break Glass) Maintenance',
  'SANS 10139 Pre-Commissioning Walkthrough'
];

const PRESET_SUMMARY_TEMPLATES = [
  {
    title: 'SANS 10139 Pre-Work Review',
    text: 'Conducted engineering review of existing fire alarm installation at site. Inspected panel fault indicators, identified Category L2 coverage gaps in electrical riser cupboards, and reviewed photographic evidence with facilities management. Agreed on remedial scope of work, zone isolation schedules, and acoustic sound level verification parameters before formal certification.'
  },
  {
    title: 'Post-Work Handover & Sound Level Test',
    text: 'Presented post-remediation verification results. Sound pressure measurements verified >65 dB(A) in all occupied zones and >75 dB(A) at bedheads. Replaced 14 optical smoke detectors with calibrated analog addressable heads. Client verified zone chart accuracy and accepted the technical documentation dossier for SANS 10139 Certificate of Compliance (COC).'
  },
  {
    title: 'Fault & Loop Ground Fault Diagnostics',
    text: 'Consulted on intermittent earth ground fault on Loop 3. Isolated junction box moisture ingress on level 4 ducting. Reviewed live panel diagnostic readings and scheduled physical site repair with client facilities engineer. Confirmed temporary fire watch protocol until loop continuity test passes.'
  }
];

export const MeetingOutcomeModal: React.FC<MeetingOutcomeModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  currentUserId,
  currentUserName
}) => {
  // Pre-fill existing outcome or defaults
  const existing = appointment.outcomes;

  const [activeModalTab, setActiveModalTab] = useState<'discussion' | 'actions' | 'postgres_db'>('discussion');

  const [actualStartTime, setActualStartTime] = useState(
    existing?.actualStartTime || appointment.scheduledStart
  );
  const [actualEndTime, setActualEndTime] = useState(
    existing?.actualEndTime || appointment.scheduledEnd
  );
  const [discussionSummary, setDiscussionSummary] = useState(
    existing?.discussionSummary || ''
  );

  // Attendees attendance tracking
  const [attendeesAttendance, setAttendeesAttendance] = useState<Record<string, boolean>>(
    appointment.attendees.reduce((acc, att) => {
      acc[att.id] = att.attended ?? true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Dynamic Lists
  const [clientRequirements, setClientRequirements] = useState<string[]>(
    existing?.clientRequirements?.length ? existing.clientRequirements : ['']
  );
  const [documentsRequested, setDocumentsRequested] = useState<string[]>(
    existing?.documentsRequested?.length ? existing.documentsRequested : ['']
  );
  const [decisionsMade, setDecisionsMade] = useState<string[]>(
    existing?.decisionsMade?.length ? existing.decisionsMade : ['']
  );

  const [nextWorkflowStep, setNextWorkflowStep] = useState(
    existing?.nextWorkflowStep || 'Generate quotation for remedial works and register follow-up inspection'
  );
  const [assignedAction, setAssignedAction] = useState(
    existing?.assignedAction || 'Prepare SANS 10139 Category L2 remedial proposal and Bill of Quantities'
  );
  const [responsiblePerson, setResponsiblePerson] = useState(
    existing?.responsiblePerson || currentUserName
  );

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const [dueDate, setDueDate] = useState(
    existing?.dueDate || nextWeek.toISOString().split('T')[0]
  );

  // Multi-item Assigned Follow-up Actions
  const [followUpActions, setFollowUpActions] = useState<AssignedFollowUpAction[]>(() => {
    if (existing?.assignedFollowUpActions && existing.assignedFollowUpActions.length > 0) {
      return existing.assignedFollowUpActions;
    }
    return [
      {
        id: 'action-1',
        description: existing?.assignedAction || 'Prepare SANS 10139 Category L2 remedial proposal and Bill of Quantities',
        responsiblePerson: existing?.responsiblePerson || currentUserName,
        responsiblePersonEmail: 'bethuelmoukangwe8@gmail.com',
        dueDate: existing?.dueDate || nextWeek.toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        sans10139Category: 'SANS 10139 Category L1/L2 Remedials'
      }
    ];
  });

  const [followUpRequired, setFollowUpRequired] = useState(
    existing?.followUpAppointmentRequired ?? false
  );
  const [followUpDate, setFollowUpDate] = useState(existing?.followUpDate || '');
  const [presentationVersionUsed, setPresentationVersionUsed] = useState(
    existing?.presentationVersionUsed || appointment.powerPointVersion || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleAddListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[]
  ) => {
    setter([...current, '']);
  };

  const handleUpdateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    index: number,
    val: string
  ) => {
    const copy = [...current];
    copy[index] = val;
    setter(copy);
  };

  const handleRemoveListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    index: number
  ) => {
    if (current.length === 1) {
      setter(['']);
      return;
    }
    setter(current.filter((_, i) => i !== index));
  };

  // Action Items Management
  const handleAddActionItem = () => {
    const newAction: AssignedFollowUpAction = {
      id: 'action-' + Date.now(),
      description: '',
      responsiblePerson: currentUserName,
      responsiblePersonEmail: 'bethuelmoukangwe8@gmail.com',
      dueDate: nextWeek.toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending',
      sans10139Category: SANS_ACTION_CATEGORIES[0]
    };
    setFollowUpActions([...followUpActions, newAction]);
  };

  const handleUpdateActionItem = (index: number, field: keyof AssignedFollowUpAction, value: any) => {
    const copy = [...followUpActions];
    copy[index] = { ...copy[index], [field]: value };
    setFollowUpActions(copy);
  };

  const handleRemoveActionItem = (index: number) => {
    if (followUpActions.length === 1) {
      setFollowUpActions([
        {
          id: 'action-' + Date.now(),
          description: '',
          responsiblePerson: currentUserName,
          dueDate: nextWeek.toISOString().split('T')[0],
          priority: 'medium',
          status: 'pending',
          sans10139Category: SANS_ACTION_CATEGORIES[0]
        }
      ]);
      return;
    }
    setFollowUpActions(followUpActions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionSummary.trim()) {
      setError('Please provide a discussion summary of the meeting.');
      setActiveModalTab('discussion');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const cleanedRequirements = clientRequirements.filter(r => r.trim() !== '');
      const cleanedDocs = documentsRequested.filter(d => d.trim() !== '');
      const cleanedDecisions = decisionsMade.filter(d => d.trim() !== '');
      const cleanedActions = followUpActions.filter(a => a.description.trim() !== '');

      // Use the primary action item for headline compatibility
      const primaryAction = cleanedActions[0]?.description || assignedAction;
      const primaryAssignee = cleanedActions[0]?.responsiblePerson || responsiblePerson;
      const primaryDueDate = cleanedActions[0]?.dueDate || dueDate;

      const outcome = await calendarZoomService.recordMeetingOutcome(
        appointment.id,
        {
          recordedByUserId: currentUserId,
          recordedByName: currentUserName,
          actualStartTime,
          actualEndTime,
          discussionSummary,
          clientRequirements: cleanedRequirements,
          documentsRequested: cleanedDocs,
          decisionsMade: cleanedDecisions,
          nextWorkflowStep,
          assignedAction: primaryAction,
          assignedFollowUpActions: cleanedActions,
          responsiblePerson: primaryAssignee,
          dueDate: primaryDueDate,
          followUpAppointmentRequired: followUpRequired,
          followUpDate: followUpRequired ? followUpDate : undefined,
          presentationVersionUsed: presentationVersionUsed || undefined
        },
        currentUserId,
        currentUserName
      );

      onSuccess(outcome);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record meeting outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pgPreview = calendarZoomService.getPostgresRelationalPreview(appointment.id);

  const handleCopySql = () => {
    navigator.clipboard.writeText(pgPreview.schemaSql + '\n\n' + pgPreview.insertSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header with PostgreSQL Connection Status */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">Record Post-Meeting Outcome & Actions</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-mono font-bold uppercase">
                  {appointment.serviceRequestRef}
                </span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded text-[10px] font-mono flex items-center gap-1">
                  <Database className="w-3 h-3 text-purple-400" />
                  PostgreSQL Linked
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {appointment.siteName} • {appointment.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveModalTab('discussion')}
            className={`px-4 py-2.5 font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'discussion'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Discussion & Decisions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('actions')}
            className={`px-4 py-2.5 font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'actions'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Assigned Actions ({followUpActions.filter(a => a.description.trim()).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('postgres_db')}
            className={`px-4 py-2.5 font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'postgres_db'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>PostgreSQL Relational DB</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: DISCUSSION & DECISIONS */}
          {activeModalTab === 'discussion' && (
            <div className="space-y-5 animate-fade-in">
              {/* Attendance Checkbox List */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Participant Attendance Verification
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allPresent: Record<string, boolean> = {};
                        appointment.attendees.forEach(a => { allPresent[a.id] = true; });
                        setAttendeesAttendance(allPresent);
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
                    >
                      Mark All Present
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allAbsent: Record<string, boolean> = {};
                        appointment.attendees.forEach(a => { allAbsent[a.id] = false; });
                        setAttendeesAttendance(allAbsent);
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {appointment.attendees.map(att => {
                    const isAttended = attendeesAttendance[att.id] ?? true;
                    return (
                      <label
                        key={att.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isAttended
                            ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className={`w-3.5 h-3.5 ${isAttended ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <div>
                            <div className="font-semibold text-slate-200">{att.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {att.role.toUpperCase()} • {att.email}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isAttended}
                          onChange={e =>
                            setAttendeesAttendance({
                              ...attendeesAttendance,
                              [att.id]: e.target.checked
                            })
                          }
                          className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actual Start & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Actual Start Time (SAST)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActualStartTime(new Date().toISOString())}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-mono"
                    >
                      Set Now
                    </button>
                  </div>
                  <input
                    type="text"
                    value={actualStartTime}
                    onChange={e => setActualStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Actual End Time (SAST)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActualEndTime(new Date().toISOString())}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-mono"
                    >
                      Set Now
                    </button>
                  </div>
                  <input
                    type="text"
                    value={actualEndTime}
                    onChange={e => setActualEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Discussion Summary & Template Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Engineering Discussion Summary & Technical Notes
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Insert Template:</span>
                    {PRESET_SUMMARY_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDiscussionSummary(tmpl.text)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={discussionSummary}
                  onChange={e => setDiscussionSummary(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  placeholder="Detail the discussion regarding SANS 10139 findings, panel diagnostics, loop impedance tests, client queries, and agreed statutory scopes..."
                />
              </div>

              {/* Key Decisions Made */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Key Decisions & Agreed Terms
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddListItem(setDecisionsMade, decisionsMade)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Decision
                  </button>
                </div>
                {decisionsMade.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={e => handleUpdateListItem(setDecisionsMade, decisionsMade, idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Client approved replacement of optical smoke detectors in DB riser cupboards"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(setDecisionsMade, decisionsMade, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Client Requirements List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Client Requirements & Operational Constraints
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddListItem(setClientRequirements, clientRequirements)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Requirement
                  </button>
                </div>
                {clientRequirements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={e => handleUpdateListItem(setClientRequirements, clientRequirements, idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Sound testing must occur after 18:00 to avoid tenant disruption"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(setClientRequirements, clientRequirements, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Documents Requested */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Documents / CAD Evidence Requested
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddListItem(setDocumentsRequested, documentsRequested)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Document
                  </button>
                </div>
                {documentsRequested.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={e => handleUpdateListItem(setDocumentsRequested, documentsRequested, idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Updated electrical DB riser diagram and zone boundary DXF"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(setDocumentsRequested, documentsRequested, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED ACTION ITEMS */}
          {activeModalTab === 'actions' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Follow-Up Action Register & Task Assignments
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Actions are persisted as linked foreign records in PostgreSQL table <code className="text-purple-300">public.meeting_action_items</code>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Action Item
                  </button>
                </div>
              </div>

              {/* Action items list */}
              <div className="space-y-3">
                {followUpActions.map((action, idx) => (
                  <div
                    key={action.id || idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-200">Action Item #{idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={action.priority}
                          onChange={e => handleUpdateActionItem(idx, 'priority', e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-[11px] rounded px-2 py-1 text-slate-200 focus:outline-none"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="critical">Critical (Statutory)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Description */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Action Scope & Deliverable</label>
                      <input
                        type="text"
                        value={action.description}
                        onChange={e => handleUpdateActionItem(idx, 'description', e.target.value)}
                        placeholder="e.g. Prepare SANS 10139 Category L2 remedial proposal and schedule loop continuity test"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Assignee, Category, Due Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Responsible Person / Assignee</label>
                        <input
                          type="text"
                          value={action.responsiblePerson}
                          onChange={e => handleUpdateActionItem(idx, 'responsiblePerson', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">SANS 10139 Category</label>
                        <select
                          value={action.sans10139Category || SANS_ACTION_CATEGORIES[0]}
                          onChange={e => handleUpdateActionItem(idx, 'sans10139Category', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        >
                          {SANS_ACTION_CATEGORIES.map((cat, cIdx) => (
                            <option key={cIdx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Target Due Date</label>
                        <input
                          type="date"
                          value={action.dueDate}
                          onChange={e => handleUpdateActionItem(idx, 'dueDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Overall Workflow Step */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <label className="text-[11px] font-semibold text-slate-400">Next Overall System Workflow Step</label>
                <input
                  type="text"
                  value={nextWorkflowStep}
                  onChange={e => setNextWorkflowStep(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Follow-up Required & Presentation Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={followUpRequired}
                      onChange={e => setFollowUpRequired(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600"
                    />
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Follow-Up Meeting Required
                  </label>
                  {followUpRequired && (
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  )}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Presentation className="w-4 h-4 text-orange-400" />
                    PowerPoint Slide Deck Version
                  </label>
                  <input
                    type="text"
                    value={presentationVersionUsed}
                    onChange={e => setPresentationVersionUsed(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    placeholder="e.g. v1.2 (SANS 10139 Pre-Work Review)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POSTGRESQL RELATIONAL DB PREVIEW */}
          {activeModalTab === 'postgres_db' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>PostgreSQL 16 Relational Storage Engine</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-mono">
                    CONNECTED
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  When submitted, this outcome is atomically committed to PostgreSQL with relational foreign key constraints linked to <code className="text-purple-300">public.appointments</code>, <code className="text-purple-300">public.service_requests</code>, and <code className="text-purple-300">public.users</code>.
                </p>
              </div>

              {/* Linked Foreign Keys Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  Relational Foreign Key Map
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500">appointment_id: </span>
                    <span className="text-emerald-400">{appointment.id}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500">service_request_id: </span>
                    <span className="text-blue-400">{appointment.serviceRequestId}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500">client_id: </span>
                    <span className="text-amber-400">{appointment.clientId}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500">recorded_by_user_id: </span>
                    <span className="text-purple-400">{currentUserId}</span>
                  </div>
                </div>
              </div>

              {/* SQL Schema Preview */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 font-mono">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    SQL DDL & Insert Statement
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono flex items-center gap-1 transition-all"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSql ? 'Copied' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-48 border border-slate-800 leading-normal">
                  {pgPreview.schemaSql}
                </pre>
              </div>
            </div>
          )}

          {/* STATUTORY COMPLIANCE SAFEGUARD DISCLAIMER */}
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-200 shrink-0">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Statutory Compliance Safeguard:
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/80">
              Attendance and discussions recorded during this meeting do not constitute statutory acceptance, SANS 10139 Certificate of Compliance (COC), or regulatory sign-off until formal on-site physical inspection, calibrated sound pressure testing, and signed certification are completed.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Signed by {currentUserName}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/60 cursor-pointer font-mono uppercase"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Storing in DB...' : 'Save & Publish to PostgreSQL'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
