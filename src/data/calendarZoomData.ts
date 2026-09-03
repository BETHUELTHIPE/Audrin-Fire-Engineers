import {
  Appointment,
  ZoomSecretConfiguration,
  GoogleCalendarConnection,
  ZoomMeetingAccessLog,
  CalendarSyncJob,
  CalendarWebhookChannel,
  IntegrationMetrics
} from '../types';

export const INITIAL_ZOOM_SECRET_CONFIG: ZoomSecretConfiguration = {
  secretArn: 'arn:aws:secretsmanager:af-south-1:123456789012:secret:audrin/zoom/personal-meeting-room-7A9bC',
  secretName: 'audrin/zoom/personal-meeting-room',
  pmiMasked: '••• ••• ••••',
  passcodeMasked: '••••••',
  waitingRoomEnabled: true,
  hostApprovalRequired: true,
  meetingLockedOnJoin: true,
  muteOnEntry: true,
  screenShareHostOnly: true,
  authRequired: true,
  lastRotated: '2026-08-15T08:00:00Z',
  rotationIntervalDays: 90
};

// Internal decrypted mock cache (accessible ONLY via authenticated simulation service)
export const INTERNAL_ZOOM_SECRETS_VAULT = {
  pmi: '849 3920 1842',
  passcode: '784920',
  directJoinUrl: 'https://us05web.zoom.us/j/84939201842?pwd=cWJtWnJ1SXRmQ094M01qZEg5RHF0UT09',
  hostKey: '849201',
  defaultInvitationText: `Topic: Audrin Fire Engineers - Personal Meeting Room\n\nJoin Zoom Meeting:\nhttps://us05web.zoom.us/j/84939201842?pwd=cWJtWnJ1SXRmQ094M01qZEg5RHF0UT09\n\nMeeting ID: 849 3920 1842\nPasscode: 784920`
};

export const INITIAL_GOOGLE_CALENDAR_CONNECTION: GoogleCalendarConnection = {
  id: 'gcal-conn-01',
  serviceAccountEmail: 'audrin-calendar-service@audrin-fire-engineers.iam.gserviceaccount.com',
  calendarId: 'c_audrin_fire_appointments_af_south_1@group.calendar.google.com',
  primaryTimezone: 'Africa/Johannesburg',
  syncEnabled: true,
  pushNotificationChannelActive: true,
  lastSyncAuditAt: '2026-09-02T08:15:00Z'
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-2026-001',
    title: 'Audrin Fire Engineers – Pre-Work Condition Report review – SR-2026-0891',
    appointmentType: 'pre_work_report_review',
    status: 'confirmed',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'SR-2026-0891',
    organisationId: 'org-sandton-01',
    organisationName: 'Mercantile Properties Ltd',
    siteId: 'site-mercantile-01',
    siteName: 'Sandton City Financial Tower',
    scheduledStart: '2026-09-03T10:00:00+02:00',
    scheduledEnd: '2026-09-03T11:00:00+02:00',
    timezone: 'Africa/Johannesburg',
    clientId: 'user-001',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@mercantile.co.za',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Bethuel Moukangwe (Lead Fire Engineer)',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    purpose: 'Review statutory Pre-Work Condition Report (SANS 10139 Section 4.2), panel loop 3 wiring degradation, and agree on remediation timetable.',
    safePreparationInstructions: 'Please ensure your facilities manager and building maintenance engineer have access to the building floorplans. Pre-work photo evidence is available in the secure client portal.',
    attendees: [
      {
        id: 'att-001',
        appointmentId: 'appt-2026-001',
        name: 'Sarah Jenkins',
        email: 'sarah.j@mercantile.co.za',
        role: 'client',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: false
      },
      {
        id: 'att-002',
        appointmentId: 'appt-2026-001',
        name: 'Bethuel Moukangwe',
        email: 'bethuelmoukangwe8@gmail.com',
        role: 'staff',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: true
      },
      {
        id: 'att-003',
        appointmentId: 'appt-2026-001',
        name: 'David Khoza (Site Operations)',
        email: 'david.k@mercantile.co.za',
        role: 'client',
        rsvpStatus: 'accepted',
        isRequired: false,
        isHost: false
      }
    ],
    googleCalendarEventId: 'gcal_evt_7f8a9b1c2d3e4f5',
    googleCalendarSyncStatus: 'synced',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=Z2NhbF9ldnRfc2FuZHRvbl8wODkx',
    googleCalendarIcsUrl: '/api/calendar/appointments/appt-2026-001/export.ics',
    lastSyncedAt: '2026-09-02T08:10:00Z',
    zoomMeetingStatus: 'ready',
    hasPowerPoint: true,
    powerPointS3Key: 'organisations/org-sandton-01/sites/site-mercantile-01/reports/presentations/v1.2-sans10139-prework-presentation.pptx',
    powerPointFilename: 'Audrin-Fire-SANS10139-PreWork-Report-Review.pptx',
    powerPointVersion: 'v1.2 (SANS 10139 Audit Review)',
    remindersConfig: {
      twentyFourHour: true,
      oneHour: true,
      fifteenMinute: true,
      sentHistory: ['24h_email_sent_2026-09-02T10:00:00Z']
    },
    notes: 'Client requested specific focus on Ziton ZP3 loop fault troubleshooting.',
    createdAt: '2026-09-01T09:30:00Z',
    updatedAt: '2026-09-02T08:10:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'appt-2026-002',
    title: 'Audrin Fire Engineers – Fire-alarm fault consultation – SR-2026-0892',
    appointmentType: 'fault_consultation',
    status: 'confirmed',
    serviceRequestId: 'req-002',
    serviceRequestRef: 'SR-2026-0892',
    organisationId: 'org-rosebank-02',
    organisationName: 'Apex Logistics Hub',
    siteId: 'site-apex-02',
    siteName: 'Apex Distribution Center Midrand',
    scheduledStart: '2026-09-03T14:00:00+02:00',
    scheduledEnd: '2026-09-03T14:45:00+02:00',
    timezone: 'Africa/Johannesburg',
    clientId: 'user-002',
    clientName: 'Johan van der Merwe',
    clientEmail: 'johan@apexlogistics.co.za',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Bethuel Moukangwe (Lead Fire Engineer)',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    purpose: 'Urgent consultation on Zone 4 optical beam detector intermittent ground fault causing false alarms in cold storage bay.',
    safePreparationInstructions: 'Please take clear photographs of the fire panel LCD screen fault code before the meeting and upload to the portal.',
    attendees: [
      {
        id: 'att-004',
        appointmentId: 'appt-2026-002',
        name: 'Johan van der Merwe',
        email: 'johan@apexlogistics.co.za',
        role: 'client',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: false
      },
      {
        id: 'att-005',
        appointmentId: 'appt-2026-002',
        name: 'Bethuel Moukangwe',
        email: 'bethuelmoukangwe8@gmail.com',
        role: 'staff',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: true
      }
    ],
    googleCalendarEventId: 'gcal_evt_9a8b7c6d5e4f3a2',
    googleCalendarSyncStatus: 'synced',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=Z2NhbF9ldnRfYXBleF8wODky',
    googleCalendarIcsUrl: '/api/calendar/appointments/appt-2026-002/export.ics',
    lastSyncedAt: '2026-09-02T08:12:00Z',
    zoomMeetingStatus: 'ready',
    hasPowerPoint: false,
    remindersConfig: {
      twentyFourHour: true,
      oneHour: true,
      fifteenMinute: true,
      sentHistory: []
    },
    createdAt: '2026-09-01T14:15:00Z',
    updatedAt: '2026-09-02T08:12:00Z',
    createdBy: 'staff-001'
  },
  {
    id: 'appt-2026-003',
    title: 'Audrin Fire Engineers – Post-Work Condition Report presentation – SR-2026-0885',
    appointmentType: 'post_work_report_presentation',
    status: 'confirmed',
    serviceRequestId: 'req-003',
    serviceRequestRef: 'SR-2026-0885',
    organisationId: 'org-jhb-03',
    organisationName: 'Growthpoint Properties Gauteng',
    siteId: 'site-growthpoint-03',
    siteName: 'Waterfall City Commercial Park',
    scheduledStart: '2026-09-04T09:30:00+02:00',
    scheduledEnd: '2026-09-04T10:30:00+02:00',
    timezone: 'Africa/Johannesburg',
    clientId: 'user-003',
    clientName: 'Lindiwe Ndlovu',
    clientEmail: 'lindiwe.n@growthpoint.co.za',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Bethuel Moukangwe (Lead Fire Engineer)',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    purpose: 'Presentation of Post-Work SANS 10139 Verification Report, sound pressure test measurements (65 dBA / 75 dBA at bedhead), and handover documentation.',
    safePreparationInstructions: 'All sound pressure audios and thermal imaging scans have been processed and archived in private S3 media vault.',
    attendees: [
      {
        id: 'att-006',
        appointmentId: 'appt-2026-003',
        name: 'Lindiwe Ndlovu',
        email: 'lindiwe.n@growthpoint.co.za',
        role: 'client',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: false
      },
      {
        id: 'att-007',
        appointmentId: 'appt-2026-003',
        name: 'Bethuel Moukangwe',
        email: 'bethuelmoukangwe8@gmail.com',
        role: 'staff',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: true
      },
      {
        id: 'att-008',
        appointmentId: 'appt-2026-003',
        name: 'Kagiso Molefe (Occupational Health & Safety)',
        email: 'kagiso.m@growthpoint.co.za',
        role: 'observer',
        rsvpStatus: 'tentative',
        isRequired: false,
        isHost: false
      }
    ],
    googleCalendarEventId: 'gcal_evt_1b2c3d4e5f6a7b8',
    googleCalendarSyncStatus: 'synced',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=Z2NhbF9ldnRfd2F0ZXJmYWxsXzA4ODU',
    googleCalendarIcsUrl: '/api/calendar/appointments/appt-2026-003/export.ics',
    lastSyncedAt: '2026-09-02T08:14:00Z',
    zoomMeetingStatus: 'ready',
    hasPowerPoint: true,
    powerPointS3Key: 'organisations/org-jhb-03/sites/site-growthpoint-03/reports/presentations/v2.0-sans10139-postwork-verification.pptx',
    powerPointFilename: 'Audrin-Fire-PostWork-Handover-Presentation-v2.0.pptx',
    powerPointVersion: 'v2.0 (Statutory Handover)',
    remindersConfig: {
      twentyFourHour: true,
      oneHour: true,
      fifteenMinute: true,
      sentHistory: []
    },
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-02T08:14:00Z',
    createdBy: 'admin-001'
  },
  {
    id: 'appt-2026-004',
    title: 'Audrin Fire Engineers – Handover meeting – SR-2026-0870',
    appointmentType: 'handover_meeting',
    status: 'completed',
    serviceRequestId: 'req-004',
    serviceRequestRef: 'SR-2026-0870',
    organisationId: 'org-pretoria-04',
    organisationName: 'Tshwane Medipark Clinic',
    siteId: 'site-tshwane-04',
    siteName: 'Tshwane Specialist Medical Wing',
    scheduledStart: '2026-09-01T11:00:00+02:00',
    scheduledEnd: '2026-09-01T12:00:00+02:00',
    timezone: 'Africa/Johannesburg',
    clientId: 'user-004',
    clientName: 'Dr. Kobus Erasmus',
    clientEmail: 'kobus@tshwanemedipark.co.za',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Bethuel Moukangwe (Lead Fire Engineer)',
    assignedStaffEmail: 'bethuelmoukangwe8@gmail.com',
    purpose: 'Formal system commissioning sign-off, operator training on Morley-IAS panel, and logbook procedures.',
    safePreparationInstructions: 'Sign-off documents prepared in statutory forms vault.',
    attendees: [
      {
        id: 'att-009',
        appointmentId: 'appt-2026-004',
        name: 'Dr. Kobus Erasmus',
        email: 'kobus@tshwanemedipark.co.za',
        role: 'client',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: false,
        attended: true
      },
      {
        id: 'att-010',
        appointmentId: 'appt-2026-004',
        name: 'Bethuel Moukangwe',
        email: 'bethuelmoukangwe8@gmail.com',
        role: 'staff',
        rsvpStatus: 'accepted',
        isRequired: true,
        isHost: true,
        attended: true
      }
    ],
    googleCalendarEventId: 'gcal_evt_5e6f7a8b9c0d1e2',
    googleCalendarSyncStatus: 'synced',
    googleCalendarHtmlLink: 'https://calendar.google.com/calendar/event?eid=Z2NhbF9ldnRfdHNod2FuZV8wODcw',
    lastSyncedAt: '2026-09-01T12:05:00Z',
    zoomMeetingStatus: 'completed',
    hasPowerPoint: true,
    powerPointS3Key: 'organisations/org-pretoria-04/sites/site-tshwane-04/reports/presentations/v1.0-commissioning-handover.pptx',
    powerPointFilename: 'Tshwane-Medipark-Commissioning-Handover.pptx',
    powerPointVersion: 'v1.0 Final',
    remindersConfig: {
      twentyFourHour: true,
      oneHour: true,
      fifteenMinute: true,
      sentHistory: ['24h_email_sent', '1h_email_sent']
    },
    outcomes: {
      id: 'out-001',
      appointmentId: 'appt-2026-004',
      recordedByUserId: 'staff-001',
      recordedByName: 'Bethuel Moukangwe',
      recordedAt: '2026-09-01T12:15:00Z',
      actualStartTime: '2026-09-01T11:02:00+02:00',
      actualEndTime: '2026-09-01T11:58:00+02:00',
      discussionSummary: 'Completed full walkthrough of Morley-IAS ZX5e panel operations, daily/weekly test routine demonstration, and staff duty manager responsibilities.',
      clientRequirements: [
        'Provide laminated emergency procedure guide for nursing station A',
        'Schedule quarterly periodic inspection for December 2026'
      ],
      documentsRequested: [
        'Updated SANS 10139 on-site register logbook',
        'Signed Certificate of Compliance (COC-2026-091)'
      ],
      decisionsMade: [
        'Client accepted system handover and received master access keys',
        'Weekly sounder test scheduled for Wednesdays at 10:00'
      ],
      nextWorkflowStep: 'Issue formal SANS 10139 COC certificate and register quarterly maintenance cycle',
      assignedAction: 'Upload digital COC and courier physical embossed logbook',
      responsiblePerson: 'Bethuel Moukangwe',
      dueDate: '2026-09-05',
      followUpAppointmentRequired: true,
      followUpDate: '2026-12-01',
      presentationVersionUsed: 'v1.0 Final',
      statutoryComplianceDisclaimer: 'Attendance and discussions recorded herein confirm operational handover walkthrough. Statutory compliance remains subject to formal SANS 10139 certificate of compliance verification and ongoing quarterly testing.'
    },
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-01T12:15:00Z',
    createdBy: 'admin-001'
  }
];

export const INITIAL_ACCESS_LOGS: ZoomMeetingAccessLog[] = [
  {
    id: 'log-001',
    appointmentId: 'appt-2026-001',
    appointmentRef: 'SR-2026-0891',
    userId: 'user-001',
    userName: 'Sarah Jenkins',
    userRole: 'customer',
    action: 'reveal_pmi',
    timestamp: '2026-09-02T08:20:15Z',
    ipAddress: '102.132.18.45 (Sandton, ZA)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    success: true,
    notes: 'Masked PMI unmasked following authenticated portal session verification.'
  },
  {
    id: 'log-002',
    appointmentId: 'appt-2026-001',
    appointmentRef: 'SR-2026-0891',
    userId: 'user-001',
    userName: 'Sarah Jenkins',
    userRole: 'customer',
    action: 'copy_invitation',
    timestamp: '2026-09-02T08:21:02Z',
    ipAddress: '102.132.18.45 (Sandton, ZA)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    success: true,
    notes: 'Sanitized invitation copied to clipboard.'
  },
  {
    id: 'log-003',
    appointmentId: 'appt-2026-004',
    appointmentRef: 'SR-2026-0870',
    userId: 'staff-001',
    userName: 'Bethuel Moukangwe',
    userRole: 'staff',
    action: 'start_meeting',
    timestamp: '2026-09-01T10:58:30Z',
    ipAddress: '197.185.12.88 (Johannesburg, ZA)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    success: true,
    notes: 'Host launched Zoom Personal Meeting Room with Waiting Room enforcement.'
  },
  {
    id: 'log-004',
    appointmentId: 'appt-2026-004',
    appointmentRef: 'SR-2026-0870',
    userId: 'staff-001',
    userName: 'Bethuel Moukangwe',
    userRole: 'staff',
    action: 'record_outcome',
    timestamp: '2026-09-01T12:15:10Z',
    ipAddress: '197.185.12.88 (Johannesburg, ZA)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    success: true,
    notes: 'Meeting outcome recorded with SANS 10139 statutory compliance disclaimer.'
  }
];

export const INITIAL_CALENDAR_SYNC_JOBS: CalendarSyncJob[] = [
  {
    id: 'sync-job-101',
    appointmentId: 'appt-2026-001',
    appointmentRef: 'SR-2026-0891',
    jobType: 'create',
    status: 'completed',
    retryCount: 0,
    createdAt: '2026-09-01T09:30:05Z',
    processedAt: '2026-09-01T09:30:12Z'
  },
  {
    id: 'sync-job-102',
    appointmentId: 'appt-2026-002',
    appointmentRef: 'SR-2026-0892',
    jobType: 'create',
    status: 'completed',
    retryCount: 0,
    createdAt: '2026-09-01T14:15:05Z',
    processedAt: '2026-09-01T14:15:11Z'
  },
  {
    id: 'sync-job-103',
    appointmentId: 'appt-2026-003',
    appointmentRef: 'SR-2026-0885',
    jobType: 'create',
    status: 'completed',
    retryCount: 0,
    createdAt: '2026-09-01T11:00:05Z',
    processedAt: '2026-09-01T11:00:10Z'
  }
];

export const INITIAL_WEBHOOK_CHANNELS: CalendarWebhookChannel[] = [
  {
    channelId: 'chan-gcal-af-south-1-prod-001',
    resourceId: 'res-gcal-6677889900',
    resourceUri: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    expirationTimestamp: '2026-09-09T08:00:00Z',
    isActive: true,
    lastNotificationAt: '2026-09-02T08:15:00Z',
    validationToken: 'audrin-webhook-token-c841a021'
  }
];

export const INITIAL_INTEGRATION_METRICS: IntegrationMetrics = {
  calendarEventsCreated: 148,
  calendarSyncFailures: 0,
  appointmentsScheduled: 152,
  appointmentsCompleted: 139,
  appointmentsCancelled: 4,
  clientRsvpAccepted: 144,
  remindersDelivered: 296,
  zoomCardAccessCount: 420,
  failedSecretRetrievals: 0,
  webhookProcessingFailures: 0
};

export const APPOINTMENT_TYPE_LABELS: Record<string, { label: string; description: string; durationMinutes: number; requiresPowerPoint: boolean }> = {
  initial_consultation: {
    label: 'Initial Consultation',
    description: 'First exploratory consultation on building fire detection needs & statutory requirements.',
    durationMinutes: 45,
    requiresPowerPoint: false
  },
  site_survey_planning: {
    label: 'Site-Survey Planning',
    description: 'Pre-survey briefing to coordinate building access, riser routes, and zone boundaries.',
    durationMinutes: 45,
    requiresPowerPoint: false
  },
  remote_system_review: {
    label: 'Remote System Review',
    description: 'Technical evaluation of existing panel topology, loop calculations, and zone layouts.',
    durationMinutes: 60,
    requiresPowerPoint: false
  },
  fault_consultation: {
    label: 'Fire-Alarm Fault Consultation',
    description: 'Troubleshooting critical panel faults, ground leaks, or repeated false alarms.',
    durationMinutes: 45,
    requiresPowerPoint: false
  },
  design_review: {
    label: 'Design Review',
    description: 'Detailed engineering review of SANS 10139 Category (L1-L5, P1-P2, M) design plans.',
    durationMinutes: 60,
    requiresPowerPoint: true
  },
  quotation_discussion: {
    label: 'Quotation Discussion',
    description: 'Scope and bill of quantities breakdown with client commercial team.',
    durationMinutes: 30,
    requiresPowerPoint: false
  },
  work_progress: {
    label: 'Work-Progress Meeting',
    description: 'Weekly or bi-weekly contractor progress review and milestone tracking.',
    durationMinutes: 45,
    requiresPowerPoint: false
  },
  testing_commissioning_review: {
    label: 'Testing & Commissioning Review',
    description: 'Review of sound pressure levels, detector sensitivity tests, and interface relays.',
    durationMinutes: 60,
    requiresPowerPoint: true
  },
  pre_work_report_review: {
    label: 'Pre-Work Condition Report Review',
    description: 'Statutory presentation of baseline system defects and photographic evidence.',
    durationMinutes: 60,
    requiresPowerPoint: true
  },
  post_work_report_presentation: {
    label: 'Post-Work Report Presentation',
    description: 'Statutory presentation of rectified items, test certificates, and verification photos.',
    durationMinutes: 60,
    requiresPowerPoint: true
  },
  handover_meeting: {
    label: 'Handover Meeting',
    description: 'Final operational handover to building owner, key transfer, and training.',
    durationMinutes: 60,
    requiresPowerPoint: true
  },
  maintenance_planning: {
    label: 'Maintenance-Planning Meeting',
    description: 'Scheduling SANS 10139 periodic quarterly/annual maintenance visits.',
    durationMinutes: 45,
    requiresPowerPoint: false
  },
  other_fire_detection: {
    label: 'Other Fire-Detection Meeting',
    description: 'Specialized fire engineering consultation or statutory authority liaison.',
    durationMinutes: 45,
    requiresPowerPoint: false
  }
};
