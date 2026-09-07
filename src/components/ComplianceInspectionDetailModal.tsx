import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Building,
  CheckCircle2,
  Download,
  AlertTriangle,
  FileText,
  MapPin,
  Cpu,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Award,
  RefreshCw,
  Info,
  Wrench
} from 'lucide-react';
import {
  ComplianceInspection,
  SuggestedTimeSlot
} from '../types';
import {
  getInspectionTypeLabel,
  getInspectionTypeBadgeColor,
  getStatusBadge
} from '../services/complianceCalendarEngine';

export const ComplianceInspectionDetailModal: React.FC = () => {
  const {
    currentUser,
    selectedInspectionForDetail,
    setSelectedInspectionForDetail,
    rescheduleInspection,
    cancelInspection,
    completeInspection,
    exportInspectionICal,
    getSuggestedSlots,
    technicians,
    showToast,
    setIsMaintenanceCheckModalOpen,
    setPreselectedSiteForMaintenance
  } = useApp();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SuggestedTimeSlot | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [findingsSummary, setFindingsSummary] = useState('');
  const [certNumber, setCertNumber] = useState('');

  if (!selectedInspectionForDetail) return null;

  const insp = selectedInspectionForDetail;
  const typeBadge = getInspectionTypeBadgeColor(insp.inspectionType);
  const statusBadge = getStatusBadge(insp.status);

  // Suggested slots for rescheduling
  const suggestedSlots = getSuggestedSlots(
    { siteName: insp.siteName, city: insp.city, streetAddress: insp.streetAddress },
    insp.inspectionType
  );

  const handleConfirmReschedule = () => {
    if (!selectedSlot) {
      showToast('error', 'Select Slot', 'Please pick a suggested slot to reschedule.');
      return;
    }
    rescheduleInspection(
      insp.id,
      selectedSlot.date,
      selectedSlot.timeWindow,
      selectedSlot.technician.id,
      `Rescheduled by client to ${selectedSlot.date} (${selectedSlot.timeWindow})`
    );
    setIsRescheduling(false);
    setSelectedInspectionForDetail(null);
  };

  const handleConfirmCompletion = () => {
    if (!findingsSummary.trim()) {
      showToast('error', 'Missing Findings', 'Please provide a summary of engineer test findings.');
      return;
    }
    completeInspection(insp.id, findingsSummary, certNumber.trim() || undefined);
    setIsCompleting(false);
    setSelectedInspectionForDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 rounded-sm shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-start justify-between border-b-4 border-[#CC0000]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold ${typeBadge.bg} ${typeBadge.text} border ${typeBadge.border}`}>
                {getInspectionTypeLabel(insp.inspectionType)}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
              <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-sm">
                ID: {insp.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-1">
              {insp.title}
            </h2>
            <p className="text-xs font-mono text-slate-300">
              Regulatory Standard: <strong className="text-white">{insp.standardClause}</strong>
            </p>
          </div>

          <button
            onClick={() => setSelectedInspectionForDetail(null)}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Top Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#CC0000]" />
              <span className="font-mono font-bold text-slate-900">
                {insp.scheduledDate} • {insp.scheduledTimeWindow}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportInspectionICal(insp)}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-sm font-mono text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Export iCal (.ics)</span>
              </button>

              {insp.status !== 'completed' && (
                <button
                  onClick={() => setIsRescheduling(!isRescheduling)}
                  className="inline-flex items-center gap-1.5 bg-[#0A192F] text-white hover:bg-slate-800 px-3 py-1.5 rounded-sm font-mono text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRescheduling ? 'Cancel Reschedule' : 'Reschedule Slot'}</span>
                </button>
              )}

              {(currentUser?.role === 'staff' || currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && insp.status !== 'completed' && (
                <button
                  onClick={() => setIsCompleting(!isCompleting)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-sm font-mono text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Rescheduling Drawer */}
          {isRescheduling && (
            <div className="bg-amber-50/50 border border-amber-300 p-4 rounded-sm space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="font-mono font-bold uppercase text-amber-900 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Suggested Open Slots for Rescheduling</span>
                </h4>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-sm font-bold">
                  Zero Transit Delay
                </span>
              </div>

              <div className="space-y-2">
                {suggestedSlots.slice(0, 3).map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`border rounded-sm p-3 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0A192F] bg-[#0A192F] text-white'
                          : 'border-amber-200 bg-white hover:border-amber-400 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold font-mono text-xs text-white ${slot.technician.avatarColor}`}
                        >
                          {slot.technician.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className={isSelected ? 'text-white' : 'text-slate-900'}>
                              {slot.date} • {slot.timeWindow}
                            </strong>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500 text-white rounded-sm">
                              {slot.suitabilityScore}% Match
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-mono block ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            Assigned: {slot.technician.name} ({slot.technician.saqccNumber}) • {slot.travelZone}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1 rounded-sm font-mono text-xs font-bold ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Pick Slot'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-mono text-xs rounded-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  disabled={!selectedSlot}
                  className="px-4 py-1.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs rounded-sm disabled:opacity-50"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          )}

          {/* Completion Form (Staff/Admin) */}
          {isCompleting && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-sm space-y-3 animate-in fade-in duration-150">
              <h4 className="font-mono font-bold uppercase text-emerald-900 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Complete Inspection &amp; Issue SANS 10139 Certificate</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    COC / Certificate of Inspection Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="e.g. SANS-COC-2026-9812"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Engineer Findings &amp; Test Summary *
                </label>
                <textarea
                  rows={3}
                  value={findingsSummary}
                  onChange={(e) => setFindingsSummary(e.target.value)}
                  placeholder="e.g. 100% detectors tested functional. Standby battery impedance within SANS 10139 limits. Sounders verified at 84 dBA. System fully compliant."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm font-sans text-xs focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setIsCompleting(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-mono text-xs rounded-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs rounded-sm"
                >
                  Issue SANS 10139 Certificate
                </button>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Site & System Info */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-[#CC0000]" />
                  <span>Premises &amp; Client Details</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Premises Site:</span>
                    <strong className="text-slate-900 font-sans text-sm">{insp.siteName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Client Organisation:</span>
                    <span className="text-slate-700 font-medium">{insp.organisationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Physical Address:</span>
                    <span className="text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {insp.streetAddress}, {insp.city}
                    </span>
                  </div>
                  {insp.serviceRequestRef && (
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-mono block">Linked Service Request:</span>
                      <span className="font-mono text-blue-700 font-bold">{insp.serviceRequestRef}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Cpu className="w-4 h-4 text-[#CC0000]" />
                  <span>Fire Detection System Specs</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">System Category:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">{insp.systemCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Control Panel:</span>
                    <span className="text-slate-800 font-mono text-[11px]">{insp.panelMakeModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Loops / Zones:</span>
                    <span className="text-slate-700 font-mono text-[11px]">{insp.zonesOrLoopsCount || '4 Loops Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Estimated Duration:</span>
                    <span className="text-slate-700 font-mono text-[11px]">{insp.estimatedDurationHours} Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Assigned Technician & Compliance Checklist */}
            <div className="space-y-4">
              
              {/* Technician Card */}
              <div className="bg-[#0A192F] text-white rounded-sm p-4 space-y-3 border-l-4 border-[#CC0000]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                    Lead Attending Technician
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-sm font-bold">
                    SAQCC Certified
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-[#CC0000] text-white flex items-center justify-center font-black font-mono text-sm">
                    {insp.assignedTechnicianName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      {insp.assignedTechnicianName}
                    </h5>
                    <p className="text-[11px] font-mono text-slate-300">
                      {insp.technicianSaqccNumber}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-4 text-[11px] font-mono text-slate-300">
                  <a
                    href={`tel:${insp.technicianPhone}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{insp.technicianPhone}</span>
                  </a>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Pretoria &amp; Gauteng Base</span>
                </div>
              </div>

              {/* SANS 10139 Scope Checklist */}
              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SANS 10139 Statutory Checklist</span>
                </h4>

                <ul className="space-y-2">
                  {insp.complianceChecklistSummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Certificate / Completion Section */}
          {insp.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-mono font-bold text-xs">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>SANS 10139 Certificate of Inspection Issued</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-200/60 px-2 py-0.5 rounded-sm">
                  {insp.certificateNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-sans">
                <strong>Engineer Findings:</strong> {insp.findingsSummary}
              </p>
              {insp.completionDate && (
                <span className="text-[10px] font-mono text-emerald-700 block">
                  Logged on {new Date(insp.completionDate).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {insp.notes && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Site &amp; Access Notes:
              </span>
              <p className="text-xs text-slate-700 font-sans italic">{insp.notes}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setPreselectedSiteForMaintenance({
                  siteId: insp.siteId || 'site-01',
                  siteName: insp.siteName,
                  clientOrganisation: insp.clientOrganisation,
                  panelMakeModel: insp.panelMakeModel,
                  locationDetails: insp.siteAddress,
                  inspectionId: insp.id,
                  inspectionTitle: insp.title
                });
                setSelectedInspectionForDetail(null);
                setIsMaintenanceCheckModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Conduct SANS Maintenance &amp; Remedial Check</span>
            </button>

            <button
              onClick={() => setSelectedInspectionForDetail(null)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer w-full sm:w-auto"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
