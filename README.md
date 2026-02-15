# Inventory Management System

> **Note:** This project served as the MVP / proof-of-concept for AnchorLab's inventory management needs. It has since been migrated to a .NET stack to align with the company's existing infrastructure and deployment targets. This repository is no longer under active development.

Custom inventory management web application for AnchorLab, a company providing Remote Electronic Monitoring (REM) solutions to the fishery sector. Designed for tracking products in/out, assembly tracking (multiple components for one system) and low product warning.

## Background

Built to solve a real problem at AnchorLab: offered products are highly customizable and the workflow from components ordered to assembling to client is unusual within inventory management, so existing solutions don't fit. This web app addresses that gap by being exactly customized to our workflow while serving as a hands-on DevOps learning project, from idea to deployment — CI/CD, containerization, cloud infrastructure, and infrastructure as code.

## Tech Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Infrastructure:** AWS (EC2, RDS, S3, CloudFront, Route 53), Docker, OpenTofu, GitHub Actions CI/CD

## What Was Built

- Full CRUD for items (components and products), configurations (bills of materials), and assemblies
- Assembly status workflow: Reserved → Building → Completed → Shipped
- Build capacity calculation based on available inventory
- Dashboard with inventory overview and low stock warnings
- Dark/light mode with AnchorLab brand theming
- Automated CI/CD pipeline deploying to AWS on merge to main
- Infrastructure as Code with OpenTofu managing all AWS resources

## Local Development

Prerequisites: Docker and Docker Compose

```bash
# Start all services
docker compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# API docs: http://localhost:8000/docs
```

## Project Structure

```
inv-sys/
├── .github/workflows/  # CI/CD pipelines
├── backend/            # FastAPI application
├── frontend/           # React application
├── terraform/          # OpenTofu / AWS infrastructure
└── docker-compose.yml
```
