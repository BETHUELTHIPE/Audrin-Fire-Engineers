import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  Download,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileText,
  Wrench,
  Zap,
  Sparkles
} from 'lucide-react';
import { RemedialActionTask } from '../types/remedialActions';

export const RemedialActionAssignmentModal: React.FC = () => {
  const {
    isAssignRemedialModalOpen,
    setIsAssignRemedialModalOpen,
    selectedRemedialTaskForAssignment,
    setSelectedRemedialTaskForAssignment,
    technicians,
    assignTechnicianToRemedialTask,
    exportRemedialWorkOrder,
    currentUser
  } = useApp();

  const task = selectedRemedialTaskForAssignment;

  // Selected technician
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  // Scheduled date (default tomorrow or today if critical)
  const [scheduledDate, setScheduledDate] = useState<string>('');
  // Time window
  const [timeWindow, setTimeWindow] = useState<string>('08:30 - 12:00');
  // Dispatch notes
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  // Success state
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  useEffect(() => {
    if (task) {
      // If task has assigned tech, pre-select
      if (task.assignedTechnicianId) {
        setSelectedTechId(task.assignedTechnicianId);
      } else if (technicians.length > 0) {
        // Find best matching technician based on saqcc level
        const suitableTech = technicians.find(t =>
          task.priority === 'critical' ? t.saqccNumber.includes('48') || t.role.toLowerCase().includes('senior') : true
        ) || technicians[0];
        setSelectedTechId(suitableTech.id);
      }

      // Default date: today if critical, or tomorrow
      const date = new Date();
      if (task.priority !== 'critical') {
        date.setDate(date.getDate() + 1);
      }
      setScheduledDate(date.toISOString().split('T')[0]);

      // Default notes
      setDispatchNotes(
        `Carry ${task.recommendedParts.join(', ') || 'standard spares'}. Adhere strictly to ${task.sansClause} testing procedure.`
      );
      setIsDispatched(false);
    }
  }, [task, technicians]);

  if (!isAssignRemedialModalOpen || !task) return null;

  const selectedTechnician = technicians.find(t => t.id === selectedTechId) || technicians[0];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;

    assignTechnicianToRemedialTask(
      task.id,
      selectedTechId,
      scheduledDate,
      timeWindow,
      dispatchNotes
    );

    setIsDispatched(true);
  };

  const handleClose = () => {
    setIsAssignRemedialModalOpen(false);
    setSelectedRemedialTaskForAssignment(null);
    setIsDispatched(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 rounded-sm shadow-2xl max-w-3xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-start justify-between border-b-4 border-[#CC0000]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded-sm flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                IMMEDIATE TECHNICIAN ASSIGNMENT
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-sm">
                Task Ref: {task.referenceCode}
              </span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                task.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {task.priority} Priority • {task.slaHours}h SLA
              </span>
            </div>

            <h2 className="text-lg font-black uppercase tracking-tight text-white mt-1">
              Dispatch SANS Remedial Action
            </h2>
            <p className="text-xs font-mono text-slate-300">
              Assign this statutory rectification directly to a certified SAQCC technician. Work order dispatch and push alerts will trigger instantly.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          
          {/* Dispatched Confirmation View */}
          {isDispatched ? (
            <div className="space-y-5 py-4 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 uppercase">
                  Technician Dispatched Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  <strong>{selectedTechnician?.name}</strong> ({selectedTechnician?.saqccNumber}) has been assigned to remedy <strong>{task.title}</strong> at <strong>{task.siteName}</strong> on <strong>{scheduledDate} ({timeWindow})</strong>.
                </p>
              </div>

              {/* Work Order Card Preview */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm text-left max-w-lg mx-auto space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#0A192F]">REMEDIAL WORK ORDER #{task.referenceCode}</span>
                  <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-sm">STATUS: ASSIGNED</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div><strong>Premises:</strong> {task.siteName} ({task.clientOrganisation})</div>
                  <div><strong>Mandatory Standard:</strong> {task.sansClause}</div>
                  <div><strong>Assigned Tech:</strong> {selectedTechnician?.name} ({selectedTechnician?.phone})</div>
                  <div><strong>Target Window:</strong> {scheduledDate} • {timeWindow}</div>
                  <div><strong>Parts Requisition:</strong> {task.recommendedParts.join(', ') || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => exportRemedialWorkOrder(task)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download Work Order (TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Return to Task Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-5">
              
              {/* Task Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                    <div className="font-mono text-[11px] text-slate-500">
                      Site: <strong className="text-slate-800">{task.siteName}</strong> ({task.clientOrganisation})
                    </div>
                  </div>
                  <div className="font-mono text-xs text-right">
                    <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                      {task.sansClause}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Defect / Failure Details:</span>
                    <p className="text-slate-800 font-sans">{task.failureReason}</p>
                    {task.measuredValue && (
                      <div className="font-mono text-[11px] text-red-700 bg-red-50 border border-red-200 p-1.5 rounded-sm">
                        Measured Telemetry: <strong>{task.measuredValue}</strong>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Statutory Consequence:</span>
                    <p className="text-amber-900 bg-amber-50 border border-amber-200 p-1.5 rounded-sm text-[11px]">
                      {task.statutoryConsequence}
                    </p>
                    <div className="text-[11px] font-mono text-slate-600">
                      Required SAQCC Level: <strong className="text-slate-900">{task.requiredSaqccLevel}</strong>
                    </div>
                  </div>
                </div>

                {task.recommendedParts && task.recommendedParts.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-700">Pre-allocated Spares:</span>
                    {task.recommendedParts.map((p, idx) => (
                      <span key={idx} className="bg-white text-slate-800 border border-slate-300 px-1.5 py-0.5 rounded-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Technician Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#CC0000]" />
                    <span>Select SAQCC Certified Field Technician:</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {technicians.length} Available Field Specialists
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {technicians.map(tech => {
                    const isSelected = tech.id === selectedTechId;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechId(tech.id)}
                        className={`p-3 rounded-sm border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#CC0000] bg-red-50/50 shadow-sm ring-1 ring-[#CC0000]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-[#CC0000] text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {tech.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{tech.name}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#CC0000]" />}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-500">{tech.role}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm font-bold border border-slate-200">
                            {tech.saqccNumber}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {tech.phone}
                          </span>
                          <span className="text-slate-700 font-bold">
                            Active Tasks: {tech.currentAssignedCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Date & Time Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-sm">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#CC0000]" />
                    <span>Target Execution Date:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
                  />
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-slate-500">
                    <span>SLA Deadline:</span>
                    <strong className="text-red-700">{new Date(task.slaDeadline).toLocaleDateString('en-ZA')} ({task.slaHours}h)</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#CC0000]" />
                    <span>Target Time Window:</span>
                  </label>
                  <select
                    value={timeWindow}
                    onChange={e => setTimeWindow(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs focus:outline-none focus:border-[#CC0000]"
                  >
                    <option value="08:30 - 12:00">Morning Shift (08:30 - 12:00)</option>
                    <option value="13:00 - 16:30">Afternoon Shift (13:00 - 16:30)</option>
                    <option value="07:00 - 11:00">Early Morning Low-Occupancy (07:00 - 11:00)</option>
                    <option value="17:00 - 21:00">After-Hours Commercial (17:00 - 21:00)</option>
                    <option value="Immediate Emergency Attendance">Immediate Emergency Attendance (&lt; 2h SLA)</option>
                  </select>
                </div>
              </div>

              {/* Dispatch Instructions & Notes */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#CC0000]" />
                  <span>Field Instructions &amp; Mandatory Retest Protocol:</span>
                </label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={e => setDispatchNotes(e.target.value)}
                  placeholder="Specific access guidelines, keybox codes, or test protocol..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs focus:outline-none focus:border-[#CC0000]"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => exportRemedialWorkOrder(task)}
                  className="text-xs font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Preview Work Order File</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-sm transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!selectedTechId || !scheduledDate}
                    className="px-5 py-2 bg-[#CC0000] hover:bg-[#A30000] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Technician Immediately</span>
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
