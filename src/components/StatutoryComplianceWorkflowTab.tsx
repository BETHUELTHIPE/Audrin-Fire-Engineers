import React, { useState } from 'react';
import {
  SafetyFile,
  SafetyFileStatus,
  WorkflowTransitionResult,
  DossierValidationReport
} from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import {
  APPROVED_SOURCE_PDFS,
  STATUTORY_SECTION_MAPPINGS
} from '../data/safetyFileSectionMapping';
import {
  ShieldCheck,
  Flame,
  Building,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  FileCheck2,
  FileText,
  Clock,
  ArrowRight,
  Hash,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface StatutoryComplianceWorkflowTabProps {
  safetyFile: SafetyFile;
  currentUserRole?: string;
  currentUserName?: string;
  onFileUpdated?: (updated: SafetyFile) => void;
}

export const StatutoryComplianceWorkflowTab: React.FC<StatutoryComplianceWorkflowTabProps> = ({
  safetyFile,
  currentUserRole = 'technician',
  currentUserName = 'Current User',
  onFileUpdated
}) => {
  const [selectedPdfCode, setSelectedPdfCode] = useState<'SANS_10139_2012' | 'SANS_10400_T_2011'>('SANS_10139_2012');
  const [transitionJustification, setTransitionJustification] = useState('');
  const [transitionCredential, setTransitionCredential] = useState('');
  const [transitionResult, setTransitionResult] = useState<WorkflowTransitionResult | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [clauseSearch, setClauseSearch] = useState('');

  // Validate dossier compliance
  const validationReport: DossierValidationReport = safetyFileService.validateDossierForIssuance(safetyFile);
  const selectedPdf = APPROVED_SOURCE_PDFS[selectedPdfCode];

  // Filter clauses by search
  const filteredClauses = selectedPdf.mandatoryVerbatimClauses.filter(c =>
    c.clauseRef.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.clauseTitle.toLowerCase().includes(clauseSearch.toLowerCase()) ||
    c.exactWording.toLowerCase().includes(clauseSearch.toLowerCase())
  );

  const handleTransition = (targetStatus: SafetyFileStatus) => {
    setIsTransitioning(true);
    setTransitionResult(null);

    const credential = transitionCredential.trim() ||
      (currentUserRole.toLowerCase().includes('commissioner')
        ? safetyFile.authorisedCommissionerSaqcc
        : safetyFile.responsibleTechnicianSaqcc);

    const result = safetyFileService.transitionFileStatus(
      safetyFile.id,
      targetStatus,
      {
        name: currentUserName,
        role: currentUserRole,
        credentialNumber: credential
      },
      transitionJustification.trim() || `Workflow state advanced to ${targetStatus} via Statutory Compliance module.`
    );

    setTransitionResult(result);
    setIsTransitioning(false);

    if (result.success) {
      const refreshed = safetyFileService.getSafetyFileById(safetyFile.id);
      if (refreshed) {
        onFileUpdated?.(refreshed);
      }
      setTransitionJustification('');
    }
  };

  const statusSteps: { status: SafetyFileStatus; label: string; desc: string }[] = [
    { status: 'Draft', label: 'Draft', desc: 'Dossier authoring & compilation' },
    { status: 'Under Review', label: 'Under Review', desc: 'Internal QA & peer inspection' },
    { status: 'Approved', label: 'Approved', desc: 'SAQCC Commissioner certified' },
    { status: 'Issued', label: 'Issued', desc: 'Client accepted & SHA-256 sealed' },
    { status: 'Archived', label: 'Archived', desc: 'Historical record' }
  ];

  const currentStepIdx = statusSteps.findIndex(s => s.status === safetyFile.status);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 font-mono text-xs space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. STATE MACHINE LIFECYCLE TRACKER */}
        <div className="bg-white border-2 border-[#0A192F] p-5 rounded-xs shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#0A192F] text-white text-[10px] font-bold uppercase rounded-xs">
                  Statutory State Machine
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-bold">
                  Dossier: <strong className="text-slate-900">{safetyFile.safetyFileNumber}</strong>
                </span>
              </div>
              <h3 className="text-base font-black text-[#0A192F] uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Fire Detection Safety File Workflow Lifecycle</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Current Dossier Status:</span>
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-xs border ${
                safetyFile.status === 'Issued'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : safetyFile.status === 'Approved'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : safetyFile.status === 'Under Review'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                {safetyFile.status}
              </span>
            </div>
          </div>

          {/* Stepper progress */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {statusSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div
                  key={step.status}
                  className={`p-3 rounded-xs border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm ring-2 ring-[#0A192F]/20'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase">
                      Stage {idx + 1}
                    </span>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isCurrent && <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />}
                  </div>
                  <div className="font-black text-xs uppercase mb-0.5">{step.label}</div>
                  <div className={`text-[10px] ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cryptographic SHA-256 Digital Seal if Issued */}
          {safetyFile.fileChecksumSha256 && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">
                    Deterministic Cryptographic Seal (Issued &amp; Locked)
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 select-all break-all">
                    SHA-256: {safetyFile.fileChecksumSha256}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 bg-emerald-200 text-emerald-900 font-bold uppercase rounded-xs">
                Tamper-Proof SANS 10139 Compliant
              </span>
            </div>
          )}

          {/* Transition Controller Controls */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-4">
            <div className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-[#CC0000]" />
              <span>Advance Dossier Lifecycle Stage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-600 block mb-1 uppercase font-bold">
                  Signatory Credential (SAQCC / ECSA Registration)
                </label>
                <input
                  type="text"
                  value={transitionCredential}
                  onChange={e => setTransitionCredential(e.target.value)}
                  placeholder={safetyFile.authorisedCommissionerSaqcc || 'e.g. SAQCC-FD-14289'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:outline-hidden focus:border-[#0A192F]"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 block mb-1 uppercase font-bold">
                  Transition Audit Justification
                </label>
                <input
                  type="text"
                  value={transitionJustification}
                  onChange={e => setTransitionJustification(e.target.value)}
                  placeholder="e.g. All 16 statutory sections audited; SANS 10139 COC executed."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:outline-hidden focus:border-[#0A192F]"
                />
              </div>
            </div>

            {/* Action Buttons with Gate Logic */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {safetyFile.status === 'Draft' && (
                <button
                  id="btn-transition-under-review"
                  disabled={isTransitioning}
                  onClick={() => handleTransition('Under Review')}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xs uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Advance to "Under Review"
                </button>
              )}

              {safetyFile.status === 'Under Review' && (
                <>
                  <button
                    id="btn-transition-approved"
                    disabled={isTransitioning || !validationReport.canAdvanceToApproved}
                    onClick={() => handleTransition('Approved')}
                    className={`px-4 py-2.5 text-white font-bold rounded-xs uppercase tracking-wider cursor-pointer shadow-xs ${
                      validationReport.canAdvanceToApproved
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                    title={
                      !validationReport.canAdvanceToApproved
                        ? 'Blocked: SAQCC Commissioner signature and complete mandatory documents required.'
                        : 'Approve dossier under SANS 10139 statutory authority.'
                    }
                  >
                    Approve Dossier (Commissioner Gate)
                  </button>

                  <button
                    id="btn-transition-back-to-draft"
                    disabled={isTransitioning}
                    onClick={() => handleTransition('Draft')}
                    className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xs uppercase cursor-pointer"
                  >
                    Return to Draft (Snagged)
                  </button>
                </>
              )}

              {safetyFile.status === 'Approved' && (
                <>
                  <button
                    id="btn-transition-issued"
                    disabled={isTransitioning || !validationReport.canAdvanceToIssued}
                    onClick={() => handleTransition('Issued')}
                    className={`px-4 py-2.5 text-white font-bold rounded-xs uppercase tracking-wider cursor-pointer shadow-xs ${
                      validationReport.canAdvanceToIssued
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                    title={
                      !validationReport.canAdvanceToIssued
                        ? 'Blocked: Client Handover Acknowledgement signature required before formal Issuance.'
                        : 'Issue Dossier & Generate SHA-256 Digital Seal.'
                    }
                  >
                    Formally Issue Dossier (Seal &amp; Lock)
                  </button>

                  <button
                    id="btn-transition-back-to-review"
                    disabled={isTransitioning}
                    onClick={() => handleTransition('Under Review')}
                    className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xs uppercase cursor-pointer"
                  >
                    Return to Under Review
                  </button>
                </>
              )}

              {safetyFile.status === 'Issued' && (
                <button
                  id="btn-transition-archived"
                  disabled={isTransitioning}
                  onClick={() => handleTransition('Archived')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xs uppercase cursor-pointer"
                >
                  Archive Dossier
                </button>
              )}
            </div>

            {/* Transition Feedback message */}
            {transitionResult && (
              <div
                className={`p-3 rounded-xs border text-xs font-mono ${
                  transitionResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {transitionResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{transitionResult.message}</span>
                </div>
                {transitionResult.prerequisitesVerified && transitionResult.prerequisitesVerified.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-emerald-800">
                    {transitionResult.prerequisitesVerified.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
                {transitionResult.validationErrors && transitionResult.validationErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-red-800">
                    {transitionResult.validationErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. STATUTORY COMPLIANCE REPORT & GATES */}
        <div className="bg-white border-2 border-slate-300 p-5 rounded-xs shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Dual Standard Statutory Audit
              </div>
              <h3 className="text-base font-black text-[#0A192F] uppercase flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>Statutory Compliance Validation Report</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-bold">Compliance Level:</span>
              <span className="text-lg font-black text-[#0A192F]">
                {validationReport.overallComplianceScore}%
              </span>
            </div>
          </div>

          {/* Statutory Gate Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Gate 1: Commissioner Approval */}
            <div className={`p-3 rounded-xs border-2 ${
              validationReport.isCommissionerApproved
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                <span>Gate 1: Commissioner</span>
                {validationReport.isCommissionerApproved ? (
                  <span className="text-emerald-700 font-bold">APPROVED</span>
                ) : (
                  <span className="text-red-700 font-bold">REQUIRED</span>
                )}
              </div>
              <div className="font-bold text-xs truncate">
                {safetyFile.authorisedCommissioner || 'Pending Sign-Off'}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                SANS 10139 Clause 24 mandatory gate.
              </div>
            </div>

            {/* Gate 2: Mandatory Documents */}
            <div className={`p-3 rounded-xs border-2 ${
              validationReport.missingDocumentsCount === 0
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                <span>Gate 2: Mandatory Docs</span>
                <span className="font-bold">
                  {validationReport.missingDocumentsCount === 0 ? 'COMPLETE' : `${validationReport.missingDocumentsCount} MISSING`}
                </span>
              </div>
              <div className="font-bold text-xs">
                {validationReport.mandatoryDocumentsCount - validationReport.missingDocumentsCount} / {validationReport.mandatoryDocumentsCount} Present
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                All 16 statutory sections required.
              </div>
            </div>

            {/* Gate 3: Calibration Currency */}
            <div className={`p-3 rounded-xs border-2 ${
              validationReport.expiredDocumentsCount === 0
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                <span>Gate 3: Calibrations</span>
                <span className="font-bold">
                  {validationReport.expiredDocumentsCount === 0 ? 'CURRENT' : `${validationReport.expiredDocumentsCount} EXPIRED`}
                </span>
              </div>
              <div className="font-bold text-xs">
                SANAS ISO 17025 Standards
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                Sound level meter &amp; insulation tester.
              </div>
            </div>

            {/* Gate 4: Client Handover */}
            <div className={`p-3 rounded-xs border-2 ${
              validationReport.isClientAcknowledged
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                <span>Gate 4: Client Handover</span>
                <span className="font-bold">
                  {validationReport.isClientAcknowledged ? 'SIGNED' : 'PENDING'}
                </span>
              </div>
              <div className="font-bold text-xs truncate">
                {safetyFile.clientSafetyOfficerName}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                Required for final Issuance.
              </div>
            </div>
          </div>

          {/* Blocking Issues Alert Box */}
          {validationReport.blockingIssues.length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-900 uppercase">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Statutory Blocking Issues ({validationReport.blockingIssues.length})</span>
              </div>
              <ul className="space-y-1.5 text-xs text-red-800">
                {validationReport.blockingIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings Alert Box */}
          {validationReport.warnings.length > 0 && (
            <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900 uppercase text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Advisory Governance Warnings ({validationReport.warnings.length})</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-800">
                {validationReport.warnings.map((warn, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. TWO APPROVED SOURCE STATUTORY PDFS */}
        <div className="bg-white border-2 border-slate-300 p-5 rounded-xs shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Governing Legislation
              </div>
              <h3 className="text-base font-black text-[#0A192F] uppercase flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                <span>Two Approved Source Standards (Statutory Text)</span>
              </h3>
            </div>

            {/* Standard Switcher Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-source-pdf-sans10139"
                onClick={() => setSelectedPdfCode('SANS_10139_2012')}
                className={`px-3.5 py-2 font-bold rounded-xs cursor-pointer border transition-all uppercase flex items-center gap-1.5 ${
                  selectedPdfCode === 'SANS_10139_2012'
                    ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>SANS 10139:2012</span>
              </button>

              <button
                id="btn-source-pdf-sans10400t"
                onClick={() => setSelectedPdfCode('SANS_10400_T_2011')}
                className={`px-3.5 py-2 font-bold rounded-xs cursor-pointer border transition-all uppercase flex items-center gap-1.5 ${
                  selectedPdfCode === 'SANS_10400_T_2011'
                    ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>SANS 10400-T:2011</span>
              </button>
            </div>
          </div>

          {/* Active Standard Metadata Header */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-sm text-[#0A192F]">
                {selectedPdf.documentName}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-xs uppercase">
                {selectedPdf.edition} • {selectedPdf.issuingBody}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-sans leading-relaxed">
              {selectedPdf.statutoryEnforcement}
            </p>
          </div>

          {/* Search bar for Clauses */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={clauseSearch}
              onChange={e => setClauseSearch(e.target.value)}
              placeholder="Search verbatim clauses (e.g. '200 seconds', 'battery', 'audibility', '65 dB', '1.4 m')..."
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:outline-hidden focus:border-[#0A192F]"
            />
            {clauseSearch && (
              <button
                onClick={() => setClauseSearch('')}
                className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xs cursor-pointer text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Clauses list */}
          <div className="space-y-3">
            {filteredClauses.map((clause, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-slate-200 hover:border-slate-400 rounded-xs shadow-2xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-xs">
                      {clause.clauseRef}
                    </span>
                    <strong className="text-xs text-slate-900 font-sans">{clause.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    Governs Section {clause.applicableSection}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border-l-2 border-[#0A192F] text-slate-800 font-sans text-xs italic leading-relaxed">
                  "{clause.exactWording}"
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span className="font-bold text-[#0A192F]">Mandate: {clause.statutoryMandate}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Dossier Section #{clause.applicableSection}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 16 STATUTORY SECTIONS MAPPING MATRIX */}
        <div className="bg-white border-2 border-slate-300 p-5 rounded-xs shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase">
              Mandatory Structure Matrix
            </div>
            <h3 className="text-base font-black text-[#0A192F] uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>16 Statutory Sections Document Mapping</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xs overflow-hidden">
            <div className="bg-slate-100 p-3 font-bold text-[11px] text-slate-700 grid grid-cols-12 gap-2 uppercase">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Section Title &amp; Category</div>
              <div className="col-span-3">Governing Standard</div>
              <div className="col-span-4">Mandatory Documents</div>
            </div>

            {STATUTORY_SECTION_MAPPINGS.map(sec => (
              <div
                key={sec.sectionNumber}
                className="p-3 hover:bg-slate-50 transition-colors grid grid-cols-12 gap-2 items-center text-xs"
              >
                <div className="col-span-1 text-center font-bold text-[#0A192F]">
                  {sec.sectionNumber}
                </div>
                <div className="col-span-4">
                  <div className="font-bold text-slate-900">{sec.title}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{sec.category}</div>
                </div>
                <div className="col-span-3 font-mono text-[11px] text-slate-700">
                  <span className="font-bold text-red-700">{sec.standardReference}</span>
                </div>
                <div className="col-span-4 text-[11px] text-slate-600">
                  {sec.mandatoryDocumentTemplates.map(d => d.title).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
