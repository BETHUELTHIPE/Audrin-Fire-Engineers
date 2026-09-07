export type DeviceType =
  | 'optical_smoke'
  | 'heat_detector'
  | 'multi_sensor'
  | 'manual_call_point'
  | 'sounder_vad'
  | 'beam_detector'
  | 'duct_probe'
  | 'interface_module'
  | 'gas_actuator';

export type DeviceStatus =
  | 'normal'        // Compliant SANS 10139
  | 'service_due'   // Routine SANS test due <= 14 days
  | 'warning'       // Elevated chamber drift / contamination or signal marginality
  | 'defect_fault'; // Overdue test, failed aerosol trigger, or loop open/short defect

export interface DeviceAnalogueTelemetry {
  contaminationPercent: number; // 0 - 100% optical chamber dust index
  sensitivityLevel: string;      // e.g. "Mode 2: 2.4% obscuration/m"
  signalMargin: number;          // 0 - 100% polling signal margin
  loopVoltage: number;           // e.g. 21.8 V DC
  temperatureC?: number;         // e.g. 21.5 °C for thermal sensors
  batteryPercent?: number;       // for wireless or self-powered sub-devices
}

export interface DeviceMaintenanceLogEntry {
  id: string;
  date: string;
  serviceType:
    | 'sans_quarterly_audit'
    | 'sans_annual_inspection'
    | 'smoke_aerosol_test'
    | 'thermal_heat_test'
    | 'manual_call_point_reset'
    | 'chamber_cleaning'
    | 'detector_replacement'
    | 'sensitivity_calibration'
    | 'fault_rectification';
  serviceTypeTitle: string;
  sansClause: string;
  result: 'pass' | 'defect' | 'serviced' | 'replaced' | 'calibrated';
  testedBy: {
    name: string;
    saqccNumber: string;
    role: string;
    company: string;
  };
  testEquipmentUsed: string;
  testReading: string;
  notes: string;
  digitalSignature: {
    signedBy: string;
    timestamp: string;
    hash: string;
  };
  cocReference?: string;
}

export interface FireDetectionDevice {
  id: string; // e.g. 'TLP-L01-D014'
  barcode: string; // 'AUDRIN-SANS-TLP-L01-D014'
  siteId: string; // 'site-01'
  siteName: string;
  clientOrganisation: string;
  loopNumber: number;
  address: number;
  zone: string; // 'Zone 02 - High Bay Receiving Deck'
  subLocation: string; // 'Aisle 4, Grid C3, Ceiling Mount at 4.5m'
  deviceType: DeviceType;
  deviceTypeLabel: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  baseType: string;
  installationDate: string;
  lastServiceDate: string;
  nextSansDueDate: string;
  status: DeviceStatus;
  analogueTelemetry: DeviceAnalogueTelemetry;
  sans10139ComplianceScore: number; // 0 - 100
  remedialActionsPending?: number;
  maintenanceHistory: DeviceMaintenanceLogEntry[];
}

export type LabelFormatOption =
  | 'standard_industrial' // 70mm x 45mm asset plate
  | 'compact_base'        // 42mm x 25mm detector base / rim tag
  | 'avery_sheet_24'      // A4 24-up label sheet (3x8)
  | 'thermal_roll_60x40'; // 60mm x 40mm mobile direct thermal transfer

export interface LabelPrintSettings {
  format: LabelFormatOption;
  includeBranding: boolean;
  includeTechnicianSaqcc: boolean;
  includeNextDueDate: boolean;
  includeDirectUrl: boolean;
  qrSizePx: number;
}
