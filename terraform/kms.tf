# AWS KMS Customer Managed Keys for S3, RDS, SNS/SQS, and Secrets Encryption

resource "aws_kms_key" "s3_private_media" {
  description             = "KMS Key for Audrin Fire private customer documents, videos, CAD, and reports"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name    = "${var.app_name}-kms-s3-private-media"
    Purpose = "S3 SSE-KMS Document Encryption"
  }
}

resource "aws_kms_alias" "s3_private_media" {
  name          = "alias/${var.app_name}-s3-private-media"
  target_key_id = aws_kms_key.s3_private_media.key_id
}

resource "aws_kms_key" "sns_sqs" {
  description             = "KMS Key for Amazon SNS notification topics and SQS queue encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name    = "${var.app_name}-kms-sns-sqs"
    Purpose = "SNS/SQS Event Encryption"
  }
}

resource "aws_kms_alias" "sns_sqs" {
  name          = "alias/${var.app_name}-sns-sqs"
  target_key_id = aws_kms_key.sns_sqs.key_id
}

resource "aws_kms_key" "rds" {
  description             = "KMS Key for Amazon RDS PostgreSQL Multi-AZ storage encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name    = "${var.app_name}-kms-rds"
    Purpose = "RDS Storage Encryption"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.app_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}
