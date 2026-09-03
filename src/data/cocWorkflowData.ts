import { COCApprovalWorkflow } from '../types';

export const INITIAL_COC_WORKFLOWS: COCApprovalWorkflow[] = [
  {
    id: 'coc-wf-001',
    certificateNumber: 'COC-SANS10139-2026-0089-A',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0089',
    siteId: 'site-centurion-01',
    siteName: 'Centurion Logistics Hub',
    buildingAddress: '14 Enterprise Way, Highveld Techno Park',
    city: 'Centurion, Pretoria',
    province: 'Gauteng',
    organisationName: 'Apex Distribution Logistics',
    systemCategory: 'Category L1 (Comprehensive Life Safety Protection)',
    standardReference: 'SANS 10139:2012 / SANS 10400-T / SANS 246',
    overallStatus: 'awaiting_client_signature',
    progressPercentage: 75,
    currentStageId: 'stage_4_client_signature',
    createdAt: '2026-08-28T09:30:00Z',
    lastUpdated: '2026-09-01T14:30:00Z',
    qrVerificationCode: 'SANS10139-AFE-2026-891-VERIFIED',
    qrVerificationUrl: 'https://audrinfire.co.za/verify/coc?id=COC-SANS10139-2026-0089-A',
    stages: [
      {
        id: 'stage_1_inspection',
        stageNumber: 1,
        title: 'Field Site Inspection & SANS Testing',
        shortLabel: 'Site Inspection & Testing',
        description: 'Comprehensive physical and electronic testing of CIE panels, optical loops, MCPs, sounders, and interface relays.',
        requiredRole: 'Technician (SAQCC)',
        status: 'completed',
        completedAt: '2026-08-31T11:45:00Z',
        updatedAt: '2026-08-31T11:45:00Z',
        technicianSignOff: {
          technicianName: 'Tshepo Khumalo',
          saqccNumber: 'SAQCC-FDGS-44912-L3',
          saqccLevel: 'Level 3 - Servicing / Commissioner',
          phone: '071 882 1092',
          signedAt: '2026-08-31T11:45:00Z',
          verificationHash: 'SHA256:8f4b7a192c0199e821bca9810a993cf81290312fae801',
          panelMakeModel: 'Ziton ZP3 Addressable Fire CIE',
          loopSensorsTestedCount: 142,
          sounderAudibilityDba: 78.5,
          standbyBatteryVoltage: 27.6,
          batteryLoadTestPassed: true,
          notes: 'Full 100% device audit performed. All 142 optical smoke sensors, 12 thermal detectors, and 18 manual call points verified.'
        },
        checklist: [
          {
            id: 'chk-101',
            label: 'CIE Control Panel Diagnostic & Fault Log Interrogation',
            standardClause: 'SANS 10139 Clause 25.2',
            passed: true,
            notes: 'Zero active earth or loop communication faults logged over 72hr buffer.',
            testedAt: '2026-08-31T09:15:00Z',
            testedBy: 'Tshepo Khumalo (SAQCC-L3)'
          },
          {
            id: 'chk-102',
            label: '100% Loop Detectors & Manual Call Point Functional Triggering',
            standardClause: 'SANS 10139 Clause 25.3.2',
            passed: true,
            notes: 'All 154 addressable nodes polled and verified with test aerosol & test key.',
            testedAt: '2026-08-31T10:00:00Z',
            testedBy: 'Tshepo Khumalo (SAQCC-L3)'
          },
          {
            id: 'chk-103',
            label: 'Secondary Standby Battery 24h + 30min Full Load Discharge Test',
            standardClause: 'SANS 10139 Clause 25.4.1',
            passed: true,
            notes: 'Internal resistance measured at 14mΩ. Load voltage maintained at 25.8V under full sounder load.',
            testedAt: '2026-08-31T10:30:00Z',
            testedBy: 'Tshepo Khumalo (SAQCC-L3)'
          },
          {
            id: 'chk-104',
            label: 'Audibility & Acoustic Alarm Sound Pressure Level Verification',
            standardClause: 'SANS 10139 Clause 16.2',
            passed: true,
            notes: 'Achieved 78.5 dBA across open plan offices and 85 dBA across warehouse high-bay loading bays (Exceeds 65 dBA statutory minimum).',
            testedAt: '2026-08-31T11:00:00Z',
            testedBy: 'Tshepo Khumalo (SAQCC-L3)'
          },
          {
            id: 'chk-105',
            label: 'HVAC Air-Handling Shutdown & Fire Door Magnetic Release Interlocks',
            standardClause: 'SANS 10139 Clause 19.3',
            passed: true,
            notes: 'All 4 motorized fire dampers and mechanical ventilation trips executed within 2.8 seconds of primary alarm trigger.',
            testedAt: '2026-08-31T11:30:00Z',
            testedBy: 'Tshepo Khumalo (SAQCC-L3)'
          }
        ]
      },
      {
        id: 'stage_2_defects_clearance',
        stageNumber: 2,
        title: 'Technical Defect Clearance & Rectification Audit',
        shortLabel: 'Defects Clearance',
        description: 'Verification that all critical non-conformances, cable containment issues, and sensor obstructions are 100% resolved.',
        requiredRole: 'Remediation Lead',
        status: 'completed',
        completedAt: '2026-09-01T09:30:00Z',
        updatedAt: '2026-09-01T09:30:00Z',
        defectsSummary: {
          totalLogged: 2,
          rectified: 2,
          criticalRemaining: 0,
          clearanceNotes: '1. Riser B fire-stop collar resealed with certified intumescent mastic. 2. Mezzanine optical detector dust cap removed and recalibrated.'
        },
        checklist: [
          {
            id: 'chk-201',
            label: 'Ceiling void and structural cable containment clearance',
            standardClause: 'SANS 10139 Clause 17.5',
            passed: true,
            notes: 'Fire-resistant PH30 cabling properly clipped at 300mm intervals on metallic cable trays.',
            testedAt: '2026-09-01T09:00:00Z',
            testedBy: 'Tshepo Khumalo'
          },
          {
            id: 'chk-202',
            label: 'False alarm risk assessment and ambient dust isolation',
            standardClause: 'SANS 10139 Clause 28',
            passed: true,
            notes: 'High-bay warehouse loading dock fitted with multi-criteria optical-thermal sensors to eliminate diesel fume false alarms.',
            testedAt: '2026-09-01T09:20:00Z',
            testedBy: 'Tshepo Khumalo'
          }
        ]
      },
      {
        id: 'stage_3_engineer_review',
        stageNumber: 3,
        title: 'Lead Fire Systems Engineer Review & Statutory Endorsement',
        shortLabel: 'Pr.Eng Endorsement',
        description: 'Engineering Council of South Africa (ECSA) Pr.Eng / SAQCC Level 4 design & compliance endorsement and digital seal.',
        requiredRole: 'Lead Fire Systems Engineer (Pr.Eng)',
        status: 'completed',
        completedAt: '2026-09-01T14:30:00Z',
        updatedAt: '2026-09-01T14:30:00Z',
        engineerReview: {
          engineerName: 'Audrin Sibanda',
          role: 'Lead Fire Systems Engineer & Approved Competent Person',
          ecsaNumber: 'ECSA-2015-810933',
          saqccNumber: 'SAQCC-FDGS-31084-L4',
          digitalSealId: 'ECSA-SEAL-2026-AFE-0891-VERIFIED',
          reviewedAt: '2026-09-01T14:30:00Z',
          decision: 'approved',
          systemCategory: 'Category L1 (Life Safety)',
          standardReference: 'SANS 10139:2012 / SANS 10400-T',
          endorsementNotes: 'I hereby certify that I have reviewed the physical commissioning and maintenance logs, battery calculations, and device coverage schematics. The system fulfills all statutory requirements under SANS 10139:2012 for Category L1 life safety occupancy.',
          verificationHash: 'SHA256:d91c778210fe918239bb40029381902ec561099238aa01928'
        }
      },
      {
        id: 'stage_4_client_signature',
        stageNumber: 4,
        title: 'Client Responsible Person Digital Signature & Handover Acceptance',
        shortLabel: 'Client Digital Signature',
        description: 'Statutory acknowledgment and digital signature by the building owner or appointed SANS 10139 Responsible Person.',
        requiredRole: 'Client Responsible Person',
        status: 'action_required',
        notes: 'Awaiting digital sign-off from Marcus Brody (Facility Operations Manager). Please click "Sign Certificate" to review and adopt your signature.'
      },
      {
        id: 'stage_5_coc_issuance',
        stageNumber: 5,
        title: 'Statutory COC Issuance & Local Authority Dispatch',
        shortLabel: 'COC Issuance & Archival',
        description: 'Generation of tamper-proof SANS Certificate of Compliance with cryptographic QR verification and dispatch to insurer/municipality.',
        requiredRole: 'Compliance Registrar',
        status: 'pending',
        notes: 'Will automatically seal and issue immediately upon client digital signature.'
      }
    ],
    dispatchedRecipients: [
      {
        name: 'Gauteng Emergency Services / Fire Safety Division',
        entity: 'Tshwane Fire Safety Inspectorate',
        email: 'firesafety.statutory@tshwane.gov.za',
        dispatchedAt: '',
        method: 'Encrypted PDF Dispatch'
      },
      {
        name: 'Underwriting Risk Management',
        entity: 'Santam Commercial Risk Engineering',
        email: 'commercial.risks@santam.co.za',
        dispatchedAt: '',
        method: 'Automated Webhook'
      }
    ]
  },
  {
    id: 'coc-wf-002',
    certificateNumber: 'COC-SANS10139-2026-0105-B',
    serviceRequestId: 'req-002',
    serviceRequestRef: 'AFE-REQ-2026-0105',
    siteId: 'site-medipark-02',
    siteName: 'Pretoria Medipark Suites',
    buildingAddress: '88 Francis Baard Street, Medical Block B',
    city: 'Pretoria Central',
    province: 'Gauteng',
    organisationName: 'Pretoria Medipark Suites',
    systemCategory: 'Category L1 (Healthcare & Hospital Life Safety)',
    standardReference: 'SANS 10139:2012 / SANS 322 / SANS 10400-T',
    overallStatus: 'inspection_pending',
    progressPercentage: 20,
    currentStageId: 'stage_1_inspection',
    createdAt: '2026-09-01T08:15:00Z',
    lastUpdated: '2026-09-01T10:00:00Z',
    qrVerificationCode: 'SANS10139-AFE-2026-105-PENDING',
    qrVerificationUrl: 'https://audrinfire.co.za/verify/coc?id=COC-SANS10139-2026-0105-B',
    stages: [
      {
        id: 'stage_1_inspection',
        stageNumber: 1,
        title: 'Field Site Inspection & SANS Testing',
        shortLabel: 'Site Inspection & Testing',
        description: 'Comprehensive physical and electronic testing of CIE panels, optical loops, MCPs, sounders, and interface relays.',
        requiredRole: 'Technician (SAQCC)',
        status: 'in_progress',
        notes: 'Emergency diagnostic in progress. Ground fault on Ziton ZP3 Loop 2 being isolated. Technician sign-off pending completion.'
      },
      {
        id: 'stage_2_defects_clearance',
        stageNumber: 2,
        title: 'Technical Defect Clearance & Rectification Audit',
        shortLabel: 'Defects Clearance',
        description: 'Verification that all critical non-conformances, cable containment issues, and sensor obstructions are 100% resolved.',
        requiredRole: 'Remediation Lead',
        status: 'pending'
      },
      {
        id: 'stage_3_engineer_review',
        stageNumber: 3,
        title: 'Lead Fire Systems Engineer Review & Statutory Endorsement',
        shortLabel: 'Pr.Eng Endorsement',
        description: 'Engineering Council of South Africa (ECSA) Pr.Eng / SAQCC Level 4 design & compliance endorsement and digital seal.',
        requiredRole: 'Lead Fire Systems Engineer (Pr.Eng)',
        status: 'pending'
      },
      {
        id: 'stage_4_client_signature',
        stageNumber: 4,
        title: 'Client Responsible Person Digital Signature & Handover Acceptance',
        shortLabel: 'Client Digital Signature',
        description: 'Statutory acknowledgment and digital signature by the building owner or appointed SANS 10139 Responsible Person.',
        requiredRole: 'Client Responsible Person',
        status: 'pending'
      },
      {
        id: 'stage_5_coc_issuance',
        stageNumber: 5,
        title: 'Statutory COC Issuance & Local Authority Dispatch',
        shortLabel: 'COC Issuance & Archival',
        description: 'Generation of tamper-proof SANS Certificate of Compliance with cryptographic QR verification.',
        requiredRole: 'Compliance Registrar',
        status: 'pending'
      }
    ]
  },
  {
    id: 'coc-wf-003',
    certificateNumber: 'COC-SANS10139-2026-0044-FINAL',
    serviceRequestId: 'req-003',
    serviceRequestRef: 'AFE-REQ-2026-0044',
    siteId: 'site-sandton-03',
    siteName: 'Sandton Executive Atrium',
    buildingAddress: '150 Rivonia Road, Sandhurst',
    city: 'Sandton, Johannesburg',
    province: 'Gauteng',
    organisationName: 'Sandton Commercial Properties',
    systemCategory: 'Category L1 (Comprehensive Commercial Life Safety)',
    standardReference: 'SANS 10139:2012 / SANS 10400-T',
    overallStatus: 'fully_certified',
    progressPercentage: 100,
    currentStageId: 'stage_5_coc_issuance',
    createdAt: '2026-08-15T08:00:00Z',
    lastUpdated: '2026-08-22T16:00:00Z',
    issuedAt: '2026-08-22T16:00:00Z',
    validUntil: '2027-08-22T23:59:59Z',
    qrVerificationCode: 'SANS10139-AFE-2026-044-AUTHENTIC-SEALED',
    qrVerificationUrl: 'https://audrinfire.co.za/verify/coc?id=COC-SANS10139-2026-0044-FINAL',
    stages: [
      {
        id: 'stage_1_inspection',
        stageNumber: 1,
        title: 'Field Site Inspection & SANS Testing',
        shortLabel: 'Site Inspection & Testing',
        description: 'Comprehensive physical and electronic testing of CIE panels, optical loops, MCPs, sounders, and interface relays.',
        requiredRole: 'Technician (SAQCC)',
        status: 'completed',
        completedAt: '2026-08-18T14:00:00Z',
        technicianSignOff: {
          technicianName: 'Bethuel Moukangwe',
          saqccNumber: 'SAQCC-FDGS-39821-L4',
          saqccLevel: 'Level 4 - Designer / Master',
          phone: '071 415 6665',
          signedAt: '2026-08-18T14:00:00Z',
          verificationHash: 'SHA256:77a11209cc2840019283ba491028',
          panelMakeModel: 'Advanced Electronics MxPro 5 (4-Loop)',
          loopSensorsTestedCount: 286,
          sounderAudibilityDba: 82.0,
          standbyBatteryVoltage: 27.8,
          batteryLoadTestPassed: true,
          notes: 'Full annual comprehensive testing completed. All 4 loops operating at 100% efficiency.'
        }
      },
      {
        id: 'stage_2_defects_clearance',
        stageNumber: 2,
        title: 'Technical Defect Clearance & Rectification Audit',
        shortLabel: 'Defects Clearance',
        description: 'Verification that all critical non-conformances, cable containment issues, and sensor obstructions are 100% resolved.',
        requiredRole: 'Remediation Lead',
        status: 'completed',
        completedAt: '2026-08-19T11:00:00Z',
        defectsSummary: {
          totalLogged: 1,
          rectified: 1,
          criticalRemaining: 0,
          clearanceNotes: 'Flashing strobe unit in 4th floor elevator lobby replaced and sound pressure re-measured.'
        }
      },
      {
        id: 'stage_3_engineer_review',
        stageNumber: 3,
        title: 'Lead Fire Systems Engineer Review & Statutory Endorsement',
        shortLabel: 'Pr.Eng Endorsement',
        description: 'Engineering Council of South Africa (ECSA) Pr.Eng / SAQCC Level 4 design & compliance endorsement and digital seal.',
        requiredRole: 'Lead Fire Systems Engineer (Pr.Eng)',
        status: 'completed',
        completedAt: '2026-08-20T10:30:00Z',
        engineerReview: {
          engineerName: 'Audrin Sibanda',
          role: 'Lead Fire Systems Engineer',
          ecsaNumber: 'ECSA-2015-810933',
          saqccNumber: 'SAQCC-FDGS-31084-L4',
          digitalSealId: 'ECSA-SEAL-2026-AFE-0044-AUTHENTIC',
          reviewedAt: '2026-08-20T10:30:00Z',
          decision: 'approved',
          systemCategory: 'Category L1',
          standardReference: 'SANS 10139:2012',
          endorsementNotes: 'Statutory compliance confirmed. Certified for full 12-month validity period.',
          verificationHash: 'SHA256:9128374019283bbcae81726354890'
        }
      },
      {
        id: 'stage_4_client_signature',
        stageNumber: 4,
        title: 'Client Responsible Person Digital Signature & Handover Acceptance',
        shortLabel: 'Client Digital Signature',
        description: 'Statutory acknowledgment and digital signature by the building owner or appointed SANS 10139 Responsible Person.',
        requiredRole: 'Client Responsible Person',
        status: 'completed',
        completedAt: '2026-08-21T15:12:00Z',
        clientSignature: {
          signatoryName: 'Thabo Mokoena',
          signatoryEmail: 'tmokoena@sandtonproperties.co.za',
          signatoryRole: 'Director of Facilities & Chief Safety Officer',
          organisationName: 'Sandton Commercial Properties',
          signatureType: 'crypto_seal',
          signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%230A192F">T. Mokoena</text></svg>',
          signedAt: '2026-08-21T15:12:00Z',
          ipAddress: '197.89.201.44 (Sandton, ZA)',
          browserFingerprint: 'Sec-Client-FP-2026-SANDTON-VERIFIED',
          statutoryDeclarationAccepted: true,
          declarationText: 'I confirm that I have reviewed the completed SANS 10139 testing records, accepted the handover certificate, and understand building owner maintenance obligations under OHS Act Section 8.'
        }
      },
      {
        id: 'stage_5_coc_issuance',
        stageNumber: 5,
        title: 'Statutory COC Issuance & Local Authority Dispatch',
        shortLabel: 'COC Issuance & Archival',
        description: 'Generation of tamper-proof SANS Certificate of Compliance with cryptographic QR verification.',
        requiredRole: 'Compliance Registrar',
        status: 'completed',
        completedAt: '2026-08-22T16:00:00Z'
      }
    ],
    dispatchedRecipients: [
      {
        name: 'City of Johannesburg Emergency Management Services',
        entity: 'Sandton Fire Safety Inspectorate',
        email: 'ems.statutory@joburg.org.za',
        dispatchedAt: '2026-08-22T16:05:00Z',
        method: 'Encrypted PDF Dispatch'
      },
      {
        name: 'Old Mutual Insure Special Risks',
        entity: 'Commercial Underwriting Audit Unit',
        email: 'firecompliance@ominsure.co.za',
        dispatchedAt: '2026-08-22T16:05:00Z',
        method: 'Automated Webhook'
      }
    ]
  }
];
