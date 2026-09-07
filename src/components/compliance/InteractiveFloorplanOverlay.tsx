import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Radio,
  Flame,
  AlertCircle,
  Bell,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Zap,
  Gauge,
  Layers,
  Crosshair,
  Volume2
} from 'lucide-react';
import {
  GeneratedFloorPlan,
  MappedFloorDevice,
  BlueprintTheme,
  FloorPlanRoom
} from '../../types/floorplan';

// Blueprint visual color themes matching CAD standard
export const BLUEPRINT_THEMES: Record<
  BlueprintTheme,
  {
    bg: string;
    wallExterior: string;
    wallInterior: string;
    roomBg: string;
    roomBgAlt: string;
    doorNormal: string;
    doorExit: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    hazardBg: string;
    hazardBorder: string;
    gridPrimary: string;
    gridSecondary: string;
    titleBlockBg: string;
    titleBlockBorder: string;
  }
> = {
  blueprint_blue: {
    bg: '#07152B',
    wallExterior: '#38BDF8',
    wallInterior: '#1E3A8A',
    roomBg: '#0B2240',
    roomBgAlt: '#0F2B52',
    doorNormal: '#60A5FA',
    doorExit: '#10B981',
    textPrimary: '#E0F2FE',
    textSecondary: '#93C5FD',
    textMuted: '#60A5FA',
    hazardBg: '#3B1A1A',
    hazardBorder: '#EF4444',
    gridPrimary: '#0C264D',
    gridSecondary: '#133566',
    titleBlockBg: '#0A1E3B',
    titleBlockBorder: '#38BDF8'
  },
  charcoal_dark: {
    bg: '#0F172A',
    wallExterior: '#94A3B8',
    wallInterior: '#334155',
    roomBg: '#1E293B',
    roomBgAlt: '#1A2436',
    doorNormal: '#CBD5E1',
    doorExit: '#22C55E',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    hazardBg: '#361E1E',
    hazardBorder: '#F87171',
    gridPrimary: '#1E293B',
    gridSecondary: '#334155',
    titleBlockBg: '#1E293B',
    titleBlockBorder: '#64748B'
  },
  monochrome_white: {
    bg: '#F8FAFC',
    wallExterior: '#0F172A',
    wallInterior: '#475569',
    roomBg: '#FFFFFF',
    roomBgAlt: '#F1F5F9',
    doorNormal: '#334155',
    doorExit: '#15803D',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    hazardBg: '#FEE2E2',
    hazardBorder: '#DC2626',
    gridPrimary: '#E2E8F0',
    gridSecondary: '#CBD5E1',
    titleBlockBg: '#FFFFFF',
    titleBlockBorder: '#0F172A'
  },
  inverted_safety: {
    bg: '#18181B',
    wallExterior: '#FACC15',
    wallInterior: '#3F3F46',
    roomBg: '#27272A',
    roomBgAlt: '#232326',
    doorNormal: '#FDE047',
    doorExit: '#4ADE80',
    textPrimary: '#FEF08A',
    textSecondary: '#FDE047',
    textMuted: '#A1A1AA',
    hazardBg: '#451A1A',
    hazardBorder: '#F87171',
    gridPrimary: '#27272A',
    gridSecondary: '#3F3F46',
    titleBlockBg: '#27272A',
    titleBlockBorder: '#FACC15'
  }
};

export interface InteractiveFloorplanOverlayProps {
  plan: GeneratedFloorPlan;
  devices: MappedFloorDevice[];
  selectedDevice: MappedFloorDevice | null;
  onSelectDevice: (dev: MappedFloorDevice | null) => void;
  onUpdateDevice: (dev: MappedFloorDevice) => void;
  onDeleteDevice?: (id: string) => void;
  isPinModeActive: boolean;
  selectedDeviceTypeToPlace: MappedFloorDevice['type'];
  onPlaceDevice: (xPercent: number, yPercent: number) => void;
  showCoverageRadius: boolean;
  showCoverageHeatmap: boolean;
  overlayEngine: 'svg' | 'canvas' | 'hybrid';
  statusFilter: 'all' | 'operational' | 'due_service' | 'fault' | 'testing' | 'alarm';
  typeFilter: 'all' | 'smoke' | 'heat' | 'call_point' | 'sounder' | 'panel';
  zoneFilter: string;
  alarmSimulatingDeviceId: string | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const InteractiveFloorplanOverlay: React.FC<InteractiveFloorplanOverlayProps> = ({
  plan,
  devices,
  selectedDevice,
  onSelectDevice,
  onUpdateDevice,
  isPinModeActive,
  onPlaceDevice,
  showCoverageRadius,
  showCoverageHeatmap,
  overlayEngine,
  statusFilter,
  typeFilter,
  zoneFilter,
  alarmSimulatingDeviceId,
  zoomLevel,
  panOffset,
  onPanChange,
  svgRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging state for device pins
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Hover state for interactive HUD tooltip
  const [hoveredDevice, setHoveredDevice] = useState<MappedFloorDevice | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  const currentTheme = BLUEPRINT_THEMES[plan.theme] || BLUEPRINT_THEMES.blueprint_blue;

  // Filter devices based on status, type, and zone
  const visibleDevices = devices.filter((dev) => {
    if (statusFilter !== 'all' && dev.status !== statusFilter) return false;
    if (typeFilter !== 'all' && dev.type !== typeFilter) return false;
    if (zoneFilter !== 'all' && !dev.zone.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
    return true;
  });

  // Calculate room assignment based on coordinates
  const findRoomForCoords = useCallback(
    (canvasX: number, canvasY: number): FloorPlanRoom | undefined => {
      return plan.rooms.find(
        (r) =>
          canvasX >= r.x &&
          canvasX <= r.x + r.width &&
          canvasY >= r.y &&
          canvasY <= r.y + r.height
      );
    },
    [plan.rooms]
  );

  // --- HTML5 Canvas Animation Layer (for Canvas & Hybrid modes) ---
  useEffect(() => {
    if (overlayEngine === 'svg') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let radarAngle = 0;
    let pulsePhase = 0;

    const renderCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // 1. Coverage Heatmap Layer (if enabled)
      if (showCoverageHeatmap) {
        visibleDevices.forEach((dev) => {
          const cx = (dev.xPercent / 100) * width;
          const cy = (dev.yPercent / 100) * height;
          let radius = 80;
          let heatColor = 'rgba(56, 189, 248, 0.12)';

          if (dev.type === 'heat') {
            radius = 55;
            heatColor = 'rgba(245, 158, 11, 0.12)';
          } else if (dev.type === 'sounder') {
            radius = 120;
            heatColor = 'rgba(236, 72, 153, 0.10)';
          }

          const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
          grad.addColorStop(0, heatColor);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Fire Loop Wiring Interconnect Traces (Circuit Continuity Simulation)
      if (visibleDevices.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        visibleDevices.forEach((dev, idx) => {
          const x = (dev.xPercent / 100) * width;
          const y = (dev.yPercent / 100) * height;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();

        // Traveling telemetry signal packet
        const packetStep = (pulsePhase * 0.02) % visibleDevices.length;
        const currentIdx = Math.floor(packetStep);
        const nextIdx = (currentIdx + 1) % visibleDevices.length;
        const frac = packetStep - currentIdx;

        const d1 = visibleDevices[currentIdx];
        const d2 = visibleDevices[nextIdx];
        if (d1 && d2) {
          const px = (d1.xPercent / 100) * width + ((d2.xPercent - d1.xPercent) / 100) * width * frac;
          const py = (d1.yPercent / 100) * height + ((d2.yPercent - d1.yPercent) / 100) * height * frac;

          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Sensor Status Pulse & Halos
      visibleDevices.forEach((dev) => {
        const cx = (dev.xPercent / 100) * width;
        const cy = (dev.yPercent / 100) * height;

        const isAlarming = dev.id === alarmSimulatingDeviceId || dev.status === 'alarm';
        const isFault = dev.status === 'fault';
        const isDue = dev.status === 'due_service';

        if (isAlarming) {
          // Urgent expanding crimson shockwave
          const waveRadius = 15 + ((pulsePhase * 2) % 40);
          const alpha = Math.max(0, 1 - (waveRadius - 15) / 40);
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Second wave
          const waveRadius2 = 15 + (((pulsePhase * 2) + 20) % 40);
          const alpha2 = Math.max(0, 1 - (waveRadius2 - 15) / 40);
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha2})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, waveRadius2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isFault) {
          // Strobe warning pulse
          const r = 14 + Math.sin(pulsePhase * 0.2) * 4;
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isDue) {
          // Amber maintenance breathing glow
          const r = 13 + Math.sin(pulsePhase * 0.1) * 3;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Gentle green operational heartbeat
          const r = 12 + Math.sin(pulsePhase * 0.05) * 2;
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 4. Rotating SANS Diagnostic Radar Sweep Beam
      const sweepCenterX = 500;
      const sweepCenterY = 281;
      const sweepRadius = 380;

      ctx.save();
      const sweepGrad = ctx.createRadialGradient(sweepCenterX, sweepCenterY, 0, sweepCenterX, sweepCenterY, sweepRadius);
      sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.moveTo(sweepCenterX, sweepCenterY);
      ctx.arc(sweepCenterX, sweepCenterY, sweepRadius, radarAngle - 0.25, radarAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Radar leading line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepCenterX, sweepCenterY);
      ctx.lineTo(
        sweepCenterX + Math.cos(radarAngle) * sweepRadius,
        sweepCenterY + Math.sin(radarAngle) * sweepRadius
      );
      ctx.stroke();
      ctx.restore();

      radarAngle += 0.012;
      pulsePhase += 1;
      animationFrameId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [overlayEngine, visibleDevices, showCoverageHeatmap, alarmSimulatingDeviceId]);

  // Handle pointer down on device pin for dragging
  const handleDevicePointerDown = (e: React.PointerEvent, device: MappedFloorDevice) => {
    e.stopPropagation();
    onSelectDevice(device);
    setDraggingDeviceId(device.id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  // Handle pointer move across SVG container for dragging or panning
  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingDeviceId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      let xPercent = Math.round((clientX / rect.width) * 100);
      let yPercent = Math.round((clientY / rect.height) * 100);

      // Clamping within floorplan boundary
      xPercent = Math.max(8, Math.min(92, xPercent));
      yPercent = Math.max(10, Math.min(90, yPercent));

      const activeDev = devices.find((d) => d.id === draggingDeviceId);
      if (activeDev) {
        const canvasX = (xPercent / 100) * 1000;
        const canvasY = (yPercent / 100) * 562;
        const room = findRoomForCoords(canvasX, canvasY);

        onUpdateDevice({
          ...activeDev,
          xPercent,
          yPercent,
          zone: room ? room.zoneName : activeDev.zone
        });
      }
    } else if (isPanningCanvas && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      onPanChange({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleContainerPointerUp = () => {
    setDraggingDeviceId(null);
    setDragStartPos(null);
    setIsPanningCanvas(false);
    setPanStart(null);
  };

  // Handle click on floorplan canvas (e.g. for placing pins)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPinModeActive && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const xPercent = Math.round((clickX / rect.width) * 100);
      const yPercent = Math.round((clickY / rect.height) * 100);

      onPlaceDevice(xPercent, yPercent);
    } else if (!draggingDeviceId) {
      // Clicked background, deselect if not clicking a device
      onSelectDevice(null);
    }
  };

  // Status visual colors for badges and pins
  const getDeviceStatusDetails = (status: MappedFloorDevice['status']) => {
    switch (status) {
      case 'alarm':
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-400',
          text: 'text-rose-400',
          ring: 'ring-rose-500 animate-ping',
          label: 'ALARM ACTIVE',
          icon: AlertCircle
        };
      case 'fault':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-300',
          text: 'text-rose-400',
          ring: 'ring-rose-500 animate-pulse',
          label: 'FAULT / DEFECT',
          icon: XCircle
        };
      case 'due_service':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-300',
          text: 'text-amber-400',
          ring: 'ring-amber-500',
          label: 'SERVICE DUE',
          icon: AlertTriangle
        };
      case 'testing':
        return {
          bg: 'bg-cyan-500',
          border: 'border-cyan-300',
          text: 'text-cyan-400',
          ring: 'ring-cyan-500 animate-pulse',
          label: 'ROUTINE TEST',
          icon: Activity
        };
      case 'offline':
        return {
          bg: 'bg-slate-600',
          border: 'border-slate-400',
          text: 'text-slate-400',
          ring: 'ring-slate-500',
          label: 'ISOLATED',
          icon: Zap
        };
      case 'operational':
      default:
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-300',
          text: 'text-emerald-400',
          ring: 'ring-emerald-500',
          label: 'OPERATIONAL',
          icon: CheckCircle2
        };
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerLeave={handleContainerPointerUp}
      style={{
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        transformOrigin: 'center center',
        transition: isPanningCanvas ? 'none' : 'transform 0.15s ease-out'
      }}
      className={`relative w-full aspect-16/9 overflow-hidden select-none ${
        isPinModeActive ? 'cursor-crosshair' : draggingDeviceId ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* 1. Base CAD Vector Architectural SVG Floor Plan */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 562"
        className="w-full h-full absolute inset-0 pointer-events-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Engineering CAD Grid */}
          <pattern id="siteCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={currentTheme.gridPrimary} strokeWidth="0.75" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke={currentTheme.gridSecondary}
              strokeWidth="1.2"
              opacity="0.3"
            />
          </pattern>

          {/* Special Hazard Striped Hatch Pattern */}
          <pattern
            id="siteHazardHatch"
            width="10"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke={currentTheme.hazardBorder}
              strokeWidth="1.2"
              opacity="0.45"
            />
          </pattern>

          {/* Alarm Pulse Glow Filter */}
          <filter id="alarmGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Blueprint Canvas Background */}
        <rect width="1000" height="562" fill={currentTheme.bg} />
        <rect width="1000" height="562" fill="url(#siteCadGrid)" />

        {/* Building Outer Perimeter Structural Wall */}
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

        {/* Dynamically Rendered Architectural Rooms */}
        {plan.rooms.map((room, idx) => {
          const isHazard = room.type === 'hazard' || room.type === 'server_room';
          const isZoneHighlighted =
            zoneFilter === 'all' || room.zoneName.toLowerCase().includes(zoneFilter.toLowerCase());

          const roomFill = isHazard
            ? currentTheme.hazardBg
            : idx % 2 === 0
            ? currentTheme.roomBg
            : currentTheme.roomBgAlt;

          return (
            <g key={room.id} opacity={isZoneHighlighted ? 1 : 0.25} className="transition-opacity">
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
                  fill="url(#siteHazardHatch)"
                  opacity="0.5"
                />
              )}

              {/* Room Identifier Label */}
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

        {/* Doors & Emergency Exits */}
        {plan.doors.map((door) => {
          const isAlarm = Boolean(alarmSimulatingDeviceId);
          const doorStroke = door.isEmergencyExit
            ? isAlarm
              ? '#22C55E'
              : currentTheme.doorExit
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
                  strokeWidth={door.isEmergencyExit ? 7 : 5}
                />
              ) : (
                <line
                  x1={door.x}
                  y1={door.y}
                  x2={door.x + door.width}
                  y2={door.y}
                  stroke={doorStroke}
                  strokeWidth={door.isEmergencyExit ? 7 : 5}
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

        {/* SANS 10139 Coverage Radiuses (SVG Rendered) */}
        {showCoverageRadius &&
          visibleDevices.map((dev) => {
            const cx = (dev.xPercent / 100) * 1000;
            const cy = (dev.yPercent / 100) * 562;

            if (dev.type === 'smoke') {
              // 7.5m smoke coverage circle
              return (
                <g key={`cov-${dev.id}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="75"
                    fill="#38BDF8"
                    fillOpacity="0.08"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                  <text
                    x={cx}
                    y={cy - 78}
                    fill="#38BDF8"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    R=7.5m
                  </text>
                </g>
              );
            }

            if (dev.type === 'heat') {
              // 5.3m heat coverage circle
              return (
                <g key={`cov-${dev.id}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="53"
                    fill="#F59E0B"
                    fillOpacity="0.09"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                  <text
                    x={cx}
                    y={cy - 56}
                    fill="#F59E0B"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    R=5.3m
                  </text>
                </g>
              );
            }

            if (dev.type === 'sounder') {
              // 12m sounder audibility propagation
              return (
                <circle
                  key={`cov-${dev.id}`}
                  cx={cx}
                  cy={cy}
                  r="120"
                  fill="#EC4899"
                  fillOpacity="0.05"
                  stroke="#EC4899"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                  opacity="0.75"
                />
              );
            }

            return null;
          })}

        {/* Technical CAD Scale Bar & North Arrow */}
        <g transform="translate(80, 480)">
          {/* Scale line: 100px = 10 meters */}
          <line x1="0" y1="0" x2="100" y2="0" stroke={currentTheme.textPrimary} strokeWidth="2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke={currentTheme.textPrimary} strokeWidth="2" />
          <line x1="50" y1="-3" x2="50" y2="3" stroke={currentTheme.textPrimary} strokeWidth="1" />
          <line x1="100" y1="-5" x2="100" y2="5" stroke={currentTheme.textPrimary} strokeWidth="2" />
          <text x="0" y="15" fill={currentTheme.textMuted} fontSize="8" fontFamily="monospace">0m</text>
          <text x="45" y="15" fill={currentTheme.textMuted} fontSize="8" fontFamily="monospace">5m</text>
          <text x="92" y="15" fill={currentTheme.textMuted} fontSize="8" fontFamily="monospace">10m</text>
        </g>

        {/* North Arrow */}
        <g transform="translate(900, 90)">
          <circle cx="0" cy="0" r="14" fill="none" stroke={currentTheme.textMuted} strokeWidth="1" />
          <path d="M 0 -12 L 4 2 L 0 0 L -4 2 Z" fill="#EF4444" />
          <text x="0" y="-16" fill={currentTheme.textPrimary} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            N
          </text>
        </g>

        {/* CAD Title Block */}
        <g transform="translate(660, 430)">
          <rect
            width="270"
            height="75"
            fill={currentTheme.titleBlockBg}
            stroke={currentTheme.titleBlockBorder}
            strokeWidth="1.5"
            opacity="0.94"
          />
          <text
            x="12"
            y="18"
            fill={currentTheme.textPrimary}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            AUDRIN FIRE ENGINEERS (PTY) LTD
          </text>
          <text
            x="12"
            y="32"
            fill={currentTheme.textSecondary}
            fontSize="8.5"
            fontFamily="monospace"
          >
            SITE REF: {plan.siteReference}
          </text>
          <text
            x="12"
            y="46"
            fill={currentTheme.textMuted}
            fontSize="8"
            fontFamily="monospace"
          >
            SANS 10139 CAT {plan.sansCategory} | {plan.squareMeters} m² | SCALE 1:100
          </text>
          <text
            x="12"
            y="60"
            fill="#10B981"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SAQCC 1475 CAD VERIFIED &bull; LIVE SITE-MAP OVERLAY
          </text>
        </g>
      </svg>

      {/* 2. Hardware-Accelerated 2D HTML5 Canvas Overlay (Dynamic Radar & Telemetry Heatmap) */}
      {(overlayEngine === 'canvas' || overlayEngine === 'hybrid') && (
        <canvas
          ref={canvasRef}
          width={1000}
          height={562}
          className="w-full h-full absolute inset-0 pointer-events-none z-10"
        />
      )}

      {/* 3. Interactive Mapped Device Pins Overlay (Direct DOM elements for smooth drag, hover & click) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {visibleDevices.map((dev) => {
          const isSelected = selectedDevice?.id === dev.id;
          const isAlarming = dev.id === alarmSimulatingDeviceId || dev.status === 'alarm';
          const statusInfo = getDeviceStatusDetails(dev.status);

          let pinBg = 'bg-emerald-500';
          if (dev.status === 'due_service') pinBg = 'bg-amber-500';
          if (dev.status === 'fault') pinBg = 'bg-rose-500 animate-pulse';
          if (dev.status === 'alarm' || isAlarming) pinBg = 'bg-red-600 animate-ping';
          if (dev.status === 'testing') pinBg = 'bg-cyan-500';
          if (dev.status === 'offline') pinBg = 'bg-slate-600';
          if (dev.type === 'panel') pinBg = 'bg-purple-600';
          if (dev.type === 'sounder') pinBg = 'bg-pink-600';

          return (
            <div
              key={dev.id}
              onPointerDown={(e) => handleDevicePointerDown(e, dev)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDevice(dev);
              }}
              onMouseEnter={(e) => {
                setHoveredDevice(dev);
                setHoverCoords({ x: dev.xPercent, y: dev.yPercent });
              }}
              onMouseLeave={() => setHoveredDevice(null)}
              style={{
                left: `${dev.xPercent}%`,
                top: `${dev.yPercent}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute pointer-events-auto flex flex-col items-center group transition-transform ${
                isSelected ? 'scale-125 z-40' : 'hover:scale-115 z-30'
              } cursor-grab active:cursor-grabbing`}
            >
              {/* Outer halo beacon ring */}
              <div
                className={`w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[11px] font-bold text-white transition-all ${pinBg} ${
                  isSelected ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-cyan-500/50' : ''
                }`}
              >
                {dev.type === 'smoke' && <Radio className="w-3.5 h-3.5" />}
                {dev.type === 'heat' && <Flame className="w-3.5 h-3.5" />}
                {dev.type === 'call_point' && <AlertCircle className="w-3.5 h-3.5" />}
                {dev.type === 'sounder' && <Bell className="w-3.5 h-3.5" />}
                {dev.type === 'panel' && <Cpu className="w-3.5 h-3.5" />}
              </div>

              {/* Status indicator dot pip */}
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                  dev.status === 'operational'
                    ? 'bg-emerald-400'
                    : dev.status === 'due_service'
                    ? 'bg-amber-400'
                    : dev.status === 'fault'
                    ? 'bg-rose-500 animate-ping'
                    : dev.status === 'alarm' || isAlarming
                    ? 'bg-red-500 animate-ping'
                    : 'bg-cyan-400'
                }`}
              />

              {/* Micro tag displaying Device ID */}
              <span className="mt-1 px-1.5 py-0.2 rounded bg-slate-950/95 text-white font-mono text-[9px] border border-slate-700 whitespace-nowrap shadow-lg tracking-wider">
                {dev.id}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Live Interactive Hover HUD Tooltip */}
      {hoveredDevice && hoverCoords && !draggingDeviceId && (
        <div
          style={{
            left: `${hoverCoords.x}%`,
            top: `${hoverCoords.y}%`,
            transform: hoverCoords.y > 60 ? 'translate(-50%, -125%)' : 'translate(-50%, 30%)'
          }}
          className="absolute z-50 pointer-events-none p-3 bg-slate-950/95 border border-cyan-500/60 rounded-xl shadow-2xl backdrop-blur-md min-w-[210px] text-xs font-mono space-y-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              {hoveredDevice.id}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                hoveredDevice.status === 'operational'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : hoveredDevice.status === 'due_service'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
              }`}
            >
              {hoveredDevice.status.replace('_', ' ')}
            </span>
          </div>

          <div className="text-[10px] text-slate-300 leading-tight">
            {hoveredDevice.label}
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            <div className="flex justify-between">
              <span>Fire Zone:</span>
              <span className="text-white truncate max-w-[120px] text-right">{hoveredDevice.zone}</span>
            </div>
            <div className="flex justify-between">
              <span>SANS Address:</span>
              <span className="text-cyan-300">
                Loop {hoveredDevice.loopNumber || 1} &bull; Addr {hoveredDevice.addressNumber || 12}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Tested:</span>
              <span className="text-slate-200">{hoveredDevice.lastServicedDate || '2026-06-15'}</span>
            </div>
            <div className="flex justify-between">
              <span>Chamber Contam:</span>
              <span className={hoveredDevice.status === 'fault' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {hoveredDevice.contaminationPercent || (hoveredDevice.status === 'fault' ? 38 : 14)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Signal Margin:</span>
              <span className="text-blue-300">
                {hoveredDevice.signalMargin || 94}% (Loop 22.8V)
              </span>
            </div>
          </div>

          <div className="text-[8.5px] text-cyan-400/80 pt-0.5 italic text-center">
            Click to open full telemetry inspector &bull; Drag to relocate pin
          </div>
        </div>
      )}
    </div>
  );
};
