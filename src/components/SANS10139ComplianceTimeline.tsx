import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Award,
  FileText,
  Download,
  Search,
  Filter,
  Building,
  Layers,
  Cpu,
  Zap,
  ChevronRight,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  Activity,
  FileCheck2,
  Printer,
  X,
  ShieldAlert,
  Wrench,
  BatteryCharging,
  Radio,
  Eye,
  Info,
  CheckCircle,
  HelpCircle,
  BarChart3,
  CalendarRange,
  Gauge
} from 'lucide-react';
import {
  TimelineMilestone,
  SiteComplianceProfile,
  SITE_COMPLIANCE_PROFILES,
  INITIAL_TIMELINE_MILESTONES,
  getCycleTypeMeta
} from '../services/complianceTimelineService';
import { getStatusBadge } from '../services/complianceCalendarEngine';
import { ScheduleInspectionModal } from './ScheduleInspectionModal';
import { COCCertificateViewerModal } from './COCCertificateViewerModal';

interface SANS10139ComplianceTimelineProps {
  initialSiteId?: string;
  isCompact?: boolean;
}

export const SANS10139ComplianceTimeline: React.FC<SANS10139ComplianceTimelineProps> = ({
  initialSiteId,
  isCompact = false
}) => {
  const {
    setIsScheduleInspectionModalOpen,
    setPreselectedSiteForSchedule,
    showToast
  } = useApp();

  // Active Site Selector ('all' or specific siteId)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId || 'site-01');

  // Active View Tab: 'rail' (Unified Chronological Rail) | 'quarterly_cycle' (4-Quarter Annual Matrix) | 'five_year_horizon' (5-Year Component Life) | 'ledger_table' (Statutory Table)
  const [timelineViewMode, setTimelineViewMode] = useState<'rail' | 'quarterly_cycle' | 'five_year_horizon' | 'ledger_table'>('rail');

  // Filters
  const [cycleTypeFilter, setCycleTypeFilter] = useState<string>('all');
  const [timeHorizonFilter, setTimeHorizonFilter] = useState<'all' | 'historical' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Milestone Records State (allows live logging of weekly tests)
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(INITIAL_TIMELINE_MILESTONES);

  // Selected Milestone for Detail Drawer/Modal
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);

  // Weekly User Test Quick Logger Modal State
  const [isLogWeeklyModalOpen, setIsLogWeeklyModalOpen] = useState(false);
  const [weeklyTestSiteId, setWeeklyTestSiteId] = useState<string>('site-01');
  const [weeklyCallPointId, setWeeklyCallPointId] = useState('MCP-04');
  const [weeklyZoneNumber, setWeeklyZoneNumber] = useState('Zone 2');
  const [weeklyAudibleConfirmed, setWeeklyAudibleConfirmed] = useState(true);
  const [weeklyResetConfirmed, setWeeklyResetConfirmed] = useState(true);
  const [weeklyNotes, setWeeklyNotes] = useState('');

  // SANS 10139 Info Modal State
  const [isSANSInfoModalOpen, setIsSANSInfoModalOpen] = useState(false);

  // Certificate Modal State
  const [viewingCertificateMilestone, setViewingCertificateMilestone] = useState<TimelineMilestone | null>(null);

  // Current Active Site Profile
  const activeSiteProfile = useMemo(() => {
    return SITE_COMPLIANCE_PROFILES.find(s => s.siteId === selectedSiteId) || SITE_COMPLIANCE_PROFILES[0];
  }, [selectedSiteId]);

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    return milestones
      .filter(m => {
        // Site filter
        if (selectedSiteId !== 'all' && m.siteId !== selectedSiteId) return false;

        // Cycle type filter
        if (cycleTypeFilter !== 'all' && m.cycleType !== cycleTypeFilter) return false;

        // Horizon filter (Historical vs Upcoming)
        if (timeHorizonFilter === 'historical' && !m.isHistorical) return false;
        if (timeHorizonFilter === 'upcoming' && m.isHistorical) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchSite = m.siteName.toLowerCase().includes(q);
          const matchClause = m.standardClause.toLowerCase().includes(q);
          const matchTech = m.assignedTechnician.name.toLowerCase().includes(q);
          const matchCert = m.certificateNumber?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchSite && !matchClause && !matchTech && !matchCert) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [milestones, selectedSiteId, cycleTypeFilter, timeHorizonFilter, searchQuery]);

  // Split into Historical (Past) and Upcoming (Future)
  const historicalMilestones = useMemo(() => {
    return filteredMilestones
      .filter(m => m.isHistorical)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()); // newest completed first
  }, [filteredMilestones]);

  const upcomingMilestones = useMemo(() => {
    return filteredMilestones
      .filter(m => !m.isHistorical)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()); // nearest deadline first
  }, [filteredMilestones]);

  // Summary Metrics
  const complianceMetrics = useMemo(() => {
    const totalEvents = milestones.filter(m => selectedSiteId === 'all' || m.siteId === selectedSiteId).length;
    const completedEvents = milestones.filter(m => (selectedSiteId === 'all' || m.siteId === selectedSiteId) && m.isHistorical).length;
    const upcomingEvents = milestones.filter(m => (selectedSiteId === 'all' || m.siteId === selectedSiteId) && !m.isHistorical).length;
    const nextMilestone = upcomingMilestones[0];
    
    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      nextMilestone,
      healthScore: selectedSiteId === 'all' ? 95 : activeSiteProfile.complianceRatingScore
    };
  }, [milestones, selectedSiteId, activeSiteProfile, upcomingMilestones]);

  // Trigger Schedule Modal for this site
  const handleScheduleForSite = (siteProfile: SiteComplianceProfile) => {
    setPreselectedSiteForSchedule({
      siteName: siteProfile.siteName,
      city: siteProfile.city,
      streetAddress: siteProfile.streetAddress
    });
    setIsScheduleInspectionModalOpen(true);
  };

  // Submit Routine Weekly User Test
  const handleSaveWeeklyTest = (e: React.FormEvent) => {
    e.preventDefault();
    const site = SITE_COMPLIANCE_PROFILES.find(s => s.siteId === weeklyTestSiteId) || SITE_COMPLIANCE_PROFILES[0];
    const todayStr = '2026-09-02';
    const certNum = `SANS-WKT-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newMilestone: TimelineMilestone = {
      id: `ms-wkt-${Date.now()}`,
      siteId: site.siteId,
      siteName: site.siteName,
      organisationName: site.organisationName,
      streetAddress: site.streetAddress,
      city: site.city,
      systemCategory: site.systemCategory,
      panelMakeModel: site.panelMakeModel,
      eventDate: todayStr,
      title: `Routine Weekly User Test (${weeklyCallPointId} / ${weeklyZoneNumber})`,
      cycleType: 'weekly_user_test',
      standardClause: 'SANS 10139:2012 Clause 25.2 (Weekly User Test)',
      isHistorical: true,
      status: 'completed',
      testingScopeSummary: `Manual Call Point ${weeklyCallPointId} tested in ${weeklyZoneNumber}. Audible alarm broadcast verified in <3s. CIE panel reset verified.`,
      deviceTestedCount: 1,
      totalSystemDeviceCount: site.totalDetectorsCount + site.totalCallPointsCount,
      testedZonesOrLoops: `${weeklyZoneNumber} / ${weeklyCallPointId}`,
      sounderDecibelReading: '82 dBA verified audible throughout zone',
      logbookSigned: true,
      activeFaultsPresent: 0,
      assignedTechnician: {
        id: 'user-resp',
        name: 'Client Responsible Person (Audrin Certified)',
        role: 'Designated SANS 10139 Fire Safety Officer',
        saqccNumber: 'SANS 10139 Clause 4.2 Nominee',
        saqccLevel: 'Level 1 - Cabler',
        phone: '012 345 6789',
        email: 'safety@logistics.co.za',
        specialties: ['Weekly Call Point Rotations', 'Logbook Custodianship'],
        currentAssignedCount: 0,
        baseLocation: site.city,
        avatarColor: 'bg-emerald-600'
      },
      certificateIssued: true,
      certificateNumber: certNum,
      findingsSummary: `Weekly call point test successful. Alarm sounded immediately. Logbook entry counters authenticated. ${weeklyNotes ? `Note: ${weeklyNotes}` : ''}`,
      daysOffset: 0
    };

    setMilestones(prev => [newMilestone, ...prev]);
    setIsLogWeeklyModalOpen(false);
    setWeeklyNotes('');
    showToast(
      'success',
      'Weekly SANS 10139 Test Recorded',
      `Call Point ${weeklyCallPointId} test successfully logged into statutory compliance timeline.`
    );
  };

  // Export Timeline Ledger to PDF/Print
  const handlePrintTimeline = () => {
    window.print();
  };

  return (
    <div id="sans-10139-compliance-timeline" className="space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER & REGULATORY STATUTORY CONTEXT BAR                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0A192F] text-white p-6 sm:p-8 rounded-sm shadow-xl border-t-4 border-[#CC0000] relative overflow-hidden">
        {/* Background circuit grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#CC0000] text-white tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                SANS 10139:2012 Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <ScaleIcon className="w-3 h-3" />
                OHS Act &amp; SANS 10400-T Mandated
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 bg-white/10">
                SAQCC Registered Technician Verification
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              SANS 10139 Compliance Timeline
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time statutory lifecycle tracking for client facilities. Visualizing historical quarterly servicing rotations (Clause 25.3), annual comprehensive COC re-certifications (Clause 25.5), weekly user tests, and upcoming regulatory inspection deadlines.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center">
            <button
              onClick={() => handleScheduleForSite(activeSiteProfile)}
              className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A30000] text-white px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Next Inspection</span>
            </button>

            <button
              onClick={() => {
                setWeeklyTestSiteId(selectedSiteId !== 'all' ? selectedSiteId : 'site-01');
                setIsLogWeeklyModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Log Routine User Test</span>
            </button>

            <button
              onClick={handlePrintTimeline}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2.5 rounded-sm font-mono text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Print / Export SANS Compliance Ledger"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Export Ledger</span>
            </button>

            <button
              onClick={() => setIsSANSInfoModalOpen(true)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-sm transition-all cursor-pointer"
              title="SANS 10139 Standard Clauses Reference"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Facility Quick Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Active Site</span>
            <div className="text-sm font-bold text-white font-mono truncate mt-0.5">
              {selectedSiteId === 'all' ? 'All Client Facilities (5)' : activeSiteProfile.siteName}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {selectedSiteId === 'all' ? 'Consolidated Portfolio View' : activeSiteProfile.systemCategory}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Compliance Rating</span>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{complianceMetrics.healthScore}% Compliant</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">0 Statutory Violations</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Next Mandatory Deadline</span>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{complianceMetrics.nextMilestone?.eventDate || '2026-09-08'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
              {complianceMetrics.nextMilestone ? `${complianceMetrics.nextMilestone.daysOffset} days remaining` : 'On Schedule'}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded border border-slate-700/60">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Annual Device Coverage</span>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              {selectedSiteId === 'all' ? '65%' : `${activeSiteProfile.quarterlyProgressCurrentYear.cumulativeCoverage}% / 100%`}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {selectedSiteId === 'all' ? 'Across All Loops' : `Q1 & Q2 Complete • Q3 Scheduled`}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SITE SELECTION TABS & VIEW MODE SWITCHER                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-200 space-y-4">
        
        {/* Site Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1 whitespace-nowrap mr-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            Facility:
          </span>

          <button
            onClick={() => setSelectedSiteId('all')}
            className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedSiteId === 'all'
                ? 'bg-[#0A192F] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Client Sites (5)
          </button>

          {SITE_COMPLIANCE_PROFILES.map(site => {
            const isSelected = selectedSiteId === site.siteId;
            return (
              <button
                key={site.siteId}
                onClick={() => setSelectedSiteId(site.siteId)}
                className={`px-3 py-1.5 rounded-sm font-mono text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#CC0000] text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{site.siteName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {site.complianceRatingScore}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Site Technical Snapshot Banner (when single site selected) */}
        {selectedSiteId !== 'all' && (
          <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div>
                <span className="text-slate-600 uppercase font-mono text-[10px] block">CIE Panel &amp; Loops</span>
                <span className="font-bold text-slate-900 font-mono block mt-0.5">{activeSiteProfile.panelMakeModel}</span>
                <span className="text-slate-600 text-[11px] block">{activeSiteProfile.installedLoopsZones}</span>
              </div>
              <div>
                <span className="text-slate-600 uppercase font-mono text-[10px] block">Addressable Sensors</span>
                <span className="font-bold text-slate-900 font-mono block mt-0.5">{activeSiteProfile.totalDetectorsCount} Detectors</span>
                <span className="text-slate-600 text-[11px] block">{activeSiteProfile.totalCallPointsCount} MCPs • {activeSiteProfile.totalSoundersCount} Sounders</span>
              </div>
              <div>
                <span className="text-slate-600 uppercase font-mono text-[10px] block">Last Annual COC</span>
                <span className="font-bold text-emerald-700 font-mono block mt-0.5">{activeSiteProfile.lastAnnualCOCDate}</span>
                <span className="text-slate-600 text-[11px] block">{activeSiteProfile.lastAnnualCOCNumber}</span>
              </div>
              <div>
                <span className="text-slate-600 uppercase font-mono text-[10px] block">Next Annual COC Expiry</span>
                <span className="font-bold text-red-700 font-mono block mt-0.5">{activeSiteProfile.nextAnnualCOCDueDate}</span>
                <span className="text-amber-700 text-[11px] block font-medium">Statutory Renewal Mandatory</span>
              </div>
            </div>

            {/* Standby SLA Battery Health Indicator */}
            <div className="bg-white p-3 rounded border border-slate-200 md:w-56 shrink-0 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-600 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                  SLA Battery Bank
                </span>
                <span className="font-bold text-emerald-700">{activeSiteProfile.fiveYearComponentHealth.batteryHealthPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${activeSiteProfile.fiveYearComponentHealth.batteryHealthPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-600 block">
                Renewal Due: {activeSiteProfile.fiveYearComponentHealth.batteryBankReplacementDueDate}
              </span>
            </div>
          </div>
        )}

        {/* View Mode Switcher & Filter Controls Toolbar */}
        <div className="pt-2 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main View Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTimelineViewMode('rail')}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                timelineViewMode === 'rail'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#CC0000]" />
              <span>Milestone Rail</span>
            </button>

            <button
              onClick={() => setTimelineViewMode('quarterly_cycle')}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                timelineViewMode === 'quarterly_cycle'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>4-Quarter Rotation Cycle</span>
            </button>

            <button
              onClick={() => setTimelineViewMode('five_year_horizon')}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                timelineViewMode === 'five_year_horizon'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>5-Year Component Horizon</span>
            </button>

            <button
              onClick={() => setTimelineViewMode('ledger_table')}
              className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                timelineViewMode === 'ledger_table'
                  ? 'bg-white text-[#0A192F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              <span>Statutory Ledger</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Horizon Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm text-xs font-mono">
              <button
                onClick={() => setTimeHorizonFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  timeHorizonFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({filteredMilestones.length})
              </button>
              <button
                onClick={() => setTimeHorizonFilter('upcoming')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  timeHorizonFilter === 'upcoming' ? 'bg-[#CC0000] text-white' : 'text-slate-600'
                }`}
              >
                Upcoming Deadlines ({upcomingMilestones.length})
              </button>
              <button
                onClick={() => setTimeHorizonFilter('historical')}
                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  timeHorizonFilter === 'historical' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Completed History ({historicalMilestones.length})
              </button>
            </div>

            {/* Cycle Type Filter */}
            <select
              value={cycleTypeFilter}
              onChange={e => setCycleTypeFilter(e.target.value)}
              className="text-xs font-mono font-medium border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:border-[#CC0000]"
            >
              <option value="all">All Cycle Types</option>
              <option value="annual_comprehensive">Annual Comprehensive (Clause 25.5)</option>
              <option value="quarterly_servicing">Quarterly 25% (Clause 25.3)</option>
              <option value="biannual_servicing">6-Monthly Servicing (Clause 25.4)</option>
              <option value="weekly_user_test">Weekly User Test (Clause 25.2)</option>
              <option value="five_year_overhaul">5-Year Overhaul (Clause 25.5.3)</option>
              <option value="fault_remediation">Fault Rectification (Clause 26)</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search milestones..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs font-mono focus:outline-hidden focus:border-[#CC0000] w-36 sm:w-44"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: CHRONOLOGICAL TIMELINE MILESTONE RAIL           */}
      {/* ------------------------------------------------------------- */}
      {timelineViewMode === 'rail' && (
        <div className="space-y-8">
          
          {/* Section 1: UPCOMING INSPECTION DEADLINES (Descending to Today) */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                    <span>Upcoming Statutory Deadlines &amp; Scheduled Services</span>
                    <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      {upcomingMilestones.length} Pending
                    </span>
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Mandatory SANS 10139 maintenance events scheduled or due for technical compliance
                  </p>
                </div>
              </div>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 font-mono">All Statutory Cycles Up-To-Date</h3>
                <p className="text-slate-500 text-xs mt-1">
                  No upcoming deadlines match your active filter. Use the schedule button above to book the next periodic service.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-blue-400 before:to-[#0A192F]">
                {upcomingMilestones.map((milestone) => {
                  const cycleMeta = getCycleTypeMeta(milestone.cycleType);
                  const isNear = (milestone.daysOffset ?? 999) <= 14;
                  const isToday = milestone.daysOffset === 0;

                  return (
                    <div 
                      key={milestone.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      {/* Timeline Node Icon */}
                      <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-110 ${
                        isToday 
                          ? 'bg-purple-600 border-white text-white animate-pulse'
                          : isNear
                          ? 'bg-red-600 border-white text-white'
                          : 'bg-amber-500 border-white text-white'
                      }`}>
                        {isToday ? (
                          <Activity className="w-3 h-3" />
                        ) : isNear ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div className={`p-4 sm:p-5 rounded-sm border transition-all hover:shadow-md ${
                        isToday
                          ? 'bg-purple-50/50 border-purple-300'
                          : isNear
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${cycleMeta.badgeBg} ${cycleMeta.badgeText} ${cycleMeta.borderClass}`}>
                              {cycleMeta.shortLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800">
                              {milestone.standardClause}
                            </span>
                            {milestone.deviceSamplingPercentage && (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                                {milestone.deviceSamplingPercentage}% Device Scope
                              </span>
                            )}
                          </div>

                          {/* Countdown Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                              isToday
                                ? 'bg-purple-600 text-white'
                                : isNear
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              <CalendarIcon className="w-3 h-3" />
                              <span>{milestone.eventDate}</span>
                              <span className="opacity-80">
                                ({isToday ? 'TODAY' : `in ${milestone.daysOffset} days`})
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Scope */}
                        <div className="mt-2.5 space-y-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono group-hover:text-[#CC0000] transition-colors">
                            {milestone.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {milestone.testingScopeSummary}
                          </p>
                        </div>

                        {/* Technical Metadata Footer */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-4 text-slate-600">
                            <span className="flex items-center gap-1 font-mono">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-800">{milestone.siteName}</strong>
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <UserCheckIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{milestone.assignedTechnician.name}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1 rounded">
                                {milestone.assignedTechnician.saqccNumber}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMilestone(milestone);
                              }}
                              className="text-xs font-mono font-bold text-[#CC0000] hover:text-[#A30000] flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Scope &amp; Checklist</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PRESENT DATE ANCHOR PIN */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-[#0A192F]/40"></div>
            </div>
            <div className="relative z-10 bg-[#0A192F] text-white px-5 py-2 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2 border border-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>CURRENT CALENDAR DATE: SEPTEMBER 2026</span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-300">Live Statutory Tracker</span>
            </div>
          </div>

          {/* Section 2: HISTORICAL MAINTENANCE CYCLES (Completed Archives) */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                    <span>Historical Maintenance Records &amp; Certified Cycles</span>
                    <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      {historicalMilestones.length} Certified Logs
                    </span>
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Completed inspections with SAQCC technician credentials, acoustic dBA test records, and issued SANS certificates
                  </p>
                </div>
              </div>
            </div>

            {historicalMilestones.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded border border-dashed border-slate-200">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700 font-mono">No Historical Cycles Found</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Try adjusting the search filter or facility selection.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-400">
                {historicalMilestones.map((milestone) => {
                  const cycleMeta = getCycleTypeMeta(milestone.cycleType);

                  return (
                    <div 
                      key={milestone.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      {/* Timeline Node Icon (Completed Green Check) */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                        <CheckCircle className="w-3 h-3" />
                      </div>

                      {/* Milestone Card */}
                      <div className="p-4 sm:p-5 rounded-sm border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all hover:shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${cycleMeta.badgeBg} ${cycleMeta.badgeText} ${cycleMeta.borderClass}`}>
                              {cycleMeta.shortLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800">
                              {milestone.standardClause}
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              PASS • 0 Active Defects
                            </span>
                          </div>

                          {/* Completion Date & Cert Badge */}
                          <div className="flex items-center gap-2">
                            {milestone.certificateNumber && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingCertificateMilestone(milestone);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-black text-amber-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{milestone.certificateNumber}</span>
                              </button>
                            )}
                            <span className="text-xs font-mono text-slate-500 font-medium">
                              {milestone.eventDate}
                            </span>
                          </div>
                        </div>

                        {/* Title & Summary */}
                        <div className="mt-2.5 space-y-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono group-hover:text-emerald-700 transition-colors">
                            {milestone.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {milestone.testingScopeSummary}
                          </p>
                        </div>

                        {/* Technical Evidence Tag Matrix */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded border border-slate-100">
                          <div>
                            <span className="text-slate-600 block text-[10px] uppercase">Tested Devices</span>
                            <span className="font-bold text-slate-900">
                              {milestone.deviceTestedCount || 1} / {milestone.totalSystemDeviceCount || 100} units
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[10px] uppercase">Sounder Decibels</span>
                            <span className="font-bold text-emerald-800">
                              {milestone.sounderDecibelReading || '82 dBA baseline'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[10px] uppercase">Standby Battery</span>
                            <span className="font-bold text-slate-900 truncate">
                              {milestone.batteryStandbyVoltage || '27.4V Normal'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[10px] uppercase">Lead Signatory</span>
                            <span className="font-bold text-slate-900 truncate">
                              {milestone.assignedTechnician.name}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-mono flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{milestone.siteName}</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMilestone(milestone);
                            }}
                            className="font-mono font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <span>Inspect Full Evidence &amp; Logbook</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: 4-QUARTER ANNUAL ROTATION CYCLE (Clause 25.3)    */}
      {/* ------------------------------------------------------------- */}
      {timelineViewMode === 'quarterly_cycle' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>SANS 10139 4-Quarter Annual Rotation Cycle (12-Month Coverage)</span>
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Clause 25.3 specifies testing at least 25% of all installed sensors every quarter so that 100% of all devices are tested annually before COC renewal.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded text-xs font-mono text-blue-900 font-bold flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Current Cycle Coverage: {activeSiteProfile.quarterlyProgressCurrentYear.cumulativeCoverage}% / 100%</span>
              </div>
            </div>

            {/* 4 Quarters Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Q1 Box */}
              <div className="p-4 rounded-sm border-2 border-emerald-300 bg-emerald-50/40 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-600 text-white">
                    Q1 (Jan - Mar)
                  </span>
                  <span className="text-emerald-700 font-mono text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    25% Completed
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">Quarterly Periodic Servicing</h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Loop 1 optical sensors, manual call points, and standby battery load test.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Date: <strong className="text-slate-900">2026-02-18</strong></div>
                  <div>Cert: <strong className="text-emerald-800">SANS-Q1-2026-018</strong></div>
                  <div>Technician: <strong className="text-slate-800">Thabo Mokoena (L3)</strong></div>
                </div>
              </div>

              {/* Q2 Box */}
              <div className="p-4 rounded-sm border-2 border-emerald-300 bg-emerald-50/40 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-600 text-white">
                    Q2 (Apr - Jun)
                  </span>
                  <span className="text-emerald-700 font-mono text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    50% Cumulative
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">Quarterly Periodic Servicing</h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Loop 2 loading bays, magnetic door holders, and sounder acoustic verification.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Date: <strong className="text-slate-900">2026-05-20</strong></div>
                  <div>Cert: <strong className="text-emerald-800">SANS-Q2-2026-044</strong></div>
                  <div>Technician: <strong className="text-slate-800">Thabo Mokoena (L3)</strong></div>
                </div>
              </div>

              {/* Q3 Box */}
              <div className="p-4 rounded-sm border-2 border-blue-400 bg-blue-50/50 space-y-3 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-600 text-white">
                    Q3 (Jul - Sep)
                  </span>
                  <span className="text-blue-800 font-mono text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    75% Target (Scheduled)
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">Quarterly Periodic Servicing</h4>
                  <p className="text-slate-600 text-xs mt-1">
                    Loop 3 admin suites, battery charging station, and HVAC interlock verification.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Scheduled: <strong className="text-blue-900">2026-09-08</strong></div>
                  <div>Status: <strong className="text-blue-800">Confirmed with Site Safety</strong></div>
                  <div>Lead Tech: <strong className="text-slate-800">Bethuel Moukangwe (L4)</strong></div>
                </div>
              </div>

              {/* Q4 Box */}
              <div className="p-4 rounded-sm border-2 border-red-300 bg-red-50/40 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#CC0000] text-white">
                    Q4 (Oct - Dec)
                  </span>
                  <span className="text-red-700 font-mono text-xs font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    100% COC Renewal
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-mono text-sm">Annual Comprehensive Audit</h4>
                  <p className="text-slate-600 text-xs mt-1">
                    100% full device audit, 30-min battery load test, Pr.Eng statutory COC re-certification.
                  </p>
                </div>
                <div className="pt-2 border-t border-red-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Target Date: <strong className="text-red-900">2026-11-14</strong></div>
                  <div>Requirement: <strong className="text-red-800">Statutory Pr.Eng COC</strong></div>
                  <div>Scope: <strong className="text-slate-800">Full System &amp; Cause &amp; Effect</strong></div>
                </div>
              </div>

            </div>

            {/* Explanatory Guidance Banner */}
            <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold font-mono text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#CC0000]" />
                <span>Why is the 4-Quarter Rotation Mandatory under SANS 10139?</span>
              </h4>
              <p className="leading-relaxed">
                Fire alarm sensors in South Africa operate under varying environmental loads (dust, seasonal temperature swings, thunderstorms). SANS 10139 Clause 25.3 establishes that every building must maintain a progressive sampling log so that all detectors are tested at least once every 12 months. Skipping quarters creates a statutory compliance violation under the Occupational Health and Safety Act (OHS Act).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 3: 5-YEAR COMPONENT & LIFECYCLE HORIZON            */}
      {/* ------------------------------------------------------------- */}
      {timelineViewMode === 'five_year_horizon' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>5-Year Equipment Lifespan &amp; Overhaul Horizon (Clause 25.5.3)</span>
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Long-term statutory component refresh cycles for batteries, optical detector chambers, and fire-resistant cabling.
                </p>
              </div>

              <span className="px-3 py-1 rounded bg-purple-100 text-purple-900 font-mono text-xs font-bold">
                Equipment Horizon: 2026 – 2031
              </span>
            </div>

            {/* Component Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Battery Replacement Card */}
              <div className="p-5 rounded-sm border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="w-10 h-10 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm">Sealed Lead Acid (SLA) Battery Bank</h3>
                  <span className="text-[11px] font-mono text-slate-500">4-Year Maximum Service Life</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standby batteries lose internal plate chemistry after 4-5 years. SANS 10139 requires statutory replacement to ensure 24-hour backup under power grid failure.
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commissioned:</span>
                    <span className="font-bold text-slate-800">{activeSiteProfile.fiveYearComponentHealth.batteryBankInstalledDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replacement Deadline:</span>
                    <span className="font-bold text-red-700">{activeSiteProfile.fiveYearComponentHealth.batteryBankReplacementDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Condition:</span>
                    <span className="font-bold text-emerald-700">{activeSiteProfile.fiveYearComponentHealth.batteryHealthPercent}% Health</span>
                  </div>
                </div>
              </div>

              {/* Optical Smoke Detector Recalibration Card */}
              <div className="p-5 rounded-sm border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="w-10 h-10 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm">Optical Chamber Sensitivity Recalibration</h3>
                  <span className="text-[11px] font-mono text-slate-500">5-Year Contamination Threshold</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Airborne particulates gradually accumulate in the optical labyrinth. Detectors require chamber cleaning or head replacement to prevent false alarm drift.
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Detectors:</span>
                    <span className="font-bold text-slate-800">{activeSiteProfile.totalDetectorsCount} Heads</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Audit Deadline:</span>
                    <span className="font-bold text-amber-700">{activeSiteProfile.fiveYearComponentHealth.opticalChamberRecalibrationDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drift Compensation:</span>
                    <span className="font-bold text-emerald-700">Active on CIE Panel</span>
                  </div>
                </div>
              </div>

              {/* 500V Cable Megger Insulation Test Card */}
              <div className="p-5 rounded-sm border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="w-10 h-10 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm">Fire-Rated Cabling 500V Insulation Test</h3>
                  <span className="text-[11px] font-mono text-slate-500">5-Year Dielectric Integrity</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  500V DC Megger insulation resistance testing between core-to-core and core-to-earth shielding (minimum 2.0 MΩ required under SANS 10139 Clause 25.5).
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Installed Cable:</span>
                    <span className="font-bold text-slate-800">PH30 Fire-Rated Red</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Megger Test:</span>
                    <span className="font-bold text-purple-700">{activeSiteProfile.fiveYearComponentHealth.cablingMeggerTestDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Reading:</span>
                    <span className="font-bold text-emerald-700">19.8 MΩ (Pass)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 4: STATUTORY LEDGER TABLE VIEW                     */}
      {/* ------------------------------------------------------------- */}
      {timelineViewMode === 'ledger_table' && (
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-mono">
                SANS 10139 Official Statutory Maintenance Ledger
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Full chronological ledger for official fire safety logbook archiving
              </p>
            </div>
            <button
              onClick={handlePrintTimeline}
              className="inline-flex items-center gap-1.5 bg-[#0A192F] hover:bg-slate-800 text-white px-3.5 py-2 rounded-sm font-mono text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Facility / Site</th>
                  <th className="py-3 px-4">SANS Clause &amp; Cycle</th>
                  <th className="py-3 px-4">Scope &amp; Findings</th>
                  <th className="py-3 px-4">Technician (SAQCC)</th>
                  <th className="py-3 px-4">Certificate / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredMilestones.map((milestone) => {
                  const cycleMeta = getCycleTypeMeta(milestone.cycleType);
                  const statusMeta = getStatusBadge(milestone.status);

                  return (
                    <tr 
                      key={milestone.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {milestone.eventDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{milestone.siteName}</div>
                        <div className="text-[10px] text-slate-500">{milestone.systemCategory}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cycleMeta.badgeBg} ${cycleMeta.badgeText} ${cycleMeta.borderClass}`}>
                          {cycleMeta.shortLabel}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{milestone.standardClause}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs font-sans text-xs text-slate-700">
                        <p className="line-clamp-2">{milestone.testingScopeSummary}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{milestone.assignedTechnician.name}</div>
                        <div className="text-[10px] text-slate-500">{milestone.assignedTechnician.saqccNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {milestone.certificateNumber ? (
                          <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {milestone.certificateNumber}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
                            {statusMeta.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMilestone(milestone);
                          }}
                          className="text-[#CC0000] hover:text-[#A30000] font-bold text-xs"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MILESTONE DETAIL MODAL / DRAWER                               */}
      {/* ------------------------------------------------------------- */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl border-t-4 border-[#CC0000] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#0A192F] text-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CC0000] text-white uppercase">
                    {getCycleTypeMeta(selectedMilestone.cycleType).shortLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {selectedMilestone.standardClause}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-white mt-1">
                  {selectedMilestone.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Site: {selectedMilestone.siteName} • {selectedMilestone.eventDate}
                </p>
              </div>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              
              {/* Scope & Description */}
              <div className="space-y-2">
                <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Testing Scope &amp; Statutory Protocol</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200">
                  {selectedMilestone.testingScopeSummary}
                </p>
              </div>

              {/* Technical Measurements Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Technical Audit Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                    <span className="text-slate-500 text-[10px] block">Devices Tested</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedMilestone.deviceTestedCount || 1} units
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {selectedMilestone.testedZonesOrLoops || 'All Active Zones'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                    <span className="text-slate-500 text-[10px] block">Sounder Audibility</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {selectedMilestone.sounderDecibelReading || '82 dBA baseline'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">Passes SANS 65 dBA</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                    <span className="text-slate-500 text-[10px] block">Standby Power Load</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedMilestone.batteryStandbyVoltage || '27.4V Normal'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Secondary SLA Supply</span>
                  </div>
                </div>
              </div>

              {/* Assigned Technician & Credentials */}
              <div className="p-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white font-mono ${selectedMilestone.assignedTechnician.avatarColor || 'bg-red-600'}`}>
                    {selectedMilestone.assignedTechnician.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 font-mono">{selectedMilestone.assignedTechnician.name}</h5>
                    <p className="text-[11px] text-slate-500">{selectedMilestone.assignedTechnician.role}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
                      {selectedMilestone.assignedTechnician.saqccNumber} • {selectedMilestone.assignedTechnician.saqccLevel}
                    </span>
                  </div>
                </div>

                {selectedMilestone.certificateNumber && (
                  <button
                    onClick={() => {
                      setViewingCertificateMilestone(selectedMilestone);
                    }}
                    className="px-3 py-2 bg-[#0A192F] hover:bg-black text-amber-300 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>View SANS Certificate</span>
                  </button>
                )}
              </div>

              {/* Findings & Notes */}
              {selectedMilestone.findingsSummary && (
                <div className="space-y-1">
                  <h4 className="font-bold font-mono text-slate-900 uppercase text-[11px]">Inspection Findings &amp; Logbook Entry</h4>
                  <p className="text-slate-700 bg-emerald-50/50 p-3 rounded border border-emerald-200">
                    {selectedMilestone.findingsSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Logbook Status: <strong className="text-emerald-700">{selectedMilestone.logbookSigned ? 'Signed & Authenticated' : 'Pending Attendance'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LOG ROUTINE WEEKLY USER TEST (Clause 25.2)             */}
      {/* ------------------------------------------------------------- */}
      {isLogWeeklyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl border-t-4 border-emerald-600 overflow-hidden">
            <div className="p-6 bg-[#0A192F] text-white flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white uppercase">
                  SANS 10139 Clause 25.2
                </span>
                <h3 className="text-lg font-bold font-mono text-white mt-1">
                  Log Routine Weekly Sounder &amp; Call Point Test
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandatory weekly test conducted by the client's designated Responsible Person
                </p>
              </div>
              <button
                onClick={() => setIsLogWeeklyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeeklyTest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-slate-700 mb-1">Select Facility Site</label>
                <select
                  value={weeklyTestSiteId}
                  onChange={e => setWeeklyTestSiteId(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs focus:outline-hidden focus:border-emerald-600"
                >
                  {SITE_COMPLIANCE_PROFILES.map(site => (
                    <option key={site.siteId} value={site.siteId}>
                      {site.siteName} ({site.panelMakeModel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-slate-700 mb-1">Manual Call Point (MCP) ID</label>
                  <input
                    type="text"
                    required
                    value={weeklyCallPointId}
                    onChange={e => setWeeklyCallPointId(e.target.value)}
                    placeholder="e.g. MCP-04"
                    className="w-full border border-slate-300 rounded p-2 font-mono text-xs focus:outline-hidden focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500">Rotate weekly across different units</span>
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 mb-1">Zone / Area Location</label>
                  <input
                    type="text"
                    required
                    value={weeklyZoneNumber}
                    onChange={e => setWeeklyZoneNumber(e.target.value)}
                    placeholder="e.g. Zone 2 - Loading Bay"
                    className="w-full border border-slate-300 rounded p-2 font-mono text-xs focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-mono font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={weeklyAudibleConfirmed}
                    onChange={e => setWeeklyAudibleConfirmed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Audible alarm broadcast verified throughout zone (&gt;65 dBA)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-mono font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={weeklyResetConfirmed}
                    onChange={e => setWeeklyResetConfirmed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>CIE Fire Panel reset to clear normal condition without faults</span>
                </label>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 mb-1">Test Notes &amp; Observations</label>
                <textarea
                  rows={2}
                  value={weeklyNotes}
                  onChange={e => setWeeklyNotes(e.target.value)}
                  placeholder="e.g. Call point reset key functional. Alarm sounded in <2s."
                  className="w-full border border-slate-300 rounded p-2 font-mono text-xs focus:outline-hidden focus:border-emerald-600"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogWeeklyModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Authenticate &amp; Log Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SANS 10139 STANDARD REFERENCE MODAL                           */}
      {/* ------------------------------------------------------------- */}
      {isSANSInfoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl border-t-4 border-[#CC0000] overflow-hidden">
            <div className="p-6 bg-[#0A192F] text-white flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CC0000] text-white uppercase">
                  Statutory Reference Guide
                </span>
                <h3 className="text-lg font-bold font-mono text-white mt-1">
                  SANS 10139:2012 Maintenance Obligations
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  South African National Standard: Fire detection and alarm systems for buildings
                </p>
              </div>
              <button
                onClick={() => setIsSANSInfoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <h4 className="font-bold font-mono text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Clause 25.2: Weekly User Testing</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  The client Responsible Person shall operate a different manual call point (MCP) or sensor each week during normal working hours to confirm sounder audibility and CIE reset operation.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <h4 className="font-bold font-mono text-slate-900 text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Clause 25.3: Quarterly Periodic Servicing (3-Monthly)</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  A registered SAQCC technician shall test at least 25% of all installed sensors on rotation, examine standby battery float and load voltages, verify alarm signal transmission to monitoring stations, and check fire door releases.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <h4 className="font-bold font-mono text-slate-900 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#CC0000]" />
                  <span>Clause 25.5: Annual Comprehensive Servicing &amp; COC Re-Certification</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Every 12 months, 100% of all detectors, manual call points, sounders, interface relays, and standby battery full discharge capacities must be tested. An official SANS 10139 Certificate of Inspection is issued to satisfy municipal fire bylaws and insurance requirements.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <h4 className="font-bold font-mono text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Clause 25.5.3: 5-Year Major Overhaul &amp; Component Refresh</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Mandatory replacement of sealed lead acid battery banks (4-5 year service life limit), optical smoke chamber sensitivity recalibration, and 500V DC cable insulation resistance testing.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsSANSInfoModalOpen(false)}
                className="px-4 py-2 bg-[#0A192F] text-white font-mono text-xs font-bold rounded cursor-pointer"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CERTIFICATE VIEWER MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {viewingCertificateMilestone && (
        <COCCertificateViewerModal
          isOpen={!!viewingCertificateMilestone}
          onClose={() => setViewingCertificateMilestone(null)}
          certificateData={{
            certificateNumber: viewingCertificateMilestone.certificateNumber || 'SANS-COC-2026-001',
            issueDate: viewingCertificateMilestone.eventDate,
            siteName: viewingCertificateMilestone.siteName,
            buildingAddress: viewingCertificateMilestone.streetAddress,
            city: viewingCertificateMilestone.city,
            organisationName: viewingCertificateMilestone.organisationName,
            systemCategory: viewingCertificateMilestone.systemCategory,
            panelMakeModel: viewingCertificateMilestone.panelMakeModel,
            leadTechnicianName: viewingCertificateMilestone.assignedTechnician.name,
            saqccNumber: viewingCertificateMilestone.assignedTechnician.saqccNumber,
            saqccLevel: viewingCertificateMilestone.assignedTechnician.saqccLevel,
            ecsaEngineerName: viewingCertificateMilestone.ecsaEngineerEndorsement || 'Bethuel Moukangwe (ECSA Pr.Eng #201490219)',
            deviceCounts: {
              smokeDetectors: viewingCertificateMilestone.deviceTestedCount || 184,
              callPoints: 28,
              sounders: 22,
              interfaces: 8
            },
            batteryVolts: viewingCertificateMilestone.batteryStandbyVoltage || '27.4V Float / 24.3V Under Alarm Load',
            decibelReading: viewingCertificateMilestone.sounderDecibelReading || '84.2 dBA Average',
            insulationResistance: viewingCertificateMilestone.insulationResistance || '19.8 MΩ'
          }}
        />
      )}

      {/* SCHEDULE INSPECTION MODAL */}
      <ScheduleInspectionModal />
    </div>
  );
};

// Helper Icon for Legal / Statutory Scales
function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
