import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Building,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  MapPin,
  Cpu,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  SANS10139InspectionType,
  ComplianceInspection,
  SuggestedTimeSlot,
  TechnicianProfile
} from '../types';
import {
  getInspectionTypeLabel,
  getInspectionTypeBadgeColor
} from '../services/complianceCalendarEngine';

export const ScheduleInspectionModal: React.FC = () => {
  const {
    currentUser,
    serviceRequests,
    technicians,
    isScheduleInspectionModalOpen,
    setIsScheduleInspectionModalOpen,
    preselectedSiteForSchedule,
    setPreselectedSiteForSchedule,
    scheduleNewInspection,
    getSuggestedSlots,
    showToast
  } = useApp();

  const [siteName, setSiteName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Pretoria West');
  const [organisationName, setOrganisationName] = useState('');
  const [serviceRequestId, setServiceRequestId] = useState<string>('');
  const [serviceRequestRef, setServiceRequestRef] = useState<string>('');
  const [systemCategory, setSystemCategory] = useState('Category L1 - Total Life Safety Protection');
  const [panelMakeModel, setPanelMakeModel] = useState('Advanced Electronics MXPro 5');
  const [inspectionType, setInspectionType] = useState<SANS10139InspectionType>('quarterly_periodic_inspection');
  const [scheduledDate, setScheduledDate] = useState('2026-09-10');
  const [scheduledTimeWindow, setScheduledTimeWindow] = useState('09:00 - 12:00');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('tech-01');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Suggested Slots State
  const [suggestedSlots, setSuggestedSlots] = useState<SuggestedTimeSlot[]>([]);

  useEffect(() => {
    if (preselectedSiteForSchedule) {
      setSiteName(preselectedSiteForSchedule.siteName || '');
      setStreetAddress(preselectedSiteForSchedule.streetAddress || '');
      setCity(preselectedSiteForSchedule.city || 'Pretoria West');
      if (preselectedSiteForSchedule.serviceRequestId) {
        setServiceRequestId(preselectedSiteForSchedule.serviceRequestId);
        setServiceRequestRef(preselectedSiteForSchedule.serviceRequestRef || '');
      }
    } else if (serviceRequests.length > 0) {
      const first = serviceRequests[0];
      setSiteName(first.siteName);
      setStreetAddress(first.streetAddress);
      setCity(first.city);
      setOrganisationName(first.organisationName);
      setServiceRequestId(first.id);
      setServiceRequestRef(first.referenceNumber);
      setPanelMakeModel(first.panelMakeModel || 'Advanced Electronics MXPro 5');
    }
  }, [preselectedSiteForSchedule, serviceRequests]);

  // Recalculate suggested open slots whenever site or inspection type changes
  useEffect(() => {
    const slots = getSuggestedSlots(
      { siteName: siteName || 'Commercial Premises', city, streetAddress },
      inspectionType,
      scheduledDate
    );
    setSuggestedSlots(slots);
    if (slots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(slots[0].id);
      setScheduledDate(slots[0].date);
      setScheduledTimeWindow(slots[0].timeWindow);
      setAssignedTechnicianId(slots[0].technician.id);
    }
  }, [siteName, city, inspectionType, scheduledDate]);

  if (!isScheduleInspectionModalOpen) return null;

  const handleSelectSuggestedSlot = (slot: SuggestedTimeSlot) => {
    setSelectedSlotId(slot.id);
    setScheduledDate(slot.date);
    setScheduledTimeWindow(slot.timeWindow);
    setAssignedTechnicianId(slot.technician.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      showToast('error', 'Missing Information', 'Please provide a premises site name.');
      return;
    }

    setIsSubmitting(true);
    try {
      let standardClause = 'SANS 10139:2012 Clause 25.3 (Quarterly Servicing)';
      let defaultTitle = 'SANS 10139 Quarterly Inspection';
      let checklist: string[] = [];

      switch (inspectionType) {
        case 'weekly_user_test':
          standardClause = 'SANS 10139:2012 Clause 25.2 (Weekly User Test)';
          defaultTitle = 'Weekly Sounder & Call Point Test';
          checklist = [
            'Operate manual call point on rotation',
            'Verify sounder audibility throughout facility',
            'Check panel indicator lamps and zone identification',
            'Record entry in on-site SANS 10139 physical logbook'
          ];
          break;
        case 'quarterly_periodic_inspection':
          standardClause = 'SANS 10139:2012 Clause 25.3 (Quarterly Inspection)';
          defaultTitle = 'Quarterly Periodic SANS 10139 Inspection';
          checklist = [
            'Visual inspection of all detection loops and power supplies',
            'Point testing of 25% minimum installed detectors (sampling rotation)',
            'Standby battery terminal voltage & load discharge test',
            'Review of physical log book and false alarm log records'
          ];
          break;
        case 'biannual_inspection':
          standardClause = 'SANS 10139:2012 Clause 25.4 (6-Monthly Inspection)';
          defaultTitle = 'Bi-Annual Periodic SANS 10139 Inspection';
          checklist = [
            '50% device sampling test covering all critical zones',
            'Check cable supports, clips, and junction boxes',
            'Standby power supply 24hr load simulation',
            'Verify transmission to remote alarm receiving center (ARC)'
          ];
          break;
        case 'annual_comprehensive_servicing':
          standardClause = 'SANS 10139:2012 Clause 25.5 & SANS 10400-T (Annual Servicing)';
          defaultTitle = 'Annual Comprehensive Servicing & COC Audit';
          checklist = [
            '100% full device point-to-point operational testing of all detectors & call points',
            'Full 24hr standby battery autonomy & 30min alarm discharge test',
            'Sound pressure decibel audibility survey (minimum 65 dBA)',
            'Cause & effect matrix simulation (HVAC shutdown, dampers, lifts, magnetic doors)',
            'Issuance of Annual SANS 10139 Certificate of Inspection'
          ];
          break;
        case 'emergency_fault_attendance':
          standardClause = 'SANS 10139:2012 Clause 26 (Fault Monitoring & Repair)';
          defaultTitle = 'Emergency Diagnostic Triage & Fault Clearance';
          checklist = [
            'Rapid isolation and grounding resistance diagnosis',
            'Loop continuity and cable insulation resistance testing',
            'Replacement of failed detector heads / call point mechanisms',
            'Clear panel yellow fault condition and verify normal monitoring'
          ];
          break;
        case 'site_survey':
          standardClause = 'SANS 10139:2012 Clause 5 & 6 (Premises Survey & Category Design)';
          defaultTitle = 'Premises Survey & Category Assessment';
          checklist = [
            'Evaluate ceiling geometry, beams, and airflow patterns',
            'Determine appropriate SANS 10139 System Category (L1, L2, L3, M, P1)',
            'Review escape route audibility and call point travel distances',
            'Prepare compliance specification and engineering BoQ'
          ];
          break;
      }

      await scheduleNewInspection({
        title: defaultTitle,
        inspectionType,
        standardClause,
        siteName,
        streetAddress,
        city,
        organisationName: organisationName || currentUser?.organisationName || 'Client Organisation',
        serviceRequestId: serviceRequestId || undefined,
        serviceRequestRef: serviceRequestRef || undefined,
        systemCategory,
        panelMakeModel,
        scheduledDate,
        scheduledTimeWindow,
        assignedTechnicianId,
        complianceChecklistSummary: checklist,
        notes
      });

      setIsScheduleInspectionModalOpen(false);
      setPreselectedSiteForSchedule(null);
    } catch (err) {
      showToast('error', 'Scheduling Failed', 'An error occurred while scheduling the inspection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTech = technicians.find(t => t.id === assignedTechnicianId) || technicians[0];
  const typeBadge = getInspectionTypeBadgeColor(inspectionType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 rounded-sm shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b-4 border-[#CC0000]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#CC0000] flex items-center justify-center text-white shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-white/10 px-2 py-0.5 rounded-sm">
                  SANS 10139 Scheduler
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-Slot Engine Active
                </span>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
                Schedule Compliance Inspection
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              setIsScheduleInspectionModalOpen(false);
              setPreselectedSiteForSchedule(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Premises & System */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#0A192F] mb-3 flex items-center gap-2 border-b border-slate-200 pb-1">
              <Building className="w-4 h-4 text-[#CC0000]" />
              <span>1. Premises &amp; Fire Detection System</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Warehouse Distribution Hub 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans focus:outline-none focus:border-[#CC0000]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Geographic Area / City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans focus:outline-none focus:border-[#CC0000] bg-white"
                >
                  <option value="Pretoria West">Pretoria West (Industrial Hub)</option>
                  <option value="Pretoria Central">Pretoria Central (CBD / Medical District)</option>
                  <option value="Pretoria East">Pretoria East (Menlyn / Silverton)</option>
                  <option value="Centurion">Centurion (Corporate Parks)</option>
                  <option value="Midrand / Johannesburg">Midrand / Johannesburg</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 14 Industrial Parkway"
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans focus:outline-none focus:border-[#CC0000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Control Panel Make &amp; Model
                </label>
                <input
                  type="text"
                  value={panelMakeModel}
                  onChange={(e) => setPanelMakeModel(e.target.value)}
                  placeholder="e.g. Advanced MXPro 5 / Ziton ZP3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans focus:outline-none focus:border-[#CC0000]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Inspection Cycle */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#0A192F] mb-3 flex items-center gap-2 border-b border-slate-200 pb-1">
              <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
              <span>2. SANS 10139 Regulatory Inspection Cycle</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  type: 'quarterly_periodic_inspection' as SANS10139InspectionType,
                  title: 'Quarterly Servicing (Clause 25.3)',
                  desc: '25% detector sampling, battery check, log book review'
                },
                {
                  type: 'annual_comprehensive_servicing' as SANS10139InspectionType,
                  title: 'Annual Comprehensive (Clause 25.5)',
                  desc: '100% device point test, 24hr load test, COC issuance'
                },
                {
                  type: 'biannual_inspection' as SANS10139InspectionType,
                  title: '6-Monthly Inspection (Clause 25.4)',
                  desc: '50% device sampling, cable integrity, standby power'
                },
                {
                  type: 'weekly_user_test' as SANS10139InspectionType,
                  title: 'Weekly Routine Test (Clause 25.2)',
                  desc: 'Rotational call point trigger, sounder audibility log'
                },
                {
                  type: 'emergency_fault_attendance' as SANS10139InspectionType,
                  title: 'Emergency Diagnostic Triage (Clause 26)',
                  desc: 'Immediate fault diagnosis, ground short & loop repair'
                },
                {
                  type: 'site_survey' as SANS10139InspectionType,
                  title: 'Premises Survey & Category (Clause 5-6)',
                  desc: 'System category assessment, zoning & quote design'
                }
              ].map((opt) => (
                <label
                  key={opt.type}
                  className={`border rounded-sm p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    inspectionType === opt.type
                      ? 'border-[#CC0000] bg-red-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="inspectionType"
                    checked={inspectionType === opt.type}
                    onChange={() => setInspectionType(opt.type)}
                    className="mt-0.5 text-[#CC0000] focus:ring-[#CC0000]"
                  />
                  <div>
                    <strong className="text-slate-900 block font-mono text-xs">{opt.title}</strong>
                    <span className="text-[11px] text-slate-500 font-sans block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: AI / Auto-Suggested Open Slots for Technicians */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-1">
              <h3 className="text-xs font-mono font-bold uppercase text-[#0A192F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>3. Recommended Open Slots for SAQCC Technicians</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm font-bold">
                Workload &amp; Route Optimized
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {suggestedSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSelectSuggestedSlot(slot)}
                    className={`border rounded-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0A192F] bg-[#0A192F] text-white shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold font-mono text-xs text-white shrink-0 ${slot.technician.avatarColor}`}
                      >
                        {slot.technician.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className={isSelected ? 'text-white' : 'text-slate-900'}>
                            {slot.technician.name}
                          </strong>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold ${
                              isSelected ? 'bg-white/20 text-slate-200' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {slot.technician.saqccNumber}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold ${
                              isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {slot.suitabilityScore}% Match
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-1 flex items-center gap-3 flex-wrap ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <strong>{slot.date}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <strong>{slot.timeWindow}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{slot.travelZone}</span>
                          </span>
                        </div>
                        <p
                          className={`text-[10px] mt-1 italic ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          • {slot.reasons.join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-sm font-mono text-[11px] font-bold hover:bg-slate-100"
                        >
                          Select Slot
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Override Accordion */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-3">
              <div className="flex items-center justify-between text-slate-700 font-mono text-[11px] font-bold">
                <span>Custom Date / Technician Override</span>
                <span className="text-slate-400 font-normal">Optional manual override</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      setSelectedSlotId(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">
                    Time Window
                  </label>
                  <select
                    value={scheduledTimeWindow}
                    onChange={(e) => {
                      setScheduledTimeWindow(e.target.value);
                      setSelectedSlotId(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
                  >
                    <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                    <option value="13:30 - 16:30">Afternoon (13:30 - 16:30)</option>
                    <option value="08:30 - 15:30">Full Day (Annual Servicing)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={assignedTechnicianId}
                    onChange={(e) => {
                      setAssignedTechnicianId(e.target.value);
                      setSelectedSlotId(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm font-mono text-xs focus:outline-none focus:border-[#CC0000]"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.saqccNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Site Notes */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
              Site Access Instructions &amp; Special Safety Requirements
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please report to Security Gate 2 for visitor badges. High-bay scissor lift available on site."
              className="w-full px-3 py-2 border border-slate-300 rounded-sm font-sans focus:outline-none focus:border-[#CC0000]"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Generates SANS 10139 digital audit log and notifies assigned engineer.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIsScheduleInspectionModalOpen(false);
                  setPreselectedSiteForSchedule(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-sm font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Scheduling Inspection...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Schedule Inspection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
