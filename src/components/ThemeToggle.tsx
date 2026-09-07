import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'pill';
  className?: string;
  showTooltip?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
  showTooltip = true
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        id="global-theme-toggle-pill"
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
          isDark
            ? 'bg-[#0E2442] border-[#1E3A5F] text-amber-300 hover:bg-[#15345E] shadow-xs'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Night-Time Site Inspection Mode (Brand Navy)'}
        aria-label="Toggle visual theme between standard light and night-time inspection mode"
      >
        <span className="relative flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-600" />
          )}
        </span>
        <span>{isDark ? 'Night Inspection' : 'Day Mode'}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            isDark ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-emerald-500'
          }`}
        />
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        id="global-theme-toggle-full"
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center justify-between gap-3 w-full px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 cursor-pointer border ${
          isDark
            ? 'bg-[#0A192F] border-[#1E3A5F] text-slate-200 hover:bg-[#112240]'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        } ${className}`}
        title={isDark ? 'Switch to Standard Light Mode' : 'Switch to Night-Time Inspection Mode (Brand Navy)'}
        aria-label="Toggle visual theme"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-sm flex items-center justify-center ${
              isDark ? 'bg-[#112240] text-amber-300 border border-[#1E3A5F]' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </div>
          <div className="text-left">
            <div className="font-bold font-mono text-[11px] uppercase tracking-wider">
              {isDark ? 'Night-Time Inspection' : 'Daylight Mode'}
            </div>
            <div className="text-[10px] text-slate-400">
              {isDark ? 'Brand-Navy High Contrast Active' : 'Default Studio Light Palette'}
            </div>
          </div>
        </div>

        <div
          className={`px-2 py-0.5 rounded-xs text-[9px] font-mono uppercase font-bold tracking-widest ${
            isDark
              ? 'bg-amber-950/70 border border-amber-700 text-amber-300'
              : 'bg-slate-100 border border-slate-300 text-slate-600'
          }`}
        >
          {isDark ? 'DARK' : 'LIGHT'}
        </div>
      </button>
    );
  }

  // Default compact button
  return (
    <button
      id="global-theme-toggle"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
        isDark
          ? 'bg-[#0D213F] hover:bg-[#132D54] border-[#1E3A5F] text-amber-300 shadow-xs'
          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
      } ${className}`}
      title={
        showTooltip
          ? isDark
            ? 'Night-Time Inspection Mode Active (Brand Navy). Click to switch to Daylight Mode.'
            : 'Switch to Night-Time Inspection Mode (Brand Navy Palette)'
          : undefined
      }
      aria-label="Toggle Night-Time Inspection Mode"
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-amber-300 animate-in fade-in duration-200" />
          <span className="text-[11px] font-bold text-amber-300">Night</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#f59e0b] ml-0.5"></span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-[#FFB703] animate-in fade-in duration-200" />
          <span className="text-[11px] font-bold text-slate-200">Day</span>
        </>
      )}
    </button>
  );
};
