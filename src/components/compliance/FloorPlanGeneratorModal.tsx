import React, { useState, useRef } from 'react';
import {
  X,
  Wand2,
  Download,
  Check,
  Building2,
  Boxes,
  Stethoscope,
  Server,
  ShoppingBag,
  Layers,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  FileImage,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import {
  GeneratedFloorPlan,
  BuildingArchetype,
  BlueprintTheme,
  SANSCategory,
  GeneratorOptions
} from '../../types/floorplan';
import {
  generateArchitecturalFloorPlan,
  exportSvgToPng,
  BLUEPRINT_THEMES
} from '../../services/floorPlanGeneratorService';
import { useApp } from '../../context/AppContext';

interface FloorPlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: GeneratedFloorPlan) => void;
  initialSiteReference?: string;
  initialCustomerName?: string;
  initialFacilityName?: string;
}

export const FloorPlanGeneratorModal: React.FC<FloorPlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  initialSiteReference = 'AFE-SITE-2026',
  initialCustomerName = 'Audrin Fire Client',
  initialFacilityName = 'Commercial Facility'
}) => {
  const { showToast } = useApp();

  const [siteReference, setSiteReference] = useState<string>(initialSiteReference);
  const [customerName, setCustomerName] = useState<string>(initialCustomerName);
  const [facilityName, setFacilityName] = useState<string>(initialFacilityName);
  const [archetype, setArchetype] = useState<BuildingArchetype>('commercial_office');
  const [theme, setTheme] = useState<BlueprintTheme>('blueprint_blue');
  const [sansCategory, setSansCategory] = useState<SANSCategory>('L1');
  const [squareMeters, setSquareMeters] = useState<number>(1250);
  const [zoneCount, setZoneCount] = useState<number>(4);
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.8);

  // Hazard options
  const [hasCleanAgentGasRoom, setHasCleanAgentGasRoom] = useState<boolean>(true);
  const [hasLithiumBatteryRoom, setHasLithiumBatteryRoom] = useState<boolean>(false);
  const [hasKitchenExtraction, setKitchenExtraction] = useState<boolean>(false);
  const [hasEmergencyGenset, setHasEmergencyGenset] = useState<boolean>(true);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Corporate office layout with clean agent gas suppression in server room and dual emergency fire escape stairwells.'
  );

  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // Generated Plan State
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedFloorPlan>(() =>
    generateArchitecturalFloorPlan({
      siteReference,
      customerName,
      facilityName,
      archetype,
      theme,
      sansCategory,
      squareMeters,
      zoneCount,
      ceilingHeight,
      hasCleanAgentGasRoom,
      hasLithiumBatteryRoom,
      hasKitchenExtraction,
      hasEmergencyGenset,
      customPrompt
    })
  );

  const modalSvgRef = useRef<SVGSVGElement>(null);

  if (!isOpen) return null;

  const handleArchetypeChange = (arch: BuildingArchetype) => {
    setArchetype(arch);
    if (arch === 'industrial_warehouse') {
      setSquareMeters(4200);
      setCeilingHeight(8.5);
      setSansCategory('P1');
      setHasLithiumBatteryRoom(true);
      setCustomPrompt('High-bay pallet warehouse with 5 loading dock bays and sprinkler riser valve chamber.');
    } else if (arch === 'healthcare_clinic') {
      setSquareMeters(1600);
      setCeilingHeight(3.0);
      setSansCategory('L1');
      setHasCleanAgentGasRoom(true);
      setCustomPrompt('Hospital clinic with trauma unit, sterile surgical operating theatre and recovery wards.');
    } else if (arch === 'data_center') {
      setSquareMeters(950);
      setCeilingHeight(3.5);
      setSansCategory('L1');
      setHasCleanAgentGasRoom(true);
      setHasLithiumBatteryRoom(true);
      setCustomPrompt('Mission-critical data center with dual VESDA aspirating loops and Inergen gas suppression.');
    } else if (arch === 'retail_commercial') {
      setSquareMeters(2800);
      setCeilingHeight(4.2);
      setSansCategory('L3');
      setKitchenExtraction(true);
      setCustomPrompt('Large retail supermarket with open sales floor, checkout POS bank, and back storage area.');
    } else {
      setSquareMeters(1250);
      setCeilingHeight(2.8);
      setSansCategory('L2');
      setHasCleanAgentGasRoom(true);
      setCustomPrompt('Multi-zone commercial office with executive suites, open workstations, and server room.');
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const options: GeneratorOptions = {
          siteReference,
          customerName,
          facilityName,
          archetype,
          theme,
          sansCategory,
          squareMeters,
          zoneCount,
          ceilingHeight,
          hasCleanAgentGasRoom,
          hasLithiumBatteryRoom,
          hasKitchenExtraction,
          hasEmergencyGenset,
          customPrompt
        };

        const plan = generateArchitecturalFloorPlan(options);
        setGeneratedPlan(plan);
        setActiveTab('preview');
        showToast('success', 'Floor Plan Generated', `Created architectural layout with ${plan.rooms.length} rooms and ${plan.suggestedDevices.length} pre-allocated devices.`);
      } catch (err) {
        console.error(err);
        showToast('error', 'Generation Failed', 'Could not generate blueprint.');
      } finally {
        setIsGenerating(false);
      }
    }, 350);
  };

  const handleDownloadPng = async () => {
    if (!modalSvgRef.current) return;
    setIsExportingPng(true);
    try {
      showToast('info', 'Rendering Image', 'Exporting high-resolution CAD floorplan PNG (2000x1124)...');
      const filename = `Architectural_FloorPlan_${archetype}_${siteReference}.png`;
      await exportSvgToPng(modalSvgRef.current, filename);
      showToast('success', 'Download Complete', `Saved ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Download Failed', 'Could not export PNG image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(generatedPlan, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FloorPlan_${siteReference}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'JSON Exported', 'Floor plan structure exported successfully.');
  };

  const handleApply = () => {
    onApplyPlan(generatedPlan);
    showToast('success', 'Blueprint Applied', 'Active floor plan updated in CAD Device Viewer.');
    onClose();
  };

  const currentTheme = BLUEPRINT_THEMES[theme] || BLUEPRINT_THEMES.blueprint_blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0A192F] border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center shadow-inner">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                  SANS 10139 Image Generator
                </span>
                <span className="text-slate-400 text-xs font-mono">2000×1124 CAD Blueprint</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Placeholder Architectural Floorplan Generator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('configure')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'configure' ? 'bg-[#CC0000] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 inline mr-1" />
                Parameters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-[#CC0000] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Blueprint Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'configure' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Configuration Form */}
              <div className="lg:col-span-2 space-y-5">
                {/* Site Identity Card */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Site & Facility Identification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Site Ref Number:</label>
                      <input
                        type="text"
                        value={siteReference}
                        onChange={(e) => setSiteReference(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Customer / Organization:</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Facility / Building Name:</label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Building Archetype Picker */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Building Architectural Archetype
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Tailors compartments & hazard profiles</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      {
                        key: 'commercial_office' as BuildingArchetype,
                        name: 'Commercial Corporate Office',
                        desc: 'Boardrooms, open workstations, executive offices & server room',
                        icon: <Building2 className="w-4 h-4 text-blue-400" />
                      },
                      {
                        key: 'industrial_warehouse' as BuildingArchetype,
                        name: 'High-Bay Logistics Warehouse',
                        desc: 'Pallet racking aisles, 5 loading docks & sprinkler riser room',
                        icon: <Boxes className="w-4 h-4 text-amber-400" />
                      },
                      {
                        key: 'healthcare_clinic' as BuildingArchetype,
                        name: 'Healthcare & Surgical Clinic',
                        desc: 'Trauma bay, inpatient care recovery wards & surgical theatre',
                        icon: <Stethoscope className="w-4 h-4 text-emerald-400" />
                      },
                      {
                        key: 'data_center' as BuildingArchetype,
                        name: 'Tier-3 Mission-Critical Data Center',
                        desc: 'Hot/cold aisle server racks, dual VESDA & Inergen gas flood',
                        icon: <Server className="w-4 h-4 text-rose-400" />
                      },
                      {
                        key: 'retail_commercial' as BuildingArchetype,
                        name: 'Retail Superstore & Mall Tenant',
                        desc: 'Public sales showroom floor, POS bank & back-of-house storage',
                        icon: <ShoppingBag className="w-4 h-4 text-purple-400" />
                      },
                      {
                        key: 'custom' as BuildingArchetype,
                        name: 'Custom Tailored Blueprint',
                        desc: 'Procedural layout generated from custom specifications below',
                        icon: <Sparkles className="w-4 h-4 text-cyan-400" />
                      }
                    ].map((item) => {
                      const isSelected = archetype === item.key;
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleArchetypeChange(item.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-400'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              {item.icon}
                              {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                            </div>
                            <h4 className="text-xs font-bold text-white">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SANS 10139 System Category Selection */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    SANS 10139 System Category Design
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { code: 'L1', label: 'Cat L1: Total Life Safety', desc: 'All compartments' },
                      { code: 'L2', label: 'Cat L2: High Hazard & Escapes', desc: 'Plant & corridors' },
                      { code: 'L3', label: 'Cat L3: Escape Route Doors', desc: 'Circulation routes' },
                      { code: 'L4', label: 'Cat L4: Escapes Only', desc: 'Corridors & stairs' },
                      { code: 'P1', label: 'Cat P1: Total Property Protection', desc: 'Complete building' },
                      { code: 'P2', label: 'Cat P2: Critical Property', desc: 'Designated high-risk' },
                      { code: 'M', label: 'Cat M: Manual System Only', desc: 'Break glass call points' }
                    ].map((cat) => {
                      const isSelected = sansCategory === cat.code;
                      return (
                        <button
                          key={cat.code}
                          type="button"
                          onClick={() => setSansCategory(cat.code as SANSCategory)}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/80 border-amber-500 text-white ring-1 ring-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{cat.label}</div>
                          <div className="text-[9px] text-slate-400 truncate">{cat.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Natural Language Prompt Customizer */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Architectural Layout Prompt & Specific Site Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe specific site characteristics or equipment locations..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white font-mono focus:ring-1 focus:ring-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    Prompt directs the procedural engine to allocate appropriate SANS 10139 device counts and hazard rooms.
                  </p>
                </div>
              </div>

              {/* Right Column: Style & Hazard Toggles */}
              <div className="space-y-5">
                {/* Drafting Theme Selector */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Drafting Style & Theme
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(BLUEPRINT_THEMES) as BlueprintTheme[]).map((t) => {
                      const themeMeta = BLUEPRINT_THEMES[t];
                      const isSelected = theme === t;
                      return (
                        <div
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-950/70 border-blue-500 ring-1 ring-blue-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-5 h-5 rounded-md border border-slate-600 shadow-inner"
                              style={{ backgroundColor: themeMeta.bg }}
                            />
                            <span className="text-xs font-mono font-bold text-white">{themeMeta.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specific SANS Hazard Toggles */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Specialist Hazard Enclosures
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                      <span>Clean Agent Gas Room (FM-200)</span>
                      <input
                        type="checkbox"
                        checked={hasCleanAgentGasRoom}
                        onChange={(e) => setHasCleanAgentGasRoom(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                      <span>Lithium-ion Battery / UPS Room</span>
                      <input
                        type="checkbox"
                        checked={hasLithiumBatteryRoom}
                        onChange={(e) => setHasLithiumBatteryRoom(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                      <span>Commercial Kitchen Hood (SANS 1850)</span>
                      <input
                        type="checkbox"
                        checked={hasKitchenExtraction}
                        onChange={(e) => setKitchenExtraction(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                      <span>Standby Emergency Genset Bay</span>
                      <input
                        type="checkbox"
                        checked={hasEmergencyGenset}
                        onChange={(e) => setHasEmergencyGenset(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Building Footprint Slider */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Footprint:</span>
                    <span className="font-bold text-amber-400">{squareMeters} m²</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={10000}
                    step={100}
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>400m²</span>
                    <span>5000m²</span>
                    <span>10000m²</span>
                  </div>
                </div>

                {/* Generate Action Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating CAD Floorplan...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate 2000×1124 CAD Blueprint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Live Blueprint Preview Tab */
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      2000×1124 CAD RESOLUTION READY
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-bold">{generatedPlan.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {generatedPlan.rooms.length} Compartments | {generatedPlan.suggestedDevices.length} SANS 10139 Devices | Scale: {generatedPlan.scaleText}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isExportingPng}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileImage className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isExportingPng ? 'Rendering...' : 'Download PNG'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-3.5 py-1.5 bg-[#CC0000] hover:bg-red-600 text-white text-xs font-mono font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Site CAD Viewer</span>
                  </button>
                </div>
              </div>

              {/* Rendered SVG Blueprint */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl relative">
                <svg
                  ref={modalSvgRef}
                  viewBox="0 0 1000 562"
                  className="w-full h-auto aspect-16/9 select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="modalCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke={currentTheme.gridPrimary} strokeWidth="0.75" />
                      <path d="M 200 0 L 0 0 0 200" fill="none" stroke={currentTheme.gridSecondary} strokeWidth="1.2" opacity="0.3" />
                    </pattern>
                  </defs>

                  {/* Background & Grid */}
                  <rect width="1000" height="562" fill={currentTheme.bg} />
                  <rect width="1000" height="562" fill="url(#modalCadGrid)" />

                  {/* Outer Perimeter Wall */}
                  <rect
                    x="60"
                    y="50"
                    width="880"
                    height="460"
                    fill="none"
                    stroke={currentTheme.wallExterior}
                    strokeWidth="4"
                  />

                  {/* Rooms */}
                  {generatedPlan.rooms.map((room, idx) => {
                    const isHazard = room.type === 'hazard' || room.type === 'server_room';
                    const roomFill = isHazard
                      ? currentTheme.hazardBg
                      : idx % 2 === 0
                      ? currentTheme.roomBg
                      : currentTheme.roomBgAlt;

                    return (
                      <g key={room.id}>
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={roomFill}
                          stroke={isHazard ? currentTheme.hazardBorder : currentTheme.wallInterior}
                          strokeWidth="2"
                        />
                        <text
                          x={room.x + 14}
                          y={room.y + 24}
                          fill={currentTheme.textPrimary}
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {room.name}
                        </text>
                        <text
                          x={room.x + 14}
                          y={room.y + 40}
                          fill={currentTheme.textMuted}
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {room.areaSqM} m² | {room.zoneName}
                        </text>
                        {room.specialHazard && (
                          <text
                            x={room.x + 14}
                            y={room.y + room.height - 14}
                            fill={currentTheme.hazardBorder}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            ⚠ [{room.specialHazard}]
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Doors */}
                  {generatedPlan.doors.map((door) => (
                    <g key={door.id}>
                      {door.orientation === 'vertical' ? (
                        <line
                          x1={door.x}
                          y1={door.y}
                          x2={door.x}
                          y2={door.y + door.width}
                          stroke={door.isEmergencyExit ? currentTheme.doorExit : currentTheme.doorNormal}
                          strokeWidth="6"
                        />
                      ) : (
                        <line
                          x1={door.x}
                          y1={door.y}
                          x2={door.x + door.width}
                          y2={door.y}
                          stroke={door.isEmergencyExit ? currentTheme.doorExit : currentTheme.doorNormal}
                          strokeWidth="6"
                        />
                      )}
                    </g>
                  ))}

                  {/* Pre-allocated Devices on Preview */}
                  {generatedPlan.suggestedDevices.map((dev) => {
                    const cx = (dev.xPercent / 100) * 1000;
                    const cy = (dev.yPercent / 100) * 562;
                    let pinColor = '#10B981';
                    if (dev.type === 'panel') pinColor = '#9333EA';
                    else if (dev.type === 'call_point') pinColor = '#EF4444';
                    else if (dev.type === 'heat') pinColor = '#F59E0B';
                    else if (dev.type === 'sounder') pinColor = '#38BDF8';

                    return (
                      <g key={dev.id}>
                        <circle cx={cx} cy={cy} r="6" fill={pinColor} stroke="#FFFFFF" strokeWidth="1.5" />
                        <text cx={cx} cy={cy - 9} fill={currentTheme.textPrimary} fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {dev.label.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Title Block in bottom right */}
                  <g transform="translate(680, 420)">
                    <rect width="250" height="85" fill={currentTheme.bg} stroke={currentTheme.wallExterior} strokeWidth="1.5" />
                    <text x="10" y="20" fill="#CC0000" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      AUDRIN FIRE ENGINEERS
                    </text>
                    <text x="10" y="38" fill={currentTheme.textPrimary} fontSize="9" fontFamily="monospace">
                      {facilityName.substring(0, 24)}
                    </text>
                    <text x="10" y="54" fill={currentTheme.textMuted} fontSize="8" fontFamily="monospace">
                      REF: {siteReference} | {generatedPlan.scaleText}
                    </text>
                    <text x="10" y="70" fill="#10B981" fontSize="8" fontFamily="monospace">
                      SANS 10139 CATEGORY {sansCategory}
                    </text>
                  </g>
                </svg>
              </div>

              {/* SANS Compliance & Summary Details */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  SANS 10139 Engineering Notes
                </h4>
                <ul className="text-xs font-mono text-slate-400 space-y-1">
                  {generatedPlan.sansComplianceNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Aligned with SANS 10139:2012 Clause 25.3 & SAQCC 1475/1485 standards.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-[#CC0000] hover:bg-red-600 text-white text-xs font-mono font-bold rounded-lg shadow transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Blueprint to Site</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
