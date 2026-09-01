import React from 'react';
import { BrandLogo, getAudrinLogoSvgHtml } from './BrandLogo';
import { COMPANY_DETAILS } from '../data/initialData';
import {
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
  ClipboardList,
  ShieldCheck,
  Building2,
  Calendar,
  Hash,
  Award
} from 'lucide-react';
import { ConditionReportType } from '../types';

export interface ReportLetterheadProps {
  /** Title of the document or report */
  reportTitle?: string;
  /** Pre-work or Post-work indicator */
  reportType?: ConditionReportType | 'general' | 'inspection' | 'certificate';
  /** Document / Report Reference Number */
  documentReference?: string;
  /** Date of issue / generation */
  date?: string;
  /** Primary Client Name */
  clientName?: string;
  /** Client Company / Organisation */
  clientOrganisation?: string;
  /** Facility or Premises Address */
  premisesAddress?: string;
  /** Service Request Reference Number */
  serviceRequestRef?: string;
  /** Fire Alarm System / Equipment Category */
  equipmentReference?: string;
  /** Display variant: 'header' (top letterhead), 'footer' (bottom letterhead), 'full' (header + metadata card) */
  mode?: 'header' | 'footer' | 'full' | 'compact' | 'cover';
  /** Whether to render the quick contact card inside the header */
  showContactCard?: boolean;
  /** Current page number for multi-page PDF output */
  pageNumber?: number;
  /** Total pages for multi-page PDF output */
  totalPages?: number;
  /** Custom additional styling class */
  className?: string;
}

/**
 * Reusable ReportLetterhead Component
 * Renders the Audrin Fire Engineers official logo, registration details (K2026089596),
 * standard alignment (SANS 10139), and complete contact information.
 * Integrated into PDF generation templates for Pre-Work and Post-Work reports.
 */
export const ReportLetterhead: React.FC<ReportLetterheadProps> = ({
  reportTitle,
  reportType,
  documentReference,
  date = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }),
  clientName,
  clientOrganisation,
  premisesAddress,
  serviceRequestRef,
  equipmentReference,
  mode = 'header',
  showContactCard = false,
  pageNumber,
  totalPages,
  className = ''
}) => {
  const isPreWork = reportType === 'pre_work';
  const isPostWork = reportType === 'post_work';

  if (mode === 'footer') {
    return (
      <ReportLetterheadFooter
        pageNumber={pageNumber}
        totalPages={totalPages}
        className={className}
      />
    );
  }

  return (
    <header className={`bg-white text-slate-900 border-b border-slate-200 pb-5 space-y-4 select-none print:border-b-2 print:border-slate-800 ${className}`}>
      
      {/* Top Banner Row: Official Vector Logo + Standard Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BrandLogo variant="dark" size="lg" showTagline={false} />
          
          {/* Engineering Subtitle & Standard Bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-[#0A192F]">
              FIRE DETECTION &amp; ALARM SYSTEMS
            </span>
            <span className="text-slate-300 font-bold">|</span>
            <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-[#CC0000]">
              SANS 10139
            </span>
          </div>
        </div>

        {/* Top Right Document Metadata & Registration */}
        <div className="text-right font-mono text-xs text-slate-600 space-y-1 self-start sm:self-end">
          <div className="flex items-center justify-end gap-1.5 text-slate-500 text-[11px]">
            <span className="uppercase text-[9px] tracking-wider text-slate-400">Reg No:</span>
            <strong className="text-slate-900 font-bold">{COMPANY_DETAILS.registrationNumber}</strong>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[9px] block">Date of Issue:</span>
            <strong className="text-slate-900 font-bold">{date}</strong>
          </div>
          {documentReference && (
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Document Ref:</span>
              <strong className="text-[#CC0000] font-black text-sm tracking-wide">{documentReference}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Official Geometric Bi-Color Divider (Navy 40% | Crimson Red 20% | Navy 40%) */}
      <div className="w-full flex h-[3px]">
        <div className="w-2/5 bg-[#0A192F]"></div>
        <div className="w-1/5 bg-[#CC0000]"></div>
        <div className="w-2/5 bg-[#0A192F]"></div>
      </div>

      {/* Report Title & Type Badge Row */}
      {reportTitle && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                  isPreWork
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : isPostWork
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {isPreWork ? 'PRE-WORK CONDITION REPORT' : isPostWork ? 'POST-WORK CONDITION REPORT' : 'TECHNICAL REPORT'}
              </span>
              {serviceRequestRef && (
                <span className="text-[10px] font-mono text-slate-500">
                  Service Request: <strong className="text-slate-800">{serviceRequestRef}</strong>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-black text-[#0A192F] uppercase tracking-tight mt-1">
              {reportTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
            <span>Audrin Quality Assurance</span>
          </div>
        </div>
      )}

      {/* Recipient / Premises Card (Full Mode) */}
      {(mode === 'full' || clientName || clientOrganisation || premisesAddress) && (
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-xs font-mono text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-slate-400 uppercase text-[9px] block">Client / Organization:</span>
            <div className="font-bold text-slate-900 text-sm">{clientName || 'Valued Client'}</div>
            {clientOrganisation && <div className="text-slate-600">{clientOrganisation}</div>}
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 uppercase text-[9px] block">Site / Premises:</span>
            <div className="font-bold text-slate-900">{premisesAddress || 'Site Address Recorded on File'}</div>
            {equipmentReference && (
              <div className="text-slate-500 text-[10px]">
                Equipment: <span className="font-semibold text-slate-700">{equipmentReference}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional Contact Card */}
      {showContactCard && <ReportLetterheadContactBox />}
    </header>
  );
};

/**
 * Reusable Contact Box for official stationary and letterhead templates
 */
export const ReportLetterheadContactBox: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-sm p-3 text-xs font-mono text-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 ${className}`}>
      <div className="flex items-center gap-2">
        <ClipboardList className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
        <div>
          <span className="text-slate-400 text-[9px] block uppercase">Reg Number</span>
          <strong className="text-slate-900 text-[11px]">{COMPANY_DETAILS.registrationNumber}</strong>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Phone className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
        <div>
          <span className="text-slate-400 text-[9px] block uppercase">Emergency Phone</span>
          <strong className="text-slate-900 text-[11px]">{COMPANY_DETAILS.telephone}</strong>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
        <div>
          <span className="text-slate-400 text-[9px] block uppercase">Direct Email</span>
          <strong className="text-slate-900 text-[11px] truncate block max-w-[140px]">{COMPANY_DETAILS.email}</strong>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
        <div>
          <span className="text-slate-400 text-[9px] block uppercase">Availability</span>
          <strong className="text-slate-900 text-[11px]">{COMPANY_DETAILS.operatingHours}</strong>
        </div>
      </div>
    </div>
  );
};

/**
 * Standardized Official Letterhead Footer for PDF Generation & Printable Views
 */
export const ReportLetterheadFooter: React.FC<{
  pageNumber?: number;
  totalPages?: number;
  showSignatureLine?: boolean;
  preparedBy?: string;
  className?: string;
}> = ({
  pageNumber,
  totalPages,
  showSignatureLine = false,
  preparedBy,
  className = ''
}) => {
  return (
    <footer className={`bg-white text-slate-800 pt-4 space-y-4 border-t border-slate-200 select-none print:border-t-2 print:border-slate-800 ${className}`}>
      
      {/* Optional Technical Sign-off Row for PDF Output */}
      {showSignatureLine && (
        <div className="grid grid-cols-2 gap-8 pt-2 pb-4 border-b border-slate-100 font-mono text-xs">
          <div className="space-y-8">
            <div>
              <span className="text-slate-400 text-[9px] uppercase block">Lead Fire Systems Engineer:</span>
              <strong className="text-slate-900 block">{preparedBy || 'Audrin Fire Engineers Technical Desk'}</strong>
            </div>
            <div className="border-t border-slate-400 pt-1 text-slate-500 text-[10px]">
              Authorized Engineering Signature &amp; Stamp
            </div>
          </div>

          <div className="space-y-8 text-right">
            <div>
              <span className="text-slate-400 text-[9px] uppercase block">Client Acknowledgment:</span>
              <strong className="text-slate-900 block">Property Owner / Responsible Person</strong>
            </div>
            <div className="border-t border-slate-400 pt-1 text-slate-500 text-[10px]">
              Signature &amp; Date of Receipt
            </div>
          </div>
        </div>
      )}

      {/* Official Geometric Bi-Color Divider Rule */}
      <div className="w-full flex h-[2px]">
        <div className="w-2/5 bg-[#0A192F]"></div>
        <div className="w-1/5 bg-[#CC0000]"></div>
        <div className="w-2/5 bg-[#0A192F]"></div>
      </div>

      {/* Company Identification & Registration */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-2 flex-wrap text-center md:text-left">
          <strong className="text-[#0A192F] font-black tracking-wider uppercase">AUDRIN FIRE ENGINEERS</strong>
          <span className="text-slate-300">|</span>
          <span>Reg No: <strong className="text-slate-900">{COMPANY_DETAILS.registrationNumber}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-[#CC0000] font-bold">SANS 10139 Standards</span>
        </div>

        {pageNumber && (
          <div className="text-[11px] text-slate-500">
            Page <strong>{pageNumber}</strong> of <strong>{totalPages || pageNumber}</strong>
          </div>
        )}
      </div>

      {/* Contact & Physical Address Row */}
      <div className="text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <div className="flex items-center gap-3">
          <span>Tel: <strong className="text-[#CC0000]">{COMPANY_DETAILS.telephone}</strong></span>
          <span>•</span>
          <span>Email: <strong className="text-slate-900">{COMPANY_DETAILS.email}</strong></span>
          <span>•</span>
          <span>Hours: {COMPANY_DETAILS.operatingHours}</span>
        </div>

        <div className="text-slate-500 text-center sm:text-right text-[10px]">
          {COMPANY_DETAILS.physicalAddress}
        </div>
      </div>
    </footer>
  );
};

/**
 * Generate Standalone Standalone HTML String for PDF print engine / export
 */
export function getReportLetterheadHtml(options: {
  reportTitle: string;
  reportType: ConditionReportType;
  documentReference: string;
  date?: string;
  clientName: string;
  clientOrganisation?: string;
  premisesAddress: string;
  serviceRequestRef: string;
}): string {
  const logoSvg = getAudrinLogoSvgHtml(260, 56);
  const issueDate = options.date || new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
  const isPre = options.reportType === 'pre_work';

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; padding: 24px; border-bottom: 2px solid #0A192F; margin-bottom: 20px;">
    
    <!-- Top Row: Logo & Metadata -->
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
      <tr>
        <td style="vertical-align: top; width: 60%;">
          ${logoSvg}
          <div style="font-size: 10px; font-weight: 900; color: #0A192F; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 6px;">
            FIRE DETECTION &amp; ALARM SYSTEMS <span style="color: #94a3b8; margin: 0 4px;">|</span> <span style="color: #CC0000;">SANS 10139</span>
          </div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 40%; font-family: monospace; font-size: 11px; color: #475569; line-height: 1.5;">
          <div>Reg No: <strong style="color: #0A192F;">${COMPANY_DETAILS.registrationNumber}</strong></div>
          <div>Date: <strong style="color: #0A192F;">${issueDate}</strong></div>
          <div style="margin-top: 4px;">Ref: <strong style="color: #CC0000; font-size: 13px;">${options.documentReference}</strong></div>
        </td>
      </tr>
    </table>

    <!-- Geometric Multi-Tone Divider Rule -->
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 3px; border-collapse: collapse; margin-bottom: 14px;">
      <tr>
        <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        <td style="width: 20%; background-color: #CC0000; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
      </tr>
    </table>

    <!-- Report Title Banner -->
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
      <tr>
        <td>
          <span style="display: inline-block; background-color: ${isPre ? '#fef3c7' : '#d1fae5'}; color: ${isPre ? '#92400e' : '#065f46'}; border: 1px solid ${isPre ? '#fde68a' : '#a7f3d0'}; padding: 2px 8px; font-size: 10px; font-weight: bold; font-family: monospace; text-transform: uppercase;">
            ${isPre ? 'PRE-WORK PHOTOGRAPHIC CONDITION REPORT' : 'POST-WORK CONDITION REPORT'}
          </span>
          <h1 style="margin: 6px 0 2px 0; font-size: 16px; font-weight: 900; color: #0A192F; text-transform: uppercase; letter-spacing: 0.02em;">
            ${options.reportTitle}
          </h1>
          <div style="font-size: 11px; font-family: monospace; color: #64748b;">
            Service Request Reference: <strong>${options.serviceRequestRef}</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Client & Premises Card -->
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">
      <tr>
        <td style="padding: 10px 12px; width: 50%; vertical-align: top; border-right: 1px solid #e2e8f0;">
          <span style="color: #94a3b8; font-size: 9px; text-transform: uppercase; display: block;">Client &amp; Organisation</span>
          <strong style="color: #0A192F; font-size: 12px;">${options.clientName}</strong>
          ${options.clientOrganisation ? `<div style="color: #475569;">${options.clientOrganisation}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; width: 50%; vertical-align: top;">
          <span style="color: #94a3b8; font-size: 9px; text-transform: uppercase; display: block;">Premises / Site Address</span>
          <strong style="color: #0A192F;">${options.premisesAddress}</strong>
        </td>
      </tr>
    </table>

  </div>
  `.trim();
}
