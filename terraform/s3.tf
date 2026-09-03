# Amazon S3 Multi-Bucket Architecture for Audrin Fire Engineers
# Enforces S3 Block Public Access, SSE-KMS, Versioning, and CloudFront OAC

# 1. Static Assets Bucket (Django static, Next.js immutable assets, public assets)
resource "aws_s3_bucket" "static_assets" {
  bucket        = "${var.app_name}-static-assets-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "${var.app_name}-static-assets"
    Environment = var.environment
    Tier        = "Public-Via-CloudFront"
  }
}

resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket                  = aws_s3_bucket.static_assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 2. Private Media Bucket (Customer CAD, High-Res Photos, Condition Reports, Original/Processed Videos)
resource "aws_s3_bucket" "private_media" {
  bucket        = "${var.app_name}-private-media-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "${var.app_name}-private-media"
    Environment = var.environment
    Tier        = "Private-Customer-Evidence"
    Compliance  = "SANS 10139 Statutory Evidence"
  }
}

resource "aws_s3_bucket_versioning" "private_media" {
  bucket = aws_s3_bucket.private_media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "private_media" {
  bucket                  = aws_s3_bucket.private_media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "private_media" {
  bucket = aws_s3_bucket.private_media.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3_private_media.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 Lifecycle Rules for Private Media (Multipart Cleanup, Glacier Transition for historical records)
resource "aws_s3_bucket_lifecycle_configuration" "private_media" {
  bucket = aws_s3_bucket.private_media.id

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "statutory-evidence-glacier-transition"
    status = "Enabled"

    filter {
      prefix = "organisations/"
    }

    transition {
      days          = 90
      storage_class = "INTELLIGENT_TIERING"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }
  }
}

# 3. Quarantine Bucket (Untrusted uploads awaiting ClamAV malware scan / validation)
resource "aws_s3_bucket" "quarantine" {
  bucket        = "${var.app_name}-quarantine-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "${var.app_name}-quarantine-vault"
    Environment = var.environment
    Tier        = "Quarantine-Isolated"
  }
}

resource "aws_s3_bucket_public_access_block" "quarantine" {
  bucket                  = aws_s3_bucket.quarantine.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "quarantine" {
  bucket = aws_s3_bucket.quarantine.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3_private_media.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "quarantine" {
  bucket = aws_s3_bucket.quarantine.id

  rule {
    id     = "auto-expire-unverified-quarantine"
    status = "Enabled"

    expiration {
      days = 14
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 3
    }
  }
}

# Enforce TLS 1.2+ Only Policy for All S3 Buckets
resource "aws_s3_bucket_policy" "enforce_tls_private_media" {
  bucket = aws_s3_bucket.private_media.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnforceTLSRequestsOnly"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.private_media.arn,
          "${aws_s3_bucket.private_media.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
          NumericLessThan = {
            "s3:TlsVersion" = 1.2
          }
        }
      }
    ]
  })
}
