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
- `src/app/data/mockData.ts` — Mock data generation and interfaces (includes governance metadata)
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
- Portfolio Deep Dive (PMO View): Failing projects and risk concentration with National/Council classification filter
- Project Manager View: Project metrics, milestones, task-level blockers with dependency risk indicators
- Project Details View: Task-level bottleneck identification with governance section
- Component Library: Design system showcase
- **Interactive Filters:** All three drill-down pages (Portfolio Deep Dive, Project Manager, Project Details) have a shared FilterBar that filters by Portfolio, Program, Status, Project Manager, and Strategic Initiative. The `filterProjects` utility in `FilterBar.tsx` handles filtering logic centrally. Empty filter results show a clear empty-state message.

## Governance & Classification Features
The data model includes governance metadata for each project:
- **Stakeholders**: Internal and external stakeholder lists per project
- **Dependencies**: Inter-project dependencies with relationship type (Sequential/Parallel/Blocking) and risk level (High/Medium/Low)
- **Classification**: Each project classified as National (green badge) or Council (blue badge) with DG Code and NSC Code

### Where governance data appears:
- **Project Details**: Governance section showing stakeholders, dependencies table, and classification
- **Project Manager View**: Dependency risk indicator badge and classification badge next to project selector
- **Portfolio Deep Dive**: Classification filter buttons (All/National/Council) that update all KPIs, charts, and tables; DG/NSC codes in project attention table
- **Executive Overview & Executive Portfolio**: Classification badges and DG/NSC codes on project cards in tables
