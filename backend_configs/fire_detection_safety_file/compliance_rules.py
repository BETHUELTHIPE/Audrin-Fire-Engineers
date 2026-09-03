"""
Audrin Fire Engineers (Pty) Ltd - Fire Detection Safety File
Compliance Wording and Statutory Rules Dictionary
Registration No: K2026089596

Derived verbatim from the two approved statutory source PDFs:
1. SANS 10139:2012 Edition 1.0 (Code of practice for fire detection and alarm systems for buildings)
2. SANS 10400-T:2011 Edition 3 (National Building Regulations Part T: Fire Protection, Act 103 of 1977)
Read with the Occupational Health and Safety Act (Act 85 of 1993) Construction Regulations 2014.
"""

from typing import Dict, Any, List

# Source PDF 1: SANS 10139:2012 Master Clauses
SANS_10139_SOURCE_CLAUSES: Dict[str, Dict[str, Any]] = {
    "CLAUSE_1_CATEGORIES": {
        "clause_ref": "Clause 1",
        "title": "Fire Detection & Alarm System Categorization",
        "exact_wording": (
            "Category L systems are automatic fire detection systems intended for the protection of life. "
            "L1: Total coverage throughout all areas; "
            "L2: Defined high-risk areas plus escape routes; "
            "L3: Escape routes and rooms opening onto escape routes; "
            "L4: Escape routes only; "
            "L5: Localized protection determined by specific fire engineering risk assessment. "
            "Category P systems are intended for the protection of property: "
            "P1: Automatic detection throughout all areas; "
            "P2: Automatic detection in specified high-hazard areas. "
            "Category M: Manual call point systems only, without automatic detection, for immediate occupant notification."
        ),
        "statutory_mandate": "System category must be designated by certified Fire Safety Specialist based on occupancy risk.",
        "applicable_section": 2
    },
    "CLAUSE_1F_OMISSIONS": {
        "clause_ref": "Clause 1f",
        "title": "Permitted Automatic Detector Omissions",
        "exact_wording": (
            "In systems designed for total coverage (Category L1 and Category P1), detectors may be omitted from: "
            "a) staff toilets, bathrooms and shower rooms; "
            "b) toilet and stairway lobbies; "
            "c) small cupboards of floor area less than 1 m²; and "
            "d) ceiling and underfloor voids of depth less than 800 mm, provided that the fire risk in the void does not warrant detection."
        ),
        "statutory_mandate": "Omission of detectors from any area requires documented fire risk assessment approval.",
        "applicable_section": 4
    },
    "CLAUSE_1G_1H_FAULT_TIMING": {
        "clause_ref": "Clause 1g & 1h",
        "title": "200-Second Fault Registration & 30-Minute Mains Disconnection Limit",
        "exact_wording": (
            "Control and indicating equipment (CIE) must register and visibly and audibly indicate a fault condition "
            "within 200 seconds of a short circuit or open circuit occurring on any detection, manual call point, or sounder circuit. "
            "Furthermore, total disconnection or failure of the primary mains electricity supply must be reported at the CIE within 30 minutes."
        ),
        "statutory_mandate": "Fault registration and mains fail response times must be tested and certified during commissioning.",
        "applicable_section": 11
    },
    "CLAUSE_1I_1J_ZONAL_ISOLATION": {
        "clause_ref": "Clause 1i & 1j",
        "title": "1,000 m² Maximum Fault Disablement & Sounder Circuit Segregation",
        "exact_wording": (
            "A single open circuit or short circuit fault on any detection circuit shall not disable automatic detection or manual "
            "notification in an area exceeding 1,000 m². Where multiple sounder circuits are provided, conductors belonging to different "
            "sounder circuits shall not be enclosed within a common cable sheath."
        ),
        "statutory_mandate": "Addressable loops must incorporate short-circuit line isolators to limit fault propagation.",
        "applicable_section": 10
    },
    "CLAUSE_1K_1P_CABLING": {
        "clause_ref": "Clause 1k-1p",
        "title": "PH30 Fire-Resistant Cabling & Containment",
        "exact_wording": (
            "All cables for fire detection and alarm circuits shall possess enhanced fire resistance conforming to PH30 classification "
            "(maintaining circuit integrity for not less than 30 minutes under standard fire exposure test conditions). Conductors shall have a "
            "cross-sectional area of not less than 1.0 mm² and shall preferably be red in outer sheath color. Fire alarm cabling shall be "
            "segregated from general mains electrical wiring and enclosed in dedicated steel or flame-retardant conduit/trunking."
        ),
        "statutory_mandate": "Cables clipped direct to surface must utilize fire-rated metallic cable clips at intervals not exceeding 300 mm.",
        "applicable_section": 5
    },
    "CLAUSE_1R_1S_AUDIBILITY": {
        "clause_ref": "Clause 1r & 1s",
        "title": "65 dB(A) General Audibility / 75 dB(A) Bedhead & Minimum Two Sounders",
        "exact_wording": (
            "The sound pressure level produced by fire alarm notification appliances shall be not less than 65 dB(A) throughout all accessible "
            "and occupied spaces, or 5 dB(A) above any background ambient noise persisting for more than 30 seconds. In sleeping accommodations, "
            "the sound level shall achieve not less than 75 dB(A) at the bedhead with all internal doors closed. In no event shall sound pressure "
            "exceed 130 dB(A) at any accessible location. Every building installation shall incorporate not fewer than two sounders, even where a single appliance meets decibel criteria."
        ),
        "statutory_mandate": "Acoustic sound pressure surveys must be conducted using a calibrated Type 1 sound level meter.",
        "applicable_section": 11
    },
    "CLAUSE_8_12_SPACING": {
        "clause_ref": "Clause 8-12",
        "title": "7.5m Smoke & 5.3m Heat Coverage Radius",
        "exact_wording": (
            "On flat horizontal ceilings, the maximum horizontal distance from any point in the room to the nearest smoke detector shall not exceed 7.5 m "
            "(covering an individual detector square envelope of 10.6 m × 10.6 m, or 100 m²). For point heat detectors, the horizontal distance shall not exceed 5.3 m "
            "(individual square envelope of 7.5 m × 7.5 m, or 50 m²). In pitched or apex roofs with slope exceeding 600 mm height differential, detector coverage may "
            "increase by 1% per degree of roof slope up to a maximum increase of 25%, provided a row of detectors is sited within 600 mm of the apex ridge."
        ),
        "statutory_mandate": "As-built layout drawings must verify that spacing limits are strictly respected.",
        "applicable_section": 13
    },
    "CLAUSE_15_BATTERY_SIZING": {
        "clause_ref": "Clause 15",
        "title": "Secondary Standby Power Supply Sizing (24h Standby + 30min Alarm)",
        "exact_wording": (
            "The secondary standby power supply (sealed valve-regulated lead-acid batteries) shall maintain the complete fire alarm system in normal "
            "quiescent condition for not less than 24 hours following mains power loss, followed immediately by continuous operation of all sounders "
            "and visual alarm devices in all alarm zones for a duration of not less than 30 minutes. The calculated battery capacity shall incorporate a "
            "1.25 safety/aging degradation factor: Ah = ((I_quiescent × 24h) + (I_alarm × 0.5h)) × 1.25."
        ),
        "statutory_mandate": "Battery sizing calculations must be certified by the registered Commissioner in Section 11.",
        "applicable_section": 11
    },
    "CLAUSE_20_21_MCP_MOUNTING": {
        "clause_ref": "Clause 20 & 21",
        "title": "1.4m Mounting Height (±0.2m) & Escape Route Siting",
        "exact_wording": (
            "Manual call points (MCPs) shall be mounted at a centerline height of 1.4 m above finished floor level (tolerance ±0.2 m, absolute minimum 1.2 m, "
            "maximum 1.4 m in accordance with universal access provisions). Manual call points shall be positioned on escape routes, particularly at every exit "
            "leading to the open air and at all storey exit doorways to stair enclosures. Travel distance to nearest MCP shall not exceed 45 m."
        ),
        "statutory_mandate": "Call point heights and travel distances must be verified on post-work inspection schedules.",
        "applicable_section": 9
    },
    "CLAUSE_24_COMMISSIONING_COC": {
        "clause_ref": "Clause 24 & Annex E",
        "title": "Statutory Commissioning Procedure & Certificate of Compliance Execution",
        "exact_wording": (
            "Upon physical completion of installation and verified pre-commissioning testing, the fire detection system shall undergo formal statutory "
            "commissioning by an accredited SAQCC Fire Detection Commissioner. The Commissioner shall verify design adherence, battery calculations, "
            "audibility, cause-and-effect interfaces, and issue the official SANS 10139 Certificate of Compliance (COC). The safety file dossier shall not "
            "be legally accepted or classified as compliant without the valid COC and Commissioner digital seal."
        ),
        "statutory_mandate": "Only SAQCC registered Commissioners in good standing are authorized to sign Section 14 statutory COC certificates.",
        "applicable_section": 14
    },
    "CLAUSE_25_SITE_LOGBOOK": {
        "clause_ref": "Clause 25 & Annex F",
        "title": "Statutory Site Logbook & Responsible Person Maintenance Obligations",
        "exact_wording": (
            "A dedicated, tamper-proof Fire Alarm System Logbook shall be maintained at the primary Control and Indicating Equipment location. "
            "The designated site Responsible Person shall record: a) weekly manual call point rotational test outcomes; b) monthly ancillary device operations; "
            "c) quarterly and annual service visits by accredited technicians; d) false alarms, unwanted alarms, and faults; and e) any system alterations, isolations, or temporary disconnections."
        ),
        "statutory_mandate": "Failure to maintain the site fire logbook constitutes a breach of OHS Act 85 of 1993 Section 8 duties.",
        "applicable_section": 16
    }
}

# Source PDF 2: SANS 10400-T:2011 Master Clauses
SANS_10400_T_SOURCE_CLAUSES: Dict[str, Dict[str, Any]] = {
    "REGULATION_T1_T2": {
        "clause_ref": "Regulation T1 & T2",
        "title": "General Fire Safety Requirement & Statutory Offences",
        "exact_wording": (
            "Any building shall be so designed, constructed and equipped that in the event of fire: "
            "a) the occupants of the building will be protected and be enabled to evacuate safely; "
            "b) the spread and intensity of fire and smoke will be minimized; "
            "c) structural stability will be maintained for such period as is required; and "
            "d) the generation and spread of dangerous smoke and toxic gases will be controlled. "
            "Failure to comply with Regulation T1 or the obstruction of any escape route constitutes a criminal offence under Act 103 of 1977."
        ),
        "statutory_mandate": "All fire safety installations must conform strictly to prescriptive deemed-to-satisfy rules or an approved Rational Fire Design.",
        "applicable_section": 2
    },
    "CLAUSE_4_4_DIVISION_AREAS": {
        "clause_ref": "Clause 4.4 / Table 3 & 6",
        "title": "Maximum Division Areas & Fire Compartmentalization",
        "exact_wording": (
            "No building shall exceed the maximum permissible fire division area prescribed in Table 3 "
            "(e.g., Occupancy E1/E2/E3 hospital: 1,250 m²; J1 high-hazard commercial storage: 5,000 m² unsprinklered or 10,000 m² multi-storey sprinklered). "
            "Division walls separating compartments shall provide fire resistance of not less than 120 minutes and shall extend structurally through ceilings to the underside of non-combustible roof decks."
        ),
        "statutory_mandate": "Fire detection zones must align with physical fire compartment divisions to ensure coordinated evacuation.",
        "applicable_section": 13
    },
    "CLAUSE_4_10_DOORS_MAGNETIC_HOLD": {
        "clause_ref": "Clause 4.10 / Table 7 & SANS 1253",
        "title": "Fire Doors, Magnetic Hold-Open Releases & Interlocks",
        "exact_wording": (
            "Fire door assemblies installed in division walls, protected corridors, and stair enclosures shall comply with SANS 1253 "
            "(Class A 60 min, Class B 120 min, Class C 120 min, Class D 120 min, Class E 30 min, Class F 30 min). Any fire door held open by electromagnetic "
            "devices shall be released automatically upon: a) activation of any fire detector or manual call point; b) failure of mains power supply; or c) actuation of a local manual release switch."
        ),
        "statutory_mandate": "Magnetic door holders and smoke dampers must be connected to fail-safe output relays on the fire alarm panel.",
        "applicable_section": 11
    },
    "CLAUSE_4_16_4_21_ESCAPE_TRAVEL": {
        "clause_ref": "Clause 4.16 - 4.21 / Table 10",
        "title": "Occupant Escape Travel Distances & Clear Headroom Widths",
        "exact_wording": (
            "The maximum travel distance from any point in a building to the nearest escape door leading to a protected route or open air shall not exceed 45 m "
            "(extended to 60 m in buildings fitted with an approved automatic sprinkler system conforming to SANS 10287). The feeder route travel distance within any room "
            "shall not exceed 15 m. Dead-end corridor length shall not exceed 10 m. Clear vertical headroom along escape paths shall be not less than 2.0 m, "
            "and clear doorway widths shall be not less than 1,000 mm (1,500 mm for disability universal access). Headroom >= 2.0 m."
        ),
        "statutory_mandate": "Emergency evacuation plans and detector layouts must demonstrate unobstructed escape access.",
        "applicable_section": 2
    },
    "CLAUSE_4_31_MANDATORY_DETECTION": {
        "clause_ref": "Clause 4.31",
        "title": "Mandatory Occupancies Requiring Fire Detection & Alarm Systems",
        "exact_wording": (
            "An approved automatic fire detection and alarm system conforming to SANS 10139 shall be installed in: "
            "a) any occupancy classified as F1 (large shop) where the floor area exceeds 500 m²; "
            "b) all occupancies classified as H1 (hotel), H2 (dormitory), E2 (hospital), or E3 (institution), irrespective of height or floor area; "
            "c) any building having a total height exceeding 30 m; and "
            "d) any single storey exceeding 5,000 m² in division area."
        ),
        "statutory_mandate": "Mandatory statutory requirement under National Building Regulations; cannot be waived without rational design approval.",
        "applicable_section": 2
    },
    "CLAUSE_4_34_4_37_EXTINGUISHERS": {
        "clause_ref": "Clause 4.34 - 4.37 / Table 11",
        "title": "Water Fire-Fighting Systems & Portable Extinguisher Density",
        "exact_wording": (
            "Fire hose reels conforming to SANS 543 shall be provided at the rate of one per 500 m² on every storey. Fire hydrants conforming to SANS 1128-1 "
            "shall be provided at the rate of one per 1,000 m² for buildings exceeding 12 m in height. Portable fire extinguishers conforming to SANS 1910 "
            "and serviced to SANS 1475-1 shall be provided according to occupancy risk density (e.g. J1: 1 per 100 m²; Commercial offices G1: 1 per 200 m²)."
        ),
        "statutory_mandate": "All extinguishing appliances must be accessible within a 15 m travel distance.",
        "applicable_section": 8
    },
    "ANNEX_B_RATIONAL_DESIGN": {
        "clause_ref": "Annex B & Regulation A19",
        "title": "Rational Fire Safety Engineering Design Framework",
        "exact_wording": (
            "Where a building does not satisfy the prescriptive deemed-to-satisfy rules of SANS 10400-T, a Rational Fire Safety Engineering Design shall be submitted "
            "by a Competent Person (Fire Engineering) registered with ECSA in terms of the Engineering Profession Act. The design shall follow the BS 7974 framework "
            "encompassing Qualitative Design Review (QDR), Quantitative Subsystem Analysis (SS1 to SS6), and formal local fire authority approval."
        ),
        "statutory_mandate": "Regulation A19 statutory appointment letter and Rational Fire Report must be included in Section 3.",
        "applicable_section": 3
    }
}
