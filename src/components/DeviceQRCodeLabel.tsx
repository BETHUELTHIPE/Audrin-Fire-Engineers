import React, { useState, useEffect } from 'react';
import {
  Shield,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  ExternalLink,
  Flame,
  Phone
} from 'lucide-react';
import { FireDetectionDevice, LabelFormatOption } from '../types/deviceLog';
import { generateQrDataUrl, getDeviceDeepLinkUrl, generateQrSvgString } from '../utils/qrCodeGenerator';
import { useApp } from '../context/AppContext';

interface DeviceQRCodeLabelProps {
  device: FireDetectionDevice;
  format?: LabelFormatOption;
  showInteractiveActions?: boolean;
  onViewLog?: (device: FireDetectionDevice) => void;
}

export const DeviceQRCodeLabel: React.FC<DeviceQRCodeLabelProps> = ({
  device,
  format = 'standard_industrial',
  showInteractiveActions = true,
  onViewLog
}) => {
  const { showToast } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const deepLink = getDeviceDeepLinkUrl(device.id);

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(deepLink, { width: 220, margin: 1 }).then((url) => {
      if (isMounted) {
        setQrDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [deepLink]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(deepLink);
    setCopied(true);
    showToast('success', 'Deep Link Copied', `Direct SANS 10139 log URL copied for device ${device.id}.`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSvg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const svgStr = await generateQrSvgString(deepLink);
    if (!svgStr) return;

    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-LABEL-${device.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'QR Code Downloaded', `SVG file saved for ${device.id}`);
  };

  // Status visual badge helper
  const getStatusBadge = () => {
    switch (device.status) {
      case 'defect_fault':
        return { text: 'DEFECT / OVERDUE', bg: 'bg-[#CC0000] text-white', border: 'border-red-600' };
      case 'service_due':
        return { text: 'SANS TEST DUE', bg: 'bg-amber-500 text-slate-950', border: 'border-amber-600' };
      case 'warning':
        return { text: 'CHAMBER WARN', bg: 'bg-amber-600 text-white', border: 'border-amber-700' };
      case 'normal':
      default:
        return { text: 'SANS 10139 OK', bg: 'bg-emerald-600 text-white', border: 'border-emerald-700' };
    }
  };

  const statusBadge = getStatusBadge();

  // 1. STANDARD INDUSTRIAL ASSET BADGE (70mm x 45mm simulated)
  if (format === 'standard_industrial') {
    return (
      <div
        id={`qr-label-${device.id}`}
        className="device-qr-label relative bg-white border-2 border-slate-900 rounded-xs shadow-xs text-slate-900 overflow-hidden select-none w-full max-w-[340px] flex flex-col justify-between font-sans print:border-black print:shadow-none print:break-inside-avoid print:max-w-none print:w-[320px] print:h-[190px] h-[200px]"
      >
        {/* Top Header Banner: Brand & Standard Authority */}
        <div className="bg-[#0A192F] text-white px-2.5 py-1 flex items-center justify-between border-b-2 border-[#CC0000] print:bg-black">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#CC0000] fill-[#CC0000]" />
            <span className="font-mono font-black text-[11px] tracking-wider uppercase">
              AUDRIN FIRE ENGINEERS
            </span>
          </div>
          <div className="flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-xs font-bold print:bg-black print:border print:border-white">
            <span>SANS 10139</span>
          </div>
        </div>

        {/* Middle Body: QR Code (Left) + Device Specs & SANS Log Details (Right) */}
        <div className="p-2.5 flex items-center gap-3 flex-1">
          {/* QR Code Container */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-[88px] h-[88px] bg-white border border-slate-300 rounded-xs p-1 flex items-center justify-center print:border-black">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${device.id}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                </div>
              )}
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">
              SCAN TO VIEW LOG
            </span>
          </div>

          {/* Right Information Block */}
          <div className="flex-1 min-w-0 space-y-1 text-left">
            {/* Device ID */}
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm text-[#0A192F] tracking-tight bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-300 print:border-black">
                {device.id}
              </span>
              <span className={`text-[8px] font-mono font-black px-1 rounded-xs ${statusBadge.bg}`}>
                {statusBadge.text}
              </span>
            </div>

            {/* Loop & Address */}
            <div className="text-[11px] font-mono font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-slate-200 px-1 py-0.2 rounded-xs">L{device.loopNumber}</span>
              <span>ADDR: {device.address.toString().padStart(3, '0')}</span>
            </div>

            {/* Zone & Sub-location */}
            <div className="text-[10px] font-semibold text-slate-700 truncate leading-tight">
              {device.zone}
            </div>

            {/* Device Type & Model */}
            <div className="text-[9px] font-mono text-slate-500 truncate">
              {device.manufacturer} • {device.modelNumber}
            </div>

            {/* SANS Next Test Due Date */}
            <div className="text-[9px] font-mono font-bold text-[#CC0000] border-t border-slate-200 pt-0.5 flex items-center justify-between">
              <span>NEXT SANS TEST:</span>
              <span className="bg-red-50 text-red-700 px-1 rounded-xs">{device.nextSansDueDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Bar: SAQCC Accreditation & 24/7 Hotline */}
        <div className="bg-slate-100 border-t border-slate-300 px-2 py-1 flex items-center justify-between text-[9px] font-mono text-slate-700 print:bg-white print:border-black">
          <span className="truncate max-w-[170px] font-medium">
            SAQCC #48291 • SANS 1475 Master
          </span>
          <span className="font-bold text-slate-900 flex items-center gap-1">
            <Phone className="w-2.5 h-2.5 text-[#CC0000]" />
            <span>071 415 6665</span>
          </span>
        </div>

        {/* Interactive hover actions (hidden during print) */}
        {showInteractiveActions && (
          <div className="absolute inset-0 bg-[#0A192F]/90 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-white font-mono text-xs print:hidden">
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-red-400" />
              <span>{device.id}</span>
            </div>
            <p className="text-[11px] text-slate-300 text-center max-w-[240px]">
              SANS 10139 Digital Log &amp; Maintenance Record
            </p>
            <div className="flex items-center gap-2 mt-1">
              {onViewLog && (
                <button
                  type="button"
                  onClick={() => onViewLog(device)}
                  className="bg-[#CC0000] hover:bg-red-700 text-white px-2.5 py-1 rounded-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Log</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-xs flex items-center gap-1 cursor-pointer"
                title="Copy Deep Link"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-xs flex items-center gap-1 cursor-pointer"
                title="Download SVG QR"
              >
                <Download className="w-3 h-3" />
                <span>SVG</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. COMPACT DETECTOR BASE TAG (42mm x 25mm miniature tag)
  if (format === 'compact_base') {
    return (
      <div
        id={`qr-compact-${device.id}`}
        className="device-qr-label bg-white border border-slate-800 rounded-xs p-1.5 text-slate-900 select-none w-full max-w-[240px] flex items-center gap-2 font-mono text-[10px] print:border-black print:break-inside-avoid print:w-[220px] print:h-[95px] h-[100px] shadow-xs"
      >
        {/* Compact QR Code */}
        <div className="w-[64px] h-[64px] bg-white border border-slate-300 p-0.5 shrink-0 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR ${device.id}`} className="w-full h-full object-contain" />
          ) : (
            <QrCode className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {/* Ultra-compact details */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-[#0A192F]">{device.id}</span>
            <span className={`text-[7px] font-bold px-1 rounded-xs ${statusBadge.bg}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="text-[9px] font-bold text-slate-700">
            L{device.loopNumber} : ADDR {device.address}
          </div>
          <div className="text-[8px] text-slate-600 truncate font-sans">{device.zone}</div>
          <div className="text-[7.5px] text-[#CC0000] font-bold pt-0.5 border-t border-slate-200">
            SANS DUE: {device.nextSansDueDate}
          </div>
          <div className="text-[7px] text-slate-400">AUDRIN FIRE • 071 415 6665</div>
        </div>
      </div>
    );
  }

  // 3. THERMAL ROLL FORMAT (60mm x 40mm mobile direct thermal)
  if (format === 'thermal_roll_60x40') {
    return (
      <div
        id={`qr-thermal-${device.id}`}
        className="device-qr-label bg-white border-2 border-black p-2 text-black select-none w-full max-w-[280px] h-[160px] flex flex-col justify-between font-mono print:break-inside-avoid print:w-[260px] print:h-[150px]"
      >
        <div className="flex items-center justify-between border-b border-black pb-1">
          <span className="font-black text-xs uppercase tracking-tight">AUDRIN SANS 10139</span>
          <span className="text-[9px] font-bold bg-black text-white px-1">L{device.loopNumber}-A{device.address}</span>
        </div>

        <div className="flex items-center gap-2 my-1">
          <div className="w-[72px] h-[72px] border border-black p-0.5 shrink-0 flex items-center justify-center">
            {qrDataUrl && <img src={qrDataUrl} alt={device.id} className="w-full h-full object-contain" />}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5 text-[9px]">
            <div className="font-black text-xs">{device.id}</div>
            <div className="truncate font-sans font-semibold text-[10px]">{device.zone}</div>
            <div className="text-[8.5px] truncate">{device.deviceTypeLabel}</div>
            <div className="font-bold">DUE: {device.nextSansDueDate}</div>
          </div>
        </div>

        <div className="border-t border-black pt-1 flex items-center justify-between text-[8px] font-bold">
          <span>SAQCC #48291</span>
          <span>EMERGENCY: 071 415 6665</span>
        </div>
      </div>
    );
  }

  // 4. AVERY SHEET 24-UP ITEM
  return (
    <div
      id={`qr-avery-${device.id}`}
      className="device-qr-label bg-white border border-slate-400 rounded-xs p-2 text-slate-900 select-none w-full h-[120px] flex items-center gap-2 font-mono print:border-black print:break-inside-avoid"
    >
      <div className="w-[68px] h-[68px] border border-slate-300 p-0.5 shrink-0 flex items-center justify-center">
        {qrDataUrl && <img src={qrDataUrl} alt={device.id} className="w-full h-full object-contain" />}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5 text-[9px]">
        <div className="flex items-center justify-between">
          <span className="font-black text-xs text-[#0A192F]">{device.id}</span>
          <span className="text-[7.5px] bg-slate-900 text-white px-1 font-bold">L{device.loopNumber}:A{device.address}</span>
        </div>
        <div className="font-sans font-bold text-[10px] text-slate-800 truncate">{device.zone}</div>
        <div className="text-[8px] text-slate-600 truncate">{device.modelNumber}</div>
        <div className="text-[8px] font-bold text-[#CC0000]">DUE: {device.nextSansDueDate}</div>
        <div className="text-[7px] text-slate-400 border-t border-slate-200 pt-0.5">AUDRIN FIRE SANS 10139</div>
      </div>
    </div>
  );
};
