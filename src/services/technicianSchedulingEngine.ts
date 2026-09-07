import {
  TechnicianScheduleProfile,
  ScheduledTaskItem,
  TechnicianDaySchedule,
  TechnicianWeeklySummary,
  TechnicianAvailabilityStatus
} from '../types/technicianScheduling';

export interface WeekDayInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue", etc.
  dayMonthStr: string; // "07 Sep"
  isToday: boolean;
  isWeekend: boolean;
}

export const SAQCC_RANKS: Record<string, number> = {
  'Level 1 - Cabler': 1,
  'Level 2 - Installer': 2,
  'Level 3 - Servicing / Commissioner': 3,
  'Level 4 - Designer / Master': 4
};

/**
 * Given a reference date, returns the Monday of that week.
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Generates an array of WeekDayInfo starting from Monday for either 5 or 7 days.
 */
export function getWeekDates(mondayDate: Date, includeWeekend: boolean = true): WeekDayInfo[] {
  const count = includeWeekend ? 7 : 5;
  const days: WeekDayInfo[] = [];
  const todayStr = '2026-09-04'; // Aligned with the app's current date environment (Sep 2026)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < count; i++) {
    const current = new Date(mondayDate);
    current.setDate(mondayDate.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const dateNum = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dateNum}`;

    const isWeekend = i >= 5;
    const isToday = dateStr === todayStr;

    days.push({
      date: current,
      dateStr,
      dayName: dayNames[i],
      dayMonthStr: `${dateNum} ${monthNames[current.getMonth()]}`,
      isToday,
      isWeekend
    });
  }

  return days;
}

/**
 * Checks whether a technician's SAQCC qualification meets or exceeds statutory requirements.
 */
export function checkSaqccQualificationMatch(
  technicianLevel: string,
  requiredLevel: string
): { isCompliant: boolean; message?: string } {
  const techRank = SAQCC_RANKS[technicianLevel] || 1;
  const reqRank = SAQCC_RANKS[requiredLevel] || 2;

  if (techRank >= reqRank) {
    return { isCompliant: true };
  }

  return {
    isCompliant: false,
    message: `Statutory Warning: Task mandates ${requiredLevel}; technician holds ${technicianLevel}. Senior Level 3/4 co-signature required on SANS 10139 log.`
  };
}

/**
 * Computes the daily workload, remaining hours, and overallocation for a technician on a specific date.
 */
export function calculateTechnicianDaySchedule(
  technician: TechnicianScheduleProfile,
  dayInfo: WeekDayInfo,
  allTasks: ScheduledTaskItem[]
): TechnicianDaySchedule {
  // Filter tasks assigned to this technician on this specific date
  const dayTasks = allTasks.filter(
    t => t.assignedTechnicianId === technician.id && t.scheduledDate === dayInfo.dateStr
  );

  const bookedHours = dayTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  // Check custom availability override for this date
  const custom = technician.customAvailability?.[dayInfo.dateStr];
  let maxHours = technician.maxDailyHours || 8.0;
  let availabilityStatus: TechnicianAvailabilityStatus = 'available';
  let availabilityNote: string | undefined = undefined;

  if (custom) {
    availabilityStatus = custom.status;
    maxHours = custom.maxHours;
    availabilityNote = custom.notes;
  } else if (dayInfo.isWeekend) {
    // Weekend default: off-duty unless custom on-call specified
    maxHours = 0.0;
    availabilityStatus = 'on_leave';
    availabilityNote = 'Standard Weekend (Off-Duty)';
  }

  const remainingHours = Math.max(0, maxHours - bookedHours);
  const isOverallocated = bookedHours > maxHours && maxHours > 0;
  const utilizationPercent = maxHours > 0 ? Math.round((bookedHours / maxHours) * 100) : (bookedHours > 0 ? 100 : 0);

  return {
    dateStr: dayInfo.dateStr,
    dayName: dayInfo.dayName,
    dayMonthStr: dayInfo.dayMonthStr,
    isToday: dayInfo.isToday,
    isWeekend: dayInfo.isWeekend,
    availabilityStatus,
    maxHours,
    bookedHours: Number(bookedHours.toFixed(1)),
    remainingHours: Number(remainingHours.toFixed(1)),
    utilizationPercent,
    isOverallocated,
    tasks: dayTasks,
    availabilityNote
  };
}

/**
 * Calculates a complete weekly workload summary for a technician across the displayed week.
 */
export function calculateTechnicianWeeklySummary(
  technician: TechnicianScheduleProfile,
  weekDays: WeekDayInfo[],
  allTasks: ScheduledTaskItem[]
): TechnicianWeeklySummary {
  const days = weekDays.map(d => calculateTechnicianDaySchedule(technician, d, allTasks));

  const weeklyBookedHours = Number(days.reduce((acc, d) => acc + d.bookedHours, 0).toFixed(1));
  const weeklyMaxHours = Number(days.reduce((acc, d) => acc + d.maxHours, 0).toFixed(1));
  const weeklyRemainingHours = Number(Math.max(0, weeklyMaxHours - weeklyBookedHours).toFixed(1));
  const weeklyUtilizationPercent = weeklyMaxHours > 0
    ? Math.min(100, Math.round((weeklyBookedHours / weeklyMaxHours) * 100))
    : 0;
  const isWeeklyOverallocated = weeklyBookedHours > weeklyMaxHours;

  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);

  return {
    technician,
    weeklyMaxHours,
    weeklyBookedHours,
    weeklyRemainingHours,
    weeklyUtilizationPercent,
    isWeeklyOverallocated,
    days,
    taskCount: totalTasks
  };
}

/**
 * Suggests the best-fit technician and time slot for an unscheduled task based on:
 * 1. SAQCC qualification matching.
 * 2. Technician daily & weekly remaining hours (avoiding overallocation).
 * 3. Workload balancing across the fleet.
 */
export function findOptimalSlotForTask(
  task: ScheduledTaskItem,
  technicians: TechnicianScheduleProfile[],
  weekDays: WeekDayInfo[],
  currentTasks: ScheduledTaskItem[]
): {
  techId: string;
  techName: string;
  dateStr: string;
  dayName: string;
  timeWindow: string;
  confidenceScore: number;
  reason: string;
} | null {
  const candidateSlots: {
    tech: TechnicianScheduleProfile;
    day: WeekDayInfo;
    remaining: number;
    score: number;
    reason: string;
  }[] = [];

  for (const tech of technicians) {
    const qualCheck = checkSaqccQualificationMatch(tech.saqccLevel, task.requiredSaqccLevel);
    const techRank = SAQCC_RANKS[tech.saqccLevel] || 1;
    const reqRank = SAQCC_RANKS[task.requiredSaqccLevel] || 2;

    for (const day of weekDays) {
      if (day.isWeekend && !tech.customAvailability?.[day.dateStr]) continue;

      const daySched = calculateTechnicianDaySchedule(tech, day, currentTasks);
      
      // Do not suggest days where tech is completely on leave
      if (daySched.availabilityStatus === 'on_leave') continue;

      // Check if task fits in remaining hours
      if (daySched.remainingHours >= task.estimatedHours) {
        let score = 50;

        // Reward SAQCC match
        if (techRank === reqRank) score += 30; // Perfect match
        else if (techRank > reqRank) score += 20; // Qualified higher
        else if (!qualCheck.isCompliant) score -= 40; // Underqualified

        // Reward remaining capacity buffer
        score += Math.min(20, Math.round((daySched.remainingHours - task.estimatedHours) * 4));

        candidateSlots.push({
          tech,
          day,
          remaining: daySched.remainingHours,
          score,
          reason: qualCheck.isCompliant
            ? `Optimal capacity (${daySched.remainingHours}h open) and SAQCC ${tech.saqccLevel} certified.`
            : `Available capacity, but requires Level 3/4 co-signature.`
        });
      }
    }
  }

  if (candidateSlots.length === 0) return null;

  candidateSlots.sort((a, b) => b.score - a.score);
  const best = candidateSlots[0];

  const suggestedTime = task.estimatedHours <= 3.5 ? '08:30 - 12:00' : '08:30 - 16:00';

  return {
    techId: best.tech.id,
    techName: best.tech.name,
    dateStr: best.day.dateStr,
    dayName: best.day.dayName,
    timeWindow: suggestedTime,
    confidenceScore: Math.min(99, Math.max(60, best.score)),
    reason: best.reason
  };
}

/**
 * Formats a clean CSV export string of the current weekly schedule.
 */
export function exportWeeklyRosterCSV(
  summaries: TechnicianWeeklySummary[],
  weekRangeLabel: string
): string {
  const headers = [
    'Technician Name',
    'SAQCC Number',
    'SAQCC Qualification Level',
    'Date',
    'Day',
    'Availability Status',
    'Daily Max Hours',
    'Booked Hours',
    'Remaining Hours',
    'Overallocated',
    'Task Ref',
    'Task Title',
    'Site Name',
    'SANS Clause',
    'Priority',
    'Time Window',
    'Task Hours'
  ];

  const rows: string[] = [];

  summaries.forEach(s => {
    s.days.forEach(d => {
      if (d.tasks.length === 0) {
        rows.push([
          `"${s.technician.name}"`,
          `"${s.technician.saqccNumber}"`,
          `"${s.technician.saqccLevel}"`,
          `"${d.dateStr}"`,
          `"${d.dayName}"`,
          `"${d.availabilityStatus}"`,
          `"${d.maxHours}"`,
          `"${d.bookedHours}"`,
          `"${d.remainingHours}"`,
          `"${d.isOverallocated ? 'YES' : 'NO'}"`,
          `"NO TASKS"`,
          `"Unallocated / Available"`,
          `"-"`,
          `"-"`,
          `"-"`,
          `"-"`,
          `"0"`
        ].join(','));
      } else {
        d.tasks.forEach(t => {
          rows.push([
            `"${s.technician.name}"`,
            `"${s.technician.saqccNumber}"`,
            `"${s.technician.saqccLevel}"`,
            `"${d.dateStr}"`,
            `"${d.dayName}"`,
            `"${d.availabilityStatus}"`,
            `"${d.maxHours}"`,
            `"${d.bookedHours}"`,
            `"${d.remainingHours}"`,
            `"${d.isOverallocated ? 'YES' : 'NO'}"`,
            `"${t.referenceCode}"`,
            `"${t.title.replace(/"/g, '""')}"`,
            `"${t.siteName.replace(/"/g, '""')}"`,
            `"${t.sansClause.replace(/"/g, '""')}"`,
            `"${t.priority.toUpperCase()}"`,
            `"${t.scheduledTimeWindow}"`,
            `"${t.estimatedHours}"`
          ].join(','));
        });
      }
    });
  });

  return `# AUDRIN FIRE ENGINEERS - SANS 10139 TECHNICIAN ROSTER\n# Week: ${weekRangeLabel}\n# Generated: ${new Date().toISOString()}\n\n` + [headers.join(','), ...rows].join('\n');
}

/**
 * Formats a single task's iCalendar (.ics) string.
 */
export function buildTaskICalString(task: ScheduledTaskItem): string {
  if (!task.scheduledDate) return '';

  const dateParts = task.scheduledDate.split('-');
  const y = dateParts[0];
  const m = dateParts[1];
  const d = dateParts[2];

  // Parse time window if possible
  const startTimeMatch = task.scheduledTimeWindow.match(/(\d{1,2}):(\d{2})/);
  const startH = startTimeMatch ? startTimeMatch[1].padStart(2, '0') : '09';
  const startM = startTimeMatch ? startTimeMatch[2] : '00';

  const dtStart = `${y}${m}${d}T${startH}${startM}00`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Audrin Fire Engineers//SANS 10139 Dispatch Engine//EN
BEGIN:VEVENT
UID:${task.id}-${task.scheduledDate}@audrinfire.co.za
DTSTAMP:${dtStamp}
DTSTART;TZID=Africa/Johannesburg:${dtStart}
SUMMARY:${task.title} [${task.referenceCode}]
DESCRIPTION:SANS 10139 Statutory Compliance Task\\nStandard: ${task.sansClause}\\nSite: ${task.siteName}\\nClient: ${task.clientOrganisation}\\nRequired SAQCC: ${task.requiredSaqccLevel}\\nPriority: ${task.priority.toUpperCase()}\\nAssigned Technician: ${task.assignedTechnicianName || 'Unassigned'}
LOCATION:${task.streetAddress || task.siteName}, ${task.city}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}
