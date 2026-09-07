import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  QrCode,
  Filter,
  CheckSquare,
  Square,
  Search,
  Download,
  Flame,
  Shield,
  Layers,
  Building,
  Info,
  ExternalLink,
  Sparkles,
  FileDown
} from 'lucide-react';
import { FireDetectionDevice, LabelFormatOption } from '../types/deviceLog';
import { DeviceQRCodeLabel } from './DeviceQRCodeLabel';
import { CLIENT_SITE_MAINTENANCE_PROFILES } from '../data/serviceDueData';
import { useApp } from '../context/AppContext';

interface DeviceQRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: FireDetectionDevice[];
  initialSiteId?: string;
  initialDeviceId?: string;
  onViewDeviceLog: (device: FireDetectionDevice) => void;
}

export const DeviceQRCodeGeneratorModal: React.FC<DeviceQRCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  devices,
  initialSiteId,
  initialDeviceId,
  onViewDeviceLog
}) => {
  const { showToast } = useApp();

  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId || 'all');
  const [selectedLoop, setSelectedLoop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [labelFormat, setLabelFormat] = useState<LabelFormatOption>('standard_industrial');

  // Selected device IDs for printing
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(() => {
    if (initialDeviceId) {
      return new Set([initialDeviceId]);
    }
    // Default: select all devices
    return new Set(devices.map((d) => d.id));
  });

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      if (selectedSiteId !== 'all' && dev.siteId !== selectedSiteId) return false;
      if (selectedLoop !== 'all' && dev.loopNumber.toString() !== selectedLoop) return false;
      if (selectedStatus !== 'all' && dev.status !== selectedStatus) return false;
      if (selectedType !== 'all' && dev.deviceType !== selectedType) return false;

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
  }, [devices, selectedSiteId, selectedLoop, selectedStatus, selectedType, searchQuery]);

  // Devices that will actually be printed (in filtered set AND selected)
  const printableDevices = useMemo(() => {
    return filteredDevices.filter((dev) => selectedDeviceIds.has(dev.id));
  }, [filteredDevices, selectedDeviceIds]);

  if (!isOpen) return null;

  const handleToggleDevice = (id: string) => {
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
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      filteredDevices.forEach((d) => next.add(d.id));
      return next;
    });
    showToast('info', 'All Filtered Devices Selected', `${filteredDevices.length} devices marked for printing.`);
  };

  const handleSelectOverdueOnly = () => {
    const overdueOrDueSoon = filteredDevices.filter(
      (d) => d.status === 'defect_fault' || d.status === 'service_due'
    );
    setSelectedDeviceIds(new Set(overdueOrDueSoon.map((d) => d.id)));
    showToast(
      'info',
      'Targeted Service Selection',
      `${overdueOrDueSoon.length} devices due for maintenance or defect rectification selected.`
    );
  };

  const handleClearSelection = () => {
    setSelectedDeviceIds(new Set());
  };

  const handlePrintSheet = () => {
    if (printableDevices.length === 0) {
      showToast('error', 'No Devices Selected', 'Please select at least one fire detection device to print.');
      return;
    }
    window.print();
  };

  return (
    <div
      id="device-qr-generator-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto"
    >
      <div className="bg-white dark:bg-[#0A192F] rounded-sm border-t-4 border-[#CC0000] border-x border-b border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Modal Top Header (Hidden on print) */}
        <div className="bg-[#0A192F] text-white p-4 sm:p-5 flex items-start justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-red-400 uppercase tracking-wider">
                  SANS 10139 Physical Asset Labelling
                </span>
                <span className="text-[10px] bg-red-950 text-red-200 border border-red-800 px-2 py-0.2 rounded-xs font-mono font-bold">
                  HIGH REDUNDANCY QR
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Printable QR Code Labels &amp; SANS 10139 Asset Badges
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Generate high-resolution, field-durable QR labels that link directly to each physical detector's historical SANS 10139 maintenance log and statutory test register.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-qr-generator-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter and Configuration Controls (Hidden on print) */}
        <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 p-3 sm:p-4 space-y-3 print:hidden">
          {/* Top Filter Row: Site, Loop, Status, Type, Search */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-mono">
            {/* Site selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Client Site Facility
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="all">All Sites ({devices.length} Devices)</option>
                {CLIENT_SITE_MAINTENANCE_PROFILES.map((site) => (
                  <option key={site.siteId} value={site.siteId}>
                    {site.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Loop selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Loop Circuit
              </label>
              <select
                value={selectedLoop}
                onChange={(e) => setSelectedLoop(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="all">All Loops</option>
                <option value="1">Loop 1 (Primary)</option>
                <option value="2">Loop 2 (Secondary)</option>
                <option value="3">Loop 3</option>
                <option value="4">Loop 4</option>
              </select>
            </div>

            {/* Status selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Compliance Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="defect_fault">Defect / Overdue Attention</option>
                <option value="service_due">SANS Service Due (&le; 14 Days)</option>
                <option value="normal">Compliant Normal</option>
              </select>
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Device Classification
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="all">All Device Classes</option>
                <option value="optical_smoke">Optical Smoke Sensors</option>
                <option value="heat_detector">Thermal Heat Detectors</option>
                <option value="multi_sensor">Multi-Criteria Optical/Heat</option>
                <option value="manual_call_point">Manual Call Points (MCP)</option>
                <option value="beam_detector">Optical Beam Detectors</option>
                <option value="sounder_vad">Sounder VAD Devices</option>
                <option value="gas_actuator">Gas Extinguishing Modules</option>
              </select>
            </div>

            {/* Search */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Search Device
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, Zone, Serial..."
                  className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-900 focus:outline-hidden font-sans text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>
          </div>

          {/* Bottom Control Row: Format, Selection counters, and Print action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
            {/* Format Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                Label Format:
              </span>
              <div className="inline-flex rounded-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setLabelFormat('standard_industrial')}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                    labelFormat === 'standard_industrial'
                      ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="70mm x 45mm asset plate with brand and SANS details"
                >
                  Industrial Plate (70x45mm)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelFormat('compact_base')}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                    labelFormat === 'compact_base'
                      ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="42mm x 25mm miniature tag for detector base / bezel"
                >
                  Compact Base (42x25mm)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelFormat('avery_sheet_24')}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                    labelFormat === 'avery_sheet_24'
                      ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="A4 24-Up Label Sheet (3x8 grid for Avery L7159)"
                >
                  A4 Sheet 24-Up
                </button>
                <button
                  type="button"
                  onClick={() => setLabelFormat('thermal_roll_60x40')}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                    labelFormat === 'thermal_roll_60x40'
                      ? 'bg-slate-900 dark:bg-red-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="60mm x 40mm Direct Thermal Zebra Transfer"
                >
                  Thermal Roll (60x40mm)
                </button>
              </div>
            </div>

            {/* Batch Select and Print Buttons */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-xs">
                <strong>{printableDevices.length}</strong> of {filteredDevices.length} selected
              </span>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={handleSelectOverdueOnly}
                className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 rounded-xs cursor-pointer font-bold"
                title="Select only devices overdue or due for SANS test"
              >
                Due/Defects Only
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                id="print-qr-labels-btn"
                onClick={handlePrintSheet}
                disabled={printableDevices.length === 0}
                className="px-4 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print {printableDevices.length} Labels</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Labels Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/60 dark:bg-slate-950/80 print:bg-white print:p-0 print:overflow-visible">
          {printableDevices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm p-12 text-center max-w-md mx-auto my-8 space-y-3 font-mono text-xs">
              <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Devices Selected for Printing</div>
              <p className="text-slate-500 dark:text-slate-400 font-sans">
                Adjust your site/loop filters above or click "Select All" to generate printable QR code labels.
              </p>
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xs font-bold cursor-pointer"
              >
                Select All Filtered Devices
              </button>
            </div>
          ) : (
            <div>
              {/* Header only shown on paper print */}
              <div className="hidden print:block mb-4 border-b-2 border-black pb-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h1 className="text-base font-black uppercase">
                      AUDRIN FIRE ENGINEERS — SANS 10139 ASSET LABELS
                    </h1>
                    <p className="text-[10px] text-gray-600">
                      Statutory Fire Detection Maintenance QR Code Labels • SANS 10139 Certified Register
                    </p>
                  </div>
                  <div className="text-right text-[10px]">
                    <div>Date: {new Date().toLocaleDateString('en-ZA')}</div>
                    <div>Quantity: {printableDevices.length} Labels</div>
                  </div>
                </div>
              </div>

              {/* Labels Grid */}
              <div
                className={`grid gap-4 print:gap-3 ${
                  labelFormat === 'compact_base'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3'
                    : labelFormat === 'thermal_roll_60x40'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2'
                    : labelFormat === 'avery_sheet_24'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2'
                }`}
              >
                {filteredDevices.map((device) => {
                  const isSelected = selectedDeviceIds.has(device.id);

                  return (
                    <div
                      key={device.id}
                      className={`relative transition-all rounded-xs ${
                        isSelected
                          ? 'ring-2 ring-[#CC0000] ring-offset-2 dark:ring-offset-slate-900 bg-white print:ring-0 print:ring-offset-0'
                          : 'opacity-50 hover:opacity-80 print:hidden'
                      }`}
                    >
                      {/* Selection Checkbox on corner (hidden on print) */}
                      <button
                        type="button"
                        onClick={() => handleToggleDevice(device.id)}
                        className="absolute -top-2 -left-2 z-10 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded-xs p-0.5 shadow-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer print:hidden"
                        title={isSelected ? 'Deselect from print' : 'Select for print'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#CC0000] fill-red-50 dark:fill-red-950/30" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* The actual label */}
                      <DeviceQRCodeLabel
                        device={device}
                        format={labelFormat}
                        showInteractiveActions={true}
                        onViewLog={() => onViewDeviceLog(device)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Information Bar (Hidden on print) */}
        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#CC0000]" />
            <span>
              Direct link targets format:{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-xs text-[10px] text-slate-800 dark:text-slate-200">
                ?device=[DEVICE_ID]#device-sans-log
              </code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
            >
              Done / Close
            </button>
            <button
              type="button"
              onClick={handlePrintSheet}
              disabled={printableDevices.length === 0}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
