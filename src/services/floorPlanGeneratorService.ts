import {
  BuildingArchetype,
  BlueprintTheme,
  SANSCategory,
  FloorPlanRoom,
  FloorPlanDoor,
  FloorPlanZone,
  MappedFloorDevice,
  GeneratedFloorPlan,
  GeneratorOptions
} from '../types/floorplan';

export interface ThemeColors {
  name: string;
  bg: string;
  gridPrimary: string;
  gridSecondary: string;
  wallExterior: string;
  wallInterior: string;
  roomBg: string;
  roomBgAlt: string;
  hazardBg: string;
  hazardBorder: string;
  textPrimary: string;
  textMuted: string;
  doorNormal: string;
  doorExit: string;
}

export const BLUEPRINT_THEMES: Record<BlueprintTheme, ThemeColors> = {
  blueprint_blue: {
    name: 'Classic Cyan Blueprint',
    bg: '#07152B',
    gridPrimary: '#1E3A5F',
    gridSecondary: '#0C2344',
    wallExterior: '#38BDF8',
    wallInterior: '#0284C7',
    roomBg: 'rgba(14, 38, 71, 0.65)',
    roomBgAlt: 'rgba(11, 31, 59, 0.65)',
    hazardBg: 'rgba(239, 68, 68, 0.15)',
    hazardBorder: '#EF4444',
    textPrimary: '#F0F9FF',
    textMuted: '#7DD3FC',
    doorNormal: '#38BDF8',
    doorExit: '#10B981'
  },
  charcoal_dark: {
    name: 'Modern Charcoal Dark CAD',
    bg: '#0A0F1D',
    gridPrimary: '#1E293B',
    gridSecondary: '#111827',
    wallExterior: '#94A3B8',
    wallInterior: '#475569',
    roomBg: 'rgba(19, 28, 46, 0.7)',
    roomBgAlt: 'rgba(15, 23, 42, 0.7)',
    hazardBg: 'rgba(245, 158, 11, 0.15)',
    hazardBorder: '#F59E0B',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    doorNormal: '#64748B',
    doorExit: '#10B981'
  },
  monochrome_white: {
    name: 'Architectural Drafting White',
    bg: '#F8FAFC',
    gridPrimary: '#CBD5E1',
    gridSecondary: '#E2E8F0',
    wallExterior: '#0F172A',
    wallInterior: '#334155',
    roomBg: 'rgba(241, 245, 249, 0.8)',
    roomBgAlt: 'rgba(255, 255, 255, 0.8)',
    hazardBg: 'rgba(220, 38, 38, 0.1)',
    hazardBorder: '#DC2626',
    textPrimary: '#0F172A',
    textMuted: '#475569',
    doorNormal: '#1D4ED8',
    doorExit: '#059669'
  },
  inverted_safety: {
    name: 'High-Hazard Inverted Safety',
    bg: '#05070E',
    gridPrimary: '#1E1B4B',
    gridSecondary: '#0F172A',
    wallExterior: '#818CF8',
    wallInterior: '#6366F1',
    roomBg: 'rgba(17, 21, 51, 0.7)',
    roomBgAlt: 'rgba(12, 15, 36, 0.7)',
    hazardBg: 'rgba(236, 72, 153, 0.15)',
    hazardBorder: '#EC4899',
    textPrimary: '#EEF2FF',
    textMuted: '#A5B4FC',
    doorNormal: '#818CF8',
    doorExit: '#10B981'
  }
};

/**
 * Procedurally generates an architectural CAD floor plan model based on site parameters.
 */
export function generateArchitecturalFloorPlan(options: GeneratorOptions): GeneratedFloorPlan {
  const {
    siteReference,
    customerName,
    facilityName,
    archetype,
    theme = 'blueprint_blue',
    sansCategory = 'L1',
    squareMeters = 1200,
    ceilingHeight = 2.8,
    hasCleanAgentGasRoom = false,
    hasLithiumBatteryRoom = false,
    hasKitchenExtraction = false,
    hasEmergencyGenset = false
  } = options;

  let rooms: FloorPlanRoom[] = [];
  let doors: FloorPlanDoor[] = [];
  let zones: FloorPlanZone[] = [];
  let suggestedDevices: MappedFloorDevice[] = [];
  let title = '';
  const complianceNotes: string[] = [];

  // Canvas bounds: 1000 x 562 (16:9 ratio). Outer perimeter: x=60, y=50, width=880, height=460.
  const px = 60;
  const py = 50;
  const pw = 880;
  const ph = 460;

  switch (archetype) {
    case 'industrial_warehouse': {
      title = `${facilityName} - High-Bay Logistics Depot`;
      const dockW = 200;
      const mainW = 480;
      const plantW = pw - dockW - mainW;

      zones = [
        { id: 'z1', name: 'Zone 1 - Inbound/Outbound Docks', color: '#F59E0B', loopNumber: 1, description: 'Loading bays & staging' },
        { id: 'z2', name: 'Zone 2 - High-Bay Racking Aisles', color: '#38BDF8', loopNumber: 1, description: 'Beam detector aisle coverage' },
        { id: 'z3', name: 'Zone 3 - Hazardous Battery & Plant', color: '#EF4444', loopNumber: 2, description: 'Hydrogen extraction & pump riser' }
      ];

      rooms = [
        {
          id: 'r-dock',
          name: 'Inbound & Outbound Loading Bays (5 Docks)',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Loading Bays',
          x: px,
          y: py,
          width: dockW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.25),
          type: 'warehouse',
          notes: 'Roll-up shutter monitoring & MCP stations'
        },
        {
          id: 'r-racks',
          name: 'High-Bay Pallet Racking (Aisles A1-A8)',
          zoneId: 'z2',
          zoneName: 'Zone 2 - Warehouse Storage',
          x: px + dockW,
          y: py,
          width: mainW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.55),
          type: 'warehouse',
          notes: 'Clear height 8.5m - Optical beam detectors required'
        },
        {
          id: 'r-forklift',
          name: hasLithiumBatteryRoom ? 'Lithium Battery & Forklift Charging Bay' : 'Forklift Charging Station',
          zoneId: 'z3',
          zoneName: 'Zone 3 - Plant & Hazard',
          x: px + dockW + mainW,
          y: py,
          width: plantW,
          height: Math.round(ph * 0.48),
          areaSqM: Math.round(squareMeters * 0.1),
          type: 'hazard',
          specialHazard: 'Hydrogen Ex-Proof Area (SANS 10108)'
        },
        {
          id: 'r-pumps',
          name: 'Fire Sprinkler Pump & Riser Valve Room',
          zoneId: 'z3',
          zoneName: 'Zone 3 - Plant & Hazard',
          x: px + dockW + mainW,
          y: py + Math.round(ph * 0.48),
          width: plantW,
          height: ph - Math.round(ph * 0.48),
          areaSqM: Math.round(squareMeters * 0.1),
          type: 'plant_room',
          specialHazard: 'Monitored Flow Switches & Valves'
        }
      ];

      doors = [
        { id: 'd1', x: px, y: py + 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'EXIT A' },
        { id: 'd2', x: px + pw, y: py + ph - 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'EXIT B' },
        { id: 'd3', x: px + dockW, y: py + ph / 2, width: 35, isEmergencyExit: false, orientation: 'vertical', label: 'DOCK ACCESS' }
      ];

      suggestedDevices = [
        { id: 'DEV-FACP-01', type: 'panel', label: 'Main FACP (Ziton ZP3)', xPercent: 10, yPercent: 82, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-MCP-01', type: 'call_point', label: 'MCP Dock Inbound', xPercent: 12, yPercent: 25, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-MCP-02', type: 'call_point', label: 'MCP Dock Outbound', xPercent: 12, yPercent: 75, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-BEAM-01', type: 'smoke', label: 'Reflective Beam Detector 01', xPercent: 35, yPercent: 20, zone: 'Zone 2', status: 'operational' },
        { id: 'DEV-BEAM-02', type: 'smoke', label: 'Reflective Beam Detector 02', xPercent: 55, yPercent: 20, zone: 'Zone 2', status: 'operational' },
        { id: 'DEV-HEAT-01', type: 'heat', label: 'Rate-of-Rise Heat #1', xPercent: 88, yPercent: 25, zone: 'Zone 3', status: 'operational' },
        { id: 'DEV-SND-01', type: 'sounder', label: 'High-Output Voice Sounder 105dB', xPercent: 50, yPercent: 50, zone: 'Zone 2', status: 'operational' }
      ];

      complianceNotes.push(
        'SANS 10139 Cl. 25.4: Ceiling height > 6.0m requires optical beam or aspirating smoke detection.',
        'SANS 10287: Monitored valve tamper switches linked to FACP loop supervisory inputs.'
      );
      break;
    }

    case 'healthcare_clinic': {
      title = `${facilityName} - Healthcare & Surgical Clinic`;
      const colW = Math.round(pw / 3);

      zones = [
        { id: 'z1', name: 'Zone 1 - Emergency & Reception', color: '#EF4444', loopNumber: 1, description: 'Trauma & ambulance bay' },
        { id: 'z2', name: 'Zone 2 - Inpatient Recovery Wards', color: '#10B981', loopNumber: 1, description: 'Patient care bedrooms' },
        { id: 'z3', name: 'Zone 3 - Sterile Surgery & Medical Gas', color: '#0284C7', loopNumber: 2, description: 'High isolation theatre' }
      ];

      rooms = [
        {
          id: 'r-trauma',
          name: 'Emergency Trauma Bay & Triage',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Emergency Care',
          x: px,
          y: py,
          width: colW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.32),
          type: 'ward',
          notes: 'Patient egress priority'
        },
        {
          id: 'r-wards',
          name: 'Patient Recovery Rooms (Wards 1-6)',
          zoneId: 'z2',
          zoneName: 'Zone 2 - Patient Wards',
          x: px + colW,
          y: py,
          width: colW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.35),
          type: 'ward',
          notes: 'Visual strobe beacons mandatory (no loud bells in active patient rooms)'
        },
        {
          id: 'r-theatre',
          name: 'Sterile Operating Suite & Medical Gas Manifold',
          zoneId: 'z3',
          zoneName: 'Zone 3 - Surgical Suite',
          x: px + colW * 2,
          y: py,
          width: pw - colW * 2,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.33),
          type: 'hazard',
          specialHazard: 'Medical O2 & N2O Manifold Storage'
        }
      ];

      doors = [
        { id: 'd1', x: px, y: py + ph - 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'AMBULANCE BAY' },
        { id: 'd2', x: px + pw, y: py + 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'SURGICAL EGRESS' }
      ];

      suggestedDevices = [
        { id: 'DEV-FACP-01', type: 'panel', label: 'Nurse Station Repeater FACP', xPercent: 12, yPercent: 78, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-MCP-01', type: 'call_point', label: 'MCP Triage Airlock', xPercent: 14, yPercent: 25, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-01', type: 'smoke', label: 'Optical Smoke #101', xPercent: 22, yPercent: 45, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-02', type: 'smoke', label: 'Optical Smoke Ward Corridor', xPercent: 50, yPercent: 30, zone: 'Zone 2', status: 'operational' },
        { id: 'DEV-SND-01', type: 'sounder', label: 'Visual Strobe Beacon (Low dB)', xPercent: 50, yPercent: 65, zone: 'Zone 2', status: 'operational' },
        { id: 'DEV-OPT-03', type: 'smoke', label: 'Theatre Duct Probe Sensor', xPercent: 82, yPercent: 45, zone: 'Zone 3', status: 'operational' }
      ];

      complianceNotes.push(
        'SANS 10139 Cl. 14.3.4: Healthcare installations must prioritize staged staff alarm or low-frequency visual strobes.',
        'SANS 10139 Cl. 25.3: Category L1 coverage required throughout patient care areas.'
      );
      break;
    }

    case 'data_center': {
      title = `${facilityName} - Tier-3 Mission-Critical Data Center`;
      const hallW = Math.round(pw * 0.65);
      const rightW = pw - hallW;

      zones = [
        { id: 'z1', name: 'Zone 1 - High Density Server Hall (VESDA)', color: '#EF4444', loopNumber: 1, description: 'Dual aspirating laser detection' },
        { id: 'z2', name: 'Zone 2 - 24/7 NOC & Biometric Mantrap', color: '#38BDF8', loopNumber: 1, description: 'Command center & airlock' },
        { id: 'z3', name: 'Zone 3 - Inergen Gas Flood & UPS Room', color: '#A855F7', loopNumber: 2, description: '200 Bar total flood suppression' }
      ];

      rooms = [
        {
          id: 'r-hall',
          name: 'Server Hall 01 (Pods A & B - Hot/Cold Containment)',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Server Hall',
          x: px,
          y: py,
          width: hallW,
          height: Math.round(ph * 0.65),
          areaSqM: Math.round(squareMeters * 0.5),
          type: 'server_room',
          specialHazard: 'Dual VESDA Early Warning + Gas Discharge Nozzles'
        },
        {
          id: 'r-noc',
          name: '24/7 NOC Monitoring Center & Biometric Mantrap',
          zoneId: 'z2',
          zoneName: 'Zone 2 - NOC & Security',
          x: px,
          y: py + Math.round(ph * 0.65),
          width: hallW,
          height: ph - Math.round(ph * 0.65),
          areaSqM: Math.round(squareMeters * 0.25),
          type: 'office',
          notes: 'FACP Master graphic terminal & mimic panel'
        },
        {
          id: 'r-gas',
          name: 'Inergen Gas Suppression & UPS Battery Hall',
          zoneId: 'z3',
          zoneName: 'Zone 3 - Gas Suppression',
          x: px + hallW,
          y: py,
          width: rightW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.25),
          type: 'hazard',
          specialHazard: 'SANS 14520 Coincident (Double Knock) Clean Agent'
        }
      ];

      doors = [
        { id: 'd1', x: px, y: py + Math.round(ph * 0.65) + 30, width: 35, isEmergencyExit: true, orientation: 'vertical', label: 'MANTRAP EXIT' },
        { id: 'd2', x: px + pw, y: py + ph - 60, width: 35, isEmergencyExit: true, orientation: 'vertical', label: 'UPS EGRESS' }
      ];

      suggestedDevices = [
        { id: 'DEV-FACP-01', type: 'panel', label: 'Data Center Master FACP (Gas Release)', xPercent: 12, yPercent: 82, zone: 'Zone 2', status: 'operational' },
        { id: 'DEV-VESDA-01', type: 'smoke', label: 'VESDA Laser Aspirating Pipe Hub', xPercent: 32, yPercent: 25, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-01', type: 'smoke', label: 'Optical Smoke Pod A (Knock 1)', xPercent: 22, yPercent: 42, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-HEAT-01', type: 'heat', label: 'Thermal Detector Pod A (Knock 2)', xPercent: 42, yPercent: 42, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-MCP-GAS', type: 'call_point', label: 'Gas Hold-Off & Manual Release', xPercent: 72, yPercent: 70, zone: 'Zone 3', status: 'operational' },
        { id: 'DEV-SND-01', type: 'sounder', label: 'Dual Stage Gas Discharge Strobe', xPercent: 72, yPercent: 30, zone: 'Zone 3', status: 'operational' }
      ];

      complianceNotes.push(
        'SANS 14520 / SANS 10139: Coincident detection (Double-Knock) verified before gas discharge countdown.',
        'Underfloor & return-air plenum monitoring with aspirating smoke detection.'
      );
      break;
    }

    case 'retail_commercial': {
      title = `${facilityName} - Retail Superstore & Mall Tenant`;
      const showH = Math.round(ph * 0.68);
      const backH = ph - showH;

      zones = [
        { id: 'z1', name: 'Zone 1 - Customer Showroom Floor', color: '#38BDF8', loopNumber: 1, description: 'Public shopping aisles & POS' },
        { id: 'z2', name: 'Zone 2 - Back-of-House Storage & Docks', color: '#F59E0B', loopNumber: 1, description: 'High-theft vault & loading bay' }
      ];

      rooms = [
        {
          id: 'r-sales',
          name: 'Main Retail Sales Floor & Checkout Bank',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Public Showroom',
          x: px,
          y: py,
          width: pw,
          height: showH,
          areaSqM: Math.round(squareMeters * 0.7),
          type: 'retail',
          notes: 'Voice evacuation system mandatory (SANS 10139 Cl. 14)'
        },
        {
          id: 'r-storage',
          name: 'Back-of-House High-Stack Storage & Goods Receiving',
          zoneId: 'z2',
          zoneName: 'Zone 2 - Storage & Vault',
          x: px,
          y: py + showH,
          width: pw,
          height: backH,
          areaSqM: Math.round(squareMeters * 0.3),
          type: 'warehouse',
          notes: 'Beam detectors & fire-rated roller shutters'
        }
      ];

      doors = [
        { id: 'd1', x: px + 60, y: py + showH, width: 50, isEmergencyExit: true, orientation: 'horizontal', label: 'FIRE EXIT 1' },
        { id: 'd2', x: px + pw - 120, y: py + showH, width: 50, isEmergencyExit: true, orientation: 'horizontal', label: 'FIRE EXIT 2' }
      ];

      suggestedDevices = [
        { id: 'DEV-FACP-01', type: 'panel', label: 'Main FACP (Customer Service)', xPercent: 12, yPercent: 62, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-01', type: 'smoke', label: 'Optical Smoke #101', xPercent: 25, yPercent: 30, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-02', type: 'smoke', label: 'Optical Smoke #102', xPercent: 55, yPercent: 30, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-OPT-03', type: 'smoke', label: 'Optical Smoke #103', xPercent: 82, yPercent: 30, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-SND-01', type: 'sounder', label: 'Voice Evacuation Horn #1', xPercent: 35, yPercent: 18, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-SND-02', type: 'sounder', label: 'Voice Evacuation Horn #2', xPercent: 68, yPercent: 18, zone: 'Zone 1', status: 'operational' },
        { id: 'DEV-MCP-01', type: 'call_point', label: 'MCP Goods Inwards', xPercent: 88, yPercent: 85, zone: 'Zone 2', status: 'operational' }
      ];

      complianceNotes.push(
        'SANS 10139 Category L3/M compliance for public assembly and shopping concourses.',
        'Voice evacuation audibility > 65dB or 5dB above ambient noise throughout.'
      );
      break;
    }

    case 'commercial_office':
    default: {
      title = `${facilityName} - Corporate Commercial Headquarters`;
      const leftColW = Math.round(pw * 0.32);
      const midColW = Math.round(pw * 0.42);
      const rightColW = pw - leftColW - midColW;

      zones = [
        { id: 'z1', name: 'Zone 1 - Boardroom & Executive Wing', color: '#0284C7', loopNumber: 1, description: 'Private director suites' },
        { id: 'z2', name: 'Zone 2 - Central Open Plan Workstations', color: '#38BDF8', loopNumber: 1, description: 'General open floor & reception' },
        { id: 'z3', name: 'Zone 3 - Clean Agent Server Hub', color: '#EF4444', loopNumber: 2, description: 'IT server & comms enclosure' },
        { id: 'z4', name: 'Zone 4 - Electrical Plant & Stairwell', color: '#10B981', loopNumber: 2, description: 'HVAC, Genset & fire stairs' }
      ];

      const boardH = Math.round(ph * 0.48);
      const srvH = Math.round(ph * 0.48);

      rooms = [
        {
          id: 'r-board',
          name: 'Executive Boardroom (16 Pax)',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Executive Wing',
          x: px,
          y: py,
          width: leftColW,
          height: boardH,
          areaSqM: Math.round(squareMeters * 0.16),
          type: 'boardroom',
          notes: 'Acoustic baffle ceiling - optical smoke placement per SANS Cl. 25.3'
        },
        {
          id: 'r-exec',
          name: 'Director Suites (Offices 101-102)',
          zoneId: 'z1',
          zoneName: 'Zone 1 - Executive Wing',
          x: px,
          y: py + boardH,
          width: leftColW,
          height: ph - boardH,
          areaSqM: Math.round(squareMeters * 0.16),
          type: 'office',
          notes: 'Individual addressable optical smoke sensors'
        },
        {
          id: 'r-open',
          name: 'Open Plan Workstations & Main Lobby',
          zoneId: 'z2',
          zoneName: 'Zone 2 - Open Plan',
          x: px + leftColW,
          y: py,
          width: midColW,
          height: ph,
          areaSqM: Math.round(squareMeters * 0.42),
          type: 'corridor',
          notes: 'Central egress route with illuminated running-man signage'
        },
        {
          id: 'r-server',
          name: 'Clean Agent Server Hub (Loop 2)',
          zoneId: 'z3',
          zoneName: 'Zone 3 - Comms Hub',
          x: px + leftColW + midColW,
          y: py,
          width: rightColW,
          height: srvH,
          areaSqM: Math.round(squareMeters * 0.13),
          type: 'server_room',
          specialHazard: 'FM-200 Clean Agent Suppression Enclosure'
        },
        {
          id: 'r-plant',
          name: 'Electrical Plant & Fire Escape Stair 2',
          zoneId: 'z4',
          zoneName: 'Zone 4 - Plant & Egress',
          x: px + leftColW + midColW,
          y: py + srvH,
          width: rightColW,
          height: ph - srvH,
          areaSqM: Math.round(squareMeters * 0.13),
          type: 'plant_room',
          notes: 'Self-closing 2-hour fire doors'
        }
      ];

      doors = [
        { id: 'd1', x: px, y: py + ph - 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'EXIT A' },
        { id: 'd2', x: px + pw, y: py + ph - 80, width: 40, isEmergencyExit: true, orientation: 'vertical', label: 'EXIT B' },
        { id: 'd3', x: px + leftColW + midColW / 2 - 25, y: py + ph, width: 50, isEmergencyExit: false, orientation: 'horizontal', label: 'MAIN INGRESS' }
      ];

      suggestedDevices = [
        { id: 'DEV-FACP-01', type: 'panel', label: 'Main FACP (Ziton ZP3)', xPercent: 12, yPercent: 78, zone: 'Zone 1 - Main Entrance', status: 'operational' },
        { id: 'DEV-MCP-01', type: 'call_point', label: 'MCP #01 (Break Glass)', xPercent: 16, yPercent: 74, zone: 'Zone 1 - Main Entrance', status: 'operational' },
        { id: 'DEV-OPT-01', type: 'smoke', label: 'Optical Smoke #101', xPercent: 28, yPercent: 35, zone: 'Zone 1 - Executive Boardroom', status: 'operational' },
        { id: 'DEV-OPT-02', type: 'smoke', label: 'Optical Smoke #102', xPercent: 55, yPercent: 30, zone: 'Zone 2 - Open Plan Workstations', status: 'operational' },
        { id: 'DEV-SND-01', type: 'sounder', label: 'Sounder / Beacon #01', xPercent: 50, yPercent: 18, zone: 'Zone 2 - Central Corridor', status: 'operational' },
        { id: 'DEV-HEAT-01', type: 'heat', label: 'Rate-of-Rise Heat #201', xPercent: 82, yPercent: 28, zone: 'Zone 3 - Server Room & UPS Hub', status: 'operational' },
        { id: 'DEV-OPT-03', type: 'smoke', label: 'Optical Smoke #202', xPercent: 82, yPercent: 70, zone: 'Zone 4 - Electrical Plant Room', status: 'operational' }
      ];

      complianceNotes.push(
        'SANS 10139 Category L1/L2 Design: All escape routes and high fire-risk spaces monitored.',
        'Manual call points positioned at every exit to open air with travel distance < 30m.'
      );
      break;
    }
  }

  // Adjust for optional hazards
  if (hasCleanAgentGasRoom && !rooms.some(r => r.type === 'server_room')) {
    rooms.push({
      id: 'r-custom-gas',
      name: 'Custom Clean Agent Server Hub',
      zoneId: 'z-gas',
      zoneName: 'Clean Agent Enclosure',
      x: px + pw - 180,
      y: py + 10,
      width: 170,
      height: 120,
      areaSqM: 35,
      type: 'server_room',
      specialHazard: 'FM-200 Gas Suppression'
    });
  }

  const summaryReport = `Architectural schematic generated for ${facilityName} (${siteReference}). Covers ${squareMeters} m² across ${zones.length} SANS 10139 zones with ${rooms.length} compartmentalized rooms and ${suggestedDevices.length} pre-allocated detection devices.`;

  return {
    id: `FP-${Date.now()}`,
    title,
    siteReference,
    customerName,
    archetype,
    theme,
    sansCategory,
    squareMeters,
    ceilingHeightMeters: ceilingHeight,
    scaleText: '1:100 @ A1',
    createdAt: new Date().toISOString(),
    rooms,
    doors,
    zones,
    suggestedDevices,
    summaryReport,
    sansComplianceNotes: complianceNotes
  };
}

/**
 * Exports any rendered SVGSVGElement to a crisp high-resolution PNG file download.
 */
export async function exportSvgToPng(svgElement: SVGSVGElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2000;
        canvas.height = 1124;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Background
        ctx.fillStyle = '#07152B';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the SVG
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error('PNG conversion failed'));
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}
