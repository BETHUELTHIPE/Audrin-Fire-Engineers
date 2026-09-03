# Least-Privilege Security Groups for Audrin Fire Engineers AWS Infrastructure

# 1. Public Application Load Balancer Security Group
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-alb-sg-${var.environment}"
  description = "Controls public inbound traffic to ALB on HTTPS (443) and HTTP redirect (80)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTP for TLS redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound to ECS private services"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-alb-sg"
  }
}

# 2. ECS Fargate Application Tasks Security Group (Next.js, Nginx, Django)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-ecs-tasks-sg-${var.environment}"
  description = "Allows traffic strictly from ALB to ECS containers and inter-container communication"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Inbound from ALB to Next.js / Nginx"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Inbound from ALB / Nginx to Gunicorn Django API"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    self            = true
  }

  egress {
    description = "Outbound internet access via NAT Gateway & VPC Endpoints"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-tasks-sg"
  }
}

# 3. Amazon RDS PostgreSQL Security Group
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg-${var.environment}"
  description = "Allows PostgreSQL (5432) strictly from authorized ECS application tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS Backend & Workers"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "No outbound from database"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-rds-sg"
  }
}

# 4. Amazon ElastiCache Redis Security Group
resource "aws_security_group" "redis" {
  name        = "${var.app_name}-redis-sg-${var.environment}"
  description = "Allows Redis (6379) strictly from ECS tasks (Celery, Django cache, lock)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from ECS Django & Celery Workers"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "No outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-redis-sg"
  }
}

# 5. Private Administrative Tools Security Group (Flower, Prometheus, Grafana, pgAdmin)
resource "aws_security_group" "private_admin" {
  name        = "${var.app_name}-private-admin-sg-${var.environment}"
  description = "Restricted administrative tools access (VPN / Bastion host only)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Grafana / Prometheus / Flower from Private App Subnets"
    from_port   = 3000
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-private-admin-sg"
  }
}
