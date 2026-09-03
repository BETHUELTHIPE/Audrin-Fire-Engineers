import React, { useState } from 'react';
import {
  X,
  PenTool,
  Send,
  Mail,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  Calendar
} from 'lucide-react';
import { SafetyFile } from '../types/safetyFile';
import { complianceAuditService } from '../services/complianceAuditService';

interface RequestSignatureModalProps {
  safetyFile: SafetyFile;
  isOpen: boolean;
  onClose: () => void;
  onRequestDispatched?: (role: string, recipientEmail: string) => void;
}

export const RequestSignatureModal: React.FC<RequestSignatureModalProps> = ({
  safetyFile,
  isOpen,
  onClose,
  onRequestDispatched
}) => {
  const [selectedRole, setSelectedRole] = useState<'technician' | 'projectManager' | 'commissioner' | 'clientRepresentative' | 'clientSafetyOfficer'>('clientSafetyOfficer');
  const [recipientName, setRecipientName] = useState(safetyFile.emergencyContacts.siteSafetyOfficerName || 'Client Safety Officer');
  const [recipientEmail, setRecipientEmail] = useState('safety@clientdomain.co.za');
  const [customMessage, setCustomMessage] = useState(
    `Please review and affix your statutory electronic signature to SANS 10139 Fire Detection Safety File ${safetyFile.safetyFileNumber} for ${safetyFile.projectName}.`
  );
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Statutory Critical'>('High');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const roleDefinitions = {
    technician: {
      title: 'Lead Fire Detection Technician',
      defaultName: safetyFile.responsibleTechnician,
      defaultReg: safetyFile.responsibleTechnicianSaqcc,
      regType: 'SAQCC Fire 1475/D&GS'
    },
    projectManager: {
      title: 'Project & Safety Manager',
      defaultName: 'Bethuel Moukangwe',
      defaultReg: 'ECSA Pr.Eng 2026991',
      regType: 'ECSA Professional Engineer'
    },
    commissioner: {
      title: 'Authorised SANS 10139 Commissioner',
      defaultName: safetyFile.authorisedCommissioner,
      defaultReg: safetyFile.authorisedCommissionerSaqcc,
      regType: 'SAQCC Commissioner Accreditation'
    },
    clientRepresentative: {
      title: 'Client Authorized Representative',
      defaultName: 'Client Project Director',
      defaultReg: 'OHS Act Section 16.2 Appointee',
      regType: 'OHS Statutory Appointment'
    },
    clientSafetyOfficer: {
      title: 'Client Safety Officer / Auditor',
      defaultName: safetyFile.emergencyContacts.siteSafetyOfficerName || 'Client Safety Officer',
      defaultReg: 'SACPCMP / OHS Safety Appointee',
      regType: 'Site Safety Audit Officer'
    }
  };

  const handleRoleChange = (roleKey: any) => {
    setSelectedRole(roleKey);
    const def = roleDefinitions[roleKey as keyof typeof roleDefinitions];
    setRecipientName(def.defaultName);
    if (roleKey === 'clientSafetyOfficer') {
      setRecipientEmail('safety@clientdomain.co.za');
    } else if (roleKey === 'commissioner') {
      setRecipientEmail('commissioner@audrinfire.co.za');
    } else if (roleKey === 'technician') {
      setRecipientEmail('technician@audrinfire.co.za');
    } else if (roleKey === 'projectManager') {
      setRecipientEmail('pm@audrinfire.co.za');
    } else {
      setRecipientEmail('director@clientdomain.co.za');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Record formal audit event in complianceAuditService
      complianceAuditService.recordSignatureEvent(
        safetyFile.safetyFileNumber,
        safetyFile.projectRef,
        safetyFile.projectName,
        safetyFile.siteName,
        {
          signatoryRole: selectedRole,
          roleTitle: roleDefinitions[selectedRole].title,
          signatoryName: recipientName,
          credentialNumber: roleDefinitions[selectedRole].defaultReg,
          credentialAuthority: roleDefinitions[selectedRole].regType,
          sansComplianceDeclaration: `Electronic signature invitation dispatched to ${recipientEmail} with urgency: ${urgency}`,
          biometricOrDigitalType: 'Cryptographic Vector Signature'
        }
      );

      setIsSubmitting(false);
      setSuccessToast(true);
      onRequestDispatched?.(roleDefinitions[selectedRole].title, recipientEmail);

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xs shadow-2xl border-2 border-slate-800 w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase rounded-xs">
                Statutory 5-Role Matrix Workflow
              </span>
              <span className="text-xs font-mono text-slate-300">
                Ref: <strong className="text-white">{safetyFile.safetyFileNumber}</strong>
              </span>
            </div>
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-400" />
              <span>Request Electronic Signatures</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Send authenticated digital signature invitations for statutory compliance sign-off.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xs bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="p-3.5 bg-emerald-900 text-emerald-100 text-xs font-mono font-bold flex items-center gap-2 border-b border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Electronic signature invitation dispatched successfully to {recipientEmail}.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
          {/* Target Role Selector */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">
              Statutory Role To Sign *
            </label>
            <select
              value={selectedRole}
              onChange={e => handleRoleChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
            >
              <option value="clientSafetyOfficer">1. Client Safety Officer / Auditor</option>
              <option value="commissioner">2. Authorised SANS 10139 Commissioner (Mandatory for Compliance)</option>
              <option value="projectManager">3. Project &amp; Safety Manager (ECSA Pr.Eng)</option>
              <option value="technician">4. Lead Fire Detection Technician (SAQCC Registered)</option>
              <option value="clientRepresentative">5. Client Authorized Representative (Sec 16.2 Appointee)</option>
            </select>
          </div>

          {/* Role details badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-500">Accreditation Requirement:</span>{' '}
              <strong className="text-slate-900">{roleDefinitions[selectedRole].regType}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Default Reg:</span>{' '}
              <strong className="text-[#CC0000]">{roleDefinitions[selectedRole].defaultReg}</strong>
            </div>
          </div>

          {/* Recipient Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Urgency & Milestone link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Sign-Off Urgency Level
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xs font-semibold focus:outline-none"
              >
                <option value="Normal">Normal Review (5 business days)</option>
                <option value="High">High Priority (48 hours)</option>
                <option value="Statutory Critical">Statutory Critical (Immediate Handover)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                Associated Milestone
              </label>
              <input
                type="text"
                readOnly
                value="SANS 10139 Clause 13.2 Handover Gate"
                className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-xs text-slate-600"
              />
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
              Instructions / Message to Signatory
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xs focus:outline-none text-xs font-mono"
            />
          </div>

          {/* Statutory Note */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xs text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>SANS 10139 Statutory Guardrail:</strong> Signatures collected are cryptographically recorded in the immutable compliance audit ledger with timestamp, IP address, and credentials. Commissioner approval remains mandatory prior to issuing final compliance status.
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white font-bold uppercase rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Signature Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
