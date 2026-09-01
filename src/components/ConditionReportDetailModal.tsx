import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Send,
  Download,
  Share2,
  History,
  Layers,
  ArrowRight,
  Video,
  Clock,
  ExternalLink,
  MessageSquare,
  Building,
  UserCheck,
  Hash,
  Eye,
  Camera,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConditionReport, ReportPhotoSelection } from '../types';
import { ReportLetterhead, ReportLetterheadFooter } from './ReportLetterhead';

interface ConditionReportDetailModalProps {
  report: ConditionReport;
  onClose: () => void;
}

export const ConditionReportDetailModal: React.FC<ConditionReportDetailModalProps> = ({
  report,
  onClose
}) => {
  const {
    currentUser,
    acknowledgeConditionReport,
    submitReportConcernOrDispute,
    resendConditionReportEmail,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'comparison' | 'findings' | 'versions' | 'deliveries'>('overview');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<ReportPhotoSelection | null>(null);
  const [concernText, setConcernText] = useState('');
  const [showConcernForm, setShowConcernForm] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const isPreWork = report.reportType === 'pre_work';
  const snapshot = report.currentVersion.snapshot;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(report.secureDashboardLink);
    showToast('info', 'Link Copied', 'Secure dashboard link copied to clipboard.');
  };

  const handleAcknowledge = () => {
    acknowledgeConditionReport(report.id, 'acknowledged_satisfied', 'Client reviewed and satisfied with condition record.');
  };

  const handleSubmitConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernText.trim()) return;
    submitReportConcernOrDispute(report.id, concernText.trim());
    setConcernText('');
    setShowConcernForm(false);
  };

  return (
    <div id="condition-report-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className={`p-3 rounded-xl ${isPreWork ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {report.referenceNumber}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isPreWork ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
                }`}>
                  {isPreWork ? 'Pre-Work Condition Report' : 'Post-Work Condition Report'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  v{report.currentVersionNumber.toFixed(1)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize ${
                  report.status === 'acknowledged_by_client'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : report.status === 'more_info_required'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {report.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {report.serviceRequestTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Service Ref: <span className="font-mono text-slate-300">{report.serviceRequestRef}</span> • Generated: {new Date(report.generatedAt).toLocaleString('en-ZA')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print / Save as PDF"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Secure Portal Link"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors print:hidden"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 overflow-x-auto shrink-0 print:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Photographic Evidence ({snapshot.photos.length})
          </button>
          {!isPreWork && (
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'comparison'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Paired Before / After ({snapshot.pairedComparisons?.length || 0})
            </button>
          )}
          <button
            onClick={() => setActiveTab('findings')}
            className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'findings'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Visible Observations & Recs
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'versions'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Version History ({report.versionHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'deliveries'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Deliveries & Audit ({report.deliveries.length})
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          
          {/* REUSABLE REPORT LETTERHEAD (Audrin Fire Engineers Logo, Registration, Standard & Contacts) */}
          <ReportLetterhead
            reportTitle={report.title}
            reportType={report.reportType}
            documentReference={report.referenceNumber}
            date={new Date(report.generatedAt).toLocaleDateString('en-ZA', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
            clientName={report.clientName}
            clientOrganisation={report.clientOrganisation}
            premisesAddress={report.premisesAddress}
            serviceRequestRef={report.serviceRequestRef}
            equipmentReference={report.equipmentReference}
            showContactCard={true}
          />

          {/* MANDATORY LEGAL & SCOPE DISCLAIMER (Prominently rendered in red/amber) */}
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Mandatory Scope & Evidentiary Disclaimer
                </h4>
                <p className="text-sm text-amber-900 dark:text-amber-200/90 font-medium leading-relaxed italic">
                  "{report.mandatoryDisclaimer}"
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-medium">
                    Not a Certificate of Compliance (CoC)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-medium">
                    Not a SANS 10139 Statutory Verification
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-medium">
                    Visible Photographic Evidence Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {(activeTab === 'overview' || isPrinting) && (
            <div className="space-y-6">
              
              {/* Facility & Equipment Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Client & Premises
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-base">{report.clientName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{report.clientOrganisation || 'Private Facility'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{report.premisesAddress}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{report.clientEmail} • {report.clientPhone}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    System & Equipment Ref
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-base">{report.systemCategory}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-200 dark:bg-slate-700/60 px-2 py-1 rounded inline-block mt-1">
                    Equipment: {report.equipmentReference}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <p>Evidence Photos: <span className="font-semibold text-slate-700 dark:text-slate-300">{snapshot.photos.length} item(s)</span></p>
                    <p>Linked Videos: <span className="font-semibold text-slate-700 dark:text-slate-300">{snapshot.videos.length} recording(s)</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Technical Verification
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    {report.assignedTechnicianName || 'Audrin Technical Desk'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Report Version: {report.currentVersionNumber.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">Report Hash: <span className="font-mono text-[10px] text-slate-400 truncate block">{report.currentVersion.sha256Digest.substring(0, 24)}...</span></p>
                </div>
              </div>

              {/* Service Request Context */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  Service Request Context & Client Scope
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {report.serviceRequestDescription}
                </p>
                {report.customerSubmittedComments && report.customerSubmittedComments.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                    <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-1">Client Specific Instructions / Notes:</span>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      {report.customerSubmittedComments.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Summary of Visible Condition */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Visible Condition & Supporting Evidence Overview
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {report.reportSummary}
                </p>
              </div>

              {/* If Post-Work, show activities conducted */}
              {!isPreWork && report.workActivitiesConducted && report.workActivitiesConducted.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Work Activities Carried Out
                  </h4>
                  <ul className="space-y-1.5 text-sm text-emerald-950 dark:text-emerald-200">
                    {report.workActivitiesConducted.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* REPORT LETTERHEAD OFFICIAL FOOTER (Overview & PDF Print output) */}
              <ReportLetterheadFooter
                preparedBy={report.assignedTechnicianName}
                showSignatureLine={true}
                className="mt-6"
              />
            </div>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Submitted Photographic Evidence
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-resolution original photographs recording visible conditions on site.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {snapshot.photos.length} item(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshot.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-hidden flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer"
                    onClick={() => setSelectedPhotoPreview(photo)}
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={photo.photoUrl}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          photo.stage === 'before_work'
                            ? 'bg-amber-500 text-slate-950'
                            : photo.stage === 'during_work'
                            ? 'bg-blue-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}>
                          {photo.stage.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                          {photo.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Click to enlarge
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {photo.caption}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {photo.visibleConditionNotes}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex justify-between items-center">
                        <span className="truncate">{photo.roomOrLocation}</span>
                        <span className="shrink-0">{photo.dateRecorded}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARISON TAB (For Post-Work) */}
          {activeTab === 'comparison' && !isPreWork && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Paired Pre-Work vs. Post-Work Photographic Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct before and after visible condition comparison for audited components.
                </p>
              </div>

              {(!snapshot.pairedComparisons || snapshot.pairedComparisons.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500">No paired comparisons recorded.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {snapshot.pairedComparisons.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {pair.componentName} — {pair.location}
                          </h4>
                        </div>
                      </div>

                      {/* Side by side cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
                          <div className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs flex justify-between items-center">
                            <span>BEFORE WORK</span>
                            <span className="text-[10px] font-mono">{pair.beforePhoto.dateRecorded}</span>
                          </div>
                          <div className="aspect-video bg-black relative">
                            <img
                              src={pair.beforePhoto.photoUrl}
                              alt="Before Work"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setSelectedPhotoPreview(pair.beforePhoto)}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-3 text-xs">
                            <p className="font-semibold text-amber-900 dark:text-amber-200">Visible Prior State:</p>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{pair.beforePhoto.visibleConditionNotes}</p>
                          </div>
                        </div>

                        {/* After */}
                        <div className="rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden">
                          <div className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs flex justify-between items-center">
                            <span>AFTER WORK</span>
                            <span className="text-[10px] font-mono">{pair.afterPhoto.dateRecorded}</span>
                          </div>
                          <div className="aspect-video bg-black relative">
                            <img
                              src={pair.afterPhoto.photoUrl}
                              alt="After Work"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setSelectedPhotoPreview(pair.afterPhoto)}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-3 text-xs">
                            <p className="font-semibold text-emerald-900 dark:text-emerald-200">Visible Rectified State:</p>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{pair.afterPhoto.visibleConditionNotes}</p>
                          </div>
                        </div>
                      </div>

                      {/* Observations */}
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          Visible Differences & Rectification Notes:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{pair.observedDifferences}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FINDINGS & OBSERVATIONS TAB */}
          {activeTab === 'findings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Visible Photographic Observations & Technical Next Steps
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specific visible items recorded from photographs without unsupported compliance claims.
                </p>
              </div>

              <div className="space-y-4">
                {snapshot.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {finding.locationOrZone}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {finding.title}
                        </h4>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                        finding.severityLevel === 'critical_attention'
                          ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                          : finding.severityLevel === 'priority'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {finding.severityLevel.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{finding.description}"
                    </p>

                    <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                        Technical Recommendation / Next Steps:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">{finding.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* General Recommendations */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  General Engineering Guidance
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {report.generalRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* VERSION HISTORY TAB */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Immutable Version Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Reports cannot be silently modified. Updates generate an immutable version record.
                </p>
              </div>

              <div className="space-y-3">
                {report.versionHistory.map((ver) => (
                  <div
                    key={ver.id}
                    className={`p-4 rounded-xl border ${
                      ver.versionNumber === report.currentVersionNumber
                        ? 'border-red-500/50 bg-red-50/20 dark:bg-red-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                          v{ver.versionNumber.toFixed(1)}
                        </span>
                        {ver.versionNumber === report.currentVersionNumber && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                            CURRENT ACTIVE
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(ver.generatedAt).toLocaleString('en-ZA')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Author: <strong className="text-slate-700 dark:text-slate-300">{ver.generatedBy}</strong>
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-2">
                      Change Summary: {ver.changeReason}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded truncate">
                      SHA256: {ver.sha256Digest}
                    </div>
                  </div>
                ))}
              </div>

              {/* OFFICIAL LETTERHEAD BRANDING FOOTER */}
              <ReportLetterheadFooter className="mt-8" />
            </div>
          )}

          {/* DELIVERIES TAB */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Email Delivery & Acknowledgement Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transmissions sent to client without raw media attachments (secure dashboard links used).
                  </p>
                </div>
                <button
                  onClick={() => resendConditionReportEmail(report.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Report Email
                </button>
              </div>

              {/* Acknowledgements Section */}
              {report.acknowledgements && report.acknowledgements.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide mb-2">
                    Client Acknowledgements
                  </h4>
                  <div className="space-y-2">
                    {report.acknowledgements.map((ack) => (
                      <div key={ack.id} className="text-xs text-emerald-950 dark:text-emerald-200 border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2 first:border-0 first:pt-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{ack.clientName} ({ack.acknowledgementType.replace(/_/g, ' ')})</span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">{new Date(ack.acknowledgedAt).toLocaleString('en-ZA')}</span>
                        </div>
                        {ack.clientNotes && <p className="mt-1 italic">"{ack.clientNotes}"</p>}
                        {ack.submittedCorrectionText && <p className="mt-1 font-semibold text-rose-700 dark:text-rose-400">Correction: {ack.submittedCorrectionText}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery list */}
              <div className="space-y-3">
                {report.deliveries.map((del) => (
                  <div
                    key={del.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{del.recipientEmail}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                        {del.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Subject: {del.subject}</p>
                    <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Sent: {new Date(del.sentAt).toLocaleString('en-ZA')}</span>
                      <span>No media attached (Dashboard Link Provided)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Footer for Client/Staff */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Report Actions:</span>
            {report.status !== 'acknowledged_by_client' && (
              <button
                onClick={handleAcknowledge}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Acknowledge & Accept Report
              </button>
            )}
            <button
              onClick={() => setShowConcernForm(!showConcernForm)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-4 h-4" /> Request Correction / Submit Note
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF View
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        {/* Concern Form Expandable Modal Overlay */}
        {showConcernForm && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmitConcern} className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Submit Client Correction / Evidentiary Dispute Note:
              </label>
              <textarea
                value={concernText}
                onChange={(e) => setConcernText(e.target.value)}
                placeholder="Describe any visible discrepancy or additional equipment context..."
                rows={3}
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConcernForm(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Submit for Engineering Review
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Enlarged Photo Preview Lightbox */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-800 text-white flex justify-between items-center text-xs">
              <span className="font-bold">{selectedPhotoPreview.caption} ({selectedPhotoPreview.stage.replace(/_/g, ' ')})</span>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhotoPreview.photoUrl}
                alt={selectedPhotoPreview.caption}
                className="max-h-[70vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 bg-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Visible Condition:</strong> {selectedPhotoPreview.visibleConditionNotes}</p>
              <p className="text-slate-400">Location: {selectedPhotoPreview.roomOrLocation} • Date: {selectedPhotoPreview.dateRecorded}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
