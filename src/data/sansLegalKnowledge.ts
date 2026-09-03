import { 
  ShieldCheck, 
  Building2, 
  Server, 
  Flame, 
  Activity, 
  Radio, 
  Bell, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Cpu,
  Layers,
  Zap,
  Volume2
} from 'lucide-react';

export interface SANSStandardInfo {
  id: string;
  code: string;
  title: string;
  officialScope: string;
  saLegalStatus: string;
  governingBody: string;
  keyClauses: {
    clause: string;
    title: string;
    summary: string;
    statutoryRequirement: string;
  }[];
}

export const SANS_STANDARDS_KNOWLEDGE: Record<string, SANSStandardInfo> = {
  sans10139: {
    id: 'sans10139',
    code: 'SANS 10139:2012 / SAQCC Commissioner',
    title: 'Code of Practice for Fire Detection and Alarm Systems in Buildings',
    officialScope: 'Planning, design, installation, commissioning, and maintenance of fire detection and fire alarm systems in and around buildings other than dwellings.',
    saLegalStatus: 'Mandatory South African National Standard referenced under NBR Part T (SANS 10400-T:2011 Clause 4.31). Enforced by SAQCC Fire & Department of Labour.',
    governingBody: 'SABS SC 21E / SAQCC-Fire D&GS Sub-Committee',
    keyClauses: [
      {
        clause: 'Clause 1a-1e / Objectives & System Categories',
        title: 'Life Safety (Category L) & Property Protection (Category P) System Classes',
        summary: 'Defines Category L (Life: L1 total, L2 defined+escape, L3 escape+adjacent, L4 escape routes only, L5 localized) and Category P (Property: P1 earliest warning all areas, P2 defined high risk) and Category M (Manual call points only for assembly areas).',
        statutoryRequirement: 'System category selection must be determined by a certified Fire Safety Specialist / Engineer based on building fire risk.'
      },
      {
        clause: 'Clause 1f / Permitted Detector Omissions',
        title: 'Standard Detector Exceptions in Category L1 & P1',
        summary: 'Detectors may be omitted from: staff toilets, bathrooms and shower rooms, toilet and stairway lobbies, small cupboards (< 1 m²), and shallow voids (< 800 mm depth provided fire risk does not warrant it).',
        statutoryRequirement: 'Omission of detectors from any other area must be supported by an official Fire Risk Assessment.'
      },
      {
        clause: 'Clause 1g & 1h / Fault Indication Time Limits',
        title: 'Control Panel Fault Reporting Thresholds',
        summary: 'Control and indicating equipment must register a fault indication within 200 seconds of a short or open circuit on any detector or manual call point loop. Mains electrical disconnection fault indication must register within 30 minutes.',
        statutoryRequirement: 'Fault circuits must be monitored continuously for open and short circuits.'
      },
      {
        clause: 'Clause 1i & 1j / Zonal Integrity & Sounder Circuit Segregation',
        title: '1,000 m² Fault Isolation & Sounder Sheath Separation',
        summary: 'A single short or open circuit fault shall not disable protection of more than 1,000 m². Where two or more sounder circuits are installed, they shall not be contained within a common cable sheath.',
        statutoryRequirement: 'Short-circuit isolators required on addressable Class A loops to preserve zoning.'
      },
      {
        clause: 'Clause 1k-1p / Cable & Wiring Standards',
        title: 'PH30 Fire-Resistant Cabling & Class A Circuits',
        summary: 'Cables must have PH 30 enhanced fire resistance, minimum 1.0 mm² conductor cross-section, preferably red in colour. Run in separate conduit from other electrical services. Addressable loops must be Class A physical conductor circuits.',
        statutoryRequirement: 'Cables may be clipped direct to surface or enclosed in steel conduit.'
      },
      {
        clause: 'Clause 1r & 1s / Audibility & Dual Sounder Redundancy',
        title: '65 dB(A) General / 75 dB(A) Bedhead & Dual Sounder Rule',
        summary: 'Sound pressure level must achieve not less than 65 dB(A) throughout occupied areas, not less than 75 dB(A) at bedhead in sleeping quarters, and not exceed 130 dB(A) at any normally accessible point. Systems must incorporate at least two sounders even if one satisfies decibel requirements.',
        statutoryRequirement: 'At least two independent fire alarm sounders per building.'
      },
      {
        clause: 'Clause 8-12 / Detector Spacing Under Ceilings & Apex Roofs',
        title: '7.5m Smoke & 5.3m Heat Spacing with Apex Pitch Adjustments',
        summary: 'Flat horizontal ceilings: 7.5m horizontal radius to smoke detectors, 5.3m horizontal radius to heat detectors. In apex roofs, detectors must be sited within 600mm of apex; horizontal distance may increase by 1% per degree of slope up to max 25%. Roofs with pitch < 600mm (smoke) or < 150mm (heat) treated as flat.',
        statutoryRequirement: 'No point on ceiling further than 7.5m from smoke detector or 5.3m from heat detector.'
      },
      {
        clause: 'Clause 15 / Secondary Standby Battery Sizing',
        title: '24-Hour Quiescent Standby + 30-Minute Full Evacuation Capacity',
        summary: 'Secondary battery supply must operate the complete system under non-alarm quiescent condition for at least 24 hours, followed by at least 30 minutes of continuous full-load evacuation alarm in all alarm zones.',
        statutoryRequirement: 'Battery capacity calculation (Ah) = (I_quiescent × 24h) + (I_alarm × 0.5h) × 1.25 safety factor.'
      },
      {
        clause: 'Clause 20 & 21 / Manual Call Point Siting & Heights',
        title: '1.4m (±0.2m) Mounting Height & Clearance Limits',
        summary: 'Manual call points (MCPs) must be mounted at 1.4 m from floor level (±0.2 m tolerance, min 1.2 m, max 1.4 m). Minimum clearance of 5 mm from adjacent walls, 25 mm to 600 mm below ceilings. Green dot designation on drawings.',
        statutoryRequirement: 'Sited on escape routes, exits to open air, and staircase landings.'
      }
    ]
  },

  sans322: {
    id: 'sans322',
    code: 'SANS 322:2005 / Hospital Standard',
    title: 'Fire Detection and Alarm Systems for Hospitals and Healthcare Premises',
    officialScope: 'Design, installation, commissioning, and maintenance of fire detection and alarm systems in new and existing hospitals and healthcare facilities. Read in conjunction with SANS 10139.',
    saLegalStatus: 'Mandatory statutory standard for all South African private and public hospitals, specialized clinics, and mental health facilities.',
    governingBody: 'SABS SC 21E / Department of Health / SAQCC-Fire',
    keyClauses: [
      {
        clause: 'Facilitation 2 / Table 1 Panel Sizing',
        title: 'Hospital Fire Panel Technology Selection Matrix',
        summary: 'Up to and including 50 devices: Conventional system permitted. Over 50 up to but not including 100 devices: Addressable system mandatory. Over 100 devices: Analogue or multi-state addressable system mandatory.',
        statutoryRequirement: 'Uniform technology and manufacturer brand must be maintained throughout the entire hospital complex.'
      },
      {
        clause: 'Facilitation 1 & 2 / Hospital Coverage Scope',
        title: 'Type M & Type L1 Mandatory Hospital Protection',
        summary: 'Type M (Manual) and Type L1 (Comprehensive Automatic) systems must be installed throughout all parts of the hospital, including all patient access areas, hazard rooms, below-patient departments, escape routes, and M&E plant rooms.',
        statutoryRequirement: 'Toilets intended for public use MUST have smoke detection (unlike standard commercial SANS 10139).'
      },
      {
        clause: 'Facilitation 1 & 4 / Permitted Hospital Omissions',
        title: 'Specific Healthcare Detector Exclusions',
        summary: 'Smoke detectors and MCPs may be omitted only in: 1) bath/shower rooms; 2) toilets in staff areas; 3) cupboards less than 1 m²; 4) voids containing only mineral insulated wiring or non-combustible pipework; 5) Operating theatres (subject to documented risk assessment).',
        statutoryRequirement: 'Public toilets and all patient care zones cannot be omitted.'
      },
      {
        clause: 'Facilitation 7 & 8 / Patient Area Alarm Audibility',
        title: '45–55 dB(A) Patient Warning & Visual Flashing Beacons',
        summary: 'In patient areas where assistance is needed to evacuate, alarm volume is restricted to 45–55 dB(A) or 5 dB(A) above notional noise level to prevent patient distress. Operating theatres, ITU, and SCBU utilize visual alarm beacons (flash rate ≤ 130 flashes/min) with low sounders (50 dB(A) at 1 m). Mental health facilities may utilize pre-recorded discreet musical chimes.',
        statutoryRequirement: 'A large number of quieter sounders must be used rather than few loud sounders.'
      },
      {
        clause: 'Facilitation 8 & 9 / Two-Stage Phased Evacuation Protocol',
        title: 'Two-Stage Alarm: Continuous (Fire Zone) & Intermittent (Adjacent Zones)',
        summary: 'Continuous sounding indicates a fire event in the local zone/compartment. Intermittent sounding indicates a fire event in adjacent compartments to initiate progressive horizontal evacuation. Code Red announces suspected fire; Code Green directs evacuation.',
        statutoryRequirement: '60-minute compartment walls & 30-minute sub-compartment walls required for progressive horizontal movement.'
      },
      {
        clause: 'Facilitation 9-11 / Healthcare Building Interlocks',
        title: 'Fail-Safe Fire Doors, Lift Recall & HVAC Open-Air Exhaust',
        summary: 'Automatic fire doors must release fail-safe on power loss or alarm in compartment. Lifts returning automatically to ground/final exit level and disabled. Recirculating air handling units (AHUs) in evacuation zone must immediately divert extract to discharge to open air.',
        statutoryRequirement: 'Fire brigade communication via monitored GSM or direct line (PSTN diallers prohibited).'
      }
    ]
  },

  sans246: {
    id: 'sans246',
    code: 'SANS 246 / BS 6266:2011',
    title: 'Code of Practice for Fire Protection for Electronic Equipment Installations',
    officialScope: 'Fire protection, early detection (ASD), risk assessment, structural separation, and suppression systems for computer rooms, server rooms, data centres, and telecommunication facilities.',
    saLegalStatus: 'National standard governing mission-critical electronic equipment installations in South Africa.',
    governingBody: 'SABS SC 21E / SAQCC-Fire',
    keyClauses: [
      {
        clause: 'Facilitation 1 / Clause 4.2 Risk Categories',
        title: 'Risk Categorization: Medium, High & Critical',
        summary: 'Medium Risk: Standard equipment, operations transferable, periodic backups. High Risk: Non-standard hardware, main IT/telecom, frequent backups. Critical Risk: Financial dealing, air traffic control, nuclear/chemical control, continuous backups, non-tolerable downtime.',
        statutoryRequirement: 'Higher risk categories mandate Class A Aspirating Smoke Detection (ASD) and coincidence gas suppression.'
      },
      {
        clause: 'Facilitation 2 / Clause 2.1 Fire Enclosure Ratings',
        title: '30, 60, 120 & 240 Min Fire Enclosure Construction',
        summary: 'Medium risk: ≥ 30 min fire resistance. High & Critical risk: 60 min (low fire load adjacent), 120 min (medium fire load), 240 min (high fire load warehouse). Halved if adjacent area has automatic sprinklers (min 30 min). Ancillary IT offices: 30 min; Data media storage: 60 min.',
        statutoryRequirement: 'Walls must extend structural floor to underside of structural soffit above.'
      },
      {
        clause: 'Facilitation 3 / Clause 3.3.2 ASD Sensitivity Classes',
        title: 'Class A (<0.8%), Class B (<2.0%) & Class C (<5.0%) Sensitivity',
        summary: 'Class A (Very high sensitivity, better than 0.8% obs/m): Mandatory for air return vents & high airflows. Class B (Enhanced, better than 2.0% obs/m): Cabinet interiors & valuable processes. Class C (Normal, better than 5.0% obs/m): General room area ceiling alternative to point detectors.',
        statutoryRequirement: 'Point-type CO gas detectors prohibited for electronic equipment early warning.'
      },
      {
        clause: 'Facilitation 3 / Clause 3.4.2 Air Return Vent Sampling',
        title: '0.4 m² Max Coverage Per Sampling Hole & Min 3 Holes',
        summary: 'Each sampling point on an air return vent to CRAC/AHU units must cover a maximum of 0.4 m² of vent area. A minimum of 3 Class A sampling holes must be provided per return grille.',
        statutoryRequirement: 'Performance hot wire test or overheating resistor test required for commissioning.'
      },
      {
        clause: 'Facilitation 3 / Clause 3.5 Spacing Adjustment Formula',
        title: '25 m² Baseline Detector Spacing Adjustment Formula',
        summary: 'Base spacing is 25 m² per detector/sampling hole. Modifiers: Airflow > 1 m/s (-5 m²), Airflow > 4 m/s (-10 m²), AHU shut off by early warning (+10 m²), Asymmetric layout (+5 m²), Class B ASD (+5 m²), Integrating detector (+5 m²), Ventilated void (-5 m²).',
        statutoryRequirement: 'Coverage ranges mathematically from 5 m² to 55 m² per point based on environmental airflow parameters.'
      },
      {
        clause: 'Facilitation 4 / Clause 4.1.1 Portable Extinguishers',
        title: 'Dedicated 2kg CO2 Extinguisher Sizing Matrix & DCP Prohibition',
        summary: '1–50 m²: 2 × 2kg CO2; 51–100 m²: 2 × 2kg CO2; 101–150 m²: 3 × 2kg CO2; >150 m²: 3 + (1 per 100 m² over 150 m²) × 2kg CO2. Extinguishers within 15 m radius. Dry Chemical Powder (DCP) strictly PROHIBITED on sensitive electronic equipment.',
        statutoryRequirement: 'Water-based extinguishers for paper waste outside room must pass 35kV electrical conductivity test.'
      },
      {
        clause: 'Facilitation 4 / Clause 4.2 Gaseous Suppression & Safety',
        title: 'Clean Agent Halocarbon / Inert Gas & CO2 Safety Restrictions',
        summary: 'Total flooding clean agent (halocarbon/inert gas) used for occupied server rooms. CO2 is lethal at extinguishing concentrations and prohibited in occupied rooms (max 2% allowable in-cabinet leakage). Coincidence detection (double-knock) required to prevent accidental release.',
        statutoryRequirement: 'Pressure relief venting and post-discharge extraction required.'
      }
    ]
  },

  sans10400t: {
    id: 'sans10400t',
    code: 'SANS 10400-T:2011 Edition 3',
    title: 'The Application of the National Building Regulations Part T: Fire Protection',
    officialScope: 'Deemed-to-satisfy requirements for compliance with Functional Regulation T1 & T2 of the National Building Regulations and Building Standards Act, 1977 (Act No. 103 of 1977).',
    saLegalStatus: 'Supreme primary statutory regulation governing all building construction, fire stability, escape routes, and fire safety systems in South Africa.',
    governingBody: 'SABS Standards Division / Republic of South Africa Government Gazette',
    keyClauses: [
      {
        clause: 'Regulation T1 & T2',
        title: 'General Safety Requirement & Statutory Offences',
        summary: 'Buildings must ensure occupant life safety, safe evacuation, fire spread minimization, structural stability, smoke control, and adequate detection/extinguishing equipment. Failure to comply or obstructing escape routes is a criminal offence under Act 103 of 1977.',
        statutoryRequirement: 'Deemed-to-satisfy compliance with SANS 10400-T or Rational Design by Registered Competent Person (Fire Engineering).'
      },
      {
        clause: 'Clause 4.2 / Table 2 & Formulas',
        title: 'Boundary Safety Distances & Radiant Heat Calculations',
        summary: 'Specifies safety distances from site boundaries based on fire load (<25 kg/m² low, 25-50 kg/m² moderate, >50 kg/m² high) and elevation opening areas. Low: D = 2.75 × Log A - (1/A)^0.5; Moderate: D = 3.25 × Log(A - 3) - (1/A)^0.5; High: D = 2.25 × Log(A² - 5) - (5/A)^0.5. Halved if sprinklered.',
        statutoryRequirement: 'Prevents radiant heat ignition across property boundaries and between buildings.'
      },
      {
        clause: 'Clause 4.4 / Table 3 & Table 6',
        title: 'Maximum Division Areas & Structural Stability Ratings',
        summary: 'Division areas: E1/E2/E3 hospital = 1,250 m²; E4 = 250 m² (1,250 m² sprinklered); A2/B2/B3/C1/C2/G1 = 5,000 m² (10,000 m² multi-storey sprinklered). Structural stability: 30 min to 240 min based on occupancy and building height storeys.',
        statutoryRequirement: 'Unprotected steel strictly prohibited in basement storeys.'
      },
      {
        clause: 'Clause 4.10 / Table 7 & SANS 1253',
        title: 'Fire Doors and Fire Shutters Classification',
        summary: 'Class A (60 min), Class B (120 min), Class C (120 min plant rooms), Class D (120 min division walls), Class E (30 min protected corridor/stairs), Class F (30 min openings in walls). Fitted with self-closing or automatic closing devices.',
        statutoryRequirement: 'Fire doors must open in direction of escape along escape routes.'
      },
      {
        clause: 'Clause 4.16 - 4.21 / Table 10',
        title: 'Escape Route Dimensions, Travel Distances & Widths',
        summary: 'Travel distance to escape door ≤ 45 m (increased to 60 m if sprinklered). Feeder travel inside room ≤ 15 m. Dead-end corridors max 10 m. Widths: ≤ 100 persons = 1,000 mm (1,500 mm Part S disability); 190 persons max per single route = 1,800 mm. Clear vertical headroom ≥ 2.0 m.',
        statutoryRequirement: 'No decrease in escape route width permitted in direction of travel.'
      },
      {
        clause: 'Clause 4.31 / Mandatory Alarm Occupancies',
        title: 'Mandatory Fire Detection & Alarm Installations',
        summary: 'Mandatory for: F1 shops > 500 m²; H1 hotels, H2 dormitories, E2 hospitals, E3 institutions irrespective of height or area; All buildings exceeding 30 m height or any single storey > 5,000 m² (Category M & Category L to SANS 10139).',
        statutoryRequirement: 'Manually activated visual/audible systems mandatory for A1, A2, C1, C2, F1.'
      },
      {
        clause: 'Clause 4.34 & 4.35 / Water Systems',
        title: 'Fire Hose Reels (1 / 500 m²) & Fire Hydrants (1 / 1,000 m²)',
        summary: 'Hose reels: 1 per 500 m² on any storey in 2+ storey buildings or single storey > 250 m² (SANS 543, SANS 10105-1, SANS 1475-2). Hydrants: 1 per 1,000 m² for buildings > 12 m height or > 1,000 m² (24m/30m hose, 16mm nozzle, SANS 1128-1/2).',
        statutoryRequirement: 'Where no water supply available, two 9kg powder extinguishers provided per required hose reel.'
      },
      {
        clause: 'Clause 4.36 / Automatic Sprinklers',
        title: 'Mandatory Automatic Sprinklers to SANS 10287',
        summary: 'Required in all buildings > 30 m height (except G1/H3 divisions ≤ 500 m²), basements > 500 m², and concealed voids > 800 mm height with area > 100 m² above ceiling or > 500 m² below raised floor.',
        statutoryRequirement: 'Designed, installed, and maintained by competent persons to SANS 10287.'
      },
      {
        clause: 'Clause 4.37 / Table 11',
        title: 'Portable Fire Extinguishers Density & Minimum Charges',
        summary: 'Specifies extinguisher provision per m²: A1-A3: 1/200 m²; B1, D1, D2, J1, J2: 1/100 m²; A4, A5, B3, D4, H3, J3, J4: 1/400 m²; E1-E4, F1-F3, G1, H1, H2: 1/200 m²; H5: 1/100 m². Minimum charges: Water 9L, Foam 9L, CO2 5kg (10kg industrial), DCP 4.5kg (9kg industrial). SANS 1910 / SANS 1475-1 / SANS 10105-1.',
        statutoryRequirement: 'Must bear certification mark from accredited certification body.'
      },
      {
        clause: 'Annex B & Regulation A19',
        title: 'Rational Fire Safety Engineering Designs (BS 7974 Framework)',
        summary: 'Prescribes 3-stage Rational Design framework: 1) Qualitative Design Review (QDR); 2) Quantitative Design Review (Subsystems SS1–SS6); 3) Assessment against acceptance criteria. Requires appointment of ECSA Registered Professional Engineer / Technologist under Regulation A19.',
        statutoryRequirement: 'Mandatory for complex structures, atriums, malls, high-rises (>10 storeys), or deemed-to-satisfy deviations.'
      }
    ]
  }
};

// SANS 246 Detector Coverage Calculator Helper
export interface SANS246CalcParams {
  roomAreaM2: number;
  airflowSpeed: 'normal' | 'moderate' | 'high'; // < 1m/s, 1-4 m/s, > 4m/s
  ahuShutOffByASD: boolean;
  asymmetricSpacing: boolean;
  asdSensitivityClass: 'Class A' | 'Class B' | 'Class C';
  isIntegratingDetector: boolean;
  isInVentilatedVoid: boolean;
  ceilingType: 'smooth' | 'shallow_beams' | 'very_shallow_beams';
}

export interface SANS246CalcResult {
  baseCoverageM2: number;
  adjustedCoveragePerDetectorM2: number;
  requiredDetectorsOrSamplingPoints: number;
  requiredCo2Extinguishers: {
    quantity: number;
    sizeKg: number;
    formulaExplanation: string;
  };
  recommendedAsdClass: 'Class A' | 'Class B' | 'Class C';
  ventSamplingMinHoles: number;
  modificationsLog: { label: string; adjustmentM2: number }[];
}

export function calculateSANS246Coverage(params: SANS246CalcParams): SANS246CalcResult {
  const baseCoverageM2 = 25;
  const modificationsLog: { label: string; adjustmentM2: number }[] = [];
  let adjusted = baseCoverageM2;

  // Airflow adjustments
  if (params.airflowSpeed === 'moderate') {
    adjusted -= 5;
    modificationsLog.push({ label: 'Airflow > 1 m/s (and ≤ 4 m/s) in > 25% space [Clause a1]', adjustmentM2: -5 });
  } else if (params.airflowSpeed === 'high') {
    adjusted -= 10;
    modificationsLog.push({ label: 'Airflows > 4 m/s present in > 25% space [Clause A2]', adjustmentM2: -10 });
  }

  // AHU shutdown
  if (params.ahuShutOffByASD) {
    adjusted += 10;
    modificationsLog.push({ label: 'Air conditioning shut off by early warning detection in return vents [Clause b]', adjustmentM2: +10 });
  }

  // Asymmetric spacing
  if (params.asymmetricSpacing) {
    adjusted += 5;
    modificationsLog.push({ label: 'Asymmetric spacing arranged across prevailing airflow [Clause c]', adjustmentM2: +5 });
  }

  // Enhanced sensitivity
  if (params.asdSensitivityClass === 'Class B') {
    adjusted += 5;
    modificationsLog.push({ label: 'Enhanced sensitivity Class B ASD deployment [Clause d]', adjustmentM2: +5 });
  }

  // Integrating detector
  if (params.isIntegratingDetector) {
    adjusted += 5;
    modificationsLog.push({ label: 'Integrating detector type (Aspiration or Optical Beam) [Clause e]', adjustmentM2: +5 });
  }

  // Ventilated void
  if (params.isInVentilatedVoid) {
    adjusted -= 5;
    modificationsLog.push({ label: 'Detection system located in ventilated void / plenum [Clause g1]', adjustmentM2: -5 });
  }

  // Safety boundaries (SANS 246 Page 24: range typically 5 m² to 55 m²)
  adjusted = Math.max(5, Math.min(55, adjusted));

  const requiredDetectors = Math.ceil(params.roomAreaM2 / adjusted);

  // Portable CO2 Extinguishers per SANS 246 Clause 4.1.1 (Page 31)
  let co2Qty = 2;
  let co2Explanation = '2 × 2kg CO2 extinguishers (1–50 m²)';
  if (params.roomAreaM2 <= 50) {
    co2Qty = 2;
    co2Explanation = '2 × 2kg CO2 extinguishers (1–50 m² rule)';
  } else if (params.roomAreaM2 <= 100) {
    co2Qty = 2;
    co2Explanation = '2 × 2kg CO2 extinguishers (51–100 m² rule)';
  } else if (params.roomAreaM2 <= 150) {
    co2Qty = 3;
    co2Explanation = '3 × 2kg CO2 extinguishers (101–150 m² rule)';
  } else {
    const extraHundred = Math.ceil((params.roomAreaM2 - 150) / 100);
    co2Qty = 3 + extraHundred;
    co2Explanation = `3 + ${extraHundred} (1 per 100m² over 150m²) = ${co2Qty} × 2kg CO2 extinguishers`;
  }

  return {
    baseCoverageM2,
    adjustedCoveragePerDetectorM2: adjusted,
    requiredDetectorsOrSamplingPoints: requiredDetectors,
    requiredCo2Extinguishers: {
      quantity: co2Qty,
      sizeKg: 2,
      formulaExplanation: co2Explanation
    },
    recommendedAsdClass: params.airflowSpeed === 'high' ? 'Class A' : (params.roomAreaM2 > 100 ? 'Class A' : 'Class B'),
    ventSamplingMinHoles: 3,
    modificationsLog
  };
}

// SANS 322 Hospital System Selector Helper
export interface SANS322SpecParams {
  totalDevicesCount: number;
  hasPatientSleepingAreas: boolean;
  hasOperatingTheatresOrICU: boolean;
  hasMentalHealthWards: boolean;
  publicToiletsCount: number;
}

export interface SANS322SpecResult {
  panelSystemType: 'Conventional' | 'Addressable' | 'Analogue or Multi-State Addressable';
  standardCategory: string;
  patientAreaSounderLevelDb: string;
  theatreVisualAlarmRequirement: string;
  publicToiletDetectionRule: string;
  evacuationProtocol: string;
  batteryStandbyRule: string;
}

export function evaluateSANS322Hospital(params: SANS322SpecParams): SANS322SpecResult {
  let panelType: 'Conventional' | 'Addressable' | 'Analogue or Multi-State Addressable' = 'Conventional';
  if (params.totalDevicesCount <= 50) {
    panelType = 'Conventional';
  } else if (params.totalDevicesCount < 100) {
    panelType = 'Addressable';
  } else {
    panelType = 'Analogue or Multi-State Addressable';
  }

  return {
    panelSystemType: panelType,
    standardCategory: 'SANS 322 / SANS 10139 Category M & Category L1 Mandatory',
    patientAreaSounderLevelDb: '45 dB(A) to 55 dB(A) or 5 dB(A) above notional noise level (Clause 7)',
    theatreVisualAlarmRequirement: params.hasOperatingTheatresOrICU 
      ? 'Visual alarm beacons (≤ 130 flashes/min) with low sounders (50 dB(A) at 1 m) mandatory in Theatres/ICU/SCBU'
      : 'Standard monitored patient alert sounders',
    publicToiletDetectionRule: params.publicToiletsCount > 0
      ? 'MANDATORY: SANS 322 Facilitation 1 Clause 9 specifically requires smoke detection in public toilets (unlike standard commercial SANS 10139).'
      : 'Staff toilet omission permitted; public toilets require automatic detection.',
    evacuationProtocol: 'Two-Stage Phased Evacuation: Continuous (local fire zone) and Intermittent (adjacent zones) with Code Red / Code Green triage.',
    batteryStandbyRule: '24 Hours Quiescent Standby + 30 Minutes Full Evacuation Alarm from Essential Generator-Backed Supply (Facilitation 3).'
  };
}

// SANS 10400-T Table 11 Fire Extinguisher Calculator Helper
export interface SANS10400TExtinguisherCalcParams {
  occupancyClass: string; // 'A1', 'B1', 'C1', 'D1', 'E2', 'F1', 'G1', 'H1', 'J1', etc.
  floorAreaM2: number;
}

export interface SANS10400TExtinguisherCalcResult {
  occupancyDescription: string;
  ratePerM2: string;
  calculatedExtinguishersCount: number;
  minimumChargeWaterFoam: string;
  minimumChargeCO2: string;
  minimumChargeDCP: string;
  hoseReelsRequired: number;
  fireHydrantsRequired: number;
}

export function calculateSANS10400TExtinguishers(params: SANS10400TExtinguisherCalcParams): SANS10400TExtinguisherCalcResult {
  const occ = params.occupancyClass.toUpperCase();
  let divisor = 200;
  let co2Size = '5 kg';
  let dcpSize = '4.5 kg';
  let desc = 'Commercial / Institutional Building';

  if (['B1', 'D1', 'D2', 'H5', 'J1', 'J2'].includes(occ)) {
    divisor = 100;
    co2Size = '10 kg';
    dcpSize = '9 kg';
    desc = 'High/Moderate Industrial, Flammable Storage or Hotel Services';
  } else if (['A4', 'A5', 'B3', 'D4', 'H3', 'J3', 'J4'].includes(occ)) {
    divisor = 400;
    co2Size = ['J3', 'J4', 'D4', 'B3'].includes(occ) ? '10 kg' : '5 kg';
    dcpSize = ['J3', 'J4', 'D4', 'B3'].includes(occ) ? '9 kg' : '4.5 kg';
    desc = 'Low Risk Commercial, Domestic Residential, Parking Garage or Low Risk Storage';
  } else {
    // A1, A2, A3, C1, C2, D3, E1, E2, E3, E4, F1, F2, F3, G1, H1, H2
    divisor = 200;
    if (['C1', 'C2', 'D3'].includes(occ)) {
      co2Size = '10 kg';
      dcpSize = '9 kg';
    } else {
      co2Size = '5 kg';
      dcpSize = '4.5 kg';
    }
    desc = occ.startsWith('E') ? 'Healthcare / Institutional Facility' : (occ === 'G1' ? 'Offices' : 'Shops / Public Assembly');
  }

  const count = Math.max(1, Math.ceil(params.floorAreaM2 / divisor));
  const hoseReels = Math.max(1, Math.ceil(params.floorAreaM2 / 500));
  const hydrants = params.floorAreaM2 > 1000 ? Math.ceil(params.floorAreaM2 / 1000) : 0;

  return {
    occupancyDescription: desc,
    ratePerM2: `1 extinguisher per ${divisor} m²`,
    calculatedExtinguishersCount: count,
    minimumChargeWaterFoam: '9 L Water / 9 L Foam',
    minimumChargeCO2: `${co2Size} CO2`,
    minimumChargeDCP: `${dcpSize} Dry Chemical Powder (or 2 × ${(parseFloat(dcpSize)/2).toFixed(1)}kg equivalent)`,
    hoseReelsRequired: hoseReels,
    fireHydrantsRequired: hydrants
  };
}
