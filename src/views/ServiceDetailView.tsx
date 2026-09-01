import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  FilePlus,
  HelpCircle,
  Clock,
  Layers,
  Building
} from 'lucide-react';

export const ServiceDetailView: React.FC = () => {
  const { services, selectedServiceSlug, setActiveView, setPreselectedServiceForModal, setIsRequestModalOpen } = useApp();

  const service = services.find(s => s.slug === selectedServiceSlug) || services[0];

  const handleBack = () => {
    setActiveView('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequest = () => {
    setPreselectedServiceForModal(service.slug);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </button>

          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-950/80 border border-red-800 px-3 py-1 rounded-full">
                {service.category}
              </span>
              <span className="text-xs text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {service.sansReference || 'SANS 10139'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {service.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {service.fullOverview || service.detailedDescription || service.shortDescription}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={handleRequest}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Request Scope for this Service</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Scope & Deliverables */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Scope of Work Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3>Included Technical Scope</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                {(service.scopeOfWork || (service as any).scopePoints || []).map((pt: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Deliverables */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                  <FileText className="w-4 h-4 text-red-600" />
                  <h4>Engineering Deliverables</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {(service.deliverables || []).map((del: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                  <Building className="w-4 h-4 text-blue-600" />
                  <h4>Client Inputs Required</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {(service.clientResponsibilities || (service as any).prerequisites || []).map((pre: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Excluded Services Explicit Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Explicit Boundary Disclaimer</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                This service focuses strictly on commercial electronic fire-detection and alarm equipment under SANS 10139. 
                Audrin Fire Engineers does not supply fire extinguishers, hose reels, hydrants, automatic sprinkler piping, 
                or standalone CCTV cameras.
              </p>
            </div>

          </div>

          {/* Right Column: Request Card & Metadata */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-6 shadow-xl sticky top-28">
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                  Ready to proceed?
                </span>
                <h3 className="text-xl font-bold text-white">
                  Request {service.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Submit your premises details, floor plans, or fault symptoms to initiate engineering triage.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Standard:</span>
                  <span className="font-semibold text-white">{service.sansReference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Premises Scope:</span>
                  <span className="font-semibold text-white">Commercial Only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turnaround Triage:</span>
                  <span className="font-semibold text-white">Same-Day Review</span>
                </div>
              </div>

              <button
                onClick={handleRequest}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Start Service Request</span>
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
