import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  ChevronRight,
  FilePlus,
  ShieldCheck,
  Wrench,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, setActiveView, setSelectedServiceSlug, setIsRequestModalOpen, setPreselectedServiceForModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Services (18)' },
    { id: 'Design & Surveys', label: 'Design & Surveys' },
    { id: 'Installation & Fit-Out', label: 'Installation & Fit-Out' },
    { id: 'Commissioning & Acceptance', label: 'Commissioning & Acceptance' },
    { id: 'Maintenance & Testing', label: 'Maintenance & Testing' },
    { id: 'Faults & Diagnostics', label: 'Faults & Diagnostics' },
    { id: 'Documentation & Training', label: 'Documentation & Training' }
  ];

  const filteredServices = (services || []).filter((srv) => {
    const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory;
    const scopeList = srv.scopeOfWork || (srv as any).scopePoints || [];
    const sansRef = srv.sansReference || 'SANS 10139';
    const matchesSearch =
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      sansRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scopeList.some(pt => pt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleServiceClick = (slug: string) => {
    setSelectedServiceSlug(slug);
    setActiveView('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestService = (slug: string) => {
    setPreselectedServiceForModal(slug);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* Services Header */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>SANS 10139 Compliant Commercial Fire Detection</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Fire-Detection Services Catalogue
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore our complete suite of 18 specialized fire-alarm engineering capabilities across design, installation, commissioning, maintenance, fault diagnosis, and documentation.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, SANS clauses, hardware..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Results Count */}
            <div className="text-xs text-slate-500 font-medium self-end md:self-center">
              Showing <strong>{filteredServices.length}</strong> of {services.length} services
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No matching services found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or resetting the category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-2 text-xs font-bold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => {
              const scopeList = srv.scopeOfWork || (srv as any).scopePoints || [];
              return (
                <div
                  key={srv.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded">
                        {srv.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {srv.sansReference || 'SANS 10139'}
                      </span>
                    </div>

                    <h3
                      onClick={() => handleServiceClick(srv.slug)}
                      className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition-colors cursor-pointer mb-2"
                    >
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {srv.shortDescription}
                    </p>

                    {/* Scope List */}
                    <div className="space-y-1.5 mb-6 text-xs text-slate-700">
                      {scopeList.slice(0, 3).map((pt, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleServiceClick(srv.slug)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1"
                  >
                    <span>View Scope Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRequestService(srv.slug)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Request Scope
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

    </div>
  );
};
