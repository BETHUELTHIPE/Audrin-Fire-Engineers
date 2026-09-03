import React, { useState, useMemo } from 'react';
import {
  SafetyFile,
  SafetyFileStatus
} from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import {
  ShieldCheck,
  Flame,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Printer,
  Download,
  Mail,
  ExternalLink,
  Clock,
  UserCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  FileX2,
  CalendarX,
  FileClock,
  Building,
  Check
} from 'lucide-react';

interface SafetyFileCardProps {
  safetyFile: SafetyFile;
  onOpenSafetyFile: (safetyFile: SafetyFile) => void;
  onPrintPreview: (safetyFile: SafetyFile) => void;
  onDownloadPdf: (safetyFile: SafetyFile) => void;
  onEmail: (safetyFile: SafetyFile) => void;
  className?: string;
  defaultExpandedSections?: boolean;
}

export const SafetyFileCard: React.FC<SafetyFileCardProps> = ({
  safetyFile,
  onOpenSafetyFile,
  onPrintPreview,
  onDownloadPdf,
  onEmail,
  className = '',
  defaultExpandedSections = false
}) => {
  const [showSectionBreakdown, setShowSectionBreakdown] = useState(defaultExpandedSections);
  const [showAllGaps, setShowAllGaps] = useState(false);

  const metrics = safetyFileService.getSafetyFileMetrics(safetyFile);

  // Extract explicit list of missing documents
  const missingDocuments = useMemo(() => {
    return safetyFile.sections.flatMap(sec =>
      sec.documents
        .filter(doc => doc.status === 'Missing' || (doc.isMandatory && !doc.isApproved && doc.status !== 'Approved' && doc.status !== 'Issued' && doc.pageCount === 0))
        .map(doc => ({
          ...doc,
          sectionNumber: sec.sectionNumber,
          sectionTitle: sec.title
        }))
    );
  }, [safetyFile]);

  // Extract explicit list of expired documents
  const expiredDocuments = useMemo(() => {
    const now = new Date();
    return safetyFile.sections.flatMap(sec =>
      sec.documents
        .filter(doc => doc.isExpired || (doc.expiryDate && new Date(doc.expiryDate) < now))
        .map(doc => ({
          ...doc,
          sectionNumber: sec.sectionNumber,
          sectionTitle: sec.title
        }))
    );
  }, [safetyFile]);

  const totalGaps = missingDocuments.length + expiredDocuments.length;

  const getStatusBadge = (status: SafetyFileStatus) => {
    switch (status) {
      case 'Approved':
      case 'Issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{status}</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Under Review</span>
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold bg-slate-400/10 text-slate-300 border border-slate-500/40 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Draft</span>
          </span>
        );
    }
  };

  // Helper to determine status for each of the 16 sections
  const getSectionStatus = (secNumber: number) => {
    const sec = safetyFile.sections.find(s => s.sectionNumber === secNumber);
    if (!sec || sec.documents.length === 0) {
      return { status: 'empty', color: 'bg-red-600 text-white', label: 'Empty' };
    }
    const hasMissing = sec.documents.some(d => d.isMandatory && d.status === 'Missing');
    const hasExpired = sec.documents.some(d => d.isExpired);
    const allApproved = sec.documents.filter(d => d.isMandatory).every(d => d.isApproved);

    if (hasMissing || hasExpired) {
      return { status: 'gap', color: 'bg-red-600 text-white', label: 'Gap' };
    }
    if (allApproved) {
      return { status: 'approved', color: 'bg-emerald-600 text-white', label: 'Approved' };
    }
    return { status: 'review', color: 'bg-amber-500 text-white', label: 'In Review' };
  };

  return (
    <div
      id={`safety-file-card-${safetyFile.id}`}
      className={`bg-white border-2 border-slate-300 hover:border-[#0A192F] transition-all rounded-xs shadow-xs overflow-hidden flex flex-col font-sans ${className}`}
    >
      {/* Top Header Banner: Geometric Precision Layout */}
      <div className="bg-[#0A192F] text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-[#CC0000] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-amber-400">
                SANS 10139 Statutory Dossier
              </span>
              <span className="text-[10px] font-mono text-slate-500">•</span>
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded-xs">
                {safetyFile.revisionNumber}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h3 className="font-mono font-black text-lg text-white tracking-tight">
                {safetyFile.safetyFileNumber}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                PO: {safetyFile.poNumber || 'AFE-PO-2026'}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {getStatusBadge(safetyFile.status)}
        </div>
      </div>

      {/* Card Content Body: Strict Outer Padding Math p-6 */}
      <div className="p-6 flex-1 space-y-5">
        {/* Project and Site Name Block */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#CC0000] uppercase tracking-wider">
                Fire Detection Project
              </span>
              <h4 className="font-bold text-slate-900 text-lg leading-tight mt-0.5">
                {safetyFile.projectName}
              </h4>
            </div>
          </div>

          <div className="mt-2.5 flex items-start gap-2 text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xs border border-slate-200">
            <Building className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block truncate">{safetyFile.siteName}</span>
              <span className="text-slate-500 text-[11px] block truncate">{safetyFile.physicalAddress}</span>
            </div>
          </div>
        </div>

        {/* Completion Percentage Progress Section */}
        <div className="bg-slate-50 p-4 rounded-xs border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Statutory Completion</span>
            </span>
            <span
              className={`font-black text-sm ${
                metrics.completionPercentage === 100 ? 'text-emerald-700' : 'text-[#CC0000]'
              }`}
            >
              {metrics.completionPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-xs overflow-hidden border border-slate-300">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.completionPercentage === 100
                  ? 'bg-emerald-600'
                  : metrics.completionPercentage > 50
                  ? 'bg-amber-500'
                  : 'bg-[#CC0000]'
              }`}
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-0.5">
            <span>
              <strong className="text-slate-900">{metrics.approvedCount}</strong> of{' '}
              <strong className="text-slate-900">{metrics.mandatoryCount}</strong> mandatory sections approved
            </span>
            <span className="text-slate-500">
              {metrics.completionPercentage === 100 ? '100% SANS 10139 Certified' : 'Pending Statutory Evidence'}
            </span>
          </div>
        </div>

        {/* 16-Section Statutory Matrix Fingerprint */}
        <div className="bg-slate-50 p-4 rounded-xs border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>16-Section Statutory Structure</span>
            </span>
            <button
              onClick={() => setShowSectionBreakdown(!showSectionBreakdown)}
              className="text-[11px] text-[#CC0000] hover:text-[#990000] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showSectionBreakdown ? 'Hide Breakdown' : 'View Breakdown'}</span>
              {showSectionBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Micro Grid for 16 Sections */}
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
            {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
              const secInfo = getSectionStatus(num);
              const secDoc = safetyFile.sections.find(s => s.sectionNumber === num);
              return (
                <div
                  key={num}
                  title={`Section ${String(num).padStart(2, '0')}: ${secDoc?.title || 'Statutory Section'} (${secInfo.label})`}
                  className={`h-7 rounded-xs flex items-center justify-center font-mono text-[10px] font-black transition-transform hover:scale-105 cursor-pointer ${secInfo.color}`}
                  onClick={() => onOpenSafetyFile(safetyFile)}
                >
                  {String(num).padStart(2, '0')}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-emerald-600 inline-block"></span> Approved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block"></span> In Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-red-600 inline-block"></span> Action Gap
              </span>
            </div>
            <span className="text-slate-400">Sections 01 – 16</span>
          </div>

          {/* Expandable Section Breakdown List */}
          {showSectionBreakdown && (
            <div className="mt-3 pt-3 border-t border-slate-200 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {safetyFile.sections.map(sec => {
                const secInfo = getSectionStatus(sec.sectionNumber);
                const approvedCount = sec.documents.filter(d => d.isApproved).length;
                return (
                  <div
                    key={sec.sectionNumber}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-bold text-slate-900 shrink-0">
                        Sec {String(sec.sectionNumber).padStart(2, '0')}:
                      </span>
                      <span className="truncate text-slate-700" title={sec.title}>
                        {sec.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500 text-[10px]">
                        {approvedCount}/{sec.documents.length}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase ${secInfo.color}`}>
                        {secInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REQUIRED: List of Missing / Expired Documents Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0A192F]" />
              <span>Statutory Document Health</span>
            </span>

            {totalGaps > 0 ? (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-xs font-mono font-bold text-[10px] uppercase">
                {totalGaps} Compliance {totalGaps === 1 ? 'Gap' : 'Gaps'}
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xs font-mono font-bold text-[10px] uppercase">
                0 Gaps • Fully Compliant
              </span>
            )}
          </div>

          {totalGaps > 0 ? (
            <div className="bg-red-50/70 border-2 border-red-200 rounded-xs p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-red-900 font-bold border-b border-red-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Missing &amp; Expired Statutory Records ({totalGaps})</span>
                </span>
                {totalGaps > 2 && (
                  <button
                    onClick={() => setShowAllGaps(!showAllGaps)}
                    className="text-[11px] text-red-800 hover:text-red-950 underline cursor-pointer"
                  >
                    {showAllGaps ? 'Show Less' : `View All (${totalGaps})`}
                  </button>
                )}
              </div>

              {/* Structured List of Missing & Expired Items */}
              <div className="space-y-2 font-mono text-xs">
                {/* Missing Documents */}
                {missingDocuments.slice(0, showAllGaps ? undefined : 2).map(doc => (
                  <div
                    key={`missing-${doc.id}`}
                    className="p-2.5 bg-white border border-red-200 rounded-xs flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-xs text-[9px] font-black uppercase tracking-wider">
                          MISSING
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          SEC {String(doc.sectionNumber).padStart(2, '0')}: {doc.sectionTitle}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {doc.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 truncate">
                        Ref: <span className="text-slate-800 font-semibold">{doc.documentNumber}</span> • Mandatory SANS 10139 Requirement
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenSafetyFile(safetyFile)}
                      className="shrink-0 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 rounded-xs text-[10px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))}

                {/* Expired Documents */}
                {expiredDocuments.slice(0, showAllGaps ? undefined : 2).map(doc => (
                  <div
                    key={`expired-${doc.id}`}
                    className="p-2.5 bg-white border border-amber-300 rounded-xs flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded-xs text-[9px] font-black uppercase tracking-wider">
                          EXPIRED
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          SEC {String(doc.sectionNumber).padStart(2, '0')}: {doc.sectionTitle}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {doc.title}
                      </h5>
                      <p className="text-[11px] text-amber-900 truncate">
                        Ref: <span className="text-slate-800 font-semibold">{doc.documentNumber}</span> • Expiry Date:{' '}
                        <strong className="text-red-700">{doc.expiryDate || 'Expired'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenSafetyFile(safetyFile)}
                      className="shrink-0 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xs text-[10px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      Renew
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Pristine Zero-Gap Geometric Confirmation */
            <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-xs p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xs bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="font-mono text-xs min-w-0">
                <h5 className="font-bold text-emerald-900 uppercase">
                  All Statutory Documents In Order
                </h5>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  0 missing documents • 0 expired records. All 16 mandatory SANS 10139 statutory sections verified and signed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Personnel and Audit Footer */}
        <div className="border-t border-slate-200 pt-3 text-xs font-mono space-y-1.5 text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Responsible Technician:</span>
            <span className="font-bold text-slate-900">
              {safetyFile.responsibleTechnician} (
              <span className="text-[#CC0000]">{safetyFile.responsibleTechnicianSaqcc}</span>)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Authorised Commissioner:</span>
            <span className="font-bold text-slate-900">
              {safetyFile.authorisedCommissioner} (
              <span className="text-emerald-700">{safetyFile.authorisedCommissionerSaqcc}</span>)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-dashed border-slate-200">
            <span>Last Dossier Audit:</span>
            <span>{new Date(safetyFile.lastUpdatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar: Strict 2:1 Geometric Balance Padding (py-2.5 px-5) */}
      <div className="bg-slate-50 p-4 border-t-2 border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          id={`btn-open-safety-file-${safetyFile.id}`}
          onClick={() => onOpenSafetyFile(safetyFile)}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#0A192F] hover:bg-[#152a4a] text-white rounded-xs font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Open Safety File</span>
        </button>

        <button
          id={`btn-print-preview-${safetyFile.id}`}
          onClick={() => onPrintPreview(safetyFile)}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xs font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>Print Preview</span>
        </button>

        <button
          id={`btn-download-pdf-${safetyFile.id}`}
          onClick={() => onDownloadPdf(safetyFile)}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xs font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>Download PDF</span>
        </button>

        <button
          id={`btn-email-safety-file-${safetyFile.id}`}
          onClick={() => onEmail(safetyFile)}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>Email</span>
        </button>
      </div>
    </div>
  );
};


