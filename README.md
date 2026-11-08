# Agency Client Portal Aggregator

Client-facing portal layer for marketing agencies. The product aggregates client status, progress, visible tasks, dashboard links, monthly summaries, and needed client actions without replacing analytics, CRM, reporting, or project-management tools.

The active implementation is API-backed workspace administration and Growth
Review, Lead Report and Executive dashboards. Older portal/local-storage use-case
documents below retain product history; unused implementations have been removed.
Use [Frontend Architecture](docs/frontend-architecture.md) for current runtime rules.

## Product Documentation

- [UC-001 - Client Overview / Status Hub](docs/use-cases/UC-001-client-overview-status-hub.md)
- [UC-002 - Embedded Marketing Dashboard](docs/use-cases/UC-002-embedded-marketing-dashboard.md)
- [UC-003 - Monthly Summary / Report Archive](docs/use-cases/UC-003-monthly-summary-report-archive.md)
- [UC-004 - Client Performance Dashboard](docs/use-cases/UC-004-client-performance-dashboard.md)
- [Frontend Architecture](docs/frontend-architecture.md)
- [Design System](docs/design-system.md)
- [UC-001 Local Storage Architecture (Historical)](docs/implementation/UC-001-local-storage-architecture.md)
- [UC-001 Acceptance Report](docs/implementation/UC-001-acceptance-report.md)
- [UC-002 Acceptance Report](docs/implementation/UC-002-acceptance-report.md)
- [UC-003 Acceptance Report](docs/implementation/UC-003-acceptance-report.md)
- [Backend Readiness Plan](docs/implementation/backend-readiness-plan.md)

## Development

```bash
npm install
npm run start:local -- --port 5174 --strictPort
```

Useful checks:

```bash
npm run test
npm run lint
npm run build
```

Deploy to GitHub Pages:

```bash
npm run go
```
