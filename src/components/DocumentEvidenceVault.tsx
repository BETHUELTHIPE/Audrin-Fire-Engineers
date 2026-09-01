import React, { useState } from 'react';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Layers,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  Eye,
  History,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Lock,
  FileDown,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  TechnicalDocument,
  TechnicalDocumentCategory,
  DocumentEvidenceStage
} from '../types';
import {
  TECHNICAL_DOCUMENT_CATEGORIES,
  getCategoryDefinition,
  getFileTypeMeta,
  formatFileSize
} from '../utils/fileTypes';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { DocumentRevisionModal } from './DocumentRevisionModal';
import { DocumentQuarantineModal } from './DocumentQuarantineModal';
import { PermittedFileTypesModal } from './PermittedFileTypesModal';

interface DocumentEvidenceVaultProps {
  filterByRequestId?: string | null;
  readOnlyCustomerMode?: boolean;
}

export const DocumentEvidenceVault: React.FC<DocumentEvidenceVaultProps> = ({
  filterByRequestId,
  readOnlyCustomerMode = false
}) => {
  const {
    technicalDocuments,
    quarantinedFiles,
    serviceRequests,
    currentUser,
    generateSignedDownloadToken,
    showToast
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(filterByRequestId || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [isPermittedModalOpen, setIsPermittedModalOpen] = useState(false);
  const [activeViewerDoc, setActiveViewerDoc] = useState<TechnicalDocument | null>(null);
  const [activeRevisionDoc, setActiveRevisionDoc] = useState<TechnicalDocument | null>(null);

  const isStaffOrAdmin = currentUser && ['staff', 'admin', 'superadmin'].includes(currentUser.role);

  // Filter documents
  const filteredDocs = technicalDocuments.filter((doc) => {
    // If in customer mode or non-staff, only show customer visible unless uploaded by self
    if (!isStaffOrAdmin && !doc.customerVisible && doc.uploaderUserId !== currentUser?.id) {
      return false;
    }

    if (filterByRequestId && doc.serviceRequestId !== filterByRequestId) return false;
    if (selectedRequestId !== 'all' && doc.serviceRequestId !== selectedRequestId) return false;
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (selectedStage !== 'all' && doc.evidenceStage !== selectedStage) return false;
    if (selectedStatus !== 'all' && doc.reviewStatus !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        (doc.drawingNumber && doc.drawingNumber.toLowerCase().includes(q)) ||
        doc.serviceRequestRef.toLowerCase().includes(q) ||
        doc.siteName.toLowerCase().includes(q) ||
        doc.currentVersion.originalFileName.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        doc.preparedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalCadCount = technicalDocuments.filter(d =>
    getFileTypeMeta(d.currentVersion.originalFileName, d.currentVersion.mimeType).isCad
  ).length;
  const approvedCount = technicalDocuments.filter(d => d.reviewStatus === 'approved').length;
  const pendingCount = technicalDocuments.filter(d => d.reviewStatus === 'pending_review').length;

  const handleExportCsv = () => {
    const headers = [
      'Document ID',
      'Title',
      'Drawing Number',
      'Category Code',
      'Category Name',
      'Evidence Stage',
      'Service Request Ref',
      'Site Name',
      'Organisation',
      'Active Version',
      'Revision Number',
      'File Name',
      'File Size',
      'File Hash (SHA-256)',
      'Review Status',
      'Prepared By',
      'Document Date',
      'Uploaded By',
      'Uploaded At'
    ];

    const rows = filteredDocs.map((doc) => {
      const cat = getCategoryDefinition(doc.category);
      return [
        doc.id,
        `"${doc.title.replace(/"/g, '""')}"`,
        `"${doc.drawingNumber || ''}"`,
        cat.code,
        `"${cat.label}"`,
        doc.evidenceStage,
        doc.serviceRequestRef,
        `"${doc.siteName}"`,
        `"${doc.organisationName}"`,
        `v${doc.currentVersionNumber}`,
        doc.currentVersion.revisionNumber,
        `"${doc.currentVersion.originalFileName}"`,
        doc.currentVersion.fileSizeFormatted,
        doc.currentVersion.fileHash,
        doc.reviewStatus,
        `"${doc.preparedBy}"`,
        doc.documentDate,
        `"${doc.uploaderName}"`,
        doc.createdAt
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audrin_Technical_Document_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Register Exported', 'Statutory SANS 10139 technical register exported to CSV.');
  };

  const handleDownloadDirect = (doc: TechnicalDocument) => {
    const token = generateSignedDownloadToken(doc.id, doc.currentVersion.id);
    showToast('success', 'Signed Download Link', 'HMAC 15-minute token generated.');
    window.open(token.downloadUrl || doc.currentVersion.fileUrl, '_blank');
  };

  return (
    <div id="document-evidence-vault" className="space-y-6">
      
      {/* 1. TOP STATS BAR & ACTION CONTROLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vault Documents</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{technicalDocuments.length}</span>
            <span className="text-xs text-slate-400">Registered</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved & SABS</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-slate-400">Compliant</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">CAD Drawings</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalCadCount}</span>
            <span className="text-xs text-slate-400">DWG/DXF/IFC</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Pending Review</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pendingCount}</span>
            <span className="text-xs text-slate-400">Awaiting QA</span>
          </div>
        </div>

        <div
          onClick={() => setIsQuarantineModalOpen(true)}
          className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-sm cursor-pointer hover:bg-red-100/60 dark:hover:bg-red-950/40 transition col-span-2 sm:col-span-4 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Quarantine Vault</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-red-700 dark:text-red-400">{quarantinedFiles.length}</span>
            <span className="text-xs text-red-600 dark:text-red-400">Threats Blocked</span>
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR: UPLOAD BUTTON, SEARCH & ACTIONS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Main Action Line */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-doc-upload-modal"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-2 shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document / CAD Drawing</span>
            </button>

            <button
              onClick={() => setIsPermittedModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>50+ Supported Formats</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <FileDown className="w-4 h-4 text-amber-500" />
              <span>Export CSV Register</span>
            </button>
          </div>

          {/* Search bar & Grid/Table toggles */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drawings, specs, sites..."
                className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table Register View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All SANS Categories</option>
              {TECHNICAL_DOCUMENT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Stage Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Evidence Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Evidence Stages</option>
              <option value="before_work">Before-Work Baseline</option>
              <option value="during_work">During-Work Progress</option>
              <option value="after_work">Post-Work Completion</option>
              <option value="commissioning">Commissioning & Testing</option>
              <option value="general_supporting">General Technical Reference</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Review Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Review Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending_review">Pending Review</option>
              <option value="requires_revision">Requires Revision</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Linked Service Request */}
          {!filterByRequestId && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Linked Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Service Requests</option>
                {serviceRequests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.referenceNumber} - {r.siteName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. DOCUMENTS CONTENT (GRID OR TABLE) */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Technical Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No technical documents match your filter criteria. Click "Upload Document / CAD Drawing" to ingest engineering files.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First Document</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // GRID CARDS VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const cat = getCategoryDefinition(doc.category);
            const fileMeta = getFileTypeMeta(doc.currentVersion.originalFileName, doc.currentVersion.mimeType);

            return (
              <div
                key={doc.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Category Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {cat.code}
                    </span>

                    {doc.reviewStatus === 'approved' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {doc.reviewStatus === 'pending_review' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending QA
                      </span>
                    )}
                    {doc.reviewStatus === 'requires_revision' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Revision Req
                      </span>
                    )}
                    {doc.reviewStatus === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>

                  {/* Title & Drawing Number */}
                  <div>
                    <h4
                      onClick={() => setActiveViewerDoc(doc)}
                      className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition cursor-pointer line-clamp-1"
                      title={doc.title}
                    >
                      {doc.title}
                    </h4>
                    {doc.drawingNumber && (
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {doc.drawingNumber}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service Request:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.serviceRequestRef}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Site Location:</span>
                      <span className="truncate max-w-[160px] text-slate-800 dark:text-slate-200">{doc.siteName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Active Revision:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {doc.currentVersion.revisionNumber} (v{doc.currentVersionNumber})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">File Payload:</span>
                      <span className="truncate max-w-[160px] text-slate-800 dark:text-slate-200">
                        {doc.currentVersion.originalFileName} ({doc.currentVersion.fileSizeFormatted})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    SANS 10139
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setActiveViewerDoc(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition flex items-center space-x-1"
                      title="Open Safe Vector Inspector"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => setActiveRevisionDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Upload New Revision"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownloadDirect(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Signed Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // DETAILED STATUTORY TABLE REGISTER VIEW
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-3.5">Category & Title</th>
                  <th className="p-3.5">Drawing / Spec Ref</th>
                  <th className="p-3.5">Linked Request & Site</th>
                  <th className="p-3.5">Revision</th>
                  <th className="p-3.5">Evidence Stage</th>
                  <th className="p-3.5">QA Status</th>
                  <th className="p-3.5">Security SHA-256</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDocs.map((doc) => {
                  const cat = getCategoryDefinition(doc.category);
                  const fileMeta = getFileTypeMeta(doc.currentVersion.originalFileName, doc.currentVersion.mimeType);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            {fileMeta.isCad ? <Layers className="w-4 h-4" /> :
                             fileMeta.isSpreadsheet ? <FileSpreadsheet className="w-4 h-4" /> :
                             fileMeta.isWord ? <FileText className="w-4 h-4" /> :
                             <FileCheck className="w-4 h-4" />}
                          </div>
                          <div>
                            <span
                              onClick={() => setActiveViewerDoc(doc)}
                              className="font-bold text-slate-900 dark:text-white hover:text-amber-600 cursor-pointer line-clamp-1"
                            >
                              {doc.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {cat.code} • {cat.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {doc.drawingNumber || '—'}
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{doc.serviceRequestRef}</div>
                        <div className="text-[11px] text-slate-400">{doc.siteName}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                          {doc.currentVersion.revisionNumber} (v{doc.currentVersionNumber})
                        </span>
                      </td>

                      <td className="p-3.5 capitalize text-slate-600 dark:text-slate-400">
                        {doc.evidenceStage.replace(/_/g, ' ')}
                      </td>

                      <td className="p-3.5">
                        {doc.reviewStatus === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {doc.reviewStatus === 'pending_review' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Pending QA
                          </span>
                        )}
                        {doc.reviewStatus === 'requires_revision' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 w-fit">
                            <AlertCircle className="w-3 h-3" /> Revision Req
                          </span>
                        )}
                        {doc.reviewStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={doc.currentVersion.fileHash}>
                        {doc.currentVersion.fileHash.substring(0, 16)}...
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setActiveViewerDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Inspect Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveRevisionDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Submit Revision"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDirect(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Download Signed File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        preselectedRequestId={filterByRequestId}
      />

      <DocumentViewerModal
        isOpen={!!activeViewerDoc}
        onClose={() => setActiveViewerDoc(null)}
        document={activeViewerDoc}
        onOpenRevisionModal={(doc) => {
          setActiveViewerDoc(null);
          setActiveRevisionDoc(doc);
        }}
      />

      <DocumentRevisionModal
        isOpen={!!activeRevisionDoc}
        onClose={() => setActiveRevisionDoc(null)}
        document={activeRevisionDoc}
      />

      <DocumentQuarantineModal
        isOpen={isQuarantineModalOpen}
        onClose={() => setIsQuarantineModalOpen(false)}
      />

      <PermittedFileTypesModal
        isOpen={isPermittedModalOpen}
        onClose={() => setIsPermittedModalOpen(false)}
      />

    </div>
  );
};
