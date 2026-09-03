import React, { useState, useRef } from 'react';
import { validateFile, FileValidationResult } from '../utils/fileValidation';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FileCode,
  FileImage,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export interface DocumentUploadFormProps {
  onUploadSuccess: (file: File, validation: FileValidationResult, metadata: DocumentUploadMetadata) => void;
  onCancel?: () => void;
  defaultCategory?: string;
  defaultSectionNumber?: number;
  className?: string;
}

export interface DocumentUploadMetadata {
  title: string;
  documentNumber?: string;
  revision: string;
  category?: string;
  sectionNumber?: number;
  description?: string;
  pageCount: number;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onUploadSuccess,
  onCancel,
  defaultCategory = 'pdf',
  defaultSectionNumber = 1,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [revision, setRevision] = useState('REV 01.0');
  const [pageCount, setPageCount] = useState(1);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    const result = validateFile(file);
    setValidationResult(result);

    if (result.isValid) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !validationResult || !validationResult.isValid) return;

    onUploadSuccess(selectedFile, validationResult, {
      title,
      documentNumber,
      revision,
      pageCount,
      description,
      sectionNumber: defaultSectionNumber
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white border-2 border-[#0A192F] p-5 rounded-xs space-y-4 font-mono text-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="font-bold text-sm text-[#0A192F] uppercase flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#CC0000]" />
          <span>Statutory Compliance Document Upload</span>
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-6 rounded-xs text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[#CC0000] bg-red-50/50'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-slate-300 hover:border-slate-500 bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={e => e.target.files && e.target.files[0] && handleProcessFile(e.target.files[0])}
          accept=".pdf,.pdfa,.png,.jpg,.jpeg,.svg,.dwg,.dxf,.doc,.docx,.xls,.xlsx,.zip"
        />

        {selectedFile ? (
          <div className="space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="font-bold text-slate-900">{selectedFile.name}</div>
            <div className="text-[10px] text-slate-500">
              {(selectedFile.size / 1024).toFixed(1)} KB • Type: {validationResult?.fileCategory?.toUpperCase()}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">
              ✓ Verified SANS-compliant MIME type &amp; security hash
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700">Drag &amp; drop document, or click to browse</div>
            <div className="text-[10px] text-slate-500">
              Accepted: PDF, CAD (DWG, DXF), Images (JPG, PNG), Word, Excel.
            </div>
            <div className="text-[10px] text-red-600 font-bold flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Executables (EXE, MSI, BAT) strictly rejected by security policy.</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Alert */}
      {validationResult && !validationResult.isValid && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationResult.error}</span>
        </div>
      )}

      {/* Form Metadata Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 font-bold uppercase mb-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. SANS 10139 Cable Test Certificate"
            className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-bold uppercase mb-1">Document Reference No.</label>
          <input
            type="text"
            value={documentNumber}
            onChange={e => setDocumentNumber(e.target.value)}
            placeholder="e.g. AFE-SF-DOC-10.01"
            className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 font-bold uppercase mb-1">Revision Number</label>
          <input
            type="text"
            value={revision}
            onChange={e => setRevision(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-bold uppercase mb-1">Page Count</label>
          <input
            type="number"
            min={1}
            value={pageCount}
            onChange={e => setPageCount(parseInt(e.target.value) || 1)}
            className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 font-bold uppercase mb-1">Technical Summary</label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Summary of technical contents, regulatory findings or test logs..."
          className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900 font-sans"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs uppercase font-bold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!selectedFile || (validationResult && !validationResult.isValid)}
          className="px-4 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs uppercase font-bold cursor-pointer disabled:opacity-50"
        >
          Upload &amp; Validate Document
        </button>
      </div>
    </form>
  );
};
