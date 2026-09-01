import React, { useState } from 'react';
import { COMPANY_DETAILS } from '../data/initialData';
import { ShieldCheck, FileText, Lock, CheckCircle2 } from 'lucide-react';

export const LegalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'popia' | 'terms' | 'scope'>('popia');

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Legal Compliance & South African Statutory Governance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Legal, POPIA & Terms
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transparency, data protection under POPIA (Act 4 of 2013), and standard conditions for commercial fire-detection services.
            </p>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('popia')}
              className={`px-6 py-3.5 border-b-2 transition-colors ${
                activeTab === 'popia' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              POPIA Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3.5 border-b-2 transition-colors ${
                activeTab === 'terms' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Terms of Engineering Service
            </button>
            <button
              onClick={() => setActiveTab('scope')}
              className={`px-6 py-3.5 border-b-2 transition-colors ${
                activeTab === 'scope' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              SANS 10139 Scope Statement
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-10 text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
            
            {activeTab === 'popia' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Protection of Personal Information Act (POPIA) Policy
                </h3>
                <p>
                  <strong>{COMPANY_DETAILS.legalName}</strong> (Registration No: {COMPANY_DETAILS.registrationNumber}) is committed to safeguarding personal and organisational data in compliance with the Protection of Personal Information Act, No 4 of 2013 ("POPIA").
                </p>

                <h4 className="font-bold text-slate-900 pt-2">1. Collection of Building & Representative Information</h4>
                <p>
                  We collect names, business email addresses, contact telephone numbers, physical premises addresses, and architectural drawings solely to execute fire-detection design, quotation, installation, and maintenance services.
                </p>

                <h4 className="font-bold text-slate-900 pt-2">2. Processing & Security</h4>
                <p>
                  All technical documents and client records are stored in secure, encrypted cloud environments. Access is restricted strictly to authorized engineering staff.
                </p>

                <h4 className="font-bold text-slate-900 pt-2">3. Information Officer Contact</h4>
                <p>
                  For inquiries regarding data access or deletion requests, contact our designated office at <strong>{COMPANY_DETAILS.email}</strong> or <strong>{COMPANY_DETAILS.telephone}</strong>.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Standard Commercial Terms of Service
                </h3>
                <p>
                  These conditions govern all fire-detection consulting, site surveys, installations, commissioning, and maintenance provided by {COMPANY_DETAILS.legalName}.
                </p>

                <h4 className="font-bold text-slate-900 pt-2">1. Alignment with SANS 10139</h4>
                <p>
                  All design schematics, cable layouts, device positioning, audibility testing, and maintenance intervals are executed in alignment with SANS 10139 standards. Any deviations required by building structural constraints are formally documented.
                </p>

                <h4 className="font-bold text-slate-900 pt-2">2. Site Access and Safety</h4>
                <p>
                  The building owner or designated representative must provide unhindered access to ceiling voids, plant rooms, electrical distribution boards, and riser ducts during agreed inspection windows.
                </p>
              </div>
            )}

            {activeTab === 'scope' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Scope of Work Boundary Notice
                </h3>
                <p>
                  Audrin Fire Engineers specializes strictly in electronic commercial fire detection and fire alarm systems.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <strong className="block text-slate-900 mb-2">Explicitly Excluded Hardware & Services:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Portable fire extinguishers, fire hose reels, fire hydrants</li>
                    <li>Fire sprinkler installations, water pumps, water storage tanks</li>
                    <li>Gaseous fire suppression systems (clean agent, CO2, FM200)</li>
                    <li>Fire doors, passive fire stopping, intumescent seals</li>
                    <li>Standalone intruder alarms, CCTV cameras, biometric security turnstiles</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

    </div>
  );
};
