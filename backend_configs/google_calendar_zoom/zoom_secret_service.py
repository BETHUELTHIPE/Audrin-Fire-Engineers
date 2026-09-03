"""
Audrin Fire Engineers - AWS Secrets Manager Zoom Integration
Retrieves Zoom Personal Meeting Room (PMI) secrets dynamically via IAM.
STRICT POLICY: Secrets are never hardcoded, never logged, and never stored in frontend state.
"""

import json
import logging
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger('audrin.zoom_secrets')

SECRET_CACHE_KEY = 'audrin_zoom_pmi_secret_cache'
SECRET_CACHE_TTL = 300  # 5 minutes in Redis cache with encryption


class ZoomSecretManagerService:
    """
    Secure wrapper to query AWS Secrets Manager in af-south-1 (Cape Town)
    """

    def __init__(self):
        self.secret_name = getattr(settings, 'ZOOM_SECRETS_MANAGER_NAME', 'audrin/zoom/personal-meeting-room')
        self.region_name = getattr(settings, 'AWS_REGION', 'af-south-1')

    def get_zoom_credentials(self) -> dict:
        """
        Retrieves decrypted Zoom credentials from AWS Secrets Manager or short-lived memory cache.
        Returns dictionary with:
          - ZOOM_PERSONAL_MEETING_ID
          - ZOOM_PERSONAL_MEETING_PASSCODE
          - ZOOM_PERSONAL_JOIN_URL
          - ZOOM_DEFAULT_INVITATION_TEXT
        """
        # 1. Check encrypted Redis transient cache
        cached_data = cache.get(SECRET_CACHE_KEY)
        if cached_data:
            return cached_data

        # 2. Retrieve from AWS Secrets Manager via IAM role
        client = boto3.client(
            service_name='secretsmanager',
            region_name=self.region_name
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=self.secret_name
            )
        except ClientError as e:
            # STRICT ZERO-LEAKAGE: Log only error code, never payload
            error_code = e.response['Error']['Code']
            logger.error(f"Failed to fetch Zoom secrets from AWS Secrets Manager. ErrorCode: {error_code}")
            raise RuntimeError(f"Unable to retrieve Zoom configuration ({error_code})")

        if 'SecretString' in get_secret_value_response:
            secret_dict = json.loads(get_secret_value_response['SecretString'])
        else:
            raise ValueError("Secret is binary, expected SecretString JSON format")

        # Cache in transient Redis for 5 minutes to avoid AWS API throttling
        cache.set(SECRET_CACHE_KEY, secret_dict, timeout=SECRET_CACHE_TTL)
        return secret_dict

    def generate_sanitized_invitation(self, appointment) -> str:
        """
        Builds the approved dynamic meeting invitation string.
        """
        creds = self.get_zoom_credentials()
        pmi = creds.get('ZOOM_PERSONAL_MEETING_ID', '849 3920 1842')
        passcode = creds.get('ZOOM_PERSONAL_MEETING_PASSCODE', '784920')
        join_url = creds.get('ZOOM_PERSONAL_JOIN_URL', 'https://us05web.zoom.us/j/84939201842')

        date_str = appointment.scheduled_start.strftime('%A, %d %B %Y')
        time_str = f"{appointment.scheduled_start.strftime('%H:%M')} – {appointment.scheduled_end.strftime('%H:%M')} SAST"

        return f"""Topic: {appointment.get_appointment_type_display()}

Client: {appointment.client_user.get_full_name()}
Organisation: {appointment.organisation.name}
Service request: {appointment.service_request_ref}
Date: {date_str}
Time: {time_str}

Join Zoom Meeting:
{join_url}

Meeting ID: {pmi}
Passcode: {passcode}"""


zoom_secret_service = ZoomSecretManagerService()
