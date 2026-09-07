import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          };

          const bgColors = {
            success: 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40',
            error: 'bg-slate-900/95 border-red-500/40 text-slate-100 shadow-red-950/40',
            warning: 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/40',
            info: 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/40'
          };

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.94, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 40, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-xs">
                <div className="font-bold text-sm text-white mb-0.5">{toast.title}</div>
                <div className="text-slate-300 leading-relaxed">{toast.description}</div>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
