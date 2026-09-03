import React, { useState } from 'react';
import {
  SafetyFile,
  SafetyFileDocument,
  SafetyFileSection,
  SafetyFileStatus,
  SafetyFileDocumentStatus
} from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';
import { validateFile } from '../utils/fileValidation';
import { SafetyFileCover } from './SafetyFileCover';
import { SafetyFileIndexPage } from './SafetyFileIndexPage';
import {
  X,
  Flame,
  Award,
  ShieldCheck,
  Building,
  FileText,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Upload,
  Lock,
  History,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileCode,
  FolderOpen
} from 'lucide-react';

interface SafetyFileViewerModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  onPrintPreview: (safetyFile: SafetyFile) => void;
  onDownloadPdf: (safetyFile: SafetyFile) => void;
  onEmail: (safetyFile: SafetyFile) => void;
  currentUserRole?: string;
  currentUserName?: string;
  onFileUpdated?: (updatedFile: SafetyFile) => void;
}

export const SafetyFileViewerModal: React.FC<SafetyFileViewerModalProps> = ({
  safetyFile: initialSafetyFile,
  isOpen,
  onClose,
  onPrintPreview,
  onDownloadPdf,
  onEmail,
  currentUserRole = 'customer',
  currentUserName = 'Current User',
  onFileUpdated
}) => {
  const [safetyFile, setSafetyFile] = useState<SafetyFile>(initialSafetyFile);
  const [activeTab, setActiveTab] = useState<'cover' | 'index' | 'sections' | 'approvals' | 'audit'>('cover');
  const [selectedSectionNumber, setSelectedSectionNumber] = useState<number>(1);
  const [selectedDocument, setSelectedDocument] = useState<SafetyFileDocument | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocNumber, setUploadDocNumber] = useState('');
  const [uploadRevision, setUploadRevision] = useState('REV 01.0');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadPageCount, setUploadPageCount] = useState(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Client comment state
  const [clientCommentText, setClientCommentText] = useState('');
  const [clientAckSuccess, setClientAckSuccess] = useState(false);

  // Signature modal state
  const [signingRole, setSigningRole] = useState<'preparedBy' | 'reviewedBy' | 'approvedBy' | 'clientAcknowledgement' | null>(null);
  const [signerRegNo, setSignerRegNo] = useState('');
  const [signatureText, setSignatureText] = useState(currentUserName);

  if (!isOpen) return null;

  const metrics = safetyFileService.getSafetyFileMetrics(safetyFile);
  const activeSection = safetyFile.sections.find(s => s.sectionNumber === selectedSectionNumber) || safetyFile.sections[0];

  const handleSignRole = (roleKey: 'preparedBy' | 'reviewedBy' | 'approvedBy' | 'clientAcknowledgement') => {
    let defaultReg = '';
    if (roleKey === 'preparedBy') defaultReg = safetyFile.responsibleTechnicianSaqcc;
    else if (roleKey === 'approvedBy') defaultReg = safetyFile.authorisedCommissionerSaqcc;
    else if (roleKey === 'reviewedBy') defaultReg = 'ECSA Pr.Eng 2026991';
    else defaultReg = 'Client Representative';

    setSigningRole(roleKey);
    setSignerRegNo(defaultReg);
    setSignatureText(currentUserName);
  };

  const submitSignature = () => {
    if (!signingRole) return;
    const roleLabels = {
      preparedBy: 'Lead Fire Detection Technician',
      reviewedBy: 'Project & Safety Manager',
      approvedBy: 'Authorised SANS 10139 Commissioner',
      clientAcknowledgement: 'Client Safety Officer / Representative'
    };

    const updated = safetyFileService.signApprovalRole(
      safetyFile.id,
      signingRole,
      currentUserName,
      roleLabels[signingRole],
      signerRegNo,
      signatureText
    );

    if (updated) {
      setSafetyFile(updated);
      onFileUpdated?.(updated);
    }
    setSigningRole(null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const result = validateFile(file);
    if (!result.isValid) {
      setUploadError(result.error || 'Invalid file');
      setUploadFile(null);
      return;
    }
    setUploadError(null);
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
    if (!uploadDocNumber) {
      setUploadDocNumber(`AFE-SF-DOC-${selectedSectionNumber.toString().padStart(2, '0')}.${(activeSection.documents.length + 1).toString().padStart(2, '0')}`);
    }
  };

  const submitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const isTechOrAdmin = currentUserRole === 'staff' || currentUserRole === 'admin' || currentUserRole === 'superadmin';
      const newStatus: SafetyFileDocumentStatus = isTechOrAdmin ? 'Approved' : 'Submitted';

      const updated = safetyFileService.addDocumentToSection(
        safetyFile.id,
        selectedSectionNumber,
        {
          sectionNumber: selectedSectionNumber,
          title: uploadTitle,
          documentNumber: uploadDocNumber || `AFE-SF-DOC-${selectedSectionNumber}.99`,
          revision: uploadRevision || 'REV 01.0',
          status: newStatus,
          isMandatory: true,
          isApproved: isTechOrAdmin,
          preparedBy: {
            name: currentUserName,
            role: currentUserRole,
            date: new Date().toISOString().split('T')[0]
          },
          issueDate: new Date().toISOString().split('T')[0],
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          fileType: uploadFile.type,
          pageCount: uploadPageCount,
          contentSummary: uploadSummary || 'Controlled document uploaded and registered into safety file dossier.',
          watermarkText: isTechOrAdmin ? undefined : 'DRAFT – NOT APPROVED FOR CLIENT RELIANCE'
        },
        currentUserName,
        currentUserRole
      );

      if (updated) {
        setSafetyFile(updated);
        onFileUpdated?.(updated);
      }

      setIsUploading(false);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDocNumber('');
      setUploadSummary('');
    }, 600);
  };

  const handleDocumentStatusChange = (doc: SafetyFileDocument, newStatus: SafetyFileDocumentStatus) => {
    const updated = safetyFileService.updateDocument(
      safetyFile.id,
      doc.sectionNumber,
      doc.id,
      {
        status: newStatus,
        isApproved: newStatus === 'Approved' || newStatus === 'Issued',
        watermarkText: newStatus === 'Approved' || newStatus === 'Issued' ? undefined : 'DRAFT – NOT APPROVED FOR CLIENT RELIANCE'
      },
      currentUserName,
      currentUserRole
    );

    if (updated) {
      setSafetyFile(updated);
      onFileUpdated?.(updated);
      // Update selected doc view
      const refreshedSec = updated.sections.find(s => s.sectionNumber === doc.sectionNumber);
      const refreshedDoc = refreshedSec?.documents.find(d => d.id === doc.id);
      if (refreshedDoc) setSelectedDocument(refreshedDoc);
    }
  };

  const handleClientAcknowledgement = (doc: SafetyFileDocument) => {
    if (!clientCommentText.trim()) return;

    const updated = safetyFileService.addClientCommentOrAck(
      safetyFile.id,
      doc.id,
      doc.sectionNumber,
      currentUserName,
      'Client Safety Officer',
      clientCommentText
    );

    if (updated) {
      setSafetyFile(updated);
      onFileUpdated?.(updated);
      setClientAckSuccess(true);
      setTimeout(() => setClientAckSuccess(false), 2000);
      setClientCommentText('');

      const refreshedSec = updated.sections.find(s => s.sectionNumber === doc.sectionNumber);
      const refreshedDoc = refreshedSec?.documents.find(d => d.id === doc.id);
      if (refreshedDoc) setSelectedDocument(refreshedDoc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xs border-2 border-[#0A192F] shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <div className="bg-[#0A192F] text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-[#CC0000] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                  Audrin Fire Engineers (Pty) Ltd
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-xs text-slate-300">
                  Ref: <strong className="text-white">{safetyFile.safetyFileNumber}</strong> ({safetyFile.revisionNumber})
                </span>
              </div>
              <h2 className="font-mono font-bold text-lg text-white tracking-tight flex items-center gap-2">
                <span>{safetyFile.projectName}</span>
                <span className="text-xs px-2 py-0.5 rounded-xs bg-slate-800 border border-slate-700 font-mono text-slate-300 font-normal">
                  {safetyFile.siteName}
                </span>
              </h2>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => onPrintPreview(safetyFile)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={() => onDownloadPdf(safetyFile)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => onEmail(safetyFile)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-bold rounded-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Safety Officer</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METRICS & STATUS SUB-BAR */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Status:</span>
              <span className={`px-2 py-0.5 rounded-xs font-bold uppercase ${
                safetyFile.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {safetyFile.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Completion:</span>
              <span className="font-bold text-slate-800">{metrics.completionPercentage}%</span>
              <div className="w-24 bg-slate-200 h-2 rounded-xs overflow-hidden">
                <div
                  className={`h-full ${metrics.completionPercentage === 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                  style={{ width: `${metrics.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {metrics.missingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{metrics.missingCount} Missing Mandatory Docs</span>
              </span>
            )}
            {metrics.expiredCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{metrics.expiredCount} Expired Docs</span>
              </span>
            )}
            <span className="text-slate-500">
              Tech: <strong>{safetyFile.responsibleTechnician}</strong> | Comm: <strong>{safetyFile.authorisedCommissioner}</strong>
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white border-b-2 border-slate-200 px-4 flex items-center gap-1 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => { setActiveTab('cover'); setSelectedDocument(null); }}
            className={`px-4 py-3 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cover'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Cover Page &amp; Signatures
          </button>

          <button
            onClick={() => { setActiveTab('index'); setSelectedDocument(null); }}
            className={`px-4 py-3 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'index'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Master Index (All 16 Sections)
          </button>

          <button
            onClick={() => { setActiveTab('sections'); }}
            className={`px-4 py-3 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sections'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Controlled Section Explorer</span>
          </button>

          <button
            onClick={() => { setActiveTab('approvals'); setSelectedDocument(null); }}
            className={`px-4 py-3 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>4. Regulatory Sign-Off Register</span>
          </button>

          <button
            onClick={() => { setActiveTab('audit'); setSelectedDocument(null); }}
            className={`px-4 py-3 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>5. Audit Trail &amp; Deliveries</span>
          </button>
        </div>

        {/* TAB 1: COVER PAGE */}
        {activeTab === 'cover' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
            <div className="max-w-4xl mx-auto">
              <SafetyFileCover
                safetyFile={safetyFile}
                isIncomplete={metrics.isIncomplete}
                showSignButtons={true}
                onSignRole={handleSignRole}
                currentUserRole={currentUserRole}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MASTER INDEX */}
        {activeTab === 'index' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
            <div className="max-w-4xl mx-auto">
              <SafetyFileIndexPage
                safetyFile={safetyFile}
                onSelectDocument={(secNum, doc) => {
                  setSelectedSectionNumber(secNum);
                  setSelectedDocument(doc);
                  setActiveTab('sections');
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: 16 SECTION EXPLORER */}
        {activeTab === 'sections' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Section List Sidebar */}
            <div className="w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 font-mono text-xs">
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold uppercase text-[#0A192F] flex items-center justify-between">
                <span>16 Mandatory Sections</span>
                <span className="text-[10px] text-slate-500">SANS 10139</span>
              </div>
              <div className="divide-y divide-slate-200">
                {safetyFile.sections.map(sec => {
                  const hasMissing = sec.documents.some(d => d.status === 'Missing');
                  const isSelected = sec.sectionNumber === selectedSectionNumber;

                  return (
                    <button
                      key={sec.sectionNumber}
                      onClick={() => {
                        setSelectedSectionNumber(sec.sectionNumber);
                        setSelectedDocument(null);
                      }}
                      className={`w-full text-left p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isSelected ? 'bg-white border-l-4 border-[#CC0000] shadow-xs' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-xs font-bold flex items-center justify-center shrink-0 text-xs ${
                        isSelected ? 'bg-[#0A192F] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {sec.sectionNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate">{sec.title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span>{sec.documents.length} doc{sec.documents.length === 1 ? '' : 's'}</span>
                          {hasMissing && (
                            <span className="text-red-600 font-bold flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" /> Missing
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Document Browser / Detail Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col font-mono text-xs">
              {/* Section Header Banner */}
              <div className="bg-white border border-slate-200 p-4 rounded-xs shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">
                    Section {activeSection.sectionNumber} of 16
                  </div>
                  <h3 className="font-mono text-base font-black text-[#0A192F] uppercase">
                    {activeSection.title}
                  </h3>
                  <p className="text-slate-600 text-xs font-sans mt-0.5">
                    {activeSection.description}
                  </p>
                </div>

                {/* Upload New Document Button */}
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0A192F] hover:bg-[#152a4a] text-white font-bold rounded-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload / Register Document</span>
                </button>
              </div>

              {/* Documents in this Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeSection.documents.map(doc => {
                  const isSelected = selectedDocument?.id === doc.id;
                  const isMissing = doc.status === 'Missing';
                  const isApproved = doc.status === 'Approved' || doc.status === 'Issued';

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`bg-white border-2 rounded-xs p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0A192F] ring-1 ring-[#0A192F]'
                          : isMissing
                          ? 'border-red-200 hover:border-red-400'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">
                            {doc.documentNumber} ({doc.revision})
                          </span>
                          <span className={`px-2 py-0.5 rounded-xs font-bold uppercase text-[10px] ${
                            isMissing
                              ? 'bg-red-100 text-red-800'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {doc.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-1.5 font-sans leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-sans line-clamp-2">
                          {doc.contentSummary || 'Controlled technical document registered into safety dossier.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Prepared: {doc.preparedBy.name}</span>
                        <span>{doc.pageCount} Pages</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Document Details & Inspection View */}
              {selectedDocument && (
                <div className="bg-white border-2 border-[#0A192F] rounded-xs p-5 shadow-md mt-auto">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">
                        Controlled Document Inspector • {selectedDocument.documentNumber}
                      </div>
                      <h4 className="text-base font-bold text-[#0A192F]">
                        {selectedDocument.title}
                      </h4>
                    </div>

                    {/* Status & Review Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status:</span>
                      <select
                        value={selectedDocument.status}
                        onChange={e => handleDocumentStatusChange(selectedDocument, e.target.value as SafetyFileDocumentStatus)}
                        className="p-1 border border-slate-300 rounded-xs bg-white text-slate-800 font-bold"
                      >
                        <option value="Missing">Missing</option>
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Issued">Issued</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary & Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xs border border-slate-200 mb-4 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Revision:</span>
                      <strong>{selectedDocument.revision}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prepared By:</span>
                      <strong>{selectedDocument.preparedBy.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Issue Date:</span>
                      <strong>{selectedDocument.issueDate || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Expiry Date:</span>
                      <strong className={selectedDocument.isExpired ? 'text-red-600' : ''}>
                        {selectedDocument.expiryDate || 'N/A'}
                      </strong>
                    </div>
                  </div>

                  {/* Content summary */}
                  <div className="space-y-1 mb-4">
                    <span className="font-bold text-slate-700 uppercase text-[10px]">Document Description &amp; Scope:</span>
                    <p className="text-slate-800 font-sans text-xs bg-slate-50 p-3 rounded-xs border border-slate-200">
                      {selectedDocument.contentSummary}
                    </p>
                  </div>

                  {/* Client Acknowledgement Section */}
                  <div className="border border-blue-200 bg-blue-50/60 p-3.5 rounded-xs space-y-2">
                    <h5 className="font-bold text-blue-900 flex items-center gap-1.5 uppercase text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Client Safety Officer Acknowledgement &amp; Comments:</span>
                    </h5>
                    {selectedDocument.clientAcknowledgement ? (
                      <div className="text-xs text-blue-950">
                        <p className="italic">"{selectedDocument.clientAcknowledgement.comments}"</p>
                        <div className="text-[10px] text-blue-700 mt-1">
                          Signed by {selectedDocument.clientAcknowledgement.signedByName} on {new Date(selectedDocument.clientAcknowledgement.signedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={clientCommentText}
                          onChange={e => setClientCommentText(e.target.value)}
                          placeholder="Enter client safety officer notes, comments or acknowledge this specific section..."
                          className="w-full p-2 border border-blue-200 rounded-xs text-slate-800 bg-white text-xs font-sans"
                        />
                        <button
                          onClick={() => handleClientAcknowledgement(selectedDocument)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xs font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Submit Client Acknowledgement
                        </button>
                        {clientAckSuccess && (
                          <span className="text-emerald-700 font-bold text-xs ml-2">Acknowledgement recorded!</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: APPROVALS & SIGNATURES */}
        {activeTab === 'approvals' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 font-mono text-xs">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xs shadow-xs">
                <h3 className="font-bold text-base text-[#0A192F] uppercase mb-1">
                  Statutory Sign-Off &amp; Certification Register
                </h3>
                <p className="text-slate-600 text-xs font-sans">
                  SANS 10139 and SANS 10400-T require sequential verification by registered SAQCC technicians, project management, accredited commissioners, and the client representative.
                </p>
              </div>

              {/* Roles Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Prepared by */}
                <div className="bg-white border-2 border-slate-200 p-4 rounded-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-sm text-[#0A192F] uppercase">1. Prepared By</strong>
                    {safetyFile.approvals.preparedBy.isSigned ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-xs text-[10px]">
                        SIGNED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-xs text-[10px]">
                        PENDING
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Technician Name:</span>
                    <strong>{safetyFile.approvals.preparedBy.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SAQCC Registration:</span>
                    <strong className="text-[#CC0000]">{safetyFile.approvals.preparedBy.registrationOrId || safetyFile.responsibleTechnicianSaqcc}</strong>
                  </div>
                  {safetyFile.approvals.preparedBy.isSigned ? (
                    <div className="text-emerald-700 text-xs pt-1 border-t border-slate-100">
                      Signature: <strong>{safetyFile.approvals.preparedBy.signature}</strong>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignRole('preparedBy')}
                      className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xs uppercase cursor-pointer"
                    >
                      Sign as Technician
                    </button>
                  )}
                </div>

                {/* 2. Reviewed by */}
                <div className="bg-white border-2 border-slate-200 p-4 rounded-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-sm text-[#0A192F] uppercase">2. Reviewed By</strong>
                    {safetyFile.approvals.reviewedBy.isSigned ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-xs text-[10px]">
                        SIGNED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-xs text-[10px]">
                        PENDING
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Project Manager:</span>
                    <strong>{safetyFile.approvals.reviewedBy.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Professional Reg / Role:</span>
                    <strong>{safetyFile.approvals.reviewedBy.registrationOrId}</strong>
                  </div>
                  {safetyFile.approvals.reviewedBy.isSigned ? (
                    <div className="text-emerald-700 text-xs pt-1 border-t border-slate-100">
                      Signature: <strong>{safetyFile.approvals.reviewedBy.signature}</strong>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignRole('reviewedBy')}
                      className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xs uppercase cursor-pointer"
                    >
                      Sign Project Review
                    </button>
                  )}
                </div>

                {/* 3. Approved by */}
                <div className="bg-white border-2 border-[#0A192F] p-4 rounded-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-sm text-[#0A192F] uppercase">3. Approved By (Commissioner)</strong>
                    {safetyFile.approvals.approvedBy.isSigned ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-xs text-[10px]">
                        APPROVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-xs text-[10px]">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SANS Commissioner:</span>
                    <strong>{safetyFile.approvals.approvedBy.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SAQCC Commissioner Reg:</span>
                    <strong className="text-emerald-700">{safetyFile.approvals.approvedBy.registrationOrId || safetyFile.authorisedCommissionerSaqcc}</strong>
                  </div>
                  {safetyFile.approvals.approvedBy.isSigned ? (
                    <div className="text-emerald-700 text-xs pt-1 border-t border-slate-100">
                      Signature: <strong>{safetyFile.approvals.approvedBy.signature}</strong>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignRole('approvedBy')}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs uppercase cursor-pointer"
                    >
                      Approve as Commissioner
                    </button>
                  )}
                </div>

                {/* 4. Client acknowledgement */}
                <div className="bg-white border-2 border-slate-200 p-4 rounded-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-sm text-[#0A192F] uppercase">4. Client Acknowledgement</strong>
                    {safetyFile.approvals.clientAcknowledgement.isSigned ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-xs text-[10px]">
                        ACKNOWLEDGED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-xs text-[10px]">
                        PENDING
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Client Safety Officer:</span>
                    <strong>{safetyFile.approvals.clientAcknowledgement.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Client Designation:</span>
                    <strong>{safetyFile.approvals.clientAcknowledgement.role}</strong>
                  </div>
                  {safetyFile.approvals.clientAcknowledgement.isSigned ? (
                    <div className="text-emerald-700 text-xs pt-1 border-t border-slate-100">
                      Signature: <strong>{safetyFile.approvals.clientAcknowledgement.signature}</strong>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignRole('clientAcknowledgement')}
                      className="w-full mt-2 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-bold rounded-xs uppercase cursor-pointer"
                    >
                      Sign Client Acceptance
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL & DELIVERIES */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 font-mono text-xs">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Audit trail */}
              <div className="bg-white border border-slate-200 p-4 rounded-xs shadow-xs">
                <h3 className="font-bold text-sm text-[#0A192F] uppercase mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#CC0000]" />
                  <span>Compliance Audit Trail (Immutable Event Log)</span>
                </h3>
                <div className="space-y-2">
                  {safetyFile.auditTrail.map(at => (
                    <div key={at.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-800">{at.action}</div>
                        <div className="text-slate-600 text-[11px]">{at.details}</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 shrink-0">
                        <div>{at.user} ({at.role})</div>
                        <div>{new Date(at.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email deliveries */}
              <div className="bg-white border border-slate-200 p-4 rounded-xs shadow-xs">
                <h3 className="font-bold text-sm text-[#0A192F] uppercase mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Email Deliveries to Client Safety Officers</span>
                </h3>
                {safetyFile.emailDeliveries.length === 0 ? (
                  <p className="text-slate-500 italic">No email dispatches recorded yet for this safety file.</p>
                ) : (
                  <div className="space-y-2">
                    {safetyFile.emailDeliveries.map(em => (
                      <div key={em.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{em.subject}</div>
                          <div className="text-slate-500 text-[10px]">To: {em.recipientName} ({em.recipientEmail})</div>
                        </div>
                        <div className="text-right text-[10px] text-emerald-700 font-bold">
                          <div>STATUS: {em.status}</div>
                          <div className="text-slate-400 font-normal">{new Date(em.sentAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD DOCUMENT MODAL OVERLAY */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
            <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
              <div className="bg-[#0A192F] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Document to Section {selectedSectionNumber}</span>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitUpload} className="p-5 space-y-3.5 font-mono text-xs">
                {/* Drag-and-drop zone */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0A192F] p-5 rounded-xs text-center bg-slate-50 cursor-pointer"
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    onChange={e => e.target.files && e.target.files[0] && handleFileSelected(e.target.files[0])}
                    accept=".pdf,.pdfa,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.png,.jpg,.jpeg,.zip"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  {uploadFile ? (
                    <div className="text-emerald-700 font-bold">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-slate-700">Drag &amp; drop file here, or click to browse</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Allowed: PDF, Images (JPG, PNG), CAD (DWG, DXF), Word, Excel. Executables strictly rejected.
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-xs text-[11px] font-bold">
                    {uploadError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="e.g. SANS 10139 Loop Test Certificate"
                    className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Document Number</label>
                    <input
                      type="text"
                      value={uploadDocNumber}
                      onChange={e => setUploadDocNumber(e.target.value)}
                      placeholder={`AFE-SF-DOC-${selectedSectionNumber}.01`}
                      className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Page Count</label>
                    <input
                      type="number"
                      min={1}
                      value={uploadPageCount}
                      onChange={e => setUploadPageCount(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Technical Summary / Scope</label>
                  <textarea
                    rows={2}
                    value={uploadSummary}
                    onChange={e => setUploadSummary(e.target.value)}
                    placeholder="Summary of compliance findings, manufacturer specs, or test results..."
                    className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900 font-sans"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs uppercase font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? 'Registering...' : 'Upload & Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SIGN ROLE MODAL OVERLAY */}
        {signingRole && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
            <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
              <div className="bg-[#0A192F] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Electronic Statutory Sign-Off: {signingRole}</span>
                </div>
                <button
                  onClick={() => setSigningRole(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={e => setSignatureText(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Professional Reg. / SAQCC / ID No.</label>
                  <input
                    type="text"
                    value={signerRegNo}
                    onChange={e => setSignerRegNo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xs bg-white text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-[11px] leading-relaxed">
                  By clicking "Confirm Signature", you digitally seal this statutory record pack in compliance with the Electronic Communications and Transactions Act (ECTA) and SANS 10139.
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSigningRole(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitSignature}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs uppercase font-bold cursor-pointer"
                  >
                    Confirm Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
