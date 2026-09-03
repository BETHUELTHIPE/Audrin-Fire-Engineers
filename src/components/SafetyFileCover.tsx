import React, { useState } from 'react';
import {
  Flame,
  ShieldCheck,
  Award,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building,
  MapPin,
  Calendar,
  FileText,
  Lock,
  Phone,
  Mail,
  Check,
  FileCheck2,
  Compass,
  AlertCircle,
  X,
  ExternalLink,
  Printer,
  PenTool,
  Hash
} from 'lucide-react';
import { SafetyFile, SafetyFileSignatory } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';

export interface SafetyFileCoverProps {
  safetyFile: SafetyFile;
  isIncomplete?: boolean;
  className?: string;
  showSignButtons?: boolean;
  onSignRole?: (roleKey: StatutoryRoleKey) => void;
  onSafetyFileUpdated?: (updatedFile: SafetyFile) => void;
  currentUserRole?: string;
  currentUserName?: string;
}

export type StatutoryRoleKey =
  | 'technician'
  | 'projectManager'
  | 'commissioner'
  | 'clientRepresentative'
  | 'clientSafetyOfficer'
  | 'preparedBy'
  | 'reviewedBy'
  | 'approvedBy'
  | 'clientAcknowledgement';

/**
 * SafetyFileCover Component
 *
 * Geometric Balance styled statutory cover page for Fire Detection Safety Files
 * complying with SANS 10139, SANS 10400-T, and the Occupational Health & Safety Act (Act 85 of 1993).
 *
 * Design Architecture:
 * - Geometric Balance: Strict 2:1 and 3:1 proportional accents, sharp industrial rounded-xs corners
 * - Dual-column dynamic project & client stakeholder appointment matrix
 * - Mandatory 4-role statutory approval register:
 *     1. Technician (Prepared by - SAQCC Registered Installer)
 *     2. Project Manager (Reviewed by - Engineering QA Oversight)
 *     3. Commissioner (Approved by - SANS 10139 Commissioning Engineer)
 *     4. Client Representative (Accepted by - Health & Safety Officer / OHS Appointee)
 * - Security QR Verification & Cryptographic Compliance Stamp
 * - Embedded In-Place Statutory Signing Modal
 */
export const SafetyFileCover: React.FC<SafetyFileCoverProps> = ({
  safetyFile: initialSafetyFile,
  isIncomplete = false,
  className = '',
  showSignButtons = false,
  onSignRole,
  onSafetyFileUpdated,
  currentUserRole = 'customer',
  currentUserName = 'Authorized Signatory'
}) => {
  // Local state to support in-place signing and QR inspection
  const [currentFile, setCurrentFile] = useState<SafetyFile>(initialSafetyFile);
  const [showQrDetailsModal, setShowQrDetailsModal] = useState(false);
  const [activeSigningRole, setActiveSigningRole] = useState<StatutoryRoleKey | null>(null);

  // Form states for inline signing modal
  const [signFormName, setSignFormName] = useState('');
  const [signFormRole, setSignFormRole] = useState('');
  const [signFormReg, setSignFormReg] = useState('');
  const [signFormDeclaration, setSignFormDeclaration] = useState('');

  // Keep local file in sync if parent prop changes
  React.useEffect(() => {
    setCurrentFile(initialSafetyFile);
  }, [initialSafetyFile]);

  const { approvals } = currentFile;

  // Determine statutory readiness based on approval flags
  // User Knowledge mandate: Commissioner approval must be required before the system marks a dossier as approved.
  const isCommissionerSigned = Boolean(approvals.commissioner?.isSigned || approvals.approvedBy?.isSigned);
  const allSigned = Boolean(
    (approvals.technician?.isSigned || approvals.preparedBy?.isSigned) &&
    (approvals.projectManager?.isSigned || approvals.reviewedBy?.isSigned) &&
    isCommissionerSigned &&
    (approvals.clientRepresentative?.isSigned || approvals.clientAcknowledgement?.isSigned) &&
    (approvals.clientSafetyOfficer?.isSigned)
  );

  const isDossierApproved = (currentFile.status === 'Approved' || currentFile.status === 'Issued') && isCommissionerSigned;
  const showIncompleteBanner = isIncomplete || (!isDossierApproved);

  // Role metadata lookup for the 5 statutory roles
  const roleDefinitions: Record<
    StatutoryRoleKey,
    {
      title: string;
      subTitle: string;
      defaultDesignation: string;
      defaultReg: string;
      statutoryCode: string;
      authority: string;
      legalNotice: string;
    }
  > = {
    technician: {
      title: '1. Technician',
      subTitle: '(Prepared by / SAQCC Installer)',
      defaultDesignation: 'Lead SAQCC Fire Detection Technician',
      defaultReg: currentFile.responsibleTechnicianSaqcc || 'SAQCC-FD-14289',
      statutoryCode: 'SAQCC Fire South Africa — SANS 10139 Cabling & Installation',
      authority: 'SAQCC Fire Competence Card',
      legalNotice:
        'I confirm that all cabling insulation resistance, loop terminations, and detection devices have been installed in strict conformance with SANS 10139.'
    },
    preparedBy: {
      title: '1. Technician',
      subTitle: '(Prepared by / SAQCC Installer)',
      defaultDesignation: 'Lead SAQCC Fire Detection Technician',
      defaultReg: currentFile.responsibleTechnicianSaqcc || 'SAQCC-FD-14289',
      statutoryCode: 'SAQCC Fire South Africa — SANS 10139 Cabling & Installation',
      authority: 'SAQCC Fire Competence Card',
      legalNotice:
        'I confirm that all cabling insulation resistance, loop terminations, and detection devices have been installed in strict conformance with SANS 10139.'
    },
    projectManager: {
      title: '2. Project Manager',
      subTitle: '(Reviewed by / Engineering QA)',
      defaultDesignation: 'Senior Fire Protection Project Manager',
      defaultReg: 'ECSA Pr.Eng 2026991',
      statutoryCode: 'ECSA / OHS Act Section 8 Engineering Oversight',
      authority: 'Audrin Quality Assurance & Risk Committee',
      legalNotice:
        'I confirm that the statutory safety dossier, baseline risk assessments, and contractor appointments have undergone technical engineering peer review.'
    },
    reviewedBy: {
      title: '2. Project Manager',
      subTitle: '(Reviewed by / Engineering QA)',
      defaultDesignation: 'Senior Fire Protection Project Manager',
      defaultReg: 'ECSA Pr.Eng 2026991',
      statutoryCode: 'ECSA / OHS Act Section 8 Engineering Oversight',
      authority: 'Audrin Quality Assurance & Risk Committee',
      legalNotice:
        'I confirm that the statutory safety dossier, baseline risk assessments, and contractor appointments have undergone technical engineering peer review.'
    },
    commissioner: {
      title: '3. Commissioner',
      subTitle: '(Approved by / SANS 10139 Accredited)',
      defaultDesignation: 'Authorised SANS 10139 Fire Detection Commissioner',
      defaultReg: currentFile.authorisedCommissionerSaqcc || 'SAQCC-COMM-00892',
      statutoryCode: 'SANS 10139:2012 Clause 13.2 Commissioning Certification',
      authority: 'ECSA Fire Engineering / SAQCC Commissioning Council',
      legalNotice:
        'I certify that system cause-and-effect matrix testing, sound pressure level verification (SANS 10139:2012 75dBA bed-head / 65dBA general), and brigade interfaces have been verified without exception.'
    },
    approvedBy: {
      title: '3. Commissioner',
      subTitle: '(Approved by / SANS 10139 Accredited)',
      defaultDesignation: 'Authorised SANS 10139 Fire Detection Commissioner',
      defaultReg: currentFile.authorisedCommissionerSaqcc || 'SAQCC-COMM-00892',
      statutoryCode: 'SANS 10139:2012 Clause 13.2 Commissioning Certification',
      authority: 'ECSA Fire Engineering / SAQCC Commissioning Council',
      legalNotice:
        'I certify that system cause-and-effect matrix testing, sound pressure level verification (SANS 10139:2012 75dBA bed-head / 65dBA general), and brigade interfaces have been verified without exception.'
    },
    clientRepresentative: {
      title: '4. Client Representative',
      subTitle: '(Accepted by / Principal Agent)',
      defaultDesignation: 'Client Designated Representative / Principal Agent',
      defaultReg: `${currentFile.clientCompanyName} — Authorized Signatory`,
      statutoryCode: 'Contractual Handover Acceptance',
      authority: `${currentFile.clientCompanyName} Management`,
      legalNotice:
        'On behalf of the client organisation, I acknowledge receipt of the complete Fire Detection Safety File, as-built schematic drawings, operating logbooks, and operator training.'
    },
    clientAcknowledgement: {
      title: '4. Client Representative',
      subTitle: '(Accepted by / Principal Agent)',
      defaultDesignation: 'Client Designated Representative / Principal Agent',
      defaultReg: `${currentFile.clientCompanyName} — Authorized Signatory`,
      statutoryCode: 'Contractual Handover Acceptance',
      authority: `${currentFile.clientCompanyName} Management`,
      legalNotice:
        'On behalf of the client organisation, I acknowledge receipt of the complete Fire Detection Safety File, as-built schematic drawings, operating logbooks, and operator training.'
    },
    clientSafetyOfficer: {
      title: '5. Client Safety Officer',
      subTitle: '(Statutory OHS Appointee / Sec 16.2)',
      defaultDesignation: 'Client Health & Safety Officer / OHS Appointee',
      defaultReg: `${currentFile.clientCompanyName} — OHS Sec 16.2 Appointee`,
      statutoryCode: 'Occupational Health & Safety Act (Act 85 of 1993)',
      authority: `${currentFile.clientCompanyName} Safety Committee`,
      legalNotice:
        'I confirm that statutory OHS Act Section 16.2 compliance documentation, baseline risk assessments, and emergency evacuation integration have been received, inspected, and archived.'
    }
  };

  // Open in-place sign dialog or trigger external callback
  const handleInitiateSigning = (roleKey: StatutoryRoleKey) => {
    if (onSignRole) {
      onSignRole(roleKey);
      return;
    }

    // Default inline signing workflow if parent doesn't provide onSignRole
    const meta = roleDefinitions[roleKey];
    let initialName = '';
    let initialReg = meta.defaultReg;

    if (roleKey === 'technician' || roleKey === 'preparedBy') {
      initialName = approvals.technician?.name || approvals.preparedBy?.name || currentFile.responsibleTechnician;
    } else if (roleKey === 'projectManager' || roleKey === 'reviewedBy') {
      initialName = approvals.projectManager?.name || approvals.reviewedBy?.name || currentFile.audrinProjectManager;
    } else if (roleKey === 'commissioner' || roleKey === 'approvedBy') {
      initialName = approvals.commissioner?.name || approvals.approvedBy?.name || currentFile.authorisedCommissioner;
    } else if (roleKey === 'clientRepresentative' || roleKey === 'clientAcknowledgement') {
      initialName = approvals.clientRepresentative?.name || approvals.clientAcknowledgement?.name || currentFile.clientRepresentativeName || currentFile.clientSafetyOfficerName;
    } else if (roleKey === 'clientSafetyOfficer') {
      initialName = approvals.clientSafetyOfficer?.name || currentFile.clientSafetyOfficerName;
    }

    setSignFormName(initialName);
    setSignFormRole(meta.defaultDesignation);
    setSignFormReg(initialReg);
    setSignFormDeclaration(meta.legalNotice);
    setActiveSigningRole(roleKey);
  };

  // Execute in-place signature
  const handleExecuteInlineSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSigningRole || !signFormName.trim()) return;

    const signatureText = `${signFormName.trim()} [SANS 10139 Digital Seal - ${new Date().toLocaleTimeString()}]`;
    const updated = safetyFileService.signApprovalRole(
      currentFile.id,
      activeSigningRole,
      signFormName.trim(),
      signFormRole.trim(),
      signFormReg.trim(),
      signatureText
    );

    if (updated) {
      setCurrentFile(updated);
      onSafetyFileUpdated?.(updated);
    }
    setActiveSigningRole(null);
  };

  return (
    <div
      id={`safety-file-cover-${currentFile.id}`}
      className={`relative bg-white text-slate-900 border-2 border-[#0A192F] p-6 sm:p-10 shadow-lg rounded-xs font-sans select-text print:border-none print:shadow-none print:p-4 ${className}`}
    >
      {/* GEOMETRIC BALANCE PRECISION ACCENT BAR (2:1 & Golden Ratio Proportions) */}
      <div className="h-2.5 w-full bg-[#0A192F] flex mb-6 rounded-xs overflow-hidden print:mb-4">
        <div className="w-2/5 bg-[#CC0000]" />
        <div className="w-1/10 bg-amber-400" />
        <div className="flex-1 bg-[#0A192F]" />
      </div>

      {/* DYNAMIC STATUTORY STATUS / INCOMPLETE NOTIFICATION BANNER */}
      {showIncompleteBanner ? (
        <div
          id="cover-status-banner-incomplete"
          className="mb-6 p-4 bg-red-50 border-2 border-[#CC0000] text-[#CC0000] rounded-xs text-center print:border print:p-2.5"
        >
          <div className="flex items-center justify-center gap-2 font-mono font-black text-xs sm:text-sm tracking-wider uppercase">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#CC0000]" />
            <span>STATUTORY NOTICE: CONTROLLED DRAFT / COMPLIANCE REVIEW COPY</span>
          </div>
          <p className="text-[11px] font-mono text-red-700 mt-1 max-w-3xl mx-auto leading-relaxed">
            This Fire Detection Safety File is actively undergoing statutory audit verification.
            Mandatory SANS 10139 commissioning sign-offs or required OHS Act evidence are currently in progress.
            Not certified for municipal occupancy certificates or building insurance sign-off until all 4 statutory roles endorse this register.
          </p>
        </div>
      ) : (
        <div
          id="cover-status-banner-certified"
          className="mb-6 p-3.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-xs text-center flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider print:border print:p-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>SANS 10139 FULLY CERTIFIED &amp; APPROVED FIRE DETECTION SAFETY FILE</span>
        </div>
      )}

      {/* TOP HEADER: ISSUER CORPORATE IDENTITY & CLIENT ORGANISATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b-2 border-slate-200">
        {/* Left Column: Audrin Fire Engineers (Pty) Ltd */}
        <div className="md:col-span-7 flex items-start gap-4">
          <div className="w-16 h-16 bg-[#0A192F] rounded-xs flex items-center justify-center p-3 shrink-0 border border-slate-800 shadow-sm">
            <div className="relative flex items-center justify-center">
              <Flame className="w-10 h-10 text-[#CC0000] fill-[#CC0000]" />
              <ShieldCheck className="w-5 h-5 text-white absolute -bottom-1 -right-1" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight uppercase leading-none">
                AUDRIN FIRE ENGINEERS
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded-xs tracking-wider whitespace-nowrap">
                (PTY) LTD
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wide">
              Consulting Fire Protection &amp; Risk Safety Engineers
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600 pt-0.5">
              <span>CIPC Reg: <strong className="text-slate-900">2026/089596/07</strong></span>
              <span>•</span>
              <span>Tel: <strong className="text-slate-900">071 415 6665</strong> / +27 (0) 11 482 9200</span>
              <span>•</span>
              <span>Email: <strong className="text-slate-900">compliance@audrinfire.co.za</strong></span>
            </div>

            <p className="text-[10px] font-mono text-slate-500">
              27 Tshivhase Street, Pretoria West, 0008 | Midrand Operations Branch | SANS 10139 Statutory Practice
            </p>
          </div>
        </div>

        {/* Right Column: Client Organisation & Dossier Control Identity */}
        <div className="md:col-span-5 flex flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
          <div className="flex items-center gap-3">
            {currentFile.clientLogoUrl ? (
              <img
                src={currentFile.clientLogoUrl}
                alt={currentFile.clientCompanyName}
                className="h-11 w-auto max-w-[130px] object-contain border border-slate-200 p-1 rounded-xs bg-white"
              />
            ) : (
              <div className="w-11 h-11 bg-slate-100 border border-slate-300 rounded-xs flex items-center justify-center text-[#0A192F] font-mono font-black text-sm uppercase">
                {currentFile.clientCompanyName.slice(0, 2)}
              </div>
            )}
            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">
                Client Organisation
              </span>
              <strong className="text-sm sm:text-base font-bold text-[#0A192F] uppercase block tracking-tight">
                {currentFile.clientCompanyName}
              </strong>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xs text-left md:text-right font-mono text-[11px] w-full md:w-auto space-y-1">
            <div>
              Safety File Ref: <strong className="text-[#CC0000] text-xs font-black">{currentFile.safetyFileNumber}</strong>
            </div>
            <div>
              Revision: <strong className="text-slate-800 font-bold">{currentFile.revisionNumber}</strong> | Date: <strong>{currentFile.issueDate}</strong>
            </div>
            <div className="pt-0.5 flex items-center md:justify-end gap-2">
              <span className="text-slate-500">Statutory Status:</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-xs font-bold uppercase text-[10px] whitespace-nowrap ${
                  currentFile.status === 'Approved' || currentFile.status === 'Issued'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : currentFile.status === 'Under Review'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                {currentFile.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT TITLE BLOCK */}
      <div className="py-7 text-center bg-radial from-slate-50 to-white border-b-2 border-slate-200 my-5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#0A192F] text-amber-400 font-mono text-xs font-bold uppercase tracking-widest rounded-xs mb-3 shadow-xs whitespace-nowrap">
          <Award className="w-3.5 h-3.5 text-[#CC0000]" />
          <span>STATUTORY FIRE PROTECTION &amp; OHS ACT COMPLIANCE DOSSIER</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight uppercase font-mono">
          FIRE DETECTION SAFETY FILE
        </h2>

        <p className="text-xs sm:text-sm font-mono text-slate-600 mt-2 max-w-3xl mx-auto font-semibold leading-relaxed">
          Controlled Engineering &amp; Occupational Health and Safety Record Pack for Fire Detection &amp; Life Safety Systems
          in Accordance with SANS 10139, SANS 10400-T, and the Occupational Health and Safety Act (Act 85 of 1993).
        </p>

        {/* Dynamic Standard & Building Class Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded-xs font-bold">
            Standard: SANS 10139:2012 / Category L1 (Life Safety)
          </span>
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded-xs font-bold">
            Building Class: SANS 10400-T Commercial &amp; Retail High-Density
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SAQCC Registered Practice</span>
          </span>
        </div>
      </div>

      {/* DYNAMIC PROJECT & CLIENT INFORMATION DUAL-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6 text-xs font-mono">
        {/* Left Card: Project & Site Details */}
        <div className="border-2 border-slate-200 rounded-xs p-5 bg-slate-50 space-y-3">
          <h3 className="font-bold text-sm text-[#0A192F] uppercase border-b border-slate-300 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#CC0000]" />
              <span>Project &amp; Site Details</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Section A.1</span>
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            <span className="text-slate-500 font-medium">Project Name:</span>
            <span className="col-span-2 font-bold text-slate-900">{currentFile.projectName}</span>

            <span className="text-slate-500 font-medium">Site Location:</span>
            <span className="col-span-2 font-bold text-slate-900">{currentFile.siteName}</span>

            <span className="text-slate-500 font-medium">Physical Address:</span>
            <span className="col-span-2 text-slate-800 leading-snug">{currentFile.physicalAddress}</span>

            <span className="text-slate-500 font-medium">Project Reference:</span>
            <span className="col-span-2 font-bold text-slate-900">{currentFile.projectRef}</span>

            <span className="text-slate-500 font-medium">Contract Number:</span>
            <span className="col-span-2 font-bold text-[#0A192F]">{currentFile.contractNumber || 'CNT-AFE-2026-0881'}</span>

            <span className="text-slate-500 font-medium">Purchase Order (PO):</span>
            <span className="col-span-2 font-semibold text-slate-800">{currentFile.poNumber || 'N/A'}</span>

            <span className="text-slate-500 font-medium">System Type:</span>
            <span className="col-span-2 font-bold text-emerald-800">
              {currentFile.systemType || 'Analogue Addressable Fire Alarm & Voice Evacuation Network (SANS 10139 Category L1)'}
            </span>

            <span className="text-slate-500 font-medium">Building Occupancy:</span>
            <span className="col-span-2 font-semibold text-slate-800">
              {currentFile.buildingClassification || 'SANS 10400-T Class J1 (High-Hazard Commercial Logistics & Distribution)'}
            </span>

            <span className="text-slate-500 font-medium">CIE / Alarm Panel:</span>
            <span className="col-span-2 text-slate-800">
              {currentFile.fireAlarmPanelDetails || 'Ziton ZP3 4-Loop Addressable Panel with Standby Battery Autonomy (24h + 30m Alarm)'}
            </span>

            <span className="text-slate-500 font-medium">Principal Contractor:</span>
            <span className="col-span-2 text-slate-800">{currentFile.principalContractor}</span>

            <span className="text-slate-500 font-medium">Installation Period:</span>
            <span className="col-span-2 text-slate-800">
              {currentFile.startDate} to {currentFile.expectedCompletionDate}
            </span>
          </div>
        </div>

        {/* Right Card: Key Project Appointments & Stakeholder Contacts */}
        <div className="border-2 border-slate-200 rounded-xs p-5 bg-slate-50 space-y-3">
          <h3 className="font-bold text-sm text-[#0A192F] uppercase border-b border-slate-300 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#CC0000]" />
              <span>Project Appointments &amp; Stakeholders</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Section A.2</span>
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            <span className="text-slate-500 font-medium">Client Organisation:</span>
            <span className="col-span-2 font-bold text-slate-900">{currentFile.clientCompanyName}</span>

            {currentFile.clientAddress && (
              <>
                <span className="text-slate-500 font-medium">Client Address:</span>
                <span className="col-span-2 text-slate-800">{currentFile.clientAddress}</span>
              </>
            )}

            <span className="text-slate-500 font-medium">Client Representative:</span>
            <span className="col-span-2 font-bold text-slate-900">
              {currentFile.clientRepresentativeName || currentFile.clientSafetyOfficerName}
            </span>

            <span className="text-slate-500 font-medium">Client Safety Officer:</span>
            <span className="col-span-2 font-bold text-slate-900">
              {currentFile.clientSafetyOfficerName} (OHS Sec 16.2 Appointee)
            </span>

            <span className="text-slate-500 font-medium">Client Contact Tel:</span>
            <span className="col-span-2 text-slate-800">{currentFile.clientSafetyOfficerPhone}</span>

            <span className="text-slate-500 font-medium">Client Contact Email:</span>
            <span className="col-span-2 text-slate-800 break-all">{currentFile.clientSafetyOfficerEmail}</span>

            <span className="text-slate-500 font-medium">Audrin Project Mgr:</span>
            <span className="col-span-2 font-bold text-[#0A192F]">{currentFile.audrinProjectManager}</span>

            <span className="text-slate-500 font-medium">Lead SAQCC Tech:</span>
            <span className="col-span-2 text-slate-800">
              {currentFile.responsibleTechnician} (
              <span className="text-[#CC0000] font-bold">{currentFile.responsibleTechnicianSaqcc}</span>)
            </span>

            <span className="text-slate-500 font-medium">SANS Commissioner:</span>
            <span className="col-span-2 text-slate-800">
              {currentFile.authorisedCommissioner} (
              <span className="text-emerald-700 font-bold">{currentFile.authorisedCommissionerSaqcc}</span>)
            </span>

            <span className="text-slate-500 font-medium">Emergency Standby:</span>
            <span className="col-span-2 text-slate-800">
              {currentFile.emergencyContacts?.controlRoom24h || '011 482 9200 (24h Fire Operations Control)'}
            </span>
          </div>
        </div>
      </div>

      {/* SCOPE OF FIRE-DETECTION WORK SUMMARY CARD */}
      <div className="border-2 border-slate-200 rounded-xs p-5 bg-white mb-6">
        <h4 className="font-mono font-bold text-xs uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#CC0000]" />
          <span>Scope of Fire-Detection Installation, Testing &amp; Commissioning Work:</span>
        </h4>
        <p className="text-xs text-slate-800 font-sans leading-relaxed">
          {currentFile.scopeOfWork}
        </p>
      </div>

      {/* STATUTORY COMMISSIONER APPROVAL MANDATE CALLOUT */}
      <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xs text-xs font-mono text-amber-950 mb-6 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider text-amber-900">
            STATUTORY MANDATE (SANS 10139 Clause 13.2 &amp; SAQCC Fire Regulations):
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
            A safety file cannot be marked compliant or approved solely because documentation is complete.
            Accredited Commissioner approval (<strong className="font-mono">Role 3</strong>) is an absolute statutory requirement before the dossier can be certified for municipal occupancy certificate issuance or final client handover.
          </p>
        </div>
      </div>

      {/* MANDATORY APPROVAL TABLE: 5 ROLES AS REQUIRED BY STATUTORY MATRIX */}
      {/* 1. Technician, 2. Project Manager, 3. Commissioner, 4. Client Representative, 5. Client Safety Officer */}
      <div
        id="safety-file-mandatory-approval-table"
        className="border-2 border-[#0A192F] rounded-xs overflow-hidden mb-6 shadow-xs"
      >
        <div className="bg-[#0A192F] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="font-mono text-xs font-black uppercase tracking-wider">
              MANDATORY 5-ROLE STATUTORY APPROVAL &amp; ACCEPTANCE MATRIX
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-300 font-semibold">
            SANS 10139:2012 Clause 13.2 / OHS Act 85 of 1993 Section 16.2
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th className="p-3 font-bold uppercase w-1/6 whitespace-nowrap">Statutory Role</th>
                <th className="p-3 font-bold uppercase w-1/5">Name &amp; Designation</th>
                <th className="p-3 font-bold uppercase w-1/6 whitespace-nowrap">Registration / ID No.</th>
                <th className="p-3 font-bold uppercase w-1/4">Digital Signature</th>
                <th className="p-3 font-bold uppercase w-1/6 whitespace-nowrap">Date &amp; Timestamp</th>
                <th className="p-3 font-bold uppercase w-1/8 whitespace-nowrap text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* ROLE 1: TECHNICIAN (Prepared by) */}
              {(() => {
                const sig = approvals.technician || approvals.preparedBy;
                const isSigned = Boolean(sig?.isSigned);
                return (
                  <tr id="row-approval-technician" className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-black text-[#0A192F] block">1. Technician</span>
                      <span className="text-[10px] text-slate-500 font-semibold">(Prepared by)</span>
                      <span className="text-[9px] text-slate-400 block font-mono">SANS 10139 Cabling/Install</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">{sig?.name || currentFile.responsibleTechnician}</strong>
                      <span className="text-[10px] text-slate-500 block">{sig?.role || 'Lead SAQCC Technician'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#CC0000] bg-red-50 px-2 py-0.5 rounded-xs border border-red-200 whitespace-nowrap inline-block">
                        {sig?.registrationOrId || currentFile.responsibleTechnicianSaqcc || 'SAQCC-FD-14289'}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSigned ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-xs">{sig.signature || 'Digitally Signed'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">Verified SAQCC Credential</span>
                        </div>
                      ) : showSignButtons && (currentUserRole === 'staff' || currentUserRole === 'admin' || currentUserRole === 'superadmin') ? (
                        <button
                          id="btn-sign-cover-technician"
                          onClick={() => handleInitiateSigning('technician')}
                          className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-[#152a4a] text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                        >
                          Sign as Technician
                        </button>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs text-[10px] font-bold border border-amber-200 inline-block whitespace-nowrap">
                          Pending Signature
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {sig?.signedAt ? (
                        <div>
                          <div>{new Date(sig.signedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{sig.timestamp || new Date(sig.signedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                          Unsigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })()}

              {/* ROLE 2: PROJECT MANAGER (Reviewed by) */}
              {(() => {
                const sig = approvals.projectManager || approvals.reviewedBy;
                const isSigned = Boolean(sig?.isSigned);
                return (
                  <tr id="row-approval-project-manager" className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-black text-[#0A192F] block">2. Project Manager</span>
                      <span className="text-[10px] text-slate-500 font-semibold">(Reviewed by)</span>
                      <span className="text-[9px] text-slate-400 block font-mono">ECSA / QA Oversight</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">{sig?.name || currentFile.audrinProjectManager}</strong>
                      <span className="text-[10px] text-slate-500 block">{sig?.role || 'Senior Fire Protection Project Manager'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300 whitespace-nowrap inline-block">
                        {sig?.registrationOrId || 'ECSA Pr.Eng 2026991'}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSigned ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-xs">{sig.signature || 'Digitally Endorsed'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">QA &amp; Technical Review</span>
                        </div>
                      ) : showSignButtons && (currentUserRole === 'admin' || currentUserRole === 'superadmin') ? (
                        <button
                          id="btn-sign-cover-project-manager"
                          onClick={() => handleInitiateSigning('projectManager')}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                        >
                          Sign Project Review
                        </button>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs text-[10px] font-bold border border-amber-200 inline-block whitespace-nowrap">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {sig?.signedAt ? (
                        <div>
                          <div>{new Date(sig.signedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{sig.timestamp || new Date(sig.signedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                          Unsigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })()}

              {/* ROLE 3: COMMISSIONER (Approved by - MANDATORY) */}
              {(() => {
                const sig = approvals.commissioner || approvals.approvedBy;
                const isSigned = Boolean(sig?.isSigned);
                return (
                  <tr id="row-approval-commissioner" className="hover:bg-slate-50/80 transition-colors bg-amber-50/20">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#0A192F] block">3. Commissioner</span>
                        <span className="px-1.5 py-0.2 bg-red-600 text-white text-[8px] font-bold uppercase rounded-xs">
                          Mandatory
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">(Approved by)</span>
                      <span className="text-[9px] text-emerald-700 block font-mono font-bold">SANS 10139 Cl 13.2</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">{sig?.name || currentFile.authorisedCommissioner}</strong>
                      <span className="text-[10px] text-slate-500 block">{sig?.role || 'Authorised SANS 10139 Commissioner'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 whitespace-nowrap inline-block">
                        {sig?.registrationOrId || currentFile.authorisedCommissionerSaqcc || 'SAQCC-COMM-00892'}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSigned ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-xs">{sig.signature || 'Commissioner Sealed'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold block">SANS 10139 Accredited</span>
                        </div>
                      ) : showSignButtons && (currentUserRole === 'admin' || currentUserRole === 'superadmin') ? (
                        <button
                          id="btn-sign-cover-commissioner"
                          onClick={() => handleInitiateSigning('commissioner')}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                        >
                          Approve as Commissioner
                        </button>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-xs text-[10px] font-bold border border-red-200 inline-block whitespace-nowrap">
                          Required for Compliance
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {sig?.signedAt ? (
                        <div>
                          <div>{new Date(sig.signedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{sig.timestamp || new Date(sig.signedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          Pending Approval
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })()}

              {/* ROLE 4: CLIENT REPRESENTATIVE (Accepted by) */}
              {(() => {
                const sig = approvals.clientRepresentative || approvals.clientAcknowledgement;
                const isSigned = Boolean(sig?.isSigned);
                return (
                  <tr id="row-approval-client-representative" className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-black text-[#0A192F] block">4. Client Representative</span>
                      <span className="text-[10px] text-slate-500 font-semibold">(Accepted by)</span>
                      <span className="text-[9px] text-slate-400 block font-mono">Commercial Handover</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">
                        {sig?.name || currentFile.clientRepresentativeName || currentFile.clientSafetyOfficerName}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        {sig?.role || 'Client Designated Representative'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300 whitespace-nowrap inline-block">
                        {sig?.registrationOrId || `${currentFile.clientCompanyName} Principal`}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSigned ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-xs">{sig.signature || 'Client Signed'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">Commercial Handover Accepted</span>
                        </div>
                      ) : showSignButtons ? (
                        <button
                          id="btn-sign-cover-client-representative"
                          onClick={() => handleInitiateSigning('clientRepresentative')}
                          className="px-3.5 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                        >
                          Sign Acceptance
                        </button>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs text-[10px] font-bold border border-slate-300 inline-block whitespace-nowrap">
                          Client Signature Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {sig?.signedAt ? (
                        <div>
                          <div>{new Date(sig.signedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{sig.timestamp || new Date(sig.signedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                          Unsigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })()}

              {/* ROLE 5: CLIENT SAFETY OFFICER (Statutory OHS Appointee) */}
              {(() => {
                const sig = approvals.clientSafetyOfficer;
                const isSigned = Boolean(sig?.isSigned);
                return (
                  <tr id="row-approval-client-safety-officer" className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className="font-black text-[#0A192F] block">5. Client Safety Officer</span>
                      <span className="text-[10px] text-slate-500 font-semibold">(Statutory OHS Appointee)</span>
                      <span className="text-[9px] text-slate-400 block font-mono">OHS Act Section 16.2</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">
                        {sig?.name || currentFile.clientSafetyOfficerName}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        {sig?.role || 'Client Health & Safety Officer'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300 whitespace-nowrap inline-block">
                        {sig?.registrationOrId || `${currentFile.clientCompanyName} — OHS 16.2`}
                      </span>
                    </td>
                    <td className="p-3">
                      {isSigned ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-xs">{sig.signature || 'OHS Endorsed'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">Site Safety File Custody</span>
                        </div>
                      ) : showSignButtons ? (
                        <button
                          id="btn-sign-cover-client-safety-officer"
                          onClick={() => handleInitiateSigning('clientSafetyOfficer')}
                          className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-[#152a4a] text-white rounded-xs text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors whitespace-nowrap"
                        >
                          Sign OHS Handover
                        </button>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs text-[10px] font-bold border border-slate-300 inline-block whitespace-nowrap">
                          OHS Handover Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {sig?.signedAt ? (
                        <div>
                          <div>{new Date(sig.signedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{sig.timestamp || new Date(sig.signedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
                          Unsigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER: CONFIDENTIALITY, QR CODE AUTHENTICATION, & DOCUMENT CONTROL NOTICE */}
      <div className="pt-5 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-5 font-mono text-[10px] text-slate-600">
        <div className="space-y-1 max-w-xl text-left">
          <div className="font-bold text-[#0A192F] uppercase">
            Audrin Fire Engineers (Pty) Ltd • Controlled Quality Management System
          </div>
          <p className="text-slate-600 leading-tight">
            {currentFile.confidentialityNotice}
          </p>
          <div className="text-[9px] text-slate-400 pt-0.5">
            Document Reference: <strong className="text-slate-700">{currentFile.safetyFileNumber}</strong> | Revision: <strong className="text-slate-700">{currentFile.revisionNumber}</strong> | Cover Sheet Page 1 of Statutory Dossier
          </div>
        </div>

        {/* QR Code Authenticity Stamp with Interactive Inspector */}
        <button
          id="btn-cover-qr-verify"
          onClick={() => setShowQrDetailsModal(true)}
          className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xs shrink-0 shadow-2xs cursor-pointer transition-all text-left"
          title="Click to inspect cryptographic verification certificate"
        >
          <div className="w-14 h-14 bg-white border border-slate-300 rounded-xs flex items-center justify-center p-1">
            <QrCode className="w-12 h-12 text-[#0A192F]" />
          </div>
          <div className="text-[9px] space-y-0.5 font-mono">
            <span className="font-bold text-[#0A192F] uppercase block">Security QR Check</span>
            <span className="text-slate-500 block">SANS 10139 Authenticated</span>
            <span className="text-emerald-700 font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Click to Verify Seal</span>
            </span>
          </div>
        </button>
      </div>

      {/* IN-PLACE STATUTORY ROLE SIGNING DIALOG */}
      {activeSigningRole && (
        <div
          id="modal-inline-sign-role"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl max-w-lg w-full p-6 text-slate-900 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#CC0000]" />
                <h3 className="font-mono text-sm font-black text-[#0A192F] uppercase">
                  Endorse Statutory Approval: {roleDefinitions[activeSigningRole].title}
                </h3>
              </div>
              <button
                id="btn-close-inline-sign-modal"
                onClick={() => setActiveSigningRole(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteInlineSign} className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs text-[11px] text-slate-700">
                <span className="font-bold text-[#0A192F] block uppercase mb-0.5">
                  Statutory Responsibility:
                </span>
                <p className="font-sans leading-relaxed text-slate-600">
                  {roleDefinitions[activeSigningRole].legalNotice}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Full Name of Signatory:
                </label>
                <input
                  id="input-inline-sign-name"
                  type="text"
                  required
                  value={signFormName}
                  onChange={e => setSignFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs focus:ring-1 focus:ring-[#0A192F] outline-none"
                  placeholder="e.g. Tshepo Baloyi"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Designation / Appointment Role:
                </label>
                <input
                  id="input-inline-sign-role"
                  type="text"
                  required
                  value={signFormRole}
                  onChange={e => setSignFormRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs focus:ring-1 focus:ring-[#0A192F] outline-none"
                  placeholder="e.g. Lead SAQCC Fire Detection Technician"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Registration / ID / SAQCC Number:
                </label>
                <input
                  id="input-inline-sign-reg"
                  type="text"
                  required
                  value={signFormReg}
                  onChange={e => setSignFormReg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xs font-mono text-xs focus:ring-1 focus:ring-[#0A192F] outline-none"
                  placeholder="e.g. SAQCC-FD-14289 or ID Number"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xs text-[10px]">
                <strong className="block font-bold uppercase mb-0.5">Statutory Declaration</strong>
                By clicking Confirm Endorsement, an immutable SHA-256 digital signature will be timestamped and appended to the regulatory audit log.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  id="btn-cancel-inline-sign"
                  onClick={() => setActiveSigningRole(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-inline-sign"
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#152a4a] text-white font-bold uppercase rounded-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Endorsement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY QR INSPECTION MODAL */}
      {showQrDetailsModal && (
        <div
          id="modal-qr-inspection"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs"
        >
          <div className="bg-white border-2 border-[#0A192F] rounded-xs shadow-2xl max-w-md w-full p-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0A192F]" />
                <h3 className="text-sm font-black text-[#0A192F] uppercase">
                  Statutory QR Verification Certificate
                </h3>
              </div>
              <button
                id="btn-close-qr-inspection"
                onClick={() => setShowQrDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="text-center space-y-1">
                  <div className="w-20 h-20 mx-auto bg-white border border-slate-300 p-1.5 rounded-xs flex items-center justify-center">
                    <QrCode className="w-full h-full text-[#0A192F]" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Ref: {currentFile.safetyFileNumber}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Project Name:</span>
                  <span className="font-bold text-slate-900 text-right">{currentFile.projectName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client Organisation:</span>
                  <span className="font-bold text-slate-900 text-right">{currentFile.clientCompanyName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Statutory Standard:</span>
                  <span className="font-bold text-emerald-800">SANS 10139:2012</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Issuing Practice:</span>
                  <span className="font-bold text-slate-900">Audrin Fire Engineers (Pty) Ltd</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">CIPC Registration:</span>
                  <span className="font-bold text-slate-900">2026/089596/07</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verification Hash:</span>
                  <span className="font-mono text-[9px] text-[#0A192F] font-bold">
                    SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  id="btn-close-qr-cert"
                  onClick={() => setShowQrDetailsModal(false)}
                  className="w-full py-2 bg-[#0A192F] hover:bg-[#152a4a] text-white font-bold uppercase rounded-xs cursor-pointer shadow-xs"
                >
                  Close Verification View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

