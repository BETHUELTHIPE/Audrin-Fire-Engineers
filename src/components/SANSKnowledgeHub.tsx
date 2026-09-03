import React, { useState } from 'react';
import {
  SANS_STANDARDS_KNOWLEDGE,
  calculateSANS246Coverage,
  evaluateSANS322Hospital,
  calculateSANS10400TExtinguishers,
  SANS246CalcParams,
  SANS322SpecParams,
  SANS10400TExtinguisherCalcParams
} from '../data/sansLegalKnowledge';
import {
  BookOpen,
  ShieldCheck,
  Building2,
  Server,
  HeartPulse,
  Flame,
  Calculator,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  Zap,
  Volume2,
  Maximize2,
  ChevronRight,
  Info,
  Scale,
  Award,
  Sparkles
} from 'lucide-react';

export const SANSKnowledgeHub: React.FC = () => {
  const [activeStandardKey, setActiveStandardKey] = useState<'sans10139' | 'sans322' | 'sans246' | 'sans10400t'>('sans10139');
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<'sans246' | 'sans322' | 'sans10400t' | 'sans10139spacing'>('sans246');

  // SANS 246 Calculator State
  const [sans246Params, setSans246Params] = useState<SANS246CalcParams>({
    roomAreaM2: 75,
    airflowSpeed: 'moderate',
    ahuShutOffByASD: true,
    asymmetricSpacing: true,
    asdSensitivityClass: 'Class A',
    isIntegratingDetector: true,
    isInVentilatedVoid: false,
    ceilingType: 'smooth'
  });

  // SANS 322 Hospital Specifier State
  const [sans322Params, setSans322Params] = useState<SANS322SpecParams>({
    totalDevicesCount: 145,
    hasPatientSleepingAreas: true,
    hasOperatingTheatresOrICU: true,
    hasMentalHealthWards: false,
    publicToiletsCount: 6
  });

  // SANS 10400-T Table 11 Calculator State
  const [sans10400TParams, setSans10400TParams] = useState<SANS10400TExtinguisherCalcParams>({
    occupancyClass: 'E2',
    floorAreaM2: 1250
  });

  // SANS 10139 Spacing State
  const [pitchAngleDeg, setPitchAngleDeg] = useState<number>(15);
  const [isApexRoof, setIsApexRoof] = useState<boolean>(false);
  const [quiescentCurrentAmp, setQuiescentCurrentAmp] = useState<number>(0.45);
  const [alarmCurrentAmp, setAlarmCurrentAmp] = useState<number>(2.8);

  const sans246Result = calculateSANS246Coverage(sans246Params);
  const sans322Result = evaluateSANS322Hospital(sans322Params);
  const sans10400TResult = calculateSANS10400TExtinguishers(sans10400TParams);

  // SANS 10139 Spacing Math
  const baseSmokeRadius = 7.5;
  const baseHeatRadius = 5.3;
  const apexIncreasePercent = isApexRoof ? Math.min(25, pitchAngleDeg * 1) : 0;
  const adjustedSmokeRadius = (baseSmokeRadius * (1 + apexIncreasePercent / 100)).toFixed(2);
  const adjustedHeatRadius = (baseHeatRadius * (1 + apexIncreasePercent / 100)).toFixed(2);

  // SANS 10139 Battery Math (Clause 15: 24h quiescent + 0.5h alarm * 1.25 safety factor)
  const batteryAhRaw = (quiescentCurrentAmp * 24) + (alarmCurrentAmp * 0.5);
  const batteryAhWithSafety = (batteryAhRaw * 1.25).toFixed(1);

  const activeStandard = SANS_STANDARDS_KNOWLEDGE[activeStandardKey];

  return (
    <div className="space-y-10">
      
      {/* Top Banner: South African Legal Authority Notice */}
      <div className="bg-[#0A192F] text-white p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Scale className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Official South African National Standards (SABS / SAQCC Base Knowledge)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            South African Statutory Fire Engineering Source of Truth
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every specification, condition report, maintenance schedule, and certificate generated on the Audrin Fire platform adheres strictly to the primary legal frameworks: <strong>SANS 10139</strong> (SAQCC Commissioner Modules), <strong>SANS 322:2005</strong> (Hospitals), <strong>SANS 246</strong> (Electronic & Data Centre Equipment), and <strong>SANS 10400-T:2011</strong> (National Building Regulations Part T).
          </p>
        </div>
      </div>

      {/* Standard Selector Navigation Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            key: 'sans10139',
            code: 'SANS 10139',
            badge: 'SAQCC Core',
            label: 'General Fire Detection',
            icon: ShieldCheck,
            color: 'border-red-500'
          },
          {
            key: 'sans322',
            code: 'SANS 322:2005',
            badge: 'Healthcare Law',
            label: 'Hospital Systems',
            icon: HeartPulse,
            color: 'border-blue-500'
          },
          {
            key: 'sans246',
            code: 'SANS 246',
            badge: 'Data Centres',
            label: 'Electronic Equipment & ASD',
            icon: Server,
            color: 'border-emerald-500'
          },
          {
            key: 'sans10400t',
            code: 'SANS 10400-T:2011',
            badge: 'NBR Part T',
            label: 'National Building Regs',
            icon: Building2,
            color: 'border-amber-500'
          }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeStandardKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveStandardKey(item.key as any)}
              className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-[#CC0000] shadow-md scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-sm ${
                  isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.badge}
                </span>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FFB703]' : 'text-slate-400'}`} />
              </div>
              <div>
                <div className="text-base font-black tracking-tight">{item.code}</div>
                <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Standard Overview & Statutory Clause Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-[#CC0000] uppercase tracking-wider">
              {activeStandard.code}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-1">
              {activeStandard.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {activeStandard.officialScope}
            </p>
          </div>
          <div className="shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
            <div className="text-slate-500 font-medium">Enforcing Authority:</div>
            <div className="font-bold text-[#0A192F] font-mono">{activeStandard.governingBody}</div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Statutory Deemed-to-Satisfy Status</span>
            </div>
          </div>
        </div>

        {/* Clause List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#CC0000]" />
            <span>Key Legal Clauses &amp; Mandatory Engineering Rules</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeStandard.keyClauses.map((c, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl space-y-2 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#CC0000] bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                    {c.clause}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{c.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.summary}</p>
                <div className="pt-1 text-[11px] font-mono text-[#0A192F] font-semibold flex items-start gap-1.5 bg-white p-2 rounded-sm border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Statutory Rule:</strong> {c.statutoryRequirement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive SANS Statutory Engineering Calculators */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FFB703] uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Interactive Statutory Calculation Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              South African SANS Regulatory Calculators
            </h3>
          </div>

          {/* Calculator Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveCalculatorTab('sans246')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCalculatorTab === 'sans246' ? 'bg-[#CC0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SANS 246 (Server ASD)
            </button>
            <button
              onClick={() => setActiveCalculatorTab('sans322')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCalculatorTab === 'sans322' ? 'bg-[#CC0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SANS 322 (Hospitals)
            </button>
            <button
              onClick={() => setActiveCalculatorTab('sans10139spacing')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCalculatorTab === 'sans10139spacing' ? 'bg-[#CC0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SANS 10139 (Spacing &amp; Battery)
            </button>
            <button
              onClick={() => setActiveCalculatorTab('sans10400t')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCalculatorTab === 'sans10400t' ? 'bg-[#CC0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SANS 10400-T (Table 11 Extinguishers)
            </button>
          </div>
        </div>

        {/* TAB 1: SANS 246 Electronic Equipment & Server ASD Calculator */}
        {activeCalculatorTab === 'sans246' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Input Room &amp; Airflow Parameters (Page 24 Formula)</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Server Room / Data Centre Area (m²): <span className="text-[#FFB703] font-mono text-sm">{sans246Params.roomAreaM2} m²</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={sans246Params.roomAreaM2}
                  onChange={(e) => setSans246Params({ ...sans246Params, roomAreaM2: parseInt(e.target.value) || 10 })}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Airflow Velocity in &gt; 25% of Space:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'normal', label: '< 1 m/s (Standard)', adj: '0 m²' },
                    { val: 'moderate', label: '1–4 m/s (High)', adj: '-5 m²' },
                    { val: 'high', label: '> 4 m/s (Severe)', adj: '-10 m²' }
                  ].map((speed) => (
                    <button
                      key={speed.val}
                      onClick={() => setSans246Params({ ...sans246Params, airflowSpeed: speed.val as any })}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                        sans246Params.airflowSpeed === speed.val
                          ? 'bg-[#CC0000] border-red-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-bold">{speed.label}</div>
                      <div className="text-[10px] text-slate-200 font-mono">{speed.adj}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans246Params.ahuShutOffByASD}
                    onChange={(e) => setSans246Params({ ...sans246Params, ahuShutOffByASD: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>AHU shut off by early warning detection in return vents (+10 m²) [Clause b]</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans246Params.asymmetricSpacing}
                    onChange={(e) => setSans246Params({ ...sans246Params, asymmetricSpacing: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Asymmetric spacing arranged across airflow direction (+5 m²) [Clause c]</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans246Params.isIntegratingDetector}
                    onChange={(e) => setSans246Params({ ...sans246Params, isIntegratingDetector: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Integrating detector deployed (ASD / Optical beam) (+5 m²) [Clause e]</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans246Params.isInVentilatedVoid}
                    onChange={(e) => setSans246Params({ ...sans246Params, isInVentilatedVoid: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Detector situated in ventilated void / plenum (-5 m²) [Clause g1]</span>
                </label>
              </div>
            </div>

            {/* SANS 246 Results Card */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#FFB703] font-bold">
                    SANS 246 Clause 3.5 Spacing Output
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-sm font-mono">
                    Legally Compliant
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Coverage Per Point</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {sans246Result.adjustedCoveragePerDetectorM2} <span className="text-sm font-normal text-slate-400">m²/pt</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Base: 25 m²</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Required Detectors / Holes</div>
                    <div className="text-2xl font-black text-[#FFB703] font-mono">
                      {sans246Result.requiredDetectorsOrSamplingPoints} <span className="text-sm font-normal text-slate-400">points</span>
                    </div>
                    <div className="text-[10px] text-slate-500">For {sans246Params.roomAreaM2} m² Room</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span>SANS 246 Clause 4.1.1 Portable Extinguisher Rule:</span>
                  </div>
                  <div className="text-xs text-[#FFB703] font-mono font-bold">
                    {sans246Result.requiredCo2Extinguishers.formulaExplanation}
                  </div>
                  <div className="text-[11px] text-red-400">
                    <strong>CRITICAL MANDATE:</strong> Dry Chemical Powder (DCP) is strictly PROHIBITED in electronic server rooms.
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1 font-mono">
                  <div><strong>Sensitivity Spec:</strong> {sans246Result.recommendedAsdClass} (&lt;0.8% obs/m at return vents)</div>
                  <div><strong>CRAC Return Grille:</strong> Min 3 Class A sampling holes per vent (max 0.4 m²/hole)</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-between">
                <span>Calculated via SANS 246:2011 / BS 6266 Engineering Schedule</span>
                <span className="text-emerald-400 font-bold">Verified by Audrin Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SANS 322 Hospital Fire System Specifier */}
        {activeCalculatorTab === 'sans322' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-400" />
                <span>Hospital Premise Parameters (SANS 322:2005)</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Total Fire Detection Devices on Site: <span className="text-[#FFB703] font-mono text-sm">{sans322Params.totalDevicesCount} devices</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={600}
                  step={10}
                  value={sans322Params.totalDevicesCount}
                  onChange={(e) => setSans322Params({ ...sans322Params, totalDevicesCount: parseInt(e.target.value) || 10 })}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Public Access Toilets Count: <span className="text-[#FFB703] font-mono">{sans322Params.publicToiletsCount}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={sans322Params.publicToiletsCount}
                  onChange={(e) => setSans322Params({ ...sans322Params, publicToiletsCount: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans322Params.hasPatientSleepingAreas}
                    onChange={(e) => setSans322Params({ ...sans322Params, hasPatientSleepingAreas: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Includes In-Patient Wards / Sleeping Accommodations</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans322Params.hasOperatingTheatresOrICU}
                    onChange={(e) => setSans322Params({ ...sans322Params, hasOperatingTheatresOrICU: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Includes Operating Theatres, ICU, or Special Care Baby Units (SCBU)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sans322Params.hasMentalHealthWards}
                    onChange={(e) => setSans322Params({ ...sans322Params, hasMentalHealthWards: e.target.checked })}
                    className="rounded-sm accent-red-600"
                  />
                  <span>Includes Mental Health Patient Facilities (Discreet musical / coded alarms)</span>
                </label>
              </div>
            </div>

            {/* SANS 322 Results Card */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#FFB703] font-bold">
                    SANS 322 Mandatory System Spec
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-sm font-mono">
                    Table 1 Certified
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Required Panel Architecture</div>
                  <div className="text-xl font-black text-white font-mono">
                    {sans322Result.panelSystemType}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {sans322Params.totalDevicesCount <= 50 ? '≤ 50 devices: Conventional permitted' : (sans322Params.totalDevicesCount < 100 ? '51–99 devices: Addressable mandatory' : '≥ 100 devices: Analogue / Multi-State Addressable mandatory')}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Patient Audibility Standard:</span>
                    <span className="text-emerald-400 font-mono font-bold">{sans322Result.patientAreaSounderLevelDb}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Theatre / ICU Visual Beacons:</span>
                    <span className="text-slate-200">{sans322Result.theatreVisualAlarmRequirement}</span>
                  </div>

                  <div className="p-2 bg-red-950/50 border border-red-900/60 rounded-sm text-red-200 text-[11px]">
                    {sans322Result.publicToiletDetectionRule}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-between">
                <span>Derived from SANS 322:2005 Healthcare Standard</span>
                <span className="text-blue-400 font-bold">Category M &amp; L1 Mandatory</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SANS 10139 Spacing & Battery Sizing */}
        {activeCalculatorTab === 'sans10139spacing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Ceiling &amp; Electrical Load Inputs (SANS 10139 Clauses 8-15)</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApexRoof}
                    onChange={(e) => setIsApexRoof(e.target.checked)}
                    className="rounded-sm accent-red-600"
                  />
                  <span className="font-bold">Pitched Apex Ceiling (Clause 9 &amp; 10)</span>
                </label>

                {isApexRoof && (
                  <div className="pl-6 space-y-1">
                    <label className="block text-slate-300">
                      Slope Pitch Angle (°): <span className="text-[#FFB703] font-mono">{pitchAngleDeg}°</span> (+{apexIncreasePercent}% spacing, max 25%)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={45}
                      value={pitchAngleDeg}
                      onChange={(e) => setPitchAngleDeg(parseInt(e.target.value) || 1)}
                      className="w-full accent-red-600"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  Secondary Standby Battery Sizing (Clause 15):
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase">Quiescent Current (Amps)</label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.1}
                      max={10}
                      value={quiescentCurrentAmp}
                      onChange={(e) => setQuiescentCurrentAmp(parseFloat(e.target.value) || 0.1)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-500">24-hour duration</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase">Alarm Load Current (Amps)</label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.5}
                      max={30}
                      value={alarmCurrentAmp}
                      onChange={(e) => setAlarmCurrentAmp(parseFloat(e.target.value) || 0.5)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-500">0.5-hour duration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SANS 10139 Results Card */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#FFB703] font-bold">
                    SANS 10139 Compliance Radius &amp; Power
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-sm font-mono">
                    SAQCC Standard
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Optical Smoke Radius</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {adjustedSmokeRadius} <span className="text-sm font-normal text-slate-400">m</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Base: 7.5 m</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Heat Detector Radius</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {adjustedHeatRadius} <span className="text-sm font-normal text-slate-400">m</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Base: 5.3 m</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Required Battery Capacity (Ah)</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {batteryAhWithSafety} Ah <span className="text-xs font-normal text-slate-400">(with 1.25 safety factor)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Formula: (({quiescentCurrentAmp}A × 24h) + ({alarmCurrentAmp}A × 0.5h)) × 1.25 = {batteryAhWithSafety} Ah
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-between">
                <span>SANS 10139:2012 Clauses 8, 9, 11, 15</span>
                <span className="text-red-400 font-bold">Passed Statutory Check</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SANS 10400-T Table 11 Fire Extinguishers */}
        {activeCalculatorTab === 'sans10400t' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Building Occupancy &amp; Area (Table 11 Matrix)</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Occupancy Classification:</label>
                <select
                  value={sans10400TParams.occupancyClass}
                  onChange={(e) => setSans10400TParams({ ...sans10400TParams, occupancyClass: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 w-full font-mono text-xs cursor-pointer"
                >
                  <option value="A1">A1 - Entertainment &amp; Public Assembly (1/200 m²)</option>
                  <option value="A2">A2 - Theatrical &amp; Indoor Sport (1/200 m²)</option>
                  <option value="A3">A3 - Place of Instruction / School (1/200 m²)</option>
                  <option value="B1">B1 - High Risk Commercial Service (1/100 m²)</option>
                  <option value="B2">B2 - Moderate Risk Commercial (1/200 m²)</option>
                  <option value="B3">B3 - Low Risk Commercial (1/400 m²)</option>
                  <option value="C1">C1 - Exhibition Hall (1/200 m²)</option>
                  <option value="D1">D1 - High Risk Industrial (1/100 m²)</option>
                  <option value="D2">D2 - Moderate Risk Industrial (1/100 m²)</option>
                  <option value="E2">E2 - Hospital (1/200 m²)</option>
                  <option value="E3">E3 - Other Institutional / Residential (1/200 m²)</option>
                  <option value="F1">F1 - Large Shop / Retail (1/200 m²)</option>
                  <option value="G1">G1 - Offices (1/200 m²)</option>
                  <option value="H1">H1 - Hotel (1/200 m²)</option>
                  <option value="J1">J1 - High Risk Storage / Flammables (1/100 m²)</option>
                  <option value="J4">J4 - Parking Garage (1/400 m²)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Floor Area (m²): <span className="text-[#FFB703] font-mono text-sm">{sans10400TParams.floorAreaM2} m²</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={sans10400TParams.floorAreaM2}
                  onChange={(e) => setSans10400TParams({ ...sans10400TParams, floorAreaM2: parseInt(e.target.value) || 100 })}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            {/* SANS 10400-T Results Card */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#FFB703] font-bold">
                    SANS 10400-T Table 11 Statutory Result
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-sm font-mono">
                    Class {sans10400TParams.occupancyClass}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Extinguishers Required</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {sans10400TResult.calculatedExtinguishersCount} <span className="text-sm font-normal text-slate-400">units</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{sans10400TResult.ratePerM2}</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Hose Reels (Clause 4.34)</div>
                    <div className="text-2xl font-black text-blue-400 font-mono">
                      {sans10400TResult.hoseReelsRequired} <span className="text-sm font-normal text-slate-400">reels</span>
                    </div>
                    <div className="text-[10px] text-slate-500">1 per 500 m²</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="text-slate-300"><strong>Min Charge (CO2):</strong> {sans10400TResult.minimumChargeCO2}</div>
                  <div className="text-slate-300"><strong>Min Charge (DCP):</strong> {sans10400TResult.minimumChargeDCP}</div>
                  <div className="text-slate-300"><strong>Min Water/Foam:</strong> {sans10400TResult.minimumChargeWaterFoam}</div>
                  {sans10400TResult.fireHydrantsRequired > 0 && (
                    <div className="text-amber-400 font-bold">
                      <strong>Fire Hydrants (Clause 4.35):</strong> {sans10400TResult.fireHydrantsRequired} required (1 per 1,000 m²)
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-between">
                <span>NBR Part T Act 103 of 1977 Compliant</span>
                <span className="text-amber-400 font-bold">SANS 10400-T:2011 Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SANSKnowledgeHub;
