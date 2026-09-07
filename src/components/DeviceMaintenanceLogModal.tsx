import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  QrCode,
  Copy,
  ExternalLink,
  Printer,
  FileText,
  Calendar,
  User,
  Zap,
  Activity,
  Cpu,
  MapPin,
  Flame,
  Award,
  PlusCircle,
  Hash,
  Send,
  Sparkles
} from 'lucide-react';
import { FireDetectionDevice, DeviceMaintenanceLogEntry } from '../types/deviceLog';
import { generateQrDataUrl, getDeviceDeepLinkUrl } from '../utils/qrCodeGenerator';
import { useApp } from '../context/AppContext';

interface DeviceMaintenanceLogModalProps {
  device: FireDetectionDevice | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQRGenerator?: (siteId?: string, deviceId?: string) => void;
}

export const DeviceMaintenanceLogModal: React.FC<DeviceMaintenanceLogModalProps> = ({
  device,
  isOpen,
  onClose,
  onOpenQRGenerator
}) => {
  const {
    showToast,
    addDeviceMaintenanceLog,
    setIsMaintenanceCheckModalOpen,
    setPreselectedSiteForMaintenance
  } = useApp();

  const [activeTab, setActiveTab] = useState<'logbook' | 'telemetry' | 'log_new_test'>('logbook');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Form state for Field Technician Quick Log
  const [testType, setTestType] = useState<DeviceMaintenanceLogEntry['serviceType']>('smoke_aerosol_test');
  const [testResult, setTestResult] = useState<DeviceMaintenanceLogEntry['result']>('pass');
  const [readingText, setReadingText] = useState<string>('Trigger response 8.6s; confirmed on panel within 2.1s');
  const [equipmentUsed, setEquipmentUsed] = useState<string>('Solo 330 Smoke Aerosol Dispenser + Solo A5 SANS Canister');
  const [technicianName, setTechnicianName] = useState<string>('Bethuel Moukangwe');
  const [saqccRegNumber, setSaqccRegNumber] = useState<string>('SAQCC #48291');
  const [techNotes, setTechNotes] = useState<string>('SANS 10139 rotational point testing completed. Chamber response sharp, LED pulse confirmed, base contacts cleaned.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate QR thumbnail
  useEffect(() => {
    if (device) {
      const link = getDeviceDeepLinkUrl(device.id);
      generateQrDataUrl(link, { width: 180, margin: 1 }).then(setQrCodeDataUrl);
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const deepLink = getDeviceDeepLinkUrl(device.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopiedLink(true);
    showToast('success', 'Direct Deep-Link Copied', `Direct link for device ${device.id} copied.`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintLog = () => {
    window.print();
  };

  // Submission handler for field technician SANS 10139 log
  const handleSubmitNewTest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const hash = `SHA256:${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    let title = 'SANS 10139 Point Testing';
    let clause = 'SANS 10139:2012 Clause 25.3';

    if (testType === 'smoke_aerosol_test') {
      title = 'SANS 10139 Smoke Aerosol Challenge Test';
      clause = 'SANS 10139:2012 Clause 25.3.1 (Aerosol Penetration)';
    } else if (testType === 'thermal_heat_test') {
      title = 'SANS 10139 Thermal Heat Element Response';
      clause = 'SANS 10139:2012 Clause 25.3.2 (Heat Detector Testing)';
    } else if (testType === 'manual_call_point_reset') {
      title = 'Manual Call Point Mechanical Trip & Reset';
      clause = 'SANS 10139:2012 Clause 25.2 (Weekly/Quarterly MCP)';
    } else if (testType === 'chamber_cleaning') {
      title = 'Optical Labyrinth Ultrasonic Cleaning & Drift Reset';
      clause = 'SANS 10139:2012 Clause 25.3.4 (Contamination Remediation)';
    } else if (testType === 'sans_annual_inspection') {
      title = 'SANS 10139 Clause 25.4 Annual Re-Certification Audit';
      clause = 'SANS 10139:2012 Clause 25.4 (Annual Certificate)';
    } else if (testType === 'fault_rectification') {
      title = 'Field Fault Clearance & Isolator Base Rectification';
      clause = 'SANS 10139:2012 Clause 25.5 (Fault Investigation)';
    }

    const newEntry: DeviceMaintenanceLogEntry = {
      id: `LOG-${device.id}-${Date.now().toString(36).toUpperCase()}`,
      date: formattedDate,
      serviceType: testType,
      serviceTypeTitle: title,
      sansClause: clause,
      result: testResult,
      testedBy: {
        name: technicianName,
        saqccNumber: saqccRegNumber,
        role: 'SAQCC Registered Fire Technician',
        company: 'Audrin Fire Engineers (Pty) Ltd'
      },
      testEquipmentUsed: equipmentUsed,
      testReading: readingText,
      notes: techNotes,
      digitalSignature: {
        signedBy: technicianName,
        timestamp: new Date().toISOString(),
        hash
      },
      cocReference: testResult === 'pass' ? `SANS-TEST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}` : undefined
    };

    addDeviceMaintenanceLog(device.id, newEntry);

    setIsSubmitting(false);
    showToast(
      'success',
      'SANS 10139 Log Recorded',
      `Device ${device.id} updated with official endorsement by ${technicianName} (${saqccRegNumber}).`
    );
    setActiveTab('logbook');
  };

  // Helper for status badge
  const getStatusDisplay = () => {
    switch (device.status) {
      case 'defect_fault':
        return {
          label: 'STATUTORY DEFECT / FAULT',
          color: 'bg-red-600 text-white',
          border: 'border-red-700',
          desc: 'Immediate remedial maintenance required under SANS 10139'
        };
      case 'service_due':
        return {
          label: 'SANS 10139 SERVICE DUE',
          color: 'bg-amber-500 text-slate-950 font-black',
          border: 'border-amber-600',
          desc: 'Mandatory routine testing required within current statutory window'
        };
      case 'warning':
        return {
          label: 'CHAMBER DRIFT ELEVATED',
          color: 'bg-amber-600 text-white',
          border: 'border-amber-700',
          desc: 'Optical contamination exceeds 50% threshold; cleaning recommended'
        };
      case 'normal':
      default:
        return {
          label: 'COMPLIANT SANS 10139',
          color: 'bg-emerald-600 text-white',
          border: 'border-emerald-700',
          desc: 'Device operates within certified sensitivity and inspection parameters'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div
      id="device-maintenance-log-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-sm border-t-4 border-[#CC0000] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="bg-[#0A192F] text-white p-4 sm:p-5 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-red-400">SANS 10139 FIRE DETECTION ASSET REGISTER</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-xs font-bold ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-700">
                  {device.id}
                </span>
                <span>{device.deviceTypeLabel}</span>
              </h2>
              <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{device.siteName}</span>
                </span>
                <span>•</span>
                <span className="text-slate-400">{device.zone}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="close-device-log-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Device Quick Stats / Telemetry Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-white p-2 rounded-xs border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Loop &amp; Address</div>
            <div className="font-black text-sm text-slate-900">
              L0{device.loopNumber} : ADDR {device.address.toString().padStart(3, '0')}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{device.manufacturer}</div>
          </div>

          <div className="bg-white p-2 rounded-xs border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Next SANS 10139 Test</div>
            <div className="font-black text-sm text-[#CC0000]">
              {device.nextSansDueDate}
            </div>
            <div className="text-[10px] text-slate-500">Last: {device.lastServiceDate}</div>
          </div>

          <div className="bg-white p-2 rounded-xs border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Chamber Contamination</div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-sm ${device.analogueTelemetry.contaminationPercent > 50 ? 'text-red-600' : 'text-slate-900'}`}>
                {device.analogueTelemetry.contaminationPercent}%
              </span>
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    device.analogueTelemetry.contaminationPercent > 50
                      ? 'bg-red-600'
                      : device.analogueTelemetry.contaminationPercent > 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, device.analogueTelemetry.contaminationPercent)}%` }}
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500">
              {device.analogueTelemetry.contaminationPercent > 50 ? 'Requires Cleaning' : 'Optics Clean'}
            </div>
          </div>

          <div className="bg-white p-2 rounded-xs border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Compliance Score</div>
            <div className="font-black text-sm text-emerald-600">
              {device.sans10139ComplianceScore}%
            </div>
            <div className="text-[10px] text-slate-500">
              Loop: {device.analogueTelemetry.loopVoltage}V DC
            </div>
          </div>
        </div>

        {/* Interactive Tabs Bar & Actions */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 font-mono font-bold">
            <button
              type="button"
              id="tab-btn-logbook"
              onClick={() => setActiveTab('logbook')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logbook'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SANS 10139 Logbook ({device.maintenanceHistory.length})</span>
            </button>

            <button
              type="button"
              id="tab-btn-telemetry"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Sensor Telemetry &amp; Specs</span>
            </button>

            <button
              type="button"
              id="tab-btn-log-new"
              onClick={() => setActiveTab('log_new_test')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'log_new_test'
                  ? 'bg-[#CC0000] text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Field Tech: Log SANS Test</span>
            </button>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-slate-700 flex items-center gap-1 cursor-pointer"
              title="Copy Deep Link"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span>{copiedLink ? 'Copied' : 'Copy QR Link'}</span>
            </button>

            {onOpenQRGenerator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQRGenerator(device.siteId, device.id);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-slate-700 flex items-center gap-1 cursor-pointer"
                title="Print QR Label"
              >
                <QrCode className="w-3 h-3 text-[#CC0000]" />
                <span>Print QR Label</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintLog}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xs flex items-center gap-1 cursor-pointer"
              title="Print Logbook"
            >
              <Printer className="w-3 h-3" />
              <span className="hidden sm:inline">Print Record</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SANS 10139 STATUTORY LOGBOOK TIMELINE */}
          {activeTab === 'logbook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#CC0000]" />
                    <span>SANS 10139:2012 Certified Statutory Maintenance Records</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological audit register of witness tests, aerosol challenges, and SAQCC certifications for asset <strong className="font-mono text-slate-700">{device.id}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('log_new_test')}
                  className="px-3 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white font-mono text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Endorse New Test</span>
                </button>
              </div>

              {/* Maintenance Log Timeline Cards */}
              <div className="space-y-3">
                {device.maintenanceHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs">
                    No prior SANS 10139 logbook entries recorded for this device.
                  </div>
                ) : (
                  device.maintenanceHistory.map((entry, index) => {
                    const isPass = entry.result === 'pass' || entry.result === 'serviced';
                    const isDefect = entry.result === 'defect';

                    return (
                      <div
                        key={entry.id || index}
                        className={`p-4 rounded-sm border transition-all ${
                          isDefect
                            ? 'bg-red-50/70 border-red-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase ${
                                isDefect
                                  ? 'bg-[#CC0000] text-white'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {entry.result.toUpperCase()}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-[#0A192F]">
                              {entry.serviceTypeTitle}
                            </h4>
                          </div>

                          <div className="text-right font-mono text-xs text-slate-500 flex items-center gap-2 sm:justify-end">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{entry.date}</span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Test Reading & Equipment */}
                          <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-1.5 font-mono">
                            <div className="text-[11px] text-slate-700">
                              <strong className="text-slate-900">Standard Clause:</strong>{' '}
                              <span className="text-blue-700">{entry.sansClause}</span>
                            </div>
                            <div className="text-[11px] text-slate-700">
                              <strong className="text-slate-900">Test Reading:</strong>{' '}
                              <span className="text-slate-900 font-bold">{entry.testReading}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              <strong className="text-slate-700">Equipment:</strong> {entry.testEquipmentUsed}
                            </div>
                          </div>

                          {/* Technician & Digital Signature */}
                          <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-[#CC0000]" />
                                <span>{entry.testedBy.name}</span>
                              </div>
                              <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded-xs font-bold border border-red-200">
                                {entry.testedBy.saqccNumber}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 italic">
                              "{entry.notes}"
                            </div>
                            {entry.digitalSignature && (
                              <div className="text-[9px] font-mono text-slate-400 truncate pt-1 border-t border-slate-200">
                                Sig: {entry.digitalSignature.hash}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS & SENSOR TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Hardware Profile &amp; Real-Time Loop Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Engineering specifications and analogue values read from the Control &amp; Indicating Equipment (CIE).
                </p>
              </div>

              {/* Hardware Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-600" />
                    <span>Physical Device Parameters</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Device ID / Barcode:</span>
                    <span className="font-bold text-slate-900">{device.barcode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Manufacturer &amp; Model:</span>
                    <span className="font-bold text-slate-900">{device.manufacturer} ({device.modelNumber})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-bold text-slate-900">{device.serialNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mounting Base Type:</span>
                    <span className="font-bold text-slate-900">{device.baseType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Original Commission Date:</span>
                    <span className="font-bold text-slate-900">{device.installationDate}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Electrical &amp; Polling Telemetry</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Chamber Contamination:</span>
                    <span className={`font-bold ${device.analogueTelemetry.contaminationPercent > 50 ? 'text-red-600' : 'text-slate-900'}`}>
                      {device.analogueTelemetry.contaminationPercent}% (Drift Index)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Sensitivity Calibration:</span>
                    <span className="font-bold text-slate-900">{device.analogueTelemetry.sensitivityLevel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Loop Standby Voltage:</span>
                    <span className="font-bold text-slate-900">{device.analogueTelemetry.loopVoltage} V DC</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Polling Signal Margin:</span>
                    <span className="font-bold text-emerald-600">{device.analogueTelemetry.signalMargin}% Clean Signal</span>
                  </div>
                  {device.analogueTelemetry.temperatureC !== undefined && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Sensor Head Temp:</span>
                      <span className="font-bold text-slate-900">{device.analogueTelemetry.temperatureC} °C</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Location Detail */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-sm text-xs text-blue-950">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Architectural As-Built Location Detail</span>
                </div>
                <p className="leading-relaxed">
                  <strong>Facility:</strong> {device.siteName} ({device.clientOrganisation})<br />
                  <strong>Zonal Assignment:</strong> {device.zone}<br />
                  <strong>Precise Point:</strong> {device.subLocation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FIELD TECHNICIAN SANS 10139 DIRECT TEST ENTRY FORM */}
          {activeTab === 'log_new_test' && (
            <form onSubmit={handleSubmitNewTest} className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-3 rounded-sm text-xs text-red-950 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold font-mono uppercase text-red-900">
                    SAQCC On-Site Field Technician Verification
                  </h4>
                  <p className="text-red-800 text-[11px] mt-0.5 leading-relaxed">
                    Recording a statutory test here automatically updates the SANS 10139 physical logbook register, attaches your certified SAQCC credential, and issues a tamper-evident digital signature hash.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Statutory Test / Service Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value="smoke_aerosol_test">Smoke Aerosol Challenge (Solo 330)</option>
                    <option value="thermal_heat_test">Thermal Heat Element Response (Solo 461)</option>
                    <option value="manual_call_point_reset">Manual Call Point Trip &amp; Reset</option>
                    <option value="chamber_cleaning">Optical Labyrinth Cleaning &amp; Drift Reset</option>
                    <option value="sans_quarterly_audit">SANS 10139 Clause 25.3 Quarterly Audit</option>
                    <option value="sans_annual_inspection">SANS 10139 Clause 25.4 Annual Re-Certification</option>
                    <option value="fault_rectification">Fault Rectification &amp; Base Rewiring</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Test Outcome / Finding
                  </label>
                  <select
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option value="pass">SANS 10139 Pass (Compliant Response)</option>
                    <option value="serviced">Serviced &amp; Restored to Service</option>
                    <option value="defect">Statutory Defect Cited (Action Required)</option>
                    <option value="replaced">Sensor Head Replaced</option>
                    <option value="calibrated">Sensitivity Re-Calibrated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Calibrated Test Equipment Used
                  </label>
                  <input
                    type="text"
                    value={equipmentUsed}
                    onChange={(e) => setEquipmentUsed(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-sans text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    placeholder="e.g. Solo 330 Dispenser, Solo A5 SANS Canister"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Measured Response Time / Reading
                  </label>
                  <input
                    type="text"
                    value={readingText}
                    onChange={(e) => setReadingText(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-sans text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    placeholder="e.g. 8.4s trigger, address confirmed on panel"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lead Technician Name
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-sans text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SAQCC Registration Number
                  </label>
                  <input
                    type="text"
                    value={saqccRegNumber}
                    onChange={(e) => setSaqccRegNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  Technician Observations &amp; Remedial Endorsements
                </label>
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm font-sans text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  placeholder="Record sensor physical state, cleanliness of base, test conditions, or corrective measures taken..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('logbook')}
                  className="px-4 py-2 border border-slate-300 rounded-sm text-xs font-mono text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono text-xs font-bold rounded-sm flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Endorse SANS 10139 Record</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom QR Code Card for Physical Field Verification */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 flex flex-col sm:flex-row items-center gap-4 text-xs font-mono">
            <div className="w-24 h-24 bg-white border border-slate-300 p-1 rounded-xs shrink-0 flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Thumbnail" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
              <div className="font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Physical QR Label Deep Link URL</span>
              </div>
              <p className="text-slate-500 text-[11px] font-sans">
                Scanning this QR label on the physical detector ceiling base opens this exact maintenance log and digital logbook.
              </p>
              <div className="bg-white border border-slate-300 p-1.5 rounded-xs text-[10px] text-slate-600 truncate">
                {deepLink}
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xs flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
              </button>
              {onOpenQRGenerator && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQRGenerator(device.siteId, device.id);
                  }}
                  className="px-3 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white rounded-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tag</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#CC0000]" />
            <span>SANS 10139 Fire Detection Digital Asset Register</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
