import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, PhoneCall, Radio } from 'lucide-react';
import { EmergencyDispatchContactList } from './EmergencyDispatchContactList';
import { EMERGENCY_ESCALATION_DESK } from '../data/emergencyDispatchData';

interface EmergencyDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenServiceRequest?: () => void;
  preselectedSiteId?: string;
}

export const EmergencyDispatchModal: React.FC<EmergencyDispatchModalProps> = ({
  isOpen,
  onClose,
  onOpenServiceRequest,
  preselectedSiteId
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="emergency-dispatch-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420 }}
            className="relative w-full max-w-5xl bg-white dark:bg-[#0A192F] border-2 border-red-600 rounded-sm shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="bg-linear-to-r from-red-700 via-red-800 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-red-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xs bg-white text-red-600 flex items-center justify-center font-mono font-black shrink-0 shadow-xs animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                      Emergency On-Call Engineering Dispatch
                    </h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-xs bg-red-950 text-red-200 border border-red-500/50 text-[10px] font-mono font-bold uppercase">
                      SANS 10139 24/7 SLA
                    </span>
                  </div>
                  <p className="text-[11px] text-red-100 font-mono">
                    Direct Rapid Contact with Registered SAQCC Fire Alarm Engineers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${EMERGENCY_ESCALATION_DESK.hotlinePhone.replace(/\s+/g, '')}`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 hover:bg-red-50 rounded-xs font-mono font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Hotline: {EMERGENCY_ESCALATION_DESK.hotlineDisplay}</span>
                </a>

                <button
                  onClick={onClose}
                  id="btn-close-emergency-dispatch-modal"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xs transition-colors cursor-pointer"
                  aria-label="Close emergency dispatch modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
              <EmergencyDispatchContactList
                preselectedSiteId={preselectedSiteId}
                onOpenServiceRequest={() => {
                  onClose();
                  if (onOpenServiceRequest) onOpenServiceRequest();
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 dark:bg-slate-900 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
              <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                Statutory Escalation: Bethuel Moukangwe (071 415 6665) • Audrin Fire Engineers Command Desk
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-xs active:scale-95"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
