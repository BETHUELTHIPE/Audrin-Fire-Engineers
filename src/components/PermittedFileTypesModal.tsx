import React, { useState } from 'react';
import {
  FileCheck,
  X,
  Shield,
  Layers,
  FileSpreadsheet,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PermittedFileTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermittedFileTypesModal: React.FC<PermittedFileTypesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { permittedFileTypes, updatePermittedFileType } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Supported Formats' },
    { id: 'cad', label: 'CAD & Engineering Drawings' },
    { id: 'office', label: 'Microsoft Office & Docs' },
    { id: 'pdf_text', label: 'PDF & Text Documents' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Inspection Videos' },
    { id: 'other', label: 'Technical Archives / Data' }
  ];

  const filteredTypes = permittedFileTypes.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.extension.toLowerCase().includes(q) ||
        t.displayName.toLowerCase().includes(q) ||
        t.previewEngine.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="modal-permitted-types" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Permitted Technical Document Formats & Security Registry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deny-by-default architecture • 50+ Whitelisted CAD, Office, PDF & Engineering Types
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

        {/* Search & Filter Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formats, extensions..."
              className="w-full text-xs rounded-lg pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3">Format / Extension</th>
                <th className="p-3">Category</th>
                <th className="p-3">Max Ingestion Size</th>
                <th className="p-3">Isolated Preview Engine</th>
                <th className="p-3 text-right">Whitelisted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTypes.map((item) => (
                <tr key={item.extension} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        .{item.extension.toUpperCase()}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 capitalize">
                    {item.category.replace('_', ' ')}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {item.maxSizeMb} MB
                  </td>
                  <td className="p-3 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                    {item.previewEngine}
                  </td>
                  <td className="p-3 text-right">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updatePermittedFileType(item.extension, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Executables (.exe, .bat, .sh, .msi, .scr, .vbs) are permanently denied at web server ingress.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
