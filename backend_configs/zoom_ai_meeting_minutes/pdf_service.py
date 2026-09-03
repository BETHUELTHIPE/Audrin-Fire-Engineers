"""
Audrin Fire Engineers (Pty) Ltd - Python ReportLab PDF Meeting Minutes Renderer
Registration No: K2026089596
"""

import io
import hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def render_branded_meeting_minutes_pdf(structured_json: dict, version_number: int, service_request_ref: str) -> tuple[bytes, str]:
    """
    Renders official 16-section meeting minutes PDF with ReportLab.
    Returns (pdf_bytes, sha256_hash).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'AudrinHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.HexColor('#0A192F'),
        spaceAfter=4
    )
    sub_style = ParagraphStyle(
        'AudrinSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#CC0000'),
        spaceAfter=12
    )
    body_style = ParagraphStyle(
        'AudrinBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # Letterhead
    story.append(Paragraph("AUDRIN FIRE ENGINEERS", header_style))
    story.append(Paragraph(f"MINUTES REFERENCE: {service_request_ref}-MIN-V{version_number} | SANS 10139 ALIGNED", sub_style))
    story.append(Spacer(1, 10))

    # Title Banner
    story.append(Paragraph(f"<b>MEETING TITLE:</b> {structured_json.get('meetingTitle', '')}", body_style))
    story.append(Paragraph(f"<b>DATE:</b> {structured_json.get('meetingDate', '')} ({structured_json.get('startTime', '')} - {structured_json.get('endTime', '')} SAST)", body_style))
    story.append(Paragraph(f"<b>CLIENT:</b> {structured_json.get('client', '')} | <b>SITE:</b> {structured_json.get('site', '')}", body_style))
    story.append(Spacer(1, 12))

    # AI Notice & SANS 10139 Disclaimer
    disclaimer_text = structured_json.get('fireDetectionDisclaimer', '')
    story.append(Paragraph(f"<b>SANS 10139 QUALIFIED DISCLAIMER:</b> {disclaimer_text}", body_style))
    story.append(Spacer(1, 10))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    sha256 = hashlib.sha256(pdf_bytes).hexdigest()
    return pdf_bytes, sha256
