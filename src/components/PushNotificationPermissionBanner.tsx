import React from 'react';
import { Bell, Radio, ShieldCheck, ShieldAlert, Settings, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PushNotificationPermissionBannerProps {
  className?: string;
}

export const PushNotificationPermissionBanner: React.FC<PushNotificationPermissionBannerProps> = ({
  className = ''
}) => {
  const {
    pushPermission,
    requestPushPermission,
    setIsPushCenterOpen,
    unreadPushCount,
    triggerPushSimulation
  } = useApp();

  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  if (pushPermission === 'granted') {
    return null; // Don't take up space if already granted unless user opens center
  }

  return (
    <div
      id="push-permission-cta-banner"
      className={`p-3.5 bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] border border-blue-800/60 rounded-xl text-slate-200 shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#CC0000]/20 border border-[#CC0000]/40 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#FFB703] animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Enable SANS 10139 Browser Push Notifications</span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded-xs font-mono">
                Urgent SLAs
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Get instant alerts for emergency technician dispatches (2h SLA), 24h statutory maintenance deadlines, and digital CoC sign-offs—even when the app runs in the background.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {pushPermission === 'default' ? (
            <button
              type="button"
              id="banner-enable-push-btn"
              onClick={requestPushPermission}
              className="px-3.5 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Enable Browser Alerts
            </button>
          ) : (
            <button
              type="button"
              id="banner-open-settings-btn"
              onClick={() => setIsPushCenterOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-md border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Configure Alerts</span>
            </button>
          )}

          <button
            type="button"
            id="dismiss-push-banner-btn"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
