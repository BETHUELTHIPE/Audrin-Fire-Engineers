import {
  PushNotificationItem,
  PushNotificationPreferences,
  PushNotificationSeverity,
  PushNotificationType,
  NotificationTargetRole,
  PushNotificationSimulationScenario,
  ComplianceInspection,
  ServiceRequest
} from '../types';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'afe_push_notifications_history_v1',
  PREFERENCES: 'afe_push_notification_preferences_v1',
  DISPATCH_DEDUP_CACHE: 'afe_push_dedup_cache_v1'
};

export const DEFAULT_NOTIFICATION_PREFERENCES: PushNotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  urgentDispatches: true,
  maintenanceDeadlines: true,
  cocSignatures: true,
  sansLifecycleAlerts: true,
  reportAndEvidenceAlerts: true,
  backgroundPollingIntervalMinutes: 0.5, // 30 seconds
  userRoleScope: 'all',
  desktopStickyBanner: true
};

export const INITIAL_SIMULATION_SCENARIOS: PushNotificationSimulationScenario[] = [
  {
    id: 'sim_urgent_dispatch_01',
    label: '🚨 Urgent Technician Dispatch (2-Hour SLA)',
    category: 'technician',
    title: '🚨 URGENT FIELD DISPATCH | SANS 10139 SLA',
    body: 'Immediate attendance dispatched: Zone 4 Earth Fault & Panel Power Failure at Tshwane Logistics Park. Tech: Thabo Mokoena (SAQCC #48291).',
    type: 'urgent_dispatch',
    severity: 'critical',
    targetRole: 'technician',
    siteName: 'Tshwane Logistics Park - Central Depot',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    standardClause: 'SANS 10139:2012 Clause 25.1 / Emergency SLA',
    slaDeadline: '2 Hours (Critical Life Safety)',
    technicianName: 'Thabo Mokoena',
    actionLabel: 'View Dispatch Details',
    actionView: 'customer-portal'
  },
  {
    id: 'sim_maintenance_deadline_02',
    label: '⏰ 24-Hour Maintenance Deadline (Quarterly Test)',
    category: 'client',
    title: '⏰ 24H STATUTORY DEADLINE | Clause 25.3',
    body: 'Quarterly Periodic Test due in 24 hours at Sandton Financial Plaza. 100% quarterly rotation audit scheduled.',
    type: 'maintenance_deadline',
    severity: 'high',
    targetRole: 'client',
    siteName: 'Sandton Financial Plaza - Tower 1',
    serviceRequestRef: 'AFE-REQ-2026-0742',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    slaDeadline: 'Tomorrow at 09:00 SAST',
    technicianName: 'Sipho Ndlovu',
    actionLabel: 'View Inspection Schedule',
    actionView: 'customer-portal'
  },
  {
    id: 'sim_coc_signature_03',
    label: '✍️ Statutory CoC Digital Sign-off Required',
    category: 'client',
    title: '✍️ STATUTORY SIGN-OFF REQUIRED | CoC Approval',
    body: 'Certificate of Compliance #COC-SANS10139-2026-0891-A requires Client Responsible Person signature for legal insurance validity.',
    type: 'coc_action',
    severity: 'high',
    targetRole: 'client',
    siteName: 'Tshwane Logistics Park - Central Depot',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    standardClause: 'SANS 10139:2012 Clause 26 & SANS 10400-T',
    slaDeadline: 'Action Required',
    actionLabel: 'Open CoC Signature Pad',
    actionView: 'customer-portal'
  },
  {
    id: 'sim_sans_lifecycle_04',
    label: '🔋 SANS 10139 5-Year Battery Lifecycle Horizon',
    category: 'statutory',
    title: '🔋 5-YEAR COMPONENT LIFECYCLE | Battery Horizon',
    body: 'Cape Town Gateway Logistics standby sealed lead-acid batteries reach 5-year maximum operating life under SANS 10139 Clause 25.5.3.',
    type: 'sans_lifecycle',
    severity: 'medium',
    targetRole: 'client',
    siteName: 'Cape Town Gateway Logistics Hub',
    standardClause: 'SANS 10139:2012 Clause 25.5.3',
    slaDeadline: 'Replace Before 2026-10-15',
    actionLabel: 'View Compliance Timeline',
    actionView: 'customer-portal'
  },
  {
    id: 'sim_report_ready_05',
    label: '📋 Pre-Work Condition Report Verified & Issued',
    category: 'client',
    title: '📋 CONDITION REPORT READY | AFE-REP-PRE-2026-0104',
    body: 'Pre-work evidence report verified by Lead Fire Systems Engineer (Pr.Eng). Photographic findings available in vault.',
    type: 'report_ready',
    severity: 'info',
    targetRole: 'client',
    siteName: 'Tshwane Logistics Park - Central Depot',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    actionLabel: 'Inspect Evidence Report',
    actionView: 'customer-portal'
  },
  {
    id: 'sim_false_alarm_06',
    label: '⚠️ False Alarm Rate Threshold Exceeded',
    category: 'admin',
    title: '⚠️ FALSE ALARM RATE THRESHOLD | Clause 24',
    body: '3 unverified detector trips recorded in 14 days at Centurion Industrial Center. Mandatory engineering investigation initiated.',
    type: 'system_alert',
    severity: 'high',
    targetRole: 'admin',
    siteName: 'Centurion Industrial Center',
    standardClause: 'SANS 10139:2012 Clause 24 (False Alarms)',
    slaDeadline: 'Investigate within 48h',
    actionLabel: 'Open Operations CMS',
    actionView: 'admin-portal'
  }
];

export const INITIAL_PUSH_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif_init_01',
    title: '🚨 URGENT FIELD DISPATCH | SANS 10139 SLA',
    body: 'Immediate attendance dispatched: Zone 4 Earth Fault & Panel Power Failure at Tshwane Logistics Park. Tech: Thabo Mokoena (SAQCC #48291).',
    type: 'urgent_dispatch',
    severity: 'critical',
    targetRole: 'all',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    isRead: false,
    siteName: 'Tshwane Logistics Park - Central Depot',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    standardClause: 'SANS 10139:2012 Clause 25.1',
    slaDeadline: '2h Emergency Response',
    technicianName: 'Thabo Mokoena',
    technicianSaqcc: 'SAQCC-48291-L3',
    actionUrl: 'customer-portal',
    actionLabel: 'View Dispatch',
    isDeliveredViaSW: true,
    audioChimePlayed: true
  },
  {
    id: 'notif_init_02',
    title: '⏰ 24H STATUTORY DEADLINE | Clause 25.3',
    body: 'Quarterly Periodic Test due in 24 hours at Sandton Financial Plaza. 100% quarterly rotation audit scheduled.',
    type: 'maintenance_deadline',
    severity: 'high',
    targetRole: 'all',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
    siteName: 'Sandton Financial Plaza - Tower 1',
    serviceRequestRef: 'AFE-REQ-2026-0742',
    inspectionId: 'insp-002',
    standardClause: 'SANS 10139:2012 Clause 25.3',
    slaDeadline: 'Tomorrow 09:00 SAST',
    technicianName: 'Sipho Ndlovu',
    technicianSaqcc: 'SAQCC-39182-L3',
    actionUrl: 'customer-portal',
    actionLabel: 'View Calendar',
    isDeliveredViaSW: true,
    audioChimePlayed: true
  },
  {
    id: 'notif_init_03',
    title: '✍️ STATUTORY SIGN-OFF REQUIRED | CoC Approval',
    body: 'Certificate of Compliance #COC-SANS10139-2026-0891-A requires Client Responsible Person signature for legal insurance validity.',
    type: 'coc_action',
    severity: 'high',
    targetRole: 'client',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: true,
    siteName: 'Tshwane Logistics Park - Central Depot',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    cocWorkflowId: 'coc-req-001',
    standardClause: 'SANS 10139:2012 Clause 26',
    actionUrl: 'customer-portal',
    actionLabel: 'Sign Certificate',
    isDeliveredViaSW: true,
    audioChimePlayed: true
  },
  {
    id: 'notif_init_04',
    title: '🔋 5-YEAR COMPONENT LIFECYCLE | Battery Horizon',
    body: 'Cape Town Gateway Logistics standby sealed lead-acid batteries reach 5-year maximum operating life under SANS 10139 Clause 25.5.3.',
    type: 'sans_lifecycle',
    severity: 'medium',
    targetRole: 'all',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    siteName: 'Cape Town Gateway Logistics Hub',
    standardClause: 'SANS 10139:2012 Clause 25.5.3',
    slaDeadline: 'Replace Before 2026-10-15',
    actionUrl: 'customer-portal',
    actionLabel: 'Timeline Details',
    isDeliveredViaSW: false,
    audioChimePlayed: false
  }
];

// ============================================================================
// WEB AUDIO SYNTHESIZER (Acoustic Chime & Emergency Alert Beacons)
// Zero external files, zero latency, runs across all modern browsers
// ============================================================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a synthesized audio chime according to notification urgency
 */
export function playNotificationSound(severity: PushNotificationSeverity = 'high'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (severity === 'critical') {
      // Urgent Emergency Dual-Pulse Fire Alarm Beacon (880Hz -> 1760Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Pulse 1
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      // Pulse 2
      osc1.frequency.setValueAtTime(880, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.32);
      osc2.frequency.setValueAtTime(440, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.32);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.20);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else if (severity === 'high') {
      // High-Priority Maintenance Chime (Two-tone rising chord 587Hz -> 880Hz)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } else {
      // Gentle Info Ping (523Hz C5)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.warn('[PushNotificationService] Web Audio synthesis error (non-fatal):', err);
  }
}

// ============================================================================
// PERMISSION & BROWSER CAPABILITY DETECTION
// ============================================================================

export type PushPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

export function getBrowserNotificationPermission(): PushPermissionStatus {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission as PushPermissionStatus;
}

export async function requestBrowserNotificationPermission(): Promise<PushPermissionStatus> {
  if (!isPushNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    return permission as PushPermissionStatus;
  } catch (error) {
    console.error('[PushNotificationService] Error requesting permission:', error);
    return Notification.permission as PushPermissionStatus;
  }
}

// ============================================================================
// SERVICE WORKER & SYSTEM NOTIFICATION DISPATCHER
// ============================================================================

export interface DispatchNotificationOptions {
  title: string;
  body: string;
  type?: PushNotificationType;
  severity?: PushNotificationSeverity;
  targetRole?: NotificationTargetRole;
  siteName?: string;
  serviceRequestId?: string;
  serviceRequestRef?: string;
  inspectionId?: string;
  cocWorkflowId?: string;
  standardClause?: string;
  slaDeadline?: string;
  technicianName?: string;
  actionUrl?: string;
  actionLabel?: string;
  silent?: boolean;
}

/**
 * Dispatches a native browser push notification via ServiceWorker registration or Notification API,
 * plays an urgency chime, triggers device vibration, and returns a recorded PushNotificationItem.
 */
export async function dispatchPushNotification(
  options: DispatchNotificationOptions,
  preferences?: PushNotificationPreferences
): Promise<PushNotificationItem> {
  const prefs = preferences || loadPushNotificationPreferences();
  const severity = options.severity || 'high';
  const type = options.type || 'urgent_dispatch';

  const notificationItem: PushNotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: options.title,
    body: options.body,
    type,
    severity,
    targetRole: options.targetRole || 'all',
    timestamp: new Date().toISOString(),
    isRead: false,
    siteName: options.siteName,
    serviceRequestId: options.serviceRequestId,
    serviceRequestRef: options.serviceRequestRef,
    inspectionId: options.inspectionId,
    cocWorkflowId: options.cocWorkflowId,
    standardClause: options.standardClause,
    slaDeadline: options.slaDeadline,
    technicianName: options.technicianName,
    actionUrl: options.actionUrl || 'customer-portal',
    actionLabel: options.actionLabel || 'View Details',
    isDeliveredViaSW: false,
    audioChimePlayed: false,
    actions: [
      { action: 'view_details', title: options.actionLabel || '🔍 View Details' },
      { action: 'acknowledge', title: '✅ Acknowledge' }
    ]
  };

  // Play audio chime if sound preference is enabled and not explicitly muted
  if (prefs.soundEnabled && !options.silent) {
    playNotificationSound(severity);
    notificationItem.audioChimePlayed = true;
  }

  // Device vibration pattern for mobile / supporting devices
  if (prefs.vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (severity === 'critical') {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } else if (severity === 'high') {
        navigator.vibrate([150, 75, 150]);
      } else {
        navigator.vibrate([80]);
      }
    } catch {
      // Ignore vibration error
    }
  }

  // Check browser notification permission
  if (isPushNotificationSupported() && Notification.permission === 'granted' && prefs.enabled) {
    const notificationPayload: NotificationOptions = {
      body: options.body,
      icon: '/pwa-192x192.png',
      badge: '/apple-touch-icon.png',
      tag: `afe-${type}-${notificationItem.id}`,
      requireInteraction: severity === 'critical' || severity === 'high',
      data: {
        id: notificationItem.id,
        actionUrl: notificationItem.actionUrl,
        serviceRequestRef: notificationItem.serviceRequestRef,
        siteName: notificationItem.siteName,
        timestamp: notificationItem.timestamp
      }
    };

    // Try service worker registration first (background reliable)
    let delivered = false;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(options.title, notificationPayload);
          notificationItem.isDeliveredViaSW = true;
          delivered = true;
        }
      } catch (swErr) {
        console.warn('[PushNotificationService] ServiceWorker showNotification fallback:', swErr);
      }
    }

    // Fallback to Window Notification API if SW not active
    if (!delivered) {
      try {
        const nativeNotif = new Notification(options.title, notificationPayload);
        nativeNotif.onclick = () => {
          window.focus();
          nativeNotif.close();
        };
      } catch (notifErr) {
        console.warn('[PushNotificationService] Window Notification error:', notifErr);
      }
    }
  }

  // Save to persistent notification history
  appendNotificationToHistory(notificationItem);

  return notificationItem;
}

// ============================================================================
// STORAGE & LOCAL PERSISTENCE HELPERS
// ============================================================================

export function loadPushNotificationHistory(): PushNotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_PUSH_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[PushNotificationService] Failed to load notifications history:', err);
  }
  return INITIAL_PUSH_NOTIFICATIONS;
}

export function savePushNotificationHistory(notifications: PushNotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications.slice(0, 100)));
  } catch (err) {
    console.error('[PushNotificationService] Failed to save notifications history:', err);
  }
}

export function appendNotificationToHistory(item: PushNotificationItem): void {
  const current = loadPushNotificationHistory();
  // Filter out any duplicate id
  const updated = [item, ...current.filter((n) => n.id !== item.id)].slice(0, 100);
  savePushNotificationHistory(updated);
}

export function loadPushNotificationPreferences(): PushNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('[PushNotificationService] Failed to load preferences:', err);
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function savePushNotificationPreferences(prefs: PushNotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.error('[PushNotificationService] Failed to save preferences:', err);
  }
}

// ============================================================================
// BACKGROUND DEADLINE & ASSIGNMENT MONITOR (Smart Watchdog)
// Evaluates inspection dates, overdue SLAs, and urgent assignments
// ============================================================================

function getDedupCache(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.DISPATCH_DEDUP_CACHE);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function setDedupCache(cache: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.DISPATCH_DEDUP_CACHE, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

/**
 * Checks for urgent inspection assignments, upcoming 24h maintenance deadlines,
 * and pending CoC signatures. Avoids duplicate notifications within 30 minutes.
 */
export async function evaluateSystemDeadlinesAndAssignments(
  inspections: ComplianceInspection[],
  requests: ServiceRequest[],
  preferences: PushNotificationPreferences,
  onNotificationDelivered?: (item: PushNotificationItem) => void
): Promise<PushNotificationItem[]> {
  if (!preferences.enabled) return [];

  const dedupCache = getDedupCache();
  const now = Date.now();
  const DEDUP_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
  const generatedNotifs: PushNotificationItem[] = [];

  // 1. Check for Urgent Emergency Requests requiring immediate technician dispatch
  if (preferences.urgentDispatches) {
    const urgentRequests = requests.filter(
      (r) =>
        r.urgency === 'urgent_emergency' &&
        (r.status === 'Submitted' || r.status === 'Under review' || r.status === 'Work scheduled')
    );

    for (const req of urgentRequests) {
      const dedupKey = `req_urgent_${req.id}`;
      const lastDispatched = dedupCache[dedupKey] || 0;

      if (now - lastDispatched > DEDUP_COOLDOWN_MS) {
        const notif = await dispatchPushNotification(
          {
            title: '🚨 URGENT FIELD DISPATCH | SANS 10139 SLA',
            body: `Emergency Fault: ${req.serviceTitle} at ${req.siteName}. Priority Response Required.`,
            type: 'urgent_dispatch',
            severity: 'critical',
            targetRole: 'technician',
            siteName: req.siteName,
            serviceRequestId: req.id,
            serviceRequestRef: req.referenceNumber,
            standardClause: 'SANS 10139:2012 Clause 25.1',
            slaDeadline: '2h Emergency SLA',
            actionUrl: 'customer-portal',
            actionLabel: 'View Emergency Request'
          },
          preferences
        );

        dedupCache[dedupKey] = now;
        generatedNotifs.push(notif);
        if (onNotificationDelivered) onNotificationDelivered(notif);
      }
    }
  }

  // 2. Check for upcoming / due / overdue inspections (within 24 hours or overdue)
  if (preferences.maintenanceDeadlines) {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const imminentInspections = inspections.filter(
      (insp) =>
        insp.status !== 'completed' &&
        insp.status !== 'rescheduled' &&
        (insp.scheduledDate === todayStr || insp.scheduledDate === tomorrowStr || insp.status === 'overdue' || insp.status === 'due_soon')
    );

    for (const insp of imminentInspections) {
      const dedupKey = `insp_deadline_${insp.id}`;
      const lastDispatched = dedupCache[dedupKey] || 0;

      if (now - lastDispatched > DEDUP_COOLDOWN_MS) {
        const isOverdue = insp.status === 'overdue';
        const notif = await dispatchPushNotification(
          {
            title: isOverdue ? '⚠️ OVERDUE STATUTORY INSPECTION' : '⏰ 24H MAINTENANCE DEADLINE',
            body: `${insp.title} at ${insp.siteName} (${insp.scheduledDate}). Assigned Tech: ${insp.assignedTechnicianName}.`,
            type: 'maintenance_deadline',
            severity: isOverdue ? 'critical' : 'high',
            targetRole: 'client',
            siteName: insp.siteName,
            inspectionId: insp.id,
            standardClause: insp.standardClause,
            technicianName: insp.assignedTechnicianName,
            slaDeadline: `${insp.scheduledDate} (${insp.scheduledTimeWindow})`,
            actionUrl: 'customer-portal',
            actionLabel: 'View Inspection'
          },
          preferences
        );

        dedupCache[dedupKey] = now;
        generatedNotifs.push(notif);
        if (onNotificationDelivered) onNotificationDelivered(notif);
      }
    }
  }

  setDedupCache(dedupCache);
  return generatedNotifs;
}
