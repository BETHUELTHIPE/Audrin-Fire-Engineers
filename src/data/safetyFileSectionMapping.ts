/**
 * Statutory Section Mapping and Approved Source PDF Definitions
 * for Audrin Fire Detection Safety Files.
 *
 * Strictly adheres to:
 * 1. SANS 10139:2012 (Fire detection and alarm systems for buildings - System design, installation and servicing)
 * 2. SANS 10400-T:2011 Edition 3 (National Building Regulations Part T: Fire Protection, Act 103 of 1977)
 * Read in conjunction with the Occupational Health and Safety Act 85 of 1993 (Construction Regulations 2014).
 */

import {
  SectionDefinition,
  ApprovedSourcePDFDefinition,
  SourceComplianceClause
} from '../types/safetyFile';

/**
 * The Two Approved Statutory Source Standards (PDFs)
 */
export const APPROVED_SOURCE_PDFS: Record<'SANS_10139_2012' | 'SANS_10400_T_2011', ApprovedSourcePDFDefinition> = {
  SANS_10139_2012: {
    id: 'SANS_10139_2012',
    documentName: 'SANS 10139:2012 Edition 1.0 (Code of Practice for Fire Detection and Alarm Systems for Buildings)',
    officialReference: 'SANS 10139:2012 / SABS SC 21E',
    edition: 'Edition 1.0 (Incorporating Amendment No. 1)',
    issuingBody: 'South African Bureau of Standards (SABS) Standards Division',
    statutoryEnforcement: 'Mandatory standard enforceable via National Building Regulations Part T (Clause 4.31) and SAQCC Fire / Department of Employment and Labour.',
    scopeSummary: 'Prescribes planning, design, installation, commissioning, and routine maintenance of fire detection and fire alarm systems in and around buildings other than dwellings.',
    approvedSectionsMapped: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    mandatoryVerbatimClauses: [
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1 / Objectives & Categories',
        clauseTitle: 'System Categorization: Category L (Life), Category P (Property), Category M (Manual)',
        exactWording: 'Category L systems are automatic fire detection systems intended for the protection of life. L1: Total coverage throughout all areas; L2: Defined high-risk areas plus escape routes; L3: Escape routes and rooms opening onto escape routes; L4: Escape routes only; L5: Localized protection determined by specific fire engineering risk assessment. Category P systems are intended for the protection of property: P1: Automatic detection throughout all areas; P2: Automatic detection in specified high-hazard areas. Category M: Manual call point systems only, without automatic detection, for immediate occupant notification.',
        statutoryMandate: 'System category selection must be determined by a certified Fire Safety Specialist / Commissioner based on building fire risk.',
        applicableSection: 2
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1f / Permitted Detector Omissions',
        clauseTitle: 'Standard Automatic Detector Omissions in Category L1 & P1',
        exactWording: 'In systems designed for total coverage (Category L1 and Category P1), detectors may be omitted from: a) staff toilets, bathrooms and shower rooms; b) toilet and stairway lobbies; c) small cupboards of floor area less than 1 m²; and d) ceiling and underfloor voids of depth less than 800 mm, provided that the fire risk in the void does not warrant detection.',
        statutoryMandate: 'Omission of detectors from any area other than specified requires documented Fire Risk Assessment (HIRA) approval.',
        applicableSection: 4
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1g & 1h / Fault Reporting Thresholds',
        clauseTitle: '200-Second Circuit Fault Registration & 30-Minute Mains Disconnection Limit',
        exactWording: 'Control and indicating equipment (CIE) must register and visibly/audibly indicate a fault condition within 200 seconds of a short circuit or open circuit occurring on any detection, manual call point, or sounder circuit. Furthermore, total disconnection or failure of the primary mains electricity supply must be reported at the CIE within 30 minutes of occurrence.',
        statutoryMandate: 'All CIE installations must undergo verified fault simulation testing during commissioning.',
        applicableSection: 11
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1i & 1j / Zonal Integrity & Sheath Separation',
        clauseTitle: '1,000 m² Maximum Fault Disablement & Sounder Sheath Separation',
        exactWording: 'A single open circuit or short circuit fault on any detection circuit shall not disable automatic detection or manual notification in an area exceeding 1,000 m². Where multiple sounder circuits are provided to satisfy zoning or progressive evacuation, conductors belonging to different sounder circuits shall not be enclosed within a common cable sheath.',
        statutoryMandate: 'Addressable loops must incorporate bidirectional short-circuit line isolators conforming to SANS 10139.',
        applicableSection: 10
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1k-1p / Cabling & Containment',
        clauseTitle: 'PH30 Fire-Resistant Cabling & Segregated Containment',
        exactWording: 'All cables for fire detection and alarm circuits shall possess enhanced fire resistance conforming to PH30 classification (maintaining circuit integrity for not less than 30 minutes under standard fire exposure test conditions). Conductors shall have a cross-sectional area of not less than 1.0 mm² and shall preferably be red in outer sheath color. Fire alarm cabling shall be segregated from general mains electrical wiring and enclosed in dedicated steel or flame-retardant conduit/trunking.',
        statutoryMandate: 'Cables clipped direct to surface must utilize fire-rated metallic cable clips at centers not exceeding 300 mm.',
        applicableSection: 5
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 1r & 1s / Alarm Audibility & Dual Sounder Redundancy',
        clauseTitle: '65 dB(A) General Audibility / 75 dB(A) Bedhead & Minimum Two Sounders',
        exactWording: 'The sound pressure level produced by fire alarm notification appliances shall be not less than 65 dB(A) throughout all accessible and occupied spaces, or 5 dB(A) above any background ambient noise persisting for more than 30 seconds. In sleeping accommodations, the sound level shall achieve not less than 75 dB(A) at the bedhead with all internal doors closed. In no event shall sound pressure exceed 130 dB(A) at any accessible location. Every building installation shall incorporate not fewer than two sounders, even where a single appliance meets decibel criteria.',
        statutoryMandate: 'Statutory acoustic sound pressure surveys must be conducted using a calibrated Type 1 sound level meter.',
        applicableSection: 11
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 8-12 / Detector Spacing Limits',
        clauseTitle: '7.5m Smoke & 5.3m Heat Coverage Radius with Apex Adjustments',
        exactWording: 'On flat horizontal ceilings, the maximum horizontal distance from any point in the room to the nearest smoke detector shall not exceed 7.5 m (covering an individual detector square envelope of 10.6 m × 10.6 m, or 100 m²). For point heat detectors, the horizontal distance shall not exceed 5.3 m (individual square envelope of 7.5 m × 7.5 m, or 50 m²). In pitched or apex roofs with slope exceeding 600 mm height differential, detector coverage may increase by 1% per degree of roof slope up to a maximum increase of 25%, provided a row of detectors is sited within 600 mm of the apex ridge.',
        statutoryMandate: 'As-built device schedules must confirm that no point on the ceiling envelope exceeds statutory spacing limits.',
        applicableSection: 13
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 15 / Secondary Battery Standby Sizing',
        clauseTitle: '24-Hour Quiescent Standby + 30-Minute Full Alarm Capacity',
        exactWording: 'The secondary standby power supply (sealed valve-regulated lead-acid batteries) shall maintain the complete fire alarm system in normal quiescent condition for not less than 24 hours following mains power loss, followed immediately by continuous operation of all sounders and visual alarm devices in all alarm zones for a duration of not less than 30 minutes. The calculated battery capacity shall incorporate a 1.25 safety/aging degradation factor: Ah = ((I_quiescent × 24h) + (I_alarm × 0.5h)) × 1.25.',
        statutoryMandate: 'Autonomy battery calculations must be certified by the registered Commissioner in Section 11.',
        applicableSection: 11
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 20 & 21 / Manual Call Point Siting',
        clauseTitle: '1.4m (±0.2m) Mounting Height & Escape Route Siting',
        exactWording: 'Manual call points (MCPs) shall be mounted at a centerline height of 1.4 m above finished floor level (tolerance ±0.2 m, absolute minimum 1.2 m, maximum 1.4 m in accordance with universal access provisions). Manual call points shall be positioned on escape routes, particularly at every exit leading to the open air and at all storey exit doorways to stair enclosures.',
        statutoryMandate: 'No person within the building shall have to travel more than 45 m to reach the nearest manual call point.',
        applicableSection: 9
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 24 & Annex E / Statutory Commissioning & COC',
        clauseTitle: 'Statutory Commissioning Procedure & Certificate of Compliance Execution',
        exactWording: 'Upon physical completion of installation and verified pre-commissioning testing, the fire detection system shall undergo formal statutory commissioning by an accredited SAQCC Fire Detection Commissioner. The Commissioner shall verify design adherence, battery calculations, audibility, cause-and-effect interfaces, and issue the official SANS 10139 Certificate of Compliance (COC). The safety file dossier shall not be legally accepted or classified as compliant without the valid COC and Commissioner digital seal.',
        statutoryMandate: 'Only SAQCC registered Commissioners in good standing are authorized to sign Section 14 statutory COC certificates.',
        applicableSection: 14
      },
      {
        standard: 'SANS_10139_2012',
        clauseRef: 'Clause 25 & Annex F / Fire Detection Site Logbook',
        clauseTitle: 'Statutory Site Logbook & Responsible Person Maintenance Obligations',
        exactWording: 'A dedicated, tamper-proof Fire Alarm System Logbook shall be maintained at the primary Control and Indicating Equipment location. The designated site Responsible Person shall record: a) weekly manual call point rotational test outcomes; b) monthly ancillary device operations; c) quarterly and annual service visits by accredited technicians; d) false alarms, unwanted alarms, and faults; and e) any system alterations, isolations, or temporary disconnections.',
        statutoryMandate: 'Failure to maintain the site fire logbook constitutes a breach of OHS Act 85 of 1993 Section 8 duties.',
        applicableSection: 16
      }
    ]
  },

  SANS_10400_T_2011: {
    id: 'SANS_10400_T_2011',
    documentName: 'SANS 10400-T:2011 Edition 3 (The Application of the National Building Regulations Part T: Fire Protection)',
    officialReference: 'SANS 10400-T:2011 / SABS 0400-T',
    edition: 'Edition 3 (Approved October 2011)',
    issuingBody: 'South African Bureau of Standards (SABS) & Department of Trade, Industry and Competition',
    statutoryEnforcement: 'Supreme statutory regulation promulgated under the National Building Regulations and Building Standards Act, 1977 (Act No. 103 of 1977).',
    scopeSummary: 'Prescribes deemed-to-satisfy requirements for compliance with Functional Regulations T1 and T2 of the National Building Regulations regarding life safety, structural fire stability, compartmentalization, escape routes, and fire protection equipment.',
    approvedSectionsMapped: [2, 3, 4, 8, 9, 10, 11, 12, 13],
    mandatoryVerbatimClauses: [
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Regulation T1 & T2',
        clauseTitle: 'General Safety Requirement & Statutory Offences for Non-Compliance',
        exactWording: 'Any building shall be so designed, constructed and equipped that in the event of fire: a) the occupants of the building will be protected and be enabled to evacuate safely; b) the spread and intensity of fire and smoke will be minimized; c) structural stability will be maintained for such period as is required; and d) the generation and spread of dangerous smoke and toxic gases will be controlled. Failure to comply with Regulation T1 or the obstruction of any escape route constitutes a criminal offence under Act 103 of 1977.',
        statutoryMandate: 'All fire safety installations must conform strictly to prescriptive deemed-to-satisfy rules or an approved Rational Fire Design.',
        applicableSection: 2
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Clause 4.4 / Table 3 & 6',
        clauseTitle: 'Maximum Division Areas & Fire Compartmentalization Limits',
        exactWording: 'No building shall exceed the maximum permissible fire division area prescribed in Table 3 (e.g., Occupancy E1/E2/E3 hospital: 1,250 m²; J1 high-hazard commercial storage: 5,000 m² unsprinklered or 10,000 m² multi-storey sprinklered). Division walls separating compartments shall provide fire resistance of not less than 120 minutes and shall extend structurally through ceilings to the underside of non-combustible roof decks.',
        statutoryMandate: 'Fire detection zones must align with physical fire compartment divisions to ensure coordinated evacuation.',
        applicableSection: 13
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Clause 4.10 / Table 7 & SANS 1253',
        clauseTitle: 'Fire Doors, Magnetic Hold-Open Releases & Interlocks',
        exactWording: 'Fire door assemblies installed in division walls, protected corridors, and stair enclosures shall comply with SANS 1253 (Class A 60 min, Class B 120 min, Class C 120 min, Class D 120 min, Class E 30 min, Class F 30 min). Any fire door held open by electromagnetic devices shall be released automatically upon: a) activation of any fire detector or manual call point; b) failure of mains power supply; or c) actuation of a local manual release switch.',
        statutoryMandate: 'Magnetic door holders and smoke damper actuators must be connected to fail-safe output relays on the fire alarm panel.',
        applicableSection: 11
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Clause 4.16 - 4.21 / Table 10',
        clauseTitle: 'Occupant Escape Travel Distances & Clear Headroom Widths',
        exactWording: 'The maximum travel distance from any point in a building to the nearest escape door leading to a protected route or open air shall not exceed 45 m (extended to 60 m in buildings fitted with an approved automatic sprinkler system conforming to SANS 10287). The feeder route travel distance within any room shall not exceed 15 m. Dead-end corridor length shall not exceed 10 m. Clear vertical headroom along escape paths shall be not less than 2.0 m, and clear doorway widths shall be not less than 1,000 mm (1,500 mm for disability universal access).',
        statutoryMandate: 'Emergency evacuation plans and detector layouts must demonstrate unobstructed escape access.',
        applicableSection: 2
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Clause 4.31',
        clauseTitle: 'Mandatory Occupancies Requiring Fire Detection & Alarm Systems',
        exactWording: 'An approved automatic fire detection and alarm system conforming to SANS 10139 shall be installed in: a) any occupancy classified as F1 (large shop) where the floor area exceeds 500 m²; b) all occupancies classified as H1 (hotel), H2 (dormitory), E2 (hospital), or E3 (institution), irrespective of height or floor area; c) any building having a total height exceeding 30 m; and d) any single storey exceeding 5,000 m² in division area.',
        statutoryMandate: 'Mandatory statutory requirement under National Building Regulations; cannot be waived without rational design approval.',
        applicableSection: 2
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Clause 4.34 - 4.37 / Table 11',
        clauseTitle: 'Water Fire-Fighting Systems & Portable Extinguisher Density',
        exactWording: 'Fire hose reels conforming to SANS 543 shall be provided at the rate of one per 500 m² on every storey. Fire hydrants conforming to SANS 1128-1 shall be provided at the rate of one per 1,000 m² for buildings exceeding 12 m in height. Portable fire extinguishers conforming to SANS 1910 and serviced to SANS 1475-1 shall be provided according to occupancy risk density (e.g. J1: 1 per 100 m²; Commercial offices G1: 1 per 200 m²).',
        statutoryMandate: 'All extinguishing appliances must be accessible within a 15 m travel distance.',
        applicableSection: 8
      },
      {
        standard: 'SANS_10400_T_2011',
        clauseRef: 'Annex B & Regulation A19',
        clauseTitle: 'Rational Fire Safety Engineering Design Framework',
        exactWording: 'Where a building does not satisfy the prescriptive deemed-to-satisfy rules of SANS 10400-T, a Rational Fire Safety Engineering Design shall be submitted by a Competent Person (Fire Engineering) registered with ECSA in terms of the Engineering Profession Act. The design shall follow the BS 7974 framework encompassing Qualitative Design Review (QDR), Quantitative Subsystem Analysis (SS1 to SS6), and formal local fire authority approval.',
        statutoryMandate: 'Regulation A19 statutory appointment letter and Rational Fire Report must be included in Section 3.',
        applicableSection: 3
      }
    ]
  }
};

/**
 * 16 Statutory Section Definitions & Document Mapping Matrix
 */
export const STATUTORY_SECTION_MAPPINGS: SectionDefinition[] = [
  {
    sectionNumber: 1,
    title: 'Company and Project Information',
    category: 'Administrative',
    standardReference: 'OHS Act 85 of 1993 Section 8 / CIPC Statutory Filing',
    governingStandard: 'OHS_ACT_85_1993',
    description: 'Statutory company registrations, tax compliance, COIDA letter of good standing, project directory, organogram, and 24/7 emergency response contacts.',
    iconName: 'Building',
    signatoryRolesRequired: ['audrinProjectManager', 'clientRepresentative'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC01_CORP_PROFILE',
        title: 'Audrin Fire Engineers Statutory Corporate Profile & Credentials',
        documentNumberPattern: 'AFE-SF-DOC-01.01',
        standardClause: 'OHS Act Section 8 / CIPC K2026089596',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Audrin Operations Manager',
        description: 'CIPC company registration certificate, SARS Tax Clearance Pin, COIDA Letter of Good Standing, and B-BBEE Level 1 scorecard.',
        exactComplianceWording: 'Statutory compliance pack verifying Audrin Fire Engineers (Pty) Ltd (Reg K2026089596) legal standing to execute fire detection engineering works.',
        isMandatory: true
      },
      {
        templateCode: 'SEC01_PROJECT_DIRECTORY',
        title: 'Project Directory, Organogram & 24/7 Emergency Escalation Plan',
        documentNumberPattern: 'AFE-SF-DOC-01.02',
        standardClause: 'OHS Act General Safety Reg 3 / SANS 10139',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Project Manager / Lead Technician',
        description: 'Complete escalation tree with 24h control room, standby engineer, local municipal fire department, and site health & safety contacts.',
        exactComplianceWording: 'Mandatory 24-hour emergency communication protocol ensuring immediate dispatch and command hierarchy during fire emergencies.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-1-1', clauseRef: 'CIPC Act 71/2008', requirementText: 'Valid CIPC Registration Certificate appended', isMandatory: true, standard: 'OHS_ACT_85_1993' },
      { id: 'chk-1-2', clauseRef: 'COIDA Act 130/1993', requirementText: 'Compensation Commissioner Letter of Good Standing current and unexpired', isMandatory: true, standard: 'OHS_ACT_85_1993' },
      { id: 'chk-1-3', clauseRef: 'GSR 3', requirementText: 'Site emergency telephone numbers and local fire station verified', isMandatory: true, standard: 'OHS_ACT_85_1993' }
    ]
  },

  {
    sectionNumber: 2,
    title: 'Scope of Fire Detection Work',
    category: 'Technical',
    standardReference: 'SANS 10400-T:2011 Clause 4.31 & SANS 10139:2012 Clause 1',
    governingStandard: 'SANS_10139_2012',
    description: 'Detailed scope of works, SANS 10400-T occupancy classification, Category L/P/M system selection, physical boundaries, and interface demarcations.',
    iconName: 'FileText',
    signatoryRolesRequired: ['projectManager', 'commissioner'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC02_SCOPE_SPEC',
        title: 'SANS 10400-T Building Classification & Fire Alarm Category Selection Specification',
        documentNumberPattern: 'AFE-SF-DOC-02.01',
        standardClause: 'SANS 10400-T Clause 4.31 & SANS 10139 Clause 1',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Fire Engineer / Commissioner',
        description: 'Official determination of occupancy category, system category (L1/L2/L3/L4/L5/P1/P2/M), total loop count, and device census.',
        exactComplianceWording: 'SANS 10400-T deemed-to-satisfy compliance mandate requiring automatic fire detection and alarm for the designated occupancy classification.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-2-1', clauseRef: 'SANS 10400-T 4.31', requirementText: 'Building classification (e.g. J1, H1, E2, F1) formally designated', isMandatory: true, standard: 'SANS_10400_T_2011' },
      { id: 'chk-2-2', clauseRef: 'SANS 10139 Clause 1', requirementText: 'Fire detection category (L1/L2/L3/L4/L5/P1/P2/M) explicitly selected', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 3,
    title: 'Health and Safety Documents',
    category: 'Statutory',
    standardReference: 'OHS Act 85 of 1993 Section 16.2, Construction Regulations 2014',
    governingStandard: 'OHS_ACT_85_1993',
    description: 'Statutory appointments under the Occupational Health and Safety Act, Regulation 8.2 supervisor appointments, and Site Health & Safety Plan.',
    iconName: 'Shield',
    signatoryRolesRequired: ['audrinProjectManager', 'clientSafetyOfficer'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC03_OHS_APPOINTMENTS',
        title: 'OHS Act Statutory Safety Appointments (Section 16.2 / Regulation 8.2)',
        documentNumberPattern: 'AFE-SF-DOC-03.01',
        standardClause: 'OHS Act 85 of 1993 Section 16.2 & CR 8.2',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Managing Director & Site Safety Officer',
        description: 'Delegation of statutory health and safety responsibilities to the site supervisor and fire safety engineer.',
        exactComplianceWording: 'Statutory appointment letters executed under Section 16.2 and Construction Regulation 8.2 of the OHS Act 85 of 1993.',
        isMandatory: true
      },
      {
        templateCode: 'SEC03_HS_PLAN',
        title: 'Site-Specific Fire Engineering Health & Safety Plan',
        documentNumberPattern: 'AFE-SF-DOC-03.02',
        standardClause: 'OHS Act Construction Regulations 2014 Reg 7',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Safety Officer',
        description: 'Health & safety rules covering electrical work, scaffolding, working at heights, PPE requirements, and incident reporting.',
        exactComplianceWording: 'Site-specific health and safety plan compliant with Construction Regulation 7(1) approved prior to physical commencement.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-3-1', clauseRef: 'OHS Act 16.2', requirementText: 'Section 16.2 appointment signed and accepted by appointee', isMandatory: true, standard: 'OHS_ACT_85_1993' },
      { id: 'chk-3-2', clauseRef: 'CR 7(1)', requirementText: 'Health & Safety plan approved by client health and safety agent', isMandatory: true, standard: 'OHS_ACT_85_1993' }
    ]
  },

  {
    sectionNumber: 4,
    title: 'Risk Assessments',
    category: 'Statutory',
    standardReference: 'OHS Act Construction Regulations Reg 9 & SANS 10139 Clause 1f',
    governingStandard: 'OHS_ACT_85_1993',
    description: 'Hazard Identification and Risk Assessments (HIRA), working at heights risk assessments, and detector omission fire risk assessments.',
    iconName: 'AlertTriangle',
    signatoryRolesRequired: ['technician', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC04_BASELINE_HIRA',
        title: 'Baseline Fire Detection Installation Hazard Identification & Risk Assessment (HIRA)',
        documentNumberPattern: 'AFE-SF-DOC-04.01',
        standardClause: 'OHS Act CR 9(1) & SANS 10139 Clause 1f',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Risk Assessor / Lead Technician',
        description: 'Comprehensive assessment of hazards including electrical shock, ladder/scaffold falls, dust generation, and power tool operation.',
        exactComplianceWording: 'Hazard identification and risk evaluation conducted in compliance with Construction Regulation 9(1) with mandatory risk control hierarchies.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-4-1', clauseRef: 'CR 9(1)', requirementText: 'Risk matrix evaluated with likelihood and severity ratings', isMandatory: true, standard: 'OHS_ACT_85_1993' },
      { id: 'chk-4-2', clauseRef: 'SANS 10139 1f', requirementText: 'Omissions (if any) justified via documented fire risk assessment', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 5,
    title: 'Method Statements',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 1k-1p (PH30 Cabling & Containment)',
    governingStandard: 'SANS_10139_2012',
    description: 'Safe work procedures for fire-rated cabling installation, detector head termination, aspirating pipework, and panel interfacing.',
    iconName: 'ClipboardList',
    signatoryRolesRequired: ['technician', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC05_METHOD_CABLING',
        title: 'Method Statement: Fire-Rated PH30 Cable Containment, Pulling & Termination',
        documentNumberPattern: 'AFE-SF-DOC-05.01',
        standardClause: 'SANS 10139:2012 Clause 1k-1p',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Fire Technician',
        description: 'Standard safe operating procedure for installing PH30 enhanced fire-resistant cabling, fire stopping penetrations, and metallic clip spacing.',
        exactComplianceWording: 'Step-by-step engineering method statement enforcing PH30 cable integrity, physical separation from power cables, and Class A wiring.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-5-1', clauseRef: 'SANS 10139 1k', requirementText: 'Fire-resistant cable specification (PH30 / 1.0 mm² red) confirmed', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-5-2', clauseRef: 'SANS 10139 1p', requirementText: 'Cable containment separation from power cables (> 300 mm) verified', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 6,
    title: 'Technician Competency Records',
    category: 'Statutory',
    standardReference: 'SAQCC Fire Registration Scheme / SANS 10139 Clause 24',
    governingStandard: 'SAQCC_COMMISSIONER',
    description: 'Verified South African Qualification and Certification Committee (SAQCC) Fire registration cards for technicians, installers, and commissioners.',
    iconName: 'Award',
    signatoryRolesRequired: ['technician', 'commissioner'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC06_SAQCC_CARDS',
        title: 'SAQCC Fire Technician & Commissioner Registration Credential Cards',
        documentNumberPattern: 'AFE-SF-DOC-06.01',
        standardClause: 'SAQCC-Fire D&GS Regulations / SANS 10139',
        governingStandard: 'SAQCC_COMMISSIONER',
        requiredRole: 'Certified SAQCC Personnel',
        description: 'Active SAQCC registration cards showing authorized levels (Installer, Cabler, Designer, Commissioner) and expiry dates.',
        exactComplianceWording: 'Verification that all fire detection works are executed exclusively by individuals registered and licensed by SAQCC Fire.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-6-1', clauseRef: 'SAQCC Regs', requirementText: 'Lead installer card active and unexpired', isMandatory: true, standard: 'SAQCC_COMMISSIONER' },
      { id: 'chk-6-2', clauseRef: 'SANS 10139 24', requirementText: 'Designated Commissioner holds valid SAQCC Commissioner status', isMandatory: true, standard: 'SAQCC_COMMISSIONER' }
    ]
  },

  {
    sectionNumber: 7,
    title: 'Tools and Calibration Records',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 1r & Clause 8.2 / SANAS Accreditation',
    governingStandard: 'SANS_10139_2012',
    description: 'Calibration certificates for Megger insulation testers, digital multimeters, Type 1 sound level meters, and smoke testing aerosols.',
    iconName: 'Wrench',
    signatoryRolesRequired: ['technician'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC07_CALIBRATION_CERTS',
        title: 'Calibrated Test Equipment Certificates (Insulation Resistance & Sound Meter)',
        documentNumberPattern: 'AFE-SF-DOC-07.01',
        standardClause: 'SANS 10139 Clause 1r & SANAS ISO 17025',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Quality Inspector',
        description: 'Annual calibration certificates from accredited SANAS calibration laboratories verifying accuracy within statutory limits.',
        exactComplianceWording: 'Calibration certificates for 500V DC insulation tester and Type 1 sound level meter used in statutory certification.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-7-1', clauseRef: 'SANAS ISO 17025', requirementText: 'Sound level meter calibration unexpired (< 12 months)', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-7-2', clauseRef: 'SANS 10139 8.2', requirementText: 'Insulation tester 500V DC calibration certificate valid', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 8,
    title: 'Pre-Work Inspections',
    category: 'Technical',
    standardReference: 'OHS Act Section 8 / SANS 10400-T Clause 4.34-4.37',
    governingStandard: 'OHS_ACT_85_1993',
    description: 'Pre-work site condition reports, existing building penetrations, presence of existing fire equipment, and containment audits.',
    iconName: 'Camera',
    signatoryRolesRequired: ['technician', 'clientRepresentative'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC08_PRE_WORK_INSPECTION',
        title: 'Pre-Work Fire Detection Safety & System Condition Inspection Report',
        documentNumberPattern: 'AFE-SF-DOC-08.01',
        standardClause: 'OHS Act Section 8(2)(e)',
        governingStandard: 'OHS_ACT_85_1993',
        requiredRole: 'Lead Technician',
        description: 'Inspection record detailing site status prior to physical cable pulling, ceiling void inspections, and existing structural penetrations.',
        exactComplianceWording: 'Baseline inspection report documenting physical condition of premises prior to installation works.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-8-1', clauseRef: 'OHS Act 8(2)', requirementText: 'Ceiling void accessibility and existing fire barriers inspected', isMandatory: true, standard: 'OHS_ACT_85_1993' }
    ]
  },

  {
    sectionNumber: 9,
    title: 'Post-Work Inspections',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 20-21 (MCP Siting & Detector Installation)',
    governingStandard: 'SANS_10139_2012',
    description: 'Post-work quality verification, call point mounting height audits (1.4m ±0.2m), ceiling clearances, and penetrations fire-stopping.',
    iconName: 'CheckCircle2',
    signatoryRolesRequired: ['technician', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC09_POST_WORK_INSPECTION',
        title: 'Post-Work Installation Completion & Visual Quality Audit Schedule',
        documentNumberPattern: 'AFE-SF-DOC-09.01',
        standardClause: 'SANS 10139:2012 Clause 20, 21 & SANS 10400-T',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Technician',
        description: 'Detailed physical audit verifying: MCP height 1.4 m (±0.2 m), detector clearance from walls (> 500 mm), and penetration seal integrity.',
        exactComplianceWording: 'Post-installation quality verification schedule confirming compliance with physical siting criteria of SANS 10139 Clauses 20 and 21.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-9-1', clauseRef: 'SANS 10139 20', requirementText: 'Manual call point heights measured at 1.4 m (tolerance ±0.2 m)', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-9-2', clauseRef: 'SANS 10139 8.1', requirementText: 'Smoke detector clearance from walls/partitions (min 500 mm) verified', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 10,
    title: 'Installation and Testing Records',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 1i-1j & Clause 8.2 (Loop Continuity & Insulation)',
    governingStandard: 'SANS_10139_2012',
    description: 'Loop continuity test schedules, 500V DC insulation resistance logs (>100MΩ), end-of-line resistance readings, and voltage drop calculations.',
    iconName: 'Zap',
    signatoryRolesRequired: ['technician', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC10_LOOP_TEST_LOGS',
        title: 'Electrical Loop Test Records (Insulation Resistance & Continuity Schedules)',
        documentNumberPattern: 'AFE-SF-DOC-10.01',
        standardClause: 'SANS 10139:2012 Clause 8.2',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Fire Technician',
        description: 'Comprehensive test results for all detection loops: Conductor loop resistance (Ω), screen continuity, and 500V DC Megger insulation test (> 100 MΩ).',
        exactComplianceWording: 'Electrical test schedules confirming circuit continuity and dielectric insulation integrity in compliance with SANS 10139 Clause 8.2.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-10-1', clauseRef: 'SANS 10139 8.2', requirementText: 'Insulation resistance > 100 MΩ between conductors and earth at 500V DC', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-10-2', clauseRef: 'SANS 10139 1i', requirementText: 'Loop return continuity verified for Class A closed physical circuit', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 11,
    title: 'Commissioning Records',
    category: 'Statutory',
    standardReference: 'SANS 10139:2012 Clause 1g, 1h, 1r, 1s, 15 & Clause 24',
    governingStandard: 'SANS_10139_2012',
    description: 'Full cause-and-effect matrix testing, 200s circuit fault checks, 30min mains disconnection tests, battery sizing calculations, and acoustic decibel surveys.',
    iconName: 'Cpu',
    signatoryRolesRequired: ['commissioner', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC11_COMMISSIONING_PACK',
        title: 'SANS 10139 Full System Commissioning & Cause-and-Effect Test Pack',
        documentNumberPattern: 'AFE-SF-DOC-11.01',
        standardClause: 'SANS 10139:2012 Clause 24 & Annex E',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'SANS 10139 Commissioner',
        description: 'Complete commissioning protocol validating detector activation, sounder sync, HVAC trip interlocks, magnetic door release, and BMS gateway signals.',
        exactComplianceWording: 'Commissioning verification confirming total system functionality, cause-and-effect matrix compliance, and fault registration within 200 seconds.',
        isMandatory: true
      },
      {
        templateCode: 'SEC11_BATTERY_CALCS',
        title: 'Secondary Power Supply Autonomy & Standby Battery Sizing Calculation Sheet',
        documentNumberPattern: 'AFE-SF-DOC-11.02',
        standardClause: 'SANS 10139:2012 Clause 15',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Design Engineer / Commissioner',
        description: 'Mathematical battery sizing verifying 24 hours quiescent standby followed by 30 minutes continuous full evacuation alarm with 1.25 aging factor.',
        exactComplianceWording: 'Secondary battery sizing calculation Ah = ((I_quiescent × 24h) + (I_alarm × 0.5h)) × 1.25 conforming to SANS 10139 Clause 15.',
        isMandatory: true
      },
      {
        templateCode: 'SEC11_SOUND_AUDIT',
        title: 'Acoustic Sound Pressure Survey Report (65 dB(A) General / 75 dB(A) Bedhead)',
        documentNumberPattern: 'AFE-SF-DOC-11.03',
        standardClause: 'SANS 10139:2012 Clause 1r & 1s',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Technician / Commissioner',
        description: 'Decibel survey across all occupied zones demonstrating min 65 dB(A) or 5 dB(A) above ambient, min two sounders, and max 130 dB(A).',
        exactComplianceWording: 'Calibrated acoustic audibility certification under SANS 10139 Clause 1r and 1s.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-11-1', clauseRef: 'SANS 10139 1g', requirementText: 'CIE registered fault within 200s of circuit open/short fault', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-11-2', clauseRef: 'SANS 10139 1h', requirementText: 'Mains electricity disconnection reported within 30 minutes', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-11-3', clauseRef: 'SANS 10139 15', requirementText: 'Battery capacity calculation satisfies 24h standby + 30min alarm × 1.25', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-11-4', clauseRef: 'SANS 10139 1r', requirementText: 'Minimum 65 dB(A) achieved throughout all occupied zones', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 12,
    title: 'Defects and Corrective Actions',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 24.3 & OHS Act Section 24',
    governingStandard: 'SANS_10139_2012',
    description: 'Pre-commissioning snagging items, remedial action clearance logs, and corrective action sign-offs.',
    iconName: 'Tool',
    signatoryRolesRequired: ['technician', 'projectManager'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC12_DEFECTS_REGISTER',
        title: 'Snagging, Defect Rectification & Remedial Corrective Actions Clearance Log',
        documentNumberPattern: 'AFE-SF-DOC-12.01',
        standardClause: 'SANS 10139:2012 Clause 24.3',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Quality Inspector / Project Manager',
        description: 'Official schedule of all identified installation snags, corrective actions implemented, re-inspection dates, and clearance signatures.',
        exactComplianceWording: 'Defect rectification log verifying that all non-conformances have been cleared prior to statutory handover.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-12-1', clauseRef: 'SANS 10139 24.3', requirementText: 'All critical and major installation defects cleared and re-tested', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 13,
    title: 'Drawings and Device Schedules',
    category: 'Technical',
    standardReference: 'SANS 10139:2012 Clause 8-12 & SANS 10400-T Clause 4.4',
    governingStandard: 'SANS_10139_2012',
    description: 'As-built CAD fire alarm layout drawings, zone plan schematics, cable routing diagrams, and comprehensive loop device point schedules.',
    iconName: 'Layers',
    signatoryRolesRequired: ['projectManager', 'commissioner'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC13_AS_BUILT_CAD',
        title: 'As-Built Fire Alarm System Drawings, Zone Plans & Cable Routing Schematics',
        documentNumberPattern: 'AFE-SF-DOC-13.01',
        standardClause: 'SANS 10139:2012 Clause 24.2 & SANS 10400-T',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'CAD Draughtsperson / Lead Engineer',
        description: 'Complete set of as-built architectural plans displaying every smoke detector, heat detector, manual call point, sounder beacon, and CIE location with zone boundaries.',
        exactComplianceWording: 'As-built drawings with standard SANS symbology (Blue Smoke, Black Heat, Red Sounder, Green MCP) and zone boundary demarcation.',
        isMandatory: true
      },
      {
        templateCode: 'SEC13_DEVICE_SCHEDULE',
        title: 'Comprehensive Addressable Device Loop Point Schedule & Configuration Matrix',
        documentNumberPattern: 'AFE-SF-DOC-13.02',
        standardClause: 'SANS 10139:2012 Clause 8',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Commissioning Specialist',
        description: 'Spreadsheet list of all addressable devices by Loop, Address, Device Type, Physical Location Text, Serial Number, and Analogue Sensitivity Profile.',
        exactComplianceWording: 'Complete device allocation schedule for client asset register and routine testing rotation.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-13-1', clauseRef: 'SANS 10139 24.2', requirementText: 'Zone plan mounted adjacent to Control and Indicating Equipment (CIE)', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-13-2', clauseRef: 'SANS 10400-T 4.4', requirementText: 'Zone boundaries align with structural fire division walls', isMandatory: true, standard: 'SANS_10400_T_2011' }
    ]
  },

  {
    sectionNumber: 14,
    title: 'SANS 10139 COC',
    category: 'Statutory',
    standardReference: 'SANS 10139:2012 Clause 24 & Annex E / SAQCC Commissioner Scheme',
    governingStandard: 'SANS_10139_2012',
    description: 'Official statutory SANS 10139 Certificate of Compliance (COC) executed and sealed by an accredited SAQCC Commissioner.',
    iconName: 'FileCheck',
    signatoryRolesRequired: ['commissioner'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC14_STATUTORY_COC',
        title: 'SANS 10139 Certificate of Compliance (COC)',
        documentNumberPattern: 'AFE-SF-DOC-14.01',
        standardClause: 'SANS 10139:2012 Clause 24 & Annex E',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Accredited SAQCC Commissioner',
        description: 'The supreme statutory certificate required by South African municipal fire authorities and insurance underwriters confirming full compliance.',
        exactComplianceWording: 'Official Certificate of Compliance issued in terms of SANS 10139:2012 certifying that the fire detection system has been designed, installed, and commissioned in accordance with national standards.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-14-1', clauseRef: 'SANS 10139 Annex E', requirementText: 'Certificate signed by accredited SAQCC Commissioner with active card number', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-14-2', clauseRef: 'SANS 10139 24', requirementText: 'System category, building classification, and deviations (if any) declared', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  },

  {
    sectionNumber: 15,
    title: 'Training and Handover Records',
    category: 'Handover',
    standardReference: 'SANS 10139:2012 Clause 25.1 & OHS Act Section 8(2)(e)',
    governingStandard: 'SANS_10139_2012',
    description: 'Client Responsible Person training records, system operation handbooks, emergency callout protocols, and formal handover certificates.',
    iconName: 'UserCheck',
    signatoryRolesRequired: ['projectManager', 'clientRepresentative'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC15_TRAINING_REGISTER',
        title: 'Client Responsible Person Training & Practical Handover Register',
        documentNumberPattern: 'AFE-SF-DOC-15.01',
        standardClause: 'SANS 10139:2012 Clause 25.1 & OHS Act 8(2)',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Lead Commissioning Engineer & Client Trainees',
        description: 'Record of training conducted with client personnel covering panel silence/reset, weekly call point testing, fault logging, and brigade dispatch.',
        exactComplianceWording: 'Training attendance register and practical demonstration sign-off in accordance with SANS 10139 Clause 25.1.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-15-1', clauseRef: 'SANS 10139 25.1', requirementText: 'Client designated Responsible Person trained on panel silence, reset and weekly test', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-15-2', clauseRef: 'OHS Act 8(2)', requirementText: 'Operation and maintenance manual provided to client', isMandatory: true, standard: 'OHS_ACT_85_1993' }
    ]
  },

  {
    sectionNumber: 16,
    title: 'Fire-System Logbook',
    category: 'Statutory',
    standardReference: 'SANS 10139:2012 Clause 25.2 & Annex F',
    governingStandard: 'SANS_10139_2012',
    description: 'Official SANS 10139 Site Fire Detection Logbook for recording weekly rotational tests, monthly inspections, quarterly service visits, and false alarm logs.',
    iconName: 'BookOpen',
    signatoryRolesRequired: ['technician', 'clientRepresentative'],
    mandatoryDocumentTemplates: [
      {
        templateCode: 'SEC16_SITE_LOGBOOK',
        title: 'Official SANS 10139 Site Fire Detection Logbook (AFE-LB)',
        documentNumberPattern: 'AFE-SF-DOC-16.01',
        standardClause: 'SANS 10139:2012 Clause 25.2 & Annex F',
        governingStandard: 'SANS_10139_2012',
        requiredRole: 'Client Responsible Person / Lead Technician',
        description: 'The statutory permanent logbook situated at the fire alarm panel for mandatory logging of all events, tests, false alarms, and maintenance visits.',
        exactComplianceWording: 'Statutory fire detection and fire alarm system logbook conforming to SANS 10139 Annex F, required to be kept on site under OHS Act 85 of 1993.',
        isMandatory: true
      }
    ],
    complianceChecklist: [
      { id: 'chk-16-1', clauseRef: 'SANS 10139 Annex F', requirementText: 'Logbook initialized on site at Control and Indicating Equipment (CIE)', isMandatory: true, standard: 'SANS_10139_2012' },
      { id: 'chk-16-2', clauseRef: 'SANS 10139 25.2', requirementText: 'Schedule for weekly manual call point rotational testing established', isMandatory: true, standard: 'SANS_10139_2012' }
    ]
  }
];
