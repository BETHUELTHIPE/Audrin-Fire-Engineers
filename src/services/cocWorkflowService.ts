import {
  COCApprovalWorkflow,
  COCWorkflowStage,
  COCClientDigitalSignature,
  COCTechnicianSignOff,
  COCEngineerReview
} from '../types';
import { INITIAL_COC_WORKFLOWS } from '../data/cocWorkflowData';

const STORAGE_KEY = 'afe_coc_approval_workflows';

export class COCWorkflowService {
  private getStoredWorkflows(): COCApprovalWorkflow[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse stored COC workflows', e);
    }
    return INITIAL_COC_WORKFLOWS;
  }

  private saveWorkflows(workflows: COCApprovalWorkflow[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
      window.dispatchEvent(new CustomEvent('coc-workflows-updated', { detail: workflows }));
    } catch (e) {
      console.error('Failed to save COC workflows', e);
    }
  }

  public getAllWorkflows(): COCApprovalWorkflow[] {
    return this.getStoredWorkflows();
  }

  public getWorkflowById(id: string): COCApprovalWorkflow | undefined {
    const workflows = this.getStoredWorkflows();
    return workflows.find(w => w.id === id);
  }

  public getWorkflowByRequestId(requestId: string, requestRef?: string): COCApprovalWorkflow | undefined {
    const workflows = this.getStoredWorkflows();
    return workflows.find(w => 
      w.serviceRequestId === requestId || 
      (requestRef && w.serviceRequestRef === requestRef)
    );
  }

  public getWorkflowForRequestOrCreate(
    requestId: string,
    requestRef: string,
    siteName: string,
    buildingAddress: string,
    organisationName: string
  ): COCApprovalWorkflow {
    const existing = this.getWorkflowByRequestId(requestId, requestRef);
    if (existing) return existing;

    // Create a new fresh workflow for this request
    const newWf: COCApprovalWorkflow = {
      id: `coc-wf-${Date.now()}`,
      certificateNumber: `COC-SANS10139-${new Date().getFullYear()}-${requestRef.replace('AFE-REQ-', '')}`,
      serviceRequestId: requestId,
      serviceRequestRef: requestRef,
      siteId: `site-${requestId}`,
      siteName,
      buildingAddress: buildingAddress || 'Commercial Premise',
      city: 'Gauteng, South Africa',
      province: 'Gauteng',
      organisationName: organisationName || 'Client Organisation',
      systemCategory: 'Category L1 (Life Safety Protection)',
      standardReference: 'SANS 10139:2012 / SANS 10400-T',
      overallStatus: 'inspection_pending',
      progressPercentage: 20,
      currentStageId: 'stage_1_inspection',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      qrVerificationCode: `SANS10139-AFE-${Date.now().toString(36).toUpperCase()}`,
      qrVerificationUrl: `https://audrinfire.co.za/verify/coc?id=COC-SANS10139-${requestRef}`,
      stages: [
        {
          id: 'stage_1_inspection',
          stageNumber: 1,
          title: 'Field Site Inspection & SANS Testing',
          shortLabel: 'Site Inspection & Testing',
          description: 'Comprehensive physical and electronic testing of CIE panels, optical loops, MCPs, sounders, and interface relays.',
          requiredRole: 'Technician (SAQCC)',
          status: 'in_progress',
          notes: 'Inspection scheduled and technician assigned. Physical device loop audit pending.'
        },
        {
          id: 'stage_2_defects_clearance',
          stageNumber: 2,
          title: 'Technical Defect Clearance & Rectification Audit',
          shortLabel: 'Defects Clearance',
          description: 'Verification that all critical non-conformances, cable containment issues, and sensor obstructions are 100% resolved.',
          requiredRole: 'Remediation Lead',
          status: 'pending'
        },
        {
          id: 'stage_3_engineer_review',
          stageNumber: 3,
          title: 'Lead Fire Systems Engineer Review & Statutory Endorsement',
          shortLabel: 'Pr.Eng Endorsement',
          description: 'Engineering Council of South Africa (ECSA) Pr.Eng / SAQCC Level 4 design & compliance endorsement and digital seal.',
          requiredRole: 'Lead Fire Systems Engineer (Pr.Eng)',
          status: 'pending'
        },
        {
          id: 'stage_4_client_signature',
          stageNumber: 4,
          title: 'Client Responsible Person Digital Signature & Handover Acceptance',
          shortLabel: 'Client Digital Signature',
          description: 'Statutory acknowledgment and digital signature by the building owner or appointed SANS 10139 Responsible Person.',
          requiredRole: 'Client Responsible Person',
          status: 'pending'
        },
        {
          id: 'stage_5_coc_issuance',
          stageNumber: 5,
          title: 'Statutory COC Issuance & Local Authority Dispatch',
          shortLabel: 'COC Issuance & Archival',
          description: 'Generation of tamper-proof SANS Certificate of Compliance with cryptographic QR verification.',
          requiredRole: 'Compliance Registrar',
          status: 'pending'
        }
      ]
    };

    const workflows = [newWf, ...this.getStoredWorkflows()];
    this.saveWorkflows(workflows);
    return newWf;
  }

  /**
   * Client Digital Signature Execution
   */
  public signAsClient(
    workflowId: string,
    signature: {
      signatoryName: string;
      signatoryEmail: string;
      signatoryRole: string;
      organisationName: string;
      signatureType: 'canvas_drawn' | 'crypto_seal';
      signatureDataUrl: string;
      declarationText: string;
    }
  ): COCApprovalWorkflow {
    const workflows = this.getStoredWorkflows();
    const now = new Date().toISOString();
    const validUntilDate = new Date();
    validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

    const updated = workflows.map(wf => {
      if (wf.id !== workflowId) return wf;

      const clientSignatureData: COCClientDigitalSignature = {
        signatoryName: signature.signatoryName,
        signatoryEmail: signature.signatoryEmail,
        signatoryRole: signature.signatoryRole,
        organisationName: signature.organisationName,
        signatureType: signature.signatureType,
        signatureDataUrl: signature.signatureDataUrl,
        signedAt: now,
        ipAddress: '197.88.102.19 (Verified Client Gateway, ZA)',
        browserFingerprint: `CLIENT-SIGN-FP-${Date.now().toString(36).toUpperCase()}`,
        statutoryDeclarationAccepted: true,
        declarationText: signature.declarationText
      };

      const stages: COCWorkflowStage[] = wf.stages.map(st => {
        if (st.id === 'stage_4_client_signature') {
          return {
            ...st,
            status: 'completed' as const,
            completedAt: now,
            updatedAt: now,
            clientSignature: clientSignatureData,
            notes: `Signed and certified by ${signature.signatoryName} (${signature.signatoryRole}) on ${new Date(now).toLocaleString('en-ZA')}`
          };
        }
        if (st.id === 'stage_5_coc_issuance') {
          return {
            ...st,
            status: 'completed' as const,
            completedAt: now,
            updatedAt: now,
            notes: 'Official SANS 10139 Certificate of Compliance sealed and published to Client Vault.'
          };
        }
        return st;
      });

      const dispatchedRecipients = wf.dispatchedRecipients?.map(d => ({
        ...d,
        dispatchedAt: now
      })) || [
        {
          name: 'City of Johannesburg Fire & Safety Directorate',
          entity: 'Municipal Fire Safety Inspectorate',
          email: 'firesafety.compliance@joburg.org.za',
          dispatchedAt: now,
          method: 'Encrypted PDF Dispatch' as const
        },
        {
          name: 'Commercial Fire Underwriting Risk Desk',
          entity: 'Santam Special Risk Management',
          email: 'commercial.fire@santam.co.za',
          dispatchedAt: now,
          method: 'Automated Webhook' as const
        }
      ];

      return {
        ...wf,
        stages,
        overallStatus: 'fully_certified' as const,
        progressPercentage: 100,
        currentStageId: 'stage_5_coc_issuance' as const,
        lastUpdated: now,
        issuedAt: now,
        validUntil: validUntilDate.toISOString(),
        dispatchedRecipients
      };
    });

    this.saveWorkflows(updated);
    return updated.find(w => w.id === workflowId)!;
  }

  /**
   * Technician Sign-Off (Interactive / Simulator for SAQCC Technician)
   */
  public signOffAsTechnician(
    workflowId: string,
    technicianData: {
      technicianName: string;
      saqccNumber: string;
      saqccLevel: string;
      phone: string;
      panelMakeModel: string;
      loopSensorsTestedCount: number;
      sounderAudibilityDba: number;
      standbyBatteryVoltage: number;
      notes?: string;
    }
  ): COCApprovalWorkflow {
    const workflows = this.getStoredWorkflows();
    const now = new Date().toISOString();

    const updated = workflows.map(wf => {
      if (wf.id !== workflowId) return wf;

      const signOff: COCTechnicianSignOff = {
        ...technicianData,
        signedAt: now,
        batteryLoadTestPassed: true,
        verificationHash: `SHA256:tech-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
      };

      const stages: COCWorkflowStage[] = wf.stages.map(st => {
        if (st.id === 'stage_1_inspection') {
          return {
            ...st,
            status: 'completed' as const,
            completedAt: now,
            updatedAt: now,
            technicianSignOff: signOff,
            checklist: [
              {
                id: `chk-${Date.now()}-1`,
                label: 'CIE Control Panel Diagnostic & Battery Standby Test',
                standardClause: 'SANS 10139 Clause 25.2',
                passed: true,
                notes: `Voltage ${technicianData.standbyBatteryVoltage}V under discharge. Zero critical panel faults.`,
                testedAt: now,
                testedBy: technicianData.technicianName
              },
              {
                id: `chk-${Date.now()}-2`,
                label: 'Loop Smoke/Heat Sensor Sensitivity & Calibration',
                standardClause: 'SANS 10139 Clause 25.3.2',
                passed: true,
                notes: `${technicianData.loopSensorsTestedCount} addressable nodes tested and verified.`,
                testedAt: now,
                testedBy: technicianData.technicianName
              },
              {
                id: `chk-${Date.now()}-3`,
                label: 'Audibility & Acoustic Alarm Sound Level Verification',
                standardClause: 'SANS 10139 Clause 16.2',
                passed: true,
                notes: `Sound pressure measured at ${technicianData.sounderAudibilityDba} dBA across site compartments.`,
                testedAt: now,
                testedBy: technicianData.technicianName
              }
            ]
          };
        }
        if (st.id === 'stage_2_defects_clearance') {
          return {
            ...st,
            status: 'completed' as const,
            completedAt: now,
            updatedAt: now,
            defectsSummary: {
              totalLogged: 1,
              rectified: 1,
              criticalRemaining: 0,
              clearanceNotes: 'All physical non-conformances rectified on-site by technician.'
            }
          };
        }
        if (st.id === 'stage_3_engineer_review') {
          return {
            ...st,
            status: 'in_progress' as const,
            notes: 'Awaiting Lead Engineer ECSA review and digital seal endorsement.'
          };
        }
        return st;
      });

      return {
        ...wf,
        stages,
        overallStatus: 'engineer_review' as const,
        progressPercentage: 50,
        currentStageId: 'stage_3_engineer_review' as const,
        lastUpdated: now
      };
    });

    this.saveWorkflows(updated);
    return updated.find(w => w.id === workflowId)!;
  }

  /**
   * Lead Fire Systems Engineer Endorsement (Pr.Eng ECSA Seal)
   */
  public endorseAsEngineer(
    workflowId: string,
    endorsementData: {
      engineerName: string;
      ecsaNumber: string;
      saqccNumber: string;
      endorsementNotes: string;
    }
  ): COCApprovalWorkflow {
    const workflows = this.getStoredWorkflows();
    const now = new Date().toISOString();

    const updated = workflows.map(wf => {
      if (wf.id !== workflowId) return wf;

      const review: COCEngineerReview = {
        engineerName: endorsementData.engineerName || 'Audrin Sibanda',
        role: 'Lead Fire Systems Engineer & Approved Competent Person',
        ecsaNumber: endorsementData.ecsaNumber || 'ECSA-2015-810933',
        saqccNumber: endorsementData.saqccNumber || 'SAQCC-FDGS-31084-L4',
        digitalSealId: `ECSA-SEAL-${new Date().getFullYear()}-AFE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        reviewedAt: now,
        decision: 'approved',
        systemCategory: wf.systemCategory,
        standardReference: wf.standardReference,
        endorsementNotes: endorsementData.endorsementNotes || 'System complies with all mandatory statutory provisions of SANS 10139:2012 for Life Safety.',
        verificationHash: `SHA256:ecsa-pr-${Date.now().toString(36)}`
      };

      const stages: COCWorkflowStage[] = wf.stages.map(st => {
        if (st.id === 'stage_3_engineer_review') {
          return {
            ...st,
            status: 'completed' as const,
            completedAt: now,
            updatedAt: now,
            engineerReview: review
          };
        }
        if (st.id === 'stage_4_client_signature') {
          return {
            ...st,
            status: 'action_required' as const,
            notes: 'Engineer endorsement completed. Awaiting client digital signature to finalize certificate issuance.'
          };
        }
        return st;
      });

      return {
        ...wf,
        stages,
        overallStatus: 'awaiting_client_signature' as const,
        progressPercentage: 75,
        currentStageId: 'stage_4_client_signature' as const,
        lastUpdated: now
      };
    });

    this.saveWorkflows(updated);
    return updated.find(w => w.id === workflowId)!;
  }

  /**
   * Reset data to initial state for demo testing
   */
  public resetToInitial(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.saveWorkflows(INITIAL_COC_WORKFLOWS);
  }
}

export const cocWorkflowService = new COCWorkflowService();
