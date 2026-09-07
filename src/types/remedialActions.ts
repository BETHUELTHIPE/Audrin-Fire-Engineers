import { TechnicianProfile } from '../types';

export type SANSRequirementCheckStatus = 'passed' | 'failed' | 'untested' | 'not_applicable';

export type RemedialTaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type RemedialTaskStatus =
  | 'pending_assignment' // Generated from failed check, awaiting admin tech dispatch
  | 'assigned'           // Assigned to technician with scheduled target date
  | 'in_progress'        // Technician on-site rectifying the defect
  | 'rectified'          // Technician completed work, re-test conducted
  | 'verified_closed';   // SAQCC Level 4 Master / Admin verified and signed off

export interface SANSRequirementItem {
  id: string;
  clause: string; // e.g., "SANS 10139:2012 Clause 25.3.3"
  title: string; // e.g., "Standby Secondary Battery Float & Load Impedance Test"
  description: string;
  category:
    | 'Power Supply'
    | 'Detection Sampling'
    | 'Audibility & Visual'
    | 'Interlocks & Interfaces'
    | 'Documentation & Logbook'
    | 'Cabling & Enclosures'
    | 'Aspirating & Clean Agent';
  criticality: 'critical' | 'major' | 'minor';
  status: SANSRequirementCheckStatus;
  measuredValue?: string; // e.g., "9.8V under 2A load (Threshold >= 12.2V)"
  defectNotes?: string;
  defaultRemedialAction: {
    title: string;
    description: string;
    recommendedParts: string[];
    slaHours: number; // SLA deadline in hours from failure detection
    requiredSaqccLevel: string; // Minimum required technician qualification
    estimatedHours: number;
    estimatedCostZAR: number;
  };
}

export interface RemedialActionTask {
  id: string; // e.g., "REM-2026-001"
  referenceCode: string; // e.g., "REM-001"
  title: string;
  description: string;
  sansClause: string; // e.g., "SANS 10139:2012 Clause 25.3.3"
  category: string;
  priority: RemedialTaskPriority;
  status: RemedialTaskStatus;

  // Site and Inspection linkage
  siteId: string;
  siteName: string;
  locationDetails?: string; // e.g. "Main Distribution Warehouse, Ground Floor Control Riser"
  clientOrganisation: string;
  panelMakeModel?: string;
  inspectionId?: string;
  inspectionTitle?: string;

  // Failure Telemetry & Statutory Non-Compliance
  failureReason: string;
  measuredValue?: string;
  statutoryConsequence: string; // Legal risk if unrectified under SANS / OHS Act 85 of 1993
  dateGenerated: string; // ISO date
  targetCompletionDate: string; // YYYY-MM-DD
  slaHours: number;
  slaDeadline: string; // ISO string calculated from generation time + slaHours

  // Technical Requirements
  requiredSaqccLevel: string;
  recommendedParts: string[];
  estimatedHours: number;
  estimatedCostZAR: number;

  // Immediate Admin Assignment to Technician
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianSaqcc?: string;
  assignedTechnicianPhone?: string;
  assignedTechnicianEmail?: string;
  assignedAt?: string; // ISO date
  assignedBy?: string; // Admin user name
  targetTimeWindow?: string; // "09:00 - 12:00"
  dispatchNotes?: string; // Admin instructions to the attending technician

  // Resolution & Verification
  rectifiedAt?: string;
  rectifiedNotes?: string;
  rectifiedByTechName?: string;
  retestPassed?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface RemedialFilterState {
  searchQuery: string;
  selectedSite: string; // 'all' or siteId
  selectedPriority: string; // 'all' or RemedialTaskPriority
  selectedStatus: string; // 'all' or RemedialTaskStatus
  selectedTechnician: string; // 'all' or technicianId
}
