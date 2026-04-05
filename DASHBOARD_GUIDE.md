# PMO Dashboard - Enterprise Portfolio Management

## Overview
A comprehensive enterprise-grade PMO (Project Management Office) Dashboard designed for executives, PMO teams, and project managers. Built with React, TypeScript, Tailwind CSS, and Recharts.

## Key Features

### 1. Executive Portfolio Overview (CEO View)
**Purpose:** "Are we on track? Where should I intervene?"

**KPIs:**
- % On Track / At Risk / Critical
- Portfolio SPI & CPI (Schedule & Cost Performance Index)
- Delivery Confidence
- Value Delivered vs Planned
- Budget Variance

**Visualizations:**
- Project status distribution (Pie chart)
- SPI & CPI trends (6-month line chart)
- On-Track % trend
- Budget burn vs progress
- Strategic alignment by initiative
- Top 5 over-budget projects
- Top 5 delayed projects

### 2. Portfolio Deep Dive (PMO View)
**Purpose:** "Which projects are failing and why?"

**Features:**
- Project Performance Matrix (SPI vs CPI scatter plot)
  - Bubble size = Budget
  - Color = RAG status
  - Interactive tooltips
- Risk Concentration Heatmap (Impact × Probability)
- Risk type distribution
- Resource utilization by role
- Over-allocation alerts
- Milestone adherence trend
- Forecast accuracy tracking
- High-risk projects table (6+ open risks)

### 3. Project Manager View
**Purpose:** "What do I need to fix this week?"

**KPIs:**
- SPI, CPI, SV, CV
- Milestone Adherence %
- Delivery Confidence

**Sections:**
- Planned vs Actual progress curve
- Key milestones timeline
- Budget vs Actual vs Forecast
- Effort utilization by role
- Open Risks (with impact/probability)
- Open Issues (with severity)
- Dependencies health
- Change requests with impact

### 4. Project Detail Drill-Down
**Purpose:** "Where exactly is the bottleneck?"

**Components:**
- Sprint/Task burndown chart
- Blocked tasks table
- Change history log
- Next actions with owner & due date
- Team performance metrics

### 5. Component Library
A complete design system showcase including:
- Color system (RAG + neutrals + accents)
- KPI cards (3 status variations)
- Status badges (9 types)
- Chart components (Line, Bar, Pie)
- Data tables
- Filter bar
- Typography scale
- Spacing system (8px grid)
- 12-column grid system

## Design System

### Colors
**Status (RAG):**
- Green (#10b981): Healthy/On Track
- Amber (#f59e0b): Attention/At Risk
- Red (#ef4444): Critical/Intervention Required

**Neutrals:**
- Gray 900 (#111827): Primary text
- Gray 600 (#4b5563): Secondary text
- Gray 200 (#e5e7eb): Borders
- Gray 50 (#f9fafb): Backgrounds

**Accents:**
- Blue 600 (#2563eb): Primary actions
- Blue 500 (#3b82f6): Interactive elements

### Layout
- Desktop-first (1440px viewport)
- 12-column grid system
- 8px spacing increment
- 256px sidebar width
- High-density yet uncluttered

### Components

#### KPICard
Props: title, value, trend, trendValue, status, subtitle, icon, tooltip

#### StatusBadge
Props: status, size (sm/md/lg)
Supports: on-track, at-risk, critical, completed, delayed, upcoming, open, mitigated, closed

#### ChartContainer
Wraps Recharts with consistent styling, title, subtitle, and action buttons

#### DataTable
Generic table component with column configuration and row click handlers

#### FilterBar
Multi-select filters for Portfolio, Program, Status, PM, Strategic Initiative

## Data Model

### Project (35 mock projects)
- Basic info: id, name, status, portfolio, program, PM
- Performance: SPI, CPI, SV, CV, progress %
- Financial: budget, spent, forecast
- Dates: start, end, actualEnd
- Quality: deliveryConfidence, milestoneAdherence
- Issues: openRisks, openIssues, blockedTasks

### Risk
- Project linkage, title, type
- Impact & probability (low/medium/high/critical)
- Status, owner

### Resource Utilization
- Role, capacity, allocated, available

## Navigation Flow
Portfolio → Project → Task (drill-down)

### Routes
- `/` - Executive Overview
- `/portfolio` - Portfolio Deep Dive
- `/project-manager` - Project Manager View
- `/project-details?id=PRJ-XXX` - Project Details
- `/components` - Component Library

## Interactions

### Global Filters
Available on every page:
- Time Period
- Portfolio/Program
- Project
- Project Manager
- Status
- Strategic Initiative

### Cross-filtering
- Click projects in tables to drill down
- Hover for tooltips with definitions
- Last refresh timestamp

### Drill-down Flow
1. Executive sees red project in Top 5 table
2. Clicks → Portfolio Deep Dive for risk analysis
3. Clicks project → Project Manager View for details
4. Clicks "View Full Details" → Project Details for task-level

## Technical Stack
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Recharts 2** - Data visualization
- **Lucide React** - Icon system
- **Vite** - Build tool

## Mock Data
- 35 projects (23 on-track, 8 at-risk, 4 critical)
- 20+ edge cases included:
  - Over-budget projects (PRJ-006, PRJ-016, PRJ-026)
  - Delayed projects (PRJ-004, PRJ-007)
  - Over-allocated resources (Senior Dev, DevOps)
  - High-risk initiatives (12+ open risks)

## Accessibility
- WCAG AA compliant contrast ratios
- Semantic HTML
- Keyboard navigation support
- ARIA labels on interactive elements
- Tooltips for KPI definitions

## Responsive Design
Desktop-first with high information density optimized for 1440px+ screens. Suitable for executive dashboards displayed on large monitors or projected in boardrooms.

## Future Enhancements
- Dark theme variant (structure in place)
- Real-time data integration
- Export to PDF/Excel
- Email alerts for critical projects
- Customizable KPI thresholds
- Historical comparison view
- What-if scenario modeling
- Resource optimization recommendations
- Predictive analytics using ML
