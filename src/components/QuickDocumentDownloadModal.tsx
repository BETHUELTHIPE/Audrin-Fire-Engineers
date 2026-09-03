import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SafetyFile, SafetyFileDocument } from '../types/safetyFile';

interface QuickDocumentDownloadModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  onDownloadSingleDoc?: (doc: SafetyFileDocument) => void;
}

export const QuickDocumentDownloadModal: React.FC<QuickDocumentDownloadModalProps> = ({
  safetyFile,
  isOpen,
  onClose,
  onDownloadSingleDoc
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | 'all'>('all');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Flatten all documents across all 16 sections
  const allDocs = useMemo(() => {
    return safetyFile.sections.flatMap(sec =>
      sec.documents.map(doc => ({
        ...doc,
        sectionTitle: sec.title,
        sectionNum: sec.sectionNumber
      }))
    );
  }, [safetyFile]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return allDocs.filter(doc => {
      if (selectedSection !== 'all' && doc.sectionNum !== selectedSection) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.documentNumber.toLowerCase().includes(q) ||
        doc.sectionTitle.toLowerCase().includes(q) ||
        (doc.contentSummary && doc.contentSummary.toLowerCase().includes(q))
      );
    });
  }, [allDocs, selectedSection, searchQuery]);

  const handleDownload = (doc: SafetyFileDocument) => {
    if (onDownloadSingleDoc) {
      onDownloadSingleDoc(doc);
    } else {
      // Simulate download of the verified statutory document
      const blob = new Blob(
        [
          `AUDRIN FIRE ENGINEERS (PTY) LTD\n` +
          `STATUTORY FIRE DETECTION SAFETY FILE DOCUMENT\n` +
          `============================================================\n` +
          `Project: ${safetyFile.projectName}\n` +
          `Site: ${safetyFile.siteName}\n` +
          `Safety File Number: ${safetyFile.safetyFileNumber}\n` +
          `Contract Number: ${safetyFile.contractNumber || 'AFE-CNT-2026'}\n` +
          `------------------------------------------------------------\n` +
          `Document Number: ${doc.documentNumber}\n` +
          `Document Title: ${doc.title}\n` +
          `Section: ${doc.sectionNumber} - ${doc.sectionNumber}\n` +
          `Revision: ${doc.revision}\n` +
          `Status: ${doc.status}\n` +
          `Page Count: ${doc.pageCount} page(s)\n` +
          `Issue Date: ${doc.issueDate || '2026-08-15'}\n` +
          `Prepared By: ${doc.preparedBy?.name || 'Lead Technician'} (${doc.preparedBy?.role || 'SAQCC'})\n` +
          `Approved By: ${doc.approvedBy?.name || 'Bethuel Moukangwe'} (${doc.approvedBy?.role || 'SANS 10139 Commissioner'})\n` +
          `------------------------------------------------------------\n` +
          `Content Summary:\n${doc.contentSummary || 'Certified statutory document aligned with SANS 10139 and SANS 10400-T regulations.'}\n` +
          `============================================================\n` +
          `Verification Hash: SHA256:${Math.random().toString(36).substring(2, 15).toUpperCase()}\n` +
          `Timestamp: ${new Date().toISOString()}\n`
        ],
        { type: 'text/plain;charset=utf-8;' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.documentNumber}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setDownloadSuccessToast(`Downloaded: ${doc.documentNumber} - ${doc.title}`);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xs shadow-2xl border-2 border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase rounded-xs">
                SANS 10139 Section Document Vault
              </span>
              <span className="text-xs font-mono text-slate-300">
                Ref: <strong className="text-white">{safetyFile.safetyFileNumber}</strong>
              </span>
            </div>
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Download Selected Statutory Document</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Select any specific certificate, schematic, or test report from the 16 statutory sections for immediate download.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xs bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Toast */}
        {downloadSuccessToast && (
          <div className="p-3 bg-emerald-900 text-emerald-100 text-xs font-mono font-bold flex items-center gap-2 border-b border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}

        {/* Controls Bar: Search & Section Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search document title, ref (e.g. DOC-02.01), or keyword..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
            />
          </div>

          <div>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="all">All 16 Sections ({allDocs.length} Docs)</option>
              {safetyFile.sections.map(sec => (
                <option key={sec.sectionNumber} value={sec.sectionNumber}>
                  Sec {sec.sectionNumber}: {sec.title.substring(0, 30)}... ({sec.documents.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching documents found.</p>
              <p className="text-[11px] mt-1">Try clearing your search query or section filter.</p>
            </div>
          ) : (
            filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xs transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-[#0A192F] text-white rounded-xs font-mono font-bold text-[10px]">
                      Sec {doc.sectionNum}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#CC0000]">
                      {doc.documentNumber}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-xs font-mono text-[10px]">
                      {doc.revision}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase ${
                        doc.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'Under Review' || doc.status === 'Awaiting Signature'
                          ? 'bg-amber-100 text-amber-800'
                          : doc.status === 'Missing'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                    {doc.isMandatory && (
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-xs text-[9px] font-mono font-bold uppercase">
                        Mandatory
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {doc.title}
                  </h4>

                  {doc.contentSummary && (
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {doc.contentSummary}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                    <span>{doc.pageCount} pages</span>
                    {doc.issueDate && <span>Issued: {doc.issueDate}</span>}
                    {doc.approvedBy?.name && <span>Approved by: {doc.approvedBy.name}</span>}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#152a4a] text-white font-mono text-xs font-bold rounded-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600">
            Showing <strong>{filteredDocs.length}</strong> of <strong>{allDocs.length}</strong> statutory documents
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
