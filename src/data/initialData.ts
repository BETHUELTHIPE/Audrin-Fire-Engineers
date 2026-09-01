import {
  ServiceItem,
  HowWeWorkStep,
  FAQItem,
  GalleryItem,
  EmailTemplate,
  ServiceRequest,
  AuditEvent,
  ConditionReport,
  ReportPhotoSelection,
  ConditionReportMetrics,
  TechnicalDocument,
  PermittedFileTypeConfig,
  QuarantinedFileRecord,
  DocumentSystemMetrics
} from '../types';
import { INITIAL_PERMITTED_FILE_TYPES } from '../utils/fileTypes';

export const COMPANY_DETAILS = {
  legalName: 'AUDRIN FIRE ENGINEERS (PTY) LTD',
  displayName: 'Audrin Fire Engineers',
  managingDirector: 'Bethuel Moukangwe',
  directorTitle: 'Managing Director',
  tagline: 'Early Detection. Clear Warning. Safer Buildings.',
  registrationNumber: 'K2026089596',
  physicalAddress: '27 Tshivhase Street, Pretoria West, Pretoria, 0008, South Africa',
  telephone: '071 415 6665',
  telephoneDisplay: '071 415 6665',
  email: 'bethuelmoukangwe8@gmail.com',
  operatingHours: 'Monday–Sunday: 07:00–20:00',
  serviceCoverage: 'Pretoria, Johannesburg, Gauteng & National Commercial Projects across South Africa',
  standardAlignment: 'SANS 10139 (Fire detection and alarm systems for buildings - System design, installation and servicing)'
};

export const HOW_WE_WORK_STEPS: HowWeWorkStep[] = [
  {
    stepNumber: 1,
    title: 'Enquiry & Consultation',
    summary: 'Initial review of building occupancy, project requirements, and site scope.',
    detailedDescription: 'We review the initial client enquiry, building layout, occupancy classification, and project requirements to determine the necessary assessment pathway.',
    typicalDeliverables: ['Enquiry acknowledgement', 'Preliminary information checklist', 'Scope confirmation'],
    clientResponsibilities: ['Provide building floor plans or sketches', 'Identify key site contact', 'Specify known fire strategy requirements'],
    iconName: 'MessageSquare'
  },
  {
    stepNumber: 2,
    title: 'Site Survey & Assessment',
    summary: 'On-site technical evaluation of ceiling heights, zones, cable paths, and ambient conditions.',
    detailedDescription: 'A structured technical site inspection is conducted to assess building construction, detector coverage suitability, ambient interference risks, and cable containment routes.',
    typicalDeliverables: ['Site survey report', 'Risk and coverage evaluation', 'Existing equipment condition log'],
    clientResponsibilities: ['Ensure full plant room, ceiling, and riser access', 'Provide escort/security clearances if required'],
    iconName: 'ClipboardCheck'
  },
  {
    stepNumber: 3,
    title: 'System Design & Specification',
    summary: 'Formulation of system category, zoning layout, detector selection, and cause-and-effect matrix.',
    detailedDescription: 'Our design team prepares device layouts, power supply calculations, sounder audibility verification, loop load calculations, and cause-and-effect logic matrices tailored to the site.',
    typicalDeliverables: ['System layout drawings', 'Cause-and-effect matrix', 'Device schedule', 'Battery standby calculations'],
    clientResponsibilities: ['Review and sign off on fire strategy interfaces (e.g. HVAC shutdown, access control release)'],
    iconName: 'DraftingCompass'
  },
  {
    stepNumber: 4,
    title: 'Scope & Quotation',
    summary: 'Transparent itemised pricing based on approved technical specifications.',
    detailedDescription: 'We issue an itemised proposal detailing equipment specifications, labour scope, installation timeline, and milestone terms.',
    typicalDeliverables: ['Formal itemised quotation', 'Bill of quantities (BOQ)', 'Implementation schedule'],
    clientResponsibilities: ['Commercial approval and appointment confirmation', 'Site readiness scheduling'],
    iconName: 'FileText'
  },
  {
    stepNumber: 5,
    title: 'Installation',
    summary: 'Precision cable routing, device mounting, and panel wiring adhering to technical practices.',
    detailedDescription: 'Fire-resistant cabling is installed using compliant fixings, followed by detection devices, manual call points, sounders, interface modules, and main control panel termination.',
    typicalDeliverables: ['Progress inspection notes', 'Cable insulation resistance tests', 'As-installed device tagging'],
    clientResponsibilities: ['Provide uninterrupted access during work windows', 'Coordinate with building tenants where necessary'],
    iconName: 'Wrench'
  },
  {
    stepNumber: 6,
    title: 'Testing & Commissioning',
    summary: 'Rigorous point-to-point device verification, decibel audibility testing, and cause-and-effect simulation.',
    detailedDescription: 'Every single smoke/heat detector, manual call point, and sounder is individually tested for signal reporting, zone mapping, fault monitoring, and interface trip response.',
    typicalDeliverables: ['Point-to-point test record', 'Audibility decibel survey log', 'Commissioning documentation'],
    clientResponsibilities: ['Notify building occupants of sounder testing', 'Coordinate interface witness parties (e.g. lift/HVAC contractor)'],
    iconName: 'Activity'
  },
  {
    stepNumber: 7,
    title: 'Handover & Planned Maintenance',
    summary: 'Comprehensive operator logbook setup, responsible person training, and scheduled servicing.',
    detailedDescription: 'We conduct training for the designated responsible person on daily panel monitoring, weekly testing routines, and establish a scheduled preventative maintenance schedule.',
    typicalDeliverables: ['As-built system documentation pack', 'Fire alarm logbook', 'Operator training record', 'Maintenance agreement schedule'],
    clientResponsibilities: ['Nominate trained responsible person for weekly testing', 'Maintain physical fire alarm logbook on site'],
    iconName: 'ShieldCheck'
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-01',
    slug: 'fire-detection-site-surveys',
    title: 'Fire-Detection Site Surveys',
    category: 'design_planning',
    shortDescription: 'Comprehensive on-site evaluations of commercial premises to assess coverage, ceiling heights, zoning, and ambient conditions.',
    fullOverview: 'Audrin Fire Engineers carries out thorough on-site physical surveys of commercial, industrial, and institutional premises. We evaluate structural layouts, ceiling voids, airflow velocities, ambient dust/steam risks, and existing cabling to define precise fire-detection requirements aligned with applicable technical guidance.',
    suitableBuildingTypes: ['Commercial Office Blocks', 'Warehouses & Logistics Hubs', 'Retail Centres', 'Healthcare Facilities', 'Educational Campuses', 'Industrial Plants'],
    scopeOfWork: [
      'Visual and structural survey of all building compartments and ceiling voids',
      'Assessment of ambient environmental conditions (dust, temperature, air velocity)',
      'Evaluation of detector spacing and obstruction clearances',
      'Inspection of existing fire alarm cable containment and routing paths',
      'Sounder audibility baseline review and ambient noise measurement'
    ],
    processSteps: [
      'Initial consultation and architectural drawing review',
      'On-site walk-through and physical measurement',
      'Photographic record of panel location and containment paths',
      'Engineering risk appraisal and gap analysis',
      'Compilation and delivery of the technical survey report'
    ],
    deliverables: [
      'Comprehensive Site Survey Report',
      'Preliminary Device Layout Markup',
      'Environmental Risk & False-Alarm Hazard Summary',
      'Recommended System Category Guidance'
    ],
    clientResponsibilities: [
      'Provide site floor plans and structural layouts prior to inspection',
      'Arrange unobstructed access to all tenant suites, risers, and plant rooms',
      'Provide safety inductions and access permits where necessary'
    ],
    relatedServiceSlugs: ['fire-alarm-system-design', 'fire-alarm-modifications-and-upgrades', 'as-built-drawings-and-system-documentation'],
    frequentlyAskedQuestions: [
      {
        question: 'When is a fire-detection site survey necessary?',
        answer: 'A survey is essential before designing a new system, altering building floor layouts, changing building occupancy, or diagnosing persistent operational issues.'
      },
      {
        question: 'How long does an on-site survey take?',
        answer: 'Survey duration depends on building size; typical commercial offices take 2–5 hours, while large industrial sites may require full-day or multi-day assessments.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'srv-02',
    slug: 'fire-alarm-system-design',
    title: 'Fire-Alarm System Design',
    category: 'design_planning',
    shortDescription: 'Technical engineering design of conventional, addressable, and aspirating smoke detection systems with full schematics.',
    fullOverview: 'We engineer robust, custom fire-detection architectures tailored to specific building occupancies and fire safety strategies. Our designs specify appropriate system categories (e.g., life safety or property protection categories), precise detector selection, zone layouts, power load calculations, and cause-and-effect logic.',
    suitableBuildingTypes: ['Multi-Storey Commercial Buildings', 'Industrial Facilities', 'Hospitals & Medical Centres', 'Shopping Malls', 'Data Facilities & Server Rooms'],
    scopeOfWork: [
      'System category selection based on building risk profile and fire strategy',
      'Detector type selection (optical, multi-sensor, heat, beam, aspirating ASD)',
      'Zoning layout, loop topology, and cable route engineering',
      'Battery standby and power supply capacity calculations',
      'Cause-and-effect matrix formulation for third-party building service interfaces'
    ],
    processSteps: [
      'Review of fire strategy requirements and architectural drawings',
      'Calculation of detector coverage radii and sound pressure levels',
      'Drafting of CAD schematic layouts and loop schematics',
      'Internal peer engineering review and design verification',
      'Final submission of design drawings, device schedule, and specifications'
    ],
    deliverables: [
      'Detailed CAD Fire Alarm Layout Drawings',
      'Cause-and-Effect Logic Matrix',
      'Equipment Bill of Quantities & Device Schedule',
      'Power Supply & Battery Backup Calculation Sheet'
    ],
    clientResponsibilities: [
      'Provide up-to-date architectural CAD drawings and section details',
      'Specify interfaced plant requirements (HVAC, dampers, access control)'
    ],
    relatedServiceSlugs: ['fire-detection-system-installation', 'fire-alarm-cause-and-effect-review', 'as-built-drawings-and-system-documentation'],
    frequentlyAskedQuestions: [
      {
        question: 'What is the difference between conventional and addressable design?',
        answer: 'Conventional systems indicate fire by general zone, whereas addressable systems pinpoint the exact detector and location on a digital display loop.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'srv-03',
    slug: 'fire-detection-system-installation',
    title: 'Fire-Detection System Installation',
    category: 'installation_commissioning',
    shortDescription: 'Professional installation of fire-rated cabling, control panels, detection devices, sounders, and interface modules.',
    fullOverview: 'Our installation team installs fire-detection infrastructure with exacting technical precision. We use standard and enhanced fire-resistant cabling, metal containment, secure fixings, and calibrated device mounting to ensure system reliability and long-term durability in non-domestic premises.',
    suitableBuildingTypes: ['New Commercial Developments', 'Fit-outs & Refurbishments', 'Industrial Warehouses', 'Educational Facilities', 'Corporate Offices'],
    scopeOfWork: [
      'Installation of fire-resistant cabling with compliant metallic fixings',
      'Mounting and termination of main fire alarm control and repeater panels',
      'Installation of smoke, heat, multi-criteria, and beam detectors',
      'Placement of manual call points at designated exit routes',
      'Wiring of sounders, visual alarm devices (VADs), and interface relays'
    ],
    processSteps: [
      'Site readiness verification and cable containment installation',
      'First fix: Cable pulling, loop segregation, and continuity testing',
      'Second fix: Device base installation and termination',
      'Control panel positioning, mains supply connection, and loop connection',
      'Pre-commissioning cable insulation resistance (megger) testing'
    ],
    deliverables: [
      'Installed Fire-Alarm Hardware Infrastructure',
      'Cable Continuity and Insulation Test Records',
      'Device Installation Progress Sign-off'
    ],
    clientResponsibilities: [
      'Provide dedicated 230V AC unswitched fused spur for panel supply',
      'Maintain site safety conditions and coordination with other trades'
    ],
    relatedServiceSlugs: ['fire-alarm-testing-and-commissioning', 'fire-alarm-modifications-and-upgrades'],
    frequentlyAskedQuestions: [
      {
        question: 'What type of cable is used for fire alarm installations?',
        answer: 'We install certified fire-resistant cable (standard or enhanced grade depending on building evacuation strategy) secured with metal fixings.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'srv-04',
    slug: 'fire-alarm-testing-and-commissioning',
    title: 'Fire-Alarm Testing & Commissioning',
    category: 'installation_commissioning',
    shortDescription: 'Comprehensive point-to-point verification, cause-and-effect validation, and sounder decibel level testing.',
    fullOverview: 'Testing and commissioning verify that every installed component operates strictly in accordance with design specifications and manufacturer protocols. We methodically test 100% of all detection devices, manual call points, sounder circuits, and interface triggers before system handover.',
    suitableBuildingTypes: ['Newly Installed Facilities', 'Major System Extensions', 'Refurbished Commercial Sites'],
    scopeOfWork: [
      '100% point-to-point functional testing of all detectors and call points',
      'Control panel software configuration, zone labeling, and loop mapping',
      'Sound level (dBA) audibility testing throughout all occupied zones',
      'Full cause-and-effect matrix functional trip testing',
      'Mains fail and battery standby discharge simulation'
    ],
    processSteps: [
      'Pre-commissioning wiring verification and loop impedance check',
      'Panel programming and device address interrogation',
      'Point-by-point smoke/heat aerosol and signal testing',
      'Decibel meter readings in key acoustic zones and sleeping accommodation',
      'Compilation of commissioning records and test sheets'
    ],
    deliverables: [
      'Point-to-Point Device Test Record Sheet',
      'Sounder Audibility Decibel Log',
      'Commissioning Verification Certificate Record',
      'As-Programmed Panel Configuration File'
    ],
    clientResponsibilities: [
      'Notify building occupants and local monitoring stations of testing',
      'Ensure building trades have completed ceilings and doors for acoustic accuracy'
    ],
    relatedServiceSlugs: ['fire-alarm-acceptance-and-verification-support', 'system-handover-and-operator-training'],
    frequentlyAskedQuestions: [
      {
        question: 'Why is sounder audibility testing critical?',
        answer: 'Sounders must achieve minimum decibel thresholds (generally 65 dBA or 5 dBA above ambient noise) to guarantee clear warning across all occupied spaces.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'srv-05',
    slug: 'fire-alarm-acceptance-and-verification-support',
    title: 'Fire-Alarm Acceptance & Verification Support',
    category: 'installation_commissioning',
    shortDescription: 'Independent technical witness testing and documentation review for third-party or client engineering acceptance.',
    fullOverview: 'We provide technical verification and witness testing services for facility managers, main contractors, and consulting engineers. We verify that installed systems conform to project design specifications, zoning parameters, and interface requirements.',
    suitableBuildingTypes: ['Corporate Headquarters', 'Commercial Tenancy Handovers', 'High-Spec Facilities'],
    scopeOfWork: [
      'Documentation review of design drawings, calculations, and test logs',
      'Sample or 100% witness testing of installed devices and sounders',
      'Verification of cause-and-effect interface actions under fire condition',
      'Physical inspection of cable support spacing and fire-stopping integrity'
    ],
    processSteps: [
      'Review of submitted commissioning documentation',
      'On-site witness testing alongside project stakeholders',
      'Snag list generation and deficiency tracking',
      'Final verification closeout report'
    ],
    deliverables: [
      'Technical Verification Audit Report',
      'Witness Testing Sign-off Sheet',
      'Defects and Snagging Schedule'
    ],
    clientResponsibilities: [
      'Supply original design drawings and commissioning certificates',
      'Coordinate presence of third-party system technicians (HVAC/access)'
    ],
    relatedServiceSlugs: ['fire-alarm-testing-and-commissioning', 'as-built-drawings-and-system-documentation'],
    frequentlyAskedQuestions: [
      {
        question: 'Who uses acceptance and verification support?',
        answer: 'Property developers, building owners, facility management companies, and consulting engineers seeking rigorous technical verification prior to occupation.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'srv-06',
    slug: 'planned-preventative-maintenance',
    title: 'Planned Preventative Maintenance',
    category: 'maintenance_testing',
    shortDescription: 'Structured periodic inspection, battery discharge testing, detector cleaning, and logbook audits.',
    fullOverview: 'Regular preventative maintenance is essential to prevent false alarms, detect failing components, and ensure operational readiness when required. We perform scheduled quarterly, bi-annual, and annual inspection routines following rigorous technical procedures.',
    suitableBuildingTypes: ['All Commercial & Industrial Buildings', 'Retail Centres', 'Schools', 'Warehouses', 'Multi-Tenant Properties'],
    scopeOfWork: [
      'Rotational testing of detection devices across all building zones',
      'Inspection of manual call points, break-glass units, and protective covers',
      'Control panel standby battery load testing and internal power check',
      'Cleaning and optical sensitivity checking of smoke sensors',
      'Audit and updating of the on-site physical fire alarm logbook'
    ],
    processSteps: [
      'Pre-service panel inspection for existing faults or disabled zones',
      'Methodical device testing and cleaning by assigned zone',
      'Secondary power supply discharge and recharge rate measurement',
      'Interface relay simulation and remote transmission verification',
      'Logging of test records and delivery of service report'
    ],
    deliverables: [
      'Detailed Periodic Maintenance Report',
      'Device Testing Register & Replacement Recommendations',
      'Updated On-Site Fire Alarm Logbook Entries'
    ],
    clientResponsibilities: [
      'Perform and record designated weekly user tests',
      'Provide site access during scheduled maintenance windows'
    ],
    relatedServiceSlugs: ['fire-alarm-logbook-support', 'fire-alarm-fault-finding', 'detector-replacement-and-device-relocation'],
    frequentlyAskedQuestions: [
      {
        question: 'How frequently should a commercial fire alarm be serviced?',
        answer: 'In commercial premises, periodic inspection and servicing should be carried out at intervals not exceeding six months, with quarterly servicing recommended for larger sites.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'srv-07',
    slug: 'fire-alarm-fault-finding',
    title: 'Fire-Alarm Fault Finding',
    category: 'fault_emergency',
    shortDescription: 'Methodical diagnostic investigation of earth faults, loop open/short circuits, device communication errors, and power faults.',
    fullOverview: 'Our engineers specialise in identifying and resolving elusive electrical and communication faults in fire alarm panels and loops. Using specialised diagnostic meters and loop protocol analysers, we systematically trace earth faults, open circuits, short circuits, and intermittent signal corruption.',
    suitableBuildingTypes: ['Commercial Buildings with Active Fault Warnings', 'Industrial Plants', 'Sites with Intermittent Panel Troubles'],
    scopeOfWork: [
      'Positive and negative earth fault isolation and cable path tracing',
      'Loop open-circuit and short-circuit break localization',
      'Protocol data transmission analysis and device polling verification',
      'Power supply ripple voltage, ground reference, and charger diagnostics',
      'Repeater panel and network loop communication troubleshooting'
    ],
    processSteps: [
      'Interrogation of panel historical event logs and error codes',
      'Sectional loop split and resistance/capacitance measurement',
      'Physical inspection of junction boxes, isolators, and device bases',
      'Identification of root cause (water ingress, cable damage, failed component)',
      'Rectification plan and immediate fault clearing'
    ],
    deliverables: [
      'Technical Fault Diagnostic Report',
      'Root Cause Analysis Summary',
      'Post-Rectification Loop Health Measurements'
    ],
    clientResponsibilities: [
      'Provide historical logbook notes or timestamps of when fault first appeared',
      'Allow access to riser ducts, ceiling voids, and electrical distribution rooms'
    ],
    relatedServiceSlugs: ['emergency-fire-alarm-fault-support', 'fire-alarm-system-repairs', 'false-alarm-investigation-and-management'],
    frequentlyAskedQuestions: [
      {
        question: 'What causes common fire alarm earth faults?',
        answer: 'Earth faults frequently arise from moisture ingress, damaged cable insulation rubbing on metal containment, or contaminated detector bases.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 7
  },
  {
    id: 'srv-08',
    slug: 'emergency-fire-alarm-fault-support',
    title: 'Emergency Fire-Alarm Fault Support',
    category: 'fault_emergency',
    shortDescription: 'Rapid technical triage and diagnostic support for critical panel troubles, continuous buzzer faults, or impaired zones.',
    fullOverview: 'When a fire alarm system experiences a critical malfunction, continuous fault buzzer, or impaired detection zone, urgent technical intervention is required to restore building safety. We provide rapid diagnostic triage and dispatch support to assess and stabilise non-domestic systems.',
    suitableBuildingTypes: ['Commercial Buildings with Critical Impairments', 'Healthcare', 'High-Risk Facilities', 'Occupied Commercial Spaces'],
    scopeOfWork: [
      'Immediate technical telephone triage to assess safety conditions',
      'Urgent dispatch for critical panel crash, loop failure, or continuous fault tone',
      'Stabilisation of system monitoring and safe isolation of defective circuits',
      'Restoration of primary detection functions across unaffected zones',
      'Clear safety advice regarding temporary building watch procedures'
    ],
    processSteps: [
      'Emergency request intake and urgency classification',
      'Safety check: Ensure no active fire condition exists',
      'Engineer dispatch and on-site diagnostic triage',
      'Isolation of faulty component while preserving rest of building coverage',
      'Formulation of permanent replacement plan'
    ],
    deliverables: [
      'Emergency Attendance Report',
      'System Safety & Impairment Status Log',
      'Action Plan for Full Restoration'
    ],
    clientResponsibilities: [
      'Verify that there is no actual fire or smoke condition prior to silencing',
      'Implement manual fire watch in any temporarily isolated building zones'
    ],
    relatedServiceSlugs: ['fire-alarm-fault-finding', 'fire-alarm-system-repairs'],
    frequentlyAskedQuestions: [
      {
        question: 'What should we do if our panel is in continuous alarm?',
        answer: 'Immediately confirm there is no fire condition. If safe, check the panel display for the active device address and contact our support team.'
      }
    ],
    isFeatured: true,
    isActive: true,
    sortOrder: 8
  },
  {
    id: 'srv-09',
    slug: 'fire-alarm-system-repairs',
    title: 'Fire-Alarm System Repairs',
    category: 'fault_emergency',
    shortDescription: 'Targeted replacement of damaged detectors, faulty panel power supply units (PSUs), broken call points, and degraded cabling.',
    fullOverview: 'We repair damaged and defective fire alarm system hardware to full operational specifications. All replacement components are specified to match manufacturer protocols and system compatibility requirements.',
    suitableBuildingTypes: ['All Non-Domestic Properties with Identified Hardware Failures'],
    scopeOfWork: [
      'Replacement of failed control panel power supplies, mainboards, and loop cards',
      'Replacement of water-damaged, contaminated, or expired detectors',
      'Repair and re-termination of severed or degraded fire-rated cabling',
      'Replacement of broken manual call points and damaged sounder strobes',
      'Re-commissioning and re-testing of all repaired circuits'
    ],
    processSteps: [
      'Verification of failed component specifications and compatibility',
      'Safe isolation of relevant loop or power rail',
      'Hardware installation and secure termination',
      'Functional point test and loop address verification',
      'Handover and system restoration sign-off'
    ],
    deliverables: [
      'Repair Completion Certificate',
      'Replaced Component Inventory Record',
      'Post-Repair Functionality Test Sheet'
    ],
    clientResponsibilities: [
      'Approve required replacement parts quotation',
      'Provide access to affected areas'
    ],
    relatedServiceSlugs: ['detector-replacement-and-device-relocation', 'fire-alarm-fault-finding'],
    frequentlyAskedQuestions: [
      {
        question: 'Can you repair older or discontinued panel models?',
        answer: 'We assess legacy panels and repair where compatible parts exist, or advise on engineered migration pathways where components are obsolete.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 9
  },
  {
    id: 'srv-10',
    slug: 'fire-alarm-modifications-and-upgrades',
    title: 'Fire-Alarm Modifications & Upgrades',
    category: 'modifications_upgrades',
    shortDescription: 'Seamless extension of existing loops, panel migrations, and zoning adjustments for tenancy reconfigurations.',
    fullOverview: 'Building remodelling, office partitioning, and facility expansions require corresponding adjustments to fire alarm coverage. We engineer and implement extensions to existing systems, migrate legacy panels to modern addressable platforms, and add detection to new partitioned zones.',
    suitableBuildingTypes: ['Commercial Fit-outs', 'Tenant Alterations', 'Building Expansions', 'Aging Infrastructure Modernisation'],
    scopeOfWork: [
      'Calculated expansion of existing addressable loops and power reserves',
      'Addition of detection devices to newly partitioned offices and meeting rooms',
      'Migration of conventional zones to intelligent addressable technology',
      'Upgrading visual alarm devices to modern high-output VAD standards',
      'Integration of new floor plates into existing master panels'
    ],
    processSteps: [
      'Audit of existing panel loop capacity and spare address availability',
      'Design of loop extension and device placement in new partitions',
      'Installation of fire-rated cabling and additional hardware',
      'Panel reprogramming, text description updates, and loop map sync',
      'Full verification and commissioning of modified zones'
    ],
    deliverables: [
      'System Modification Record',
      'Updated Loop Device Schedule',
      'Updated Zone Allocation Chart'
    ],
    clientResponsibilities: [
      'Provide new architectural floor plans showing altered partitions and ceilings',
      'Provide current panel access passwords/codes if known'
    ],
    relatedServiceSlugs: ['detector-replacement-and-device-relocation', 'fire-alarm-zoning-and-identification', 'as-built-drawings-and-system-documentation'],
    frequentlyAskedQuestions: [
      {
        question: 'Will adding new offices overload my existing fire panel?',
        answer: 'We calculate current loop loading and battery reserves before adding devices to confirm your panel has sufficient electrical headroom.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 10
  },
  {
    id: 'srv-11',
    slug: 'detector-replacement-and-device-relocation',
    title: 'Detector Replacement & Device Relocation',
    category: 'modifications_upgrades',
    shortDescription: 'Relocating detectors obstructed by new partitions or HVAC diffusers, and replacing aged/contaminated sensors.',
    fullOverview: 'Changes in room geometry, new HVAC discharge grilles, or partition additions frequently create dead spots or turbulent airflow that compromises smoke detection. We relocate existing devices to compliant positions and replace sensors that have reached their service life or sensitivity limits.',
    suitableBuildingTypes: ['Office Renovations', 'Retail Store Refits', 'Warehousing Reconfigurations'],
    scopeOfWork: [
      'Relocation of smoke/heat detectors away from high-velocity air diffusers',
      'Repositioning of devices to maintain compliant radius from new partition walls',
      'Replacement of aged optical sensors (exceeding recommended lifespan)',
      'Adjustment of detector base wiring and cable containment extensions',
      'Individual functional testing following device movement'
    ],
    processSteps: [
      'Site review of new ceiling obstructions, ducting, and partition lines',
      'Safe isolation and de-addressing of devices to be moved',
      'Cabling extension and remounting in compliant locations',
      'Testing and panel description verification',
      'Updating of site drawings'
    ],
    deliverables: [
      'Device Relocation Record',
      'Sensor Sensitivity and Replacement Log'
    ],
    clientResponsibilities: [
      'Inform team of planned ceiling changes prior to finish carpentry'
    ],
    relatedServiceSlugs: ['fire-alarm-modifications-and-upgrades', 'false-alarm-investigation-and-management'],
    frequentlyAskedQuestions: [
      {
        question: 'Why must detectors not be placed right next to air conditioning vents?',
        answer: 'High air velocity from HVAC diffusers can blow smoke away from the optical chamber, delaying detection, or blow dust in, causing false alarms.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 11
  },
  {
    id: 'srv-12',
    slug: 'false-alarm-investigation-and-management',
    title: 'False-Alarm Investigation & Management',
    category: 'maintenance_testing',
    shortDescription: 'Engineering analysis to identify environmental causes of nuisance alarms and implement multi-sensor filtering strategies.',
    fullOverview: 'Unwanted false alarms disrupt commercial operations, cause costly downtime, and foster complacency among building occupants. We conduct systematic investigations into repeat false alarms, evaluating steam, dust, electrical surges, air currents, or inappropriate sensor selection, and implement technical filtering solutions.',
    suitableBuildingTypes: ['Hotels & Hospitality', 'Commercial Offices with Kitchenettes', 'Industrial Facilities', 'Hospitals'],
    scopeOfWork: [
      'Analysis of control panel historical false alarm event logs',
      'Environmental assessment of ambient dust, humidity, exhaust, or insect ingress',
      'Evaluation of detector type suitability (e.g., optical vs. multi-sensor/thermal)',
      'Implementation of alarm verification delays, multi-criteria filtering, or sensor repositioning',
      'Formulation of a false-alarm reduction strategy for the facility'
    ],
    processSteps: [
      'Event log download and timestamp cross-referencing',
      'Physical inspection of triggering devices and local environment',
      'Replacement with appropriate technology (e.g. multi-criteria heat/optical)',
      'Software adjustment of day/night sensitivity modes where supported',
      'Post-implementation monitoring and review'
    ],
    deliverables: [
      'False Alarm Investigation & Remediation Report',
      'Device Sensitivity & Mode Adjustment Log',
      'False Alarm Management Protocol Guidance'
    ],
    clientResponsibilities: [
      'Record exact times and conditions whenever an unwanted alarm occurs',
      'Manage occupant activities (e.g., toasting, steam-generating equipment)'
    ],
    relatedServiceSlugs: ['detector-replacement-and-device-relocation', 'fire-alarm-cause-and-effect-review'],
    frequentlyAskedQuestions: [
      {
        question: 'How can we prevent toaster smoke from evacuating our office?',
        answer: 'We can replace standard optical sensors in kitchen-adjacent zones with multi-criteria detectors or configure alarm verification delays.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 12
  },
  {
    id: 'srv-13',
    slug: 'fire-alarm-cause-and-effect-review',
    title: 'Fire-Alarm Cause-and-Effect Review',
    category: 'documentation_compliance',
    shortDescription: 'Verification and validation of programmed output logic for HVAC shutdowns, door releases, dampers, and PAVA interfaces.',
    fullOverview: 'The cause-and-effect logic defines what actions the fire alarm system initiates when a fire is detected—such as shutting down mechanical ventilation, closing fire dampers, unlocking exit doors, grounding lifts, and activating staged sounder evacuation. We review, document, and test this critical logic matrix.',
    suitableBuildingTypes: ['Complex Commercial Properties', 'High-Rise Office Towers', 'Shopping Centres', 'Hospitals'],
    scopeOfWork: [
      'Detailed audit of programmed panel output groups and delay timers',
      'Verification of interface relays controlling HVAC fan trips and smoke dampers',
      'Testing of electromagnetic door hold-open release upon alarm',
      'Testing of access control fail-safe unlock signals',
      'Validation of phased or staged evacuation sounder programming'
    ],
    processSteps: [
      'Extract current software configuration from panel',
      'Compare logic matrix against approved building fire engineering strategy',
      'Conduct controlled live trip testing with building service contractors',
      'Document discrepancies or delayed relay actions',
      'Deliver verified Cause-and-Effect Matrix and rectification recommendations'
    ],
    deliverables: [
      'Certified Cause-and-Effect Matrix Table',
      'Third-Party Interface Test Summary',
      'Programming Optimization Recommendations'
    ],
    clientResponsibilities: [
      'Provide approved building fire strategy and HVAC mechanical schedules',
      'Coordinate attendance of lift, HVAC, and access control maintenance vendors'
    ],
    relatedServiceSlugs: ['fire-alarm-interface-configuration', 'fire-alarm-testing-and-commissioning'],
    frequentlyAskedQuestions: [
      {
        question: 'What is phased evacuation?',
        answer: 'Phased evacuation sounds immediate alarm on the fire floor and floor above, while alerting other floors with an intermittent warning signal to manage stairwell congestion.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 13
  },
  {
    id: 'srv-14',
    slug: 'fire-alarm-interface-configuration',
    title: 'Fire-Alarm Interface Configuration',
    category: 'modifications_upgrades',
    shortDescription: 'Technical wiring and relay programming to interface fire panels with building management systems (BMS) and plant controls.',
    fullOverview: 'We configure and wire monitored interface modules (input/output units) connecting the fire alarm panel to critical building services. This ensures reliable signal transfer to BMS systems, ventilation dampers, lift controllers, and security gates without compromising panel integrity.',
    suitableBuildingTypes: ['Integrated Commercial Facilities', 'Industrial Plants', 'Smart Buildings'],
    scopeOfWork: [
      'Installation of monitored I/O interface units on addressable loops',
      'Relay contact termination for BMS alarm and fault reporting',
      'HVAC shutdown and smoke damper control module integration',
      'Emergency door release and turnstile fail-safe trigger wiring',
      'Monitoring of waterflow switches and gas suppression status inputs'
    ],
    processSteps: [
      'Identify required input/output signal requirements',
      'Install interface modules in appropriate enclosures',
      'Connect monitored loop wiring and auxiliary output cables',
      'Configure panel logic and input text labels',
      'Witness test interface operation in both normal and alarm states'
    ],
    deliverables: [
      'Interface Module Configuration Schedule',
      'Input/Output Wiring Schematic',
      'Interface Witness Test Record'
    ],
    clientResponsibilities: [
      'Ensure third-party plant controllers have dry-contact input terminals available',
      'Coordinate contractor access for linked systems'
    ],
    relatedServiceSlugs: ['fire-alarm-cause-and-effect-review', 'fire-alarm-system-design'],
    frequentlyAskedQuestions: [
      {
        question: 'Do you work on sprinkler systems or gas suppression directly?',
        answer: 'No, we do not service or supply suppression or sprinkler systems. We only configure the fire-alarm electrical interface modules that receive signals from or trip those third-party systems.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 14
  },
  {
    id: 'srv-15',
    slug: 'fire-alarm-zoning-and-identification',
    title: 'Fire-Alarm Zoning & Identification',
    category: 'documentation_compliance',
    shortDescription: 'Clear architectural zone charts, device labeling, and panel zone mapping for rapid emergency service orientation.',
    fullOverview: 'In an emergency, arriving emergency responders and building wardens must immediately identify where fire is detected. We produce clear, durable zonal plan charts positioned adjacent to the main panel, and ensure all loop devices are systematically labeled with address and zone IDs.',
    suitableBuildingTypes: ['All Non-Domestic Properties', 'Large Floor-Plate Warehouses', 'Multi-Floor Facilities'],
    scopeOfWork: [
      'Verification of fire compartment boundaries against panel zone allocations',
      'Production of clear, illuminated or framed architectural Zone Charts',
      'Systematic physical labeling of all detectors, call points, and modules',
      'Update of panel internal LCD text descriptions to match physical room names',
      'Orientation mapping (You Are Here marker) at primary panel locations'
    ],
    processSteps: [
      'Audit of existing zone coverage boundaries and room numbers',
      'Drafting of simplified building zone plan in CAD/vector graphics',
      'Panel text programming to replace generic descriptors with exact room names',
      'Application of durable engraved or printed labels to device bases',
      'Installation of approved Zone Chart adjacent to control panel'
    ],
    deliverables: [
      'Architectural Framed Fire Alarm Zone Chart',
      'Updated Device Address Register with Plain English Room Names',
      'Zone Plan Vector Graphic File'
    ],
    clientResponsibilities: [
      'Provide current room naming conventions and updated floor plans',
      'Approve final zone chart location near main entrance / panel'
    ],
    relatedServiceSlugs: ['as-built-drawings-and-system-documentation', 'fire-alarm-logbook-support'],
    frequentlyAskedQuestions: [
      {
        question: 'Why is a zone chart required next to the fire panel?',
        answer: 'A zone chart allows firefighters and staff to instantly visualise the building area indicated by the panel zone lights without searching through complex engineering drawings.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 15
  },
  {
    id: 'srv-16',
    slug: 'as-built-drawings-and-system-documentation',
    title: 'As-Built Drawings & System Documentation',
    category: 'documentation_compliance',
    shortDescription: 'Accurate CAD floor layouts, schematic loop drawings, power calculations, and comprehensive technical handover packs.',
    fullOverview: 'Accurate system documentation is a fundamental requirement for commercial fire safety management. We survey installed systems, update CAD floor plans to reflect true device locations, generate schematic loop wiring diagrams, and compile structured operational manuals.',
    suitableBuildingTypes: ['Commercial Properties with Missing Drawings', 'Post-Refurbishment Sites', 'Facilities Management Portfolios'],
    scopeOfWork: [
      'On-site verification of actual device locations against older plans',
      'Drafting of accurate 2D CAD floor plans with standard fire symbols',
      'Production of loop schematic diagrams showing cable containment and isolators',
      'Compilation of power supply, battery standby, and loop loading calculations',
      'Assembly of complete Operation & Maintenance (O&M) manual documentation packs'
    ],
    processSteps: [
      'Physical site survey to tag and locate all installed devices',
      'CAD drafting and layer organization using standard symbology',
      'Cross-checking with panel address lists and zone matrices',
      'Client review and document revision',
      'Delivery in both vector PDF/CAD and bound physical formats'
    ],
    deliverables: [
      'Full Set of As-Built CAD Fire Alarm Floor Plans (DWG/PDF)',
      'System Schematic Loop Diagram',
      'Complete Technical Documentation Binder'
    ],
    clientResponsibilities: [
      'Provide base architectural CAD plans if available',
      'Archive master documentation copies safely on site'
    ],
    relatedServiceSlugs: ['fire-alarm-zoning-and-identification', 'fire-alarm-logbook-support', 'system-handover-and-operator-training'],
    frequentlyAskedQuestions: [
      {
        question: 'What happens if we have no original fire alarm drawings?',
        answer: 'We can conduct a reverse-engineering survey of your building to map out existing devices and produce fresh as-built CAD drawings from scratch.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 16
  },
  {
    id: 'srv-17',
    slug: 'fire-alarm-logbook-support',
    title: 'Fire-Alarm Logbook Support',
    category: 'documentation_compliance',
    shortDescription: 'Provision of dedicated commercial fire alarm logbooks, entry templates, weekly test guidance, and audit reviews.',
    fullOverview: 'Under fire safety standards, every commercial building must maintain an active on-site fire alarm logbook recording all weekly tests, false alarms, faults, maintenance visits, and system alterations. We supply standard-compliant logbooks, configure recording registers, and train staff on proper entry procedures.',
    suitableBuildingTypes: ['All Commercial Buildings', 'Multi-Tenancy Facilities', 'Property Management Companies'],
    scopeOfWork: [
      'Supply of structured hardcopy and digital-ready Fire Alarm Logbooks',
      'Setup of weekly manual call point rotational testing schedules',
      'Creation of false alarm and fault incident recording protocols',
      'Periodic auditing of logbook completeness during maintenance visits',
      'Guidance on statutory record retention periods'
    ],
    processSteps: [
      'Audit of existing site documentation practices',
      'Provision of customized logbook with site-specific system summary',
      'Briefing session with the appointed site Responsible Person',
      'Establishment of weekly testing log format',
      'Integration into routine periodic service audits'
    ],
    deliverables: [
      'Commercial Fire Alarm System Logbook Binder',
      'Weekly Test Protocol Quick-Reference Card',
      'False Alarm Event Recording Sheets'
    ],
    clientResponsibilities: [
      'Designate a responsible staff member to perform and record weekly tests',
      'Keep the logbook readily available on site for inspection'
    ],
    relatedServiceSlugs: ['system-handover-and-operator-training', 'planned-preventative-maintenance'],
    frequentlyAskedQuestions: [
      {
        question: 'What must be recorded in the fire alarm logbook?',
        answer: 'All weekly tests (identifying the specific call point tested), routine service visits, faults, false alarms (with cause if known), disconnections, and system modifications.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 17
  },
  {
    id: 'srv-18',
    slug: 'system-handover-and-operator-training',
    title: 'System Handover & Operator Training',
    category: 'documentation_compliance',
    shortDescription: 'Structured operator instruction for building managers, covering panel controls, weekly testing, fault recognition, and logbook entries.',
    fullOverview: 'A fire-detection system is only as effective as the people who operate it daily. Following commissioning or maintenance, we deliver structured hands-on training to building managers and designated responsible persons, ensuring they understand panel indicators, silence/reset controls, weekly testing, and fault escalation.',
    suitableBuildingTypes: ['New System Handover Sites', 'Facilities Management Teams', 'New Building Owner Operations'],
    scopeOfWork: [
      'Hands-on walkthrough of control panel keypad, display, and key switches',
      'Instruction on interpreting Fire, Fault, Disablement, and Test indications',
      'Step-by-step guidance on safely conducting and logging weekly call point tests',
      'Proper procedure for silencing alarm buzzers and resetting the system',
      'Safe escalation steps when a genuine system fault or continuous trouble occurs'
    ],
    processSteps: [
      'Orientation at the main fire alarm control panel',
      'Live demonstration of call point testing using test keys (no broken glass)',
      'Practical demonstration of panel silence, acknowledge, and reset functions',
      'Review of emergency contacts and fault reporting pathways',
      'Signing of Handover & Training Attendance Record'
    ],
    deliverables: [
      'Operator Training Attendance Record',
      'User Quick-Reference Guide (Laminated Panel Card)',
      'Formal Handover Acceptance Sign-off'
    ],
    clientResponsibilities: [
      'Ensure primary building managers, security staff, and alternates attend',
      'Retain training records in the building fire safety file'
    ],
    relatedServiceSlugs: ['fire-alarm-logbook-support', 'fire-alarm-testing-and-commissioning'],
    frequentlyAskedQuestions: [
      {
        question: 'How many staff members should be trained on the fire panel?',
        answer: 'We recommend training at least 2–3 designated staff members (including security and facility personnel) to ensure coverage during shifts and leave.'
      }
    ],
    isFeatured: false,
    isActive: true,
    sortOrder: 18
  }
];

export const INDUSTRIES_SERVED = [
  {
    title: 'Commercial Office Buildings',
    description: 'Multi-storey office blocks, corporate headquarters, and tenant fit-outs requiring multi-zone addressable detection and staged evacuation logic.',
    iconName: 'Building2'
  },
  {
    title: 'Industrial & Warehouses',
    description: 'High-bay storage, distribution hubs, and manufacturing facilities requiring optical beam detectors, high-temperature heat sensors, or aspirating detection (ASD).',
    iconName: 'Warehouse'
  },
  {
    title: 'Retail & Shopping Centres',
    description: 'Complex retail environments with extensive public foot traffic, multi-tenant zoning, HVAC interface controls, and centralized master panels.',
    iconName: 'Store'
  },
  {
    title: 'Healthcare & Clinics',
    description: 'Medical centres, clinics, and non-acute healthcare premises needing silent staff paging interfaces and highly reliable multi-sensor technology.',
    iconName: 'Hospital'
  },
  {
    title: 'Educational Institutions',
    description: 'Schools, colleges, and university campuses requiring robust tamper-resistant call points, networked repeater panels, and clear acoustic warning.',
    iconName: 'GraduationCap'
  },
  {
    title: 'Hospitality & Leisure',
    description: 'Hotels, conference venues, and lodges requiring discrete detection, bedhead sounder interfaces, and intelligent false-alarm filtration.',
    iconName: 'Hotel'
  },
  {
    title: 'Municipal & Public Buildings',
    description: 'Civic centres, government offices, and institutional facilities requiring compliant zoned detection, clear zone charts, and structured logbooks.',
    iconName: 'Landmark'
  }
];

export const SUPPORTED_SYSTEMS = [
  {
    name: 'Addressable Fire Alarm Systems',
    description: 'Intelligent digital loop systems pinpointing exact detector locations, with programmable cause-and-effect and multi-criteria sensor capability.',
    bestFor: 'Medium to large commercial, multi-floor buildings, and complex sites.'
  },
  {
    name: 'Conventional Fire Alarm Systems',
    description: 'Zoned electrical circuits indicating general building sectors, simple to operate and cost-effective for smaller straightforward layouts.',
    bestFor: 'Small commercial offices, single-storey retail, and workshops.'
  },
  {
    name: 'Analogue Addressable Networks',
    description: 'Interconnected multi-panel networks communicating over fault-tolerant copper or fibre loops with centralized master monitoring.',
    bestFor: 'Campus facilities, industrial parks, and large corporate complexes.'
  },
  {
    name: 'Aspirating Smoke Detection (ASD)',
    description: 'Active continuous air sampling systems providing ultra-early warning detection through precision sampling pipe networks.',
    bestFor: 'Server rooms, high-ceiling warehouses, and critical equipment areas.'
  },
  {
    name: 'Wireless & Hybrid Detection',
    description: 'Secure radio-linked detector networks integrated with hardwired loop interfaces, avoiding disruptive cable routing.',
    bestFor: 'Heritage buildings, architectural spaces, and fast retrofit projects.'
  },
  {
    name: 'Beam & Linear Heat Detection',
    description: 'Optical projected beam sensors and linear heat cables designed to monitor expansive open volumes and cable trays.',
    bestFor: 'Atriums, high-ceiling storage bays, and industrial cable galleries.'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-01',
    question: 'What types of buildings and systems do Audrin Fire Engineers support?',
    answer: 'Audrin Fire Engineers provides fire-detection and alarm design, installation, commissioning, maintenance, and fault support exclusively for commercial, industrial, institutional, and non-domestic buildings across South Africa.',
    category: 'General',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'faq-02',
    question: 'Do you supply or service fire extinguishers, hose reels, or sprinklers?',
    answer: 'No. Audrin Fire Engineers focuses exclusively on electrical and electronic fire-detection and fire-alarm systems. We do not advertise, supply, or service fire extinguishers, hose reels, hydrants, sprinklers, or suppression agents, except where fire panels interface electrically with third-party systems.',
    category: 'Services',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'faq-03',
    question: 'How do I request an on-site fire-detection survey or quotation?',
    answer: 'You can submit a service request directly through our online portal, select your required service (such as Site Survey or System Design), enter your site details, and our technical team will review and contact you with the appropriate next steps.',
    category: 'Requests',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'faq-04',
    question: 'What is the difference between a conventional and an addressable fire alarm system?',
    answer: 'A conventional system divides a building into broad radial zones (e.g. Zone 1 Ground Floor), while an addressable system assigns an individual electronic address to every sensor and call point, pinpointing the exact room and device in alarm.',
    category: 'Technical',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'faq-05',
    question: 'How often should a commercial fire alarm system be serviced in South Africa?',
    answer: 'Under standard technical recommendations for commercial premises, fire-detection systems should undergo periodic preventative maintenance at intervals not exceeding six months, alongside weekly user tests conducted by the building owner or responsible person.',
    category: 'Maintenance',
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'faq-06',
    question: 'What should we do if our fire panel indicates an Earth Fault or Loop Trouble?',
    answer: 'An Earth Fault or Loop trouble indicates damaged insulation, moisture ingress, or communication issues. You can report a fire-alarm fault via our online platform or telephone, and our diagnostic engineers will investigate and resolve the electrical fault.',
    category: 'Faults',
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'faq-07',
    question: 'Can you help resolve frequent false alarms in our office building?',
    answer: 'Yes. We conduct false alarm investigations by analyzing panel event logs, checking sensor suitability, identifying environmental interference (like steam, dust, or airflow), and recommending multi-sensor filtering or detector relocations.',
    category: 'Faults',
    isActive: true,
    sortOrder: 7
  },
  {
    id: 'faq-08',
    question: 'What documentation is provided after commissioning or servicing?',
    answer: 'We provide structured documentation packs including point-to-point test logs, audibility decibel records, commissioning records, updated logbook entries, and as-built CAD drawings where commissioned.',
    category: 'Documentation',
    isActive: true,
    sortOrder: 8
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Intelligent Addressable Control Panel Installation',
    category: 'panels',
    description: 'Multi-loop commercial addressable fire alarm control panel with LCD display and zonal LED indicators.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'gal-02',
    title: 'Multi-Criteria Optical Smoke & Heat Detector',
    category: 'detectors',
    description: 'Ceiling-mounted intelligent multi-sensor detector with integrated isolator base in commercial office suite.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'gal-03',
    title: 'Fire-Resistant Cable Containment & Termination',
    category: 'installation',
    description: 'High-integrity fire-resistant red cabling neatly routed with metallic saddle clips along service risers.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'gal-04',
    title: 'Point-to-Point Smoke Aerosol & Sensitivity Testing',
    category: 'testing',
    description: 'Technician utilizing calibrated aerosol dispenser pole for functional testing of ceiling smoke detector.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'gal-05',
    title: 'Periodic Preventative Panel Battery Load Test',
    category: 'maintenance',
    description: 'Secondary standby sealed lead-acid battery discharge test and voltage measurement inside power supply enclosure.',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'gal-06',
    title: 'Architectural Fire Alarm Zone Chart & Logbook Pack',
    category: 'documentation',
    description: 'Framed color-coded building zone plan mounted adjacent to the main entrance repeater panel.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
    isActive: true,
    sortOrder: 6
  }
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-01',
    name: 'General Enquiry Acknowledgement',
    category: 'general_enquiry',
    subjectTemplate: 'Acknowledgement: Enquiry {{request_reference}} - Audrin Fire Engineers',
    htmlBodyTemplate: `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #0f172a; padding: 24px; color: #ffffff; text-align: left;">
    <h2 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 0.5px;">AUDRIN FIRE ENGINEERS</h2>
    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Early Detection. Clear Warning. Safer Buildings.</p>
  </div>
  <div style="padding: 24px;">
    <p>Dear <strong>{{client_name}}</strong>,</p>
    <p>Thank you for contacting Audrin Fire Engineers regarding your enquiry <strong>({{request_reference}})</strong>.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 14px; margin: 18px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Enquiry Summary:</strong> {{request_summary}}</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Next Stage (How We Work):</strong> Stage 1: Enquiry & Consultation</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6;">Our engineering team will review the details submitted and contact you to confirm next steps and schedule any required consultation.</p>
    {{#if customer_portal_link}}
    <p style="margin: 20px 0;"><a href="{{customer_portal_link}}" style="background-color: #0f172a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">View Request in Customer Portal</a></p>
    {{/if}}
  </div>
  <div style="background-color: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 4px 0;"><strong>Audrin Fire Engineers (Pty) Ltd</strong> | Registration No: K2026089596</p>
    <p style="margin: 0 0 4px 0;">27 Tshivhase Street, Pretoria West, Pretoria, 0008 | Tel: 071 415 6665</p>
    <p style="margin: 0;">Email: bethuelmoukangwe8@gmail.com | Hours: Monday–Sunday: 07:00–20:00</p>
  </div>
</div>`,
    plainTextBodyTemplate: `AUDRIN FIRE ENGINEERS
Early Detection. Clear Warning. Safer Buildings.

Dear {{client_name}},

Thank you for contacting Audrin Fire Engineers regarding your enquiry (Reference: {{request_reference}}).

Enquiry Summary: {{request_summary}}
Next Stage: Stage 1: Enquiry & Consultation

Our engineering team will review your submitted details and contact you to confirm the next steps.

---
Audrin Fire Engineers (Pty) Ltd | Reg No: K2026089596
27 Tshivhase Street, Pretoria West, Pretoria, 0008
Tel: 071 415 6665 | Email: bethuelmoukangwe8@gmail.com
Operating Hours: Monday–Sunday: 07:00–20:00`,
    requiredVariables: ['client_name', 'request_reference', 'request_summary'],
    isActive: true,
    version: 1,
    requiresHumanReview: false,
    updatedAt: '2026-09-01T12:00:00Z'
  },
  {
    id: 'tmpl-02',
    name: 'Site Survey Request Acknowledgement',
    category: 'site_survey',
    subjectTemplate: 'Site Survey Request Received: {{request_reference}} - Audrin Fire Engineers',
    htmlBodyTemplate: `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #0f172a; padding: 24px; color: #ffffff;">
    <h2 style="margin: 0; color: #ffffff; font-size: 20px;">AUDRIN FIRE ENGINEERS</h2>
    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Early Detection. Clear Warning. Safer Buildings.</p>
  </div>
  <div style="padding: 24px;">
    <p>Dear <strong>{{client_name}}</strong>,</p>
    <p>We have received your site survey request for <strong>{{site_name}}</strong> (Reference: <strong>{{request_reference}}</strong>).</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; margin: 18px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Service:</strong> Fire-Detection Site Survey</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Next Stage (How We Work):</strong> Stage 2: Site Survey & Assessment</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155;"><strong>Required Information / Site Preparation:</strong> Please have floor layouts available and confirm access to ceiling voids and plant rooms.</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6;">Our team will review your preferred date and contact you to confirm technician availability and site access protocols.</p>
  </div>
  <div style="background-color: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b;">
    <p style="margin: 0 0 4px 0;"><strong>Audrin Fire Engineers (Pty) Ltd</strong> | Registration No: K2026089596</p>
    <p style="margin: 0 0 4px 0;">27 Tshivhase Street, Pretoria West, Pretoria, 0008 | Tel: 071 415 6665</p>
    <p style="margin: 0;">Email: bethuelmoukangwe8@gmail.com | Hours: Monday–Sunday: 07:00–20:00</p>
  </div>
</div>`,
    plainTextBodyTemplate: `AUDRIN FIRE ENGINEERS
Early Detection. Clear Warning. Safer Buildings.

Dear {{client_name}},

We have received your site survey request for {{site_name}} (Reference: {{request_reference}}).

Service: Fire-Detection Site Survey
Next Stage: Stage 2: Site Survey & Assessment
Required Information: Please ensure floor plans and site access to ceiling voids and plant rooms are ready.

Our technical team will review the submitted details and contact you to coordinate the site survey.

---
Audrin Fire Engineers (Pty) Ltd | Reg No: K2026089596
27 Tshivhase Street, Pretoria West, Pretoria, 0008
Tel: 071 415 6665 | Email: bethuelmoukangwe8@gmail.com`,
    requiredVariables: ['client_name', 'site_name', 'request_reference'],
    isActive: true,
    version: 1,
    requiresHumanReview: false,
    updatedAt: '2026-09-01T12:00:00Z'
  },
  {
    id: 'tmpl-03',
    name: 'Emergency Fault & Triage Acknowledgement',
    category: 'emergency_fault',
    subjectTemplate: 'URGENT: Fire-Alarm Fault Reported (Ref: {{request_reference}}) - Audrin Fire Engineers',
    htmlBodyTemplate: `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #dc2626; padding: 20px 24px; color: #ffffff;">
    <h2 style="margin: 0; color: #ffffff; font-size: 20px;">AUDRIN FIRE ENGINEERS - FAULT SUPPORT</h2>
    <p style="margin: 4px 0 0 0; color: #fee2e2; font-size: 12px;">High Priority Triage Notice</p>
  </div>
  <div style="padding: 24px;">
    <p>Dear <strong>{{client_name}}</strong>,</p>
    <p>We acknowledge receipt of your urgent fire-alarm fault report for <strong>{{site_name}}</strong> (Reference: <strong>{{request_reference}}</strong>).</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; color: #991b1b; font-weight: bold; font-size: 14px;">IMPORTANT LIFE-SAFETY NOTICE:</p>
      <p style="margin: 0; font-size: 13px; color: #7f1d1d; line-height: 1.5;">If there is an active fire, smoke condition, or immediate danger, follow the building evacuation plan and contact local municipal emergency services immediately. Do not attempt to bypass or disconnect life-safety systems.</p>
    </div>

    <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 14px; margin: 16px 0;">
      <p style="margin: 0; font-size: 13px;"><strong>Reported Issue:</strong> {{request_summary}}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Panel Model:</strong> {{panel_model}}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Urgency Level:</strong> High / Urgent Emergency</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6;">Your fault has been escalated to our on-duty technical supervisors. An engineer will contact you shortly via <strong>{{client_phone}}</strong> to initiate diagnostic triage.</p>
  </div>
  <div style="background-color: #0f172a; padding: 16px 24px; font-size: 12px; color: #cbd5e1;">
    <p style="margin: 0 0 4px 0; color: #ffffff;"><strong>Direct Fault Dispatch Line:</strong> 071 415 6665</p>
    <p style="margin: 0;">Audrin Fire Engineers (Pty) Ltd | 27 Tshivhase Street, Pretoria West</p>
  </div>
</div>`,
    plainTextBodyTemplate: `AUDRIN FIRE ENGINEERS - FAULT SUPPORT
URGENT NOTICE

Dear {{client_name}},

We acknowledge receipt of your urgent fire-alarm fault report for {{site_name}} (Reference: {{request_reference}}).

IMPORTANT LIFE SAFETY NOTICE:
If there is an active fire, smoke condition, or immediate danger, follow building emergency procedures and contact emergency services immediately. Do not bypass life-safety systems.

Reported Issue: {{request_summary}}
Panel Model: {{panel_model}}
Urgency: High / Urgent Emergency

An engineer has been notified and will contact you via {{client_phone}} to assist with fault triage.

Direct Support Line: 071 415 6665
Audrin Fire Engineers (Pty) Ltd`,
    requiredVariables: ['client_name', 'site_name', 'request_reference', 'request_summary', 'panel_model', 'client_phone'],
    isActive: true,
    version: 1,
    requiresHumanReview: false,
    updatedAt: '2026-09-01T12:00:00Z'
  },
  {
    id: 'tmpl-04',
    name: 'Out of Scope Request Notice',
    category: 'out_of_scope',
    subjectTemplate: 'Service Scope Notice: Enquiry {{request_reference}} - Audrin Fire Engineers',
    htmlBodyTemplate: `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #0f172a; padding: 24px; color: #ffffff;">
    <h2 style="margin: 0; color: #ffffff; font-size: 20px;">AUDRIN FIRE ENGINEERS</h2>
    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Early Detection. Clear Warning. Safer Buildings.</p>
  </div>
  <div style="padding: 24px;">
    <p>Dear <strong>{{client_name}}</strong>,</p>
    <p>Thank you for contacting Audrin Fire Engineers (Reference: <strong>{{request_reference}}</strong>).</p>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px; margin: 18px 0;">
      <p style="margin: 0 0 6px 0; font-size: 14px; color: #92400e; font-weight: bold;">Service Scope Clarification</p>
      <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">Audrin Fire Engineers specializes strictly in commercial and non-domestic electronic fire-detection and fire-alarm systems. Our scope does not include physical fire suppression hardware (such as fire extinguishers, hose reels, hydrants, sprinklers, or gas suppression) or standalone CCTV/security systems.</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6;">If your project requires fire-detection design, alarm installation, commissioning, maintenance, or panel fault-finding, we will gladly assist. An engineer is available to answer any fire-detection questions.</p>
  </div>
  <div style="background-color: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b;">
    <p style="margin: 0 0 4px 0;"><strong>Audrin Fire Engineers (Pty) Ltd</strong> | Registration No: K2026089596</p>
    <p style="margin: 0 0 4px 0;">27 Tshivhase Street, Pretoria West, Pretoria, 0008 | Tel: 071 415 6665</p>
    <p style="margin: 0;">Email: bethuelmoukangwe8@gmail.com | Hours: Monday–Sunday: 07:00–20:00</p>
  </div>
</div>`,
    plainTextBodyTemplate: `AUDRIN FIRE ENGINEERS
Early Detection. Clear Warning. Safer Buildings.

Dear {{client_name}},

Thank you for contacting Audrin Fire Engineers (Reference: {{request_reference}}).

Service Scope Clarification:
Audrin Fire Engineers specializes strictly in commercial and non-domestic electronic fire-detection and fire-alarm systems. We do not provide physical suppression systems (extinguishers, hose reels, sprinklers) or CCTV/security systems.

If you have fire-detection or fire-alarm requirements, our team is at your disposal.

---
Audrin Fire Engineers (Pty) Ltd | Reg No: K2026089596
27 Tshivhase Street, Pretoria West, Pretoria, 0008
Tel: 071 415 6665 | Email: bethuelmoukangwe8@gmail.com`,
    requiredVariables: ['client_name', 'request_reference'],
    isActive: true,
    version: 1,
    requiresHumanReview: false,
    updatedAt: '2026-09-01T12:00:00Z'
  }
];

export const INITIAL_DEMO_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-001',
    referenceNumber: 'AFE-REQ-2026-0104',
    customerId: 'usr-cust-01',
    customerName: 'Marcus Ndlovu',
    organisationName: 'Tshwane Logistics Park',
    email: 'marcus.n@tshwanelogistics.co.za',
    phone: '082 555 1290',
    preferredContactMethod: 'email',
    siteName: 'Warehouse Distribution Hub 3',
    streetAddress: '14 Industrial Parkway',
    city: 'Pretoria West',
    province: 'Gauteng',
    postalCode: '0183',
    buildingType: 'Industrial Warehouse & Logistics',
    approximateBuildingSize: '12,500 m²',
    numberOfFloors: 1,
    serviceSlug: 'fire-detection-site-surveys',
    serviceTitle: 'Fire-Detection Site Surveys',
    systemType: 'Analogue Addressable Network',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    zonesOrLoopsCount: '4 Loops, 16 Zones',
    existingFaultOrRequirement: 'New high-bay mezzanine racking installed; requires evaluation for optical beam detection coverage.',
    urgency: 'standard',
    preferredSiteVisitDate: '2026-09-08',
    additionalInformation: 'Facility operates 24/7. Site contact will arrange safety briefing upon arrival.',
    status: 'Site survey scheduled',
    assignedStaff: 'Bethuel Moukangwe',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    createdAt: '2026-08-28T09:30:00Z',
    updatedAt: '2026-08-29T14:15:00Z',
    attachments: [
      {
        id: 'att-01',
        fileName: 'Pretoria_Logistics_Ground_Floor.dwg',
        fileSize: '5.8 MB',
        fileType: 'application/acad',
        fileUrl: '#',
        uploadedAt: '2026-08-28T09:30:00Z',
        category: 'drawings',
        isInternalOnly: false
      },
      {
        id: 'att-01b',
        fileName: 'Mezzanine_Layout_Draft.pdf',
        fileSize: '2.4 MB',
        fileType: 'application/pdf',
        fileUrl: '#',
        uploadedAt: '2026-08-28T09:32:00Z',
        category: 'drawings',
        isInternalOnly: false
      },
      {
        id: 'att-01c',
        fileName: 'Fire_Alarm_Device_Schedule_Matrix.xlsx',
        fileSize: '840 KB',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileUrl: '#',
        uploadedAt: '2026-08-28T09:35:00Z',
        category: 'spreadsheet',
        isInternalOnly: false
      },
      {
        id: 'att-01d',
        fileName: 'SANS_10139_Design_Method_Statement.docx',
        fileSize: '1.2 MB',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileUrl: '#',
        uploadedAt: '2026-08-28T09:40:00Z',
        category: 'word_document',
        isInternalOnly: false
      }
    ],
    statusHistory: [
      {
        id: 'sh-01',
        status: 'Submitted',
        changedBy: 'System (Client Portal)',
        timestamp: '2026-08-28T09:30:00Z',
        notes: 'Initial web submission received.',
        visibleToCustomer: true
      },
      {
        id: 'sh-02',
        status: 'Under review',
        changedBy: 'Staff Operator',
        timestamp: '2026-08-28T11:00:00Z',
        notes: 'Reviewing mezzanine floor plan.',
        visibleToCustomer: true
      },
      {
        id: 'sh-03',
        status: 'Site survey scheduled',
        changedBy: 'Bethuel Moukangwe',
        timestamp: '2026-08-29T14:15:00Z',
        notes: 'Site survey confirmed for 8 September 2026.',
        visibleToCustomer: true
      }
    ],
    siteVisits: [
      {
        id: 'sv-01',
        serviceRequestId: 'req-001',
        scheduledDate: '2026-09-08',
        scheduledTimeWindow: '09:00 - 12:00',
        technicianName: 'Bethuel Moukangwe',
        purpose: 'Conduct high-bay optical beam survey & ceiling void assessment',
        status: 'Scheduled',
        createdAt: '2026-08-29T14:15:00Z'
      }
    ],
    internalNotes: [
      {
        id: 'in-01',
        authorName: 'Bethuel Moukangwe',
        content: 'Check high-reach scissor lift availability on site prior to travel.',
        createdAt: '2026-08-29T14:20:00Z',
        priority: 'normal'
      }
    ],
    customerMessages: [
      {
        id: 'cm-01',
        senderName: 'Bethuel Moukangwe',
        senderRole: 'staff',
        content: 'Good day Marcus. We have scheduled the site survey for Tuesday 8 September at 09:00. Please let us know if visitor access permits are required in advance.',
        timestamp: '2026-08-29T14:18:00Z'
      }
    ]
  },
  {
    id: 'req-002',
    referenceNumber: 'AFE-REQ-2026-0105',
    customerId: 'usr-cust-02',
    customerName: 'Sarah van der Merwe',
    organisationName: 'Pretoria Medipark Suites',
    email: 'sarah.vdm@mediparkpretoria.co.za',
    phone: '072 334 8812',
    preferredContactMethod: 'phone',
    siteName: 'Medical Suites Block B',
    streetAddress: '88 Francis Baard Street',
    city: 'Pretoria Central',
    province: 'Gauteng',
    postalCode: '0002',
    buildingType: 'Healthcare & Medical Clinic',
    approximateBuildingSize: '3,800 m²',
    numberOfFloors: 3,
    serviceSlug: 'emergency-fire-alarm-fault-support',
    serviceTitle: 'Emergency Fire-Alarm Fault Support',
    systemType: 'Addressable Fire Alarm System',
    panelMakeModel: 'Ziton ZP3',
    zonesOrLoopsCount: '2 Loops',
    existingFaultOrRequirement: 'Continuous yellow fault LED on Loop 2 with recurring ground earth fault warning.',
    urgency: 'urgent_emergency',
    preferredSiteVisitDate: '2026-09-02',
    additionalInformation: 'Fault buzzer silenced manually, but panel troubles continue. Need urgent diagnostic check.',
    status: 'Work scheduled',
    assignedStaff: 'Lead Fire Diagnostics Engineer',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    createdAt: '2026-09-01T08:15:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    attachments: [
      {
        id: 'att-02',
        fileName: 'Panel_LCD_Error_Display.jpg',
        fileSize: 1850000,
        fileType: 'image/jpeg',
        fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        uploadedAt: '2026-09-01T08:15:00Z',
        category: 'fault_screenshot',
        isInternalOnly: false
      }
    ],
    statusHistory: [
      {
        id: 'sh-04',
        status: 'Submitted',
        changedBy: 'System (Fault Form)',
        timestamp: '2026-09-01T08:15:00Z',
        notes: 'Emergency fault reported with high urgency tag.',
        visibleToCustomer: true
      },
      {
        id: 'sh-05',
        status: 'Work scheduled',
        changedBy: 'Operations Dispatch',
        timestamp: '2026-09-01T09:00:00Z',
        notes: 'Engineer dispatched for emergency triage.',
        visibleToCustomer: true
      }
    ],
    siteVisits: [
      {
        id: 'sv-02',
        serviceRequestId: 'req-002',
        scheduledDate: '2026-09-01',
        scheduledTimeWindow: '14:00 - 16:00',
        technicianName: 'Lead Fire Diagnostics Engineer',
        purpose: 'Isolate and resolve ground fault on Ziton ZP3 Loop 2',
        status: 'Scheduled',
        createdAt: '2026-09-01T09:00:00Z'
      }
    ],
    internalNotes: [
      {
        id: 'in-02',
        authorName: 'Operations Admin',
        content: 'Client reports recent roof leak in 2nd floor dental room ceiling void. Check that area first for moisture in detector base.',
        createdAt: '2026-09-01T09:05:00Z',
        priority: 'high'
      }
    ],
    customerMessages: []
  }
];

export const SANS_10139_CATEGORIES = [
  {
    code: 'Category M',
    name: 'Manual System',
    description: 'Manual call points (break-glass units) throughout the building with sounders; no automatic fire detectors.',
    application: 'Commercial workspaces where occupants are continuously present and alert.'
  },
  {
    code: 'Category L1',
    name: 'Total Life Safety Protection',
    description: 'Automatic detectors installed throughout all areas of the building, including roof voids and risers.',
    application: 'Healthcare facilities, hotels, complex high-density commercial premises.'
  },
  {
    code: 'Category L2',
    name: 'Defined Escape & High-Risk Areas',
    description: 'Automatic detectors in escape routes, rooms opening onto escape routes, and high-hazard spaces.',
    application: 'Multi-storey office complexes and medium-risk commercial buildings.'
  },
  {
    code: 'Category L3',
    name: 'Escape Route Protection',
    description: 'Automatic detectors installed along escape corridors and stairways to safeguard safe egress.',
    application: 'Commercial offices, educational buildings, standard business occupancies.'
  },
  {
    code: 'Category L4',
    name: 'Escape Path Circulation Only',
    description: 'Detectors positioned exclusively in main circulation corridors and stairwells.',
    application: 'Low-risk open layout facilities with direct ground-level exits.'
  },
  {
    code: 'Category P1',
    name: 'Total Property Protection',
    description: 'Comprehensive automatic detection across all rooms and spaces to protect property and assets.',
    application: 'High-value warehouses, data processing centres, manufacturing archives.'
  },
  {
    code: 'Category P2',
    name: 'Defined High-Risk Property Areas',
    description: 'Automatic detection targeted at high-risk plant rooms, electrical switch rooms, and server suites.',
    application: 'Commercial buildings with specific high-value plant or electrical assets.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-01',
    actor: 'System Initialization',
    action: 'System Boot',
    model: 'Platform',
    recordId: 'Core-01',
    details: 'Audrin Fire Engineers platform initialized with SANS 10139 aligned services & email response engine.',
    ipAddress: '127.0.0.1',
    timestamp: '2026-09-01T06:00:00Z'
  },
  {
    id: 'aud-02',
    actor: 'Marcus Ndlovu',
    action: 'CREATE',
    model: 'ServiceRequest',
    recordId: 'AFE-REQ-2026-0104',
    details: 'Submitted site survey request for Warehouse Distribution Hub 3.',
    ipAddress: '105.22.140.12',
    timestamp: '2026-08-28T09:30:00Z'
  },
  {
    id: 'aud-03',
    actor: 'Bethuel Moukangwe',
    action: 'UPDATE_STATUS',
    model: 'ServiceRequest',
    recordId: 'AFE-REQ-2026-0104',
    details: 'Status changed from Under Review to Site survey scheduled.',
    ipAddress: '197.185.12.8',
    timestamp: '2026-08-29T14:15:00Z'
  },
  {
    id: 'aud-04',
    actor: 'Sarah van der Merwe',
    action: 'CREATE_EMERGENCY_FAULT',
    model: 'ServiceRequest',
    recordId: 'AFE-REQ-2026-0105',
    details: 'Emergency fault ticket submitted for Pretoria Medipark Suites.',
    ipAddress: '105.18.99.44',
    timestamp: '2026-09-01T08:15:00Z'
  }
];

// ----------------------------------------------------------------------
// VOICE AI GUIDE INITIAL DATA (Django Model Schema & Approved Narration)
// ----------------------------------------------------------------------

export const INITIAL_VOICE_GUIDE = {
  id: 'vg-sans10139-workflow',
  title: 'Audrin Fire Engineers 7-Step Service Process',
  language: 'en-ZA',
  introduction: {
    title: 'Introduction to Audrin Fire Engineers',
    text: 'Welcome to Audrin Fire Engineers. We provide professional fire-detection and fire-alarm services for commercial and non-domestic buildings. Here is how our service process works.',
    durationSeconds: 10
  },
  steps: [
    {
      stepNumber: 1,
      stepId: 'step-1-enquiry',
      title: 'Enquiry and Consultation',
      shortLabel: 'Enquiry',
      narrationText: 'Step one: Enquiry and consultation. Tell us about your building, existing fire-alarm system and the service you require. You can submit your request online, telephone us or send us an email.',
      durationSeconds: 12,
      iconName: 'MessageSquare',
      typicalDeliverables: ['Enquiry acknowledgement', 'Preliminary information checklist', 'Scope confirmation'],
      clientResponsibilities: ['Provide building floor plans or sketches', 'Identify key site contact', 'Specify known fire strategy requirements']
    },
    {
      stepNumber: 2,
      stepId: 'step-2-survey',
      title: 'Site Survey and System Assessment',
      shortLabel: 'Site Survey',
      narrationText: 'Step two: Site survey and system assessment. Where necessary, our team will arrange a site visit to assess the building, existing fire-alarm equipment, site conditions and available documentation.',
      durationSeconds: 13,
      iconName: 'ClipboardCheck',
      typicalDeliverables: ['Site survey report', 'Risk and coverage evaluation', 'Existing equipment condition log'],
      clientResponsibilities: ['Ensure full plant room, ceiling, and riser access', 'Provide escort/security clearances if required']
    },
    {
      stepNumber: 3,
      stepId: 'step-3-category-design',
      title: 'System Category and Design',
      shortLabel: 'System Design',
      narrationText: 'Step three: System category and design. We review the project requirements and develop or assess the proposed fire-detection design according to the applicable fire strategy, project specifications, manufacturer requirements and relevant SANS 10139 recommendations.',
      durationSeconds: 16,
      iconName: 'DraftingCompass',
      typicalDeliverables: ['System layout drawings', 'Cause-and-effect matrix', 'Device schedule', 'Battery standby calculations'],
      clientResponsibilities: ['Review and sign off on fire strategy interfaces (e.g. HVAC shutdown, access control release)']
    },
    {
      stepNumber: 4,
      stepId: 'step-4-scope-quotation',
      title: 'Scope and Quotation',
      shortLabel: 'Quotation',
      narrationText: 'Step four: Scope and quotation. After reviewing the available information, we prepare a clear scope of work and quotation for the required fire-detection service.',
      durationSeconds: 11,
      iconName: 'FileText',
      typicalDeliverables: ['Formal itemised quotation', 'Bill of quantities (BOQ)', 'Implementation schedule'],
      clientResponsibilities: ['Commercial approval and appointment confirmation', 'Site readiness scheduling']
    },
    {
      stepNumber: 5,
      stepId: 'step-5-installation',
      title: 'Installation',
      shortLabel: 'Installation',
      narrationText: 'Step five: Installation. Once the scope and quotation have been approved, the installation or modification work is scheduled and completed according to the approved project requirements.',
      durationSeconds: 12,
      iconName: 'Wrench',
      typicalDeliverables: ['Progress inspection notes', 'Cable insulation resistance tests', 'As-installed device tagging'],
      clientResponsibilities: ['Provide uninterrupted access during work windows', 'Coordinate with building tenants where necessary']
    },
    {
      stepNumber: 6,
      stepId: 'step-6-testing-commissioning',
      title: 'Testing and Commissioning',
      shortLabel: 'Commissioning',
      narrationText: 'Step six: Testing and commissioning. The installed fire-detection system is inspected, tested and commissioned. Identified faults or outstanding items are documented for the appropriate action.',
      durationSeconds: 13,
      iconName: 'Activity',
      typicalDeliverables: ['Point-to-point test record', 'Audibility decibel survey log', 'Commissioning documentation'],
      clientResponsibilities: ['Notify building occupants of sounder testing', 'Coordinate interface witness parties (e.g. lift/HVAC contractor)']
    },
    {
      stepNumber: 7,
      stepId: 'step-7-handover-maintenance',
      title: 'Handover and Maintenance',
      shortLabel: 'Handover',
      narrationText: 'Step seven: Handover and maintenance. Relevant system information and available handover documentation are provided, and planned maintenance requirements can be arranged to help keep the fire-alarm system operational.',
      durationSeconds: 14,
      iconName: 'ShieldCheck',
      typicalDeliverables: ['As-built system documentation pack', 'Fire alarm logbook', 'Operator training record', 'Maintenance agreement schedule'],
      clientResponsibilities: ['Nominate trained responsible person for weekly testing', 'Maintain physical fire alarm logbook on site']
    }
  ],
  conclusion: {
    title: 'Request a Fire-Detection Service',
    text: 'Select Request a Fire-Detection Service to send us your requirements. You can also call Audrin Fire Engineers on 071 415 6665. Our operating hours are Monday to Sunday, from seven in the morning until eight in the evening.',
    durationSeconds: 15,
    ctaLabel: 'Request a Fire-Detection Service',
    phoneHotline: '071 415 6665',
    operatingHours: 'Monday–Sunday: 07:00–20:00'
  },
  version: 2,
  publicationStatus: 'published' as const,
  voiceConfig: {
    id: 'vc-south-africa-01',
    voiceName: 'en-ZA-LeahNeural',
    displayName: 'South African English (Professional Engineering Clear)',
    language: 'en-ZA',
    accent: 'South African (Pretoria / Gauteng)',
    gender: 'Female' as const,
    engine: 'celery_tts_edge' as const,
    speakingRate: 1.0,
    pitch: 0.0,
    sampleRateHz: 48000,
    audioFormat: 'mp3' as const
  },
  audioDurationTotal: 103,
  lastGeneratedAt: '2026-09-01T08:30:00Z',
  publishedAt: '2026-09-01T08:35:00Z',
  publishedBy: 'Bethuel Moukangwe (Superadmin)',
  checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  versionHistory: [
    {
      version: 2,
      publishedAt: '2026-09-01T08:35:00Z',
      publishedBy: 'Bethuel Moukangwe',
      changeSummary: 'Updated SANS 10139 aligned step descriptions and verified contact hotline pronunciation.',
      voiceName: 'en-ZA-LeahNeural',
      status: 'published' as const
    },
    {
      version: 1,
      publishedAt: '2026-08-15T10:00:00Z',
      publishedBy: 'Bethuel Moukangwe',
      changeSummary: 'Initial release of 7-step guided workflow narration.',
      voiceName: 'en-ZA-LukeNeural',
      status: 'superseded' as const
    }
  ],
  generationJobs: [
    {
      jobId: 'job-audio-2026-0901',
      celeryTaskId: 'celery-task-8492048-audio-gen',
      status: 'completed' as const,
      durationSeconds: 3.4,
      timestamp: '2026-09-01T08:30:00Z'
    }
  ]
};

export const INITIAL_VOICE_METRICS = {
  playCount: 142,
  completedNarrations: 98,
  stepSelections: {
    1: 42,
    2: 38,
    3: 56,
    4: 29,
    5: 33,
    6: 47,
    7: 35
  },
  playbackErrors: 0,
  audioGenerationSuccesses: 12,
  audioGenerationFailures: 0,
  avgGenerationDurationSec: 3.2
};

// ----------------------------------------------------------------------
// DURING-WORK VIDEO EVIDENCE INITIAL DATA (FFmpeg, Celery & SANS 10139)
// ----------------------------------------------------------------------

export const INITIAL_SERVICE_VIDEOS = [
  {
    id: 'vid-afe-001',
    referenceNumber: 'AFE-VID-2026-0104-01',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteName: 'Warehouse Distribution Hub 3',
    siteAreaOrRoom: 'High-Bay Racking Zone B (Ceiling Height 9.5m)',
    equipmentReference: 'Optical Beam Detector Receiver OB-02',
    siteVisitId: 'sv-001',
    clientId: 'usr-cust-01',
    clientName: 'Marcus Ndlovu',
    organisationName: 'Apex Logistics Gauteng (Pty) Ltd',
    uploadedBy: 'Thabo Mokoena (Lead Field Technician)',
    uploaderRole: 'staff' as const,
    originalFileName: 'beam_detector_alignment_test.mp4',
    secureStoredFileName: 'secure_afe_vid_2026_0104_01_transcoded.mp4',
    mimeType: 'video/mp4',
    fileSize: 18450000,
    fileSizeFormatted: '17.6 MB',
    duration: 38,
    dateRecorded: '2026-08-30',
    uploadTimestamp: '2026-08-30T11:42:00Z',
    title: 'High-Bay Optical Beam Alignment & Signal Margin Verification',
    description: 'Video recording of beam transmitter-receiver alignment at 9.5m height, testing obscuration attenuation threshold and signal level reading (88% optimum strength).',
    category: 'testing_evidence' as const,
    workStage: 'Testing & Commissioning',
    reviewStatus: 'included_in_report' as const,
    customerVisibleStatus: 'Included in Final Report' as const,
    isCustomerVisible: true,
    includedInReport: true,
    reviewedBy: 'Bethuel Moukangwe (Superadmin)',
    reviewTimestamp: '2026-08-30T14:10:00Z',
    internalNotes: 'Verified alignment within SANS 10139 optical beam tolerances. Clean test with no beam wander.',
    isLockedAfterReport: true,
    privacyConsentAccepted: true,
    privacyConsentTimestamp: '2026-08-30T11:41:40Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    signedUrlExpiresAt: '2026-09-02T15:00:00Z',
    timestampMarkers: [
      {
        id: 'tm-01',
        timestampSeconds: 12,
        timestampFormatted: '00:12',
        title: 'Signal Strength Meter Reading 88%',
        description: 'Transmitter signal level aligned across 65m throw distance.',
        stillImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        approvedForReport: true,
        selectedBy: 'Bethuel Moukangwe',
        createdAt: '2026-08-30T14:15:00Z'
      },
      {
        id: 'tm-02',
        timestampSeconds: 26,
        timestampFormatted: '00:26',
        title: 'Obscuration Alarm Trip & Strobe Actuation',
        description: 'Simulated smoke filter insertion triggering alarm threshold within 3 seconds.',
        stillImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        approvedForReport: true,
        selectedBy: 'Bethuel Moukangwe',
        createdAt: '2026-08-30T14:16:00Z'
      }
    ],
    processingJob: {
      jobId: 'proc-job-001',
      celeryTaskId: 'celery-ffmpeg-task-1982',
      status: 'completed' as const,
      progressPercentage: 100,
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      malwareScanStatus: 'clean' as const,
      ffmpegTranscodeStatus: 'completed' as const,
      extractedMetadata: {
        codec: 'h264 (High)',
        width: 1920,
        height: 1080,
        fps: 30,
        durationSec: 38,
        audioChannels: 2,
        bitrateKbps: 3850
      },
      processingLogs: [
        '[Celery-Worker-1] Task received: process_video_evidence_job',
        '[Security] SHA-256 computed: e3b0c442... [MATCH]',
        '[ClamAV] Malware scan passed: Clean 0 threats detected',
        '[FFmpeg] Input #0, mov,mp4,m4a from uploaded buffer',
        '[FFmpeg] Transcode to H.264 MP4 faststart baseline: OK',
        '[FFmpeg] Thumbnail extraction at 00:02: OK',
        '[Storage] Stored in private bucket /evidence/2026/08/AFE-VID-2026-0104-01.mp4'
      ],
      completedAt: '2026-08-30T11:43:10Z'
    },
    accessLogs: [
      {
        id: 'acc-01',
        userId: 'usr-admin-01',
        userName: 'Bethuel Moukangwe',
        userRole: 'superadmin',
        action: 'REVIEW_AND_APPROVE',
        timestamp: '2026-08-30T14:10:00Z',
        ipAddress: '197.185.12.8'
      },
      {
        id: 'acc-02',
        userId: 'usr-cust-01',
        userName: 'Marcus Ndlovu',
        userRole: 'customer',
        action: 'VIEW_SECURE_STREAM',
        timestamp: '2026-08-31T09:12:00Z',
        ipAddress: '105.22.140.12'
      }
    ]
  },
  {
    id: 'vid-afe-002',
    referenceNumber: 'AFE-VID-2026-0105-01',
    serviceRequestId: 'req-002',
    serviceRequestRef: 'AFE-REQ-2026-0105',
    siteName: 'Pretoria Medipark Suites',
    siteAreaOrRoom: 'Level 2 West Wing Corridor & Riser C',
    equipmentReference: 'Addressable Optical Multi-Sensor Zone 2 (ID: 2-045)',
    siteVisitId: 'sv-002',
    clientId: 'usr-cust-02',
    clientName: 'Dr. Sarah van der Merwe',
    organisationName: 'Medipark Holdings (Pty) Ltd',
    uploadedBy: 'Dr. Sarah van der Merwe (Client Facility Manager)',
    uploaderRole: 'customer' as const,
    originalFileName: 'panel_beeping_error_display.mov',
    secureStoredFileName: 'secure_afe_vid_2026_0105_01_transcoded.mp4',
    mimeType: 'video/quicktime',
    fileSize: 12100000,
    fileSizeFormatted: '11.5 MB',
    duration: 22,
    dateRecorded: '2026-09-01',
    uploadTimestamp: '2026-09-01T08:20:00Z',
    title: 'Client-submitted: Main Fire Panel Earth Fault Display & Buzzer',
    description: 'Video recorded on mobile showing the LCD fault message "ZONE 2 LOOP 1 EARTH FAULT NEGATIVE" and intermittent audible panel beeper.',
    category: 'fire_alarm_panel_display' as const,
    workStage: 'Fault Emergency Triage',
    reviewStatus: 'awaiting_review' as const,
    customerVisibleStatus: 'Client-submitted video evidence — awaiting review' as const,
    isCustomerVisible: true,
    includedInReport: false,
    internalNotes: 'Diagnostic triage: Indicates physical cable insulation degradation on negative return conductor in Zone 2 riser.',
    isLockedAfterReport: false,
    privacyConsentAccepted: true,
    privacyConsentTimestamp: '2026-09-01T08:19:30Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    signedUrlExpiresAt: '2026-09-02T15:00:00Z',
    timestampMarkers: [
      {
        id: 'tm-03',
        timestampSeconds: 5,
        timestampFormatted: '00:05',
        title: 'LCD Panel Display "EARTH FAULT NEGATIVE"',
        description: 'Yellow General Fault LED illuminated with Zone 2 status.',
        stillImageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        approvedForReport: false,
        selectedBy: 'Thabo Mokoena',
        createdAt: '2026-09-01T08:45:00Z'
      }
    ],
    processingJob: {
      jobId: 'proc-job-002',
      celeryTaskId: 'celery-ffmpeg-task-2004',
      status: 'completed' as const,
      progressPercentage: 100,
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      malwareScanStatus: 'clean' as const,
      ffmpegTranscodeStatus: 'completed' as const,
      extractedMetadata: {
        codec: 'h264 (Main)',
        width: 1080,
        height: 1920,
        fps: 30,
        durationSec: 22,
        audioChannels: 1,
        bitrateKbps: 4200
      },
      processingLogs: [
        '[Celery-Worker-2] Task received: process_video_evidence_job',
        '[Security] SHA-256 computed: a591a6... [MATCH]',
        '[ClamAV] Malware scan passed: Clean',
        '[FFmpeg] QuickTime MOV converted to standard Web MP4: OK',
        '[Storage] Stored in private bucket /evidence/2026/09/AFE-VID-2026-0105-01.mp4'
      ],
      completedAt: '2026-09-01T08:21:05Z'
    },
    accessLogs: [
      {
        id: 'acc-03',
        userId: 'usr-cust-02',
        userName: 'Dr. Sarah van der Merwe',
        userRole: 'customer',
        action: 'UPLOAD_COMPLETED',
        timestamp: '2026-09-01T08:20:00Z',
        ipAddress: '105.18.99.44'
      }
    ]
  },
  {
    id: 'vid-afe-003',
    referenceNumber: 'AFE-VID-2026-0106-01',
    serviceRequestId: 'req-003',
    serviceRequestRef: 'AFE-REQ-2026-0106',
    siteName: 'Menlyn Corporate Office Park',
    siteAreaOrRoom: 'Block B Ground Floor Main HVAC Plant Room',
    equipmentReference: 'Fire Damper Interface Relay Module IF-04 & HVAC Supply Fan Contactor',
    clientId: 'usr-cust-03',
    clientName: 'Johan Pieterse',
    organisationName: 'Menlyn Prime Properties (Pty) Ltd',
    uploadedBy: 'Thabo Mokoena (Lead Field Technician)',
    uploaderRole: 'staff' as const,
    originalFileName: 'hvac_damper_trip_interface_test.mp4',
    secureStoredFileName: 'secure_afe_vid_2026_0106_01_transcoded.mp4',
    mimeType: 'video/mp4',
    fileSize: 24500000,
    fileSizeFormatted: '23.4 MB',
    duration: 45,
    dateRecorded: '2026-08-25',
    uploadTimestamp: '2026-08-25T15:30:00Z',
    title: 'HVAC Air-Handling Unit Fire Damper Auto-Shutdown Interface Test',
    description: 'Verification of cause-and-effect matrix trip signal from fire alarm control panel to motorized fire dampers and mechanical ventilation shutdown on Zone 1 alarm.',
    category: 'interface_test_evidence' as const,
    workStage: 'Testing & Commissioning',
    reviewStatus: 'approved' as const,
    customerVisibleStatus: 'Approved by Audrin Engineering' as const,
    isCustomerVisible: true,
    includedInReport: true,
    reviewedBy: 'Bethuel Moukangwe',
    reviewTimestamp: '2026-08-26T09:00:00Z',
    internalNotes: 'Cause and effect logic matrix confirmed. Damper spring-return closes completely within 2.8 seconds of simulated smoke alarm.',
    isLockedAfterReport: false,
    privacyConsentAccepted: true,
    privacyConsentTimestamp: '2026-08-25T15:29:10Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    signedUrlExpiresAt: '2026-09-02T15:00:00Z',
    timestampMarkers: [
      {
        id: 'tm-04',
        timestampSeconds: 14,
        timestampFormatted: '00:14',
        title: 'Interface Relay Energisation',
        description: 'Red LED indicator illuminates on IF-04 module signifying trip output.',
        stillImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        approvedForReport: true,
        selectedBy: 'Bethuel Moukangwe',
        createdAt: '2026-08-26T09:05:00Z'
      },
      {
        id: 'tm-05',
        timestampSeconds: 32,
        timestampFormatted: '00:32',
        title: 'Damper Blade Full Closure',
        description: 'Microswitch confirms 100% mechanical seal against smoke migration.',
        stillImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        approvedForReport: true,
        selectedBy: 'Bethuel Moukangwe',
        createdAt: '2026-08-26T09:06:00Z'
      }
    ],
    processingJob: {
      jobId: 'proc-job-003',
      celeryTaskId: 'celery-ffmpeg-task-1877',
      status: 'completed' as const,
      progressPercentage: 100,
      sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b82daf487b47b8642051f618b76a08412',
      malwareScanStatus: 'clean' as const,
      ffmpegTranscodeStatus: 'completed' as const,
      extractedMetadata: {
        codec: 'h264 (High)',
        width: 1920,
        height: 1080,
        fps: 30,
        durationSec: 45,
        audioChannels: 2,
        bitrateKbps: 4100
      },
      processingLogs: [
        '[Celery-Worker-3] Task received: process_video_evidence_job',
        '[Security] SHA-256 computed: c4ca4238... [MATCH]',
        '[ClamAV] Malware scan passed: Clean',
        '[FFmpeg] Transcode to H.264 MP4: OK',
        '[Storage] Stored in private bucket /evidence/2026/08/AFE-VID-2026-0106-01.mp4'
      ],
      completedAt: '2026-08-25T15:31:40Z'
    },
    accessLogs: [
      {
        id: 'acc-04',
        userId: 'usr-admin-01',
        userName: 'Bethuel Moukangwe',
        userRole: 'superadmin',
        action: 'REVIEW_AND_APPROVE',
        timestamp: '2026-08-26T09:00:00Z',
        ipAddress: '197.185.12.8'
      }
    ]
  }
];

export const INITIAL_VIDEO_METRICS = {
  uploadsStarted: 28,
  uploadsCompleted: 27,
  failedUploads: 1,
  processingSuccesses: 27,
  processingFailures: 0,
  avgProcessingDurationSec: 4.6,
  totalStorageBytes: 589400000, // ~589 MB
  videosAwaitingReview: 1
};

// ----------------------------------------------------------------------
// AUTOMATED PRE-WORK & POST-WORK CONDITION REPORTS INITIAL DATA
// ----------------------------------------------------------------------

export const INITIAL_REPORT_PHOTOS: ReportPhotoSelection[] = [
  // Before-work photo 1 (Panel)
  {
    id: 'pht-01',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    originalFileName: 'panel_pre_inspection.jpg',
    stage: 'before_work',
    category: 'fire_alarm_panel',
    roomOrLocation: 'Ground Floor Security Control Room',
    caption: 'Advanced MXPro 5 4-Loop Addressable Panel in standby condition with healthy AC mains indicator.',
    visibleConditionNotes: 'Clean external casing, internal wiring harness organized, no active latching alarms visible.',
    clientReportedFault: 'Need to extend detection into new mezzanine distribution section.',
    dateRecorded: '2026-08-28',
    uploadedAt: '2026-08-28T09:35:00Z',
    uploadedBy: 'Marcus Ndlovu',
    uploaderRole: 'customer',
    reviewStatus: 'included_in_report',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isApprovedForReport: true,
    equipmentReference: 'Main FACP Loop 1-4'
  },
  // Before-work photo 2 (High-bay ceiling)
  {
    id: 'pht-02',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    originalFileName: 'high_bay_racking_mezzanine.jpg',
    stage: 'before_work',
    category: 'smoke_heat_detector',
    roomOrLocation: 'High-Bay Mezzanine Bay 4',
    caption: 'Newly erected 9.5m steel structural racking creating optical line-of-sight obstruction for existing ceiling sensors.',
    visibleConditionNotes: 'High-volume warehouse bay with open structural steel purlins. Dead air pockets possible near apex.',
    clientReportedFault: 'New storage racks obstruct previous point detector coverage.',
    dateRecorded: '2026-08-28',
    uploadedAt: '2026-08-28T09:40:00Z',
    uploadedBy: 'Marcus Ndlovu',
    uploaderRole: 'customer',
    reviewStatus: 'included_in_report',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    isApprovedForReport: true,
    equipmentReference: 'Ceiling Bay 4 Beam Target'
  },
  // During-work photo 1 (Containment & Cabling)
  {
    id: 'pht-03',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
    originalFileName: 'galvanised_containment_run.jpg',
    stage: 'during_work',
    category: 'cable_route_containment',
    roomOrLocation: 'High-Bay Mezzanine High-Level Truss Line',
    caption: 'Installation of 20mm galvanized steel conduit containment and red PH30 fire-resistant cable routing along structural beam.',
    visibleConditionNotes: 'Saddled at 600mm regular intervals with metallic all-metal fixings.',
    dateRecorded: '2026-08-30',
    uploadedAt: '2026-08-30T10:15:00Z',
    uploadedBy: 'Thabo Mokoena',
    uploaderRole: 'staff',
    reviewStatus: 'included_in_report',
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    isApprovedForReport: true,
    equipmentReference: 'Loop 3 Containment Run'
  },
  // After-work photo 1 (Optical Beam Transmitter & Receiver)
  {
    id: 'pht-04',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=300&q=80',
    originalFileName: 'optical_beam_mounted_after.jpg',
    stage: 'after_work',
    category: 'smoke_heat_detector',
    roomOrLocation: 'High-Bay Mezzanine Bay 4 (Apex Elevation)',
    caption: 'End-to-End Optical Beam Detector receiver mounted securely, aligned at 88% signal margin, with engraved device ID tag OB-02.',
    visibleConditionNotes: 'Device casing securely torqued to structural bracket, LED green normal pulse confirmed, test filter validated.',
    dateRecorded: '2026-08-30',
    uploadedAt: '2026-08-30T13:45:00Z',
    uploadedBy: 'Thabo Mokoena',
    uploaderRole: 'staff',
    reviewStatus: 'approved',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b82daf487b47b8642051f618b76a08412',
    isApprovedForReport: true,
    equipmentReference: 'Loop 3 Address 42 (OB-02)'
  },
  // Medipark Before-Work Photo
  {
    id: 'pht-05',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
    originalFileName: 'medipark_panel_lcd_error.jpg',
    stage: 'before_work',
    category: 'fault_indicator_display',
    roomOrLocation: 'Medical Suites Block B Ground Floor Foyer',
    caption: 'Ziton ZP3 Panel LCD displaying "ZONE 2 LOOP 1 EARTH FAULT NEGATIVE" with continuous yellow General Fault indicator.',
    visibleConditionNotes: 'Yellow General Fault LED active, buzzer muted manually, earth fault persists across system restarts.',
    clientReportedFault: 'Continuous yellow fault LED with audible buzzer ringing.',
    dateRecorded: '2026-09-01',
    uploadedAt: '2026-09-01T08:18:00Z',
    uploadedBy: 'Dr. Sarah van der Merwe',
    uploaderRole: 'customer',
    reviewStatus: 'included_in_report',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    isApprovedForReport: true,
    equipmentReference: 'Ziton ZP3 Panel Main PCB'
  }
];

export const INITIAL_CONDITION_REPORTS: ConditionReport[] = [
  {
    id: 'rep-pre-001',
    referenceNumber: 'AFE-REP-PRE-2026-0104-01',
    reportType: 'pre_work',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    status: 'acknowledged_by_client',
    clientName: 'Marcus Ndlovu',
    clientOrganisation: 'Tshwane Logistics Park',
    clientEmail: 'marcus.n@tshwanelogistics.co.za',
    clientPhone: '082 555 1290',
    siteName: 'Warehouse Distribution Hub 3',
    siteAddress: '14 Industrial Parkway, Pretoria West, Gauteng 0183',
    selectedServiceSlug: 'fire-detection-site-surveys',
    selectedServiceTitle: 'Fire-Detection Site Surveys',
    scopeOfWorkSummary: [
      'Visual evaluation of client-submitted before-work photographs',
      'Evaluation of new mezzanine steel racking geometry vs existing point sensors',
      'Gap analysis of structural truss mounting points and beam clearance',
      'Preliminary preparation for on-site physical optical beam survey'
    ],
    buildingType: 'Industrial Warehouse & Logistics',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    zonesOrLoopsCount: '4 Loops, 16 Zones',
    problemDescription: 'New high-bay mezzanine racking installed; requires evaluation for optical beam detection coverage.',
    evidenceSubmittedDate: '2026-08-28T09:45:00Z',
    reportGeneratedDate: '2026-08-28T10:00:00Z',
    recommendedWorkflowStep: {
      stepNumber: 2,
      stepTitle: 'Site Survey & Assessment',
      rationale: 'A physical site survey is required to evaluate high-bay optical line of sight, verify scissor lift access, and calculate beam throw distances.'
    },
    missingRequiredInfo: [
      'Accurate structural CAD cross-section showing roof apex height and scissor lift floor load rating'
    ],
    itemsRequiringPhysicalAssessment: [
      'Measurement of ambient thermal stratifications under roof corrugated metal sheeting',
      'Verification of spare loop capacity on Loop 3 of the Advanced MXPro 5 panel',
      'Physical inspection of existing cable riser containment between control room and Bay 4'
    ],
    statutoryDisclaimer:
      'This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records the visible condition shown in the submitted evidence and does not replace a physical site inspection, testing, commissioning or formal compliance assessment.',
    secureDashboardLink: '/customer-portal?request=AFE-REQ-2026-0104&report=AFE-REP-PRE-2026-0104-01',
    currentVersionNumber: 1.0,
    currentVersion: {
      id: 'ver-pre-001',
      versionNumber: 1.0,
      versionTag: 'v1.0',
      reportReference: 'AFE-REP-PRE-2026-0104-01',
      fileHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      generatedAt: '2026-08-28T10:00:00Z',
      generatedByTask: 'celery.tasks.condition_report_worker_v2',
      reasonForVersion: 'Initial automated Pre-Work Condition Report generated from client-submitted photographic evidence.',
      snapshot: {
        id: 'snp-pre-001',
        snapshotTimestamp: '2026-08-28T09:59:50Z',
        lockedBy: 'Celery Worker Task (task_generate_pre_work_condition_report)',
        photosCount: 2,
        videosCount: 0,
        photos: [INITIAL_REPORT_PHOTOS[0], INITIAL_REPORT_PHOTOS[1]],
        videos: [],
        snapshotSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        isLocked: true
      },
      findings: [
        {
          id: 'fnd-01',
          category: 'Control Equipment & Panel Status',
          findingText: 'The submitted photograph appears to show an Advanced Electronics MXPro 5 addressable fire panel in normal standby condition with healthy AC mains illuminated.',
          visibleEvidenceSummary: 'Clean panel enclosure, normal standby LCD visible in Ground Floor Security Room.',
          requiresPhysicalAssessment: true,
          severity: 'info',
          relatedPhotoId: 'pht-01'
        },
        {
          id: 'fnd-02',
          category: 'Coverage Obstruction & Ceiling Geometry',
          findingText: 'The submitted photograph appears to show newly erected 9.5m steel structural racking. The visible condition indicates that standard point smoke detectors may experience obstructed smoke plume migration.',
          visibleEvidenceSummary: 'Racking extends close to roof purlins; optical beam or aspirating detection recommended.',
          requiresPhysicalAssessment: true,
          severity: 'attention_required',
          relatedPhotoId: 'pht-02'
        }
      ],
      recommendations: [
        {
          id: 'rec-01',
          workflowStepNumber: 2,
          workflowStepTitle: 'Site Survey and System Assessment',
          recommendationText: 'Schedule an on-site physical survey to verify high-bay optical beam target sightlines and confirm scissor-lift floor loading.',
          rationale: 'Required to finalise device positioning in accordance with SANS 10139 beam coverage parameters.',
          priority: 'high'
        },
        {
          id: 'rec-02',
          workflowStepNumber: 4,
          workflowStepTitle: 'Scope and Quotation',
          recommendationText: 'Prepare itemised scope and quotation for optical beam receiver installation, 20mm steel containment run, and panel software programming.',
          rationale: 'Provides transparent deliverables and pricing for facility management approval.',
          priority: 'standard'
        }
      ],
      isCurrent: true
    },
    versionHistory: [],
    deliveries: [
      {
        id: 'del-01',
        reportId: 'rep-pre-001',
        recipientEmail: 'marcus.n@tshwanelogistics.co.za',
        recipientName: 'Marcus Ndlovu',
        subject: 'Pre-Work Condition Report – AFE-REQ-2026-0104',
        deliveryStatus: 'opened',
        sentAt: '2026-08-28T10:05:00Z',
        authDashboardLink: '/customer-portal?request=AFE-REQ-2026-0104&report=AFE-REP-PRE-2026-0104-01',
        sanitizedPdfAttached: false,
        retryCount: 0
      }
    ],
    acknowledgements: [
      {
        id: 'ack-01',
        reportId: 'rep-pre-001',
        clientId: 'usr-cust-01',
        clientName: 'Marcus Ndlovu',
        clientEmail: 'marcus.n@tshwanelogistics.co.za',
        acknowledgedAt: '2026-08-28T11:30:00Z',
        acknowledgementType: 'acknowledged_satisfied',
        clientNotes: 'Photographs accurately represent current racking status. Ready for site visit on 8 Sept.',
        ipAddress: '105.22.140.12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    ],
    isLocked: true
  },
  {
    id: 'rep-post-001',
    referenceNumber: 'AFE-REP-POST-2026-0104-01',
    reportType: 'post_work',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    relatedPreWorkReportRef: 'AFE-REP-PRE-2026-0104-01',
    status: 'generated',
    clientName: 'Marcus Ndlovu',
    clientOrganisation: 'Tshwane Logistics Park',
    clientEmail: 'marcus.n@tshwanelogistics.co.za',
    clientPhone: '082 555 1290',
    siteName: 'Warehouse Distribution Hub 3',
    siteAddress: '14 Industrial Parkway, Pretoria West, Gauteng 0183',
    selectedServiceSlug: 'fire-detection-site-surveys',
    selectedServiceTitle: 'Fire-Detection Site Surveys',
    scopeOfWorkSummary: [
      'Verification of completed high-bay optical beam receiver installation (OB-02)',
      'Side-by-side photographic comparison of before-work obstruction vs after-work alignment',
      'Verification of 20mm galvanized steel conduit containment and PH30 fire-resistant cabling',
      'Incorporation of during-work video evidence of optical beam signal margin calibration'
    ],
    buildingType: 'Industrial Warehouse & Logistics',
    panelMakeModel: 'Advanced Electronics MXPro 5',
    zonesOrLoopsCount: '4 Loops, 16 Zones',
    problemDescription: 'High-bay optical beam detector installation and alignment verification.',
    evidenceSubmittedDate: '2026-08-30T14:00:00Z',
    reportGeneratedDate: '2026-08-30T14:30:00Z',
    recommendedWorkflowStep: {
      stepNumber: 7,
      stepTitle: 'Handover & Maintenance',
      rationale: 'Installation and testing completed. System ready for ongoing periodic preventative maintenance schedule.'
    },
    missingRequiredInfo: [],
    itemsRequiringPhysicalAssessment: [],
    workActivitiesRecorded: [
      'Rigged and fixed structural heavy-duty mounting bracket at 9.5m apex height in Bay 4',
      'Installed 65m run of 20mm galvanized steel conduit with metallic saddles spaced at 600mm',
      'Terminated red PH30 2-core fire-rated loop cabling into optical beam detector receiver (OB-02)',
      'Calibrated optical transmitter-receiver beam margin to 88% optimum signal strength',
      'Conducted simulated smoke obscuration trip test actuating panel alarm and strobe within 2.8s'
    ],
    customerSubmittedComments: [
      'Mezzanine distribution racking is now in active use. Technician worked safely with high-reach scissor lift.'
    ],
    outstandingItems: [],
    itemsRequiringFurtherTesting: [
      '6-Month periodic preventative maintenance service check on optical lens clarity and signal stability'
    ],
    requiredMaintenanceFollowup: [
      'Weekly user manual call point test rotated through building zones',
      'Daily visual check of Advanced MXPro 5 panel green power healthy indicator'
    ],
    statutoryDisclaimer:
      'This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records the visible condition shown in the submitted evidence and does not replace a physical site inspection, testing, commissioning or formal compliance assessment.',
    secureDashboardLink: '/customer-portal?request=AFE-REQ-2026-0104&report=AFE-REP-POST-2026-0104-01',
    currentVersionNumber: 1.0,
    currentVersion: {
      id: 'ver-post-001',
      versionNumber: 1.0,
      versionTag: 'v1.0',
      reportReference: 'AFE-REP-POST-2026-0104-01',
      fileHashSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      generatedAt: '2026-08-30T14:30:00Z',
      generatedByTask: 'celery.tasks.condition_report_worker_v2',
      reasonForVersion: 'Initial automated Post-Work Condition Report generated from approved during-work and after-work evidence.',
      snapshot: {
        id: 'snp-post-001',
        snapshotTimestamp: '2026-08-30T14:28:00Z',
        lockedBy: 'Celery Worker Task (task_generate_post_work_condition_report)',
        photosCount: 4,
        videosCount: 1,
        photos: [INITIAL_REPORT_PHOTOS[0], INITIAL_REPORT_PHOTOS[1], INITIAL_REPORT_PHOTOS[2], INITIAL_REPORT_PHOTOS[3]],
        videos: [
          {
            id: 'vid-afe-001',
            videoReference: 'AFE-VID-2026-0104-01',
            title: 'High-Bay Optical Beam Alignment & Signal Margin Verification',
            durationSeconds: 38,
            thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            category: 'testing_evidence',
            stillImageUrls: [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
            ],
            markersCount: 2,
            recordedStage: 'Testing & Commissioning',
            reviewStatus: 'included_in_report'
          }
        ],
        snapshotSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        isLocked: true
      },
      findings: [
        {
          id: 'fnd-p-01',
          category: 'Completed Work Verification',
          findingText: 'The submitted post-work photographic and video evidence appears to show completed optical beam detector installation at High-Bay Mezzanine Bay 4. Device OB-02 is securely torqued to structural bracket.',
          visibleEvidenceSummary: 'Optical beam receiver OB-02 installed with clean conduit containment and engraved tag.',
          requiresPhysicalAssessment: false,
          severity: 'info',
          relatedPhotoId: 'pht-04'
        },
        {
          id: 'fnd-p-02',
          category: 'Cabling & Containment Integrity',
          findingText: 'The submitted evidence appears to show 20mm galvanized steel conduit properly supported with metallic saddles along the truss line.',
          visibleEvidenceSummary: 'PH30 fire-resistant cable routed in metallic containment without visible damage.',
          requiresPhysicalAssessment: false,
          severity: 'info',
          relatedPhotoId: 'pht-03'
        }
      ],
      recommendations: [
        {
          id: 'rec-p-01',
          workflowStepNumber: 7,
          workflowStepTitle: 'Handover and Maintenance',
          recommendationText: 'Maintain periodic bi-annual optical lens cleaning and beam signal margin checks in the facility fire logbook.',
          rationale: 'Ensures ongoing operational reliability and compliance with SANS 10139 maintenance routines.',
          priority: 'high'
        }
      ],
      pairedComparisons: [
        {
          id: 'pair-01',
          beforePhoto: INITIAL_REPORT_PHOTOS[1],
          afterPhoto: INITIAL_REPORT_PHOTOS[3],
          siteArea: 'High-Bay Mezzanine Bay 4 (Apex Elevation)',
          equipmentOrDevice: 'Optical Beam Detector Receiver OB-02',
          beforeConditionCaption: 'Open roof truss area prior to beam installation with new racking causing line-of-sight obstruction.',
          recordedWorkPerformed: 'Installed galvanized bracket, mounted OB-02 receiver, terminated PH30 loop wiring, and calibrated optical alignment to 88% signal margin.',
          afterConditionCaption: 'OB-02 receiver mounted securely, green healthy LED pulsing, unobstructed optical throw to reflector.',
          evidenceDates: '2026-08-28 → 2026-08-30',
          evidenceSource: 'Marcus Ndlovu (Client) / Thabo Mokoena (Lead Field Technician)',
          reviewStatus: 'approved'
        }
      ],
      isCurrent: true
    },
    versionHistory: [],
    deliveries: [
      {
        id: 'del-p-01',
        reportId: 'rep-post-001',
        recipientEmail: 'marcus.n@tshwanelogistics.co.za',
        recipientName: 'Marcus Ndlovu',
        subject: 'Post-Work Condition Report – AFE-REQ-2026-0104',
        deliveryStatus: 'sent',
        sentAt: '2026-08-30T14:35:00Z',
        authDashboardLink: '/customer-portal?request=AFE-REQ-2026-0104&report=AFE-REP-POST-2026-0104-01',
        sanitizedPdfAttached: false,
        retryCount: 0
      }
    ],
    acknowledgements: [],
    isLocked: true
  }
];

export const INITIAL_CONDITION_REPORT_METRICS: ConditionReportMetrics = {
  preWorkReportsGenerated: 14,
  postWorkReportsGenerated: 8,
  failedGenerations: 0,
  avgGenerationDurationSec: 2.8,
  emailDeliverySuccesses: 22,
  emailDeliveryFailures: 0,
  reportsAwaitingEvidence: 3,
  reportsViewedByClients: 19,
  reportsAcknowledgedByClients: 15,
  postWorkEvidenceIncompleteCount: 1
};

// ----------------------------------------------------------------------
// INITIAL TECHNICAL DOCUMENTS & REVISION FIXTURES
// ----------------------------------------------------------------------

export const INITIAL_TECHNICAL_DOCUMENTS: TechnicalDocument[] = [
  // 1. CAD Drawing - Pretoria Logistics Ground Floor (Version 3 / Rev C)
  {
    id: 'doc-afe-cad-001',
    title: 'Pretoria Logistics Center – Ground Floor CAD Layout',
    description: 'Master architectural and fire detection device layout showing Loop 1 addressable detectors, sounders, and MCPs.',
    category: 'fire_alarm_layout',
    evidenceStage: 'general_supporting',
    serviceRequestId: 'req-demo-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteId: '144 Industrial Road, Pretoria West',
    siteName: 'Tshwane Logistics Distribution Hub',
    organisationId: 'Tshwane Logistics Holdings',
    organisationName: 'Tshwane Logistics Holdings',
    drawingNumber: 'AFE-DWG-FA-001',
    revisionNumber: 'Rev C',
    documentDate: '2026-08-27',
    preparedBy: 'Bethuel Moukangwe (Managing Director)',
    uploadedBy: 'Bethuel Moukangwe',
    uploadedByRole: 'superadmin' as any,
    uploaderEmail: 'bethuelmoukangwe8@gmail.com',
    uploadedAt: '2026-08-27T09:15:00Z',
    customerVisible: true,
    includeInReport: true,
    confidentialityLevel: 'restricted_client',
    clientComments: 'Updated revision including the new high-bay mezzanine beam detector line-of-sight offsets.',
    reviewStatus: 'approved',
    reviewNotes: 'Verified against SANS 10139 Category L1 detector spacing standards.',
    reviewedBy: 'Bethuel Moukangwe',
    reviewedAt: '2026-08-27T10:00:00Z',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath: '/secure_vault/Tshwane_Logistics/AFE-REQ-2026-0104/doc-afe-cad-001_Pretoria_Logistics_Ground_Floor_RevC.dwg',
    retentionPolicy: 'SANS 10139 5-Year Statutory Archive',
    currentVersionNumber: 3,
    currentVersion: {
      id: 'ver-cad-001-03',
      documentId: 'doc-afe-cad-001',
      versionNumber: 3,
      revisionNumber: 'Rev C',
      originalFileName: 'Pretoria_Logistics_Ground_Floor_RevC.dwg',
      secureStorageFileName: 'doc-afe-cad-001_v3_Pretoria_Logistics_Ground_Floor_RevC.dwg',
      fileExtension: 'dwg',
      mimeType: 'application/acad',
      fileSize: 14857600,
      fileSizeFormatted: '14.2 MB',
      fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      changeDescription: 'Added high-bay mezzanine beam detector line-of-sight offsets and conduit containment route.',
      uploadedBy: 'Bethuel Moukangwe',
      uploadedByRole: 'staff',
      uploaderEmail: 'bethuelmoukangwe8@gmail.com',
      uploadedAt: '2026-08-27T09:15:00Z',
      reviewStatus: 'approved',
      reviewedBy: 'Bethuel Moukangwe',
      reviewedAt: '2026-08-27T10:00:00Z',
      previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      previewType: 'cad_vector',
      previewStatus: 'ready',
      cadLayers: [
        { name: 'LOOP_01_ADDRESSABLE_DETECTORS', visible: true, color: '#CC0000', itemCount: 34 },
        { name: 'LOOP_01_MANUAL_CALL_POINTS', visible: true, color: '#FFB703', itemCount: 8 },
        { name: 'LOOP_01_SOUNDER_BEACONS', visible: true, color: '#0077B6', itemCount: 12 },
        { name: 'ARCH_WALLS_STRUCTURAL', visible: true, color: '#475569', itemCount: 86 },
        { name: 'SANS_10139_ZONE_BOUNDARIES', visible: true, color: '#10B981', itemCount: 4 },
        { name: 'CONTAINMENT_CONDUIT_PATHWAYS', visible: true, color: '#8B5CF6', itemCount: 18 }
      ],
      conversionLog: 'CAD Conversion Worker v3.4.1 (Teigha/LibreCAD Core): Vector layers and geometry extracted successfully.'
    },
    versionHistory: [
      {
        id: 'ver-cad-001-03',
        documentId: 'doc-afe-cad-001',
        versionNumber: 3,
        revisionNumber: 'Rev C',
        originalFileName: 'Pretoria_Logistics_Ground_Floor_RevC.dwg',
        secureStorageFileName: 'doc-afe-cad-001_v3_Pretoria_Logistics_Ground_Floor_RevC.dwg',
        fileExtension: 'dwg',
        mimeType: 'application/acad',
        fileSize: 14857600,
        fileSizeFormatted: '14.2 MB',
        fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        changeDescription: 'Added high-bay mezzanine beam detector line-of-sight offsets and conduit containment route.',
        uploadedBy: 'Bethuel Moukangwe',
        uploadedByRole: 'staff',
        uploaderEmail: 'bethuelmoukangwe8@gmail.com',
        uploadedAt: '2026-08-27T09:15:00Z',
        reviewStatus: 'approved',
        previewType: 'cad_vector',
        previewStatus: 'ready'
      },
      {
        id: 'ver-cad-001-02',
        documentId: 'doc-afe-cad-001',
        versionNumber: 2,
        revisionNumber: 'Rev B',
        originalFileName: 'Pretoria_Logistics_Ground_Floor_RevB.dwg',
        secureStorageFileName: 'doc-afe-cad-001_v2_Pretoria_Logistics_Ground_Floor_RevB.dwg',
        fileExtension: 'dwg',
        mimeType: 'application/acad',
        fileSize: 13950000,
        fileSizeFormatted: '13.3 MB',
        fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        fileHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        changeDescription: 'Second draft adjusting Zone 2 partition boundaries.',
        uploadedBy: 'Thabo Mokoena',
        uploadedByRole: 'staff',
        uploaderEmail: 'thabo.mokoena@audrinfire.co.za',
        uploadedAt: '2026-08-20T11:00:00Z',
        reviewStatus: 'approved',
        previewType: 'cad_vector',
        previewStatus: 'ready'
      },
      {
        id: 'ver-cad-001-01',
        documentId: 'doc-afe-cad-001',
        versionNumber: 1,
        revisionNumber: 'Rev A',
        originalFileName: 'Pretoria_Logistics_Ground_Floor_RevA.dwg',
        secureStorageFileName: 'doc-afe-cad-001_v1_Pretoria_Logistics_Ground_Floor_RevA.dwg',
        fileExtension: 'dwg',
        mimeType: 'application/acad',
        fileSize: 12800000,
        fileSizeFormatted: '12.2 MB',
        fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        fileHash: 'cd2eb0837c9b4c962c22d2ff8b5441b7b45805887f051d39bf133b583baf6860',
        changeDescription: 'Initial concept drawing package supplied by client.',
        uploadedBy: 'Marcus Ndlovu',
        uploadedByRole: 'customer',
        uploaderEmail: 'marcus.n@tshwanelogistics.co.za',
        uploadedAt: '2026-08-15T14:30:00Z',
        reviewStatus: 'approved',
        previewType: 'cad_vector',
        previewStatus: 'ready'
      }
    ],
    isAudrinSupplied: true,
    isLockedByReport: true,
    linkedReportId: 'rep-pre-001',
    auditLogs: [
      {
        id: 'log-cad-1',
        documentId: 'doc-afe-cad-001',
        timestamp: '2026-08-27T09:15:00Z',
        action: 'new_version_uploaded',
        performedBy: 'Bethuel Moukangwe',
        userRole: 'superadmin',
        userEmail: 'bethuelmoukangwe8@gmail.com',
        details: 'Uploaded revision Rev C with updated beam detector offsets.'
      },
      {
        id: 'log-cad-2',
        documentId: 'doc-afe-cad-001',
        timestamp: '2026-08-27T10:00:00Z',
        action: 'approved',
        performedBy: 'Bethuel Moukangwe',
        userRole: 'superadmin',
        userEmail: 'bethuelmoukangwe8@gmail.com',
        details: 'Approved drawing for attachment to Pre-Work Condition Report AFE-REP-PRE-2026-0104-01.'
      }
    ]
  },

  // 2. Cause-and-Effect Matrix (Excel XLSX)
  {
    id: 'doc-afe-ce-002',
    title: 'SANS 10139 Cause-and-Effect Logic Matrix',
    description: 'Comprehensive matrix defining all inputs (detectors, MCPs, sprinkler flow switches) and mapped outputs (HVAC shutdown, sounders, access control door release, BMS telemetry).',
    category: 'cause_and_effect',
    evidenceStage: 'general_supporting',
    serviceRequestId: 'req-demo-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteId: '144 Industrial Road, Pretoria West',
    siteName: 'Tshwane Logistics Distribution Hub',
    organisationId: 'Tshwane Logistics Holdings',
    organisationName: 'Tshwane Logistics Holdings',
    drawingNumber: 'AFE-CE-MAT-001',
    revisionNumber: 'Rev 02',
    documentDate: '2026-08-28',
    preparedBy: 'Thabo Mokoena (Lead Field Technician)',
    uploadedBy: 'Thabo Mokoena',
    uploadedByRole: 'staff',
    uploaderEmail: 'thabo.mokoena@audrinfire.co.za',
    uploadedAt: '2026-08-28T11:20:00Z',
    customerVisible: true,
    includeInReport: true,
    confidentialityLevel: 'restricted_client',
    clientComments: 'Matrix updated to include the Sectional Roller Door magnetic release relays on Loop 1.',
    reviewStatus: 'approved',
    reviewedBy: 'Bethuel Moukangwe',
    reviewedAt: '2026-08-28T12:15:00Z',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath: '/secure_vault/Tshwane_Logistics/AFE-REQ-2026-0104/Cause_and_Effect_Matrix_v2.xlsx',
    retentionPolicy: 'SANS 10139 5-Year Statutory Archive',
    currentVersionNumber: 2,
    currentVersion: {
      id: 'ver-ce-002-02',
      documentId: 'doc-afe-ce-002',
      versionNumber: 2,
      revisionNumber: 'Rev 02',
      originalFileName: 'Cause_and_Effect_Matrix_v2.xlsx',
      secureStorageFileName: 'doc-afe-ce-002_v2_Cause_and_Effect_Matrix_v2.xlsx',
      fileExtension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 425980,
      fileSizeFormatted: '416 KB',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      fileHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      changeDescription: 'Added roller shutter door trip relays and HVAC damper interlocks.',
      uploadedBy: 'Thabo Mokoena',
      uploadedByRole: 'staff',
      uploaderEmail: 'thabo.mokoena@audrinfire.co.za',
      uploadedAt: '2026-08-28T11:20:00Z',
      reviewStatus: 'approved',
      previewType: 'spreadsheet_table',
      previewStatus: 'ready',
      conversionLog: 'LibreOffice Calc Worker: Rendered clean HTML matrix representation.'
    },
    versionHistory: [],
    isAudrinSupplied: true,
    isLockedByReport: true,
    linkedReportId: 'rep-pre-001',
    auditLogs: [
      {
        id: 'log-ce-1',
        documentId: 'doc-afe-ce-002',
        timestamp: '2026-08-28T11:20:00Z',
        action: 'uploaded',
        performedBy: 'Thabo Mokoena',
        userRole: 'staff',
        userEmail: 'thabo.mokoena@audrinfire.co.za',
        details: 'Uploaded Cause-and-Effect Matrix Rev 02 spreadsheet.'
      }
    ]
  },

  // 3. SANS 10139 Commissioning Certificate (PDF)
  {
    id: 'doc-afe-cert-003',
    title: 'SANS 10139 Section 8 Commissioning Certificate',
    description: 'Statutory certificate certifying that the installed fire alarm system adheres to design parameters, sounder audibility thresholds, and loop insulation standards.',
    category: 'commissioning_document',
    evidenceStage: 'commissioning',
    serviceRequestId: 'req-demo-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteId: '144 Industrial Road, Pretoria West',
    siteName: 'Tshwane Logistics Distribution Hub',
    organisationId: 'Tshwane Logistics Holdings',
    organisationName: 'Tshwane Logistics Holdings',
    drawingNumber: 'AFE-CERT-2026-0891',
    revisionNumber: 'Rev Final',
    documentDate: '2026-08-30',
    preparedBy: 'Bethuel Moukangwe (Managing Director)',
    uploadedBy: 'Bethuel Moukangwe',
    uploadedByRole: 'superadmin' as any,
    uploaderEmail: 'bethuelmoukangwe8@gmail.com',
    uploadedAt: '2026-08-30T14:00:00Z',
    customerVisible: true,
    includeInReport: true,
    confidentialityLevel: 'public',
    reviewStatus: 'approved',
    reviewedBy: 'Bethuel Moukangwe',
    reviewedAt: '2026-08-30T14:10:00Z',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath: '/secure_vault/Tshwane_Logistics/AFE-REQ-2026-0104/SANS_10139_Commissioning_Certificate.pdf',
    retentionPolicy: 'SANS 10139 5-Year Statutory Archive',
    currentVersionNumber: 1,
    currentVersion: {
      id: 'ver-cert-003-01',
      documentId: 'doc-afe-cert-003',
      versionNumber: 1,
      revisionNumber: 'Rev Final',
      originalFileName: 'SANS_10139_Commissioning_Certificate.pdf',
      secureStorageFileName: 'doc-afe-cert-003_v1_SANS_10139_Commissioning_Certificate.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 1845000,
      fileSizeFormatted: '1.8 MB',
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      changeDescription: 'Final statutory commissioning sign-off certificate issued by Audrin Fire Engineers.',
      uploadedBy: 'Bethuel Moukangwe',
      uploadedByRole: 'superadmin' as any,
      uploaderEmail: 'bethuelmoukangwe8@gmail.com',
      uploadedAt: '2026-08-30T14:00:00Z',
      reviewStatus: 'approved',
      previewType: 'pdf',
      previewStatus: 'ready'
    },
    versionHistory: [],
    isAudrinSupplied: true,
    isLockedByReport: true,
    linkedReportId: 'rep-post-001',
    auditLogs: [
      {
        id: 'log-cert-1',
        documentId: 'doc-afe-cert-003',
        timestamp: '2026-08-30T14:00:00Z',
        action: 'uploaded',
        performedBy: 'Bethuel Moukangwe',
        userRole: 'superadmin',
        userEmail: 'bethuelmoukangwe8@gmail.com',
        details: 'Uploaded Commissioning Certificate and attached to Post-Work Report.'
      }
    ]
  },

  // 4. Customer-Supplied Site Access & Induction Protocol (Word DOCX)
  {
    id: 'doc-afe-ind-004',
    title: 'Pretoria West Facility Safety & Contractor Site-Access Protocol',
    description: 'Client occupational health and safety rules, emergency assembly points, and permit-to-work requirements for high-bay access equipment.',
    category: 'site_access_document',
    evidenceStage: 'before_work',
    serviceRequestId: 'req-demo-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteId: '144 Industrial Road, Pretoria West',
    siteName: 'Tshwane Logistics Distribution Hub',
    organisationId: 'Tshwane Logistics Holdings',
    organisationName: 'Tshwane Logistics Holdings',
    drawingNumber: 'TLH-SHE-2026-04',
    revisionNumber: 'Rev 01',
    documentDate: '2026-08-16',
    preparedBy: 'Marcus Ndlovu (Facilities Director)',
    uploadedBy: 'Marcus Ndlovu',
    uploadedByRole: 'customer',
    uploaderEmail: 'marcus.n@tshwanelogistics.co.za',
    uploadedAt: '2026-08-16T08:45:00Z',
    customerVisible: true,
    includeInReport: false,
    confidentialityLevel: 'restricted_client',
    reviewStatus: 'approved',
    reviewedBy: 'Bethuel Moukangwe',
    reviewedAt: '2026-08-16T09:30:00Z',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath: '/secure_vault/Tshwane_Logistics/AFE-REQ-2026-0104/Contractor_Site_Access_Protocol.docx',
    retentionPolicy: 'SANS 10139 5-Year Statutory Archive',
    currentVersionNumber: 1,
    currentVersion: {
      id: 'ver-ind-004-01',
      documentId: 'doc-afe-ind-004',
      versionNumber: 1,
      revisionNumber: 'Rev 01',
      originalFileName: 'Contractor_Site_Access_Protocol.docx',
      secureStorageFileName: 'doc-afe-ind-004_v1_Contractor_Site_Access_Protocol.docx',
      fileExtension: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 852000,
      fileSizeFormatted: '832 KB',
      fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      fileHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      changeDescription: 'Client contractor safety protocol and security clearance guidelines.',
      uploadedBy: 'Marcus Ndlovu',
      uploadedByRole: 'customer',
      uploaderEmail: 'marcus.n@tshwanelogistics.co.za',
      uploadedAt: '2026-08-16T08:45:00Z',
      reviewStatus: 'approved',
      previewType: 'office_html',
      previewStatus: 'ready'
    },
    versionHistory: [],
    isAudrinSupplied: false,
    isLockedByReport: false,
    auditLogs: [
      {
        id: 'log-ind-1',
        documentId: 'doc-afe-ind-004',
        timestamp: '2026-08-16T08:45:00Z',
        action: 'uploaded',
        performedBy: 'Marcus Ndlovu',
        userRole: 'customer',
        userEmail: 'marcus.n@tshwanelogistics.co.za',
        details: 'Client submitted site safety protocol.'
      }
    ]
  },

  // 5. Device Schedule (CSV)
  {
    id: 'doc-afe-sched-005',
    title: 'Loop 1 & Loop 2 Addressable Device Point Schedule',
    description: 'Detailed point-by-point schedule specifying device serial numbers, loop address numbers (1-127), zone assignments, and custom alpha-numeric descriptions.',
    category: 'device_schedule',
    evidenceStage: 'commissioning',
    serviceRequestId: 'req-demo-001',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    siteId: '144 Industrial Road, Pretoria West',
    siteName: 'Tshwane Logistics Distribution Hub',
    organisationId: 'Tshwane Logistics Holdings',
    organisationName: 'Tshwane Logistics Holdings',
    drawingNumber: 'AFE-SCHED-01',
    revisionNumber: 'Rev 01',
    documentDate: '2026-08-29',
    preparedBy: 'Thabo Mokoena (Lead Field Technician)',
    uploadedBy: 'Thabo Mokoena',
    uploadedByRole: 'staff',
    uploaderEmail: 'thabo.mokoena@audrinfire.co.za',
    uploadedAt: '2026-08-29T16:30:00Z',
    customerVisible: true,
    includeInReport: true,
    confidentialityLevel: 'confidential_engineering',
    reviewStatus: 'approved',
    processingStatus: 'ready',
    malwareScanStatus: 'clean',
    storagePath: '/secure_vault/Tshwane_Logistics/AFE-REQ-2026-0104/Loop_Device_Schedule.csv',
    retentionPolicy: 'SANS 10139 5-Year Statutory Archive',
    currentVersionNumber: 1,
    currentVersion: {
      id: 'ver-sched-005-01',
      documentId: 'doc-afe-sched-005',
      versionNumber: 1,
      revisionNumber: 'Rev 01',
      originalFileName: 'Loop_Device_Schedule.csv',
      secureStorageFileName: 'doc-afe-sched-005_v1_Loop_Device_Schedule.csv',
      fileExtension: 'csv',
      mimeType: 'text/csv',
      fileSize: 48900,
      fileSizeFormatted: '47.7 KB',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      fileHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      changeDescription: 'Point schedule export for 84 addressable devices across Loops 1 & 2.',
      uploadedBy: 'Thabo Mokoena',
      uploadedByRole: 'staff',
      uploaderEmail: 'thabo.mokoena@audrinfire.co.za',
      uploadedAt: '2026-08-29T16:30:00Z',
      reviewStatus: 'approved',
      previewType: 'spreadsheet_table',
      previewStatus: 'ready'
    },
    versionHistory: [],
    isAudrinSupplied: true,
    isLockedByReport: true,
    linkedReportId: 'rep-post-001',
    auditLogs: [
      {
        id: 'log-sched-1',
        documentId: 'doc-afe-sched-005',
        timestamp: '2026-08-29T16:30:00Z',
        action: 'uploaded',
        performedBy: 'Thabo Mokoena',
        userRole: 'staff',
        userEmail: 'thabo.mokoena@audrinfire.co.za',
        details: 'Uploaded device schedule CSV data.'
      }
    ]
  }
];

// ----------------------------------------------------------------------
// INITIAL QUARANTINED SUSPICIOUS FILES (DJANGO OPERATIONS & AUDITING)
// ----------------------------------------------------------------------
export const INITIAL_QUARANTINED_FILES: QuarantinedFileRecord[] = [
  {
    id: 'quar-001',
    originalFileName: 'patch_system_update.exe',
    fileExtension: 'exe',
    fileSizeFormatted: '4.2 MB',
    detectedThreat: 'Prohibited Executable Payload (.EXE blocked by security policy)',
    quarantineDate: '2026-08-26T14:12:00Z',
    uploaderEmail: 'external.contractor@tshwanelogistics.co.za',
    uploaderName: 'External Subcontractor',
    organisationName: 'Tshwane Logistics Holdings',
    serviceRequestRef: 'AFE-REQ-2026-0104',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    status: 'quarantined',
    sandboxAnalysis: 'Heuristic Celery Worker Sandbox: Execution prevented. Windows Portable Executable (PE32) binary signature intercepted. Ingestion halted and routed to quarantine vault.'
  },
  {
    id: 'quar-002',
    originalFileName: 'panel_backup_script.bat',
    fileExtension: 'bat',
    fileSizeFormatted: '12.4 KB',
    detectedThreat: 'Prohibited Script (.BAT batch file blocked by security policy)',
    quarantineDate: '2026-08-21T09:44:00Z',
    uploaderEmail: 'guest.facility@pretoriaclient.co.za',
    uploaderName: 'Site Maintenance Temp',
    organisationName: 'Pretoria Retail Galleria',
    serviceRequestRef: 'AFE-REQ-2026-0105',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'quarantined',
    sandboxAnalysis: 'Batch command script detected containing shell execution invocations. Automatic quarantine enforced.'
  }
];

// ----------------------------------------------------------------------
// INITIAL PROMETHEUS / GRAFANA DOCUMENT ENGINE METRICS
// ----------------------------------------------------------------------
export const INITIAL_DOCUMENT_METRICS: DocumentSystemMetrics = {
  uploadsStarted: 48,
  uploadsCompleted: 46,
  uploadFailures: 0,
  filesQuarantined: 2,
  malwareDetections: 2,
  avgProcessingDurationSec: 1.4,
  previewGenerationFailures: 0,
  cadConversionFailures: 0,
  totalStorageBytes: 345000000,
  totalStorageFormatted: '329 MB',
  documentsAwaitingReview: 1,
  approvedDocumentsCount: 5,
  revisionsActiveCount: 3
};


