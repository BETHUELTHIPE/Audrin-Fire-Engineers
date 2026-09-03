import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { COMPANY_DETAILS } from '../data/initialData';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Compass,
  Building2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { currentUser, setActiveView, setSelectedServiceSlug, services, setIsEmergencyModalOpen, setIsRequestModalOpen } = useApp();
  const [copied, setCopied] = useState(false);

  const handleServiceClick = (slug: string) => {
    setSelectedServiceSlug(slug);
    setActiveView('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (viewName: string) => {
    setActiveView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(COMPANY_DETAILS.physicalAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_DETAILS.physicalAddress)}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY_DETAILS.physicalAddress)}`;

  return (
    <footer className="bg-[#0A192F] text-white border-t border-slate-800">
      {/* Scope & Standard Alignment Notice Banner */}
      <div className="bg-[#071322] border-b border-slate-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#CC0000] shrink-0" />
            <span>
              <strong className="text-white">Scope Notice:</strong> Audrin Fire Engineers provides commercial &amp; non-domestic fire-detection and fire-alarm services aligned with applicable SANS 10139 guidelines.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#CC0000] font-bold text-center md:text-right font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-pulse"></span>
            <span>Non-Domestic &amp; Commercial Premises Only</span>
          </div>
        </div>
      </div>

      {/* Prominent Geometric Balance Location & Rapid Dispatch Panel */}
      <div className="bg-[#0D213F] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Address & Engineering Depot Info (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#CC0000] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                  Engineering Headquarters
                </span>
                <span className="text-slate-400 text-xs font-mono">Pretoria West Depot</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 border border-[#CC0000]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-[#CC0000]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                    {COMPANY_DETAILS.physicalAddress}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans mt-1">
                    Central engineering workshop, technical spares depot, and commercial dispatch hub serving Pretoria, Tshwane, Centurion, Midrand, Johannesburg, and Greater Gauteng.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Actions & Directions (5 cols) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center justify-end gap-2.5">
              {/* Open in Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer text-center"
              >
                <Compass className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Get Directions */}
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                <Navigation className="w-4 h-4 text-[#FFB703]" />
                <span>Get Directions</span>
              </a>

              {/* Copy Full Address */}
              <button
                type="button"
                onClick={copyAddressToClipboard}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 px-3 py-2.5 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer"
                title="Copy address to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Statutory Identity */}
          <div className="space-y-4">
            <BrandLogo variant="white" size="md" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Specialist engineering partner for commercial fire-detection, addressable alarm system design, installation, commissioning, planned maintenance, and rapid fault diagnosis.
            </p>
            <div className="pt-3 text-[11px] text-slate-300 space-y-1.5 border-t border-slate-800">
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Registration No:</strong> <span className="font-mono text-white font-bold">{COMPANY_DETAILS.registrationNumber}</span></p>
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Entity:</strong> <span className="text-white">{COMPANY_DETAILS.legalName}</span></p>
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Standard Alignment:</strong> <span className="text-[#CC0000] font-bold">SANS 10139:2012</span></p>
            </div>
          </div>

          {/* Col 2: Featured Commercial Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 border-l-4 border-[#CC0000] pl-2.5 font-mono">
              Fire-Detection Services
            </h4>
            <ul className="space-y-2 text-xs">
              {services.slice(0, 7).map((srv) => (
                <li key={srv.id}>
                  <button
                    onClick={() => handleServiceClick(srv.slug)}
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#CC0000] transition-colors shrink-0" />
                    <span className="truncate">{srv.title}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavClick('services')}
                  className="text-[#CC0000] hover:text-red-400 text-xs font-bold uppercase tracking-wider pt-1 flex items-center gap-1 cursor-pointer font-mono"
                >
                  View All 18 Services →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: How We Work & Operational Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 border-l-4 border-[#CC0000] pl-2.5 font-mono">
              Process &amp; Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => handleNavClick(currentUser ? 'customer-portal' : 'legal')}
                  className="hover:text-white transition-colors text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#CC0000]" />
                  <span>SANS Legal &amp; Regulatory Hub</span>
                  <span className="text-[10px] text-amber-400/80 font-mono font-normal">(Client Portal)</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('how-we-work')} className="hover:text-white transition-colors cursor-pointer">
                  7-Step How We Work Timeline
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors cursor-pointer">
                  Company Overview &amp; Principles
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  Technical Hardware Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('customer-portal')} className="hover:text-white transition-colors cursor-pointer">
                  Customer Service Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('admin-portal')} className="hover:text-white transition-colors text-slate-300 cursor-pointer">
                  Operations &amp; Django Admin
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:text-red-100 font-bold bg-[#CC0000] px-3 py-1.5 rounded-sm uppercase tracking-wider cursor-pointer font-mono shadow-xs"
                >
                  <AlertTriangle className="w-3 h-3 text-white" />
                  Report Fire-Alarm Fault
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Direct Channels & Engineering Schedule */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 border-l-4 border-[#CC0000] pl-2.5 font-mono">
              Direct Contact Channels
            </h4>
            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Telephone */}
              <a
                href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-[#CC0000] shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white font-mono group-hover:text-red-400">{COMPANY_DETAILS.telephone}</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Direct Line / 24/7 Triage</div>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${COMPANY_DETAILS.email}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-[#CC0000] shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white break-all group-hover:text-red-300">{COMPANY_DETAILS.email}</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Official Enquiries &amp; Orders</div>
                </div>
              </a>

              {/* Physical Location Card */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Physical Headquarters</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-[#CC0000] hover:underline flex items-center gap-0.5"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="text-[11px] text-white font-mono leading-tight">
                  {COMPANY_DETAILS.physicalAddress}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-[#FFB703] shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider font-mono">Operating Hours:</span>
                  <div className="text-slate-200 font-mono">{COMPANY_DETAILS.operatingHours}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Operational Heartbeat */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div>
              © {new Date().getFullYear()} {COMPANY_DETAILS.legalName}. All rights reserved. Registration No: <span className="font-mono text-white font-bold">{COMPANY_DETAILS.registrationNumber}</span>.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white font-mono">System Operational • SANS 10139 Aligned</span>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-slate-400 text-xs">
            <button onClick={() => handleNavClick('legal')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => handleNavClick('legal')} className="hover:text-white transition-colors cursor-pointer">
              POPIA Compliance
            </button>
            <span>•</span>
            <button onClick={() => handleNavClick('legal')} className="hover:text-white transition-colors cursor-pointer">
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
