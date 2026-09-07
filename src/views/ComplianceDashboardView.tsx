import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Bell,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity,
  Flame,
  Wrench,
  Sparkles,
  MapPin,
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { ClientSiteMaintenanceProfile } from '../types/serviceDue';
import { QuarterlyInspectionProgressBar } from '../components/compliance/QuarterlyInspectionProgressBar';
import { FloorPlanBlueprintViewer } from '../components/compliance/FloorPlanBlueprintViewer';
import { generateMaintenanceCheckReportPdf } from '../utils/maintenanceReportPdfGenerator';
import { STANDARD_SANS_REQUIREMENT_CHECKS } from '../services/remedialActionService';

export const ComplianceDashboardView: React.FC = () => {
  const {
    showToast,
    setIsPushCenterOpen,
    setActiveView
  } = useApp();

  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<'all' | 'overdue' | 'urgent' | 'healthy'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute aggregate statistics from real profiles
  const totalSites = CLIENT_SITE_MAINTENANCE_PROFILES.length;
  const averageComplianceScore = Math.round(
    CLIENT_SITE_MAINTENANCE_PROFILES.reduce((acc, s) => acc + s.overallComplianceScore, 0) / totalSites
  );
  const totalMonitoredDevices = CLIENT_SITE_MAINTENANCE_PROFILES.reduce((acc, s) => acc + s.deviceCount, 0);

  // Overdue and upcoming alerts
  const overdueSites = CLIENT_SITE_MAINTENANCE_PROFILES.filter(s => s.earliestDueDays < 0);
  const urgentSites = CLIENT_SITE_MAINTENANCE_PROFILES.filter(s => s.earliestDueDays >= 0 && s.earliestDueDays <= 7);
  const compliantSites = CLIENT_SITE_MAINTENANCE_PROFILES.filter(s => s.earliestDueDays > 7);

  const filteredSites = CLIENT_SITE_MAINTENANCE_PROFILES.filter(site => {
    if (selectedUrgencyFilter === 'overdue') return site.earliestDueDays < 0;
    if (selectedUrgencyFilter === 'urgent') return site.earliestDueDays >= 0 && site.earliestDueDays <= 7;
    if (selectedUrgencyFilter === 'healthy') return site.earliestDueDays > 7;
    return true;
  });

  const handleExportSamplePdf = async (site: ClientSiteMaintenanceProfile) => {
    setIsExportingPdf(true);
    try {
      showToast('info', 'Generating SANS 10139 PDF', `Compiling statutory inspection report for ${site.siteName}...`);
      const reportRef = `AUD-SANS-${site.shortName.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-6)}`;
      const formattedDate = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });

      const doc = generateMaintenanceCheckReportPdf({
        reportRef,
        auditDate: formattedDate,
        checkType: 'quarterly',
        siteProfile: site,
        technicianName: 'Bethuel Moukangwe',
        saqccNumber: 'SAQCC-1475-DGS (Master Practitioner)',
        checklist: STANDARD_SANS_REQUIREMENT_CHECKS,
        siteManagerSignature: {
          signatureDataUrl: '',
          signeeName: site.contactPerson || 'Site Safety Officer',
          signeeTitle: 'Facilities & Safety Director',
          timestamp: new Date().toISOString()
        }
      });

      const filename = `Audrin-Fire_SANS10139_ComplianceReport_${site.siteId}_${Date.now()}.pdf`;
      doc.save(filename);
      showToast('success', 'PDF Export Complete', `Report downloaded: ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'PDF Error', 'Failed to generate SANS 10139 PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-[#050D1A] min-h-screen text-slate-100 pb-16 font-sans">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#0A192F] border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#CC0000]/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Statutory Regulatory Portal
              </span>
              <span className="text-slate-400 text-xs font-mono">
                SANS 10139:2012 / SANS 10400 Part T
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#FFB703]" />
              <span>SANS 10139 Compliance Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized oversight of commercial fire system readiness, statutory routine inspection progress, overdue alerts, and engineering KPIs.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsPushCenterOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Notification Watchdog</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('customer-portal')}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#CC0000] hover:bg-red-700 text-white transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Site Maintenance Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        
        {/* SECTION 1: Overall Site Readiness Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Readiness Index */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Overall Site Readiness</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {averageComplianceScore}%
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Across {totalSites} commercial client sites</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${averageComplianceScore}%` }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Card 2: Overdue Inspection Alerts */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Overdue SLA Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black font-mono text-rose-400">
              {overdueSites.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Statutory attendance deadline lapsed
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Immediate SAQCC dispatch mandated</span>
            </div>
          </div>

          {/* Card 3: Monitored Fire Assets */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Total Addressable Assets</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-400">
              {totalMonitoredDevices.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Detectors, MCPs, sounders & loops
            </div>
            <div className="mt-3 text-[10px] font-mono text-slate-400">
              100% addressable registry mapped
            </div>
          </div>

          {/* Card 4: SAQCC Coverage */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">SAQCC Tech Verification</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black font-mono text-blue-400">
              100%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Registered competent persons on record
            </div>
            <div className="mt-3 text-[10px] font-mono text-blue-300">
              Bethuel Moukangwe (SAQCC #48291)
            </div>
          </div>
        </div>

        {/* SECTION 2: Recharts Visual Component for Current Quarter Routine Inspection Progress */}
        <QuarterlyInspectionProgressBar />

        {/* SECTION 3: Overdue Inspection Alerts & Site Readiness Feed */}
        <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                  Active Statutory Compliance Registry
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Site Readiness & Statutory Inspection Overdue Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time statutory status across all registered premises under SANS 10139:2012.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
              {[
                { id: 'all', label: `All (${CLIENT_SITE_MAINTENANCE_PROFILES.length})` },
                { id: 'overdue', label: `Overdue (${overdueSites.length})` },
                { id: 'urgent', label: `Due <= 7d (${urgentSites.length})` },
                { id: 'healthy', label: `Compliant (${compliantSites.length})` }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedUrgencyFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedUrgencyFilter === f.id
                      ? 'bg-[#CC0000] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sites Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site) => {
              const isOverdue = site.earliestDueDays < 0;
              const isUrgent = site.earliestDueDays >= 0 && site.earliestDueDays <= 7;

              return (
                <div
                  key={site.siteId}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                    isOverdue
                      ? 'bg-rose-950/20 border-rose-900/80 shadow-rose-950/30'
                      : isUrgent
                      ? 'bg-amber-950/20 border-amber-900/80 shadow-amber-950/30'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {site.siteId.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {site.siteName}
                        </h4>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {site.clientOrganisation}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                          isOverdue
                            ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                            : isUrgent
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(site.earliestDueDays)}d OVERDUE`
                          : isUrgent
                          ? `DUE IN ${site.earliestDueDays}d`
                          : 'COMPLIANT'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">System Category:</span>
                        <span className="text-right text-[11px]">{site.systemCategory}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Control Panel:</span>
                        <span className="text-right text-[11px] truncate max-w-[170px]">
                          {site.panelModel}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Device Count:</span>
                        <span className="text-right font-bold text-white">
                          {site.deviceCount} Units ({site.loopCount} Loops)
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Compliance Score:</span>
                        <span
                          className={`font-bold ${
                            site.overallComplianceScore >= 85
                              ? 'text-emerald-400'
                              : site.overallComplianceScore >= 70
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {site.overallComplianceScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={() => handleExportSamplePdf(site)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>Export SANS PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('customer-portal')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Inspect Log</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Critical Maintenance KPIs for Commercial Fire Systems */}
        <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Commercial Fire Systems Critical Maintenance KPIs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audrin Fire engineering performance benchmarked against South African National Standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono text-slate-400">Emergency SLA MTTR</div>
              <div className="text-2xl font-black font-mono text-white">1.8 Hours</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Statutory Target: &lt;2.0 Hours (SANS Clause 25.1)
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono text-slate-400">False Alarm Rate</div>
              <div className="text-2xl font-black font-mono text-white">0.32 / 100 dev/yr</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Standard Threshold: &lt;1.0 per 50 detectors
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono text-slate-400">Secondary Battery Float</div>
              <div className="text-2xl font-black font-mono text-white">98.4% Pass</div>
              <div className="text-[10px] text-blue-400 font-mono">
                24h Standby + 30m Alarm Load Verified
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono text-slate-400">Digital CoC Endorsement</div>
              <div className="text-2xl font-black font-mono text-white">100% Signed</div>
              <div className="text-[10px] text-amber-400 font-mono">
                SAQCC Level 3/4 & Responsible Person
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Site-Specific Architectural Floor Plan CAD Blueprint Mapping */}
        <FloorPlanBlueprintViewer />

      </div>
    </div>
  );
};
