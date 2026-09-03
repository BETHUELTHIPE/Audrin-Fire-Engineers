# Amazon ECS Cluster and Fargate Services Architecture for Audrin Fire Engineers

resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.app_name}-ecs-cluster"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# IAM Role for ECS Task Execution (Pull ECR, push CloudWatch logs, get Secrets)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Application Tasks (Access S3, KMS, SNS, SQS, SES)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "ecs_task_permissions" {
  name = "${var.app_name}-ecs-task-policy-${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3PrivateMediaAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject",
          "s3:AbortMultipartUpload"
        ]
        Resource = [
          aws_s3_bucket.private_media.arn,
          "${aws_s3_bucket.private_media.arn}/*",
          aws_s3_bucket.quarantine.arn,
          "${aws_s3_bucket.quarantine.arn}/*",
          aws_s3_bucket.static_assets.arn,
          "${aws_s3_bucket.static_assets.arn}/*"
        ]
      },
      {
        Sid    = "KMSOperations"
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = [
          aws_kms_key.s3_private_media.arn,
          aws_kms_key.sns_sqs.arn
        ]
      },
      {
        Sid    = "SNSPublishing"
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = ["*"]
      },
      {
        Sid    = "SQSConsumption"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = ["*"]
      },
      {
        Sid    = "SESEmailSending"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_permissions.arn
}

# 1. Next.js Frontend Service
resource "aws_ecs_task_definition" "nextjs" {
  family                   = "${var.app_name}-nextjs-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "nextjs-frontend"
    image     = var.docker_image
    essential = true
    portMappings = [{
      containerPort = 80
      hostPort      = 80
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.app_name}-nextjs"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "nextjs"
      }
    }
  }])
}

resource "aws_ecs_service" "nextjs" {
  name            = "nextjs-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.nextjs.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.nextjs.arn
    container_name   = "nextjs-frontend"
    container_port   = 80
  }
}

# 2. Django Gunicorn Backend API Service
resource "aws_ecs_task_definition" "django" {
  family                   = "${var.app_name}-django-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "django-backend"
    image     = var.docker_image
    essential = true
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
    }]
    environment = [
      { name = "DJANGO_SETTINGS_MODULE", value = "audrin_fire.settings.production" },
      { name = "AWS_STORAGE_BUCKET_NAME", value = aws_s3_bucket.private_media.id },
      { name = "AWS_STATIC_BUCKET_NAME", value = aws_s3_bucket.static_assets.id },
      { name = "AWS_QUARANTINE_BUCKET_NAME", value = aws_s3_bucket.quarantine.id }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.app_name}-django"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "django"
      }
    }
  }])
}

resource "aws_ecs_service" "django" {
  name            = "django-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.django.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.django_api.arn
    container_name   = "django-backend"
    container_port   = 8000
  }
}

# 3. Celery Worker (General Async Tasks)
resource "aws_ecs_service" "celery_worker" {
  name            = "celery-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.django.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

# 4. Celery Beat (SINGLETON: Strictly exactly 1 active instance to prevent duplicate emails/SLAs)
resource "aws_ecs_service" "celery_beat" {
  name                               = "celery-beat-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.django.arn
  desired_count                      = 1
  deployment_maximum_percent         = 100 # Prevents duplicate schedulers running concurrently
  deployment_minimum_healthy_percent = 0
  launch_type                        = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

# 5. Video & Document Processing Worker (High CPU & 20GB Ephemeral Storage for FFmpeg/LibreOffice)
resource "aws_ecs_task_definition" "video_worker" {
  family                   = "${var.app_name}-video-worker-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "2048"
  memory                   = "4096"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  ephemeral_storage {
    size_in_gib = 30
  }

  container_definitions = jsonencode([{
    name      = "video-doc-worker"
    image     = var.docker_image
    essential = true
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.app_name}-video-worker"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "video-worker"
      }
    }
  }])
}

resource "aws_ecs_service" "video_worker" {
  name            = "video-doc-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.video_worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

# 6. SQS Notification Worker (Consumes SQS events -> renders templates -> dispatches via Amazon SES)
resource "aws_ecs_service" "notification_worker" {
  name            = "notification-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.django.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_app[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}
