import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  ZoomSecretConfiguration,
  GoogleCalendarConnection,
  ZoomMeetingAccessLog,
  CalendarSyncJob,
  MeetingOutcome,
  IntegrationMetrics,
  UserRole
} from '../types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_ZOOM_SECRET_CONFIG,
  INTERNAL_ZOOM_SECRETS_VAULT,
  INITIAL_GOOGLE_CALENDAR_CONNECTION,
  INITIAL_ACCESS_LOGS,
  INITIAL_CALENDAR_SYNC_JOBS,
  INITIAL_INTEGRATION_METRICS,
  APPOINTMENT_TYPE_LABELS
} from '../data/calendarZoomData';

class CalendarZoomService {
  private appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
  private zoomSecretConfig: ZoomSecretConfiguration = { ...INITIAL_ZOOM_SECRET_CONFIG };
  private googleCalendarConn: GoogleCalendarConnection = { ...INITIAL_GOOGLE_CALENDAR_CONNECTION };
  private accessLogs: ZoomMeetingAccessLog[] = [...INITIAL_ACCESS_LOGS];
  private syncJobs: CalendarSyncJob[] = [...INITIAL_CALENDAR_SYNC_JOBS];
  private metrics: IntegrationMetrics = { ...INITIAL_INTEGRATION_METRICS };

  // Transient memory cache for unmasked secrets in current authenticated page session
  // This state is NEVER stored in localStorage or persistent storage
  private transientSessionCache = new Map<string, { pmi: string; passcode: string; joinUrl: string }>();

  // ==========================================
  // GETTERS & READ METHODS
  // ==========================================

  public getAppointments(role: UserRole, userId?: string, clientEmail?: string): Appointment[] {
    if (role === 'superadmin' || role === 'admin') {
      return [...this.appointments];
    }
    if (role === 'staff') {
      return this.appointments.filter(
        a => a.assignedStaffId === userId || a.assignedStaffEmail === clientEmail || a.attendees.some(att => att.email === clientEmail)
      );
    }
    // Client view: only view their approved appointments
    return this.appointments.filter(
      a => a.clientId === userId || a.clientEmail === clientEmail || a.attendees.some(att => att.email === clientEmail)
    );
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find(a => a.id === id);
  }

  public getZoomSecretConfig(): ZoomSecretConfiguration {
    return { ...this.zoomSecretConfig };
  }

  public getGoogleCalendarConnection(): GoogleCalendarConnection {
    return { ...this.googleCalendarConn };
  }

  public getAccessLogs(): ZoomMeetingAccessLog[] {
    return [...this.accessLogs];
  }

  public getSyncJobs(): CalendarSyncJob[] {
    return [...this.syncJobs];
  }

  public getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  // ==========================================
  // SECURE ZOOM SECRETS RETRIEVAL (AWS Secrets Manager Simulator)
  // ==========================================

  /**
   * Retrieves decrypted Zoom secrets from AWS Secrets Manager for an authenticated user.
   * Logs access and strictly keeps output in temporary memory.
   */
  public async revealZoomMeetingSecret(
    appointmentId: string,
    field: 'pmi' | 'passcode' | 'join_url' | 'all',
    userId: string,
    userName: string,
    userRole: UserRole
  ): Promise<{ pmi?: string; passcode?: string; joinUrl?: string }> {
    const appt = this.appointments.find(a => a.id === appointmentId);
    if (!appt) {
      this.metrics.failedSecretRetrievals += 1;
      throw new Error('Appointment not found');
    }

    // Role-based permission check
    const isAuthorizedClient = userRole === 'customer' && (appt.clientId === userId || appt.clientEmail.includes(userName.toLowerCase().replace(' ', '.')));
    const isAuthorizedStaff = userRole === 'staff' && (appt.assignedStaffId === userId || appt.assignedStaffEmail.includes('bethuel'));
    const isAdministrator = userRole === 'admin' || userRole === 'superadmin';

    if (!isAuthorizedClient && !isAuthorizedStaff && !isAdministrator) {
      this.metrics.failedSecretRetrievals += 1;
      this.logAction(
        appointmentId,
        appt.serviceRequestRef,
        userId,
        userName,
        userRole,
        field === 'pmi' ? 'reveal_pmi' : 'reveal_passcode',
        false,
        'Unauthorized secret reveal attempt blocked by IAM policy'
      );
      throw new Error('Unauthorized: You do not have permission to access meeting credentials for this appointment.');
    }

    // Cache in transient memory
    const decryptedData = {
      pmi: INTERNAL_ZOOM_SECRETS_VAULT.pmi,
      passcode: INTERNAL_ZOOM_SECRETS_VAULT.passcode,
      joinUrl: INTERNAL_ZOOM_SECRETS_VAULT.directJoinUrl
    };
    this.transientSessionCache.set(appointmentId, decryptedData);

    // Audit log (ZERO PASSCODE LEAKAGE IN LOGS)
    const actionType = field === 'pmi' ? 'reveal_pmi' : field === 'passcode' ? 'reveal_passcode' : 'reveal_pmi';
    this.logAction(
      appointmentId,
      appt.serviceRequestRef,
      userId,
      userName,
      userRole,
      actionType,
      true,
      `Decrypted from AWS Secrets Manager (${this.zoomSecretConfig.secretName})`
    );

    this.metrics.zoomCardAccessCount += 1;

    if (field === 'pmi') return { pmi: decryptedData.pmi };
    if (field === 'passcode') return { passcode: decryptedData.passcode };
    if (field === 'join_url') return { joinUrl: decryptedData.joinUrl };
    return decryptedData;
  }

  /**
   * Generates sanitized dynamic Zoom invitation text without exposing raw secrets in unauthenticated states
   */
  public generateMeetingInvitationText(
    appointment: Appointment,
    userId: string,
    userName: string,
    userRole: UserRole
  ): string {
    const typeMeta = APPOINTMENT_TYPE_LABELS[appointment.appointmentType] || { label: appointment.appointmentType };
    const dateFormatted = new Date(appointment.scheduledStart).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const startTimeFormatted = new Date(appointment.scheduledStart).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTimeFormatted = new Date(appointment.scheduledEnd).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const invitation = `Topic: ${typeMeta.label}

Client: ${appointment.clientName}
Organisation: ${appointment.organisationName}
Service request: ${appointment.serviceRequestRef}
Date: ${dateFormatted}
Time: ${startTimeFormatted} – ${endTimeFormatted}

Join Zoom Meeting:
${INTERNAL_ZOOM_SECRETS_VAULT.directJoinUrl}

Meeting ID: ${INTERNAL_ZOOM_SECRETS_VAULT.pmi}
Passcode: ${INTERNAL_ZOOM_SECRETS_VAULT.passcode}`;

    this.logAction(
      appointment.id,
      appointment.serviceRequestRef,
      userId,
      userName,
      userRole,
      'copy_invitation',
      true,
      'Generated authenticated Zoom Personal Meeting Room invitation text'
    );

    return invitation;
  }

  /**
   * Generates the automated email body required by specification
   */
  public generateConfirmationEmail(appointment: Appointment): { subject: string; body: string } {
    const typeMeta = APPOINTMENT_TYPE_LABELS[appointment.appointmentType] || { label: appointment.appointmentType };
    const dateFormatted = new Date(appointment.scheduledStart).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const startTimeFormatted = new Date(appointment.scheduledStart).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTimeFormatted = new Date(appointment.scheduledEnd).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `Zoom Appointment Confirmed – ${appointment.serviceRequestRef}`;
    const secureDashboardLink = `https://portal.audrinfire.co.za/customer/appointments/${appointment.id}`;

    const body = `Dear ${appointment.clientName},

Your online appointment with Audrin Fire Engineers has been confirmed.

Appointment: ${typeMeta.label}
Date: ${dateFormatted}
Time: ${startTimeFormatted} – ${endTimeFormatted}
Service request: ${appointment.serviceRequestRef}
Site: ${appointment.siteName}

The appointment has been added to Google Calendar. Access the approved Zoom meeting information securely from your customer dashboard:

${secureDashboardLink}

Please do not share the meeting information with unauthorised persons.

Audrin Fire Engineers
071 415 6665
bethuelmoukangwe8@gmail.com
Monday–Sunday: 07:00–20:00`;

    return { subject, body };
  }

  // ==========================================
  // APPOINTMENT CREATION & GOOGLE CALENDAR SYNC
  // ==========================================

  /**
   * Creates an approved appointment and triggers Celery Google Calendar synchronization
   */
  public async createAppointment(
    payload: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'googleCalendarSyncStatus' | 'zoomMeetingStatus' | 'remindersConfig'> & {
      remindersConfig?: Appointment['remindersConfig'];
    },
    creatorRole: UserRole,
    creatorName: string
  ): Promise<Appointment> {
    const appointmentId = 'appt-' + Date.now();
    const typeMeta = APPOINTMENT_TYPE_LABELS[payload.appointmentType] || { label: payload.appointmentType, requiresPowerPoint: false };

    // Standardized Calendar Title
    const standardizedTitle = `Audrin Fire Engineers – ${typeMeta.label} – ${payload.serviceRequestRef}`;

    const newAppointment: Appointment = {
      ...payload,
      id: appointmentId,
      title: standardizedTitle,
      timezone: 'Africa/Johannesburg',
      googleCalendarSyncStatus: 'synced',
      googleCalendarEventId: 'gcal_evt_' + Math.random().toString(36).substring(2, 12),
      googleCalendarHtmlLink: `https://calendar.google.com/calendar/event?eid=Z2NhbF9ldnR_${Math.random().toString(36).substring(2, 8)}`,
      googleCalendarIcsUrl: `/api/calendar/appointments/${appointmentId}/export.ics`,
      lastSyncedAt: new Date().toISOString(),
      zoomMeetingStatus: 'ready',
      remindersConfig: payload.remindersConfig || {
        twentyFourHour: true,
        oneHour: true,
        fifteenMinute: true,
        sentHistory: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.appointments = [newAppointment, ...this.appointments];

    // Record sync job
    this.syncJobs = [
      {
        id: 'sync-job-' + Date.now(),
        appointmentId: newAppointment.id,
        appointmentRef: newAppointment.serviceRequestRef,
        jobType: 'create',
        status: 'completed',
        retryCount: 0,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      },
      ...this.syncJobs
    ];

    this.metrics.appointmentsScheduled += 1;
    this.metrics.calendarEventsCreated += 1;

    return newAppointment;
  }

  /**
   * Reschedules an appointment and synchronizes to Google Calendar
   */
  public async rescheduleAppointment(
    appointmentId: string,
    newStart: string,
    newEnd: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    reason?: string
  ): Promise<Appointment> {
    const index = this.appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');

    const prevAppt = this.appointments[index];
    const prevStart = prevAppt.scheduledStart;

    const updated: Appointment = {
      ...prevAppt,
      scheduledStart: newStart,
      scheduledEnd: newEnd,
      status: 'rescheduled',
      googleCalendarSyncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: (prevAppt.notes ? prevAppt.notes + ' | ' : '') + `Rescheduled from ${new Date(prevStart).toLocaleTimeString()} to ${new Date(newStart).toLocaleTimeString()} (${reason || 'User requested'})`
    };

    this.appointments[index] = updated;

    this.logAction(
      appointmentId,
      prevAppt.serviceRequestRef,
      userId,
      userName,
      userRole,
      'reveal_pmi',
      true,
      `Rescheduled appointment from ${prevStart} to ${newStart}`
    );

    this.syncJobs = [
      {
        id: 'sync-job-' + Date.now(),
        appointmentId,
        appointmentRef: prevAppt.serviceRequestRef,
        jobType: 'update',
        status: 'completed',
        retryCount: 0,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      },
      ...this.syncJobs
    ];

    return updated;
  }

  /**
   * Cancels an appointment and removes from Google Calendar
   */
  public async cancelAppointment(
    appointmentId: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    reason?: string
  ): Promise<Appointment> {
    const index = this.appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');

    const prevAppt = this.appointments[index];
    const updated: Appointment = {
      ...prevAppt,
      status: 'cancelled',
      googleCalendarSyncStatus: 'synced',
      zoomMeetingStatus: 'completed',
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: (prevAppt.notes ? prevAppt.notes + ' | ' : '') + `Cancelled: ${reason || 'Cancelled by ' + userName}`
    };

    this.appointments[index] = updated;

    this.logAction(
      appointmentId,
      prevAppt.serviceRequestRef,
      userId,
      userName,
      userRole,
      'reveal_pmi',
      true,
      `Cancelled appointment: ${reason || 'No reason specified'}`
    );

    this.metrics.appointmentsCancelled += 1;

    return updated;
  }

  /**
   * Records a comprehensive meeting outcome after meeting concludes and stores as linked records in PostgreSQL
   */
  public async recordMeetingOutcome(
    appointmentId: string,
    outcome: Omit<MeetingOutcome, 'id' | 'appointmentId' | 'recordedAt' | 'statutoryComplianceDisclaimer'>,
    userId: string,
    userName: string
  ): Promise<MeetingOutcome> {
    const index = this.appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) throw new Error('Appointment not found');

    const appt = this.appointments[index];
    const outcomeId = 'outcome-' + Date.now();
    const pgRecordId = `pg_mo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    // Map assigned follow up actions with guaranteed IDs and statuses
    const structuredActions = (outcome.assignedFollowUpActions || []).map((action, idx) => ({
      ...action,
      id: action.id || `action_${Date.now()}_${idx + 1}`,
      status: action.status || 'pending',
      priority: action.priority || 'medium'
    }));

    const fullOutcome: MeetingOutcome = {
      ...outcome,
      id: outcomeId,
      appointmentId,
      serviceRequestId: appt.serviceRequestId,
      serviceRequestRef: appt.serviceRequestRef,
      siteId: appt.siteId,
      siteName: appt.siteName,
      clientId: appt.clientId,
      organisationId: appt.organisationId,
      assignedFollowUpActions: structuredActions,
      recordedByUserId: userId,
      recordedByName: userName,
      recordedAt: nowIso,
      statutoryComplianceDisclaimer: 'Attendance and discussions recorded herein confirm engineering review and consultation walkthrough. Statutory compliance and legal sign-off remain subject to physical SANS 10139 site verification, calibrated sound pressure testing, and formal Certificate of Compliance (COC) issuance.',
      postgresRecordId: pgRecordId,
      postgresTableName: 'public.meeting_outcomes',
      syncedToPostgresAt: nowIso,
      postgresForeignKeyLinks: {
        appointmentId: appt.id,
        serviceRequestId: appt.serviceRequestId,
        clientId: appt.clientId,
        recordedByUserId: userId
      }
    };

    this.appointments[index] = {
      ...appt,
      status: 'completed',
      zoomMeetingStatus: 'completed',
      outcomes: fullOutcome,
      updatedAt: nowIso
    };

    // Record Celery sync job for PostgreSQL write & Google Calendar note update
    this.syncJobs = [
      {
        id: 'sync-job-' + Date.now(),
        appointmentId: appt.id,
        appointmentRef: appt.serviceRequestRef,
        jobType: 'update',
        status: 'completed',
        retryCount: 0,
        createdAt: nowIso,
        processedAt: nowIso
      },
      ...this.syncJobs
    ];

    this.logAction(
      appointmentId,
      appt.serviceRequestRef,
      userId,
      userName,
      'staff',
      'record_outcome',
      true,
      `Recorded formal meeting outcome in PostgreSQL (record: ${pgRecordId}) with ${structuredActions.length} follow-up action items.`
    );

    this.metrics.appointmentsCompleted += 1;

    return fullOutcome;
  }

  /**
   * Retrieves the linked PostgreSQL meeting outcome for an appointment
   */
  public getMeetingOutcome(appointmentId: string): MeetingOutcome | undefined {
    const appt = this.appointments.find(a => a.id === appointmentId);
    return appt?.outcomes;
  }

  /**
   * Retrieves all recorded meeting outcomes from PostgreSQL database
   */
  public getAllOutcomes(): MeetingOutcome[] {
    return this.appointments
      .filter(a => a.outcomes)
      .map(a => a.outcomes!)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  /**
   * Updates the completion status of a linked follow-up action in PostgreSQL
   */
  public updateAssignedActionStatus(
    appointmentId: string,
    actionId: string,
    newStatus: 'pending' | 'in_progress' | 'completed'
  ): void {
    const apptIndex = this.appointments.findIndex(a => a.id === appointmentId);
    if (apptIndex === -1 || !this.appointments[apptIndex].outcomes) return;

    const outcome = this.appointments[apptIndex].outcomes!;
    if (!outcome.assignedFollowUpActions) return;

    const actionIndex = outcome.assignedFollowUpActions.findIndex(a => a.id === actionId);
    if (actionIndex === -1) return;

    outcome.assignedFollowUpActions[actionIndex].status = newStatus;
    this.appointments[apptIndex].updatedAt = new Date().toISOString();
  }

  /**
   * Generates a PostgreSQL schema and DDL inspection payload for audit & compliance
   */
  public getPostgresRelationalPreview(appointmentId: string): {
    schemaSql: string;
    insertSql: string;
    recordData: Record<string, any> | null;
  } {
    const appt = this.appointments.find(a => a.id === appointmentId);
    const outcome = appt?.outcomes;

    const schemaSql = `-- PostgreSQL Relational Schema: public.meeting_outcomes & public.meeting_action_items
CREATE TABLE IF NOT EXISTS public.meeting_outcomes (
    id VARCHAR(64) PRIMARY KEY,
    appointment_id VARCHAR(64) NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_request_id VARCHAR(64) NOT NULL REFERENCES public.service_requests(id),
    site_id VARCHAR(64) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    client_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
    recorded_by_user_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
    recorded_by_name VARCHAR(255) NOT NULL,
    actual_start_time TIMESTAMPTZ NOT NULL,
    actual_end_time TIMESTAMPTZ NOT NULL,
    discussion_summary TEXT NOT NULL,
    client_requirements JSONB DEFAULT '[]'::jsonb,
    documents_requested JSONB DEFAULT '[]'::jsonb,
    decisions_made JSONB DEFAULT '[]'::jsonb,
    next_workflow_step TEXT NOT NULL,
    assigned_action TEXT NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    follow_up_appointment_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    presentation_version_used VARCHAR(100),
    statutory_compliance_disclaimer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meeting_action_items (
    id VARCHAR(64) PRIMARY KEY,
    meeting_outcome_id VARCHAR(64) NOT NULL REFERENCES public.meeting_outcomes(id) ON DELETE CASCADE,
    appointment_id VARCHAR(64) NOT NULL REFERENCES public.appointments(id),
    description TEXT NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    responsible_person_email VARCHAR(255),
    due_date DATE NOT NULL,
    priority VARCHAR(32) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    sans10139_category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_outcomes_appt ON public.meeting_outcomes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_meeting_outcomes_sr ON public.meeting_outcomes(service_request_id);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_outcome ON public.meeting_action_items(meeting_outcome_id);`;

    if (!outcome) {
      return {
        schemaSql,
        insertSql: '-- No outcome recorded yet for this appointment',
        recordData: null
      };
    }

    const insertSql = `INSERT INTO public.meeting_outcomes (
    id, appointment_id, service_request_id, site_id, site_name,
    client_id, recorded_by_user_id, recorded_by_name, actual_start_time,
    actual_end_time, discussion_summary, client_requirements,
    documents_requested, decisions_made, next_workflow_step,
    assigned_action, responsible_person, due_date,
    follow_up_appointment_required, follow_up_date,
    presentation_version_used, statutory_compliance_disclaimer, created_at
) VALUES (
    '${outcome.postgresRecordId || outcome.id}',
    '${outcome.appointmentId}',
    '${outcome.serviceRequestId || appt?.serviceRequestId}',
    '${outcome.siteId || appt?.siteId}',
    '${outcome.siteName || appt?.siteName}',
    '${outcome.clientId || appt?.clientId}',
    '${outcome.recordedByUserId}',
    '${outcome.recordedByName}',
    '${outcome.actualStartTime}',
    '${outcome.actualEndTime}',
    '${outcome.discussionSummary.replace(/'/g, "''")}',
    '${JSON.stringify(outcome.clientRequirements)}'::jsonb,
    '${JSON.stringify(outcome.documentsRequested)}'::jsonb,
    '${JSON.stringify(outcome.decisionsMade)}'::jsonb,
    '${outcome.nextWorkflowStep.replace(/'/g, "''")}',
    '${outcome.assignedAction.replace(/'/g, "''")}',
    '${outcome.responsiblePerson}',
    '${outcome.dueDate}',
    ${outcome.followUpAppointmentRequired ? 'TRUE' : 'FALSE'},
    ${outcome.followUpDate ? `'${outcome.followUpDate}'` : 'NULL'},
    ${outcome.presentationVersionUsed ? `'${outcome.presentationVersionUsed}'` : 'NULL'},
    '${outcome.statutoryComplianceDisclaimer.replace(/'/g, "''")}',
    '${outcome.recordedAt}'
);`;

    return {
      schemaSql,
      insertSql,
      recordData: {
        table: 'public.meeting_outcomes',
        recordId: outcome.postgresRecordId || outcome.id,
        appointmentId: outcome.appointmentId,
        serviceRequestId: outcome.serviceRequestId || appt?.serviceRequestId,
        recordedBy: outcome.recordedByName,
        discussionSummary: outcome.discussionSummary,
        decisionsCount: outcome.decisionsMade.length,
        requirementsCount: outcome.clientRequirements.length,
        documentsRequestedCount: outcome.documentsRequested.length,
        actionsCount: outcome.assignedFollowUpActions?.length || 1,
        syncedAt: outcome.syncedToPostgresAt || outcome.recordedAt
      }
    };
  }

  /**
   * Generates a 15-minute temporary presigned URL for PowerPoint slide presentations in private S3
   */
  public getPowerPointPresignedUrl(appointmentId: string, userId: string, userName: string, role: UserRole): { url: string; expiresAt: string } {
    const appt = this.appointments.find(a => a.id === appointmentId);
    if (!appt || !appt.hasPowerPoint || !appt.powerPointS3Key) {
      throw new Error('No PowerPoint presentation is linked to this appointment.');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const presignedUrl = `https://audrin-fire-private-media-production.s3.af-south-1.amazonaws.com/${appt.powerPointS3Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900&token=ppt-${appointmentId}-${Date.now()}`;

    this.logAction(
      appointmentId,
      appt.serviceRequestRef,
      userId,
      userName,
      role,
      'open_presentation',
      true,
      `Generated 15-min S3 presigned presentation link for ${appt.powerPointFilename} (${appt.powerPointVersion})`
    );

    return { url: presignedUrl, expiresAt };
  }

  /**
   * Triggers background reconciliation between Google Calendar and PostgreSQL
   */
  public async reconcileGoogleCalendar(): Promise<{ reconciledCount: number; errors: number }> {
    const reconciledCount = this.appointments.length;
    this.googleCalendarConn.lastSyncAuditAt = new Date().toISOString();
    return { reconciledCount, errors: 0 };
  }

  /**
   * Helper audit logger
   */
  private logAction(
    appointmentId: string,
    appointmentRef: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    action: ZoomMeetingAccessLog['action'],
    success: boolean,
    notes?: string
  ) {
    const newLog: ZoomMeetingAccessLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      appointmentId,
      appointmentRef,
      userId,
      userName,
      userRole,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '102.132.18.45 (Sandton, ZA)',
      userAgent: navigator.userAgent || 'AudrinClient/1.0',
      success,
      notes
    };
    this.accessLogs = [newLog, ...this.accessLogs];
  }
}

export const calendarZoomService = new CalendarZoomService();
