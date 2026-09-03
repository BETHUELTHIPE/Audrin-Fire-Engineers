# Application Load Balancer Architecture & Routing Rules for Audrin Fire Engineers

resource "aws_lb" "main" {
  name               = "${var.app_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.app_name}-alb"
  }
}

# Target Group: Next.js Frontend (Port 80)
resource "aws_lb_target_group" "nextjs" {
  name        = "${var.app_name}-tg-nextjs-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health/"
    matcher             = "200-299"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# Target Group: Django REST Framework & Admin (Port 8000)
resource "aws_lb_target_group" "django_api" {
  name        = "${var.app_name}-tg-django-${var.environment}"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/api/health/"
    matcher             = "200-299"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# HTTP to HTTPS Listener Redirect (Port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener (Port 443)
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = "arn:aws:acm:${var.aws_region}:123456789012:certificate/placeholder" # Replaced with actual ACM cert in deployment

  # Default Routing Rule: Next.js Frontend ("/")
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nextjs.arn
  }
}

# Routing Rule: "/api/*" -> Django REST Framework API
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.django_api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Routing Rule: "/secure-admin/*" -> Django Admin
resource "aws_lb_listener_rule" "admin_routing" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.django_api.arn
  }

  condition {
    path_pattern {
      values = ["/secure-admin/*"]
    }
  }
}

# Routing Rule: "/health/" and "/ready/" -> Health Probes
resource "aws_lb_listener_rule" "health_routing" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 5

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nextjs.arn
  }

  condition {
    path_pattern {
      values = ["/health/", "/ready/"]
    }
  }
}
