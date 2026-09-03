"""
Audrin Fire Engineers - Django S3 Storage Architecture
Integrates django-storages and boto3 with Amazon S3 SSE-KMS, CloudFront OAC,
and SANS 10139 statutory evidence structure.
"""

import os
import uuid
from datetime import datetime
from storages.backends.s3boto3 import S3Boto3Storage
from botocore.config import Config
from django.conf import settings
from django.core.exceptions import PermissionDenied


class StaticStorage(S3Boto3Storage):
    """
    Storage backend for Django collected static assets, Django Admin CSS/JS,
    and public website assets delivered through Amazon CloudFront.
    """
    bucket_name = os.environ.get('AWS_STATIC_BUCKET_NAME', 'audrin-fire-static-assets-production')
    location = 'static'
    default_acl = None  # Block Public Access enabled; uses CloudFront OAC
    file_overwrite = True
    custom_domain = os.environ.get('CLOUDFRONT_DOMAIN', 'd111111abcdef8.cloudfront.net')
    querystring_auth = False


class PrivateMediaStorage(S3Boto3Storage):
    """
    Secure storage backend for customer evidence, high-resolution photographs,
    CAD drawings, Pre/Post-Work Condition Reports, and processed video assets.
    Enforces SSE-KMS encryption and generates temporary presigned URLs.
    """
    bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME', 'audrin-fire-private-media-production')
    location = ''
    default_acl = None
    file_overwrite = False
    custom_domain = False
    querystring_auth = True
    querystring_expire = 900  # Presigned URLs valid for strictly 15 minutes (900 seconds)

    # Enforce SSE-KMS encryption with customer-managed KMS key
    encryption = True
    signature_version = 's3v4'
    object_parameters = {
        'ServerSideEncryption': 'aws:kms',
        'SSEKMSKeyId': os.environ.get('AWS_KMS_KEY_ID', 'alias/audrin-fire-s3-private-media'),
    }


class QuarantineStorage(S3Boto3Storage):
    """
    Isolated storage backend for raw customer uploads awaiting automated
    ClamAV malware scanning, MIME verification, and video sanitization.
    """
    bucket_name = os.environ.get('AWS_QUARANTINE_BUCKET_NAME', 'audrin-fire-quarantine-production')
    location = 'quarantine'
    default_acl = None
    file_overwrite = False
    querystring_auth = True
    querystring_expire = 300


def generate_structured_s3_path(
    organisation_uuid: str,
    site_uuid: str,
    request_uuid: str,
    category: str,
    original_filename: str
) -> str:
    """
    Generates non-guessable, structured S3 object paths compliant with SANS 10139
    audit guidelines:
    organisations/{org_uuid}/sites/{site_uuid}/requests/{request_uuid}/{category}/{file_uuid}.{ext}
    """
    file_uuid = str(uuid.uuid4())
    _, ext = os.path.splitext(original_filename)
    clean_ext = ext.lower().lstrip('.')

    category_mapping = {
        'photo_before': 'photos/before',
        'photo_during': 'photos/during',
        'photo_after': 'photos/after',
        'video_original': 'videos/original',
        'video_processed': 'videos/processed',
        'video_thumbnail': 'videos/thumbnails',
        'cad_drawing': 'documents/cad',
        'report_pre_work': 'reports/pre-work',
        'report_post_work': 'reports/post-work',
        'report_service': 'reports/service',
        'technical_document': 'documents/technical',
    }

    sub_path = category_mapping.get(category, 'documents/general')
    
    return f"organisations/{organisation_uuid}/sites/{site_uuid}/requests/{request_uuid}/{sub_path}/{file_uuid}.{clean_ext}"


def generate_presigned_upload_url(
    organisation_uuid: str,
    site_uuid: str,
    request_uuid: str,
    category: str,
    filename: str,
    content_type: str,
    max_size_bytes: int = 104857600  # 100MB default limit
) -> dict:
    """
    Generates short-lived presigned POST URL for direct-to-S3 browser uploads.
    Bypasses ECS web container bandwidth and memory constraints.
    """
    import boto3
    s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
    bucket_name = os.environ.get('AWS_QUARANTINE_BUCKET_NAME', 'audrin-fire-quarantine-production')
    s3_key = generate_structured_s3_path(organisation_uuid, site_uuid, request_uuid, category, filename)

    presigned_post = s3_client.generate_presigned_post(
        Bucket=bucket_name,
        Key=s3_key,
        Fields={
            'Content-Type': content_type,
            'x-amz-server-side-encryption': 'aws:kms'
        },
        Conditions=[
            {'Content-Type': content_type},
            ['content-length-range', 1, max_size_bytes]
        ],
        ExpiresIn=900
    )

    return {
        'url': presigned_post['url'],
        'fields': presigned_post['fields'],
        's3_key': s3_key,
        'bucket': bucket_name,
        'expires_in_seconds': 900
    }
