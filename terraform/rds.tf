# Amazon RDS PostgreSQL Multi-AZ Deployment for Audrin Fire Engineers

resource "aws_db_parameter_group" "pg" {
  name        = "${var.app_name}-pg16-params-${var.environment}"
  family      = "postgres16"
  description = "Custom parameter group for Audrin Fire SANS 10139 Compliance Platform"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "statement_timeout"
    value = "30000" # 30s timeout
  }
}

resource "aws_db_instance" "postgres" {
  identifier                  = "${var.app_name}-postgres-${var.environment}"
  engine                      = "postgres"
  engine_version              = "16.2"
  instance_class              = var.db_instance_class
  allocated_storage           = var.db_allocated_storage
  max_allocated_storage       = 500
  storage_type                = "gp3"
  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.rds.arn
  multi_az                    = true
  publicly_accessible         = false
  db_subnet_group_name        = aws_db_subnet_group.rds.name
  vpc_security_group_ids      = [aws_security_group.rds.id]
  parameter_group_name        = aws_db_parameter_group.pg.name
  auto_minor_version_upgrade  = true
  backup_retention_period     = 30 # 30 days automated point-in-time recovery
  backup_window               = "01:00-03:00"
  maintenance_window          = "Sun:03:00-Sun:05:00"
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "${var.app_name}-postgres-final-snapshot"
  performance_insights_enabled = true

  db_name  = "audrin_fire_db"
  username = "audrin_admin"
  password = random_password.db_password.result

  tags = {
    Name = "${var.app_name}-rds-postgres"
  }
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}
