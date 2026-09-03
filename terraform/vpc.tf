# VPC and Multi-AZ Subnet Architecture for Audrin Fire Engineers

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc-${var.environment}"
  }
}

# Internet Gateway for Public Subnets
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw-${var.environment}"
  }
}

# Public Subnets (ALB & NAT Gateways across Multi-AZ)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-subnet-${count.index + 1}-${var.environment}"
    Tier = "Public"
  }
}

# NAT Gateways & Elastic IPs for Private Subnet Outbound Traffic
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "${var.app_name}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "nat" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.app_name}-nat-gw-${count.index + 1}"
  }
  depends_on = [aws_internet_gateway.gw]
}

# Private Application Subnets (ECS Fargate Services: Next.js, Django, Celery, Workers)
resource "aws_subnet" "private_app" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.app_name}-private-app-subnet-${count.index + 1}-${var.environment}"
    Tier = "Private-App"
  }
}

# Private Database Subnets (Amazon RDS PostgreSQL & Amazon ElastiCache Redis)
resource "aws_subnet" "private_db" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 8)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.app_name}-private-db-subnet-${count.index + 1}-${var.environment}"
    Tier = "Private-DB"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "${var.app_name}-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private_app" {
  count  = 2
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index].id
  }

  tags = {
    Name = "${var.app_name}-private-app-rt-${count.index + 1}"
  }
}

resource "aws_route_table" "private_db" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-private-db-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_app" {
  count          = 2
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app[count.index].id
}

resource "aws_route_table_association" "private_db" {
  count          = 2
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private_db.id
}

# Subnet Groups for RDS & ElastiCache
resource "aws_db_subnet_group" "rds" {
  name        = "${var.app_name}-rds-subnet-group-${var.environment}"
  description = "Private database subnets for RDS PostgreSQL Multi-AZ"
  subnet_ids  = aws_subnet.private_db[*].id

  tags = {
    Name = "${var.app_name}-rds-subnet-group"
  }
}

resource "aws_elasticache_subnet_group" "redis" {
  name        = "${var.app_name}-redis-subnet-group-${var.environment}"
  description = "Private database subnets for ElastiCache Redis cluster"
  subnet_ids  = aws_subnet.private_db[*].id
}

# VPC S3 Gateway Endpoint (Zero Cost / High Bandwidth to S3)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = concat([aws_route_table.public.id], aws_route_table.private_app[*].id)

  tags = {
    Name = "${var.app_name}-s3-gateway-endpoint"
  }
}
