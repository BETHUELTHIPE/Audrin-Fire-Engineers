import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Building,
  Calendar,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  Zap,
  CheckSquare,
  Square,
  Send
} from 'lucide-react';
import { RemedialActionTask, RemedialTaskPriority, RemedialTaskStatus } from '../types/remedialActions';

export const RemedialActionDashboard: React.FC = () => {
  const {
    remedialTasks,
    setIsMaintenanceCheckModalOpen,
    setIsAssignRemedialModalOpen,
    setSelectedRemedialTaskForAssignment,
    updateRemedialTaskStatus,
    batchAssignRemedialTasks,
    exportRemedialWorkOrder,
    technicians,
    showToast
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');

  // Multi-select for batch assignment
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [batchTechId, setBatchTechId] = useState<string>('');
  const [isBatchAssigning, setIsBatchAssigning] = useState<boolean>(false);

  // Expanded task ID for viewing full details
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Unique sites in tasks
  const uniqueSites = useMemo(() => {
    const set = new Set(remedialTasks.map(t => t.siteName));
    return Array.from(set);
  }, [remedialTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return remedialTasks.filter(task => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (siteFilter !== 'all' && task.siteName !== siteFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          task.referenceCode.toLowerCase().includes(q) ||
          task.title.toLowerCase().includes(q) ||
          task.siteName.toLowerCase().includes(q) ||
          task.clientOrganisation.toLowerCase().includes(q) ||
          task.sansClause.toLowerCase().includes(q) ||
          task.failureReason.toLowerCase().includes(q) ||
          (task.assignedTechnicianName && task.assignedTechnicianName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [remedialTasks, priorityFilter, statusFilter, siteFilter, searchTerm]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = remedialTasks.length;
    const pending = remedialTasks.filter(t => t.status === 'pending_assignment').length;
    const assigned = remedialTasks.filter(t => t.status === 'assigned').length;
    const inProgress = remedialTasks.filter(t => t.status === 'in_progress').length;
    const rectified = remedialTasks.filter(t => t.status === 'rectified' || t.status === 'verified_closed').length;
    const critical = remedialTasks.filter(t => t.priority === 'critical' && t.status !== 'verified_closed').length;

    return { total, pending, assigned, inProgress, rectified, critical };
  }, [remedialTasks]);

  // Toggle selection
  const toggleSelectTask = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  // Immediate single task assignment modal
  const handleOpenAssignModal = (task: RemedialActionTask) => {
    setSelectedRemedialTaskForAssignment(task);
    setIsAssignRemedialModalOpen(true);
  };

  // Batch assign execution
  const handleExecuteBatchAssign = () => {
    if (selectedTaskIds.length === 0 || !batchTechId) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    const dateStr = targetDate.toISOString().split('T')[0];

    batchAssignRemedialTasks(
      selectedTaskIds,
      batchTechId,
      dateStr,
      '08:30 - 16:30 (Comprehensive Remedial Run)',
      'Batch statutory rectification dispatch. Complete all SANS verification sign-offs.'
    );

    setSelectedTaskIds([]);
    setIsBatchAssigning(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Executive Summary */}
      <div className="bg-[#0A192F] text-white p-5 rounded-sm border-b-4 border-[#CC0000] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded-sm flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                SANS 10139 REMEDIAL DISPATCH ENGINE
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                Statutory Non-Compliance Rectification
              </span>
              <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-sm">
                SAQCC Certified Work Orders
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
              Remedial Action Tasks &amp; Immediate Dispatch
            </h1>
            <p className="text-xs font-mono text-slate-300 max-w-3xl">
              When maintenance checks identify SANS non-compliance (e.g. failing battery autonomy, muffled sounders, or unmaintained interfaces), remedial work orders are generated automatically. Admins can dispatch certified technicians immediately.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-conduct-sans-audit"
              onClick={() => setIsMaintenanceCheckModalOpen(true)}
              className="px-4 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Conduct Maintenance Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 border border-slate-200 rounded-sm shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Total Remedial Tasks</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          <span className="text-[10px] font-mono text-slate-400">All recorded defects</span>
        </div>

        <div className={`p-3.5 border rounded-sm shadow-xs transition-all ${
          metrics.pending > 0 ? 'bg-red-50/70 border-red-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-red-800">Needs Dispatch</span>
            {metrics.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            )}
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">{metrics.pending}</div>
          <span className="text-[10px] font-mono text-red-700 font-bold">Unassigned • Action Required</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-sm shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Assigned / Dispatched</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{metrics.assigned}</div>
          <span className="text-[10px] font-mono text-blue-600">Techs scheduled</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-sm shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">In Progress</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.inProgress}</div>
          <span className="text-[10px] font-mono text-amber-600">Field works underway</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-sm shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Rectified &amp; Closed</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.rectified}</div>
          <span className="text-[10px] font-mono text-emerald-600">Retest passed</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-sm shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Critical SLA (&lt; 24h)</span>
          <div className="text-2xl font-black text-[#CC0000] mt-1">{metrics.critical}</div>
          <span className="text-[10px] font-mono text-red-600 font-bold">Immediate attention</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by task reference (e.g. REM-482), site, clause, defect or technician..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-sans text-xs focus:outline-none focus:border-[#CC0000] focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (24h SLA)</option>
              <option value="high">High (48h SLA)</option>
              <option value="medium">Medium (7-day SLA)</option>
              <option value="low">Low (Routine)</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Statuses</option>
              <option value="pending_assignment">Needs Dispatch</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="rectified">Rectified</option>
              <option value="verified_closed">Verified Closed</option>
            </select>

            <select
              value={siteFilter}
              onChange={e => setSiteFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Sites</option>
              {uniqueSites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Operations Bar when items are selected */}
        {selectedTaskIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-3 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-900 font-bold">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>{selectedTaskIds.length} Task(s) Selected for Batch Dispatch</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={batchTechId}
                onChange={e => setBatchTechId(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-amber-400 rounded-sm font-mono text-xs focus:outline-none"
              >
                <option value="">Select Technician for Batch Dispatch...</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.saqccNumber} - {t.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExecuteBatchAssign}
                disabled={!batchTechId}
                className="px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Dispatch Batch</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTaskIds([])}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task List / Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between font-mono text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-slate-700 hover:text-black font-bold cursor-pointer"
            >
              {selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#CC0000]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredTasks.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Showing <strong>{filteredTasks.length}</strong> of <strong>{remedialTasks.length}</strong> remedial actions
          </div>
        </div>

        {/* Task Rows */}
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-mono font-bold text-slate-700 text-sm">No Remedial Actions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tasks match your current filter criteria. Conduct a SANS maintenance check to detect defects and generate work orders.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTasks.map(task => {
              const isSelected = selectedTaskIds.includes(task.id);
              const isExpanded = expandedTaskId === task.id;
              const isPending = task.status === 'pending_assignment';
              const isCritical = task.priority === 'critical';

              return (
                <div
                  key={task.id}
                  className={`p-4 transition-all ${
                    isSelected ? 'bg-red-50/30' : isPending ? 'bg-white hover:bg-slate-50/80' : 'bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelectTask(task.id)}
                        className="mt-1 text-slate-400 hover:text-black cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#CC0000]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-900">
                            {task.referenceCode}
                          </span>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase ${
                            task.priority === 'critical'
                              ? 'bg-red-600 text-white'
                              : task.priority === 'high'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>

                          <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                            {task.sansClause}
                          </span>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase ${
                            task.status === 'pending_assignment'
                              ? 'bg-red-100 text-red-800 border border-red-300 font-black'
                              : task.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : task.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>

                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                            SLA: {task.slaHours}h
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm">
                          {task.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-600 font-sans flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {task.siteName}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{task.clientOrganisation}</span>
                          {task.measuredValue && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm">
                                Defect: {task.measuredValue}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Assigned Technician */}
                    <div className="flex flex-col text-xs font-mono shrink-0 w-full lg:w-56 bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Assigned Specialist:</span>
                      {task.assignedTechnicianName ? (
                        <div className="mt-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{task.assignedTechnicianName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            SAQCC: {task.assignedTechnicianSaqcc}
                          </div>
                          {task.targetCompletionDate && (
                            <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{task.targetCompletionDate} ({task.targetTimeWindow})</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-0.5 text-red-600 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#CC0000]" />
                          <span>UNASSIGNED (Action Required)</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                      {isPending ? (
                        <button
                          type="button"
                          id={`btn-assign-tech-${task.id}`}
                          onClick={() => handleOpenAssignModal(task)}
                          className="px-3 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Tech Immediately</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(task)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs rounded-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Reassign</span>
                        </button>
                      )}

                      {/* Quick Status Toggle */}
                      {task.status === 'assigned' && (
                        <button
                          type="button"
                          onClick={() => updateRemedialTaskStatus(task.id, 'in_progress')}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs rounded-sm transition-all cursor-pointer"
                          title="Mark In Progress"
                        >
                          Start Field Work
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => updateRemedialTaskStatus(task.id, 'rectified', 'Statutory component replaced and SANS re-test passed successfully.')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-sm transition-all cursor-pointer"
                          title="Mark Rectified"
                        >
                          Mark Rectified
                        </button>
                      )}

                      {task.status === 'rectified' && (
                        <button
                          type="button"
                          onClick={() => updateRemedialTaskStatus(task.id, 'verified_closed')}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-mono font-bold text-xs rounded-sm transition-all cursor-pointer"
                          title="Admin Verification & Close"
                        >
                          Verify &amp; Close
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => exportRemedialWorkOrder(task)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-sm hover:bg-slate-100 cursor-pointer"
                        title="Download Work Order (TXT)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-sm hover:bg-slate-100 cursor-pointer"
                        title="Toggle Full Inspection & Parts Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono bg-slate-50/80 p-3 rounded-sm animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Statutory Non-Compliance Consequence:</span>
                        <p className="text-slate-800 font-sans text-xs bg-white border border-slate-200 p-2 rounded-sm">
                          {task.statutoryConsequence}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Required Accreditation &amp; Parts:</span>
                        <div className="bg-white border border-slate-200 p-2 rounded-sm space-y-1 text-[11px]">
                          <div><strong>Accreditation:</strong> {task.requiredSaqccLevel}</div>
                          <div><strong>Est. Hours:</strong> {task.estimatedHours}h • <strong>Cost:</strong> R {task.estimatedCostZAR.toLocaleString()}</div>
                          <div className="text-slate-600">
                            <strong>Parts:</strong> {task.recommendedParts.join(', ') || 'Standard test equipment'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Audit Trail &amp; Sign-off:</span>
                        <div className="bg-white border border-slate-200 p-2 rounded-sm space-y-1 text-[11px] text-slate-600">
                          <div><strong>Generated:</strong> {new Date(task.dateGenerated).toLocaleString('en-ZA')}</div>
                          <div><strong>Created By:</strong> {task.assignedBy}</div>
                          {task.rectifiedNotes && (
                            <div className="text-emerald-700">
                              <strong>Rectification Note:</strong> {task.rectifiedNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
