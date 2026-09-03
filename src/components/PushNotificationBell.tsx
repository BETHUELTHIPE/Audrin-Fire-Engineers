import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  FileCheck2,
  BatteryCharging,
  Settings,
  ExternalLink,
  Trash2,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PushNotificationItem, PushNotificationSeverity } from '../types';

interface PushNotificationBellProps {
  className?: string;
}

export const PushNotificationBell: React.FC<PushNotificationBellProps> = ({ className = '' }) => {
  const {
    pushPermission,
    pushNotifications,
    pushPreferences,
    unreadPushCount,
    requestPushPermission,
    triggerPushSimulation,
    markPushAsRead,
    markAllPushAsRead,
    clearPushNotification,
    setIsPushCenterOpen,
    setActiveView,
    setSelectedRequestId,
    updatePushPreferences
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getSeverityBadge = (severity: PushNotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          icon: <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
        };
      case 'high':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        };
      case 'medium':
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          icon: <BatteryCharging className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          icon: <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        };
    }
  };

  const handleNotificationClick = (notif: PushNotificationItem) => {
    markPushAsRead(notif.id);
    if (notif.serviceRequestId) {
      setSelectedRequestId(notif.serviceRequestId);
    }
    if (notif.actionUrl) {
      setActiveView(notif.actionUrl);
    }
    setIsOpen(false);
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="push-notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#CC0000]/50"
        title="Field Dispatches & SANS 10139 Compliance Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge count with pulsing effect if unread */}
        {unreadPushCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-[#CC0000] text-[10px] font-extrabold text-white shadow-xs border border-white/20 animate-pulse">
            {unreadPushCount > 9 ? '9+' : unreadPushCount}
          </span>
        )}
      </button>

      {/* Dropdown Tray */}
      {isOpen && (
        <div
          id="push-notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0A192F] border border-blue-900/60 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200 divide-y divide-slate-800/70 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#0A192F] to-[#112240] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#CC0000]/20 border border-[#CC0000]/40 flex items-center justify-center">
                <Radio className="w-3.5 h-3.5 text-[#FFB703] animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  Live Dispatch & SLA Alerts
                </h3>
                <p className="text-[10px] text-slate-400">SANS 10139 Background Monitor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                id="toggle-sound-btn"
                onClick={() => updatePushPreferences({ soundEnabled: !pushPreferences.soundEnabled })}
                className="p-1 text-slate-400 hover:text-amber-400 rounded-xs transition-colors"
                title={pushPreferences.soundEnabled ? 'Mute alert chimes' : 'Enable alert chimes'}
              >
                {pushPreferences.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              <button
                type="button"
                id="open-push-control-center-btn"
                onClick={() => {
                  setIsOpen(false);
                  setIsPushCenterOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-xs transition-colors"
                title="Open Push Control Center & Simulation Matrix"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Permission Prompt if default */}
          {pushPermission === 'default' && (
            <div className="p-2.5 bg-amber-950/40 border-b border-amber-800/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] leading-tight">Enable browser alerts for urgent technician dispatches.</span>
              </div>
              <button
                type="button"
                id="grant-permission-banner-btn"
                onClick={requestPushPermission}
                className="px-2 py-1 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-[10px] rounded-xs shrink-0 cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Quick Simulation Trigger Bar */}
          <div className="p-2 bg-slate-900/60 flex items-center justify-between gap-1 text-[10px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] px-1">
              Test Triggers:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="quick-sim-dispatch-btn"
                onClick={() => triggerPushSimulation('sim_urgent_dispatch_01')}
                className="px-2 py-0.5 rounded-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 font-semibold cursor-pointer transition-colors"
                title="Simulate 2h Emergency Technician Dispatch"
              >
                🚨 Urgent SLA
              </button>
              <button
                type="button"
                id="quick-sim-deadline-btn"
                onClick={() => triggerPushSimulation('sim_maintenance_deadline_02')}
                className="px-2 py-0.5 rounded-xs bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/60 font-semibold cursor-pointer transition-colors"
                title="Simulate 24h Maintenance Deadline"
              >
                ⏰ 24h Test
              </button>
              <button
                type="button"
                id="quick-sim-coc-btn"
                onClick={() => triggerPushSimulation('sim_coc_signature_03')}
                className="px-2 py-0.5 rounded-xs bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/60 font-semibold cursor-pointer transition-colors"
                title="Simulate CoC Signature Sign-off"
              >
                ✍️ CoC Sign
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
            {pushNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-300">All Systems Compliant</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No pending urgent dispatches or SLA deadlines.</p>
              </div>
            ) : (
              pushNotifications.slice(0, 8).map((notif) => {
                const badge = getSeverityBadge(notif.severity);
                return (
                  <div
                    key={notif.id}
                    className={`p-3 transition-colors hover:bg-slate-800/40 relative group ${
                      !notif.isRead ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-xs border font-bold ${badge.bg}`}
                          >
                            {notif.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                        </div>

                        <h4
                          onClick={() => handleNotificationClick(notif)}
                          className={`text-xs font-semibold leading-tight cursor-pointer hover:text-amber-300 transition-colors ${
                            !notif.isRead ? 'text-white font-bold' : 'text-slate-300'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>

                        {/* Metadata Tag */}
                        {notif.siteName && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <span className="truncate">📍 {notif.siteName}</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800/40">
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(notif)}
                            className="text-[10px] font-bold text-[#FFB703] hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{notif.actionLabel || 'View Details'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>

                          <div className="flex items-center gap-2">
                            {!notif.isRead && (
                              <button
                                type="button"
                                onClick={() => markPushAsRead(notif.id)}
                                className="text-[9px] text-slate-400 hover:text-white cursor-pointer"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => clearPushNotification(notif.id)}
                              className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-900/90 flex items-center justify-between text-xs">
            <button
              type="button"
              id="mark-all-read-btn"
              onClick={markAllPushAsRead}
              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Mark all as read
            </button>
            <button
              type="button"
              id="view-all-alerts-center-btn"
              onClick={() => {
                setIsOpen(false);
                setIsPushCenterOpen(true);
              }}
              className="text-[11px] font-bold text-[#FFB703] hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Control Center</span>
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
