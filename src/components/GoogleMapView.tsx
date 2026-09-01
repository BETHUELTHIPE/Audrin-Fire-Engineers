import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Clock,
  Phone,
  Shield,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/initialData';

export interface GoogleMapViewProps {
  /** Optional custom height class, e.g. "h-96" */
  heightClass?: string;
  /** Optional container title */
  title?: string;
  /** Show the information sidebar / card */
  showInfoCard?: boolean;
  /** Custom additional styling class */
  className?: string;
}

/**
 * Interactive Google Map & Location Component for Audrin Fire Engineers
 * Displays the headquarters at 27 Tshivhase Street, Pretoria West, Pretoria, 0008, South Africa
 * with interactive map embed, turn-by-turn navigation links, copyable address, and service perimeter.
 */
export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  heightClass = 'h-[380px] sm:h-[450px]',
  title = 'Headquarters & Engineering Depot',
  showInfoCard = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');

  const fullAddress = COMPANY_DETAILS.physicalAddress;
  const encodedAddress = encodeURIComponent(fullAddress);

  // Google Maps Embed & Navigation URLs
  const embedMapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed&z=16${
    mapMode === 'satellite' ? '&t=k' : ''
  }`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const openInGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      
      {/* Top Header Bar with Geometric Branding */}
      <div className="bg-[#0A192F] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/20 border border-[#CC0000]/40 flex items-center justify-center text-[#CC0000] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#CC0000] uppercase">
                Google Maps Location
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] font-mono text-slate-300">Pretoria West</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* View Mode & Direction Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-800/80 p-0.5 rounded-lg flex items-center border border-slate-700 text-xs">
            <button
              onClick={() => setMapMode('standard')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                mapMode === 'standard'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#990000] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>

      {/* Grid: Map Frame + Info Details */}
      <div className={`grid grid-cols-1 ${showInfoCard ? 'lg:grid-cols-12' : ''}`}>
        
        {/* Interactive Google Map Iframe */}
        <div className={`relative ${showInfoCard ? 'lg:col-span-8' : 'w-full'} ${heightClass} bg-slate-100 dark:bg-slate-950`}>
          <iframe
            title="Audrin Fire Engineers Pretoria West Google Map"
            src={embedMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#CC0000] animate-ping"></span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono">
              27 Tshivhase St, Pretoria West
            </span>
          </div>

          {/* Quick Launch Google Maps Pin */}
          <div className="absolute bottom-3 right-3">
            <a
              href={openInGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#CC0000]" />
              <span>Open in Google Maps App</span>
            </a>
          </div>
        </div>

        {/* Address & Facility Information Card */}
        {showInfoCard && (
          <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/60 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Physical &amp; Postal Address
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                  {fullAddress}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Suburb: Pretoria West | Postal Code: 0008
                </p>
              </div>

              {/* Copy Address Action */}
              <button
                onClick={handleCopyAddress}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Address Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Full Address</span>
                  </>
                )}
              </button>

              {/* Operating Logistics */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Operating Hours:</span>
                    <span>{COMPANY_DETAILS.operatingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Engineering Desk:</span>
                    <a
                      href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
                      className="font-mono text-slate-900 dark:text-white hover:text-[#CC0000] font-bold"
                    >
                      {COMPANY_DETAILS.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4 text-[#0A192F] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Standard Compliance:</span>
                    <span>SANS 10139 Fire Detection Code</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Direction Launcher */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#CC0000]" />
                <span>Navigate to Pretoria West Depot</span>
              </a>
            </div>

          </div>
        )}

      </div>

      {/* Service Coverage Radius Banner */}
      <div className="bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#CC0000]" />
          <span>
            <strong className="text-slate-900 dark:text-slate-200">Rapid Response Radius:</strong> Tshwane, Centurion, Midrand, Johannesburg &amp; Greater Gauteng.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          GPS Coordinates: 25.7505° S, 28.1630° E
        </div>
      </div>

    </div>
  );
};
