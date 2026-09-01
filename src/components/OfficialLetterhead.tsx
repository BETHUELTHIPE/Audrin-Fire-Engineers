import React from 'react';
import { BrandLogo } from './BrandLogo';
import { COMPANY_DETAILS } from '../data/initialData';
export { ReportLetterhead, ReportLetterheadFooter, ReportLetterheadContactBox, getReportLetterheadHtml } from './ReportLetterhead';
export type { ReportLetterheadProps } from './ReportLetterhead';
import {
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
  ClipboardList,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface OfficialLetterheadHeaderProps {
  date?: string;
  documentReference?: string;
  recipientName?: string;
  recipientPosition?: string;
  organisationName?: string;
  recipientAddress?: string;
  documentTitle?: string;
  showContactsCard?: boolean;
  className?: string;
}

/**
 * Official Letterhead Top Header matching official Audrin Fire Engineers stationary:
 * - Official Emblem & Typography
 * - Subtitle: FIRE DETECTION & ALARM SYSTEMS | SANS 10139
 * - Navy & Crimson accent divider line
 */
export const OfficialLetterheadHeader: React.FC<OfficialLetterheadHeaderProps> = ({
  date = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }),
  documentReference,
  recipientName,
  recipientPosition,
  organisationName,
  recipientAddress,
  documentTitle,
  showContactsCard = false,
  className = ''
}) => {
  return (
    <header className={`bg-white text-slate-900 border-b border-slate-200 pb-5 space-y-4 select-none ${className}`}>
      {/* Top Banner Row: Logo + Alignment Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BrandLogo variant="dark" size="lg" showTagline={false} />
          {/* Official Subtitle Bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-[#0A192F]">
              FIRE DETECTION & ALARM SYSTEMS
            </span>
            <span className="text-slate-400 font-bold">|</span>
            <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-[#CC0000]">
              SANS 10139
            </span>
          </div>
        </div>

        {/* Top Right Document Metadata */}
        <div className="text-right font-mono text-xs text-slate-600 space-y-1 self-start sm:self-end">
          <div>
            <span className="text-slate-400 uppercase text-[10px] block">Date of Issue:</span>
            <strong className="text-slate-900 font-bold">{date}</strong>
          </div>
          {documentReference && (
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Document Ref:</span>
              <strong className="text-[#CC0000] font-black">{documentReference}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Official Multi-Tone Rule Divider (Navy & Red) */}
      <div className="w-full flex h-[3px]">
        <div className="w-2/5 bg-[#0A192F]"></div>
        <div className="w-1/5 bg-[#CC0000]"></div>
        <div className="w-2/5 bg-[#0A192F]"></div>
      </div>

      {/* Optional Top Contact Card (as in official stationary card) */}
      {showContactsCard && (
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3.5 text-xs font-mono text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
              <span className="text-slate-500">Registration No:</span>
              <strong className="text-slate-900">{COMPANY_DETAILS.registrationNumber}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
              <span className="text-slate-500">Telephone:</span>
              <strong className="text-slate-900">{COMPANY_DETAILS.telephone}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
              <span className="text-slate-500">Email:</span>
              <strong className="text-slate-900">{COMPANY_DETAILS.email}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Postal & Physical Address:</span>
                <span className="text-slate-900 font-bold">27 Tshivhase Street, Pretoria West, Pretoria, 0008</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
              <span className="text-slate-500">Operating Hours:</span>
              <span className="text-slate-900 font-bold">Mon – Sun: 07:00 – 20:00</span>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Box (if provided) */}
      {(recipientName || organisationName || documentTitle) && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs font-mono">
          {(recipientName || organisationName) && (
            <div className="text-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TO:</span>
              {recipientName && <strong className="text-sm font-bold text-slate-900 block font-sans">{recipientName}</strong>}
              {recipientPosition && <p className="text-slate-600">{recipientPosition}</p>}
              {organisationName && <p className="font-bold text-[#0A192F]">{organisationName}</p>}
              {recipientAddress && <p className="text-slate-500 max-w-sm whitespace-pre-line">{recipientAddress}</p>}
            </div>
          )}

          {documentTitle && (
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">SUBJECT / PURPOSE:</span>
              <h3 className="text-sm sm:text-base font-black text-[#0A192F] uppercase tracking-tight">
                {documentTitle}
              </h3>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

interface OfficialLetterheadFooterProps {
  pageNumber?: number;
  totalPages?: number;
  className?: string;
  isCompact?: boolean;
}

/**
 * Official Letterhead Bottom Footer matching official Audrin Fire Engineers stationary:
 * - Multi-Tone Rule Divider
 * - Registration number: K2026089596
 * - Contact: 071 415 6665 | bethuelmoukangwe8@gmail.com | Mon - Sun: 07:00 - 20:00
 * - Postal Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008
 * - Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008
 * - Page numbering
 */
export const OfficialLetterheadFooter: React.FC<OfficialLetterheadFooterProps> = ({
  pageNumber = 1,
  totalPages = 1,
  className = '',
  isCompact = false
}) => {
  return (
    <footer className={`mt-8 pt-4 border-t border-slate-200 select-none text-slate-600 font-mono text-[10px] sm:text-[11px] space-y-2 ${className}`}>
      {/* Official Multi-Tone Rule Accent Divider */}
      <div className="w-full flex h-[2px] mb-3">
        <div className="w-2/5 bg-[#0A192F]"></div>
        <div className="w-1/5 bg-[#CC0000]"></div>
        <div className="w-2/5 bg-[#0A192F]"></div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        {/* Registration Line */}
        <div>
          <strong className="text-[#0A192F] font-black uppercase tracking-wider text-xs">
            AUDRIN FIRE ENGINEERS
          </strong>
          <span className="mx-2 text-slate-300">|</span>
          <span>Registration No: <strong className="text-slate-900 font-bold">{COMPANY_DETAILS.registrationNumber}</strong></span>
        </div>

        {/* Page Indicator */}
        <div className="text-slate-500 font-bold">
          Page {pageNumber} {totalPages > 1 ? `of ${totalPages}` : ''}
        </div>
      </div>

      {/* Contact Line */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-slate-700">
        <span className="font-bold text-[#CC0000]">{COMPANY_DETAILS.telephone}</span>
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-slate-800">{COMPANY_DETAILS.email}</span>
        <span className="text-slate-300">|</span>
        <span>Mon – Sun: 07:00 – 20:00</span>
      </div>

      {!isCompact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            <strong>Postal Address:</strong> 27 Tshivhase Street, Pretoria West, Pretoria, 0008
          </div>
          <div className="md:text-right">
            <strong>Residential Address:</strong> 27 Tshivhase Street, Pretoria West, Pretoria, 0008
          </div>
        </div>
      )}
    </footer>
  );
};
