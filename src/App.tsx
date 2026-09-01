import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toasts } from './components/Toasts';
import { MultiStepRequestModal } from './components/MultiStepRequestModal';
import { EmergencyFaultModal } from './components/EmergencyFaultModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { VoiceAIGuidePlayer } from './components/VoiceAIGuidePlayer';
import { VideoEvidenceUploadModal } from './components/VideoEvidenceUploadModal';
import { VideoEvidenceDetailModal } from './components/VideoEvidenceDetailModal';
import { ConditionReportDetailModal } from './components/ConditionReportDetailModal';
import { SubmitBeforeWorkEvidenceModal } from './components/SubmitBeforeWorkEvidenceModal';
import { SubmitPostWorkEvidenceModal } from './components/SubmitPostWorkEvidenceModal';

import { HomeView } from './views/HomeView';
import { AboutView } from './views/AboutView';
import { ServicesView } from './views/ServicesView';
import { ServiceDetailView } from './views/ServiceDetailView';
import { HowWeWorkView } from './views/HowWeWorkView';
import { GalleryView } from './views/GalleryView';
import { ContactView } from './views/ContactView';
import { CustomerPortalView } from './views/CustomerPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { LegalView } from './views/LegalView';
import { AuthView } from './views/AuthView';

const MainContent: React.FC = () => {
  const {
    activeView,
    selectedReportForDetail,
    setSelectedReportForDetail,
    isSubmitBeforeWorkModalOpen,
    setIsSubmitBeforeWorkModalOpen,
    isSubmitPostWorkModalOpen,
    setIsSubmitPostWorkModalOpen,
    preselectedRequestIdForReport
  } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'about':
        return <AboutView />;
      case 'services':
        return <ServicesView />;
      case 'service-detail':
        return <ServiceDetailView />;
      case 'how-we-work':
        return <HowWeWorkView />;
      case 'gallery':
        return <GalleryView />;
      case 'contact':
        return <ContactView />;
      case 'customer-portal':
        return <CustomerPortalView />;
      case 'admin-portal':
        return <AdminPortalView />;
      case 'legal':
        return <LegalView />;
      case 'auth':
        return <AuthView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      <Header />
      <main className="flex-1">
        {renderActiveView()}
      </main>
      <Footer />

      {/* Global Application Modals & Notification Toasts */}
      <MultiStepRequestModal />
      <EmergencyFaultModal />
      <EmailPreviewModal />
      <VoiceAIGuidePlayer />
      <VideoEvidenceUploadModal />
      <VideoEvidenceDetailModal />

      {/* Automated Condition Reports Modals */}
      {selectedReportForDetail && (
        <ConditionReportDetailModal
          report={selectedReportForDetail}
          onClose={() => setSelectedReportForDetail(null)}
        />
      )}
      {isSubmitBeforeWorkModalOpen && (
        <SubmitBeforeWorkEvidenceModal
          initialRequestId={preselectedRequestIdForReport}
          onClose={() => setIsSubmitBeforeWorkModalOpen(false)}
        />
      )}
      {isSubmitPostWorkModalOpen && (
        <SubmitPostWorkEvidenceModal
          initialRequestId={preselectedRequestIdForReport}
          onClose={() => setIsSubmitPostWorkModalOpen(false)}
        />
      )}

      <Toasts />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
