import {
  EmailCategory,
  EmailDeliveryLog,
  EmailTemplate,
  ServiceItem,
  HowWeWorkStep
} from '../types';
import { COMPANY_DETAILS, HOW_WE_WORK_STEPS, INITIAL_SERVICES } from '../data/initialData';
import { getAudrinLogoSvgHtml } from '../components/BrandLogo';

export interface EmailGenerationInput {
  clientName: string;
  organisationName?: string;
  clientEmail: string;
  clientPhone?: string;
  requestReference: string;
  selectedServiceSlug?: string;
  subject?: string;
  message?: string;
  buildingType?: string;
  systemType?: string;
  panelModel?: string;
  urgency?: 'standard' | 'high' | 'urgent_emergency';
  preferredDate?: string;
  siteName?: string;
  existingFaultOrRequirement?: string;
  isExistingFollowup?: boolean;
}

export interface EmailGenerationResult {
  classification: EmailCategory;
  isEmergencyFault: boolean;
  isOutOfScope: boolean;
  requiresHumanReview: boolean;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  nextStep: HowWeWorkStep;
  identifiedService?: ServiceItem;
  idempotencyKey: string;
}

// Strictly identify out-of-scope terms (fire extinguishers, sprinklers, CCTV, access control, etc.)
const OUT_OF_SCOPE_KEYWORDS = [
  'extinguisher',
  'extinguishers',
  'hose reel',
  'hose reels',
  'hydrant',
  'hydrants',
  'sprinkler',
  'sprinklers',
  'fire pump',
  'water tank',
  'gas suppression',
  'clean agent',
  'fm200',
  'novic',
  'kitchen hood suppression',
  'fire door',
  'fire doors',
  'emergency lighting',
  'cctv',
  'security camera',
  'burglar alarm',
  'biometric access',
  'turnstile installation'
];

const EMERGENCY_LIFE_SAFETY_KEYWORDS = [
  'fire now',
  'smoke in building',
  'building burning',
  'flames',
  'evacuate',
  'evacuating',
  'people trapped',
  'explosion'
];

export function classifyEnquiry(input: EmailGenerationInput): {
  category: EmailCategory;
  isOutOfScope: boolean;
  isEmergencyFault: boolean;
  requiresHumanReview: boolean;
} {
  const combinedText = `${input.subject || ''} ${input.message || ''} ${input.selectedServiceSlug || ''} ${input.existingFaultOrRequirement || ''}`.toLowerCase();

  // 1. Check for immediate danger / real fire situation
  const hasEmergencyLifeSafety = EMERGENCY_LIFE_SAFETY_KEYWORDS.some(kw => combinedText.includes(kw));

  // 2. Check for out-of-scope items (e.g. extinguishers, sprinklers, CCTV)
  const isOutOfScope = OUT_OF_SCOPE_KEYWORDS.some(kw => combinedText.includes(kw)) &&
    !combinedText.includes('interface') && !combinedText.includes('relay');

  if (isOutOfScope) {
    return {
      category: 'out_of_scope',
      isOutOfScope: true,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 3. Urgent or Emergency Fire-Alarm Fault
  if (
    input.urgency === 'urgent_emergency' ||
    hasEmergencyLifeSafety ||
    input.selectedServiceSlug === 'emergency-fire-alarm-fault-support' ||
    combinedText.includes('emergency fault') ||
    combinedText.includes('panel buzzer cannot silence') ||
    combinedText.includes('system down') ||
    combinedText.includes('loop failure')
  ) {
    return {
      category: 'emergency_fault',
      isOutOfScope: false,
      isEmergencyFault: true,
      requiresHumanReview: false
    };
  }

  // 4. Standard Fault Finding / Repairs
  if (
    input.selectedServiceSlug === 'fire-alarm-fault-finding' ||
    input.selectedServiceSlug === 'fire-alarm-system-repairs' ||
    combinedText.includes('earth fault') ||
    combinedText.includes('trouble light') ||
    combinedText.includes('broken call point') ||
    combinedText.includes('fault code')
  ) {
    return {
      category: 'fire_alarm_fault',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 5. Site Survey
  if (
    input.selectedServiceSlug === 'fire-detection-site-surveys' ||
    combinedText.includes('site survey') ||
    combinedText.includes('survey existing') ||
    combinedText.includes('assess premises')
  ) {
    return {
      category: 'site_survey',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 6. System Design
  if (
    input.selectedServiceSlug === 'fire-alarm-system-design' ||
    combinedText.includes('system design') ||
    combinedText.includes('schematics') ||
    combinedText.includes('design specification')
  ) {
    return {
      category: 'design_enquiry',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 7. Installation
  if (
    input.selectedServiceSlug === 'fire-detection-system-installation' ||
    combinedText.includes('new installation') ||
    combinedText.includes('fit-out installation') ||
    combinedText.includes('install fire alarm')
  ) {
    return {
      category: 'installation_enquiry',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 8. Testing and Commissioning
  if (
    input.selectedServiceSlug === 'fire-alarm-testing-and-commissioning' ||
    input.selectedServiceSlug === 'fire-alarm-acceptance-and-verification-support' ||
    combinedText.includes('commissioning') ||
    combinedText.includes('witness testing') ||
    combinedText.includes('audibility test')
  ) {
    return {
      category: 'testing_commissioning',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 9. Planned Maintenance
  if (
    input.selectedServiceSlug === 'planned-preventative-maintenance' ||
    combinedText.includes('service contract') ||
    combinedText.includes('quarterly service') ||
    combinedText.includes('annual maintenance')
  ) {
    return {
      category: 'maintenance',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 10. False Alarm Management
  if (
    input.selectedServiceSlug === 'false-alarm-investigation-and-management' ||
    combinedText.includes('false alarm') ||
    combinedText.includes('nuisance alarm')
  ) {
    return {
      category: 'false_alarm_investigation',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 11. Upgrades / Modifications
  if (
    input.selectedServiceSlug === 'fire-alarm-modifications-and-upgrades' ||
    input.selectedServiceSlug === 'detector-replacement-and-device-relocation' ||
    combinedText.includes('relocate detector') ||
    combinedText.includes('add offices') ||
    combinedText.includes('partitioning')
  ) {
    return {
      category: 'system_modification',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 12. Documentation / Logbook
  if (
    input.selectedServiceSlug === 'fire-alarm-logbook-support' ||
    input.selectedServiceSlug === 'as-built-drawings-and-system-documentation' ||
    input.selectedServiceSlug === 'fire-alarm-zoning-and-identification' ||
    combinedText.includes('zone chart') ||
    combinedText.includes('logbook') ||
    combinedText.includes('as-built')
  ) {
    return {
      category: 'documentation_logbook',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 13. Training
  if (
    input.selectedServiceSlug === 'system-handover-and-operator-training' ||
    combinedText.includes('operator training') ||
    combinedText.includes('staff training')
  ) {
    return {
      category: 'operator_training',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // 14. Existing Follow-up
  if (input.isExistingFollowup || combinedText.includes('afe-req-') || combinedText.includes('status update on')) {
    return {
      category: 'existing_request_followup',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  // Fallback / General
  if ((input.message && input.message.length > 10) || input.selectedServiceSlug) {
    return {
      category: 'general_enquiry',
      isOutOfScope: false,
      isEmergencyFault: false,
      requiresHumanReview: false
    };
  }

  return {
    category: 'unclear_human_review',
    isOutOfScope: false,
    isEmergencyFault: false,
    requiresHumanReview: true
  };
}

export function generateAutomatedReply(
  input: EmailGenerationInput,
  servicesList: ServiceItem[] = INITIAL_SERVICES,
  stepsList: HowWeWorkStep[] = HOW_WE_WORK_STEPS
): EmailGenerationResult {
  const { category, isOutOfScope, isEmergencyFault, requiresHumanReview } = classifyEnquiry(input);

  // Identify matching service
  const matchedService = servicesList.find(s => s.slug === input.selectedServiceSlug) ||
    servicesList.find(s => s.title.toLowerCase().includes(category.replace(/_/g, ' ')));

  // Identify next How We Work step
  let nextStep = stepsList[0]; // Step 1 default

  if (category === 'site_survey') {
    nextStep = stepsList[1]; // Step 2: Site Survey
  } else if (category === 'design_enquiry') {
    nextStep = stepsList[2]; // Step 3: Design
  } else if (category === 'installation_enquiry') {
    nextStep = stepsList[3]; // Step 4: Scope & Quotation before installation
  } else if (category === 'testing_commissioning') {
    nextStep = stepsList[5]; // Step 6: Testing & Commissioning
  } else if (category === 'maintenance' || category === 'operator_training') {
    nextStep = stepsList[6]; // Step 7: Handover & Maintenance
  } else if (category === 'emergency_fault' || category === 'fire_alarm_fault') {
    nextStep = stepsList[1]; // Rapid Diagnostic Assessment
  }

  const clientName = input.clientName || 'Valued Client';
  const orgText = input.organisationName ? ` (${input.organisationName})` : '';
  const refNum = input.requestReference;
  const siteDesc = input.siteName || 'your commercial premises';
  const summary = input.message || input.selectedServiceSlug || 'Fire-detection service assessment';
  const panel = input.panelModel || 'Not specified';
  const portalUrl = `https://ais-dev-z5irnmrvpckqfjqocrirde-623077062117.europe-west2.run.app/#customer-portal?ref=${refNum}`;

  let subject = `Acknowledgement: Service Request ${refNum} - Audrin Fire Engineers`;
  let serviceSpecificGuidanceHtml = '';
  let serviceSpecificGuidanceText = '';
  let requiredDocsText = 'Please provide architectural floor plans, existing system drawings, or panel photos where available.';

  if (isOutOfScope) {
    subject = `Service Scope Clarification: Ref ${refNum} - Audrin Fire Engineers`;
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px; margin: 16px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 6px 0; color: #92400e; font-size: 15px;">Scope of Service Notice</h4>
        <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">
          Audrin Fire Engineers operates strictly within the domain of <strong>commercial and non-domestic electronic fire-detection and fire-alarm systems</strong>.
          We do not supply or service physical suppression hardware (such as fire extinguishers, hose reels, fire hydrants, sprinklers, or gas suppression) or standalone security/CCTV cameras.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #78350f;">
          If you require electronic fire-alarm design, panel fault diagnostic finding, detector installation, or commissioning, our technical team remains at your full disposal.
        </p>
      </div>
    `;
    serviceSpecificGuidanceText = `
SCOPE OF SERVICE NOTICE:
Audrin Fire Engineers specializes strictly in commercial and non-domestic electronic fire-detection and fire-alarm systems. We do not provide physical suppression hardware (extinguishers, hose reels, sprinklers) or CCTV/security systems.
If you have fire-detection or fire-alarm requirements, our engineering team will gladly assist.`;
  } else if (isEmergencyFault) {
    subject = `PRIORITY TRIAGE: Fire-Alarm Fault Reported (Ref ${refNum}) - Audrin Fire Engineers`;
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; color: #991b1b; font-weight: bold; font-size: 14px;">CRITICAL LIFE-SAFETY PROTOCOL:</p>
        <p style="margin: 0; font-size: 13px; color: #7f1d1d; line-height: 1.5;">
          If there is an active fire, smoke condition, or immediate danger, follow the building's emergency evacuation procedure and contact municipal emergency services immediately. 
          Do not attempt to disable, bridge, or tamper with life-safety monitoring circuits.
        </p>
      </div>
      <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 14px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Reported System / Panel:</strong> ${panel}</p>
        <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Site Location:</strong> ${siteDesc}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Next Immediate Action:</strong> A senior fire diagnostics engineer has been notified to initiate diagnostic triage.</p>
      </div>
    `;
    serviceSpecificGuidanceText = `
CRITICAL LIFE-SAFETY PROTOCOL:
If there is an active fire, smoke condition, or immediate danger, follow building evacuation procedures and call municipal emergency services immediately. Do not disable life-safety circuits.

Reported System/Panel: ${panel}
Site Location: ${siteDesc}
Action: Escalated for immediate diagnostic triage.`;
  } else if (category === 'site_survey') {
    subject = `Site Survey Request Received: ${refNum} - Audrin Fire Engineers`;
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; margin: 16px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Next Stage: ${nextStep.title}</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
          ${nextStep.detailedDescription}
        </p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #0369a1;">
          <strong>Site Preparation:</strong> Please ensure ceiling voids, riser ducts, and plant rooms will be accessible during the inspection.
        </p>
      </div>
    `;
    serviceSpecificGuidanceText = `
NEXT STAGE: ${nextStep.title}
${nextStep.detailedDescription}
Site Preparation: Please ensure ceiling voids, riser ducts, and plant rooms will be accessible during the inspection.`;
  } else if (category === 'design_enquiry') {
    subject = `Fire-Alarm Design Consultation: ${refNum} - Audrin Fire Engineers`;
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; margin: 16px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Next Stage: ${nextStep.title}</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
          Compliant engineering design begins after building drawings, occupancy category, fire strategy matrices, and physical conditions are reviewed.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #0369a1;">
          <strong>Required Documents:</strong> Architectural CAD plans (DWG/PDF), fire strategy report, and details of third-party interfaces (HVAC, dampers, access control).
        </p>
      </div>
    `;
    serviceSpecificGuidanceText = `
NEXT STAGE: ${nextStep.title}
Compliant engineering design begins after building drawings, occupancy category, and fire strategy matrices are reviewed.
Required Documents: Architectural CAD plans (DWG/PDF), fire strategy report, and details of third-party interfaces.`;
  } else if (category === 'installation_enquiry') {
    subject = `Fire-Detection Installation Enquiry: ${refNum} - Audrin Fire Engineers`;
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; margin: 16px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Next Stage: ${nextStep.title}</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
          Before on-site cabling commences, technical specifications and formal itemised scope must be approved.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #0369a1;">
          <strong>Next Action:</strong> Our team will review your installation parameters and confirm milestone schedules.
        </p>
      </div>
    `;
    serviceSpecificGuidanceText = `
NEXT STAGE: ${nextStep.title}
Before cabling commences, technical specifications and formal itemised scope must be approved.`;
  } else {
    serviceSpecificGuidanceHtml = `
      <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 14px; margin: 16px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">Next Stage: ${nextStep.title}</h4>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
          ${nextStep.detailedDescription}
        </p>
      </div>
    `;
    serviceSpecificGuidanceText = `
NEXT STAGE: ${nextStep.title}
${nextStep.detailedDescription}`;
  }

  const logoSvg = getAudrinLogoSvgHtml(280, 60);

  const htmlBody = `
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
    <div style="padding: 14px 32px; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 12px; color: #475569; display: flex; justify-content: space-between;">
      <span><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      <span style="float: right;"><strong>Ref:</strong> <span style="color: #CC0000; font-weight: bold;">${refNum}</span></span>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">
        Dear <strong>${clientName}</strong>${orgText},
      </p>

      <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        Thank you for contacting Audrin Fire Engineers. We have registered your request under reference 
        <strong style="color: #0A192F; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${refNum}</strong>.
      </p>

      <!-- Enquiry Summary Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; width: 140px; font-family: monospace;"><strong>Reference:</strong></td>
            <td style="padding: 5px 0; color: #0A192F; font-weight: bold; font-family: monospace;">${refNum}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;"><strong>Premises / Site:</strong></td>
            <td style="padding: 5px 0; color: #0A192F;">${siteDesc}</td>
          </tr>
          ${matchedService ? `
          <tr>
            <td style="padding: 5px 0; color: #64748b;"><strong>Selected Service:</strong></td>
            <td style="padding: 5px 0; color: #0A192F; font-weight: 600;">${matchedService.title}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 5px 0; color: #64748b;"><strong>Urgency Level:</strong></td>
            <td style="padding: 5px 0; color: ${isEmergencyFault ? '#CC0000' : '#0A192F'}; font-weight: ${isEmergencyFault ? 'bold' : '600'};">
              ${isEmergencyFault ? 'HIGH PRIORITY / EMERGENCY FAULT' : 'Standard Commercial Scope'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Specific Guidance -->
      ${serviceSpecificGuidanceHtml}

      <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 20px 0 16px 0;">
        Our engineering team will review the submitted information and contact you to confirm the next step.
      </p>

      <!-- Portal Button -->
      <div style="margin: 24px 0; text-align: left;">
        <a href="${portalUrl}" style="display: inline-block; background-color: #0A192F; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 3px; font-weight: bold; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em;">
          Track Request in Portal &rarr;
        </a>
      </div>

      <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        * Note: All design, installation, commissioning, and servicing work is executed strictly in alignment with applicable SANS 10139 fire-detection requirements.
      </p>
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
</html>
  `.trim();

  const plainTextBody = `
================================================================================
AUDRIN FIRE ENGINEERS
FIRE DETECTION & ALARM SYSTEMS | SANS 10139
================================================================================
Registration No: ${COMPANY_DETAILS.registrationNumber}
Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}
Reference: ${refNum}

Dear ${clientName}${orgText},

Thank you for contacting Audrin Fire Engineers. We have registered your request under reference ${refNum}.

REQUEST DETAILS:
- Reference: ${refNum}
- Premises / Site: ${siteDesc}
- Service: ${matchedService ? matchedService.title : 'Fire-Detection Scope'}
- Urgency: ${isEmergencyFault ? 'HIGH PRIORITY / EMERGENCY FAULT' : 'Standard'}

${serviceSpecificGuidanceText}

Our engineering team will review the submitted information and contact you to confirm the next step.

To track your request in the portal:
${portalUrl}

--------------------------------------------------------------------------------
AUDRIN FIRE ENGINEERS | Registration No: ${COMPANY_DETAILS.registrationNumber}
Telephone: ${COMPANY_DETAILS.telephone} | Email: ${COMPANY_DETAILS.email}
Hours: ${COMPANY_DETAILS.operatingHours}
Postal & Residential Address: 27 Tshivhase Street, Pretoria West, Pretoria, 0008
================================================================================
  `.trim();

  const idempotencyKey = `idemp_${refNum}_${Date.now()}`;

  return {
    classification: category,
    isEmergencyFault,
    isOutOfScope,
    requiresHumanReview,
    subject,
    htmlBody,
    plainTextBody,
    nextStep,
    identifiedService: matchedService,
    idempotencyKey
  };
}
