import { StatutoryFormTemplate, StatutoryFormSubmission } from '../types';

export const STATUTORY_FORM_TEMPLATES: StatutoryFormTemplate[] = [
  // =========================================================================
  // BOOK 1: SANS 10139 & SAQCC COMMISSIONER MODULE
  // =========================================================================
  {
    id: 'sans-10139-form-1',
    formNumber: 'SANS 10139 - Form 1',
    title: 'Responsible Person Weekly Routine Test & Inspection Logsheet',
    standardCode: 'SANS_10139',
    standardTitle: 'SANS 10139:2012 / SAQCC Commissioner Module',
    standardClauseRef: 'Clause 25.2 & Annex F',
    category: 'routine_maintenance',
    description: 'Mandatory weekly rotational manual call point test, sounder audibility verification, and control panel health check executed by the designated site Responsible Person.',
    statutoryMandate: 'Statutory legal requirement under SANS 10139 Clause 25.2 & OHS Act 85 of 1993. Must be completed every 7 days.',
    frequency: 'Weekly',
    targetAudience: 'Responsible Person (Client)',
    estimatedMinutesToComplete: 5,
    badgeColor: 'red',
    sections: [
      {
        title: '1. Test Identification & Panel Health Verification',
        description: 'Verify the physical status of the Fire Alarm Control and Indicating Equipment (CIE).',
        fields: [
          {
            id: 'test_date_time',
            label: 'Inspection & Test Date / Time',
            type: 'date',
            required: true,
            standardClause: 'Clause 25.2.1'
          },
          {
            id: 'tested_mcp_id',
            label: 'Manual Call Point (MCP) ID / Rotational Test Number',
            type: 'text',
            required: true,
            placeholder: 'e.g. MCP-FL02-ZONE3 (Break-glass unit east stairwell)',
            helpText: 'A different manual call point must be tested each week in rotation so that all devices in the building are verified over time.',
            standardClause: 'Clause 25.2.2'
          },
          {
            id: 'panel_normal_led',
            label: 'Control Panel "Power Healthy / Normal" LED illuminated and no fault lamps active',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Confirmed (Normal Green Mains LED ON, No Yellow Faults)' },
              { value: 'no', label: 'Defect Present (Fault LED Active - Describe below)' }
            ]
          },
          {
            id: 'fault_indication_threshold_check',
            label: '200-Second Detector/MCP Fault Registration Verification Check',
            type: 'select',
            required: true,
            defaultValue: 'compliant',
            options: [
              { value: 'compliant', label: 'Pass: Panel registers circuit anomalies within 200s standard limit' },
              { value: 'delayed', label: 'Fail: Indication delayed beyond 200s threshold' },
              { value: 'not_tested_this_cycle', label: 'Monitored via Automatic CIE Diagnostic Routine' }
            ],
            standardClause: 'SAQCC Summative POE Module 1'
          }
        ]
      },
      {
        title: '2. Audibility & Signal Transmission Verification',
        description: 'Ensure adequate audibility throughout occupied and escape areas.',
        fields: [
          {
            id: 'alarm_audibility_verified',
            label: 'Alarm Sounders & Sirens clearly audible throughout premises (Min 65 dB(A) / 75 dB(A) bedhead)',
            type: 'radio',
            required: true,
            options: [
              { value: 'passed', label: 'Passed: Sound clearly audible in all operational areas' },
              { value: 'low_audibility', label: 'Inadequate in specific zones (State in notes)' },
              { value: 'silent_test_mode', label: 'Silenced Test with Prior Fire Brigade / ARC Notification' }
            ],
            standardClause: 'Clause 16.2'
          },
          {
            id: 'mains_power_loss_monitored',
            label: '30-Minute Electrical Disconnection / Mains Power Loss Indication Monitored',
            type: 'checkbox',
            required: true,
            defaultValue: true,
            helpText: 'SANS 10139 / SAQCC mandate: Mains failure fault must alert within 30 minutes.'
          },
          {
            id: 'defects_recorded',
            label: 'Defects, Damaged Devices or Obstructed Call Points Observed',
            type: 'textarea',
            placeholder: 'Note any missing break-glass covers, paint-over detectors, obscured call points, or yellow fault messages...'
          },
          {
            id: 'corrective_action_taken',
            label: 'Immediate Corrective Action / Service Call Logged',
            type: 'text',
            placeholder: 'e.g. Logged ticket #AFE-SRV-901 for zone 2 sounder replacement.'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-10139-form-2',
    formNumber: 'SANS 10139 - Form 2',
    title: 'Unwanted Fire Signal (UwFS / False Alarm) Incident & Investigation Log',
    standardCode: 'SANS_10139',
    standardTitle: 'SANS 10139:2012 / SAQCC Commissioner Module',
    standardClauseRef: 'Clause 5 & Section 3 Annexure',
    category: 'false_alarm_management',
    description: 'Statutory false alarm tracking form to classify causes, eliminate recurring unwanted signals, and prevent local fire brigade penalties.',
    statutoryMandate: 'SANS 10139 Clause 5 mandate: System must maintain false alarm rate < 1 per 25 detectors per annum.',
    frequency: 'Per Incident',
    targetAudience: 'Responsible Person (Client)',
    estimatedMinutesToComplete: 8,
    badgeColor: 'amber',
    sections: [
      {
        title: '1. Incident Specifics & Triggering Device',
        fields: [
          {
            id: 'incident_timestamp',
            label: 'Date and Exact Time of Unwanted Fire Signal',
            type: 'date',
            required: true
          },
          {
            id: 'device_loop_address',
            label: 'Triggering Device ID & Loop/Zone Address',
            type: 'text',
            required: true,
            placeholder: 'e.g. Optical Smoke Detector Loop 1 Address 042 (Level 2 Server Room)'
          },
          {
            id: 'building_system_category',
            label: 'Installed System Category',
            type: 'select',
            required: true,
            defaultValue: 'Category L1',
            options: [
              { value: 'Category L1', label: 'Category L1 (Total Life Safety throughout all spaces)' },
              { value: 'Category L2', label: 'Category L2 (Escape Routes + Specified High Risk Rooms)' },
              { value: 'Category L3', label: 'Category L3 (Escape Routes & Access Corridors only)' },
              { value: 'Category L4', label: 'Category L4 (Escape Routes only)' },
              { value: 'Category L5', label: 'Category L5 (Engineered Custom Life Safety Target)' },
              { value: 'Category P1', label: 'Category P1 (Total Property Protection)' },
              { value: 'Category P2', label: 'Category P2 (Property Protection in Defined Areas)' },
              { value: 'Category M', label: 'Category M (Manual Call Points Only)' }
            ]
          }
        ]
      },
      {
        title: '2. Cause Investigation & Root Analysis',
        fields: [
          {
            id: 'false_alarm_classification',
            label: 'Statutory UwFS Classification',
            type: 'select',
            required: true,
            options: [
              { value: 'environmental', label: 'Environmental (Steam, cooking fumes, dust, aerosols, insects, exhaust fumes)' },
              { value: 'apparatus_defect', label: 'Apparatus Defect (Component failure, voltage spike, cable short/open circuit)' },
              { value: 'good_intent', label: 'Good Intent (Person reasonably believed a fire or smoke condition existed)' },
              { value: 'malicious', label: 'Malicious False Alarm (Deliberate break of MCP without hazard)' },
              { value: 'unknown', label: 'Undetermined (Investigated by SAQCC Technician)' }
            ],
            standardClause: 'Clause 5.2'
          },
          {
            id: 'environmental_factors',
            label: 'Environmental / Worksite Influences at Time of Alarm',
            type: 'select',
            options: [
              { value: 'hot_work', label: 'Contractor Hot Work / Grinding / Welding without Permit Isolation' },
              { value: 'steam_moisture', label: 'Bathroom / Kettle Steam / High Humidity Condensation' },
              { value: 'aircon_dust', label: 'HVAC Aircon Startup Dust / Filter Cleaning' },
              { value: 'pesticide_fume', label: 'Pest Control Chemical Spray / Aerosol Paint' },
              { value: 'none_electrical', label: 'None - Apparent Electronic/Hardware Transient' }
            ]
          },
          {
            id: 'corrective_action_plan',
            label: 'Remedial Action to Eliminate Recurrence',
            type: 'textarea',
            required: true,
            placeholder: 'e.g. Swapped optical detector to multi-sensor optical/heat unit, installed protective hinged cover on MCP, or isolated zone during scheduled painting.'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-10139-form-3',
    formNumber: 'SANS 10139 - Form 3',
    title: 'Quarterly Periodic Inspection Client Responsibility & Defect Sign-off',
    standardCode: 'SANS_10139',
    standardTitle: 'SANS 10139:2012 / SAQCC Commissioner Module',
    standardClauseRef: 'Clause 25.3 & SAQCC Level 3 Servicing',
    category: 'routine_maintenance',
    description: 'Quarterly compliance log recording technician verification of standby batteries, 1,000 m² loop isolation, sounder sheath integrity, and zone layout visibility.',
    statutoryMandate: 'SANS 10139 Clause 25.3: Mandatory 90-day periodic engineering servicing.',
    frequency: 'Quarterly',
    targetAudience: 'Responsible Person (Client)',
    estimatedMinutesToComplete: 10,
    badgeColor: 'red',
    sections: [
      {
        title: '1. SANS 10139 Quarterly Critical Points',
        fields: [
          {
            id: 'quarter_period',
            label: 'Quarter Inspection Period',
            type: 'select',
            required: true,
            options: [
              { value: 'Q1', label: 'Q1 - First Quarter Periodic Verification' },
              { value: 'Q2', label: 'Q2 - Second Quarter Periodic Verification' },
              { value: 'Q3', label: 'Q3 - Third Quarter Periodic Verification' },
              { value: 'Q4', label: 'Q4 - Fourth Quarter (Annual Servicing & Recertification)' }
            ]
          },
          {
            id: 'battery_standby_verified',
            label: 'Secondary Power Supply Standby Battery Capacity Verified (24h Quiescent + 30m Full Alarm)',
            type: 'radio',
            required: true,
            options: [
              { value: 'passed', label: 'Passed: Battery terminal voltage under load ≥ 27.2V DC (Healthy)' },
              { value: 'degraded', label: 'Degraded: Battery replacement required (< 80% capacity)' }
            ],
            standardClause: 'Clause 25.3.2'
          },
          {
            id: 'loop_isolation_1000m2_check',
            label: '1,000 m² Maximum Fault Isolation Zone verified intact without single point failure',
            type: 'radio',
            required: true,
            options: [
              { value: 'verified', label: 'Verified: Isolator modules spaced at ≤ 1,000 m² intervals (Pass)' },
              { value: 'non_compliant', label: 'Non-Compliant: Loop isolators missing / exceeded zone limits' }
            ],
            standardClause: 'SAQCC Module Rule 2'
          },
          {
            id: 'sounder_sheaths_separate',
            label: 'Sounder Circuits in Separate Cable Sheaths Verified (Min 2 sounders per building)',
            type: 'radio',
            required: true,
            options: [
              { value: 'verified', label: 'Compliant: Sounders wired in independent cable sheaths' },
              { value: 'shared_sheath', label: 'Defect: Common cable sheath detected (Must be rewired)' }
            ]
          },
          {
            id: 'zone_plan_visible_at_panel',
            label: 'Clear, framed Zone Chart / As-Built Floor Plan positioned adjacent to Fire Alarm CIE',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes - Framed Zone Map in place & readable' },
              { value: 'missing', label: 'No - Zone chart missing or outdated' }
            ]
          }
        ]
      },
      {
        title: '2. Client Acceptance & Rectification Agreement',
        fields: [
          {
            id: 'client_signoff_notes',
            label: 'Client Representative Remarks',
            type: 'textarea',
            placeholder: 'State agreement to repair any noted minor deviations...'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-10139-form-4',
    formNumber: 'SANS 10139 - Form 4',
    title: 'Form T1: Certificate of System Handover & Client Commissioning Acceptance',
    standardCode: 'SANS_10139',
    standardTitle: 'SANS 10139:2012 / SAQCC Commissioner Module',
    standardClauseRef: 'Clause 24 & Form T1',
    category: 'handover_commissioning',
    description: 'Official statutory handover certificate verifying receipt of as-built drawings, cause & effect matrix sign-off, operation manuals, and responsible person training.',
    statutoryMandate: 'SAQCC Commissioner regulation: Certificate of Compliance cannot be issued without executed Form T1.',
    frequency: 'Once-off',
    targetAudience: 'Building Owner',
    estimatedMinutesToComplete: 10,
    badgeColor: 'emerald',
    sections: [
      {
        title: '1. Handover Artifacts & Engineering Verification',
        fields: [
          {
            id: 'as_built_drawings_received',
            label: 'As-Built CAD / PDF Drawings Received (with SANS dot symbol legend: Blue Smoke, Black Heat, Red Sounder, Green MCP)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'cause_effect_matrix_signed',
            label: '100% Cause & Effect Matrix Test Completed (Fire dampers, lift recall, door magnetic releases, BMS relays)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'logbook_supplied',
            label: 'SANS 10139 System Logbook & Operating Manual Handed Over on Site',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'client_staff_trained',
            label: 'Site Responsible Person & Security Personnel Trained on CIE Controls (Silence, Reset, Evacuate)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      },
      {
        title: '2. Handover Signatory Details',
        fields: [
          {
            id: 'handover_owner_name',
            label: 'Client Authorised Signatory Full Name',
            type: 'text',
            required: true
          },
          {
            id: 'handover_designation',
            label: 'Signatory Job Title / Legal Capacity',
            type: 'text',
            required: true,
            placeholder: 'e.g. Chief Facilities Officer / Property Asset Manager'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // BOOK 2: SANS 322:2005 (HOSPITALS & HEALTHCARE FACILITIES)
  // =========================================================================
  {
    id: 'sans-322-form-1',
    formNumber: 'SANS 322 - Form 1',
    title: 'Healthcare Facility Fire Detection Selection & Panel Technology Specification',
    standardCode: 'SANS_322',
    standardTitle: 'SANS 322:2005 Fire Detection in Healthcare Premises',
    standardClauseRef: 'Table 1 & Clauses 4.1 - 4.6',
    category: 'healthcare_specification',
    description: 'Statutory form for hospital and clinic fire engineering specifying CIE panel type based on detector count, Type M & L1 coverage, public toilet detection, and ward audibility.',
    statutoryMandate: 'SANS 322:2005 statutory compliance for Department of Health licensing and municipal fire approval.',
    frequency: 'Once-off',
    targetAudience: 'Hospital Facility Manager',
    estimatedMinutesToComplete: 12,
    badgeColor: 'blue',
    sections: [
      {
        title: '1. Hospital Facility Classification & Detector Count',
        fields: [
          {
            id: 'hospital_facility_type',
            label: 'Healthcare Premise Type',
            type: 'select',
            required: true,
            options: [
              { value: 'acute_general', label: 'Acute Care General Hospital with Inpatient Beds' },
              { value: 'psychiatric', label: 'Psychiatric / Mental Health Hospital (Anti-ligature MCPs required)' },
              { value: 'day_clinic', label: 'Day Surgery Clinic / Ambulatory Medical Centre' },
              { value: 'nursing_home', label: 'Frail Care & Assisted Living Residence' },
              { value: 'maternity_scbu', label: 'Maternity Hospital & Special Care Baby Unit (SCBU)' }
            ]
          },
          {
            id: 'total_detector_count',
            label: 'Total Planned Detector & Device Count',
            type: 'number',
            required: true,
            placeholder: 'e.g. 145',
            helpText: 'Table 1: ≤ 50 = Conventional, 51 - 99 = Addressable, ≥ 100 = Analogue / Multi-state Addressable.'
          },
          {
            id: 'prescribed_panel_type',
            label: 'Prescribed Panel Technology (SANS 322 Table 1 Mandate)',
            type: 'select',
            required: true,
            options: [
              { value: 'analogue_addressable', label: 'Analogue / Multi-State Addressable (Mandatory for ≥ 100 detectors)' },
              { value: 'addressable', label: 'Addressable (Mandatory for 51 - 99 detectors)' },
              { value: 'conventional', label: 'Conventional (Permitted only for ≤ 50 detectors)' }
            ],
            standardClause: 'Table 1'
          }
        ]
      },
      {
        title: '2. Healthcare Specific Statutory Mandates',
        fields: [
          {
            id: 'public_toilets_detected',
            label: 'Public Toilets Fitted with Automatic Detection (SANS 322 Clause 4.3 Mandatory)',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes - Smoke detectors installed in all public/accessible toilets' },
              { value: 'non_compliant', label: 'No - Must be engineered into drawing immediately' }
            ],
            standardClause: 'Clause 4.3'
          },
          {
            id: 'patient_area_sounder_level',
            label: 'Patient Sleeping Ward Sounder Pressure Target',
            type: 'select',
            required: true,
            defaultValue: '50_dba',
            options: [
              { value: '45_dba', label: '45 dB(A) - Suitable for Frail/Neonatal Critical Wards' },
              { value: '50_dba', label: '50 dB(A) - Standard Patient Bed Area (SANS 322 45-55 dB(A) Target)' },
              { value: '55_dba', label: '55 dB(A) - General Healthcare Corridor' }
            ],
            standardClause: 'Clause 4.6'
          },
          {
            id: 'theatre_visual_alarms',
            label: 'Operating Theatres, ICU & SCBU fitted with Visual Alarm Devices (VADs ≤ 130 flashes/min)',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes - Xenon/LED Visual Strobe VADs installed with 50 dB(A) staff sounder' },
              { value: 'no', label: 'No - Visual VADs not yet specified' }
            ],
            standardClause: 'Clause 4.6.2'
          },
          {
            id: 'lift_ground_recall_hvac_trips',
            label: 'Lift Ground Recall & Aircon Smoke Exhaust Interlocks Verified',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  },
  {
    id: 'sans-322-form-2',
    formNumber: 'SANS 322 - Form 2',
    title: 'Hospital Fire Risk Assessment & Detector Omission Justification Record',
    standardCode: 'SANS_322',
    standardTitle: 'SANS 322:2005 Fire Detection in Healthcare Premises',
    standardClauseRef: 'Clause 4.7',
    category: 'healthcare_specification',
    description: 'Formal justification form where specific hospital areas (sterile suites, wet showers, low-risk voids) require detector omission with compensatory safety measures.',
    statutoryMandate: 'SANS 322 Clause 4.7 requires written justification and fire risk assessment for omitted detection in healthcare premises.',
    frequency: 'Per Facility Plan',
    targetAudience: 'Hospital Facility Manager',
    estimatedMinutesToComplete: 10,
    badgeColor: 'blue',
    sections: [
      {
        title: '1. Omission Area & Technical Justification',
        fields: [
          {
            id: 'room_name_location',
            label: 'Hospital Room Name & Department Location',
            type: 'text',
            required: true,
            placeholder: 'e.g. Operating Theatre 3 Sterile Scrub Zone & Patient Shower Pod A'
          },
          {
            id: 'omission_statutory_basis',
            label: 'Statutory Permitted Exemption Category',
            type: 'select',
            required: true,
            options: [
              { value: 'non_combustible_void', label: 'Ceiling void containing exclusively non-combustible materials with no high-voltage cables' },
              { value: 'wet_shower_room', label: 'Individual patient bathroom / shower with no combustible contents' },
              { value: 'sterile_theatre', label: 'Sterile surgical field where optical/heat detector poses contamination/dust risk' },
              { value: 'staff_rest_toilet', label: 'Enclosed staff rest cubicle with direct external ventilation' }
            ],
            standardClause: 'Clause 4.7'
          },
          {
            id: 'compensatory_measures',
            label: 'Compensatory Fire Safety & Detection Measures',
            type: 'textarea',
            required: true,
            placeholder: 'e.g. Sampling tube installed in return air ductwork, 60-minute fire-rated compartmentation doors with magnetic hold-opens, corridor optical detector within 1.5m of doorway.'
          },
          {
            id: 'infection_control_officer_approval',
            label: 'Hospital Infection Prevention & Control (IPC) Officer Sign-Off',
            type: 'text',
            required: true,
            placeholder: 'Dr. / Sr. Name (IPC Unit Lead)'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-322-form-3',
    formNumber: 'SANS 322 - Form 3',
    title: 'Hospital Code Red / Code Green Phased Evacuation Protocol Checksheet',
    standardCode: 'SANS_322',
    standardTitle: 'SANS 322:2005 Fire Detection in Healthcare Premises',
    standardClauseRef: 'Pages 18 - 22 & Annex D',
    category: 'healthcare_evacuation',
    description: 'Clinical phased horizontal evacuation protocol sheet for staged Code Red (Fire Alarm Active) and Code Green (Hazard Cleared / Return to Normal) healthcare procedures.',
    statutoryMandate: 'SANS 322 Annex D: Mandatory quarterly audit of hospital phased evacuation communication and horizontal compartment door releases.',
    frequency: 'Quarterly',
    targetAudience: 'Hospital Facility Manager',
    estimatedMinutesToComplete: 15,
    badgeColor: 'blue',
    sections: [
      {
        title: '1. Two-Stage Phased Evacuation Alarm Verification',
        fields: [
          {
            id: 'two_stage_alarm_functioning',
            label: 'Two-Stage Alarm Sequence Verified (Continuous in Fire Zone, Intermittent in Adjacent Compartments)',
            type: 'radio',
            required: true,
            options: [
              { value: 'verified', label: 'Verified: Stage 1 continuous in origin zone, intermittent alert in adjacent zones' },
              { value: 'faulty', label: 'Faulty: Immediate global evacuation triggered (Must be reprogrammed)' }
            ],
            standardClause: 'Clause 4.6.1'
          },
          {
            id: 'code_red_staff_paging',
            label: 'Coded Voice Paging ("Code Red - Location") Tested without Causing Patient Panic',
            type: 'radio',
            required: true,
            options: [
              { value: 'passed', label: 'Passed: Coded broadcast clear to all nursing stations' },
              { value: 'inaudible', label: 'Inaudible at nursing desks' }
            ]
          },
          {
            id: 'fire_door_magnetic_releases',
            label: 'Magnetic Hold-Open Fire Doors on Corridor Compartments Release Instantly on Alarm',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'icu_patient_transfer_preparedness',
            label: 'ICU & Neonatal SCBU Horizontal Evacuation Cribs / Bed Routes Checked Clear',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  },

  // =========================================================================
  // BOOK 3: SANS 246 / BS 6266:2011 (ELECTRONIC EQUIPMENT & SERVER ROOMS)
  // =========================================================================
  {
    id: 'sans-246-form-1',
    formNumber: 'SANS 246 - Form 1',
    title: 'Electronic Equipment Room Risk Criticality & Enclosure Rating Submission',
    standardCode: 'SANS_246',
    standardTitle: 'SANS 246 / BS 6266:2011 Fire Protection for Electronic Equipment',
    standardClauseRef: 'Clause 3 & Page 6',
    category: 'server_room_risk',
    description: 'Mandatory risk criticality assessment defining server room enclosure fire resistance (30-240 min), gaseous suppression coincidence release, and emergency power off.',
    statutoryMandate: 'SANS 246 / BS 6266 Clause 3 requirement for data centres, telecommunication hubs, and mission-critical server environments.',
    frequency: 'Once-off',
    targetAudience: 'IT / Data Center Manager',
    estimatedMinutesToComplete: 10,
    badgeColor: 'amber',
    sections: [
      {
        title: '1. Facility Criticality & Structural Enclosure Rating',
        fields: [
          {
            id: 'server_risk_classification',
            label: 'Statutory Criticality Level',
            type: 'select',
            required: true,
            options: [
              { value: 'critical', label: 'Critical Category: National infrastructure / financial transaction core / hospital core' },
              { value: 'high', label: 'High Category: Enterprise primary data centre / commercial cloud host' },
              { value: 'medium', label: 'Medium Category: Standard corporate comms room / departmental server hub' }
            ],
            standardClause: 'Clause 3.1'
          },
          {
            id: 'enclosure_fire_rating',
            label: 'Server Room Enclosure Fire Resistance Period',
            type: 'select',
            required: true,
            defaultValue: '60_min',
            options: [
              { value: '30_min', label: '30 Minutes Fire Resistance (Medium Risk minimum)' },
              { value: '60_min', label: '60 Minutes Fire Resistance (Standard Data Centre)' },
              { value: '120_min', label: '120 Minutes Fire Resistance (High Risk / Multi-Tenant)' },
              { value: '240_min', label: '240 Minutes Fire Resistance (Critical Mission Facility)' }
            ],
            standardClause: 'Clause 3.3'
          },
          {
            id: 'no_dcp_extinguishers_certified',
            label: 'Prohibition of Dry Chemical Powder (DCP) Extinguishers in Server Room Certified',
            type: 'radio',
            required: true,
            options: [
              { value: 'certified', label: 'Certified: Only 2kg CO2 or Clean Agent extinguishers installed (NO DCP)' },
              { value: 'dcp_present', label: 'VIOLATION: DCP extinguisher found in electronic room (Must be removed)' }
            ],
            helpText: 'DCP powder is strictly prohibited under SANS 246 due to corrosive particulate damage to electronic server circuitry.',
            standardClause: 'Clause 6.2'
          }
        ]
      },
      {
        title: '2. Suppression Interlocks & EPO Controls',
        fields: [
          {
            id: 'gas_suppression_coincidence_zone',
            label: 'Clean Agent Gaseous Suppression Electronic Coincidence (Double Knock) Release Verified',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'emergency_power_off_verified',
            label: 'Emergency Power Off (EPO) Switch with Lift-Cover installed at Exit Door',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  },
  {
    id: 'sans-246-form-2',
    formNumber: 'SANS 246 - Form 2',
    title: 'Clause 3.5 ASD Detector Coverage & Room Airflow Calculation Record',
    standardCode: 'SANS_246',
    standardTitle: 'SANS 246 / BS 6266:2011 Fire Protection for Electronic Equipment',
    standardClauseRef: 'Clause 3.5 & Table 2',
    category: 'server_room_asd',
    description: 'Dynamic engineering calculation form adjusting detector coverage starting from 25 m² down to 10 m² based on air velocities (>1 m/s, >4 m/s) and AHU shutdown status.',
    statutoryMandate: 'SANS 246 Clause 3.5 mandatory design calculation for Aspirating Smoke Detection (ASD) pipe networks.',
    frequency: 'Per Design / Commissioning',
    targetAudience: 'Fire Engineer',
    estimatedMinutesToComplete: 10,
    badgeColor: 'amber',
    sections: [
      {
        title: '1. Room Geometry & Airflow Parameters',
        fields: [
          {
            id: 'server_room_area_m2',
            label: 'Server Room Floor Area (m²)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 85'
          },
          {
            id: 'airflow_velocity_category',
            label: 'Air Velocity in > 25% of Space',
            type: 'select',
            required: true,
            options: [
              { value: 'normal', label: '< 1 m/s (Standard / Low Velocity) -> Base 25 m²' },
              { value: 'medium_velocity', label: '1 - 4 m/s (Medium Air Velocity) -> Reduces coverage by 5 m² (to 20 m²)' },
              { value: 'high_velocity', label: '> 4 m/s (High Forced Air Velocity) -> Reduces coverage by 10 m² (to 15 m²)' }
            ],
            standardClause: 'Clause 3.5 Table 2'
          },
          {
            id: 'ahu_shutdown_interlock',
            label: 'Air Handling Unit (AHU) Automatic Shutdown on Stage 1 Alarm Interlock',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes: AHU trips on 1st alarm -> Increases allowable coverage by +10 m²' },
              { value: 'no', label: 'No: AHU continues running during alarm' }
            ]
          },
          {
            id: 'asd_sensitivity_class',
            label: 'Aspirating Smoke Detector (ASD) Sensitivity Class',
            type: 'select',
            required: true,
            defaultValue: 'class_a',
            options: [
              { value: 'class_a', label: 'Class A: Very High Sensitivity (< 0.8% obs/m) - Mission Critical' },
              { value: 'class_b', label: 'Class B: Enhanced Sensitivity (< 2.0% obs/m) -> +5 m² allowable' },
              { value: 'class_c', label: 'Class C: Standard Sensitivity (< 5.0% obs/m)' }
            ]
          },
          {
            id: 'return_air_grille_sampling',
            label: 'Return Air Grille Point Density (Min 0.4 m² per hole, min 3 Class A holes per grille)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      },
      {
        title: '2. Portable CO2 Fire Extinguisher Calculation',
        fields: [
          {
            id: 'calculated_co2_extinguishers',
            label: 'Calculated Required 2kg CO2 Extinguishers (1-50m²: 2, 51-100m²: 2, 101-150m²: 3, >150m²: 3 + 1/100m²)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 2',
            standardClause: 'Clause 6.2'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-246-form-3',
    formNumber: 'SANS 246 - Form 3',
    title: 'Server Room Housekeeping & Preventative Fire Safety Audit',
    standardCode: 'SANS_246',
    standardTitle: 'SANS 246 / BS 6266:2011 Fire Protection for Electronic Equipment',
    standardClauseRef: 'Facilitation 5 & Page 40',
    category: 'server_room_risk',
    description: 'Statutory inspection checklist auditing combustible packaging removal, computer paper storage, cable duct fire-stopping, and 3-year fixed electrical testing.',
    statutoryMandate: 'SANS 246 Facilitation 5 housekeeping and maintenance compliance requirements.',
    frequency: 'Quarterly',
    targetAudience: 'IT / Data Center Manager',
    estimatedMinutesToComplete: 8,
    badgeColor: 'amber',
    sections: [
      {
        title: '1. Housekeeping & Electrical Integrity Audit',
        fields: [
          {
            id: 'combustible_packing_removed',
            label: 'All cardboard cartons, polystyrene, and wooden crates unpacked outside server room',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'paper_storage_limited',
            label: 'Continuous stationery paper limited to 1 day supply in metal cabinet',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'cable_fire_stops_intact',
            label: 'Raised floor & ceiling cable penetration fire-stopping intumescent pillows intact',
            type: 'checkbox',
            required: true,
            defaultValue: true
          },
          {
            id: 'fixed_electrical_test_date',
            label: 'Date of Last 3-Year Fixed Electrical Periodic Test Certificate',
            type: 'date',
            required: true,
            helpText: 'SANS 246 Page 40 requires fixed electrical installations to be tested every 3 years.'
          }
        ]
      }
    ]
  },
  {
    id: 'sans-246-form-4',
    formNumber: 'SANS 246 - Form 4',
    title: 'IT Disaster Recovery & Fire Emergency Contingency Plan Record',
    standardCode: 'SANS_246',
    standardTitle: 'SANS 246 / BS 6266:2011 Fire Protection for Electronic Equipment',
    standardClauseRef: 'Clause 5.6 & Pages 43 - 44',
    category: 'server_room_disaster',
    description: 'Mandatory disaster contingency record detailing off-site encrypted backup cycles, secondary standby facility availability, annual simulation drill, and 2-year recovery test.',
    statutoryMandate: 'SANS 246 Clause 5.6 business continuity & disaster recovery audit requirement.',
    frequency: 'Annual',
    targetAudience: 'IT / Data Center Manager',
    estimatedMinutesToComplete: 15,
    badgeColor: 'amber',
    sections: [
      {
        title: '1. Continuity Architecture & Drill Schedule',
        fields: [
          {
            id: 'offsite_backup_frequency',
            label: 'Off-Site Data Replication / Encrypted Backup Frequency',
            type: 'select',
            required: true,
            defaultValue: 'realtime_continuous',
            options: [
              { value: 'realtime_continuous', label: 'Continuous Real-Time Geo-Replication (Zero RPO)' },
              { value: 'hourly_snapshots', label: 'Hourly Immutable Cloud Snapshots' },
              { value: 'daily_offsite', label: 'Daily Encrypted Off-Site Cold Storage' }
            ]
          },
          {
            id: 'secondary_hot_site_location',
            label: 'Secondary Standby Hot/Warm Facility Location & SLA',
            type: 'text',
            required: true,
            placeholder: 'e.g. Teraco Isando DC - 4 Hour Failover RTO SLA'
          },
          {
            id: 'annual_paper_drill_date',
            label: 'Date of Last Annual Paper Simulation Fire Exercise',
            type: 'date',
            required: true,
            standardClause: 'Clause 5.6.3'
          },
          {
            id: 'two_year_physical_recovery_test',
            label: 'Date of Last 2-Year Physical Disaster Recovery / Failover Test',
            type: 'date',
            required: true,
            standardClause: 'Clause 5.6.3'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // BOOK 4: SANS 10400-T:2011 EDITION 3 (NATIONAL BUILDING REGULATIONS PART T)
  // =========================================================================
  {
    id: 'sans-10400-t-form-1',
    formNumber: 'SANS 10400-T - Form 1',
    title: 'Regulation A19 Appointment of Competent Person (Fire Engineering)',
    standardCode: 'SANS_10400_T',
    standardTitle: 'SANS 10400-T:2011 Fire Protection / National Building Regulations',
    standardClauseRef: 'Regulation A19, Annex C & Pages 76 - 81',
    category: 'building_reg_appointment',
    description: 'Official statutory appointment form under National Building Regulations Act 103 of 1977 appointing a Registered Professional Fire Engineer (ECSA) for design and compliance sign-off.',
    statutoryMandate: 'Mandatory statutory submission under NBR Regulation A19 for building plan submission to local municipality.',
    frequency: 'Once-off',
    targetAudience: 'Fire Engineer',
    estimatedMinutesToComplete: 10,
    badgeColor: 'purple',
    sections: [
      {
        title: '1. Property Owner & Building Particulars',
        fields: [
          {
            id: 'erf_stand_number',
            label: 'Erf / Stand Number & Township',
            type: 'text',
            required: true,
            placeholder: 'e.g. Erf 4092 Sandton Ext 18, Johannesburg'
          },
          {
            id: 'building_occupancy_classification',
            label: 'SANS 10400-A / Table 11 Occupancy Classification',
            type: 'select',
            required: true,
            options: [
              { value: 'A1', label: 'A1 - Entertainment & Public Assembly (Theatres, Cinemas)' },
              { value: 'A2', label: 'A2 - Theatrical & Indoor Sport' },
              { value: 'A3', label: 'A3 - Places of Instruction (Universities, Schools)' },
              { value: 'B1', label: 'B1 - High Risk Commercial Service (Laundries, Dry Cleaners)' },
              { value: 'B2', label: 'B2 - Moderate Risk Commercial Service' },
              { value: 'B3', label: 'B3 - Low Risk Commercial Service' },
              { value: 'C1', label: 'C1 - Large Exhibition Hall' },
              { value: 'C2', label: 'C2 - Small Museum / Exhibition' },
              { value: 'D1', label: 'D1 - High Risk Industrial' },
              { value: 'D2', label: 'D2 - Moderate Risk Industrial (Manufacturing)' },
              { value: 'D3', label: 'D3 - Low Risk Industrial' },
              { value: 'E1', label: 'E1 - Large Place of Detention / Prison' },
              { value: 'E2', label: 'E2 - Hospital / Healthcare Facility' },
              { value: 'E3', label: 'E3 - Institutional / Special Care' },
              { value: 'F1', label: 'F1 - Large Shop / Retail Mall' },
              { value: 'F2', label: 'F2 - Small Wholesale / Retail Store' },
              { value: 'G1', label: 'G1 - Offices (Multi-Storey Corporate)' },
              { value: 'H1', label: 'H1 - Hotel / Guest Lodge' },
              { value: 'H2', label: 'H2 - Dormitory / Hostel' },
              { value: 'H3', label: 'H3 - Domestic Residence (Flats / Apartments)' },
              { value: 'H4', label: 'H4 - Single Dwelling House' },
              { value: 'J1', label: 'J1 - High Risk Storage' },
              { value: 'J2', label: 'J2 - Moderate Risk Storage (Warehouses)' },
              { value: 'J3', label: 'J3 - Low Risk Storage' },
              { value: 'J4', label: 'J4 - Parking Garage (Enclosed / Open)' }
            ]
          },
          {
            id: 'compliance_path',
            label: 'Compliance Engineering Pathway',
            type: 'select',
            required: true,
            defaultValue: 'deemed_to_satisfy',
            options: [
              { value: 'deemed_to_satisfy', label: 'Deemed-to-Satisfy Rules (Full prescriptive SANS 10400-T compliance)' },
              { value: 'rational_design', label: 'Rational Fire Safety Design (Regulation A19 / BS 7974 framework)' }
            ]
          }
        ]
      },
      {
        title: '2. Competent Person (Fire Engineer) Details',
        fields: [
          {
            id: 'appointed_engineer_name',
            label: 'Appointed Professional Engineer Full Name',
            type: 'text',
            required: true,
            defaultValue: 'T. M. Ndlovu (Pr.Eng Fire)'
          },
          {
            id: 'ecsa_registration_number',
            label: 'ECSA Professional Registration Number',
            type: 'text',
            required: true,
            defaultValue: 'ECSA-2018-941029'
          },
          {
            id: 'insurance_indemnity_verified',
            label: 'Professional Indemnity Insurance Policy Active (Min R10M Cover)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  },
  {
    id: 'sans-10400-t-form-2',
    formNumber: 'SANS 10400-T - Form 2',
    title: 'Table 11 Fire Protection Equipment & Extinguisher Allocation Submission',
    standardCode: 'SANS_10400_T',
    standardTitle: 'SANS 10400-T:2011 Fire Protection / National Building Regulations',
    standardClauseRef: 'Table 11 & Clauses 4.35 - 4.37',
    category: 'equipment_allocation',
    description: 'Mandatory equipment allocation calculation based on floor area and occupancy, determining required 9kg DCP/Water/CO2 extinguishers, 30m fire hose reels (1 per 500 m²), and hydrants (1 per 1,000 m²).',
    statutoryMandate: 'SANS 10400-T Clause 4.35 deemed-to-satisfy equipment requirements.',
    frequency: 'Per Building Audit',
    targetAudience: 'Responsible Person (Client)',
    estimatedMinutesToComplete: 10,
    badgeColor: 'purple',
    sections: [
      {
        title: '1. Area Sizing & Table 11 Fire Extinguishers',
        fields: [
          {
            id: 'gross_floor_area_m2',
            label: 'Gross Floor Area (m²)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 2400'
          },
          {
            id: 'table_11_extinguisher_density',
            label: 'Table 11 Extinguisher Allocation Density',
            type: 'select',
            required: true,
            options: [
              { value: '1_per_100m2', label: '1 extinguisher per 100 m² (A1, A2, B1, D1, E1, E2 hospitals, F1 shops, J1 high risk)' },
              { value: '1_per_200m2', label: '1 extinguisher per 200 m² (A3 schools, B2, D2 factories, G1 corporate offices, H1 hotels, J2)' },
              { value: '1_per_400m2', label: '1 extinguisher per 400 m² (B3, D3, J3 low risk, J4 parking garages)' }
            ],
            standardClause: 'Table 11'
          },
          {
            id: 'calculated_extinguisher_quantity',
            label: 'Calculated Required Portable Extinguishers',
            type: 'number',
            required: true,
            placeholder: 'e.g. 12'
          },
          {
            id: 'calculated_hose_reels',
            label: 'Calculated Fire Hose Reels (1 x 30m hose per 500 m² or part thereof)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 5',
            standardClause: 'Clause 4.36'
          },
          {
            id: 'calculated_fire_hydrants',
            label: 'Calculated Fire Hydrants (1 per 1,000 m² for buildings > 1,000 m²)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 3',
            standardClause: 'Clause 4.37'
          },
          {
            id: 'sabs_1186_signage_installed',
            label: 'SABS 1186 Photoluminescent Safety Location Signage fitted above every unit',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  },
  {
    id: 'sans-10400-t-form-3',
    formNumber: 'SANS 10400-T - Form 3',
    title: 'Escape Route, Travel Distance & Fire Door Compliance Assessment',
    standardCode: 'SANS_10400_T',
    standardTitle: 'SANS 10400-T:2011 Fire Protection / National Building Regulations',
    standardClauseRef: 'Table 10, Clauses 4.16 - 4.23',
    category: 'escape_compliance',
    description: 'Statutory egress assessment verifying maximum travel distances (≤45m / 15m feeder / 10m dead-end), Table 10 exit widths, fire door class ratings (Class A-F), and EN 1125 panic hardware.',
    statutoryMandate: 'SANS 10400-T Part T deemed-to-satisfy occupant escape life safety mandate.',
    frequency: 'Per Building Audit',
    targetAudience: 'Responsible Person (Client)',
    estimatedMinutesToComplete: 12,
    badgeColor: 'purple',
    sections: [
      {
        title: '1. Travel Distances & Escape Door Hardware',
        fields: [
          {
            id: 'max_travel_distance_m',
            label: 'Maximum Measured Travel Distance to Escape Door (m)',
            type: 'number',
            required: true,
            placeholder: 'e.g. 32',
            helpText: 'Mandate: Max 45m (sprinklered / general) or 15m feeder route, 10m dead-end corridor.'
          },
          {
            id: 'travel_distance_status',
            label: 'Travel Distance Statutory Compliance',
            type: 'radio',
            required: true,
            options: [
              { value: 'compliant', label: 'Compliant: ≤ 45m travel distance to safe egress corridor' },
              { value: 'exceeded', label: 'NON-COMPLIANT: Exceeds 45m (Requires additional fire exit or Rational Design)' }
            ],
            standardClause: 'Clause 4.16'
          },
          {
            id: 'fire_door_class_rating',
            label: 'Fire Door Class Rating Installed on Escape Stairwells',
            type: 'select',
            required: true,
            defaultValue: 'Class_B_60min',
            options: [
              { value: 'Class_A_30min', label: 'Class A: 30 Minutes Fire Resistance with Self-Closer' },
              { value: 'Class_B_60min', label: 'Class B: 60 Minutes Fire Resistance (Standard Staircase Enclosure)' },
              { value: 'Class_C_120min', label: 'Class C: 120 Minutes Fire Resistance (High Risk Separation)' },
              { value: 'Class_D_120min_structural', label: 'Class D: 120 Minutes Structural Timber/Metal Fire Door' }
            ],
            standardClause: 'Table 7'
          },
          {
            id: 'panic_bolts_sans_1125',
            label: 'Panic Bolts on Escape Doors open outward easily in direction of egress without a key (SANS 1125)',
            type: 'checkbox',
            required: true,
            defaultValue: true
          }
        ]
      }
    ]
  }
];

export const INITIAL_STATUTORY_SUBMISSIONS: StatutoryFormSubmission[] = [
  {
    id: 'sub-sans-10139-001',
    formTemplateId: 'sans-10139-form-1',
    formNumber: 'SANS 10139 - Form 1',
    formTitle: 'Responsible Person Weekly Routine Test & Inspection Logsheet',
    standardCode: 'SANS_10139',
    standardClauseRef: 'Clause 25.2 & Annex F',
    category: 'routine_maintenance',
    serviceRequestId: 'req-001',
    serviceRequestRef: 'AFE-REQ-2026-0891',
    siteId: 'site-sandton-city',
    siteName: 'Sandton City Corporate Tower',
    organisationName: 'Growthpoint Properties Ltd',
    submittedBy: {
      name: 'Thabo Khumalo',
      email: 'tkhumalo@growthpoint.co.za',
      role: 'customer',
      phone: '+27 11 944 8000',
      designation: 'Site Responsible Person & Chief Facilities Officer'
    },
    values: {
      test_date_time: '2026-08-28',
      tested_mcp_id: 'MCP-FL04-ZONE02 (South Emergency Stairwell)',
      panel_normal_led: 'yes',
      fault_indication_threshold_check: 'compliant',
      alarm_audibility_verified: 'passed',
      mains_power_loss_monitored: true,
      defects_recorded: 'None observed. All glass inserts intact and strobe beacons synchronized.',
      corrective_action_taken: 'Routine weekly log signed and archived.'
    },
    status: 'approved',
    certificateNumber: 'SANS10139-WLOG-2026-0891-01',
    submissionDate: '2026-08-28T09:15:00Z',
    lastUpdated: '2026-08-28T09:15:00Z',
    signedAt: '2026-08-28T09:16:00Z',
    signatureName: 'Thabo Khumalo',
    reviewedByEngineer: {
      name: 'Simphiwe Ndlovu',
      saqccNumber: 'SAQCC-FDGS-49021-L3',
      ecsaNumber: 'ECSA-2018-941029',
      comments: 'Weekly log compliant with SANS 10139 Clause 25.2 requirements. Rotational MCP confirmed.',
      reviewDate: '2026-08-28T10:30:00Z',
      status: 'compliant'
    }
  },
  {
    id: 'sub-sans-246-001',
    formTemplateId: 'sans-246-form-1',
    formNumber: 'SANS 246 - Form 1',
    formTitle: 'Electronic Equipment Room Risk Criticality & Enclosure Rating Submission',
    standardCode: 'SANS_246',
    standardClauseRef: 'Clause 3 & Page 6',
    category: 'server_room_risk',
    serviceRequestId: 'req-002',
    serviceRequestRef: 'AFE-REQ-2026-0892',
    siteId: 'site-midrand-dc',
    siteName: 'Midrand Cloud Data Centre',
    organisationName: 'Vukile Property Fund',
    submittedBy: {
      name: 'Johan van der Merwe',
      email: 'johan.vdm@vukile.co.za',
      role: 'customer',
      phone: '+27 11 888 2000',
      designation: 'Data Centre Operations Manager'
    },
    values: {
      server_risk_classification: 'critical',
      enclosure_fire_rating: '120_min',
      no_dcp_extinguishers_certified: 'certified',
      gas_suppression_coincidence_zone: true,
      emergency_power_off_verified: true
    },
    status: 'verified_by_engineer',
    certificateNumber: 'SANS246-CRIT-2026-0892-01',
    submissionDate: '2026-08-29T11:20:00Z',
    lastUpdated: '2026-08-29T11:20:00Z',
    signedAt: '2026-08-29T11:22:00Z',
    signatureName: 'Johan van der Merwe',
    reviewedByEngineer: {
      name: 'Audrin Sibanda',
      saqccNumber: 'SAQCC-FDGS-31084-L4',
      comments: 'Data hall 120-minute enclosure and FM200 coincidence release circuit inspected. Strictly compliant with SANS 246 / BS 6266.',
      reviewDate: '2026-08-29T14:00:00Z',
      status: 'compliant'
    }
  },
  {
    id: 'sub-sans-322-001',
    formTemplateId: 'sans-322-form-1',
    formNumber: 'SANS 322 - Form 1',
    formTitle: 'Healthcare Facility Fire Detection Selection & Panel Technology Specification',
    standardCode: 'SANS_322',
    standardClauseRef: 'Table 1 & Clauses 4.1 - 4.6',
    category: 'healthcare_specification',
    serviceRequestId: 'req-004',
    serviceRequestRef: 'AFE-REQ-2026-0894',
    siteId: 'site-life-fourways',
    siteName: 'Life Fourways Private Hospital',
    organisationName: 'Life Healthcare Group',
    submittedBy: {
      name: 'Sr. Maryna Botha',
      email: 'maryna.botha@lifehealthcare.co.za',
      role: 'customer',
      phone: '+27 11 875 1000',
      designation: 'General Hospital General Manager'
    },
    values: {
      hospital_facility_type: 'acute_general',
      total_detector_count: 148,
      prescribed_panel_type: 'analogue_addressable',
      public_toilets_detected: 'yes',
      patient_area_sounder_level: '50_dba',
      theatre_visual_alarms: 'yes',
      lift_ground_recall_hvac_trips: true
    },
    status: 'approved',
    certificateNumber: 'SANS322-HOSP-2026-0894-01',
    submissionDate: '2026-08-30T14:40:00Z',
    lastUpdated: '2026-08-30T14:40:00Z',
    signedAt: '2026-08-30T14:42:00Z',
    signatureName: 'Sr. Maryna Botha',
    reviewedByEngineer: {
      name: 'Audrin Sibanda',
      saqccNumber: 'SAQCC-FDGS-31084-L4',
      comments: 'Analogue Addressable CIE confirmed for 148 detectors under Table 1. VAD strobes specified for 6 Operating Theatres.',
      reviewDate: '2026-08-30T16:00:00Z',
      status: 'compliant'
    }
  },
  {
    id: 'sub-sans-10400-t-001',
    formTemplateId: 'sans-10400-t-form-1',
    formNumber: 'SANS 10400-T - Form 1',
    formTitle: 'Regulation A19 Appointment of Competent Person (Fire Engineering)',
    standardCode: 'SANS_10400_T',
    standardClauseRef: 'Regulation A19, Annex C & Pages 76 - 81',
    category: 'building_reg_appointment',
    serviceRequestId: 'req-003',
    serviceRequestRef: 'AFE-REQ-2026-0893',
    siteId: 'site-menlyn-main',
    siteName: 'Menlyn Maine Central Square',
    organisationName: 'Menlyn Maine Investment Holdings',
    submittedBy: {
      name: 'Pieter Gouws',
      email: 'pgouws@menlynmaine.co.za',
      role: 'customer',
      phone: '+27 12 361 7758',
      designation: 'Development Director'
    },
    values: {
      erf_stand_number: 'Erf 112 Menlyn Ext 11, City of Tshwane',
      building_occupancy_classification: 'F1',
      compliance_path: 'deemed_to_satisfy',
      appointed_engineer_name: 'Audrin Sibanda (Pr.Eng Fire / SAQCC Master)',
      ecsa_registration_number: 'ECSA-2015-810933',
      insurance_indemnity_verified: true
    },
    status: 'approved',
    certificateNumber: 'NBR-A19-2026-0893-01',
    submissionDate: '2026-08-31T08:30:00Z',
    lastUpdated: '2026-08-31T08:30:00Z',
    signedAt: '2026-08-31T08:35:00Z',
    signatureName: 'Pieter Gouws',
    reviewedByEngineer: {
      name: 'Audrin Sibanda',
      saqccNumber: 'SAQCC-FDGS-31084-L4',
      ecsaNumber: 'ECSA-2015-810933',
      comments: 'Appointment under Regulation A19 accepted. Prescriptive Part T Deemed-to-Satisfy schedule filed with Tshwane Fire Safety.',
      reviewDate: '2026-08-31T09:00:00Z',
      status: 'compliant'
    }
  }
];
