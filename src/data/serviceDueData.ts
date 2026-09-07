import {
  SANS10139IntervalKey,
  SANS10139RequirementDetail,
  ClientSiteMaintenanceProfile,
  SiteMaintenanceInterval
} from '../types/serviceDue';

// Master Statutory Definitions for SANS 10139:2012
export const SANS_10139_REQUIREMENT_NOTES: Record<SANS10139IntervalKey, SANS10139RequirementDetail> = {
  weekly: {
    clause: 'SANS 10139:2012 Clause 25.2',
    clauseTitle: 'Routine Weekly Sounder & Call Point Test',
    cycleDays: 7,
    frequencyLabel: 'Weekly (Every 7 Days)',
    statutoryObjective: 'Verify audible alarm transmission, panel signal reception, and manual call point operation without causing unnecessary municipal brigade call-out.',
    mandatoryScope: [
      'Operate at least one manual call point (or smoke detector) in a rotational sequence so all points are tested across a 13-week cycle',
      'Confirm sounders and strobes activate across all designated alarm zones within 3 seconds of trigger',
      'Verify the Control & Indicating Equipment (CIE) accurately displays the correct zone text and address descriptor',
      'Check system reset response and re-engagement of normal standby mode',
      'Endorse physical on-site SANS 10139 fire alarm logbook with date, time, trigger device ID, and operator signature'
    ],
    audibilityVerification: 'Audible across all occupied zones; distinctive fire alarm sweep tone verified',
    requiredSaqccLevel: 'Designated Premises Responsible Person / SAQCC Level 1 Cabler',
    statutoryConsequence: 'Failure to document weekly testing is cited as non-compliance during municipal fire brigade inspections and compromises insurance validation.',
    documentationMandate: 'SANS 10139 physical logbook entry within 15 minutes of test execution'
  },
  monthly: {
    clause: 'SANS 10139:2012 Clause 25.2.2',
    clauseTitle: 'Monthly Fail-Safe, Telemetry & Standby Power Check',
    cycleDays: 30,
    frequencyLabel: 'Monthly (Every 30 Days)',
    statutoryObjective: 'Confirm emergency standby power transitions, automatic dialer / telemetric link reliability, and peripheral fail-safe interlocks.',
    mandatoryScope: [
      'Simulate 230V AC mains failure to verify seamless switchover to secondary DC battery standby without error',
      'Test telemetric signal link to remote monitoring centre / off-site emergency control room',
      'Verify automatic start signal to emergency standby diesel generator where applicable',
      'Inspect CIE optical indicators, LCD display contrast, internal printer paper supply, and LED test routines',
      'Check structural cleanliness of panel enclosure, heat sink vents, and auxiliary power supplies'
    ],
    batteryAutonomyCriteria: 'Terminal float voltage stable at 27.2V - 27.6V DC across 24V series pair',
    requiredSaqccLevel: 'Designated Responsible Person or SAQCC Level 2 Fire Alarm Installer',
    statutoryConsequence: 'Undetected battery charger failure during power outages leads to catastrophic system shutdown during Eskom loadshedding or grid loss.',
    documentationMandate: 'Monthly telemetry transmission record and auxiliary generator log'
  },
  quarterly: {
    clause: 'SANS 10139:2012 Clause 25.3',
    clauseTitle: 'Quarterly Periodic Inspection & Sampling Audit',
    cycleDays: 90,
    frequencyLabel: 'Quarterly (Every 3 Months)',
    statutoryObjective: 'Mandatory technical servicing by a qualified SAQCC Fire Technician to evaluate system integrity, device sampling, and physical building modifications.',
    mandatoryScope: [
      'Inspect physical logbook and investigate all recorded fault events or false alarm dispatches',
      'Electrically and mechanically test minimum 25% of all installed point smoke/heat detectors and manual call points',
      'Measure battery open-circuit terminal voltage and internal cell impedance using calibrated battery conductance tester',
      'Verify life-safety interface trips: magnetic fire door releases (SANS 1253), HVAC airflow dampers, and lift grounding relays',
      'Inspect building alterations, partitions, and mezzanine additions to verify minimum 500mm detector clearance is maintained'
    ],
    audibilityVerification: 'Spot-check sounder audibility in high-noise plant areas (minimum 65 dB(A))',
    batteryAutonomyCriteria: 'Load test drop must not exceed 1.8V under simulated 15-minute alarm load',
    causeAndEffectInterlocks: 'Verify HVAC trip relay and magnetic fire door fail-safe release within 2.5s',
    requiredSaqccLevel: 'Registered SAQCC Fire Level 3 Servicing Technician / Commissioner',
    statutoryConsequence: 'Mandatory statutory audit. Missing quarterly servicing voids manufacturer warranties and triggers building compliance non-conformance notices.',
    documentationMandate: 'SAQCC SANS 10139 Quarterly Service Certificate and Certificate of Inspection'
  },
  biannual: {
    clause: 'SANS 10139:2012 Clause 25.4',
    clauseTitle: 'Bi-Annual Periodic Inspection & Sensitivity Validation',
    cycleDays: 180,
    frequencyLabel: 'Bi-Annual (Every 6 Months)',
    statutoryObjective: 'Cumulative 50% device testing, optical chamber drift analysis, and aspirating smoke detection pipeline calibration.',
    mandatoryScope: [
      'Test cumulative 50% minimum of all installed detection devices across all floor zones',
      'Query CIE for optical chamber analogue drift values; schedule cleaning for detectors nearing 80% obscuration limit',
      'Perform laser aerosol particle count calibration and transport time testing on all VESDA / ASD aspirating pipelines',
      'Inspect fire-resistant cable supports (PH30 / PH120) in service shafts for compliance with SANS 10139 fixing spacing (≤300mm)',
      'Inspect and clean all optical beam detector lenses; test signal obscuration trip threshold'
    ],
    audibilityVerification: 'Sound pressure survey across 50% of tenant zones (≥65 dB(A))',
    batteryAutonomyCriteria: 'Conductance impedance test; replace any cell with >25% internal resistance rise',
    causeAndEffectInterlocks: 'Full functional trip of smoke ventilation dampers and gas suppression interlocks',
    requiredSaqccLevel: 'Registered SAQCC Fire Level 3 Servicing Specialist',
    statutoryConsequence: 'High-risk commercial and industrial facilities require mandatory bi-annual certificate for occupational health & safety compliance.',
    documentationMandate: 'SANS 10139 Bi-Annual Inspection Report & Sensitivity Calibration Log'
  },
  annual: {
    clause: 'SANS 10139:2012 Clause 25.5',
    clauseTitle: 'Annual Comprehensive Servicing & Statutory COC Endorsement',
    cycleDays: 365,
    frequencyLabel: 'Annual (Every 12 Months)',
    statutoryObjective: 'Exhaustive 100% device point-to-point test, full battery autonomy discharge, decibel audibility survey, and municipal COC recertification.',
    mandatoryScope: [
      '100% full point-to-point operational test of all installed smoke detectors, thermal sensors, manual call points, and beacons',
      'Full 24-hour battery standby load test followed immediately by 30-minute full evacuation alarm discharge load test',
      'Acoustic sound pressure level survey using calibrated Type 1 / Class 1 Sound Level Meter: ≥65 dB(A) or +5 dB(A) above ambient',
      'Acoustic sound pressure in sleeping accommodations (hotels, hospitals, student residences): ≥75 dB(A) at bedhead with doors shut',
      'Exhaustive Cause & Effect Matrix test: smoke dampers, stairwell pressurisation fans, access control fail-safe unlatching, lift recall',
      'Review false alarm rate: must not exceed 1 false alarm per 25 detectors per annum as mandated by SANS 10139 Clause 28'
    ],
    audibilityVerification: 'Formal decibel acoustic survey certificate (Type 1 SLM calibrated to ISO 17025)',
    batteryAutonomyCriteria: '24 Hours Standby + 30 Minutes Alarm Load Autonomy verified (SANS 10139 Clause 13.2)',
    causeAndEffectInterlocks: '100% Cause-and-Effect Matrix verification including multi-agency interlocks',
    requiredSaqccLevel: 'Registered SAQCC Fire Level 4 Designer / Master Commissioner (Pr.Eng / ECSA QA)',
    statutoryConsequence: 'Statutory prerequisite for municipal Fire Department Occupancy Certification and Annual Building Insurance Cover under SANS 10400-T.',
    documentationMandate: 'Official SANS 10139 Clause 24 Statutory Certificate of Compliance (COC) & Handover Dossier'
  },
  five_year: {
    clause: 'SANS 10139:2012 Clause 25.6',
    clauseTitle: '5-Year Extended Overhaul & Sensor Recalibration',
    cycleDays: 1825,
    frequencyLabel: '5-Year Overhaul (Every 60 Months)',
    statutoryObjective: 'Major lifecycle overhaul, mandatory backup battery bank replacement, wiring insulation resistance testing, and sensor refurbishment.',
    mandatoryScope: [
      'Mandatory decommissioning and replacement of all secondary sealed lead-acid (VRLA) batteries (5-year design life expiration)',
      'Factory recalibration or replacement of optical and ionisation smoke detector heads exceeding 5 years in service',
      'Comprehensive 500V DC insulation resistance testing between conductors and between each conductor and earth (≥2.0 MΩ minimum)',
      'Total loop cable resistance and capacitance audit to ensure addressable communication waveform margins are preserved',
      'Physical inspection of all concealed cable risers, ceiling void containment, and fire-stopping penetration seals'
    ],
    batteryAutonomyCriteria: 'Brand new certified 12V VRLA battery replacement with date code stamping',
    requiredSaqccLevel: 'Registered SAQCC Fire Level 4 Designer / Master Engineer',
    statutoryConsequence: 'Degraded detectors past 5-year life develop radioisotope decay or photo-chamber optical drift, causing catastrophic false alarm storms or failure to trip.',
    documentationMandate: '5-Year Major Overhaul Certificate, Battery Safe-Disposal Certificate & Insulation Test Sheet'
  }
};

// Base date for September 2026 application timeframe
const BASE_DATE_STR = '2026-09-04';

// Helper to compute days remaining from 2026-09-04
function getDaysDiff(targetDateStr: string): number {
  const base = new Date(2026, 8, 4).getTime(); // Sep 4, 2026
  const target = new Date(targetDateStr).getTime();
  const diffTime = target - base;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function getUrgencyStatus(daysRemaining: number): 'overdue' | 'due_soon' | 'scheduled' | 'compliant' {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 14) return 'due_soon';
  if (daysRemaining <= 45) return 'scheduled';
  return 'compliant';
}

function createInterval(
  siteId: string,
  key: SANS10139IntervalKey,
  lastDate: string,
  nextDate: string,
  techName: string,
  saqccNo: string,
  techPhone: string,
  certNo?: string
): SiteMaintenanceInterval {
  const req = SANS_10139_REQUIREMENT_NOTES[key];
  const daysRemaining = getDaysDiff(nextDate);
  const status = getUrgencyStatus(daysRemaining);
  const cycleDays = req.cycleDays;
  const elapsedDays = Math.max(0, cycleDays - daysRemaining);
  const cycleElapsedPercent = Math.min(100, Math.max(0, Math.round((elapsedDays / cycleDays) * 100)));

  return {
    id: `${siteId}-${key}`,
    siteId,
    intervalKey: key,
    label: req.clauseTitle,
    standardClause: req.clause,
    cycleDays,
    lastCompletedDate: lastDate,
    nextDueDate: nextDate,
    daysRemaining,
    status,
    cycleElapsedPercent,
    requirementDetail: req,
    assignedTechnician: {
      name: techName,
      saqccNumber: saqccNo,
      role: req.requiredSaqccLevel,
      phone: techPhone
    },
    lastCertificateNumber: certNo
  };
}

// 8 Comprehensive Client Sites covering South Africa's statutory installations
export const CLIENT_SITE_MAINTENANCE_PROFILES: ClientSiteMaintenanceProfile[] = [
  {
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    shortName: 'Tshwane Logistics Park',
    clientOrganisation: 'Tshwane Logistics Park (Pty) Ltd',
    address: '14 Industrial Parkway, Pretoria West',
    city: 'Pretoria West',
    coordinates: { lat: -25.7535, lng: 28.1472 },
    systemCategory: 'Category P1 (Total Property Protection)',
    panelModel: 'Advanced Electronics MXPro 5 (4 Loops, 16 Zones)',
    loopCount: 4,
    deviceCount: 284,
    contactPerson: 'Kobus van der Merwe (Ops Director)',
    contactPhone: '082 555 1982',
    overallComplianceScore: 88,
    earliestDueDays: 4,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-01', 'weekly', '2026-08-28', '2026-09-04', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0828'),
      monthly: createInterval('site-01', 'monthly', '2026-08-15', '2026-09-15', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'MON-2026-0815'),
      quarterly: createInterval('site-01', 'quarterly', '2026-06-08', '2026-09-08', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'SANS-QRT-2026-0608'),
      biannual: createInterval('site-01', 'biannual', '2026-04-12', '2026-10-12', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-BAN-2026-0412'),
      annual: createInterval('site-01', 'annual', '2025-11-20', '2026-11-20', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1120'),
      five_year: createInterval('site-01', 'five_year', '2023-05-10', '2028-05-10', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2023-0510')
    }
  },
  {
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    shortName: 'Pretoria Medipark Suites',
    clientOrganisation: 'Pretoria Medipark Suites (Pty) Ltd',
    address: '88 Francis Baard Street, Pretoria Central',
    city: 'Pretoria Central',
    coordinates: { lat: -25.7483, lng: 28.1925 },
    systemCategory: 'Category L1 (Total Life Safety Protection)',
    panelModel: 'Ziton ZP3 Addressable (2 Loops, 8 Zones)',
    loopCount: 2,
    deviceCount: 146,
    contactPerson: 'Dr. Sarah Ndlovu (Clinical Super)',
    contactPhone: '012 322 8841',
    overallComplianceScore: 74,
    earliestDueDays: -2, // Overdue emergency attendance
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-02', 'weekly', '2026-08-25', '2026-09-01', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'WKT-2026-0825'),
      monthly: createInterval('site-02', 'monthly', '2026-08-02', '2026-09-02', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'MON-2026-0802'),
      quarterly: createInterval('site-02', 'quarterly', '2026-06-20', '2026-09-20', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'SANS-QRT-2026-0620'),
      biannual: createInterval('site-02', 'biannual', '2026-03-15', '2026-09-15', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-BAN-2026-0315'),
      annual: createInterval('site-02', 'annual', '2025-10-18', '2026-10-18', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1018'),
      five_year: createInterval('site-02', 'five_year', '2022-09-15', '2027-09-15', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2022-0915')
    }
  },
  {
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    shortName: 'Menlyn Corporate Properties',
    clientOrganisation: 'Menlyn Corporate Properties (Pty) Ltd',
    address: '102 Frikkie de Beer Street, Menlyn, Pretoria East',
    city: 'Pretoria East',
    coordinates: { lat: -25.7865, lng: 28.2758 },
    systemCategory: 'Category L1 (Total Life Safety Protection)',
    panelModel: 'Honeywell Morley-IAS ZX5e (5 Loops, 32 Zones)',
    loopCount: 5,
    deviceCount: 412,
    contactPerson: 'Craig Henderson (FM Lead)',
    contactPhone: '083 419 7720',
    overallComplianceScore: 92,
    earliestDueDays: 11,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-03', 'weekly', '2026-08-30', '2026-09-06', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0830'),
      monthly: createInterval('site-03', 'monthly', '2026-08-10', '2026-09-10', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'MON-2026-0810'),
      quarterly: createInterval('site-03', 'quarterly', '2026-06-15', '2026-09-15', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-QRT-2026-0615'),
      biannual: createInterval('site-03', 'biannual', '2026-03-15', '2026-09-15', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-BAN-2026-0315'),
      annual: createInterval('site-03', 'annual', '2025-09-15', '2026-09-15', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'COC-SANS-2025-0915'),
      five_year: createInterval('site-03', 'five_year', '2024-02-10', '2029-02-10', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2024-0210')
    }
  },
  {
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    shortName: 'Innovatech Holdings',
    clientOrganisation: 'Innovatech Holdings Ltd',
    address: '45 Jean Avenue, Centurion',
    city: 'Centurion',
    coordinates: { lat: -25.8562, lng: 28.1973 },
    systemCategory: 'Category L2 / P1 Combined',
    panelModel: 'Kentec Taktis Addressable Network (8 Loops)',
    loopCount: 8,
    deviceCount: 520,
    contactPerson: 'Dr. Willem Prinsloo (Lab Ops)',
    contactPhone: '082 991 3412',
    overallComplianceScore: 95,
    earliestDueDays: 18,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-04', 'weekly', '2026-09-02', '2026-09-09', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0902'),
      monthly: createInterval('site-04', 'monthly', '2026-08-20', '2026-09-20', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'MON-2026-0820'),
      quarterly: createInterval('site-04', 'quarterly', '2026-06-22', '2026-09-22', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'SANS-QRT-2026-0622'),
      biannual: createInterval('site-04', 'biannual', '2026-03-22', '2026-09-22', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'SANS-BAN-2026-0322'),
      annual: createInterval('site-04', 'annual', '2025-12-10', '2026-12-10', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1210'),
      five_year: createInterval('site-04', 'five_year', '2023-11-15', '2028-11-15', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2023-1115')
    }
  },
  {
    siteId: 'site-05',
    siteName: 'Silverton Industrial Assembly Facility',
    shortName: 'Gauteng Precision Engineering',
    clientOrganisation: 'Gauteng Precision Engineering (Pty) Ltd',
    address: '12 Derdepoort Road, Silverton, Pretoria East',
    city: 'Pretoria East',
    coordinates: { lat: -25.7289, lng: 28.2985 },
    systemCategory: 'Category M / L3 Proposed',
    panelModel: 'Conventional 8-Zone Panel (Legacy Migration)',
    loopCount: 2,
    deviceCount: 96,
    contactPerson: 'Riaan Botha (Plant Safety)',
    contactPhone: '012 804 3390',
    overallComplianceScore: 68,
    earliestDueDays: 24,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-05', 'weekly', '2026-08-26', '2026-09-02', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0826'),
      monthly: createInterval('site-05', 'monthly', '2026-08-05', '2026-09-05', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'MON-2026-0805'),
      quarterly: createInterval('site-05', 'quarterly', '2026-06-28', '2026-09-28', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'SANS-QRT-2026-0628'),
      biannual: createInterval('site-05', 'biannual', '2026-03-28', '2026-09-28', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'SANS-BAN-2026-0328'),
      annual: createInterval('site-05', 'annual', '2025-10-05', '2026-10-05', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1005'),
      five_year: createInterval('site-05', 'five_year', '2021-08-10', '2026-08-10', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2021-0810')
    }
  },
  {
    siteId: 'site-06',
    siteName: 'Hatfield Student Residences (Block C & D)',
    shortName: 'Campus Accommodation Trust',
    clientOrganisation: 'Campus Accommodation Trust (Pty) Ltd',
    address: '1102 Burnett Street, Hatfield, Pretoria',
    city: 'Pretoria East',
    coordinates: { lat: -25.7511, lng: 28.2378 },
    systemCategory: 'Category L1 (Sleeping Accommodation - High Risk)',
    panelModel: 'Bosch FPA-5000 Modular (6 Loops, 24 Zones)',
    loopCount: 6,
    deviceCount: 388,
    contactPerson: 'Thandiwe Sithole (Head of Housing)',
    contactPhone: '012 362 7700',
    overallComplianceScore: 91,
    earliestDueDays: 3,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-06', 'weekly', '2026-08-31', '2026-09-07', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0831'),
      monthly: createInterval('site-06', 'monthly', '2026-08-18', '2026-09-18', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'MON-2026-0818'),
      quarterly: createInterval('site-06', 'quarterly', '2026-07-02', '2026-10-02', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-QRT-2026-0702'),
      biannual: createInterval('site-06', 'biannual', '2026-04-10', '2026-10-10', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-BAN-2026-0410'),
      annual: createInterval('site-06', 'annual', '2025-10-25', '2026-10-25', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1025'),
      five_year: createInterval('site-06', 'five_year', '2023-01-20', '2028-01-20', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2023-0120')
    }
  },
  {
    siteId: 'site-07',
    siteName: 'Rosslyn Automotive Logistics Complex',
    shortName: 'AutoTrans Southern Africa',
    clientOrganisation: 'AutoTrans Southern Africa (Pty) Ltd',
    address: '8 Piet Rautenbach Street, Rosslyn Industrial',
    city: 'Rosslyn',
    coordinates: { lat: -25.6263, lng: 28.0921 },
    systemCategory: 'Category P1 / L4 Interface',
    panelModel: 'Ziton ZP2 Addressable (4 Loops, 16 Zones)',
    loopCount: 4,
    deviceCount: 310,
    contactPerson: 'Danie Kruger (Safety Superintendent)',
    contactPhone: '083 661 2289',
    overallComplianceScore: 82,
    earliestDueDays: 7,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-07', 'weekly', '2026-08-29', '2026-09-05', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'WKT-2026-0829'),
      monthly: createInterval('site-07', 'monthly', '2026-08-11', '2026-09-11', 'Ayanda Khumalo', 'SAQCC #60412', '073 665 1198', 'MON-2026-0811'),
      quarterly: createInterval('site-07', 'quarterly', '2026-06-18', '2026-09-18', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'SANS-QRT-2026-0618'),
      biannual: createInterval('site-07', 'biannual', '2026-03-30', '2026-09-30', 'Thabo Mokoena', 'SAQCC #51902', '082 441 9023', 'SANS-BAN-2026-0330'),
      annual: createInterval('site-07', 'annual', '2025-11-04', '2026-11-04', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1104'),
      five_year: createInterval('site-07', 'five_year', '2022-04-18', '2027-04-18', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2022-0418')
    }
  },
  {
    siteId: 'site-08',
    siteName: 'Sandton Financial Gateway Office Park',
    shortName: 'Vanguard Asset Management',
    clientOrganisation: 'Vanguard Asset Management SA',
    address: '150 Rivonia Road, Sandown, Sandton',
    city: 'Sandton',
    coordinates: { lat: -26.1042, lng: 28.0583 },
    systemCategory: 'Category L1 (Total Life Safety)',
    panelModel: 'Siemens Cerberus PRO (10 Loops, 40 Zones)',
    loopCount: 10,
    deviceCount: 680,
    contactPerson: 'Nomvula Mazibuko (Operations Head)',
    contactPhone: '011 883 4000',
    overallComplianceScore: 96,
    earliestDueDays: 21,
    mostUrgentInterval: null as unknown as SiteMaintenanceInterval,
    intervals: {
      weekly: createInterval('site-08', 'weekly', '2026-09-01', '2026-09-08', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'WKT-2026-0901'),
      monthly: createInterval('site-08', 'monthly', '2026-08-25', '2026-09-25', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'MON-2026-0825'),
      quarterly: createInterval('site-08', 'quarterly', '2026-06-25', '2026-09-25', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'SANS-QRT-2026-0625'),
      biannual: createInterval('site-08', 'biannual', '2026-03-25', '2026-09-25', 'Hendrik Venter', 'SAQCC #39084', '079 812 3456', 'SANS-BAN-2026-0325'),
      annual: createInterval('site-08', 'annual', '2025-12-15', '2026-12-15', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'COC-SANS-2025-1215'),
      five_year: createInterval('site-08', 'five_year', '2024-06-01', '2029-06-01', 'Bethuel Moukangwe', 'SAQCC #48291', '071 415 6665', 'OVR-2024-0601')
    }
  }
];

// Populate most urgent interval for each site
CLIENT_SITE_MAINTENANCE_PROFILES.forEach((site) => {
  const allIntervals = Object.values(site.intervals);
  // Sort by days remaining ascending
  allIntervals.sort((a, b) => a.daysRemaining - b.daysRemaining);
  site.mostUrgentInterval = allIntervals[0];
  site.earliestDueDays = allIntervals[0].daysRemaining;
});
