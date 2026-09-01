import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, X, Check, Copy, Shield, Calendar, Send } from 'lucide-react';

export const EmailPreviewModal: React.FC = () => {
  const { previewEmailLog, setPreviewEmailLog, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'html' | 'plain'>('html');
  const [copied, setCopied] = useState(false);

  if (!previewEmailLog) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewEmailLog.plainTextBody);
    setCopied(true);
    showToast('info', 'Copied to Clipboard', 'Plain-text email contents copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Automated Client Email Dispatch Record</h3>
              <p className="text-xs text-slate-400">Ref: {previewEmailLog.relatedReferenceNumber} • Category: {previewEmailLog.category}</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewEmailLog(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Header Info */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium">To:</span> <strong className="text-slate-900">{previewEmailLog.recipient}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {previewEmailLog.deliveryStatus}
              </span>
              <span className="text-slate-400">
                Attempts: {previewEmailLog.sendAttemptCount}
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Subject:</span> <span className="font-semibold text-slate-900">{previewEmailLog.subject}</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'html' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Responsive HTML Preview
            </button>
            <button
              onClick={() => setActiveTab('plain')}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'plain' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Raw Plain-Text
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium pb-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Content'}</span>
          </button>
        </div>

        {/* Email Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {activeTab === 'html' ? (
            <div
              className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
              dangerouslySetInnerHTML={{ __html: previewEmailLog.htmlBody }}
            />
          ) : (
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {previewEmailLog.plainTextBody}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-red-600" />
            <span>Audrin Fire Engineers Celery Worker Task Record</span>
          </div>
          <button
            onClick={() => setPreviewEmailLog(null)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
