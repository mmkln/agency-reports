# Frontend Architecture

This document defines the frontend architecture for implementing UC-001, UC-002, and UC-003.

The current product direction is Agency Client Portal Aggregator. Legacy DentalFlow demo pages are preserved only as visual/reference code under `src/pages/legacy`.

Business-domain ownership is defined in `docs/domain-ownership-model.md`.
Frontend route, shell, sidebar, and settings work must follow that model when
distinguishing personal user account data from agency-owned data and
company/workspace-owned data.

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
    clinic/
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
clinic
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
- The sidebar should show stable destinations for the current container, not every route the user has permission to access.
- Overview editors can reference tasks, requests, dashboards, and reports, but full management belongs to the owning surface.
- Internal tasks are not the client-facing work contract. Mature client-facing active work is represented by `ClientWorkItem` records that may reference a source task but own their own safe title, summary, status, target date, and publish state.
- `ClientWorkItem.publish_state` is the source of truth for whether work appears in client-facing active work. Existing task `visibility` / `client_visible` fields are legacy migration hints and internal filtering aids, not the mature client-facing publish contract.
- Client requests / needed-from-client records may reference internal tasks and client work items, but client responses must not mutate internal task status directly.
- Workflow records remain live source records in their repositories/services. Do not copy them into overview draft/publish snapshots unless a use case explicitly requires a frozen historical artifact.
- Draft/publish state belongs to authored overview content and report content, not to operational workflow records by default.
- If a workflow has status transitions, responses, history, filters, creation, or destructive actions, model it as a feature/domain service and route-level surface rather than an embedded section in another page.
```

## Navigation Context Architecture

Route access and sidebar navigation are separate concerns.

```text
Route access = may this viewer open this route?
Navigation context = should this destination appear in this container's sidebar?
```

The app shell should compose navigation from the current container:

```text
General agency container = agency-wide destinations such as Accounts, Tasks, Dashboards, Performance, and Reports.
Admin client workspace container = selected client destinations such as Overview, Projects, Actions, Requests, Results, Files, Access, Activity, and clinic setup where applicable.
Client portal container = client-facing destinations for the authenticated user's client membership.
Team operations container = agency team operational destinations.
```

Rules:

```text
- Do not derive sidebar items by listing every route a role can access.
- Use route metadata and workspace context to decide the sidebar container first.
- Keep direct route access available when authorized, but surface contextual routes only inside their owning container.
- Client/clinic-specific destinations should not appear in general agency navigation just because an agency admin has the capability to open them.
- App sidebar components should render a prepared navigation model; role, capability, client type, and workspace-context decisions belong in routing/navigation policy helpers.
```

## Mature Client Destination Architecture

Use cases define capabilities. Client routes define product destinations.

The mature client-facing portal is the Client Control Center described in `docs/research/client-control-center-information-architecture.md`.

Client routes should be treated as stable destinations:

```text
Overview = compact control home and previews
Action Needed = client obligations and blocker responses
Projects = client-visible workstreams and project detail
Reports & Dashboards = interpreted performance, source dashboard, report archive
Files & Links = deliverables, assets, shared links, reports, contracts
Requests = client-initiated asks that require agency triage
Updates = curated communication and decision history
Settings = client-side profile, company, team, notifications, security
```

Rules:

```text
- Do not recreate the old Dashboard, Performance, and Reports split as competing client navigation.
- Keep source dashboards, native performance, and monthly reports inside Reports & Dashboards.
- Keep Overview as a summary surface that links to owning destinations.
- Keep each destination backed by a domain read model and loaded through runtime.dataClient.read.
- Client route pages should compose widgets and features, not own repository filtering or visibility rules.
```

## Clinic Vertical Architecture

Clinic clients use the same Client Control Center safety model, but their destination hierarchy shifts from generic project status to patient acquisition, booking leakage, reputation, and compliance.

The clinic template is selected from the client record:

```text
client.type = clinic
```

Generic clients keep the mature agency destinations. Clinic clients receive clinic-specific destinations backed by clinic domain read models:

```text
Overview = clinic control home with acquisition, booking, reputation, compliance, and action previews
Patient Acquisition = aggregate funnel and source performance
Calls & Bookings = call handling, booking conversion, missed-call leakage, and follow-up gaps
Campaigns / Service Lines = clinic service-line performance, location context, capacity notes, and campaign status
Reputation = reviews, Google Business Profile health, review-response work, and trust signals
Compliance & Approvals = medical claim, ad policy, privacy/tracking, and approval history
Action Needed = clinic obligations, including approvals, access, assets, booking operations, and reputation responses
Reports = clinic performance reports and source dashboards
Files & Assets = approved deliverables, clinic assets, bios, credentials, and shared links
Settings / Access = client-side account, team, notifications, and access controls
```

Clinic architecture rules:

```text
- Keep clinic MVP data aggregate-only. Do not store patient names, patient emails, phone numbers, diagnoses, MRNs, DOBs, or patient-level attribution fields.
- Clinic read models must be domain-owned and route pages must stay thin.
- Client users may only read clinic records for their own client membership.
- Admin reads must still be scoped to the owning agency.
- Projects map to Campaigns / Service Lines for clinic clients. Internal task progress can support this, but it is not the primary client mental model.
- Reports & Dashboards map to clinic result destinations: Patient Acquisition, Calls & Bookings, Campaigns / Service Lines, Reputation, Compliance, and Reports.
- Compliance and approval records are first-class workflow records, not comment threads hidden inside tasks.
- Clinic actions remain separate from internal agency tasks; client responses must not mutate internal task status directly.
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

Mature destination mapping:

| Use case / capability | Mature client destination | Notes |
| --- | --- | --- |
| UC-001 - Client Overview / Status Hub | Overview | Preview-only control home; links to owning destinations. |
| UC-002 - Embedded Marketing Dashboard | Reports & Dashboards / Source Dashboard | External embed/link remains source-owned and visibility-gated. |
| UC-003 - Monthly Summary / Report Archive | Reports & Dashboards / Report Archive | Published reports only. Draft and ready reports stay admin-only. |
| UC-004 - Client Performance Dashboard | Reports & Dashboards / Current Performance | Business-value analytics before raw/source dashboards. |
| UC-005 - Needed From Client / Blockers | Action Needed | Client obligations and responses; does not directly mutate agency tasks. |
| Tasks / progress | Projects | Client-visible work items, not internal task management. |
| Updates / activity | Updates | Curated client updates, not raw internal activity. |
| Files / links | Files & Links | Explicitly client-visible resources only. |

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
src/pages/client/reports-dashboards/
src/widgets/client-reports-dashboards/
src/pages/client/reports/      # legacy redirect bridge
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
