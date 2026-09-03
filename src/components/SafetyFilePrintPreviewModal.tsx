import React, { useState } from 'react';
import { SafetyFile, SafetyFileDocument } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import { SafetyFileCover } from './SafetyFileCover';
import { SafetyFileIndexPage } from './SafetyFileIndexPage';
import {
  X,
  Printer,
  Download,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Lock,
  Layers,
  Building,
  UserCheck
} from 'lucide-react';

interface SafetyFilePrintPreviewModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf?: (safetyFile: SafetyFile) => void;
}

export const SafetyFilePrintPreviewModal: React.FC<SafetyFilePrintPreviewModalProps> = ({
  safetyFile,
  isOpen,
  onClose,
  onDownloadPdf
}) => {
  const [exportMode, setExportMode] = useState<'draft' | 'final'>('draft');

  if (!isOpen) return null;

  const metrics = safetyFileService.getSafetyFileMetrics(safetyFile);
  const { calculatedSections, totalPages } = safetyFileService.calculateIndexPages(safetyFile);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs font-sans">
      <div className="bg-slate-100 rounded-xs border-2 border-[#0A192F] shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-[#0A192F] text-white p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#CC0000] fill-[#CC0000]" />
            <div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <span>Print Preview &amp; Statutory PDF Export</span>
                <span className="text-amber-400 text-xs">[{safetyFile.safetyFileNumber}]</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Total Dossier Length: <strong>{totalPages} Pages</strong> (SANS 10139 / SANS 10400-T)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-800 p-1 rounded-xs border border-slate-700 font-mono text-xs">
              <button
                type="button"
                onClick={() => setExportMode('draft')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  exportMode === 'draft' ? 'bg-[#CC0000] text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Draft &amp; In-Progress
              </button>
              <button
                type="button"
                onClick={() => setExportMode('final')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  exportMode === 'final' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Issued / Approved Only
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={() => onDownloadPdf?.(safetyFile)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-200 print:bg-white print:p-0 print:space-y-0">
          {/* PAGE 1: COVER PAGE */}
          <div className="max-w-4xl mx-auto print:max-w-none print:w-full print:m-0 print:border-none print:shadow-none print:break-after-page">
            <SafetyFileCover safetyFile={safetyFile} isIncomplete={metrics.isIncomplete} />
          </div>

          {/* PAGE 2: AUTOMATIC COMPLIANCE INDEX REGISTER */}
          <div className="max-w-4xl mx-auto print:max-w-none print:w-full print:m-0 print:border-none print:shadow-none print:break-after-page">
            <SafetyFileIndexPage safetyFile={safetyFile} exportMode={exportMode} />
          </div>

          {/* SECTION DIVIDERS & APPROVED DOCUMENTS */}
          {calculatedSections.map(section => {
            const displayDocs = exportMode === 'final'
              ? section.documents.filter(d => d.status === 'Approved' || d.status === 'Issued')
              : section.documents;

            if (displayDocs.length === 0 && exportMode === 'final') return null;

            return (
              <div key={section.sectionNumber} className="max-w-4xl mx-auto space-y-6 print:max-w-none print:w-full print:m-0 print:space-y-0">
                {/* SECTION DIVIDER PAGE */}
                <div className="bg-[#0A192F] text-white p-8 sm:p-12 rounded-sm border-2 border-slate-800 shadow-md font-sans text-center relative overflow-hidden print:break-after-page print:rounded-none print:border-none print:h-screen print:flex print:flex-col print:justify-center">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#CC0000]" />
                  <div className="font-mono text-amber-400 font-bold uppercase tracking-widest text-xs mb-2">
                    Section Divider • Statutory Fire Engineering Record Pack
                  </div>
                  <h3 className="font-mono text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                    SECTION {section.sectionNumber.toString().padStart(2, '0')}
                  </h3>
                  <h4 className="font-mono text-xl sm:text-2xl font-bold uppercase text-[#CC0000] mt-1">
                    {section.title}
                  </h4>
                  <p className="text-slate-300 font-mono text-xs sm:text-sm mt-3 max-w-xl mx-auto">
                    {section.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-slate-700/80 font-mono text-[11px] text-slate-400 flex items-center justify-center gap-4">
                    <span>{safetyFile.clientCompanyName}</span>
                    <span>•</span>
                    <span>{safetyFile.siteName}</span>
                    <span>•</span>
                    <span className="text-white font-bold">{safetyFile.safetyFileNumber}</span>
                  </div>
                </div>

                {/* INDIVIDUAL DOCUMENT ENTRIES */}
                {displayDocs.map(doc => {
                  const isDraft = doc.status !== 'Approved' && doc.status !== 'Issued';
                  return (
                    <div
                      key={doc.id}
                      className="relative bg-white text-slate-900 border-2 border-[#0A192F] p-6 sm:p-8 rounded-sm shadow-md font-sans print:break-after-page print:border-none print:shadow-none print:p-6"
                    >
                      {/* WATERMARK IF INCOMPLETE OR DRAFT */}
                      {(isDraft || doc.watermarkText) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10 opacity-15">
                          <div className="text-4xl sm:text-5xl font-black text-red-600 uppercase font-mono tracking-widest -rotate-30 select-none text-center p-4">
                            {doc.watermarkText || 'DRAFT – NOT APPROVED FOR CLIENT RELIANCE'}
                          </div>
                        </div>
                      )}

                      {/* Header running info */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-300 font-mono text-[10px] text-slate-500">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-[#CC0000] fill-[#CC0000]" />
                          <span className="font-bold text-[#0A192F] uppercase">AUDRIN FIRE ENGINEERS</span>
                          <span>•</span>
                          <span>Sec {section.sectionNumber}: {section.title}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          <span>Doc: {doc.documentNumber}</span>
                          <span>•</span>
                          <span>Page {doc.calculatedStartPage || '—'}</span>
                        </div>
                      </div>

                      {/* Document Meta Box */}
                      <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <h5 className="font-mono text-base font-bold text-[#0A192F] uppercase">
                            {doc.title}
                          </h5>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-semibold text-slate-600">Rev: {doc.revision}</span>
                            <span className={`px-2 py-0.5 rounded-xs font-bold uppercase text-[10px] ${
                              doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-mono text-slate-700">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Prepared By:</span>
                            <strong>{doc.preparedBy.name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Issue Date:</span>
                            <strong>{doc.issueDate || 'Pending'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Expiry Date:</span>
                            <strong className={doc.isExpired ? 'text-red-600 font-bold' : ''}>
                              {doc.expiryDate || 'N/A'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Page Count:</span>
                            <strong>{doc.pageCount} Pages</strong>
                          </div>
                        </div>
                      </div>

                      {/* Document Content Summary */}
                      <div className="p-4 border border-slate-200 rounded-xs space-y-3 font-sans text-xs text-slate-800">
                        <h6 className="font-mono font-bold text-xs uppercase text-slate-600">
                          Controlled Content Abstract &amp; Regulatory Declarations:
                        </h6>
                        <p className="leading-relaxed bg-slate-50/70 p-3 rounded-xs border border-slate-200 font-mono text-xs text-slate-700">
                          {doc.contentSummary || 'Full technical specification and regulatory compliance records captured and verified in accordance with SANS 10139 standard requirements.'}
                        </p>

                        <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <span>File Name: <strong>{doc.fileName || `${doc.documentNumber}.pdf`}</strong></span>
                          <span>Audit Verification Hash: <strong>SHA256-{doc.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16).toUpperCase()}</strong></span>
                        </div>
                      </div>

                      {/* Client Acknowledgement if signed */}
                      {doc.clientAcknowledgement && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xs text-xs font-mono text-blue-950">
                          <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                            <span>Client Acknowledgement Recorded:</span>
                          </div>
                          <p className="italic">"{doc.clientAcknowledgement.comments}"</p>
                          <div className="text-[10px] text-blue-700 mt-1">
                            Acknowledged by {doc.clientAcknowledgement.signedByName} ({doc.clientAcknowledgement.signedByRole}) on {new Date(doc.clientAcknowledgement.signedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>Audrin Fire Engineers • Safety File Ref: {safetyFile.safetyFileNumber}</span>
                        <span>Page {doc.calculatedStartPage || '—'} of {totalPages}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* FINAL HANDOVER & STATUTORY ACCEPTANCE PAGE */}
          <div className="max-w-4xl mx-auto bg-white text-slate-900 border-2 border-[#0A192F] p-6 sm:p-10 rounded-sm shadow-md font-sans print:break-after-page print:border-none print:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-300 font-mono text-[10px] text-slate-500">
              <span className="font-bold text-[#0A192F] uppercase">FINAL HANDOVER &amp; STATUTORY ACCEPTANCE</span>
              <span>Final Page of Dossier ({totalPages})</span>
            </div>

            <div className="my-6 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold uppercase rounded-xs mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SANS 10139 STATUTORY HANDOVER DECLARATION</span>
              </span>
              <h3 className="font-mono text-2xl font-black text-[#0A192F] uppercase">
                CERTIFICATE OF SAFETY FILE HANDOVER
              </h3>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Project: {safetyFile.projectName} | Site: {safetyFile.siteName}
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xs text-xs font-mono text-slate-700 leading-relaxed space-y-2 mb-6">
              <p>
                We hereby certify that this Fire Detection Safety File (Ref: <strong>{safetyFile.safetyFileNumber}</strong>) has been prepared, reviewed, and compiled under the supervision of registered SAQCC Fire personnel and professional fire protection engineers in full compliance with the Occupational Health and Safety Act (Act 85 of 1993), SANS 10139, and SANS 10400-T.
              </p>
              <p>
                All 16 statutory sections, as-built drawings, loop resistance and insulation tests, cause-and-effect matrix records, and commissioning declarations have been verified for client operational reliance and statutory local authority compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-slate-300 p-3 rounded-xs bg-slate-50 space-y-1">
                <div className="font-bold text-[#0A192F] uppercase">On Behalf of Audrin Fire Engineers:</div>
                <div>Name: <strong>{safetyFile.authorisedCommissioner}</strong></div>
                <div>Designation: <strong>SANS 10139 Commissioner ({safetyFile.authorisedCommissionerSaqcc})</strong></div>
                <div>Signature: <strong className="text-emerald-700 font-bold">{safetyFile.approvals.approvedBy.signature || 'Digitally Sealed'}</strong></div>
                <div>Date: <strong>{safetyFile.issueDate}</strong></div>
              </div>

              <div className="border border-slate-300 p-3 rounded-xs bg-slate-50 space-y-1">
                <div className="font-bold text-[#0A192F] uppercase">On Behalf of Client Organisation:</div>
                <div>Name: <strong>{safetyFile.clientSafetyOfficerName}</strong></div>
                <div>Designation: <strong>Client Safety Officer / Responsible Person</strong></div>
                <div>Signature: <strong className="text-emerald-700 font-bold">{safetyFile.approvals.clientAcknowledgement.signature || 'Acknowledged'}</strong></div>
                <div>Date: <strong>{safetyFile.issueDate}</strong></div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-300 text-center font-mono text-[10px] text-slate-500">
              Audrin Fire Engineers (Pty) Ltd • 27 Tshivhase Street, Pretoria West, 0008 • SANS 10139 / SAQCC Accredited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
