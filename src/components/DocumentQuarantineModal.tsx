import React from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  Trash2,
  CheckCircle,
  FileX,
  Terminal,
  Clock,
  User,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../utils/fileTypes';

interface DocumentQuarantineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentQuarantineModal: React.FC<DocumentQuarantineModalProps> = ({
  isOpen,
  onClose
}) => {
  const { quarantinedFiles, handleQuarantineAction, showToast } = useApp();

  if (!isOpen) return null;

  return (
    <div id="modal-doc-quarantine" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-950 dark:text-red-200">
                Isolated Malware & Security Quarantine Vault
              </h2>
              <p className="text-xs text-red-700/80 dark:text-red-400/80">
                Celery Air-Gapped Sandbox Interceptions • Threat Intelligence • SANS & ISO 27001
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {quarantinedFiles.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Zero Quarantined Threat Payloads</h3>
              <p className="text-xs text-slate-500">All uploaded technical documents and CAD packages passed ClamAV and sandbox heuristics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Files in quarantine are isolated from all application servers, PostgreSQL databases, and customer storage tiers.
                </span>
              </div>

              {quarantinedFiles.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-red-200 dark:border-red-900/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <FileX className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {record.fileName}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          ({formatFileSize(record.fileSize)})
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      Threat: {record.threatType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Interception Reason:</strong> {record.reason}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono break-all">
                      SHA-256 Fingerprint: {record.fileHash}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Attempted by <strong>{record.attemptedBy}</strong> ({record.organisationName}) on {new Date(record.quarantinedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      Sandbox ID: {record.sandboxId}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          handleQuarantineAction(record.id, 'override_approved', 'Administrator verified manual safety inspection.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold transition"
                      >
                        Admin Override (Release)
                      </button>
                      <button
                        onClick={() => {
                          handleQuarantineAction(record.id, 'purged');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge File</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Close Vault Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
