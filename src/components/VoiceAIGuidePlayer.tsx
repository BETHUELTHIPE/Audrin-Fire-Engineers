import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  FileText,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Settings2,
  ShieldCheck,
  Headphones
} from 'lucide-react';

export const VoiceAIGuidePlayer: React.FC = () => {
  const {
    isVoicePlayerOpen,
    setIsVoicePlayerOpen,
    voiceGuideData,
    activeVoiceStepNumber,
    setActiveVoiceStepNumber,
    recordVoiceMetric,
    setIsRequestModalOpen
  } = useApp();

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0); // 0 = Intro, 1..7 = Steps, 8 = Conclusion
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalSectionDuration, setTotalSectionDuration] = useState<number>(10);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(true);

  // References for Web Speech API
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);

  // Define total sections array
  const allSections = [
    {
      index: 0,
      stepNumber: 0,
      type: 'intro',
      title: voiceGuideData.introduction.title,
      label: 'Introduction',
      text: voiceGuideData.introduction.text,
      duration: voiceGuideData.introduction.durationSeconds
    },
    ...voiceGuideData.steps.map((s, idx) => ({
      index: idx + 1,
      stepNumber: s.stepNumber,
      type: 'step',
      title: `Step ${s.stepNumber}: ${s.title}`,
      label: `Step ${s.stepNumber}`,
      text: s.narrationText,
      duration: s.durationSeconds
    })),
    {
      index: 8,
      stepNumber: 8,
      type: 'conclusion',
      title: voiceGuideData.conclusion.title,
      label: 'Get Started',
      text: voiceGuideData.conclusion.text,
      duration: voiceGuideData.conclusion.durationSeconds
    }
  ];

  const currentSection = allSections[currentSectionIndex] || allSections[0];

  // Sync active step with global AppContext for timeline highlighting on the homepage
  useEffect(() => {
    if (isVoicePlayerOpen) {
      if (currentSection.type === 'step') {
        setActiveVoiceStepNumber(currentSection.stepNumber);
      } else if (currentSection.type === 'intro') {
        setActiveVoiceStepNumber(0);
      } else {
        setActiveVoiceStepNumber(8);
      }
    } else {
      setActiveVoiceStepNumber(null);
    }
  }, [currentSectionIndex, isVoicePlayerOpen, currentSection.type, currentSection.stepNumber, setActiveVoiceStepNumber]);

  // Clean up speech synthesis on unmount or close
  useEffect(() => {
    if (!isVoicePlayerOpen) {
      stopPlayback();
    }
  }, [isVoicePlayerOpen]);

  // Speech synthesis controller
  const startSpeakingSection = (sectionIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeechAvailable(false);
      runSimulationTimer(sectionIndex);
      return;
    }

    window.speechSynthesis.cancel();
    clearInterval(timerRef.current);

    const targetSection = allSections[sectionIndex];
    if (!targetSection) return;

    setCurrentSectionIndex(sectionIndex);
    setTotalSectionDuration(targetSection.duration);
    setElapsedSeconds(0);
    setIsPlaying(true);

    recordVoiceMetric('step', targetSection.stepNumber);

    const utterance = new SpeechSynthesisUtterance(targetSection.text);
    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : volume;

    // Pick best English voice (prefer South African, British, or clear standard English)
    const voices = window.speechSynthesis.getVoices();
    const saVoice = voices.find(v => v.lang.includes('en-ZA') || v.lang.includes('en_ZA'));
    const ukVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en_GB'));
    const defaultEng = voices.find(v => v.lang.startsWith('en'));

    if (saVoice) utterance.voice = saVoice;
    else if (ukVoice) utterance.voice = ukVoice;
    else if (defaultEng) utterance.voice = defaultEng;

    utterance.onend = () => {
      clearInterval(timerRef.current);
      if (sectionIndex < allSections.length - 1) {
        // Move to next step smoothly
        setTimeout(() => {
          startSpeakingSection(sectionIndex + 1);
        }, 600);
      } else {
        setIsPlaying(false);
        recordVoiceMetric('complete');
      }
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error, falling back to simulated audio timer:', err);
      runSimulationTimer(sectionIndex);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Timer tick for progress bar
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        if (prev >= targetSection.duration) {
          return targetSection.duration;
        }
        return prev + 1;
      });
    }, 1000 / playbackRate);
  };

  const runSimulationTimer = (sectionIndex: number) => {
    clearInterval(timerRef.current);
    const targetSection = allSections[sectionIndex];
    setCurrentSectionIndex(sectionIndex);
    setTotalSectionDuration(targetSection.duration);
    setElapsedSeconds(0);
    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        if (prev + 1 >= targetSection.duration) {
          clearInterval(timerRef.current);
          if (sectionIndex < allSections.length - 1) {
            setTimeout(() => startSpeakingSection(sectionIndex + 1), 600);
          } else {
            setIsPlaying(false);
            recordVoiceMetric('complete');
          }
          return targetSection.duration;
        }
        return prev + 1;
      });
    }, 1000 / playbackRate);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        timerRef.current = setInterval(() => {
          setElapsedSeconds(prev => (prev < totalSectionDuration ? prev + 1 : prev));
        }, 1000 / playbackRate);
      } else {
        recordVoiceMetric('play');
        startSpeakingSection(currentSectionIndex);
      }
    }
  };

  const stopPlayback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setElapsedSeconds(0);
  };

  const jumpToSection = (idx: number) => {
    stopPlayback();
    startSpeakingSection(idx);
  };

  const handleNext = () => {
    if (currentSectionIndex < allSections.length - 1) {
      stopPlayback();
      startSpeakingSection(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      stopPlayback();
      startSpeakingSection(currentSectionIndex - 1);
    }
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (isPlaying) {
      stopPlayback();
      setTimeout(() => startSpeakingSection(currentSectionIndex), 100);
    }
  };

  const handleClose = () => {
    stopPlayback();
    setIsVoicePlayerOpen(false);
  };

  if (!isVoicePlayerOpen) return null;

  const progressPercentage = Math.min(100, Math.round((elapsedSeconds / (totalSectionDuration || 1)) * 100));

  return (
    <div
      id="voice-ai-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A192F]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Audrin Fire Engineers Process Voice AI Guide"
    >
      <div className="relative w-full max-w-4xl bg-[#F8F9FA] border-2 border-[#0A192F] shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#0A192F] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#CC0000]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#CC0000] text-white flex items-center justify-center rounded-sm shadow-inner">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#CC0000] bg-white/10 px-2 py-0.5 rounded-sm font-bold">
                  Voice AI Guide
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  SANS 10139 Process
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white mt-0.5">
                How Our Workflow Operates
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
              title="Close Voice Guide"
              aria-label="Close Voice Guide"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Step Timeline Indicator */}
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Workflow Progress ({currentSectionIndex + 1} of {allSections.length})
              </span>
              <span className="text-xs font-mono font-bold text-[#0A192F]">
                {currentSection.label}
              </span>
            </div>

            {/* Step navigation pills */}
            <div className="grid grid-cols-9 gap-1 sm:gap-2">
              {allSections.map((sec, idx) => {
                const isActive = currentSectionIndex === idx;
                const isCompleted = currentSectionIndex > idx;
                return (
                  <button
                    key={sec.label}
                    onClick={() => jumpToSection(idx)}
                    className={`py-2 px-1 text-center transition-all rounded-sm border cursor-pointer ${
                      isActive
                        ? 'bg-[#0A192F] text-white border-[#CC0000] shadow-md font-bold'
                        : isCompleted
                        ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                    }`}
                    title={sec.title}
                  >
                    <div className="text-[10px] sm:text-xs font-mono uppercase truncate">
                      {sec.type === 'intro' ? 'Intro' : sec.type === 'conclusion' ? 'CTA' : `0${sec.stepNumber}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Display & Synchronized Narration Card */}
          <div className="bg-white border-l-4 border-l-[#CC0000] border-t border-r border-b border-slate-200 p-5 sm:p-6 rounded-sm shadow-md space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#CC0000] font-bold">
                  {currentSection.type === 'step' ? `Workflow Step ${currentSection.stepNumber}` : currentSection.label}
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#0A192F] mt-1">
                  {currentSection.title}
                </h3>
              </div>

              {isPlaying && (
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-red-50 text-[#CC0000] border border-red-200 rounded-sm text-xs font-mono font-bold animate-pulse">
                  <Radio className="w-4 h-4" />
                  <span>NARRATING</span>
                </div>
              )}
            </div>

            {/* Synchronised Transcript Display */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Approved Script Narration:</span>
                </span>
                <span>{elapsedSeconds}s / {totalSectionDuration}s</span>
              </div>
              <p className="text-base sm:text-lg text-slate-800 font-serif leading-relaxed italic">
                "{currentSection.text}"
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#CC0000] h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* If on Conclusion Step: Show Direct CTA */}
            {currentSection.type === 'conclusion' && (
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-3 rounded-sm border border-amber-200">
                <div className="flex items-center space-x-2 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-[#CC0000]" />
                  <span>Tel: <strong>071 415 6665</strong> (Mon–Sun 07:00–20:00)</span>
                </div>
                <button
                  onClick={() => {
                    handleClose();
                    setIsRequestModalOpen(true);
                  }}
                  className="w-full sm:w-auto bg-[#CC0000] hover:bg-[#A30000] text-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Request a Fire-Detection Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Audio Controller Bar */}
        <div className="bg-[#0A192F] border-t-2 border-slate-700 p-4 px-5 flex flex-wrap items-center justify-between gap-4 text-white">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-sm transition-colors cursor-pointer"
              title="Previous Step"
              aria-label="Previous Step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="px-5 py-2.5 bg-[#CC0000] hover:bg-[#A30000] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              aria-label={isPlaying ? 'Pause Narration' : 'Play Narration'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{elapsedSeconds > 0 ? 'Resume' : 'Play Narration'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentSectionIndex === allSections.length - 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-sm transition-colors cursor-pointer"
              title="Next Step"
              aria-label="Next Step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                stopPlayback();
                startSpeakingSection(currentSectionIndex);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-sm transition-colors cursor-pointer"
              title="Replay Current Section"
              aria-label="Replay Current Section"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Volume Controls */}
          <div className="flex items-center space-x-4">
            {/* Speed Selector */}
            <div className="flex items-center space-x-1 text-xs font-mono">
              <span className="text-slate-400 text-[11px] uppercase mr-1">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-[#CC0000] text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-300 hover:text-white cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#CC0000]"
                aria-label="Volume Slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
