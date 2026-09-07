export type SANS10139IntervalKey =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannual'
  | 'annual'
  | 'five_year';

export type MaintenanceUrgencyStatus =
  | 'overdue'      // Past due date (< 0 days)
  | 'due_soon'     // Due within 14 days
  | 'scheduled'    // Scheduled within 15 - 45 days
  | 'compliant';   // Compliant (> 45 days remaining)

export interface SANS10139RequirementDetail {
  clause: string;
  clauseTitle: string;
  cycleDays: number;
  frequencyLabel: string;
  statutoryObjective: string;
  mandatoryScope: string[];
  audibilityVerification?: string;
  batteryAutonomyCriteria?: string;
  causeAndEffectInterlocks?: string;
  requiredSaqccLevel: string;
  statutoryConsequence: string;
  documentationMandate: string;
}

export interface SiteMaintenanceInterval {
  id: string;
  siteId: string;
  intervalKey: SANS10139IntervalKey;
  label: string;
  standardClause: string;
  cycleDays: number;
  lastCompletedDate: string;
  nextDueDate: string;
  daysRemaining: number;
  status: MaintenanceUrgencyStatus;
  cycleElapsedPercent: number;
  requirementDetail: SANS10139RequirementDetail;
  assignedTechnician: {
    name: string;
    saqccNumber: string;
    role: string;
    phone: string;
  };
  lastCertificateNumber?: string;
}

export interface ClientSiteMaintenanceProfile {
  siteId: string;
  siteName: string;
  shortName: string;
  clientOrganisation: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  systemCategory: string; // e.g. 'Category L1 (Life Safety)'
  panelModel: string;
  loopCount: number;
  deviceCount: number;
  contactPerson: string;
  contactPhone: string;
  overallComplianceScore: number; // 0 - 100
  earliestDueDays: number;
  mostUrgentInterval: SiteMaintenanceInterval;
  intervals: Record<SANS10139IntervalKey, SiteMaintenanceInterval>;
}

export interface ServiceDueFilterState {
  searchQuery: string;
  selectedSite: string; // 'all' or siteId
  selectedInterval: string; // 'all' or SANS10139IntervalKey
  selectedStatus: string; // 'all' or MaintenanceUrgencyStatus
  selectedCategory: string; // 'all' or Category L1, etc.
}
