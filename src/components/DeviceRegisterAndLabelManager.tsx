import React, { useState, useMemo, useEffect } from 'react';
import {
  QrCode,
  Printer,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Flame,
  Wrench,
  Activity,
  PlusCircle,
  ExternalLink,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Phone,
  Layers,
  Building,
  Copy,
  Check
} from 'lucide-react';
import { FireDetectionDevice } from '../types/deviceLog';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { useApp } from '../context/AppContext';
import { getDeviceDeepLinkUrl } from '../utils/qrCodeGenerator';

interface DeviceRegisterAndLabelManagerProps {
  initialSiteId?: string;
  initialDeviceId?: string;
  isCustomerView?: boolean;
}

export const DeviceRegisterAndLabelManager: React.FC<DeviceRegisterAndLabelManagerProps> = ({
  initialSiteId,
  initialDeviceId,
  isCustomerView = false
}) => {
  const {
    fireDetectionDevices,
    openDeviceMaintenanceLog,
    openDeviceQRGenerator,
    showToast
  } = useApp();

  const [siteFilter, setSiteFilter] = useState<string>(initialSiteId || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(
    initialDeviceId ? new Set([initialDeviceId]) : new Set()
  );
  const [copiedDeviceId, setCopiedDeviceId] = useState<string | null>(null);

  // Sync if initial props change
  useEffect(() => {
    if (initialSiteId) {
      setSiteFilter(initialSiteId);
    }
    if (initialDeviceId) {
      setSelectedDeviceIds(new Set([initialDeviceId]));
    }
  }, [initialSiteId, initialDeviceId]);

  // Direct QR Code Scanner / Simulator Input
  const [scannerInput, setScannerInput] = useState<string>('');

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return fireDetectionDevices.filter((dev) => {
      if (siteFilter !== 'all' && dev.siteId !== siteFilter) return false;
      if (statusFilter !== 'all' && dev.status !== statusFilter) return false;
      if (typeFilter !== 'all' && dev.deviceType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = dev.id.toLowerCase().includes(query);
        const matchesZone = dev.zone.toLowerCase().includes(query);
        const matchesModel = dev.modelNumber.toLowerCase().includes(query);
        const matchesSerial = dev.serialNumber.toLowerCase().includes(query);
        const matchesType = dev.deviceTypeLabel.toLowerCase().includes(query);
        const matchesSite = dev.siteName.toLowerCase().includes(query);
        if (!matchesId && !matchesZone && !matchesModel && !matchesSerial && !matchesType && !matchesSite) {
          return false;
        }
      }

      return true;
    });
  }, [fireDetectionDevices, siteFilter, statusFilter, typeFilter, searchQuery]);

  // Status breakdown metrics
  const totalCount = fireDetectionDevices.length;
  const compliantCount = fireDetectionDevices.filter((d) => d.status === 'normal').length;
  const serviceDueCount = fireDetectionDevices.filter((d) => d.status === 'service_due').length;
  const defectCount = fireDetectionDevices.filter((d) => d.status === 'defect_fault' || d.status === 'warning').length;

  const handleToggleSelectDevice = (id: string) => {
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedDeviceIds(new Set(filteredDevices.map((d) => d.id)));
  };

  const handleClearSelection = () => {
    setSelectedDeviceIds(new Set());
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;

    let target = scannerInput.trim();
    // Support parsing if user pasted a full URL e.g. ?device=TLP-L01-D014
    if (target.includes('device=')) {
      const match = target.match(/device=([^&#]+)/);
      if (match) target = decodeURIComponent(match[1]);
    }

    const found = fireDetectionDevices.find(
      (d) => d.id.toLowerCase() === target.toLowerCase() || d.barcode.toLowerCase() === target.toLowerCase()
    );

    if (found) {
      showToast('success', 'QR Code Scanned', `Matched physical asset ${found.id}. Opening SANS 10139 logbook.`);
      openDeviceMaintenanceLog(found.id);
      setScannerInput('');
    } else {
      showToast('error', 'Device Not Found', `No device matched identifier "${target}".`);
    }
  };

  const handleCopyDeviceDeepLink = async (dev: FireDetectionDevice, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getDeviceDeepLinkUrl(dev.id);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedDeviceId(dev.id);
      showToast('success', 'Deep Link Copied', `Direct URL for ${dev.id} copied to clipboard.`);
      setTimeout(() => setCopiedDeviceId(null), 2500);
    } catch {
      showToast('info', 'QR URL', url);
    }
  };

  const handlePrintBatch = () => {
    if (selectedDeviceIds.size > 0) {
      const firstId = Array.from(selectedDeviceIds)[0];
      const matchingDev = fireDetectionDevices.find(d => d.id === firstId);
      openDeviceQRGenerator(matchingDev?.siteId, firstId);
    } else {
      openDeviceQRGenerator(siteFilter !== 'all' ? siteFilter : undefined);
    }
  };

  return (
    <div id="device-register-and-label-manager" className="space-y-6">
      {/* Top Banner with Stats & Actions */}
      <div className="bg-white dark:bg-[#0A192F] border-t-4 border-[#CC0000] border border-slate-200 dark:border-slate-800 rounded-sm p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#CC0000]" />
                <span>SANS 10139:2012 Certified Physical Asset Register</span>
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-xs font-bold border border-slate-300 dark:border-slate-700">
                FIELD QR LABELS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] dark:text-white tracking-tight">
              Fire Detection Device Register &amp; QR Label Hub
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
              Every installed smoke sensor, thermal detector, manual call point, and sounder is issued a unique, industrial QR asset tag linking directly to its SANS 10139 routine maintenance history, chamber drift index, and SAQCC test log.
            </p>
          </div>

          {/* Quick Actions & Field Scanner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              id="open-batch-qr-generator-btn"
              onClick={handlePrintBatch}
              className="px-4 py-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono text-xs font-bold rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>
                {selectedDeviceIds.size > 0
                  ? `Print Labels (${selectedDeviceIds.size} Selected)`
                  : 'Batch Print QR Labels'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xs border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Monitored Assets</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Addressable Field Units</div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xs border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-bold">Compliant SANS 10139</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">{compliantCount}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Within statutory cycle</div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xs border border-amber-200 dark:border-amber-800">
            <div className="text-[10px] text-amber-800 dark:text-amber-400 uppercase font-bold">SANS Service Due</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">{serviceDueCount}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400">Due within &le; 14 days</div>
          </div>

          <div className="bg-red-50/60 dark:bg-red-950/30 p-3 rounded-xs border border-red-200 dark:border-red-800">
            <div className="text-[10px] text-red-800 dark:text-red-400 uppercase font-bold">Defects / Contaminated</div>
            <div className="text-xl font-black text-red-700 dark:text-red-300">{defectCount}</div>
            <div className="text-[10px] text-red-600 dark:text-red-400">Action required on-site</div>
          </div>
        </div>

        {/* Mobile Camera / Barcode Scanner Simulator */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#CC0000]" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Field Technician QR Scanner Simulator:
            </span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline text-[11px]">
              (Simulates scanning physical QR code with mobile camera)
            </span>
          </div>

          <form onSubmit={handleSimulateScan} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              placeholder="e.g. TLP-L01-D014 or PMS-L01-D022"
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs text-xs font-mono text-slate-900 dark:text-white w-full sm:w-64 focus:ring-1 focus:ring-slate-900 dark:focus:ring-red-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold rounded-xs shrink-0 cursor-pointer"
            >
              Scan / Lookup
            </button>
          </form>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-slate-800 rounded-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Site Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
              Client Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Sites ({fireDetectionDevices.length})</option>
              {CLIENT_SITE_MAINTENANCE_PROFILES.map((site) => (
                <option key={site.siteId} value={site.siteId}>
                  {site.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
              SANS 10139 Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="defect_fault">Defect / Overdue (Immediate Action)</option>
              <option value="service_due">SANS Service Due (&le; 14 Days)</option>
              <option value="normal">Compliant Normal</option>
            </select>
          </div>

          {/* Device Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
              Device Classification
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Device Classes</option>
              <option value="optical_smoke">Optical Smoke Sensors</option>
              <option value="heat_detector">Thermal Heat Detectors</option>
              <option value="multi_sensor">Multi-Sensor Combination</option>
              <option value="manual_call_point">Manual Call Points (MCP)</option>
              <option value="beam_detector">Optical Beam Detectors</option>
              <option value="sounder_vad">Sounder Visual Alarms (VAD)</option>
              <option value="gas_actuator">Gas Extinguishing Modules</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
              Search Device
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID, Zone, Serial #, Model..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-hidden font-sans text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">
              Showing <strong>{filteredDevices.length}</strong> devices
            </span>
            {selectedDeviceIds.size > 0 && (
              <span className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-xs font-bold border border-red-200 dark:border-red-800">
                {selectedDeviceIds.size} selected for printing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer text-[11px]"
            >
              Select All ({filteredDevices.length})
            </button>
            {selectedDeviceIds.size > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer text-[11px]"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintBatch}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>Print Selected Labels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Devices Register Table */}
      <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-slate-800 rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0A192F] text-white font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3">Device ID &amp; QR Tag</th>
                <th className="py-3 px-3">Facility &amp; Location</th>
                <th className="py-3 px-3">Model &amp; Loop</th>
                <th className="py-3 px-3">Chamber Contamination</th>
                <th className="py-3 px-3">SANS 10139 Status</th>
                <th className="py-3 px-3">Next Due</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
                    No fire detection devices match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const isSelected = selectedDeviceIds.has(dev.id);

                  // Status badge helper
                  const getBadge = () => {
                    switch (dev.status) {
                      case 'defect_fault':
                        return (
                          <span className="bg-[#CC0000] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-xs uppercase">
                            DEFECT / OVERDUE
                          </span>
                        );
                      case 'service_due':
                        return (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[9px] px-2 py-0.5 rounded-xs uppercase">
                            SERVICE DUE
                          </span>
                        );
                      case 'warning':
                        return (
                          <span className="bg-amber-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-xs uppercase">
                            CHAMBER DRIFT
                          </span>
                        );
                      case 'normal':
                      default:
                        return (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold text-[9px] px-2 py-0.5 rounded-xs uppercase">
                            COMPLIANT SANS
                          </span>
                        );
                    }
                  };

                  return (
                    <tr
                      key={dev.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectDevice(dev.id)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#CC0000] fill-red-50 dark:fill-red-950/30" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Device ID & Barcode */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDeviceQRGenerator(dev.siteId, dev.id)}
                            className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 p-1 flex items-center justify-center shrink-0 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-[#CC0000]"
                            title="Click to print QR label"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => openDeviceMaintenanceLog(dev.id)}
                              className="font-mono font-black text-xs text-[#0A192F] dark:text-slate-100 hover:text-[#CC0000] dark:hover:text-red-400 underline decoration-slate-300 dark:decoration-slate-600 text-left cursor-pointer"
                            >
                              {dev.id}
                            </button>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {dev.deviceTypeLabel}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Site & Zone Location */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[200px]">
                          {dev.siteName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {dev.zone}
                        </div>
                      </td>

                      {/* Model & Loop */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Loop {dev.loopNumber} • Addr {dev.address.toString().padStart(3, '0')}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {dev.modelNumber}
                        </div>
                      </td>

                      {/* Chamber Contamination */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              dev.analogueTelemetry.contaminationPercent > 50
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {dev.analogueTelemetry.contaminationPercent}%
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                dev.analogueTelemetry.contaminationPercent > 50
                                  ? 'bg-red-600'
                                  : dev.analogueTelemetry.contaminationPercent > 25
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, dev.analogueTelemetry.contaminationPercent)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {dev.analogueTelemetry.loopVoltage}V DC
                        </div>
                      </td>

                      {/* Compliance Status */}
                      <td className="py-3 px-3">
                        {getBadge()}
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          Score: {dev.sans10139ComplianceScore}%
                        </div>
                      </td>

                      {/* Next Due */}
                      <td className="py-3 px-3 font-mono text-xs">
                        <div
                          className={`font-bold ${
                            dev.status === 'defect_fault'
                              ? 'text-red-600 dark:text-red-400'
                              : dev.status === 'service_due'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dev.nextSansDueDate}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Last: {dev.lastServiceDate}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDeviceMaintenanceLog(dev.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] rounded-xs flex items-center gap-1 cursor-pointer font-bold"
                            title="View full SANS 10139 logbook"
                          >
                            <Clock className="w-3 h-3 text-[#CC0000]" />
                            <span>Logbook ({dev.maintenanceHistory.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyDeviceDeepLink(dev, e)}
                            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs cursor-pointer"
                            title="Copy QR deep link URL"
                          >
                            {copiedDeviceId === dev.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeviceQRGenerator(dev.siteId, dev.id)}
                            className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs cursor-pointer"
                            title="Generate and print QR label"
                          >
                            <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
