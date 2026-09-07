import {
  SANSRequirementItem,
  RemedialActionTask,
  RemedialTaskPriority,
  RemedialTaskStatus
} from '../types/remedialActions';
import { TechnicianProfile } from '../types';

/**
 * Standard SANS 10139 / SANS 322 / SANS 246 Statutory Maintenance Checks Library
 * Used when running on-site or audit maintenance inspections.
 */
export const STANDARD_SANS_REQUIREMENT_CHECKS: SANSRequirementItem[] = [
  {
    id: 'sans-chk-01',
    clause: 'SANS 10139:2012 Clause 25.3.3',
    title: 'Standby Battery Float Voltage & Internal Impedance Test',
    description: 'Verify 24h/72h quiescent standby power plus 30-minute full alarm load autonomy. Cell impedance must remain below manufacturer threshold and float voltage >= 13.6V per 12V block.',
    category: 'Power Supply',
    criticality: 'critical',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Replace Degraded Sealed Lead-Acid (VRLA) Standby Batteries',
      description: 'Remove internal high-impedance 12V 17Ah battery pack, clean terminals, install matched pair date-stamped VRLA batteries, and conduct 30-minute full-load discharge test.',
      recommendedParts: ['2x 12V 17Ah Yuasa/Vision VRLA Batteries', 'Terminal Corrosion Protection Kit', 'Internal Battery Fuse Link 3.15A'],
      slaHours: 24, // Immediate life-safety hazard: mains failure leaves facility unprotected
      requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
      estimatedHours: 2.0,
      estimatedCostZAR: 3450
    }
  },
  {
    id: 'sans-chk-02',
    clause: 'SANS 10139:2012 Clause 25.3.2',
    title: 'Quarterly Rotational Sampling (25% Detectors Tested)',
    description: 'A registered SAQCC technician shall test at least 25% of all installed point detectors across designated zones using calibrated aerosol or heat test kit, ensuring optical response within 15 seconds.',
    category: 'Detection Sampling',
    criticality: 'major',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Dismantle, De-dust and Recalibrate Sluggish Optical Smoke Sensors',
      description: 'Replace contaminated optical smoke detector chambers in high-dust warehouse bays; verify analog loop polling addresses and recalibrate chamber obscuration levels.',
      recommendedParts: ['4x Optical Smoke Replacement Heads (Hochiki/Apollo)', 'Ultrasonic Chamber Cleaning Solvent', 'Loop Isolator Base B501'],
      slaHours: 48,
      requiredSaqccLevel: 'Level 2 - Installer / Level 3 Servicing',
      estimatedHours: 3.5,
      estimatedCostZAR: 5200
    }
  },
  {
    id: 'sans-chk-03',
    clause: 'SANS 10139:2012 Clause 16.2',
    title: 'Audible Alarm Sound Level Survey (Minimum 65 dB(A) / 75 dB(A))',
    description: 'Sound pressure level of alarm sounders must exceed 65 dB(A) or 5 dB(A) above ambient background noise across all habitable areas, and 75 dB(A) at bedhead in sleeping risk accommodation.',
    category: 'Audibility & Visual',
    criticality: 'critical',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Install Auxiliary Electronic Sounder Strobe in Low-Audibility Zone',
      description: 'Extend Sounder Circuit 2 using PH30 fire-resistant cable, mount addressable deep-base sounder-beacon (red flash), set volume DIP switch to 102 dB(A), and re-survey decibel level.',
      recommendedParts: ['1x Addressable Wall Sounder Strobe IP65', '25m 1.5mm² 2-Core Fire-Resistant PH30 Cable', 'Heavy Duty P-Clips'],
      slaHours: 24,
      requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
      estimatedHours: 4.0,
      estimatedCostZAR: 4850
    }
  },
  {
    id: 'sans-chk-04',
    clause: 'SANS 10139:2012 Clause 25.3.4',
    title: 'Cause-and-Effect Interlocks & HVAC Damper Trips',
    description: 'Verify automatic magnetic fire door holder release, air handling unit (AHU) smoke damper tripping, elevator ground floor recall, and access control turnstile failsafe unlocks on fire signal.',
    category: 'Interlocks & Interfaces',
    criticality: 'critical',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Rectify Relay Interface Output Failure on AHU-02 Smoke Damper',
      description: 'Replace burned contact relay module on Loop 2, re-terminate 24V control lines to air handling unit starter board, and conduct live smoke test to verify instant damper closing.',
      recommendedParts: ['1x Addressable Single Output Relay Unit (MIO)', 'Relay Snubber Diode Module', '2A In-Line Fuse Holder'],
      slaHours: 24,
      requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
      estimatedHours: 2.5,
      estimatedCostZAR: 2900
    }
  },
  {
    id: 'sans-chk-05',
    clause: 'SANS 10139:2012 Clause 25.1 & Clause 28',
    title: 'Statutory On-Site Fire Alarm Log Book & False Alarm Audit',
    description: 'Examine physical log book for weekly test entries, recorded fault anomalies, engineer visit signatures, and calculate annual false alarm rate (must not exceed 1 false alarm per 25 detectors).',
    category: 'Documentation & Logbook',
    criticality: 'minor',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Issue New SANS 10139 Red Hard-Cover Log Book & Train Responsible Person',
      description: 'Deliver tamper-proof bound statutory register, transcribe previous quarterly certificate records, and brief the designated site safety officer on weekly manual call point testing protocol.',
      recommendedParts: ['1x Official SANS 10139 Fire Alarm Log Book Register', 'Lockable Wall Document Cabinet Key Set', 'Call Point Test Key (Pack of 5)'],
      slaHours: 168, // 7 days
      requiredSaqccLevel: 'Level 2 - Installer / Administrative',
      estimatedHours: 1.5,
      estimatedCostZAR: 950
    }
  },
  {
    id: 'sans-chk-06',
    clause: 'SANS 10139:2012 Clause 25.4.3',
    title: 'Fire Resilient Cable Containment & Physical Support Spacing',
    description: 'Inspect cable routes: cable supports, metallic fire-clips (no plastic conduit saddles without fire clips), and containment integrity across escape routes and hazardous ceiling voids.',
    category: 'Cabling & Enclosures',
    criticality: 'major',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Retrofit All-Metal Fire Clips on Sagging Loop Cables Above Ceiling Void',
      description: 'Replace melted/damaged plastic tie-wraps with stainless steel fire clips spaced at maximum 300mm intervals to prevent cable collapse hazard during structural fire exposure.',
      recommendedParts: ['100x Stainless Steel Fire-Resistant Cable Clips (BS 5839/SANS compliant)', 'Masonry Anchors 6mm', 'Fire-stop Intumescent Mastic Sealant'],
      slaHours: 72,
      requiredSaqccLevel: 'Level 2 - Installer',
      estimatedHours: 5.0,
      estimatedCostZAR: 3800
    }
  },
  {
    id: 'sans-chk-07',
    clause: 'SANS 246 / SANS 10139 Clause 25.3.6',
    title: 'Aspirating Smoke Detection (VESDA) Airflow & Filter Verification',
    description: 'Check aspiration pipe suction pressure, sample hole transit time (<60 seconds), detector filter obscuration percentage, and clean primary foam element if flow variance >15%.',
    category: 'Aspirating & Clean Agent',
    criticality: 'major',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Service VESDA LaserPLUS Aspirating Detector: Replace Core Air Filter Element',
      description: 'Replace saturated dual-stage particulate filter cartridge, calibrate airflow differential transducer, blow out sample pipe network with dry nitrogen, and record transport time.',
      recommendedParts: ['1x Xtralis VSP-005 Replacement Filter Cartridge', 'Nitrogen Purge Adaptor Fitting', 'Flow Sensor Diagnostic Lead'],
      slaHours: 48,
      requiredSaqccLevel: 'Level 3 - Servicing / Commissioner (VESDA Certified)',
      estimatedHours: 3.0,
      estimatedCostZAR: 6200
    }
  },
  {
    id: 'sans-chk-08',
    clause: 'SANS 10139:2012 Clause 25.4.1',
    title: 'Control & Indicating Equipment (CIE) Earth Fault & Display Matrix',
    description: 'Verify CIE internal PSU voltages, inspect LCD backlight, verify LED test routine, test alphanumeric buzzer, and measure resistance to ground (earth fault tolerance).',
    category: 'Power Supply',
    criticality: 'major',
    status: 'untested',
    defaultRemedialAction: {
      title: 'Locate and Isolate Intermittent Negative Earth Fault on Loop 3 Field Wiring',
      description: 'Perform split-half continuity and insulation resistance testing (minimum 2 MΩ at 500V DC) across Loop 3 negative line, identify water ingress at outdoor break glass unit, replace unit.',
      recommendedParts: ['1x IP67 Weatherproof Manual Call Point', 'Gel-Filled Inline Crimp Connectors', '2 MΩ Megger Insulation Report Sheet'],
      slaHours: 48,
      requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
      estimatedHours: 4.5,
      estimatedCostZAR: 4100
    }
  }
];

/**
 * Initial set of realistic Remedial Action Tasks
 * Generated from recent maintenance audits across South African client facilities
 */
export const INITIAL_REMEDIAL_TASKS: RemedialActionTask[] = [
  {
    id: 'rem-001',
    referenceCode: 'REM-2026-081',
    title: 'Replace Degraded Standby Batteries (Float 10.4V Failure)',
    description: 'Standby backup batteries failed Clause 25.3.3 load test during Quarterly Maintenance. Secondary supply cannot support mandatory 24h standby + 30min evacuation alarm.',
    sansClause: 'SANS 10139:2012 Clause 25.3.3',
    category: 'Power Supply',
    priority: 'critical',
    status: 'pending_assignment', // Needs immediate admin tech dispatch!
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    locationDetails: 'Main Fire Control Room, Battery Compartment in MXPro5 Panel',
    clientOrganisation: 'Tshwane Logistics Park',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    inspectionId: 'insp-001',
    inspectionTitle: 'SANS 10139 Clause 25.3 Quarterly Periodic Inspection',
    failureReason: 'Internal resistance measured 310 mΩ (maximum permitted 110 mΩ). Battery voltage dropped to 10.4V within 90 seconds of load simulation.',
    measuredValue: '10.4V under 3.2A load (Statutory threshold >= 12.2V)',
    statutoryConsequence: 'Breach of SANS 10139:2012 and OHS Act 85 of 1993 Section 8; complete loss of building life safety during utility load shedding.',
    dateGenerated: '2026-09-02T08:30:00Z',
    targetCompletionDate: '2026-09-04',
    slaHours: 24,
    slaDeadline: '2026-09-04T12:00:00Z',
    requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
    recommendedParts: ['2x 12V 17Ah VRLA Batteries (Yuasa/Vision)', 'High-temp battery terminal lugs', '3.15A Inline ceramic fuse'],
    estimatedHours: 2.0,
    estimatedCostZAR: 3450
  },
  {
    id: 'rem-002',
    referenceCode: 'REM-2026-082',
    title: 'Retrofit Fire-Resistant Metal Clips on Mezzanine Loop Cable',
    description: 'During visual inspection, PVC cable saddles in mezzanine racking void were discovered without metal fire-clip reinforcement. Risk of premature wire collapse obstructing escape routes.',
    sansClause: 'SANS 10139:2012 Clause 25.4.3',
    category: 'Cabling & Enclosures',
    priority: 'high',
    status: 'assigned',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    locationDetails: 'Mezzanine High-Bay Racking Void, Loop 2 Containment',
    clientOrganisation: 'Tshwane Logistics Park',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    inspectionId: 'insp-001',
    inspectionTitle: 'SANS 10139 Clause 25.3 Quarterly Periodic Inspection',
    failureReason: 'Plastic zip-ties used exclusively across 45-metre run over high-hazard storage aisle without metallic fire clips.',
    measuredValue: '45m non-metallic clip containment violating SANS 10139:2012',
    statutoryConsequence: 'Non-compliance with SANS 10139:2012 Clause 26.2 (Wiring integrity under fire temperatures).',
    dateGenerated: '2026-09-02T09:15:00Z',
    targetCompletionDate: '2026-09-06',
    slaHours: 72,
    slaDeadline: '2026-09-05T09:15:00Z',
    requiredSaqccLevel: 'Level 2 - Installer',
    recommendedParts: ['80x Stainless Steel Fire Clips', '6mm Masonry Anchor Pins'],
    estimatedHours: 4.5,
    estimatedCostZAR: 3600,
    assignedTechnicianId: 'tech-02',
    assignedTechnicianName: 'Thabo Mokoena',
    assignedTechnicianSaqcc: 'SAQCC #51902',
    assignedTechnicianPhone: '082 441 9023',
    assignedTechnicianEmail: 'thabo.m@audrinfire.co.za',
    assignedAt: '2026-09-02T11:00:00Z',
    assignedBy: 'Admin (Bethuel Moukangwe)',
    targetTimeWindow: '09:00 - 12:00',
    dispatchNotes: 'Cherry picker access arranged with warehouse safety superintendent for Thursday morning.'
  },
  {
    id: 'rem-003',
    referenceCode: 'REM-2026-083',
    title: 'Replace Failed AHU Smoke Damper Trip Relay on Loop 1',
    description: 'Interface relay failed to de-energize air handling unit (AHU-04) during simulated zone 3 fire signal. Air circulation continues during alarm.',
    sansClause: 'SANS 10139:2012 Clause 25.3.4',
    category: 'Interlocks & Interfaces',
    priority: 'critical',
    status: 'pending_assignment', // Unassigned!
    siteId: 'site-02',
    siteName: 'Centurion Medical Centre',
    locationDetails: 'HVAC Plant Room Level 2, Air Handling Unit 4 Starter Panel',
    clientOrganisation: 'Mediclinic Northern Region',
    panelMakeModel: 'Ziton ZP3 Intelligent Panel',
    inspectionId: 'insp-002',
    inspectionTitle: 'SANS 10139 Clause 25.4 Bi-Annual Servicing',
    failureReason: 'Interface relay coil open circuit. Panel signaled trip but voltage output remained 0V.',
    measuredValue: 'Coil resistance infinite (Open Circuit)',
    statutoryConsequence: 'Critical violation: smoke recirculation into surgical wards in fire mode.',
    dateGenerated: '2026-09-03T14:10:00Z',
    targetCompletionDate: '2026-09-04',
    slaHours: 24,
    slaDeadline: '2026-09-04T14:10:00Z',
    requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
    recommendedParts: ['1x Ziton ZP755-HVAC Interface Relay', 'Flyback protection diode', '2.5mm² control cable'],
    estimatedHours: 3.0,
    estimatedCostZAR: 3200
  },
  {
    id: 'rem-004',
    referenceCode: 'REM-2026-084',
    title: 'VESDA LaserPLUS Aspirating Core Filter Replacement',
    description: 'Server room high-sensitivity smoke detection unit indicated high filter blockage flag (88%). Air transport time exceeded 60-second limit.',
    sansClause: 'SANS 246 / SANS 10139 Clause 25.3.6',
    category: 'Aspirating & Clean Agent',
    priority: 'high',
    status: 'in_progress',
    siteId: 'site-03',
    siteName: 'Menlyn Corporate Tower',
    locationDetails: 'Basement Tier-3 Data Centre, Rack Row B Aspiration Pipe',
    clientOrganisation: 'Growthpoint Properties',
    panelMakeModel: 'Xtralis VESDA LaserPLUS & MXPro5 Network',
    failureReason: 'Sample pipe transport time measured 74 seconds (Statutory limit < 60s); filter obscuration 88%.',
    measuredValue: '74 seconds transport time, 88% filter saturation',
    statutoryConsequence: 'Delayed early fire warning in critical IT mission-critical facility.',
    dateGenerated: '2026-09-01T10:00:00Z',
    targetCompletionDate: '2026-09-04',
    slaHours: 48,
    slaDeadline: '2026-09-03T10:00:00Z',
    requiredSaqccLevel: 'Level 3 - Servicing / Commissioner (VESDA Certified)',
    recommendedParts: ['1x Xtralis VSP-005 Filter Cartridge', 'Aspiration Pipe Nitrogen Cleanse Kit'],
    estimatedHours: 3.0,
    estimatedCostZAR: 6200,
    assignedTechnicianId: 'tech-03',
    assignedTechnicianName: 'Hendrik Venter',
    assignedTechnicianSaqcc: 'SAQCC #39084',
    assignedTechnicianPhone: '079 812 3456',
    assignedTechnicianEmail: 'hendrik.v@audrinfire.co.za',
    assignedAt: '2026-09-01T14:30:00Z',
    assignedBy: 'Admin (Bethuel Moukangwe)',
    targetTimeWindow: '13:30 - 16:30',
    dispatchNotes: 'High-security clean room access card required from Facilities Manager.'
  },
  {
    id: 'rem-005',
    referenceCode: 'REM-2026-085',
    title: 'Rectify Sounder Decibel Deficiency in Ground Floor Canteen (57 dB(A))',
    description: 'Sound level survey registered only 57 dB(A) in staff canteen during full evacuation signal, failing SANS 10139 Clause 16.2 65 dB(A) minimum requirement.',
    sansClause: 'SANS 10139:2012 Clause 16.2',
    category: 'Audibility & Visual',
    priority: 'critical',
    status: 'rectified',
    siteId: 'site-04',
    siteName: 'Rosslyn Automotive Plant',
    locationDetails: 'Building C, Staff Dining Hall & Kitchen Concourse',
    clientOrganisation: 'BMW SA Automotive Hub',
    panelMakeModel: 'Hochiki FireNet Plus Network',
    failureReason: 'Sounder volume dipped below minimum threshold due to high acoustic dampening ceiling baffles.',
    measuredValue: '57 dB(A) measured (Mandatory minimum >= 65 dB(A))',
    statutoryConsequence: 'Occupants unable to hear alarm during emergency evacuation.',
    dateGenerated: '2026-08-28T11:00:00Z',
    targetCompletionDate: '2026-08-30',
    slaHours: 24,
    slaDeadline: '2026-08-29T11:00:00Z',
    requiredSaqccLevel: 'Level 3 - Servicing / Commissioner',
    recommendedParts: ['1x High-Output Electronic Sounder 108 dB(A)', 'PH30 Fire Cable 15m'],
    estimatedHours: 3.5,
    estimatedCostZAR: 3900,
    assignedTechnicianId: 'tech-02',
    assignedTechnicianName: 'Thabo Mokoena',
    assignedTechnicianSaqcc: 'SAQCC #51902',
    assignedTechnicianPhone: '082 441 9023',
    assignedTechnicianEmail: 'thabo.m@audrinfire.co.za',
    assignedAt: '2026-08-28T12:00:00Z',
    assignedBy: 'Admin (Bethuel Moukangwe)',
    targetTimeWindow: '09:00 - 12:00',
    dispatchNotes: 'Sounder installed and tested. Re-tested level: 78.4 dB(A).',
    rectifiedAt: '2026-08-29T15:30:00Z',
    rectifiedNotes: 'Mounted high-output sounder beacon above canteen serving line. Re-calibrated volume DIP switch. SPL survey registered 78.4 dB(A) everywhere in dining hall.',
    rectifiedByTechName: 'Thabo Mokoena',
    retestPassed: true,
    verifiedAt: '2026-08-30T09:00:00Z',
    verifiedBy: 'Bethuel Moukangwe (SAQCC Level 4 Master)'
  }
];

/**
 * Automatically generates a single RemedialActionTask from a failed maintenance check item
 */
export function generateRemedialTaskFromFailedCheck(
  checkItem: SANSRequirementItem,
  siteInfo: {
    siteId: string;
    siteName: string;
    clientOrganisation: string;
    panelMakeModel?: string;
    locationDetails?: string;
  },
  inspectionId?: string,
  inspectionTitle?: string,
  adminUser?: string
): RemedialActionTask {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const refCode = `REM-${randomSuffix}`;
  const now = new Date();

  // Compute SLA deadline
  const slaHours = checkItem.defaultRemedialAction.slaHours || 24;
  const deadlineDate = new Date(now.getTime() + slaHours * 3600 * 1000);
  const targetDateStr = deadlineDate.toISOString().split('T')[0];

  const priority: RemedialTaskPriority =
    checkItem.criticality === 'critical'
      ? 'critical'
      : checkItem.criticality === 'major'
      ? 'high'
      : 'medium';

  return {
    id: `rem-${timestamp}-${randomSuffix}`,
    referenceCode: refCode,
    title: checkItem.defaultRemedialAction.title,
    description: checkItem.defectNotes
      ? `${checkItem.defaultRemedialAction.description} [Engineer Finding: ${checkItem.defectNotes}]`
      : checkItem.defaultRemedialAction.description,
    sansClause: checkItem.clause,
    category: checkItem.category,
    priority,
    status: 'pending_assignment', // Freshly auto-generated, awaiting technician assignment
    siteId: siteInfo.siteId,
    siteName: siteInfo.siteName,
    locationDetails: siteInfo.locationDetails || `${siteInfo.siteName}, Main Building`,
    clientOrganisation: siteInfo.clientOrganisation,
    panelMakeModel: siteInfo.panelMakeModel || 'SANS Compliant Addressable Fire Panel',
    inspectionId,
    inspectionTitle,
    failureReason: checkItem.defectNotes || `Failed statutory verification under ${checkItem.clause}.`,
    measuredValue: checkItem.measuredValue || 'Non-compliant reading observed during test routine.',
    statutoryConsequence:
      checkItem.criticality === 'critical'
        ? `Immediate statutory violation of ${checkItem.clause} and OHS Act 85 of 1993 Section 8 (General Duties of Employers). Life safety compromised.`
        : `Statutory defect under ${checkItem.clause}. Must be rectified within statutory window to preserve Certificate of Compliance (COC).`,
    dateGenerated: now.toISOString(),
    targetCompletionDate: targetDateStr,
    slaHours,
    slaDeadline: deadlineDate.toISOString(),
    requiredSaqccLevel: checkItem.defaultRemedialAction.requiredSaqccLevel,
    recommendedParts: checkItem.defaultRemedialAction.recommendedParts,
    estimatedHours: checkItem.defaultRemedialAction.estimatedHours,
    estimatedCostZAR: checkItem.defaultRemedialAction.estimatedCostZAR,
    assignedBy: adminUser || 'Audrin Fire Admin'
  };
}

/**
 * Generates an array of remedial tasks from all failed items in a maintenance check
 */
export function autoGenerateRemedialTasksForChecks(
  checks: SANSRequirementItem[],
  siteInfo: {
    siteId: string;
    siteName: string;
    clientOrganisation: string;
    panelMakeModel?: string;
    locationDetails?: string;
  },
  inspectionId?: string,
  inspectionTitle?: string,
  adminUser?: string
): RemedialActionTask[] {
  const failedItems = checks.filter(c => c.status === 'failed');
  return failedItems.map(item =>
    generateRemedialTaskFromFailedCheck(item, siteInfo, inspectionId, inspectionTitle, adminUser)
  );
}

/**
 * Helper to format remaining SLA time
 */
export function getSLATimeStatus(deadlineISO: string): {
  label: string;
  isBreached: boolean;
  isUrgent: boolean;
  hoursRemaining: number;
} {
  const deadline = new Date(deadlineISO).getTime();
  const now = Date.now();
  const diffHours = (deadline - now) / (1000 * 3600);

  if (diffHours < 0) {
    return {
      label: `SLA Breached (${Math.abs(Math.round(diffHours))}h overdue)`,
      isBreached: true,
      isUrgent: true,
      hoursRemaining: diffHours
    };
  } else if (diffHours <= 12) {
    return {
      label: `${Math.round(diffHours)}h remaining (Urgent)`,
      isBreached: false,
      isUrgent: true,
      hoursRemaining: diffHours
    };
  } else {
    const days = Math.round(diffHours / 24);
    return {
      label: days >= 2 ? `${days} days remaining` : `${Math.round(diffHours)}h remaining`,
      isBreached: false,
      isUrgent: false,
      hoursRemaining: diffHours
    };
  }
}

/**
 * Priority badge styling
 */
export function getPriorityBadge(priority: RemedialTaskPriority): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (priority) {
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700 font-black',
        border: 'border-red-300',
        label: 'CRITICAL (24h)'
      };
    case 'high':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800 font-bold',
        border: 'border-amber-300',
        label: 'HIGH (48h)'
      };
    case 'medium':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800 font-bold',
        border: 'border-blue-200',
        label: 'MEDIUM (7d)'
      };
    case 'low':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700 font-medium',
        border: 'border-slate-200',
        label: 'LOW (14d)'
      };
  }
}

/**
 * Status badge styling
 */
export function getRemedialStatusBadge(status: RemedialTaskStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
  dotColor: string;
} {
  switch (status) {
    case 'pending_assignment':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-600 font-bold',
        border: 'border-red-200',
        label: 'Needs Dispatch',
        dotColor: 'bg-red-600 animate-pulse'
      };
    case 'assigned':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-700 font-bold',
        border: 'border-blue-200',
        label: 'Technician Dispatched',
        dotColor: 'bg-blue-600'
      };
    case 'in_progress':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 font-bold',
        border: 'border-amber-200',
        label: 'In Progress On-Site',
        dotColor: 'bg-amber-500'
      };
    case 'rectified':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 font-bold',
        border: 'border-emerald-200',
        label: 'Rectified / Retest OK',
        dotColor: 'bg-emerald-600'
      };
    case 'verified_closed':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-700 font-bold',
        border: 'border-purple-200',
        label: 'Closed & Master Signed',
        dotColor: 'bg-purple-600'
      };
  }
}

/**
 * Generate printable Work Order / Dispatch Order text
 */
export function generateRemedialWorkOrderText(task: RemedialActionTask): string {
  return `================================================================================
AUDRIN FIRE ENGINEERS (PTY) LTD - STATUTORY REMEDIAL DISPATCH WORK ORDER
SANS 10139:2012 / SANS 322 / SANS 246 CORRECTIVE ACTION DIRECTIVE
================================================================================

WORK ORDER REFERENCE: ${task.referenceCode} (Task ID: ${task.id})
DATE GENERATED:       ${new Date(task.dateGenerated).toLocaleString()}
TARGET RESOLUTION:    ${task.targetCompletionDate} (SLA: ${task.slaHours} Hours)
PRIORITY LEVEL:       ${task.priority.toUpperCase()}
CURRENT STATUS:       ${task.status.toUpperCase().replace('_', ' ')}

1. PREMISES & ASSET CONTEXT:
--------------------------------------------------------------------------------
Client Organisation:  ${task.clientOrganisation}
Premises Site:        ${task.siteName}
Specific Location:    ${task.locationDetails || 'Main Facility'}
Fire Alarm CIE:       ${task.panelMakeModel || 'Standard Addressable Panel'}
Inspection Link:      ${task.inspectionTitle || 'Routine SANS Maintenance Check'}

2. STATUTORY DEFECT / SANS REQUIREMENT VIOLATION:
--------------------------------------------------------------------------------
Statutory Clause:     ${task.sansClause}
Defect Classification:${task.category}
Failure Description:  ${task.failureReason}
Field Measurement:    ${task.measuredValue || 'Visual Defect / Operational Fail'}
Legal Impact:         ${task.statutoryConsequence}

3. MANDATORY REMEDIAL SCOPE & SPECIFICATIONS:
--------------------------------------------------------------------------------
Corrective Action:    ${task.title}
Detailed Procedure:   ${task.description}
Minimum Qualification:${task.requiredSaqccLevel}
Estimated Lab Time:   ${task.estimatedHours} Hours
Estimated Part Value: R ${task.estimatedCostZAR?.toLocaleString() || 'N/A'} (ZAR)

Recommended Replacement Components:
${task.recommendedParts.map(p => `  • ${p}`).join('\n')}

4. ASSIGNED TECHNICIAN DISPATCH DETAILS:
--------------------------------------------------------------------------------
Assigned Technician:  ${task.assignedTechnicianName || 'UNASSIGNED - PENDING DISPATCH'}
SAQCC Registration:   ${task.assignedTechnicianSaqcc || 'N/A'}
Contact Phone:        ${task.assignedTechnicianPhone || 'N/A'}
Scheduled Window:     ${task.targetTimeWindow || 'Immediate Emergency Callout'}
Admin Instructions:   ${task.dispatchNotes || 'Standard safe work procedure applies. Isolate loop prior to work.'}

5. POST-RECTIFICATION SIGN-OFF & RETEST VERIFICATION:
--------------------------------------------------------------------------------
[ ] Defect rectified and replacement components installed
[ ] Loop continuity and operational test conducted
[ ] Decibel / Voltage / Retest verification parameters met
[ ] Physical SANS 10139 logbook updated on-site

Technician Signature: _______________________ Date: ___________________
SAQCC Number:         _______________________
Client Rep Signature: _______________________ Date: ___________________

================================================================================
Generated by Audrin Fire Compliance Engine • Emergency Tel: 071 415 6665
================================================================================`;
}

/**
 * Downloads the remedial work order document as a formatted text file
 */
export function downloadRemedialWorkOrderFile(task: RemedialActionTask) {
  const content = generateRemedialWorkOrderText(task);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Audrin_WorkOrder_${task.referenceCode}_${task.siteName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
