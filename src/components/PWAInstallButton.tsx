import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  // If not currently triggering browser install prompt, show desktop/mobile shortcut helper in certain variants
  if (!isInstallable && variant !== 'banner') {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        id="pwa-install-btn-compact"
        onClick={installApp}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 transition-all ${className}`}
        title="Install Audrin Fire PWA for offline field access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        id="pwa-install-banner"
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gradient-to-r from-[#0A192F] to-[#112240] border border-blue-900/60 rounded-lg text-slate-200 shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#CC0000]/20 border border-[#CC0000]/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#FFB703]" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Install SANS 10139 Field PWA
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-xs font-mono font-normal">
                Offline Ready
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Access logbooks and cache on-site inspections in basements and plant rooms without internet.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="pwa-install-btn-banner"
          onClick={installApp}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC0000] hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Install on Device</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      id="pwa-install-btn-header"
      onClick={installApp}
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-[#FFB703] border border-amber-500/40 rounded-sm text-xs font-bold tracking-wide transition-all shadow-xs group cursor-pointer ${className}`}
      title="Install Audrin Fire Progressive Web App for offline field compliance"
    >
      <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
      <span>Install PWA</span>
    </button>
  );
};
