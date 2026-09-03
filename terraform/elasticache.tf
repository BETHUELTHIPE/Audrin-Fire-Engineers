# Amazon ElastiCache Redis Cluster for Celery Broker, Result Backend & Distributed Lock

resource "aws_elasticache_parameter_group" "redis" {
  name        = "${var.app_name}-redis7-params-${var.environment}"
  family      = "redis7"
  description = "Redis parameter group for Celery broker and distributed locks"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "${var.app_name}-redis-${var.environment}"
  description                   = "Redis cluster for Celery broker, lock & caching"
  node_type                     = var.redis_node_type
  port                          = 6379
  parameter_group_name          = aws_elasticache_parameter_group.redis.name
  subnet_group_name             = aws_elasticache_subnet_group.redis.name
  security_group_ids            = [aws_security_group.redis.id]
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  num_cache_clusters            = 2
  transit_encryption_enabled    = true
  at_rest_encryption_enabled    = true
  auth_token                    = random_password.redis_auth.result
  auto_minor_version_upgrade    = true
  maintenance_window            = "Sun:05:00-Sun:07:00"
  snapshot_retention_limit      = 7
  snapshot_window               = "03:00-05:00"

  tags = {
    Name = "${var.app_name}-redis-cluster"
  }
}

resource "random_password" "redis_auth" {
  length  = 32
  special = false
}
