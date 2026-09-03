# Amazon SNS & SQS Event Notification Architecture for Audrin Fire Engineers
# Flow: Django/Celery -> Amazon SNS -> Amazon SQS -> ECS Notification Worker -> Amazon SES

# 1. Primary SNS Topics
resource "aws_sns_topic" "client_notifications" {
  name              = "audrin-client-notifications-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id

  tags = {
    Name    = "audrin-client-notifications"
    Purpose = "Transactional Client Alerts"
  }
}

resource "aws_sns_topic" "service_request_events" {
  name              = "audrin-service-request-events-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id
}

resource "aws_sns_topic" "document_events" {
  name              = "audrin-document-events-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id
}

resource "aws_sns_topic" "report_events" {
  name              = "audrin-report-events-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id
}

resource "aws_sns_topic" "emergency_alerts" {
  name              = "audrin-emergency-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id
}

resource "aws_sns_topic" "system_alerts" {
  name              = "audrin-system-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.sns_sqs.id
}

# 2. Dead-Letter Queue (DLQ) for Failed Notifications
resource "aws_sqs_queue" "notification_dlq" {
  name                      = "${var.app_name}-notifications-dlq-${var.environment}"
  kms_master_key_id         = aws_kms_key.sns_sqs.id
  message_retention_seconds = 1209600 # 14 days retention for troubleshooting

  tags = {
    Name = "${var.app_name}-notification-dlq"
  }
}

# 3. Primary Notification Worker SQS Queue
resource "aws_sqs_queue" "notification_queue" {
  name                       = "${var.app_name}-client-notification-queue-${var.environment}"
  kms_master_key_id          = aws_kms_key.sns_sqs.id
  visibility_timeout_seconds = 300 # 5 minutes processing time
  message_retention_seconds  = 345600 # 4 days
  receive_wait_time_seconds  = 20 # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "${var.app_name}-client-notification-queue"
  }
}

# 4. SQS Queue Policy Allowing SNS Topics to Publish
resource "aws_sqs_queue_policy" "allow_sns_publish" {
  queue_url = aws_sqs_queue.notification_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowSNSTopicDelivery"
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.notification_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = [
              aws_sns_topic.client_notifications.arn,
              aws_sns_topic.report_events.arn,
              aws_sns_topic.service_request_events.arn
            ]
          }
        }
      }
    ]
  })
}

# 5. SNS Subscriptions to SQS Queue
resource "aws_sns_topic_subscription" "client_queue_sub" {
  topic_arn = aws_sns_topic.client_notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn
}

resource "aws_sns_topic_subscription" "report_queue_sub" {
  topic_arn = aws_sns_topic.report_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn
}

# 6. Direct SNS Email Subscription for Internal Operational Alerts (Emergency Only)
resource "aws_sns_topic_subscription" "emergency_admin_email" {
  topic_arn = aws_sns_topic.emergency_alerts.arn
  protocol  = "email"
  endpoint  = var.emergency_notification_email
}
