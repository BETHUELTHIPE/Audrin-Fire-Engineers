export type TaskSourceType =
  | 'sans_inspection'
  | 'remedial_defect'
  | 'emergency_fault'
  | 'site_survey'
  | 'commissioning';

export type TechnicianAvailabilityStatus =
  | 'available'       // Standard full working day (8.0h capacity)
  | 'on_leave'        // Approved leave (0h available)
  | 'training'        // SAQCC / SANS Refresher course (e.g. 4h available)
  | 'on_call';        // High-priority emergency standby

export interface TechnicianDayAvailability {
  dateStr: string; // YYYY-MM-DD
  status: TechnicianAvailabilityStatus;
  maxHours: number; // e.g. 8.0, 4.0, or 0.0
  notes?: string;
}

export interface TechnicianScheduleProfile {
  id: string;
  name: string;
  role: string;
  saqccNumber: string;
  saqccLevel: 'Level 1 - Cabler' | 'Level 2 - Installer' | 'Level 3 - Servicing / Commissioner' | 'Level 4 - Designer / Master';
  phone: string;
  email: string;
  avatarColor: string;
  baseLocation: string;
  specialties: string[];
  maxDailyHours: number; // default 8.0
  maxWeeklyHours: number; // default 40.0
  customAvailability?: Record<string, TechnicianDayAvailability>; // dateStr -> availability
}

export interface ScheduledTaskItem {
  id: string;
  sourceType: TaskSourceType;
  sourceId?: string;
  referenceCode: string; // e.g. "INSP-001", "REM-002", "AFE-REQ-2026-0104"
  title: string;
  siteId: string;
  siteName: string;
  clientOrganisation: string;
  streetAddress?: string;
  city: string;
  sansClause: string; // e.g. "SANS 10139:2012 Clause 25.3"
  requiredSaqccLevel: 'Level 1 - Cabler' | 'Level 2 - Installer' | 'Level 3 - Servicing / Commissioner' | 'Level 4 - Designer / Master';
  priority: 'critical' | 'high' | 'standard' | 'low';
  estimatedHours: number; // e.g. 2.5, 3.5, 7.0
  scheduledDate: string | null; // YYYY-MM-DD or null if unscheduled in backlog
  scheduledTimeWindow: string; // "08:30 - 11:30", "12:00 - 15:30", "09:00 - 16:30"
  assignedTechnicianId: string | null;
  assignedTechnicianName?: string;
  technicianSaqccNumber?: string;
  status: 'unscheduled' | 'scheduled' | 'in_progress' | 'completed';
  systemCategory?: string; // "Category L1 (Life Safety)", "Category P1", etc.
  panelMakeModel?: string;
  notes?: string;
  contactPhone?: string;
  complianceChecklistSummary?: string[];
}

export interface TechnicianDaySchedule {
  dateStr: string;
  dayName: string; // "Mon", "Tue", etc.
  dayMonthStr: string; // "07 Sep"
  isToday: boolean;
  isWeekend: boolean;
  availabilityStatus: TechnicianAvailabilityStatus;
  maxHours: number;
  bookedHours: number;
  remainingHours: number;
  utilizationPercent: number;
  isOverallocated: boolean;
  tasks: ScheduledTaskItem[];
  availabilityNote?: string;
}

export interface TechnicianWeeklySummary {
  technician: TechnicianScheduleProfile;
  weeklyMaxHours: number;
  weeklyBookedHours: number;
  weeklyRemainingHours: number;
  weeklyUtilizationPercent: number;
  isWeeklyOverallocated: boolean;
  days: TechnicianDaySchedule[];
  taskCount: number;
}

export interface SchedulingFilterState {
  searchQuery: string;
  selectedTechId: string; // 'all' or tech id
  selectedType: string; // 'all' or TaskSourceType
  selectedPriority: string; // 'all' or priority
  selectedSaqccLevel: string; // 'all' or level
  viewWeekend: boolean;
}

export interface DraggedTaskPayload {
  task: ScheduledTaskItem;
  fromTechId?: string | null;
  fromDayDate?: string | null;
}
