# Enterprise PMO Dashboard

## Overview
A comprehensive, enterprise-grade Portfolio Management Office (PMO) dashboard for executives, PMO teams, and project managers. It monitors project health, financial performance (SPI/CPI), resource utilization, and strategic alignment across a portfolio of ~35 mock projects.

## Tech Stack
- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Build Tool:** Vite 6.3.5
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS 4
- **Data Visualization:** Recharts 2
- **UI Components:** Radix UI primitives + Lucide React icons
- **Routing:** React Router 7

## Project Structure
- `src/app/components/` — Reusable UI components (design system + Radix UI based)
- `src/app/pages/` — Top-level route components (ExecutiveOverview, PortfolioDeepDive, etc.)
- `src/app/contexts/` — React Context providers (e.g., LanguageContext for i18n)
- `src/app/data/mockData.ts` — Mock data generation and interfaces
- `src/styles/` — Global CSS, Tailwind config, and theme definitions
- `index.html` — SPA entry point

## Development
- **Start:** `pnpm run dev` (served on port 5000)
- **Build:** `pnpm run build` (outputs to `dist/`)

## Deployment
- **Target:** Static site
- **Build command:** `pnpm run build`
- **Public directory:** `dist`

## Key Features
- Executive Overview (CEO View): High-level KPIs and strategic alignment
- Portfolio Deep Dive (PMO View): Failing projects and risk concentration
- Project Manager View: Project metrics, milestones, task-level blockers
- Component Library: Design system showcase
