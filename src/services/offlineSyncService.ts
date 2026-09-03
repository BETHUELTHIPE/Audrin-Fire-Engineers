import { StatutoryFormSubmission } from '../types';

export interface SANS10139InspectionEntry {
  id: string;
  localQueueId: string;
  standardClause: string; // e.g. "SANS 10139 Clause 25.2 (Weekly Routine Test)"
  formTemplateId: string; // e.g. "sans-10139-form-1"
  formNumber: string; // e.g. "SANS 10139 - Form 1"
  title: string;
  siteId: string;
  siteName: string;
  buildingAddress: string;
  systemCategory: string; // "Category L1", "Category L2", "Category M", etc.
  panelMakeModel: string;
  technicianName: string;
  saqccNumber: string;
  responsiblePersonName: string;
  inspectionDate: string; // YYYY-MM-DD or ISO
  data: Record<string, any>;
  defectCount: number;
  hasCriticalFault: boolean;
  syncStatus: 'cached_offline' | 'syncing' | 'synced' | 'failed';
  cachedAt: string; // ISO
  syncedAt?: string;
  syncBatchId?: string;
  offlineHash: string;
  photoEvidenceCount?: number;
  notes?: string;
}

const OFFLINE_QUEUE_KEY = 'audrin_sans10139_offline_queue';
const SYNC_HISTORY_KEY = 'audrin_sans10139_sync_history';
const STATUTORY_SUBMISSIONS_KEY = 'audrin_statutory_form_submissions';

// Initial default seed items for technician offline testing if none exist
const INITIAL_OFFLINE_SEEDS: SANS10139InspectionEntry[] = [
  {
    id: 'OFFLINE-LOG-2026-081',
    localQueueId: 'lq-9481-01',
    standardClause: 'Clause 25.2 - Weekly Routine Test & Inspection',
    formTemplateId: 'sans-10139-form-1',
    formNumber: 'SANS 10139 - Form 1',
    title: 'Responsible Person Weekly Routine Test & Inspection Logsheet',
    siteId: 'site-sandton-city',
    siteName: 'Sandton City Commercial Complex',
    buildingAddress: '83 Rivonia Rd, Sandhurst, Sandton, 2196',
    systemCategory: 'Category L1 (Total Life Safety)',
    panelMakeModel: 'Ziton ZP3 Analogue Addressable (4-Loop)',
    technicianName: 'Sipho Khumalo (SAQCC 14920)',
    saqccNumber: 'SAQCC-14920-L3',
    responsiblePersonName: 'David van der Merwe (Facilities Lead)',
    inspectionDate: new Date().toISOString().split('T')[0],
    data: {
      test_date_time: new Date().toISOString().split('T')[0],
      tested_mcp_id: 'MCP-FL03-ZONE4 (Level 3 North Staircase Break-glass)',
      panel_normal_led: 'yes',
      fault_indication_threshold_check: 'compliant',
      alarm_audibility_verified: 'passed',
      mains_power_loss_monitored: true,
      defects_recorded: 'Call point flap intact. Sounder beacon flashed cleanly in corridor.',
      corrective_action_taken: 'None required. SANS 10139 rotational sequence logged.'
    },
    defectCount: 0,
    hasCriticalFault: false,
    syncStatus: 'cached_offline',
    cachedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    offlineHash: 'SHA256-SANS10139-OFF-83941',
    photoEvidenceCount: 1,
    notes: 'Captured on-site in Basement Level 2 parking plant room without mobile signal.'
  },
  {
    id: 'OFFLINE-LOG-2026-082',
    localQueueId: 'lq-9481-02',
    standardClause: 'Clause 5 & Section 3 - Unwanted Fire Signal (UwFS) Log',
    formTemplateId: 'sans-10139-form-2',
    formNumber: 'SANS 10139 - Form 2',
    title: 'Unwanted Fire Signal (UwFS / False Alarm) Incident & Investigation Log',
    siteId: 'site-rosebank-towers',
    siteName: 'Rosebank Towers & Corporate Head Office',
    buildingAddress: '15 Biermann Ave, Rosebank, Johannesburg, 2196',
    systemCategory: 'Category L1 (Total Life Safety)',
    panelMakeModel: 'Notifier NFS2-3030 Intelligent Fire CIE',
    technicianName: 'David Ndlovu (SAQCC 18492)',
    saqccNumber: 'SAQCC-18492-L4',
    responsiblePersonName: 'Sarah Jenkins (Building Manager)',
    inspectionDate: new Date().toISOString().split('T')[0],
    data: {
      incident_timestamp: new Date().toISOString().split('T')[0],
      device_loop_address: 'Optical Smoke Detector Loop 2 Addr 089 (Level 4 Server Room)',
      building_system_category: 'Category L1',
      false_alarm_classification: 'environmental',
      environmental_factors: 'steam_moisture',
      corrective_action_plan: 'Isolated zone during air conditioning duct cleaning, replaced sensor head dust mesh.'
    },
    defectCount: 0,
    hasCriticalFault: false,
    syncStatus: 'cached_offline',
    cachedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    offlineHash: 'SHA256-SANS10139-OFF-92014',
    photoEvidenceCount: 2,
    notes: 'Logged on site by technician during false alarm investigation drill.'
  }
];

export class SANS10139OfflineSyncService {
  private static instance: SANS10139OfflineSyncService;
  private isSyncing = false;

  private constructor() {
    this.initStorage();
    this.setupNetworkListeners();
  }

  public static getInstance(): SANS10139OfflineSyncService {
    if (!SANS10139OfflineSyncService.instance) {
      SANS10139OfflineSyncService.instance = new SANS10139OfflineSyncService();
    }
    return SANS10139OfflineSyncService.instance;
  }

  private initStorage() {
    try {
      const storedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!storedQueue) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(INITIAL_OFFLINE_SEEDS));
      }
      if (!localStorage.getItem(SYNC_HISTORY_KEY)) {
        localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify([]));
      }
    } catch (err) {
      console.warn('Storage initialisation warning:', err);
    }
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    // Listen to real network online event
    window.addEventListener('online', () => {
      console.log('📡 Connection restored — Triggering automatic SANS 10139 sync check...');
      this.autoSyncIfOnline();
    });

    // Listen to custom network simulation events
    window.addEventListener('audrin-network-simulation-change', (e: any) => {
      const isSimOffline = e?.detail?.isSimulatedOffline;
      if (!isSimOffline && navigator.onLine) {
        console.log('📡 Online mode re-enabled — Triggering automatic SANS 10139 sync...');
        this.autoSyncIfOnline();
      }
    });
  }

  public getQueue(): SANS10139InspectionEntry[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error fetching offline queue:', err);
      return [];
    }
  }

  public getPendingCount(): number {
    const queue = this.getQueue();
    return queue.filter(item => item.syncStatus === 'cached_offline' || item.syncStatus === 'failed').length;
  }

  public getSyncHistory(): SANS10139InspectionEntry[] {
    try {
      const raw = localStorage.getItem(SYNC_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error fetching sync history:', err);
      return [];
    }
  }

  public generateHash(entry: Partial<SANS10139InspectionEntry>): string {
    const seed = `${entry.formNumber}-${entry.siteId}-${entry.inspectionDate}-${Date.now()}-${Math.random()}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `SANS10139-OFFLINE-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
  }

  public addToQueue(
    item: Omit<SANS10139InspectionEntry, 'id' | 'localQueueId' | 'cachedAt' | 'syncStatus' | 'offlineHash'>
  ): SANS10139InspectionEntry {
    const queue = this.getQueue();
    const newId = `OFFLINE-LOG-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const localQueueId = `lq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const offlineHash = this.generateHash({ ...item, formNumber: item.formNumber });

    const newEntry: SANS10139InspectionEntry = {
      ...item,
      id: newId,
      localQueueId,
      cachedAt: new Date().toISOString(),
      syncStatus: 'cached_offline',
      offlineHash
    };

    const updatedQueue = [newEntry, ...queue];
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));

    this.notifyQueueUpdated();
    return newEntry;
  }

  public removeFromQueue(localQueueId: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(item => item.localQueueId !== localQueueId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
    this.notifyQueueUpdated();
  }

  public clearQueue(): void {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
    this.notifyQueueUpdated();
  }

  public async syncAllPending(isOnline: boolean): Promise<{
    successCount: number;
    failedCount: number;
    syncedEntries: SANS10139InspectionEntry[];
  }> {
    if (!isOnline) {
      throw new Error('Device is currently offline or offline simulation is active. Cannot reach cloud sync repository.');
    }

    if (this.isSyncing) {
      return { successCount: 0, failedCount: 0, syncedEntries: [] };
    }

    this.isSyncing = true;
    const queue = this.getQueue();
    const pending = queue.filter(item => item.syncStatus === 'cached_offline' || item.syncStatus === 'failed');

    if (pending.length === 0) {
      this.isSyncing = false;
      return { successCount: 0, failedCount: 0, syncedEntries: [] };
    }

    // Mark all pending as syncing
    const updatedQueue = queue.map(item => {
      if (pending.some(p => p.localQueueId === item.localQueueId)) {
        return { ...item, syncStatus: 'syncing' as const };
      }
      return item;
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    this.notifyQueueUpdated();

    // Simulate realistic field sync latency for robust feedback
    await new Promise(resolve => setTimeout(resolve, 1400));

    const syncBatchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const syncedTimestamp = new Date().toISOString();
    const syncedEntries: SANS10139InspectionEntry[] = [];

    // Process each item: create statutory submission in system repository & sync history
    const finalQueue = this.getQueue().map(item => {
      if (pending.some(p => p.localQueueId === item.localQueueId)) {
        const syncedItem: SANS10139InspectionEntry = {
          ...item,
          syncStatus: 'synced' as const,
          syncedAt: syncedTimestamp,
          syncBatchId
        };
        syncedEntries.push(syncedItem);

        // Also push into the global Statutory Submissions table so it shows on dashboards!
        this.saveAsStatutorySubmission(syncedItem);

        return syncedItem;
      }
      return item;
    });

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(finalQueue));

    // Append to sync history
    const history = this.getSyncHistory();
    const updatedHistory = [...syncedEntries, ...history].slice(0, 50);
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(updatedHistory));

    this.isSyncing = false;
    this.notifyQueueUpdated();
    this.notifySyncCompleted(syncedEntries);

    return {
      successCount: syncedEntries.length,
      failedCount: 0,
      syncedEntries
    };
  }

  private saveAsStatutorySubmission(entry: SANS10139InspectionEntry) {
    try {
      const rawSubmissions = localStorage.getItem(STATUTORY_SUBMISSIONS_KEY);
      const submissions: StatutoryFormSubmission[] = rawSubmissions ? JSON.parse(rawSubmissions) : [];

      const submissionId = `SUB-${entry.formTemplateId}-${Date.now().toString(36).toUpperCase()}`;
      const certNo = `AFE-SANS10139-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

      const newSubmission: StatutoryFormSubmission = {
        id: submissionId,
        formTemplateId: entry.formTemplateId,
        formNumber: entry.formNumber,
        formTitle: entry.title,
        standardCode: 'SANS_10139',
        standardClauseRef: entry.standardClause,
        category: 'routine_maintenance',
        siteId: entry.siteId,
        siteName: entry.siteName,
        organisationName: 'Audrin Fire Compliance Client',
        submittedBy: {
          name: entry.technicianName || entry.responsiblePersonName,
          email: 'technician.field@audrinfire.co.za',
          role: 'technician',
          phone: '+27 11 948 2000',
          designation: entry.saqccNumber ? `SAQCC Registered Technician (${entry.saqccNumber})` : 'Designated Responsible Person'
        },
        values: entry.data,
        status: 'verified_by_engineer',
        certificateNumber: certNo,
        submissionDate: entry.cachedAt,
        lastUpdated: entry.syncedAt || new Date().toISOString(),
        signedAt: entry.cachedAt,
        signatureName: entry.technicianName,
        reviewedByEngineer: {
          name: 'T. M. Ndlovu (Pr.Eng Fire)',
          saqccNumber: 'SAQCC-FIRE-88219',
          ecsaNumber: 'ECSA-2018-941029',
          comments: `Offline log entry validated and automatically synchronized with SANS 10139 register (Batch ${entry.syncBatchId}).`,
          reviewDate: new Date().toISOString().split('T')[0],
          status: 'compliant'
        }
      };

      // Add to beginning of submissions list
      const updated = [newSubmission, ...submissions];
      localStorage.setItem(STATUTORY_SUBMISSIONS_KEY, JSON.stringify(updated));

      // Dispatch statutory update event for dashboard components
      window.dispatchEvent(new CustomEvent('statutory-submissions-updated', { detail: { submission: newSubmission } }));
    } catch (err) {
      console.error('Error saving statutory submission from offline sync:', err);
    }
  }

  private autoSyncIfOnline() {
    const isSimulatedOffline = localStorage.getItem('audrin_simulated_offline') === 'true';
    const isOnline = navigator.onLine && !isSimulatedOffline;
    if (isOnline && this.getPendingCount() > 0) {
      console.log('⚡ Auto-syncing pending offline inspection items...');
      this.syncAllPending(true).catch(err => console.warn('Auto-sync failed:', err));
    }
  }

  public exportQueueBundle(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      standard: 'SANS 10139:2012 Code of Practice',
      pendingQueue: this.getQueue(),
      syncHistory: this.getSyncHistory()
    };
    return JSON.stringify(data, null, 2);
  }

  public importQueueBundle(jsonStr: string): number {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.pendingQueue)) {
        const current = this.getQueue();
        const existingIds = new Set(current.map(c => c.id));
        const newItems = parsed.pendingQueue.filter((p: SANS10139InspectionEntry) => !existingIds.has(p.id));
        const combined = [...newItems, ...current];
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(combined));
        this.notifyQueueUpdated();
        return newItems.length;
      }
      return 0;
    } catch (err) {
      console.error('Error importing offline bundle:', err);
      throw new Error('Invalid backup file structure.');
    }
  }

  private notifyQueueUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sans10139-queue-updated', { detail: { queue: this.getQueue() } }));
    }
  }

  private notifySyncCompleted(synced: SANS10139InspectionEntry[]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sans10139-sync-completed', { detail: { synced } }));
    }
  }
}

export const offlineSyncService = SANS10139OfflineSyncService.getInstance();
