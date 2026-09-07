import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Building,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  MapPin,
  Cpu,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Info,
  CalendarDays,
  List,
  Grid3X3,
  CalendarRange,
  BarChart3
} from 'lucide-react';
import { ServiceDueDashboard } from './ServiceDueDashboard';
import {
  ComplianceInspection,
  SANS10139InspectionType,
  InspectionStatus,
  SuggestedTimeSlot
} from '../types';
import {
  getInspectionTypeLabel,
  getInspectionTypeBadgeColor,
  getStatusBadge
} from '../services/complianceCalendarEngine';
import { ScheduleInspectionModal } from './ScheduleInspectionModal';
import { ComplianceInspectionDetailModal } from './ComplianceInspectionDetailModal';

export const ComplianceCalendar: React.FC<{ initialSiteFilter?: string }> = ({ initialSiteFilter }) => {
  const {
    complianceInspections,
    technicians,
    setSelectedInspectionForDetail,
    setIsScheduleInspectionModalOpen,
    setPreselectedSiteForSchedule,
    exportInspectionICal,
    getSuggestedSlots,
    showToast
  } = useApp();

  // Calendar View State: 'month' | 'week' | 'agenda' | 'service_due'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda' | 'service_due'>('month');
  
  // Current calendar navigation date (Default: September 2026 for demo timeline)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>(initialSiteFilter || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 1));
  };

  // Unique sites for filter dropdown
  const uniqueSites = useMemo(() => {
    const sites = new Set<string>();
    complianceInspections.forEach(insp => sites.add(insp.siteName));
    return Array.from(sites);
  }, [complianceInspections]);

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    return complianceInspections.filter(insp => {
      const matchesSearch =
        insp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.assignedTechnicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.standardClause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.panelMakeModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSite = siteFilter === 'all' || insp.siteName === siteFilter;
      const matchesType = typeFilter === 'all' || insp.inspectionType === typeFilter;
      const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;

      return matchesSearch && matchesSite && matchesType && matchesStatus;
    });
  }, [complianceInspections, searchQuery, siteFilter, typeFilter, statusFilter]);

  // Top metric calculations
  const metrics = useMemo(() => {
    const total = complianceInspections.length;
    const completed = complianceInspections.filter(i => i.status === 'completed').length;
    const dueSoon = complianceInspections.filter(i => i.status === 'due_soon').length;
    const scheduled = complianceInspections.filter(i => i.status === 'scheduled').length;
    const overdue = complianceInspections.filter(i => i.status === 'overdue').length;
    const complianceRate = total > 0 ? Math.round(((completed + scheduled) / total) * 100) : 100;

    return { total, completed, dueSoon, scheduled, overdue, complianceRate };
  }, [complianceInspections]);

  // Auto-suggested slots for the highlighted site or default site
  const suggestedSlots = useMemo(() => {
    const targetSiteName = siteFilter !== 'all' ? siteFilter : 'Warehouse Distribution Hub 3';
    return getSuggestedSlots(
      { siteName: targetSiteName, city: 'Pretoria West' },
      'quarterly_periodic_inspection'
    );
  }, [siteFilter, complianceInspections]);

  // Month Grid Calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Days in current month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Day of week for first day (0 is Sun, 1 is Mon) - Normalize to Monday start (0: Mon, 6: Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { date: Date; isCurrentMonth: boolean; dateString: string }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, dateString });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: true, dateString });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, dateString });
    }

    return days;
  }, [currentDate]);

  // Month Name Formatter
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Quick Book Suggested Slot Handler
  const handleQuickBookSlot = (slot: SuggestedTimeSlot) => {
    setPreselectedSiteForSchedule({
      siteName: siteFilter !== 'all' ? siteFilter : 'Warehouse Distribution Hub 3',
      city: slot.travelZone.includes('Pretoria') ? slot.travelZone : 'Pretoria West',
      streetAddress: 'Commercial Facility'
    });
    setIsScheduleInspectionModalOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Inspection ID', 'Title', 'Standard Clause', 'Site Name', 'City', 'System Category', 'Panel Make/Model', 'Scheduled Date', 'Time Window', 'Technician', 'SAQCC Reg', 'Status', 'Cert Issued'];
    const rows = filteredInspections.map(i => [
      `"${i.id}"`,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.standardClause}"`,
      `"${i.siteName.replace(/"/g, '""')}"`,
      `"${i.city}"`,
      `"${i.systemCategory}"`,
      `"${i.panelMakeModel}"`,
      `"${i.scheduledDate}"`,
      `"${i.scheduledTimeWindow}"`,
      `"${i.assignedTechnicianName}"`,
      `"${i.technicianSaqccNumber}"`,
      `"${i.status}"`,
      `"${i.certificateIssued ? 'Yes (' + (i.certificateNumber || '') + ')' : 'No'}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SANS_10139_Compliance_Calendar_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('info', 'Export Complete', 'Exported compliance schedule in CSV format.');
  };

  return (
    <div className="space-y-6">
      
      {/* Modals */}
      <ScheduleInspectionModal />
      <ComplianceInspectionDetailModal />

      {/* Top Banner: SANS 10139 Compliance Summary */}
      <div className="bg-[#0A192F] text-white rounded-sm border-b-4 border-[#CC0000] p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-mono text-slate-200 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#CC0000]" />
              <span>SANS 10139:2012 &amp; SANS 10400-T Statutory Inspection Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Compliance &amp; Servicing Calendar
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Proactive scheduling for weekly user tests, quarterly inspections (Cl. 25.3), and annual comprehensive servicing (Cl. 25.5).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Compliance Score</span>
              <span className="text-xl font-mono font-black text-emerald-400">{metrics.complianceRate}%</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Scheduled (Next 30d)</span>
              <span className="text-xl font-mono font-black text-blue-400">{metrics.scheduled}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Certified &amp; Completed</span>
              <span className="text-xl font-mono font-black text-white">{metrics.completed}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Due / Action Required</span>
              <span className={`text-xl font-mono font-black ${metrics.dueSoon > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {metrics.dueSoon}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Suggested Open Slots Recommendation Carousel / Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A192F] to-slate-900 border border-slate-700 text-white rounded-sm p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 border-b border-slate-700/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono font-bold uppercase text-xs text-white flex items-center gap-2">
                <span>Auto-Suggested Open Slots for Technicians</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.2 rounded-sm">
                  Real-Time Availability
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-sans">
                Algorithmic scheduling matching technician route proximity, SAQCC qualification, and SANS 10139 maintenance intervals.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPreselectedSiteForSchedule(null);
              setIsScheduleInspectionModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white px-3.5 py-1.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule New Inspection</span>
          </button>
        </div>

        {/* Suggestion Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestedSlots.slice(0, 3).map((slot) => (
            <div
              key={slot.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 p-3 rounded-sm transition-all flex flex-col justify-between gap-2.5 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm">
                    {slot.suitabilityScore}% Optimal Match
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {slot.travelZone}
                  </span>
                </div>

                <div className="flex items-center gap-2 my-1.5">
                  <div
                    className={`w-7 h-7 rounded-sm flex items-center justify-center font-mono font-bold text-xs text-white shrink-0 ${slot.technician.avatarColor}`}
                  >
                    {slot.technician.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <strong className="text-white text-xs block truncate">{slot.technician.name}</strong>
                    <span className="text-[10px] font-mono text-slate-300 block truncate">{slot.technician.saqccNumber}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mt-2 bg-black/20 p-2 rounded-sm">
                  <div className="flex items-center gap-1.5 text-white">
                    <CalendarIcon className="w-3 h-3 text-[#CC0000]" />
                    <strong>{slot.date}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{slot.timeWindow}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleQuickBookSlot(slot)}
                className="w-full mt-1 py-1.5 px-2 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-500 text-emerald-200 hover:text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book This Slot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar Controls & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm space-y-4">
        
        {/* Top Filter & View Mode Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Month / Period Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 border border-slate-300 rounded-sm hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className="font-mono font-black text-sm sm:text-base text-[#0A192F] uppercase min-w-[160px] text-center">
              {monthName}
            </h3>

            <button
              onClick={handleNextMonth}
              className="p-1.5 border border-slate-300 rounded-sm hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-sm transition-colors cursor-pointer ml-1"
            >
              Today (Sep 2026)
            </button>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Month View</span>
            </button>

            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda List ({filteredInspections.length})</span>
            </button>

            <button
              onClick={() => setViewMode('service_due')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'service_due'
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Service Due Horizons</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, technician, clause..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            />
          </div>

          {/* Site Filter */}
          <div>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Premises Sites ({uniqueSites.length})</option>
              {uniqueSites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Inspection Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All SANS 10139 Inspection Cycles</option>
              <option value="quarterly_periodic_inspection">Quarterly Servicing (Cl. 25.3)</option>
              <option value="annual_comprehensive_servicing">Annual Comprehensive (Cl. 25.5)</option>
              <option value="biannual_inspection">6-Monthly Inspection (Cl. 25.4)</option>
              <option value="weekly_user_test">Weekly User Test (Cl. 25.2)</option>
              <option value="emergency_fault_attendance">Emergency Diagnostic (Cl. 26)</option>
              <option value="site_survey">Premises Survey (Cl. 5-6)</option>
            </select>
          </div>

          {/* Status & Export Actions */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Confirmed &amp; Scheduled</option>
              <option value="due_soon">Due Within 30 Days</option>
              <option value="completed">Completed &amp; Certified</option>
              <option value="overdue">Overdue</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-sm font-mono text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              title="Export SANS 10139 CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-[#CC0000]" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* VIEW MODE 1: MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          
          {/* Weekday Header */}
          <div className="grid grid-cols-7 bg-[#0A192F] text-white text-center py-2 font-mono text-[11px] font-bold border-b border-slate-800 uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-50">
            {calendarDays.map((dayObj, index) => {
              const dayInspections = filteredInspections.filter(
                (insp) => insp.scheduledDate === dayObj.dateString
              );

              const isToday = dayObj.dateString === '2026-09-02'; // Simulated current date

              // Check if there is an auto-suggested open slot on this day
              const daySuggestedSlot = suggestedSlots.find(s => s.date === dayObj.dateString);

              return (
                <div
                  key={index}
                  className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                    dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                  } ${isToday ? 'ring-2 ring-inset ring-[#CC0000]/60 bg-red-50/20' : ''}`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                        isToday
                          ? 'bg-[#CC0000] text-white'
                          : dayObj.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-mono text-[#CC0000] font-bold uppercase">
                        Current Day
                      </span>
                    )}
                  </div>

                  {/* Day Inspections Stack */}
                  <div className="space-y-1.5 flex-1">
                    {dayInspections.map((insp) => {
                      const badge = getInspectionTypeBadgeColor(insp.inspectionType);
                      const status = getStatusBadge(insp.status);

                      return (
                        <div
                          key={insp.id}
                          onClick={() => setSelectedInspectionForDetail(insp)}
                          className={`p-1.5 rounded-sm border cursor-pointer transition-all hover:scale-[1.02] shadow-xs text-left ${badge.bg} ${badge.border} hover:shadow-sm`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[9px] font-mono font-bold truncate ${badge.text}`}>
                              {insp.scheduledTimeWindow.split(' - ')[0]}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shrink-0`} />
                          </div>

                          <strong className="text-[11px] text-slate-900 block truncate font-sans leading-tight">
                            {insp.siteName}
                          </strong>

                          <span className="text-[9px] font-mono text-slate-600 block truncate mt-0.5">
                            {insp.assignedTechnicianName.split(' ')[0]} ({insp.technicianSaqccNumber})
                          </span>
                        </div>
                      );
                    })}

                    {/* Open Slot Available Prompt */}
                    {dayObj.isCurrentMonth && dayInspections.length === 0 && daySuggestedSlot && (
                      <div
                        onClick={() => handleQuickBookSlot(daySuggestedSlot)}
                        className="p-1 rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/70 text-emerald-800 text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer transition-colors group"
                        title="Click to schedule open technician slot"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="hidden sm:inline font-bold">+ Open Slot</span>
                      </div>
                    )}
                  </div>

                  {/* Cell Bottom Status Dot count */}
                  {dayInspections.length > 0 && (
                    <div className="text-[9px] font-mono text-slate-400 text-right mt-1">
                      {dayInspections.length} SANS Event{dayInspections.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-sm p-12 text-center space-y-3">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-mono font-bold text-slate-800 text-sm">No Compliance Inspections Found</h4>
              <p className="text-xs text-slate-500 font-mono">Try clearing search filters or schedule a new SANS 10139 inspection cycle.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSiteFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm font-mono text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInspections.map((insp) => {
                const badge = getInspectionTypeBadgeColor(insp.inspectionType);
                const status = getStatusBadge(insp.status);

                return (
                  <div
                    key={insp.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-sm p-4 sm:p-5 shadow-sm transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                          {getInspectionTypeLabel(insp.inspectionType)}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold flex items-center gap-1.5 ${status.bg} ${status.text} border ${status.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                          {insp.standardClause}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900">
                        <CalendarIcon className="w-4 h-4 text-[#CC0000]" />
                        <span>{insp.scheduledDate} ({insp.scheduledTimeWindow})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Left: Site Info */}
                      <div className="md:col-span-5 space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {insp.siteName}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {insp.streetAddress}, {insp.city}
                        </p>
                        <p className="text-[11px] font-mono text-slate-600">
                          Panel: <strong className="text-slate-800">{insp.panelMakeModel}</strong> • {insp.systemCategory}
                        </p>
                      </div>

                      {/* Middle: Technician */}
                      <div className="md:col-span-4 bg-slate-50 p-2.5 rounded-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-[#0A192F] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {insp.assignedTechnicianName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Assigned Engineer</span>
                          <strong className="text-slate-900 text-xs block truncate">{insp.assignedTechnicianName}</strong>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">{insp.technicianSaqccNumber}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="md:col-span-3 flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => exportInspectionICal(insp)}
                          className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-sm font-mono text-xs font-bold transition-colors cursor-pointer"
                          title="Export to Calendar (.ics)"
                        >
                          <Download className="w-3.5 h-3.5 text-[#CC0000]" />
                        </button>
                        <button
                          onClick={() => setSelectedInspectionForDetail(insp)}
                          className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: SERVICE DUE VISUALIZATION DASHBOARD */}
      {viewMode === 'service_due' && (
        <ServiceDueDashboard siteIdFilter={siteFilter !== 'all' ? siteFilter : undefined} />
      )}

      {/* Legend and Regulatory Reference Footer */}
      <div className="bg-slate-100 border border-slate-200 rounded-sm p-4 text-xs font-mono text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-800">SANS 10139 Standard Cycles:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#CC0000]" /> Annual Servicing (Cl. 25.5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" /> Quarterly (Cl. 25.3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" /> Weekly Test (Cl. 25.2)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-600" /> Emergency Triage (Cl. 26)
          </span>
        </div>

        <div className="text-[11px] text-slate-500">
          All slots serviced by SAQCC registered fire-detection technicians.
        </div>
      </div>

    </div>
  );
};
