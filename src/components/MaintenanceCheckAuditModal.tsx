import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  ArrowRight,
  Clock,
  Building,
  Cpu,
  FileText,
  UserCheck,
  Send,
  Zap,
  Info,
  Download,
  Share2,
  Eraser,
  PenTool
} from 'lucide-react';
import { SANSRequirementItem } from '../types/remedialActions';
import { STANDARD_SANS_REQUIREMENT_CHECKS } from '../services/remedialActionService';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { generateMaintenanceCheckReportPdf } from '../utils/maintenanceReportPdfGenerator';

export const MaintenanceCheckAuditModal: React.FC = () => {
  const {
    isMaintenanceCheckModalOpen,
    setIsMaintenanceCheckModalOpen,
    preselectedSiteForMaintenance,
    setPreselectedSiteForMaintenance,
    generateRemedialTasksFromChecks,
    setIsAssignRemedialModalOpen,
    setSelectedRemedialTaskForAssignment,
    technicians,
    showToast
  } = useApp();

  // Selected site for audit
  const defaultSiteId = preselectedSiteForMaintenance?.siteId || CLIENT_SITE_MAINTENANCE_PROFILES[0]?.siteId || 'site-01';
  const [selectedSiteId, setSelectedSiteId] = useState<string>(defaultSiteId);

  // Maintenance check interval / type
  const [checkType, setCheckType] = useState<'quarterly' | 'biannual' | 'annual' | 'monthly'>('quarterly');

  // Working copy of statutory checklist items
  const [checklist, setChecklist] = useState<SANSRequirementItem[]>(() =>
    STANDARD_SANS_REQUIREMENT_CHECKS.map(item => ({ ...item }))
  );

  // State after generation
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  // Site Manager Signature Capture State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signeeName, setSigneeName] = useState('Dumi Ndlovu');
  const [signeeTitle, setSigneeTitle] = useState('Facilities & Safety Manager');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0A192F';
  }, [canvasRef]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault(); // Prevent scrolling while signing
    }

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  if (!isMaintenanceCheckModalOpen) return null;

  const currentSiteProfile =
    CLIENT_SITE_MAINTENANCE_PROFILES.find(p => p.siteId === selectedSiteId) ||
    CLIENT_SITE_MAINTENANCE_PROFILES[0];

  const failedItems = checklist.filter(c => c.status === 'failed');
  const passedItems = checklist.filter(c => c.status === 'passed');
  const criticalFails = failedItems.filter(c => c.criticality === 'critical');

  const handleStatusChange = (id: string, newStatus: 'passed' | 'failed' | 'untested') => {
    setChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, status: newStatus };
          // If toggled to failed and measured value is empty, provide realistic sample telemetry
          if (newStatus === 'failed' && !updated.measuredValue) {
            if (item.category === 'Power Supply') {
              updated.measuredValue = '10.4V under 3A simulated load (Threshold >= 12.2V)';
              updated.defectNotes = 'Excessive internal impedance; backup autonomy collapsed under test.';
            } else if (item.category === 'Audibility & Visual') {
              updated.measuredValue = '58 dB(A) measured in corridor (Mandatory min: 65 dB(A))';
              updated.defectNotes = 'Sound pressure level below SANS 10139 Clause 16 audibility threshold.';
            } else if (item.category === 'Interlocks & Interfaces') {
              updated.measuredValue = 'Relay open circuit; 0V trip signal';
              updated.defectNotes = 'Smoke damper failed to close upon simulated alarm transmission.';
            } else if (item.category === 'Detection Sampling') {
              updated.measuredValue = 'Response time 28s (Standard limit < 15s)';
              updated.defectNotes = 'Chamber heavily dust-contaminated in warehouse loading bay.';
            } else if (item.category === 'Cabling & Enclosures') {
              updated.measuredValue = 'Plastic ties only across 30m run';
              updated.defectNotes = 'Missing metallic fire-resilient clips over emergency exit.';
            } else {
              updated.measuredValue = 'Non-compliant reading observed';
              updated.defectNotes = 'Statutory maintenance check criteria not satisfied.';
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleUpdateNotes = (id: string, notes: string, measuredVal?: string) => {
    setChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            defectNotes: notes,
            measuredValue: measuredVal !== undefined ? measuredVal : item.measuredValue
          };
        }
        return item;
      })
    );
  };

  const handleAutoGenerateRemedialTasks = () => {
    if (failedItems.length === 0) {
      showToast('info', 'No Failed Requirements', 'All statutory checks are compliant. Mark at least one item as Failed to generate remedial tasks.');
      return;
    }

    const newTasks = generateRemedialTasksFromChecks(
      {
        siteId: currentSiteProfile.siteId,
        siteName: currentSiteProfile.siteName,
        clientOrganisation: currentSiteProfile.clientOrganisation,
        panelMakeModel: currentSiteProfile.panelModel,
        locationDetails: currentSiteProfile.address
      },
      checklist,
      preselectedSiteForMaintenance?.inspectionId,
      preselectedSiteForMaintenance?.inspectionTitle || `SANS 10139 ${checkType.toUpperCase()} Maintenance Check`
    );

    setGeneratedCount(newTasks.length);

    // If there's at least one task, open the immediate assignment modal for the first generated task
    if (newTasks.length > 0) {
      setSelectedRemedialTaskForAssignment(newTasks[0]);
    }
  };

  const handleOpenAssignModalForTask = () => {
    setIsMaintenanceCheckModalOpen(false);
    setIsAssignRemedialModalOpen(true);
  };

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      const leadTech = technicians[0] || { name: 'Bethuel Thipe', saqccNumber: 'SAQCC-1475-DGS' };
      const reportRef = `AUD-SANS-${currentSiteProfile.shortName.toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const formattedDate = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });

      const doc = generateMaintenanceCheckReportPdf({
        reportRef,
        auditDate: formattedDate,
        checkType,
        siteProfile: currentSiteProfile,
        technicianName: leadTech.name,
        saqccNumber: (leadTech as any).saqccNumber || 'SAQCC-1475-DGS',
        checklist,
        siteManagerSignature: signatureDataUrl
          ? {
              signatureDataUrl,
              signeeName: signeeName || 'Site Responsible Person',
              signeeTitle: signeeTitle || 'Facilities Manager',
              timestamp: new Date().toISOString()
            }
          : undefined
      });

      const filename = `Audrin-Fire_SANS10139_Maintenance_Report_${currentSiteProfile.shortName}_${Date.now()}.pdf`;
      doc.save(filename);
      showToast('success', 'PDF Export Complete', `Generated ${filename} with official SANS 10139 letterhead.`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      showToast('error', 'Export Failed', 'Could not generate maintenance check PDF report.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShareReport = async () => {
    try {
      const summaryText = `SANS 10139 Maintenance Audit Report for ${currentSiteProfile.siteName}\nStatus: ${passedItems.length} Passed, ${failedItems.length} Non-Compliant.\nInspected by Audrin Fire Engineers (SAQCC 1475/D&GS).`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Audrin Fire - SANS 10139 Report (${currentSiteProfile.siteName})`,
          text: summaryText,
          url: window.location.href
        });
        showToast('success', 'Shared Successfully', 'Maintenance check audit summary shared with customer.');
      } else {
        await navigator.clipboard.writeText(`${summaryText}\nAccess Live Portal: ${window.location.href}`);
        showToast('success', 'Report Summary Copied', 'Report details copied to clipboard for instant client dispatch.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showToast('info', 'Share Cancelled', 'Report sharing was not completed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 rounded-sm shadow-2xl max-w-4xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-start justify-between border-b-4 border-[#CC0000]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded-sm flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                STATUTORY MAINTENANCE AUDIT
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                SANS 10139:2012 / SANS 322
              </span>
              <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-sm">
                Live Remedial Generator
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-1 flex items-center gap-2">
              <span>Execute SANS Maintenance Check &amp; Audit</span>
            </h2>
            <p className="text-xs font-mono text-slate-300">
              Record physical test results against SANS requirements. Any failed check automatically generates an actionable Remedial Task for immediate technician dispatch.
            </p>
          </div>

          <button
            onClick={() => {
              setIsMaintenanceCheckModalOpen(false);
              setPreselectedSiteForMaintenance(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs text-slate-700 max-h-[78vh] overflow-y-auto">
          
          {/* Site & Interval Selection Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-sm">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Audited Premises Site:</span>
              </label>
              <select
                value={selectedSiteId}
                onChange={e => setSelectedSiteId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs font-medium focus:outline-none focus:border-[#CC0000]"
              >
                {CLIENT_SITE_MAINTENANCE_PROFILES.map(site => (
                  <option key={site.siteId} value={site.siteId}>
                    {site.siteName} ({site.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Maintenance Frequency:</span>
              </label>
              <select
                value={checkType}
                onChange={e => setCheckType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs font-medium focus:outline-none focus:border-[#CC0000]"
              >
                <option value="quarterly">Quarterly Servicing (Clause 25.3 - 25% Sample)</option>
                <option value="biannual">Bi-Annual Servicing (Clause 25.4 - 50% Sample)</option>
                <option value="annual">Annual Comprehensive COC (Clause 25.5 - 100% Sample)</option>
                <option value="monthly">Monthly Routine Check (Clause 25.2)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Installed Control Equipment:</span>
              </label>
              <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-sm font-mono text-[11px] text-slate-800 font-bold truncate">
                {currentSiteProfile.panelModel}
              </div>
            </div>
          </div>

          {/* Real-Time Failure & Remedial Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-sm border transition-all duration-200 bg-slate-900 text-white border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold text-white ${failedItems.length > 0 ? 'bg-[#CC0000]' : 'bg-emerald-600'}`}>
                {failedItems.length > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-wide">
                    {failedItems.length > 0 ? `${failedItems.length} Statutory Defect(s) Flagged` : 'All Requirements Passed / Compliant'}
                  </span>
                  {criticalFails.length > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-sm animate-pulse">
                      {criticalFails.length} CRITICAL SLA (24h)
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-slate-300">
                  {failedItems.length > 0
                    ? 'Failed SANS checks will automatically compile into an actionable Remedial Action work order.'
                    : 'Toggle any check to "Failed" to simulate finding an on-site defect.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-auto-generate-remedials"
              onClick={handleAutoGenerateRemedialTasks}
              disabled={failedItems.length === 0}
              className="w-full sm:w-auto px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] disabled:bg-slate-700 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Auto-Generate Remedial Tasks ({failedItems.length})</span>
            </button>
          </div>

          {/* Success Banner if Remedial Tasks were generated */}
          {generatedCount !== null && (
            <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-sm space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-mono font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{generatedCount} Remedial Action Tasks Successfully Generated!</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-sm">
                  Ready for Immediate Tech Assignment
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-sans">
                The statutory defect(s) have been compiled into formal Remedial Action Work Orders with required SAQCC technician accreditation, SLA deadlines, and recommended replacement parts.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenAssignModalForTask}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Assign to Technician Immediately &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* SANS Requirement Checklist Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-2">
                <span>Statutory SANS 10139 Verification Checks</span>
                <span className="text-slate-400 font-normal">({checklist.length} Standard Checkpoints)</span>
              </h3>
              <div className="text-[11px] font-mono text-slate-500">
                <span>Passed: <strong className="text-emerald-600 font-bold">{passedItems.length}</strong></span>
                <span className="mx-2">•</span>
                <span>Failed: <strong className="text-red-600 font-bold">{failedItems.length}</strong></span>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map((item, idx) => {
                const isFailed = item.status === 'failed';
                const isPassed = item.status === 'passed';

                return (
                  <div
                    key={item.id}
                    className={`border rounded-sm p-4 transition-all ${
                      isFailed
                        ? 'border-red-400 bg-red-50/40 shadow-sm'
                        : isPassed
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      {/* Left: Check Information */}
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                            #{idx + 1} • {item.category}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                            {item.clause}
                          </span>
                          {item.criticality === 'critical' ? (
                            <span className="font-mono text-[10px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-sm">
                              CRITICAL HAZARD
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-sm">
                              MAJOR SCOPE
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 text-xs font-sans">
                          {item.description}
                        </p>
                      </div>

                      {/* Right: Pass/Fail Toggle Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'passed')}
                          className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'failed')}
                          className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isFailed
                              ? 'bg-[#CC0000] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-800'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>FAIL DEFECT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'untested')}
                          className={`px-2.5 py-1.5 rounded-sm font-mono text-xs transition-all cursor-pointer ${
                            item.status === 'untested'
                              ? 'bg-slate-300 text-slate-800 font-bold'
                              : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>

                    {/* Expandable Defect Details when FAILED */}
                    {isFailed && (
                      <div className="mt-3 pt-3 border-t border-red-200 space-y-3 bg-red-100/50 p-3 rounded-sm animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-red-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-[#CC0000]" />
                            <span>Defect Telemetry &amp; Statutory Non-Compliance Record</span>
                          </span>
                          <span className="text-[10px] font-mono text-red-800 bg-red-200/80 px-2 py-0.5 rounded-sm font-bold">
                            SLA: {item.defaultRemedialAction.slaHours}h Resolution Window
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-1">
                              Field Measurement / Defect Reading:
                            </label>
                            <input
                              type="text"
                              value={item.measuredValue || ''}
                              onChange={e => handleUpdateNotes(item.id, item.defectNotes || '', e.target.value)}
                              placeholder="e.g. 10.4V under 3A simulated load"
                              className="w-full px-2.5 py-1.5 bg-white border border-red-300 rounded-sm font-mono text-xs text-red-900 focus:outline-none focus:border-[#CC0000]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-1">
                              Engineer Observation &amp; Failure Cause:
                            </label>
                            <input
                              type="text"
                              value={item.defectNotes || ''}
                              onChange={e => handleUpdateNotes(item.id, e.target.value, item.measuredValue)}
                              placeholder="e.g. Battery impedance exceeds limit; cells bulged."
                              className="w-full px-2.5 py-1.5 bg-white border border-red-300 rounded-sm font-sans text-xs text-slate-800 focus:outline-none focus:border-[#CC0000]"
                            />
                          </div>
                        </div>

                        {/* Automatic Remedial Action Blueprint Preview */}
                        <div className="bg-white border border-red-200 p-2.5 rounded-sm text-[11px] font-mono space-y-1">
                          <div className="text-slate-800 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Auto-Remedial Plan:</span> {item.defaultRemedialAction.title}
                          </div>
                          <div className="text-slate-600 text-[10px]">
                            Required Tech: <strong className="text-slate-800">{item.defaultRemedialAction.requiredSaqccLevel}</strong> • Est. Time: {item.defaultRemedialAction.estimatedHours}h • Est. Cost: R {item.defaultRemedialAction.estimatedCostZAR.toLocaleString()}
                          </div>
                          <div className="text-slate-500 text-[10px] flex items-center gap-1 flex-wrap">
                            <span>Recommended Components:</span>
                            {item.defaultRemedialAction.recommendedParts.map((p, pIdx) => (
                              <span key={pIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-sm border border-slate-200">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SANS 10139 Clause 25.3 Site Manager Canvas Signature Sign-Off */}
          <div className="bg-slate-50 border border-slate-300 rounded-sm p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#CC0000]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-[#0A192F]">
                    Site Manager / Responsible Person Direct Screen Sign-Off
                  </h4>
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Mandatory under SANS 10139:2012 Clause 25.3.4. Sign directly on screen using finger, stylus, or cursor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasSignature ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Signature Captured
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-sm">
                    Awaiting On-Screen Signature
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-1">
                  Responsible Person Full Name:
                </label>
                <input
                  type="text"
                  value={signeeName}
                  onChange={e => setSigneeName(e.target.value)}
                  placeholder="e.g. Dumi Ndlovu"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs text-slate-900 focus:outline-none focus:border-[#CC0000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-1">
                  Designation / Role:
                </label>
                <input
                  type="text"
                  value={signeeTitle}
                  onChange={e => setSigneeTitle(e.target.value)}
                  placeholder="e.g. Facilities Manager / Safety Officer"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-sans text-xs text-slate-900 focus:outline-none focus:border-[#CC0000]"
                />
              </div>
            </div>

            {/* Canvas Touch / Mouse Signature Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-600 font-bold">
                  Draw Official Signature in Box Below:
                </span>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="text-[10px] font-mono text-slate-600 hover:text-red-700 flex items-center gap-1 px-2 py-0.5 rounded-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-400 bg-white rounded-sm overflow-hidden relative touch-none select-none">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 sm:h-32 block cursor-crosshair bg-white"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
                    <PenTool className="w-5 h-5 mb-1 text-slate-300 animate-pulse" />
                    <span>Sign with stylus, finger, or mouse</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>SANS 10139 Clause 25.3 / 25.4 statutory audit records are encrypted and appended to safety file.</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
              <button
                type="button"
                onClick={handleShareReport}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                title="Share maintenance audit report summary"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share with Client</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white font-mono font-bold text-xs rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExportingPdf ? 'Exporting...' : 'Export SANS 10139 PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleAutoGenerateRemedialTasks}
                disabled={failedItems.length === 0}
                className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Remedial Tasks ({failedItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMaintenanceCheckModalOpen(false);
                  setPreselectedSiteForMaintenance(null);
                }}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-bold text-xs rounded-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
