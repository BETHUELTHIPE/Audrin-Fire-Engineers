import React from 'react';
import { SafetyFile, SafetyFileDocument, SafetyFileSection } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

interface SafetyFileIndexPageProps {
  safetyFile: SafetyFile;
  className?: string;
  onSelectDocument?: (sectionNumber: number, document: SafetyFileDocument) => void;
  exportMode?: 'draft' | 'final';
}

export const SafetyFileIndexPage: React.FC<SafetyFileIndexPageProps> = ({
  safetyFile,
  className = '',
  onSelectDocument,
  exportMode = 'draft'
}) => {
  // Dynamically calculate page numbering
  const { calculatedSections, totalPages } = safetyFileService.calculateIndexPages(safetyFile);

  return (
    <div className={`bg-white text-slate-900 border-2 border-[#0A192F] p-6 sm:p-10 shadow-lg rounded-sm font-sans select-text ${className}`}>
      {/* REPEATED STATUTORY RUNNING HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-slate-300 font-mono text-[10px] text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#CC0000] fill-[#CC0000]" />
          <span className="font-bold text-[#0A192F] uppercase">AUDRIN FIRE ENGINEERS</span>
          <span>•</span>
          <span className="uppercase">{safetyFile.clientCompanyName}</span>
          <span>•</span>
          <span className="text-slate-800 font-bold">{safetyFile.siteName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Ref: <strong className="text-[#CC0000]">{safetyFile.safetyFileNumber}</strong></span>
          <span>•</span>
          <span>Rev: <strong className="text-slate-900">{safetyFile.revisionNumber}</strong></span>
          <span>•</span>
          <span>Index Page: <strong>2</strong> of {totalPages}</span>
        </div>
      </div>

      {/* SECTION TITLE */}
      <div className="my-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold uppercase rounded-xs mb-1.5">
              <BookOpen className="w-3 h-3 text-[#CC0000]" />
              <span>STATUTORY MASTER TABLE OF CONTENTS</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight uppercase font-mono">
              AUTOMATIC COMPLIANCE INDEX REGISTER
            </h2>
          </div>
          <div className="text-right font-mono text-xs hidden sm:block">
            <div className="text-slate-500">Controlled Master Index</div>
            <div className="text-emerald-700 font-bold">16 Mandated Sections</div>
          </div>
        </div>
        <p className="text-xs text-slate-600 font-mono mt-1">
          Dynamic document index generated in accordance with SANS 10139 / SANS 10400-T requirements. Section numbering is preserved across all revisions.
        </p>
      </div>

      {/* INDEX TABLE */}
      <div className="border-2 border-[#0A192F] rounded-xs overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0A192F] text-white text-[11px] uppercase tracking-wider">
                <th className="p-2.5 font-bold w-16 text-center">Sec.</th>
                <th className="p-2.5 font-bold">Controlled Document Title</th>
                <th className="p-2.5 font-bold w-36">Document Number</th>
                <th className="p-2.5 font-bold w-20 text-center">Revision</th>
                <th className="p-2.5 font-bold w-28 text-center">Status</th>
                <th className="p-2.5 font-bold w-16 text-center">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculatedSections.map(section => {
                const isFinalExport = exportMode === 'final';
                // In final issued export mode, show only approved documents
                const displayDocs = isFinalExport
                  ? section.documents.filter(d => d.status === 'Approved' || d.status === 'Issued')
                  : section.documents;

                return (
                  <React.Fragment key={section.sectionNumber}>
                    {/* SECTION HEADER ROW */}
                    <tr className="bg-slate-100/90 border-t-2 border-slate-300">
                      <td className="p-2 text-center font-black text-[#0A192F] text-sm">
                        {section.sectionNumber.toString().padStart(2, '0')}
                      </td>
                      <td colSpan={5} className="p-2 font-bold text-[#0A192F] uppercase text-xs">
                        <div className="flex items-center justify-between">
                          <span>{section.title}</span>
                          <span className="text-[10px] text-slate-500 font-normal lowercase italic hidden md:inline">
                            {section.description}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* DOCUMENTS IN THIS SECTION */}
                    {displayDocs.length === 0 ? (
                      <tr className="bg-red-50/40">
                        <td className="p-2 text-center text-slate-400">—</td>
                        <td colSpan={3} className="p-2 text-red-700 italic">
                          Mandatory compliance document not yet uploaded or approved for this section.
                        </td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-xs uppercase">
                            Missing
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-400 font-bold">—</td>
                      </tr>
                    ) : (
                      displayDocs.map((doc, docIdx) => {
                        const isMissing = doc.status === 'Missing';
                        const isApproved = doc.status === 'Approved' || doc.status === 'Issued';

                        return (
                          <tr
                            key={doc.id || docIdx}
                            onClick={() => onSelectDocument?.(section.sectionNumber, doc)}
                            className={`transition-colors ${
                              onSelectDocument ? 'cursor-pointer hover:bg-blue-50/60' : 'hover:bg-slate-50'
                            } ${isMissing ? 'bg-red-50/60' : ''}`}
                          >
                            <td className="p-2 text-center text-slate-400 text-[11px]">
                              {section.sectionNumber}.{docIdx + 1}
                            </td>
                            <td className="p-2 font-medium text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <FileText className={`w-3.5 h-3.5 shrink-0 ${isMissing ? 'text-red-500' : isApproved ? 'text-emerald-600' : 'text-amber-500'}`} />
                                <span className={isMissing ? 'text-red-800 font-bold' : ''}>
                                  {doc.title}
                                </span>
                                {doc.isMandatory && (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                                    MANDATORY
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 font-mono text-slate-600 text-[11px]">
                              {doc.documentNumber}
                            </td>
                            <td className="p-2 text-center font-mono font-semibold text-slate-700 text-[11px]">
                              {doc.revision}
                            </td>
                            <td className="p-2 text-center">
                              {isMissing ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-xs uppercase tracking-wider">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Missing</span>
                                </span>
                              ) : isApproved ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-xs uppercase">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-xs uppercase">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>{doc.status}</span>
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center font-mono font-bold text-slate-800">
                              {doc.calculatedStartPage ? (
                                <span>{doc.calculatedStartPage}</span>
                              ) : (
                                <span className="text-red-500 font-bold">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPEATED STATUTORY RUNNING FOOTER */}
      <div className="pt-3 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-slate-500 gap-2">
        <div>
          Client: <strong className="text-slate-800 uppercase">{safetyFile.clientCompanyName}</strong> | Site: <strong className="text-slate-800">{safetyFile.siteName}</strong>
        </div>
        <div className="flex items-center gap-4">
          <span>File Ref: <strong className="text-slate-800">{safetyFile.safetyFileNumber}</strong></span>
          <span>•</span>
          <span>Rev: <strong className="text-slate-800">{safetyFile.revisionNumber}</strong></span>
          <span>•</span>
          <span>Page 2 of {totalPages} (Master Index)</span>
        </div>
      </div>
    </div>
  );
};
