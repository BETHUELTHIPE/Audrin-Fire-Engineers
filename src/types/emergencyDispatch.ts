export type EmergencyPriorityTier = 'primary' | 'backup' | 'specialist' | 'standby';

export interface EmergencyOnCallEngineer {
  id: string;
  name: string;
  role: string;
  saqccNumber: string;
  saqccLevel: 'Level 1 - Cabler' | 'Level 2 - Installer' | 'Level 3 - Servicing / Commissioner' | 'Level 4 - Designer / Master';
  ecsaNumber?: string;
  dispatchPriority: EmergencyPriorityTier;
  dispatchTitle: string; // e.g. "Primary Incident Commander", "Backup Mobile Unit", "Specialist Networks"
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string; // e.g. "27714156665"
  email: string;
  baseLocation: string;
  regionalCoverage: string[];
  responseEta: string; // e.g. "30 - 60 min"
  specialties: string[];
  panelProficiencies: string[];
  isAvailable24_7: boolean;
  avatarColor: string;
  activeWorkOrdersCount: number;
}

export type EmergencyIncidentSeverity = 'priority_1_critical' | 'priority_2_urgent' | 'priority_3_warning';

export interface EmergencyIncidentType {
  id: string;
  code: string;
  title: string;
  defaultSeverity: EmergencyIncidentSeverity;
  description: string;
  recommendedImmediateAction: string;
  sansClauseRef: string;
}

export interface EmergencyDispatchDocket {
  docketId: string;
  referenceNumber: string;
  siteId: string;
  siteName: string;
  clientOrganisation: string;
  callerName: string;
  callerPhone: string;
  callerRole: string;
  incidentType: string;
  incidentSeverity: EmergencyIncidentSeverity;
  panelModel: string;
  affectedLoopZone: string;
  symptomsDescription: string;
  dispatchedEngineerId: string;
  dispatchedEngineerName: string;
  dispatchedAt: string;
  estimatedArrival: string;
  status: 'dispatched' | 'acknowledged' | 'en_route' | 'on_site' | 'cleared';
  whatsappDeepLink: string;
}

export interface EmergencyEscalationDesk {
  deskTitle: string;
  hotlinePhone: string;
  hotlineDisplay: string;
  emergencyEmail: string;
  physicalCommandBase: string;
  operatingHours: string;
  slaMaxResponseHours: number;
  municipalFireNumbers: {
    region: string;
    department: string;
    phone: string;
    altPhone?: string;
  }[];
}
