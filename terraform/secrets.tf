# AWS Secrets Manager for Audrin Fire Production Secrets

resource "aws_secretsmanager_secret" "django_secrets" {
  name                    = "${var.app_name}-django-production-secrets"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "django_secrets_val" {
  secret_id = aws_secretsmanager_secret.django_secrets.id
  secret_string = jsonencode({
    DJANGO_SECRET_KEY = random_password.django_secret_key.result
    DATABASE_URL      = "postgres://${aws_db_instance.postgres.username}:${random_password.db_password.result}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
    REDIS_URL         = "rediss://:${random_password.redis_auth.result}@${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379/0"
  })
}

resource "random_password" "django_secret_key" {
  length  = 64
  special = true
}
