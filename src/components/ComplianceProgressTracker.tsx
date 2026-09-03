import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Award,
  Scale,
  Building,
  UserCheck,
  FileText,
  Lock,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  AlertTriangle,
  ArrowRight,
  Radio,
  ExternalLink,
  QrCode
} from 'lucide-react';
import {
  COCApprovalWorkflow,
  COCWorkflowStage,
  COCOverallStatus
} from '../types';
import { cocWorkflowService } from '../services/cocWorkflowService';
import { COCDigitalSignatureModal } from './COCDigitalSignatureModal';
import { COCCertificateViewerModal } from './COCCertificateViewerModal';
import { useApp } from '../context/AppContext';

interface ComplianceProgressTrackerProps {
  serviceRequestId?: string;
  serviceRequestRef?: string;
  siteName?: string;
  buildingAddress?: string;
  organisationName?: string;
  isCompact?: boolean;
}

export const ComplianceProgressTracker: React.FC<ComplianceProgressTrackerProps> = ({
  serviceRequestId,
  serviceRequestRef,
  siteName,
  buildingAddress,
  organisationName,
  isCompact = false
}) => {
  const { showToast, currentUser } = useApp();

  const [workflows, setWorkflows] = useState<COCApprovalWorkflow[]>(() => cocWorkflowService.getAllWorkflows());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  // Sync with service updates
  useEffect(() => {
    const handleUpdate = () => {
      setWorkflows(cocWorkflowService.getAllWorkflows());
    };
    window.addEventListener('coc-workflows-updated', handleUpdate);
    return () => window.removeEventListener('coc-workflows-updated', handleUpdate);
  }, []);

  // Determine current active workflow
  const activeWorkflow = (() => {
    if (selectedWorkflowId) {
      const found = workflows.find(w => w.id === selectedWorkflowId);
      if (found) return found;
    }
    if (serviceRequestId || serviceRequestRef) {
      const found = workflows.find(w => 
        w.serviceRequestId === serviceRequestId || 
        (serviceRequestRef && w.serviceRequestRef === serviceRequestRef)
      );
      if (found) return found;
    }
    return workflows[0];
  })();

  // Set default expanded stage
  useEffect(() => {
    if (activeWorkflow) {
      setExpandedStageId(activeWorkflow.currentStageId);
    }
  }, [activeWorkflow?.id]);

  const handleSignatureSuccess = (updated: COCApprovalWorkflow) => {
    setIsSignatureModalOpen(false);
    setWorkflows(cocWorkflowService.getAllWorkflows());
  };

  const handleSimulateTechSignOff = () => {
    if (!activeWorkflow) return;
    const updated = cocWorkflowService.signOffAsTechnician(activeWorkflow.id, {
      technicianName: 'Tshepo Khumalo',
      saqccNumber: 'SAQCC-FDGS-44912-L3',
      saqccLevel: 'Level 3 - Servicing / Commissioner',
      phone: '071 882 1092',
      panelMakeModel: 'Ziton ZP3 Addressable CIE',
      loopSensorsTestedCount: 142,
      sounderAudibilityDba: 78.5,
      standbyBatteryVoltage: 27.6,
      notes: '100% loop sensors verified. Zero ground faults remaining. Standby batteries certified under load.'
    });
    setWorkflows(cocWorkflowService.getAllWorkflows());
    showToast('success', 'Technician Sign-Off Logged', 'SAQCC Technician sign-off and defect clearance recorded. Advancing to Lead Engineer review.');
  };

  const handleSimulateEngineerEndorsement = () => {
    if (!activeWorkflow) return;
    const updated = cocWorkflowService.endorseAsEngineer(activeWorkflow.id, {
      engineerName: 'Audrin Sibanda',
      ecsaNumber: 'ECSA-2015-810933',
      saqccNumber: 'SAQCC-FDGS-31084-L4',
      endorsementNotes: 'Statutory compliance audit completed. Certified for Category L1 Life Safety.'
    });
    setWorkflows(cocWorkflowService.getAllWorkflows());
    showToast('success', 'ECSA Engineer Endorsed', 'Lead Fire Systems Engineer review completed with digital seal. Awaiting client digital signature.');
  };

  const handleResetDemo = () => {
    cocWorkflowService.resetToInitial();
    setWorkflows(cocWorkflowService.getAllWorkflows());
    showToast('info', 'Demo Workflows Reset', 'Compliance workflow states reset to default demo scenario.');
  };

  if (!activeWorkflow) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-slate-500 font-mono text-xs">
        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="font-bold text-slate-700">No COC Approval Workflow Initiated</p>
        <p className="text-[11px] text-slate-400 mt-1">Schedule a SANS 10139 inspection to initialize compliance certification.</p>
      </div>
    );
  }

  const getStatusBadge = (status: COCOverallStatus) => {
    switch (status) {
      case 'fully_certified':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Fully Certified &amp; Issued</span>
          </span>
        );
      case 'awaiting_client_signature':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-400 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Action Required: Client Signature</span>
          </span>
        );
      case 'engineer_review':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Under ECSA Engineer Review</span>
          </span>
        );
      case 'inspection_pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Field Inspection In Progress</span>
          </span>
        );
    }
  };

  const getStageStatusIcon = (status: COCWorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'action_required':
        return <AlertTriangle className="w-4 h-4 text-amber-950" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-900 animate-spin" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-400" />;
    }
  };

  return (
    <div id="compliance-progress-tracker" className="space-y-6">
      
      {/* Tracker Hero Header Card */}
      <div className="bg-[#0A192F] text-white p-6 rounded-sm border-2 border-slate-700 shadow-md space-y-5">
        
        {/* Top Meta Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#CC0000] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                SANS 10139 COC WORKFLOW
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Ref: <strong className="text-white">{activeWorkflow.serviceRequestRef}</strong>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Compliance Approval Progress
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(activeWorkflow.overallStatus)}

            <button
              id="view-coc-certificate-btn"
              onClick={() => setIsViewerModalOpen(true)}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>View Certificate</span>
            </button>
          </div>
        </div>

        {/* Premise & Certificate Reference Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Premise &amp; Location:</span>
            <strong className="text-white text-sm font-sans block truncate">{activeWorkflow.siteName}</strong>
            <span className="text-[11px] text-slate-400 truncate block">{activeWorkflow.buildingAddress}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Certificate Number:</span>
            <strong className="text-[#CC0000] text-sm font-mono block">{activeWorkflow.certificateNumber}</strong>
            <span className="text-[11px] text-slate-400 block">{activeWorkflow.systemCategory}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Standard Mandate &amp; Seal:</span>
            <strong className="text-slate-200 block text-xs">{activeWorkflow.standardReference}</strong>
            <span className="text-[10px] text-emerald-400 font-bold block">
              {activeWorkflow.overallStatus === 'fully_certified' ? '✓ Registered & Active' : '• In Verification Cycle'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Overall Statutory Completion:</span>
            </span>
            <span className="text-sm font-black text-amber-400">{activeWorkflow.progressPercentage}%</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeWorkflow.progressPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-[#CC0000] via-amber-500 to-yellow-400'
              }`}
              style={{ width: `${activeWorkflow.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Action Alert Banner if Awaiting Client Signature */}
        {activeWorkflow.overallStatus === 'awaiting_client_signature' && (
          <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 border-2 border-amber-400 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <strong className="font-mono uppercase text-xs text-white">
                  Action Required: Client Digital Signature
                </strong>
              </div>
              <p className="text-xs text-slate-200 font-sans">
                SAQCC Technician sign-off and Lead Engineer ECSA endorsement are completed. Sign now to seal and issue your official Certificate of Compliance.
              </p>
            </div>

            <button
              id="sign-coc-hero-action-btn"
              onClick={() => setIsSignatureModalOpen(true)}
              className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
            >
              <FileSignature className="w-4 h-4" />
              <span>Sign Certificate Now</span>
            </button>
          </div>
        )}

      </div>

      {/* 5-Stage Step-by-Step Approval Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="font-mono font-black uppercase text-[#0A192F] text-xs sm:text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-[#CC0000]" />
            <span>SANS 10139 COC Approval Lifecycle (5 Stages)</span>
          </h4>

          {/* Workflow Selector if multiple available */}
          {workflows.length > 1 && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 hidden sm:inline">Active Property:</span>
              <select
                value={activeWorkflow.id}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-sm text-xs font-mono font-bold text-slate-800 focus:border-[#CC0000] focus:outline-none"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.siteName} ({wf.progressPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stage Cards Stack */}
        <div className="space-y-3">
          {activeWorkflow.stages.map((stage, idx) => {
            const isCurrent = stage.id === activeWorkflow.currentStageId;
            const isCompleted = stage.status === 'completed';
            const isActionRequired = stage.status === 'action_required';
            const isExpanded = expandedStageId === stage.id;

            return (
              <div
                key={stage.id}
                className={`border rounded-sm transition-all overflow-hidden bg-white shadow-xs ${
                  isActionRequired
                    ? 'border-2 border-amber-400 ring-2 ring-amber-100'
                    : isCurrent
                    ? 'border-[#0A192F] border-l-4 border-l-[#CC0000]'
                    : isCompleted
                    ? 'border-slate-200 border-l-4 border-l-emerald-600'
                    : 'border-slate-200 opacity-85'
                }`}
              >
                {/* Stage Header Row */}
                <div
                  onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Stage Indicator Pill */}
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActionRequired
                          ? 'bg-amber-400 text-amber-950 animate-bounce'
                          : isCurrent
                          ? 'bg-[#0A192F] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stage.stageNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          Stage {stage.stageNumber} • {stage.requiredRole}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Verified
                          </span>
                        )}
                        {isActionRequired && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded font-bold">
                            Action Required
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-[#0A192F] font-sans">
                        {stage.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {stage.completedAt && (
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        {new Date(stage.completedAt).toLocaleDateString('en-ZA')}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-[#CC0000]' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Stage Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs font-sans text-slate-700">
                    <p className="text-slate-600 leading-relaxed pt-3">
                      {stage.description}
                    </p>

                    {/* STAGE 1: Technician Sign-Off Box */}
                    {stage.id === 'stage_1_inspection' && stage.technicianSignOff && (
                      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#CC0000]" />
                            <span className="font-mono font-bold text-[#0A192F] text-xs uppercase">
                              SAQCC Field Technician Sign-Off
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            Signed: {new Date(stage.technicianSignOff.signedAt).toLocaleString('en-ZA')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-slate-700">
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Technician:</span>
                            <strong className="text-slate-900 block truncate">{stage.technicianSignOff.technicianName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">SAQCC Registration:</span>
                            <strong className="text-[#CC0000] block">{stage.technicianSignOff.saqccNumber}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Audited Devices:</span>
                            <strong className="text-slate-900 block">{stage.technicianSignOff.loopSensorsTestedCount} Units (100%)</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Audibility SPL:</span>
                            <strong className="text-emerald-700 font-bold block">{stage.technicianSignOff.sounderAudibilityDba} dBA (Pass)</strong>
                          </div>
                        </div>

                        {stage.checklist && stage.checklist.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                              SANS 10139 Checklist Verification Results:
                            </span>
                            <div className="space-y-1">
                              {stage.checklist.map((chk) => (
                                <div key={chk.id} className="flex items-start gap-2 text-[11px] bg-slate-50 p-2 rounded-sm border border-slate-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <strong className="text-slate-800">{chk.label}</strong>
                                      <span className="text-[10px] font-mono text-slate-400">{chk.standardClause}</span>
                                    </div>
                                    {chk.notes && <p className="text-[10px] text-slate-600 mt-0.5">{chk.notes}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STAGE 1 Pending Helper */}
                    {stage.id === 'stage_1_inspection' && !stage.technicianSignOff && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Technician on-site inspection in progress. Device polling and battery load tests underway.</span>
                        </div>
                        <button
                          onClick={handleSimulateTechSignOff}
                          className="px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase rounded-sm shrink-0 cursor-pointer"
                        >
                          Simulate Tech Sign-off
                        </button>
                      </div>
                    )}

                    {/* STAGE 2: Defects Clearance Summary */}
                    {stage.id === 'stage_2_defects_clearance' && stage.defectsSummary && (
                      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-mono font-bold text-[#0A192F] text-xs uppercase">
                            Non-Conformance Remediation Log
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            0 Critical Open Defects
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-mono">
                          {stage.defectsSummary.clearanceNotes || 'All identified minor issues resolved on-site.'}
                        </p>
                      </div>
                    )}

                    {/* STAGE 3: Engineer ECSA Endorsement */}
                    {stage.id === 'stage_3_engineer_review' && stage.engineerReview && (
                      <div className="bg-white border border-purple-200 rounded-sm p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-purple-700" />
                            <span className="font-mono font-bold text-purple-950 text-xs uppercase">
                              ECSA Pr.Eng Statutory Endorsement
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            Endorsed: {new Date(stage.engineerReview.reviewedAt).toLocaleString('en-ZA')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono text-slate-700">
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Lead Engineer:</span>
                            <strong className="text-slate-900 block">{stage.engineerReview.engineerName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">ECSA Registration:</span>
                            <strong className="text-purple-900 block">{stage.engineerReview.ecsaNumber}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[9px] uppercase block">Digital Seal ID:</span>
                            <strong className="text-slate-800 text-[10px] block">{stage.engineerReview.digitalSealId}</strong>
                          </div>
                        </div>

                        <p className="text-xs italic text-slate-700 bg-purple-50/60 p-2.5 rounded-sm border border-purple-100 font-sans">
                          "{stage.engineerReview.endorsementNotes}"
                        </p>
                      </div>
                    )}

                    {/* STAGE 3 Pending Helper */}
                    {stage.id === 'stage_3_engineer_review' && !stage.engineerReview && (
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Submitted for Lead Fire Systems Engineer (Pr.Eng) peer review and endorsement.</span>
                        </div>
                        <button
                          onClick={handleSimulateEngineerEndorsement}
                          className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white font-mono font-bold text-xs uppercase rounded-sm shrink-0 cursor-pointer"
                        >
                          Simulate Pr.Eng Endorsement
                        </button>
                      </div>
                    )}

                    {/* STAGE 4: Client Digital Signature Card */}
                    {stage.id === 'stage_4_client_signature' && (
                      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <FileSignature className="w-4 h-4 text-[#CC0000]" />
                            <span className="font-mono font-bold text-[#0A192F] text-xs uppercase">
                              Responsible Person Handover Acceptance
                            </span>
                          </div>

                          {stage.clientSignature ? (
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Digitally Signed &amp; Certified
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              Pending Client Signature
                            </span>
                          )}
                        </div>

                        {stage.clientSignature ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-200">
                            <div>
                              <span className="text-slate-400 text-[9px] uppercase block">Signatory:</span>
                              <strong className="text-slate-900 block">{stage.clientSignature.signatoryName}</strong>
                              <span className="text-[10px] text-slate-500 block truncate">{stage.clientSignature.signatoryRole}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[9px] uppercase block">Timestamp &amp; IP:</span>
                              <span className="text-slate-800 text-[10px] block">{new Date(stage.clientSignature.signedAt).toLocaleString('en-ZA')}</span>
                              <span className="text-[10px] text-slate-500 block">{stage.clientSignature.ipAddress}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[9px] uppercase block">Digital Stamp:</span>
                              {stage.clientSignature.signatureType === 'canvas_drawn' ? (
                                <img
                                  src={stage.clientSignature.signatureDataUrl}
                                  alt="Signature"
                                  className="h-8 object-contain mt-0.5"
                                />
                              ) : (
                                <span className="font-serif italic text-sm text-[#0A192F] font-bold block">
                                  {stage.clientSignature.signatoryName}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-amber-950 text-xs">
                                SANS 10139 Statutory Acceptance Required
                              </p>
                              <p className="text-[11px] text-amber-900 mt-0.5">
                                Please execute your digital signature as the appointed Responsible Person to finalize the certificate.
                              </p>
                            </div>

                            <button
                              id="open-signature-modal-stage-btn"
                              onClick={() => setIsSignatureModalOpen(true)}
                              className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                              <span>Sign Certificate</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STAGE 5: Issuance & Dispatch Record */}
                    {stage.id === 'stage_5_coc_issuance' && (
                      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="font-mono font-bold text-[#0A192F] text-xs uppercase">
                            Statutory Archive &amp; Authority Dispatch Register
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            QR Verification: {activeWorkflow.qrVerificationCode}
                          </span>
                        </div>

                        {activeWorkflow.dispatchedRecipients && activeWorkflow.dispatchedRecipients.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                              Automated Statutory Dispatch Receipts:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {activeWorkflow.dispatchedRecipients.map((rec, i) => (
                                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[11px] font-mono space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <strong className="text-slate-800 truncate">{rec.entity}</strong>
                                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-bold">
                                      {rec.method}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate">{rec.email}</p>
                                  <span className="text-[9px] text-emerald-700 font-bold block">
                                    ✓ Dispatched {rec.dispatchedAt ? new Date(rec.dispatchedAt).toLocaleDateString('en-ZA') : 'Pending Certificate Issuance'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            onClick={() => setIsViewerModalOpen(true)}
                            className="px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-300" />
                            <span>Preview Full COC PDF</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Tools Footer Bar */}
      <div className="bg-slate-100 border border-slate-200 p-3 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Audrin SANS 10139 Interactive Approval Engine • Real-time State Machine</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDemo}
            className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-xs text-[10px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isSignatureModalOpen && (
        <COCDigitalSignatureModal
          workflow={activeWorkflow}
          onClose={() => setIsSignatureModalOpen(false)}
          onSuccess={handleSignatureSuccess}
        />
      )}

      {isViewerModalOpen && (
        <COCCertificateViewerModal
          workflow={activeWorkflow}
          onClose={() => setIsViewerModalOpen(false)}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        />
      )}

    </div>
  );
};
