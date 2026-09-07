import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { SANS10139OfflineSyncBanner } from './components/SANS10139OfflineSyncBanner';
import { PushNotificationCenterModal } from './components/PushNotificationCenterModal';
import { MaintenanceCheckAuditModal } from './components/MaintenanceCheckAuditModal';
import { RemedialActionAssignmentModal } from './components/RemedialActionAssignmentModal';
import { DeviceQRCodeGeneratorModal } from './components/DeviceQRCodeGeneratorModal';
import { DeviceMaintenanceLogModal } from './components/DeviceMaintenanceLogModal';

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
import { ComplianceDashboardView } from './views/ComplianceDashboardView';

const MainContent: React.FC = () => {
  const {
    activeView,
    currentUser,
    selectedReportForDetail,
    setSelectedReportForDetail,
    isSubmitBeforeWorkModalOpen,
    setIsSubmitBeforeWorkModalOpen,
    isSubmitPostWorkModalOpen,
    setIsSubmitPostWorkModalOpen,
    preselectedRequestIdForReport,

    // Fire Detection Devices & QR Label Modals
    fireDetectionDevices,
    selectedDeviceForLog,
    setSelectedDeviceForLog,
    isDeviceLogModalOpen,
    closeDeviceMaintenanceLog,
    isDeviceQRGeneratorModalOpen,
    closeDeviceQRGenerator,
    qrGeneratorPreselectedSiteId,
    qrGeneratorPreselectedDeviceId,
    openDeviceMaintenanceLog,
    openDeviceQRGenerator
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
      case 'compliance-dashboard':
        return <ComplianceDashboardView />;
      case 'legal':
        if (currentUser) {
          return <CustomerPortalView initialSection="sans_legal_hub" />;
        }
        return <LegalView />;
      case 'auth':
        return <AuthView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#050D1A] text-slate-900 dark:text-slate-100 font-sans selection:bg-red-500 selection:text-white transition-colors duration-150">
      <Header />
      <SANS10139OfflineSyncBanner />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
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

      {/* SANS 10139 Browser Push Notification Control Center Modal */}
      <PushNotificationCenterModal />

      {/* SANS 10139 Maintenance Audit & Remedial Action Modals */}
      <MaintenanceCheckAuditModal />
      <RemedialActionAssignmentModal />

      {/* SANS 10139 Printable QR Code Labels & Device Maintenance Log Modals */}
      <DeviceQRCodeGeneratorModal
        isOpen={isDeviceQRGeneratorModalOpen}
        onClose={closeDeviceQRGenerator}
        devices={fireDetectionDevices}
        initialSiteId={qrGeneratorPreselectedSiteId}
        initialDeviceId={qrGeneratorPreselectedDeviceId}
        onViewDeviceLog={(device) => {
          setSelectedDeviceForLog(device);
          openDeviceMaintenanceLog(device.id);
        }}
      />

      <DeviceMaintenanceLogModal
        isOpen={isDeviceLogModalOpen}
        device={selectedDeviceForLog}
        onClose={closeDeviceMaintenanceLog}
        onOpenQRGenerator={(siteId, deviceId) => openDeviceQRGenerator(siteId, deviceId)}
      />

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
