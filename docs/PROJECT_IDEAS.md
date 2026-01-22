# Project Specification

## Problem

Current inventory tracking relies on memory and occasional manual audits. This leads to situations where we think we have parts but don't, delaying deliveries.

### Why Build Custom

1. **Highly customizable products** - Multiple configurations of the same product type
2. **Unusual workflow** - Items go through multiple stages, not just in/out
3. **Component vs Product distinction** - Components are assembled into products
4. **Variable supplier lead times** - Some items take days, others take months

## Core Concepts

### Products vs Components

- **Products:** Ready-to-ship items
- **Components:** Parts used for assembly

Components can be "free" or "committed" to an assembly.

### Standard Configurations

Base configurations that load by default when ordering or assembling. User can modify specific components without entering everything manually.

### Inventory Pipeline Stages

1. Need to order
2. Ordered
3. Partially delivered
4. Delivered
5. Used for assembly
6. Packed
7. Out for delivery

## Features

### MVP

- [ ] Product/component catalog
- [ ] Inventory count dashboard
- [ ] Barcode scan-in/out
- [ ] Low stock alerts

### Phase 2

- [ ] Assembly tracking (components → product)
- [ ] Standard configurations
- [ ] Multi-stage pipeline
- [ ] Component allocation (free vs committed)

### Phase 3

- [ ] Accounting system integration
- [ ] Auto-pull orders
- [ ] Auto-check inventory on new orders

### Future

- [ ] Predictive ordering based on lead times
- [ ] Batch barcode scanning via camera
- [ ] Generate barcode labels

## Users

- 2-5 people, mostly non-technical
- Primary use: desktop
- Scanning: phone camera

## Tech Stack

- **Backend:** Python 3.12, FastAPI, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Infrastructure:** Docker Compose, GitHub Actions CI, Kubernetes
