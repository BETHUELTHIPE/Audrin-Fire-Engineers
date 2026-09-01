import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Building,
  CheckCircle2,
  ShieldCheck,
  FilePlus,
  ArrowRight,
  Clock,
  Wrench,
  Cpu,
  Layers,
  Headphones,
  Sparkles,
  Volume2
} from 'lucide-react';

export const HowWeWorkView: React.FC = () => {
  const {
    howWeWorkSteps,
    setIsRequestModalOpen,
    setIsVoicePlayerOpen,
    activeVoiceStepNumber
  } = useApp();

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      
      {/* Header */}
      <section className="bg-[#0A192F] text-white py-16 sm:py-20 border-b-4 border-[#CC0000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-sm text-xs text-red-300 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-[#CC0000]" />
              <span>Phased Engineering Methodology Aligned with SANS 10139</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Our 7-Step "How We Work" Process
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
              Every fire-detection engagement at Audrin Fire Engineers follows a structured, transparent, and auditable 7-step sequence designed to guarantee standards compliance and clear operational communication.
            </p>

            {/* Voice AI Guide Trigger */}
            <div className="pt-2">
              <button
                id="how-we-work-voice-ai-btn"
                onClick={() => setIsVoicePlayerOpen(true)}
                className="inline-flex items-center gap-3 bg-[#CC0000] hover:bg-[#A30000] text-white px-5 py-3.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>Listen: How Our Process Works</span>
                <span className="bg-black/20 text-[10px] px-2 py-0.5 rounded-sm">VOICE AI</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Step Detailed Timeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 relative">
          
          {/* Vertical Connecting Line (Desktop) */}
          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-1 bg-slate-200"></div>

          {(howWeWorkSteps || []).map((stepItem, idx) => {
            const stepNum = stepItem.stepNumber ?? (stepItem as any).step ?? (idx + 1);
            const isHighlighted = activeVoiceStepNumber === stepNum;
            const deliverableText = stepItem.typicalDeliverables?.join(', ') || (stepItem as any).deliverable || 'SANS 10139 Engineering Milestone Record';

            return (
              <div
                key={stepNum}
                className={`relative flex flex-col md:flex-row items-start gap-6 bg-white border rounded-sm p-6 sm:p-8 transition-all ${
                  isHighlighted
                    ? 'border-2 border-[#CC0000] bg-red-50/40 shadow-xl ring-2 ring-[#CC0000]/30 -translate-y-1'
                    : 'border-slate-200 hover:border-slate-400 shadow-sm'
                }`}
              >
                {/* Step Number Box */}
                <div className={`relative z-10 w-16 h-16 rounded-sm font-mono font-black text-xl flex items-center justify-center shrink-0 shadow-md border-2 ${
                  isHighlighted ? 'bg-[#CC0000] text-white border-white' : 'bg-[#0A192F] text-white border-slate-700'
                }`}>
                  <span>0{stepNum}</span>
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#CC0000] uppercase tracking-wider block mb-1">
                        Stage 0{stepNum}
                      </span>
                      {isHighlighted && (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#CC0000] animate-pulse">
                          <Volume2 className="w-4 h-4" />
                          <span>Narrating Now...</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black uppercase text-[#0A192F]">
                      {stepItem.title}
                    </h3>
                    <p className="text-slate-700 text-xs sm:text-sm mt-1 font-semibold">
                      {stepItem.summary}
                    </p>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {stepItem.detailedDescription}
                  </p>

                  {/* Deliverable Box */}
                  <div className="p-4 rounded-sm bg-[#F8F9FA] border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 flex items-start gap-3 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-[#0A192F] uppercase block mb-0.5">Stage Deliverables:</strong>
                      <span className="text-slate-700 font-sans">{deliverableText}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#0A192F] text-white border-4 border-[#CC0000] rounded-sm p-8 sm:p-12 space-y-6 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Ready to Begin Stage 1?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Submit your building parameters or site survey request to generate an official tracking reference and initiate step 1.
          </p>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A30000] text-white px-8 py-4 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Request a Fire-Detection Service</span>
          </button>
        </div>
      </section>

    </div>
  );
};
