import React, { useState, useRef, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Download,
  Flame,
  Radio,
  Bell,
  Cpu,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  FileImage,
  Building2,
  Boxes,
  Stethoscope,
  Server,
  ShoppingBag,
  RefreshCw,
  Layers,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Activity,
  Play,
  RotateCcw,
  Crosshair,
  Move,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FloorPlanGeneratorModal } from './FloorPlanGeneratorModal';
import { InteractiveFloorplanOverlay } from './InteractiveFloorplanOverlay';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../../data/serviceDueData';
import {
  GeneratedFloorPlan,
  BuildingArchetype,
  MappedFloorDevice,
  BlueprintTheme
} from '../../types/floorplan';
import {
  generateArchitecturalFloorPlan,
  exportSvgToPng,
  BLUEPRINT_THEMES
} from '../../services/floorPlanGeneratorService';

const INITIAL_BLUEPRINT_DEVICES: MappedFloorDevice[] = [
  {
    id: 'DEV-FACP-01',
    type: 'panel',
    label: 'Main FACP (Ziton ZP3 Master Panel)',
    xPercent: 12,
    yPercent: 78,
    zone: 'Zone 1 - Main Entrance',
    lastServicedDate: '2026-08-15',
    status: 'operational',
    loopNumber: 1,
    addressNumber: 1,
    modelNumber: 'Ziton ZP3-2L',
    serialNumber: 'SN-ZP3-2023-991',
    batteryPercent: 98,
    loopVoltage: 24.2,
    signalMargin: 99
  },
  {
    id: 'DEV-MCP-01',
    type: 'call_point',
    label: 'MCP #01 (Break Glass Egress)',
    xPercent: 16,
    yPercent: 74,
    zone: 'Zone 1 - Main Entrance',
    lastServicedDate: '2026-08-15',
    status: 'operational',
    loopNumber: 1,
    addressNumber: 5,
    modelNumber: 'KAC EN54-11 Red MCP',
    serialNumber: 'SN-KAC-44102',
    batteryPercent: 100,
    loopVoltage: 23.8,
    signalMargin: 97
  },
  {
    id: 'DEV-OPT-01',
    type: 'smoke',
    label: 'Optical Smoke #101 (Boardroom)',
    xPercent: 28,
    yPercent: 35,
    zone: 'Zone 1 - Executive Boardroom',
    lastServicedDate: '2026-06-10',
    status: 'due_service',
    loopNumber: 1,
    addressNumber: 14,
    modelNumber: 'Apollo Discovery Optical',
    serialNumber: 'SN-AP-88120',
    contaminationPercent: 24,
    batteryPercent: 94,
    loopVoltage: 22.4,
    signalMargin: 91
  },
  {
    id: 'DEV-OPT-02',
    type: 'smoke',
    label: 'Optical Smoke #102 (Workstations)',
    xPercent: 55,
    yPercent: 30,
    zone: 'Zone 2 - Open Plan Workstations',
    lastServicedDate: '2026-08-20',
    status: 'operational',
    loopNumber: 1,
    addressNumber: 22,
    modelNumber: 'Apollo Discovery Optical',
    serialNumber: 'SN-AP-88125',
    contaminationPercent: 12,
    batteryPercent: 97,
    loopVoltage: 23.1,
    signalMargin: 96
  },
  {
    id: 'DEV-SND-01',
    type: 'sounder',
    label: 'Sounder / Beacon #01 (Central)',
    xPercent: 50,
    yPercent: 18,
    zone: 'Zone 2 - Central Corridor',
    lastServicedDate: '2026-08-20',
    status: 'operational',
    loopNumber: 1,
    addressNumber: 30,
    modelNumber: 'Vantage Multi-Tone Beacon',
    serialNumber: 'SN-VNT-10992',
    batteryPercent: 96,
    loopVoltage: 23.0,
    signalMargin: 98
  },
  {
    id: 'DEV-HEAT-01',
    type: 'heat',
    label: 'Rate-of-Rise Heat #201 (Server UPS)',
    xPercent: 82,
    yPercent: 28,
    zone: 'Zone 3 - Server Room & UPS Hub',
    lastServicedDate: '2026-08-28',
    status: 'operational',
    loopNumber: 2,
    addressNumber: 4,
    modelNumber: 'Apollo Discovery Heat A1R',
    serialNumber: 'SN-AP-99014',
    contaminationPercent: 8,
    batteryPercent: 99,
    loopVoltage: 23.6,
    signalMargin: 98
  },
  {
    id: 'DEV-OPT-03',
    type: 'smoke',
    label: 'Optical Smoke #202 (Plant Room)',
    xPercent: 82,
    yPercent: 70,
    zone: 'Zone 4 - Electrical Plant Room',
    lastServicedDate: '2026-05-12',
    status: 'fault',
    loopNumber: 2,
    addressNumber: 18,
    modelNumber: 'Apollo Discovery Optical',
    serialNumber: 'SN-AP-99032',
    contaminationPercent: 41,
    faultDescription: 'Chamber Contamination Obscuration > 35% - SANS Calibrate Required',
    batteryPercent: 82,
    loopVoltage: 21.2,
    signalMargin: 64
  },
  {
    id: 'DEV-MCP-02',
    type: 'call_point',
    label: 'MCP #02 (Emergency Egress Stairwell)',
    xPercent: 88,
    yPercent: 85,
    zone: 'Zone 4 - Fire Escape Stairwell',
    lastServicedDate: '2026-08-15',
    status: 'operational',
    loopNumber: 2,
    addressNumber: 28,
    modelNumber: 'KAC EN54-11 Red MCP',
    serialNumber: 'SN-KAC-44118',
    batteryPercent: 100,
    loopVoltage: 23.9,
    signalMargin: 97
  }
];

export const FloorPlanBlueprintViewer: React.FC = () => {
  const { serviceRequests, showToast } = useApp();

  // Active client site selection
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    CLIENT_SITE_MAINTENANCE_PROFILES[0]?.siteId || 'site-01'
  );

  const activeSiteProfile = useMemo(() => {
    return (
      CLIENT_SITE_MAINTENANCE_PROFILES.find((s) => s.siteId === selectedSiteId) ||
      CLIENT_SITE_MAINTENANCE_PROFILES[0]
    );
  }, [selectedSiteId]);

  // Active Floor Plan Model
  const [activePlan, setActivePlan] = useState<GeneratedFloorPlan>(() => {
    return generateArchitecturalFloorPlan({
      siteReference: activeSiteProfile.siteId.toUpperCase(),
      customerName: activeSiteProfile.clientOrganisation,
      facilityName: activeSiteProfile.siteName,
      archetype:
        activeSiteProfile.siteId === 'site-01'
          ? 'industrial_warehouse'
          : activeSiteProfile.siteId === 'site-02'
          ? 'healthcare_clinic'
          : 'commercial_office',
      theme: 'blueprint_blue',
      sansCategory: 'L1',
      squareMeters: 1450,
      zoneCount: 4,
      ceilingHeight: 3.2,
      hasCleanAgentGasRoom: true,
      hasLithiumBatteryRoom: true,
      hasKitchenExtraction: false,
      hasEmergencyGenset: true
    });
  });

  // Interactive Device overlay state
  const [devices, setDevices] = useState<MappedFloorDevice[]>(INITIAL_BLUEPRINT_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<MappedFloorDevice | null>(null);
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [selectedDeviceTypeToPlace, setSelectedDeviceTypeToPlace] =
    useState<MappedFloorDevice['type']>('smoke');
  const [activeFloorLevel, setActiveFloorLevel] = useState<'ground' | 'first' | 'basement'>('ground');

  // Interactive site-map overlay settings
  const [overlayEngine, setOverlayEngine] = useState<'svg' | 'canvas' | 'hybrid'>('hybrid');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'operational' | 'due_service' | 'fault' | 'testing' | 'alarm'
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'smoke' | 'heat' | 'call_point' | 'sounder' | 'panel'>('all');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [showCoverageRadius, setShowCoverageRadius] = useState(true);
  const [showCoverageHeatmap, setShowCoverageHeatmap] = useState(false);

  // Fire drill simulation state
  const [isAlarmDrillActive, setIsAlarmDrillActive] = useState(false);
  const [alarmSimulatingDeviceId, setAlarmSimulatingDeviceId] = useState<string | null>(null);

  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generator Modal state
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const svgElementRef = useRef<SVGSVGElement | null>(null);

  // Switch site profile and update floor plan
  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = CLIENT_SITE_MAINTENANCE_PROFILES.find((s) => s.siteId === siteId);
    if (!site) return;

    let targetArchetype: BuildingArchetype = 'commercial_office';
    if (site.siteId === 'site-01') targetArchetype = 'industrial_warehouse';
    else if (site.siteId === 'site-02') targetArchetype = 'healthcare_clinic';
    else if (site.siteId === 'site-04') targetArchetype = 'data_center';
    else if (site.siteId === 'site-05') targetArchetype = 'retail_commercial';

    const newPlan = generateArchitecturalFloorPlan({
      siteReference: site.siteId.toUpperCase(),
      customerName: site.clientOrganisation,
      facilityName: site.siteName,
      archetype: targetArchetype,
      theme: activePlan.theme || 'blueprint_blue',
      sansCategory: site.systemCategory.includes('P1') ? 'P1' : 'L1',
      squareMeters: targetArchetype === 'industrial_warehouse' ? 3800 : 1600,
      zoneCount: 4,
      ceilingHeight: targetArchetype === 'industrial_warehouse' ? 8.5 : 3.0,
      hasCleanAgentGasRoom: true,
      hasLithiumBatteryRoom: targetArchetype === 'industrial_warehouse' || targetArchetype === 'data_center',
      hasKitchenExtraction: targetArchetype === 'retail_commercial',
      hasEmergencyGenset: true
    });

    setActivePlan(newPlan);
    setDevices(newPlan.suggestedDevices);
    setSelectedDevice(null);
    setAlarmSimulatingDeviceId(null);
    setIsAlarmDrillActive(false);
    showToast('info', 'Site Floorplan Loaded', `Loaded ${site.siteName} (${targetArchetype.replace('_', ' ')})`);
  };

  // Quick Archetype switcher
  const handleQuickSwitchArchetype = (arch: BuildingArchetype) => {
    const newPlan = generateArchitecturalFloorPlan({
      siteReference: activeSiteProfile.siteId.toUpperCase(),
      customerName: activeSiteProfile.clientOrganisation,
      facilityName: activeSiteProfile.siteName,
      archetype: arch,
      theme: activePlan.theme || 'blueprint_blue',
      sansCategory: activePlan.sansCategory || 'L1',
      squareMeters: arch === 'industrial_warehouse' ? 3800 : arch === 'retail_commercial' ? 2400 : 1200,
      zoneCount: 4,
      ceilingHeight: arch === 'industrial_warehouse' ? 8.5 : 2.8,
      hasCleanAgentGasRoom: true,
      hasLithiumBatteryRoom: arch === 'data_center' || arch === 'industrial_warehouse',
      hasKitchenExtraction: arch === 'retail_commercial',
      hasEmergencyGenset: true
    });
    setActivePlan(newPlan);
    setDevices(newPlan.suggestedDevices);
    setSelectedDevice(null);
    showToast('info', 'Blueprint Updated', `Loaded ${newPlan.title} (${newPlan.rooms.length} zones).`);
  };

  const handleApplyGeneratedPlan = (plan: GeneratedFloorPlan) => {
    setActivePlan(plan);
    setDevices(plan.suggestedDevices);
    setSelectedDevice(null);
  };

  // Device placement on floorplan
  const handlePlaceDevice = (xPercent: number, yPercent: number) => {
    const newId = `DEV-PIN-${Math.floor(100 + Math.random() * 900)}`;
    const typeNames: Record<string, string> = {
      smoke: 'Optical Smoke Detector',
      heat: 'Heat / Thermal Detector',
      call_point: 'Manual Call Point',
      sounder: 'Alarm Sounder / Strobe',
      panel: 'Repeater / Sub-Panel'
    };

    // Calculate room & zone
    const canvasX = (xPercent / 100) * 1000;
    const canvasY = (yPercent / 100) * 562;
    const matchedRoom = activePlan.rooms.find(
      (r) =>
        canvasX >= r.x &&
        canvasX <= r.x + r.width &&
        canvasY >= r.y &&
        canvasY <= r.y + r.height
    );

    const assignedZone = matchedRoom ? matchedRoom.zoneName : 'Zone 1 - Main Perimeter';

    const newDevice: MappedFloorDevice = {
      id: newId,
      type: selectedDeviceTypeToPlace,
      label: `${typeNames[selectedDeviceTypeToPlace]} #${newId.replace('DEV-PIN-', '')}`,
      xPercent,
      yPercent,
      zone: assignedZone,
      lastServicedDate: new Date().toISOString().split('T')[0],
      status: 'operational',
      loopNumber: 1,
      addressNumber: devices.length + 1,
      batteryPercent: 100,
      loopVoltage: 23.8,
      signalMargin: 98,
      contaminationPercent: 10
    };

    setDevices((prev) => [...prev, newDevice]);
    setSelectedDevice(newDevice);
    setIsPinModeActive(false);
    showToast('success', 'Device Plotted', `Placed ${newDevice.label} in ${assignedZone} at (${xPercent}%, ${yPercent}%).`);
  };

  const handleUpdateDevice = (updated: MappedFloorDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (selectedDevice?.id === updated.id) {
      setSelectedDevice(updated);
    }
  };

  const handleDeleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (selectedDevice?.id === id) setSelectedDevice(null);
    if (alarmSimulatingDeviceId === id) {
      setAlarmSimulatingDeviceId(null);
      setIsAlarmDrillActive(false);
    }
    showToast('info', 'Pin Removed', `Removed device ${id} from floor schematic.`);
  };

  // Quick Status Actions from Device Inspector
  const handleSetDeviceStatus = (status: MappedFloorDevice['status'], note?: string) => {
    if (!selectedDevice) return;
    const updated: MappedFloorDevice = {
      ...selectedDevice,
      status,
      lastServicedDate: status === 'operational' ? new Date().toISOString().split('T')[0] : selectedDevice.lastServicedDate,
      contaminationPercent: status === 'operational' ? 12 : status === 'fault' ? 42 : selectedDevice.contaminationPercent,
      faultDescription: status === 'fault' ? note || 'High chamber obscuration / optical scatter error' : undefined
    };
    handleUpdateDevice(updated);
    showToast(
      status === 'operational' ? 'success' : status === 'fault' ? 'error' : 'info',
      'Device Status Updated',
      `${selectedDevice.id} set to ${status.toUpperCase().replace('_', ' ')}.`
    );
  };

  // Fire Drill / Alarm Simulation trigger
  const handleToggleAlarmDrill = () => {
    if (isAlarmDrillActive) {
      setIsAlarmDrillActive(false);
      setAlarmSimulatingDeviceId(null);
      showToast('info', 'Fire Drill Reset', 'Fire alarm system restored to normal standby mode.');
    } else {
      // Pick selected device or first MCP/smoke detector to trip
      const triggerDevice =
        selectedDevice ||
        devices.find((d) => d.type === 'call_point') ||
        devices.find((d) => d.type === 'smoke') ||
        devices[0];

      if (triggerDevice) {
        setIsAlarmDrillActive(true);
        setAlarmSimulatingDeviceId(triggerDevice.id);
        setSelectedDevice(triggerDevice);
        showToast(
          'error',
          '🔥 SANS 10139 ALARM SIMULATION ACTIVE',
          `Alarm triggered at ${triggerDevice.id} (${triggerDevice.label}). Sounders and egress routes active!`
        );
      }
    }
  };

  const handleExportPngImage = async () => {
    if (!svgElementRef.current) return;
    setIsExportingPng(true);
    try {
      showToast('info', 'Rendering High-Res PNG', 'Generating 2000x1124 CAD blueprint with device status overlay...');
      const filename = `FloorPlan_SiteMap_${activePlan.archetype}_${activeSiteProfile.siteId.toUpperCase()}.png`;
      await exportSvgToPng(svgElementRef.current, filename);
      showToast('success', 'Image Downloaded', `Saved ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Export Failed', 'Could not export high resolution image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleExportBlueprintData = () => {
    const dataStr = JSON.stringify(
      {
        siteId: activeSiteProfile.siteId,
        siteName: activeSiteProfile.siteName,
        customer: activeSiteProfile.clientOrganisation,
        facilityTitle: activePlan.title,
        archetype: activePlan.archetype,
        floorLevel: activeFloorLevel,
        mappedDeviceCount: devices.length,
        devices: devices,
        rooms: activePlan.rooms,
        sansComplianceNotes: activePlan.sansComplianceNotes,
        exportedAt: new Date().toISOString()
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SANS_SiteMap_${activePlan.archetype}_${activeSiteProfile.siteId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Export Complete', 'Floor plan site-map device schedule exported.');
  };

  // Device stats counts
  const deviceStats = useMemo(() => {
    return {
      total: devices.length,
      operational: devices.filter((d) => d.status === 'operational').length,
      due: devices.filter((d) => d.status === 'due_service').length,
      fault: devices.filter((d) => d.status === 'fault').length,
      testing: devices.filter((d) => d.status === 'testing').length,
      smokes: devices.filter((d) => d.type === 'smoke').length,
      heats: devices.filter((d) => d.type === 'heat').length,
      mcps: devices.filter((d) => d.type === 'call_point').length,
      sounders: devices.filter((d) => d.type === 'sounder').length,
      panels: devices.filter((d) => d.type === 'panel').length
    };
  }, [devices]);

  return (
    <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-5 shadow-2xl">
      {/* Top Header & Site Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
              SANS 10139 CAD SITE-MAP OVERLAY
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{overlayEngine.toUpperCase()} OVERLAY</span>
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Live Device Location &amp; Telemetry Status Plotter
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-black text-white tracking-tight">
              {activePlan.title}
            </h3>

            {/* Site selector dropdown */}
            <select
              value={selectedSiteId}
              onChange={(e) => handleSelectSite(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-900 text-cyan-300 font-mono font-bold"
            >
              {CLIENT_SITE_MAINTENANCE_PROFILES.map((site) => (
                <option key={site.siteId} value={site.siteId}>
                  {site.siteName} ({site.city})
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Interactive CAD site-map overlay with real-time sensor radar, live drag-and-drop plotting, SANS 10139 7.5m coverage radiuses, and alarm simulation.
          </p>
        </div>

        {/* Action Controls: Fire Drill, Generate, Download PNG, Export JSON */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Fire Drill Simulation Button */}
          <button
            type="button"
            onClick={handleToggleAlarmDrill}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              isAlarmDrillActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white'
            }`}
          >
            {isAlarmDrillActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAlarmDrillActive ? 'Reset Fire Drill' : 'Simulate Fire Drill'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Plan</span>
          </button>

          <button
            type="button"
            onClick={handleExportPngImage}
            disabled={isExportingPng}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Download crisp 2000x1124 CAD blueprint PNG image"
          >
            <FileImage className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExportingPng ? 'Rendering...' : 'Download Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportBlueprintData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Alarm Simulation Alert Banner (when drill is running) */}
      {isAlarmDrillActive && (
        <div className="bg-rose-950/80 border border-rose-600/80 rounded-xl p-3 px-4 flex items-center justify-between gap-4 text-white animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-rose-300 uppercase tracking-wider">
                SANS 10139 EVACUATION DRILL ACTIVE
              </div>
              <div className="text-xs text-white">
                Alarm transmission simulated at <strong>{alarmSimulatingDeviceId}</strong>. Connected sounders strobing and emergency egress paths highlighted green.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleAlarmDrill}
            className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
          >
            Silence / Reset FACP
          </button>
        </div>
      )}

      {/* Control Bar: Overlay Engine, Layer Filters, Coverage Toggles, Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        {/* Overlay Engine Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Overlay:
          </span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(['hybrid', 'svg', 'canvas'] as const).map((eng) => (
              <button
                key={eng}
                type="button"
                onClick={() => setOverlayEngine(eng)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  overlayEngine === eng
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {eng === 'hybrid' ? 'Hybrid Sync' : eng}
              </button>
            ))}
          </div>
        </div>

        {/* Coverage Radiuses & Heatmap Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCoverageRadius(!showCoverageRadius)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors cursor-pointer ${
              showCoverageRadius
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            7.5m Smoke Radiuses: {showCoverageRadius ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowCoverageHeatmap(!showCoverageHeatmap)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors cursor-pointer ${
              showCoverageHeatmap
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Density Heatmap: {showCoverageHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[10px] font-mono text-cyan-400 font-bold min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Reset Zoom & Pan"
          >
            Reset
          </button>
        </div>

        {/* Pin Placement Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDeviceTypeToPlace}
            onChange={(e) => setSelectedDeviceTypeToPlace(e.target.value as any)}
            className="px-2 py-1 text-xs rounded-md border border-slate-700 bg-slate-800 text-slate-200 font-mono"
          >
            <option value="smoke">Optical Smoke (SANS Cl. 25.3.3)</option>
            <option value="heat">Heat Detector (Thermal)</option>
            <option value="call_point">Manual Call Point (MCP)</option>
            <option value="sounder">Sounder / Strobe Beacon</option>
            <option value="panel">Control Repeater / Panel</option>
          </select>

          <button
            type="button"
            onClick={() => setIsPinModeActive(!isPinModeActive)}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isPinModeActive
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isPinModeActive ? 'Click Plan to Drop' : 'Place Pin'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Status Filters, Type Filters, Floor Level */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: `All (${deviceStats.total})`, color: 'bg-slate-800 text-slate-300' },
            { id: 'operational', label: `Operational (${deviceStats.operational})`, color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
            { id: 'due_service', label: `Due (${deviceStats.due})`, color: 'bg-amber-950 text-amber-300 border-amber-800' },
            { id: 'fault', label: `Fault (${deviceStats.fault})`, color: 'bg-rose-950 text-rose-300 border-rose-800' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-xs'
                  : `${f.color} hover:text-white`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Device Type Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
            Type:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'smoke', label: 'Smoke' },
            { id: 'heat', label: 'Heat' },
            { id: 'call_point', label: 'MCP' },
            { id: 'sounder', label: 'Sounder' },
            { id: 'panel', label: 'Panel' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id as any)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Floor Level Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
            Floor:
          </span>
          {(['ground', 'first', 'basement'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveFloorLevel(level)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold capitalize transition-colors cursor-pointer ${
                activeFloorLevel === level
                  ? 'bg-[#CC0000] text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Plan Blueprint & Interactive Site-Map Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas & SVG Floor Plan Viewer */}
        <div className="lg:col-span-3 bg-[#071322] border border-blue-900/50 rounded-xl overflow-hidden relative shadow-2xl">
          {/* Overlay Status Bar */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 flex-wrap pointer-events-none">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-800 backdrop-blur-xs">
              CAD SCALE 1:100 &bull; SANS 10139
            </span>

            {isPinModeActive && (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950 animate-bounce pointer-events-auto">
                CLICK ANY SPACE TO PLOT {selectedDeviceTypeToPlace.toUpperCase()}
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 bg-slate-900/80 border border-slate-700 backdrop-blur-xs">
              Drag pins to reposition &bull; Hover for telemetry HUD
            </span>
          </div>

          {/* Interactive Canvas / SVG Floorplan Overlay Component */}
          <InteractiveFloorplanOverlay
            plan={activePlan}
            devices={devices}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            isPinModeActive={isPinModeActive}
            selectedDeviceTypeToPlace={selectedDeviceTypeToPlace}
            onPlaceDevice={handlePlaceDevice}
            showCoverageRadius={showCoverageRadius}
            showCoverageHeatmap={showCoverageHeatmap}
            overlayEngine={overlayEngine}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            zoneFilter={activeZoneFilter}
            alarmSimulatingDeviceId={alarmSimulatingDeviceId}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            onPanChange={setPanOffset}
            svgRef={svgElementRef}
          />
        </div>

        {/* Selected Device Telemetry Inspector & Control Panel */}
        <div className="space-y-4">
          {selectedDevice ? (
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-4 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {selectedDevice.type.toUpperCase()} PIN
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {selectedDevice.label}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400">
                    ID: {selectedDevice.id} &bull; {selectedDevice.modelNumber || 'Standard EN54 Detector'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDevice(selectedDevice.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Device Pin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Indicator Pill */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Operational Status:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    selectedDevice.status === 'operational'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : selectedDevice.status === 'due_service'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : selectedDevice.status === 'fault'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {selectedDevice.status.replace('_', ' ')}
                </span>
              </div>

              {/* Live Telemetry Gauges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Chamber Contam</span>
                  <span
                    className={`text-base font-bold ${
                      (selectedDevice.contaminationPercent || 10) > 30
                        ? 'text-rose-400'
                        : (selectedDevice.contaminationPercent || 10) > 20
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedDevice.contaminationPercent || 14}%
                  </span>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (selectedDevice.contaminationPercent || 10) > 30 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, selectedDevice.contaminationPercent || 14)}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Loop Voltage</span>
                  <span className="text-base font-bold text-cyan-400">
                    {selectedDevice.loopVoltage || 23.4}V
                  </span>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Signal Margin</span>
                  <span className="text-base font-bold text-blue-400">
                    {selectedDevice.signalMargin || 96}%
                  </span>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${selectedDevice.signalMargin || 96}%` }} />
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Battery Standby</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedDevice.batteryPercent || 98}%
                  </span>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${selectedDevice.batteryPercent || 98}%` }} />
                  </div>
                </div>
              </div>

              {/* Coordinates & Zone assignment */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Zone Assignment:</span>
                  <span className="text-white font-semibold text-right truncate max-w-[140px]">
                    {selectedDevice.zone}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Floor Coordinates:</span>
                  <span className="text-cyan-300">
                    ({selectedDevice.xPercent}%, {selectedDevice.yPercent}%)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SANS Address:</span>
                  <span className="text-slate-200">
                    Loop {selectedDevice.loopNumber || 1} &bull; Addr {selectedDevice.addressNumber || 12}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Last Serviced:</span>
                  <span className="text-slate-200">
                    {selectedDevice.lastServicedDate || 'Pending Inspection'}
                  </span>
                </div>
              </div>

              {/* Quick Status Modifiers */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Quick SANS Status Actions:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetDeviceStatus('operational')}
                    className="px-2 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    &bull; Mark Tested OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDeviceStatus('due_service')}
                    className="px-2 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    &bull; Flag Due Service
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDeviceStatus('fault', 'Chamber contaminated / optical drift error')}
                    className="px-2 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    &bull; Log Defect / Fault
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAlarmDrillActive(true);
                      setAlarmSimulatingDeviceId(selectedDevice.id);
                      showToast('error', 'Alarm Simulated', `Triggered alarm at ${selectedDevice.id}.`);
                    }}
                    className="px-2 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded text-[11px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    &bull; Simulate Trip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-center space-y-2 py-8">
              <Eye className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-bold text-slate-300">No Device Selected</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any device on the floorplan to inspect live telemetry and update its SANS compliance status, or click <strong>Place Pin</strong> to add detectors.
              </p>
            </div>
          )}

          {/* SANS 10139 Legend & Device Totals */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between">
              <span>Site-Map Device Inventory</span>
              <span className="text-cyan-400 font-bold">{devices.length} Total</span>
            </h5>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Optical Smoke (7.5m)</span>
                </div>
                <span className="font-bold text-white">{deviceStats.smokes}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Heat Detectors (5.3m)</span>
                </div>
                <span className="font-bold text-white">{deviceStats.heats}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Manual Call Points (MCP)</span>
                </div>
                <span className="font-bold text-white">{deviceStats.mcps}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-pink-400" />
                  <span>Sounders / Strobes (65 dBA)</span>
                </div>
                <span className="font-bold text-white">{deviceStats.sounders}</span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Control Panels (FACP)</span>
                </div>
                <span className="font-bold text-white">{deviceStats.panels}</span>
              </div>
            </div>

            {/* SANS Compliance Note Callout */}
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/60 text-[10px] text-blue-300 font-mono space-y-1">
              <div className="font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SANS 10139 Geometry Verified</span>
              </div>
              <p>Coverage: {activePlan.squareMeters} m² | Max Travel &le; 30m | 24h Battery Autonomy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Modal */}
      <FloorPlanGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onApplyPlan={handleApplyGeneratedPlan}
        initialSiteReference={activeSiteProfile.siteId.toUpperCase()}
        initialCustomerName={activeSiteProfile.clientOrganisation}
        initialFacilityName={activeSiteProfile.siteName}
      />
    </div>
  );
};
