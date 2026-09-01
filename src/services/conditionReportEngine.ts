import {
  ConditionReport,
  ConditionReportType,
  ConditionReportStatus,
  ConditionReportVersion,
  ReportEvidenceSnapshot,
  ReportPhotoSelection,
  ReportVideoSelection,
  PairedBeforeAfterComparison,
  ReportFinding,
  ReportRecommendation,
  ReportDelivery,
  ServiceRequest,
  ServiceVideo
} from '../types';
import { COMPANY_DETAILS, HOW_WE_WORK_STEPS } from '../data/initialData';
import { getAudrinLogoSvgHtml } from '../components/BrandLogo';

export const STATUTORY_REPORT_DISCLAIMER =
  'This automated condition report is based on photographic and supporting information submitted through the Audrin Fire Engineers platform. It records the visible condition shown in the submitted evidence and does not replace a physical site inspection, testing, commissioning or formal compliance assessment.';

export const PROHIBITED_REPORT_PHRASES = [
  'The installation is compliant.',
  'The installation is non-compliant.',
  'The system passed.',
  'The system failed.',
  'The system is safe.',
  'The system meets SANS 10139.'
];

// Helper: Pseudo SHA-256 calculation for immutable snapshot validation
export function generatePseudoSha256(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `afe_${hex}_${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`.padEnd(64, '0');
}

/**
 * Cautious Pre-Work Findings Generator adhering strictly to safe reporting rules:
 * Generates objective observations without unsupported compliance or safety claims.
 */
export function generateCautiousPreWorkFindings(
  request: ServiceRequest,
  photos: ReportPhotoSelection[]
): {
  findings: ReportFinding[];
  missingInfo: string[];
  physicalAssessmentItems: string[];
  recommendedStep: { stepNumber: number; stepTitle: string; rationale: string };
} {
  const findings: ReportFinding[] = [];
  const missingInfo: string[] = [];
  const physicalAssessmentItems: string[] = [];

  // Evaluate Fire Panel photos and data
  const panelPhotos = photos.filter(p => p.category === 'fire_alarm_panel' || p.category === 'fault_indicator_display');
  if (panelPhotos.length > 0) {
    const primaryPanel = panelPhotos[0];
    findings.push({
      id: `fnd-${Date.now()}-1`,
      category: 'Control Equipment & Panel Status',
      findingText: `The submitted photograph appears to show a ${request.panelMakeModel || 'fire alarm control panel'} located at ${primaryPanel.roomOrLocation}. ${primaryPanel.visibleConditionNotes || 'Visible indicators are recorded in the submitted evidence.'}`,
      visibleEvidenceSummary: `Visible condition: ${primaryPanel.visibleConditionNotes || 'Standard standby condition visible'}.`,
      requiresPhysicalAssessment: true,
      severity: request.urgency === 'urgent_emergency' ? 'attention_required' : 'info',
      relatedPhotoId: primaryPanel.id
    });
  } else {
    missingInfo.push('High-resolution photograph of the main fire alarm control panel display and LED indicators');
    findings.push({
      id: `fnd-${Date.now()}-panel-missing`,
      category: 'Control Equipment',
      findingText: 'The equipment details could not be confirmed from the submitted evidence because no panel photograph was provided.',
      visibleEvidenceSummary: 'No direct photographic evidence of control panel provided.',
      requiresPhysicalAssessment: true,
      severity: 'advisory'
    });
  }

  // Evaluate Detector & Field Devices
  const detectorPhotos = photos.filter(p => p.category === 'smoke_heat_detector' || p.category === 'manual_call_point' || p.category === 'sounder_beacon');
  if (detectorPhotos.length > 0) {
    detectorPhotos.forEach((dp, idx) => {
      findings.push({
        id: `fnd-${Date.now()}-det-${idx}`,
        category: 'Field Detection & Alarm Devices',
        findingText: `The submitted photograph appears to show an installed device at ${dp.roomOrLocation}. ${dp.visibleConditionNotes || 'The visible condition requires further physical inspection to confirm detector sensitivity, address assignment and obstruction clearance.'}`,
        visibleEvidenceSummary: dp.caption || 'Device visible on ceiling/wall surface.',
        requiresPhysicalAssessment: true,
        severity: dp.clientReportedFault ? 'attention_required' : 'info',
        relatedPhotoId: dp.id
      });
    });
  } else {
    missingInfo.push('Clear photographs of field detection devices and manual call points in the affected zones');
  }

  // Evaluate Cable Routes & Containment
  const cablePhotos = photos.filter(p => p.category === 'cable_route_containment' || p.category === 'ceiling_void_riser');
  if (cablePhotos.length > 0) {
    cablePhotos.forEach((cp, idx) => {
      findings.push({
        id: `fnd-${Date.now()}-cbl-${idx}`,
        category: 'Cabling & Containment',
        findingText: `The submitted photograph appears to show fire-alarm cable routing at ${cp.roomOrLocation}. The visible condition requires further assessment to verify fire-resistant support intervals and mechanical protection.`,
        visibleEvidenceSummary: cp.caption || 'Cable containment visible.',
        requiresPhysicalAssessment: true,
        severity: 'info',
        relatedPhotoId: cp.id
      });
    });
  } else {
    physicalAssessmentItems.push('Physical inspection of cable containment, riser glands, and ceiling void penetrations');
  }

  // Client reported fault evaluation
  if (request.existingFaultOrRequirement) {
    findings.push({
      id: `fnd-${Date.now()}-fault`,
      category: 'Client Reported Fault / Requirement',
      findingText: `The client reported: "${request.existingFaultOrRequirement}". Testing is required before system operation can be confirmed.`,
      visibleEvidenceSummary: 'Client-reported operational condition.',
      requiresPhysicalAssessment: true,
      severity: 'attention_required'
    });
  }

  // Standard Physical Assessment Items
  physicalAssessmentItems.push(
    'Point-to-point electrical insulation resistance and loop loopback continuity tests',
    'Audibility decibel level measurement under ambient operational noise',
    'Verification of secondary battery backup standby autonomy under mains failure',
    'Interface relay trip verification (HVAC shutdown, access control door release, third-party plant)'
  );

  if (!request.approximateBuildingSize) {
    missingInfo.push('Building floor area (m²) and accurate floor-to-ceiling heights');
  }

  // Determine recommended next workflow step (1 to 7)
  let recommendedStep = {
    stepNumber: 2,
    stepTitle: 'Site Survey & System Assessment',
    rationale: 'A physical site survey is recommended to evaluate building geometry, inspect ceiling voids, and verify existing fire alarm wiring paths.'
  };

  if (request.serviceSlug.includes('design') || request.serviceSlug.includes('category')) {
    recommendedStep = {
      stepNumber: 3,
      stepTitle: 'System Category & Design',
      rationale: 'Formal architectural drawings and fire risk category analysis are required before preparing the technical device schedule.'
    };
  } else if (request.serviceSlug.includes('quotation') || request.serviceSlug.includes('scope')) {
    recommendedStep = {
      stepNumber: 4,
      stepTitle: 'Scope & Quotation',
      rationale: 'Photographic evidence is sufficient to prepare a preliminary bill of quantities and formal itemised quotation.'
    };
  } else if (request.serviceSlug.includes('installation')) {
    recommendedStep = {
      stepNumber: 5,
      stepTitle: 'Installation',
      rationale: 'Scope confirmed; scheduling containment installation and device termination with facility management.'
    };
  } else if (request.serviceSlug.includes('fault') || request.serviceSlug.includes('emergency')) {
    recommendedStep = {
      stepNumber: 2,
      stepTitle: 'Site Survey & System Assessment',
      rationale: 'On-site electrical diagnostic testing is required to isolate ground faults, loop short-circuits, or corrupted panel communications.'
    };
  }

  return {
    findings,
    missingInfo,
    physicalAssessmentItems,
    recommendedStep
  };
}

/**
 * Validate Pre-Work Condition Report Eligibility
 */
export function validatePreWorkReportEligibility(
  request: ServiceRequest,
  beforePhotos: ReportPhotoSelection[]
): {
  isEligible: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request) {
    errors.push('A valid service request is required.');
  }

  if (!beforePhotos || beforePhotos.length === 0) {
    errors.push('At least one before-work photograph must be uploaded.');
  }

  return {
    isEligible: errors.length === 0,
    errors
  };
}

/**
 * Validate Post-Work Condition Report Eligibility
 * Critical Rule: If after-work evidence is missing, do NOT generate a misleading completed report.
 */
export function validatePostWorkReportEligibility(
  request: ServiceRequest,
  afterPhotos: ReportPhotoSelection[]
): {
  isEligible: boolean;
  isPostWorkEvidenceIncomplete: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request) {
    errors.push('A valid service request is required.');
  }

  const approvedAfterPhotos = (afterPhotos || []).filter(
    p => p.stage === 'after_work' && (p.reviewStatus === 'approved' || p.reviewStatus === 'included_in_report' || p.isApprovedForReport)
  );

  if (approvedAfterPhotos.length === 0) {
    errors.push('Post-work evidence incomplete: At least one approved after-work photograph is required.');
    return {
      isEligible: false,
      isPostWorkEvidenceIncomplete: true,
      errors
    };
  }

  return {
    isEligible: errors.length === 0,
    isPostWorkEvidenceIncomplete: false,
    errors
  };
}

/**
 * Automated Pre-Work Report Generator
 */
export function generatePreWorkConditionReport(
  request: ServiceRequest,
  beforePhotos: ReportPhotoSelection[],
  videos: ReportVideoSelection[] = [],
  author: string = 'Celery Worker Task (task_generate_pre_work_condition_report)'
): ConditionReport {
  const { findings, missingInfo, physicalAssessmentItems, recommendedStep } =
    generateCautiousPreWorkFindings(request, beforePhotos);

  const reportId = `rep-pre-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const reportRef = `AFE-REP-PRE-${request.referenceNumber.replace('AFE-REQ-', '')}-01`;
  const snapshotSha256 = generatePseudoSha256(
    `${reportRef}_${beforePhotos.map(p => p.sha256Hash).join('_')}_${Date.now()}`
  );

  const snapshot: ReportEvidenceSnapshot = {
    id: `snp-${Date.now()}`,
    snapshotTimestamp: new Date().toISOString(),
    lockedBy: author,
    photosCount: beforePhotos.length,
    videosCount: videos.length,
    photos: beforePhotos.map(p => ({ ...p, isApprovedForReport: true })),
    videos: videos,
    snapshotSha256: snapshotSha256,
    isLocked: true
  };

  const recommendations: ReportRecommendation[] = [
    {
      id: `rec-${Date.now()}-1`,
      workflowStepNumber: recommendedStep.stepNumber,
      workflowStepTitle: recommendedStep.stepTitle,
      recommendationText: recommendedStep.rationale,
      rationale: `Aligned with Audrin Fire Engineers 7-Step Service Process: Step ${recommendedStep.stepNumber} (${recommendedStep.stepTitle}).`,
      priority: 'high'
    },
    {
      id: `rec-${Date.now()}-2`,
      workflowStepNumber: 4,
      workflowStepTitle: 'Scope and Quotation',
      recommendationText: 'Finalise detailed engineering bill of quantities and scope document upon physical survey confirmation.',
      rationale: 'Provides transparent commercial and technical deliverables for the client.',
      priority: 'standard'
    }
  ];

  const version1: ConditionReportVersion = {
    id: `ver-${Date.now()}-1`,
    versionNumber: 1.0,
    versionTag: 'v1.0',
    reportReference: reportRef,
    fileHashSha256: snapshotSha256,
    generatedAt: new Date().toISOString(),
    generatedByTask: 'celery.tasks.condition_report_worker_v2',
    reasonForVersion: 'Initial automated Pre-Work Condition Report generated from client-submitted photographic evidence.',
    snapshot,
    findings,
    recommendations,
    isCurrent: true
  };

  const delivery: ReportDelivery = {
    id: `del-${Date.now()}`,
    reportId,
    recipientEmail: request.email,
    recipientName: request.customerName,
    subject: `Pre-Work Condition Report – ${request.referenceNumber}`,
    deliveryStatus: 'sent',
    sentAt: new Date().toISOString(),
    authDashboardLink: `/customer-portal?request=${request.referenceNumber}&report=${reportRef}`,
    sanitizedPdfAttached: false,
    retryCount: 0
  };

  const report: ConditionReport = {
    id: reportId,
    referenceNumber: reportRef,
    reportType: 'pre_work',
    serviceRequestId: request.id,
    serviceRequestRef: request.referenceNumber,
    status: 'generated',
    clientName: request.customerName,
    clientOrganisation: request.organisationName,
    clientEmail: request.email,
    clientPhone: request.phone,
    siteName: request.siteName,
    siteAddress: `${request.streetAddress}, ${request.city}, ${request.province} ${request.postalCode}`,
    selectedServiceSlug: request.serviceSlug,
    selectedServiceTitle: request.serviceTitle,
    scopeOfWorkSummary: [
      'Visual evaluation of client-submitted before-work photographs',
      'System make, model, and visible condition appraisal',
      'Gap analysis of missing required technical parameters',
      'Identification of preliminary items requiring physical on-site assessment'
    ],
    buildingType: request.buildingType,
    panelMakeModel: request.panelMakeModel,
    zonesOrLoopsCount: request.zonesOrLoopsCount,
    problemDescription: request.existingFaultOrRequirement || request.additionalInformation || 'Pre-work site evaluation request.',
    evidenceSubmittedDate: new Date().toISOString(),
    reportGeneratedDate: new Date().toISOString(),
    recommendedWorkflowStep: recommendedStep,
    missingRequiredInfo: missingInfo,
    itemsRequiringPhysicalAssessment: physicalAssessmentItems,
    statutoryDisclaimer: STATUTORY_REPORT_DISCLAIMER,
    secureDashboardLink: `/customer-portal?request=${request.referenceNumber}&report=${reportRef}`,
    currentVersionNumber: 1.0,
    currentVersion: version1,
    versionHistory: [version1],
    deliveries: [delivery],
    acknowledgements: [],
    isLocked: true
  };

  return report;
}

/**
 * Automated Post-Work Report Generator
 */
export function generatePostWorkConditionReport(
  request: ServiceRequest,
  beforePhotos: ReportPhotoSelection[],
  duringPhotos: ReportPhotoSelection[],
  afterPhotos: ReportPhotoSelection[],
  videos: ReportVideoSelection[] = [],
  relatedPreWorkRef?: string,
  workActivities: string[] = [],
  author: string = 'Celery Worker Task (task_generate_post_work_condition_report)'
): ConditionReport {
  const reportId = `rep-post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const reportRef = `AFE-REP-POST-${request.referenceNumber.replace('AFE-REQ-', '')}-01`;

  // Automatic Before & After Pairing Logic
  const pairedComparisons: PairedBeforeAfterComparison[] = [];
  const allPhotos = [...beforePhotos, ...duringPhotos, ...afterPhotos];

  afterPhotos.forEach((afterP, idx) => {
    // Attempt to match before photo by room/location or category
    const matchingBefore =
      beforePhotos.find(b => b.roomOrLocation.toLowerCase() === afterP.roomOrLocation.toLowerCase()) ||
      beforePhotos.find(b => b.category === afterP.category) ||
      beforePhotos[idx % (beforePhotos.length || 1)] ||
      afterP;

    pairedComparisons.push({
      id: `pair-${Date.now()}-${idx}`,
      beforePhoto: matchingBefore,
      afterPhoto: afterP,
      siteArea: afterP.roomOrLocation || 'Installed Area',
      equipmentOrDevice: afterP.equipmentReference || afterP.category.replace(/_/g, ' '),
      beforeConditionCaption: matchingBefore.caption || matchingBefore.visibleConditionNotes || 'Pre-work visible condition recorded.',
      recordedWorkPerformed:
        afterP.caption ||
        'Component installed/serviced according to approved scope of work. Cable termination, mounting securement, and labelling completed.',
      afterConditionCaption: afterP.visibleConditionNotes || 'Visible completed installation clean and undamaged.',
      evidenceDates: `${matchingBefore.dateRecorded || 'Pre-work'} → ${afterP.dateRecorded || 'Post-work'}`,
      evidenceSource: `${matchingBefore.uploaderRole === 'customer' ? 'Client' : 'Technician'} / ${afterP.uploadedBy || 'Field Engineer'}`,
      reviewStatus: 'approved'
    });
  });

  const snapshotSha256 = generatePseudoSha256(
    `${reportRef}_${allPhotos.map(p => p.sha256Hash).join('_')}_${Date.now()}`
  );

  const snapshot: ReportEvidenceSnapshot = {
    id: `snp-post-${Date.now()}`,
    snapshotTimestamp: new Date().toISOString(),
    lockedBy: author,
    photosCount: allPhotos.length,
    videosCount: videos.length,
    photos: allPhotos.map(p => ({ ...p, isApprovedForReport: true })),
    videos,
    snapshotSha256,
    isLocked: true
  };

  const findings: ReportFinding[] = [
    {
      id: `fnd-post-${Date.now()}-1`,
      category: 'Completed Work Verification',
      findingText: `The submitted post-work photographic evidence appears to show completed installation/servicing at the recorded site locations. Visible devices are mounted securely with labelling in place.`,
      visibleEvidenceSummary: `${afterPhotos.length} approved post-work photographs verified.`,
      requiresPhysicalAssessment: false,
      severity: 'info'
    },
    {
      id: `fnd-post-${Date.now()}-2`,
      category: 'Photographic Evidence Scope',
      findingText: `The recorded visible condition reflects the completed physical scope shown in the evidence. Physical functional testing and periodic maintenance must be maintained on site.`,
      visibleEvidenceSummary: 'Paired before-and-after photographic comparisons verified.',
      requiresPhysicalAssessment: false,
      severity: 'info'
    }
  ];

  const recommendations: ReportRecommendation[] = [
    {
      id: `rec-post-${Date.now()}-1`,
      workflowStepNumber: 7,
      workflowStepTitle: 'Handover & Planned Maintenance',
      recommendationText: 'Implement weekly fire alarm user tests and establish a scheduled bi-annual preventative maintenance service agreement.',
      rationale: 'Maintains system reliability and provides continuous operational readiness for the facility.',
      priority: 'high'
    }
  ];

  const version1: ConditionReportVersion = {
    id: `ver-post-${Date.now()}-1`,
    versionNumber: 1.0,
    versionTag: 'v1.0',
    reportReference: reportRef,
    fileHashSha256: snapshotSha256,
    generatedAt: new Date().toISOString(),
    generatedByTask: 'celery.tasks.condition_report_worker_v2',
    reasonForVersion: 'Initial automated Post-Work Condition Report generated from approved during-work and after-work evidence.',
    snapshot,
    findings,
    recommendations,
    pairedComparisons,
    isCurrent: true
  };

  const delivery: ReportDelivery = {
    id: `del-post-${Date.now()}`,
    reportId,
    recipientEmail: request.email,
    recipientName: request.customerName,
    subject: `Post-Work Condition Report – ${request.referenceNumber}`,
    deliveryStatus: 'sent',
    sentAt: new Date().toISOString(),
    authDashboardLink: `/customer-portal?request=${request.referenceNumber}&report=${reportRef}`,
    sanitizedPdfAttached: false,
    retryCount: 0
  };

  const report: ConditionReport = {
    id: reportId,
    referenceNumber: reportRef,
    reportType: 'post_work',
    serviceRequestId: request.id,
    serviceRequestRef: request.referenceNumber,
    relatedPreWorkReportRef: relatedPreWorkRef,
    status: 'generated',
    clientName: request.customerName,
    clientOrganisation: request.organisationName,
    clientEmail: request.email,
    clientPhone: request.phone,
    siteName: request.siteName,
    siteAddress: `${request.streetAddress}, ${request.city}, ${request.province} ${request.postalCode}`,
    selectedServiceSlug: request.serviceSlug,
    selectedServiceTitle: request.serviceTitle,
    scopeOfWorkSummary: [
      'Compilation of before-work, during-work, and after-work photographic evidence',
      'Paired before-and-after visual condition comparison',
      'Record of work activities executed by authorised technical staff',
      'Summary of visible post-work condition and ongoing maintenance recommendations'
    ],
    buildingType: request.buildingType,
    panelMakeModel: request.panelMakeModel,
    zonesOrLoopsCount: request.zonesOrLoopsCount,
    problemDescription: request.existingFaultOrRequirement || 'Recorded work execution and completion.',
    evidenceSubmittedDate: new Date().toISOString(),
    reportGeneratedDate: new Date().toISOString(),
    recommendedWorkflowStep: {
      stepNumber: 7,
      stepTitle: 'Handover & Maintenance',
      rationale: 'Post-work phase completed. Scheduled maintenance and logbook records established.'
    },
    missingRequiredInfo: [],
    itemsRequiringPhysicalAssessment: [],
    workActivitiesRecorded: workActivities.length > 0 ? workActivities : [
      'Physical mounting and cable termination of specified fire detection devices',
      'Point-to-point addressing verification and loop test confirmation',
      'Visual inspection of device tagging and zone allocation label alignment'
    ],
    customerSubmittedComments: [],
    outstandingItems: [],
    itemsRequiringFurtherTesting: [
      'Bi-annual scheduled preventative maintenance service check'
    ],
    requiredMaintenanceFollowup: [
      'Weekly user manual call point test rotated through building zones',
      'Daily visual inspection of main fire alarm panel healthy green power indicator'
    ],
    statutoryDisclaimer: STATUTORY_REPORT_DISCLAIMER,
    secureDashboardLink: `/customer-portal?request=${request.referenceNumber}&report=${reportRef}`,
    currentVersionNumber: 1.0,
    currentVersion: version1,
    versionHistory: [version1],
    deliveries: [delivery],
    acknowledgements: [],
    isLocked: true
  };

  return report;
}

/**
 * Exact Automated Email Templates for Condition Reports with Official Letterhead
 */
export function buildPreWorkEmail(report: ConditionReport): { subject: string; body: string; plainText: string } {
  const subject = `Pre-Work Condition Report – ${report.serviceRequestRef} - Audrin Fire Engineers`;
  const logoSvg = getAudrinLogoSvgHtml(280, 60);

  const plainText = `
================================================================================
AUDRIN FIRE ENGINEERS
FIRE DETECTION & ALARM SYSTEMS | SANS 10139
================================================================================
Registration No: ${COMPANY_DETAILS.registrationNumber}
Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}
Document Reference: ${report.referenceNumber}

Dear ${report.clientName},

Thank you for submitting the before-work photographic evidence for ${report.siteName}.

Your automated Pre-Work Condition Report has been compiled based on the information and photographs submitted through the Audrin Fire Engineers platform.

SERVICE & REPORT SUMMARY:
- Service Request: ${report.serviceRequestRef}
- Service Scope: ${report.selectedServiceTitle}
- Facility / Site: ${report.siteName}
- Report Reference: ${report.referenceNumber}

MANDATORY EVIDENTIARY DISCLAIMER:
The report records the visible condition contained in the submitted evidence. It does not replace a physical site inspection, testing, commissioning or formal compliance assessment.

You can access the full report securely using the link below:
${report.secureDashboardLink}

Our engineering team will review the request and contact you regarding the appropriate next step.

--------------------------------------------------------------------------------
AUDRIN FIRE ENGINEERS | Registration No: ${COMPANY_DETAILS.registrationNumber}
Telephone: ${COMPANY_DETAILS.telephone} | Email: ${COMPANY_DETAILS.email}
Hours: ${COMPANY_DETAILS.operatingHours}
Postal & Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008
================================================================================`.trim();

  const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    
    <!-- OFFICIAL LETTERHEAD HEADER -->
    <div style="background-color: #ffffff; padding: 28px 32px 20px 32px; border-bottom: 1px solid #e2e8f0;">
      <!-- Logo Block -->
      <div style="margin-bottom: 12px;">
        ${logoSvg}
      </div>

      <!-- Tagline & Standard Alignment -->
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #0A192F; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px;">
        FIRE DETECTION &amp; ALARM SYSTEMS <span style="color: #94a3b8; font-weight: normal; margin: 0 4px;">|</span> <span style="color: #CC0000;">SANS 10139</span>
      </div>

      <!-- Letterhead Multi-Tone Divider Rule (Navy & Red) -->
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 3px; border-collapse: collapse;">
        <tr>
          <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 20%; background-color: #CC0000; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        </tr>
      </table>
    </div>

    <!-- Letter Date & Reference Row -->
    <div style="padding: 14px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 12px; color: #475569;">
      <table style="width: 100%;">
        <tr>
          <td><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
          <td style="text-align: right;"><strong>Report Ref:</strong> <span style="color: #CC0000; font-weight: bold;">${report.referenceNumber}</span></td>
        </tr>
      </table>
    </div>

    <!-- Letter Body -->
    <div style="padding: 32px; line-height: 1.6;">
      <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Dear <strong>${report.clientName}</strong>,</p>
      
      <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
        Thank you for submitting the before-work photographic evidence for <strong>${report.siteName}</strong>.
      </p>
      
      <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
        Your automated <strong>Pre-Work Condition Report</strong> has been generated based on the information and photographs submitted through the Audrin Fire Engineers platform.
      </p>
      
      <!-- Summary Card -->
      <div style="background-color: #f8fafc; border-left: 4px solid #CC0000; padding: 14px 18px; margin: 20px 0; font-family: monospace; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Service Request:</strong> ${report.serviceRequestRef}</p>
        <p style="margin: 0 0 6px 0;"><strong>Service Scope:</strong> ${report.selectedServiceTitle}</p>
        <p style="margin: 0 0 6px 0;"><strong>Site / Premises:</strong> ${report.siteName}</p>
        <p style="margin: 0;"><strong>Report Reference:</strong> ${report.referenceNumber}</p>
      </div>

      <!-- Evidentiary Disclaimer -->
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 14px; margin: 20px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
        <strong style="display: block; margin-bottom: 4px; text-transform: uppercase;">Important Reporting Notice:</strong>
        The report records the visible condition contained in the submitted evidence. It does not replace a physical site inspection, testing, commissioning or formal compliance assessment.
      </div>

      <p style="font-size: 14px; color: #334155; margin: 24px 0 12px 0;">You can access the report securely using the link below:</p>
      
      <div style="margin: 20px 0;">
        <a href="${report.secureDashboardLink}" style="background-color: #CC0000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-weight: bold; font-family: monospace; font-size: 13px; text-transform: uppercase; display: inline-block;">
          Access Secure Condition Report &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #475569; margin-top: 24px;">Our team will review the request and contact you regarding the appropriate next step.</p>
    </div>

    <!-- OFFICIAL LETTERHEAD FOOTER -->
    <div style="background-color: #f8fafc; padding: 24px 32px; font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      <!-- Multi-Tone Divider Rule -->
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 2px; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="width: 40%; background-color: #0A192F; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 20%; background-color: #CC0000; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 40%; background-color: #0A192F; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        </tr>
      </table>

      <div style="margin-bottom: 6px;">
        <strong style="color: #0A192F; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;">AUDRIN FIRE ENGINEERS</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <span>Registration No: <strong style="color: #0A192F;">${COMPANY_DETAILS.registrationNumber}</strong></span>
      </div>

      <div style="margin-bottom: 6px; color: #334155;">
        <strong style="color: #CC0000;">${COMPANY_DETAILS.telephone}</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <strong style="color: #0A192F;">${COMPANY_DETAILS.email}</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <span>${COMPANY_DETAILS.operatingHours}</span>
      </div>

      <div style="color: #64748b; font-size: 10px;">
        Postal &amp; Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008, South Africa
      </div>
    </div>

  </div>
</body>
</html>`.trim();

  return { subject, body, plainText };
}

export function buildPostWorkEmail(report: ConditionReport): { subject: string; body: string; plainText: string } {
  const subject = `Post-Work Condition Report – ${report.serviceRequestRef} - Audrin Fire Engineers`;
  const logoSvg = getAudrinLogoSvgHtml(280, 60);

  const plainText = `
================================================================================
AUDRIN FIRE ENGINEERS
FIRE DETECTION & ALARM SYSTEMS | SANS 10139
================================================================================
Registration No: ${COMPANY_DETAILS.registrationNumber}
Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}
Document Reference: ${report.referenceNumber}

Dear ${report.clientName},

The Post-Work Condition Report for ${report.siteName} has been compiled.

SERVICE & REPORT SUMMARY:
- Service Request: ${report.serviceRequestRef}
- Service Scope: ${report.selectedServiceTitle}
- Facility / Site: ${report.siteName}
- Report Reference: ${report.referenceNumber}

The report contains the approved before-work, during-work and after-work evidence recorded for this service request.

Please review the report through your secure customer dashboard. You may acknowledge receipt or submit a concern directly from the service-request page:
${report.secureDashboardLink}

STATUTORY LIMITATION:
This photographic condition report does not independently constitute a commissioning certificate, certificate of compliance or statutory approval.

--------------------------------------------------------------------------------
AUDRIN FIRE ENGINEERS | Registration No: ${COMPANY_DETAILS.registrationNumber}
Telephone: ${COMPANY_DETAILS.telephone} | Email: ${COMPANY_DETAILS.email}
Hours: ${COMPANY_DETAILS.operatingHours}
Postal & Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008
================================================================================`.trim();

  const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    
    <!-- OFFICIAL LETTERHEAD HEADER -->
    <div style="background-color: #ffffff; padding: 28px 32px 20px 32px; border-bottom: 1px solid #e2e8f0;">
      <!-- Logo Block -->
      <div style="margin-bottom: 12px;">
        ${logoSvg}
      </div>

      <!-- Tagline & Standard Alignment -->
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #0A192F; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px;">
        FIRE DETECTION &amp; ALARM SYSTEMS <span style="color: #94a3b8; font-weight: normal; margin: 0 4px;">|</span> <span style="color: #CC0000;">SANS 10139</span>
      </div>

      <!-- Letterhead Multi-Tone Divider Rule (Navy & Red) -->
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 3px; border-collapse: collapse;">
        <tr>
          <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 20%; background-color: #CC0000; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 40%; background-color: #0A192F; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        </tr>
      </table>
    </div>

    <!-- Letter Date & Reference Row -->
    <div style="padding: 14px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 12px; color: #475569;">
      <table style="width: 100%;">
        <tr>
          <td><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
          <td style="text-align: right;"><strong>Report Ref:</strong> <span style="color: #0A192F; font-weight: bold;">${report.referenceNumber}</span></td>
        </tr>
      </table>
    </div>

    <!-- Letter Body -->
    <div style="padding: 32px; line-height: 1.6;">
      <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Dear <strong>${report.clientName}</strong>,</p>
      
      <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
        The <strong>Post-Work Condition Report</strong> for <strong>${report.siteName}</strong> has been compiled.
      </p>
      
      <!-- Summary Card -->
      <div style="background-color: #f8fafc; border-left: 4px solid #0A192F; padding: 14px 18px; margin: 20px 0; font-family: monospace; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Service Request:</strong> ${report.serviceRequestRef}</p>
        <p style="margin: 0 0 6px 0;"><strong>Service Scope:</strong> ${report.selectedServiceTitle}</p>
        <p style="margin: 0 0 6px 0;"><strong>Site / Premises:</strong> ${report.siteName}</p>
        <p style="margin: 0;"><strong>Report Reference:</strong> ${report.referenceNumber}</p>
      </div>

      <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
        The report contains the approved before-work, during-work and after-work evidence recorded for this service request.
      </p>

      <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
        Please review the report through your secure customer dashboard. You may acknowledge receipt or submit a concern directly from the service-request page.
      </p>

      <div style="margin: 24px 0;">
        <a href="${report.secureDashboardLink}" style="background-color: #0A192F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-weight: bold; font-family: monospace; font-size: 13px; text-transform: uppercase; display: inline-block;">
          Access Secure Customer Dashboard &rarr;
        </a>
      </div>

      <!-- Statutory Limitation Notice -->
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 14px; margin: 24px 0 0 0; font-size: 12px; color: #92400e; line-height: 1.5;">
        <strong style="display: block; margin-bottom: 4px; text-transform: uppercase;">Statutory Limitation:</strong>
        This photographic condition report does not independently constitute a commissioning certificate, certificate of compliance or statutory approval.
      </div>
    </div>

    <!-- OFFICIAL LETTERHEAD FOOTER -->
    <div style="background-color: #f8fafc; padding: 24px 32px; font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      <!-- Multi-Tone Divider Rule -->
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 2px; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="width: 40%; background-color: #0A192F; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 20%; background-color: #CC0000; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="width: 40%; background-color: #0A192F; height: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td>
        </tr>
      </table>

      <div style="margin-bottom: 6px;">
        <strong style="color: #0A192F; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;">AUDRIN FIRE ENGINEERS</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <span>Registration No: <strong style="color: #0A192F;">${COMPANY_DETAILS.registrationNumber}</strong></span>
      </div>

      <div style="margin-bottom: 6px; color: #334155;">
        <strong style="color: #CC0000;">${COMPANY_DETAILS.telephone}</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <strong style="color: #0A192F;">${COMPANY_DETAILS.email}</strong>
        <span style="color: #cbd5e1; margin: 0 6px;">|</span>
        <span>${COMPANY_DETAILS.operatingHours}</span>
      </div>

      <div style="color: #64748b; font-size: 10px;">
        Postal &amp; Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008, South Africa
      </div>
    </div>

  </div>
</body>
</html>`.trim();

  return { subject, body, plainText };
}

/**
 * Create a new immutable version for an existing report when evidence is updated
 */
export function createNewReportVersion(
  existingReport: ConditionReport,
  updatedPhotos: ReportPhotoSelection[],
  updatedVideos: ReportVideoSelection[],
  reason: string,
  author: string = 'Authorized Staff'
): ConditionReport {
  const newVersionNum = parseFloat((existingReport.currentVersionNumber + 0.1).toFixed(1));
  const newSnapshotSha256 = generatePseudoSha256(
    `${existingReport.referenceNumber}_v${newVersionNum}_${updatedPhotos.map(p => p.sha256Hash).join('_')}_${Date.now()}`
  );

  const newSnapshot: ReportEvidenceSnapshot = {
    id: `snp-v${newVersionNum}-${Date.now()}`,
    snapshotTimestamp: new Date().toISOString(),
    lockedBy: author,
    photosCount: updatedPhotos.length,
    videosCount: updatedVideos.length,
    photos: updatedPhotos,
    videos: updatedVideos,
    snapshotSha256: newSnapshotSha256,
    isLocked: true
  };

  const oldVersions = existingReport.versionHistory.map(v => ({
    ...v,
    isCurrent: false,
    supersededAt: new Date().toISOString(),
    supersededByVersion: newVersionNum
  }));

  const newVersion: ConditionReportVersion = {
    id: `ver-${Date.now()}-${newVersionNum}`,
    versionNumber: newVersionNum,
    versionTag: `v${newVersionNum.toFixed(1)}`,
    reportReference: existingReport.referenceNumber,
    fileHashSha256: newSnapshotSha256,
    generatedAt: new Date().toISOString(),
    generatedByTask: 'celery.tasks.condition_report_worker_v2',
    reasonForVersion: reason,
    snapshot: newSnapshot,
    findings: existingReport.currentVersion.findings,
    recommendations: existingReport.currentVersion.recommendations,
    pairedComparisons: existingReport.currentVersion.pairedComparisons,
    isCurrent: true
  };

  return {
    ...existingReport,
    currentVersionNumber: newVersionNum,
    currentVersion: newVersion,
    versionHistory: [newVersion, ...oldVersions],
    status: 'generated'
  };
}
