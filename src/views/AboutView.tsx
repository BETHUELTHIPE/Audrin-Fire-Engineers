import React from 'react';
import { useApp } from '../context/AppContext';
import { COMPANY_DETAILS, SANS_10139_CATEGORIES } from '../data/initialData';
import {
  Building2,
  ShieldCheck,
  Target,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  XCircle,
  FilePlus,
  ArrowRight
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setActiveView, setIsRequestModalOpen } = useApp();

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      
      {/* Page Header */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
              <Building2 className="w-4 h-4 text-red-500" />
              <span>Corporate Profile & SANS 10139 Engineering Standards</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              About Audrin Fire Engineers
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Audrin Fire Engineers (Pty) Ltd is a specialist fire-engineering company based in Pretoria West, dedicated strictly to commercial and non-domestic electronic fire-detection and fire-alarm systems.
            </p>
          </div>
        </div>
      </section>

      {/* Company Verification & Governance Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            
            <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registered Entity</span>
              <p className="font-bold text-slate-900 text-sm">{COMPANY_DETAILS.legalName}</p>
              <p className="text-slate-500">Private Company Incorporated in RSA</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registration Number</span>
              <p className="font-mono font-bold text-slate-900 text-sm">{COMPANY_DETAILS.registrationNumber}</p>
              <p className="text-slate-500">CIPC Verified</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Head Office Location</span>
              <p className="font-bold text-slate-900 text-sm">Pretoria West, Pretoria</p>
              <p className="text-slate-500">0008, South Africa</p>
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Standard Alignment</span>
              <p className="font-bold text-slate-900 text-sm">SANS 10139</p>
              <p className="text-slate-500">Fire Detection in Buildings</p>
            </div>

          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Engineering Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Purpose & Mission</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              To engineer, install, and maintain reliable, compliant fire-detection systems that provide early detection, clear acoustic/visual warnings, and timely activation of life-safety interfaces in commercial buildings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">SANS 10139 Standard Discipline</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Every design schematic, device spacing calculation, cable specification, audibility test, and maintenance routine strictly adheres to South African National Standard 10139 requirements.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Auditable Documentation</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We maintain rigorous documentation standards, providing building owners with comprehensive commissioning records, as-built zone charts, cause-and-effect matrices, and logbooks.
            </p>
          </div>

        </div>
      </section>

      {/* Explicit Scope Boundaries: What We Do vs What We Do Not Do */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8">
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950 border border-red-800 px-3 py-1 rounded-full">
              Engineering Scope Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">
              Scope of Service & Boundaries
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl">
              To ensure the highest standard of technical competence, Audrin Fire Engineers operates strictly within defined engineering boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Core In-Scope Services */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <h4>Commercial Fire-Detection (In Scope)</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Commercial & Industrial Addressable Fire Alarm Systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Conventional Multi-Zone Fire Alarm Panels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>SANS 10139 Site Surveys, Category Selection & System Design</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Aspirating Smoke Detection (VESDA) & Beam Detectors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Testing, Commissioning, Audibility Sound-Level Verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Planned Preventative Quarterly & Annual Maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Interface Relays for HVAC Trip, Smoke Dampers, Magnetic Door Releases</span>
                </li>
              </ul>
            </div>

            {/* Excluded Services */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                <XCircle className="w-5 h-5" />
                <h4>Excluded Services (Not Provided)</h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Portable fire extinguishers, fire hose reels, fire hydrants</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Automatic water fire sprinkler systems, fire pumps, water tanks</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Gas/clean-agent gaseous suppression, kitchen hood wet-chemical suppression</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Passive fire protection, fire doors, fire stopping, intumescent sealing</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Emergency lighting (unless integrated as fire alarm visual sounder-beacons)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>CCTV surveillance, intruder alarms, standalone biometric access control</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">
            Discuss Your Commercial Fire-Detection Requirement
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm">
            Contact our Pretoria West engineering office to schedule a site inspection, review building schematics, or arrange preventative maintenance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              <span>Submit Service Request</span>
            </button>
            <button
              onClick={() => setActiveView('contact')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all"
            >
              Contact Engineering Team
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
