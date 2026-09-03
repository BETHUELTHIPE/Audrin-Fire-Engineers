import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Video,
  Layers,
  X,
  CheckCircle2,
  Lock,
  Eye,
  Info,
  Building2,
  Calendar,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  TechnicalDocumentCategory,
  DocumentEvidenceStage,
  ConfidentialityLevel,
  ServiceRequest
} from '../types';
import {
  TECHNICAL_DOCUMENT_CATEGORIES,
  ALL_PERMITTED_EXTENSIONS,
  getFileTypeMeta,
  checkFileSecurity,
  validateUploadDocument,
  DocumentValidationResult,
  formatFileSize
} from '../utils/fileTypes';
import { DocumentUploadInput } from '../services/documentSecurityEngine';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRequestId?: string | null;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  preselectedRequestId
}) => {
  const {
    currentUser,
    serviceRequests,
    uploadTechnicalDocument,
    showToast
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);
  const [fileSecurityWarning, setFileSecurityWarning] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TechnicalDocumentCategory>('fire_alarm_layout');
  const [evidenceStage, setEvidenceStage] = useState<DocumentEvidenceStage>('general_supporting');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    preselectedRequestId || (serviceRequests.length > 0 ? serviceRequests[0].id : '')
  );
  const [drawingNumber, setDrawingNumber] = useState('');
  const [revisionNumber, setRevisionNumber] = useState('Rev 01');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [preparedBy, setPreparedBy] = useState(currentUser?.fullName || '');
  const [confidentialityLevel, setConfidentialityLevel] = useState<ConfidentialityLevel>('restricted_client');
  const [customerVisible, setCustomerVisible] = useState(true);
  const [includeInReport, setIncludeInReport] = useState(true);
  const [clientComments, setClientComments] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  if (!isOpen) return null;

  const currentRequest = serviceRequests.find(r => r.id === selectedRequestId) || serviceRequests[0];
  const fileMeta = selectedFile ? getFileTypeMeta(selectedFile.name, selectedFile.type) : null;

  const handleFileSelection = (file: File) => {
    const val = validateUploadDocument(file, {
      maxSizeMb: 100,
      strictDenyByDefault: true
    });
    setValidationResult(val);

    if (!val.isValid) {
      setFileSecurityWarning(val.error || 'Upload validation failed.');
      setSelectedFile(file);
      return;
    }

    setFileSecurityWarning(null);
    setSelectedFile(file);
    if (!title) {
      // Auto populate clean title from filename
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      setTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('error', 'File Required', 'Please select a technical document or drawing to upload.');
      return;
    }
    if (!currentRequest) {
      showToast('error', 'Request Required', 'Please select an associated service request.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStage('1/4 Calculating SHA-256 cryptographic hash...');

    setTimeout(() => {
      setProcessingProgress(40);
      setProcessingStage('2/4 Scanning with Celery Malware & Sandbox Heuristics...');
    }, 400);

    setTimeout(() => {
      setProcessingProgress(75);
      setProcessingStage('3/4 Generating isolated vector preview & extracting CAD/metadata...');
    }, 900);

    setTimeout(async () => {
      setProcessingProgress(95);
      setProcessingStage('4/4 Registering immutable record in secure statutory vault...');

      const uploadInput: DocumentUploadInput = {
        file: selectedFile,
        title: title.trim() || selectedFile.name,
        description: description.trim(),
        category,
        evidenceStage,
        serviceRequest: currentRequest,
        drawingNumber: drawingNumber.trim(),
        revisionNumber: revisionNumber.trim() || 'Rev 01',
        documentDate,
        preparedBy: preparedBy.trim() || currentUser?.fullName || 'Managing Director Bethuel Moukangwe',
        uploader: currentUser || {
          id: 'usr-anon',
          fullName: 'Client User',
          email: 'client@example.co.za',
          role: 'customer',
          organisationName: currentRequest.organisationName,
          phone: '0714156665',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        customerVisible,
        includeInReport,
        confidentialityLevel,
        clientComments
      };

      const result = await uploadTechnicalDocument(uploadInput);
      setIsProcessing(false);

      if (result.success) {
        onClose();
      }
    }, 1400);
  };

  // Group categories for easy selection
  const architecturalCategories = TECHNICAL_DOCUMENT_CATEGORIES.filter(c =>
    ['site_drawing', 'floor_plan', 'as_built_drawing', 'fire_alarm_layout', 'zone_drawing', 'loop_drawing', 'single_line_diagram'].includes(c.id)
  );
  const engineeringCategories = TECHNICAL_DOCUMENT_CATEGORIES.filter(c =>
    ['cause_and_effect', 'device_schedule', 'cable_schedule', 'battery_calculation', 'sounder_db_study', 'containment_drawing', 'panel_wiring'].includes(c.id)
  );
  const complianceCategories = TECHNICAL_DOCUMENT_CATEGORIES.filter(c =>
    ['commissioning_document', 'compliance_certificate', 'logbook_scan', 'fire_strategy', 'local_authority_approval', 'datasheet', 'o_and_m_manual'].includes(c.id)
  );
  const operationsCategories = TECHNICAL_DOCUMENT_CATEGORIES.filter(c =>
    ['before_work_evidence', 'during_work_evidence', 'post_work_evidence', 'site_access_document', 'risk_assessment_hira', 'other_supporting'].includes(c.id)
  );

  return (
    <div id="modal-doc-upload" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Technical Document / CAD Drawing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure Celery Ingestion • SANS 10139 Document Register • SABS / ISO 9001
              </p>
            </div>
          </div>
          <button
            id="btn-close-upload-modal"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Processing Banner */}
          {isProcessing && (
            <div id="upload-processing-banner" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  Processing In Isolated Container Sandbox
                </span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{processingProgress}%</span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-900/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 dark:bg-amber-400 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300">{processingStage}</p>
            </div>
          )}

          {/* 1. Drag & Drop File Upload Zone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Document or Drawing File <span className="text-red-500">*</span>
            </label>
            
            <div
              id="drop-zone-technical-doc"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                fileSecurityWarning
                  ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-amber-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ALL_PERMITTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex items-center justify-between max-w-xl mx-auto p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-3 text-left truncate">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      {fileMeta?.isCad ? <Layers className="w-5 h-5" /> :
                       fileMeta?.isSpreadsheet ? <FileSpreadsheet className="w-5 h-5" /> :
                       fileMeta?.isWord ? <FileText className="w-5 h-5" /> :
                       fileMeta?.isPdf ? <FileCheck className="w-5 h-5" /> :
                       fileMeta?.isVideo ? <Video className="w-5 h-5" /> :
                       <FileCode className="w-5 h-5" />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(selectedFile.size)} • {fileMeta?.formatLabel || selectedFile.type || 'Technical Document'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileSecurityWarning(null);
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click to browse or drag and drop technical file
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Supported: <strong>CAD</strong> (DWG, DXF, IFC, STEP, SAT, SKP) • <strong>Office</strong> (DOCX, XLSX, XLSM, PPTX) • <strong>PDF & Text</strong> (PDF, CSV, TXT) • <strong>Images & Video</strong> (PNG, JPG, TIFF, WebP, MP4) • <strong>ZIP archives</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Security Warning Alert */}
            {fileSecurityWarning && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Security Block: Threat Intercepted</p>
                  <p>{fileSecurityWarning} Submitting this file will record a quarantine event in the compliance log.</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Mandatory Linkage: Service Request & Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Link to Service Request & Site <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-doc-request"
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                >
                  {serviceRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      [{req.referenceNumber}] {req.siteName} — {req.organisationName}
                    </option>
                  ))}
                </select>
              </div>
              {currentRequest && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  Site: {currentRequest.streetAddress || currentRequest.siteName} ({currentRequest.organisationName})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Evidence / Workflow Stage <span className="text-red-500">*</span>
              </label>
              <select
                id="select-doc-stage"
                value={evidenceStage}
                onChange={(e) => setEvidenceStage(e.target.value as DocumentEvidenceStage)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="before_work">Before-Work Baseline / Survey</option>
                <option value="during_work">During-Work Installation Progress</option>
                <option value="after_work">Post-Work Completed Installation</option>
                <option value="commissioning">Testing & SANS 10139 Commissioning</option>
                <option value="general_supporting">General Technical Reference / As-Built</option>
              </select>
            </div>
          </div>

          {/* 3. Document Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Technical Document Category (SANS 10139 Standard) <span className="text-red-500">*</span>
            </label>
            <select
              id="select-doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TechnicalDocumentCategory)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
            >
              <optgroup label="Architectural & As-Built Drawings">
                {architecturalCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Engineering & Calculations">
                {engineeringCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Statutory Compliance & Certificates">
                {complianceCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Site Operations & Work Evidence">
                {operationsCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 4. Document Metadata: Title, Drawing No, Revision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Document Title / Drawing Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ground Floor Addressable Loop Layout"
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Drawing / Spec Number
              </label>
              <input
                type="text"
                value={drawingNumber}
                onChange={(e) => setDrawingNumber(e.target.value)}
                placeholder="e.g., AFE-DWG-FA-001"
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 5. Revision, Date, Prepared By, Confidentiality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Revision Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={revisionNumber}
                onChange={(e) => setRevisionNumber(e.target.value)}
                placeholder="e.g., Rev 01 / Rev A"
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Document Date
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Prepared By / Author
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="e.g., Bethuel Moukangwe"
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Confidentiality Level
              </label>
              <select
                value={confidentialityLevel}
                onChange={(e) => setConfidentialityLevel(e.target.value as ConfidentialityLevel)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="public">Public (Unrestricted)</option>
                <option value="restricted_client">Restricted (Client & Audrin)</option>
                <option value="confidential_engineering">Confidential Engineering Only</option>
                <option value="internal_audrin_only">Internal Audrin Staff Only</option>
              </select>
            </div>
          </div>

          {/* 6. Description & Client Comments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Technical Scope / Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Technical notes regarding device layouts, SANS 10139 standard compliance, or building zones..."
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Client Notes / Submission Comments
              </label>
              <textarea
                rows={2}
                value={clientComments}
                onChange={(e) => setClientComments(e.target.value)}
                placeholder="Optional notes or instructions from the facility manager or consulting engineer..."
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* 7. Governance & Portal Visibility Checkboxes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 items-center">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={customerVisible}
                onChange={(e) => setCustomerVisible(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Display in Customer Portal
              </span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInReport}
                onChange={(e) => setIncludeInReport(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                Include Reference in Condition Reports
              </span>
            </label>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SANS 10139 5-Year Statutory Signed Vault
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            id="btn-cancel-upload"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            id="btn-submit-doc-upload"
            onClick={handleSubmit}
            disabled={isProcessing || !selectedFile}
            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Celery Pipeline...' : 'Ingest Document to Vault'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
