# Frontend Architecture

This document defines the frontend architecture for implementing UC-001, UC-002, and UC-003.

The current product direction is Agency Client Portal Aggregator. Legacy DentalFlow demo pages are preserved only as visual/reference code under `src/pages/legacy`.

## Architecture Style

Use a pragmatic Feature-Sliced / domain-first structure:

```text
src/
  app/
    routing/
    providers/

  pages/
    public/
    auth/
    client/
    admin/
    team/
    legacy/

  widgets/
    client-overview/
    dashboard-embed/
    reports/

  features/
    client-overview/
    dashboard-links/
    reports/
    tasks/
    needed-from-client/

  entities/
    client/
    client-work-item/
    profile/
    project/
    task/
    update/
    dashboard-link/
    report/
    needed-from-client/

  domain/
    policies/
    services/

  shared/
    ui/
    layout/
    icons/
    charts/
    lib/
```

## Layer Responsibilities

### app

Owns application composition:

```text
- route registry
- app providers
- route guards
- layout selection
```

### pages

Pages are route-level composition only.

Pages should:

```text
- call domain services
- assemble widgets
- pass data down
```

Pages should not:

```text
- implement permission checks inline
- filter internal/client-visible records directly
- contain reusable business widgets
```

Pages also should not become mixed ownership surfaces. When a route starts combining authored publishing, operational tasks, client requests, dashboard management, report publishing, access control, and activity history, split those jobs into owning pages and connect them through summaries or links.

### widgets

Widgets are large screen blocks built from entities and shared UI.

Examples:

```text
ClientHeader
CurrentFocusBlock
ProgressSummaryBlock
DashboardEmbedFrame
ReportArchiveList
ReportReader
```

### features

Features are user actions or workflow units.

Examples:

```text
publish overview
preview as client
manage dashboard link
publish report
update task status
resolve needed action
```

Feature folders may begin as README placeholders, then grow into forms/actions/hooks.

### entities

Entities own business object definitions, status enums, fixtures, and small entity-specific UI.

Entities for MVP:

```text
client
client-work-item
profile
project
task
update
dashboard-link
report
needed-from-client
```

### domain/policies

Policies centralize rules that must not be duplicated in UI.

Examples:

```text
canAccessClient
isClientVisible
isDashboardVisibleToClient
isReportVisibleToClient
```

Client isolation and visibility rules belong here.

### domain/services

Services produce safe view models for pages and widgets.

Services should:

```text
- apply policies
- filter hidden records
- sort records
- select latest/primary records
- hide drafts/internal data from client-facing consumers
```

Today services may use fixtures. Later they can call Supabase/API without rewriting UI.

## Product Ownership Boundaries

Treat the main admin product surfaces as ownership boundaries:

```text
Client workspace = client-scoped container and navigation context
Overview = authored client-facing communication and publish state
Tasks = agency internal execution workflow
Client Work Items = curated client-facing representation of selected work
Requests = client dependency workflow
Dashboards = external dashboard links and embed state
Reports = monthly report publishing and archive
Access = members and invitations
Activity = audit/history
```

Rules:

```text
- Client-scoped pages should share the client workspace header/tabs so context does not reset between surfaces.
- Overview editors can reference tasks, requests, dashboards, and reports, but full management belongs to the owning surface.
- Internal tasks are not the client-facing work contract. Mature client-facing active work is represented by `ClientWorkItem` records that may reference a source task but own their own safe title, summary, status, target date, and publish state.
- `ClientWorkItem.publish_state` is the source of truth for whether work appears in client-facing active work. Existing task `visibility` / `client_visible` fields are legacy migration hints and internal filtering aids, not the mature client-facing publish contract.
- Client requests / needed-from-client records may reference internal tasks and client work items, but client responses must not mutate internal task status directly.
- Workflow records remain live source records in their repositories/services. Do not copy them into overview draft/publish snapshots unless a use case explicitly requires a frozen historical artifact.
- Draft/publish state belongs to authored overview content and report content, not to operational workflow records by default.
- If a workflow has status transitions, responses, history, filters, creation, or destructive actions, model it as a feature/domain service and route-level surface rather than an embedded section in another page.
```

### shared

Shared contains generic UI and infrastructure only.

Allowed:

```text
Panel
Card
Button
Badge
ProgressBar
TablePanel
Icon
layout primitives
```

Not allowed:

```text
ReportCard with product behavior
ClientOverviewBlock
DashboardStatus rules
Report visibility rules
```

Those belong to entities, widgets, or domain.

## Use Case Mapping

### UC-001 - Client Overview / Status Hub

Primary files:

```text
docs/use-cases/UC-001-client-overview-status-hub.md
src/pages/client/overview/
src/widgets/client-overview/
src/domain/services/clientOverviewService.js
src/domain/policies/accessPolicy.js
src/domain/policies/visibilityPolicy.js
```

### UC-002 - Embedded Marketing Dashboard

Primary files:

```text
docs/use-cases/UC-002-embedded-marketing-dashboard.md
src/pages/client/dashboard/
src/pages/admin/dashboard-links/
src/widgets/dashboard-embed/
src/entities/dashboard-link/
src/domain/services/dashboardLinkService.js
src/domain/policies/dashboardPolicy.js
```

### UC-003 - Monthly Summary / Report Archive

Primary files:

```text
docs/use-cases/UC-003-monthly-summary-report-archive.md
src/pages/client/reports/
src/pages/admin/reports/
src/widgets/reports/
src/entities/report/
src/domain/services/reportService.js
src/domain/policies/reportPolicy.js
```

## Critical Rules

```text
1. client_user must only see records for their own client_id.
2. Internal tasks, internal updates, internal notes, and draft reports must never render for client_user.
3. Client-facing active work must come from published `ClientWorkItem` records in the mature architecture, not directly from `Task`.
4. Dashboard embeds are external links/iframes only in V1.
5. Reports are human-written summaries in MVP; do not build AI report generation first.
6. Overview page aggregates status, progress, needed actions, dashboard, and latest report; it should not become a full analytics page.
7. Domain services return safe data to UI.
8. Shared UI stays product-agnostic.
```

## Legacy Pages

Existing demo pages live under:

```text
src/pages/legacy
```

They are hidden from primary navigation and may be removed later when the product-specific UI fully replaces them.
