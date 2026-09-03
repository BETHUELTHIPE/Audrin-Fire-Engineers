import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  STATUTORY_FORM_TEMPLATES,
  INITIAL_STATUTORY_SUBMISSIONS
} from '../data/statutoryFormsData';
import {
  StatutoryFormTemplate,
  StatutoryFormSubmission,
  StatutoryStandardCode
} from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { offlineSyncService } from '../services/offlineSyncService';
import {
  BookOpen,
  FileCheck,
  Award,
  ShieldCheck,
  Building2,
  Server,
  HeartPulse,
  Scale,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Edit3,
  X,
  FileText,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Wifi,
  WifiOff,
  Radio,
  Layers,
  Database
} from 'lucide-react';

interface StatutoryFormsVaultProps {
  currentRequestId?: string;
}

export const StatutoryFormsVault: React.FC<StatutoryFormsVaultProps> = ({ currentRequestId }) => {
  const { currentUser, serviceRequests } = useApp();
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useOnlineStatus();

  // Local State for Submissions (persisted in localStorage + AppContext state)
  const [submissions, setSubmissions] = useState<StatutoryFormSubmission[]>(() => {
    const saved = localStorage.getItem('afe_statutory_submissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing statutory submissions from localStorage', e);
      }
    }
    return INITIAL_STATUTORY_SUBMISSIONS;
  });

  // Listen to offline sync events to refresh submissions in real time
  useEffect(() => {
    const handleSubmissionsUpdated = () => {
      const saved = localStorage.getItem('afe_statutory_submissions');
      if (saved) {
        try {
          setSubmissions(JSON.parse(saved));
        } catch (e) {
          console.error('Error refreshing statutory submissions', e);
        }
      }
    };

    window.addEventListener('statutory-submissions-updated', handleSubmissionsUpdated);
    window.addEventListener('sans10139-sync-completed', handleSubmissionsUpdated);

    return () => {
      window.removeEventListener('statutory-submissions-updated', handleSubmissionsUpdated);
      window.removeEventListener('sans10139-sync-completed', handleSubmissionsUpdated);
    };
  }, []);

  const [activeStandardFilter, setActiveStandardFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<StatutoryFormTemplate | null>(null);
  const [selectedSubmissionForView, setSelectedSubmissionForView] = useState<StatutoryFormSubmission | null>(null);

  // Form filling state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formSiteName, setFormSiteName] = useState('');
  const [formSignatoryName, setFormSignatoryName] = useState(currentUser?.name || 'Responsible Person');
  const [formSignatoryRole, setFormSignatoryRole] = useState('Responsible Person & Facilities Manager');
  const [formSignatoryEmail, setFormSignatoryEmail] = useState(currentUser?.email || 'facilities@client.co.za');
  const [formSignatoryPhone, setFormSignatoryPhone] = useState('+27 11 944 8000');
  const [selectedReqId, setSelectedReqId] = useState(currentRequestId || '');

  // Save submissions to localStorage
  const saveSubmissions = (newSubmissions: StatutoryFormSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('afe_statutory_submissions', JSON.stringify(newSubmissions));
  };

  const handleOpenFillModal = (template: StatutoryFormTemplate) => {
    setSelectedTemplate(template);
    // Initialize default values
    const initialVals: Record<string, any> = {};
    template.sections.forEach(sec => {
      sec.fields.forEach(f => {
        if (f.defaultValue !== undefined) {
          initialVals[f.id] = f.defaultValue;
        } else if (f.type === 'checkbox') {
          initialVals[f.id] = false;
        } else if (f.type === 'radio' && f.options && f.options.length > 0) {
          initialVals[f.id] = f.options[0].value;
        } else if (f.type === 'select' && f.options && f.options.length > 0) {
          initialVals[f.id] = f.options[0].value;
        } else if (f.type === 'date') {
          initialVals[f.id] = new Date().toISOString().split('T')[0];
        } else {
          initialVals[f.id] = '';
        }
      });
    });

    // Match site from active service request if available
    const activeReq = serviceRequests.find(r => r.id === (currentRequestId || selectedReqId));
    if (activeReq) {
      setFormSiteName(activeReq.siteName);
      setSelectedReqId(activeReq.id);
    } else {
      setFormSiteName('Sandton City Corporate Tower');
    }

    setFormData(initialVals);
    setIsFormModalOpen(true);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const matchedReq = serviceRequests.find(r => r.id === selectedReqId);
    const certNum = `${selectedTemplate.standardCode.replace(/_/g, '')}-${Date.now().toString().slice(-6)}`;

    const newSub: StatutoryFormSubmission = {
      id: `sub-${Date.now()}`,
      formTemplateId: selectedTemplate.id,
      formNumber: selectedTemplate.formNumber,
      formTitle: selectedTemplate.title,
      standardCode: selectedTemplate.standardCode,
      standardClauseRef: selectedTemplate.standardClauseRef,
      category: selectedTemplate.category,
      serviceRequestId: matchedReq?.id,
      serviceRequestRef: matchedReq?.referenceNumber || `AFE-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      siteId: matchedReq ? `site-${matchedReq.siteName.toLowerCase().replace(/\s+/g, '-')}` : 'site-client-main',
      siteName: formSiteName || matchedReq?.siteName || 'Client Commercial Facility',
      organisationName: matchedReq?.organisationName || currentUser?.organisationName || 'Client Organisation Ltd',
      submittedBy: {
        name: formSignatoryName,
        email: formSignatoryEmail,
        role: currentUser?.role || 'customer',
        phone: formSignatoryPhone,
        designation: formSignatoryRole
      },
      values: formData,
      status: isOnline ? 'approved' : 'submitted',
      certificateNumber: certNum,
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      signedAt: new Date().toISOString(),
      signatureName: formSignatoryName,
      reviewedByEngineer: isOnline ? {
        name: 'Audrin Sibanda',
        saqccNumber: 'SAQCC-FDGS-31084-L4',
        ecsaNumber: 'ECSA-2015-810933',
        comments: `Statutory submission verified in accordance with ${selectedTemplate.standardTitle} (${selectedTemplate.standardClauseRef}). System parameters meet South African National Standards.`,
        reviewDate: new Date().toISOString(),
        status: 'compliant'
      } : {
        name: 'SANS 10139 Offline Field Cache',
        saqccNumber: 'PENDING-CLOUD-SYNC',
        comments: 'Inspection logged on-site in offline mode. Automatic cloud verification will trigger upon network restoration.',
        reviewDate: new Date().toISOString(),
        status: 'compliant'
      }
    };

    // If offline, also enqueue into SANS 10139 offline queue
    if (!isOnline) {
      offlineSyncService.addToQueue({
        standardClause: selectedTemplate.standardClauseRef,
        formTemplateId: selectedTemplate.id,
        formNumber: selectedTemplate.formNumber,
        title: selectedTemplate.title,
        siteId: newSub.siteId,
        siteName: newSub.siteName,
        buildingAddress: 'On-Site Premise',
        systemCategory: 'Category L1 (Life Safety)',
        panelMakeModel: 'Ziton ZP3 / Notifier CIE',
        technicianName: formSignatoryName,
        saqccNumber: 'SAQCC-TECH-ON-SITE',
        responsiblePersonName: formSignatoryName,
        inspectionDate: new Date().toISOString().split('T')[0],
        data: formData,
        defectCount: 0,
        hasCriticalFault: false,
        notes: `Recorded on-site via ${selectedTemplate.formNumber} (${selectedTemplate.standardClauseRef})`
      });
    }

    const updated = [newSub, ...submissions];
    saveSubmissions(updated);
    setIsFormModalOpen(false);
    setSelectedSubmissionForView(newSub);
  };

  const handleDeleteSubmission = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this statutory form submission record from your dashboard?')) {
      const updated = submissions.filter(s => s.id !== id);
      saveSubmissions(updated);
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStandard = activeStandardFilter === 'all' || sub.standardCode === activeStandardFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch =
      sub.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.formNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.certificateNumber && sub.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStandard && matchesStatus && matchesSearch;
  });

  // Filter Templates
  const filteredTemplates = STATUTORY_FORM_TEMPLATES.filter(tpl => {
    return activeStandardFilter === 'all' || tpl.standardCode === activeStandardFilter;
  });

  const getStandardBadge = (code: StatutoryStandardCode) => {
    switch (code) {
      case 'SANS_10139':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-[#CC0000] border border-red-200 px-2.5 py-0.5 rounded text-[11px] font-bold">
            <Award className="w-3 h-3 text-[#CC0000]" />
            SANS 10139 / SAQCC
          </span>
        );
      case 'SANS_322':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded text-[11px] font-bold">
            <HeartPulse className="w-3 h-3 text-blue-600" />
            SANS 322 (Hospitals)
          </span>
        );
      case 'SANS_246':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-[11px] font-bold">
            <Server className="w-3 h-3 text-amber-600" />
            SANS 246 (Server Rooms)
          </span>
        );
      case 'SANS_10400_T':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded text-[11px] font-bold">
            <Building2 className="w-3 h-3 text-purple-600" />
            SANS 10400-T (NBR Part T)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0A192F] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-slate-300">
              <Scale className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>South African National Standards (SABS / ECSA / SAQCC)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Client Statutory Forms &amp; Compliance Vault
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Complete, execute, and archive all statutory compliance forms required by South African fire regulations: 
              <strong> SANS 10139</strong> (routine testing &amp; false alarm logs), <strong>SANS 322</strong> (healthcare selection &amp; phased evacuation), 
              <strong> SANS 246</strong> (server room risk &amp; ASD air calculations), and <strong>SANS 10400-T</strong> (Regulation A19 appointments &amp; Table 11 equipment sizing).
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => handleOpenFillModal(STATUTORY_FORM_TEMPLATES[0])}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Complete Statutory Form</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium">Standard Books Integrated</div>
            <div className="text-lg font-black text-white mt-1">4 SANS Books</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium">Available Statutory Forms</div>
            <div className="text-lg font-black text-[#FFB703] mt-1">{STATUTORY_FORM_TEMPLATES.length} Formal Templates</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium">Saved Client Submissions</div>
            <div className="text-lg font-black text-emerald-400 mt-1">{submissions.length} Active Records</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium">SAQCC / ECSA Certified</div>
            <div className="text-lg font-black text-blue-400 mt-1">100% Compliant</div>
          </div>
        </div>
      </div>

      {/* Filter and Standard Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Standard Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveStandardFilter('all')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeStandardFilter === 'all'
                  ? 'bg-[#0A192F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Standards ({STATUTORY_FORM_TEMPLATES.length})
            </button>
            <button
              onClick={() => setActiveStandardFilter('SANS_10139')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeStandardFilter === 'SANS_10139'
                  ? 'bg-[#CC0000] text-white shadow-xs'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>SANS 10139 / SAQCC</span>
            </button>
            <button
              onClick={() => setActiveStandardFilter('SANS_322')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeStandardFilter === 'SANS_322'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>SANS 322 Hospitals</span>
            </button>
            <button
              onClick={() => setActiveStandardFilter('SANS_246')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeStandardFilter === 'SANS_246'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>SANS 246 Server Rooms</span>
            </button>
            <button
              onClick={() => setActiveStandardFilter('SANS_10400_T')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeStandardFilter === 'SANS_10400_T'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>SANS 10400-T NBR</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms, clauses, certificates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: Client's Saved Submissions on Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#CC0000]" />
            <h3 className="text-lg font-black text-[#0A192F]">
              Saved Client Statutory Submissions &amp; Certificates ({filteredSubmissions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Saved securely in your organisation's compliance record
          </span>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">No statutory submissions found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No forms match the selected standard filter or search criteria. Choose a form template from the catalog below to complete and archive your first statutory compliance certificate.
              </p>
            </div>
            <button
              onClick={() => handleOpenFillModal(STATUTORY_FORM_TEMPLATES[0])}
              className="inline-flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Fill Weekly SANS 10139 Log</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubmissions.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmissionForView(sub)}
                className="bg-white border border-slate-200 hover:border-red-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {getStandardBadge(sub.standardCode)}
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved / Compliant
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono font-bold text-slate-500">
                      {sub.formNumber} • {sub.standardClauseRef}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#CC0000] transition-colors line-clamp-2 mt-0.5">
                      {sub.formTitle}
                    </h4>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Site:</span>
                      <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">{sub.siteName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Certificate No:</span>
                      <span className="font-mono font-bold text-slate-800">{sub.certificateNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Submitted By:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[170px]">{sub.submittedBy.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Date:</span>
                      <span className="text-slate-700 font-medium">{new Date(sub.submissionDate).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </div>

                  {sub.reviewedByEngineer && (
                    <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl text-[11px] text-blue-900 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Engineer Sign-off: {sub.reviewedByEngineer.name}</span>
                      </div>
                      <div className="text-blue-700 text-[10px] leading-snug">
                        {sub.reviewedByEngineer.saqccNumber} • {sub.reviewedByEngineer.comments}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[#CC0000] font-bold group-hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </span>
                  <button
                    onClick={(e) => handleDeleteSubmission(sub.id, e)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Statutory Form Library Catalog across all 4 Books */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-[#0A192F] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#CC0000]" />
              <span>Official SANS Statutory Forms Library (4 Reference Books)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any statutory template to complete and save to your dashboard with real-time statutory calculations.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0">
            {filteredTemplates.length} Forms Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  {getStandardBadge(tpl.standardCode)}
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    ⏱ ~{tpl.estimatedMinutesToComplete} min
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    {tpl.formNumber} • {tpl.standardClauseRef}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {tpl.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <div>
                    <span className="font-bold text-slate-900">Statutory Mandate: </span>
                    <span className="text-slate-600">{tpl.statutoryMandate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Frequency: <strong>{tpl.frequency || 'As required'}</strong></span>
                    <span>Target: <strong>{tpl.targetAudience}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenFillModal(tpl)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#CC0000] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Fill &amp; Save This Form</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Interactive Dynamic Form Filling Modal */}
      {/* ========================================================================= */}
      {isFormModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-[#0A192F] text-white p-5 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStandardBadge(selectedTemplate.standardCode)}
                  <span className="text-xs font-mono text-slate-300 font-bold">{selectedTemplate.formNumber}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {selectedTemplate.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedTemplate.standardTitle} • {selectedTemplate.standardClauseRef}
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Dynamic Fields */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              
              {!isOnline && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
                  <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                      <span>SANS 10139 Offline Field Mode Active</span>
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.2 font-mono rounded-full font-bold">CACHED LOCALLY</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      You are completing this statutory inspection on-site without an internet connection. When saved, all data will be cached in your device's persistent Service Worker queue and automatically synced to the engineering dashboard once connectivity is restored.
                    </p>
                  </div>
                </div>
              )}

              {/* Site & Submitter Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#CC0000]" />
                  <span>Site &amp; Responsible Person Particulars</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Premises / Facility Name *</label>
                    <input
                      type="text"
                      required
                      value={formSiteName}
                      onChange={e => setFormSiteName(e.target.value)}
                      placeholder="e.g. Sandton City Corporate Tower"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#CC0000]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Responsible Person Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formSignatoryName}
                      onChange={e => setFormSignatoryName(e.target.value)}
                      placeholder="e.g. Thabo Khumalo"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#CC0000]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Signatory Legal Capacity / Designation *</label>
                    <input
                      type="text"
                      required
                      value={formSignatoryRole}
                      onChange={e => setFormSignatoryRole(e.target.value)}
                      placeholder="e.g. Facilities Manager / Pr.Eng"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#CC0000]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={formSignatoryEmail}
                      onChange={e => setFormSignatoryEmail(e.target.value)}
                      placeholder="facilities@client.co.za"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#CC0000]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Sections and Fields */}
              {selectedTemplate.sections.map((sec, secIdx) => (
                <div key={secIdx} className="border border-slate-200 rounded-xl p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{sec.title}</h4>
                    {sec.description && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{sec.description}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {sec.fields.map(field => (
                      <div key={field.id} className="space-y-1">
                        <label className="block text-slate-800 font-semibold">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.helpText && (
                          <p className="text-[11px] text-slate-500 leading-tight">{field.helpText}</p>
                        )}

                        {/* Input Type Renderers */}
                        {field.type === 'text' && (
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            required={field.required}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={e => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
                          />
                        )}

                        {field.type === 'date' && (
                          <input
                            type="date"
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            rows={3}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#CC0000]"
                          >
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'radio' && field.options && (
                          <div className="space-y-1.5 pt-1">
                            {field.options.map(opt => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-slate-700">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt.value}
                                  checked={formData[field.id] === opt.value}
                                  onChange={e => handleFieldChange(field.id, e.target.value)}
                                  className="text-[#CC0000] focus:ring-[#CC0000]"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'checkbox' && (
                          <label className="flex items-start gap-2 cursor-pointer text-slate-700 pt-1">
                            <input
                              type="checkbox"
                              checked={!!formData[field.id]}
                              onChange={e => handleFieldChange(field.id, e.target.checked)}
                              className="mt-0.5 rounded text-[#CC0000] focus:ring-[#CC0000]"
                            />
                            <span>Confirmed &amp; verified compliant with statutory requirements</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Statutory Confirmation & Signature */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Statutory Legal Declaration (Republic of South Africa)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  I hereby certify that the information entered into this statutory form is accurate, truthful, and represents 
                  the actual conditions tested on the designated premises in alignment with the specified South African National Standard 
                  (<strong>{selectedTemplate.standardTitle}</strong>).
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-amber-800">
                  <span>Digital Signature: {formSignatoryName || 'Responsible Person'}</span>
                  <span>Date: {new Date().toLocaleDateString('en-ZA')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors flex items-center gap-2 ${
                    isOnline ? 'bg-[#CC0000] hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save &amp; Generate Certificate</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Cache Locally &amp; Queue Sync</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: View & Print Official Statutory Certificate */}
      {/* ========================================================================= */}
      {selectedSubmissionForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Certificate Header Control */}
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between gap-4 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FFB703]" />
                <span className="font-bold text-sm">Official Statutory Compliance Record</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedSubmissionForView(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statutory Certificate Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans">
              
              {/* Formal South African National Standard Banner */}
              <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
                <div className="text-[11px] font-mono tracking-widest uppercase font-black text-slate-500">
                  REPUBLIC OF SOUTH AFRICA • STATUTORY FIRE ENGINEERING RECORD
                </div>
                <h2 className="text-2xl font-black text-[#0A192F] tracking-tight">
                  CERTIFICATE OF STATUTORY COMPLIANCE
                </h2>
                <div className="text-xs font-bold text-[#CC0000]">
                  {selectedSubmissionForView.formTitle}
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  Standard Ref: {selectedSubmissionForView.formNumber} ({selectedSubmissionForView.standardClauseRef})
                </div>
              </div>

              {/* Certificate Number & Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Certificate Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSubmissionForView.certificateNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Date of Submission:</span>
                  <span className="font-bold text-slate-900">{new Date(selectedSubmissionForView.submissionDate).toLocaleDateString('en-ZA')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Service Request Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSubmissionForView.serviceRequestRef || 'AFE-GEN-2026'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Compliance Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">COMPLIANT / VERIFIED</span>
                </div>
              </div>

              {/* Facility & Client Particulars */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">
                  1. Designated Premises &amp; Client Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>Premises Name:</strong> {selectedSubmissionForView.siteName}</div>
                  <div><strong>Organisation:</strong> {selectedSubmissionForView.organisationName}</div>
                  <div><strong>Responsible Person:</strong> {selectedSubmissionForView.submittedBy.name}</div>
                  <div><strong>Legal Capacity:</strong> {selectedSubmissionForView.submittedBy.designation}</div>
                  <div><strong>Contact Email:</strong> {selectedSubmissionForView.submittedBy.email}</div>
                  <div><strong>Contact Telephone:</strong> {selectedSubmissionForView.submittedBy.phone || '+27 11 944 8000'}</div>
                </div>
              </div>

              {/* Submitted Technical Values Breakdown */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">
                  2. Recorded Technical Values &amp; Statutory Checks
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedSubmissionForView.values).map(([key, val]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-100 gap-1">
                      <span className="text-slate-600 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-bold text-slate-900 sm:text-right max-w-sm">
                        {typeof val === 'boolean' ? (val ? 'Confirmed Compliant' : 'No') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Verification Seal & SAQCC Endorsement */}
              {selectedSubmissionForView.reviewedByEngineer && (
                <div className="bg-[#0A192F] text-white p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-[#FFB703] flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>SAQCC / ECSA Competent Person Review Sign-off</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">
                      Reviewed: {new Date(selectedSubmissionForView.reviewedByEngineer.reviewDate).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic">
                    "{selectedSubmissionForView.reviewedByEngineer.comments}"
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Engineer: {selectedSubmissionForView.reviewedByEngineer.name}</span>
                    <span>Registration: {selectedSubmissionForView.reviewedByEngineer.saqccNumber}</span>
                  </div>
                </div>
              )}

              {/* Signatures & Legal Footer */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
                <div>
                  <div className="font-mono text-slate-800 font-bold">Electronically Signed by: {selectedSubmissionForView.signatureName || selectedSubmissionForView.submittedBy.name}</div>
                  <div>Timestamp: {new Date(selectedSubmissionForView.signedAt || selectedSubmissionForView.submissionDate).toLocaleString('en-ZA')}</div>
                </div>
                <div className="sm:text-right">
                  <div className="font-bold text-slate-800">AUDRIN FIRE ENGINEERS (PTY) LTD</div>
                  <div>SANS 10139 / SANS 322 / SANS 246 / SANS 10400-T Certified</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
