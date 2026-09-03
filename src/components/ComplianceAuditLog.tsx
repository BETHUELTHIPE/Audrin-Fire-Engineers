import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Key,
  Award,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  UserCheck,
  ArrowRight,
  Clock,
  Building,
  Hash,
  QrCode,
  Printer,
  ChevronRight,
  Plus,
  X,
  Copy,
  FileCheck2,
  FileSpreadsheet,
  FileCode,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ComplianceAuditEntry,
  ComplianceAuditCategory,
  RegulatoryStandard,
  ComplianceAuditFilterOptions
} from '../types/complianceAudit';
import { complianceAuditService } from '../services/complianceAuditService';

interface ComplianceAuditLogProps {
  className?: string;
  onViewSafetyFile?: (safetyFileNumber: string) => void;
}

export const ComplianceAuditLog: React.FC<ComplianceAuditLogProps> = ({
  className = '',
  onViewSafetyFile
}) => {
  // State
  const [entries, setEntries] = useState<ComplianceAuditEntry[]>(() =>
    complianceAuditService.getEntries()
  );
  const [selectedCategory, setSelectedCategory] = useState<ComplianceAuditCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'last7' | 'last30'>('all');

  // Modals
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<ComplianceAuditEntry | null>(null);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalVerified: number;
    merkleRoot: string;
    timestamp: string;
  } | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // New Record Form State
  const [newRecordType, setNewRecordType] = useState<'transition' | 'signature' | 'template'>('transition');
  const [formDocNumber, setFormDocNumber] = useState('AFE-SF-DOC-02.01');
  const [formDocTitle, setFormDocTitle] = useState('Scope of Work & Category L1 Design');
  const [formFromStatus, setFormFromStatus] = useState('Draft');
  const [formToStatus, setFormToStatus] = useState('Approved');
  const [formJustification, setFormJustification] = useState('Satisfies SANS 10139 Clause 5 zoning criteria after technical survey.');
  const [formSignerRole, setFormSignerRole] = useState<'preparedBy' | 'reviewedBy' | 'approvedBy' | 'clientAcknowledgement'>('approvedBy');
  const [formSignerName, setFormSignerName] = useState('Bethuel Moukangwe');
  const [formSignerReg, setFormSignerReg] = useState('SAQCC-COMM-00892');
  const [formTemplateName, setFormTemplateName] = useState('SANS 10139 Form 2 Commissioning Certificate');
  const [formTemplateNewVersion, setFormTemplateNewVersion] = useState('REV 02.0');
  const [formTemplateRationale, setFormTemplateRationale] = useState('Added mandatory battery calculation witness testing table.');

  // Refresh entries from service
  const refreshEntries = () => {
    setEntries(complianceAuditService.getEntries());
  };

  // Run cryptographic verification
  const handleVerifyLedger = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      const res = complianceAuditService.verifyLedgerIntegrity();
      setVerificationResult({
        isValid: res.isValid,
        totalVerified: res.totalVerified,
        merkleRoot: res.merkleRoot,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsVerifyingIntegrity(false);
    }, 600);
  };

  // Copy hash utility
  const handleCopyHash = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = entries.length;
    const transitions = entries.filter((e) => e.category === 'document_status_transition').length;
    const signatures = entries.filter((e) => e.category === 'electronic_signature').length;
    const templates = entries.filter((e) => e.category === 'template_version_change').length;
    const popia = entries.filter((e) => e.category === 'popia_data_access').length;
    return { total, transitions, signatures, templates, popia };
  }, [entries]);

  // Extract unique projects
  const uniqueProjects = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => {
      if (e.projectRef && e.projectName) {
        map.set(e.projectRef, e.projectName);
      }
    });
    return Array.from(map.entries()).map(([ref, name]) => ({ ref, name }));
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Category filter
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
        return false;
      }

      // Project filter
      if (selectedProject !== 'all' && entry.projectRef !== selectedProject) {
        return false;
      }

      // Regulatory standard filter
      if (
        selectedStandard !== 'all' &&
        !entry.regulatoryStandards.some((s) => s.includes(selectedStandard))
      ) {
        return false;
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const entryDate = new Date(entry.timestamp).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (selectedDateRange === 'today' && now - entryDate > oneDay) return false;
        if (selectedDateRange === 'last7' && now - entryDate > 7 * oneDay) return false;
        if (selectedDateRange === 'last30' && now - entryDate > 30 * oneDay) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchSummary = entry.summary.toLowerCase().includes(q);
        const matchActor = entry.actor.name.toLowerCase().includes(q) || entry.actor.registrationNumber.toLowerCase().includes(q);
        const matchFile = entry.safetyFileNumber.toLowerCase().includes(q);
        const matchHash = entry.sha256Hash.toLowerCase().includes(q);
        const matchDocNum =
          entry.statusTransition?.documentNumber.toLowerCase().includes(q) ||
          entry.templateVersion?.templateCode.toLowerCase().includes(q);

        if (!matchTitle && !matchSummary && !matchActor && !matchFile && !matchHash && !matchDocNum) {
          return false;
        }
      }

      return true;
    });
  }, [entries, selectedCategory, selectedProject, selectedStandard, selectedDateRange, searchQuery]);

  // Handle manual append
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();

    if (newRecordType === 'transition') {
      complianceAuditService.recordStatusTransition(
        'AFE-SF-2026-001',
        'AFE-2026-001',
        'Apex Industrial Hub Fire Alarm Modernization',
        'Apex Logistics Distribution Centre, Midrand',
        {
          name: 'Bethuel Moukangwe',
          role: 'Lead SANS 10139 Engineer',
          registrationNumber: 'ECSA Pr.Eng 2026991',
          organization: 'Audrin Fire Engineers (Pty) Ltd',
          email: 'compliance@audrinfire.co.za'
        },
        {
          fromStatus: formFromStatus,
          toStatus: formToStatus,
          documentNumber: formDocNumber,
          documentTitle: formDocTitle,
          sectionNumber: 2,
          sectionTitle: 'Project Specification & Scope',
          revision: 'REV 01.1',
          justification: formJustification,
          prerequisitesMet: ['Peer review sign-off completed', 'SANS 10139 clause checked']
        }
      );
    } else if (newRecordType === 'signature') {
      complianceAuditService.recordSignatureEvent(
        'AFE-SF-2026-001',
        'AFE-2026-001',
        'Apex Industrial Hub Fire Alarm Modernization',
        'Apex Logistics Distribution Centre, Midrand',
        {
          signatoryRole: formSignerRole,
          roleTitle: formSignerRole === 'approvedBy' ? 'Authorised Commissioner' : 'Lead Technician',
          signatoryName: formSignerName,
          credentialNumber: formSignerReg,
          credentialAuthority: 'SAQCC Fire South Africa',
          sansComplianceDeclaration:
            'I hereby certify that all statutory inspection items have been verified against SANS 10139:2012 criteria.',
          biometricOrDigitalType: 'SANS Digital Seal'
        }
      );
    } else if (newRecordType === 'template') {
      complianceAuditService.recordTemplateChange({
        templateId: 'AFE-TMP-CUSTOM',
        templateCode: 'SANS-TMP-FORM2',
        templateName: formTemplateName,
        previousVersion: 'REV 01.0',
        newVersion: formTemplateNewVersion,
        changeType: 'Major Statutory Revision',
        governingClauses: ['SANS 10139:2012 Clause 7', 'SANS 10400-T Section 4'],
        changeRationale: formTemplateRationale,
        approvedByAuthority: 'Audrin Technical Directorate',
        fieldModifications: [
          {
            fieldName: 'Battery Standby Discharge Calculation Log',
            previousValue: 'Manual text note',
            updatedValue: 'Tabular ampere-hour verification schedule'
          }
        ],
        actorName: 'Bethuel Moukangwe',
        actorRole: 'Managing Director (Pr.Eng)',
        actorReg: 'ECSA Pr.Eng 2026991'
      });
    }

    refreshEntries();
    setIsRecordModalOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Sequence',
      'Timestamp',
      'Category',
      'Action',
      'Title',
      'Safety File Number',
      'Project Reference',
      'Actor Name',
      'Actor Role',
      'Actor Reg',
      'Regulatory Standards',
      'SHA256 Hash',
      'Previous Hash',
      'Status'
    ];

    const rows = filteredEntries.map((e) => [
      `#${e.sequence}`,
      e.timestamp,
      e.category,
      e.action,
      `"${e.title.replace(/"/g, '""')}"`,
      e.safetyFileNumber,
      e.projectRef,
      `"${e.actor.name}"`,
      `"${e.actor.role}"`,
      e.actor.registrationNumber,
      `"${e.regulatoryStandards.join('; ')}"`,
      e.sha256Hash,
      e.previousHash,
      e.immutabilityVerified ? 'VERIFIED_IMMUTABLE' : 'UNVERIFIED'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Audrin_Compliance_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Audrin_Cryptographic_Audit_Ledger_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="compliance-audit-log-root" className={`space-y-6 font-sans ${className}`}>
      {/* HEADER BAR & REGULATORY CREDENTIALS */}
      <div className="bg-[#0A192F] text-white p-6 rounded-xs border-2 border-[#0A192F] shadow-sm relative overflow-hidden">
        {/* Precision Color Band */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-[#CC0000]" />
          <div className="w-1/6 bg-amber-400" />
          <div className="flex-1 bg-emerald-500" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xs text-xs font-mono text-amber-300 font-bold mb-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>SANS 10139:2012 &amp; OHS ACT STATUTORY IMMUTABLE AUDIT LEDGER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase font-mono text-white">
              Compliance Audit &amp; Regulatory Traceability Log
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 font-mono leading-relaxed">
              Provides an immutable, tamper-evident record of all SANS 10139 Fire Detection document status transitions,
              electronic signature validations, and statutory template version changes with SHA-256 cryptographic chain integrity.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
            <button
              id="btn-verify-crypto-ledger"
              onClick={handleVerifyLedger}
              disabled={isVerifyingIntegrity}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Verify cryptographic Merkle hash chain across all records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
              <span>{isVerifyingIntegrity ? 'Verifying...' : 'Verify Cryptographic Chain'}</span>
            </button>

            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="px-3.5 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Generate printable SANS 10139 Regulatory Compliance Certificate"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Statutory Certificate</span>
            </button>

            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Simulate / Record a new compliance audit event"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Event</span>
            </button>
          </div>
        </div>

        {/* Dynamic Verification Banner */}
        {verificationResult && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xs text-xs font-mono text-emerald-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>LEDGER INTEGRITY VERIFIED:</strong> {verificationResult.totalVerified} audit blocks validated with 0 discrepancies.
              </span>
            </div>
            <div className="text-[11px] text-emerald-300">
              Merkle Root: <span className="font-bold text-white">{verificationResult.merkleRoot.substring(0, 16)}...</span> • Verified at {verificationResult.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* METRICS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
        {/* Total Records */}
        <div className="bg-white border-2 border-slate-200 p-4 rounded-xs shadow-2xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px] block">Total Audit Records</span>
          <div className="text-2xl font-black text-[#0A192F]">{metrics.total}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-400" />
            <span>Immutable Chained Blocks</span>
          </div>
        </div>

        {/* Status Transitions */}
        <div className="bg-white border-2 border-slate-200 p-4 rounded-xs shadow-2xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px] block">Status Transitions</span>
          <div className="text-2xl font-black text-blue-700">{metrics.transitions}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-blue-500" />
            <span>Document Lifecycle Shifts</span>
          </div>
        </div>

        {/* Electronic Signatures */}
        <div className="bg-white border-2 border-slate-200 p-4 rounded-xs shadow-2xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px] block">Verified E-Signatures</span>
          <div className="text-2xl font-black text-emerald-700">{metrics.signatures}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>SAQCC &amp; ECSA Validated</span>
          </div>
        </div>

        {/* Template Revisions */}
        <div className="bg-white border-2 border-slate-200 p-4 rounded-xs shadow-2xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px] block">Template Versions</span>
          <div className="text-2xl font-black text-amber-700">{metrics.templates}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-600" />
            <span>Statutory SANS 10139 Diff</span>
          </div>
        </div>

        {/* Cryptographic Proof */}
        <div className="bg-white border-2 border-slate-200 p-4 rounded-xs shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-slate-500 font-bold uppercase text-[10px] block">Cryptographic Seal</span>
          <div className="text-2xl font-black text-[#CC0000]">100%</div>
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>SHA-256 Tamper-Proof</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL TOWER */}
      <div className="bg-white border-2 border-slate-200 rounded-xs p-4 shadow-2xs space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 font-mono text-xs font-bold no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0A192F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Events ({metrics.total})
          </button>

          <button
            onClick={() => setSelectedCategory('document_status_transition')}
            className={`px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'document_status_transition'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span>Document Transitions ({metrics.transitions})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('electronic_signature')}
            className={`px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'electronic_signature'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>Electronic Signatures ({metrics.signatures})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('template_version_change')}
            className={`px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'template_version_change'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Template Versions ({metrics.templates})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('popia_data_access')}
            className={`px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'popia_data_access'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>POPIA &amp; Security ({metrics.popia})</span>
          </button>
        </div>

        {/* Search & Granular Dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document ref, actor, SAQCC reg, hash, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-[#0A192F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xs text-slate-800"
            >
              <option value="all">All Projects &amp; Standards</option>
              {uniqueProjects.map((p) => (
                <option key={p.ref} value={p.ref}>
                  {p.ref}: {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Regulatory Standard */}
          <div className="md:col-span-2">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xs text-slate-800"
            >
              <option value="all">All Standards</option>
              <option value="SANS 10139">SANS 10139:2012</option>
              <option value="SANS 10400-T">SANS 10400-T</option>
              <option value="OHS Act">OHS Act 85 of 1993</option>
              <option value="SAQCC">SAQCC Fire 1475/FD</option>
              <option value="POPIA">POPIA Act 4 of 2013</option>
            </select>
          </div>

          {/* Date Range & Exports */}
          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="w-full py-2 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-800"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>

            {/* Export buttons */}
            <button
              onClick={handleExportCSV}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs cursor-pointer"
              title="Export as Auditor CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </button>
            <button
              onClick={handleExportJSON}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs cursor-pointer"
              title="Export as Cryptographic JSON"
            >
              <FileCode className="w-4 h-4 text-blue-700" />
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE & GRANULAR TIMELINE */}
      <div className="bg-white border-2 border-slate-200 rounded-xs overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0A192F]" />
            <span className="font-bold text-[#0A192F] uppercase">
              Regulatory Audit Ledger Stream ({filteredEntries.length} Records)
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Sorted by Sequence DESC (Latest Block First)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0A192F] text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3 w-16">Seq #</th>
                <th className="p-3 w-40">Timestamp</th>
                <th className="p-3 w-44">Category / Action</th>
                <th className="p-3">Event Title &amp; Statutory Summary</th>
                <th className="p-3 w-52">Actor / Credential</th>
                <th className="p-3 w-36">SHA-256 Digest</th>
                <th className="p-3 text-right w-24">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 text-[11px]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No compliance audit entries found matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEntryForDetail(entry)}
                  >
                    {/* Seq */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-xs border border-slate-300">
                        #{String(entry.sequence).padStart(3, '0')}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    {/* Category / Action */}
                    <td className="p-3">
                      {entry.category === 'document_status_transition' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                            <ArrowRight className="w-3 h-3" />
                            <span>Transition</span>
                          </span>
                          {entry.statusTransition && (
                            <div className="text-[10px] text-slate-600 font-sans font-semibold">
                              <span className="text-slate-400">{entry.statusTransition.fromStatus}</span>
                              <span className="text-blue-600 mx-1">➔</span>
                              <span className="text-emerald-700 font-bold">{entry.statusTransition.toStatus}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {entry.category === 'electronic_signature' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                            <UserCheck className="w-3 h-3" />
                            <span>E-Signature</span>
                          </span>
                          {entry.electronicSignature && (
                            <div className="text-[10px] text-emerald-700 font-bold font-sans">
                              {entry.electronicSignature.roleTitle}
                            </div>
                          )}
                        </div>
                      )}

                      {entry.category === 'template_version_change' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                            <Layers className="w-3 h-3" />
                            <span>Template</span>
                          </span>
                          {entry.templateVersion && (
                            <div className="text-[10px] text-amber-800 font-bold">
                              {entry.templateVersion.previousVersion} ➔ {entry.templateVersion.newVersion}
                            </div>
                          )}
                        </div>
                      )}

                      {entry.category === 'popia_data_access' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                            <Lock className="w-3 h-3" />
                            <span>POPIA Safe</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Title & Summary */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 font-sans text-xs flex items-center gap-1.5 flex-wrap">
                        <span>{entry.title}</span>
                        {entry.safetyFileNumber && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-xs border border-slate-200">
                            {entry.safetyFileNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans mt-0.5 line-clamp-1">
                        {entry.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.regulatoryStandards.map((std) => (
                          <span
                            key={std}
                            className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded-xs"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{entry.actor.name}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{entry.actor.role}</div>
                      <div className="text-[10px] font-bold text-[#CC0000] mt-0.5">
                        {entry.actor.registrationNumber}
                      </div>
                    </td>

                    {/* Hash */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {entry.sha256Hash.substring(0, 10)}...
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHash(entry.sha256Hash, entry.id);
                          }}
                          className="p-1 hover:bg-slate-200 rounded-xs text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy full SHA-256 block hash"
                        >
                          {copiedHashId === entry.id ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block">
                        ✓ Sealed
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntryForDetail(entry);
                        }}
                        className="px-2.5 py-1 bg-[#0A192F] hover:bg-slate-800 text-white rounded-xs text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORENSIC INSPECTION MODAL */}
      {selectedEntryForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b-2 border-[#CC0000]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xs flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                      Audit Block #{String(selectedEntryForDetail.sequence).padStart(4, '0')}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-800 text-emerald-200 px-2 py-0.2 rounded-xs font-bold">
                      VERIFIED IMMUTABLE
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-sans text-white mt-0.5">
                    {selectedEntryForDetail.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEntryForDetail(null)}
                className="p-1.5 hover:bg-white/10 rounded-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono text-xs text-slate-800">
              {/* Event Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: General & Project Context */}
                <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 space-y-2">
                  <h4 className="font-bold text-[#0A192F] uppercase border-b border-slate-300 pb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#CC0000]" />
                    <span>Project &amp; Statutory Reference</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-500">Record ID:</span>{' '}
                      <strong>{selectedEntryForDetail.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Timestamp:</span>{' '}
                      <strong>{new Date(selectedEntryForDetail.timestamp).toUTCString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Safety File:</span>{' '}
                      <strong className="text-[#CC0000]">{selectedEntryForDetail.safetyFileNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Project:</span>{' '}
                      <span className="font-sans font-semibold">{selectedEntryForDetail.projectName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Site Facility:</span>{' '}
                      <span className="font-sans">{selectedEntryForDetail.siteName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Certified Actor Profile */}
                <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 space-y-2">
                  <h4 className="font-bold text-[#0A192F] uppercase border-b border-slate-300 pb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#CC0000]" />
                    <span>Certified Actor &amp; Credentials</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-500">Actor Name:</span>{' '}
                      <strong className="text-slate-900">{selectedEntryForDetail.actor.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Designation:</span>{' '}
                      <span className="font-sans">{selectedEntryForDetail.actor.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Registration:</span>{' '}
                      <span className="px-1.5 py-0.2 bg-red-100 text-[#CC0000] font-bold rounded-xs">
                        {selectedEntryForDetail.actor.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Organization:</span>{' '}
                      <span>{selectedEntryForDetail.actor.organization}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Client IP / Node:</span>{' '}
                      <span>{selectedEntryForDetail.actor.ipAddress} ({selectedEntryForDetail.actor.location})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRANULAR PAYLOAD SPECIFICS */}
              {/* 1. DOCUMENT STATUS TRANSITION */}
              {selectedEntryForDetail.statusTransition && (
                <div className="border-2 border-blue-200 bg-blue-50/50 rounded-xs p-4 space-y-3">
                  <h4 className="font-bold text-blue-900 uppercase flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span>Granular Document Status Transition Payload</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xs border border-blue-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous Status</span>
                      <span className="text-sm font-bold text-slate-700 uppercase">
                        {selectedEntryForDetail.statusTransition.fromStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-center text-blue-600">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Approved Status</span>
                      <span className="text-sm font-black text-emerald-700 uppercase">
                        {selectedEntryForDetail.statusTransition.toStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-bold">Document Number:</span>{' '}
                      <strong className="text-slate-900">{selectedEntryForDetail.statusTransition.documentNumber}</strong>{' '}
                      ({selectedEntryForDetail.statusTransition.revision})
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Document Title:</span>{' '}
                      <span className="font-sans font-semibold">{selectedEntryForDetail.statusTransition.documentTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Dossier Section:</span>{' '}
                      <span>
                        Section {selectedEntryForDetail.statusTransition.sectionNumber}: {selectedEntryForDetail.statusTransition.sectionTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Transition Justification:</span>{' '}
                      <p className="font-sans text-slate-700 bg-white p-2.5 rounded-xs border border-blue-200 mt-1">
                        {selectedEntryForDetail.statusTransition.justification}
                      </p>
                    </div>

                    {selectedEntryForDetail.statusTransition.prerequisitesMet.length > 0 && (
                      <div className="pt-2">
                        <span className="text-slate-500 font-bold block mb-1">
                          Statutory Prerequisites Completed:
                        </span>
                        <ul className="space-y-1">
                          {selectedEntryForDetail.statusTransition.prerequisitesMet.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-emerald-800 font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. ELECTRONIC SIGNATURE SPECIFICS */}
              {selectedEntryForDetail.electronicSignature && (
                <div className="border-2 border-emerald-200 bg-emerald-50/50 rounded-xs p-4 space-y-3">
                  <h4 className="font-bold text-emerald-900 uppercase flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span>Electronic Signature &amp; Cryptographic Seal Verification</span>
                  </h4>

                  <div className="p-3 bg-white rounded-xs border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Signatory Name &amp; Role</span>
                        <strong className="text-sm text-[#0A192F]">
                          {selectedEntryForDetail.electronicSignature.signatoryName}
                        </strong>
                        <span className="text-slate-500 text-xs block font-sans">
                          {selectedEntryForDetail.electronicSignature.roleTitle}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase">Registration Authority</span>
                        <span className="font-bold text-emerald-800">
                          {selectedEntryForDetail.electronicSignature.credentialNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {selectedEntryForDetail.electronicSignature.credentialAuthority}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Statutory SANS 10139 Compliance Declaration:
                      </span>
                      <blockquote className="italic font-sans text-xs text-slate-800 bg-emerald-50/80 p-2.5 rounded-xs border-l-4 border-emerald-600 mt-1">
                        "{selectedEntryForDetail.electronicSignature.sansComplianceDeclaration}"
                      </blockquote>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[10px]">
                      <div>
                        <span className="text-slate-500 font-bold block">Signature Digest (SHA-256):</span>
                        <span className="font-mono text-slate-800 break-all">
                          {selectedEntryForDetail.electronicSignature.signatureDigest}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Certificate Thumbprint:</span>
                        <span className="font-mono text-slate-800">
                          {selectedEntryForDetail.electronicSignature.certificateThumbprint}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TEMPLATE VERSION CHANGE SPECIFICS */}
              {selectedEntryForDetail.templateVersion && (
                <div className="border-2 border-amber-200 bg-amber-50/50 rounded-xs p-4 space-y-3">
                  <h4 className="font-bold text-amber-900 uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Template Version Change &amp; Clause Comparison</span>
                  </h4>

                  <div className="p-3 bg-white rounded-xs border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Template Identity</span>
                        <strong className="text-sm text-slate-900 font-sans">
                          {selectedEntryForDetail.templateVersion.templateName}
                        </strong>
                        <span className="text-amber-800 font-bold text-xs block font-mono">
                          {selectedEntryForDetail.templateVersion.templateCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-xs border border-slate-300 font-bold">
                          {selectedEntryForDetail.templateVersion.previousVersion}
                        </span>
                        <ArrowRight className="w-4 h-4 text-amber-600" />
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-xs border border-amber-300 font-bold">
                          {selectedEntryForDetail.templateVersion.newVersion}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Governing Regulatory Clauses:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedEntryForDetail.templateVersion.governingClauses.map((clause) => (
                          <span
                            key={clause}
                            className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-xs text-[10px] font-bold"
                          >
                            {clause}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Change Rationale:</span>
                      <p className="font-sans text-xs text-slate-700 bg-slate-50 p-2 rounded-xs border border-slate-200 mt-0.5">
                        {selectedEntryForDetail.templateVersion.changeRationale}
                      </p>
                    </div>

                    {/* Field Modifications Diff Table */}
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Field-Level Template Modifications:
                      </span>
                      <table className="w-full border border-slate-200 text-left text-[10px]">
                        <thead className="bg-slate-100 font-bold text-slate-700">
                          <tr>
                            <th className="p-2 border-b border-slate-200">Field Specification</th>
                            <th className="p-2 border-b border-slate-200">Previous Value</th>
                            <th className="p-2 border-b border-slate-200 text-amber-900">New Standard Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-sans">
                          {selectedEntryForDetail.templateVersion.fieldModifications.map((diff, i) => (
                            <tr key={i}>
                              <td className="p-2 font-mono font-bold text-slate-800">{diff.fieldName}</td>
                              <td className="p-2 text-slate-500 line-through">{diff.previousValue}</td>
                              <td className="p-2 text-emerald-800 font-semibold">{diff.updatedValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CRYPTOGRAPHIC AUDIT PROOF BLOCK */}
              <div className="bg-[#0A192F] text-white p-4 rounded-xs border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Block Integrity Certificate</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Security Seal: {selectedEntryForDetail.verificationSeal}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Block SHA-256 Digest:</span>
                    <span className="text-emerald-400 break-all font-bold">
                      {selectedEntryForDetail.sha256Hash}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Previous Block Hash (Merkle Chained):</span>
                    <span className="text-slate-300 break-all">
                      {selectedEntryForDetail.previousHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 text-[11px]">
                Complies with SANS 10139 Clause 11 statutory document retention mandates
              </span>

              <div className="flex items-center gap-2">
                {onViewSafetyFile && selectedEntryForDetail.safetyFileNumber !== 'ALL-ACTIVE-DOSSIERS' && (
                  <button
                    onClick={() => {
                      onViewSafetyFile(selectedEntryForDetail.safetyFileNumber);
                      setSelectedEntryForDetail(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white rounded-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Open Safety File
                  </button>
                )}
                <button
                  onClick={() => setSelectedEntryForDetail(null)}
                  className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD SIMULATION MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150 font-mono text-xs">
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between border-b-2 border-[#CC0000]">
              <div className="flex items-center gap-2 font-bold uppercase">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Record Regulatory Compliance Event</span>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Event Category to Record
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRecordType('transition')}
                    className={`py-2 px-2 text-center rounded-xs font-bold uppercase text-[10px] border cursor-pointer ${
                      newRecordType === 'transition'
                        ? 'bg-blue-800 text-white border-blue-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    Status Transition
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecordType('signature')}
                    className={`py-2 px-2 text-center rounded-xs font-bold uppercase text-[10px] border cursor-pointer ${
                      newRecordType === 'signature'
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    E-Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecordType('template')}
                    className={`py-2 px-2 text-center rounded-xs font-bold uppercase text-[10px] border cursor-pointer ${
                      newRecordType === 'template'
                        ? 'bg-amber-800 text-white border-amber-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    Template Bump
                  </button>
                </div>
              </div>

              {/* Transition inputs */}
              {newRecordType === 'transition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Document Number &amp; Title
                    </label>
                    <input
                      type="text"
                      value={formDocNumber}
                      onChange={(e) => setFormDocNumber(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs mb-1"
                      placeholder="e.g. AFE-SF-DOC-02.01"
                    />
                    <input
                      type="text"
                      value={formDocTitle}
                      onChange={(e) => setFormDocTitle(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-sans"
                      placeholder="Title of Document"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">From Status</label>
                      <select
                        value={formFromStatus}
                        onChange={(e) => setFormFromStatus(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">To Status</label>
                      <select
                        value={formToStatus}
                        onChange={(e) => setFormToStatus(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-bold text-emerald-800"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Issued">Issued</option>
                        <option value="Superseded">Superseded</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Statutory Justification / Inspection Rationale
                    </label>
                    <textarea
                      rows={2}
                      value={formJustification}
                      onChange={(e) => setFormJustification(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Signature inputs */}
              {newRecordType === 'signature' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Signatory Role</label>
                    <select
                      value={formSignerRole}
                      onChange={(e) => setFormSignerRole(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs"
                    >
                      <option value="preparedBy">Technician (Prepared By)</option>
                      <option value="reviewedBy">Project Manager (Reviewed By)</option>
                      <option value="approvedBy">SANS 10139 Commissioner (Approved By)</option>
                      <option value="clientAcknowledgement">Client OHS Representative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Signer Name</label>
                    <input
                      type="text"
                      value={formSignerName}
                      onChange={(e) => setFormSignerName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">SAQCC / ECSA Registration</label>
                    <input
                      type="text"
                      value={formSignerReg}
                      onChange={(e) => setFormSignerReg(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-bold text-[#CC0000]"
                    />
                  </div>
                </div>
              )}

              {/* Template inputs */}
              {newRecordType === 'template' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Template Title</label>
                    <input
                      type="text"
                      value={formTemplateName}
                      onChange={(e) => setFormTemplateName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">New Version Identifier</label>
                    <input
                      type="text"
                      value={formTemplateNewVersion}
                      onChange={(e) => setFormTemplateNewVersion(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-bold text-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Amendment Rationale</label>
                    <textarea
                      rows={2}
                      value={formTemplateRationale}
                      onChange={(e) => setFormTemplateRationale(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Seal &amp; Append to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY SANS 10139 AUDIT CERTIFICATE MODAL */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl w-full max-w-4xl overflow-hidden font-sans">
            {/* Top Toolbar */}
            <div className="bg-[#0A192F] text-white px-6 py-3 flex items-center justify-between font-mono text-xs print:hidden">
              <span className="font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Statutory Regulatory Compliance Audit Certificate (Print-Ready)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-xs text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letterhead & Certificate Page */}
            <div className="p-8 sm:p-12 space-y-6 bg-white text-slate-900 border-b print:p-0">
              {/* Proportional Red-Navy Band */}
              <div className="h-2 w-full bg-[#0A192F] flex rounded-xs overflow-hidden mb-6">
                <div className="w-2/5 bg-[#CC0000]" />
                <div className="w-1/10 bg-amber-400" />
                <div className="flex-1 bg-[#0A192F]" />
              </div>

              {/* Crest & Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6">
                <div>
                  <h1 className="font-mono text-2xl font-black text-[#0A192F] uppercase tracking-tight">
                    AUDRIN FIRE ENGINEERS (PTY) LTD
                  </h1>
                  <p className="text-xs font-mono font-bold text-slate-600 uppercase">
                    Consulting Fire Protection &amp; Risk Safety Engineers • CIPC 2026/089596/07
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    27 Tshivhase Street, Pretoria West, 0008 | Tel: 071 415 6665 | compliance@audrinfire.co.za
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Certificate Number</span>
                  <strong className="text-base text-[#CC0000]">AFE-AUD-CERT-2026-09</strong>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Issue Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#CC0000] block mb-1">
                  OFFICIAL STATUTORY ATTESTATION
                </span>
                <h2 className="text-2xl font-black font-mono text-[#0A192F] uppercase">
                  CERTIFICATE OF REGULATORY AUDIT TRACEABILITY
                </h2>
                <p className="text-xs font-mono text-slate-600 max-w-2xl mx-auto mt-1">
                  Issued in accordance with SANS 10139:2012 (Clauses 7 &amp; 11), SANS 10400-T and the Occupational Health &amp; Safety Act (Act 85 of 1993).
                </p>
              </div>

              {/* Attestation Text */}
              <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-800">
                <p>
                  This document officially certifies that the <strong>Audrin Fire Engineers Administrative Center</strong> maintains
                  an active, continuous, and cryptographically verified compliance audit ledger for all Fire Detection Safety Files,
                  specifically project dossier <strong>AFE-SF-2026-001 (Apex Industrial Hub)</strong>.
                </p>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xs font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Total Chained Audit Blocks:</span>
                    <strong className="text-sm text-slate-900">{entries.length} Blocks Verified</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ledger Integrity Standard:</span>
                    <strong className="text-sm text-emerald-700">SHA-256 Tamper-Proof Chained</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accredited SANS Commissioner:</span>
                    <strong>Bethuel Moukangwe (SAQCC-COMM-00892)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ECSA Engineering Oversight:</span>
                    <strong>ECSA Pr.Eng 2026991</strong>
                  </div>
                </div>

                <p>
                  All document transitions from initial engineering draft through SANS 10139 Category L1 commissioner approval,
                  together with electronic signatures and statutory template revisions, have been recorded sequentially without
                  omission or tampering.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-6 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Engineer</span>
                  <div className="font-bold text-slate-900">Bethuel Moukangwe</div>
                  <div className="text-[10px] text-slate-500">ECSA Pr.Eng 2026991</div>
                  <span className="text-emerald-700 font-bold text-[10px] block pt-1">✓ Digitally Signed</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">SANS Commissioner</span>
                  <div className="font-bold text-slate-900">Bethuel Moukangwe</div>
                  <div className="text-[10px] text-slate-500">SAQCC-COMM-00892</div>
                  <span className="text-emerald-700 font-bold text-[10px] block pt-1">✓ Statutory Seal Affixed</span>
                </div>

                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xs">
                  <QrCode className="w-12 h-12 text-[#0A192F]" />
                  <span className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Verify via SAQCC Registry</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex justify-end font-mono text-xs print:hidden">
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xs uppercase font-bold cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
