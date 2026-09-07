export type BuildingArchetype =
  | 'commercial_office'
  | 'industrial_warehouse'
  | 'healthcare_clinic'
  | 'data_center'
  | 'retail_commercial'
  | 'custom';

export type BlueprintTheme =
  | 'blueprint_blue'
  | 'charcoal_dark'
  | 'monochrome_white'
  | 'inverted_safety';

export type SANSCategory = 'L1' | 'L2' | 'L3' | 'L4' | 'P1' | 'P2' | 'M';

export interface FloorPlanRoom {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaSqM: number;
  type:
    | 'office'
    | 'corridor'
    | 'boardroom'
    | 'reception'
    | 'server_room'
    | 'plant_room'
    | 'warehouse'
    | 'ward'
    | 'retail'
    | 'kitchen'
    | 'stairwell'
    | 'hazard';
  specialHazard?: string;
  notes?: string;
}

export interface FloorPlanDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  isEmergencyExit: boolean;
  orientation: 'horizontal' | 'vertical';
  label: string;
}

export interface FloorPlanZone {
  id: string;
  name: string;
  color: string;
  loopNumber: number;
  description: string;
}

export interface MappedFloorDevice {
  id: string;
  type: 'smoke' | 'heat' | 'call_point' | 'sounder' | 'panel';
  label: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  zone: string;
  lastServicedDate?: string;
  status: 'operational' | 'due_service' | 'fault';
}

export interface GeneratedFloorPlan {
  id: string;
  title: string;
  siteReference: string;
  customerName: string;
  archetype: BuildingArchetype;
  theme: BlueprintTheme;
  sansCategory: SANSCategory;
  squareMeters: number;
  ceilingHeightMeters: number;
  scaleText: string;
  createdAt: string;
  rooms: FloorPlanRoom[];
  doors: FloorPlanDoor[];
  zones: FloorPlanZone[];
  suggestedDevices: MappedFloorDevice[];
  summaryReport: string;
  sansComplianceNotes: string[];
}

export interface GeneratorOptions {
  siteReference: string;
  customerName: string;
  facilityName: string;
  archetype: BuildingArchetype;
  theme: BlueprintTheme;
  sansCategory: SANSCategory;
  squareMeters: number;
  zoneCount: number;
  ceilingHeight: number;
  hasCleanAgentGasRoom: boolean;
  hasLithiumBatteryRoom: boolean;
  hasKitchenExtraction: boolean;
  hasEmergencyGenset: boolean;
  customPrompt?: string;
}
