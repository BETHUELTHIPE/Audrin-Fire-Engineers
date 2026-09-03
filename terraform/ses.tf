# Amazon Simple Email Service (SES) Production Architecture for Audrin Fire Engineers

resource "aws_ses_domain_identity" "domain" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "dkim" {
  domain = aws_ses_domain_identity.domain.domain
}

resource "aws_ses_domain_mail_from" "mail_from" {
  domain           = aws_ses_domain_identity.domain.domain
  mail_from_domain = "mail.${var.domain_name}"
}

# SES Event Destination: Publish Bounces and Complaints to SNS
resource "aws_ses_configuration_set" "audrin_config_set" {
  name = "${var.app_name}-ses-config-${var.environment}"
}

resource "aws_sns_topic" "ses_bounces" {
  name = "${var.app_name}-ses-bounces-${var.environment}"
}

resource "aws_sns_topic" "ses_complaints" {
  name = "${var.app_name}-ses-complaints-${var.environment}"
}

resource "aws_ses_event_destination" "sns_bounce_complaint" {
  name                   = "sns-bounce-complaint-destination"
  configuration_set_name = aws_ses_configuration_set.audrin_config_set.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "reject"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_bounces.arn
  }
}
