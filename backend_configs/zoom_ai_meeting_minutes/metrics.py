"""
Audrin Fire Engineers (Pty) Ltd - Prometheus & CloudWatch Metrics
Registration No: K2026089596
No PII in metrics labels.
"""

from prometheus_client import Counter, Histogram, Gauge

# Counters
ZOOM_RECORDINGS_RECEIVED_TOTAL = Counter(
    'audrin_zoom_recordings_received_total',
    'Total count of Zoom recordings received via webhook'
)

MEETING_MINUTES_GENERATION_TOTAL = Counter(
    'audrin_meeting_minutes_generation_total',
    'Total count of meeting minutes generation attempts',
    ['status']  # success, failure
)

MEETING_MINUTES_EMAILS_SENT_TOTAL = Counter(
    'audrin_meeting_minutes_emails_sent_total',
    'Total separate emails dispatched via SES',
    ['recipient_type', 'status']  # recipient_type: client, superuser; status: sent, failed
)

MEETING_MINUTES_CORRECTIONS_SUBMITTED_TOTAL = Counter(
    'audrin_meeting_minutes_corrections_submitted_total',
    'Total count of client correction requests submitted'
)

# Histograms
BEDROCK_PROCESSING_DURATION_SECONDS = Histogram(
    'audrin_bedrock_processing_duration_seconds',
    'Time spent in Bedrock LLM extraction',
    buckets=[2.0, 5.0, 10.0, 20.0, 30.0, 60.0, 120.0]
)

PDF_GENERATION_DURATION_SECONDS = Histogram(
    'audrin_pdf_generation_duration_seconds',
    'Time spent rendering PDF minutes document',
    buckets=[0.2, 0.5, 1.0, 2.0, 5.0]
)

# Gauges
PENDING_CORRECTIONS_COUNT = Gauge(
    'audrin_meeting_minutes_pending_corrections_count',
    'Current number of pending client correction requests awaiting admin review'
)
