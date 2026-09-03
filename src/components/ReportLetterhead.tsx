import React from 'react';
import { Flame, ShieldCheck, Award, MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';

export interface ReportLetterheadProps {
  id?: string;
  reportReference?: string;
  reportDate?: string;
  revisionNumber?: string;
  standardReference?: string;
  showWatermarkBadge?: boolean;
  classification?: 'CONFIDENTIAL' | 'STATUTORY SUBMISSION' | 'TECHNICAL AUDIT' | 'FINAL COMPLIANCE' | 'INTERNAL DRAFT';
  className?: string;
}

/**
 * ReportLetterhead Component
 * Follows the 'Geometric Balance' architectural design system for Audrin Fire Engineers (Pty) Ltd.
 * Displays official company branding, Registration (K2026089596), ECSA/SANS statutory credentials,
 * and high-contrast precision header geometry for statutory engineering reports & PDF exports.
 */
export const ReportLetterhead: React.FC<ReportLetterheadProps> = ({
  id = 'audrin-report-letterhead',
  reportReference,
  reportDate = new Date().toISOString().split('T')[0],
  revisionNumber = 'REV 01.0',
  standardReference = 'SANS 10139 / SANS 10400-T / SANS 246',
  showWatermarkBadge = true,
  classification = 'STATUTORY SUBMISSION',
  className = ''
}) => {
  return (
    <header
      id={id}
      className={`relative bg-white text-slate-900 border-b-2 border-[#0A192F] pb-4 select-none ${className}`}
    >
      {/* Top Precision Geometric Accent Bar */}
      <div className="h-1.5 w-full bg-[#0A192F] flex mb-4">
        <div className="w-1/3 bg-[#CC0000]" />
        <div className="w-1/12 bg-amber-500" />
        <div className="flex-1 bg-[#0A192F]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Official Corporate Brand & Registration */}
        <div className="md:col-span-7 flex items-start gap-3.5">
          {/* Brand Logo Symbol */}
          <div className="w-14 h-14 bg-[#0A192F] rounded-xs flex items-center justify-center p-2.5 shrink-0 shadow-xs border border-slate-800">
            <div className="relative flex items-center justify-center">
              <Flame className="w-8 h-8 text-[#CC0000] fill-[#CC0000]" />
              <ShieldCheck className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-lg sm:text-xl font-black text-[#0A192F] tracking-tight uppercase leading-none">
                Audrin Fire Engineers
              </h1>
              <span className="text-[10px] font-mono font-bold bg-[#CC0000] text-white px-1.5 py-0.5 rounded-xs tracking-wider">
                (PTY) LTD
              </span>
            </div>

            <p className="text-[11px] font-mono text-slate-600 font-semibold tracking-wide uppercase">
              Consulting Fire Protection &amp; Risk Safety Engineers
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500 pt-0.5">
              <span className="font-bold text-slate-700">
                Reg: <span className="text-[#0A192F]">K2026089596</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-[#CC0000]" />
                <span>ECSA Pr.Eng Statutory Practice</span>
              </span>
              <span>•</span>
              <span>SARS Tax Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Details & Head Office Metadata */}
        <div className="md:col-span-5 flex flex-col md:items-end text-left md:text-right font-mono text-[10px] text-slate-600 space-y-1 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
          <div className="flex items-center md:justify-end gap-1.5 text-slate-700">
            <MapPin className="w-3 h-3 text-[#CC0000] shrink-0" />
            <span>Audrin House, Midrand / Pretoria, South Africa</span>
          </div>
          <div className="flex items-center md:justify-end gap-1.5 text-slate-700">
            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
            <span>+27 (0) 11 482 9200 / +27 (0) 82 000 0000</span>
          </div>
          <div className="flex items-center md:justify-end gap-1.5 text-slate-700">
            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
            <span>compliance@audrinfire.co.za</span>
          </div>
          <div className="flex items-center md:justify-end gap-1.5 text-slate-700">
            <Globe className="w-3 h-3 text-slate-500 shrink-0" />
            <span>www.audrinfire.co.za</span>
          </div>
        </div>
      </div>

      {/* Sub-Header Metadata Strip: Document Control Bar */}
      {(reportReference || classification) && (
        <div className="mt-4 pt-2.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-slate-50 p-2 rounded-xs border">
          <div>
            <span className="text-slate-400 uppercase block text-[9px] font-bold">Doc Reference</span>
            <span className="font-bold text-[#0A192F] truncate block">{reportReference || 'AFE-CR-2026-001'}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase block text-[9px] font-bold">Date of Issue</span>
            <span className="font-bold text-slate-800">{reportDate}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase block text-[9px] font-bold">Design Standard</span>
            <span className="font-semibold text-slate-700 truncate block" title={standardReference}>
              {standardReference}
            </span>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-slate-400 uppercase block text-[9px] font-bold">Classification / Status</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#CC0000] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-xs uppercase text-[9px]">
                {classification}
              </span>
              <span className="text-slate-500 font-bold">{revisionNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Optional Statutory Watermark / Accreditation Strip */}
      {showWatermarkBadge && (
        <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-400 px-1">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Certified Fire Protection Engineering Consultancy — SANS 10400-A/T Competent Person (Fire)</span>
          </div>
          <span className="hidden sm:inline text-slate-400">Audrin Security Seal Ref: ISO 9001 / SANS 10139</span>
        </div>
      )}
    </header>
  );
};

export const ReportLetterheadFooter: React.FC<{ pageNumber?: number; totalPages?: number }> = ({
  pageNumber = 1,
  totalPages = 1
}) => {
  return (
    <footer className="mt-8 pt-4 border-t border-slate-300 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#0A192F]">Audrin Fire Engineers (Pty) Ltd</span>
        <span>•</span>
        <span>Reg: K2026089596</span>
        <span>•</span>
        <span>SANS 10139 &amp; SANS 10400-T Certified</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Tel: +27 (0) 11 482 9200</span>
        <span>compliance@audrinfire.co.za</span>
        <span className="font-bold text-slate-700">Page {pageNumber} of {totalPages}</span>
      </div>
    </footer>
  );
};

export const ReportLetterheadContactBox: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-3 bg-slate-50 border border-slate-200 rounded-xs font-mono text-[10px] text-slate-600 space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
        <MapPin className="w-3.5 h-3.5 text-[#CC0000]" />
        <span>Audrin House, Midrand / Pretoria, South Africa</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Phone className="w-3.5 h-3.5 text-slate-400" />
        <span>+27 (0) 11 482 9200 / +27 (0) 82 000 0000</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Mail className="w-3.5 h-3.5 text-slate-400" />
        <span>compliance@audrinfire.co.za</span>
      </div>
    </div>
  );
};

export function getReportLetterheadHtml(reportRef: string, title: string, standard = 'SANS 10139'): string {
  return `
    <div style="border-bottom: 2px solid #0A192F; padding-bottom: 12px; margin-bottom: 20px; font-family: monospace;">
      <div style="height: 4px; background: #0A192F; display: flex; margin-bottom: 12px;">
        <div style="width: 30%; background: #CC0000;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 18px; font-weight: 900; color: #0A192F; margin: 0;">AUDRIN FIRE ENGINEERS (PTY) LTD</h1>
          <p style="font-size: 11px; color: #555; margin: 2px 0;">Consulting Fire Protection & Risk Safety Engineers | Reg: K2026089596</p>
          <p style="font-size: 10px; color: #777; margin: 0;">ECSA Pr.Eng Statutory Practice • SANS 10400-T & ${standard} Compliance</p>
        </div>
        <div style="text-align: right; font-size: 10px; color: #555;">
          <p style="margin: 0;"><strong>Ref:</strong> ${reportRef}</p>
          <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
          <p style="margin: 0; color: #CC0000; font-weight: bold;">STATUTORY SUBMISSION</p>
        </div>
      </div>
      <div style="margin-top: 10px; padding: 6px 10px; background: #f8f9fa; border: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; color: #0A192F;">
        ${title}
      </div>
    </div>
  `;
}

export default ReportLetterhead;
