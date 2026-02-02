output "nameservers" {
  description = "Nameservers to configure at domain registrar"
  value       = aws_route53_zone.main.name_servers
}

output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}

output "ec2_public_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = aws_eip.backend.public_ip
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
}
