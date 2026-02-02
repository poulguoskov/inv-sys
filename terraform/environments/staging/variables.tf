variable "domain" {
  description = "Root domain name"
  type        = string
  default     = "pgskov.tech"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "inv-sys"
}
