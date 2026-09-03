import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Paperclip,
  X,
  FileText,
  FileSpreadsheet,
  FileImage,
  Layers,
  FileArchive,
  CheckCircle2,
  Eye,
  Download,
  AlertCircle,
  File,
  ShieldCheck,
  Plus,
  ShieldAlert,
  Sliders,
  AlertTriangle,
  FileCode,
  Lock,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { RequestAttachment, TechnicalDocumentCategory } from '../types';
import {
  getFileTypeMeta,
  formatFileSize,
  processUploadFile,
  checkFileSecurity,
  validateUploadDocument,
  validateMultipleFiles,
  DocumentValidationResult,
  TECHNICAL_DOCUMENT_CATEGORIES
} from '../utils/fileTypes';

export interface DocumentUploadZoneProps {
  /** Callback when files are processed and added */
  onFilesAdded: (attachments: Omit<RequestAttachment, 'id' | 'uploadedAt'>[]) => void;
  /** Existing list of attachments (optional, if managed in parent) */
  attachments?: RequestAttachment[];
  /** Callback to remove an attachment by id */
  onRemoveAttachment?: (id: string) => void;
  /** Max size in MB per file (default: 100MB) */
  maxSizeMb?: number;
  /** Compact mode for smaller modals */
  compact?: boolean;
  /** Optional custom title */
  title?: string;
  /** Optional custom subtitle description */
  subtitle?: string;
  /** Default category for new uploads */
  defaultCategory?: RequestAttachment['category'];
  /** Allow multiple files */
  multiple?: boolean;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFilesAdded,
  attachments = [],
  onRemoveAttachment,
  maxSizeMb = 100,
  compact = false,
  title = 'Upload Technical Documents & CAD Drawings',
  subtitle = 'Upload CAD drawings (.dwg, .dxf, .ifc, .step), PDFs, Word docs, Excel spreadsheets, site photos, or archives.',
  defaultCategory = 'drawings',
  multiple = true
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RequestAttachment['category']>(defaultCategory);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [lastValidationResult, setLastValidationResult] = useState<DocumentValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    { label: 'CAD & BIM', exts: 'DWG, DXF, DWF, IFC, STEP, RVT, RFA', color: 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300' },
    { label: 'PDFs & Reports', exts: 'PDF, PDF/A Technical Reports & Specs', color: 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-300' },
    { label: 'MS Office / OpenDoc', exts: 'DOCX, XLSX, XLSM, PPTX, ODT, ODS', color: 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300' },
    { label: 'Site Images', exts: 'JPG, PNG, WEBP, HEIC, TIFF, SVG (Sanitized)', color: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300' },
    { label: 'Data & Archives', exts: 'CSV, TXT, JSON, XML, LOG, ZIP', color: 'bg-slate-50 text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-300' }
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploadWarning(null);
    setLastValidationResult(null);
    setIsProcessing(true);

    try {
      // Execute multi-file validation utility
      const validation = validateMultipleFiles(files, {
        maxSizeMb,
        strictDenyByDefault: true
      });

      if (validation.rejectedResults.length > 0) {
        const firstRejection = validation.rejectedResults[0];
        setLastValidationResult(firstRejection);
        
        if (firstRejection.isProhibitedExecutable || firstRejection.isProhibited) {
          setUploadError(`Security Sandbox Intercept: ${firstRejection.error}`);
        } else {
          setUploadError(firstRejection.error || 'One or more files failed statutory upload verification.');
        }
      }

      // Check warnings for accepted files
      const acceptedWithWarning = validation.results.find((r) => r.isValid && r.warning);
      if (acceptedWithWarning) {
        setUploadWarning(acceptedWithWarning.warning);
      }

      if (validation.validFiles.length === 0) {
        setIsProcessing(false);
        return;
      }

      // If valid files exist, set last validation result to the first valid one for diagnostic confirmation
      if (validation.rejectedResults.length === 0 && validation.results.length > 0) {
        setLastValidationResult(validation.results[0]);
      }

      const processedItems = await Promise.all(
        validation.validFiles.map((file) => processUploadFile(file, selectedCategory))
      );

      onFilesAdded(processedItems);
    } catch (err) {
      setUploadError('An unexpected error occurred during statutory file parsing. Please verify file integrity.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Header Info - Geometric Balance Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-sm border border-slate-200">
          <div className="space-y-0.5">
            <h4 className="font-mono font-bold text-xs sm:text-sm text-[#0A192F] uppercase tracking-wide flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#CC0000]" />
              <span>{title}</span>
            </h4>
            <p className="text-[11px] text-slate-500 font-sans">
              {subtitle}
            </p>
          </div>

          {/* Category Tag Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Classification:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as RequestAttachment['category'])}
              className="text-xs bg-white border border-slate-300 rounded-sm px-3 py-1.5 font-mono text-slate-800 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]"
            >
              <option value="drawings">CAD / Engineering Drawing</option>
              <option value="report">PDF Compliance Report / Specs</option>
              <option value="site_photo">Site Condition Photo</option>
              <option value="panel_photo">Control Panel State Photo</option>
              <option value="fault_screenshot">Fault Log / Event Screen</option>
              <option value="word_document">Word Document (.docx)</option>
              <option value="spreadsheet">Excel Data Sheet (.xlsx/.csv)</option>
              <option value="specification">Equipment Specification</option>
              <option value="other">General Supporting Dossier</option>
            </select>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-sm p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-[#CC0000] bg-red-50/50 scale-[0.995]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/60 shadow-xs'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center transition-transform ${
            isDragActive ? 'bg-[#CC0000] text-white scale-105' : 'bg-[#0A192F] text-white shadow-xs'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="font-bold text-[#0A192F] text-xs sm:text-sm uppercase font-mono tracking-wide">
              {isDragActive ? 'Release files to execute statutory validation' : 'Drag & drop technical files here, or click to browse'}
            </p>
            <p className="text-[11px] text-slate-500 font-sans max-w-xl mx-auto leading-relaxed">
              Enforces SANS 10139 whitelist: Images (JPG/PNG), PDF, CAD (DWG/DXF/IFC), MS Office, OpenDoc &amp; Archives. Prohibited executables (EXE, MSI, BAT) are intercepted before processing (Max {maxSizeMb}MB per file).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A00000] text-white px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Select Technical File</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pre-Execution Threat Filter Active</span>
            </span>
          </div>
        </div>

        {/* Accepted Formats Chips with Geometric Balance */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5">
          {supportedFormats.map((fmt, i) => (
            <span
              key={i}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-sm border font-medium ${fmt.color}`}
              title={fmt.exts}
            >
              {fmt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Security Threat Intercept Alert */}
      {uploadError && (
        <div className="p-4 bg-red-50 border-l-4 border-l-[#CC0000] border border-red-200 rounded-sm flex items-start justify-between gap-3 text-xs text-red-900 font-mono shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#CC0000] mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#CC0000] uppercase tracking-wider text-[11px]">Upload Validation Intercept:</span>
                {lastValidationResult?.isProhibitedExecutable && (
                  <span className="bg-red-700 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase">Prohibited Binary</span>
                )}
              </div>
              <p className="font-sans text-xs text-red-800 leading-relaxed">{uploadError}</p>
              <p className="text-[10px] text-red-600 font-mono pt-1">
                Rule Enforced: {lastValidationResult?.scanDetails?.ruleEnforced || 'Deny-by-default execution policy'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setLastValidationResult(null);
            }}
            className="text-red-500 hover:text-red-800 p-1 rounded-sm cursor-pointer transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sanitization Warning Alert */}
      {uploadWarning && (
        <div className="p-3 bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 rounded-sm flex items-start justify-between gap-3 text-xs text-amber-900 font-mono shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider text-[11px]">Sanitization Notice:</span>
              <p className="font-sans text-xs text-amber-800">{uploadWarning}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadWarning(null)}
            className="text-amber-500 hover:text-amber-800 p-1 rounded-sm cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploaded Files List (Geometric Balance Cards) */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between font-mono text-xs px-1">
            <span className="font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validated Request Documents ({attachments.length}):</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              SHA-256 Verified &amp; Sandboxed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => {
              const meta = getFileTypeMeta(att.fileName, att.fileType);
              const IconComp = meta.icon;

              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-sm bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border ${meta.badgeBg} ${meta.badgeBorder}`}>
                      <IconComp className={`w-4 h-4 ${meta.badgeText}`} />
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <p className="font-mono font-bold text-slate-900 text-xs truncate" title={att.fileName}>
                        {att.fileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="font-medium text-slate-700">{formatFileSize(att.fileSize)}</span>
                        <span>•</span>
                        <span className="capitalize">{meta.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* View / Download Action */}
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.fileName}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-sm hover:bg-slate-100 transition-colors"
                      title="Download / View File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Delete Action */}
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(att.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


