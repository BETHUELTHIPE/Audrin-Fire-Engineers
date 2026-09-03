# Amazon CloudWatch Logs & Alarms Architecture for Audrin Fire Engineers

# Log Groups for Each ECS Service
resource "aws_cloudwatch_log_group" "nextjs" {
  name              = "/ecs/${var.app_name}-nextjs"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "django" {
  name              = "/ecs/${var.app_name}-django"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "video_worker" {
  name              = "/ecs/${var.app_name}-video-worker"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "notification_worker" {
  name              = "/ecs/${var.app_name}-notification-worker"
  retention_in_days = 30
}

# Metric Alarms: High CPU, 5XX Errors, SQS DLQ messages
resource "aws_cloudwatch_metric_alarm" "high_cpu_django" {
  alarm_name          = "${var.app_name}-django-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alarm when Django container CPU exceeds 80%"
  alarm_actions       = [aws_sns_topic.emergency_alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.django.name
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_dlq_depth" {
  alarm_name          = "${var.app_name}-sqs-dlq-alarm-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Triggers when any notification message fails and lands in the Dead-Letter Queue"
  alarm_actions       = [aws_sns_topic.emergency_alerts.arn]

  dimensions = {
    QueueName = aws_sqs_queue.notification_dlq.name
  }
}
