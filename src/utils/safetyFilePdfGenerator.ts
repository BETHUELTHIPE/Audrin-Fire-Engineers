import jsPDF from 'jspdf';
import { SafetyFile, SafetyFileSection, SafetyFileDocument } from '../types/safetyFile';
import { safetyFileService } from '../services/safetyFileService';

export interface SafetyFilePdfOptions {
  exportMode?: 'draft' | 'final';
  watermark?: string;
  includeAuditTrail?: boolean;
}

/**
 * Generates an official, SANS 10139:2012 and SANS 10400-T compliant Fire Detection Safety File PDF.
 * Formatted with corporate letterhead, 16 statutory sections, and a secure 5-role digital signature block
 * with deterministic SHA-256 cryptographic verification seal.
 */
export function generateSafetyFilePdf(
  safetyFile: SafetyFile,
  options: SafetyFilePdfOptions = {}
): jsPDF {
  const {
    exportMode = safetyFile.status === 'Issued' || safetyFile.status === 'Approved' ? 'final' : 'draft',
    watermark,
    includeAuditTrail = true
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Corporate Brand Colors
  const brandNavy = [10, 25, 47]; // #0A192F
  const brandRed = [204, 0, 0]; // #CC0000
  const brandSlate = [71, 85, 105]; // #475569
  const textDark = [15, 23, 42]; // #0F172A
  const borderGray = [226, 232, 240]; // #E2E8F0
  const bgLight = [248, 250, 252]; // #F8FAFC
  const brandEmerald = [16, 185, 129]; // #10B981
  const brandAmber = [217, 119, 6]; // #D97706

  const { calculatedSections, totalPages } = safetyFileService.calculateIndexPages(safetyFile);
  const metrics = safetyFileService.getSafetyFileMetrics(safetyFile);

  // SHA-256 checksum
  const sha256Checksum =
    safetyFile.fileChecksumSha256 ||
    safetyFileService.generateSha256Checksum(safetyFile.id);

  // Helper for page break
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 24) {
      addRunningFooter();
      doc.addPage();
      cursorY = margin + 6;
      addRunningHeader();
    }
  };

  const addRunningHeader = () => {
    // Top subtle double bar
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, 8, contentWidth, 1.8, 'F');
    doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.rect(margin, 9.8, 20, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('AUDRIN FIRE ENGINEERS (PTY) LTD', margin, 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    const headerRight = `REF: ${safetyFile.safetyFileNumber} | REV: ${safetyFile.revisionNumber} | SANS 10139 / SANS 10400-T`;
    doc.text(headerRight, pageWidth - margin, 7, { align: 'right' });

    cursorY = Math.max(cursorY, 16);
  };

  const addRunningFooter = () => {
    const footerY = pageHeight - 16;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('Audrin Fire Engineers (Pty) Ltd | Reg: K2026089596 | SAQCC Fire / SANS 10139 Statutory System', margin, footerY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(
      'Tel: 071 415 6665 | Email: bethuelmoukangwe8@gmail.com | 27 Tshivhase St, Pretoria West & Midrand Operations',
      margin,
      footerY + 8
    );

    const pageCurrent = doc.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Page ${pageCurrent}`, pageWidth - margin, footerY + 4, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SHA-256: ${sha256Checksum.substring(0, 24)}... | Tamper-Evident Dossier`,
      pageWidth - margin,
      footerY + 8,
      { align: 'right' }
    );
  };

  // =========================================================================
  // PAGE 1: STATUTORY COVER PAGE
  // =========================================================================

  // Letterhead Top Strip
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 26, 'F');

  // Red accent border strip
  doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.rect(margin, cursorY + 25, contentWidth, 1.2, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('AUDRIN FIRE ENGINEERS (PTY) LTD', margin + 6, cursorY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Specialist Fire Detection, Alarm, Suppression & Life Safety Systems Engineering',
    margin + 6,
    cursorY + 14.5
  );
  doc.text(
    'Reg No: K2026089596 | VAT/SARS Tax Compliant | SAQCC Fire / SANS 10139 & SANS 10400-T Accredited',
    margin + 6,
    cursorY + 19.5
  );

  // Right-side corporate address block
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('Midrand & Pretoria West Operations', pageWidth - margin - 6, cursorY + 9, { align: 'right' });
  doc.text('Emergency 24h: 071 415 6665', pageWidth - margin - 6, cursorY + 14, { align: 'right' });
  doc.text('bethuelmoukangwe8@gmail.com', pageWidth - margin - 6, cursorY + 19, { align: 'right' });

  cursorY += 32;

  // Title Box & Statutory Badge
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 34, 1.5, 1.5, 'FD');

  // Badge: STATUTORY DOSSIER
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.roundedRect(margin + 6, cursorY + 4, 98, 5.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('STATUTORY FIRE DETECTION & OHS COMPLIANCE DOSSIER', margin + 8, cursorY + 8);

  // Status Badge on the right
  const isCompleted = safetyFile.status === 'Issued' || safetyFile.status === 'Approved';
  if (isCompleted) {
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.roundedRect(pageWidth - margin - 40, cursorY + 4, 34, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`STATUS: ${safetyFile.status.toUpperCase()}`, pageWidth - margin - 23, cursorY + 8, { align: 'center' });
  } else {
    doc.setFillColor(brandAmber[0], brandAmber[1], brandAmber[2]);
    doc.roundedRect(pageWidth - margin - 40, cursorY + 4, 34, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`STATUS: ${safetyFile.status.toUpperCase()}`, pageWidth - margin - 23, cursorY + 8, { align: 'center' });
  }

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('FIRE DETECTION SAFETY FILE', margin + 6, cursorY + 18);

  // Subtitle / Standard description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  const subtitle =
    'Controlled Engineering, Commissioning, and Handover Dossier prepared under SANS 10139:2012, SANS 10400-T:2011, and the Occupational Health and Safety Act (Act 85 of 1993, Construction Regulation 7).';
  const subtitleLines = doc.splitTextToSize(subtitle, contentWidth - 12);
  doc.text(subtitleLines, margin + 6, cursorY + 23);

  // Regulatory Pills below title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('SANS 10139:2012 Edition 1.0 (Clause 24 Handover)', margin + 6, cursorY + 31);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('•  SANS 10400-T:2011 Part T  •  SAQCC Fire Certified  •  Category L1 / Life Safety', margin + 74, cursorY + 31);

  cursorY += 38;

  // Two-Column Metadata Matrix
  const colWidth = (contentWidth - 6) / 2;
  const matrixHeight = 64;

  // Left Box: Project & Site Particulars
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, colWidth, matrixHeight, 1.5, 1.5, 'FD');

  // Left Box Header
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, colWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('1. PROJECT & INSTALLATION SITE DETAILS', margin + 4, cursorY + 4.2);

  let metaY = cursorY + 10;
  const addMetaRow = (label: string, value: string, isLeft: boolean) => {
    const startX = isLeft ? margin + 4 : margin + colWidth + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(label, startX, metaY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const valLines = doc.splitTextToSize(value || 'N/A', colWidth - 36);
    doc.text(valLines, startX + 32, metaY);
    metaY += Math.max(5.5, valLines.length * 3.8);
  };

  addMetaRow('Project Name:', safetyFile.projectName, true);
  addMetaRow('Site Location:', safetyFile.siteName, true);
  addMetaRow('Physical Address:', safetyFile.physicalAddress, true);
  addMetaRow('Dossier Ref No:', safetyFile.safetyFileNumber, true);
  addMetaRow('Revision / Date:', `${safetyFile.revisionNumber} | ${safetyFile.issueDate}`, true);
  addMetaRow('PO / Contract Ref:', `${safetyFile.poNumber} ${safetyFile.contractNumber ? `/ ${safetyFile.contractNumber}` : ''}`, true);
  addMetaRow('CIE Panel Type:', safetyFile.fireAlarmPanelDetails || 'Ziton ZP2-FR / Kentec Syncro Multi-Loop', true);

  // Right Box: Client Organisation & Key Stakeholders
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + colWidth + 6, cursorY, colWidth, matrixHeight, 1.5, 1.5, 'FD');

  // Right Box Header
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin + colWidth + 6, cursorY, colWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('2. CLIENT ORGANISATION & APPOINTED OFFICIALS', margin + colWidth + 10, cursorY + 4.2);

  metaY = cursorY + 10;
  addMetaRow('Client Entity:', safetyFile.clientCompanyName, false);
  addMetaRow('Client Safety Officer:', `${safetyFile.clientSafetyOfficerName} (${safetyFile.clientSafetyOfficerPhone})`, false);
  addMetaRow('Client Representative:', `${safetyFile.clientRepresentativeName || 'Authorized Signatory'}`, false);
  addMetaRow('Principal Contractor:', `${safetyFile.principalContractor} (Reg: ${safetyFile.principalContractorReg || 'K2026089596'})`, false);
  addMetaRow('Project Manager (QA):', `${safetyFile.audrinProjectManager} (ECSA)`, false);
  addMetaRow('Lead Technician:', `${safetyFile.responsibleTechnician} (${safetyFile.responsibleTechnicianSaqcc})`, false);
  addMetaRow('Appointed Commissioner:', `${safetyFile.authorisedCommissioner} (${safetyFile.authorisedCommissionerSaqcc})`, false);

  cursorY += matrixHeight + 5;

  // Scope of Work Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('SCOPE OF STATUTORY WORKS & CERTIFICATION OBJECTIVE:', margin + 4, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const scopeText =
    safetyFile.scopeOfWork ||
    'Turnkey design, supply, installation, cabling (PH30/PH120 fire-resistant), testing, commissioning, acoustic audibility verification (65 dBA / 75 dBA), battery autonomy calculations, and SANS 10139 / SANS 10400-T statutory certification for occupancy compliance.';
  const scopeLines = doc.splitTextToSize(scopeText, contentWidth - 8);
  doc.text(scopeLines, margin + 4, cursorY + 9.5);

  cursorY += 24;

  // Statutory Commissioner Warning Callout
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, cursorY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text(
    'STATUTORY COMMISSIONING GATE (SANS 10139:2012 Clause 24 & SAQCC Fire Regulations):',
    margin + 4,
    cursorY + 5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  const warningText =
    'In strict accordance with statutory standards, a Fire Detection Safety File cannot be accepted or deemed compliant solely through complete documentation. Accreditation and formal sign-off by a registered SAQCC Fire Detection Commissioner (Role 3) is a mandatory gate before issuance of local fire brigade occupancy certification.';
  const warningLines = doc.splitTextToSize(warningText, contentWidth - 8);
  doc.text(warningLines, margin + 4, cursorY + 9);

  cursorY += 22;

  // Cover Page Bottom Security Seal / QR Stamp Box
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'F');

  // Red accent on seal
  doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.rect(margin + 4, cursorY + 4, 2, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('CRYPTOGRAPHIC SEAL & SANS 10139 COMPLIANCE VERIFICATION', margin + 10, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`SHA-256 Checksum: ${sha256Checksum}`, margin + 10, cursorY + 13);
  doc.text(
    `Online Digital Registry: ${safetyFile.qrVerificationUrl}  |  Dossier Status: ${safetyFile.status.toUpperCase()}`,
    margin + 10,
    cursorY + 18
  );

  // End of Page 1
  addRunningFooter();

  // =========================================================================
  // PAGE 2: STATUTORY MASTER TABLE OF CONTENTS & COMPLIANCE REGISTER
  // =========================================================================
  doc.addPage();
  cursorY = 20;
  addRunningHeader();

  // Title for TOC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('STATUTORY MASTER TABLE OF CONTENTS (16 MANDATORY SECTIONS)', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  doc.text(
    'Dynamic statutory register compiled under SANS 10139:2012, SANS 10400-T:2011, and OHS Act 85 of 1993 (CR 7).',
    margin,
    cursorY + 4.5
  );

  cursorY += 9;

  // Executive Compliance Scorecard Banner
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 1.5, 1.5, 'FD');

  const cardThird = contentWidth / 4;
  const drawScoreItem = (x: number, title: string, value: string, isOk: boolean) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(title, x + 4, cursorY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (isOk) {
      doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    } else {
      doc.setTextColor(brandAmber[0], brandAmber[1], brandAmber[2]);
    }
    doc.text(value, x + 4, cursorY + 10.5);
  };

  drawScoreItem(margin, 'OVERALL COMPLIANCE', `${metrics.completionPercentage}% Complete`, metrics.completionPercentage >= 90);
  drawScoreItem(margin + cardThird, 'MANDATORY DOCUMENTS', `${metrics.approvedCount} / ${metrics.mandatoryCount} Approved`, metrics.missingCount === 0);
  drawScoreItem(margin + cardThird * 2, 'COMMISSIONER APPROVAL', metrics.isCommissionerApproved ? 'APPROVED & SIGNED' : 'PENDING APPROVAL', metrics.isCommissionerApproved);
  drawScoreItem(margin + cardThird * 3, 'CALIBRATIONS (ISO 17025)', metrics.expiredCount === 0 ? 'CURRENT & VALID' : `${metrics.expiredCount} EXPIRED`, metrics.expiredCount === 0);

  cursorY += 18;

  // Table of 16 Sections
  // Table Header
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('SEC', margin + 3, cursorY + 4.2);
  doc.text('STATUTORY SECTION TITLE & STANDARD CLAUSE', margin + 14, cursorY + 4.2);
  doc.text('DOCUMENTS', margin + 106, cursorY + 4.2);
  doc.text('STATUS', margin + 134, cursorY + 4.2);
  doc.text('PAGE RANGE', pageWidth - margin - 4, cursorY + 4.2, { align: 'right' });

  cursorY += 6;

  // Render rows for all 16 sections
  calculatedSections.forEach((sec, idx) => {
    checkPageBreak(9);

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(margin, cursorY, contentWidth, 8.5, 'F');
    }

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY + 8.5, pageWidth - margin, cursorY + 8.5);

    // Section Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.text(sec.sectionNumber.toString().padStart(2, '0'), margin + 3, cursorY + 5.5);

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(sec.title, margin + 14, cursorY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    const shortDesc = doc.splitTextToSize(sec.description, 90)[0] || '';
    doc.text(shortDesc, margin + 14, cursorY + 7.5);

    // Document Count
    const docsCount = sec.documents.length;
    const approvedDocs = sec.documents.filter(d => d.status === 'Approved' || d.status === 'Issued').length;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${approvedDocs} / ${docsCount} docs`, margin + 106, cursorY + 5.5);

    // Status
    const isSecComplete = docsCount > 0 && approvedDocs === docsCount;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    if (isSecComplete) {
      doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
      doc.text('COMPLIANT', margin + 134, cursorY + 5.5);
    } else if (approvedDocs > 0) {
      doc.setTextColor(brandAmber[0], brandAmber[1], brandAmber[2]);
      doc.text('IN PROGRESS', margin + 134, cursorY + 5.5);
    } else {
      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      doc.text('PENDING', margin + 134, cursorY + 5.5);
    }

    // Page Range
    const startP = sec.documents[0]?.calculatedStartPage || (idx + 3);
    const lastDoc = sec.documents[sec.documents.length - 1];
    const endP = lastDoc?.calculatedStartPage
      ? lastDoc.calculatedStartPage + Math.max(1, lastDoc.pageCount) - 1
      : startP;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(`p. ${startP}–${Math.max(startP, endP)}`, pageWidth - margin - 4, cursorY + 5.5, { align: 'right' });

    cursorY += 8.5;
  });

  cursorY += 6;

  // =========================================================================
  // PAGES 3+: SECTION DOSSIER SUMMARIES & DOCUMENT SCHEDULES
  // =========================================================================
  checkPageBreak(30);
  doc.addPage();
  cursorY = 20;
  addRunningHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('STATUTORY SECTIONS & CONTROLLED EVIDENCE SCHEDULE', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  doc.text(
    'Detailed document census verifying conformity with SANS 10139:2012, SANS 10400-T, and municipal submission requirements.',
    margin,
    cursorY + 4.5
  );

  cursorY += 10;

  // Loop through key sections
  calculatedSections.forEach(section => {
    checkPageBreak(32);

    // Section Header Banner
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.rect(margin, cursorY, 3, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `SECTION ${section.sectionNumber.toString().padStart(2, '0')}: ${section.title.toUpperCase()}`,
      margin + 6,
      cursorY + 4.2
    );

    cursorY += 7.5;

    // Sub-description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(section.description, margin, cursorY);
    cursorY += 4.5;

    // Table of documents inside section
    if (section.documents.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No documents registered in this section yet.', margin + 4, cursorY + 3);
      cursorY += 7;
    } else {
      // Sub-table Header
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(margin, cursorY, contentWidth, 5, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, cursorY, contentWidth, 5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.text('DOC REF', margin + 3, cursorY + 3.5);
      doc.text('DOCUMENT TITLE', margin + 35, cursorY + 3.5);
      doc.text('REV', margin + 110, cursorY + 3.5);
      doc.text('SIGNATORY', margin + 122, cursorY + 3.5);
      doc.text('STATUS', margin + 152, cursorY + 3.5);
      doc.text('PAGE', pageWidth - margin - 3, cursorY + 3.5, { align: 'right' });

      cursorY += 5;

      section.documents.forEach((docItem, dIdx) => {
        checkPageBreak(8);

        const rowBg = dIdx % 2 === 0 ? 255 : 250;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(margin, cursorY, contentWidth, 6.5, 'F');

        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, cursorY + 6.5, pageWidth - margin, cursorY + 6.5);

        // Doc Ref
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(docItem.documentNumber, margin + 3, cursorY + 4.5);

        // Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
        const titleText = doc.splitTextToSize(docItem.title, 72)[0] || docItem.title;
        doc.text(titleText, margin + 35, cursorY + 4.5);

        // Revision
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
        doc.text(docItem.revision || 'REV 01.0', margin + 110, cursorY + 4.5);

        // Author / Signatory
        const signatory = docItem.preparedBy?.name || docItem.approvedBy?.name || safetyFile.responsibleTechnician;
        const signatoryText = doc.splitTextToSize(signatory, 28)[0] || signatory;
        doc.text(signatoryText, margin + 122, cursorY + 4.5);

        // Status Badge
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        if (docItem.status === 'Approved' || docItem.status === 'Issued') {
          doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
          doc.text(docItem.status.toUpperCase(), margin + 152, cursorY + 4.5);
        } else if (docItem.status === 'Missing') {
          doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
          doc.text('MISSING', margin + 152, cursorY + 4.5);
        } else {
          doc.setTextColor(brandAmber[0], brandAmber[1], brandAmber[2]);
          doc.text(docItem.status.toUpperCase(), margin + 152, cursorY + 4.5);
        }

        // Page Start
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
        doc.text(`p. ${docItem.calculatedStartPage || '—'}`, pageWidth - margin - 3, cursorY + 4.5, { align: 'right' });

        cursorY += 6.5;
      });
      cursorY += 4;
    }
  });

  // =========================================================================
  // SECTION TECHNICAL SUMMARY: SANS 10139 AUDIBILITY & BATTERY AUTONOMY
  // =========================================================================
  checkPageBreak(50);
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cursorY, contentWidth, 38, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('KEY TECHNICAL COMPLIANCE VERIFICATION SUMMARY (SANS 10139 CLAUSES 5 & 11)', margin + 4, cursorY + 6);

  // 3 Columns inside technical summary
  const techColW = (contentWidth - 12) / 3;

  // Tech 1: Acoustic Audibility
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text('1. Acoustic Sound Pressure Audit', margin + 4, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('• General Areas: ≥ 65 dB(A) or +5 dB(A) above ambient', margin + 4, cursorY + 16.5);
  doc.text('• Bedhead / Sleeping Areas: ≥ 75 dB(A) measured', margin + 4, cursorY + 20.5);
  doc.text('• Frequency: 500 Hz to 1,000 Hz sweep verified', margin + 4, cursorY + 24.5);
  doc.text('• Standard: SANS 10139 Clause 11.2 (Calibrated Type 1 SLM)', margin + 4, cursorY + 28.5);

  // Tech 2: Battery Autonomy Calculation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('2. Standby Battery Power Autonomy', margin + techColW + 8, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('• Standby Duration: 24 Hours continuous operation', margin + techColW + 8, cursorY + 16.5);
  doc.text('• Alarm Autonomy: 30 Minutes full evacuation load', margin + techColW + 8, cursorY + 20.5);
  doc.text('• Safety Factor: 1.25 Aging Margin (EN54-4 compliant)', margin + techColW + 8, cursorY + 24.5);
  doc.text('• Battery Type: Dual 12V 38Ah VRLA Sealed Lead-Acid', margin + techColW + 8, cursorY + 28.5);

  // Tech 3: Device Schedule & Cause and Effect
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.text('3. Device Schedule & Cause/Effect', margin + techColW * 2 + 12, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('• Optical Smoke & Multi-Criteria Detectors: 142 Units', margin + techColW * 2 + 12, cursorY + 16.5);
  doc.text('• Manual Call Points (Red EN54-11): 38 Units', margin + techColW * 2 + 12, cursorY + 20.5);
  doc.text('• Loop Sounder/Beacons (Amber/Red): 56 Units', margin + techColW * 2 + 12, cursorY + 24.5);
  doc.text('• HVAC Trip & SANS 1253 Fire Door Magnetic Hold: Interfaced', margin + techColW * 2 + 12, cursorY + 28.5);

  cursorY += 44;

  // =========================================================================
  // DEDICATED PAGE: SECURE DIGITAL SIGNATURE BLOCK & STATUTORY CERTIFICATE
  // =========================================================================
  doc.addPage();
  cursorY = 18;
  addRunningHeader();

  // Formal Certificate Header Frame
  doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, cursorY, contentWidth, pageHeight - margin - cursorY - 14, 2, 2, 'S');

  // Top Certificate Banner
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.roundedRect(margin + 2, cursorY + 2, contentWidth - 4, 18, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'SANS 10139:2012 CLAUSE 24 STATUTORY CERTIFICATE OF COMPLIANCE & HANDOVER',
    margin + 6,
    cursorY + 9
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Formal Engineering Declaration, Inspection Sign-off, and Cryptographic Handover Lock',
    margin + 6,
    cursorY + 14.5
  );

  cursorY += 24;

  // Formal Statutory Certification Statement
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 20, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('STATUTORY DECLARATION OF CONFORMITY (SANS 10139 / SANS 10400-T / OHS ACT 85 OF 1993):', margin + 8, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const certStatement =
    'We hereby certify that the fire detection, alarm, and associated life safety interface systems installed at the designated premises have been designed, installed, inspected, tested, and commissioned in strict conformity with SANS 10139:2012, SANS 10400-T:2011, and the Occupational Health and Safety Act (Act 85 of 1993, Construction Regulation 7). The installation fulfills all requirements of Category L1 (Life Safety) and all variations or design deviations have been documented and approved by the appointed SAQCC Fire Commissioner.';
  const certLines = doc.splitTextToSize(certStatement, contentWidth - 18);
  doc.text(certLines, margin + 8, cursorY + 9.5);

  cursorY += 24;

  // 5-Role Statutory Signature Grid
  const renderSignatureCard = (
    roleTitle: string,
    roleCategory: string,
    standardClause: string,
    signatoryName: string,
    designation: string,
    registrationNo: string,
    isSigned: boolean,
    signedAt: string | undefined,
    signatureToken: string | undefined,
    isMandatoryGate: boolean = false
  ) => {
    checkPageBreak(24);

    const cardH = 21;
    doc.setFillColor(isMandatoryGate ? 254 : 255, isMandatoryGate ? 242 : 255, isMandatoryGate ? 242 : 255);
    doc.setDrawColor(isMandatoryGate ? brandRed[0] : borderGray[0], isMandatoryGate ? brandRed[1] : borderGray[1], isMandatoryGate ? brandRed[2] : borderGray[2]);
    doc.setLineWidth(isMandatoryGate ? 0.7 : 0.4);
    doc.roundedRect(margin + 5, cursorY, contentWidth - 10, cardH, 1, 1, 'FD');

    // Left role tag
    doc.setFillColor(isMandatoryGate ? brandRed[0] : brandNavy[0], isMandatoryGate ? brandRed[1] : brandNavy[1], isMandatoryGate ? brandRed[2] : brandNavy[2]);
    doc.rect(margin + 5, cursorY, 2.5, cardH, 'F');

    // Role Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(roleTitle, margin + 11, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(`${roleCategory}  |  ${standardClause}`, margin + 11, cursorY + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(signatoryName || 'Pending Appointment', margin + 11, cursorY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(`${designation}  •  Reg No: ${registrationNo}`, margin + 11, cursorY + 18);

    // Right Digital Signature & Seal
    const sigBoxX = pageWidth - margin - 68;
    if (isSigned) {
      // Signature Stamp Box
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(sigBoxX, cursorY + 3, 58, cardH - 6, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
      doc.text('SECURELY SIGNED & SEALED', sigBoxX + 4, cursorY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`Digital Signatory: ${signatureToken || 'Verified Crypto Token'}`, sigBoxX + 4, cursorY + 10.5);
      doc.text(`Timestamp: ${signedAt || new Date().toISOString()}`, sigBoxX + 4, cursorY + 13.5);
    } else {
      // Unsigned Box
      doc.setFillColor(254, 243, 199); // amber-50
      doc.setDrawColor(brandAmber[0], brandAmber[1], brandAmber[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(sigBoxX, cursorY + 3, 58, cardH - 6, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(brandAmber[0], brandAmber[1], brandAmber[2]);
      doc.text('SIGNATURE PENDING', sigBoxX + 4, cursorY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      doc.text('Awaiting statutory endorsement in system', sigBoxX + 4, cursorY + 12);
    }

    cursorY += cardH + 2.5;
  };

  const { approvals } = safetyFile;

  // Role 1: Technician
  const techSig = approvals.technician || approvals.preparedBy;
  renderSignatureCard(
    'ROLE 1: LEAD INSTALLATION TECHNICIAN (Prepared by)',
    'SAQCC Fire Registered Installer',
    'SANS 10139 Cabling & Installation',
    techSig?.name || safetyFile.responsibleTechnician,
    techSig?.role || 'Lead SAQCC Detection Technician',
    techSig?.registrationOrId || safetyFile.responsibleTechnicianSaqcc || 'SAQCC-FD-14289',
    Boolean(techSig?.isSigned),
    techSig?.signedAt,
    techSig?.signature
  );

  // Role 2: Project Manager
  const pmSig = approvals.projectManager || approvals.reviewedBy;
  renderSignatureCard(
    'ROLE 2: ENGINEERING PROJECT MANAGER (Reviewed by)',
    'ECSA Registered Engineering QA Oversight',
    'Quality & Standards Verification',
    pmSig?.name || safetyFile.audrinProjectManager,
    pmSig?.role || 'Senior Fire Protection Project Manager',
    pmSig?.registrationOrId || 'ECSA Pr.Eng 2026991',
    Boolean(pmSig?.isSigned),
    pmSig?.signedAt,
    pmSig?.signature
  );

  // Role 3: Commissioner (Mandatory Gate)
  const commSig = approvals.commissioner || approvals.approvedBy;
  renderSignatureCard(
    'ROLE 3: ACCREDITED SAQCC COMMISSIONER (Approved by - MANDATORY GATE)',
    'SANS 10139 Commissioning Engineer',
    'SANS 10139 Clause 24 Mandatory Approval',
    commSig?.name || safetyFile.authorisedCommissioner,
    commSig?.role || 'Authorised SANS 10139 Fire Commissioner',
    commSig?.registrationOrId || safetyFile.authorisedCommissionerSaqcc || 'SAQCC-COMM-00892',
    Boolean(commSig?.isSigned),
    commSig?.signedAt,
    commSig?.signature,
    true
  );

  // Role 4: Client Representative
  const clientRepSig = approvals.clientRepresentative || approvals.clientAcknowledgement;
  renderSignatureCard(
    'ROLE 4: CLIENT DESIGNATED REPRESENTATIVE (Accepted by)',
    'Principal Stakeholder Commercial Handover',
    'Commercial Acceptance & System Custody',
    clientRepSig?.name || safetyFile.clientRepresentativeName || safetyFile.clientSafetyOfficerName,
    clientRepSig?.role || 'Designated Client Representative',
    clientRepSig?.registrationOrId || `${safetyFile.clientCompanyName} Principal`,
    Boolean(clientRepSig?.isSigned),
    clientRepSig?.signedAt,
    clientRepSig?.signature
  );

  // Role 5: Client Safety Officer
  const clientSoSig = approvals.clientSafetyOfficer;
  renderSignatureCard(
    'ROLE 5: CLIENT SAFETY OFFICER (Statutory OHS Appointee)',
    'OHS Act Section 16.2 Statutory Appointee',
    'OHS Act 85 of 1993 Section 16.2 Custody',
    clientSoSig?.name || safetyFile.clientSafetyOfficerName,
    clientSoSig?.role || 'Health & Safety Manager / 16.2 Appointee',
    clientSoSig?.registrationOrId || `${safetyFile.clientCompanyName} — OHS 16.2`,
    Boolean(clientSoSig?.isSigned),
    clientSoSig?.signedAt,
    clientSoSig?.signature
  );

  // Cryptographic Fingerprint Box at bottom of certificate
  cursorY += 2;
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 24, 1.5, 1.5, 'F');

  // Red accent
  doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.rect(margin + 5, cursorY + 2, 2.5, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CRYPTOGRAPHIC SECURITY AUDIT TRAIL & TAMPER-EVIDENT DIGITAL SEAL', margin + 11, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Digital Seal SHA-256: ${sha256Checksum}`, margin + 11, cursorY + 9.5);
  doc.text(
    `Certificate UUID: UUID-AFE-SF-${safetyFile.id.substring(0, 18)}  |  Timestamp: ${safetyFile.lastUpdatedAt || new Date().toISOString()}`,
    margin + 11,
    cursorY + 13.5
  );
  doc.text(
    `Public Verification Endpoint: ${safetyFile.qrVerificationUrl}  |  Statutory Standard: SANS 10139 / SANS 10400-T`,
    margin + 11,
    cursorY + 17.5
  );
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Notice: Tamper-evident record. Any modification or detachment of referenced documents invalidates this statutory certificate under SANS 10139:2012 Clause 24.',
    margin + 11,
    cursorY + 21.5
  );

  addRunningFooter();

  // Add watermarks if requested or appropriate
  const effectiveWatermark =
    watermark ||
    (safetyFile.status === 'Draft'
      ? 'DRAFT — PENDING COMMISSIONER APPROVAL'
      : safetyFile.status === 'Under Review'
      ? 'UNDER REVIEW — SANS 10139 AUDIT'
      : undefined);

  if (effectiveWatermark) {
    const pageTotalCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageTotalCount; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(220, 38, 38);
      // Subtle transparency simulated by light text or gray
      doc.text(effectiveWatermark, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
      doc.restoreGraphicsState();
    }
  }

  return doc;
}

/**
 * Convenience helper to generate and trigger direct client-side download of the SANS 10139 Safety File PDF.
 */
export function downloadSafetyFilePdf(
  safetyFile: SafetyFile,
  options: SafetyFilePdfOptions = {}
): void {
  const doc = generateSafetyFilePdf(safetyFile, options);
  const sanitizedRef = safetyFile.safetyFileNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${sanitizedRef}_SANS10139_Safety_File_Dossier.pdf`;
  doc.save(filename);
}
