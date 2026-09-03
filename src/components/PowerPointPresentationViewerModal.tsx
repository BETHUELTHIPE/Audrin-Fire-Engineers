import React, { useState, useEffect } from 'react';
import {
  Presentation,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  Download,
  Maximize2,
  FileCheck,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Appointment, UserRole } from '../types';
import { calendarZoomService } from '../services/calendarZoomService';

interface PowerPointPresentationViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const PowerPointPresentationViewerModal: React.FC<PowerPointPresentationViewerModalProps> = ({
  isOpen,
  onClose,
  appointment,
  currentUserRole,
  currentUserId,
  currentUserName
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointment.hasPowerPoint) {
      try {
        const presigned = calendarZoomService.getPowerPointPresignedUrl(
          appointment.id,
          currentUserId,
          currentUserName,
          currentUserRole
        );
        setPresignedUrl(presigned.url);
        setExpiresAt(presigned.expiresAt);
      } catch (err: any) {
        setError(err.message || 'Failed to generate presentation presigned token');
      }
    }
  }, [isOpen, appointment, currentUserId, currentUserName, currentUserRole]);

  if (!isOpen) return null;

  const slides = [
    {
      title: '1. SANS 10139 Statutory System Review & Agenda',
      subtitle: `${appointment.organisationName} – ${appointment.siteName}`,
      content: (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Statutory Objective</div>
            <p className="text-slate-300">
              Formal engineering consultation regarding fire alarm system design, installation condition, and SANS 10139 compliance classification (Category L2/P1).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-semibold text-[10px]">Reference:</div>
              <div className="font-mono text-white font-bold">{appointment.serviceRequestRef}</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-semibold text-[10px]">Lead Engineer:</div>
              <div className="text-white font-bold">{appointment.assignedStaffName}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '2. Baseline System Topology & Loop Diagnostic Summary',
      subtitle: 'Morley-IAS & Ziton ZP3 Protocol Inspection',
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Main Control Panel: Morley-IAS ZX5e</span>
              <span className="text-emerald-400 font-mono text-[10px]">Status: Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="text-slate-400">Loop 1 (Ground Flr)</div>
                <div className="text-emerald-400 font-bold">96 Devices OK</div>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="text-slate-400">Loop 2 (Floors 1-3)</div>
                <div className="text-emerald-400 font-bold">114 Devices OK</div>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="text-slate-400">Loop 3 (Floors 4-6)</div>
                <div className="text-amber-400 font-bold">Ground Fault Leaks</div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-[11px]">
            <span className="font-bold">Inspection Finding: </span>
            Loop 3 wiring insulation resistance measured at 0.4 MΩ (Standard requires minimum 2.0 MΩ per SANS 10139 clause 18.2). Requires partial recabling.
          </div>
        </div>
      )
    },
    {
      title: '3. Sound Level & Audibility Verification (SANS 10139 Table 2)',
      subtitle: 'Decibel Pressure Verification Across Escape Routes',
      content: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-slate-400 text-[10px]">General Occupancy Target:</div>
              <div className="text-lg font-bold text-white">65 dBA</div>
              <div className="text-[10px] text-emerald-400">Achieved: 71.4 dBA Avg</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-slate-400 text-[10px]">Sleeping Risk Bedhead Target:</div>
              <div className="text-lg font-bold text-white">75 dBA</div>
              <div className="text-[10px] text-emerald-400">Achieved: 78.2 dBA Avg</div>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300">
            All sounder strobe circuits calibrated using Type 1 IEC 61672-1 sound level meters.
          </div>
        </div>
      )
    },
    {
      title: '4. Remediation Plan & Statutory Handover Steps',
      subtitle: 'Schedule of Works and COC Milestone Roadmap',
      content: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Replace Loop 3 cabling riser conduit with fire-rated PH120 cable</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Re-terminate optical smoke sensors in Server Room & UPS Wing</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Execute formal 100% device commissioning test and sign SANS 10139 COC</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">{appointment.powerPointFilename}</h2>
                <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded font-mono">
                  {appointment.powerPointVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">Authenticated Private S3 Presentation Stream</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {presignedUrl && (
              <a
                href={presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download .pptx
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Display Area */}
        <div className="flex-1 p-6 bg-slate-950 flex flex-col justify-between overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {slides[currentSlideIndex].title}
              </h3>
              <p className="text-xs text-slate-400">{slides[currentSlideIndex].subtitle}</p>
            </div>

            <div className="py-2">{slides[currentSlideIndex].content}</div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private AWS S3 Tokenized Stream</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Slide
              </button>
              <span className="text-slate-400 font-mono text-xs px-2">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg flex items-center gap-1 transition-all"
              >
                Next Slide
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
