import {
  EmergencyOnCallEngineer,
  EmergencyIncidentType,
  EmergencyEscalationDesk
} from '../types/emergencyDispatch';

export const ON_CALL_ENGINEERS: EmergencyOnCallEngineer[] = [
  {
    id: 'tech-01',
    name: 'Bethuel Moukangwe',
    role: 'Lead Fire Diagnostics Engineer & Managing Director',
    saqccNumber: 'SAQCC #48291',
    saqccLevel: 'Level 4 - Designer / Master',
    ecsaNumber: 'ECSA Pr.Techni #2021-8910',
    dispatchPriority: 'primary',
    dispatchTitle: 'Primary Incident Commander (Lead On-Call)',
    phone: '071 415 6665',
    phoneDisplay: '071 415 6665',
    whatsappNumber: '27714156665',
    email: 'bethuelmoukangwe8@gmail.com',
    baseLocation: 'Pretoria West / Centurion',
    regionalCoverage: [
      'Pretoria West & Industrial Hubs',
      'Pretoria Central & CBD',
      'Centurion & Highveld Technopark',
      'Rosslyn Automotive Corridor',
      'Gauteng Provincial Escalations'
    ],
    responseEta: '30 - 60 min (Pretoria/Centurion) | 90 min (Wider Gauteng)',
    specialties: [
      'SANS 10139 Design Audits & Critical Fault Clearance',
      'Addressable Loop Network Protocol Recovery',
      'Cause & Effect Matrix Trip Rectification',
      'Emergency Commissioning & Handover Sign-Off',
      'Hospital & Healthcare Life-Safety Overrides'
    ],
    panelProficiencies: [
      'Advanced Electronics (MXPro 4 / MXPro 5 / Axis EN)',
      'Ziton (ZP3 / ZP2 Addressable)',
      'Kentec Electronics (Syncro / Taktis)',
      'Hochiki FireNet',
      'Morley-IAS (ZX Series / Dimension)',
      'Siemens Cerberus PRO'
    ],
    isAvailable24_7: true,
    avatarColor: 'bg-red-600',
    activeWorkOrdersCount: 1
  },
  {
    id: 'tech-02',
    name: 'Thabo Mokoena',
    role: 'Senior Fire Alarm Servicing Specialist',
    saqccNumber: 'SAQCC #51902',
    saqccLevel: 'Level 3 - Servicing / Commissioner',
    dispatchPriority: 'backup',
    dispatchTitle: 'Backup Mobile Dispatch Unit (On-Call)',
    phone: '082 441 9023',
    phoneDisplay: '082 441 9023',
    whatsappNumber: '27824419023',
    email: 'thabo.m@audrinfire.co.za',
    baseLocation: 'Pretoria Central / Centurion',
    regionalCoverage: [
      'Centurion & Irene Commercial Nodes',
      'Pretoria Central & Government Precinct',
      'Midrand Corporate Park Corridor',
      'Pretoria North & Onderstepoort'
    ],
    responseEta: '45 - 60 min (Centurion/Midrand) | 75 min (Pretoria)',
    specialties: [
      'Loop Short-Circuit Isolation & Earth Leakage Tracing',
      'Standby Battery Impedance & Float Voltage Failures',
      'Ziton ZP3 Diagnostics & Sensor Recalibration',
      'False Alarm Cascade Suppression',
      'Decibel Sounder Audibility Restoration'
    ],
    panelProficiencies: [
      'Ziton (ZP3 / ZP2 / ZP1)',
      'Hochiki (ESP Protocol Panels)',
      'GST (Global System Technology Addressable)',
      'UniPOS Conventional & Addressable'
    ],
    isAvailable24_7: true,
    avatarColor: 'bg-blue-600',
    activeWorkOrdersCount: 2
  },
  {
    id: 'tech-03',
    name: 'Hendrik Venter',
    role: 'Aspirating & Network Systems Engineer',
    saqccNumber: 'SAQCC #39084',
    saqccLevel: 'Level 3 - Servicing / Commissioner',
    dispatchPriority: 'specialist',
    dispatchTitle: 'Specialist Networks & ASD Engineer',
    phone: '079 812 3456',
    phoneDisplay: '079 812 3456',
    whatsappNumber: '27798123456',
    email: 'hendrik.v@audrinfire.co.za',
    baseLocation: 'Midrand / Johannesburg',
    regionalCoverage: [
      'Midrand & Waterfall City',
      'Sandton Commercial District & Rosebank',
      'Johannesburg CBD & Braamfontein',
      'East Rand (Ekurhuleni Logistics / Airport)'
    ],
    responseEta: '45 - 60 min (Midrand/Sandton) | 90 min (Joburg South)',
    specialties: [
      'VESDA / Aspirating Smoke Detection Flow Faults',
      'Optical Beam Alignment & Obscuration Errors',
      'Multi-Panel Fiber Optic Network Faults',
      'Server Room Clean Agent & Gas Suppression Interfaces',
      'Building Management System (BMS) BACnet Gateway Trips'
    ],
    panelProficiencies: [
      'VESDA (VLI, VEU, VEP, LaserPLUS)',
      'Advanced MXPro 5 Multi-Panel Network',
      'Kentec Taktis High-Integrity Network',
      'Notifier by Honeywell (Onyx Series)',
      'Fire-Pro Gas Suppression Panels'
    ],
    isAvailable24_7: true,
    avatarColor: 'bg-emerald-600',
    activeWorkOrdersCount: 1
  },
  {
    id: 'tech-04',
    name: 'Ayanda Khumalo',
    role: 'Field Commissioning & Rapid Diagnostics Technician',
    saqccNumber: 'SAQCC #60412',
    saqccLevel: 'Level 2 - Installer',
    dispatchPriority: 'standby',
    dispatchTitle: 'Rapid First-Fix & Loop Diagnostics',
    phone: '073 665 1198',
    phoneDisplay: '073 665 1198',
    whatsappNumber: '27736651198',
    email: 'ayanda.k@audrinfire.co.za',
    baseLocation: 'Pretoria East / Silverton',
    regionalCoverage: [
      'Pretoria East & Menlyn Maine',
      'Silverton Industrial & Ford Hub',
      'Mamelodi & Bronkhorstspruit N4 Corridor',
      'Lynnwood & Hatfield Commercial Centers'
    ],
    responseEta: '30 - 45 min (Pretoria East) | 60 min (Central)',
    specialties: [
      'Manual Call Point (Break Glass) Tamper Resets',
      'Sounder Strobe Beacon Relay Trips',
      'Faulty Base Isolator Swaps & Terminal Re-torque',
      'Aerosol Smoke Challenge Point Verification',
      'Weekly SANS 10139 Physical Logbook Audits'
    ],
    panelProficiencies: [
      'Advanced MXPro 4/5',
      'Kentec Sigma CP Conventional',
      'Ziton ZP1 / ZP2',
      'Technoswitch Auto-Fire Extinguishing Panels'
    ],
    isAvailable24_7: true,
    avatarColor: 'bg-purple-600',
    activeWorkOrdersCount: 2
  }
];

export const EMERGENCY_INCIDENT_TYPES: EmergencyIncidentType[] = [
  {
    id: 'inc-01',
    code: 'ALM-UNCONTROLLED',
    title: 'Uncontrollable Sirens / False Evacuation Active',
    defaultSeverity: 'priority_1_critical',
    description: 'Evacuation sounders/strobes are continuously sounding and panel cannot be silenced or reset; premises at risk of panic, false municipal brigade callout, or business disruption.',
    recommendedImmediateAction: 'Check LCD display for Zone & Address. If confirmed false alarm, insert Access Level 2 key/code and press "Silence Alarm" then "Mute Buzzer". Do NOT power cycle without recording address.',
    sansClauseRef: 'SANS 10139:2012 Clause 13.2 & Clause 25.1'
  },
  {
    id: 'inc-02',
    code: 'CIE-CPU-FAULT',
    title: 'Control Panel System Fault / CPU Lockup',
    defaultSeverity: 'priority_1_critical',
    description: 'The main Control & Indicating Equipment (CIE) indicates "System Fault", display is frozen, or processor heartbeat has stopped, leaving premises with diminished or zero fire coverage.',
    recommendedImmediateAction: 'Designate physical fire watch warden immediately. Keep panel door closed; verify 230V mains breaker is energized and observe if secondary DC supply remains active.',
    sansClauseRef: 'SANS 10139:2012 Clause 13.1 (System Impairment)'
  },
  {
    id: 'inc-03',
    code: 'LOOP-OPEN-ISOLATED',
    title: 'Loop Open-Circuit / Entire Zone Dropped',
    defaultSeverity: 'priority_2_urgent',
    description: 'An entire addressable loop or major zone branch has isolated or returned "Loop Open/Short Circuit", causing multiple detectors to lose telemetric contact.',
    recommendedImmediateAction: 'Note all disconnected addresses on the LCD. Avoid disconnecting loop cards inside panel. Engineer will deploy reflectometer and isolator tracer upon arrival.',
    sansClauseRef: 'SANS 10139:2012 Clause 12 & Clause 25.3'
  },
  {
    id: 'inc-04',
    code: 'EARTH-FAULT-ACTIVE',
    title: 'Earth Leakage / Positive or Negative Ground Fault',
    defaultSeverity: 'priority_2_urgent',
    description: 'Yellow Earth Fault indicator illuminated on CIE panel; potential water ingress in containment, damaged cable sheath, or compromised conduit connection.',
    recommendedImmediateAction: 'Check ceiling voids near known roof leaks or recent building maintenance. Ensure plant room sump pumps or wet risers have not breached cabling containment.',
    sansClauseRef: 'SANS 10139:2012 Clause 15.3 (Wiring & Earthing)'
  },
  {
    id: 'inc-05',
    code: 'PWR-BATTERY-FAIL',
    title: 'Mains Supply Lost / Standby Battery Warning',
    defaultSeverity: 'priority_2_urgent',
    description: '230V AC mains failure or internal sealed lead-acid (VRLA) battery charger failure; CIE running on remaining battery autonomy (typically 24h to 72h max).',
    recommendedImmediateAction: 'Verify electrical distribution board fused spur switch is ON. If mains is on, battery float voltage has dropped below statutory 21.0V DC threshold.',
    sansClauseRef: 'SANS 10139:2012 Clause 18 (Power Supplies & Standby)'
  },
  {
    id: 'inc-06',
    code: 'HVAC-DOOR-RELEASE',
    title: 'Fire Doors Released / HVAC Tripped Unintentionally',
    defaultSeverity: 'priority_1_critical',
    description: 'Magnetic door holders have dropped fire doors and HVAC ventilation/smoke dampers have closed due to false relay trigger or cause-and-effect matrix loop trip.',
    recommendedImmediateAction: 'Inspect relay module output addresses. Avoid forcing magnetic doors open against mechanical closers to avoid latch damage.',
    sansClauseRef: 'SANS 10139:2012 Clause 14 (Auxiliary Control Interfaces)'
  },
  {
    id: 'inc-07',
    code: 'SENSOR-DRIFT-STORM',
    title: 'Contaminated Chamber Drift / Rapid False Alarms',
    defaultSeverity: 'priority_3_warning',
    description: 'Optical smoke detector chamber contaminated with warehouse dust, steam, or construction debris, triggering intermittent false alarms in a specific room.',
    recommendedImmediateAction: 'Isolate or disable the specific device address via Access Level 2 menu to silence repeated alarms while keeping remainder of building fully protected.',
    sansClauseRef: 'SANS 10139:2012 Clause 17 & Form 2 (False Alarm Log)'
  }
];

export const EMERGENCY_ESCALATION_DESK: EmergencyEscalationDesk = {
  deskTitle: 'Audrin Fire Engineers 24/7 Command Desk & Dispatch',
  hotlinePhone: '071 415 6665',
  hotlineDisplay: '071 415 6665',
  emergencyEmail: 'bethuelmoukangwe8@gmail.com',
  physicalCommandBase: '27 Tshivhase Street, Pretoria West, Pretoria, 0008',
  operatingHours: '24 Hours / 7 Days a Week / 365 Days a Year',
  slaMaxResponseHours: 2, // SANS 10139 Category 1 emergency response
  municipalFireNumbers: [
    {
      region: 'City of Tshwane (Pretoria Central / West / Centurion)',
      department: 'Tshwane Emergency Services Department (Fire & Rescue)',
      phone: '012 310 6300',
      altPhone: '107 (from landline) or 012 358 6300'
    },
    {
      region: 'City of Johannesburg (Sandton / Midrand / CBD)',
      department: 'Johannesburg Emergency Management Services (EMS)',
      phone: '011 375 5911',
      altPhone: '112 (from any mobile network)'
    },
    {
      region: 'Ekurhuleni Metropolitan (East Rand / Kempton / Airport)',
      department: 'Ekurhuleni Disaster & Emergency Management Services (DEMS)',
      phone: '011 458 0911',
      altPhone: '112'
    },
    {
      region: 'National Emergency Response Helpline',
      department: 'South African Police Services & Emergency Lifeline',
      phone: '10111',
      altPhone: '112'
    }
  ]
};

export const SANS10139_EMERGENCY_DISPATCH_GUIDELINES = [
  {
    step: 1,
    title: 'Verify Actual Threat vs. False Alarm',
    detail: 'Before resetting or silencing, immediately check the CIE panel LCD display to identify the exact Zone number and Device Address. Verify physical conditions at that address.'
  },
  {
    step: 2,
    title: 'Access Level 2 Controls (Authorized Key/Code)',
    detail: 'Only authorized Responsible Persons should enter Access Level 2. Press "Silence Alarms" to stop evacuation sounders once building safety is assured, then "Mute Internal Buzzer".'
  },
  {
    step: 3,
    title: 'Contact Primary On-Call Engineer Immediately',
    detail: 'Call or WhatsApp the Primary On-Call Engineer (Bethuel Moukangwe at 071 415 6665). State your site name, panel make, and the exact fault code or address displayed.'
  },
  {
    step: 4,
    title: 'Maintain Statutory Fire Watch If Panel Impaired',
    detail: 'Under SANS 10139 Clause 13.1, if a panel or loop is out of service for over 4 hours, a designated competent fire watch patrol must monitor the affected zones every 30 minutes.'
  },
  {
    step: 5,
    title: 'Record in SANS 10139 Physical Logbook',
    detail: 'Document the incident date, time, cause, device address, and on-call engineer dispatch time in the on-site statutory logbook before engineer arrival.'
  }
];

export function buildWhatsAppDispatchMessage(payload: {
  siteName: string;
  incidentTitle: string;
  severity: string;
  panelModel: string;
  zoneAddress: string;
  symptoms: string;
  callerName: string;
  callerPhone: string;
}): string {
  const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
  const text = `🚨 *AUDRIN FIRE ENGINEERS - SANS 10139 EMERGENCY DISPATCH*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *Time:* ${timestamp}
🏢 *Facility / Site:* ${payload.siteName}
👤 *Contact Officer:* ${payload.callerName} (${payload.callerPhone})
⚠️ *Incident Class:* ${payload.incidentTitle}
⚡ *Severity:* ${payload.severity.toUpperCase().replace('_', ' ')}
🎛️ *CIE Panel:* ${payload.panelModel || 'Standard CIE'}
📍 *Affected Zone / Loop:* ${payload.zoneAddress || 'General Panel Alarm'}

📝 *Fault Symptoms / Message:*
${payload.symptoms || 'System in urgent fault. Requesting immediate on-call engineering dispatch.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
*Sent via Customer Portal Emergency Dispatch Protocol (SANS 10139:2012)*`;

  return encodeURIComponent(text);
}
