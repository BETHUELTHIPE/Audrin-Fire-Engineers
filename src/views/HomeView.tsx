import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANY_DETAILS, SANS_10139_CATEGORIES, INDUSTRIES_SERVED, SUPPORTED_SYSTEMS } from '../data/initialData';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  FilePlus,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  FileText,
  Search,
  Building2,
  HelpCircle,
  ChevronDown,
  Headphones,
  Volume2,
  Radio
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    services,
    howWeWorkSteps,
    faqs,
    setActiveView,
    setSelectedServiceSlug,
    setIsRequestModalOpen,
    setPreselectedServiceForModal,
    setIsEmergencyModalOpen,
    setIsVoicePlayerOpen,
    activeVoiceStepNumber
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'All Services (18)' },
    { id: 'Design & Surveys', label: 'Design & Surveys' },
    { id: 'Installation & Fit-Out', label: 'Installation' },
    { id: 'Commissioning & Acceptance', label: 'Commissioning' },
    { id: 'Maintenance & Testing', label: 'Maintenance' },
    { id: 'Faults & Diagnostics', label: 'Fault Diagnostics' },
    { id: 'Documentation & Training', label: 'Documentation & Training' }
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleServiceClick = (slug: string) => {
    setSelectedServiceSlug(slug);
    setActiveView('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestService = (slug?: string) => {
    setPreselectedServiceForModal(slug || null);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION: Geometric Balance Split Hero */}
      <section className="relative bg-white text-[#0A192F] border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
          
          {/* Left Hero Content Section */}
          <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 -z-10 translate-x-16 -translate-y-16 rounded-full opacity-50"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#CC0000] font-bold text-xs uppercase tracking-[0.3em]">
                Commercial & Industrial
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                SANS 10139
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6 text-[#0A192F]">
              Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A192F] to-[#254170]">
                Fire-Detection
              </span>
              <br /> and Alarm Services
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              Specialized design, installation, commissioning, preventative maintenance, and fault diagnosis aligned strictly with SANS 10139 requirements for non-domestic commercial premises.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
              <button
                onClick={() => handleRequestService()}
                className="px-8 py-4 bg-[#CC0000] hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-sm shadow-lg shadow-red-100 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>Request Site Survey</span>
              </button>

              <button
                onClick={() => setIsVoicePlayerOpen(true)}
                className="px-6 py-4 bg-[#0A192F] hover:bg-[#1E293B] active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 border-l-4 border-l-[#CC0000]"
                title="Launch Voice AI Guide to listen to our 7-step process"
              >
                <Headphones className="w-4 h-4 text-[#CC0000] animate-pulse" />
                <span>Listen: How Our Process Works</span>
              </button>

              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="px-6 py-4 border-2 border-[#0A192F] hover:bg-gray-50 text-[#0A192F] font-bold text-xs sm:text-sm uppercase tracking-widest rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-[#CC0000]" />
                <span>Fault Support</span>
              </button>
            </div>

            {/* Geometric Assurance Indicators */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#CC0000]"></span>
                <span>SANS 10139 Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#0A192F]"></span>
                <span>Commercial & Industrial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#FFB703]"></span>
                <span>Open & Closed Protocols</span>
              </div>
            </div>
          </div>

          {/* Right Visual/Grid Section (Geometric Balance Panel) */}
          <div className="w-full lg:w-5/12 bg-[#F8F9FA] border-t lg:border-t-0 lg:border-l border-gray-200 p-8 sm:p-10 flex flex-col justify-between">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Our Seven-Step Process
                </h3>
                <button
                  onClick={() => setActiveView('how-we-work')}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#CC0000] hover:underline"
                >
                  View All Steps →
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white p-3.5 rounded-sm border-l-4 border-[#0A192F] shadow-sm">
                  <span className="text-xs font-black bg-gray-100 text-[#0A192F] w-6 h-6 flex items-center justify-center rounded-sm">01</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#0A192F]">Site Survey & Assessment</span>
                  <span className="ml-auto text-[#FFB703]">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white p-3.5 rounded-sm border-l-4 border-[#CC0000] shadow-sm">
                  <span className="text-xs font-black bg-gray-100 text-[#0A192F] w-6 h-6 flex items-center justify-center rounded-sm">02</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#0A192F]">Technical System Design</span>
                  <span className="ml-auto text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white p-3.5 rounded-sm border-l-4 border-[#0A192F] shadow-sm">
                  <span className="text-xs font-black bg-gray-100 text-[#0A192F] w-6 h-6 flex items-center justify-center rounded-sm">03</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#0A192F]">Testing & Commissioning</span>
                  <span className="ml-auto text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Geometric Balance Stats Boxes */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-[#0A192F] p-5 rounded-sm text-white shadow-sm border border-slate-800">
                <p className="text-3xl font-black mb-1">100%</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-300 font-bold">Compliance Focused</p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">SANS 10139 Code</p>
              </div>
              <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
                <p className="text-3xl font-black mb-1 text-[#CC0000]">24/7</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Fault Assistance</p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">071 415 6665</p>
              </div>
            </div>

            {/* Pretoria West Desk Info */}
            <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Pretoria West, 0008, ZA</span>
              </div>
              <span className="font-mono text-[#0A192F] font-bold">K2026089596</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SANS 10139 SYSTEM CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000] bg-red-50 px-3.5 py-1 rounded-sm border border-red-200">
            Standards & Specifications
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] mt-3 tracking-tight uppercase">
            SANS 10139 System Categories
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            South African National Standard 10139 specifies fire-detection design categories to protect life (Category L) and property (Category P).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SANS_10139_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.code}
              className={`bg-white border border-gray-200 rounded-sm p-5 hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between ${
                idx % 2 === 0 ? 'border-l-4 border-l-[#0A192F]' : 'border-l-4 border-l-[#CC0000]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded-sm bg-[#0A192F] text-white">
                    {cat.code}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {cat.name}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#0A192F] mb-2 uppercase">
                  {cat.code}: {cat.name}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                <span className="font-bold text-[#0A192F] uppercase tracking-wider text-[10px]">Typical Scope:</span> {cat.application}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW WE WORK 7-STEP TIMELINE (Geometric Balance) */}
      <section className="bg-[#0A192F] text-white py-16 sm:py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000] bg-white/5 border border-white/10 px-3.5 py-1 rounded-sm">
                  Systematic Execution
                </span>
                {activeVoiceStepNumber && activeVoiceStepNumber > 0 && activeVoiceStepNumber <= 7 && (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-sm animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Voice AI: Step 0{activeVoiceStepNumber} Active</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 tracking-tight uppercase">
                Our 7-Step "How We Work" Process
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                Every fire-detection engagement follows a transparent, phased engineering procedure aligned with SANS 10139 requirements from initial consultation to final handover.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsVoicePlayerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md transition-all cursor-pointer"
                title="Open Voice AI narration guide for the 7 steps"
              >
                <Headphones className="w-4 h-4 animate-bounce" />
                <span>Listen: How Our Process Works</span>
              </button>

              <button
                onClick={() => setActiveView('how-we-work')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer px-3 py-2 border border-white/20 rounded-sm hover:border-white/40"
              >
                <span>Full Milestones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(howWeWorkSteps || []).slice(0, 4).map((stepItem, idx) => {
              const stepNum = stepItem.stepNumber ?? (stepItem as any).step ?? (idx + 1);
              const isVoiceActive = activeVoiceStepNumber === stepNum;
              const deliverableText = stepItem.typicalDeliverables?.[0] || (stepItem as any).deliverable || 'SANS 10139 Milestone Record';
              return (
                <div
                  key={stepNum}
                  className={`bg-[#081324] border rounded-sm p-6 relative transition-all flex flex-col justify-between ${
                    isVoiceActive
                      ? 'border-2 border-[#CC0000] shadow-xl shadow-red-900/40 bg-gradient-to-b from-[#140810] to-[#081324] ring-2 ring-[#CC0000]'
                      : 'border-white/10 hover:border-[#CC0000]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-sm font-black text-sm flex items-center justify-center ${
                        isVoiceActive ? 'bg-[#CC0000] text-white animate-pulse' : 'bg-[#CC0000] text-white'
                      }`}>
                        0{stepNum}
                      </div>

                      {isVoiceActive && (
                        <span className="text-[10px] font-mono uppercase font-bold text-[#CC0000] bg-red-900/40 px-2 py-0.5 rounded-sm border border-red-500/40">
                          Now Narrating
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm uppercase tracking-wide text-white mb-2">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {stepItem.summary}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-[11px] text-gray-400">
                    <strong className="text-white uppercase tracking-wider text-[10px] block mb-1">Deliverable:</strong>
                    {deliverableText}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {(howWeWorkSteps || []).slice(4, 7).map((stepItem, idx) => {
              const stepNum = stepItem.stepNumber ?? (stepItem as any).step ?? (idx + 5);
              const isVoiceActive = activeVoiceStepNumber === stepNum;
              const deliverableText = stepItem.typicalDeliverables?.[0] || (stepItem as any).deliverable || 'SANS 10139 Milestone Record';
              return (
                <div
                  key={stepNum}
                  className={`bg-[#081324] border rounded-sm p-6 relative transition-all flex flex-col justify-between ${
                    isVoiceActive
                      ? 'border-2 border-[#CC0000] shadow-xl shadow-red-900/40 bg-gradient-to-b from-[#140810] to-[#081324] ring-2 ring-[#CC0000]'
                      : 'border-white/10 hover:border-[#CC0000]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-sm font-black text-sm flex items-center justify-center ${
                        isVoiceActive ? 'bg-[#CC0000] text-white animate-pulse' : 'bg-[#0A192F] border border-white/20 text-white'
                      }`}>
                        0{stepNum}
                      </div>

                      {isVoiceActive && (
                        <span className="text-[10px] font-mono uppercase font-bold text-[#CC0000] bg-red-900/40 px-2 py-0.5 rounded-sm border border-red-500/40">
                          Now Narrating
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm uppercase tracking-wide text-white mb-2">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {stepItem.summary}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-[11px] text-gray-400">
                    <strong className="text-white uppercase tracking-wider text-[10px] block mb-1">Deliverable:</strong>
                    {deliverableText}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. CORE SERVICES CATALOGUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000] bg-red-50 border border-red-200 px-3.5 py-1 rounded-sm">
              Engineering Catalogue
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] mt-3 tracking-tight uppercase">
              Commercial Fire-Alarm Services
            </h2>
            <p className="text-gray-600 text-sm mt-2 max-w-2xl">
              18 specialized services designed for commercial offices, warehouses, retail centers, and industrial facilities.
            </p>
          </div>

          <button
            onClick={() => setActiveView('services')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CC0000] hover:text-red-700 transition-colors cursor-pointer"
          >
            <span>View All 18 Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0A192F] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredServices || []).slice(0, 6).map((srv) => {
            const scopeList = srv.scopeOfWork || (srv as any).scopePoints || [];
            return (
              <div
                key={srv.id}
                className="bg-white border border-gray-200 rounded-sm p-6 hover:border-gray-400 hover:shadow-lg transition-all flex flex-col justify-between group border-l-4 border-l-[#0A192F] hover:border-l-[#CC0000]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#CC0000] uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-sm border border-red-100">
                      {srv.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {srv.sansReference || 'SANS 10139'}
                    </span>
                  </div>

                  <h3
                    onClick={() => handleServiceClick(srv.slug)}
                    className="font-bold text-base text-[#0A192F] group-hover:text-[#CC0000] transition-colors cursor-pointer mb-2 uppercase"
                  >
                    {srv.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {srv.shortDescription}
                  </p>

                  {/* Scope Preview */}
                  <div className="space-y-1.5 mb-6 text-xs text-gray-700">
                    {scopeList.slice(0, 3).map((pt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleServiceClick(srv.slug)}
                    className="text-xs font-bold uppercase tracking-wider text-[#0A192F] hover:text-[#CC0000] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRequestService(srv.slug)}
                    className="px-3 py-1.5 bg-[#CC0000] hover:bg-red-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Request Scope
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INDUSTRIES & SYSTEMS COMPATIBILITY */}
      <section className="bg-[#F8F9FA] border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Industries Served */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight uppercase">
                Commercial & Non-Domestic Environments
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Precision detection engineered for high-risk, multi-zone commercial structures.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {INDUSTRIES_SERVED.slice(0, 6).map((ind) => (
                <div
                  key={ind.title}
                  className="bg-white border border-gray-200 rounded-sm p-4 text-center hover:border-gray-400 transition-all shadow-sm border-b-2 border-b-[#0A192F]"
                >
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A192F] mb-1">{ind.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight line-clamp-3">{ind.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Systems */}
          <div className="pt-8 border-t border-gray-200">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F]">
                Supported Control Equipment & Protocols
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                We design, install, commission, test, and program leading addressable & conventional hardware.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {SUPPORTED_SYSTEMS.map((sys) => (
                <div
                  key={sys.name}
                  className="bg-white border border-gray-200 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-[#0A192F] shadow-sm flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#CC0000]" />
                  <span>{sys.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000] bg-red-50 border border-red-200 px-3.5 py-1 rounded-sm">
            Knowledge & SANS 10139 Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] mt-3 tracking-tight uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Clear, transparent answers regarding commercial fire detection, maintenance schedules, and system scope.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.id}
                className="bg-white border border-gray-200 rounded-sm overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm uppercase tracking-wide text-[#0A192F] flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#CC0000]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Category: <strong className="text-[#0A192F]">{faq.category}</strong></span>
                      {faq.sansClause && <span>Ref: <strong className="text-[#CC0000]">{faq.sansClause}</strong></span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CTA CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A192F] text-white rounded-sm p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000] bg-white/5 border border-white/10 px-3.5 py-1 rounded-sm">
                Pretoria West Operations Desk
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                Require a Commercial Fire-Detection Evaluation?
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
                Contact Audrin Fire Engineers (Pty) Ltd for site surveys, compliant system modifications, routine testing, or emergency panel diagnostics.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#CC0000]" />
                  <span className="font-semibold text-white">{COMPANY_DETAILS.physicalAddress}</span>
                </div>
                <div>•</div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[11px]">Direct Line:</span> <strong className="text-white">{COMPANY_DETAILS.telephone}</strong>
                </div>
                <div>•</div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[11px]">Hours:</span> <strong className="text-white">{COMPANY_DETAILS.operatingHours}</strong>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => handleRequestService()}
                className="w-full py-4 bg-[#CC0000] hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-widest rounded-sm shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Submit Service Request</span>
              </button>

              <button
                onClick={() => setActiveView('contact')}
                className="w-full py-3.5 bg-transparent hover:bg-white/5 text-white border border-white/20 font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Contact Direct Line</span>
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
