output "alb_dns_name" {
  description = "Application Load Balancer public DNS address"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront CDN domain name for static assets"
  value       = aws_cloudfront_distribution.static_distribution.domain_name
}

output "static_assets_bucket" {
  description = "Amazon S3 Static Assets Bucket Name"
  value       = aws_s3_bucket.static_assets.id
}

output "private_media_bucket" {
  description = "Amazon S3 Private Customer Evidence Bucket Name"
  value       = aws_s3_bucket.private_media.id
}

output "quarantine_bucket" {
  description = "Amazon S3 Quarantine Vault Bucket Name"
  value       = aws_s3_bucket.quarantine.id
}

output "rds_endpoint" {
  description = "Amazon RDS PostgreSQL Multi-AZ connection endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_primary_endpoint" {
  description = "Amazon ElastiCache Redis cluster primary endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "Amazon ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

output "sns_client_notifications_topic_arn" {
  description = "SNS Client Notifications Topic ARN"
  value       = aws_sns_topic.client_notifications.arn
}

output "sqs_notification_queue_url" {
  description = "SQS Notification Queue URL"
  value       = aws_sqs_queue.notification_queue.id
}
