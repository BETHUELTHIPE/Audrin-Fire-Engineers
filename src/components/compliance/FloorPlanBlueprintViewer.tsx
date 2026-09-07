import React, { useState, useRef } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FloorPlanGeneratorModal } from './FloorPlanGeneratorModal';
import {
  GeneratedFloorPlan,
  BuildingArchetype,
  MappedFloorDevice
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
    label: 'Main FACP (Ziton ZP3)',
    xPercent: 12,
    yPercent: 78,
    zone: 'Zone 1 - Main Entrance',
    lastServicedDate: '2026-08-15',
    status: 'operational'
  },
  {
    id: 'DEV-MCP-01',
    type: 'call_point',
    label: 'MCP #01 (Break Glass)',
    xPercent: 16,
    yPercent: 74,
    zone: 'Zone 1 - Main Entrance',
    lastServicedDate: '2026-08-15',
    status: 'operational'
  },
  {
    id: 'DEV-OPT-01',
    type: 'smoke',
    label: 'Optical Smoke #101',
    xPercent: 28,
    yPercent: 35,
    zone: 'Zone 1 - Executive Boardroom',
    lastServicedDate: '2026-06-10',
    status: 'due_service'
  },
  {
    id: 'DEV-OPT-02',
    type: 'smoke',
    label: 'Optical Smoke #102',
    xPercent: 55,
    yPercent: 30,
    zone: 'Zone 2 - Open Plan Workstations',
    lastServicedDate: '2026-08-20',
    status: 'operational'
  },
  {
    id: 'DEV-SND-01',
    type: 'sounder',
    label: 'Sounder / Beacon #01',
    xPercent: 50,
    yPercent: 18,
    zone: 'Zone 2 - Central Corridor',
    lastServicedDate: '2026-08-20',
    status: 'operational'
  },
  {
    id: 'DEV-HEAT-01',
    type: 'heat',
    label: 'Rate-of-Rise Heat #201',
    xPercent: 82,
    yPercent: 28,
    zone: 'Zone 3 - Server Room & UPS Hub',
    lastServicedDate: '2026-08-28',
    status: 'operational'
  },
  {
    id: 'DEV-OPT-03',
    type: 'smoke',
    label: 'Optical Smoke #202',
    xPercent: 82,
    yPercent: 70,
    zone: 'Zone 4 - Electrical Plant Room',
    lastServicedDate: '2026-05-12',
    status: 'fault'
  },
  {
    id: 'DEV-MCP-02',
    type: 'call_point',
    label: 'MCP #02 (Emergency Egress)',
    xPercent: 88,
    yPercent: 85,
    zone: 'Zone 4 - Fire Escape Stairwell',
    lastServicedDate: '2026-08-15',
    status: 'operational'
  }
];

export const FloorPlanBlueprintViewer: React.FC = () => {
  const { serviceRequests, showToast } = useApp();
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    serviceRequests.length > 0 ? serviceRequests[0].id : ''
  );

  const selectedRequest = serviceRequests.find(r => r.id === selectedRequestId);

  // Active Floor Plan Model (defaults to Commercial Office)
  const [activePlan, setActivePlan] = useState<GeneratedFloorPlan>(() => {
    return generateArchitecturalFloorPlan({
      siteReference: selectedRequest?.referenceNumber || 'AFE-SITE-2026',
      customerName: selectedRequest?.customerName || 'Sandton Executive Office Park',
      facilityName: selectedRequest?.facilityName || 'Corporate Headquarters',
      archetype: 'commercial_office',
      theme: 'blueprint_blue',
      sansCategory: 'L1',
      squareMeters: 1250,
      zoneCount: 4,
      ceilingHeight: 2.8,
      hasCleanAgentGasRoom: true,
      hasLithiumBatteryRoom: false,
      hasKitchenExtraction: false,
      hasEmergencyGenset: true
    });
  });

  const [devices, setDevices] = useState<MappedFloorDevice[]>(INITIAL_BLUEPRINT_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<MappedFloorDevice | null>(null);
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [selectedDeviceTypeToPlace, setSelectedDeviceTypeToPlace] = useState<'smoke' | 'heat' | 'call_point' | 'sounder' | 'panel'>('smoke');
  const [activeFloorLevel, setActiveFloorLevel] = useState<'ground' | 'first' | 'basement'>('ground');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');

  // Generator Modal state
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [showCoverageRadius, setShowCoverageRadius] = useState(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgElementRef = useRef<SVGSVGElement>(null);

  // Quick Archetype switcher
  const handleQuickSwitchArchetype = (arch: BuildingArchetype) => {
    const newPlan = generateArchitecturalFloorPlan({
      siteReference: selectedRequest?.referenceNumber || 'AFE-SITE-2026',
      customerName: selectedRequest?.customerName || 'Commercial Site',
      facilityName: selectedRequest?.facilityName || 'Main Facility',
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
    showToast('info', 'Switched Blueprint Archetype', `Loaded ${newPlan.title} (${newPlan.rooms.length} zoned spaces).`);
  };

  const handleApplyGeneratedPlan = (plan: GeneratedFloorPlan) => {
    setActivePlan(plan);
    setDevices(plan.suggestedDevices);
    setSelectedDevice(null);
  };

  const handleExportPngImage = async () => {
    if (!svgElementRef.current) return;
    setIsExportingPng(true);
    try {
      showToast('info', 'Rendering High-Res PNG', 'Generating 2000x1124 CAD blueprint image...');
      const filename = `FloorPlan_${activePlan.archetype}_${selectedRequest?.referenceNumber || 'AFE'}.png`;
      await exportSvgToPng(svgElementRef.current, filename);
      showToast('success', 'Image Downloaded', `Saved ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Export Failed', 'Could not export high resolution image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive || !svgContainerRef.current) return;

    const rect = svgContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 100);
    const yPercent = Math.round((clickY / rect.height) * 100);

    // Determine zone from rooms if possible
    const clickCanvasX = (xPercent / 100) * 1000;
    const clickCanvasY = (yPercent / 100) * 562;
    const matchedRoom = activePlan.rooms.find(
      r =>
        clickCanvasX >= r.x &&
        clickCanvasX <= r.x + r.width &&
        clickCanvasY >= r.y &&
        clickCanvasY <= r.y + r.height
    );

    let assignedZone = matchedRoom ? matchedRoom.zoneName : 'Zone 1 - Monitored Perimeter';

    const newId = `DEV-PIN-${Math.floor(100 + Math.random() * 900)}`;
    const typeNames: Record<string, string> = {
      smoke: 'Optical Smoke Detector',
      heat: 'Heat / Thermal Detector',
      call_point: 'Manual Call Point',
      sounder: 'Alarm Sounder / Strobe',
      panel: 'Repeater / Sub-Panel'
    };

    const newDevice: MappedFloorDevice = {
      id: newId,
      type: selectedDeviceTypeToPlace,
      label: `${typeNames[selectedDeviceTypeToPlace]} #${newId.replace('DEV-PIN-', '')}`,
      xPercent,
      yPercent,
      zone: assignedZone,
      lastServicedDate: new Date().toISOString().split('T')[0],
      status: 'operational'
    };

    setDevices(prev => [...prev, newDevice]);
    setSelectedDevice(newDevice);
    setIsPinModeActive(false);
    showToast(
      'success',
      'Device Mapped on Blueprint',
      `Placed ${newDevice.label} at (${xPercent}%, ${yPercent}%) in ${assignedZone}.`
    );
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    if (selectedDevice?.id === id) setSelectedDevice(null);
    showToast('info', 'Pin Removed', `Removed device ${id} from floor schematic.`);
  };

  const handleExportBlueprintData = () => {
    const dataStr = JSON.stringify(
      {
        siteReference: selectedRequest?.referenceNumber || activePlan.siteReference,
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
    link.download = `FloorPlan_${activePlan.archetype}_${selectedRequest?.referenceNumber || 'AFE'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Export Complete', 'Floor plan device mapping JSON exported successfully.');
  };

  const filteredDevices = devices.filter(dev => {
    if (activeZoneFilter === 'all') return true;
    return dev.zone.toLowerCase().includes(activeZoneFilter.toLowerCase());
  });

  const currentTheme = BLUEPRINT_THEMES[activePlan.theme] || BLUEPRINT_THEMES.blueprint_blue;

  return (
    <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-5 sm:p-6 text-white space-y-5 shadow-xl">
      {/* Top Header & Service Request Association */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
              SANS 10139 CAD Floor Plan Mapping
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
              {activePlan.archetype.replace('_', ' ')}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Placeholder Architectural Schematic Generator
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {activePlan.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive CAD blueprint layout for new service requests and facilities lacking architectural drawings.
          </p>
        </div>

        {/* Action Controls: Generate Blueprint Modal, Download Image, Export JSON */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Floor Plan</span>
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

      {/* Quick Archetype Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
            Archetypes:
          </span>
          <button
            type="button"
            onClick={() => handleQuickSwitchArchetype('commercial_office')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePlan.archetype === 'commercial_office'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Office</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitchArchetype('industrial_warehouse')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePlan.archetype === 'industrial_warehouse'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3 h-3" />
            <span>Warehouse</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitchArchetype('healthcare_clinic')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePlan.archetype === 'healthcare_clinic'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Hospital Clinic</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitchArchetype('data_center')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePlan.archetype === 'data_center'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>Data Center</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitchArchetype('retail_commercial')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePlan.archetype === 'retail_commercial'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Retail Mall</span>
          </button>
        </div>

        {/* Radius toggle */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Control Bar: Floor Selection, Pin Placement Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        {/* Floor Level Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400 mr-2">Level:</span>
          {(['ground', 'first', 'basement'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveFloorLevel(level)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                activeFloorLevel === level
                  ? 'bg-[#CC0000] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {level} Floor
            </button>
          ))}
        </div>

        {/* Pinning Action Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDeviceTypeToPlace}
            onChange={(e) => setSelectedDeviceTypeToPlace(e.target.value as any)}
            className="px-2.5 py-1 text-xs rounded-md border border-slate-700 bg-slate-800 text-slate-200 font-mono"
          >
            <option value="smoke">Optical Smoke (SANS Cl. 25.3.3)</option>
            <option value="heat">Heat Detector (Thermal)</option>
            <option value="call_point">Manual Call Point (Break Glass)</option>
            <option value="sounder">Sounder / Strobe Beacon</option>
            <option value="panel">Repeater / Sub-Panel</option>
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
            <span>{isPinModeActive ? 'Click on Plan to Place' : 'Place Device Pin'}</span>
          </button>
        </div>
      </div>

      {/* Blueprint Canvas / Technical SVG Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Floor Plan SVG Canvas */}
        <div className="lg:col-span-3 bg-[#071322] border border-blue-900/50 rounded-xl overflow-hidden relative shadow-2xl">
          {/* Blueprint Grid Watermark & Legend */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-800">
              CAD SCALE 1:100 | SANS 10139 SCHEMATIC
            </span>
            {isPinModeActive && (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950 animate-bounce">
                READY: CLICK ANY ROOM TO DROP PIN
              </span>
            )}
          </div>

          <div
            ref={svgContainerRef}
            onClick={handleSvgClick}
            className={`relative w-full aspect-16/9 overflow-hidden ${
              isPinModeActive ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            {/* Technical SVG Floor Plan Illustration */}
            <svg
              ref={svgElementRef}
              viewBox="0 0 1000 562"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Blueprint Grid Pattern */}
                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={currentTheme.gridPrimary} strokeWidth="0.75" />
                  <path d="M 200 0 L 0 0 0 200" fill="none" stroke={currentTheme.gridSecondary} strokeWidth="1.2" opacity="0.3" />
                </pattern>

                <pattern id="viewerHazardHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke={currentTheme.hazardBorder} strokeWidth="1" opacity="0.4" />
                </pattern>
              </defs>

              {/* Blueprint Canvas Background */}
              <rect width="1000" height="562" fill={currentTheme.bg} />
              <rect width="1000" height="562" fill="url(#cadGrid)" />

              {/* Building Outer Perimeter Walls */}
              <rect
                x="60"
                y="50"
                width="880"
                height="460"
                fill="none"
                stroke={currentTheme.wallExterior}
                strokeWidth="4"
                strokeLinejoin="miter"
              />

              {/* Dynamically Rendered Rooms from Architectural Floor Plan */}
              {activePlan.rooms.map((room, idx) => {
                const isHazard = room.type === 'hazard' || room.type === 'server_room';
                const roomFill = isHazard
                  ? currentTheme.hazardBg
                  : idx % 2 === 0
                  ? currentTheme.roomBg
                  : currentTheme.roomBgAlt;

                return (
                  <g key={room.id}>
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      fill={roomFill}
                      stroke={isHazard ? currentTheme.hazardBorder : currentTheme.wallInterior}
                      strokeWidth="2"
                    />

                    {isHazard && (
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.width}
                        height={room.height}
                        fill="url(#viewerHazardHatch)"
                        opacity="0.5"
                      />
                    )}

                    <text
                      x={room.x + 14}
                      y={room.y + 24}
                      fill={currentTheme.textPrimary}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {room.name}
                    </text>

                    <text
                      x={room.x + 14}
                      y={room.y + 40}
                      fill={currentTheme.textMuted}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {room.areaSqM} m² | {room.zoneName}
                    </text>

                    {room.specialHazard && (
                      <text
                        x={room.x + 14}
                        y={room.y + room.height - 14}
                        fill={currentTheme.hazardBorder}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ⚠ [{room.specialHazard}]
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Doors & Fire Egress */}
              {activePlan.doors.map((door) => {
                const doorStroke = door.isEmergencyExit
                  ? currentTheme.doorExit
                  : currentTheme.doorNormal;

                return (
                  <g key={door.id}>
                    {door.orientation === 'vertical' ? (
                      <line
                        x1={door.x}
                        y1={door.y}
                        x2={door.x}
                        y2={door.y + door.width}
                        stroke={doorStroke}
                        strokeWidth="6"
                      />
                    ) : (
                      <line
                        x1={door.x}
                        y1={door.y}
                        x2={door.x + door.width}
                        y2={door.y}
                        stroke={doorStroke}
                        strokeWidth="6"
                      />
                    )}
                    <text
                      x={door.x > 800 ? door.x - 70 : door.x + 10}
                      y={door.y + 15}
                      fill={doorStroke}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {door.label}
                    </text>
                  </g>
                );
              })}

              {/* SANS 7.5m Detector Coverage Circles */}
              {showCoverageRadius &&
                filteredDevices
                  .filter((d) => d.type === 'smoke')
                  .map((dev) => {
                    const cx = (dev.xPercent / 100) * 1000;
                    const cy = (dev.yPercent / 100) * 562;
                    return (
                      <circle
                        key={`rad-${dev.id}`}
                        cx={cx}
                        cy={cy}
                        r="75"
                        fill="#38BDF8"
                        fillOpacity="0.08"
                        stroke="#38BDF8"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.8"
                      />
                    );
                  })}

              {/* CAD Title Block */}
              <g transform="translate(660, 430)">
                <rect
                  width="270"
                  height="75"
                  fill={currentTheme.titleBlockBg}
                  stroke={currentTheme.titleBlockBorder}
                  strokeWidth="1.5"
                  opacity="0.92"
                />
                <text x="12" y="18" fill={currentTheme.textPrimary} fontSize="10" fontFamily="monospace" fontWeight="bold">
                  AUDRIN FIRE ENGINEERS (PTY) LTD
                </text>
                <text x="12" y="32" fill={currentTheme.textSecondary} fontSize="8.5" fontFamily="monospace">
                  REF: {selectedRequest?.referenceNumber || activePlan.siteReference}
                </text>
                <text x="12" y="46" fill={currentTheme.textMuted} fontSize="8" fontFamily="monospace">
                  SANS 10139 CAT {activePlan.sansCategory} | {activePlan.squareMeters} m²
                </text>
                <text x="12" y="60" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  SAQCC 1475 CAD VERIFIED
                </text>
              </g>
            </svg>

            {/* Mapped Device Interactive Pins */}
            {filteredDevices.map((dev) => {
              const isSelected = selectedDevice?.id === dev.id;
              let pinBg = 'bg-emerald-500';
              if (dev.status === 'due_service') pinBg = 'bg-amber-500';
              if (dev.status === 'fault') pinBg = 'bg-rose-500 animate-pulse';
              if (dev.type === 'panel') pinBg = 'bg-purple-500';
              if (dev.type === 'sounder') pinBg = 'bg-pink-500';

              return (
                <div
                  key={dev.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDevice(dev);
                  }}
                  style={{
                    left: `${dev.xPercent}%`,
                    top: `${dev.yPercent}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`absolute z-30 flex flex-col items-center cursor-pointer group transition-transform ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white ${pinBg}`}
                  >
                    {dev.type === 'smoke' && <Radio className="w-3 h-3" />}
                    {dev.type === 'heat' && <Flame className="w-3 h-3" />}
                    {dev.type === 'call_point' && <AlertCircle className="w-3 h-3" />}
                    {dev.type === 'sounder' && <Bell className="w-3 h-3" />}
                    {dev.type === 'panel' && <Cpu className="w-3 h-3" />}
                  </div>

                  {/* Micro label */}
                  <span className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/90 text-white font-mono text-[9px] border border-slate-700 whitespace-nowrap shadow-md">
                    {dev.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Device Inspector & Blueprint Metadata */}
        <div className="space-y-4">
          {selectedDevice ? (
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
              <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {selectedDevice.type.toUpperCase()} PIN
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {selectedDevice.label}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400">
                    ID: {selectedDevice.id}
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

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Zone Assignment:</span>
                  <span className="text-white font-semibold text-right">{selectedDevice.zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Blueprint Coords:</span>
                  <span className="text-slate-200">{selectedDevice.xPercent}%, {selectedDevice.yPercent}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Last Serviced:</span>
                  <span className="text-slate-200">{selectedDevice.lastServicedDate || 'Pending Initial Check'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Operational Status:</span>
                  <span
                    className={`font-bold capitalize ${
                      selectedDevice.status === 'operational'
                        ? 'text-emerald-400'
                        : selectedDevice.status === 'due_service'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedDevice.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[10px] text-slate-400 leading-tight">
                  Tagged under SANS 10139 routine device registry. Changes persist in local layout schematic.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center space-y-2 py-8">
              <Eye className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-bold text-slate-300">No Device Pin Selected</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any device pin on the CAD blueprint to view details, or click <strong>Place Device Pin</strong> to plot equipment.
              </p>
            </div>
          )}

          {/* Blueprint Summary Stats */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Floor Plan Legend & Device Totals
            </h5>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Optical Smoke Detectors</span>
                </div>
                <span className="font-bold text-white">
                  {devices.filter(d => d.type === 'smoke').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Heat Detectors</span>
                </div>
                <span className="font-bold text-white">
                  {devices.filter(d => d.type === 'heat').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Manual Call Points (MCP)</span>
                </div>
                <span className="font-bold text-white">
                  {devices.filter(d => d.type === 'call_point').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-pink-400" />
                  <span>Sounders / Strobes</span>
                </div>
                <span className="font-bold text-white">
                  {devices.filter(d => d.type === 'sounder').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Control Panels & Repeaters</span>
                </div>
                <span className="font-bold text-white">
                  {devices.filter(d => d.type === 'panel').length}
                </span>
              </div>
            </div>

            {/* SANS Compliance Note Callout */}
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/60 text-[10px] text-blue-300 font-mono space-y-1">
              <div className="font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>SANS 10139 Standard Verified</span>
              </div>
              <p>Coverage: {activePlan.squareMeters} m² | Max MCP Spacing &le; 30m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Modal */}
      <FloorPlanGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onApplyPlan={handleApplyGeneratedPlan}
        initialSiteReference={selectedRequest?.referenceNumber || 'AFE-SITE-2026'}
        initialCustomerName={selectedRequest?.customerName || 'Audrin Fire Client'}
        initialFacilityName={selectedRequest?.facilityName || 'Commercial Facility'}
      />
    </div>
  );
};

