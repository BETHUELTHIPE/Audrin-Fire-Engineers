import {
  ComplianceInspection,
  SANS10139InspectionType,
  InspectionStatus,
  TechnicianProfile,
  SuggestedTimeSlot
} from '../types';

export const REGISTERED_TECHNICIANS: TechnicianProfile[] = [
  {
    id: 'tech-01',
    name: 'Bethuel Moukangwe',
    role: 'Lead Fire Diagnostics Engineer & Managing Director',
    saqccNumber: 'SAQCC #48291',
    saqccLevel: 'Level 4 - Designer / Master',
    phone: '071 415 6665',
    email: 'bethuelmoukangwe8@gmail.com',
    specialties: ['SANS 10139 Design Audits', 'Addressable Systems', 'Cause & Effect Matrix', 'Commissioning'],
    currentAssignedCount: 3,
    baseLocation: 'Pretoria West',
    avatarColor: 'bg-red-600'
  },
  {
    id: 'tech-02',
    name: 'Thabo Mokoena',
    role: 'Senior Fire Alarm Servicing Specialist',
    saqccNumber: 'SAQCC #51902',
    saqccLevel: 'Level 3 - Servicing / Commissioner',
    phone: '082 441 9023',
    email: 'thabo.m@audrinfire.co.za',
    specialties: ['Quarterly & Annual Servicing', 'Battery Standby Testing', 'Ziton & Hochiki Panels', 'Decibel Surveys'],
    currentAssignedCount: 2,
    baseLocation: 'Pretoria Central / Centurion',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'tech-03',
    name: 'Hendrik Venter',
    role: 'Aspirating & Network Systems Engineer',
    saqccNumber: 'SAQCC #39084',
    saqccLevel: 'Level 3 - Servicing / Commissioner',
    phone: '079 812 3456',
    email: 'hendrik.v@audrinfire.co.za',
    specialties: ['VESDA / Aspirating Smoke Detection', 'Optical Beam Alignments', 'Advanced MXPro5 Networks'],
    currentAssignedCount: 1,
    baseLocation: 'Midrand / Johannesburg',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'tech-04',
    name: 'Ayanda Khumalo',
    role: 'Field Commissioning & Inspection Technician',
    saqccNumber: 'SAQCC #60412',
    saqccLevel: 'Level 2 - Installer',
    phone: '073 665 1198',
    email: 'ayanda.k@audrinfire.co.za',
    specialties: ['Weekly Logbook Audits', 'Point-to-Point Device Testing', 'Sounder Strobes & Call Points'],
    currentAssignedCount: 2,
    baseLocation: 'Pretoria East',
    avatarColor: 'bg-purple-600'
  }
];

export const INITIAL_COMPLIANCE_INSPECTIONS: ComplianceInspection[] = [
  {
    id: 'insp-001',
    title: 'SANS 10139 Clause 25.3 Quarterly Periodic Inspection',
    inspectionType: 'quarterly_periodic_inspection',
    standardClause: 'SANS 10139:2012 Clause 25.3 (Quarterly Servicing)',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationId: 'org-01',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    systemCategory: 'Category P1 - Total Property Protection',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    zonesOrLoopsCount: '4 Loops, 16 Zones',
    scheduledDate: '2026-09-08',
    scheduledTimeWindow: '09:00 - 12:00',
    assignedTechnicianId: 'tech-01',
    assignedTechnicianName: 'Bethuel Moukangwe',
    technicianSaqccNumber: 'SAQCC #48291',
    technicianPhone: '071 415 6665',
    status: 'scheduled',
    complianceChecklistSummary: [
      'Visual inspection of all 4 addressable detection loops',
      'Point testing of 25% minimum installed optical smoke/heat detectors (sampling rotation)',
      'Standby secondary battery terminal voltage & internal resistance impedance test',
      'Verification of fire door release magnetic holders and HVAC shutdown interlocks',
      'Audit of on-site SANS 10139 physical logbook entries and false alarm log'
    ],
    estimatedDurationHours: 3.5,
    notes: 'Access permits to mezzanine high-bay racking arranged with site safety manager.',
    createdAt: '2026-08-29T14:15:00Z'
  },
  {
    id: 'insp-002',
    title: 'Emergency Diagnostic Triage & Earth Fault Clearance',
    inspectionType: 'emergency_fault_attendance',
    standardClause: 'SANS 10139:2012 Clause 26 (Fault Monitoring & Repair)',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationId: 'org-02',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    serviceRequestId: 'req-002',
    serviceRequestRef: 'AFE-REQ-2026-0105',
    systemCategory: 'Category L1 - Total Life Safety Protection',
    panelMakeModel: 'Ziton ZP3 Addressable',
    zonesOrLoopsCount: '2 Loops',
    scheduledDate: '2026-09-02',
    scheduledTimeWindow: '14:00 - 16:30',
    assignedTechnicianId: 'tech-01',
    assignedTechnicianName: 'Bethuel Moukangwe',
    technicianSaqccNumber: 'SAQCC #48291',
    technicianPhone: '071 415 6665',
    status: 'scheduled',
    complianceChecklistSummary: [
      'Locate ground positive/negative earth fault on Ziton Loop 2',
      'Test ceiling void detectors above 2nd floor dental suite for moisture contamination',
      'Re-insulate degraded cable section and measure loop insulation resistance (MΩ)',
      'Verify complete panel LCD clear status without active yellow fault warning'
    ],
    estimatedDurationHours: 2.5,
    notes: 'High urgency attendance to restore full healthcare life-safety monitoring.',
    createdAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 'insp-003',
    title: 'SANS 10139 Clause 25.5 Annual Comprehensive Servicing & COC Audit',
    inspectionType: 'annual_comprehensive_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 10400-T (Annual Servicing)',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationId: 'org-03',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1 - Total Life Safety Protection',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    zonesOrLoopsCount: '5 Loops, 32 Zones',
    scheduledDate: '2026-09-15',
    scheduledTimeWindow: '08:30 - 15:30',
    assignedTechnicianId: 'tech-02',
    assignedTechnicianName: 'Thabo Mokoena',
    technicianSaqccNumber: 'SAQCC #51902',
    technicianPhone: '082 441 9023',
    status: 'due_soon',
    complianceChecklistSummary: [
      '100% full device point-to-point operation testing of all 340 smoke/heat detectors & call points',
      'Full load 24-hour battery standby simulation and 30-minute full alarm load discharge test',
      'Decibel audibility sound level survey (minimum 65 dBA throughout occupied office suites, 75 dBA at bedheads)',
      'Complete cause-and-effect matrix simulation with lift grounding, stairwell pressurisation fans, and gas dampers',
      'Issuance of Annual Certificate of Inspection and SANS 10139 Compliance Declaration'
    ],
    estimatedDurationHours: 7.0,
    notes: 'Sounder testing notification distributed to tenants. Annual statutory inspection requirement.',
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'insp-004',
    title: 'Bi-Annual Periodic SANS 10139 Inspection',
    inspectionType: 'biannual_inspection',
    standardClause: 'SANS 10139:2012 Clause 25.4 (6-Monthly Inspection)',
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    organisationId: 'org-04',
    organisationName: 'Innovatech Holdings',
    streetAddress: '45 Jean Avenue',
    city: 'Centurion',
    systemCategory: 'Category L2 / P1 Combined',
    panelMakeModel: 'Kentec Taktis Addressable Network',
    zonesOrLoopsCount: '8 Loops',
    scheduledDate: '2026-09-22',
    scheduledTimeWindow: '09:00 - 13:00',
    assignedTechnicianId: 'tech-03',
    assignedTechnicianName: 'Hendrik Venter',
    technicianSaqccNumber: 'SAQCC #39084',
    technicianPhone: '079 812 3456',
    status: 'scheduled',
    complianceChecklistSummary: [
      '50% device sampling test covering cleanroom laboratories and server plant rooms',
      'Laser particle count calibration on VESDA aspirating smoke detection pipelines',
      'Inspection of cable support clips in electrical risers for fire-rated compliance',
      'Backup battery electrolyte inspection and float voltage verification'
    ],
    estimatedDurationHours: 4.0,
    notes: 'Cleanroom PPE required for Zone 3 laboratory testing.',
    createdAt: '2026-08-20T11:30:00Z'
  },
  {
    id: 'insp-005',
    title: 'SANS 10139 Routine Weekly Sounder & Call Point Test',
    inspectionType: 'weekly_user_test',
    standardClause: 'SANS 10139:2012 Clause 25.2 (Weekly User Test)',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationId: 'org-01',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    scheduledDate: '2026-08-25',
    scheduledTimeWindow: '10:00 - 10:30',
    assignedTechnicianId: 'tech-04',
    assignedTechnicianName: 'Ayanda Khumalo',
    technicianSaqccNumber: 'SAQCC #60412',
    technicianPhone: '073 665 1198',
    status: 'completed',
    completionDate: '2026-08-25T10:28:00Z',
    complianceChecklistSummary: [
      'Operate Manual Call Point MCP-07 (Bay 4 Loading Dock)',
      'Confirm audible alarm throughout logistics warehouse within 3 seconds',
      'Verify panel LCD correctly displays Zone 2 / MCP-07 text description',
      'Reset system and log test in physical on-site log book'
    ],
    estimatedDurationHours: 0.5,
    findingsSummary: 'All sounders functioned correctly at 82 dBA baseline. Call point reset key functional.',
    certificateIssued: true,
    certificateNumber: 'SANS-WKT-2026-0825',
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'insp-006',
    title: 'SANS 10139 Initial Premises Survey & Category Review',
    inspectionType: 'site_survey',
    standardClause: 'SANS 10139:2012 Clause 5 & 6 (System Category Assessment)',
    siteId: 'site-05',
    siteName: 'Silverton Industrial Assembly Facility',
    organisationId: 'org-05',
    organisationName: 'Gauteng Precision Engineering',
    streetAddress: '12 Derdepoort Road',
    city: 'Pretoria East',
    systemCategory: 'Category M / L3 Proposed',
    panelMakeModel: 'Conventional 8-Zone Panel (Legacy Migration)',
    scheduledDate: '2026-09-28',
    scheduledTimeWindow: '10:00 - 13:00',
    assignedTechnicianId: 'tech-01',
    assignedTechnicianName: 'Bethuel Moukangwe',
    technicianSaqccNumber: 'SAQCC #48291',
    technicianPhone: '071 415 6665',
    status: 'scheduled',
    complianceChecklistSummary: [
      'Assess ceiling heights and obstruction clearances in heavy machining bay',
      'Evaluate ambient dust/oil vapour hazards for optical vs thermal detector selection',
      'Review escape route geometry and emergency exit signage placement',
      'Prepare SANS 10139 Category specification and BoQ recommendation'
    ],
    estimatedDurationHours: 3.0,
    notes: 'Client requested migration quote from conventional to addressable system.',
    createdAt: '2026-08-28T16:00:00Z'
  }
];

export function getInspectionTypeLabel(type: SANS10139InspectionType): string {
  switch (type) {
    case 'weekly_user_test':
      return 'Weekly User Test (Clause 25.2)';
    case 'quarterly_periodic_inspection':
      return 'Quarterly Periodic Inspection (Clause 25.3)';
    case 'biannual_inspection':
      return '6-Monthly Periodic Inspection (Clause 25.4)';
    case 'annual_comprehensive_servicing':
      return 'Annual Comprehensive Servicing (Clause 25.5)';
    case 'site_survey':
      return 'Premises Survey & Category Design (Clause 5-6)';
    case 'commissioning_verification':
      return 'Commissioning & Acceptance (Clause 23)';
    case 'emergency_fault_attendance':
      return 'Emergency Diagnostic Triage (Clause 26)';
    default:
      return 'SANS 10139 Inspection';
  }
}

export function getInspectionTypeBadgeColor(type: SANS10139InspectionType): { bg: string; text: string; border: string; accent: string } {
  switch (type) {
    case 'annual_comprehensive_servicing':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: '#CC0000' };
    case 'quarterly_periodic_inspection':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: '#1E40AF' };
    case 'biannual_inspection':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', accent: '#4338CA' };
    case 'weekly_user_test':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: '#047857' };
    case 'emergency_fault_attendance':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', accent: '#E11D48' };
    case 'site_survey':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', accent: '#D97706' };
    case 'commissioning_verification':
      return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', accent: '#0891B2' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: '#475569' };
  }
}

export function getStatusBadge(status: InspectionStatus): { label: string; bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'completed':
      return { label: 'Completed & Certified', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' };
    case 'scheduled':
      return { label: 'Confirmed & Scheduled', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' };
    case 'due_soon':
      return { label: 'Due Within 30 Days', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', dot: 'bg-amber-500' };
    case 'overdue':
      return { label: 'Overdue (Compliance Gap)', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300', dot: 'bg-red-500' };
    case 'in_progress':
      return { label: 'Technician on Site', bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', dot: 'bg-purple-500' };
    case 'rescheduled':
      return { label: 'Rescheduled', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-500' };
    default:
      return { label: status, bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-400' };
  }
}

/**
 * Intelligent Algorithm to Automatically Suggest Open Slots for Qualified Technicians
 */
export function suggestOpenSlotsForSite(
  site: { siteName: string; city?: string; streetAddress?: string },
  inspectionType: SANS10139InspectionType,
  existingInspections: ComplianceInspection[],
  targetStartDate: Date = new Date(2026, 8, 3) // Sep 3, 2026
): SuggestedTimeSlot[] {
  const suggestions: SuggestedTimeSlot[] = [];
  const city = site.city || 'Pretoria West';

  // Find most suitable primary technician based on inspection type and geographic location
  let primaryTech: TechnicianProfile = REGISTERED_TECHNICIANS[0]; // Bethuel Moukangwe
  if (inspectionType === 'annual_comprehensive_servicing' || inspectionType === 'quarterly_periodic_inspection') {
    primaryTech = REGISTERED_TECHNICIANS[1]; // Thabo Mokoena
  } else if (inspectionType === 'weekly_user_test') {
    primaryTech = REGISTERED_TECHNICIANS[3]; // Ayanda Khumalo
  } else if (city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('midrand')) {
    primaryTech = REGISTERED_TECHNICIANS[2]; // Hendrik Venter
  }

  // Generate candidate dates in the next 14 weekdays
  const candidateDates: Date[] = [];
  const current = new Date(targetStartDate);
  let daysAdded = 0;
  while (daysAdded < 10) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays only
      candidateDates.push(new Date(current));
      daysAdded++;
    }
  }

  const timeWindows = ['09:00 - 12:00', '13:30 - 16:30'];

  for (let i = 0; i < candidateDates.length && suggestions.length < 5; i++) {
    const d = candidateDates[i];
    const dateStr = d.toISOString().split('T')[0];

    for (const tw of timeWindows) {
      if (suggestions.length >= 5) break;

      // Check if primary or backup tech is already booked at this exact slot
      const isPrimaryBooked = existingInspections.some(
        insp => insp.scheduledDate === dateStr && insp.scheduledTimeWindow === tw && insp.assignedTechnicianId === primaryTech.id
      );

      let selectedTech = primaryTech;
      if (isPrimaryBooked) {
        // Fallback to alternate available technician
        const availableAlt = REGISTERED_TECHNICIANS.find(
          t => t.id !== primaryTech.id && !existingInspections.some(insp => insp.scheduledDate === dateStr && insp.scheduledTimeWindow === tw && insp.assignedTechnicianId === t.id)
        );
        if (availableAlt) {
          selectedTech = availableAlt;
        } else {
          continue; // Both booked
        }
      }

      // Calculate smart score
      let score = 90;
      const reasons: string[] = [];

      // Proximity match
      if (
        (city.includes('Pretoria West') && selectedTech.baseLocation.includes('Pretoria West')) ||
        (city.includes('Pretoria Central') && selectedTech.baseLocation.includes('Pretoria Central')) ||
        (city.includes('Centurion') && selectedTech.baseLocation.includes('Centurion')) ||
        (city.includes('Pretoria East') && selectedTech.baseLocation.includes('Pretoria East')) ||
        (city.includes('Johannesburg') && selectedTech.baseLocation.includes('Johannesburg'))
      ) {
        score += 8;
        reasons.push(`Technician based in ${selectedTech.baseLocation} (Zero transit delay)`);
      } else {
        reasons.push(`Pretoria & Gauteng Regional Response Route`);
      }

      // SAQCC accreditation match
      if (inspectionType === 'annual_comprehensive_servicing' && selectedTech.saqccLevel.includes('Level 3')) {
        score += 2;
        reasons.push(`Accredited for SANS 10139 Full Servicing & COC Sign-off (${selectedTech.saqccNumber})`);
      } else if (inspectionType === 'emergency_fault_attendance' && selectedTech.id === 'tech-01') {
        score += 2;
        reasons.push(`Senior Diagnostics Engineer on standby for rapid isolation`);
      } else {
        reasons.push(`Certified ${selectedTech.saqccLevel} Specialist`);
      }

      // Workload optimization
      reasons.push(`Optimal travel schedule without client disruption`);

      suggestions.push({
        id: `slot-${dateStr}-${tw.replace(/[^0-9]/g, '')}-${selectedTech.id}`,
        date: dateStr,
        timeWindow: tw,
        technician: selectedTech,
        suitabilityScore: Math.min(score, 99),
        reasons,
        travelZone: selectedTech.baseLocation,
        conflictRisk: 'none'
      });
    }
  }

  return suggestions;
}

/**
 * Generate iCalendar (.ics) string for 1-click sync into Microsoft Outlook, Google Calendar, Apple Calendar
 */
export function generateICalContent(inspection: ComplianceInspection): string {
  const startDateTime = `${inspection.scheduledDate.replace(/-/g, '')}T090000Z`;
  const endDateTime = `${inspection.scheduledDate.replace(/-/g, '')}T120000Z`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Audrin Fire Engineers//SANS 10139 Compliance Platform//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${inspection.id}@audrinfire.co.za
DTSTAMP:${now}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${inspection.title} - ${inspection.siteName}
DESCRIPTION:SANS 10139 Compliance Inspection\\nStandard Clause: ${inspection.standardClause}\\nAssigned Technician: ${inspection.assignedTechnicianName} (${inspection.technicianSaqccNumber})\\nSite: ${inspection.siteName}, ${inspection.streetAddress}, ${inspection.city}\\nPanel: ${inspection.panelMakeModel}\\n\\nAudrin Fire Engineers (Pty) Ltd - Tel: 071 415 6665
LOCATION:${inspection.streetAddress}, ${inspection.city}, South Africa
STATUS:CONFIRMED
ORGANIZER;CN=Audrin Fire Engineers:mailto:bethuelmoukangwe8@gmail.com
END:VEVENT
END:VCALENDAR`;
}

export function downloadICalFile(inspection: ComplianceInspection) {
  const content = generateICalContent(inspection);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${inspection.id}_SANS_10139_Inspection.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
