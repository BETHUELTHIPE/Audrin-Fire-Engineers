import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Paperclip,
  Check,
  ShieldCheck
} from 'lucide-react';
import { SafetyFile, SafetyFileSection } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import { validateFile } from '../utils/fileValidation';

interface UploadEvidenceModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (updatedFile: SafetyFile) => void;
  preselectedSection?: number;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  safetyFile,
  isOpen,
  onClose,
  onUploadComplete,
  preselectedSection = 8
}) => {
  const [selectedSection, setSelectedSection] = useState<number>(preselectedSection);
  const [documentTitle, setDocumentTitle] = useState('Insulation Resistance Test Certificate');
  const [documentNumber, setDocumentNumber] = useState(`AFE-SF-DOC-0${preselectedSection}.03`);
  const [revision, setRevision] = useState('REV 01.0');
  const [summary, setSummary] = useState('Calibrated 500V DC core-to-core and core-to-screen resistance testing verification.');
  const [pageCount, setPageCount] = useState<number>(2);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSectionChange = (secNum: number) => {
    setSelectedSection(secNum);
    const sec = safetyFile.sections.find(s => s.sectionNumber === secNum);
    const nextIndex = (sec?.documents.length || 0) + 1;
    const formattedSec = secNum < 10 ? `0${secNum}` : `${secNum}`;
    const formattedIdx = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    setDocumentNumber(`AFE-SF-DOC-${formattedSec}.${formattedIdx}`);

    if (secNum === 8) {
      setDocumentTitle('Insulation Resistance Test Certificate');
      setSummary('Calibrated 500V DC core-to-core and core-to-screen resistance testing verification.');
    } else if (secNum === 5) {
      setDocumentTitle('SAQCC Registered Technician Accreditation Card');
      setSummary('Current certified copy of SAQCC Fire Detection Level 3 Installer card.');
    } else if (secNum === 10) {
      setDocumentTitle('Fire Alarm Sound Pressure Level (dBA) Audit Report');
      setSummary('Acoustic sound pressure measurements verifying 65 dBA general and 75 dBA bedhead audibility.');
    } else {
      setDocumentTitle(`${sec?.title || 'Statutory'} Supporting Evidence`);
      setSummary(`Supporting compliance verification for Section ${secNum}.`);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selected: File) => {
    const res = validateFile(selected);
    if (!res.isValid) {
      setError(res.error || 'Invalid file format or size exceeds allowable statutory limit.');
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentTitle.trim()) {
      setError('Document title is required.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const updated = safetyFileService.addDocumentToSection(
        safetyFile.id,
        selectedSection,
        {
          sectionNumber: selectedSection,
          title: documentTitle,
          documentNumber,
          revision,
          pageCount,
          contentSummary: summary,
          status: 'Submitted',
          isMandatory: true,
          isApproved: false,
          fileName: file ? file.name : `${documentNumber}.pdf`,
          fileCategory: 'pdf'
        },
        'Audrin Safety Specialist',
        'Lead Fire Detection Engineer'
      );

      setIsUploading(false);
      setSuccessToast(true);

      if (updated) {
        onUploadComplete?.(updated);
      }

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xs shadow-2xl border-2 border-slate-800 w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase rounded-xs">
                SANS 10139 Dossier Evidence Vault
              </span>
              <span className="text-xs font-mono text-slate-300">
                Ref: <strong className="text-white">{safetyFile.safetyFileNumber}</strong>
              </span>
            </div>
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              <span>Upload Supporting Evidence</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Attach certified test results, calibration certs, or commissioning checklists into any of the 16 statutory sections.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xs bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 bg-emerald-900 text-emerald-100 text-xs font-mono font-bold flex items-center gap-2 border-b border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Evidence uploaded successfully and indexed in statutory Section {selectedSection}.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-100 border-b border-red-300 text-red-800 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
          {/* Target Section */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
              Target Statutory Section (1 - 16) *
            </label>
            <select
              value={selectedSection}
              onChange={e => handleSectionChange(Number(e.target.value))}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
            >
              {safetyFile.sections.map(sec => (
                <option key={sec.sectionNumber} value={sec.sectionNumber}>
                  Section {sec.sectionNumber}: {sec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title and Doc Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={documentTitle}
                onChange={e => setDocumentTitle(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Document Number *
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none font-bold text-[#CC0000]"
              />
            </div>
          </div>

          {/* Revision and Page Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Revision Tag
              </label>
              <input
                type="text"
                value={revision}
                onChange={e => setRevision(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Page Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={pageCount}
                onChange={e => setPageCount(Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
              Evidence Document File (PDF, DWG, XLSX, JPG, PNG)
            </label>
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xs p-5 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-[#CC0000] bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{file.name}</span>
                  <span className="text-slate-500 font-normal">({Math.round(file.size / 1024)} KB)</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-slate-400 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Drag &amp; drop document file here, or click to browse</p>
                  <p className="text-[10px] text-slate-500 mt-1">Accepts PDF, DWG, DXF, XLSX, DOCX up to 25MB</p>
                  <label className="mt-2 inline-block px-3 py-1 bg-white border border-slate-300 rounded-xs text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content Summary */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
              Technical Description / Calibration Reference
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none text-xs font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading Evidence...' : 'Commit Supporting Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
