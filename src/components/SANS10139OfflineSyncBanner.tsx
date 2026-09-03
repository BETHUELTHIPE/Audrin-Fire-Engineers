import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  Upload,
  Radio,
  FileCheck2,
  X,
  PlusCircle,
  Eye,
  Info
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { offlineSyncService, SANS10139InspectionEntry } from '../services/offlineSyncService';
import { PWAInstallButton } from './PWAInstallButton';

export const SANS10139OfflineSyncBanner: React.FC = () => {
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [queue, setQueue] = useState<SANS10139InspectionEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SANS10139InspectionEntry | null>(null);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // Quick field log form state
  const [quickSite, setQuickSite] = useState('Sandton City Commercial Complex');
  const [quickMcp, setQuickMcp] = useState('MCP-FL04-ZONE2 (4th Floor Server Stairwell)');
  const [quickClause, setQuickClause] = useState('Clause 25.2 - Weekly Routine Test');
  const [quickAudibility, setQuickAudibility] = useState('passed');
  const [quickNotes, setQuickNotes] = useState('');

  const refreshQueue = () => {
    setQueue(offlineSyncService.getQueue());
  };

  useEffect(() => {
    refreshQueue();

    const handleQueueUpdated = () => {
      refreshQueue();
    };

    const handleSyncCompleted = (e: any) => {
      const syncedCount = e?.detail?.synced?.length || 0;
      setSyncToast({
        message: `Successfully synced ${syncedCount} SANS 10139 logbook inspection(s) to cloud register!`,
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 5000);
      refreshQueue();
    };

    window.addEventListener('sans10139-queue-updated', handleQueueUpdated);
    window.addEventListener('sans10139-sync-completed', handleSyncCompleted);

    return () => {
      window.removeEventListener('sans10139-queue-updated', handleQueueUpdated);
      window.removeEventListener('sans10139-sync-completed', handleSyncCompleted);
    };
  }, []);

  const pendingCount = queue.filter(
    item => item.syncStatus === 'cached_offline' || item.syncStatus === 'failed'
  ).length;

  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncToast({
        message: 'Cannot sync while offline. Please connect to internet or disable offline simulation.',
        type: 'error'
      });
      setTimeout(() => setSyncToast(null), 4000);
      return;
    }

    if (pendingCount === 0) {
      setSyncToast({
        message: 'All SANS 10139 inspection logs are already synchronized with cloud register.',
        type: 'info'
      });
      setTimeout(() => setSyncToast(null), 3500);
      return;
    }

    setIsSyncing(true);
    try {
      const result = await offlineSyncService.syncAllPending(isOnline);
      setSyncToast({
        message: `Synced ${result.successCount} field logbook record(s) with official SAQCC compliance register.`,
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 5000);
    } catch (err: any) {
      setSyncToast({
        message: err.message || 'Sync failed. Please try again.',
        type: 'error'
      });
      setTimeout(() => setSyncToast(null), 5000);
    } finally {
      setIsSyncing(false);
      refreshQueue();
    }
  };

  const handleExportBundle = () => {
    const jsonStr = offlineSyncService.exportQueueBundle();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SANS-10139-Offline-Logbook-Bundle-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    offlineSyncService.addToQueue({
      standardClause: quickClause,
      formTemplateId: 'sans-10139-form-1',
      formNumber: 'SANS 10139 - Form 1',
      title: 'Responsible Person Weekly Routine Test & Inspection Logsheet',
      siteId: 'site-quick-field',
      siteName: quickSite,
      buildingAddress: 'On-Site Inspection Premise',
      systemCategory: 'Category L1 (Total Life Safety)',
      panelMakeModel: 'Analogue Addressable CIE',
      technicianName: 'Field Service Technician',
      saqccNumber: 'SAQCC-FIELD-TECH',
      responsiblePersonName: 'Site Safety Officer',
      inspectionDate: new Date().toISOString().split('T')[0],
      data: {
        tested_mcp_id: quickMcp,
        alarm_audibility_verified: quickAudibility,
        defects_recorded: quickNotes || 'Normal routine check recorded on-site without signal.'
      },
      defectCount: quickAudibility === 'passed' ? 0 : 1,
      hasCriticalFault: false,
      notes: quickNotes
    });

    setIsQuickLogOpen(false);
    setQuickNotes('');
    setSyncToast({
      message: 'Inspection logged to local SANS 10139 offline cache. Will auto-sync when connection is restored.',
      type: 'info'
    });
    setTimeout(() => setSyncToast(null), 4000);
  };

  return (
    <>
      {/* Toast Notification for Sync Events */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-short">
          <div
            className={`flex items-start gap-3 p-3.5 rounded-lg shadow-xl border text-sm ${
              syncToast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/60 text-emerald-300'
                : syncToast.type === 'error'
                ? 'bg-slate-900 border-red-500/60 text-red-300'
                : 'bg-slate-900 border-blue-500/60 text-blue-300'
            }`}
          >
            {syncToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : syncToast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{syncToast.message}</p>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Sticky Top Banner for SANS 10139 Service Worker & Offline Sync Mode */}
      <div
        id="sans-10139-offline-banner"
        className={`w-full py-1.5 px-4 text-xs font-mono transition-colors border-b z-40 ${
          !isOnline
            ? 'bg-amber-950/90 text-amber-200 border-amber-800/80 shadow-md'
            : pendingCount > 0
            ? 'bg-slate-900 text-slate-200 border-amber-700/50'
            : 'bg-[#081729] text-slate-300 border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Online/Offline Status Indicator */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isOnline
                    ? 'bg-amber-500 animate-pulse'
                    : pendingCount > 0
                    ? 'bg-blue-400'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-bold tracking-tight">
                {!isOnline ? (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    SANS 10139 FIELD OFFLINE MODE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    SANS 10139 CLOUD SYNC ACTIVE
                  </span>
                )}
              </span>
            </div>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <span className="text-slate-400 text-[11px] hidden md:inline">
              {!isOnline
                ? 'On-site inspections will be cached locally and auto-synced upon reconnect.'
                : 'Service Worker caching active for plant rooms & basement inspections.'}
            </span>

            {/* Pending items pill */}
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px] font-bold">
                <Clock className="w-3 h-3 text-amber-400" />
                {pendingCount} Cached Pending Sync
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Sync Now Button */}
            <button
              id="sans-10139-sync-now-btn"
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline || pendingCount === 0}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold transition-all cursor-pointer ${
                pendingCount > 0 && isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50 cursor-not-allowed'
              }`}
              title={
                !isOnline
                  ? 'Offline: Reconnect to synchronize with cloud'
                  : pendingCount === 0
                  ? 'Queue is empty'
                  : 'Synchronize cached on-site inspection data with cloud repository'
              }
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {/* Queue & Field Tools Button */}
            <button
              id="sans-10139-view-queue-btn"
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-sm text-[11px] font-medium transition-all cursor-pointer"
            >
              <Database className="w-3 h-3 text-[#FFB703]" />
              <span>Inspection Queue ({queue.length})</span>
            </button>

            {/* Quick Field Log */}
            <button
              id="sans-10139-quick-log-btn"
              type="button"
              onClick={() => setIsQuickLogOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CC0000] hover:bg-red-700 text-white rounded-sm text-[11px] font-bold transition-all cursor-pointer"
              title="Quickly record SANS 10139 field test while on-site"
            >
              <PlusCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Quick Field Log</span>
              <span className="sm:hidden">Log</span>
            </button>

            {/* Offline Simulation Toggle for Field Testing */}
            <button
              id="sans-10139-simulate-offline-btn"
              type="button"
              onClick={() => toggleSimulatedOffline()}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-semibold border transition-all cursor-pointer ${
                isSimulatedOffline
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle simulated offline mode to test basement & no-signal field workflows"
            >
              <Radio className="w-3 h-3" />
              <span>{isSimulatedOffline ? 'Resume Online' : 'Simulate Offline'}</span>
            </button>

            {/* PWA Install Button Header Variant */}
            <PWAInstallButton className="hidden lg:inline-flex" />
          </div>
        </div>
      </div>

      {/* MODAL 1: SANS 10139 Offline Inspection Queue & Sync Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0A192F] border border-slate-700 flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#FFB703]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    SANS 10139 Offline Inspection Queue
                    <span className="text-xs bg-[#CC0000]/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono">
                      Service Worker Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Technician on-site inspection cache, offline cryptographic hashes, and automatic cloud reconciliation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Network & Service Worker Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Connection State</span>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5">
                    {isOnline ? (
                      <span className="text-emerald-400">Connected to Cloud</span>
                    ) : (
                      <span className="text-amber-400">Offline Field Mode</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isSimulatedOffline
                      ? 'Simulated offline drill enabled for field testing.'
                      : isOnline
                      ? 'Direct sync enabled with SAQCC registry.'
                      : 'No internet connection detected on-site.'}
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Pending Sync Queue</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {pendingCount}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      of {queue.length} total cached
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Automatic sync triggers instantly when network is restored.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Field Compliance</span>
                    <FileCheck2 className="w-4 h-4 text-[#FFB703]" />
                  </div>
                  <div className="text-base font-bold text-white">SANS 10139 & 322</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Complies with SANS 10139 Clause 25.2, Clause 5, Clause 24.
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing || !isOnline || pendingCount === 0}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-md transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All Pending ({pendingCount})</span>
                  </button>
                  <button
                    onClick={() => setIsQuickLogOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white text-xs font-bold rounded-md transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Quick On-Site Log</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBundle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-all cursor-pointer"
                    title="Export offline backup bundle as JSON for statutory records"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Bundle</span>
                  </button>
                  <button
                    onClick={() => offlineSyncService.clearQueue()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-xs rounded-md border border-slate-700 transition-all cursor-pointer"
                    title="Clear cached queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Queue List Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cached Field Inspection Records ({queue.length})
                </h4>

                {queue.length === 0 ? (
                  <div className="p-8 text-center bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="text-sm font-semibold text-slate-300">
                      No inspection logs currently in offline queue.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      When technicians fill inspection forms while on-site without signal, they appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {queue.map((item) => (
                      <div
                        key={item.localQueueId}
                        className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-lg p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{item.formNumber}</span>
                            <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-xs font-mono">
                              {item.standardClause}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.syncStatus === 'synced'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : item.syncStatus === 'syncing'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800 animate-pulse'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {item.syncStatus === 'synced'
                                ? '✓ Synced with Cloud'
                                : item.syncStatus === 'syncing'
                                ? 'Syncing...'
                                : 'Cached Offline (Pending)'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-semibold">
                            {item.siteName}
                          </div>

                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              <strong>Tech:</strong> {item.technicianName}
                            </span>
                            <span>•</span>
                            <span>
                              <strong>Device/MCP:</strong>{' '}
                              {item.data?.tested_mcp_id || item.data?.device_loop_address || 'Routine CIE Check'}
                            </span>
                            <span>•</span>
                            <span>
                              <strong>Cached:</strong>{' '}
                              {new Date(item.cachedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedEntry(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-md font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => offlineSyncService.removeFromQueue(item.localQueueId)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-md transition-colors"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800/80 border-t border-slate-700 text-xs text-slate-400">
              <span>Audrin Fire Engineers • SANS 10139 Compliance Engine</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Item Detail Inspector */}
      {selectedEntry && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div>
                <h3 className="text-base font-bold text-white">{selectedEntry.title}</h3>
                <p className="text-xs text-slate-400">{selectedEntry.standardClause}</p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 font-mono">
                <div>
                  <span className="text-slate-500">Record ID:</span>
                  <div className="text-white font-bold">{selectedEntry.id}</div>
                </div>
                <div>
                  <span className="text-slate-500">Offline Hash:</span>
                  <div className="text-amber-400 truncate">{selectedEntry.offlineHash}</div>
                </div>
                <div>
                  <span className="text-slate-500">Site Name:</span>
                  <div className="text-white">{selectedEntry.siteName}</div>
                </div>
                <div>
                  <span className="text-slate-500">System Category:</span>
                  <div className="text-white">{selectedEntry.systemCategory}</div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-300 mb-2">Captured Inspection Form Data:</h5>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-md text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedEntry.data, null, 2)}
                </pre>
              </div>

              {selectedEntry.notes && (
                <div className="p-3 bg-slate-800/40 rounded-md border border-slate-700">
                  <span className="text-slate-400 font-bold block mb-1">Technician Field Notes:</span>
                  <p className="text-slate-200">{selectedEntry.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-3 bg-slate-800 border-t border-slate-700">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Field Log Entry Dialog */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#CC0000]" />
                <h3 className="text-base font-bold text-white">Quick SANS 10139 Field Log</h3>
              </div>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Premise / Commercial Facility
                </label>
                <input
                  type="text"
                  value={quickSite}
                  onChange={(e) => setQuickSite(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  SANS 10139 Standard Section
                </label>
                <select
                  value={quickClause}
                  onChange={(e) => setQuickClause(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-hidden"
                >
                  <option value="Clause 25.2 - Weekly Routine Test">
                    Clause 25.2 - Weekly Routine Call Point & Panel Test
                  </option>
                  <option value="Clause 5 - Unwanted Fire Signal Investigation">
                    Clause 5 - Unwanted Fire Signal (UwFS / False Alarm)
                  </option>
                  <option value="Clause 25.3 - Quarterly Engineering Servicing">
                    Clause 25.3 - Quarterly Battery & Circuit Servicing
                  </option>
                  <option value="Clause 24 - Form T1 Handover Sign-off">
                    Clause 24 - Handover & Commissioning Verification
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Manual Call Point (MCP) / Device ID
                </label>
                <input
                  type="text"
                  value={quickMcp}
                  onChange={(e) => setQuickMcp(e.target.value)}
                  placeholder="e.g. MCP-FL03-ZONE2 (East Stairwell Unit)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Audibility & CIE Response
                </label>
                <select
                  value={quickAudibility}
                  onChange={(e) => setQuickAudibility(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-hidden"
                >
                  <option value="passed">Pass: Clear audibility (≥ 65 dB(A)) & Panel registered alarm &lt; 3 sec</option>
                  <option value="low_audibility">Warning: Sounder volume muffled in sub-corridor</option>
                  <option value="defect_found">Defect: Call point glass cracked or yellow fault light</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Technician Field Notes / Observations
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Optional field notes recorded while in basement/plant room..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-red-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#CC0000] hover:bg-red-700 text-white font-bold rounded-md shadow-sm"
                >
                  Save to Offline Cache
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
