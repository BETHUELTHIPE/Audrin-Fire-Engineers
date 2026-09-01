import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GalleryItem } from '../types';
import {
  Camera,
  Layers,
  CheckCircle2,
  X,
  ZoomIn,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { galleryItems } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'Control Panels', label: 'Control Panels' },
    { id: 'Detectors', label: 'Detection Sensors' },
    { id: 'Audio-Visual & Sounders', label: 'Sounders & Beacons' },
    { id: 'Call Points', label: 'Manual Call Points' },
    { id: 'Aspirating & Specialized', label: 'Aspirating (VESDA)' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
              <Camera className="w-4 h-4 text-red-500" />
              <span>Commercial Hardware & Installation Standards</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Fire-Detection Equipment Gallery
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Examine the commercial-grade control panels, multi-sensor optical detectors, beam transmitters, sounder-beacons, and aspirating smoke detection units deployed across our client installations.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              {/* Image Container */}
              <div
                onClick={() => setActiveModalItem(item)}
                className="relative aspect-video overflow-hidden bg-slate-100 cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-full shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              {/* Description */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {item.caption}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hardware Classification</span>
                  <span className="font-semibold text-slate-600">SANS 10139 Aligned</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-800">
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {activeModalItem.category}
                </span>
                <span className="text-xs text-slate-400">Commercial Standard Hardware</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {activeModalItem.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeModalItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
