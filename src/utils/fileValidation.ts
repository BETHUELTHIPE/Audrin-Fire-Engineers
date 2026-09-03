/**
 * File Validation Utility for Audrin Fire Engineers Document Management
 * Validates files against strict SANS & enterprise security policies.
 * Strictly rejects executables (EXE, MSI, BAT, CMD, SH, etc.)
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileCategory?: 'image' | 'pdf' | 'cad' | 'word' | 'excel' | 'presentation' | 'archive' | 'other';
  sanitizedName: string;
}

const PROHIBITED_EXTENSIONS = new Set([
  'exe', 'msi', 'bat', 'cmd', 'com', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh',
  'ps1', 'ps1xml', 'ps2', 'ps2xml', 'psc1', 'psc2', 'msh', 'msh1', 'msh2', 'mshxml',
  'msh1xml', 'msh2xml', 'scf', 'lnk', 'inf', 'reg', 'scr', 'cpl', 'dll', 'sys',
  'jar', 'apk', 'app', 'ipa', 'bin', 'sh', 'bash', 'zsh', 'php', 'phtml', 'py', 'pl'
]);

const ALLOWED_MIME_TYPES = new Set([
  // PDFs
  'application/pdf',
  'application/x-pdf',
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Office Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  'application/rtf',
  // Office Excel / Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'text/csv',
  'application/vnd.oasis.opendocument.spreadsheet',
  // Office Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
  // CAD & BIM
  'image/vnd.dwg',
  'image/x-dwg',
  'application/acad',
  'application/x-acad',
  'application/autocad_dwg',
  'application/dwg',
  'application/dxf',
  'application/x-dxf',
  'application/step',
  'application/octet-stream', // Often used for DWG/DXF/CAD
  // Archives
  'application/zip',
  'application/x-zip-compressed'
]);

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'pdfa',
  'jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp', 'tif', 'tiff', 'heic',
  'doc', 'docx', 'odt', 'rtf', 'txt',
  'xls', 'xlsx', 'xlsm', 'csv', 'ods',
  'ppt', 'pptx', 'odp',
  'dwg', 'dxf', 'dwf', 'ifc', 'step', 'stp', 'iges', 'igs', 'rvt', 'rfa',
  'zip'
]);

export function validateFile(file: File, maxSizeBytes: number = 50 * 1024 * 1024): FileValidationResult {
  const fileName = file.name || 'unnamed_file';
  const parts = fileName.split('.');
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase().trim() : '';

  // 1. Check for strictly prohibited executable extensions
  if (PROHIBITED_EXTENSIONS.has(extension)) {
    return {
      isValid: false,
      error: `Security Alert: Executable files (.${extension.toUpperCase()}) are strictly prohibited by Audrin Fire Safety security policy.`,
      sanitizedName: sanitizeFileName(fileName)
    };
  }

  // 2. Check for allowed extensions
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      isValid: false,
      error: `Unsupported file format (.${extension || 'unknown'}). Allowed formats include PDF, Images (JPG, PNG, SVG), CAD (DWG, DXF), and Office documents (Word, Excel, PPT).`,
      sanitizedName: sanitizeFileName(fileName)
    };
  }

  // 3. Check for file size limit
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File exceeds maximum allowed size of ${maxMb}MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      sanitizedName: sanitizeFileName(fileName)
    };
  }

  // 4. Determine category
  let category: 'image' | 'pdf' | 'cad' | 'word' | 'excel' | 'presentation' | 'archive' | 'other' = 'other';
  if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp', 'tif', 'tiff', 'heic'].includes(extension)) {
    category = 'image';
  } else if (['pdf', 'pdfa'].includes(extension)) {
    category = 'pdf';
  } else if (['dwg', 'dxf', 'dwf', 'ifc', 'step', 'stp', 'iges', 'igs', 'rvt', 'rfa'].includes(extension)) {
    category = 'cad';
  } else if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension)) {
    category = 'word';
  } else if (['xls', 'xlsx', 'xlsm', 'csv', 'ods'].includes(extension)) {
    category = 'excel';
  } else if (['ppt', 'pptx', 'odp'].includes(extension)) {
    category = 'presentation';
  } else if (extension === 'zip') {
    category = 'archive';
  }

  return {
    isValid: true,
    fileCategory: category,
    sanitizedName: sanitizeFileName(fileName)
  };
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
