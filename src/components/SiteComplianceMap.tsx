import React, { useState, useMemo, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useMap
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  ExternalLink,
  Filter,
  Layers,
  Search,
  Navigation,
  Building,
  Phone,
  Info,
  Calendar,
  Sparkles,
  Maximize2,
  Compass,
  Cpu,
  Key,
  QrCode
} from 'lucide-react';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { ClientSiteMaintenanceProfile, MaintenanceUrgencyStatus } from '../types/serviceDue';
import { useApp } from '../context/AppContext';

// Helper to determine status color palette
export const getStatusVisuals = (status: MaintenanceUrgencyStatus) => {
  switch (status) {
    case 'overdue':
      return {
        label: 'OVERDUE DEFECT',
        bgBadge: 'bg-red-100 text-red-800 border-red-300',
        pinBackground: '#CC0000',
        pinGlyphColor: '#FFFFFF',
        pinBorderColor: '#7F1D1D',
        ringColor: 'ring-red-500',
        textColor: 'text-red-600',
        cardBorder: 'border-red-500',
        pillBg: 'bg-[#CC0000]'
      };
    case 'due_soon':
      return {
        label: 'DUE SOON (<14D)',
        bgBadge: 'bg-amber-100 text-amber-800 border-amber-300',
        pinBackground: '#D97706',
        pinGlyphColor: '#FFFFFF',
        pinBorderColor: '#78350F',
        ringColor: 'ring-amber-500',
        textColor: 'text-amber-600',
        cardBorder: 'border-amber-500',
        pillBg: 'bg-amber-600'
      };
    case 'scheduled':
      return {
        label: 'SCHEDULED (15-45D)',
        bgBadge: 'bg-blue-100 text-blue-800 border-blue-300',
        pinBackground: '#2563EB',
        pinGlyphColor: '#FFFFFF',
        pinBorderColor: '#1E3A8A',
        ringColor: 'ring-blue-500',
        textColor: 'text-blue-600',
        cardBorder: 'border-blue-500',
        pillBg: 'bg-blue-600'
      };
    case 'compliant':
    default:
      return {
        label: 'COMPLIANT SANS 10139',
        bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        pinBackground: '#16A34A',
        pinGlyphColor: '#FFFFFF',
        pinBorderColor: '#064E3B',
        ringColor: 'ring-emerald-500',
        textColor: 'text-emerald-600',
        cardBorder: 'border-emerald-500',
        pillBg: 'bg-emerald-600'
      };
  }
};

// Center of Gauteng / Pretoria region
const GAUTENG_CENTER = { lat: -25.755, lng: 28.210 };

// Sub-component for Google Maps view centering
const MapCenterController: React.FC<{ targetCoords: { lat: number; lng: number } | null }> = ({ targetCoords }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && targetCoords) {
      map.panTo(targetCoords);
      map.setZoom(13);
    }
  }, [map, targetCoords]);
  return null;
};

export const SiteComplianceMap: React.FC = () => {
  const {
    setIsMaintenanceCheckModalOpen,
    setPreselectedSiteForMaintenance,
    setIsScheduleInspectionModalOpen,
    setPreselectedSiteForSchedule,
    openDeviceQRGenerator,
    showToast
  } = useApp();

  // Environment Google Maps Key
  const envApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Local state
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(CLIENT_SITE_MAINTENANCE_PROFILES[0].siteId);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMapMode, setActiveMapMode] = useState<'google' | 'gis'>(envApiKey ? 'google' : 'gis');
  const [demoKeyInput, setDemoKeyInput] = useState<string>(envApiKey);
  const [showKeySetup, setShowKeySetup] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Active key
  const effectiveApiKey = demoKeyInput.trim() || envApiKey;

  // Filtered sites
  const filteredSites = useMemo(() => {
    return CLIENT_SITE_MAINTENANCE_PROFILES.filter((site) => {
      const matchesStatus =
        statusFilter === 'all' || site.mostUrgentInterval?.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || site.systemCategory.includes(categoryFilter);
      const matchesSearch =
        searchQuery.trim() === '' ||
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.clientOrganisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.mostUrgentInterval?.assignedTechnician?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [statusFilter, categoryFilter, searchQuery]);

  // Selected site object
  const selectedSite = useMemo(() => {
    return CLIENT_SITE_MAINTENANCE_PROFILES.find((s) => s.siteId === selectedSiteId) || null;
  }, [selectedSiteId]);

  // Summary counts
  const summary = useMemo(() => {
    const total = CLIENT_SITE_MAINTENANCE_PROFILES.length;
    let overdue = 0;
    let dueSoon = 0;
    let scheduled = 0;
    let compliant = 0;
    let totalScore = 0;

    CLIENT_SITE_MAINTENANCE_PROFILES.forEach((site) => {
      totalScore += site.overallComplianceScore;
      const status = site.mostUrgentInterval?.status;
      if (status === 'overdue') overdue++;
      else if (status === 'due_soon') dueSoon++;
      else if (status === 'scheduled') scheduled++;
      else compliant++;
    });

    return {
      total,
      overdue,
      dueSoon,
      scheduled,
      compliant,
      avgScore: Math.round(totalScore / total)
    };
  }, []);

  // Handlers for quick actions
  const handleOpenMaintenanceCheck = (site: ClientSiteMaintenanceProfile) => {
    setPreselectedSiteForMaintenance({
      siteId: site.siteId,
      siteName: site.siteName,
      clientOrganisation: site.clientOrganisation,
      panelMakeModel: site.panelModel,
      locationDetails: `${site.address}, ${site.city}`
    });
    setIsMaintenanceCheckModalOpen(true);
  };

  const handleOpenScheduler = (site: ClientSiteMaintenanceProfile) => {
    setPreselectedSiteForSchedule({
      siteName: site.siteName,
      city: site.city,
      streetAddress: site.address
    });
    setIsScheduleInspectionModalOpen(true);
  };

  // Convert GPS to SVG coordinates for the GIS vector regional projection
  // Lat range in Gauteng dataset: approx -25.62 to -26.11 (north to south)
  // Lng range in Gauteng dataset: approx 28.05 to 28.30 (west to east)
  const projectGpsToSvg = (lat: number, lng: number) => {
    const minLat = -26.15;
    const maxLat = -25.60;
    const minLng = 28.02;
    const maxLng = 28.35;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 40;
    return { x, y };
  };

  return (
    <div id="sans-site-compliance-map-container" className="space-y-4">
      {/* Top Header & Compliance Fleet KPI Strip */}
      <div className="bg-[#0A192F] text-white p-5 rounded-sm border-t-4 border-[#CC0000] shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold mb-1">
              <Compass className="w-4 h-4 text-[#CC0000]" />
              <span>SANS 10139 STATUTORY CLIENT SITES GEOLOCATION REGISTER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>Interactive Site Compliance Map</span>
              <span className="bg-red-900/60 border border-red-700 text-red-200 text-xs px-2 py-0.5 rounded-sm font-mono font-normal">
                Gauteng Metro Network
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Live spatial tracking of 8 active client facilities color-coded by statutory maintenance intervals, SANS 10139 test deadlines, and designated SAQCC technicians.
            </p>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-slate-900/90 border border-slate-700 p-2.5 rounded-sm">
              <div className="text-slate-400 text-[10px] uppercase">Fleet Index</div>
              <div className="text-lg font-black text-emerald-400">{summary.avgScore}%</div>
              <div className="text-[10px] text-slate-400">Avg Compliance</div>
            </div>

            <div className="bg-red-950/80 border border-red-800/80 p-2.5 rounded-sm">
              <div className="text-red-300 text-[10px] uppercase">Overdue Critical</div>
              <div className="text-lg font-black text-red-400 flex items-center gap-1">
                <span>{summary.overdue}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              </div>
              <div className="text-[10px] text-red-300">Action Required</div>
            </div>

            <div className="bg-amber-950/80 border border-amber-800/80 p-2.5 rounded-sm">
              <div className="text-amber-300 text-[10px] uppercase">Due Soon (&le;14d)</div>
              <div className="text-lg font-black text-amber-400">{summary.dueSoon}</div>
              <div className="text-[10px] text-amber-300">Routine Check</div>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-800/80 p-2.5 rounded-sm">
              <div className="text-emerald-300 text-[10px] uppercase">Compliant / Sched.</div>
              <div className="text-lg font-black text-emerald-300">{summary.compliant + summary.scheduled}</div>
              <div className="text-[10px] text-emerald-400">Within Cycle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Control Bar & Filters */}
      <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Compliance:</span>
          </span>

          <button
            id="map-filter-all"
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-sm font-mono font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({summary.total})
          </button>

          <button
            id="map-filter-overdue"
            type="button"
            onClick={() => setStatusFilter('overdue')}
            className={`px-2.5 py-1 rounded-sm font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'overdue'
                ? 'bg-[#CC0000] text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>Overdue ({summary.overdue})</span>
          </button>

          <button
            id="map-filter-due-soon"
            type="button"
            onClick={() => setStatusFilter('due_soon')}
            className={`px-2.5 py-1 rounded-sm font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'due_soon'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Due Soon ({summary.dueSoon})</span>
          </button>

          <button
            id="map-filter-compliant"
            type="button"
            onClick={() => setStatusFilter('compliant')}
            className={`px-2.5 py-1 rounded-sm font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'compliant'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>Compliant ({summary.compliant})</span>
          </button>

          {/* Search Input */}
          <div className="relative ml-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="map-search-sites"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, technician, panel..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-sm text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden w-48 sm:w-60 font-sans"
            />
          </div>
        </div>

        {/* Right: Engine Switch & Key Configuration */}
        <div className="flex items-center gap-2">
          {/* Map Engine Toggle */}
          <div className="inline-flex rounded-sm border border-slate-300 p-0.5 bg-slate-100 font-mono text-[11px]">
            <button
              type="button"
              id="btn-engine-google"
              onClick={() => setActiveMapMode('google')}
              className={`px-2.5 py-1 rounded-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeMapMode === 'google'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3 h-3 text-blue-600" />
              <span>Google Maps Platform</span>
            </button>

            <button
              type="button"
              id="btn-engine-gis"
              onClick={() => setActiveMapMode('gis')}
              className={`px-2.5 py-1 rounded-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeMapMode === 'gis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>Vector GIS Cartography</span>
            </button>
          </div>

          {/* API Key Modal / Drawer Trigger */}
          <button
            type="button"
            id="btn-toggle-key-setup"
            onClick={() => setShowKeySetup(!showKeySetup)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-sm font-mono text-[11px] text-slate-700 flex items-center gap-1 cursor-pointer"
            title="Configure Google Maps API Key or Demo Key"
          >
            <Key className="w-3 h-3 text-amber-600" />
            <span>{effectiveApiKey ? 'Key Configured' : 'Maps Demo Key'}</span>
          </button>
        </div>
      </div>

      {/* Key Setup Assistant Banner if Open */}
      {showKeySetup && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm text-xs text-amber-900 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-950 font-mono">
              <Key className="w-4 h-4 text-amber-700" />
              <span>Google Maps Platform API Key Setup & Demo Key Quickstart</span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeySetup(false)}
              className="text-amber-700 hover:text-amber-950 font-mono text-xs cursor-pointer"
            >
              [Dismiss]
            </button>
          </div>
          <p className="leading-relaxed">
            The interactive map uses Google Maps Platform JavaScript API with <code className="bg-amber-100 px-1 py-0.5 rounded-sm font-mono">AdvancedMarkerElement</code> and vector styling.
            For immediate evaluation without billing setup, you can use the official <strong>Google Maps Demo Key</strong> or specify your project API key.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              value={demoKeyInput}
              onChange={(e) => setDemoKeyInput(e.target.value)}
              placeholder="Paste Google Maps Platform API Key (or Demo Key)"
              className="flex-1 w-full px-3 py-1.5 bg-white border border-amber-300 rounded-sm text-xs font-mono focus:ring-1 focus:ring-amber-600 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => {
                showToast('success', 'Maps Key Saved', 'Map key updated for interactive session.');
                setShowKeySetup(false);
              }}
              className="w-full sm:w-auto px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-mono font-bold rounded-sm cursor-pointer"
            >
              Apply Key
            </button>
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3 py-1.5 bg-white border border-amber-400 hover:bg-amber-100 text-amber-900 font-mono font-bold rounded-sm inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Get Demo Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Map Body & Interactive Sidebar Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center: The Map Canvas */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="relative bg-slate-950 border border-slate-300 rounded-sm overflow-hidden h-[580px] shadow-inner">
            {/* Overlay Map Controls */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <button
                type="button"
                id="btn-toggle-site-list"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-white/95 backdrop-blur-xs text-slate-800 px-3 py-1.5 rounded-sm shadow-md font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-white border border-slate-300 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>{sidebarOpen ? 'Hide Site List' : 'Show Site List'}</span>
              </button>

              <div className="bg-[#0A192F]/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-sm shadow-md font-mono text-xs border border-white/20 hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Displaying {filteredSites.length} of {CLIENT_SITE_MAINTENANCE_PROFILES.length} Sites</span>
              </div>
            </div>

            {/* Map Legend (Bottom Left) */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-sm shadow-lg border border-slate-200 text-[11px] font-mono space-y-1">
              <div className="font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#CC0000]" />
                <span>SANS 10139 Compliance Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#CC0000] border border-white shadow-xs" />
                <span className="text-slate-800 font-bold">Overdue / Defect (&lt; 0d)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs" />
                <span className="text-slate-800">Due Soon (&le; 14d)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs" />
                <span className="text-slate-800">Scheduled (15 - 45d)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs" />
                <span className="text-slate-800">Compliant (&gt; 45d)</span>
              </div>
            </div>

            {/* MODE 1: Google Maps Platform API */}
            {activeMapMode === 'google' && (
              <div className="w-full h-full">
                {effectiveApiKey ? (
                  <APIProvider apiKey={effectiveApiKey}>
                    <Map
                      id="audrin-compliance-gmap"
                      defaultCenter={selectedSite ? selectedSite.coordinates : GAUTENG_CENTER}
                      defaultZoom={11}
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      gestureHandling="greedy"
                      disableDefaultUI={false}
                      className="w-full h-full"
                    >
                      <MapCenterController targetCoords={selectedSite ? selectedSite.coordinates : null} />

                      {/* Render Advanced Markers for All Active Client Sites */}
                      {filteredSites.map((site) => {
                        const visuals = getStatusVisuals(site.mostUrgentInterval?.status || 'compliant');
                        const isSelected = selectedSiteId === site.siteId;

                        return (
                          <React.Fragment key={site.siteId}>
                            <AdvancedMarker
                              position={site.coordinates}
                              title={`${site.siteName} (${visuals.label})`}
                              onClick={() => setSelectedSiteId(site.siteId)}
                            >
                              <Pin
                                background={visuals.pinBackground}
                                borderColor={isSelected ? '#FFFFFF' : visuals.pinBorderColor}
                                glyphColor={visuals.pinGlyphColor}
                                scale={isSelected ? 1.3 : 1.0}
                              />
                            </AdvancedMarker>

                            {/* InfoWindow for Selected Site */}
                            {isSelected && (
                              <InfoWindow
                                position={site.coordinates}
                                onCloseClick={() => setSelectedSiteId(null)}
                                pixelOffset={[0, -40]}
                              >
                                <div className="p-1 max-w-xs text-slate-900 font-sans">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span
                                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase ${visuals.bgBadge}`}
                                    >
                                      {visuals.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold ml-auto">
                                      Score: {site.overallComplianceScore}%
                                    </span>
                                  </div>

                                  <h4 className="font-bold text-xs text-[#0A192F] leading-tight">
                                    {site.siteName}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 mt-0.5">
                                    {site.clientOrganisation}
                                  </p>

                                  <div className="bg-slate-50 p-1.5 rounded-sm border border-slate-200 mt-2 space-y-1 text-[10px] font-mono">
                                    <div>
                                      <strong className="text-slate-700">Address:</strong> {site.address}
                                    </div>
                                    <div>
                                      <strong className="text-slate-700">System:</strong> {site.systemCategory}
                                    </div>
                                    <div>
                                      <strong className="text-slate-700">Most Urgent:</strong>{' '}
                                      <span className={visuals.textColor}>
                                        {site.mostUrgentInterval?.label} ({site.earliestDueDays} days remaining)
                                      </span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-700">SAQCC Tech:</strong>{' '}
                                      {site.mostUrgentInterval?.assignedTechnician?.name}
                                    </div>
                                  </div>

                                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMaintenanceCheck(site)}
                                      className="flex-1 bg-[#CC0000] hover:bg-red-700 text-white font-mono text-[10px] font-bold py-1 px-2 rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Wrench className="w-3 h-3" />
                                      <span>Audit SANS</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenScheduler(site)}
                                      className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-bold py-1 px-2 rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Calendar className="w-3 h-3" />
                                      <span>Schedule</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openDeviceQRGenerator(site.siteId)}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[10px] font-bold py-1 px-2 rounded-xs flex items-center justify-center gap-1 cursor-pointer border border-slate-300"
                                      title="Generate printable QR labels for devices at this facility"
                                    >
                                      <QrCode className="w-3 h-3 text-[#CC0000]" />
                                      <span>QR Labels</span>
                                    </button>
                                  </div>
                                </div>
                              </InfoWindow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Map>
                  </APIProvider>
                ) : (
                  /* Guidance view if API key is pending */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <Key className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">
                      Google Maps Platform Key Required for Live Satellite Tiles
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
                      To activate the Google Maps JavaScript API with AdvancedMarkerElement, configure your API Key or Maps Demo Key.
                      You can also use the high-fidelity <strong>Vector GIS Cartography mode</strong> immediately without any key!
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowKeySetup(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs rounded-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Enter Maps Key</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMapMode('gis')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs rounded-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Switch to Vector GIS Mode</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: High-Precision Vector GIS Regional Cartography */}
            {activeMapMode === 'gis' && (
              <div className="w-full h-full bg-[#081325] relative overflow-hidden select-none">
                {/* SVG Regional GIS Map */}
                <svg
                  viewBox="0 0 900 580"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="gis-metro-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  {/* Cartographic Coordinate Grid */}
                  <rect width="900" height="580" fill="#0A1528" />
                  <rect width="900" height="580" fill="url(#gis-grid)" />

                  {/* Gauteng Metro Region Outlines */}
                  <path
                    d="M 100 120 Q 250 80, 480 90 T 780 140 Q 820 280, 750 420 T 450 510 Q 200 480, 120 380 Z"
                    fill="url(#gis-metro-grad)"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />

                  {/* Major Highway Arteries (N1, N4, N14, R21) */}
                  <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
                    {/* N1 Corridor: Pretoria to Johannesburg */}
                    <path d="M 380 60 L 420 180 L 460 300 L 430 460 L 390 540" />
                    {/* N4 Corridor: West to East (Pretoria West - Silverton) */}
                    <path d="M 120 180 L 320 200 L 520 210 L 760 220" />
                    {/* N14 / Ben Schoeman highway */}
                    <path d="M 220 260 L 380 290 L 460 300" />
                    {/* R21 to OR Tambo */}
                    <path d="M 470 240 L 620 350 L 710 470" />
                  </g>

                  {/* Metro Municipal District Labels */}
                  <g fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    <text x="180" y="150">ROSSLYN INDUSTRIAL</text>
                    <text x="210" y="240">PRETORIA WEST</text>
                    <text x="370" y="195">PRETORIA CBD</text>
                    <text x="470" y="225">HATFIELD / MENLYN</text>
                    <text x="590" y="195">SILVERTON LOGISTICS</text>
                    <text x="350" y="340">CENTURION TECH HUB</text>
                    <text x="340" y="490">SANDTON METRO CORRIDOR</text>
                  </g>

                  {/* Highway route labels */}
                  <g fill="#94A3B8" fontSize="9" fontFamily="monospace">
                    <rect x="425" y="235" width="22" height="14" rx="2" fill="#1E293B" stroke="#475569" />
                    <text x="430" y="246" fill="#38BDF8" fontWeight="bold">N1</text>

                    <rect x="240" y="190" width="22" height="14" rx="2" fill="#1E293B" stroke="#475569" />
                    <text x="245" y="201" fill="#38BDF8" fontWeight="bold">N4</text>
                  </g>

                  {/* Distance Scale Indicator */}
                  <g transform="translate(680, 530)" fill="#64748B" fontSize="10" fontFamily="monospace">
                    <line x1="0" y1="0" x2="80" y2="0" stroke="#64748B" strokeWidth="2" />
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="#64748B" strokeWidth="2" />
                    <line x1="80" y1="-4" x2="80" y2="4" stroke="#64748B" strokeWidth="2" />
                    <text x="20" y="-8">15 KM (SLA RADIUS)</text>
                  </g>

                  {/* Site Markers with Dynamic Spatial Coordinates */}
                  {filteredSites.map((site) => {
                    const { x, y } = projectGpsToSvg(site.coordinates.lat, site.coordinates.lng);
                    const visuals = getStatusVisuals(site.mostUrgentInterval?.status || 'compliant');
                    const isSelected = selectedSiteId === site.siteId;
                    const isOverdue = site.mostUrgentInterval?.status === 'overdue';

                    return (
                      <g
                        key={site.siteId}
                        transform={`translate(${x}, ${y})`}
                        className="cursor-pointer transition-transform duration-200"
                        onClick={() => setSelectedSiteId(site.siteId)}
                      >
                        {/* Radar / Pulsing Ring for Overdue or Selected Sites */}
                        {(isOverdue || isSelected) && (
                          <circle
                            r="22"
                            fill="none"
                            stroke={visuals.pinBackground}
                            strokeWidth="1.5"
                            className="animate-ping"
                            opacity="0.6"
                          />
                        )}

                        {/* Outer Glow Halo */}
                        <circle
                          r={isSelected ? '16' : '12'}
                          fill={visuals.pinBackground}
                          opacity={isSelected ? 0.35 : 0.2}
                        />

                        {/* Pin Center Core */}
                        <circle
                          r={isSelected ? '9' : '7'}
                          fill={visuals.pinBackground}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />

                        {/* Pin Center Dot */}
                        <circle r="2.5" fill="#FFFFFF" />

                        {/* Floating Label */}
                        <g transform="translate(14, -6)">
                          <rect
                            x="0"
                            y="-11"
                            width={site.shortName.length * 7 + 16}
                            height="18"
                            rx="3"
                            fill={isSelected ? '#0F172A' : '#1E293B'}
                            stroke={isSelected ? visuals.pinBackground : '#475569'}
                            strokeWidth={isSelected ? '1.5' : '1'}
                            opacity="0.9"
                          />
                          <text
                            x="6"
                            y="2"
                            fill="#FFFFFF"
                            fontSize="10"
                            fontFamily="sans-serif"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                          >
                            {site.shortName}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Vector GIS Floating Site Card (Bottom Right) */}
                {selectedSite && (
                  <div className="absolute top-14 right-3 z-10 max-w-sm bg-white/95 backdrop-blur-xs border-2 border-slate-900 rounded-sm p-4 shadow-2xl text-slate-900 font-sans">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase ${
                          getStatusVisuals(selectedSite.mostUrgentInterval?.status || 'compliant').bgBadge
                        }`}
                      >
                        {getStatusVisuals(selectedSite.mostUrgentInterval?.status || 'compliant').label}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                        {selectedSite.overallComplianceScore}% SANS Score
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-[#0A192F] leading-snug">
                      {selectedSite.siteName}
                    </h3>
                    <div className="text-xs text-slate-600 font-medium">
                      {selectedSite.clientOrganisation}
                    </div>

                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-sm p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedSite.address}, {selectedSite.city}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedSite.panelModel} ({selectedSite.deviceCount} Devices)</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">{selectedSite.mostUrgentInterval?.label}:</strong>{' '}
                          <span className={getStatusVisuals(selectedSite.mostUrgentInterval?.status || 'compliant').textColor}>
                            {selectedSite.earliestDueDays < 0
                              ? `Past due by ${Math.abs(selectedSite.earliestDueDays)} days`
                              : `Due in ${selectedSite.earliestDueDays} days`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Assigned: {selectedSite.mostUrgentInterval?.assignedTechnician?.name} ({selectedSite.mostUrgentInterval?.assignedTechnician?.saqccNumber})</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMaintenanceCheck(selectedSite)}
                        className="bg-[#CC0000] hover:bg-red-700 text-white font-mono text-xs font-bold py-1.5 px-3 rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Audit SANS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenScheduler(selectedSite)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold py-1.5 px-3 rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Visit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right / Sidebar: Site Directory & Quick Audit Actions */}
        {sidebarOpen && (
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-400" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                    Client Sites Directory ({filteredSites.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Click to focus</span>
              </div>

              {/* Scrollable list of sites */}
              <div className="max-h-[525px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
                {filteredSites.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">
                    No client sites match the current compliance filters.
                  </div>
                ) : (
                  filteredSites.map((site) => {
                    const visuals = getStatusVisuals(site.mostUrgentInterval?.status || 'compliant');
                    const isSelected = selectedSiteId === site.siteId;

                    return (
                      <div
                        key={site.siteId}
                        id={`site-card-${site.siteId}`}
                        onClick={() => setSelectedSiteId(site.siteId)}
                        className={`p-3 rounded-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50/50 border-[#CC0000] shadow-sm ring-1 ring-[#CC0000]'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase ${visuals.bgBadge}`}
                            >
                              {visuals.label}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 mt-1 leading-tight">
                              {site.siteName}
                            </h4>
                            <p className="text-[11px] text-slate-600">{site.shortName} • {site.city}</p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-xs text-slate-800">
                              {site.overallComplianceScore}%
                            </span>
                            <div className="text-[9px] font-mono text-slate-400">Compliance</div>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded-xs border border-slate-100 flex items-center justify-between">
                          <span>Urgent: {site.mostUrgentInterval?.label}</span>
                          <span className={`font-bold ${visuals.textColor}`}>
                            {site.earliestDueDays < 0
                              ? `${Math.abs(site.earliestDueDays)}d overdue`
                              : `${site.earliestDueDays}d remaining`}
                          </span>
                        </div>

                        {/* Card Action footer */}
                        <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMaintenanceCheck(site);
                            }}
                            className="text-[11px] font-mono font-bold text-[#CC0000] hover:text-red-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Audit SANS</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeviceQRGenerator(site.siteId);
                            }}
                            className="text-[11px] font-mono font-bold text-slate-700 hover:text-[#CC0000] flex items-center gap-1 cursor-pointer"
                            title="Print QR device labels for this site"
                          >
                            <QrCode className="w-3 h-3 text-[#CC0000]" />
                            <span>QR Labels</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSiteId(site.siteId);
                            }}
                            className="text-[11px] font-mono text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Locate</span>
                            <Navigation className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
