import React, { useState, useRef } from 'react';
import {
  History,
  Upload,
  X,
  AlertTriangle,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  Layers,
  Video,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TechnicalDocument } from '../types';
import {
  ALL_PERMITTED_EXTENSIONS,
  getFileTypeMeta,
  checkFileSecurity,
  formatFileSize
} from '../utils/fileTypes';
import { DocumentRevisionInput } from '../services/documentSecurityEngine';

interface DocumentRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: TechnicalDocument | null;
}

export const DocumentRevisionModal: React.FC<DocumentRevisionModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { currentUser, submitDocumentRevision, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSecurityWarning, setFileSecurityWarning] = useState<string | null>(null);
  const [revisionNumber, setRevisionNumber] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [preparedBy, setPreparedBy] = useState(currentUser?.fullName || '');
  const [clientComments, setClientComments] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  if (!isOpen || !document) return null;

  const nextVersionNumber = document.currentVersionNumber + 1;
  const suggestedRevisionNumber = revisionNumber || `Rev ${nextVersionNumber < 10 ? '0' + nextVersionNumber : nextVersionNumber}`;

  const handleFileSelection = (file: File) => {
    const secCheck = checkFileSecurity(file.name, file.type);
    if (secCheck.isProhibited) {
      setFileSecurityWarning(secCheck.reason || 'Prohibited file type detected.');
      setSelectedFile(file);
      return;
    }
    setFileSecurityWarning(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('error', 'File Required', 'Please choose the revised technical document file.');
      return;
    }
    if (!changeDescription.trim()) {
      showToast('error', 'Change Log Required', 'Please provide a brief description of what changed in this revision.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(25);
    setProcessingStage('1/3 Calculating SHA-256 and validating malware status...');

    setTimeout(() => {
      setProcessingProgress(65);
      setProcessingStage('2/3 Rendering revised vector / document preview...');
    }, 400);

    setTimeout(async () => {
      setProcessingProgress(90);
      setProcessingStage('3/3 Appending to immutable version history...');

      const revisionInput: DocumentRevisionInput = {
        existingDocument: document,
        file: selectedFile,
        revisionNumber: revisionNumber.trim() || suggestedRevisionNumber,
        changeDescription: changeDescription.trim(),
        preparedBy: preparedBy.trim() || currentUser?.fullName || 'Managing Director Bethuel Moukangwe',
        uploader: currentUser || {
          id: 'usr-anon',
          fullName: 'Client User',
          email: 'client@example.co.za',
          role: 'customer',
          organisationName: document.organisationName,
          phone: '0714156665',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        clientComments
      };

      const result = await submitDocumentRevision(revisionInput);
      setIsProcessing(false);

      if (result.success) {
        onClose();
      }
    }, 1100);
  };

  const fileMeta = selectedFile ? getFileTypeMeta(selectedFile.name, selectedFile.type) : null;

  return (
    <div id="modal-doc-revision" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit New Document Revision
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {document.title} • Current: {document.currentVersion.revisionNumber} (v{document.currentVersionNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Active Document Info Banner */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Service Request:</span>{' '}
              <strong className="text-slate-900 dark:text-white">{document.serviceRequestRef}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Drawing / Ref:</span>{' '}
              <span className="font-mono font-medium text-slate-900 dark:text-white">{document.drawingNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Target Version:</span>{' '}
              <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold">
                Version {nextVersionNumber}
              </span>
            </div>
          </div>

          {/* Processing Banner */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-800 dark:text-indigo-300">
                <span>Ingesting Revision to Safe Sandbox...</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{processingStage}</p>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Revised File Payload <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                fileSecurityWarning
                  ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                  : selectedFile
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
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
                <div className="flex items-center justify-between max-w-md mx-auto p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2.5 truncate text-left">
                    <div className="w-8 h-8 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      {fileMeta?.isCad ? <Layers className="w-4 h-4" /> :
                       fileMeta?.isSpreadsheet ? <FileSpreadsheet className="w-4 h-4" /> :
                       fileMeta?.isWord ? <FileText className="w-4 h-4" /> :
                       <FileCheck className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatFileSize(selectedFile.size)} • {fileMeta?.formatLabel || selectedFile.type}
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
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 mx-auto text-indigo-600 dark:text-indigo-400" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Click to select revised drawing / document
                  </p>
                  <p className="text-[11px] text-slate-500">Prior version will remain preserved in the audit register.</p>
                </div>
              )}
            </div>

            {fileSecurityWarning && (
              <div className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{fileSecurityWarning}</span>
              </div>
            )}
          </div>

          {/* Revision Tag & Prepared By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Revision Tag / Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={revisionNumber}
                onChange={(e) => setRevisionNumber(e.target.value)}
                placeholder={suggestedRevisionNumber}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Prepared By
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Author / CAD Drafter"
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Change Description (Mandatory for audit) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Change Description / Revision Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Detail specifically what changed between prior version and this revision (e.g., Added high-bay beam detector offsets, updated loop wiring schedule)..."
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            ></textarea>
          </div>

          {/* Optional Client Comments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Client Notes (Optional)
            </label>
            <input
              type="text"
              value={clientComments}
              onChange={(e) => setClientComments(e.target.value)}
              placeholder="e.g., Approved by consulting engineer on 2026-08-30."
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !selectedFile}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition flex items-center space-x-2"
          >
            <History className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Revision...' : `Register Version ${nextVersionNumber}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
