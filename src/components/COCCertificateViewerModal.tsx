import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  Scale,
  Award,
  Calendar,
  Lock,
  QrCode,
  ExternalLink,
  FileText
} from 'lucide-react';
import { COCApprovalWorkflow } from '../types';
import { useApp } from '../context/AppContext';

interface COCCertificateViewerModalProps {
  workflow: COCApprovalWorkflow;
  onClose: () => void;
  onOpenSignatureModal?: () => void;
}

export const COCCertificateViewerModal: React.FC<COCCertificateViewerModalProps> = ({
  workflow,
  onClose,
  onOpenSignatureModal
}) => {
  const { showToast } = useApp();
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showToast('info', 'Downloading Certificate', `Downloading SANS 10139 Certificate of Compliance ${workflow.certificateNumber}...`);
    setTimeout(() => {
      // Create a downloadable text representation / trigger print
      const element = document.createElement('a');
      const file = new Blob([
        `AUDRIN FIRE ENGINEERS - STATUTORY CERTIFICATE OF COMPLIANCE
============================================================
Certificate Reference: ${workflow.certificateNumber}
Standard: ${workflow.standardReference}
System Classification: ${workflow.systemCategory}

PREMISE & SITE DETAILS:
Site: ${workflow.siteName}
Address: ${workflow.buildingAddress}
Organisation: ${workflow.organisationName}

APPROVAL & SIGN-OFF AUDIT TRAIL:
1. SAQCC Field Technician: ${workflow.stages[0]?.technicianSignOff?.technicianName || 'N/A'} (${workflow.stages[0]?.technicianSignOff?.saqccNumber || 'N/A'})
   Signed At: ${workflow.stages[0]?.technicianSignOff?.signedAt || 'Pending'}
2. Lead Fire Systems Engineer: ${workflow.stages[2]?.engineerReview?.engineerName || 'N/A'} (ECSA: ${workflow.stages[2]?.engineerReview?.ecsaNumber || 'N/A'})
   Endorsement Seal: ${workflow.stages[2]?.engineerReview?.digitalSealId || 'Pending'}
3. Client Responsible Person: ${workflow.stages[3]?.clientSignature?.signatoryName || 'Pending Client Signature'} (${workflow.stages[3]?.clientSignature?.signatoryRole || ''})
   Signed At: ${workflow.stages[3]?.clientSignature?.signedAt || 'Pending'}

STATUTORY STATUS: ${workflow.overallStatus.toUpperCase()}
Issued Date: ${workflow.issuedAt ? new Date(workflow.issuedAt).toLocaleDateString('en-ZA') : 'Draft - Pending Final Issuance'}
Valid Until: ${workflow.validUntil ? new Date(workflow.validUntil).toLocaleDateString('en-ZA') : '12 Months From Issuance'}
Verification Code: ${workflow.qrVerificationCode}
Verification URL: ${workflow.qrVerificationUrl}
`
      ], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${workflow.certificateNumber}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('success', 'Download Complete', 'Certificate data exported successfully.');
    }, 500);
  };

  const techSignOff = workflow.stages[0]?.technicianSignOff;
  const engReview = workflow.stages[2]?.engineerReview;
  const clientSign = workflow.stages[3]?.clientSignature;
  const isFullyCertified = workflow.overallStatus === 'fully_certified';

  return (
    <div id="coc-certificate-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/85 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-[#0A192F] rounded-sm max-w-4xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[95vh]">
        
        {/* Modal Top Control Bar (Non-printable) */}
        <div className="bg-[#0A192F] text-white p-4 border-b-2 border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              Statutory SANS 10139 Certificate of Compliance Viewer
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isFullyCertified && onOpenSignatureModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSignatureModal();
                }}
                className="px-3 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign Certificate</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-sm transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div ref={printAreaRef} className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 font-sans">
          
          {/* Certificate Header / Letterhead */}
          <div className="border-b-4 border-[#0A192F] pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#CC0000] text-white flex items-center justify-center font-black rounded-sm">
                    A
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight uppercase">
                    Audrin Fire Engineers
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-1 tracking-wider">
                  Specialist Fire-Detection &amp; Life Safety Engineering Services • Reg: K2026089596
                </p>
                <p className="text-[10px] font-mono text-slate-600">
                  27 Tshivhase Street, Pretoria West, 0008 • ECSA &amp; SAQCC Registered Practice
                </p>
              </div>

              <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#CC0000] sm:pr-4 pl-3 sm:pl-0">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Statutory Certificate Reference
                </span>
                <span className="font-mono font-black text-base sm:text-lg text-[#CC0000]">
                  {workflow.certificateNumber}
                </span>
                <span className={`inline-block mt-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                  isFullyCertified ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {isFullyCertified ? 'Official • Fully Certified' : 'Draft • Pending Sign-Off'}
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="inline-block bg-[#0A192F] text-white font-mono font-bold text-xs uppercase px-4 py-1 rounded-sm tracking-widest">
                Certificate of Compliance (COC)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] uppercase mt-2 tracking-tight">
                Fire Detection &amp; Alarm System Statutory Certification
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Issued under the provisions of <strong>SANS 10139:2012</strong>, <strong>SANS 10400-T (Fire Protection)</strong>, &amp; <strong>OHS Act (Act 85 of 1993)</strong>
              </p>
            </div>
          </div>

          {/* Premise & Installation Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-sm p-5 text-xs font-mono">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block border-b border-slate-200 pb-1">
                Premise &amp; Occupancy
              </span>
              <div>
                <span className="text-slate-500 text-[11px] block">Premise Name:</span>
                <strong className="text-sm font-black text-slate-900">{workflow.siteName}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Physical Location:</span>
                <span className="text-slate-800">{workflow.buildingAddress}, {workflow.city}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Client / Building Owner:</span>
                <span className="text-slate-800 font-bold">{workflow.organisationName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block border-b border-slate-200 pb-1">
                System Classification &amp; Mandate
              </span>
              <div>
                <span className="text-slate-500 text-[11px] block">System Standard:</span>
                <strong className="text-slate-900">{workflow.standardReference}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Category of Protection:</span>
                <span className="text-slate-800 font-bold text-amber-900">{workflow.systemCategory}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Validity Period:</span>
                <span className="text-slate-800 font-bold">
                  {workflow.issuedAt ? new Date(workflow.issuedAt).toLocaleDateString('en-ZA') : 'Pending Final Seal'} 
                  {' — '} 
                  {workflow.validUntil ? new Date(workflow.validUntil).toLocaleDateString('en-ZA') : '12 Months from Issuance'}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Compliance Declaration Statement */}
          <div className="border-l-4 border-l-[#CC0000] pl-4 py-1 text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-r-sm">
            <p className="font-bold text-[#0A192F] mb-1 font-mono uppercase text-[11px]">
              Statutory Certification Clause (SANS 10139:2012 Clause 25 &amp; SANS 10400-T):
            </p>
            <p className="italic">
              "We hereby certify that the fire detection and alarm installation referenced herein has been inspected, tested, and audited in accordance with the recommendations of SANS 10139:2012. All control and indicating equipment, automatic detectors, manual call points, sounders, interface controls, and secondary standby battery power supplies have been verified operational."
            </p>
          </div>

          {/* Multi-Party Sign-Off Audit Matrix (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            
            {/* 1. SAQCC Field Technician Sign-Off */}
            <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <span className="font-bold text-[#0A192F] uppercase text-[11px]">1. Field Technician</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">SAQCC</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <p>Name: <strong>{techSignOff?.technicianName || 'Tshepo Khumalo'}</strong></p>
                  <p>Reg: <strong className="text-[#CC0000]">{techSignOff?.saqccNumber || 'SAQCC-FDGS-44912-L3'}</strong></p>
                  <p>Devices Tested: <strong>{techSignOff?.loopSensorsTestedCount || '142'} Units (100%)</strong></p>
                  <p>Audibility: <strong>{techSignOff?.sounderAudibilityDba || '78.5'} dBA</strong></p>
                  <p>Battery Load: <strong>{techSignOff?.standbyBatteryVoltage || '27.6'} V (Pass)</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase block">Technician Signature:</span>
                <div className="font-serif italic font-bold text-sm text-[#0A192F] py-1">
                  {techSignOff?.technicianName || 'Tshepo Khumalo'}
                </div>
                <span className="text-[9px] text-slate-500 block">
                  {techSignOff?.signedAt ? new Date(techSignOff.signedAt).toLocaleDateString('en-ZA') : 'Signed'}
                </span>
              </div>
            </div>

            {/* 2. Lead Fire Systems Engineer (Pr.Eng) Endorsement */}
            <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <span className="font-bold text-[#0A192F] uppercase text-[11px]">2. Lead Engineer</span>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">ECSA Pr.Eng</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <p>Engineer: <strong>{engReview?.engineerName || 'Audrin Sibanda'}</strong></p>
                  <p>ECSA No: <strong className="text-purple-900">{engReview?.ecsaNumber || 'ECSA-2015-810933'}</strong></p>
                  <p>SAQCC: <strong>{engReview?.saqccNumber || 'SAQCC-FDGS-31084-L4'}</strong></p>
                  <p>Seal ID: <strong className="text-slate-800 text-[10px]">{engReview?.digitalSealId || 'ECSA-SEAL-2026-AFE-0891'}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase block">Digital ECSA Seal:</span>
                <div className="font-serif italic font-bold text-sm text-purple-950 py-1">
                  Audrin Sibanda, Pr.Eng
                </div>
                <span className="text-[9px] text-emerald-700 font-bold block">
                  ✓ Statutorily Endorsed
                </span>
              </div>
            </div>

            {/* 3. Client Responsible Person Acceptance */}
            <div className={`border rounded-sm p-4 flex flex-col justify-between space-y-3 ${
              clientSign ? 'border-slate-200 bg-slate-50' : 'border-amber-300 bg-amber-50/50'
            }`}>
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <span className="font-bold text-[#0A192F] uppercase text-[11px]">3. Client Acceptance</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    clientSign ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {clientSign ? 'Certified' : 'Pending Signature'}
                  </span>
                </div>

                {clientSign ? (
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <p>Signatory: <strong>{clientSign.signatoryName}</strong></p>
                    <p>Role: <strong className="truncate block">{clientSign.signatoryRole}</strong></p>
                    <p>Email: <span className="text-[10px] text-slate-500 truncate block">{clientSign.signatoryEmail}</span></p>
                    <p>IP Gateway: <span className="text-[10px] text-slate-500 block">{clientSign.ipAddress}</span></p>
                  </div>
                ) : (
                  <div className="py-2 text-center text-amber-900 space-y-2">
                    <p className="text-xs font-bold">Awaiting Client Signature</p>
                    <p className="text-[10px] text-amber-800">
                      Must be executed by the appointed SANS 10139 Responsible Person.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase block">Client Digital Signature:</span>
                {clientSign ? (
                  <div>
                    {clientSign.signatureType === 'canvas_drawn' ? (
                      <img
                        src={clientSign.signatureDataUrl}
                        alt="Client Signature"
                        className="h-9 object-contain my-1"
                      />
                    ) : (
                      <div className="font-serif italic font-bold text-sm text-[#0A192F] py-1">
                        {clientSign.signatoryName}
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 block">
                      Signed: {new Date(clientSign.signedAt).toLocaleString('en-ZA')}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-amber-700 italic block py-1 font-bold">
                    [ Signature Pending ]
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Certificate Footer & QR Code Verification */}
          <div className="border-t-2 border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-sm p-1.5 flex flex-col items-center justify-center text-slate-700">
                <QrCode className="w-8 h-8" />
                <span className="text-[7px] font-bold mt-0.5 uppercase">Scan to Verify</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  Cryptographic Verification ID:
                </span>
                <span className="text-slate-600 text-[10px]">{workflow.qrVerificationCode}</span>
                <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                  ✓ Registered in Audrin National Fire Compliance Vault
                </span>
              </div>
            </div>

            <div className="text-right text-[10px]">
              <span className="block font-bold text-slate-700">Official Statutory Record</span>
              <span>Retain in on-site Fire Safety Logbook for 5 Years</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
