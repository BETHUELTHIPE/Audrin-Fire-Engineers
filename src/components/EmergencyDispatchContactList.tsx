import React, { useState, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  ChevronRight,
  Search,
  Filter,
  ExternalLink,
  Flame,
  Radio,
  FileText,
  User,
  Wrench,
  HelpCircle,
  Building,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';
import {
  ON_CALL_ENGINEERS,
  EMERGENCY_INCIDENT_TYPES,
  EMERGENCY_ESCALATION_DESK,
  SANS10139_EMERGENCY_DISPATCH_GUIDELINES,
  buildWhatsAppDispatchMessage
} from '../data/emergencyDispatchData';
import { EmergencyOnCallEngineer, EmergencyIncidentType } from '../types/emergencyDispatch';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { useApp } from '../context/AppContext';

interface EmergencyDispatchContactListProps {
  onOpenServiceRequest?: () => void;
  preselectedSiteId?: string;
  isCompactMode?: boolean;
}

export const EmergencyDispatchContactList: React.FC<EmergencyDispatchContactListProps> = ({
  onOpenServiceRequest,
  preselectedSiteId,
  isCompactMode = false
}) => {
  const { currentUser } = useApp();

  // Filter & Search states
  const [regionFilter, setRegionFilter] = useState<'all' | 'on_call' | 'pretoria' | 'joburg'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'fast_dispatch' | 'protocols' | 'municipal'>('directory');

  // Interactive Fast Dispatch Form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(preselectedSiteId || CLIENT_SITE_MAINTENANCE_PROFILES[0].siteId);
  const [customSiteName, setCustomSiteName] = useState('');
  const [callerName, setCallerName] = useState(currentUser?.fullName || 'Fire Safety Manager');
  const [callerPhone, setCallerPhone] = useState(currentUser?.phone || '071 415 6665');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(EMERGENCY_INCIDENT_TYPES[0].id);
  const [customPanelModel, setCustomPanelModel] = useState('');
  const [affectedZone, setAffectedZone] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [targetEngineerId, setTargetEngineerId] = useState<string>('tech-01'); // Default to Bethuel Moukangwe (Primary)
  const [dispatchConfirmedToast, setDispatchConfirmedToast] = useState<string | null>(null);
  const [dispatchDocketHistory, setDispatchDocketHistory] = useState<Array<{
    id: string;
    ref: string;
    site: string;
    incident: string;
    engineer: string;
    time: string;
  }>>([]);

  // Selected site object
  const selectedSite = useMemo(() => {
    return CLIENT_SITE_MAINTENANCE_PROFILES.find(s => s.siteId === selectedSiteId) || CLIENT_SITE_MAINTENANCE_PROFILES[0];
  }, [selectedSiteId]);

  // Selected incident object
  const selectedIncident = useMemo(() => {
    return EMERGENCY_INCIDENT_TYPES.find(i => i.id === selectedIncidentId) || EMERGENCY_INCIDENT_TYPES[0];
  }, [selectedIncidentId]);

  // Selected target engineer
  const targetEngineer = useMemo(() => {
    return ON_CALL_ENGINEERS.find(e => e.id === targetEngineerId) || ON_CALL_ENGINEERS[0];
  }, [targetEngineerId]);

  // Filtered engineers roster
  const filteredEngineers = useMemo(() => {
    return ON_CALL_ENGINEERS.filter(eng => {
      // Region / Tier filter
      if (regionFilter === 'on_call') {
        if (eng.dispatchPriority !== 'primary' && eng.dispatchPriority !== 'backup') return false;
      } else if (regionFilter === 'pretoria') {
        if (!eng.baseLocation.toLowerCase().includes('pretoria') && !eng.regionalCoverage.some(r => r.toLowerCase().includes('pretoria'))) {
          return false;
        }
      } else if (regionFilter === 'joburg') {
        if (!eng.baseLocation.toLowerCase().includes('midrand') && !eng.baseLocation.toLowerCase().includes('johannesburg') && !eng.regionalCoverage.some(r => r.toLowerCase().includes('sandton') || r.toLowerCase().includes('joburg') || r.toLowerCase().includes('johannesburg'))) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = eng.name.toLowerCase().includes(q);
        const matchesRole = eng.role.toLowerCase().includes(q);
        const matchesSaqcc = eng.saqccNumber.toLowerCase().includes(q) || eng.saqccLevel.toLowerCase().includes(q);
        const matchesLocation = eng.baseLocation.toLowerCase().includes(q);
        const matchesSpecialty = eng.specialties.some(s => s.toLowerCase().includes(q));
        const matchesPanel = eng.panelProficiencies.some(p => p.toLowerCase().includes(q));
        return matchesName || matchesRole || matchesSaqcc || matchesLocation || matchesSpecialty || matchesPanel;
      }

      return true;
    });
  }, [regionFilter, searchQuery]);

  const handleCopyPhone = async (eng: EmergencyOnCallEngineer) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(eng.phone);
        setCopiedPhoneId(eng.id);
        setTimeout(() => setCopiedPhoneId(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleTriggerDispatch = (destination: 'whatsapp' | 'copy') => {
    const siteName = selectedSiteId === 'custom' ? (customSiteName || 'Commercial Site') : selectedSite.siteName;
    const panel = customPanelModel || selectedSite.panelModel || 'CIE Fire Alarm Panel';
    const zone = affectedZone || 'Zone 01 / General Panel Loop';
    const symptoms = symptomsText || selectedIncident.description;

    const encodedWhatsApp = buildWhatsAppDispatchMessage({
      siteName,
      incidentTitle: selectedIncident.title,
      severity: selectedIncident.defaultSeverity,
      panelModel: panel,
      zoneAddress: zone,
      symptoms,
      callerName,
      callerPhone
    });

    const docketRef = `EMG-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

    // Add to local audit list
    setDispatchDocketHistory(prev => [
      {
        id: `docket-${Date.now()}`,
        ref: docketRef,
        site: siteName,
        incident: selectedIncident.title,
        engineer: targetEngineer.name,
        time: timestamp
      },
      ...prev
    ]);

    if (destination === 'whatsapp') {
      const waUrl = `https://wa.me/${targetEngineer.whatsappNumber}?text=${encodedWhatsApp}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setDispatchConfirmedToast(`Emergency dispatch transmitted to ${targetEngineer.name} via WhatsApp! Docket ref: ${docketRef}`);
    } else {
      const decodedText = decodeURIComponent(encodedWhatsApp.replace(/\+/g, ' '));
      if (navigator.clipboard) {
        navigator.clipboard.writeText(decodedText);
      }
      setDispatchConfirmedToast(`Dispatch alert payload copied to clipboard for radio/SMS dispatch! Ref: ${docketRef}`);
    }

    setTimeout(() => {
      setDispatchConfirmedToast(null);
    }, 5000);
  };

  return (
    <div id="emergency-dispatch-container" className="space-y-6">
      {/* Top Banner: Statutory Alert Notice */}
      <div className="bg-linear-to-r from-[#0A192F] via-[#112240] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-sm border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[11px] font-mono font-black uppercase tracking-wider bg-red-600 text-white shadow-xs animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                24/7 Live Emergency Dispatch
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[11px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                SANS 10139 Clause 13 / 25 Standby
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                Guaranteed &lt; 2-Hour Response SLA
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#CC0000]" />
              Emergency On-Call Engineering Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Immediate direct communications channel for client Fire Safety Officers and Designated Responsible Persons.
              Connect directly with registered SAQCC Level 3/4 fire alarm engineers for active system alarms, panel lockups, or critical loop defects.
            </p>
          </div>

          {/* Hotline Quick Call Hero Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 w-full lg:w-auto shrink-0">
            <a
              id="btn-hero-emergency-call"
              href={`tel:${EMERGENCY_ESCALATION_DESK.hotlinePhone.replace(/\s+/g, '')}`}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xs font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/60 transition-all border border-red-400 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Primary Hotline: {EMERGENCY_ESCALATION_DESK.hotlineDisplay}</span>
            </a>
            <div className="text-[11px] font-mono text-slate-300 text-center lg:text-right">
              Command Desk: <strong className="text-amber-300">Bethuel Moukangwe (Lead Engineer)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation / Feedback Toast */}
      {dispatchConfirmedToast && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-sm text-emerald-100 text-xs font-mono flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{dispatchConfirmedToast}</span>
          </div>
          <button
            onClick={() => setDispatchConfirmedToast(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-sm flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-[#CC0000] text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>On-Call Engineers Directory ({ON_CALL_ENGINEERS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fast_dispatch')}
          className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'fast_dispatch'
              ? 'bg-[#CC0000] text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Fast-Track Incident Dispatcher</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
            1-Click WhatsApp
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('protocols')}
          className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'protocols'
              ? 'bg-[#CC0000] text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>SANS 10139 Emergency Protocols</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('municipal')}
          className={`px-3.5 py-2 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'municipal'
              ? 'bg-[#CC0000] text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Municipal Fire Brigades &amp; Control</span>
        </button>
      </div>

      {/* TAB 1: ON-CALL ENGINEERS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-[#0A192F] p-4 rounded-sm border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search engineer, SAQCC, panel, area..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-red-600 font-sans text-xs"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase hidden md:inline">
                Roster:
              </span>
              <button
                type="button"
                onClick={() => setRegionFilter('all')}
                className={`px-2.5 py-1 rounded-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  regionFilter === 'all'
                    ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Roster ({ON_CALL_ENGINEERS.length})
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('on_call')}
                className={`px-2.5 py-1 rounded-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  regionFilter === 'on_call'
                    ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Active On-Call (2)
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('pretoria')}
                className={`px-2.5 py-1 rounded-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  regionFilter === 'pretoria'
                    ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Pretoria / Centurion
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('joburg')}
                className={`px-2.5 py-1 rounded-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  regionFilter === 'joburg'
                    ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Midrand / Sandton
              </button>
            </div>
          </div>

          {/* Engineers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEngineers.map(eng => {
              const isPrimary = eng.dispatchPriority === 'primary';
              const isBackup = eng.dispatchPriority === 'backup';

              return (
                <div
                  key={eng.id}
                  id={`engineer-card-${eng.id}`}
                  className={`bg-white dark:bg-[#0A192F] rounded-sm border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                    isPrimary
                      ? 'border-2 border-[#CC0000] ring-1 ring-red-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Top Tier Badge */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between text-xs font-mono font-bold ${
                      isPrimary
                        ? 'bg-[#CC0000] text-white'
                        : isBackup
                        ? 'bg-blue-600 text-white'
                        : eng.dispatchPriority === 'specialist'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>{eng.dispatchTitle}</span>
                    </div>
                    <div className="text-[10px] bg-black/25 px-2 py-0.5 rounded-xs font-mono">
                      {eng.responseEta.split('|')[0]}
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="p-4 sm:p-5 space-y-3.5 flex-1">
                    {/* Header Row with Avatar & Role */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-sm text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${eng.avatarColor}`}
                        >
                          {eng.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                            {eng.name}
                          </h3>
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-0.5">
                            {eng.role}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] px-1.5 py-0.5 rounded-xs border border-slate-300 dark:border-slate-700 font-bold">
                              {eng.saqccNumber}
                            </span>
                            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded-xs border border-amber-300 dark:border-amber-800 font-bold">
                              {eng.saqccLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location Chip */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{eng.baseLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Regional Coverage */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Primary Coverage Zones:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {eng.regionalCoverage.map((reg, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-xs font-mono"
                          >
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Panel Proficiencies */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Panel Hardware Proficiencies:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {eng.panelProficiencies.map((panel, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-[10px] px-1.5 py-0.5 rounded-xs font-sans"
                          >
                            {panel}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialties / SANS Expertise */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Core Competencies:
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 font-sans">
                        {eng.specialties.slice(0, 3).map((spec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">•</span>
                            <span className="line-clamp-1">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom Quick Actions */}
                  <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Direct Phone Call */}
                      <a
                        href={`tel:${eng.phone.replace(/\s+/g, '')}`}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title={`Call ${eng.name} directly on mobile`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {eng.phoneDisplay}</span>
                      </a>

                      {/* Copy Phone Number */}
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(eng)}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors cursor-pointer"
                        title="Copy phone number"
                      >
                        {copiedPhoneId === eng.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Dispatch Button */}
                      <a
                        href={`https://wa.me/${eng.whatsappNumber}?text=${buildWhatsAppDispatchMessage({
                          siteName: selectedSite.siteName,
                          incidentTitle: 'Urgent SANS 10139 Technical Support Query',
                          severity: 'priority_2_urgent',
                          panelModel: selectedSite.panelModel,
                          zoneAddress: 'General CIE Interface',
                          symptoms: 'Direct on-call consultation requested via Customer Portal.',
                          callerName,
                          callerPhone
                        })}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Send WhatsApp emergency dispatch"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Direct Email */}
                      <a
                        href={`mailto:${eng.email}?subject=${encodeURIComponent(`[URGENT SANS 10139 DISPATCH] ${selectedSite.siteName}`)}`}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xs transition-colors cursor-pointer"
                        title={`Email ${eng.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FAST-TRACK INCIDENT DISPATCHER */}
      {activeTab === 'fast_dispatch' && (
        <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-slate-800 rounded-sm p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-600 uppercase mb-1">
              <Zap className="w-4 h-4" />
              <span>Rapid Emergency Incident Docket Generator</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Transmit Emergency Dispatch to On-Call Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
              Complete the critical fields below to auto-format a SANS 10139 emergency dispatch payload.
              Clicking "Transmit via WhatsApp" sends all site specifics, panel details, and fault codes straight to the designated on-call engineer's mobile device.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4 font-mono text-xs">
              {/* Site Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  1. Impacted Client Facility / Site:
                </label>
                <select
                  value={selectedSiteId}
                  onChange={e => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  {CLIENT_SITE_MAINTENANCE_PROFILES.map(site => (
                    <option key={site.siteId} value={site.siteId}>
                      {site.siteName} — {site.address} ({site.systemCategory.split('(')[0]})
                    </option>
                  ))}
                  <option value="custom">+ Other / Unlisted Premises (Specify)</option>
                </select>
                {selectedSiteId === 'custom' && (
                  <input
                    type="text"
                    value={customSiteName}
                    onChange={e => setCustomSiteName(e.target.value)}
                    placeholder="Enter building name and physical address..."
                    className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100"
                  />
                )}
              </div>

              {/* Incident Classification */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  2. Incident Classification:
                </label>
                <select
                  value={selectedIncidentId}
                  onChange={e => setSelectedIncidentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  {EMERGENCY_INCIDENT_TYPES.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.defaultSeverity === 'priority_1_critical' ? 'CRITICAL' : 'URGENT'}] {inc.title}
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xs text-[11px] text-amber-900 dark:text-amber-300 font-sans">
                  <strong>Recommended Immediate Step:</strong> {selectedIncident.recommendedImmediateAction}
                </div>
              </div>

              {/* Panel & Zone Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    3. CIE Panel Make / Model:
                  </label>
                  <input
                    type="text"
                    value={customPanelModel || (selectedSiteId !== 'custom' ? selectedSite.panelModel : '')}
                    onChange={e => setCustomPanelModel(e.target.value)}
                    placeholder="e.g. Advanced MXPro 5, Ziton ZP3"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    4. Affected Loop / Zone / Address:
                  </label>
                  <input
                    type="text"
                    value={affectedZone}
                    onChange={e => setAffectedZone(e.target.value)}
                    placeholder="e.g. Loop 2 Addr 14 (Zone 3 Reception)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Symptoms / Fault Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  5. Fault Symptoms &amp; Exact LCD Display Message:
                </label>
                <textarea
                  rows={3}
                  value={symptomsText}
                  onChange={e => setSymptomsText(e.target.value)}
                  placeholder="Type exact LCD display readouts, sounder status, or visible alerts..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 font-sans text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              {/* Caller Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Caller / Responsible Person Name:
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Caller Contact Phone:
                  </label>
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Target Engineer Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  6. Route Emergency Dispatch To:
                </label>
                <select
                  value={targetEngineerId}
                  onChange={e => setTargetEngineerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 font-bold"
                >
                  {ON_CALL_ENGINEERS.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} — {eng.dispatchTitle} ({eng.phoneDisplay})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispatch Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  id="btn-transmit-whatsapp"
                  onClick={() => handleTriggerDispatch('whatsapp')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Transmit via WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-docket"
                  onClick={() => handleTriggerDispatch('copy')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Docket Payload</span>
                </button>

                <a
                  href={`tel:${targetEngineer.phone.replace(/\s+/g, '')}`}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Direct Call Now</span>
                </a>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 text-slate-200 p-4 rounded-sm border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                  <span className="font-bold uppercase text-amber-400">Live Dispatch Payload Preview</span>
                  <span>SANS 10139 Standard</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xs space-y-2 text-[11px] leading-relaxed border border-slate-800 font-mono">
                  <div className="text-red-400 font-bold">
                    🚨 AUDRIN FIRE ENGINEERS - SANS 10139 EMERGENCY DISPATCH
                  </div>
                  <div className="text-slate-400">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                  <div>
                    <span className="text-slate-500">🏢 Site:</span>{' '}
                    <strong className="text-white">
                      {selectedSiteId === 'custom' ? (customSiteName || 'Custom Site') : selectedSite.siteName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">📍 Address:</span>{' '}
                    <span className="text-slate-300">
                      {selectedSiteId === 'custom' ? 'Custom Address' : selectedSite.address}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">👤 Contact:</span>{' '}
                    <span className="text-slate-300">{callerName} ({callerPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">⚠️ Incident:</span>{' '}
                    <span className="text-amber-300 font-bold">{selectedIncident.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">⚡ Severity:</span>{' '}
                    <span className="text-red-400 font-bold uppercase">
                      {selectedIncident.defaultSeverity.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">🎛️ Panel:</span>{' '}
                    <span className="text-slate-300">
                      {customPanelModel || selectedSite.panelModel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">📍 Zone/Loop:</span>{' '}
                    <span className="text-slate-300">{affectedZone || 'Zone 01 / General Loop'}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 text-slate-300 font-sans">
                    <span className="text-slate-500 font-mono text-[10px] block">SYMPTOMS:</span>
                    {symptomsText || selectedIncident.description}
                  </div>
                  <div className="text-slate-400">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                  <div className="text-[10px] text-emerald-400">
                    Routing to: {targetEngineer.name} ({targetEngineer.phoneDisplay})
                  </div>
                </div>
              </div>

              {/* Recent Dispatches on this session */}
              {dispatchDocketHistory.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-sm space-y-2 font-mono text-xs">
                  <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
                    Recent Incident Dockets Generated:
                  </div>
                  <div className="space-y-1.5">
                    {dispatchDocketHistory.map(doc => (
                      <div
                        key={doc.id}
                        className="bg-white dark:bg-slate-800 p-2 rounded-xs border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <strong className="text-red-600">{doc.ref}</strong> — {doc.site}
                          <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                            {doc.incident} • {doc.engineer}
                          </div>
                        </div>
                        <span className="text-slate-400 text-[10px]">{doc.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SANS 10139 EMERGENCY PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-slate-800 rounded-sm p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              SANS 10139:2012 Emergency Fault Protocols for Responsible Persons
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
              Standard operating procedures mandated by the Occupational Health and Safety (OHS) Act and SANS 10139 when non-domestic fire detection systems enter alarm or fault.
            </p>
          </div>

          <div className="space-y-3">
            {SANS10139_EMERGENCY_DISPATCH_GUIDELINES.map(step => (
              <div
                key={step.step}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-sm flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-sm bg-[#CC0000] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {step.step}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-1 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-sm font-sans text-xs text-amber-950 dark:text-amber-200 space-y-1">
            <strong className="font-bold uppercase tracking-wider block font-mono">
              ⚠️ Important Legal Notice (Clause 13.1 - System Impairment):
            </strong>
            <p>
              Under no circumstances may a fire detection system be left powered off or silenced indefinitely without informing building insurers and the local municipal chief fire officer if impairments exceed 24 hours.
              Audrin Fire Engineers provides compliant temporary wireless standalone bridges or loan panels during major overhaul.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MUNICIPAL FIRE BRIGADES */}
      {activeTab === 'municipal' && (
        <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-slate-800 rounded-sm p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              Municipal Fire Brigade Emergency Control Rooms
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
              For confirmed uncontained fires, life-threatening smoke development, or municipal building evacuations, contact emergency municipal fire dispatchers immediately prior to engineering notification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {EMERGENCY_ESCALATION_DESK.municipalFireNumbers.map((mun, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-sm space-y-2"
              >
                <div className="font-bold text-slate-900 dark:text-white uppercase text-sm">
                  {mun.region}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                  {mun.department}
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${mun.phone.replace(/\s+/g, '')}`}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{mun.phone}</span>
                  </a>
                  {mun.altPhone && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Alt: {mun.altPhone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xs text-xs font-mono text-slate-600 dark:text-slate-300">
            <strong>Headquarters Physical Command Base:</strong> {EMERGENCY_ESCALATION_DESK.physicalCommandBase}
          </div>
        </div>
      )}
    </div>
  );
};
