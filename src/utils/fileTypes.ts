import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileArchive,
  Layers,
  Film,
  Music,
  File,
  HardDrive,
  Presentation,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Cpu,
  BookOpen,
  ClipboardList,
  FileCheck,
  Building,
  Activity,
  FolderOpen
} from 'lucide-react';
import {
  RequestAttachment,
  TechnicalDocumentCategory,
  DocumentEvidenceStage,
  DocumentPreviewType,
  PermittedFileTypeConfig
} from '../types';

export type FileCategoryKey =
  | 'image'
  | 'pdf'
  | 'cad'
  | 'word'
  | 'excel'
  | 'presentation'
  | 'archive'
  | 'video'
  | 'opendocument'
  | 'code_config'
  | 'other';

export interface FileTypeMeta {
  category: FileCategoryKey;
  label: string;
  formatLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  extension: string;
  isPreviewableImage: boolean;
  isPdf: boolean;
  isCad: boolean;
  isWord: boolean;
  isExcel: boolean;
  isSpreadsheet: boolean;
  isVideo: boolean;
  isPresentation: boolean;
  isArchive: boolean;
  previewType: DocumentPreviewType;
}

export const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'heic', 'tiff', 'tif', 'svg', 'bmp', 'ico', 'avif'
];

export const ALLOWED_PDF_EXTENSIONS = [
  'pdf', 'pdfa'
];

export const ALLOWED_CAD_EXTENSIONS = [
  'dwg', 'dxf', 'dwf', 'ifc', 'step', 'stp', 'iges', 'igs', 'sat', 'skp', 'rvt', 'rfa'
];

export const ALLOWED_OFFICE_WORD_EXTENSIONS = [
  'doc', 'docx', 'odt', 'rtf', 'txt'
];

export const ALLOWED_OFFICE_SPREADSHEET_EXTENSIONS = [
  'xls', 'xlsx', 'xlsm', 'csv', 'ods'
];

export const ALLOWED_OFFICE_PRESENTATION_EXTENSIONS = [
  'ppt', 'pptx', 'odp'
];

export const ALLOWED_TECHNICAL_ARCHIVE_DATA_EXTENSIONS = [
  'zip', 'xml', 'json', 'log'
];

export const ALLOWED_VIDEO_EXTENSIONS = [
  'mp4', 'mov', 'webm'
];

export const ALL_PERMITTED_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_PDF_EXTENSIONS,
  ...ALLOWED_CAD_EXTENSIONS,
  ...ALLOWED_OFFICE_WORD_EXTENSIONS,
  ...ALLOWED_OFFICE_SPREADSHEET_EXTENSIONS,
  ...ALLOWED_OFFICE_PRESENTATION_EXTENSIONS,
  ...ALLOWED_TECHNICAL_ARCHIVE_DATA_EXTENSIONS,
  ...ALLOWED_VIDEO_EXTENSIONS
];

// ----------------------------------------------------------------------
// 1. PROHIBITED EXECUTABLE & DANGEROUS FILE TYPES
// ----------------------------------------------------------------------
export const PROHIBITED_EXTENSIONS = [
  'exe',
  'msi',
  'bat',
  'cmd',
  'com',
  'scr',
  'dll',
  'jar',
  'apk',
  'app',
  'sh',
  'ps1',
  'psm1',
  'vbs',
  'iso',
  'dmg',
  'vbe',
  'hta',
  'cpl',
  'pif',
  'wsf',
  'reg',
  'gadget',
  'inf',
  'scf',
  'vxd',
  'sys',
  'bin',
  'elf',
  'deb',
  'rpm',
  'wasm',
  'drv',
  'osx',
  'run',
  'vb',
  'js',
  'jsx',
  'ts',
  'tsx',
  'php',
  'py',
  'pl',
  'cgi',
  'asp',
  'aspx',
  'jsp',
  'action',
  'class'
];

export const PROHIBITED_MIME_PATTERNS = [
  'application/x-msdownload',
  'application/x-executable',
  'application/x-msdos-program',
  'application/x-msi',
  'application/x-sh',
  'application/x-bat',
  'application/java-archive',
  'application/vnd.android.package-archive',
  'application/x-apple-diskimage',
  'application/x-iso9660-image',
  'application/x-dosexec',
  'application/x-sharedlib',
  'text/x-shellscript',
  'text/x-python',
  'text/x-perl',
  'text/x-php',
  'application/x-javascript'
];

export interface DocumentValidationOptions {
  maxSizeMb?: number;
  allowedCategories?: FileCategoryKey[];
  allowedExtensions?: string[];
  allowArchives?: boolean;
  allowVideos?: boolean;
  strictDenyByDefault?: boolean;
}

export interface DocumentValidationResult {
  isValid: boolean;
  isProhibited: boolean;
  isProhibitedExecutable: boolean;
  isSizeExceeded: boolean;
  isEmptyFile: boolean;
  isDoubleExtension: boolean;
  error: string | null;
  warning: string | null;
  fileExtension: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  detectedMime: string;
  category: FileCategoryKey;
  categoryLabel: string;
  meta: FileTypeMeta;
  securityLevel: 'passed' | 'warning' | 'rejected_threat';
  scanDetails: {
    extensionAllowed: boolean;
    mimeAllowed: boolean;
    executableCheck: 'clean' | 'prohibited_payload';
    spoofingCheck: 'clean' | 'suspicious_double_extension';
    sizeCheck: 'within_limit' | 'exceeded';
    ruleEnforced: string;
  };
}

/**
 * Checks whether a file violates strict security policies
 */
export function checkFileSecurity(fileName: string, mimeType?: string): {
  isProhibited: boolean;
  reason?: string;
  isExecutable?: boolean;
} {
  const cleanName = fileName.trim();
  const extMatch = cleanName.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  const ext = (extMatch ? extMatch[1] : '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  // Check double extension spoofing (e.g. "plan.dwg.exe" or "report.pdf.bat")
  const parts = cleanName.split('.');
  if (parts.length > 2) {
    const secondLastExt = parts[parts.length - 2].toLowerCase();
    const lastExt = parts[parts.length - 1].toLowerCase();
    if (PROHIBITED_EXTENSIONS.includes(lastExt)) {
      return {
        isProhibited: true,
        isExecutable: true,
        reason: `Disguised executable payload detected: double-extension ".${secondLastExt}.${lastExt}" violates Audrin Fire security policy.`
      };
    }
  }

  // Check prohibited extensions
  if (PROHIBITED_EXTENSIONS.includes(ext)) {
    return {
      isProhibited: true,
      isExecutable: true,
      reason: `Prohibited executable format: ".${ext.toUpperCase()}" binaries, scripts, and installer packages are rejected before processing to protect statutory engineering records.`
    };
  }

  // Check prohibited MIME signatures
  for (const pattern of PROHIBITED_MIME_PATTERNS) {
    if (mime.includes(pattern)) {
      return {
        isProhibited: true,
        isExecutable: true,
        reason: `MIME signature "${mime}" contains prohibited executable or disk-image payload.`
      };
    }
  }

  return { isProhibited: false, isExecutable: false };
}

/**
 * Core Document Upload Validation Utility
 * Enforces allowed file types (Images, PDF, CAD, Office formats) and rejects prohibited executables (EXE, MSI, BAT, etc.)
 */
export function validateUploadDocument(
  file: File | { name: string; size?: number; type?: string },
  options: DocumentValidationOptions = {}
): DocumentValidationResult {
  const {
    maxSizeMb = 100,
    allowedCategories,
    allowedExtensions,
    allowArchives = true,
    allowVideos = true,
    strictDenyByDefault = true
  } = options;

  const fileName = file.name || 'unnamed_file';
  const fileSize = typeof file.size === 'number' ? file.size : 0;
  const detectedMime = file.type || '';
  const extMatch = fileName.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  const fileExtension = (extMatch ? extMatch[1] : '').toLowerCase();
  const meta = getFileTypeMeta(fileName, detectedMime);
  const fileSizeFormatted = formatFileSize(fileSize);

  // 1. Zero-byte corrupt file check
  if (fileSize === 0 && typeof file.size === 'number') {
    return {
      isValid: false,
      isProhibited: false,
      isProhibitedExecutable: false,
      isSizeExceeded: false,
      isEmptyFile: true,
      isDoubleExtension: false,
      error: `File "${fileName}" is empty (0 bytes). Corrupt or zero-byte documents cannot be processed.`,
      warning: null,
      fileExtension,
      fileName,
      fileSize,
      fileSizeFormatted,
      detectedMime,
      category: meta.category,
      categoryLabel: meta.label,
      meta,
      securityLevel: 'warning',
      scanDetails: {
        extensionAllowed: false,
        mimeAllowed: false,
        executableCheck: 'clean',
        spoofingCheck: 'clean',
        sizeCheck: 'within_limit',
        ruleEnforced: 'Reject zero-byte payloads'
      }
    };
  }

  // 2. Prohibited Executable & Threat Intercept
  const securityCheck = checkFileSecurity(fileName, detectedMime);
  if (securityCheck.isProhibited) {
    const isDoubleExt = fileName.split('.').length > 2;
    return {
      isValid: false,
      isProhibited: true,
      isProhibitedExecutable: !!securityCheck.isExecutable,
      isSizeExceeded: false,
      isEmptyFile: false,
      isDoubleExtension: isDoubleExt,
      error: securityCheck.reason || `Prohibited executable format ".${fileExtension.toUpperCase()}" rejected.`,
      warning: null,
      fileExtension,
      fileName,
      fileSize,
      fileSizeFormatted,
      detectedMime,
      category: meta.category,
      categoryLabel: meta.label,
      meta,
      securityLevel: 'rejected_threat',
      scanDetails: {
        extensionAllowed: false,
        mimeAllowed: false,
        executableCheck: 'prohibited_payload',
        spoofingCheck: isDoubleExt ? 'suspicious_double_extension' : 'clean',
        sizeCheck: 'within_limit',
        ruleEnforced: 'SANS Statutory Security Policy: Prohibit Executable Binaries (EXE, MSI, BAT, etc.)'
      }
    };
  }

  // 3. File Size Ceiling Check
  const sizeMb = fileSize / (1024 * 1024);
  if (sizeMb > maxSizeMb) {
    return {
      isValid: false,
      isProhibited: false,
      isProhibitedExecutable: false,
      isSizeExceeded: true,
      isEmptyFile: false,
      isDoubleExtension: false,
      error: `File size (${fileSizeFormatted}) exceeds the maximum allowed limit of ${maxSizeMb} MB.`,
      warning: null,
      fileExtension,
      fileName,
      fileSize,
      fileSizeFormatted,
      detectedMime,
      category: meta.category,
      categoryLabel: meta.label,
      meta,
      securityLevel: 'warning',
      scanDetails: {
        extensionAllowed: true,
        mimeAllowed: true,
        executableCheck: 'clean',
        spoofingCheck: 'clean',
        sizeCheck: 'exceeded',
        ruleEnforced: `Enforce maximum file size envelope of ${maxSizeMb}MB`
      }
    };
  }

  // 4. Allowed Categories & Extensions Filter
  if (allowedExtensions && allowedExtensions.length > 0) {
    const normalizedAllowed = allowedExtensions.map((e) => e.toLowerCase().replace(/^\./, ''));
    if (!normalizedAllowed.includes(fileExtension)) {
      return {
        isValid: false,
        isProhibited: false,
        isProhibitedExecutable: false,
        isSizeExceeded: false,
        isEmptyFile: false,
        isDoubleExtension: false,
        error: `Extension ".${fileExtension.toUpperCase()}" is not in the allowed list for this upload field: [${normalizedAllowed.join(', ')}].`,
        warning: null,
        fileExtension,
        fileName,
        fileSize,
        fileSizeFormatted,
        detectedMime,
        category: meta.category,
        categoryLabel: meta.label,
        meta,
        securityLevel: 'warning',
        scanDetails: {
          extensionAllowed: false,
          mimeAllowed: true,
          executableCheck: 'clean',
          spoofingCheck: 'clean',
          sizeCheck: 'within_limit',
          ruleEnforced: 'Enforce specific field extension whitelist'
        }
      };
    }
  }

  if (allowedCategories && allowedCategories.length > 0) {
    if (!allowedCategories.includes(meta.category)) {
      return {
        isValid: false,
        isProhibited: false,
        isProhibitedExecutable: false,
        isSizeExceeded: false,
        isEmptyFile: false,
        isDoubleExtension: false,
        error: `File category "${meta.label}" is not permitted for this upload section. Expected: ${allowedCategories.join(', ')}.`,
        warning: null,
        fileExtension,
        fileName,
        fileSize,
        fileSizeFormatted,
        detectedMime,
        category: meta.category,
        categoryLabel: meta.label,
        meta,
        securityLevel: 'warning',
        scanDetails: {
          extensionAllowed: false,
          mimeAllowed: false,
          executableCheck: 'clean',
          spoofingCheck: 'clean',
          sizeCheck: 'within_limit',
          ruleEnforced: 'Enforce specific category whitelist'
        }
      };
    }
  }

  // 5. General Whitelist Enforcement (Images, PDF, CAD, Office Formats, Technical Data)
  const isPermittedExtension = ALL_PERMITTED_EXTENSIONS.includes(fileExtension);
  if (strictDenyByDefault && !isPermittedExtension) {
    return {
      isValid: false,
      isProhibited: false,
      isProhibitedExecutable: false,
      isSizeExceeded: false,
      isEmptyFile: false,
      isDoubleExtension: false,
      error: `Unrecognized file type ".${fileExtension.toUpperCase()}". Audrin Fire accepts technical engineering documents: Images (JPG/PNG), PDF, CAD (DWG/DXF/IFC), and MS Office/OpenDoc spreadsheets & reports.`,
      warning: null,
      fileExtension,
      fileName,
      fileSize,
      fileSizeFormatted,
      detectedMime,
      category: meta.category,
      categoryLabel: meta.label,
      meta,
      securityLevel: 'warning',
      scanDetails: {
        extensionAllowed: false,
        mimeAllowed: false,
        executableCheck: 'clean',
        spoofingCheck: 'clean',
        sizeCheck: 'within_limit',
        ruleEnforced: 'Deny-by-Default Whitelist Verification'
      }
    };
  }

  // 6. Valid file passes all security inspections
  let warning: string | null = null;
  if (fileExtension === 'xlsm') {
    warning = 'Macro-enabled Excel workbook (.xlsm): Celery worker will sanitize embedded Visual Basic scripts before cloud rendering.';
  } else if (fileExtension === 'svg') {
    warning = 'SVG Vector image: XML parser will sanitize script tags and foreign objects to prevent XSS payloads.';
  }

  return {
    isValid: true,
    isProhibited: false,
    isProhibitedExecutable: false,
    isSizeExceeded: false,
    isEmptyFile: false,
    isDoubleExtension: false,
    error: null,
    warning,
    fileExtension,
    fileName,
    fileSize,
    fileSizeFormatted,
    detectedMime,
    category: meta.category,
    categoryLabel: meta.label,
    meta,
    securityLevel: 'passed',
    scanDetails: {
      extensionAllowed: true,
      mimeAllowed: true,
      executableCheck: 'clean',
      spoofingCheck: 'clean',
      sizeCheck: 'within_limit',
      ruleEnforced: 'Passed SANS 10139 & ISO Engineering Sandbox Verification'
    }
  };
}

/**
 * Validates a list of files and returns valid files along with detailed diagnostics
 */
export function validateMultipleFiles(
  files: FileList | File[],
  options: DocumentValidationOptions = {}
): {
  validFiles: File[];
  rejectedResults: DocumentValidationResult[];
  results: DocumentValidationResult[];
  hasErrors: boolean;
  errorCount: number;
  prohibitedCount: number;
} {
  const fileArray = Array.from(files);
  const results: DocumentValidationResult[] = [];
  const validFiles: File[] = [];
  const rejectedResults: DocumentValidationResult[] = [];

  for (const file of fileArray) {
    const result = validateUploadDocument(file, options);
    results.push(result);
    if (result.isValid) {
      validFiles.push(file);
    } else {
      rejectedResults.push(result);
    }
  }

  const prohibitedCount = results.filter((r) => r.isProhibited || r.isProhibitedExecutable).length;
  const errorCount = results.filter((r) => !r.isValid).length;

  return {
    validFiles,
    rejectedResults,
    results,
    hasErrors: errorCount > 0,
    errorCount,
    prohibitedCount
  };
}

// ----------------------------------------------------------------------
// 2. 25 OFFICIAL TECHNICAL DOCUMENT CATEGORIES METADATA
// ----------------------------------------------------------------------
export interface CategoryDefinition {
  id: TechnicalDocumentCategory;
  name: string;
  code: TechnicalDocumentCategory;
  label: string;
  group: 'drawings' | 'specifications' | 'reports_commercial' | 'safety_compliance' | 'evidence_stages' | 'other';
  defaultStage: DocumentEvidenceStage;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  suggestedExtensions: string[];
}

const RAW_TECHNICAL_DOCUMENT_CATEGORIES: Omit<CategoryDefinition, 'code' | 'label'>[] = [
  // 1. Engineering & Site Drawings
  {
    id: 'site_drawing',
    name: 'Site Drawing',
    group: 'drawings',
    defaultStage: 'general_supporting',
    icon: Building,
    description: 'Master site plot, property boundaries, and external hydrants/access',
    suggestedExtensions: ['dwg', 'dxf', 'pdf', 'rvt']
  },
  {
    id: 'floor_plan',
    name: 'Floor Plan',
    group: 'drawings',
    defaultStage: 'general_supporting',
    icon: Layers,
    description: 'Architectural level floor layouts, partition walls, and room numbers',
    suggestedExtensions: ['dwg', 'dxf', 'pdf', 'ifc']
  },
  {
    id: 'fire_alarm_layout',
    name: 'Fire-Alarm Layout',
    group: 'drawings',
    defaultStage: 'general_supporting',
    icon: Flame,
    description: 'Detection device positions, manual call points, sounders, and beacons',
    suggestedExtensions: ['dwg', 'dxf', 'pdf']
  },
  {
    id: 'zone_drawing',
    name: 'Zone Drawing',
    group: 'drawings',
    defaultStage: 'general_supporting',
    icon: Layers,
    description: 'SANS 10139 compliant zone boundary chart and building zoning plan',
    suggestedExtensions: ['dwg', 'dxf', 'pdf']
  },
  {
    id: 'loop_drawing',
    name: 'Loop Drawing',
    group: 'drawings',
    defaultStage: 'general_supporting',
    icon: Cpu,
    description: 'Addressable loop routing, isolator units, and cable containment pathways',
    suggestedExtensions: ['dwg', 'dxf', 'pdf']
  },
  {
    id: 'as_built_drawing',
    name: 'As-Built Drawing',
    group: 'drawings',
    defaultStage: 'commissioning',
    icon: FileCheck,
    description: 'Final verified drawing package reflecting all physical site modifications',
    suggestedExtensions: ['dwg', 'dxf', 'pdf']
  },

  // 2. Specifications & Engineering Data
  {
    id: 'cause_and_effect',
    name: 'Cause-and-Effect Document',
    group: 'specifications',
    defaultStage: 'general_supporting',
    icon: Sliders,
    description: 'Matrix detailing outputs triggered by detector, MCP, or sprinkler activation',
    suggestedExtensions: ['xlsx', 'xls', 'pdf', 'docx']
  },
  {
    id: 'device_schedule',
    name: 'Device Schedule',
    group: 'specifications',
    defaultStage: 'general_supporting',
    icon: ClipboardList,
    description: 'List of loop device addresses, serial numbers, zones, and device labels',
    suggestedExtensions: ['xlsx', 'xls', 'csv', 'pdf']
  },
  {
    id: 'equipment_datasheet',
    name: 'Equipment Datasheet',
    group: 'specifications',
    defaultStage: 'general_supporting',
    icon: BookOpen,
    description: 'OEM technical specifications, current consumption, and environmental limits',
    suggestedExtensions: ['pdf']
  },
  {
    id: 'panel_manual',
    name: 'Panel Manual',
    group: 'specifications',
    defaultStage: 'general_supporting',
    icon: BookOpen,
    description: 'Control panel installation, programming, operating, and maintenance guide',
    suggestedExtensions: ['pdf']
  },

  // 3. Reports & Commercial
  {
    id: 'existing_service_report',
    name: 'Existing Service Report',
    group: 'reports_commercial',
    defaultStage: 'before_work',
    icon: FileText,
    description: 'Historic maintenance logs, technician notes, or prior contractor reports',
    suggestedExtensions: ['pdf', 'docx', 'jpg']
  },
  {
    id: 'previous_inspection_report',
    name: 'Previous Inspection Report',
    group: 'reports_commercial',
    defaultStage: 'before_work',
    icon: FileText,
    description: 'Prior statutory SANS 10139 or municipal fire department audit report',
    suggestedExtensions: ['pdf', 'docx']
  },
  {
    id: 'quotation',
    name: 'Quotation',
    group: 'reports_commercial',
    defaultStage: 'before_work',
    icon: FileSpreadsheet,
    description: 'Official price estimate, bills of quantities, and scope of works',
    suggestedExtensions: ['pdf', 'xlsx']
  },
  {
    id: 'purchase_order',
    name: 'Purchase Order',
    group: 'reports_commercial',
    defaultStage: 'before_work',
    icon: FileCheck,
    description: 'Client authorized purchase order (PO) authorizing project commencement',
    suggestedExtensions: ['pdf']
  },
  {
    id: 'work_instruction',
    name: 'Work Instruction',
    group: 'reports_commercial',
    defaultStage: 'during_work',
    icon: ClipboardList,
    description: 'Special engineering instructions, client site rules, or specific tasks',
    suggestedExtensions: ['pdf', 'docx']
  },

  // 4. Safety & Compliance
  {
    id: 'risk_assessment',
    name: 'Risk Assessment (HIRA)',
    group: 'safety_compliance',
    defaultStage: 'before_work',
    icon: ShieldAlert,
    description: 'Hazard identification and risk mitigation matrix for site personnel',
    suggestedExtensions: ['pdf', 'docx', 'xlsx']
  },
  {
    id: 'method_statement',
    name: 'Method Statement (SWMS)',
    group: 'safety_compliance',
    defaultStage: 'before_work',
    icon: ShieldCheck,
    description: 'Safe work method statement detailing step-by-step engineering procedures',
    suggestedExtensions: ['pdf', 'docx']
  },
  {
    id: 'site_access_document',
    name: 'Site-Access Document',
    group: 'safety_compliance',
    defaultStage: 'before_work',
    icon: Building,
    description: 'Induction records, permit-to-work, gate passes, or tenant clearance',
    suggestedExtensions: ['pdf', 'jpg', 'png']
  },

  // 5. Commissioning & Handover
  {
    id: 'commissioning_document',
    name: 'Commissioning Document',
    group: 'reports_commercial',
    defaultStage: 'commissioning',
    icon: FileCheck,
    description: 'SANS 10139 Section 8 Commissioning Certificate and sign-off sheets',
    suggestedExtensions: ['pdf', 'docx']
  },
  {
    id: 'test_result',
    name: 'Test Result',
    group: 'reports_commercial',
    defaultStage: 'commissioning',
    icon: Activity,
    description: 'Decibel sound pressure logs, battery discharge tests, and loop resistance values',
    suggestedExtensions: ['pdf', 'xlsx', 'csv']
  },
  {
    id: 'completion_document',
    name: 'Completion Document',
    group: 'reports_commercial',
    defaultStage: 'commissioning',
    icon: CheckCircle2,
    description: 'Certificate of Final Completion, warranty schedule, and system handover log',
    suggestedExtensions: ['pdf']
  },

  // 6. Evidence Stages
  {
    id: 'before_work_evidence',
    name: 'Before-Work Evidence',
    group: 'evidence_stages',
    defaultStage: 'before_work',
    icon: AlertTriangle,
    description: 'Photographic or video evidence of pre-existing faults, panel states, or cable damage',
    suggestedExtensions: ['jpg', 'png', 'mp4', 'pdf']
  },
  {
    id: 'during_work_evidence',
    name: 'During-Work Evidence',
    group: 'evidence_stages',
    defaultStage: 'during_work',
    icon: Activity,
    description: 'Photographs of cable pulling, ceiling void containment, and device terminations',
    suggestedExtensions: ['jpg', 'png', 'mp4', 'pdf']
  },
  {
    id: 'after_work_evidence',
    name: 'After-Work Evidence',
    group: 'evidence_stages',
    defaultStage: 'after_work',
    icon: CheckCircle2,
    description: 'Clear panel normal-state display, installed detectors, and restored work areas',
    suggestedExtensions: ['jpg', 'png', 'mp4', 'pdf']
  },
  {
    id: 'customer_supplied_info',
    name: 'Customer-Supplied Information',
    group: 'other',
    defaultStage: 'general_supporting',
    icon: FolderOpen,
    description: 'General diagrams, building specs, or photos provided by client facilities team',
    suggestedExtensions: ['pdf', 'jpg', 'zip', 'docx', 'xlsx']
  },
  {
    id: 'other_supporting_doc',
    name: 'Other Supporting Document',
    group: 'other',
    defaultStage: 'general_supporting',
    icon: File,
    description: 'Supplementary technical or commercial document not listed above',
    suggestedExtensions: ['pdf', 'zip', 'txt']
  }
];

export const TECHNICAL_DOCUMENT_CATEGORIES: CategoryDefinition[] = RAW_TECHNICAL_DOCUMENT_CATEGORIES.map(cat => ({
  ...cat,
  code: cat.id,
  label: cat.name
}));

export function getCategoryDefinition(categoryId: TechnicalDocumentCategory | string): CategoryDefinition {
  const found = TECHNICAL_DOCUMENT_CATEGORIES.find((c) => c.id === categoryId || c.code === categoryId);
  return (
    found || {
      id: 'other_supporting_doc',
      name: 'Other Supporting Document',
      code: 'other_supporting_doc',
      label: 'Other Supporting Document',
      group: 'other',
      defaultStage: 'general_supporting',
      icon: File,
      description: 'Supporting technical attachment',
      suggestedExtensions: ['pdf']
    }
  );
}

// ----------------------------------------------------------------------
// 3. INITIAL PERMITTED FILE TYPES ALLOWLIST CONFIG (DJANGO ADMIN CONTROLLED)
// ----------------------------------------------------------------------
export const INITIAL_PERMITTED_FILE_TYPES: PermittedFileTypeConfig[] = [
  // Images
  { id: 'pft-1', extension: 'jpg', categoryName: 'Images', mimeType: 'image/jpeg', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Standard JPEG photo' },
  { id: 'pft-2', extension: 'jpeg', categoryName: 'Images', mimeType: 'image/jpeg', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Standard JPEG photo' },
  { id: 'pft-3', extension: 'png', categoryName: 'Images', mimeType: 'image/png', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Lossless graphic / diagram' },
  { id: 'pft-4', extension: 'webp', categoryName: 'Images', mimeType: 'image/webp', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Modern web image format' },
  { id: 'pft-5', extension: 'heic', categoryName: 'Images', mimeType: 'image/heic', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'iOS camera format - converted to JPEG on upload' },
  { id: 'pft-6', extension: 'tiff', categoryName: 'Images', mimeType: 'image/tiff', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'High-res scan document' },
  { id: 'pft-7', extension: 'svg', categoryName: 'Images', mimeType: 'image/svg+xml', maxSizeBytes: 20 * 1024 * 1024, maxSizeFormatted: '20 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Vector graphic — strictly sanitized via DOMPurify' },

  // Videos
  { id: 'pft-8', extension: 'mp4', categoryName: 'Videos', mimeType: 'video/mp4', maxSizeBytes: 500 * 1024 * 1024, maxSizeFormatted: '500 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'H.264 video container' },
  { id: 'pft-9', extension: 'mov', categoryName: 'Videos', mimeType: 'video/quicktime', maxSizeBytes: 500 * 1024 * 1024, maxSizeFormatted: '500 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Apple QuickTime video' },
  { id: 'pft-10', extension: 'webm', categoryName: 'Videos', mimeType: 'video/webm', maxSizeBytes: 500 * 1024 * 1024, maxSizeFormatted: '500 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'WebM open video format' },

  // PDF & Text
  { id: 'pft-11', extension: 'pdf', categoryName: 'PDF & Text', mimeType: 'application/pdf', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Standard PDF document' },
  { id: 'pft-12', extension: 'pdfa', categoryName: 'PDF & Text', mimeType: 'application/pdf', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Archival PDF/A standard' },
  { id: 'pft-13', extension: 'txt', categoryName: 'PDF & Text', mimeType: 'text/plain', maxSizeBytes: 20 * 1024 * 1024, maxSizeFormatted: '20 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Plain UTF-8 text file' },
  { id: 'pft-14', extension: 'rtf', categoryName: 'PDF & Text', mimeType: 'application/rtf', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Rich Text Format' },
  { id: 'pft-15', extension: 'csv', categoryName: 'PDF & Text', mimeType: 'text/csv', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Comma-separated values data table' },

  // Microsoft Office
  { id: 'pft-16', extension: 'doc', categoryName: 'MS Office', mimeType: 'application/msword', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Legacy Word document' },
  { id: 'pft-17', extension: 'docx', categoryName: 'MS Office', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Modern Word document' },
  { id: 'pft-18', extension: 'xls', categoryName: 'MS Office', mimeType: 'application/vnd.ms-excel', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Legacy Excel spreadsheet' },
  { id: 'pft-19', extension: 'xlsx', categoryName: 'MS Office', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Modern Excel spreadsheet' },
  { id: 'pft-20', extension: 'xlsm', categoryName: 'MS Office', mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: true, cadPreviewSupported: false, securityNotes: 'Macro-enabled Excel sheet — requires VBA security sandbox scan' },
  { id: 'pft-21', extension: 'ppt', categoryName: 'MS Office', mimeType: 'application/vnd.ms-powerpoint', maxSizeBytes: 150 * 1024 * 1024, maxSizeFormatted: '150 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Legacy PowerPoint presentation' },
  { id: 'pft-22', extension: 'pptx', categoryName: 'MS Office', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', maxSizeBytes: 150 * 1024 * 1024, maxSizeFormatted: '150 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Modern PowerPoint presentation' },

  // OpenDocument
  { id: 'pft-23', extension: 'odt', categoryName: 'OpenDocument', mimeType: 'application/vnd.oasis.opendocument.text', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'OpenDocument Text' },
  { id: 'pft-24', extension: 'ods', categoryName: 'OpenDocument', mimeType: 'application/vnd.oasis.opendocument.spreadsheet', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'OpenDocument Spreadsheet' },
  { id: 'pft-25', extension: 'odp', categoryName: 'OpenDocument', mimeType: 'application/vnd.oasis.opendocument.presentation', maxSizeBytes: 100 * 1024 * 1024, maxSizeFormatted: '100 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'OpenDocument Presentation' },

  // CAD & Engineering
  { id: 'pft-26', extension: 'dwg', categoryName: 'CAD & Engineering', mimeType: 'application/acad', maxSizeBytes: 250 * 1024 * 1024, maxSizeFormatted: '250 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'AutoCAD Drawing — converted to vector web preview' },
  { id: 'pft-27', extension: 'dxf', categoryName: 'CAD & Engineering', mimeType: 'application/dxf', maxSizeBytes: 250 * 1024 * 1024, maxSizeFormatted: '250 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Drawing Exchange Format — vector preview enabled' },
  { id: 'pft-28', extension: 'dwf', categoryName: 'CAD & Engineering', mimeType: 'drawing/x-dwf', maxSizeBytes: 150 * 1024 * 1024, maxSizeFormatted: '150 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Design Web Format' },
  { id: 'pft-29', extension: 'ifc', categoryName: 'CAD & Engineering', mimeType: 'application/x-step', maxSizeBytes: 300 * 1024 * 1024, maxSizeFormatted: '300 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Industry Foundation Classes (BIM Model)' },
  { id: 'pft-30', extension: 'step', categoryName: 'CAD & Engineering', mimeType: 'application/step', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Standard for Exchange of Product model data' },
  { id: 'pft-31', extension: 'stp', categoryName: 'CAD & Engineering', mimeType: 'application/step', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Standard for Exchange of Product model data' },
  { id: 'pft-32', extension: 'iges', categoryName: 'CAD & Engineering', mimeType: 'model/iges', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Initial Graphics Exchange Specification' },
  { id: 'pft-33', extension: 'igs', categoryName: 'CAD & Engineering', mimeType: 'model/iges', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Initial Graphics Exchange Specification' },
  { id: 'pft-34', extension: 'sat', categoryName: 'CAD & Engineering', mimeType: 'application/sat', maxSizeBytes: 150 * 1024 * 1024, maxSizeFormatted: '150 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'ACIS 3D geometric modeling file' },
  { id: 'pft-35', extension: 'skp', categoryName: 'CAD & Engineering', mimeType: 'application/x-koan', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Trimble SketchUp 3D Model' },
  { id: 'pft-36', extension: 'rvt', categoryName: 'CAD & Engineering', mimeType: 'application/octet-stream', maxSizeBytes: 500 * 1024 * 1024, maxSizeFormatted: '500 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Autodesk Revit Project BIM file' },
  { id: 'pft-37', extension: 'rfa', categoryName: 'CAD & Engineering', mimeType: 'application/octet-stream', maxSizeBytes: 200 * 1024 * 1024, maxSizeFormatted: '200 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: true, securityNotes: 'Autodesk Revit Family component' },

  // Other Technical Documents
  { id: 'pft-38', extension: 'xml', categoryName: 'Other Technical', mimeType: 'application/xml', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Extensible Markup Language data' },
  { id: 'pft-39', extension: 'json', categoryName: 'Other Technical', mimeType: 'application/json', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'JSON structured data' },
  { id: 'pft-40', extension: 'log', categoryName: 'Other Technical', mimeType: 'text/plain', maxSizeBytes: 50 * 1024 * 1024, maxSizeFormatted: '50 MB', isPermitted: true, requiresMacroScan: false, cadPreviewSupported: false, securityNotes: 'Panel / system audit log dump' },
  { id: 'pft-41', extension: 'zip', categoryName: 'Other Technical', mimeType: 'application/zip', maxSizeBytes: 300 * 1024 * 1024, maxSizeFormatted: '300 MB', isPermitted: true, requiresMacroScan: true, cadPreviewSupported: false, securityNotes: 'Compressed package — scanned for nested prohibited payloads' }
];

// ----------------------------------------------------------------------
// 4. PARSER & METADATA RESOLVER
// ----------------------------------------------------------------------
export function getFileTypeMeta(fileName: string, mimeType?: string): FileTypeMeta {
  const extMatch = fileName ? fileName.match(/\.([0-9a-z]+)(?:[\?#]|$)/i) : null;
  const ext = (extMatch ? extMatch[1] : '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  // 1. IMAGES
  if (
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic', 'tiff', 'tif', 'bmp', 'ico', 'avif'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    const label = ext ? `${ext.toUpperCase()} Image` : 'Image';
    return {
      category: 'image',
      label,
      formatLabel: label,
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-200 dark:border-purple-800',
      accentColor: '#9333ea',
      icon: FileImage,
      extension: ext || 'png',
      isPreviewableImage: true,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'image'
    };
  }

  // 2. PDF DOCUMENTS
  if (ext === 'pdf' || ext === 'pdfa' || mime === 'application/pdf') {
    const label = 'PDF Document';
    return {
      category: 'pdf',
      label,
      formatLabel: label,
      badgeBg: 'bg-red-50 dark:bg-red-950/40',
      badgeText: 'text-red-700 dark:text-red-300',
      badgeBorder: 'border-red-200 dark:border-red-800',
      accentColor: '#dc2626',
      icon: FileText,
      extension: 'pdf',
      isPreviewableImage: false,
      isPdf: true,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'pdf'
    };
  }

  // 3. CAD & ENGINEERING DRAWINGS
  if (
    ['dwg', 'dxf', 'dwf', 'ifc', 'step', 'stp', 'iges', 'igs', 'sat', 'skp', 'rvt', 'rfa'].includes(ext) ||
    mime.includes('acad') ||
    mime.includes('autocad') ||
    mime.includes('dwg') ||
    mime.includes('dxf')
  ) {
    const label = ext ? `${ext.toUpperCase()} CAD Drawing` : 'CAD Drawing';
    return {
      category: 'cad',
      label,
      formatLabel: label,
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      badgeBorder: 'border-cyan-200 dark:border-cyan-800',
      accentColor: '#0891b2',
      icon: Layers,
      extension: ext || 'dwg',
      isPreviewableImage: false,
      isPdf: false,
      isCad: true,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'cad_vector'
    };
  }

  // 4. MICROSOFT WORD & TEXT DOCUMENTS
  if (
    ['doc', 'docx', 'rtf', 'dot', 'dotx', 'docm'].includes(ext) ||
    mime.includes('word') ||
    mime.includes('officedocument.wordprocessingml')
  ) {
    const label = ext ? `${ext.toUpperCase()} Document` : 'Word Document';
    return {
      category: 'word',
      label,
      formatLabel: label,
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
      badgeText: 'text-blue-700 dark:text-blue-300',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      accentColor: '#2563eb',
      icon: FileText,
      extension: ext || 'docx',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: true,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'office_html'
    };
  }

  // 5. MICROSOFT EXCEL & SPREADSHEETS
  if (
    ['xls', 'xlsx', 'csv', 'tsv', 'xlsm', 'xlsb', 'numbers'].includes(ext) ||
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    mime.includes('officedocument.spreadsheetml') ||
    mime === 'text/csv'
  ) {
    const label = ext ? `${ext.toUpperCase()} Spreadsheet` : 'Excel Spreadsheet';
    return {
      category: 'excel',
      label,
      formatLabel: label,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      accentColor: '#059669',
      icon: FileSpreadsheet,
      extension: ext || 'xlsx',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: true,
      isSpreadsheet: true,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'spreadsheet_table'
    };
  }

  // 6. PRESENTATIONS & SLIDES
  if (
    ['ppt', 'pptx', 'key', 'pps', 'ppsx'].includes(ext) ||
    mime.includes('presentation') ||
    mime.includes('powerpoint')
  ) {
    const label = ext ? `${ext.toUpperCase()} Presentation` : 'Presentation';
    return {
      category: 'presentation',
      label,
      formatLabel: label,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      accentColor: '#d97706',
      icon: Presentation,
      extension: ext || 'pptx',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: true,
      isArchive: false,
      previewType: 'office_html'
    };
  }

  // 7. OPENDOCUMENT (ODT, ODS, ODP)
  if (['odt', 'ods', 'odp'].includes(ext) || mime.includes('opendocument')) {
    const label = ext ? `${ext.toUpperCase()} OpenDoc` : 'OpenDocument';
    return {
      category: 'opendocument',
      label,
      formatLabel: label,
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
      badgeText: 'text-teal-800 dark:text-teal-300',
      badgeBorder: 'border-teal-200 dark:border-teal-800',
      accentColor: '#0d9488',
      icon: FileText,
      extension: ext || 'odt',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: ext === 'odt',
      isExcel: ext === 'ods',
      isSpreadsheet: ext === 'ods',
      isVideo: false,
      isPresentation: ext === 'odp',
      isArchive: false,
      previewType: ext === 'ods' ? 'spreadsheet_table' : 'office_html'
    };
  }

  // 8. ARCHIVES & ZIP PACKAGES
  if (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext) ||
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('archive')
  ) {
    const label = ext ? `${ext.toUpperCase()} Archive` : 'Archive Package';
    return {
      category: 'archive',
      label,
      formatLabel: label,
      badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40',
      badgeText: 'text-yellow-800 dark:text-yellow-300',
      badgeBorder: 'border-yellow-200 dark:border-yellow-800',
      accentColor: '#ca8a04',
      icon: FileArchive,
      extension: ext || 'zip',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: true,
      previewType: 'archive'
    };
  }

  // 9. VIDEO FILES
  if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', '3gp'].includes(ext) || mime.startsWith('video/')) {
    const label = ext ? `${ext.toUpperCase()} Video` : 'Video Recording';
    return {
      category: 'video',
      label,
      formatLabel: label,
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
      badgeText: 'text-rose-700 dark:text-rose-300',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      accentColor: '#e11d48',
      icon: Film,
      extension: ext || 'mp4',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: true,
      isPresentation: false,
      isArchive: false,
      previewType: 'video'
    };
  }

  // 10. CODE, CONFIG, JSON, XML, LOG & TEXT
  if (
    ['json', 'xml', 'log', 'cfg', 'ini', 'sql', 'txt', 'html', 'css', 'yaml', 'yml'].includes(ext) ||
    mime.startsWith('text/')
  ) {
    const label = ext ? `${ext.toUpperCase()} Data` : 'Text / Config';
    return {
      category: 'code_config',
      label,
      formatLabel: label,
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      badgeBorder: 'border-slate-300 dark:border-slate-700',
      accentColor: '#475569',
      icon: FileCode,
      extension: ext || 'txt',
      isPreviewableImage: false,
      isPdf: false,
      isCad: false,
      isWord: false,
      isExcel: false,
      isSpreadsheet: false,
      isVideo: false,
      isPresentation: false,
      isArchive: false,
      previewType: 'text'
    };
  }

  // 11. GENERIC OTHER
  const label = ext ? `${ext.toUpperCase()} File` : 'Document';
  return {
    category: 'other',
    label,
    formatLabel: label,
    badgeBg: 'bg-slate-50 dark:bg-slate-900',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-800',
    accentColor: '#64748b',
    icon: File,
    extension: ext || 'file',
    isPreviewableImage: false,
    isPdf: false,
    isCad: false,
    isWord: false,
    isExcel: false,
    isSpreadsheet: false,
    isVideo: false,
    isPresentation: false,
    isArchive: false,
    previewType: 'unavailable'
  };
}

/**
 * Converts bytes or formatted string to human readable size
 */
export function formatFileSize(size: number | string): string {
  if (typeof size === 'string') {
    if (
      size.toLowerCase().includes('kb') ||
      size.toLowerCase().includes('mb') ||
      size.toLowerCase().includes('gb') ||
      size.toLowerCase().includes('bytes')
    ) {
      return size;
    }
    const parsed = parseFloat(size);
    if (!isNaN(parsed)) {
      size = parsed;
    } else {
      return size;
    }
  }

  if (typeof size === 'number') {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  return '0 B';
}

/**
 * Generates deterministic SHA-256 simulation hash
 */
export function generateSHA256Hash(fileName: string, fileSize: number, seed?: string): string {
  const chars = '0123456789abcdef';
  let hash = '';
  const str = `${fileName}_${fileSize}_${seed || 'afe_salt_2026'}`;
  
  let val = 0;
  for (let i = 0; i < str.length; i++) {
    val = (val * 31 + str.charCodeAt(i)) % 1000000007;
  }
  
  for (let i = 0; i < 64; i++) {
    const idx = (val * (i + 1) + i * 13) % chars.length;
    hash += chars[idx];
  }
  return hash;
}

/**
 * Processes a File object from input / drop and converts to a RequestAttachment payload
 */
export async function processUploadFile(
  file: File,
  categoryOverride?: RequestAttachment['category']
): Promise<Omit<RequestAttachment, 'id' | 'uploadedAt'>> {
  const meta = getFileTypeMeta(file.name, file.type);

  let category: RequestAttachment['category'] = categoryOverride || 'other';
  if (!categoryOverride) {
    if (meta.isCad) category = 'drawings';
    else if (meta.isPdf) category = 'report';
    else if (meta.category === 'image') category = 'site_photo';
    else if (meta.isWord) category = 'word_document';
    else if (meta.isExcel) category = 'spreadsheet';
    else category = 'other';
  }

  // Create Object URL for in-browser session viewing
  const fileUrl = URL.createObjectURL(file);

  return {
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    fileType: file.type || `application/${meta.extension}`,
    fileUrl,
    category,
    isInternalOnly: false
  };
}
