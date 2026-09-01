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
  AlertTriangle
} from 'lucide-react';
import { RequestAttachment, TechnicalDocumentCategory } from '../types';
import {
  getFileTypeMeta,
  formatFileSize,
  processUploadFile,
  checkFileSecurity,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    { label: 'CAD & BIM', exts: 'DWG, DXF, DWF, IFC, STEP, RVT', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
    { label: 'PDFs', exts: 'PDF, PDF/A Technical Reports', color: 'bg-red-100 text-red-900 border-red-300' },
    { label: 'MS Office', exts: 'DOCX, XLSX, XLSM (Macro Scanned), PPTX', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { label: 'Site Images', exts: 'JPG, PNG, WEBP, HEIC, TIFF, SVG (Sanitized)', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { label: 'OpenDocument', exts: 'ODT, ODS, ODP Standards', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { label: 'Technical Data', exts: 'CSV, JSON, XML, LOG, ZIP Archives', color: 'bg-slate-100 text-slate-800 border-slate-300' }
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsProcessing(true);

    try {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // 1. Strict Security / Deny Prohibited check
        const secCheck = checkFileSecurity(file.name, file.type);
        if (secCheck.isProhibited) {
          setUploadError(`Security Sandbox Intercept: ${secCheck.reason}`);
          continue;
        }

        // 2. File size ceiling check
        const sizeMb = file.size / (1024 * 1024);
        if (sizeMb > maxSizeMb) {
          setUploadError(`File "${file.name}" (${sizeMb.toFixed(1)}MB) exceeds maximum allowable ceiling of ${maxSizeMb}MB.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setIsProcessing(false);
        return;
      }

      const processedItems = await Promise.all(
        validFiles.map((file) => processUploadFile(file, selectedCategory))
      );

      onFilesAdded(processedItems);
    } catch (err) {
      setUploadError('An error occurred during Celery simulation file processing. Please verify file integrity.');
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
      {/* Header Info */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-sm border border-slate-200">
          <div>
            <h4 className="font-mono font-bold text-xs sm:text-sm text-[#0A192F] uppercase flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#CC0000]" />
              <span>{title}</span>
            </h4>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Category Tag Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Document Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as RequestAttachment['category'])}
              className="text-xs bg-white border border-slate-300 rounded-sm px-2.5 py-1 font-mono text-slate-800 focus:outline-none focus:border-[#CC0000]"
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
        className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-[#CC0000] bg-red-50 scale-[0.99]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70 shadow-xs'
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

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center transition-transform ${
            isDragActive ? 'bg-[#CC0000] text-white scale-110' : 'bg-slate-100 text-[#0A192F]'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="font-bold text-[#0A192F] text-xs sm:text-sm uppercase font-mono">
              {isDragActive ? 'Release files to securely ingest' : 'Drag & drop technical files here, or click to browse'}
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5 max-w-xl mx-auto">
              Celery worker pipeline scans MIME signatures, validates magic bytes, isolates executables, generates PDF previews, and renders CAD drawings (Max {maxSizeMb}MB per file).
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 bg-[#0A192F] hover:bg-slate-800 text-white px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Select File</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Isolated Sandbox Security Active</span>
            </span>
          </div>
        </div>

        {/* Accepted Formats Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5">
          {supportedFormats.map((fmt, i) => (
            <span
              key={i}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${fmt.color}`}
              title={fmt.exts}
            >
              {fmt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Security Error Alert */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-sm flex items-start gap-2.5 text-xs text-red-800 font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#CC0000] mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Security Violation Detected:</strong>
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploaded Files List (if provided) */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-[#0A192F] uppercase">
              Attached Request Documents ({attachments.length}):
            </span>
            <span className="text-[10px] text-slate-500">
              SHA-256 Verified &amp; Stored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => {
              const meta = getFileTypeMeta(att.fileName, att.fileType);
              const IconComp = meta.icon;

              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-sm bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border ${meta.badgeBg} ${meta.badgeBorder}`}>
                      <IconComp className={`w-4 h-4 ${meta.badgeText}`} />
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <p className="font-mono font-bold text-slate-900 text-xs truncate" title={att.fileName}>
                        {att.fileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span>{formatFileSize(att.fileSize)}</span>
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
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-sm transition-colors"
                      title="Download / View File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Delete Action */}
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(att.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-sm transition-colors cursor-pointer"
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

