import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FilePlus,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  Wrench,
  Paperclip,
  MessageSquare,
  ChevronRight,
  Send,
  Upload,
  FileText,
  User,
  Shield,
  AlertTriangle,
  Video,
  Play,
  BookmarkPlus,
  ShieldCheck,
  Lock,
  ExternalLink,
  Camera,
  ShieldAlert,
  Layers,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Download,
  Eye,
  Filter,
  Plus
} from 'lucide-react';
import { ServiceRequest, RequestStatus, RequestAttachment } from '../types';
import { DocumentUploadZone } from '../components/DocumentUploadZone';
import { DocumentEvidenceVault } from '../components/DocumentEvidenceVault';
import { getFileTypeMeta, formatFileSize } from '../utils/fileTypes';

export const CustomerPortalView: React.FC = () => {
  const {
    currentUser,
    serviceRequests,
    selectedRequestId,
    setSelectedRequestId,
    setIsRequestModalOpen,
    addCustomerMessage,
    addRequestAttachment,
    serviceVideos,
    setIsUploadVideoModalOpen,
    setSelectedVideoForDetail,
    setPreselectedRequestIdForVideo,
    conditionReports,
    setSelectedReportForDetail,
    setIsSubmitBeforeWorkModalOpen,
    setIsSubmitPostWorkModalOpen,
    setPreselectedRequestIdForReport,
    technicalDocuments,
    setIsUploadDocModalOpen,
    setPreselectedRequestIdForDoc
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'reports' | 'videos' | 'messages' | 'documents' | 'visits'>('reports');
  const [videoStatusFilter, setVideoStatusFilter] = useState<string>('all');
  const [newMessageText, setNewMessageText] = useState('');

  // Filter requests for the current customer or display all demo customer requests
  const userRequests = serviceRequests.filter(req => {
    const matchesUser = currentUser?.role === 'customer'
      ? (req.customerId === currentUser.id || req.email.toLowerCase() === currentUser.email.toLowerCase() || req.organisationName === currentUser.organisationName)
      : true; // Admins / Staff see all in simulator

    const matchesSearch =
      req.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesUser && matchesSearch && matchesStatus;
  });

  const activeRequest: ServiceRequest | undefined = selectedRequestId
    ? serviceRequests.find(r => r.id === selectedRequestId || r.referenceNumber === selectedRequestId)
    : userRequests[0];

  // Filter videos for the active service request (or all customer videos)
  const activeRequestVideos = serviceVideos.filter(v => {
    const matchesReq = activeRequest ? (v.serviceRequestId === activeRequest.id || v.serviceRequestRef === activeRequest.referenceNumber) : true;
    const matchesCustomer = currentUser?.role === 'customer' ? v.isCustomerVisible : true;
    const matchesStatus = videoStatusFilter === 'all' ? true : v.reviewStatus === videoStatusFilter;
    return matchesReq && matchesCustomer && matchesStatus;
  });

  // Technical documents count for active request
  const activeRequestTechnicalDocs = technicalDocuments.filter(d => {
    const matchesReq = activeRequest ? (d.serviceRequestId === activeRequest.id || d.serviceRequestRef === activeRequest.referenceNumber) : true;
    const matchesCustomer = currentUser?.role === 'customer' ? d.isCustomerVisible : true;
    return matchesReq && matchesCustomer;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !newMessageText.trim()) return;
    addCustomerMessage(activeRequest.id, newMessageText.trim());
    setNewMessageText('');
  };

  const handleOpenUploadDoc = () => {
    if (activeRequest) {
      setPreselectedRequestIdForDoc(activeRequest.id);
    }
    setIsUploadDocModalOpen(true);
  };

  const handleOpenUploadVideo = () => {
    if (activeRequest) {
      setPreselectedRequestIdForVideo(activeRequest.id);
    }
    setIsUploadVideoModalOpen(true);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Site survey scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quotation issued':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Work in progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Portal Header */}
      <section className="bg-[#0A192F] text-white py-10 sm:py-12 border-b-4 border-[#CC0000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-mono text-slate-200 font-bold mb-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#CC0000]" />
                <span>Audrin Client Portal • SANS 10139 Request Tracking</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                Customer Service Portal
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-mono">
                Authenticated Account: <strong className="text-white">{currentUser?.fullName || 'Client User'}</strong> ({currentUser?.organisationName || 'Client Organisation'})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleOpenUploadDoc}
                className="inline-flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Upload Document / CAD</span>
              </button>

              <button
                onClick={() => {
                  if (activeRequest) {
                    setPreselectedRequestIdForReport(activeRequest.id);
                  }
                  setIsSubmitBeforeWorkModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Pre-Work Report</span>
              </button>

              <button
                onClick={() => {
                  if (activeRequest) {
                    setPreselectedRequestIdForReport(activeRequest.id);
                  }
                  setIsSubmitPostWorkModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Post-Work Report</span>
              </button>

              <button
                onClick={handleOpenUploadVideo}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#CC0000]" />
                <span>Video Evidence</span>
              </button>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A30000] text-white px-4 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>New Request</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Portal Dashboard Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Requests List & Search */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search & Filter Header */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ref, site name, service..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-slate-200 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono pb-1 no-scrollbar">
                {['all', 'Submitted', 'Under review', 'Site survey scheduled', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#0A192F] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Cards List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {userRequests.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-sm p-6">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-700 font-mono uppercase">No matching requests</p>
                  <p className="text-xs text-slate-500 mt-1">Submit a new service request to track progress here.</p>
                </div>
              ) : (
                userRequests.map((req) => {
                  const isSelected = activeRequest?.id === req.id;
                  const reqVideosCount = serviceVideos.filter(v => v.serviceRequestId === req.id || v.serviceRequestRef === req.referenceNumber).length;
                  const reqDocsCount = technicalDocuments.filter(d => (d.serviceRequestId === req.id || d.serviceRequestRef === req.referenceNumber) && (currentUser?.role === 'customer' ? d.isCustomerVisible : true)).length;

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-4 rounded-sm border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-l-4 border-l-[#CC0000] border-t-2 border-r-2 border-b-2 border-[#0A192F] shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs text-[#0A192F]">
                          {req.referenceNumber}
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-[#0A192F] mb-1 uppercase line-clamp-1">
                        {req.siteName}
                      </h4>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                        {req.serviceTitle}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          {reqDocsCount > 0 && (
                            <span className="flex items-center gap-1 text-cyan-700 font-bold">
                              <Layers className="w-3 h-3" />
                              <span>{reqDocsCount} doc{reqDocsCount > 1 ? 's' : ''}</span>
                            </span>
                          )}
                          {reqVideosCount > 0 && (
                            <span className="flex items-center gap-1 text-[#CC0000] font-bold">
                              <Video className="w-3 h-3" />
                              <span>{reqVideosCount}</span>
                            </span>
                          )}
                          <span className="text-[#0A192F] font-bold flex items-center gap-0.5">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Selected Request Details & Interactive Tabs */}
          <div className="lg:col-span-7">
            {activeRequest ? (
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                
                {/* Detail Header */}
                <div className="bg-[#0A192F] text-white p-6 space-y-4 border-b-2 border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-black text-sm bg-white/10 px-3 py-1 rounded-sm text-red-400 border border-white/10">
                      {activeRequest.referenceNumber}
                    </span>
                    <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-sm border ${getStatusColor(activeRequest.status)}`}>
                      {activeRequest.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black uppercase text-white mb-1">
                      {activeRequest.siteName}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono">
                      {activeRequest.streetAddress}, {activeRequest.city} • Building: {activeRequest.buildingType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Service Scope:</span>
                      <strong className="text-white text-xs truncate block font-sans">{activeRequest.serviceTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Assigned Engineer:</span>
                      <strong className="text-white text-xs">{activeRequest.assignedStaff || 'Operations Desk'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Urgency:</span>
                      <strong className={activeRequest.urgency === 'urgent_emergency' ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {activeRequest.urgency === 'urgent_emergency' ? 'Critical Emergency' : 'Standard'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 px-4 bg-slate-50 text-xs font-mono font-bold overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'reports'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Condition Reports ({conditionReports.filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber).length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'documents'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Documents &amp; CAD Vault ({activeRequestTechnicalDocs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'videos'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Evidence ({activeRequestVideos.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'timeline'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timeline ({activeRequest.statusHistory.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'messages'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Messages ({activeRequest.customerMessages.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('visits')}
                    className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'visits'
                        ? 'border-[#CC0000] text-[#CC0000]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Visits ({activeRequest.siteVisits.length})
                  </button>
                </div>

                {/* Tab Content Panes */}
                <div className="p-6 text-xs flex-1 min-h-[350px]">
                  
                  {/* TAB 0: Condition Reports (Pre-Work & Post-Work) */}
                  {activeTab === 'reports' && (
                    <div className="space-y-5">
                      {/* Top Action Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-sm">
                        <div>
                          <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs">
                            Automated Photographic Condition Reports
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Standardised Pre-Work and Post-Work condition records based on submitted site evidence.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPreselectedRequestIdForReport(activeRequest.id);
                              setIsSubmitBeforeWorkModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>+ Pre-Work</span>
                          </button>

                          <button
                            onClick={() => {
                              setPreselectedRequestIdForReport(activeRequest.id);
                              setIsSubmitPostWorkModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>+ Post-Work</span>
                          </button>
                        </div>
                      </div>

                      {/* Disclaimer banner */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-sm flex items-start gap-2.5 text-amber-900 font-mono text-[11px]">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="italic">
                          "This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records visible condition shown in evidence and does not replace a physical site inspection or statutory SANS compliance certificate."
                        </p>
                      </div>

                      {/* Reports List */}
                      {conditionReports.filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber).length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-3">
                          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                          <div>
                            <p className="font-mono font-bold text-slate-700 text-sm">No Condition Reports Generated Yet</p>
                            <p className="text-xs text-slate-500 mt-1 font-sans">
                              Submit before-work photographs to generate an automated Pre-Work Condition Report and trigger client delivery.
                            </p>
                          </div>
                          <div className="flex justify-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setPreselectedRequestIdForReport(activeRequest.id);
                                setIsSubmitBeforeWorkModalOpen(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase px-4 py-2 rounded-sm cursor-pointer"
                            >
                              Submit Before-Work Photos
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conditionReports
                            .filter(r => r.serviceRequestId === activeRequest.id || r.serviceRequestRef === activeRequest.referenceNumber)
                            .map((report) => (
                              <div
                                key={report.id}
                                className="p-4 rounded-sm border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm ${
                                      report.reportType === 'pre_work'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    }`}>
                                      {report.reportType === 'pre_work' ? 'Pre-Work Condition Report' : 'Post-Work Condition Report'}
                                    </span>
                                    <span className="font-mono font-black text-xs text-[#0A192F]">
                                      {report.referenceNumber}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                      v{report.currentVersionNumber.toFixed(1)}
                                    </span>
                                  </div>

                                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm capitalize ${
                                    report.status === 'acknowledged_by_client'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : report.status === 'more_info_required'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {report.status.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Generated:</span>
                                    <span>{new Date(report.generatedAt).toLocaleDateString('en-ZA')}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Photographic Evidence:</span>
                                    <span className="font-bold text-slate-800">{report.currentVersion.snapshot.photos.length} photos</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase">Equipment Ref:</span>
                                    <span className="truncate block">{report.equipmentReference}</span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-700 font-sans line-clamp-2 bg-slate-50 p-2 rounded-sm border border-slate-100">
                                  {report.reportSummary}
                                </p>

                                {/* Photo thumbnails preview */}
                                <div className="flex items-center gap-2 overflow-x-auto py-1">
                                  {report.currentVersion.snapshot.photos.slice(0, 4).map((p) => (
                                    <img
                                      key={p.id}
                                      src={p.photoUrl}
                                      alt={p.caption}
                                      className="w-14 h-10 object-cover rounded-sm border border-slate-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                  {report.currentVersion.snapshot.photos.length > 4 && (
                                    <div className="w-14 h-10 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center font-mono text-[10px] text-slate-600 font-bold">
                                      +{report.currentVersion.snapshot.photos.length - 4} more
                                    </div>
                                  )}
                                </div>

                                {/* Footer actions */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Emailed to: {report.clientEmail}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedReportForDetail(report)}
                                      className="px-3 py-1 bg-[#0A192F] hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase rounded-sm flex items-center gap-1 cursor-pointer"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>View Report &amp; PDF</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Technical Documents & CAD Vault */}
                  {activeTab === 'documents' && (
                    <div className="space-y-4">
                      <DocumentEvidenceVault filterByRequestId={activeRequest.id} readOnlyCustomerMode={currentUser?.role === 'customer'} />
                    </div>
                  )}

                  {/* TAB 1: Status Timeline */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-6">
                      <div className="border-l-2 border-slate-200 pl-4 space-y-6 ml-2">
                        {activeRequest.statusHistory.map((item, idx) => (
                          <div key={item.id} className="relative space-y-1">
                            <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-sm bg-[#CC0000] border-2 border-white"></div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-[#0A192F] font-mono">{item.status}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{item.notes}</p>
                            <span className="text-[10px] text-slate-400 font-mono block">Logged by: {item.changedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Video Evidence Gallery */}
                  {activeTab === 'videos' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-sm">
                        <div>
                          <h4 className="font-mono font-bold uppercase text-[#0A192F] text-xs">
                            During-Work Video Evidence
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Technical recordings of sensor testing, cabling, and panel status
                          </p>
                        </div>

                        <button
                          onClick={handleOpenUploadVideo}
                          className="px-3.5 py-2 bg-[#CC0000] hover:bg-[#A30000] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Upload Video</span>
                        </button>
                      </div>

                      {/* Video Status Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                        {[
                          { id: 'all', label: 'All Evidence' },
                          { id: 'awaiting_review', label: 'Awaiting Review' },
                          { id: 'approved', label: 'Approved' },
                          { id: 'included_in_report', label: 'In SANS Report' }
                        ].map((flt) => (
                          <button
                            key={flt.id}
                            onClick={() => setVideoStatusFilter(flt.id)}
                            className={`px-2.5 py-1 rounded-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              videoStatusFilter === flt.id
                                ? 'bg-[#0A192F] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {flt.label}
                          </button>
                        ))}
                      </div>

                      {/* Video Cards Grid */}
                      {activeRequestVideos.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-3">
                          <Video className="w-10 h-10 text-slate-400 mx-auto" />
                          <div>
                            <p className="font-mono font-bold text-slate-700 text-sm">No Video Evidence Uploaded</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Technicians and authorized facility managers can upload site recordings for technical review.
                            </p>
                          </div>
                          <button
                            onClick={handleOpenUploadVideo}
                            className="inline-block bg-[#0A192F] text-white text-xs font-mono font-bold uppercase px-4 py-2 rounded-sm cursor-pointer hover:bg-slate-800"
                          >
                            Upload First Video
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeRequestVideos.map((vid) => (
                            <div
                              key={vid.id}
                              onClick={() => setSelectedVideoForDetail(vid)}
                              className="bg-white border border-slate-200 hover:border-[#CC0000] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
                            >
                              {/* Video Thumbnail with duration and play button */}
                              <div className="relative aspect-video bg-black overflow-hidden">
                                <img
                                  src={vid.thumbnailUrl}
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-[#CC0000]/90 group-hover:bg-[#CC0000] text-white flex items-center justify-center rounded-sm shadow-md transition-transform group-hover:scale-110">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>

                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
                                  {vid.duration}s
                                </span>

                                <span className="absolute top-2 left-2 bg-[#0A192F]/90 text-white text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm">
                                  {vid.category.replace(/_/g, ' ')}
                                </span>
                              </div>

                              {/* Video Meta Body */}
                              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {vid.referenceNumber}
                                    </span>
                                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                                      vid.reviewStatus === 'approved' || vid.reviewStatus === 'included_in_report'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : vid.reviewStatus === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {vid.customerVisibleStatus}
                                    </span>
                                  </div>

                                  <h5 className="font-bold text-xs text-[#0A192F] line-clamp-1 uppercase">
                                    {vid.title}
                                  </h5>

                                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                                    {vid.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <BookmarkPlus className="w-3 h-3 text-[#CC0000]" />
                                    <span>{vid.timestampMarkers.length} Markers</span>
                                  </span>

                                  {vid.includedInReport && (
                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>In Report</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Messages Thread */}
                  {activeTab === 'messages' && (
                    <div className="space-y-4 flex flex-col h-full justify-between">
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {activeRequest.customerMessages.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p>No messages yet. Send a direct query to your assigned fire engineer.</p>
                          </div>
                        ) : (
                          activeRequest.customerMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3.5 rounded-sm text-xs space-y-1 ${
                                msg.senderRole === 'customer'
                                  ? 'bg-red-50 text-slate-800 border border-red-200 ml-6 border-l-4 border-l-[#CC0000]'
                                  : 'bg-slate-100 text-slate-800 mr-6 border border-slate-200 border-l-4 border-l-[#0A192F]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                <strong>{msg.senderName} ({msg.senderRole === 'customer' ? 'Client' : 'Audrin Engineering'})</strong>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-800 font-sans">{msg.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Send Message Form */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type your message or technical question..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-sm text-xs font-mono focus:border-[#CC0000] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-[#0A192F] hover:bg-[#1E293B] text-white px-4 py-2 rounded-sm font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 5: Site Visits */}
                  {activeTab === 'visits' && (
                    <div className="space-y-4">
                      <h4 className="font-mono font-bold uppercase text-[#0A192F]">Scheduled Site Inspections</h4>
                      {activeRequest.siteVisits.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-sm border border-dashed border-slate-200 font-mono">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>No physical site inspections scheduled at this stage.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeRequest.siteVisits.map((v) => (
                            <div key={v.id} className="p-4 rounded-sm bg-slate-50 border-l-4 border-l-[#0A192F] border-t border-r border-b border-slate-200 text-slate-800 space-y-1.5 font-mono text-xs">
                              <div className="flex items-center justify-between font-bold">
                                <span>{v.purpose || 'Site Inspection'} - {v.scheduledDate}</span>
                                <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-200 text-slate-800 rounded-sm">{v.status}</span>
                              </div>
                              <p>Window: <strong>{v.scheduledTimeWindow}</strong></p>
                              <p>Technician: <strong>{v.technicianName}</strong></p>
                              {v.notes && <p className="text-[11px] text-slate-600 font-sans">{v.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-slate-400 font-mono">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-base text-slate-700 uppercase">Select a Service Request to view details</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
