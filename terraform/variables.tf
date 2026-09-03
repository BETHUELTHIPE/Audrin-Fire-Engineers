variable "aws_region" {
  description = "Primary AWS Region for Audrin Fire platform deployment"
  type        = string
  default     = "af-south-1" # Cape Town region (or eu-west-1 / us-east-1)
}

variable "environment" {
  description = "Deployment environment name (production, staging, dev)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application namespace identifier"
  type        = string
  default     = "audrin-fire"
}

variable "domain_name" {
  description = "Primary public domain name for Audrin Fire Engineers"
  type        = string
  default     = "audrinfire.co.za"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of Availability Zones for Multi-AZ redundancy"
  type        = list(string)
  default     = ["af-south-1a", "af-south-1b", "af-south-1c"]
}

variable "docker_image" {
  description = "Docker image repository on Docker Hub"
  type        = string
  default     = "bethuelm/audrin-fire-engineers:latest"
}

variable "db_instance_class" {
  description = "Amazon RDS PostgreSQL instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for Amazon RDS"
  type        = number
  default     = 100
}

variable "redis_node_type" {
  description = "Amazon ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.medium"
}

variable "ses_sender_email" {
  description = "Sender email address verified in Amazon SES"
  type        = string
  default     = "dispatches@audrinfire.co.za"
}

variable "emergency_notification_email" {
  description = "Direct SNS notification email for critical emergency attendance alarms"
  type        = string
  default     = "emergency@audrinfire.co.za"
}
