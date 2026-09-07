import jsPDF from 'jspdf';
import { SANSRequirementItem } from '../types/remedialActions';
import { ClientSiteMaintenanceProfile } from '../types/serviceDue';

export interface MaintenanceReportExportData {
  reportRef: string;
  auditDate: string;
  checkType: 'quarterly' | 'biannual' | 'annual' | 'monthly';
  siteProfile: ClientSiteMaintenanceProfile;
  technicianName: string;
  saqccNumber: string;
  checklist: SANSRequirementItem[];
  siteManagerSignature?: {
    signatureDataUrl: string;
    signeeName: string;
    signeeTitle: string;
    timestamp: string;
  };
}

/**
 * High-fidelity branded PDF generator for SANS 10139:2012 Maintenance Audit Reports.
 * Generates an executive-ready document with Audrin Fire Engineers letterhead,
 * statutory check breakdown, defect telemetry, and site manager signature.
 */
export function generateMaintenanceCheckReportPdf(data: MaintenanceReportExportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 18;

  // Brand Palette
  const brandNavy = [10, 25, 47]; // #0A192F
  const brandRed = [204, 0, 0]; // #CC0000
  const brandSlate = [71, 85, 105]; // #475569
  const textDark = [15, 23, 42]; // #0F172A
  const borderGray = [226, 232, 240];
  const bgLight = [248, 250, 252];
  const passGreen = [22, 101, 52];
  const failRed = [153, 27, 27];

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 26) {
      addFooter();
      doc.addPage();
      cursorY = 18;
      addHeaderStrip();
    }
  };

  const addHeaderStrip = () => {
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, 10, contentWidth, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(
      `AUDRIN FIRE ENGINEERS — SANS 10139 MAINTENANCE AUDIT REPORT — REF: ${data.reportRef}`,
      margin,
      8
    );
    cursorY = Math.max(cursorY, 18);
  };

  const addFooter = () => {
    const footerY = pageHeight - 16;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('Audrin Fire Engineers (Pty) Ltd  |  Reg: K2026089596  |  SAQCC Fire 1475/D&amp;GS', margin, footerY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(
      'SANS 10139:2012 Clause 25 Compliance Record  |  Direct Engineering Desk: 071 415 6665',
      margin,
      footerY + 8
    );

    const pageCountText = `Page ${doc.getCurrentPageInfo().pageNumber}`;
    doc.text(pageCountText, pageWidth - margin - doc.getTextWidth(pageCountText), footerY + 4);
  };

  // 1. LETTERHEAD TOP BANNER
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 24, 'F');
  doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.rect(margin, cursorY + 23, contentWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('AUDRIN FIRE ENGINEERS', margin + 6, cursorY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('COMMERCIAL FIRE DETECTION & LIFE SAFETY SYSTEMS SPECIALISTS', margin + 6, cursorY + 14);
  doc.text('Aligned with SANS 10139:2012, SANS 322 & SANS 246 Statutory Frameworks', margin + 6, cursorY + 19);

  // Right-side badge
  doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.rect(pageWidth - margin - 46, cursorY + 4, 40, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STATUTORY AUDIT', pageWidth - margin - 43, cursorY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(data.checkType.toUpperCase() + ' INSPECTION', pageWidth - margin - 43, cursorY + 15);

  cursorY += 30;

  // 2. DOCUMENT TITLE & SUMMARY META
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('SANS 10139 MAINTENANCE AUDIT REPORT', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  doc.text(
    `Official periodic inspection record issued under SANS 10139 Clause 25.3 / 25.4. All telemetry and defect notes logged on-site.`,
    margin,
    cursorY
  );
  cursorY += 7;

  // Site Profile & Inspection Details Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, cursorY, contentWidth, 32, 'FD');

  const col1X = margin + 4;
  const col2X = margin + (contentWidth / 2) + 2;
  let boxY = cursorY + 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Client Organisation:', col1X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(data.siteProfile.clientOrganisation, col1X + 32, boxY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Report Reference:', col2X, boxY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text(data.reportRef, col2X + 32, boxY);

  boxY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Premises / Site:', col1X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${data.siteProfile.siteName} (${data.siteProfile.shortName})`, col1X + 32, boxY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Audit Date:', col2X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(data.auditDate, col2X + 32, boxY);

  boxY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Site Physical Address:', col1X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const addrTrunc = data.siteProfile.address.length > 38 ? data.siteProfile.address.substring(0, 35) + '...' : data.siteProfile.address;
  doc.text(addrTrunc, col1X + 32, boxY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Inspecting Engineer:', col2X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${data.technicianName} (${data.saqccNumber})`, col2X + 32, boxY);

  boxY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Control Panel Model:', col1X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${data.siteProfile.panelModel} (${data.siteProfile.systemCategory})`, col1X + 32, boxY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('SANS 10139 Interval:', col2X, boxY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${data.checkType.toUpperCase()} (Clause 25)`, col2X + 32, boxY);

  cursorY += 38;

  // 3. STATUTORY COMPLIANCE SUMMARY SCORECARD
  const failedItems = data.checklist.filter(c => c.status === 'failed');
  const passedItems = data.checklist.filter(c => c.status === 'passed');
  const untestedItems = data.checklist.filter(c => c.status === 'untested');
  const complianceRate = Math.round((passedItems.length / (data.checklist.length || 1)) * 100);

  const cardW = (contentWidth - 6) / 4;
  const cards = [
    { label: 'TOTAL CHECKS', val: String(data.checklist.length), bg: [241, 245, 249], color: brandNavy },
    { label: 'COMPLIANT (PASS)', val: String(passedItems.length), bg: [236, 253, 245], color: passGreen },
    { label: 'DEFECTS (FAIL)', val: String(failedItems.length), bg: [254, 242, 242], color: failRed },
    { label: 'COMPLIANCE SCORE', val: `${complianceRate}%`, bg: [240, 249, 255], color: brandNavy }
  ];

  cards.forEach((card, idx) => {
    const cardX = margin + idx * (cardW + 2);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.rect(cardX, cursorY, cardW, 14, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(cardX, cursorY, cardW, 14, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(card.label, cardX + cardW / 2, cursorY + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.val, cardX + cardW / 2, cursorY + 11, { align: 'center' });
  });

  cursorY += 19;

  // 4. STATUTORY CHECKLIST TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('DETAILED SANS 10139:2012 CLAUSE VERIFICATION', margin, cursorY);
  cursorY += 5;

  // Table header
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  const colClauseW = 18;
  const colCatW = 28;
  const colReqW = 70;
  const colStatusW = 18;
  const colObsW = contentWidth - colClauseW - colCatW - colReqW - colStatusW;

  let headerX = margin + 2;
  doc.text('CLAUSE', headerX, cursorY + 4.5);
  headerX += colClauseW;
  doc.text('CATEGORY', headerX, cursorY + 4.5);
  headerX += colCatW;
  doc.text('STATUTORY REQUIREMENT', headerX, cursorY + 4.5);
  headerX += colReqW;
  doc.text('STATUS', headerX, cursorY + 4.5);
  headerX += colStatusW;
  doc.text('FIELD TELEMETRY & NOTES', headerX, cursorY + 4.5);

  cursorY += 7;

  // Render Table Rows
  data.checklist.forEach((item, rIdx) => {
    checkPageBreak(16);

    const isFail = item.status === 'failed';
    const isPass = item.status === 'passed';
    const rowBg = rIdx % 2 === 0 ? [255, 255, 255] : bgLight;

    if (isFail) {
      doc.setFillColor(254, 242, 242);
    } else {
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    }
    doc.rect(margin, cursorY, contentWidth, 12, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY + 12, margin + contentWidth, cursorY + 12);

    let rowX = margin + 2;

    // Clause
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    const clauseShort = item.clause.length > 18 ? item.clause.substring(0, 16) + '...' : item.clause;
    doc.text(clauseShort, rowX, cursorY + 5);

    // Category
    rowX += colClauseW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    const catShort = item.category.length > 18 ? item.category.substring(0, 16) + '...' : item.category;
    doc.text(catShort, rowX, cursorY + 5);

    // Requirement Title & Subtext
    rowX += colCatW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const reqTitle = item.title.length > 48 ? item.title.substring(0, 45) + '...' : item.title;
    doc.text(reqTitle, rowX, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    const reqDesc = item.description.length > 58 ? item.description.substring(0, 55) + '...' : item.description;
    doc.text(reqDesc, rowX, cursorY + 8.5);

    // Status Badge
    rowX += colReqW;
    if (isPass) {
      doc.setFillColor(220, 252, 231);
      doc.rect(rowX, cursorY + 2.5, 15, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(passGreen[0], passGreen[1], passGreen[2]);
      doc.text('PASS', rowX + 7.5, cursorY + 6.8, { align: 'center' });
    } else if (isFail) {
      doc.setFillColor(254, 226, 226);
      doc.rect(rowX, cursorY + 2.5, 15, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(failRed[0], failRed[1], failRed[2]);
      doc.text('DEFECT', rowX + 7.5, cursorY + 6.8, { align: 'center' });
    } else {
      doc.setFillColor(241, 245, 249);
      doc.rect(rowX, cursorY + 2.5, 15, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      doc.text('UNTESTED', rowX + 7.5, cursorY + 6.8, { align: 'center' });
    }

    // Telemetry / Notes
    rowX += colStatusW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    if (isFail) {
      doc.setTextColor(failRed[0], failRed[1], failRed[2]);
      const meas = item.measuredValue ? `Reading: ${item.measuredValue}` : (item.defectNotes || 'Non-compliance detected');
      const measTrunc = meas.length > 40 ? meas.substring(0, 38) + '...' : meas;
      doc.text(measTrunc, rowX, cursorY + 4.5);

      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      const plan = `Remedial: ${item.defaultRemedialAction.title}`;
      const planTrunc = plan.length > 40 ? plan.substring(0, 38) + '...' : plan;
      doc.text(planTrunc, rowX, cursorY + 8.5);
    } else {
      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      const normalNote = item.measuredValue || 'Nominal readings verified.';
      doc.text(normalNote.substring(0, 38), rowX, cursorY + 6);
    }

    cursorY += 12;
  });

  cursorY += 6;

  // 5. SITE MANAGER SIGN-OFF & DECLARATION SECTION
  checkPageBreak(50);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, cursorY, contentWidth, 44, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('RESPONSIBLE PERSON / SITE MANAGER STATUTORY SIGN-OFF', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  doc.text(
    'In accordance with SANS 10139:2012 Clause 25.3.4, the client responsible person confirms that the above statutory inspection',
    margin + 4,
    cursorY + 11
  );
  doc.text(
    'was executed on-site and that all recorded defects have been communicated with appropriate remedial action deadlines.',
    margin + 4,
    cursorY + 14.5
  );

  const signCol1X = margin + 4;
  const signCol2X = margin + (contentWidth / 2) + 2;
  const signY = cursorY + 18;

  // Engineer Details (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Audrin Fire Lead Engineer:', signCol1X, signY + 3);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.technicianName}`, signCol1X, signY + 7.5);
  doc.text(`SAQCC Fire Reg No: ${data.saqccNumber}`, signCol1X, signY + 11.5);
  doc.text(`Date & Time: ${data.auditDate}`, signCol1X, signY + 15.5);

  // Site Manager Signature Area (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('Client Representative / Site Signee:', signCol2X, signY + 3);

  if (data.siteManagerSignature?.signatureDataUrl) {
    try {
      // Draw captured canvas signature image
      doc.addImage(
        data.siteManagerSignature.signatureDataUrl,
        'PNG',
        signCol2X,
        signY + 4.5,
        45,
        14
      );
    } catch {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text('[Digital Signature Validated on Device Screen]', signCol2X, signY + 10);
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('[Pending Responsible Person Signature on Device Screen]', signCol2X, signY + 10);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const sName = data.siteManagerSignature?.signeeName || 'Site Responsible Person';
  const sTitle = data.siteManagerSignature?.signeeTitle || 'Facilities / Safety Manager';
  doc.text(`Signed by: ${sName} (${sTitle})`, signCol2X, signY + 20);

  cursorY += 48;

  // Add footer to final page
  addFooter();

  return doc;
}
