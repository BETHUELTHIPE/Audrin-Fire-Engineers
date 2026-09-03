import { SANS10139InspectionType, InspectionStatus, TechnicianProfile } from '../types';
import { REGISTERED_TECHNICIANS } from './complianceCalendarEngine';

export interface TimelineMilestone {
  id: string;
  siteId: string;
  siteName: string;
  organisationName: string;
  streetAddress: string;
  city: string;
  systemCategory: string; // e.g. "Category P1", "Category L1"
  panelMakeModel: string;
  
  // Event Classification
  eventDate: string; // YYYY-MM-DD
  title: string;
  cycleType: 
    | 'weekly_user_test'
    | 'quarterly_servicing'
    | 'biannual_servicing'
    | 'annual_comprehensive'
    | 'five_year_overhaul'
    | 'commissioning_handover'
    | 'fault_remediation'
    | 'premises_survey';
  standardClause: string; // e.g. "SANS 10139:2012 Clause 25.3"
  isHistorical: boolean; // true = past completed cycle, false = upcoming deadline
  status: InspectionStatus; // 'completed' | 'scheduled' | 'due_soon' | 'overdue' | 'in_progress'

  // Testing Scope & Technical Outcomes
  testingScopeSummary: string;
  deviceTestedCount?: number;
  totalSystemDeviceCount?: number;
  deviceSamplingPercentage?: number; // e.g. 25%, 50%, 75%, 100%
  testedZonesOrLoops?: string;
  
  // Technical Measurements & Evidence
  batteryStandbyVoltage?: string; // e.g. "27.4V Float / 24.2V Discharge"
  sounderDecibelReading?: string; // e.g. "82 dBA at 3m"
  insulationResistance?: string; // e.g. "18.4 MΩ"
  logbookSigned: boolean;
  activeFaultsPresent: number;
  
  // Personnel & Certification
  assignedTechnician: TechnicianProfile;
  certificateIssued?: boolean;
  certificateNumber?: string;
  ecsaEngineerEndorsement?: string; // e.g. "Pr.Eng #201490219"
  notes?: string;
  findingsSummary?: string;
  remedialActions?: string[];
  daysOffset?: number; // calculated relative to 2026-09-02
}

export interface SiteComplianceProfile {
  siteId: string;
  siteName: string;
  organisationName: string;
  streetAddress: string;
  city: string;
  systemCategory: string; // e.g., "Category L1 - Total Life Safety"
  panelMakeModel: string;
  installedLoopsZones: string;
  totalDetectorsCount: number;
  totalCallPointsCount: number;
  totalSoundersCount: number;
  commissioningDate: string;
  lastAnnualCOCDate: string;
  lastAnnualCOCNumber: string;
  nextAnnualCOCDueDate: string;
  nextPeriodicDueDate: string;
  complianceRatingScore: number; // 0 - 100
  quarterlyProgressCurrentYear: {
    q1Status: 'completed' | 'scheduled' | 'pending';
    q1TestedPercent: number;
    q2Status: 'completed' | 'scheduled' | 'pending';
    q2TestedPercent: number;
    q3Status: 'completed' | 'scheduled' | 'pending';
    q3TestedPercent: number;
    q4Status: 'completed' | 'scheduled' | 'pending';
    q4TestedPercent: number;
    cumulativeCoverage: number; // e.g., 75%
  };
  fiveYearComponentHealth: {
    batteryBankInstalledDate: string;
    batteryBankReplacementDueDate: string;
    batteryHealthPercent: number;
    opticalChamberRecalibrationDueDate: string;
    cablingMeggerTestDueDate: string;
  };
}

// -------------------------------------------------------------------------------------------------
// PRE-POPULATED SITES COMPLIANCE PROFILES
// -------------------------------------------------------------------------------------------------

export const SITE_COMPLIANCE_PROFILES: SiteComplianceProfile[] = [
  {
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1 - Total Property Protection',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    installedLoopsZones: '4 Loops, 16 Zones',
    totalDetectorsCount: 184,
    totalCallPointsCount: 28,
    totalSoundersCount: 22,
    commissioningDate: '2023-11-15',
    lastAnnualCOCDate: '2025-11-14',
    lastAnnualCOCNumber: 'SANS-COC-2025-084',
    nextAnnualCOCDueDate: '2026-11-14',
    nextPeriodicDueDate: '2026-09-08',
    complianceRatingScore: 98,
    quarterlyProgressCurrentYear: {
      q1Status: 'completed',
      q1TestedPercent: 25,
      q2Status: 'completed',
      q2TestedPercent: 25,
      q3Status: 'scheduled',
      q3TestedPercent: 25,
      q4Status: 'pending',
      q4TestedPercent: 25,
      cumulativeCoverage: 50
    },
    fiveYearComponentHealth: {
      batteryBankInstalledDate: '2023-11-15',
      batteryBankReplacementDueDate: '2027-11-15',
      batteryHealthPercent: 92,
      opticalChamberRecalibrationDueDate: '2028-11-15',
      cablingMeggerTestDueDate: '2028-11-15'
    }
  },
  {
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    systemCategory: 'Category L1 - Total Life Safety Protection',
    panelMakeModel: 'Ziton ZP3 Addressable',
    installedLoopsZones: '2 Loops, 12 Zones',
    totalDetectorsCount: 96,
    totalCallPointsCount: 16,
    totalSoundersCount: 14,
    commissioningDate: '2024-01-20',
    lastAnnualCOCDate: '2026-01-20',
    lastAnnualCOCNumber: 'SANS-COC-2026-009',
    nextAnnualCOCDueDate: '2027-01-20',
    nextPeriodicDueDate: '2026-09-02',
    complianceRatingScore: 92,
    quarterlyProgressCurrentYear: {
      q1Status: 'completed',
      q1TestedPercent: 25,
      q2Status: 'completed',
      q2TestedPercent: 25,
      q3Status: 'scheduled',
      q3TestedPercent: 25,
      q4Status: 'pending',
      q4TestedPercent: 25,
      cumulativeCoverage: 50
    },
    fiveYearComponentHealth: {
      batteryBankInstalledDate: '2024-01-20',
      batteryBankReplacementDueDate: '2028-01-20',
      batteryHealthPercent: 88,
      opticalChamberRecalibrationDueDate: '2029-01-20',
      cablingMeggerTestDueDate: '2029-01-20'
    }
  },
  {
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1 - Total Life Safety Protection',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    installedLoopsZones: '5 Loops, 32 Zones',
    totalDetectorsCount: 340,
    totalCallPointsCount: 46,
    totalSoundersCount: 38,
    commissioningDate: '2022-09-18',
    lastAnnualCOCDate: '2025-09-18',
    lastAnnualCOCNumber: 'SANS-COC-2025-042',
    nextAnnualCOCDueDate: '2026-09-15',
    nextPeriodicDueDate: '2026-09-15',
    complianceRatingScore: 94,
    quarterlyProgressCurrentYear: {
      q1Status: 'completed',
      q1TestedPercent: 25,
      q2Status: 'completed',
      q2TestedPercent: 25,
      q3Status: 'completed',
      q3TestedPercent: 25,
      q4Status: 'scheduled',
      q4TestedPercent: 25,
      cumulativeCoverage: 75
    },
    fiveYearComponentHealth: {
      batteryBankInstalledDate: '2022-09-18',
      batteryBankReplacementDueDate: '2026-10-30',
      batteryHealthPercent: 78,
      opticalChamberRecalibrationDueDate: '2027-09-18',
      cablingMeggerTestDueDate: '2027-09-18'
    }
  },
  {
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    organisationName: 'Innovatech Holdings',
    streetAddress: '45 Jean Avenue',
    city: 'Centurion',
    systemCategory: 'Category L2 / P1 Combined',
    panelMakeModel: 'Kentec Taktis Addressable Network',
    installedLoopsZones: '8 Loops, 48 Zones',
    totalDetectorsCount: 410,
    totalCallPointsCount: 52,
    totalSoundersCount: 44,
    commissioningDate: '2024-03-25',
    lastAnnualCOCDate: '2026-03-25',
    lastAnnualCOCNumber: 'SANS-COC-2026-031',
    nextAnnualCOCDueDate: '2027-03-25',
    nextPeriodicDueDate: '2026-09-22',
    complianceRatingScore: 96,
    quarterlyProgressCurrentYear: {
      q1Status: 'completed',
      q1TestedPercent: 25,
      q2Status: 'completed',
      q2TestedPercent: 25,
      q3Status: 'scheduled',
      q3TestedPercent: 25,
      q4Status: 'pending',
      q4TestedPercent: 25,
      cumulativeCoverage: 50
    },
    fiveYearComponentHealth: {
      batteryBankInstalledDate: '2024-03-25',
      batteryBankReplacementDueDate: '2028-03-25',
      batteryHealthPercent: 95,
      opticalChamberRecalibrationDueDate: '2029-03-25',
      cablingMeggerTestDueDate: '2029-03-25'
    }
  },
  {
    siteId: 'site-05',
    siteName: 'Silverton Industrial Assembly Facility',
    organisationName: 'Gauteng Precision Engineering',
    streetAddress: '12 Derdepoort Road',
    city: 'Pretoria East',
    systemCategory: 'Category M / L3 Proposed (Legacy Migration)',
    panelMakeModel: 'Conventional 8-Zone Panel',
    installedLoopsZones: '8 Conventional Zones',
    totalDetectorsCount: 64,
    totalCallPointsCount: 12,
    totalSoundersCount: 8,
    commissioningDate: '2019-06-10',
    lastAnnualCOCDate: '2025-08-10',
    lastAnnualCOCNumber: 'SANS-COC-2025-LEGACY-11',
    nextAnnualCOCDueDate: '2026-10-15',
    nextPeriodicDueDate: '2026-09-28',
    complianceRatingScore: 84,
    quarterlyProgressCurrentYear: {
      q1Status: 'completed',
      q1TestedPercent: 25,
      q2Status: 'completed',
      q2TestedPercent: 25,
      q3Status: 'scheduled',
      q3TestedPercent: 25,
      q4Status: 'pending',
      q4TestedPercent: 25,
      cumulativeCoverage: 50
    },
    fiveYearComponentHealth: {
      batteryBankInstalledDate: '2021-08-10',
      batteryBankReplacementDueDate: '2025-08-10',
      batteryHealthPercent: 62,
      opticalChamberRecalibrationDueDate: '2024-06-10',
      cablingMeggerTestDueDate: '2024-06-10'
    }
  }
];

// -------------------------------------------------------------------------------------------------
// HISTORICAL & UPCOMING COMPLIANCE TIMELINE MILESTONES
// Reference Benchmark Date: 2026-09-02 (Present)
// -------------------------------------------------------------------------------------------------

export const INITIAL_TIMELINE_MILESTONES: TimelineMilestone[] = [
  // --- SITE 01: Warehouse Distribution Hub 3 ---
  {
    id: 'ms-01-01',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2025-11-14',
    title: 'Annual Comprehensive Re-Certification & SANS 10139 COC Issuance',
    cycleType: 'annual_comprehensive',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 10400-T',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Full 100% device point test of all 184 smoke detectors, 28 MCPs, 22 sounders, and 30-min standby discharge test under full alarm load.',
    deviceTestedCount: 212,
    totalSystemDeviceCount: 212,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1 - 4 (All Zones)',
    batteryStandbyVoltage: '27.4V Float / 24.3V Under Alarm Load (Pass)',
    sounderDecibelReading: '84.2 dBA Average (Exceeds 65 dBA SANS Requirement)',
    insulationResistance: '19.8 MΩ across Loop 1-4 shielding',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    certificateIssued: true,
    certificateNumber: 'SANS-COC-2025-084',
    ecsaEngineerEndorsement: 'Bethuel Moukangwe (ECSA Pr.Eng #201490219)',
    findingsSummary: 'System passed all statutory acceptance tests with zero critical defects. Fire damper interlocks responded in <1.8s.',
    daysOffset: -292
  },
  {
    id: 'ms-01-02',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2026-02-18',
    title: 'Q1 2026 Periodic Servicing (25% Device Sampling Rotation)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Quarterly routine servicing of Loop 1 (High-Bay Mezzanine & South Logistics Bay). 46 optical smoke sensors and 7 call points tested.',
    deviceTestedCount: 53,
    totalSystemDeviceCount: 212,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loop 1 (Zones 1-4)',
    batteryStandbyVoltage: '27.2V Float / 24.6V Alarm Load',
    sounderDecibelReading: '83.5 dBA in Mezzanine Area',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    certificateIssued: true,
    certificateNumber: 'SANS-Q1-2026-018',
    findingsSummary: 'Loop 1 devices verified within calibrated threshold. On-site logbook counters updated.',
    daysOffset: -196
  },
  {
    id: 'ms-01-03',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2026-05-20',
    title: 'Q2 2026 Periodic Servicing (50% Cumulative Device Rotation)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Quarterly servicing of Loop 2 (Loading Docks & Dispatch Bay). 46 sensors and 7 manual call points point-tested.',
    deviceTestedCount: 53,
    totalSystemDeviceCount: 212,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loop 2 (Zones 5-8)',
    batteryStandbyVoltage: '27.3V Float / 24.5V Alarm Load',
    sounderDecibelReading: '85.0 dBA in Dispatch Bay',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    certificateIssued: true,
    certificateNumber: 'SANS-Q2-2026-044',
    findingsSummary: 'Roller shutter door magnetic release triggered successfully during simulated alarm on Zone 6.',
    daysOffset: -105
  },
  {
    id: 'ms-01-04',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2026-08-25',
    title: 'Routine Weekly Sounder & Call Point Test (Responsible Person)',
    cycleType: 'weekly_user_test',
    standardClause: 'SANS 10139:2012 Clause 25.2',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Manual Call Point MCP-07 activated at Bay 4. Panel zone text confirmed and alarm audibility checked.',
    deviceTestedCount: 1,
    totalSystemDeviceCount: 212,
    testedZonesOrLoops: 'Zone 2 / MCP-07',
    sounderDecibelReading: '82 dBA verified',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[3],
    certificateIssued: true,
    certificateNumber: 'SANS-WKT-2026-0825',
    findingsSummary: 'Weekly logbook entry authenticated. Reset mechanism returned to normal operation.',
    daysOffset: -8
  },
  // Upcoming for Site 01
  {
    id: 'ms-01-05',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2026-09-08',
    title: 'Q3 2026 Periodic Servicing (75% Cumulative Device Rotation)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: 'Quarterly servicing of Loop 3 (Administrative Block & High-Risk Battery Charging Station). 46 detectors and 7 MCPs.',
    deviceTestedCount: 53,
    totalSystemDeviceCount: 212,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loop 3 (Zones 9-12)',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    notes: 'Access permits arranged with safety manager. Forklift charging zone isolation protocol approved.',
    daysOffset: 6
  },
  {
    id: 'ms-01-06',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2026-11-14',
    title: 'Annual Comprehensive Servicing & Statutory SANS 10139 COC Re-Issuance',
    cycleType: 'annual_comprehensive',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 10400-T',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: 'Full 100% loop audit (all 4 loops), 30-min full load battery test, acoustic sound level mapping, cause-and-effect matrix verification.',
    deviceTestedCount: 212,
    totalSystemDeviceCount: 212,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1-4 (All 16 Zones)',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    notes: 'Pr.Eng Lead Engineer statutory sign-off scheduled upon testing completion.',
    daysOffset: 73
  },
  {
    id: 'ms-01-07',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    organisationName: 'Tshwane Logistics Park',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    systemCategory: 'Category P1',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    eventDate: '2027-11-15',
    title: '4-Year Standby SLA Battery Bank Statutory Replacement & Load Certification',
    cycleType: 'five_year_overhaul',
    standardClause: 'SANS 10139:2012 Clause 25.5.3 (Battery Service Life Limit)',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: 'Decommissioning and environmentally compliant disposal of dual 12V 18Ah SLA battery set; replacement with factory new Yuasa fire-rated batteries.',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    notes: 'Part of 4-year statutory battery refresh cycle under standard service agreement.',
    daysOffset: 439
  },

  // --- SITE 02: Medical Suites Block B ---
  {
    id: 'ms-02-01',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    systemCategory: 'Category L1',
    panelMakeModel: 'Ziton ZP3 Addressable',
    eventDate: '2026-01-20',
    title: 'Annual Comprehensive Servicing & Healthcare Life Safety COC Audit',
    cycleType: 'annual_comprehensive',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 322 Healthcare Protocol',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Full 100% point test of all 96 clinical suite detectors, 16 MCPs, bedhead sounder audibility verification (minimum 75 dBA at pillow position).',
    deviceTestedCount: 112,
    totalSystemDeviceCount: 112,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1 - 2 (All Clinical Zones)',
    batteryStandbyVoltage: '27.6V Float / 24.4V Discharge',
    sounderDecibelReading: '76.8 dBA at bedheads (Passes 75 dBA Healthcare Mandate)',
    insulationResistance: '22.4 MΩ',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    certificateIssued: true,
    certificateNumber: 'SANS-COC-2026-009',
    ecsaEngineerEndorsement: 'Bethuel Moukangwe (ECSA Pr.Eng #201490219)',
    findingsSummary: 'Clean audit certificate issued for healthcare accreditation inspection.',
    daysOffset: -225
  },
  {
    id: 'ms-02-02',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    systemCategory: 'Category L1',
    panelMakeModel: 'Ziton ZP3 Addressable',
    eventDate: '2026-04-12',
    title: 'Q1 2026 Periodic Servicing (25% Clinical Zone Sampling)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Quarterly testing of Loop 1 Ground Floor consulting rooms and day clinic recovery suites.',
    deviceTestedCount: 28,
    totalSystemDeviceCount: 112,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loop 1 (Zones 1-3)',
    batteryStandbyVoltage: '27.4V Float / 24.5V Load',
    sounderDecibelReading: '78 dBA in Recovery Area',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    certificateIssued: true,
    certificateNumber: 'SANS-Q1-2026-039',
    findingsSummary: 'All tested optical smoke sensors verified within clean baseline sensitivity.',
    daysOffset: -143
  },
  {
    id: 'ms-02-03',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    systemCategory: 'Category L1',
    panelMakeModel: 'Ziton ZP3 Addressable',
    eventDate: '2026-09-02',
    title: 'Emergency Diagnostic Triage & Earth Fault Remediation',
    cycleType: 'fault_remediation',
    standardClause: 'SANS 10139:2012 Clause 26 (Fault Clearance)',
    isHistorical: false,
    status: 'in_progress',
    testingScopeSummary: 'Locate and clear positive/negative earth fault on Ziton Loop 2 above 2nd floor dental suite caused by water ingress.',
    testedZonesOrLoops: 'Loop 2 (Dental Suite Void)',
    logbookSigned: false,
    activeFaultsPresent: 1,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    notes: 'Urgent priority attendance to restore 100% life-safety fault-free monitoring status.',
    daysOffset: 0
  },
  {
    id: 'ms-02-04',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    organisationName: 'Pretoria Medipark Suites',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    systemCategory: 'Category L1',
    panelMakeModel: 'Ziton ZP3 Addressable',
    eventDate: '2026-10-14',
    title: 'Q3 2026 Periodic Servicing (75% Cumulative Device Rotation)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: 'Quarterly servicing of Loop 2 (Floors 2 & 3 Specialist Consultations). 28 detectors and 4 call points.',
    deviceTestedCount: 28,
    totalSystemDeviceCount: 112,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loop 2 (Zones 7-10)',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    daysOffset: 42
  },

  // --- SITE 03: Menlyn Innovation Tower ---
  {
    id: 'ms-03-01',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    eventDate: '2025-09-18',
    title: 'Annual Comprehensive Servicing & High-Rise SANS 10139 COC Re-Issuance',
    cycleType: 'annual_comprehensive',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 10400-T',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: '100% test of all 340 detectors, stairwell pressurisation fan interlocks, lift ground recall simulation, generator backup auto-start.',
    deviceTestedCount: 386,
    totalSystemDeviceCount: 386,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1-5 (32 Zones, 8 Floors)',
    batteryStandbyVoltage: '27.5V Float / 24.1V Discharge',
    sounderDecibelReading: '81.4 dBA throughout multi-tenant corridors',
    insulationResistance: '21.0 MΩ',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    certificateIssued: true,
    certificateNumber: 'SANS-COC-2025-042',
    ecsaEngineerEndorsement: 'Bethuel Moukangwe (ECSA Pr.Eng #201490219)',
    findingsSummary: 'High-rise phased evacuation sounders and visual beacon arrays verified across all floors.',
    daysOffset: -349
  },
  {
    id: 'ms-03-02',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    eventDate: '2026-06-18',
    title: 'Q3 2026 Periodic Servicing (75% Device Sampling Rotation)',
    cycleType: 'quarterly_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Quarterly servicing of Loop 4 & 5 (Floors 5 to 8 Corporate Suites). 85 optical smoke sensors and 11 manual call points point-tested.',
    deviceTestedCount: 96,
    totalSystemDeviceCount: 386,
    deviceSamplingPercentage: 25,
    testedZonesOrLoops: 'Loops 4-5 (Zones 20-32)',
    batteryStandbyVoltage: '27.1V Float / 24.0V Discharge',
    sounderDecibelReading: '82.0 dBA in 7th Floor Atrium',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    certificateIssued: true,
    certificateNumber: 'SANS-Q3-2026-071',
    findingsSummary: 'All atrium optical beam detectors checked for obscuration alignment. Logbook verified.',
    daysOffset: -76
  },
  {
    id: 'ms-03-03',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    eventDate: '2026-09-15',
    title: 'Annual Comprehensive Servicing & SANS 10139 / SANS 10400-T COC Renewal',
    cycleType: 'annual_comprehensive',
    standardClause: 'SANS 10139:2012 Clause 25.5 & SANS 10400-T (Annual Statutory Renewal)',
    isHistorical: false,
    status: 'due_soon',
    testingScopeSummary: 'Full 100% system audit across all 386 devices, full battery load discharge test, lift grounding, fire dampers, and sounder audibility mapping.',
    deviceTestedCount: 386,
    totalSystemDeviceCount: 386,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1-5 (All 32 Zones)',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[1],
    notes: 'Critical statutory deadline. Commercial lease compliance audit requirement.',
    daysOffset: 13
  },
  {
    id: 'ms-03-04',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    organisationName: 'Menlyn Corporate Properties',
    streetAddress: '102 Frikkie de Beer Street',
    city: 'Pretoria East',
    systemCategory: 'Category L1',
    panelMakeModel: 'Honeywell Morley-IAS ZX5e',
    eventDate: '2027-09-18',
    title: '5-Year Major Overhaul: Optical Chamber Recalibration & Cable Megger Re-Test',
    cycleType: 'five_year_overhaul',
    standardClause: 'SANS 10139:2012 Clause 25.5.3 (5-Year Sensor Recalibration & Integrity Audit)',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: '5-year manufacturer smoke chamber contamination audit, 500V insulation resistance testing of all riser cabling, and secondary power supply recertification.',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    notes: 'Scheduled for Year 5 statutory overhaul milestone.',
    daysOffset: 381
  },

  // --- SITE 04: Centurion Tech Research Centre ---
  {
    id: 'ms-04-01',
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    organisationName: 'Innovatech Holdings',
    streetAddress: '45 Jean Avenue',
    city: 'Centurion',
    systemCategory: 'Category L2 / P1 Combined',
    panelMakeModel: 'Kentec Taktis Addressable Network',
    eventDate: '2026-03-25',
    title: 'Commissioning & Comprehensive Handover SANS 10139 Certificate',
    cycleType: 'commissioning_handover',
    standardClause: 'SANS 10139:2012 Clause 23 & SANS 246 (Cleanroom / Server Protocol)',
    isHistorical: true,
    status: 'completed',
    testingScopeSummary: 'Initial acceptance testing for newly expanded R&D wing. 410 addressable devices and 4 VESDA LaserPlus aspirating smoke detection units.',
    deviceTestedCount: 462,
    totalSystemDeviceCount: 462,
    deviceSamplingPercentage: 100,
    testedZonesOrLoops: 'Loops 1-8 (All Zones)',
    batteryStandbyVoltage: '27.8V Float / 25.1V Load',
    sounderDecibelReading: '86.5 dBA in cleanroom and fabrication suites',
    insulationResistance: '35.0 MΩ (Halogen-free fire rated)',
    logbookSigned: true,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[2],
    certificateIssued: true,
    certificateNumber: 'SANS-COC-2026-031',
    ecsaEngineerEndorsement: 'Bethuel Moukangwe (ECSA Pr.Eng #201490219)',
    findingsSummary: 'Aspirating smoke detectors calibrated to Level 1 High Sensitivity (0.05% obs/m).',
    daysOffset: -161
  },
  {
    id: 'ms-04-02',
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    organisationName: 'Innovatech Holdings',
    streetAddress: '45 Jean Avenue',
    city: 'Centurion',
    systemCategory: 'Category L2 / P1 Combined',
    panelMakeModel: 'Kentec Taktis Addressable Network',
    eventDate: '2026-09-22',
    title: 'Bi-Annual Periodic SANS 10139 Inspection & VESDA Calibration Audit',
    cycleType: 'biannual_servicing',
    standardClause: 'SANS 10139:2012 Clause 25.4 & SANS 246',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: '50% device sampling test, laser particle count verification on VESDA pipelines, gaseous suppression interface interlock test.',
    deviceTestedCount: 231,
    totalSystemDeviceCount: 462,
    deviceSamplingPercentage: 50,
    testedZonesOrLoops: 'Loops 1-4 (Server & Cleanroom Wings)',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[2],
    notes: 'Cleanroom PPE required. Maintenance team will escort technician.',
    daysOffset: 20
  },

  // --- SITE 05: Silverton Industrial Assembly Facility ---
  {
    id: 'ms-05-01',
    siteId: 'site-05',
    siteName: 'Silverton Industrial Assembly Facility',
    organisationName: 'Gauteng Precision Engineering',
    streetAddress: '12 Derdepoort Road',
    city: 'Pretoria East',
    systemCategory: 'Category M / L3 Proposed',
    panelMakeModel: 'Conventional 8-Zone Panel',
    eventDate: '2026-09-28',
    title: 'Premises SANS 10139 System Category Survey & Addressable Migration Specification',
    cycleType: 'premises_survey',
    standardClause: 'SANS 10139:2012 Clause 5 & 6 (System Category Assessment)',
    isHistorical: false,
    status: 'scheduled',
    testingScopeSummary: 'Comprehensive engineering audit of legacy conventional zone wiring, ceiling void hazards, and design specification for modern addressable system migration.',
    deviceTestedCount: 64,
    totalSystemDeviceCount: 64,
    testedZonesOrLoops: 'All 8 Conventional Zones',
    logbookSigned: false,
    activeFaultsPresent: 0,
    assignedTechnician: REGISTERED_TECHNICIANS[0],
    notes: 'Client requested migration quote from conventional to addressable system.',
    daysOffset: 26
  }
];

// -------------------------------------------------------------------------------------------------
// UTILITY HELPERS
// -------------------------------------------------------------------------------------------------

export function getCycleTypeMeta(cycleType: TimelineMilestone['cycleType']): {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  iconType: string;
  colorHex: string;
} {
  switch (cycleType) {
    case 'annual_comprehensive':
      return {
        label: 'Annual Comprehensive Servicing & COC Audit (Clause 25.5)',
        shortLabel: 'Annual COC Audit',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-700',
        borderClass: 'border-red-300',
        iconType: 'award',
        colorHex: '#CC0000'
      };
    case 'quarterly_servicing':
      return {
        label: 'Quarterly Periodic Servicing (Clause 25.3)',
        shortLabel: 'Quarterly 25% Test',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        borderClass: 'border-blue-300',
        iconType: 'refresh-cw',
        colorHex: '#1E40AF'
      };
    case 'biannual_servicing':
      return {
        label: '6-Monthly Periodic Servicing (Clause 25.4)',
        shortLabel: '6-Monthly Servicing',
        badgeBg: 'bg-indigo-50',
        badgeText: 'text-indigo-700',
        borderClass: 'border-indigo-300',
        iconType: 'calendar',
        colorHex: '#4338CA'
      };
    case 'weekly_user_test':
      return {
        label: 'Weekly Routine User Test (Clause 25.2)',
        shortLabel: 'Weekly User Test',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        borderClass: 'border-emerald-300',
        iconType: 'check-circle-2',
        colorHex: '#047857'
      };
    case 'five_year_overhaul':
      return {
        label: '5-Year Statutory Overhaul & Component Renewal (Clause 25.5.3)',
        shortLabel: '5-Year Overhaul',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
        borderClass: 'border-purple-300',
        iconType: 'shield-alert',
        colorHex: '#7E22CE'
      };
    case 'commissioning_handover':
      return {
        label: 'Commissioning & Statutory Handover (Clause 23)',
        shortLabel: 'Commissioning COC',
        badgeBg: 'bg-cyan-50',
        badgeText: 'text-cyan-700',
        borderClass: 'border-cyan-300',
        iconType: 'file-check-2',
        colorHex: '#0891B2'
      };
    case 'fault_remediation':
      return {
        label: 'Emergency Diagnostic Triage & Fault Remediation (Clause 26)',
        shortLabel: 'Fault Remediation',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-800',
        borderClass: 'border-amber-300',
        iconType: 'alert-triangle',
        colorHex: '#D97706'
      };
    case 'premises_survey':
      return {
        label: 'Premises Survey & Category Assessment (Clause 5 & 6)',
        shortLabel: 'System Survey',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-700',
        borderClass: 'border-slate-300',
        iconType: 'building',
        colorHex: '#475569'
      };
    default:
      return {
        label: 'SANS 10139 Milestone',
        shortLabel: 'Compliance Event',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-700',
        borderClass: 'border-slate-300',
        iconType: 'clock',
        colorHex: '#334155'
      };
  }
}
