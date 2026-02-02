output "nameservers" {
  description = "Nameservers to configure at domain registrar"
  value       = aws_route53_zone.main.name_servers
}

output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}
