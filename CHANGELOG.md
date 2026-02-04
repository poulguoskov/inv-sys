# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-02-02

### Added

- Pre-commit hook for code formatting and linting.

## [0.1.0] - 2026-02-02

### Added

- AWS infrastructure with OpenTofu (Route 53, ACM, S3, CloudFront, EC2, RDS)
- Frontend deployment at inv.pgskov.tech
- Backend deployment at api.inv.pgskov.tech with Caddy reverse proxy
- Items management with CRUD operations
- Assemblies with status workflow (Reserved → Building → Completed → Shipped)
- Build capacity tracking
- Configurations with component management
- Dashboard with stats overview
