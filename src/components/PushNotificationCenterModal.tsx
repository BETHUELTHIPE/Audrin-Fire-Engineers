import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Radio,
  Flame,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  Send,
  Sliders,
  History,
  BookOpen,
  Smartphone,
  ExternalLink,
  Trash2,
  Play,
  RotateCw,
  Info,
  Layers,
  Timer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  INITIAL_SIMULATION_SCENARIOS,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '../services/pushNotificationService';
import {
  PushNotificationSeverity,
  PushNotificationType,
  NotificationTargetRole,
  PushNotificationItem
} from '../types';

export const PushNotificationCenterModal: React.FC = () => {
  const {
    isPushCenterOpen,
    setIsPushCenterOpen,
    pushPermission,
    pushNotifications,
    pushPreferences,
    unreadPushCount,
    requestPushPermission,
    triggerPushSimulation,
    sendPushAlert,
    markPushAsRead,
    markAllPushAsRead,
    clearPushNotification,
    clearAllPushNotifications,
    updatePushPreferences,
    testSoundChime,
    setActiveView,
    setSelectedRequestId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'simulation' | 'history' | 'preferences' | 'standards'>('simulation');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Background 5-second countdown test state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownScenarioId, setCountdownScenarioId] = useState<string | null>(null);

  // Custom Push Form State
  const [customTitle, setCustomTitle] = useState('🚨 EMERGENCY EARTH FAULT DISPATCH');
  const [customBody, setCustomBody] = useState('Critical short-circuit reported on Loop 2 Zone 1. Tech SAQCC #48291 dispatched.');
  const [customType, setCustomType] = useState<PushNotificationType>('urgent_dispatch');
  const [customSeverity, setCustomSeverity] = useState<PushNotificationSeverity>('critical');
  const [customTargetRole, setCustomTargetRole] = useState<NotificationTargetRole>('all');
  const [customSite, setCustomSite] = useState('Tshwane Logistics Park - Central Depot');
  const [isSendingCustom, setIsSendingCustom] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPushCenterOpen) {
        setIsPushCenterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPushCenterOpen, setIsPushCenterOpen]);

  // Handle countdown timer for background test
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Trigger notification now!
      if (countdownScenarioId) {
        triggerPushSimulation(countdownScenarioId);
      } else {
        triggerPushSimulation('sim_urgent_dispatch_01');
      }
      setCountdown(null);
      setCountdownScenarioId(null);
    }
  }, [countdown, countdownScenarioId, triggerPushSimulation]);

  if (!isPushCenterOpen) return null;

  const startBackgroundTest = (scenarioId: string = 'sim_urgent_dispatch_01') => {
    setCountdownScenarioId(scenarioId);
    setCountdown(5);
  };

  const handleSendCustomAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;

    setIsSendingCustom(true);
    try {
      await sendPushAlert({
        title: customTitle,
        body: customBody,
        type: customType,
        severity: customSeverity,
        targetRole: customTargetRole,
        siteName: customSite,
        actionUrl: 'customer-portal',
        actionLabel: 'View Alert Action'
      });
    } finally {
      setIsSendingCustom(false);
    }
  };

  // Filter notifications list
  const filteredNotifications = pushNotifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterSeverity !== 'all' && n.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.siteName && n.siteName.toLowerCase().includes(q)) ||
        (n.serviceRequestRef && n.serviceRequestRef.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      id="push-notification-center-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#0A192F] border border-blue-900/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] border-b border-blue-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CC0000]/20 border border-[#CC0000]/50 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-[#FFB703] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Push Notification & SLA Alert Control Center
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-[#FFB703] border border-amber-500/30">
                  SANS 10139 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browser Push Dispatcher for Urgent Technician Assignments & 24h Statutory Maintenance Deadlines
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-push-center-modal-btn"
            onClick={() => setIsPushCenterOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Service Worker & Permission Status Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Permission status chip */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Browser Permission:</span>
              {pushPermission === 'granted' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Granted (Active)
                </span>
              ) : pushPermission === 'denied' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Denied / Blocked
                </span>
              ) : (
                <button
                  type="button"
                  id="grant-permission-pill-btn"
                  onClick={requestPushPermission}
                  className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 hover:bg-amber-900 px-2 py-0.5 rounded-xs transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#FFB703] animate-bounce" />
                  Request Permission
                </button>
              )}
            </div>

            {/* Service Worker status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PWA Service Worker:</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Background Push Active
              </span>
            </div>

            {/* Audio chime status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Acoustic Chime:</span>
              <button
                type="button"
                id="test-chime-pill-btn"
                onClick={() => testSoundChime('critical')}
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-xs cursor-pointer transition-colors"
                title="Play test audio chime"
              >
                <Volume2 className="w-3 h-3 text-[#FFB703]" />
                <span>Test Chime</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Unread Alerts:</span>
            <span className="font-mono font-bold text-white bg-[#CC0000] px-2 py-0.5 rounded-full text-[11px]">
              {unreadPushCount}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-blue-900/60 bg-[#0A192F] px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            id="tab-btn-simulation"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeTab === 'simulation'
                ? 'bg-[#112240] text-[#FFB703] border-[#FFB703]'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Simulation & Trigger Matrix</span>
          </button>

          <button
            type="button"
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeTab === 'history'
                ? 'bg-[#112240] text-[#FFB703] border-[#FFB703]'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Log & History ({pushNotifications.length})</span>
          </button>

          <button
            type="button"
            id="tab-btn-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeTab === 'preferences'
                ? 'bg-[#112240] text-[#FFB703] border-[#FFB703]'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Role & Alert Preferences</span>
          </button>

          <button
            type="button"
            id="tab-btn-standards"
            onClick={() => setActiveTab('standards')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeTab === 'standards'
                ? 'bg-[#112240] text-[#FFB703] border-[#FFB703]'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>SANS 10139 Statutory SLAs</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A192F]">
          {/* TAB 1: SIMULATION & TRIGGER MATRIX */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {/* Background Countdown Verification Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border border-blue-700/50 rounded-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-[#FFB703]" />
                      <h4 className="text-sm font-bold text-white">
                        Test Background Push Notification (5s Countdown)
                      </h4>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-2 py-0.2 rounded-full font-mono">
                        Multi-Tab / Background Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Click the button below to start a 5-second countdown. You can immediately switch to another browser tab or minimize the window to experience the real OS push notification delivered when the app is in the background!
                    </p>
                  </div>

                  {countdown !== null ? (
                    <div className="flex items-center gap-3 bg-red-950/90 border border-red-600 px-4 py-2 rounded-lg text-white font-mono text-center animate-pulse shrink-0">
                      <span className="text-xl font-extrabold text-[#FFB703]">{countdown}s</span>
                      <span className="text-xs text-red-200">Switch tabs or minimize now!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="start-background-countdown-test-btn"
                      onClick={() => startBackgroundTest('sim_urgent_dispatch_01')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start 5s Background Test</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Statutory Scenario Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FFB703]" />
                    <span>Statutory Inspection & Dispatch Scenarios</span>
                  </h3>
                  <span className="text-xs text-slate-400">Click any card to fire instant push alert</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {INITIAL_SIMULATION_SCENARIOS.map((scenario) => {
                    const isCritical = scenario.severity === 'critical';
                    const isHigh = scenario.severity === 'high';
                    return (
                      <div
                        key={scenario.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isCritical
                            ? 'bg-red-950/20 border-red-900/60 hover:border-red-500/80 hover:bg-red-950/30'
                            : isHigh
                            ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-500/80 hover:bg-amber-950/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-xs border ${
                                isCritical
                                  ? 'bg-red-950 text-red-300 border-red-800'
                                  : isHigh
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-blue-950 text-blue-300 border-blue-800'
                              }`}
                            >
                              {scenario.category} • {scenario.severity}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {scenario.targetRole.toUpperCase()}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug mb-1.5">
                            {scenario.label}
                          </h4>

                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 mb-3">
                            {scenario.body}
                          </p>

                          <div className="space-y-1 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
                            {scenario.standardClause && (
                              <div className="flex items-center gap-1 text-slate-300">
                                <span className="text-slate-500">Ref:</span>
                                <span className="truncate">{scenario.standardClause}</span>
                              </div>
                            )}
                            {scenario.slaDeadline && (
                              <div className="flex items-center gap-1 text-amber-300">
                                <span className="text-slate-500">SLA:</span>
                                <span>{scenario.slaDeadline}</span>
                              </div>
                            )}
                            {scenario.technicianName && (
                              <div className="flex items-center gap-1 text-blue-300">
                                <span className="text-slate-500">Tech:</span>
                                <span>{scenario.technicianName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => triggerPushSimulation(scenario.id)}
                            className="flex-1 py-1.5 px-3 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Trigger Push</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startBackgroundTest(scenario.id)}
                            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors text-[11px] font-medium cursor-pointer"
                            title="Test with 5s background delay"
                          >
                            5s Delay
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Push Dispatcher Form */}
              <div className="p-4 sm:p-5 bg-[#112240]/60 border border-blue-900/60 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#FFB703]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Custom Dispatch Push Alert Composer
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Broadcast to technicians or client managers</span>
                </div>

                <form onSubmit={handleSendCustomAlert} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Alert Category / Type
                      </label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as PushNotificationType)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none"
                      >
                        <option value="urgent_dispatch">🚨 Urgent Emergency Dispatch</option>
                        <option value="maintenance_deadline">⏰ Maintenance Deadline</option>
                        <option value="coc_action">✍️ CoC Digital Sign-Off</option>
                        <option value="sans_lifecycle">🔋 5-Year Lifecycle Horizon</option>
                        <option value="report_ready">📋 Condition Report Ready</option>
                        <option value="system_alert">⚠️ System / Fault Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Severity Level
                      </label>
                      <select
                        value={customSeverity}
                        onChange={(e) => setCustomSeverity(e.target.value as PushNotificationSeverity)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none"
                      >
                        <option value="critical">Critical (Fire Alarm Dual Beacon)</option>
                        <option value="high">High (24h Maintenance Chime)</option>
                        <option value="medium">Medium (Standard Acoustic)</option>
                        <option value="info">Info (Gentle Ping)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Target Role
                      </label>
                      <select
                        value={customTargetRole}
                        onChange={(e) => setCustomTargetRole(e.target.value as NotificationTargetRole)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none"
                      >
                        <option value="all">All Roles (Broadcast)</option>
                        <option value="technician">Field Technicians (SAQCC)</option>
                        <option value="client">Client Responsible Persons</option>
                        <option value="admin">Operations Dispatchers</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Alert Title
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. 🚨 URGENT FIELD DISPATCH"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Client Site / Facility
                      </label>
                      <input
                        type="text"
                        value={customSite}
                        onChange={(e) => setCustomSite(e.target.value)}
                        placeholder="e.g. Tshwane Logistics Park"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Notification Message Body
                    </label>
                    <textarea
                      rows={2}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Enter emergency or maintenance notification details..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      id="submit-custom-push-alert-btn"
                      disabled={isSendingCustom}
                      className="px-5 py-2 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingCustom ? 'Dispatching...' : 'Dispatch Custom Push Alert'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOG & NOTIFICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Controls & Filter Bar */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search alerts by site, reference, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white focus:ring-1 focus:ring-[#FFB703] outline-none w-full md:w-64"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="urgent_dispatch">Urgent Dispatches</option>
                    <option value="maintenance_deadline">Maintenance Deadlines</option>
                    <option value="coc_action">CoC Signatures</option>
                    <option value="sans_lifecycle">5-Year Lifecycles</option>
                    <option value="report_ready">Condition Reports</option>
                  </select>

                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white outline-none"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="info">Info</option>
                  </select>

                  <button
                    type="button"
                    onClick={markAllPushAsRead}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer transition-colors"
                  >
                    Mark All Read
                  </button>

                  <button
                    type="button"
                    onClick={clearAllPushNotifications}
                    className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-md text-xs font-medium cursor-pointer transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              {/* Notifications Table / Cards */}
              <div className="space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-200">No Notifications Match Filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or trigger a simulation scenario.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isCritical = notif.severity === 'critical';
                    const isHigh = notif.severity === 'high';

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-xl border transition-all ${
                          !notif.isRead
                            ? 'bg-blue-950/40 border-blue-700/60'
                            : 'bg-slate-900/60 border-slate-800/70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-xs border font-bold ${
                                isCritical
                                  ? 'bg-red-950 text-red-300 border-red-800'
                                  : isHigh
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-blue-950 text-blue-300 border-blue-800'
                              }`}
                            >
                              {notif.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Target: {notif.targetRole.toUpperCase()}
                            </span>
                            {notif.isDeliveredViaSW && (
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded-xs">
                                SW Delivered
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4
                              onClick={() => {
                                markPushAsRead(notif.id);
                                if (notif.serviceRequestId) setSelectedRequestId(notif.serviceRequestId);
                                if (notif.actionUrl) setActiveView(notif.actionUrl);
                                setIsPushCenterOpen(false);
                              }}
                              className={`text-sm font-bold cursor-pointer hover:text-amber-300 transition-colors ${
                                !notif.isRead ? 'text-white' : 'text-slate-200'
                              }`}
                            >
                              {notif.title}
                            </h4>

                            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                              {notif.body}
                            </p>

                            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 flex-wrap">
                              {notif.siteName && <span>📍 {notif.siteName}</span>}
                              {notif.serviceRequestRef && (
                                <span className="font-mono text-amber-400">Ref: {notif.serviceRequestRef}</span>
                              )}
                              {notif.standardClause && (
                                <span className="font-mono text-slate-400">Clause: {notif.standardClause}</span>
                              )}
                              {notif.slaDeadline && (
                                <span className="text-red-300 font-mono">SLA: {notif.slaDeadline}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                markPushAsRead(notif.id);
                                if (notif.serviceRequestId) setSelectedRequestId(notif.serviceRequestId);
                                if (notif.actionUrl) setActiveView(notif.actionUrl);
                                setIsPushCenterOpen(false);
                              }}
                              className="px-3 py-1.5 bg-[#FFB703] hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>{notif.actionLabel || 'View'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => clearPushNotification(notif.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ROLE & ALERT PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FFB703]" />
                  <span>General Delivery Settings</span>
                </h4>

                <div className="space-y-3">
                  {/* Master Push Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Enable Browser Push Notifications</div>
                      <div className="text-[11px] text-slate-400">
                        Receive real-time alerts even when the browser tab is hidden or running in the background.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushPreferences.enabled}
                      onChange={(e) => updatePushPreferences({ enabled: e.target.checked })}
                      className="w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000] cursor-pointer"
                    />
                  </div>

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-amber-500/20 flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Acoustic Urgency Chimes (Web Audio)</div>
                        <div className="text-[11px] text-slate-400">
                          Play synthesized dual-tone acoustic beacons for critical emergency dispatches.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => testSoundChime('critical')}
                        className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        Sample Beacon
                      </button>
                      <input
                        type="checkbox"
                        checked={pushPreferences.soundEnabled}
                        onChange={(e) => updatePushPreferences({ soundEnabled: e.target.checked })}
                        className="w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Vibration Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Device Haptic Vibration</div>
                        <div className="text-[11px] text-slate-400">
                          Vibrate mobile devices according to emergency urgency patterns.
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushPreferences.vibrateEnabled}
                      onChange={(e) => updatePushPreferences({ vibrateEnabled: e.target.checked })}
                      className="w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Alert Categories */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  SANS 10139 Category Filtering
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushPreferences.urgentDispatches}
                      onChange={(e) => updatePushPreferences({ urgentDispatches: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">🚨 Urgent Emergency SLA Dispatches</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        2-Hour life safety critical faults and panel shutdowns under Clause 25.1.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushPreferences.maintenanceDeadlines}
                      onChange={(e) => updatePushPreferences({ maintenanceDeadlines: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">⏰ 24H Maintenance Deadlines</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Quarterly periodic tests and 100% device rotation audits under Clause 25.3.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushPreferences.cocSignatures}
                      onChange={(e) => updatePushPreferences({ cocSignatures: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">✍️ CoC Digital Sign-offs</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Responsible Person & Pr.Eng legal Certificate approvals.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushPreferences.sansLifecycleAlerts}
                      onChange={(e) => updatePushPreferences({ sansLifecycleAlerts: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-[#CC0000] rounded-xs accent-[#CC0000]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">🔋 5-Year Battery Lifecycles</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Component end-of-life replacement warnings under Clause 25.5.3.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Background Watchdog Interval */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Background Sync & SLA Polling Interval
                </h4>

                <div className="flex items-center gap-4 flex-wrap">
                  {[0.5, 1, 5, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updatePushPreferences({ backgroundPollingIntervalMinutes: mins })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        pushPreferences.backgroundPollingIntervalMinutes === mins
                          ? 'bg-[#CC0000] text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mins === 0.5 ? '30 Seconds (High Precision)' : `${mins} Minutes`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The background watchdog automatically scans active inspection schedules and emergency service requests to deliver instant push notifications before statutory deadlines lapse.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SANS 10139 STATUTORY SLAs */}
          {activeTab === 'standards' && (
            <div className="space-y-6 max-w-4xl text-slate-300">
              <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#FFB703]" />
                  <span>SANS 10139 South African National Standard Statutory Response Framework</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fire detection and fire alarm systems for buildings in South Africa are governed strictly by SANS 10139 (2012 edition) and SANS 10400 Part T. The Audrin Fire push notification system enforces these statutory timelines:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 border border-red-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-red-400">Clause 25.1</span>
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                      2-Hour Emergency SLA
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">Emergency Fault & Fire Signal Attendance</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Where a system disablement, power supply failure, or continuous alarm fault affects more than one zone or life-safety egress, a SAQCC-registered competent person must arrive on-site within 2 hours.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 border border-amber-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-amber-400">Clause 25.3</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                      Quarterly Periodic Inspection
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">Quarterly Servicing & 100% Device Rotation</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every 3 months, all control panels, power supplies, sounder circuits, and a minimum rotational sample of detectors must be physically tested. Over the annual cycle, 100% of all devices must be verified.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 border border-blue-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-400">Clause 25.5.3</span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-bold">
                      5-Year Component Lifecycle
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">Standby Battery & Detector Lifespan</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sealed lead-acid standby batteries must be replaced within 5 years or sooner if autonomy capacity drops below statutory standby duration (24h/48h plus 30min alarm). Optical smoke detectors must undergo recalibration.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 border border-emerald-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-emerald-400">Clause 26</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Certificate of Compliance
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">Dual Digital Sign-off & Verification</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A Certificate of Compliance (CoC) is legally binding upon co-signature by both the certified Fire Systems Technician (SAQCC 1475/Fire Detection) and the building's designated Responsible Person.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Audrin Fire PWA Background Service Worker Active</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPushCenterOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Control Center
          </button>
        </div>
      </div>
    </div>
  );
};
