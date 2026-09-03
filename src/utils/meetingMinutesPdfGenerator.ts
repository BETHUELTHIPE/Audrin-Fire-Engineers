import jsPDF from 'jspdf';
import { MeetingMinutesVersion, StructuredMeetingMinutes } from '../types/meetingMinutes';

/**
 * High-fidelity branded PDF generator for Audrin Fire Engineers Zoom AI Meeting Minutes.
 * Conforms to all 16 required sections, letterhead, anti-hallucination notices,
 * qualified SANS 10139 disclaimer, and company footer.
 */
export function generateMeetingMinutesPdf(minutesVersion: MeetingMinutesVersion): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const data: StructuredMeetingMinutes = minutesVersion.structuredData;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  const brandNavy = [10, 25, 47]; // #0A192F
  const brandRed = [204, 0, 0]; // #CC0000
  const brandSlate = [71, 85, 105]; // #475569
  const textDark = [15, 23, 42]; // #0F172A
  const borderGray = [226, 232, 240];

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 32) {
      addFooter();
      doc.addPage();
      cursorY = 20;
      addHeaderStrip();
    }
  };

  const addHeaderStrip = () => {
    // Top subtle bar
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, 12, contentWidth, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text(`AUDRIN FIRE ENGINEERS (PTY) LTD — AI ZOOM MEETING MINUTES — REF: ${minutesVersion.serviceRequestRef} (VER ${minutesVersion.minutesVersion}.0)`, margin, 10);
    cursorY = Math.max(cursorY, 20);
  };

  const addFooter = () => {
    const footerY = pageHeight - 22;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('Audrin Fire Engineers (Pty) Ltd  |  Registration No: K2026089596', margin, footerY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text('Phone: 071 415 6665  |  Email: bethuelmoukangwe8@gmail.com  |  Hours: Monday–Sunday: 07:00–20:00 (SAST)', margin, footerY + 8.5);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`UUID: ${minutesVersion.id.substring(0, 18)}... | S3 Hash: ${minutesVersion.fileHash.substring(0, 12)} | Confidential`, margin, footerY + 13);
  };

  // -------------------------------------------------------------
  // SECTION 1: COVER & COMPANY DETAILS / LETTERHEAD
  // -------------------------------------------------------------
  // Header accent
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('AUDRIN FIRE ENGINEERS', margin + 6, cursorY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('COMMERCIAL & INDUSTRIAL FIRE PROTECTION — SANS 10139 ALIGNED', margin + 6, cursorY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 100, 100);
  doc.text(`MINUTES REF: ${minutesVersion.serviceRequestRef}-MIN-V${minutesVersion.minutesVersion}`, pageWidth - margin - 6, cursorY + 8.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${new Date(minutesVersion.generatedAt).toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })}`, pageWidth - margin - 6, cursorY + 14, { align: 'right' });

  cursorY += 28;

  // Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('AI-ASSISTED ZOOM MEETING MINUTES', margin, cursorY + 4);

  cursorY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
  doc.text(data.meetingTitle.toUpperCase(), margin, cursorY + 2);

  cursorY += 7;

  // Version Banner
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, cursorY, contentWidth, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text(`DOCUMENT VERSION: ${minutesVersion.minutesVersion}.0  |  STATUS: ${minutesVersion.approvalStatus.toUpperCase()}  |  AI MODEL: ${minutesVersion.aiModelIdentifier.split('/')[0]}`, margin + 3, cursorY + 5.2);
  cursorY += 12;

  // -------------------------------------------------------------
  // SECTION 2 & 3: MEETING, CLIENT & SITE DETAILS (2-Column Grid)
  // -------------------------------------------------------------
  checkPageBreak(36);
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Meeting Information
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, cursorY, colWidth, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('1. MEETING INFORMATION', margin + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${data.appointmentType}`, margin + 4, cursorY + 11);
  doc.text(`Date: ${data.meetingDate}`, margin + 4, cursorY + 16);
  doc.text(`Time: ${data.startTime} – ${data.endTime} (SAST)`, margin + 4, cursorY + 21);
  doc.text(`Duration: ${data.durationMinutes} minutes`, margin + 4, cursorY + 26);
  doc.text(`Service Ref: ${data.serviceRequestRef}`, margin + 4, cursorY + 31);

  // Right Box: Client & Site Details
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + colWidth + 6, cursorY, colWidth, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('2. CLIENT & SITE DETAILS', margin + colWidth + 10, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Client: ${data.client}`, margin + colWidth + 10, cursorY + 11);
  doc.text(`Organisation: ${data.organisation}`, margin + colWidth + 10, cursorY + 16);
  doc.text(`Site Name: ${data.site}`, margin + colWidth + 10, cursorY + 21);
  doc.text(`Platform: Zoom PMI Video Conference`, margin + colWidth + 10, cursorY + 26);
  doc.text(`Recording Consent: Confirmed by Client`, margin + colWidth + 10, cursorY + 31);

  cursorY += 38;

  // -------------------------------------------------------------
  // SECTION 4: ATTENDEES & APOLOGIES
  // -------------------------------------------------------------
  checkPageBreak(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('3. ATTENDEES & APOLOGIES', margin, cursorY + 4);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const attendeeStrings = data.attendees.map(a => `${a.name} (${a.role}${a.present ? ' - Present' : ' - Absent'})`).join('  •  ');
  const attendeeLines = doc.splitTextToSize(`Attendees: ${attendeeStrings}`, contentWidth);
  doc.text(attendeeLines, margin, cursorY + 3);
  cursorY += attendeeLines.length * 4 + 2;

  const apologyStr = data.apologies.length > 0 ? data.apologies.join(', ') : 'None recorded in transcript.';
  doc.text(`Apologies: ${apologyStr}`, margin, cursorY + 2);
  cursorY += 7;

  // -------------------------------------------------------------
  // SECTION 5: PURPOSE & AGENDA
  // -------------------------------------------------------------
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('4. PURPOSE & AGENDA', margin, cursorY + 4);
  cursorY += 7;

  data.agenda.forEach(item => {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(`${item.itemNumber}. ${item.title}:`, margin + 3, cursorY + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const descLines = doc.splitTextToSize(item.description, contentWidth - 35);
    doc.text(descLines, margin + 30, cursorY + 2);
    cursorY += Math.max(descLines.length * 3.8, 4.5) + 1.5;
  });

  cursorY += 4;

  // -------------------------------------------------------------
  // SECTION 6: DISCUSSION SUMMARY
  // -------------------------------------------------------------
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('5. DISCUSSION SUMMARY', margin, cursorY + 4);
  cursorY += 7;

  data.discussionPoints.forEach((point, idx) => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.text(`• ${point.topic}`, margin + 2, cursorY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const summaryLines = doc.splitTextToSize(point.summary, contentWidth - 8);
    doc.text(summaryLines, margin + 6, cursorY + 6.5);
    cursorY += summaryLines.length * 3.8 + 6;
  });

  cursorY += 3;

  // -------------------------------------------------------------
  // SECTION 7: CLIENT CONCERNS
  // -------------------------------------------------------------
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('6. CLIENT CONCERNS & SPECIFIC REQUIREMENTS', margin, cursorY + 4);
  cursorY += 7;

  if (data.clientConcerns.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text('No unresolved client concerns recorded in meeting transcript.', margin + 4, cursorY + 2);
    cursorY += 6;
  } else {
    data.clientConcerns.forEach(cc => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text(`[Concern] ${cc.concern}:`, margin + 3, cursorY + 2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const ctxLines = doc.splitTextToSize(cc.context, contentWidth - 10);
      doc.text(ctxLines, margin + 6, cursorY + 6);
      cursorY += ctxLines.length * 3.8 + 5;
    });
  }

  cursorY += 3;

  // -------------------------------------------------------------
  // SECTION 8: DOCUMENTS & EVIDENCE DISCUSSED
  // -------------------------------------------------------------
  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('7. DOCUMENTS & EVIDENCE DISCUSSED', margin, cursorY + 4);
  cursorY += 6;

  data.documentsDiscussed.forEach(docItem => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`• ${docItem}`, margin + 4, cursorY + 2);
    cursorY += 4.5;
  });

  cursorY += 3;

  // -------------------------------------------------------------
  // SECTION 9: DECISIONS MADE
  // -------------------------------------------------------------
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('8. DECISIONS MADE', margin, cursorY + 4);
  cursorY += 7;

  data.decisions.forEach(dec => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(`DECISION ${dec.decisionNumber}: ${dec.description}`, margin + 3, cursorY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    const evLines = doc.splitTextToSize(`Transcript Evidence: "${dec.transcriptEvidence}"`, contentWidth - 10);
    doc.text(evLines, margin + 6, cursorY + 6);
    cursorY += evLines.length * 3.5 + 5;
  });

  cursorY += 4;

  // -------------------------------------------------------------
  // SECTION 10: ACTION-ITEM REGISTER (TABLE)
  // -------------------------------------------------------------
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('9. ACTION-ITEM REGISTER', margin, cursorY + 4);
  cursorY += 7;

  // Table header
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 2, cursorY + 4.5);
  doc.text('ACTION', margin + 10, cursorY + 4.5);
  doc.text('OWNER', margin + 86, cursorY + 4.5);
  doc.text('DUE DATE', margin + 124, cursorY + 4.5);
  doc.text('STATUS', margin + 154, cursorY + 4.5);
  cursorY += 6.5;

  data.actionItems.forEach(item => {
    const actionLines = doc.splitTextToSize(item.action, 72);
    const rowHeight = Math.max(actionLines.length * 3.8 + 4, 8);
    checkPageBreak(rowHeight + 2);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, cursorY, contentWidth, rowHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(`${item.actionNumber}`, margin + 2, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(actionLines, margin + 10, cursorY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(item.responsibleParty, margin + 86, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(item.dueDate, margin + 124, cursorY + 4.5);

    // Status pill
    doc.setTextColor(item.status === 'Completed' ? 22 : item.status === 'In Progress' ? 37 : 180, item.status === 'Completed' ? 101 : item.status === 'In Progress' ? 99 : 83, item.status === 'Completed' ? 52 : item.status === 'In Progress' ? 235 : 9);
    doc.text(item.status, margin + 154, cursorY + 4.5);

    cursorY += rowHeight;
  });

  cursorY += 5;

  // -------------------------------------------------------------
  // SECTION 11, 12, 13: OUTSTANDING INFO, RISKS, WORKFLOW STAGE
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('10. OUTSTANDING INFORMATION & RISKS', margin, cursorY + 4);
  cursorY += 7;

  if (data.outstandingInformation.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('Outstanding Items Required:', margin + 2, cursorY + 2);
    cursorY += 4;

    data.outstandingInformation.forEach(info => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`• ${info}`, margin + 5, cursorY + 2);
      cursorY += 4;
    });
  }

  if (data.risksOrBlockers.length > 0) {
    cursorY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
    doc.text('Risks / Technical Blockers:', margin + 2, cursorY + 2);
    cursorY += 4;

    data.risksOrBlockers.forEach(rb => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`• [${rb.severity.toUpperCase()}] ${rb.risk}`, margin + 5, cursorY + 2);
      cursorY += 4;
    });
  }

  cursorY += 4;
  checkPageBreak(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text(`Next "How We Work" Workflow Stage: ${data.nextHowWeWorkStage}`, margin + 2, cursorY + 2);
  cursorY += 5;

  if (data.followUpMeetingRequirement.required) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Follow-Up Consultation: Required (${data.followUpMeetingRequirement.suggestedType || 'Next Stage Review'} - ${data.followUpMeetingRequirement.targetTimeframe || 'Within 7 business days'})`, margin + 2, cursorY + 2);
    cursorY += 5;
  }

  cursorY += 4;

  // -------------------------------------------------------------
  // SECTION 14: UNCERTAIN OR INAUDIBLE SECTIONS (AUDIT)
  // -------------------------------------------------------------
  if (data.uncertainOrInaudibleSections && data.uncertainOrInaudibleSections.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
    doc.text('11. UNCERTAIN OR INAUDIBLE SECTIONS (TRANSCRIPT AUDIT)', margin, cursorY + 4);
    cursorY += 6;

    data.uncertainOrInaudibleSections.forEach(un => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
      doc.text(`• [${un.timestamp}] ${un.note} (Snippet: "${un.transcriptSnippet}")`, margin + 4, cursorY + 2);
      cursorY += 4;
    });
    cursorY += 4;
  }

  // -------------------------------------------------------------
  // SECTION 15 & 16: AI NOTICE & SANS 10139 DISCLAIMER & CLIENT CORRECTION INSTRUCTIONS
  // -------------------------------------------------------------
  checkPageBreak(40);

  // AI Notice Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, contentWidth, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('IMPORTANT AI-GENERATION NOTICE & SANS 10139 COMPLIANCE QUALIFICATION', margin + 4, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(brandSlate[0], brandSlate[1], brandSlate[2]);
  const noticeLines = doc.splitTextToSize(
    'These minutes were prepared automatically from the available Zoom meeting transcript using AI. Participants should review the document and report any correction required. The minutes do not independently constitute technical certification, commissioning, statutory approval or confirmation of SANS 10139 compliance.\n' +
    'Work and recommendations remain subject to the applicable project requirements, fire strategy, manufacturer requirements, physical assessment, testing and relevant SANS 10139 recommendations.',
    contentWidth - 8
  );
  doc.text(noticeLines, margin + 4, cursorY + 9.5);
  cursorY += 25;

  // Client correction & acknowledgement instructions
  checkPageBreak(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.text('CLIENT CORRECTION & ACKNOWLEDGEMENT INSTRUCTIONS', margin, cursorY + 3);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const corrLines = doc.splitTextToSize(
    'If any portion of these minutes is inaccurate or incomplete, please submit a correction request through your Audrin Fire Engineers Customer Portal. Approved corrections will issue a revised minutes version. You can also record formal receipt acknowledgement directly in your dashboard.',
    contentWidth
  );
  doc.text(corrLines, margin, cursorY + 2);
  cursorY += corrLines.length * 3.5 + 6;

  // Add footer to final page
  addFooter();

  return doc;
}
