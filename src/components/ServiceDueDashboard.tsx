import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Cpu,
  UserCheck,
  ShieldCheck,
  Download,
  Filter,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Volume2,
  BatteryCharging,
  Layers,
  CheckSquare,
  AlertOctagon
} from 'lucide-react';
import { serviceDueService } from '../services/serviceDueService';
import { SANS_10139_REQUIREMENT_NOTES } from '../data/serviceDueData';
import {
  ClientSiteMaintenanceProfile,
  SiteMaintenanceInterval,
  SANS10139IntervalKey,
  MaintenanceUrgencyStatus,
  ServiceDueFilterState
} from '../types/serviceDue';
import { useApp } from '../context/AppContext';

interface ServiceDueDashboardProps {
  onScheduleInspection?: (siteId: string, intervalKey: SANS10139IntervalKey) => void;
  siteIdFilter?: string;
}

export const ServiceDueDashboard: React.FC<ServiceDueDashboardProps> = ({
  onScheduleInspection,
  siteIdFilter
}) => {
  const { showToast, setIsScheduleInspectionModalOpen, setPreselectedSiteForSchedule } = useApp();

  // Loading / animation reload state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Filters
  const [filterState, setFilterState] = useState<ServiceDueFilterState>({
    searchQuery: '',
    selectedSite: siteIdFilter || 'all',
    selectedInterval: 'all',
    selectedStatus: 'all',
    selectedCategory: 'all'
  });

  // Active view tab: 'chart' | 'matrix' | 'cards'
  const [viewTab, setViewTab] = useState<'chart' | 'matrix' | 'cards'>('chart');

  // Selected interval modal for drilldown
  const [inspectedInterval, setInspectedInterval] = useState<SiteMaintenanceInterval | null>(null);
  const [inspectedSite, setInspectedSite] = useState<ClientSiteMaintenanceProfile | null>(null);

  // Trigger subtle data-loading animation on initial mount and when user clicks refresh
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [reloadTrigger]);

  const allProfiles = useMemo(() => {
    return serviceDueService.getAllProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    return serviceDueService.getFilteredProfiles(filterState);
  }, [filterState]);

  const metrics = useMemo(() => {
    return serviceDueService.getSummaryMetrics();
  }, [allProfiles]);

  const handleManualReload = () => {
    setReloadTrigger((prev) => prev + 1);
    showToast('Refreshing live SANS 10139 maintenance intervals & telemetry...', 'info');
  };

  const handleExportCsv = (siteId?: string) => {
    serviceDueService.downloadMaintenanceCsv(siteId);
    showToast('Exported SANS 10139 maintenance schedule to CSV', 'success');
  };

  // Prepare chart dataset based on selected interval or earliest due
  const chartData = useMemo(() => {
    return filteredProfiles.map((site) => {
      let interval: SiteMaintenanceInterval;

      if (filterState.selectedInterval !== 'all') {
        interval = site.intervals[filterState.selectedInterval as SANS10139IntervalKey] || site.mostUrgentInterval;
      } else {
        interval = site.mostUrgentInterval;
      }

      return {
        siteId: site.siteId,
        siteName: site.siteName,
        shortName: site.shortName,
        clientOrg: site.clientOrganisation,
        category: site.systemCategory,
        panelModel: site.panelModel,
        intervalKey: interval.intervalKey,
        intervalLabel: interval.label,
        clause: interval.standardClause,
        daysRemaining: interval.daysRemaining,
        nextDueDate: interval.nextDueDate,
        status: interval.status,
        complianceScore: site.overallComplianceScore,
        technician: interval.assignedTechnician,
        requirementDetail: interval.requirementDetail,
        elapsedPercent: interval.cycleElapsedPercent,
        fullInterval: interval,
        fullSite: site
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [filteredProfiles, filterState.selectedInterval]);

  const getStatusColor = (status: MaintenanceUrgencyStatus) => {
    switch (status) {
      case 'overdue':
        return '#EF4444'; // Red-500
      case 'due_soon':
        return '#F59E0B'; // Amber-500
      case 'scheduled':
        return '#3B82F6'; // Blue-500
      case 'compliant':
        return '#10B981'; // Emerald-500
    }
  };

  const getStatusBadge = (status: MaintenanceUrgencyStatus, daysRemaining: number) => {
    switch (status) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
            <AlertOctagon className="w-3 h-3 text-red-500" />
            <span>OVERDUE ({Math.abs(daysRemaining)}d ago)</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>DUE SOON ({daysRemaining}d)</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Calendar className="w-3 h-3 text-blue-400" />
            <span>SCHEDULED ({daysRemaining}d)</span>
          </span>
        );
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>COMPLIANT ({daysRemaining}d)</span>
          </span>
        );
    }
  };

  // Custom rich hover tooltip for Recharts horizontal bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const req = data.requirementDetail;

    return (
      <div className="bg-[#0A192F] text-white p-4 rounded-md shadow-2xl border border-slate-700 max-w-md pointer-events-auto z-50 text-xs font-sans">
        {/* Tooltip Header */}
        <div className="border-b border-slate-700 pb-2 mb-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#CC0000]/20 text-[#FF4D4D] border border-[#CC0000]/40 rounded text-[10px] font-mono font-bold uppercase">
              {data.clause}
            </span>
            {getStatusBadge(data.status, data.daysRemaining)}
          </div>
          <h4 className="font-bold text-sm text-white font-mono leading-tight">{data.siteName}</h4>
          <p className="text-[11px] text-slate-300 font-mono">{data.clientOrg} &bull; {data.category}</p>
        </div>

        {/* System & Schedule Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-black/30 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
          <div>
            <span className="text-slate-400 block text-[10px]">CIE Panel Model</span>
            <span className="text-slate-200 font-bold truncate block">{data.panelModel}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Next Due Date</span>
            <span className="text-amber-400 font-bold block">{data.nextDueDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Maintenance Interval</span>
            <span className="text-white block font-bold">{data.intervalLabel}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Assigned SAQCC Tech</span>
            <span className="text-emerald-400 block font-bold truncate">{data.technician.name}</span>
          </div>
        </div>

        {/* Detailed SANS 10139 Requirement Notes */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-[11px] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>SANS 10139 Requirement Notes</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed italic">
            "{req.statutoryObjective}"
          </p>

          <div className="space-y-1 mt-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Mandatory Scope Checklist:
            </span>
            <ul className="space-y-1 text-[10px] text-slate-200">
              {req.mandatoryScope.slice(0, 3).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
              {req.mandatoryScope.length > 3 && (
                <li className="text-slate-400 pl-4 italic">
                  +{req.mandatoryScope.length - 3} additional statutory verification steps...
                </li>
              )}
            </ul>
          </div>

          {req.audibilityVerification && (
            <div className="bg-slate-800/80 p-1.5 rounded flex items-center gap-1.5 text-[10px] text-slate-300">
              <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span><strong>Audibility:</strong> {req.audibilityVerification}</span>
            </div>
          )}

          {req.batteryAutonomyCriteria && (
            <div className="bg-slate-800/80 p-1.5 rounded flex items-center gap-1.5 text-[10px] text-slate-300">
              <BatteryCharging className="w-3 h-3 text-emerald-400 shrink-0" />
              <span><strong>Battery:</strong> {req.batteryAutonomyCriteria}</span>
            </div>
          )}
        </div>

        {/* Statutory Consequence Warning */}
        <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-[10px] text-amber-200 leading-tight">
          <strong className="text-amber-400 uppercase font-mono block mb-0.5">Statutory Legal Impact:</strong>
          {req.statutoryConsequence}
        </div>

        <div className="mt-2 text-right">
          <span className="text-[10px] font-mono text-slate-400">Click bar for comprehensive audit dossier</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Metrics and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-[#0A192F] via-slate-900 to-[#0A192F] border border-slate-800 rounded-sm p-5 text-white shadow-md relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#CC0000]/20 text-[#FF4D4D] border border-[#CC0000]/40 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                SANS 10139:2012 Compliance
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono font-bold uppercase">
                Statutory Service Intervals
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] font-mono font-bold uppercase">
                8 Client Sites
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase font-mono tracking-wide text-white flex items-center gap-2">
              <span>'Service Due' Visualization Dashboard</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Real-time monitoring of upcoming statutory fire detection servicing deadlines across all client sites.
              Hover over bars to inspect detailed SANS 10139 requirement notes, mandatory testing scopes, and technician qualifications.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={handleManualReload}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              title="Trigger data reload and entry animation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isLoading ? 'Reloading...' : 'Refresh Data'}</span>
            </button>

            <button
              onClick={() => handleExportCsv(filterState.selectedSite === 'all' ? undefined : filterState.selectedSite)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              title="Export complete maintenance records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setPreselectedSiteForSchedule(null);
                setIsScheduleInspectionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white px-3.5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Service</span>
            </button>
          </div>
        </div>

        {/* Metric Counter Cards with Entry Animations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Client Sites</span>
            <span className="text-xl font-mono font-black text-white">{metrics.totalSites}</span>
          </div>

          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Connected Devices</span>
            <span className="text-xl font-mono font-black text-slate-200">{metrics.totalDevices}</span>
          </div>

          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-red-400 uppercase block font-bold">Overdue Servicing</span>
            <span className="text-xl font-mono font-black text-red-400">{metrics.overdueCount}</span>
          </div>

          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">Due in &le; 14 Days</span>
            <span className="text-xl font-mono font-black text-amber-400">{metrics.dueSoonCount}</span>
          </div>

          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-blue-400 uppercase block font-bold">Scheduled (15-45d)</span>
            <span className="text-xl font-mono font-black text-blue-400">{metrics.scheduledCount}</span>
          </div>

          <div className="bg-black/40 border border-slate-800 p-2.5 rounded-sm">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">Avg Compliance</span>
            <span className="text-xl font-mono font-black text-emerald-400">{metrics.averageCompliance}%</span>
          </div>
        </div>
      </motion.div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Interval Frequency Switcher Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'Earliest Due (All Sites)' },
              { key: 'weekly', label: 'Weekly (7d)' },
              { key: 'monthly', label: 'Monthly (30d)' },
              { key: 'quarterly', label: 'Quarterly (90d)' },
              { key: 'biannual', label: 'Bi-Annual (180d)' },
              { key: 'annual', label: 'Annual COC (365d)' },
              { key: 'five_year', label: '5-Yr Overhaul' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterState((prev) => ({ ...prev, selectedInterval: tab.key }))}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterState.selectedInterval === tab.key
                    ? 'bg-[#0A192F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Presentation Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewTab('chart')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all cursor-pointer ${
                viewTab === 'chart'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horizontal Chart
            </button>
            <button
              onClick={() => setViewTab('matrix')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all cursor-pointer ${
                viewTab === 'matrix'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interval Matrix
            </button>
            <button
              onClick={() => setViewTab('cards')}
              className={`px-3 py-1 rounded-sm text-xs font-mono font-bold transition-all cursor-pointer ${
                viewTab === 'cards'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Site Cards ({filteredProfiles.length})
            </button>
          </div>
        </div>

        {/* Detailed Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search site, panel, technician..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            />
          </div>

          {/* Site Filter */}
          <div>
            <select
              value={filterState.selectedSite}
              onChange={(e) => setFilterState((prev) => ({ ...prev, selectedSite: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Premises Sites ({allProfiles.length})</option>
              {allProfiles.map((p) => (
                <option key={p.siteId} value={p.siteId}>
                  {p.siteName}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Status Filter */}
          <div>
            <select
              value={filterState.selectedStatus}
              onChange={(e) => setFilterState((prev) => ({ ...prev, selectedStatus: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All Urgency Statuses</option>
              <option value="overdue">Overdue (&lt; 0 Days)</option>
              <option value="due_soon">Due Soon (&le; 14 Days)</option>
              <option value="scheduled">Scheduled (15 - 45 Days)</option>
              <option value="compliant">Compliant (&gt; 45 Days)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterState.selectedCategory}
              onChange={(e) => setFilterState((prev) => ({ ...prev, selectedCategory: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
            >
              <option value="all">All System Categories</option>
              <option value="Category L1">Category L1 (Life Safety)</option>
              <option value="Category L2">Category L2 (Targeted Areas)</option>
              <option value="Category P1">Category P1 (Property Protection)</option>
              <option value="Category M">Category M (Manual)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area with Subtle Entry Animation */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-sm p-12 text-center shadow-sm"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-[#CC0000] rounded-full animate-spin" />
              <div className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
                Loading SANS 10139 Service Horizons...
              </div>
              <p className="text-xs text-slate-400 font-sans max-w-sm">
                Calculating device testing rotations, standby battery impedance telemetry, and statutory audit deadlines.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* VIEW TAB 1: Horizontal Bar Chart Visualization */}
            {viewTab === 'chart' && (
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-mono font-bold text-sm text-[#0A192F] uppercase flex items-center gap-2">
                      <span>Statutory Time-Based Horizontal Bar Chart</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {filterState.selectedInterval === 'all'
                          ? 'Showing Earliest Due SANS 10139 Interval per Site'
                          : `Filter: ${SANS_10139_REQUIREMENT_NOTES[filterState.selectedInterval as SANS10139IntervalKey]?.clauseTitle || filterState.selectedInterval}`}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Bars indicate remaining calendar days until mandatory statutory servicing. Hover over any bar to inspect SANS 10139 requirement notes.
                    </p>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-red-500 inline-block" />
                      <span className="text-slate-600">Overdue (&lt;0d)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                      <span className="text-slate-600">Due &le;14d</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" />
                      <span className="text-slate-600">Scheduled (15-45d)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                      <span className="text-slate-600">Compliant (&gt;45d)</span>
                    </div>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-mono text-xs">
                    No client sites match the current filter criteria.
                  </div>
                ) : (
                  <div className="w-full h-[420px] pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#E2E8F0" />
                        <XAxis
                          type="number"
                          domain={[-5, 'dataMax + 10']}
                          tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748B' }}
                          tickFormatter={(val) => `${val} days`}
                        />
                        <YAxis
                          type="category"
                          dataKey="shortName"
                          tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#0F172A', fontWeight: 600 }}
                          width={130}
                        />
                        <Tooltip
                          content={<CustomBarTooltip />}
                          cursor={{ fill: 'rgba(204, 0, 0, 0.05)' }}
                        />
                        <ReferenceLine
                          x={0}
                          stroke="#EF4444"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          label={{
                            value: 'Due Date Threshold (0d)',
                            position: 'insideTopLeft',
                            fill: '#DC2626',
                            fontSize: 10,
                            fontFamily: 'monospace',
                            fontWeight: 'bold'
                          }}
                        />
                        <ReferenceLine
                          x={14}
                          stroke="#F59E0B"
                          strokeDasharray="3 3"
                          label={{
                            value: 'Urgency Line (14d)',
                            position: 'insideTopLeft',
                            fill: '#D97706',
                            fontSize: 10,
                            fontFamily: 'monospace'
                          }}
                        />
                        <Bar
                          dataKey="daysRemaining"
                          name="Days Remaining"
                          isAnimationActive={true}
                          animationDuration={900}
                          animationEasing="ease-out"
                          radius={[0, 4, 4, 0]}
                          onClick={(data) => {
                            setInspectedInterval(data.fullInterval);
                            setInspectedSite(data.fullSite);
                          }}
                          className="cursor-pointer"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getStatusColor(entry.status)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#CC0000] shrink-0" />
                    <span>
                      <strong>Interactive Guide:</strong> Hover over any horizontal bar to preview the full SANS 10139 requirement notes.
                      Click on any bar to open the complete inspection audit dossier.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 shrink-0">Reference date: 04 Sept 2026</span>
                </div>
              </div>
            )}

            {/* VIEW TAB 2: Interval Matrix across all SANS 10139 tiers */}
            {viewTab === 'matrix' && (
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-mono font-bold text-sm text-[#0A192F] uppercase">
                      SANS 10139 Full Statutory Interval Matrix
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Cross-tabulation of all 6 statutory maintenance tiers (Weekly, Monthly, Quarterly, Bi-Annual, Annual, 5-Year) across premises.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase">
                        <th className="p-3 border border-slate-800">Premises / Client Site</th>
                        <th className="p-3 border border-slate-800 text-center">Weekly (7d)<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.2</span></th>
                        <th className="p-3 border border-slate-800 text-center">Monthly (30d)<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.2.2</span></th>
                        <th className="p-3 border border-slate-800 text-center">Quarterly (90d)<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.3</span></th>
                        <th className="p-3 border border-slate-800 text-center">Bi-Annual (180d)<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.4</span></th>
                        <th className="p-3 border border-slate-800 text-center">Annual COC (365d)<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.5</span></th>
                        <th className="p-3 border border-slate-800 text-center">5-Yr Overhaul<br/><span className="text-[9px] text-slate-400 font-normal">Cl. 25.6</span></th>
                        <th className="p-3 border border-slate-800 text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {filteredProfiles.map((site) => (
                        <tr key={site.siteId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 border border-slate-200">
                            <strong className="text-[#0A192F] block">{site.siteName}</strong>
                            <span className="text-[10px] text-slate-500 block">{site.panelModel}</span>
                          </td>
                          {(['weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'five_year'] as SANS10139IntervalKey[]).map((key) => {
                            const interval = site.intervals[key];
                            return (
                              <td
                                key={key}
                                onClick={() => {
                                  setInspectedInterval(interval);
                                  setInspectedSite(site);
                                }}
                                className="p-2.5 border border-slate-200 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      interval.status === 'overdue'
                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                        : interval.status === 'due_soon'
                                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                        : interval.status === 'scheduled'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    }`}
                                  >
                                    {interval.daysRemaining < 0
                                      ? `${Math.abs(interval.daysRemaining)}d ago`
                                      : `${interval.daysRemaining}d left`}
                                  </span>
                                  <span className="text-[9px] text-slate-400 mt-0.5">{interval.nextDueDate}</span>
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 border border-slate-200 text-center">
                            <span className="font-bold text-slate-900">{site.overallComplianceScore}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW TAB 3: Site Breakdown Cards */}
            {viewTab === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProfiles.map((site) => (
                  <motion.div
                    key={site.siteId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:border-[#CC0000]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#CC0000]" />
                            <h4 className="font-mono font-bold text-sm text-[#0A192F]">{site.siteName}</h4>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                            {site.clientOrganisation} &bull; {site.city}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold text-[11px]">
                          {site.overallComplianceScore}% Compliance
                        </span>
                      </div>

                      {/* Technical Meta */}
                      <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200 text-xs font-mono space-y-1 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">System Category:</span>
                          <strong className="text-[#0A192F]">{site.systemCategory}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Panel &amp; Loops:</span>
                          <span className="text-slate-700 truncate max-w-[200px]">{site.panelModel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Installed Devices:</span>
                          <span className="text-slate-700">{site.deviceCount} Detectors / Call Points</span>
                        </div>
                      </div>

                      {/* Earliest Actionable Interval */}
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                            Most Urgent Statutory Requirement
                          </span>
                          {getStatusBadge(site.mostUrgentInterval.status, site.mostUrgentInterval.daysRemaining)}
                        </div>

                        <div className="bg-[#0A192F] text-white p-3 rounded-sm space-y-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-amber-300">{site.mostUrgentInterval.label}</strong>
                            <span className="text-[10px] text-slate-400">{site.mostUrgentInterval.standardClause}</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Due Date: <strong className="text-white">{site.mostUrgentInterval.nextDueDate}</strong> ({site.mostUrgentInterval.daysRemaining} days remaining)
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Assigned SAQCC Tech: <strong className="text-emerald-300">{site.mostUrgentInterval.assignedTechnician.name}</strong> ({site.mostUrgentInterval.assignedTechnician.saqccNumber})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setInspectedInterval(site.mostUrgentInterval);
                          setInspectedSite(site);
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect Notes</span>
                      </button>

                      <button
                        onClick={() => handleExportCsv(site.siteId)}
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm font-mono text-xs transition-all cursor-pointer"
                        title="Export site CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setPreselectedSiteForSchedule(site.siteName);
                          setIsScheduleInspectionModalOpen(true);
                        }}
                        className="py-1.5 px-3 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Book</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SANS 10139 Detailed Requirement Notes Inspection Modal */}
      <AnimatePresence>
        {inspectedInterval && inspectedSite && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-sm border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden my-8"
            >
              {/* Modal Top Header */}
              <div className="bg-[#0A192F] text-white p-5 border-b border-slate-700 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#CC0000] text-white rounded font-mono text-[10px] font-bold uppercase">
                      {inspectedInterval.standardClause}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                      Cycle: {inspectedInterval.cycleDays} Days
                    </span>
                    {getStatusBadge(inspectedInterval.status, inspectedInterval.daysRemaining)}
                  </div>
                  <h3 className="font-mono font-bold text-lg text-white">{inspectedInterval.label}</h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {inspectedSite.siteName} &bull; {inspectedSite.clientOrganisation}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setInspectedInterval(null);
                    setInspectedSite(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Statutory Objective */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Statutory Engineering Objective
                  </span>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    {inspectedInterval.requirementDetail.statutoryObjective}
                  </p>
                </div>

                {/* Mandatory Scope Checklist */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-900 font-bold block mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[#CC0000]" />
                    <span>Mandatory Verification Checklist (Clause Specific)</span>
                  </span>
                  <div className="space-y-2 bg-slate-50 border border-slate-200 p-3 rounded-sm">
                    {inspectedInterval.requirementDetail.mandatoryScope.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-normal">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Standards Criteria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectedInterval.requirementDetail.audibilityVerification && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono font-bold text-[11px] mb-1">
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Acoustic Decibel Standard</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {inspectedInterval.requirementDetail.audibilityVerification}
                      </p>
                    </div>
                  )}

                  {inspectedInterval.requirementDetail.batteryAutonomyCriteria && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono font-bold text-[11px] mb-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Battery Autonomy Criteria</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {inspectedInterval.requirementDetail.batteryAutonomyCriteria}
                      </p>
                    </div>
                  )}
                </div>

                {/* SAQCC Qualification & Assignment */}
                <div className="bg-slate-900 text-white p-3 rounded-sm space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400">Assigned SAQCC Technician:</span>
                    <strong className="text-emerald-400">{inspectedInterval.assignedTechnician.name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Registration Number:</span>
                    <span className="text-white font-bold">{inspectedInterval.assignedTechnician.saqccNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Required Accreditation Level:</span>
                    <span className="text-amber-300">{inspectedInterval.requirementDetail.requiredSaqccLevel}</span>
                  </div>
                </div>

                {/* Statutory Consequence Note */}
                <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-mono text-[11px] uppercase text-red-800 block mb-0.5">
                      Statutory Enforcement &amp; Insurance Impact
                    </strong>
                    <p className="text-red-700 text-[11px] leading-relaxed">
                      {inspectedInterval.requirementDetail.statutoryConsequence}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleExportCsv(inspectedSite.siteId)}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Site History CSV</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInspectedInterval(null);
                      setInspectedSite(null);
                    }}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-sm font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => {
                      setPreselectedSiteForSchedule(inspectedSite.siteName);
                      setInspectedInterval(null);
                      setInspectedSite(null);
                      setIsScheduleInspectionModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book SAQCC Technician</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
