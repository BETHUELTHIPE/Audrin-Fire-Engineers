import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Phone, ShieldAlert, X, Send, CheckCircle2 } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/initialData';
import { RequestAttachment } from '../types';
import { DocumentUploadZone } from './DocumentUploadZone';

export const EmergencyFaultModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen, submitServiceRequest, addRequestAttachment, currentUser } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [organisationName, setOrganisationName] = useState(currentUser?.organisationName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [siteName, setSiteName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [panelMakeModel, setPanelMakeModel] = useState('');
  const [faultSymptoms, setFaultSymptoms] = useState('');
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleFilesAdded = (newAttachments: Omit<RequestAttachment, 'id' | 'uploadedAt'>[]) => {
    const newItems: RequestAttachment[] = newAttachments.map((item, idx) => ({
      ...item,
      id: `att-${Date.now()}-${idx}`,
      uploadedAt: new Date().toISOString()
    }));
    setAttachments(prev => [...prev, ...newItems]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const created = await submitServiceRequest({
        fullName,
        organisationName,
        email,
        phone,
        siteName: siteName || 'Commercial Premises',
        streetAddress,
        city: 'Pretoria West / Gauteng',
        province: 'Gauteng',
        postalCode: '0008',
        buildingType: 'Commercial Non-Domestic Premises',
        numberOfFloors: 1,
        serviceSlug: 'emergency-fire-alarm-fault-support',
        systemType: 'Addressable / Conventional Fire Alarm',
        panelMakeModel: panelMakeModel || 'Fire Alarm Control Panel',
        existingFaultOrRequirement: faultSymptoms,
        urgency: 'urgent_emergency',
        additionalInformation: 'Submitted via Emergency Fire-Alarm Fault Direct Fast-Track.'
      });

      // Save any attached files to the created request
      if (attachments.length > 0) {
        attachments.forEach(att => {
          addRequestAttachment(created.id, {
            fileName: att.fileName,
            fileSize: att.fileSize,
            fileType: att.fileType,
            fileUrl: att.fileUrl,
            category: att.category || 'panel_photo',
            isInternalOnly: false
          });
        });
      }

      setSubmittedRef(created.referenceNumber);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsEmergencyModalOpen(false);
    setSubmittedRef(null);
  };

  return (
    <AnimatePresence>
      {isEmergencyModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/85 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420 }}
            className="bg-white dark:bg-[#0A192F] rounded-sm shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700"
          >
            
            {/* Header */}
            <div className="bg-[#CC0000] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-black/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-white">Report a Fire-Alarm Fault</h3>
                  <p className="text-[11px] text-red-100 uppercase tracking-widest">High-Priority Diagnostic Dispatch</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-red-100 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Life Safety Disclaimer */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-3 text-xs text-red-900">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Emergency Life-Safety Protocol:</strong> If there is active smoke, fire, or immediate threat to life, 
            evacuate the building and contact municipal emergency services immediately. Do not disable life-safety systems.
          </p>
        </div>

        {/* Direct Call Quick Banner */}
        <div className="bg-slate-900 text-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <span>Need immediate telephone triage?</span>
          <a
            href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {COMPANY_DETAILS.telephone}</span>
          </a>
        </div>

        {/* Form Body or Success Receipt */}
        <div className="p-6 overflow-y-auto flex-1">
          {submittedRef ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Fault Report Dispatched</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your emergency fault has been prioritized under reference:
              </p>
              <div className="inline-block bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg font-mono font-bold text-lg text-slate-900">
                {submittedRef}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                An engineering supervisor has been alerted and will contact you via <strong>{phone}</strong> to coordinate diagnostic triage.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Johan Smith"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organisation *</label>
                  <input
                    type="text"
                    required
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    placeholder="e.g. Pretoria Commercial Park"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Telephone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 082 123 4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. johan@example.co.za"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building / Site Name *</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. Medipark Office Block"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fire Alarm Panel Model (If Known)</label>
                  <input
                    type="text"
                    value={panelMakeModel}
                    onChange={(e) => setPanelMakeModel(e.target.value)}
                    placeholder="e.g. Ziton ZP3, Advanced MXPro, Kentec"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Street Address & City *</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 45 Church Street, Pretoria West"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Fault Message / Symptoms *</label>
                <textarea
                  required
                  rows={3}
                  value={faultSymptoms}
                  onChange={(e) => setFaultSymptoms(e.target.value)}
                  placeholder="Describe error code, earth fault, loop trouble, continuous buzzer, or affected zone..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Supporting Attachments: Panel Photos, CAD, Logs, PDFs, Excel */}
              <div className="pt-1">
                <DocumentUploadZone
                  title="Attach Panel Photos, Fault Logs or Drawings (Optional)"
                  subtitle="Upload panel error photos, CAD floor plans, PDF error logs, Word notes, Excel zone lists, or any diagnostic files."
                  attachments={attachments}
                  onFilesAdded={handleFilesAdded}
                  onRemoveAttachment={removeAttachment}
                  compact={true}
                  maxSizeMb={50}
                  defaultCategory="panel_photo"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#0A192F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Submit Emergency Fault'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
