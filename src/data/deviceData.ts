import { FireDetectionDevice } from '../types/deviceLog';

export const INITIAL_FIRE_DETECTION_DEVICES: FireDetectionDevice[] = [
  {
    id: 'TLP-L01-D014',
    barcode: 'AUDRIN-SANS-TLP-L01-D014',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    clientOrganisation: 'Tshwane Logistics Park (Pty) Ltd',
    loopNumber: 1,
    address: 14,
    zone: 'Zone 02 - High Bay Receiving Deck',
    subLocation: 'Aisle 4, Grid C3, Ceiling Truss mount at 5.2m height',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'Analogue Addressable Optical Smoke Detector',
    manufacturer: 'Apollo Fire Detectors',
    modelNumber: 'Discovery 58000-600APO',
    serialNumber: 'SN-2022-AP-89410',
    baseType: 'Apollo 45681-284 Isolator Base',
    installationDate: '2022-03-15',
    lastServiceDate: '2026-06-08',
    nextSansDueDate: '2026-09-08',
    status: 'service_due', // Due within 4 days
    analogueTelemetry: {
      contaminationPercent: 18,
      sensitivityLevel: 'Mode 2 (2.4% obs/m standard industrial)',
      signalMargin: 96,
      loopVoltage: 22.4,
      temperatureC: 21.8
    },
    sans10139ComplianceScore: 88,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-TLP-2026-0608',
        date: '2026-06-08 10:45',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'SANS 10139 Clause 25.3 Quarterly Aerosol Challenge',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Sampling & Point Testing)',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Aerosol Smoke Dispenser + Solo A5 SANS Canister',
        testReading: 'Trigger response 9.8s; confirmed address Loop 1 Addr 14 on MXPro CIE within 2.4s',
        notes: 'Chamber clean, LED flashes confirmation pulse. Isolator base contacts cleaned and terminal torques verified.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2026-06-08T10:48:15Z',
          hash: 'SHA256:8a19f20e4b88cc9101f37e42'
        },
        cocReference: 'SANS-QRT-2026-0608'
      },
      {
        id: 'LOG-TLP-2026-0310',
        date: '2026-03-10 14:15',
        serviceType: 'smoke_aerosol_test',
        serviceTypeTitle: 'Routine Rotational Smoke Chamber Challenge',
        sansClause: 'SANS 10139:2012 Clause 25.2 (Routine Test)',
        result: 'pass',
        testedBy: {
          name: 'Ayanda Khumalo',
          saqccNumber: 'SAQCC #60412',
          role: 'SAQCC Level 2 Fire Alarm Installer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Pole-Mounted Dispenser',
        testReading: 'Trigger response 11.2s; panel alert confirmed',
        notes: 'Routine quarterly rotation. Optical chamber dust drift recorded at 16%. No insect ingress observed.',
        digitalSignature: {
          signedBy: 'Ayanda Khumalo',
          timestamp: '2026-03-10T14:18:22Z',
          hash: 'SHA256:4f18d7b322a890e1c287413b'
        }
      },
      {
        id: 'LOG-TLP-2025-1120',
        date: '2025-11-20 11:30',
        serviceType: 'sans_annual_inspection',
        serviceTypeTitle: 'SANS 10139 Clause 25.4 Statutory Annual Re-Certification',
        sansClause: 'SANS 10139:2012 Clause 25.4 (100% Comprehensive Audit)',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Smoke Dispenser + Calibrated Multimeter Fluke 87V',
        testReading: 'Smoke challenge 8.9s, loop quiescent current 1.8mA, operating voltage 22.5V DC',
        notes: 'Annual CoC witness test passed. Device sensitivity verified within SANS 10139 table limits. Certificate issued.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2025-11-20T11:45:00Z',
          hash: 'SHA256:99c72e10a76f2d901e8cba12'
        },
        cocReference: 'COC-SANS-2025-1120'
      }
    ]
  },
  {
    id: 'TLP-L01-MCP03',
    barcode: 'AUDRIN-SANS-TLP-L01-MCP03',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    clientOrganisation: 'Tshwane Logistics Park (Pty) Ltd',
    loopNumber: 1,
    address: 23,
    zone: 'Zone 02 - High Bay Receiving Deck',
    subLocation: 'Pedestrian Fire Exit Door FD-03, mounted at 1.4m height',
    deviceType: 'manual_call_point',
    deviceTypeLabel: 'Addressable Manual Call Point (Break Glass)',
    manufacturer: 'Apollo Fire Detectors',
    modelNumber: 'Discovery Red MCP 58100-910',
    serialNumber: 'SN-2022-MCP-44102',
    baseType: 'Integral Backbox IP54 with transparent flap',
    installationDate: '2022-03-15',
    lastServiceDate: '2026-08-28',
    nextSansDueDate: '2026-09-04',
    status: 'service_due', // Due today
    analogueTelemetry: {
      contaminationPercent: 0,
      sensitivityLevel: 'Mechanical Contact Switch (Immediate Trip)',
      signalMargin: 100,
      loopVoltage: 22.8
    },
    sans10139ComplianceScore: 94,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-TLP-2026-0828',
        date: '2026-08-28 08:30',
        serviceType: 'manual_call_point_reset',
        serviceTypeTitle: 'SANS 10139 Clause 25.2 Weekly Functional Trip Test',
        sansClause: 'SANS 10139:2012 Clause 25.2 (Weekly Sounder & Call Point Test)',
        result: 'pass',
        testedBy: {
          name: 'Ayanda Khumalo',
          saqccNumber: 'SAQCC #60412',
          role: 'SAQCC Level 2 Fire Alarm Installer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Apollo Standard Test Reset Key SC-01',
        testReading: 'Microswitch operated cleanly within 0.8s; building evacuation sounders engaged simultaneously',
        notes: 'Glass element intact. Protective polycarbonate hinged cover functioning smoothly to resist warehouse trolley impact.',
        digitalSignature: {
          signedBy: 'Ayanda Khumalo',
          timestamp: '2026-08-28T08:35:10Z',
          hash: 'SHA256:77bc31e091fa5a832f0194bc'
        },
        cocReference: 'WKT-2026-0828'
      }
    ]
  },
  {
    id: 'TLP-L02-BM002',
    barcode: 'AUDRIN-SANS-TLP-L02-BM002',
    siteId: 'site-01',
    siteName: 'Warehouse Distribution Hub 3',
    clientOrganisation: 'Tshwane Logistics Park (Pty) Ltd',
    loopNumber: 2,
    address: 8,
    zone: 'Zone 05 - High Bay Pallet Racking Aisle 3',
    subLocation: 'North Wall Gable Beam Receiver, 9.8m above finished floor',
    deviceType: 'beam_detector',
    deviceTypeLabel: 'Optical Projected Beam Smoke Detector (Rx Unit)',
    manufacturer: 'Fire Fighting Enterprises (FFE)',
    modelNumber: 'Fireray 5000 End-to-End System',
    serialNumber: 'SN-2022-FR-10928',
    baseType: 'Heavy Duty Structural Bracket with Alignment Laser',
    installationDate: '2022-04-02',
    lastServiceDate: '2026-06-08',
    nextSansDueDate: '2026-09-08',
    status: 'service_due',
    analogueTelemetry: {
      contaminationPercent: 28,
      sensitivityLevel: '35% obscuration threshold (SANS standard warehouse)',
      signalMargin: 88,
      loopVoltage: 21.9
    },
    sans10139ComplianceScore: 84,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-TLP-BM-2026-0608',
        date: '2026-06-08 13:20',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Optical Beam Obscuration Attenuation Filter Test',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Beam Path Verification)',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Calibrated Optical Test Filter Set (35% & 55% Attenuation)',
        testReading: 'Fire condition signaled at 35% attenuation filter insert within 6.2 seconds',
        notes: 'Optical lens cleaned with antistatic solution. Clear line-of-sight across 78-meter span verified free of pallet obstruction.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2026-06-08T13:35:00Z',
          hash: 'SHA256:1a84f3e7902ba144d82b09ff'
        }
      }
    ]
  },
  {
    id: 'PMS-L01-D007',
    barcode: 'AUDRIN-SANS-PMS-L01-D007',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    clientOrganisation: 'Pretoria Medipark Suites (Pty) Ltd',
    loopNumber: 1,
    address: 7,
    zone: 'Zone 01 - Ground Floor Trauma Ward Corridor',
    subLocation: 'Corridor intersection between Triage and X-Ray Suite',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'Analogue Optical Smoke Detector (Medical Grade)',
    manufacturer: 'Ziton / Carrier Fire Security',
    modelNumber: 'Ziton ZP730-2P Optical Sensor',
    serialNumber: 'SN-2021-ZT-55201',
    baseType: 'Ziton ZP7-IB-P Surface Isolator Base',
    installationDate: '2021-08-10',
    lastServiceDate: '2026-06-20',
    nextSansDueDate: '2026-09-20',
    status: 'normal',
    analogueTelemetry: {
      contaminationPercent: 12,
      sensitivityLevel: 'High Sensitivity Level 1 (Hospital Ward Profile)',
      signalMargin: 98,
      loopVoltage: 23.1,
      temperatureC: 22.0
    },
    sans10139ComplianceScore: 92,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-PMS-2026-0620',
        date: '2026-06-20 09:15',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Quarterly Point Test & Ward Acoustic Test',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Healthcare Occupancy)',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Aerosol Dispenser',
        testReading: 'Trigger response 8.1s; nurse station repeater indicator active',
        notes: 'Compliant healthcare ward response time. Minimum 75 dB(A) bedhead sounder audibility verified.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2026-06-20T09:25:00Z',
          hash: 'SHA256:56b3e944a10f8821d33458bb'
        }
      }
    ]
  },
  {
    id: 'PMS-L01-D022',
    barcode: 'AUDRIN-SANS-PMS-L01-D022',
    siteId: 'site-02',
    siteName: 'Medical Suites Block B',
    clientOrganisation: 'Pretoria Medipark Suites (Pty) Ltd',
    loopNumber: 1,
    address: 22,
    zone: 'Zone 03 - First Floor Day Surgery Recovery',
    subLocation: 'Ceiling void adjacent to HVAC Return Air Duct Damper',
    deviceType: 'multi_sensor',
    deviceTypeLabel: 'Combined Optical Smoke & Heat Multi-Criteria Sensor',
    manufacturer: 'Ziton / Carrier Fire Security',
    modelNumber: 'Ziton ZP732-2P Combination Multi-Sensor',
    serialNumber: 'SN-2021-ZT-55289',
    baseType: 'ZP7-IB-P Addressable Isolator Base',
    installationDate: '2021-08-10',
    lastServiceDate: '2026-06-20',
    nextSansDueDate: '2026-09-02', // 2 days past due!
    status: 'defect_fault',
    analogueTelemetry: {
      contaminationPercent: 82, // High contamination!
      sensitivityLevel: 'Multi-Criteria Smoke/Rate-of-Rise Heat',
      signalMargin: 64, // Marginal polling
      loopVoltage: 19.8,
      temperatureC: 26.4
    },
    sans10139ComplianceScore: 52,
    remedialActionsPending: 1,
    maintenanceHistory: [
      {
        id: 'LOG-PMS-2026-0902',
        date: '2026-09-02 16:30',
        serviceType: 'fault_rectification',
        serviceTypeTitle: 'Statutory Defect Citation - Optical Chamber Contamination',
        sansClause: 'SANS 10139:2012 Clause 25.3.4 (Chamber Compensation Limits)',
        result: 'defect',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Ziton Protocol Analyser + Calibrated Smoke Tester',
        testReading: 'Drift compensation reached 82% ceiling. Panel reported "Dirty Detector L1-A22" alert.',
        notes: 'Statutory Defect logged. Device requires immediate ultrasonic chamber cleaning or sensor replacement to prevent false hospital evacuation.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-09-02T16:45:00Z',
          hash: 'SHA256:ee0412a89045b6cc1144f890'
        },
        cocReference: 'DEFECT-PMS-2026-0902'
      },
      {
        id: 'LOG-PMS-2026-0315',
        date: '2026-03-15 11:00',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Quarterly Multi-Sensor Dual Challenge',
        sansClause: 'SANS 10139:2012 Clause 25.3',
        result: 'pass',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Smoke + Solo 461 Cordless Heat Tester',
        testReading: 'Thermal element triggered at 58°C within 14.2s; optical channel responsive',
        notes: 'Note: Dust build-up observed from hospital ceiling maintenance. Advised client facility manager.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-03-15T11:12:00Z',
          hash: 'SHA256:8899aabbccddeeff00112233'
        }
      }
    ]
  },
  {
    id: 'MIT-L01-D018',
    barcode: 'AUDRIN-SANS-MIT-L01-D018',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    clientOrganisation: 'Menlyn Corporate Properties (Pty) Ltd',
    loopNumber: 1,
    address: 18,
    zone: 'Zone 04 - Level 4 Primary Data Centre / Server Room A',
    subLocation: 'Above Cold-Aisle Containment Rack 06',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'High-Sensitivity Laser Optical Smoke Detector',
    manufacturer: 'Honeywell Morley-IAS',
    modelNumber: 'Morley MI-PSE-S2 Photoelectric Sensor',
    serialNumber: 'SN-2023-HW-99142',
    baseType: 'B501AP Standard Intelligent Base',
    installationDate: '2023-05-12',
    lastServiceDate: '2026-06-15',
    nextSansDueDate: '2026-09-15',
    status: 'service_due', // Due in 11 days
    analogueTelemetry: {
      contaminationPercent: 8,
      sensitivityLevel: 'Laser Ultra-High Sensitivity 0.5% obs/m',
      signalMargin: 99,
      loopVoltage: 24.0,
      temperatureC: 19.5
    },
    sans10139ComplianceScore: 96,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-MIT-2026-0615',
        date: '2026-06-15 14:00',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Quarterly Critical Server Room SANS 10139 Inspection',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Clean Room & IT Facilities)',
        result: 'pass',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Smoke Dispenser + Clean Nitrogen Blower',
        testReading: 'Ultra-fast trigger 5.4s; panel pre-alarm and 1st stage warning validated',
        notes: 'Clean room airflow velocity 1.8 m/s within design envelope. Cause & effect gas suppression pre-discharge interlock tested on simulated bypass.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-06-15T14:18:00Z',
          hash: 'SHA256:44aa882109ffb731e0998811'
        },
        cocReference: 'SANS-QRT-2026-0615'
      }
    ]
  },
  {
    id: 'MIT-L02-VAD09',
    barcode: 'AUDRIN-SANS-MIT-L02-VAD09',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    clientOrganisation: 'Menlyn Corporate Properties (Pty) Ltd',
    loopNumber: 2,
    address: 45,
    zone: 'Zone 08 - Level 3 Central Atrium Concourse',
    subLocation: 'Pillar B4 facing glass atrium elevator shaft, 2.4m mounting',
    deviceType: 'sounder_vad',
    deviceTypeLabel: 'Loop-Powered Addressable Sounder Visual Alarm Device (VAD)',
    manufacturer: 'Honeywell Morley-IAS',
    modelNumber: 'Morley MI-WS-SS-N05 Integrated Sounder Beacon',
    serialNumber: 'SN-2023-HW-11802',
    baseType: 'IP21C Wall Mounting Base',
    installationDate: '2023-05-12',
    lastServiceDate: '2026-06-15',
    nextSansDueDate: '2026-09-15',
    status: 'service_due',
    analogueTelemetry: {
      contaminationPercent: 0,
      sensitivityLevel: 'Tone 1: SANS Evacuation Sweep (98 dB(A) @ 1m)',
      signalMargin: 97,
      loopVoltage: 23.6
    },
    sans10139ComplianceScore: 92,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-MIT-VAD-2026-0615',
        date: '2026-06-15 15:30',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Decibel Sound Audibility & Flash Rate Certification',
        sansClause: 'SANS 10139:2012 Clause 16 & Clause 25.3 (Acoustic Levels)',
        result: 'pass',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Calibrated Class 2 Sound Level Meter Extech 407732',
        testReading: 'Acoustic output verified at 97.4 dB(A) @ 1m; white LED flash rate 0.5 Hz synchronized',
        notes: 'Ambient background noise measured at 62 dB(A). Exceeds statutory +5 dB(A) signal-to-noise ratio requirements comfortably.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-06-15T15:45:00Z',
          hash: 'SHA256:9900aabbcc11223344556677'
        }
      }
    ]
  },
  {
    id: 'MIT-L03-HT012',
    barcode: 'AUDRIN-SANS-MIT-L03-HT012',
    siteId: 'site-03',
    siteName: 'Menlyn Innovation Tower',
    clientOrganisation: 'Menlyn Corporate Properties (Pty) Ltd',
    loopNumber: 3,
    address: 12,
    zone: 'Zone 12 - Ground Floor Canteen Commercial Kitchen',
    subLocation: '2.5m from primary cooking extract canopy',
    deviceType: 'heat_detector',
    deviceTypeLabel: 'Class A1R Rate-of-Rise & Fixed Thermal Heat Detector',
    manufacturer: 'Honeywell Morley-IAS',
    modelNumber: 'Morley MI-HTE-S2 Thermal Sensor',
    serialNumber: 'SN-2023-HW-33419',
    baseType: 'B501AP Low Profile Base with moisture gasket',
    installationDate: '2023-05-14',
    lastServiceDate: '2026-06-15',
    nextSansDueDate: '2026-09-15',
    status: 'service_due',
    analogueTelemetry: {
      contaminationPercent: 4,
      sensitivityLevel: 'Class A1R (58°C Fixed + Rate-of-Rise)',
      signalMargin: 98,
      loopVoltage: 23.9,
      temperatureC: 28.2
    },
    sans10139ComplianceScore: 94,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-MIT-HT-2026-0615',
        date: '2026-06-15 16:15',
        serviceType: 'thermal_heat_test',
        serviceTypeTitle: 'Thermal Element Response & Ramp Verification',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Heat Detector Functional Test)',
        result: 'pass',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 461 Cordless Heat Detector Tester',
        testReading: 'Triggered at 57.8°C simulated thermal plume within 12.1 seconds',
        notes: 'Thermal bead free from grease accumulation. Moisture-resistant base gasket inspected and intact.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-06-15T16:25:00Z',
          hash: 'SHA256:11223344556677889900aabb'
        }
      }
    ]
  },
  {
    id: 'CTR-L01-D033',
    barcode: 'AUDRIN-SANS-CTR-L01-D033',
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    clientOrganisation: 'Innovatech Holdings Ltd',
    loopNumber: 1,
    address: 33,
    zone: 'Zone 02 - Clean Room Robotics Lab B',
    subLocation: 'Ceiling Grid Unit 12, laminar flow clean environment',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'Intelligent ESP Analogue Optical Smoke Detector',
    manufacturer: 'Hochiki Europe / Kentec',
    modelNumber: 'Hochiki ALN-EN High-Performance Optical Smoke',
    serialNumber: 'SN-2023-HK-77189',
    baseType: 'YBN-R/3 Standard Base',
    installationDate: '2023-11-15',
    lastServiceDate: '2026-06-22',
    nextSansDueDate: '2026-09-22',
    status: 'normal',
    analogueTelemetry: {
      contaminationPercent: 6,
      sensitivityLevel: 'High Precision Chamber (Level 1: 1.5% obs/m)',
      signalMargin: 100,
      loopVoltage: 24.2,
      temperatureC: 20.2
    },
    sans10139ComplianceScore: 98,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-CTR-2026-0622',
        date: '2026-06-22 11:30',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Quarterly ESP Protocol & Clean Room Sampling',
        sansClause: 'SANS 10139:2012 Clause 25.3',
        result: 'pass',
        testedBy: {
          name: 'Hendrik Venter',
          saqccNumber: 'SAQCC #39084',
          role: 'SAQCC Level 3 Senior Commissioning Engineer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Aerosol Tester with clean aerosol cartridge',
        testReading: 'Trigger response 7.2s; Kentec Taktis touchscreen confirmed address',
        notes: 'Chamber drift negligible (6%). Clean room integrity maintained without contamination.',
        digitalSignature: {
          signedBy: 'Hendrik Venter',
          timestamp: '2026-06-22T11:45:00Z',
          hash: 'SHA256:3344556677889900aabbccdd'
        },
        cocReference: 'SANS-QRT-2026-0622'
      }
    ]
  },
  {
    id: 'CTR-L02-INT05',
    barcode: 'AUDRIN-SANS-CTR-L02-INT05',
    siteId: 'site-04',
    siteName: 'Centurion Tech Research Centre',
    clientOrganisation: 'Innovatech Holdings Ltd',
    loopNumber: 2,
    address: 15,
    zone: 'Zone 03 - Server Room Gas Suppression Cylinder Bank',
    subLocation: 'Auxiliary control enclosure adjacent to Inergen gas manifold',
    deviceType: 'gas_actuator',
    deviceTypeLabel: 'Gas Extinguishing Control & Monitored Interface Relay',
    manufacturer: 'Kentec Electronics',
    modelNumber: 'Kentec Sigma XT Extinguishant Monitored Module',
    serialNumber: 'SN-2023-KT-00491',
    baseType: 'DIN Rail Mounting Metal Enclosure',
    installationDate: '2023-11-15',
    lastServiceDate: '2026-06-22',
    nextSansDueDate: '2026-09-22',
    status: 'normal',
    analogueTelemetry: {
      contaminationPercent: 0,
      sensitivityLevel: 'Supervised 24V DC Solenoid Actuation Circuit',
      signalMargin: 100,
      loopVoltage: 24.1
    },
    sans10139ComplianceScore: 99,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-CTR-GAS-2026-0622',
        date: '2026-06-22 14:00',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Extinguishing System Trip & Hold-Off Verification',
        sansClause: 'SANS 10139 Clause 25.3 & SANS 369-1 Electrical Actuation',
        result: 'pass',
        testedBy: {
          name: 'Hendrik Venter',
          saqccNumber: 'SAQCC #39084',
          role: 'SAQCC Level 3 Senior Commissioning Engineer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Simulated 1A Pyrotechnic Test Bulb & Relay Timer',
        testReading: '30-second pre-discharge count confirmed; audible bell & gas strobe activated at 0s; simulated actuator fired at 30.1s',
        notes: 'Manual abort button (hold-off) checked and verified. Solenoids re-connected after test with physical lockout confirmed.',
        digitalSignature: {
          signedBy: 'Hendrik Venter',
          timestamp: '2026-06-22T14:30:00Z',
          hash: 'SHA256:aabbccddeeff001122334455'
        }
      }
    ]
  },
  {
    id: 'SPE-L01-MCP02',
    barcode: 'AUDRIN-SANS-SPE-L01-MCP02',
    siteId: 'site-05',
    siteName: 'Silverton Industrial Assembly Facility',
    clientOrganisation: 'Gauteng Precision Engineering (Pty) Ltd',
    loopNumber: 1,
    address: 12,
    zone: 'Zone 01 - Heavy CNC Machine Shop',
    subLocation: 'Structural Column J7 beside primary exit roller door',
    deviceType: 'manual_call_point',
    deviceTypeLabel: 'Weatherproof IP67 Addressable Manual Call Point',
    manufacturer: 'KAC Alarm Company',
    modelNumber: 'KAC WCP002 Waterproof Call Point',
    serialNumber: 'SN-2020-KAC-99321',
    baseType: 'Heavy duty IP67 sealed backbox with 20mm conduit entries',
    installationDate: '2020-04-18',
    lastServiceDate: '2026-06-28',
    nextSansDueDate: '2026-09-28',
    status: 'normal',
    analogueTelemetry: {
      contaminationPercent: 0,
      sensitivityLevel: 'IP67 Sealed Mechanical Contact',
      signalMargin: 94,
      loopVoltage: 21.6
    },
    sans10139ComplianceScore: 86,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-SPE-2026-0628',
        date: '2026-06-28 10:15',
        serviceType: 'manual_call_point_reset',
        serviceTypeTitle: 'Quarterly IP67 Mechanical Reset & Gasket Inspection',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Industrial Harsh Environments)',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'KAC Test Key',
        testReading: 'Contact resistance 0.12 ohms; instantaneous trip confirmed on panel',
        notes: 'IP67 silicone rubber sealing gasket re-seated and lubricated. Enclosure free from machine oil ingress.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2026-06-28T10:25:00Z',
          hash: 'SHA256:114477889900aabbccddeeff'
        },
        cocReference: 'SANS-QRT-2026-0628'
      }
    ]
  },
  {
    id: 'HAR-L01-D042',
    barcode: 'AUDRIN-SANS-HAR-L01-D042',
    siteId: 'site-06',
    siteName: 'Hatfield Student Residences (Block C & D)',
    clientOrganisation: 'Campus Accommodation Trust (Pty) Ltd',
    loopNumber: 1,
    address: 42,
    zone: 'Zone 03 - Block C Level 2 Communal Kitchen',
    subLocation: '2.8m from induction hobs, protected with anti-tamper head lock',
    deviceType: 'heat_detector',
    deviceTypeLabel: 'Class A2 Fixed Temperature Heat Detector (Tamper Proof)',
    manufacturer: 'System Sensor / Honeywell',
    modelNumber: 'System Sensor 52051RE Fixed Heat Sensor',
    serialNumber: 'SN-2023-SS-00214',
    baseType: 'B401 Head-Locking Base',
    installationDate: '2023-01-20',
    lastServiceDate: '2026-06-24',
    nextSansDueDate: '2026-09-07', // Due in 3 days!
    status: 'service_due',
    analogueTelemetry: {
      contaminationPercent: 14,
      sensitivityLevel: 'Fixed 58°C (Kitchen False Alarm Immunity Profile)',
      signalMargin: 95,
      loopVoltage: 22.8,
      temperatureC: 24.1
    },
    sans10139ComplianceScore: 89,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-HAR-2026-0624',
        date: '2026-06-24 15:00',
        serviceType: 'thermal_heat_test',
        serviceTypeTitle: 'Quarterly Heat Element SANS 10139 Verification',
        sansClause: 'SANS 10139:2012 Clause 25.3 (Student Housing Protection)',
        result: 'pass',
        testedBy: {
          name: 'Ayanda Khumalo',
          saqccNumber: 'SAQCC #60412',
          role: 'SAQCC Level 2 Fire Alarm Installer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 461 Cordless Heat Detector Tester',
        testReading: 'Triggered at 58.2°C within 13.4s; local kitchen sounder and panel zone 03 engaged',
        notes: 'Tamper-resistant mechanical lock confirmed engaged to prevent student removal of detector head.',
        digitalSignature: {
          signedBy: 'Ayanda Khumalo',
          timestamp: '2026-06-24T15:15:00Z',
          hash: 'SHA256:99887766554433221100aabb'
        }
      }
    ]
  },
  {
    id: 'RMC-L02-D019',
    barcode: 'AUDRIN-SANS-RMC-L02-D019',
    siteId: 'site-07',
    siteName: 'Rosslyn Automotive Components Manufacturing',
    clientOrganisation: 'Rosslyn Precision Motors (Pty) Ltd',
    loopNumber: 2,
    address: 19,
    zone: 'Zone 02 - Paint Booth Flash-Off Tunnel',
    subLocation: 'Paint line ventilation booth intake, hazardous zone rated',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'ATEX / IECEx Intrinsically Safe Optical Smoke Detector',
    manufacturer: 'Apollo Fire Detectors',
    modelNumber: 'Orbis I.S. Optical Smoke ORB-OP-52027-APO',
    serialNumber: 'SN-2022-AP-EX009',
    baseType: 'Orbis I.S. TimeSaver Base with Galvanic Isolator Barrier',
    installationDate: '2022-09-18',
    lastServiceDate: '2026-06-18',
    nextSansDueDate: '2026-09-18',
    status: 'service_due', // Due in 14 days
    analogueTelemetry: {
      contaminationPercent: 22,
      sensitivityLevel: 'Intrinsic Safety Profile via MTL Galvanic Barrier',
      signalMargin: 96,
      loopVoltage: 20.4,
      temperatureC: 25.6
    },
    sans10139ComplianceScore: 91,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-RMC-2026-0618',
        date: '2026-06-18 10:00',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Hazardous Area Intrinsically Safe SANS 10139 Audit',
        sansClause: 'SANS 10139 Clause 25.3 & SANS 10108 Hazardous Locations',
        result: 'pass',
        testedBy: {
          name: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC #48291',
          role: 'SAQCC Fire 1475 Master Lead / Designer',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Solo 330 Aerosol Tester with Anti-Static Earth Bond Cable',
        testReading: 'Trigger response 8.8s; galvanic safety barrier loop loopback verified',
        notes: 'Galvanic isolator barrier earthing checked (resistance < 1 ohm to plant master earth bar). Cleaned optical labyrinth.',
        digitalSignature: {
          signedBy: 'Bethuel Moukangwe',
          timestamp: '2026-06-18T10:30:00Z',
          hash: 'SHA256:7766554433221100ffeeddcc'
        }
      }
    ]
  },
  {
    id: 'VAM-L01-D005',
    barcode: 'AUDRIN-SANS-VAM-L01-D005',
    siteId: 'site-08',
    siteName: 'Vanguard Asset Management SA Office Suites',
    clientOrganisation: 'Vanguard Asset Management SA',
    loopNumber: 1,
    address: 5,
    zone: 'Zone 01 - Executive Boardroom & Reception',
    subLocation: 'Flush ceiling tile center, acoustic plasterboard grid',
    deviceType: 'optical_smoke',
    deviceTypeLabel: 'Low-Profile Architectural Addressable Optical Smoke Sensor',
    manufacturer: 'Advanced Electronics / Apollo',
    modelNumber: 'Apollo Soteria Dimension Optical Sensor FL5100-600',
    serialNumber: 'SN-2024-AP-DIM01',
    baseType: 'Specialist Flush-Mount Ceiling Cavity Bracket',
    installationDate: '2024-02-14',
    lastServiceDate: '2026-06-10',
    nextSansDueDate: '2026-10-10',
    status: 'normal',
    analogueTelemetry: {
      contaminationPercent: 4,
      sensitivityLevel: 'Chamberless Dual Optical (0.8% - 3.0% obs/m auto-scale)',
      signalMargin: 100,
      loopVoltage: 24.4,
      temperatureC: 21.0
    },
    sans10139ComplianceScore: 99,
    remedialActionsPending: 0,
    maintenanceHistory: [
      {
        id: 'LOG-VAM-2026-0610',
        date: '2026-06-10 11:15',
        serviceType: 'sans_quarterly_audit',
        serviceTypeTitle: 'Quarterly Flush Chamberless Sensor Inspection',
        sansClause: 'SANS 10139:2012 Clause 25.3',
        result: 'pass',
        testedBy: {
          name: 'Thabo Mokoena',
          saqccNumber: 'SAQCC #51902',
          role: 'SAQCC Level 3 Fire Systems Technician',
          company: 'Audrin Fire Engineers (Pty) Ltd'
        },
        testEquipmentUsed: 'Aerosol test pole with micro-hood',
        testReading: 'Trigger response 6.8s; confirmed address Loop 1 Addr 05',
        notes: 'Architectural flush sensor in pristine condition. Optics clear, flush mesh intact.',
        digitalSignature: {
          signedBy: 'Thabo Mokoena',
          timestamp: '2026-06-10T11:25:00Z',
          hash: 'SHA256:00112233445566778899aabb'
        }
      }
    ]
  }
];
