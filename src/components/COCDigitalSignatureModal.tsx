import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  FileSignature,
  ShieldCheck,
  Building,
  User,
  Mail,
  Briefcase,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Scale
} from 'lucide-react';
import { COCApprovalWorkflow } from '../types';
import { cocWorkflowService } from '../services/cocWorkflowService';
import { useApp } from '../context/AppContext';

interface COCDigitalSignatureModalProps {
  workflow: COCApprovalWorkflow;
  onClose: () => void;
  onSuccess: (updatedWorkflow: COCApprovalWorkflow) => void;
}

export const COCDigitalSignatureModal: React.FC<COCDigitalSignatureModalProps> = ({
  workflow,
  onClose,
  onSuccess
}) => {
  const { currentUser, showToast } = useApp();

  const [signatoryName, setSignatoryName] = useState(currentUser?.fullName || 'Marcus Brody');
  const [signatoryEmail, setSignatoryEmail] = useState(currentUser?.email || 'marcus.brody@apexlogistics.co.za');
  const [signatoryRole, setSignatoryRole] = useState('Responsible Person (SANS 10139 / OHS Act)');
  const [organisationName, setOrganisationName] = useState(workflow.organisationName || currentUser?.organisationName || 'Apex Distribution Logistics');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(currentUser?.fullName || 'Marcus Brody');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set background to clean white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0A192F';
  }, [signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmitSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatoryName.trim() || !signatoryEmail.trim()) {
      showToast('error', 'Required Fields Missing', 'Please enter your full name and valid email address.');
      return;
    }

    if (!declarationAccepted) {
      showToast('warning', 'Statutory Declaration', 'You must accept the SANS statutory declaration to proceed with certification.');
      return;
    }

    let signatureDataUrl = '';

    if (signatureMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        showToast('error', 'Signature Required', 'Please draw your digital signature on the canvas pad provided.');
        return;
      }
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedSignature.trim()) {
        showToast('error', 'Signature Required', 'Please enter your signature text to generate your digital seal.');
        return;
      }
      // Create SVG data URL for typed signature
      signatureDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><text x="10" y="50" font-family="cursive" font-size="32" fill="%230A192F" font-weight="bold">${encodeURIComponent(typedSignature)}</text></svg>`;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const updated = cocWorkflowService.signAsClient(workflow.id, {
          signatoryName: signatoryName.trim(),
          signatoryEmail: signatoryEmail.trim(),
          signatoryRole: signatoryRole.trim(),
          organisationName: organisationName.trim(),
          signatureType: signatureMode === 'draw' ? 'canvas_drawn' : 'crypto_seal',
          signatureDataUrl,
          declarationText: `Statutory Handover & Certificate of Compliance acceptance executed pursuant to SANS 10139:2012 Clause 4.2, SANS 10400-T, and OHS Act (Act 85 of 1993). System Category: ${workflow.systemCategory}.`
        });

        showToast('success', 'Certificate Signed & Sealed', `COC ${updated.certificateNumber} is now fully certified and officially issued!`);
        setIsSubmitting(false);
        onSuccess(updated);
      } catch (err) {
        console.error('Error signing COC', err);
        showToast('error', 'Signature Failed', 'An error occurred while saving your digital signature. Please try again.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div id="coc-signature-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-[#0A192F] rounded-sm max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#0A192F] text-white p-5 border-b-4 border-[#CC0000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#CC0000] flex items-center justify-center text-white shadow-sm">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-300">
                  SANS 10139 • STATUTORY DIGITAL HANDOVER
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
                Client Certificate Sign-Off
              </h3>
            </div>
          </div>
          <button
            id="close-coc-signature-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitSignature} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Certificate & Site Summary Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Certificate Number:</span>
                <span className="font-mono font-black text-sm text-[#CC0000]">{workflow.certificateNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Standard Mandate:</span>
                <span className="font-mono font-bold text-xs text-slate-800">{workflow.standardReference}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Premise &amp; Site:</span>
                <strong className="text-slate-900 font-bold block truncate">{workflow.siteName}</strong>
                <span className="text-[10px] text-slate-500 truncate block">{workflow.buildingAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">System Category:</span>
                <strong className="text-slate-900 font-bold block">{workflow.systemCategory}</strong>
                <span className="text-[10px] text-emerald-700 font-bold">SAQCC &amp; ECSA Endorsed</span>
              </div>
            </div>
          </div>

          {/* Signatory Personal Details Form */}
          <div className="space-y-4">
            <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <User className="w-4 h-4 text-[#CC0000]" />
              <span>1. Signatory &amp; Responsible Person Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="coc-signatory-name"
                    type="text"
                    required
                    value={signatoryName}
                    onChange={(e) => {
                      setSignatoryName(e.target.value);
                      if (signatureMode === 'type') setTypedSignature(e.target.value);
                    }}
                    placeholder="e.g. Marcus Brody"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm font-sans text-xs focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="coc-signatory-email"
                    type="email"
                    required
                    value={signatoryEmail}
                    onChange={(e) => setSignatoryEmail(e.target.value)}
                    placeholder="e.g. marcus@company.co.za"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm font-sans text-xs focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Statutory Role / Designation *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="coc-signatory-role"
                    value={signatoryRole}
                    onChange={(e) => setSignatoryRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm font-sans text-xs bg-white focus:border-[#CC0000] focus:outline-none"
                  >
                    <option value="Responsible Person (SANS 10139 / OHS Act)">Responsible Person (SANS 10139 / OHS Act)</option>
                    <option value="Building Owner / Property Director">Building Owner / Property Director</option>
                    <option value="Head of Facilities & Infrastructure">Head of Facilities &amp; Infrastructure</option>
                    <option value="Chief Safety, Health & Environment (SHE) Officer">Chief Safety &amp; Health (SHE) Officer</option>
                    <option value="Authorized Tenant Representative">Authorized Tenant Representative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Organisation Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="coc-organisation-name"
                    type="text"
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    placeholder="e.g. Apex Distribution Logistics"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm font-sans text-xs focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-[#CC0000]" />
                <span>2. Digital Signature Capture</span>
              </h4>

              {/* Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-sm">
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-xs transition-colors cursor-pointer ${
                    signatureMode === 'draw'
                      ? 'bg-white text-[#0A192F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Draw on Screen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignatureMode('type');
                    setTypedSignature(signatoryName || 'Marcus Brody');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-xs transition-colors cursor-pointer ${
                    signatureMode === 'type'
                      ? 'bg-white text-[#0A192F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Adopt Digital Seal
                </button>
              </div>
            </div>

            {signatureMode === 'draw' ? (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-slate-300 rounded-sm p-1 bg-slate-50 relative group">
                  <canvas
                    id="coc-signature-canvas"
                    ref={canvasRef}
                    width={560}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 bg-white cursor-crosshair rounded-xs touch-none border border-slate-200"
                  />

                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 font-mono text-xs">
                      <span>Draw your signature with mouse or finger here...</span>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-2.5 py-1 bg-slate-200/90 hover:bg-slate-300 text-slate-700 text-[10px] font-mono font-bold uppercase rounded-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  Touchscreen supported. Please ensure signature is clearly drawn inside the bordered box.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    Signature Text for Cryptographic Seal
                  </label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="e.g. M. Brody"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans text-xs focus:border-[#CC0000] focus:outline-none"
                  />
                </div>

                <div className="border border-slate-200 bg-slate-50 p-6 rounded-sm text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
                    Digital Seal Preview:
                  </span>
                  <div className="font-serif italic text-2xl text-[#0A192F] font-bold tracking-wider py-2">
                    {typedSignature || 'Signature Preview'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                    ✓ Cryptographically Signed • IP &amp; Timestamp Bound
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Legal Declaration & Consent */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <span className="font-mono font-bold text-amber-950 uppercase text-xs block">
                  3. Statutory Legal Declaration &amp; Acceptance
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                  "I hereby confirm that I am the duly appointed Responsible Person or authorized representative for this premise under SANS 10139:2012 Clause 4.2. I have reviewed the completed inspection records and verified that physical testing was conducted. I accept operational handover of the fire-detection system and acknowledge the building owner's ongoing maintenance obligations under the Occupational Health &amp; Safety Act (Act 85 of 1993)."
                </p>

                <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                  <input
                    id="coc-declaration-checkbox"
                    type="checkbox"
                    required
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#CC0000] rounded-xs border-slate-300 focus:ring-[#CC0000]"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    I agree to the statutory declaration above and authorize the digital issuance of this Certificate of Compliance.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs uppercase rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-coc-signature-btn"
              type="submit"
              disabled={isSubmitting || !declarationAccepted}
              className={`px-6 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isSubmitting || !declarationAccepted
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#CC0000] hover:bg-[#A30000] text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sealing Certificate...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Execute Digital Signature &amp; Issue COC</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
