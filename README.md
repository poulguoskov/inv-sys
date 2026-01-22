# Inventory Management System

Custom inventory management web application for AnchorLab, a company providing Remote Electronic Monitoring (REM) solutions to the fishery sector. Designed for tracking products in/out, assembly tracking (multiple components for one system) and low product warning.

## Background

Built to solve a real problem at AnchorLab: offered products are highly customizable and the workflow from components ordered to assembling to client is unusual within inventory management, so existing solutions don't fit. This web app addresses that gap by being exactly customized to our workflow while serving as a hands-on DevOps learning project, from idea to deployment - CI/CD, containerization, deployment, self-hosting, and homelab experimentation.

## Tech Stack

- Backend: Python 3.12, FastAPI, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Infrastructure: Docker Compose, GitHub Actions CI, Kubernetes

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
├── backend/           # FastAPI application
├── frontend/          # React application
└── docker-compose.yml
```

## Planned Features

- [ ] Product and component catalog
- [ ] Barcode scan-in/out
- [ ] Low stock alerts
- [ ] Assembly tracking
- [ ] Supplier lead time management
- [ ] e-conomic integration
