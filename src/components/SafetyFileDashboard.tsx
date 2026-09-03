import React, { useState, useMemo } from 'react';
import { SafetyFile, SafetyFileStatus, SafetyFileDocument } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import { complianceAuditService } from '../services/complianceAuditService';
import { SafetyFileCard } from './SafetyFileCard';
import { SafetyFileViewerModal } from './SafetyFileViewerModal';
import { SafetyFilePrintPreviewModal } from './SafetyFilePrintPreviewModal';
import { SafetyFileEmailModal } from './SafetyFileEmailModal';
import { QuickDocumentDownloadModal } from './QuickDocumentDownloadModal';
import { RequestSignatureModal } from './RequestSignatureModal';
import { UploadEvidenceModal } from './UploadEvidenceModal';
import {
  ShieldCheck,
  Flame,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpDown,
  Filter,
  Grid,
  List,
  RefreshCw,
  Printer,
  Download,
  Mail,
  ExternalLink,
  Plus,
  FileCheck2,
  FileText,
  Lock,
  FileSpreadsheet,
  Check,
  BarChart3,
  Building,
  MapPin,
  UserCheck,
  PenTool,
  Upload,
  Calendar,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  FileWarning
} from 'lucide-react';

export interface SafetyFileDashboardProps {
  safetyFiles?: SafetyFile[];
  onOpenSafetyFile?: (safetyFile: SafetyFile) => void;
  onPrintPreview?: (safetyFile: SafetyFile) => void;
  onDownloadPdf?: (safetyFile: SafetyFile) => void;
  onEmail?: (safetyFile: SafetyFile) => void;
  onViewComplianceAudit?: () => void;
  onViewCover?: (safetyFile: SafetyFile) => void;
  currentUserRole?: string;
  currentUserName?: string;
  className?: string;
  showStatCards?: boolean;
}

export const SafetyFileDashboard: React.FC<SafetyFileDashboardProps> = ({
  safetyFiles: propSafetyFiles,
  onOpenSafetyFile,
  onPrintPreview,
  onDownloadPdf,
  onEmail,
  onViewComplianceAudit,
  onViewCover,
  currentUserRole = 'customer',
  currentUserName = 'Client Safety Officer',
  className = '',
  showStatCards = true
}) => {
  // State for all safety files (defaulting to service if not provided)
  const [internalFiles, setInternalFiles] = useState<SafetyFile[]>(() =>
    propSafetyFiles || safetyFileService.getAllSafetyFiles()
  );

  // Sync if prop updates
  const files = propSafetyFiles || internalFiles;

  // Multi-tier filter states (Client, Site, Contract, Project)
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Search, status, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Under Review' | 'Draft' | 'gaps'>('all');
  const [sortBy, setSortBy] = useState<'completion_desc' | 'completion_asc' | 'updated' | 'name'>('completion_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<'2-col' | '3-col'>('2-col');

  // Active dossier selected for detailed milestone & client branding panels
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');

  // Modal active states
  const [selectedViewerFile, setSelectedViewerFile] = useState<SafetyFile | null>(null);
  const [selectedPrintFile, setSelectedPrintFile] = useState<SafetyFile | null>(null);
  const [selectedEmailFile, setSelectedEmailFile] = useState<SafetyFile | null>(null);
  const [quickDocModalFile, setQuickDocModalFile] = useState<SafetyFile | null>(null);
  const [signatureReqModalFile, setSignatureReqModalFile] = useState<SafetyFile | null>(null);
  const [uploadEvidenceModalFile, setUploadEvidenceModalFile] = useState<SafetyFile | null>(null);

  // Expandable sections toggles
  const [showMilestonesPanel, setShowMilestonesPanel] = useState(true);
  const [showSourceReferences, setShowSourceReferences] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(true);
  const [showActivityPanel, setShowActivityPanel] = useState(true);

  // Toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive unique options for multi-tier filters
  const uniqueClients = useMemo(() => {
    const set = new Set(files.map(f => f.clientCompanyName).filter(Boolean));
    return Array.from(set).sort();
  }, [files]);

  const uniqueSites = useMemo(() => {
    const filteredByClient = clientFilter === 'all'
      ? files
      : files.filter(f => f.clientCompanyName === clientFilter);
    const set = new Set(filteredByClient.map(f => f.siteName).filter(Boolean));
    return Array.from(set).sort();
  }, [files, clientFilter]);

  const uniqueContracts = useMemo(() => {
    const set = new Set(files.map(f => f.contractNumber).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [files]);

  const uniqueProjects = useMemo(() => {
    const set = new Set(files.map(f => f.projectName).filter(Boolean));
    return Array.from(set).sort();
  }, [files]);

  // Active safety file for detailed context
  const activeFile = useMemo(() => {
    return files.find(f => f.id === selectedFileId) || files[0] || null;
  }, [files, selectedFileId]);

  // Filter and sort the files
  const filteredFiles = useMemo(() => {
    return files
      .filter(f => {
        // Multi-tier filters
        if (clientFilter !== 'all' && f.clientCompanyName !== clientFilter) return false;
        if (siteFilter !== 'all' && f.siteName !== siteFilter) return false;
        if (contractFilter !== 'all' && f.contractNumber !== contractFilter) return false;
        if (projectFilter !== 'all' && f.projectName !== projectFilter) return false;

        // Search query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          f.projectName.toLowerCase().includes(q) ||
          f.siteName.toLowerCase().includes(q) ||
          f.safetyFileNumber.toLowerCase().includes(q) ||
          f.responsibleTechnician.toLowerCase().includes(q) ||
          f.clientCompanyName.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // Status filter
        if (statusFilter === 'all') return true;
        if (statusFilter === 'gaps') {
          const m = safetyFileService.getSafetyFileMetrics(f);
          return m.missingCount > 0 || m.expiredCount > 0;
        }
        return f.status === statusFilter;
      })
      .sort((a, b) => {
        const metricsA = safetyFileService.getSafetyFileMetrics(a);
        const metricsB = safetyFileService.getSafetyFileMetrics(b);

        if (sortBy === 'completion_desc') {
          return metricsB.completionPercentage - metricsA.completionPercentage;
        }
        if (sortBy === 'completion_asc') {
          return metricsA.completionPercentage - metricsB.completionPercentage;
        }
        if (sortBy === 'updated') {
          return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
        }
        if (sortBy === 'name') {
          return a.projectName.localeCompare(b.projectName);
        }
        return 0;
      });
  }, [files, clientFilter, siteFilter, contractFilter, projectFilter, searchQuery, statusFilter, sortBy]);

  // Comprehensive Metrics across filtered scope
  const dashboardStats = useMemo(() => {
    const totalProjects = filteredFiles.length;
    let totalMandatory = 0;
    let totalApproved = 0;
    let totalDraft = 0;
    let totalAwaitingSignature = 0;
    let totalRejected = 0;
    let totalExpired = 0;
    let totalSuperseded = 0;
    let totalMissing = 0;

    let approvedProjects = 0;
    let underReviewProjects = 0;
    let draftProjects = 0;
    let totalSans10139Score = 0;
    let totalSans10400TScore = 0;

    filteredFiles.forEach(f => {
      const m = safetyFileService.getSafetyFileMetrics(f);
      totalMandatory += m.mandatoryCount;
      totalApproved += m.approvedCount;
      totalDraft += m.draftCount;
      totalAwaitingSignature += m.awaitingSignatureCount;
      totalRejected += m.rejectedCount;
      totalExpired += m.expiredCount;
      totalSuperseded += m.supersededCount;
      totalMissing += m.missingCount;

      totalSans10139Score += m.sans10139Progress;
      totalSans10400TScore += m.sans10400TProgress;

      if (f.status === 'Approved' || f.status === 'Issued') approvedProjects++;
      else if (f.status === 'Under Review') underReviewProjects++;
      else draftProjects++;
    });

    const averageCompletion = totalMandatory > 0
      ? Math.round((totalApproved / totalMandatory) * 100)
      : 0;

    const avgSans10139 = totalProjects > 0 ? Math.round(totalSans10139Score / totalProjects) : 0;
    const avgSans10400T = totalProjects > 0 ? Math.round(totalSans10400TScore / totalProjects) : 0;

    const approvedPct = totalProjects > 0 ? Math.round((approvedProjects / totalProjects) * 100) : 0;
    const underReviewPct = totalProjects > 0 ? Math.round((underReviewProjects / totalProjects) * 100) : 0;
    const draftPct = totalProjects > 0 ? Math.round((draftProjects / totalProjects) * 100) : 0;

    return {
      totalProjects,
      averageCompletion,
      totalApproved,
      totalDraft,
      totalAwaitingSignature,
      totalRejected,
      totalExpired,
      totalSuperseded,
      totalMissing,
      approvedProjects,
      underReviewProjects,
      draftProjects,
      approvedPct,
      underReviewPct,
      draftPct,
      avgSans10139,
      avgSans10400T
    };
  }, [filteredFiles]);

  // Aggregate missing documents and expired certificates for alerts panel
  const missingAlerts = useMemo(() => {
    const list: Array<{
      file: SafetyFile;
      doc: SafetyFileDocument;
      sectionNum: number;
      sectionTitle: string;
    }> = [];

    filteredFiles.forEach(f => {
      f.sections.forEach(sec => {
        sec.documents.forEach(doc => {
          if (doc.status === 'Missing' || (doc.isMandatory && !doc.isApproved && doc.status !== 'Approved' && doc.status !== 'Issued' && doc.pageCount === 0)) {
            list.push({ file: f, doc, sectionNum: sec.sectionNumber, sectionTitle: sec.title });
          }
        });
      });
    });
    return list;
  }, [filteredFiles]);

  const expiredAlerts = useMemo(() => {
    const now = new Date();
    const list: Array<{
      file: SafetyFile;
      doc: SafetyFileDocument;
      sectionNum: number;
      sectionTitle: string;
      daysRemaining: number;
    }> = [];

    filteredFiles.forEach(f => {
      f.sections.forEach(sec => {
        sec.documents.forEach(doc => {
          if (doc.isExpired || (doc.expiryDate && new Date(doc.expiryDate) < now)) {
            const exp = doc.expiryDate ? new Date(doc.expiryDate) : now;
            const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            list.push({ file: f, doc, sectionNum: sec.sectionNumber, sectionTitle: sec.title, daysRemaining: diffDays });
          }
        });
      });
    });
    return list;
  }, [filteredFiles]);

  // Statutory Milestones for active file (with fallback standard sequence)
  const activeMilestones = useMemo(() => {
    if (!activeFile) return [];
    if (activeFile.milestones && activeFile.milestones.length > 0) {
      return activeFile.milestones;
    }

    const isCommSigned = Boolean(
      activeFile.approvals.commissioner?.isSigned || activeFile.approvals.approvedBy?.isSigned
    );
    const isTechSigned = Boolean(
      activeFile.approvals.technician?.isSigned || activeFile.approvals.preparedBy?.isSigned
    );
    const isPMSigned = Boolean(
      activeFile.approvals.projectManager?.isSigned || activeFile.approvals.reviewedBy?.isSigned
    );
    const isClientSigned = Boolean(
      activeFile.approvals.clientRepresentative?.isSigned || activeFile.approvals.clientAcknowledgement?.isSigned
    );

    return [
      {
        id: 'ms-1',
        name: 'Baseline HIRA & Section 37.2 Agreement',
        category: 'OHS Act' as const,
        standardClause: 'OHS Act Section 37.2 / SANS 10139 Clause 5',
        responsiblePerson: activeFile.responsibleTechnician,
        responsibleRole: 'Lead Fire Detection Specialist',
        targetDate: '2026-08-15',
        completionDate: isTechSigned ? '2026-08-15' : undefined,
        status: (isTechSigned ? 'Completed' : 'In Progress') as 'Completed' | 'In Progress' | 'Overdue' | 'Scheduled',
        evidenceDocumentNumber: 'AFE-SF-DOC-03.01'
      },
      {
        id: 'ms-2',
        name: 'Loop Cable Continuity & 500V DC Insulation Resistance Testing',
        category: 'SANS 10139' as const,
        standardClause: 'SANS 10139:2012 Clause 8.2',
        responsiblePerson: activeFile.responsibleTechnician,
        responsibleRole: `SAQCC Reg: ${activeFile.responsibleTechnicianSaqcc}`,
        targetDate: '2026-08-20',
        completionDate: '2026-08-20',
        status: 'Completed' as const,
        evidenceDocumentNumber: 'AFE-SF-DOC-08.01'
      },
      {
        id: 'ms-3',
        name: 'Cause & Effect Matrix & HVAC Interlock Interface Commissioning',
        category: 'SANS 10400-T' as const,
        standardClause: 'SANS 10400-T:2020 Section 4.34 & Table 9',
        responsiblePerson: 'Bethuel Moukangwe (Pr.Eng)',
        responsibleRole: 'Project & Safety Manager',
        targetDate: '2026-08-25',
        completionDate: isPMSigned ? '2026-08-24' : undefined,
        status: (isPMSigned ? 'Completed' : 'In Progress') as 'Completed' | 'In Progress' | 'Overdue' | 'Scheduled',
        evidenceDocumentNumber: 'AFE-SF-DOC-10.01'
      },
      {
        id: 'ms-4',
        name: 'Sound Pressure Audibility Survey (65 dBA / 75 dBA Bed-Head)',
        category: 'SANS 10139' as const,
        standardClause: 'SANS 10139:2012 Clause 11.3',
        responsiblePerson: 'Acoustic Compliance Assessor',
        responsibleRole: 'Audrin Quality Assurance',
        targetDate: '2026-08-28',
        completionDate: undefined,
        status: 'In Progress' as const,
        evidenceDocumentNumber: 'AFE-SF-DOC-10.02'
      },
      {
        id: 'ms-5',
        name: 'Authorised SANS 10139 Commissioner Sign-Off (MANDATORY GATE)',
        category: 'SANS 10139' as const,
        standardClause: 'SANS 10139:2012 Clause 13.2',
        responsiblePerson: activeFile.authorisedCommissioner,
        responsibleRole: `SAQCC Comm: ${activeFile.authorisedCommissionerSaqcc}`,
        targetDate: '2026-08-30',
        completionDate: isCommSigned ? activeFile.approvals.approvedBy?.signedAt?.split('T')[0] : undefined,
        status: (isCommSigned ? 'Completed' : 'Overdue') as 'Completed' | 'In Progress' | 'Overdue' | 'Scheduled',
        evidenceDocumentNumber: 'AFE-SF-DOC-13.01'
      },
      {
        id: 'ms-6',
        name: 'OHS Act Section 16.2 Client Handover & Emergency Training',
        category: 'OHS Act' as const,
        standardClause: 'OHS Act Section 16.2 / SANS 10139 Clause 15',
        responsiblePerson: activeFile.clientRepresentative,
        responsibleRole: activeFile.emergencyContacts.siteSafetyOfficerName || 'Client Safety Officer',
        targetDate: '2026-09-05',
        completionDate: isClientSigned ? activeFile.approvals.clientAcknowledgement?.signedAt?.split('T')[0] : undefined,
        status: (isClientSigned ? 'Completed' : 'Scheduled') as 'Completed' | 'In Progress' | 'Overdue' | 'Scheduled',
        evidenceDocumentNumber: 'AFE-SF-DOC-15.01'
      }
    ];
  }, [activeFile]);

  // Action handlers
  const handleOpen = (file: SafetyFile) => {
    setSelectedFileId(file.id);
    if (onOpenSafetyFile) {
      onOpenSafetyFile(file);
    } else {
      setSelectedViewerFile(file);
    }
  };

  const handlePrint = (file: SafetyFile) => {
    showToast(`Opening SANS 10139 Print Preview for ${file.safetyFileNumber}...`, 'info');
    if (onPrintPreview) {
      onPrintPreview(file);
    } else {
      setSelectedPrintFile(file);
    }
  };

  const handleDownload = (file: SafetyFile) => {
    showToast(`Compiling SANS 10139 Dossier PDF for ${file.safetyFileNumber}...`, 'info');
    if (onDownloadPdf) {
      onDownloadPdf(file);
    } else {
      setSelectedPrintFile(file);
    }
  };

  const handleEmail = (file: SafetyFile) => {
    showToast(`Preparing email dispatch for ${file.safetyFileNumber}...`, 'info');
    if (onEmail) {
      onEmail(file);
    } else {
      setSelectedEmailFile(file);
    }
  };

  const handleFileUpdated = (updated: SafetyFile) => {
    setInternalFiles(prev => prev.map(f => (f.id === updated.id ? updated : f)));
    if (selectedViewerFile?.id === updated.id) {
      setSelectedViewerFile(updated);
    }
    showToast(`Safety File ${updated.safetyFileNumber} updated successfully.`, 'success');
  };

  const resetAllFilters = () => {
    setClientFilter('all');
    setSiteFilter('all');
    setContractFilter('all');
    setProjectFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    showToast('All filters have been reset.', 'info');
  };

  // Export CSV Statutory Register
  const handleExportCsvRegister = () => {
    const headers = [
      'Safety File Number',
      'Project Name',
      'Contract Number',
      'Site Name',
      'Client Company',
      'Occupancy Class',
      'System Category',
      'Status',
      'Completion %',
      'Approved Docs',
      'Mandatory Docs',
      'Missing Docs',
      'Expired Docs',
      'SANS 10139 %',
      'SANS 10400-T %',
      'Responsible Tech',
      'Tech SAQCC',
      'Commissioner',
      'Comm SAQCC',
      'Last Audit Date'
    ];

    const rows = filteredFiles.map(f => {
      const m = safetyFileService.getSafetyFileMetrics(f);
      return [
        `"${f.safetyFileNumber}"`,
        `"${f.projectName.replace(/"/g, '""')}"`,
        `"${f.contractNumber || ''}"`,
        `"${f.siteName.replace(/"/g, '""')}"`,
        `"${f.clientCompanyName.replace(/"/g, '""')}"`,
        `"${f.buildingOccupancyClass || 'A1'}"`,
        `"${f.systemCategory || 'Category L1'}"`,
        `"${f.status}"`,
        `"${m.completionPercentage}%"`,
        `"${m.approvedCount}"`,
        `"${m.mandatoryCount}"`,
        `"${m.missingCount}"`,
        `"${m.expiredCount}"`,
        `"${m.sans10139Progress}%"`,
        `"${m.sans10400TProgress}%"`,
        `"${f.responsibleTechnician}"`,
        `"${f.responsibleTechnicianSaqcc}"`,
        `"${f.authorisedCommissioner}"`,
        `"${f.authorisedCommissionerSaqcc}"`,
        `"${new Date(f.lastUpdatedAt).toLocaleDateString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SANS_10139_Safety_File_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('SANS 10139 Statutory Register exported to CSV.', 'success');
  };

  return (
    <div id="safety-file-dashboard" className={`space-y-6 font-sans ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="dashboard-action-toast"
          className={`p-3.5 rounded-xs border text-xs font-mono flex items-center justify-between shadow-md transition-all animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/90 border-blue-500/50 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-3 text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Header & Statutory Branding: Geometric Balance Standard */}
      <div className="bg-[#0A192F] border-2 border-slate-800 text-white p-6 rounded-xs shadow-lg space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider">
                SANS 10139:2012 / SANS 10400-T:2020
              </span>
              <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider">
                16 Statutory Sections
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider">
                Audrin Fire Engineers Governance
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>Fire Detection Safety File Dashboard</span>
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Real-time statutory oversight of fire detection dossiers, 16 mandatory completion sections, SAQCC technician registrations, and accredited commissioner sign-offs.
            </p>
          </div>

          {/* Portfolio-Wide Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-csv-register"
              onClick={handleExportCsvRegister}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow-xs"
              title="Export complete SANS 10139 project register as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Register</span>
            </button>

            <button
              id="btn-print-portfolio-summary"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow-xs"
              title="Print Portfolio Overview"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Overview</span>
            </button>

            {onViewComplianceAudit && (
              <button
                id="btn-safety-dashboard-compliance-audit"
                onClick={onViewComplianceAudit}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow-xs"
                title="View granular immutable compliance audit trail"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Trail</span>
              </button>
            )}

            {activeFile && (
              <button
                id="btn-open-primary-dossier"
                onClick={() => handleOpen(activeFile)}
                className="px-4 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono text-xs font-bold rounded-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Open Controlled Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* STATUTORY MANDATE BANNER: Commissioner Approval Gate */}
        <div className="p-3 bg-amber-500/15 border-l-4 border-amber-400 rounded-r-xs text-amber-200 text-xs font-mono flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">STATUTORY GOVERNANCE MANDATE:</strong> A safety dossier is marked <span className="text-emerald-400 font-bold">"Compliant"</span> only when all 16 sections are complete AND accredited SAQCC Commissioner approval is formally executed. Section completion alone does not confer compliance.
          </div>
        </div>

        {/* High-Density Overall Compliance Percentage & Standards Progress */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* 1. Overall Compliance Percentage Gauge */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Overall Compliance</span>
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {dashboardStats.averageCompletion}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-xs overflow-hidden border border-slate-800">
              <div
                style={{ width: `${dashboardStats.averageCompletion}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{dashboardStats.totalApproved} / {dashboardStats.totalApproved + dashboardStats.totalDraft + dashboardStats.totalMissing} Approved</span>
              <span className="text-emerald-400 font-bold">
                {dashboardStats.approvedProjects} Dossiers Certified
              </span>
            </div>
          </div>

          {/* 2. Separate Progress Indicator: SANS 10139 */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-400" />
                <span>SANS 10139 Progress</span>
              </span>
              <span className="text-xl font-bold text-white">
                {dashboardStats.avgSans10139}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-xs overflow-hidden border border-slate-800">
              <div
                style={{ width: `${dashboardStats.avgSans10139}%` }}
                className="h-full bg-red-500 transition-all duration-500"
              />
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              Fire detection design, loop wiring, sounders &amp; commissioning
            </div>
          </div>

          {/* 3. Separate Progress Indicator: SANS 10400-T */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-400" />
                <span>SANS 10400-T Progress</span>
              </span>
              <span className="text-xl font-bold text-white">
                {dashboardStats.avgSans10400T}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-xs overflow-hidden border border-slate-800">
              <div
                style={{ width: `${dashboardStats.avgSans10400T}%` }}
                className="h-full bg-blue-500 transition-all duration-500"
              />
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              Building fire protection, passive barriers, escape signage &amp; HVAC
            </div>
          </div>
        </div>

        {/* Status Distribution Segmented Bar */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="uppercase font-bold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Portfolio Status Tracking ({dashboardStats.totalProjects} Projects)</span>
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                <strong className="text-white">{dashboardStats.approvedProjects}</strong> Approved ({dashboardStats.approvedPct}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                <strong className="text-white">{dashboardStats.underReviewProjects}</strong> Under Review ({dashboardStats.underReviewPct}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 inline-block" />
                <strong className="text-white">{dashboardStats.draftProjects}</strong> Draft ({dashboardStats.draftPct}%)
              </span>
            </div>
          </div>

          {/* Multi-segment Geometric Progress Bar */}
          <div className="h-2.5 w-full bg-slate-950 rounded-xs overflow-hidden flex border border-slate-800">
            {dashboardStats.approvedPct > 0 && (
              <div
                style={{ width: `${dashboardStats.approvedPct}%` }}
                className="h-full bg-emerald-500 hover:opacity-85 transition-opacity cursor-pointer"
                title={`Click to filter: Approved (${dashboardStats.approvedProjects})`}
                onClick={() => setStatusFilter('Approved')}
              />
            )}
            {dashboardStats.underReviewPct > 0 && (
              <div
                style={{ width: `${dashboardStats.underReviewPct}%` }}
                className="h-full bg-amber-500 hover:opacity-85 transition-opacity cursor-pointer"
                title={`Click to filter: Under Review (${dashboardStats.underReviewProjects})`}
                onClick={() => setStatusFilter('Under Review')}
              />
            )}
            {dashboardStats.draftPct > 0 && (
              <div
                style={{ width: `${dashboardStats.draftPct}%` }}
                className="h-full bg-slate-500 hover:opacity-85 transition-opacity cursor-pointer"
                title={`Click to filter: Draft (${dashboardStats.draftProjects})`}
                onClick={() => setStatusFilter('Draft')}
              />
            )}
          </div>
        </div>

        {/* Document Status Metrics: Draft, Awaiting Signature, Approved, Rejected, Expired and Superseded */}
        {showStatCards && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800 text-xs font-mono">
            {/* 1. Approved */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Approved</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {dashboardStats.totalApproved}
              </div>
              <div className="text-[9px] text-slate-500">Certified Docs</div>
            </div>

            {/* 2. Awaiting Signature */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <PenTool className="w-3 h-3 text-amber-400" />
                <span>Awaiting Sig</span>
              </div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {dashboardStats.totalAwaitingSignature}
              </div>
              <div className="text-[9px] text-slate-500">Action Required</div>
            </div>

            {/* 3. Draft */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Draft</span>
              </div>
              <div className="text-xl font-bold text-slate-200 mt-1">
                {dashboardStats.totalDraft}
              </div>
              <div className="text-[9px] text-slate-500">In Preparation</div>
            </div>

            {/* 4. Rejected */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span>Rejected</span>
              </div>
              <div className="text-xl font-bold text-red-400 mt-1">
                {dashboardStats.totalRejected}
              </div>
              <div className="text-[9px] text-slate-500">Requires Revision</div>
            </div>

            {/* 5. Expired */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span>Expired</span>
              </div>
              <div className="text-xl font-bold text-orange-400 mt-1">
                {dashboardStats.totalExpired}
              </div>
              <div className="text-[9px] text-slate-500">Calibration / Card</div>
            </div>

            {/* 6. Superseded */}
            <div className="p-3 bg-slate-950/75 border border-slate-800 rounded-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>Superseded</span>
              </div>
              <div className="text-xl font-bold text-blue-300 mt-1">
                {dashboardStats.totalSuperseded}
              </div>
              <div className="text-[9px] text-slate-500">Previous Revisions</div>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC QUICK ACTIONS PANEL */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xs shadow-md space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Statutory Quick Actions</span>
            {activeFile && (
              <span className="text-[11px] text-slate-400 font-normal">
                (Target: <strong className="text-white">{activeFile.safetyFileNumber}</strong> - {activeFile.projectName})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSourceReferences(!showSourceReferences)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xs text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>{showSourceReferences ? 'Hide Standards Ref' : 'Verified Source Ref'}</span>
            </button>
          </div>
        </div>

        {/* 6 Core Quick Action Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* 1. Print Preview */}
          <button
            id="btn-quick-action-print-preview"
            onClick={() => activeFile && handlePrint(activeFile)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-slate-600 transition-all text-center"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] uppercase">Print Preview</span>
          </button>

          {/* 2. Download Complete Safety-File PDF */}
          <button
            id="btn-quick-action-download-pdf"
            onClick={() => activeFile && handleDownload(activeFile)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-slate-600 transition-all text-center"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] uppercase">Download Full PDF</span>
          </button>

          {/* 3. Download Selected Document */}
          <button
            id="btn-quick-action-download-selected"
            onClick={() => activeFile && setQuickDocModalFile(activeFile)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-slate-600 transition-all text-center"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] uppercase">Select Document</span>
          </button>

          {/* 4. Email Dossier to Client Safety Officer */}
          <button
            id="btn-quick-action-email-dossier"
            onClick={() => activeFile && handleEmail(activeFile)}
            className="p-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-center"
          >
            <Mail className="w-4 h-4" />
            <span className="text-[11px] uppercase">Email Safety Officer</span>
          </button>

          {/* 5. Request Electronic Signatures */}
          <button
            id="btn-quick-action-request-signature"
            onClick={() => activeFile && setSignatureReqModalFile(activeFile)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-slate-600 transition-all text-center"
          >
            <PenTool className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] uppercase">Request Signatures</span>
          </button>

          {/* 6. Upload Supporting Evidence */}
          <button
            id="btn-quick-action-upload-evidence"
            onClick={() => activeFile && setUploadEvidenceModalFile(activeFile)}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-center"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[11px] uppercase">Upload Evidence</span>
          </button>
        </div>
      </div>

      {/* VERIFIED SOURCE REFERENCES PANEL (SANS 10139 / SANS 10400-T / OHS ACT) */}
      {showSourceReferences && (
        <div className="p-4 bg-slate-950 border-2 border-blue-900/60 rounded-xs text-xs font-mono space-y-3 text-slate-300 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Verified Source References for Every Compliance Requirement</span>
            </span>
            <button
              onClick={() => setShowSourceReferences(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
            {/* SANS 10139:2012 */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xs space-y-1.5">
              <div className="font-bold text-red-400 uppercase">SANS 10139:2012 Clauses</div>
              <ul className="space-y-1 list-disc list-inside text-slate-300">
                <li><strong>Clause 5:</strong> Design zoning &amp; detector coverage limitations</li>
                <li><strong>Clause 8:</strong> Wiring, cable integrity &amp; manual call point placement</li>
                <li><strong>Clause 11:</strong> Sounder audibility (65 dBA general / 75 dBA bedhead)</li>
                <li><strong>Clause 13.2:</strong> Accredited Commissioner Handover Certificate</li>
                <li><strong>Clause 14:</strong> Quarterly servicing &amp; annual maintenance regime</li>
                <li><strong>Clause 15:</strong> Mandatory site register &amp; logbook records</li>
              </ul>
            </div>

            {/* SANS 10400-T:2020 */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xs space-y-1.5">
              <div className="font-bold text-blue-400 uppercase">SANS 10400-T:2020 Requirements</div>
              <ul className="space-y-1 list-disc list-inside text-slate-300">
                <li><strong>Table 1:</strong> Occupancy Classifications (A1, B2, C1, J1, etc.)</li>
                <li><strong>Table 9:</strong> Mandatory fire detection &amp; alarm triggers by floor area</li>
                <li><strong>Section 4.1:</strong> General fire safety &amp; structural separation criteria</li>
                <li><strong>Section 4.34:</strong> Emergency ventilation, stair pressurization interlocks</li>
                <li><strong>Part T:</strong> Interface with fire doors, magnetic hold-opens &amp; dampers</li>
              </ul>
            </div>

            {/* OHS Act (Act 85 of 1993) */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xs space-y-1.5">
              <div className="font-bold text-amber-400 uppercase">OHS Act &amp; Statutory Regulations</div>
              <ul className="space-y-1 list-disc list-inside text-slate-300">
                <li><strong>Section 8:</strong> Employer duties to furnish safe work environment</li>
                <li><strong>Section 16.2:</strong> Assigned statutory health &amp; safety authority</li>
                <li><strong>Section 37.2:</strong> Mandatory contractor safety agreement</li>
                <li><strong>GSR 3:</strong> First aid &amp; emergency response protocol</li>
                <li><strong>EIR 7:</strong> Electrical installation safety certifications &amp; lockouts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DOSSIER HEADER WITH CLIENT'S LOGO, LETTERHEAD, ADDRESS, CONTACTS & PROJECT INFO */}
      {activeFile && (
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xs shadow-xs space-y-4 font-mono text-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            {/* Client Logo & Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-[#0A192F] text-white flex items-center justify-center font-bold text-lg rounded-xs border-2 border-slate-800 shrink-0">
                {activeFile.clientCompanyName ? activeFile.clientCompanyName.substring(0, 2).toUpperCase() : 'AF'}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Client Stakeholder &amp; Project Dossier
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  {activeFile.clientCompanyName}
                </h3>
                <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    <span>{activeFile.physicalAddress}</span>
                  </span>
                  <span>•</span>
                  <span>Site: <strong>{activeFile.siteName}</strong></span>
                </div>
              </div>
            </div>

            {/* Project Specs & Contract Details */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500 block text-[9px] uppercase">Contract Ref</span>
                <strong className="text-[#CC0000]">{activeFile.contractNumber || 'AFE-CNT-2026-0881'}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500 block text-[9px] uppercase">System Category</span>
                <strong className="text-slate-900">{activeFile.systemCategory || 'Category L1'}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500 block text-[9px] uppercase">Building Occupancy</span>
                <strong className="text-slate-900">{activeFile.buildingOccupancyClass || 'Class A1 / J1'}</strong>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500 block text-[9px] uppercase">Alarm Panel</span>
                <strong className="text-slate-900">{activeFile.controlPanelModel || 'Ziton ZP3'} ({activeFile.numberOfLoops || 4} Loops)</strong>
              </div>
            </div>
          </div>

          {/* Client Contacts & Emergency Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xs">
              <span className="text-slate-500 block text-[10px] uppercase">Client Representative</span>
              <strong className="text-slate-900">{activeFile.clientRepresentative || 'Client Project Director'}</strong>
              <div className="text-slate-500 text-[10px] truncate">{activeFile.clientEmail || 'client@domain.co.za'}</div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xs">
              <span className="text-slate-500 block text-[10px] uppercase">Site Safety Officer</span>
              <strong className="text-slate-900">{activeFile.emergencyContacts.siteSafetyOfficerName || 'Client Safety Officer'}</strong>
              <div className="text-slate-500 text-[10px]">{activeFile.emergencyContacts.siteSafetyOfficerPhone || '011 555 0192'}</div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xs">
              <span className="text-slate-500 block text-[10px] uppercase">Responsible SAQCC Technician</span>
              <strong className="text-slate-900">{activeFile.responsibleTechnician}</strong>
              <div className="text-[#CC0000] font-bold text-[10px]">{activeFile.responsibleTechnicianSaqcc}</div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xs">
              <span className="text-slate-500 block text-[10px] uppercase">Accredited SANS Commissioner</span>
              <strong className="text-slate-900">{activeFile.authorisedCommissioner}</strong>
              <div className="text-[#CC0000] font-bold text-[10px]">{activeFile.authorisedCommissionerSaqcc}</div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER, SEARCH & DISPLAY CONTROLS BAR */}
      <div className="p-4 bg-white border border-slate-200 rounded-xs shadow-xs space-y-3 font-mono text-xs">
        {/* Multi-tier Dropdown Filters: Client, Site, Contract, Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pb-2 border-b border-slate-100">
          {/* Client Filter */}
          <div>
            <label className="block text-slate-500 uppercase font-bold text-[10px] mb-1">
              Client Filter:
            </label>
            <select
              id="select-filter-client"
              value={clientFilter}
              onChange={e => {
                setClientFilter(e.target.value);
                setSiteFilter('all');
              }}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">All Clients ({uniqueClients.length})</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div>
            <label className="block text-slate-500 uppercase font-bold text-[10px] mb-1">
              Site Filter:
            </label>
            <select
              id="select-filter-site"
              value={siteFilter}
              onChange={e => setSiteFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">All Sites ({uniqueSites.length})</option>
              {uniqueSites.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Contract Filter */}
          <div>
            <label className="block text-slate-500 uppercase font-bold text-[10px] mb-1">
              Contract Filter:
            </label>
            <select
              id="select-filter-contract"
              value={contractFilter}
              onChange={e => setContractFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">All Contracts ({uniqueContracts.length})</option>
              {uniqueContracts.map(cnt => (
                <option key={cnt} value={cnt}>
                  {cnt}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-slate-500 uppercase font-bold text-[10px] mb-1">
              Project Filter:
            </label>
            <select
              id="select-filter-project"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">All Projects ({uniqueProjects.length})</option>
              {uniqueProjects.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Freeform Search, Sort, View Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-safety-files"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, site, file ref (e.g. AFE-SF-2026-001), or technician..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Selector & View Mode Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                id="select-sort-safety-files"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xs text-slate-700 font-semibold text-xs focus:outline-none"
              >
                <option value="completion_desc">Highest Completion %</option>
                <option value="completion_asc">Lowest Completion %</option>
                <option value="updated">Recently Audited</option>
                <option value="name">Project Name (A-Z)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(clientFilter !== 'all' || siteFilter !== 'all' || contractFilter !== 'all' || projectFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs font-bold uppercase text-[10px] flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {/* Grid Density & View Mode Controls */}
            {viewMode === 'grid' && (
              <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xs border border-slate-200 text-[10px] font-bold">
                <button
                  onClick={() => setGridColumns('2-col')}
                  className={`px-2 py-1 rounded-xs cursor-pointer ${
                    gridColumns === '2-col' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'
                  }`}
                  title="2-column grid"
                >
                  2 Col
                </button>
                <button
                  onClick={() => setGridColumns('3-col')}
                  className={`px-2 py-1 rounded-xs cursor-pointer ${
                    gridColumns === '3-col' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'
                  }`}
                  title="3-column grid"
                >
                  3 Col
                </button>
              </div>
            )}

            {/* View Mode: Grid or List */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xs border border-slate-200">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-1.5 rounded-xs cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#0A192F] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-xs cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#0A192F] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 uppercase font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Status:
          </span>

          <button
            id="filter-all-projects"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xs font-bold whitespace-nowrap uppercase text-[11px] cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#0A192F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Projects ({files.length})
          </button>

          <button
            id="filter-approved-projects"
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1 rounded-xs font-bold whitespace-nowrap uppercase text-[11px] cursor-pointer transition-colors ${
              statusFilter === 'Approved'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Approved &amp; Certified ({dashboardStats.approvedProjects})
          </button>

          <button
            id="filter-under-review-projects"
            onClick={() => setStatusFilter('Under Review')}
            className={`px-3 py-1 rounded-xs font-bold whitespace-nowrap uppercase text-[11px] cursor-pointer transition-colors ${
              statusFilter === 'Under Review'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Under Review ({dashboardStats.underReviewProjects})
          </button>

          <button
            id="filter-draft-projects"
            onClick={() => setStatusFilter('Draft')}
            className={`px-3 py-1 rounded-xs font-bold whitespace-nowrap uppercase text-[11px] cursor-pointer transition-colors ${
              statusFilter === 'Draft'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Draft ({dashboardStats.draftProjects})
          </button>

          <button
            id="filter-gaps-projects"
            onClick={() => setStatusFilter('gaps')}
            className={`px-3 py-1 rounded-xs font-bold whitespace-nowrap uppercase text-[11px] cursor-pointer transition-colors ${
              statusFilter === 'gaps'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            Attention Needed ({dashboardStats.totalMissing + dashboardStats.totalExpired} Gaps)
          </button>
        </div>
      </div>

      {/* MISSING-DOCUMENT AND EXPIRED-CERTIFICATE ALERTS PANEL */}
      {(missingAlerts.length > 0 || expiredAlerts.length > 0) && (
        <div className="bg-red-950/20 border-2 border-red-500/40 rounded-xs p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-red-700 uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                Compliance Gaps Detected: {missingAlerts.length} Missing Documents • {expiredAlerts.length} Expired Certificates
              </span>
            </div>
            <button
              onClick={() => setShowAlertsPanel(!showAlertsPanel)}
              className="text-red-700 hover:text-red-900 font-bold uppercase text-[11px] cursor-pointer"
            >
              {showAlertsPanel ? 'Collapse Alerts' : 'Expand Alerts'}
            </button>
          </div>

          {showAlertsPanel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-red-200">
              {/* Missing Documents Column */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase flex items-center gap-1.5">
                  <FileWarning className="w-3.5 h-3.5 text-red-600" />
                  <span>Mandatory Missing Documents</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {missingAlerts.slice(0, 5).map(({ file, doc, sectionNum }, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white border border-red-200 rounded-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Sec {sectionNum} • {file.safetyFileNumber} ({file.projectName})
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFileId(file.id);
                          setUploadEvidenceModalFile(file);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xs text-[10px] font-bold uppercase shrink-0 cursor-pointer"
                      >
                        Upload
                      </button>
                    </div>
                  ))}
                  {missingAlerts.length > 5 && (
                    <div className="text-[10px] text-slate-500 italic text-center">
                      +{missingAlerts.length - 5} more missing documents in register
                    </div>
                  )}
                </div>
              </div>

              {/* Expired Certificates Column */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Expired or Expiring Certifications</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {expiredAlerts.slice(0, 5).map(({ file, doc, sectionNum, daysRemaining }, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white border border-orange-200 rounded-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Sec {sectionNum} • {file.safetyFileNumber} •{' '}
                          <span className="text-red-600 font-bold">
                            {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFileId(file.id);
                          setUploadEvidenceModalFile(file);
                        }}
                        className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xs text-[10px] font-bold uppercase shrink-0 cursor-pointer"
                      >
                        Renew
                      </button>
                    </div>
                  ))}
                  {expiredAlerts.length > 5 && (
                    <div className="text-[10px] text-slate-500 italic text-center">
                      +{expiredAlerts.length - 5} more expired documents
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATUTORY MILESTONES PANEL (Responsible Person, Target Date, Completion Date, Overdue Status) */}
      {activeFile && (
        <div className="bg-white border border-slate-200 rounded-xs shadow-xs p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-700 border border-blue-300 rounded-xs text-[10px] font-bold uppercase">
                  SANS 10139 Statutory Milestone Governance
                </span>
                <span className="text-slate-500 text-[11px]">
                  Target Project: <strong>{activeFile.projectName}</strong> ({activeFile.safetyFileNumber})
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase mt-1">
                Statutory Milestones, Responsible Personnel &amp; Handover Schedule
              </h3>
            </div>

            <button
              onClick={() => setShowMilestonesPanel(!showMilestonesPanel)}
              className="text-slate-500 hover:text-slate-800 font-bold uppercase text-[11px] cursor-pointer"
            >
              {showMilestonesPanel ? 'Hide Milestones' : 'View Milestones'}
            </button>
          </div>

          {showMilestonesPanel && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] border-y border-slate-200">
                    <th className="p-2.5">Milestone &amp; Statutory Standard</th>
                    <th className="p-2.5">Responsible Person &amp; Role</th>
                    <th className="p-2.5">Target Date</th>
                    <th className="p-2.5">Completion Date</th>
                    <th className="p-2.5 text-center">Overdue Status</th>
                    <th className="p-2.5 text-right">Evidence Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMilestones.map(ms => {
                    const isOverdue = ms.status === 'Overdue';
                    const isCompleted = ms.status === 'Completed';
                    const isInProgress = ms.status === 'In Progress';

                    return (
                      <tr key={ms.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900">
                          <div>{ms.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{ms.standardClause}</div>
                        </td>

                        <td className="p-2.5">
                          <div className="font-bold text-slate-800">{ms.responsiblePerson}</div>
                          <div className="text-[10px] text-slate-500">{ms.responsibleRole}</div>
                        </td>

                        <td className="p-2.5 text-slate-700 whitespace-nowrap">
                          {ms.targetDate}
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          {ms.completionDate ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{ms.completionDate}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending Gate</span>
                          )}
                        </td>

                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs font-bold uppercase text-[9px] ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isOverdue
                                ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {isCompleted && <Check className="w-3 h-3 text-emerald-700" />}
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-red-700" />}
                            <span>{ms.status}</span>
                          </span>
                        </td>

                        <td className="p-2.5 text-right font-mono text-[#CC0000] font-bold">
                          {ms.evidenceDocumentNumber || 'AFE-SF-DOC'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECENT ACTIVITY AND OUTSTANDING ACTION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Recent Statutory Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-xs shadow-xs p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Recent Statutory Activity</span>
            </span>
            <span className="text-[10px] text-slate-500">Immutable Audit Feed</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activeFile?.auditTrail.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xs border border-slate-200 transition-colors flex items-start gap-2.5 text-[11px]"
              >
                <div className="w-2 h-2 rounded-xs bg-[#CC0000] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-900 truncate">{item.action}</strong>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-0.5 line-clamp-1">{item.details}</p>
                  <div className="text-[9px] text-slate-500 mt-1">
                    Actor: {item.user} ({item.role})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Outstanding Actions Checklist */}
        <div className="bg-white border border-slate-200 rounded-xs shadow-xs p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Outstanding Actions &amp; Governance Tasks</span>
            </span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
              3 Pending Review
            </span>
          </div>

          <div className="space-y-2">
            {/* Action 1 */}
            <div className="p-2.5 bg-red-50/60 border border-red-200 rounded-xs flex items-center justify-between gap-3 text-[11px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-red-700 text-white rounded-xs text-[9px] font-bold uppercase">
                    Critical Gate
                  </span>
                  <strong className="text-slate-900 truncate">SANS 10139 Clause 13.2 Commissioner Certification</strong>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Assignee: Bethuel Moukangwe (SAQCC Commissioner) • Mandatory for Compliance
                </div>
              </div>
              <button
                onClick={() => activeFile && setSignatureReqModalFile(activeFile)}
                className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xs uppercase text-[10px] shrink-0 cursor-pointer"
              >
                Sign Off
              </button>
            </div>

            {/* Action 2 */}
            <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xs flex items-center justify-between gap-3 text-[11px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded-xs text-[9px] font-bold uppercase">
                    Action Required
                  </span>
                  <strong className="text-slate-900 truncate">Upload Calibrated Sound Level Meter Certificate</strong>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Assignee: Lead Fire Technician • SANS 10139 Clause 11.3 Acoustic Evidence
                </div>
              </div>
              <button
                onClick={() => activeFile && setUploadEvidenceModalFile(activeFile)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xs uppercase text-[10px] shrink-0 cursor-pointer"
              >
                Upload
              </button>
            </div>

            {/* Action 3 */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between gap-3 text-[11px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-slate-700 text-white rounded-xs text-[9px] font-bold uppercase">
                    Handover
                  </span>
                  <strong className="text-slate-900 truncate">Dispatch Compiled Dossier to Client Safety Officer</strong>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Assignee: Client Safety Auditor • Section 15 OHS Register Handover
                </div>
              </div>
              <button
                onClick={() => activeFile && handleEmail(activeFile)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xs uppercase text-[10px] shrink-0 cursor-pointer"
              >
                Dispatch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID OF PROJECTS / SAFETY FILE CARDS */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xs p-12 text-center font-mono">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 uppercase">No Matching Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No fire detection safety files match the active filters or query "{searchQuery}".
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-4 py-2 bg-[#0A192F] text-white text-xs font-bold uppercase rounded-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          className={`grid gap-6 ${
            gridColumns === '3-col'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {filteredFiles.map(sf => (
            <div
              key={sf.id}
              onClick={() => setSelectedFileId(sf.id)}
              className={selectedFileId === sf.id ? 'ring-2 ring-[#0A192F] rounded-xs' : ''}
            >
              <SafetyFileCard
                safetyFile={sf}
                onOpenSafetyFile={handleOpen}
                onPrintPreview={handlePrint}
                onDownloadPdf={handleDownload}
                onEmail={handleEmail}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Compact List View with Quick Actions */
        <div className="bg-white border border-slate-200 rounded-xs shadow-xs overflow-hidden font-mono text-xs divide-y divide-slate-200">
          <div className="bg-slate-100 p-3 text-slate-600 font-bold uppercase text-[11px] grid grid-cols-12 gap-2">
            <div className="col-span-5 sm:col-span-4">Project &amp; Client Site</div>
            <div className="col-span-3 sm:col-span-3">Compliance &amp; SANS Progress</div>
            <div className="hidden sm:block sm:col-span-2">Commissioner Status</div>
            <div className="col-span-4 sm:col-span-3 text-right">Quick Actions</div>
          </div>

          {filteredFiles.map(sf => {
            const m = safetyFileService.getSafetyFileMetrics(sf);
            const isSelected = selectedFileId === sf.id;

            return (
              <div
                key={sf.id}
                onClick={() => setSelectedFileId(sf.id)}
                className={`p-3.5 hover:bg-slate-50 transition-colors grid grid-cols-12 gap-2 items-center cursor-pointer ${
                  isSelected ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* Project Name & Ref */}
                <div className="col-span-5 sm:col-span-4">
                  <div className="font-bold text-slate-900 font-sans text-sm truncate">
                    {sf.projectName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="text-[#CC0000] font-bold">{sf.safetyFileNumber}</span>
                    <span>•</span>
                    <span className="truncate">{sf.clientCompanyName}</span>
                    <span>•</span>
                    <span className="truncate text-slate-400">{sf.siteName}</span>
                  </div>
                </div>

                {/* Progress & Metrics */}
                <div className="col-span-3 sm:col-span-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">{m.completionPercentage}%</span>
                    <span className="text-[10px] text-slate-500">
                      {m.approvedCount}/{m.mandatoryCount} docs
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-xs overflow-hidden">
                    <div
                      className={`h-full ${
                        m.completionPercentage === 100 && m.isCommissionerApproved
                          ? 'bg-emerald-600'
                          : m.completionPercentage > 50
                          ? 'bg-amber-500'
                          : 'bg-[#CC0000]'
                      }`}
                      style={{ width: `${m.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>SANS 10139: {m.sans10139Progress}%</span>
                    <span>10400-T: {m.sans10400TProgress}%</span>
                  </div>
                </div>

                {/* Status */}
                <div className="hidden sm:block sm:col-span-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                      m.isCompliant
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : sf.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : sf.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.isCompliant ? 'Compliant' : sf.status}
                  </span>
                  {!m.isCommissionerApproved && (
                    <div className="text-[9px] text-amber-700 mt-0.5 font-semibold">
                      Comm. Sign Pending
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                  <button
                    id={`btn-list-open-${sf.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleOpen(sf);
                    }}
                    title="Open Controlled Dossier"
                    className="p-1.5 bg-[#0A192F] hover:bg-[#152a4a] text-white rounded-xs cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-list-print-${sf.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      handlePrint(sf);
                    }}
                    title="Print Preview"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-list-download-${sf.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleDownload(sf);
                    }}
                    title="Download Full Dossier PDF"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-list-email-${sf.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleEmail(sf);
                    }}
                    title="Email to Safety Officer"
                    className="p-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Safety File Full Viewer Modal */}
      {selectedViewerFile && (
        <SafetyFileViewerModal
          safetyFile={selectedViewerFile}
          isOpen={!!selectedViewerFile}
          onClose={() => setSelectedViewerFile(null)}
          onPrintPreview={sf => setSelectedPrintFile(sf)}
          onDownloadPdf={sf => setSelectedPrintFile(sf)}
          onEmail={sf => setSelectedEmailFile(sf)}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onFileUpdated={handleFileUpdated}
        />
      )}

      {/* MODAL 2: Safety File Print Preview Modal */}
      {selectedPrintFile && (
        <SafetyFilePrintPreviewModal
          safetyFile={selectedPrintFile}
          isOpen={!!selectedPrintFile}
          onClose={() => setSelectedPrintFile(null)}
          onDownloadPdf={() => {
            window.print();
          }}
        />
      )}

      {/* MODAL 3: Safety File Email Modal */}
      {selectedEmailFile && (
        <SafetyFileEmailModal
          safetyFile={selectedEmailFile}
          isOpen={!!selectedEmailFile}
          onClose={() => setSelectedEmailFile(null)}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onSuccess={() => {
            const refreshed = safetyFileService.getAllSafetyFiles();
            setInternalFiles(refreshed);
            showToast('Statutory safety file dispatched successfully via email.', 'success');
          }}
        />
      )}

      {/* MODAL 4: Quick Document Download Picker */}
      {quickDocModalFile && (
        <QuickDocumentDownloadModal
          safetyFile={quickDocModalFile}
          isOpen={!!quickDocModalFile}
          onClose={() => setQuickDocModalFile(null)}
        />
      )}

      {/* MODAL 5: Request Electronic Signatures */}
      {signatureReqModalFile && (
        <RequestSignatureModal
          safetyFile={signatureReqModalFile}
          isOpen={!!signatureReqModalFile}
          onClose={() => setSignatureReqModalFile(null)}
          onRequestDispatched={(role, email) => {
            showToast(`Electronic signature invitation sent to ${role} (${email}).`, 'success');
          }}
        />
      )}

      {/* MODAL 6: Upload Supporting Evidence */}
      {uploadEvidenceModalFile && (
        <UploadEvidenceModal
          safetyFile={uploadEvidenceModalFile}
          isOpen={!!uploadEvidenceModalFile}
          onClose={() => setUploadEvidenceModalFile(null)}
          onUploadComplete={updated => {
            handleFileUpdated(updated);
            showToast('Supporting evidence committed and indexed.', 'success');
          }}
        />
      )}
    </div>
  );
};
