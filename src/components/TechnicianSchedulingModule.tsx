import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  ShieldAlert,
  Sparkles,
  Plus,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  BarChart3,
  GripVertical,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Info,
  CalendarRange,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  TechnicianScheduleProfile,
  ScheduledTaskItem,
  TechnicianAvailabilityStatus,
  DraggedTaskPayload
} from '../types/technicianScheduling';
import {
  INITIAL_TECHNICIAN_PROFILES,
  INITIAL_SCHEDULED_TASKS
} from '../data/technicianSchedulingData';
import {
  getMondayOfWeek,
  getWeekDates,
  calculateTechnicianWeeklySummary,
  calculateTechnicianDaySchedule,
  checkSaqccQualificationMatch,
  findOptimalSlotForTask,
  exportWeeklyRosterCSV,
  buildTaskICalString,
  WeekDayInfo
} from '../services/technicianSchedulingEngine';

export const TechnicianSchedulingModule: React.FC = () => {
  const { showToast } = useApp();

  // Reference Monday for current week (Default: Mon 07 Sep 2026, aligned with application timeline)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => {
    return getMondayOfWeek(new Date(2026, 8, 7)); // 7 Sep 2026
  });

  // State: Technicians & Tasks
  const [technicians, setTechnicians] = useState<TechnicianScheduleProfile[]>(INITIAL_TECHNICIAN_PROFILES);
  const [tasks, setTasks] = useState<ScheduledTaskItem[]>(INITIAL_SCHEDULED_TASKS);

  // View settings
  const [includeWeekend, setIncludeWeekend] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'matrix' | 'timeline'>('matrix');
  const [selectedTimelineDayIndex, setSelectedTimelineDayIndex] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedSaqccFilter, setSelectedSaqccFilter] = useState<string>('all');

  // Drag and Drop State
  const [draggedPayload, setDraggedPayload] = useState<DraggedTaskPayload | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ techId: string; dateStr: string } | null>(null);
  const [dragOverUnscheduled, setDragOverUnscheduled] = useState<boolean>(false);

  // Modals & Popovers
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<ScheduledTaskItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [selectedTechForLeave, setSelectedTechForLeave] = useState<TechnicianScheduleProfile | null>(null);
  const [leaveDateStr, setLeaveDateStr] = useState<string>('2026-09-10');
  const [leaveStatus, setLeaveStatus] = useState<TechnicianAvailabilityStatus>('training');
  const [leaveMaxHours, setLeaveMaxHours] = useState<number>(4.0);
  const [leaveNotes, setLeaveNotes] = useState<string>('SANS 10139 Refresher Training');

  // Quick Assign Modal for Backlog Task
  const [quickAssignTask, setQuickAssignTask] = useState<ScheduledTaskItem | null>(null);

  // Compute Active Week Days
  const weekDays = useMemo<WeekDayInfo[]>(() => {
    return getWeekDates(currentWeekMonday, includeWeekend);
  }, [currentWeekMonday, includeWeekend]);

  // Week range display label (e.g. "Monday 07 Sep – Sunday 13 Sep 2026")
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0];
    const end = weekDays[weekDays.length - 1];
    return `${start.dayName} ${start.dayMonthStr} – ${end.dayName} ${end.dayMonthStr} 2026`;
  }, [weekDays]);

  // Filtered Technicians
  const displayedTechnicians = useMemo(() => {
    if (selectedTechFilter === 'all') return technicians;
    return technicians.filter(t => t.id === selectedTechFilter);
  }, [technicians, selectedTechFilter]);

  // Compute Weekly Summaries for each technician
  const technicianWeeklySummaries = useMemo(() => {
    return displayedTechnicians.map(t => calculateTechnicianWeeklySummary(t, weekDays, tasks));
  }, [displayedTechnicians, weekDays, tasks]);

  // Fleet Capacity Overall Metrics
  const fleetMetrics = useMemo(() => {
    const totalMaxHours = technicianWeeklySummaries.reduce((sum, s) => sum + s.weeklyMaxHours, 0);
    const totalBookedHours = technicianWeeklySummaries.reduce((sum, s) => sum + s.weeklyBookedHours, 0);
    const remainingHours = Math.max(0, totalMaxHours - totalBookedHours);
    const overallUtilization = totalMaxHours > 0 ? Math.round((totalBookedHours / totalMaxHours) * 100) : 0;
    
    const scheduledCount = tasks.filter(t => t.scheduledDate !== null).length;
    const backlogCount = tasks.filter(t => t.scheduledDate === null).length;
    const criticalCount = tasks.filter(t => t.priority === 'critical').length;

    return {
      totalMaxHours: Number(totalMaxHours.toFixed(1)),
      totalBookedHours: Number(totalBookedHours.toFixed(1)),
      remainingHours: Number(remainingHours.toFixed(1)),
      overallUtilization,
      scheduledCount,
      backlogCount,
      criticalCount,
      activeTechCount: technicians.length
    };
  }, [technicianWeeklySummaries, tasks, technicians]);

  // Filtered Backlog (Unscheduled) Tasks
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.scheduledDate !== null) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.siteName.toLowerCase().includes(q) ||
          t.clientOrganisation.toLowerCase().includes(q) ||
          t.referenceCode.toLowerCase().includes(q) ||
          t.sansClause.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) return false;
      if (selectedTypeFilter !== 'all' && t.sourceType !== selectedTypeFilter) return false;
      if (selectedSaqccFilter !== 'all' && t.requiredSaqccLevel !== selectedSaqccFilter) return false;
      return true;
    });
  }, [tasks, searchQuery, selectedPriorityFilter, selectedTypeFilter, selectedSaqccFilter]);

  // Week Navigation Handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekMonday(getMondayOfWeek(new Date(2026, 8, 7)));
  };

  // ==============================================================
  // DRAG AND DROP HANDLERS
  // ==============================================================
  const handleDragStart = (e: React.DragEvent, task: ScheduledTaskItem) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPayload({
      task,
      fromTechId: task.assignedTechnicianId,
      fromDayDate: task.scheduledDate
    });
  };

  const handleDragEnd = () => {
    setDraggedPayload(null);
    setDragOverTarget(null);
    setDragOverUnscheduled(false);
  };

  const handleDragOverCell = (e: React.DragEvent, techId: string, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget || dragOverTarget.techId !== techId || dragOverTarget.dateStr !== dateStr) {
      setDragOverTarget({ techId, dateStr });
    }
  };

  const handleDragLeaveCell = (e: React.DragEvent, techId: string, dateStr: string) => {
    e.preventDefault();
    if (dragOverTarget?.techId === techId && dragOverTarget?.dateStr === dateStr) {
      setDragOverTarget(null);
    }
  };

  const handleDropOnCell = (techId: string, dateStr: string) => {
    if (!draggedPayload) return;
    const task = draggedPayload.task;
    const targetTech = technicians.find(t => t.id === techId);
    if (!targetTech) return;

    // Check SAQCC qualification compatibility
    const qualCheck = checkSaqccQualificationMatch(targetTech.saqccLevel, task.requiredSaqccLevel);
    
    // Check if moving to same tech & same date
    if (task.assignedTechnicianId === techId && task.scheduledDate === dateStr) {
      setDraggedPayload(null);
      setDragOverTarget(null);
      return;
    }

    // Suggested time window based on existing tasks or default
    const dayTasks = tasks.filter(t => t.assignedTechnicianId === techId && t.scheduledDate === dateStr && t.id !== task.id);
    let timeWindow = task.scheduledTimeWindow || '08:30 - 12:00';
    if (dayTasks.length > 0) {
      timeWindow = task.estimatedHours <= 3.5 ? '13:00 - 16:30' : '08:30 - 16:00';
    }

    // Update task
    setTasks(prev =>
      prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            scheduledDate: dateStr,
            scheduledTimeWindow: timeWindow,
            assignedTechnicianId: targetTech.id,
            assignedTechnicianName: targetTech.name,
            technicianSaqccNumber: targetTech.saqccNumber,
            status: 'scheduled'
          };
        }
        return t;
      })
    );

    // Toast notification
    if (!qualCheck.isCompliant) {
      showToast(
        'warning',
        'Assigned with Qualification Notice',
        `${task.referenceCode} assigned to ${targetTech.name} on ${dateStr}. Notice: Requires Level 3/4 co-signature on final logbook.`
      );
    } else {
      showToast(
        'success',
        'Service Task Scheduled',
        `Scheduled "${task.title}" for ${targetTech.name} on ${dateStr} (${timeWindow}).`
      );
    }

    setDraggedPayload(null);
    setDragOverTarget(null);
  };

  const handleDropOnUnscheduled = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPayload) return;
    const task = draggedPayload.task;

    if (task.scheduledDate === null) {
      setDraggedPayload(null);
      setDragOverUnscheduled(false);
      return;
    }

    // Move task back to backlog pool
    setTasks(prev =>
      prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            scheduledDate: null,
            assignedTechnicianId: null,
            assignedTechnicianName: undefined,
            status: 'unscheduled'
          };
        }
        return t;
      })
    );

    showToast(
      'info',
      'Task Returned to Backlog',
      `"${task.title}" (${task.referenceCode}) moved to unscheduled service pool.`
    );

    setDraggedPayload(null);
    setDragOverUnscheduled(false);
  };

  // Quick Auto-Optimize: Assign unscheduled backlog tasks to best fit slots
  const handleAutoOptimize = () => {
    if (unscheduledTasks.length === 0) {
      showToast('info', 'No Tasks to Schedule', 'All service tasks in the current filter are already scheduled.');
      return;
    }

    let assignedCount = 0;
    let updatedTasks = [...tasks];

    for (const task of unscheduledTasks) {
      const optimal = findOptimalSlotForTask(task, technicians, weekDays, updatedTasks);
      if (optimal) {
        updatedTasks = updatedTasks.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              scheduledDate: optimal.dateStr,
              scheduledTimeWindow: optimal.timeWindow,
              assignedTechnicianId: optimal.techId,
              assignedTechnicianName: optimal.techName,
              status: 'scheduled'
            };
          }
          return t;
        });
        assignedCount++;
      }
    }

    if (assignedCount > 0) {
      setTasks(updatedTasks);
      showToast(
        'success',
        'Auto-Balancing Completed',
        `Successfully allocated ${assignedCount} SANS 10139 tasks based on SAQCC qualifications and technician availability.`
      );
    } else {
      showToast(
        'warning',
        'Capacity Limit Reached',
        'Could not find open slots with matching qualifications without exceeding daily capacity.'
      );
    }
  };

  // Export Weekly CSV
  const handleExportCSV = () => {
    const csv = exportWeeklyRosterCSV(technicianWeeklySummaries, weekRangeLabel);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SANS10139_Technician_Roster_${weekDays[0]?.dateStr || 'week'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Roster Exported', 'Weekly technician dispatch register downloaded as CSV.');
  };

  // Save Custom Availability / Leave Block
  const handleSaveLeaveBlock = () => {
    if (!selectedTechForLeave) return;

    const updatedTechs = technicians.map(tech => {
      if (tech.id === selectedTechForLeave.id) {
        const custom = { ...(tech.customAvailability || {}) };
        custom[leaveDateStr] = {
          dateStr: leaveDateStr,
          status: leaveStatus,
          maxHours: leaveMaxHours,
          notes: leaveNotes
        };
        return {
          ...tech,
          customAvailability: custom
        };
      }
      return tech;
    });

    setTechnicians(updatedTechs);
    setIsLeaveModalOpen(false);
    showToast(
      'success',
      'Availability Updated',
      `Updated ${selectedTechForLeave.name}'s schedule for ${leaveDateStr}: ${leaveStatus.toUpperCase()} (${leaveMaxHours}h max).`
    );
  };

  // Clear Custom Leave Block
  const handleClearLeaveBlock = (techId: string, dateStr: string) => {
    const updatedTechs = technicians.map(tech => {
      if (tech.id === techId && tech.customAvailability) {
        const custom = { ...tech.customAvailability };
        delete custom[dateStr];
        return { ...tech, customAvailability: custom };
      }
      return tech;
    });
    setTechnicians(updatedTechs);
    setIsLeaveModalOpen(false);
    showToast('info', 'Availability Reset', 'Restored default standard 8.0h working day availability.');
  };

  // Quick Assign Confirmation from Popover/Modal
  const handleConfirmQuickAssign = (techId: string, dateStr: string, timeWindow: string) => {
    if (!quickAssignTask) return;
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === quickAssignTask.id) {
          return {
            ...t,
            scheduledDate: dateStr,
            scheduledTimeWindow: timeWindow,
            assignedTechnicianId: tech.id,
            assignedTechnicianName: tech.name,
            technicianSaqccNumber: tech.saqccNumber,
            status: 'scheduled'
          };
        }
        return t;
      })
    );

    showToast(
      'success',
      'Task Scheduled',
      `Assigned ${quickAssignTask.referenceCode} to ${tech.name} on ${dateStr} (${timeWindow}).`
    );
    setQuickAssignTask(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Context Banner */}
      <div className="bg-[#0A192F] text-white p-5 rounded-xs border-l-4 border-l-[#CC0000] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#CC0000] text-white text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
                SANS 10139 Operations Hub
              </span>
              <span className="text-slate-400 text-xs font-mono">
                SAQCC Statutory Dispatch &amp; Availability Engine
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight mt-1 text-white flex items-center gap-2">
              <CalendarRange className="w-6 h-6 text-[#CC0000]" />
              Technician Scheduling &amp; Weekly Capacity
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              Drag-and-drop statutory inspection visits, remedial defect repairs, and emergency attendances onto qualified SAQCC-registered technicians. Real-time fleet workload monitoring ensures statutory SANS 10139 compliance without exceeding daily shift thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAutoOptimize}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Automatically match unscheduled SANS tasks to available technicians with qualifying SAQCC certifications"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Auto-Balance Schedule</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export complete weekly schedule register to CSV format"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>

        {/* Fleet KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Fleet Capacity</span>
            <div className="text-base font-bold text-white mt-0.5">
              {fleetMetrics.totalBookedHours} <span className="text-xs text-slate-400 font-normal">/ {fleetMetrics.totalMaxHours}h</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  fleetMetrics.overallUtilization > 90
                    ? 'bg-red-500'
                    : fleetMetrics.overallUtilization > 75
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, fleetMetrics.overallUtilization)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Fleet Utilization</span>
            <div className={`text-base font-bold mt-0.5 ${
              fleetMetrics.overallUtilization > 85 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {fleetMetrics.overallUtilization}%
            </div>
            <span className="text-[10px] text-slate-400">{fleetMetrics.remainingHours}h remaining open</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Scheduled Visits</span>
            <div className="text-base font-bold text-white mt-0.5">
              {fleetMetrics.scheduledCount} <span className="text-xs text-slate-400 font-normal">tasks active</span>
            </div>
            <span className="text-[10px] text-emerald-400">All loops confirmed</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Backlog Queue</span>
            <div className={`text-base font-bold mt-0.5 ${
              fleetMetrics.backlogCount > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {fleetMetrics.backlogCount} <span className="text-xs text-slate-400 font-normal">unscheduled</span>
            </div>
            <span className="text-[10px] text-slate-400">Drag onto calendar</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Critical SLAs</span>
            <div className={`text-base font-bold mt-0.5 ${
              fleetMetrics.criticalCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'
            }`}>
              {fleetMetrics.criticalCount} <span className="text-xs text-slate-400 font-normal">urgent</span>
            </div>
            <span className="text-[10px] text-red-400">SANS 10139 24h mandate</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Technicians On Fleet</span>
            <div className="text-base font-bold text-white mt-0.5">
              {fleetMetrics.activeTechCount} <span className="text-xs text-slate-400 font-normal">licensed</span>
            </div>
            <span className="text-[10px] text-slate-400">SAQCC Level 1 – 4</span>
          </div>
        </div>
      </div>

      {/* Week Navigator & View Controls Bar */}
      <div className="bg-white p-3 rounded-xs border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xs border border-slate-300">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white text-slate-700 rounded-xs transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white text-slate-800 rounded-xs transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white text-slate-700 rounded-xs transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Calendar className="w-4 h-4 text-[#CC0000]" />
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
              {weekRangeLabel}
            </span>
          </div>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-xs transition-all cursor-pointer font-bold ${
                viewMode === 'matrix' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resource Matrix
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-xs transition-all cursor-pointer font-bold ${
                viewMode === 'timeline' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day Timeline
            </button>
          </div>

          <label className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xs border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWeekend}
              onChange={(e) => setIncludeWeekend(e.target.checked)}
              className="rounded-xs text-[#CC0000] focus:ring-red-500 w-3.5 h-3.5"
            />
            <span>Show Weekends</span>
          </label>

          <select
            value={selectedTechFilter}
            onChange={(e) => setSelectedTechFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xs px-2 py-1.5 focus:border-[#CC0000] focus:outline-none"
          >
            <option value="all">All Technicians ({technicians.length})</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.saqccLevel.split(' - ')[0]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scheduling Canvas: Left Backlog Pool + Right Weekly Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: UNSCHEDULED SERVICE TASKS BACKLOG (Draggable) */}
        {/* ============================================================== */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverUnscheduled(true);
          }}
          onDragLeave={() => setDragOverUnscheduled(false)}
          onDrop={handleDropOnUnscheduled}
          className={`xl:col-span-4 bg-white rounded-xs border shadow-xs transition-all ${
            dragOverUnscheduled
              ? 'border-[#CC0000] bg-red-50/50 ring-2 ring-red-400 ring-offset-1'
              : 'border-slate-200'
          }`}
        >
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 rounded-t-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                  {unscheduledTasks.length} Pending
                </span>
                <h3 className="text-sm font-black font-mono text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#CC0000]" />
                  Service Backlog Pool
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Drag onto Day/Tech</span>
            </div>

            {/* Backlog Filters */}
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search task, site, or clause..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xs pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#CC0000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <select
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 rounded-xs px-2 py-1 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical SLA</option>
                  <option value="high">High Urgency</option>
                  <option value="standard">Standard</option>
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 rounded-xs px-2 py-1 focus:outline-none"
                >
                  <option value="all">All Task Types</option>
                  <option value="sans_inspection">SANS Inspection</option>
                  <option value="remedial_defect">Remedial Action</option>
                  <option value="emergency_fault">Emergency Fault</option>
                  <option value="site_survey">Site Survey</option>
                  <option value="commissioning">Commissioning</option>
                </select>
              </div>
            </div>
          </div>

          {/* Draggable Task List */}
          <div className="p-3 max-h-[720px] overflow-y-auto space-y-2.5 divide-y-0">
            {unscheduledTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xs border border-dashed border-slate-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-mono font-bold text-slate-700">Backlog Queue Cleared</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  All service tasks match current filters or have been scheduled onto the weekly roster.
                </p>
              </div>
            ) : (
              unscheduledTasks.map(task => {
                const isCritical = task.priority === 'critical';
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-xs border transition-all cursor-grab active:cursor-grabbing hover:shadow-sm select-none ${
                      isCritical
                        ? 'border-red-300 bg-red-50/40 hover:bg-red-50 hover:border-red-400'
                        : task.priority === 'high'
                        ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-xs ${
                          isCritical
                            ? 'bg-red-600 text-white animate-pulse'
                            : task.priority === 'high'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          {task.referenceCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {task.estimatedHours}h
                        </span>
                        <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2 leading-tight">
                      {task.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate">{task.siteName}</span>
                      <span className="text-slate-400">({task.city})</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 flex-wrap text-[10px] font-mono">
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs truncate max-w-[150px]">
                        {task.sansClause}
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-xs">
                        Req: {task.requiredSaqccLevel.split(' - ')[0]}
                      </span>
                    </div>

                    {/* Quick Assign / Action Buttons */}
                    <div className="mt-2 flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTaskForDetail(task);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-[11px] font-mono text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Inspect Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickAssignTask(task)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Quick Slot</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Backlog Drop Target Prompt */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center rounded-b-xs">
            <p className="text-[11px] font-mono text-slate-500">
              💡 Tip: Drag tasks onto any technician's day slot to schedule. Or drag scheduled tasks back here to return to backlog.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: WEEKLY CALENDAR RESOURCE MATRIX (Droppable) */}
        {/* ============================================================== */}
        <div className="xl:col-span-8 bg-white rounded-xs border border-slate-200 shadow-xs overflow-hidden">
          
          {viewMode === 'matrix' ? (
            /* Resource Matrix: Technicians (Rows) x Days (Columns) */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[860px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-mono font-bold">
                    <th className="p-3 w-64 border-r border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Technician Resource</span>
                      </div>
                    </th>
                    {weekDays.map(day => (
                      <th
                        key={day.dateStr}
                        className={`p-2.5 text-center border-r border-slate-800 font-mono ${
                          day.isToday ? 'bg-[#CC0000] text-white' : day.isWeekend ? 'bg-slate-800 text-slate-400' : ''
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider font-bold">{day.dayName}</div>
                        <div className="text-xs font-black">{day.dayMonthStr}</div>
                        {day.isToday && (
                          <span className="text-[9px] bg-white text-[#CC0000] px-1 rounded-xs font-bold uppercase block mt-0.5">
                            Today
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-xs">
                  {technicianWeeklySummaries.map(({ technician, weeklyBookedHours, weeklyMaxHours, weeklyUtilizationPercent, isWeeklyOverallocated, days }) => {
                    return (
                      <tr key={technician.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Technician Profile Card Column */}
                        <td className="p-3 border-r border-slate-200 align-top bg-slate-50/40">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-xs ${technician.avatarColor} text-white font-mono font-bold flex items-center justify-center shrink-0 shadow-xs`}>
                              {technician.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-900 text-xs truncate leading-tight">
                                {technician.name}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-500 truncate">
                                {technician.saqccNumber}
                              </p>
                              
                              <div className="mt-1">
                                <span className="bg-slate-200 text-slate-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs inline-block">
                                  {technician.saqccLevel}
                                </span>
                              </div>

                              {/* Weekly Capacity Meter */}
                              <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] font-mono">
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>Week Load:</span>
                                  <span className={`font-bold ${isWeeklyOverallocated ? 'text-red-600 font-black' : 'text-slate-800'}`}>
                                    {weeklyBookedHours} / {weeklyMaxHours}h
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      isWeeklyOverallocated
                                        ? 'bg-red-600'
                                        : weeklyUtilizationPercent > 85
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, weeklyUtilizationPercent)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Quick Action: Set Leave / Availability */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTechForLeave(technician);
                                  setIsLeaveModalOpen(true);
                                }}
                                className="mt-2 text-[10px] font-mono text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                <span>Manage Leave</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Days Droppable Cells */}
                        {days.map(day => {
                          const isTargetHovered =
                            dragOverTarget?.techId === technician.id && dragOverTarget?.dateStr === day.dateStr;
                          
                          const hasTasks = day.tasks.length > 0;
                          const isLeave = day.availabilityStatus === 'on_leave';
                          const isTraining = day.availabilityStatus === 'training';
                          const isOnCall = day.availabilityStatus === 'on_call';

                          return (
                            <td
                              key={day.dateStr}
                              onDragOver={(e) => handleDragOverCell(e, technician.id, day.dateStr)}
                              onDragLeave={(e) => handleDragLeaveCell(e, technician.id, day.dateStr)}
                              onDrop={() => handleDropOnCell(technician.id, day.dateStr)}
                              className={`p-1.5 border-r border-slate-200 align-top transition-all min-w-[130px] ${
                                isTargetHovered
                                  ? 'bg-emerald-100/70 border-2 border-emerald-500 shadow-inner'
                                  : day.isOverallocated
                                  ? 'bg-red-50/70'
                                  : isLeave
                                  ? 'bg-slate-100/70'
                                  : isTraining
                                  ? 'bg-amber-50/50'
                                  : isOnCall
                                  ? 'bg-purple-50/40'
                                  : day.isToday
                                  ? 'bg-red-50/20'
                                  : 'bg-white'
                              }`}
                            >
                              {/* Day Capacity Header Bar */}
                              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 px-1">
                                <span className={`font-bold ${
                                  day.isOverallocated
                                    ? 'text-red-700 bg-red-100 px-1 rounded-xs'
                                    : day.bookedHours > 0
                                    ? 'text-slate-700'
                                    : 'text-slate-400'
                                }`}>
                                  {day.bookedHours} / {day.maxHours}h
                                </span>

                                {day.isOverallocated ? (
                                  <span className="text-red-600 font-bold flex items-center gap-0.5" title="Overallocated shift! Exceeds standard statutory work hours.">
                                    <AlertTriangle className="w-3 h-3 text-red-600 animate-pulse" />
                                    <span>Over</span>
                                  </span>
                                ) : day.remainingHours > 0 ? (
                                  <span className="text-emerald-700 text-[9px]">
                                    {day.remainingHours}h free
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[9px]">Full</span>
                                )}
                              </div>

                              {/* Custom Availability / Training / Leave Banners */}
                              {isTraining && (
                                <div className="mb-1.5 bg-amber-100 border border-amber-300 text-amber-900 p-1 rounded-xs text-[9px] font-mono leading-tight">
                                  <span className="font-bold block">SAQCC CPD Training</span>
                                  <span className="text-amber-700">{day.availabilityNote || '4h training block'}</span>
                                </div>
                              )}

                              {isLeave && !day.isWeekend && (
                                <div className="mb-1.5 bg-slate-200 border border-slate-300 text-slate-800 p-1 rounded-xs text-[9px] font-mono leading-tight text-center">
                                  <span className="font-bold block">On Approved Leave</span>
                                  <span className="text-slate-600">{day.availabilityNote || '0h shift'}</span>
                                </div>
                              )}

                              {isOnCall && (
                                <div className="mb-1.5 bg-purple-100 border border-purple-300 text-purple-900 p-1 rounded-xs text-[9px] font-mono leading-tight">
                                  <span className="font-bold flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5 text-purple-700" />
                                    <span>On-Call Standby</span>
                                  </span>
                                </div>
                              )}

                              {/* Scheduled Tasks Inside this Day */}
                              <div className="space-y-1.5 min-h-[48px]">
                                {day.tasks.map(task => {
                                  const qualCheck = checkSaqccQualificationMatch(
                                    technician.saqccLevel,
                                    task.requiredSaqccLevel
                                  );

                                  return (
                                    <div
                                      key={task.id}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, task)}
                                      onDragEnd={handleDragEnd}
                                      onClick={() => {
                                        setSelectedTaskForDetail(task);
                                        setIsDetailModalOpen(true);
                                      }}
                                      className={`p-1.5 rounded-xs border text-[11px] transition-all cursor-grab active:cursor-grabbing hover:shadow-xs select-none ${
                                        task.priority === 'critical'
                                          ? 'border-l-4 border-l-red-600 border-red-200 bg-red-50/70 hover:bg-red-50'
                                          : task.priority === 'high'
                                          ? 'border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/60 hover:bg-amber-50'
                                          : 'border-l-4 border-l-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 font-bold">
                                        <span>{task.scheduledTimeWindow || '08:30 - 12:00'}</span>
                                        <span className="bg-white border border-slate-200 px-1 rounded-xs">
                                          {task.estimatedHours}h
                                        </span>
                                      </div>

                                      <h5 className="font-bold text-slate-900 text-[11px] leading-tight line-clamp-2 mt-0.5">
                                        {task.title}
                                      </h5>

                                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                                        <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                        <span className="truncate">{task.siteName}</span>
                                      </div>

                                      {/* Statutory Qualification Warning */}
                                      {!qualCheck.isCompliant && (
                                        <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded-xs font-mono">
                                          <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                          <span className="truncate">Requires Co-Sign</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Drag Hover Indicator */}
                                {isTargetHovered && (
                                  <div className="p-2 text-center border-2 border-dashed border-emerald-500 bg-emerald-50 rounded-xs text-[10px] font-mono text-emerald-800 font-bold animate-pulse">
                                    + Drop Task Here
                                  </div>
                                )}

                                {!hasTasks && !isTargetHovered && (
                                  <div className="h-10 border border-dashed border-slate-200 rounded-xs flex items-center justify-center text-[10px] font-mono text-slate-300">
                                    Empty Slot
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Timeline View: Single Day Time Slot Breakdown */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#CC0000]" />
                  <h3 className="font-mono font-bold text-sm text-slate-900">
                    Day Time Window Breakdown
                  </h3>
                </div>

                {/* Day selector tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xs">
                  {weekDays.map((day, idx) => (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedTimelineDayIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xs transition-all cursor-pointer ${
                        selectedTimelineDayIndex === idx
                          ? 'bg-[#0A192F] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {day.dayName} {day.dayMonthStr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Time Windows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {displayedTechnicians.map(tech => {
                  const targetDay = weekDays[selectedTimelineDayIndex] || weekDays[0];
                  const daySched = calculateTechnicianDaySchedule(tech, targetDay, tasks);

                  return (
                    <div
                      key={tech.id}
                      onDragOver={(e) => handleDragOverCell(e, tech.id, targetDay.dateStr)}
                      onDragLeave={(e) => handleDragLeaveCell(e, tech.id, targetDay.dateStr)}
                      onDrop={() => handleDropOnCell(tech.id, targetDay.dateStr)}
                      className={`border rounded-xs p-3 transition-all ${
                        dragOverTarget?.techId === tech.id
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <div className={`w-7 h-7 rounded-xs ${tech.avatarColor} text-white font-mono font-bold flex items-center justify-center text-xs shadow-xs`}>
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{tech.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{tech.saqccLevel.split(' - ')[0]}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                          daySched.isOverallocated ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {daySched.bookedHours} / {daySched.maxHours}h
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {daySched.tasks.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xs text-[11px] font-mono text-slate-400">
                            No visits scheduled for {targetDay.dayName}
                            <p className="text-[10px] text-slate-500 mt-1">Drop task to allocate slot</p>
                          </div>
                        ) : (
                          daySched.tasks.map(t => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, t)}
                              onDragEnd={handleDragEnd}
                              onClick={() => {
                                setSelectedTaskForDetail(t);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 rounded-xs border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-grab transition-all text-xs"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold">
                                <span>{t.scheduledTimeWindow}</span>
                                <span>{t.estimatedHours}h</span>
                              </div>
                              <h5 className="font-bold text-slate-900 mt-0.5 text-xs">{t.title}</h5>
                              <p className="text-[11px] text-slate-600 mt-0.5">{t.siteName}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Guidelines */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statutory SANS 10139 Compliance Shift Cap:</span>
              </span>
              <span>8.0 Hours / Technician / Day</span>
              <span className="text-slate-300">|</span>
              <span>40.0 Hours / Week</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                <span>Under Capacity</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block" />
                <span>Near Limit</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
                <span>Overallocated</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: TASK DETAIL & RESCHEDULE INSPECTION MODAL */}
      {/* ============================================================== */}
      {isDetailModalOpen && selectedTaskForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xs border-2 border-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b-2 border-b-[#CC0000]">
              <div className="flex items-center gap-2">
                <span className="bg-[#CC0000] text-white font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
                  {selectedTaskForDetail.referenceCode}
                </span>
                <h3 className="font-mono font-bold text-base text-white">
                  Task Specification &amp; Dispatch Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Task Title &amp; Standard Clause</span>
                <h4 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
                  {selectedTaskForDetail.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="bg-red-50 text-[#CC0000] font-bold border border-red-200 px-2 py-0.5 rounded-xs">
                    {selectedTaskForDetail.sansClause}
                  </span>
                  <span className={`px-2 py-0.5 rounded-xs font-bold uppercase ${
                    selectedTaskForDetail.priority === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {selectedTaskForDetail.priority}
                  </span>
                </div>
              </div>

              {/* Site Details */}
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{selectedTaskForDetail.siteName}</span>
                </div>
                <p className="text-slate-600 pl-5">{selectedTaskForDetail.clientOrganisation}</p>
                {selectedTaskForDetail.streetAddress && (
                  <p className="text-slate-500 pl-5">{selectedTaskForDetail.streetAddress}, {selectedTaskForDetail.city}</p>
                )}
                {selectedTaskForDetail.panelMakeModel && (
                  <p className="text-slate-500 pl-5">Panel: {selectedTaskForDetail.panelMakeModel} ({selectedTaskForDetail.systemCategory || 'Category L1'})</p>
                )}
              </div>

              {/* Assignment Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Assigned Technician</span>
                  <div className="text-slate-900 font-bold mt-0.5">
                    {selectedTaskForDetail.assignedTechnicianName || 'Unassigned (In Backlog)'}
                  </div>
                  {selectedTaskForDetail.technicianSaqccNumber && (
                    <span className="text-[10px] text-slate-500">{selectedTaskForDetail.technicianSaqccNumber}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Scheduled Slot</span>
                  <div className="text-slate-900 font-bold mt-0.5">
                    {selectedTaskForDetail.scheduledDate || 'Not Scheduled'}
                  </div>
                  <span className="text-[10px] text-slate-500">{selectedTaskForDetail.scheduledTimeWindow || 'Time window unassigned'}</span>
                </div>
              </div>

              {/* Statutory Compliance Checklist Scope */}
              {selectedTaskForDetail.complianceChecklistSummary && selectedTaskForDetail.complianceChecklistSummary.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Mandatory Scope of Work (SANS 10139)
                  </span>
                  <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 space-y-1.5">
                    {selectedTaskForDetail.complianceChecklistSummary.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTaskForDetail.notes && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Notes &amp; Access Permits</span>
                  <p className="bg-amber-50/60 p-2.5 rounded-xs border border-amber-200 text-slate-800 text-[11px]">
                    {selectedTaskForDetail.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedTaskForDetail.scheduledDate && (
                  <button
                    type="button"
                    onClick={() => {
                      // Return to backlog
                      setTasks(prev =>
                        prev.map(t =>
                          t.id === selectedTaskForDetail.id
                            ? { ...t, scheduledDate: null, assignedTechnicianId: null, assignedTechnicianName: undefined, status: 'unscheduled' }
                            : t
                        )
                      );
                      setIsDetailModalOpen(false);
                      showToast('info', 'Task Returned to Backlog', `${selectedTaskForDetail.referenceCode} is now in the unscheduled backlog.`);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xs cursor-pointer"
                  >
                    Unschedule (Return to Pool)
                  </button>
                )}

                {selectedTaskForDetail.scheduledDate && (
                  <button
                    type="button"
                    onClick={() => {
                      const ics = buildTaskICalString(selectedTaskForDetail);
                      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${selectedTaskForDetail.referenceCode}.ics`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('success', 'Calendar Event Exported', 'Downloaded iCal file for Google Calendar / Outlook.');
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>iCal</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-[#0A192F] hover:bg-slate-800 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TECHNICIAN LEAVE & CUSTOM AVAILABILITY OVERRIDE */}
      {/* ============================================================== */}
      {isLeaveModalOpen && selectedTechForLeave && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xs border-2 border-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b-2 border-b-indigo-500">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <h3 className="font-mono font-bold text-sm text-white">
                  Manage Availability: {selectedTechForLeave.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Target Date</label>
                <input
                  type="date"
                  value={leaveDateStr}
                  onChange={(e) => setLeaveDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Availability Status</label>
                <select
                  value={leaveStatus}
                  onChange={(e) => {
                    const val = e.target.value as TechnicianAvailabilityStatus;
                    setLeaveStatus(val);
                    if (val === 'on_leave') setLeaveMaxHours(0.0);
                    else if (val === 'training') setLeaveMaxHours(4.0);
                    else if (val === 'available') setLeaveMaxHours(8.0);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-slate-800 focus:outline-none"
                >
                  <option value="available">Available (Standard 8.0h Working Day)</option>
                  <option value="training">SAQCC / SANS Refresher Training (Reduced Shift)</option>
                  <option value="on_leave">Approved Leave / Sick Day (0h Available)</option>
                  <option value="on_call">High-Priority Emergency Standby (On-Call)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Available Shift Capacity (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="12"
                  value={leaveMaxHours}
                  onChange={(e) => setLeaveMaxHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-slate-800 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tasks scheduled beyond this capacity will trigger an overallocation warning.
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Reason / Shift Notes</label>
                <input
                  type="text"
                  placeholder="e.g. SAQCC SANS 10139 CPD Course (08:00 - 12:00)"
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleClearLeaveBlock(selectedTechForLeave.id, leaveDateStr)}
                className="text-slate-600 hover:text-red-700 underline text-xs font-mono cursor-pointer"
              >
                Reset to Standard Day
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeaveBlock}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-xs cursor-pointer"
                >
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: QUICK SLOT SUGGESTOR MODAL (One-Click Assignment) */}
      {/* ============================================================== */}
      {quickAssignTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xs border-2 border-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b-2 border-b-emerald-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-white">
                  Recommended Shift Slots for {quickAssignTask.referenceCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAssignTask(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs">{quickAssignTask.title}</h4>
                <p className="text-slate-600 mt-0.5">{quickAssignTask.siteName} ({quickAssignTask.city})</p>
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <span className="bg-red-100 text-red-800 px-1.5 py-0.2 rounded-xs font-bold">
                    Req: {quickAssignTask.requiredSaqccLevel}
                  </span>
                  <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-xs font-bold">
                    Est: {quickAssignTask.estimatedHours}h
                  </span>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Top Compatible Slots (Ranked by Availability &amp; SAQCC Rating)
              </span>

              <div className="space-y-2">
                {technicians.map(tech => {
                  const qual = checkSaqccQualificationMatch(tech.saqccLevel, quickAssignTask.requiredSaqccLevel);
                  
                  // Suggest 2 best open days
                  const bestDays = weekDays.filter(d => !d.isWeekend).slice(0, 2);

                  return bestDays.map(d => {
                    const daySched = calculateTechnicianDaySchedule(tech, d, tasks);
                    const hasCapacity = daySched.remainingHours >= quickAssignTask.estimatedHours;
                    const timeWindow = quickAssignTask.estimatedHours <= 3.5 ? '08:30 - 12:00' : '08:30 - 16:00';

                    return (
                      <div
                        key={`${tech.id}-${d.dateStr}`}
                        className="p-2.5 rounded-xs border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{tech.name}</span>
                            <span className="text-[10px] font-normal text-slate-500 font-mono">({tech.saqccLevel.split(' - ')[0]})</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            <span>{d.dayName} {d.dayMonthStr}</span> • <span className="text-slate-500">{timeWindow}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                            <span className={hasCapacity ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                              {daySched.remainingHours}h open remaining
                            </span>
                            {!qual.isCompliant && (
                              <span className="text-amber-700 bg-amber-100 px-1 rounded-xs">
                                Co-sign required
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConfirmQuickAssign(tech.id, d.dateStr, timeWindow)}
                          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      </div>
                    );
                  });
                })}
              </div>
            </div>

            <div className="bg-slate-100 p-3 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setQuickAssignTask(null)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
