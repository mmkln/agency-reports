# Client Control Center Refactor Checklist

```text
Document type: Implementation checklist
Product area: Client-facing portal IA refactor
Target direction: Client Control Center
Primary reference: docs/research/client-control-center-information-architecture.md
Status: In progress
```

## Tracking Rule

Use this checklist as the implementation tracker for the mature client-side IA refactor.

Mark items as complete only after the code, tests, and documentation for that item are actually updated. If an item is deliberately deferred, leave it unchecked and add a short note under the relevant phase.

## Foundation Quality Gate

- [x] Re-audit new Client Control Center pages for thin route composition and `runtime.dataClient.read/write` loading/mutation boundaries.
- [x] Move Action Needed response mutation and activity recording into one `runtime.dataClient.write` operation.
- [x] Split oversized Action Needed widget composition into focused card, filter, formatting, and section modules.
- [x] Preserve domain-owned visibility and status logic in services instead of React components.
- [x] Add focused domain tests before continuing to later destinations.

## Phase 0 - Product Contract

- [x] Confirm `docs/research/client-control-center-information-architecture.md` is the current IA source of truth.
- [x] Update `docs/mvp-scope.md` to distinguish mature Client Control Center IA from the original MVP route list.
- [x] Update `docs/frontend-architecture.md` to state that client routes are product destinations and use cases are capabilities composed into destinations.
- [x] Update `docs/use-cases/README.md` with the mature IA relationship table.
- [x] Add cross-links from UC-001 through UC-005 to the Client Control Center IA reference where relevant.
- [x] Document the capability-to-destination mapping:
  - [x] UC-001 -> Overview
  - [x] UC-002 -> Reports & Dashboards / Source Dashboard
  - [x] UC-003 -> Reports & Dashboards / Report Archive
  - [x] UC-004 -> Reports & Dashboards / Current Performance
  - [x] UC-005 -> Action Needed
  - [x] Tasks/progress -> Projects
  - [x] Updates/activity -> Updates
  - [x] Files/links -> Files & Links

## Phase 1 - Route Architecture

- [x] Define mature client route metadata in `src/app/routing/routeDefinitions.jsx`.
- [x] Add `/client/action-needed`.
- [x] Add `/client/projects`.
- [x] Add project detail route or query-driven detail flow.
- [x] Add `/client/reports-dashboards`.
- [x] Add `/client/files-links`.
- [x] Add `/client/updates`.
- [x] Add `/client/settings`.
- [x] Remove `Performance`, `Dashboard`, and `Reports` as competing top-level client navigation items.
- [x] Decide whether legacy/deep routes redirect, remain hidden, or are deleted:
  - [x] `/client/performance`
  - [x] `/client/dashboard`
  - [x] `/client/reports`
- [x] Update route page exports in `src/app/routing/RoutePages.jsx`.
- [x] Update client navigation icons and labels to match the mature IA.
- [x] Preserve admin preview routes or replace them with mature destination previews.

## Phase 2 - Page Read Models

- [x] Add or rename domain service for `getClientOverviewPage`.
- [x] Add `getClientActionNeededPage`.
- [x] Add `getClientProjectsPage`.
- [x] Add `getClientProjectDetailPage`.
- [x] Add `getClientReportsDashboardsPage`.
- [x] Add `getClientFilesLinksPage`.
- [x] Add `getClientRequestsPage` if the current requests service does not already provide a mature read model.
- [x] Add `getClientUpdatesPage`.
- [x] Add `getClientSettingsPage` if settings is implemented as a real destination.
- [x] Ensure every client page reads through `runtime.dataClient.read`.
- [x] Ensure page services return client-safe view models rather than raw repository records.
- [ ] Add access denied, empty, loading, and unavailable states for each page read model.
- [x] Verify client isolation is enforced in each page read model.

## Phase 3 - Reports & Dashboards

- [x] Create `src/pages/client/reports-dashboards`.
- [x] Create `src/widgets/client-reports-dashboards`.
- [x] Build `ReportsDashboardsPage` as a thin route composition page.
- [x] Build `ResultsHeader`.
- [x] Build `CurrentPerformanceSection` from UC-004 data.
- [x] Build `SourceDashboardSection` from UC-002 data.
- [x] Build `ReportArchiveSection` from UC-003 data.
- [x] Build `ResultsTrustContext`.
- [x] Move or reuse executive summary, hero metric, KPI cards, goals, trend, funnel/channel breakdown, insights, what-we-did, and next-action UI from `widgets/client-performance`.
- [x] Move or reuse iframe/fallback/open-link UI from `widgets/dashboard-embed`.
- [x] Move or reuse latest report/archive UI from the client reports implementation.
- [x] Ensure interpreted performance appears before raw/source dashboards when performance data exists.
- [x] Ensure source dashboard fallback states remain controlled.
- [x] Ensure draft/ready reports are hidden.
- [x] Ensure draft/unpublished dashboards are hidden.
- [x] Ensure stale/low-confidence data is visibly labeled.
- [x] Update Overview CTA to point to Reports & Dashboards.
- [x] Update admin preview links for performance/dashboard/report surfaces.

## Phase 4 - Action Needed

- [x] Create `src/pages/client/action-needed`.
- [x] Create `src/widgets/client-action-needed`.
- [x] Build `ActionNeededTabs`.
- [x] Build `ActionNeededList`.
- [x] Build `ActionNeededCard`.
- [x] Build action detail panel or dialog.
- [x] Support action types:
  - [x] approval
  - [x] feedback
  - [x] file needed
  - [x] access needed
  - [x] question
  - [x] confirmation
- [ ] Support action statuses:
  - [x] pending
  - [x] due soon
  - [x] overdue
  - [x] answered
  - [x] approved
  - [x] changes requested
  - [x] completed
  - [x] cancelled
- [x] Map existing `needed_from_client` records into the Action Needed read model.
- [ ] Decide how internal `waiting_client` tasks create or reference client-facing actions.
- [x] Ensure client action responses do not directly mutate internal agency task status.
- [x] Keep Overview as an urgent-action preview only.
- [x] Keep Reports & Dashboards action references contextual only.
- [x] Add action lifecycle tests.

## Phase 5 - Projects / Work

- [x] Create `src/pages/client/projects`.
- [x] Create project detail page or overlay.
- [x] Create `src/widgets/client-projects`.
- [x] Define `ClientVisibleWorkItem` mapping from existing projects/tasks.
- [x] Build project list cards.
- [ ] Build simple filters:
  - [x] Active
  - [x] Waiting on me
  - [x] Completed
  - [x] Archived
- [x] Build project detail header.
- [x] Build project client-safe summary section.
- [x] Build milestones/timeline section.
- [x] Build active client-visible work section.
- [x] Build project-specific waiting-on-you section.
- [x] Build client-relevant blockers section.
- [x] Build deliverables section.
- [x] Build related reports/dashboard links section.
- [x] Build project updates section.
- [x] Ensure internal notes, assignee discussion, workload, time spent, profitability, and internal QA never render.
- [x] Update Overview active work preview to link to Projects or Project Detail.

## Phase 6 - Files & Links

- [x] Decide whether a new `files_links` repository/entity is required.
- [x] Define `ClientFileLink` model if required.
- [x] Add seed data for files/links if implementing the destination.
- [x] Add repository adapter methods for files/links if required.
- [x] Create `src/pages/client/files-links`.
- [x] Create `src/widgets/client-files-links`.
- [x] Build tabs:
  - [x] Deliverables
  - [x] Client uploads
  - [x] Reports
  - [x] Brand assets
  - [x] Shared links
  - [x] Contracts/admin
  - [x] Archived
- [x] Build file/link cards.
- [x] Enforce explicit client visibility.
- [x] Add Overview files/links preview.
- [x] Add Project Detail project-specific files/links.

## Phase 7 - Updates

- [x] Create `src/pages/client/updates`.
- [x] Create `src/widgets/client-updates`.
- [x] Define mature `ClientUpdate` read model.
- [x] Decide which existing updates/activity events are displayable as curated updates.
- [x] Build update feed filters or grouping.
- [ ] Support update types:
  - [x] weekly update
  - [x] milestone update
  - [x] launch update
  - [x] issue update
  - [x] report published
  - [x] approval completed
  - [x] decision recorded
- [x] Build update card with what changed, what next, client action, and related links.
- [x] Ensure raw internal activity stays hidden.
- [x] Update Overview latest update preview to link to Updates.

## Phase 8 - Requests Separation

- [x] Audit current `ClientRequestsPage` behavior.
- [x] Define the mature distinction between Action Needed and Requests in code comments/docs.
- [x] Ensure Requests means client-initiated asks.
- [x] Add or update request statuses:
  - [x] submitted
  - [x] under review
  - [x] waiting on agency
  - [x] waiting on client
  - [x] accepted
  - [x] declined
  - [x] converted
  - [x] completed
  - [x] archived
- [x] Ensure client-created requests require agency review before becoming internal work.
- [ ] Link request clarification needs to Action Needed where appropriate.
- [x] Update admin request management to support triage.
- [x] Update client request UI copy so it does not read like agency task management.
- [x] Add request workflow tests.

## Phase 9 - Settings

- [x] Create `src/pages/client/settings`.
- [x] Decide minimum mature settings scope.
- [x] Add profile section.
- [x] Add company/team members section if supported by memberships.
- [x] Add notification preferences placeholder or implementation.
- [x] Add security/account section if supported by auth model.
- [x] Ensure settings does not expose agency admin controls.

## Phase 10 - Overview Cleanup

- [x] Re-audit `src/pages/client/overview`.
- [ ] Keep only preview-level sections:
  - [x] status
  - [x] top action needed
  - [x] active projects/work preview
  - [x] recent update
  - [x] reports & dashboards preview
  - [x] files & links preview
  - [ ] contact / ask question
- [x] Remove or avoid full analytics ownership from Overview.
- [x] Remove or avoid full report archive ownership from Overview.
- [x] Remove or avoid full request lifecycle ownership from Overview.
- [x] Remove or avoid full file manager ownership from Overview.
- [x] Ensure every Overview preview links to its owning destination.
- [x] Verify Overview can be understood in 10-20 seconds.

## Phase 11 - Admin Alignment

- [x] Update admin client workspace IA to match mature client destinations.
- [x] Add or rename admin workspace tabs:
  - [x] Overview
  - [x] Actions
  - [x] Projects
  - [x] Reports & Dashboards
  - [x] Files & Links
  - [x] Requests
  - [x] Updates
  - [x] Access
  - [x] Activity
- [ ] Ensure admin can control every client-visible surface.
- [ ] Ensure preview-as-client works for major destinations.
- [x] Preserve publishing/draft boundaries for dashboards, reports, updates, and files.
- [x] Update admin headers/actions to avoid isolated query-param pages where workspace context is needed.

## Phase 12 - Tests And Verification

- [x] Add or update domain tests for client isolation across all mature destinations.
- [x] Add or update tests for hidden draft reports.
- [x] Add or update tests for hidden draft/WIP dashboards.
- [x] Add or update tests for internal notes hidden from client read models.
- [x] Add or update tests for action visibility.
- [x] Add or update tests for project/work visibility.
- [x] Add or update tests for request triage status.
- [x] Add or update tests for updates visibility if implemented.
- [x] Add or update tests for files/links visibility if implemented.
- [x] Add e2e coverage for mature client navigation.
- [x] Add e2e coverage for Action Needed response flow.
- [x] Add e2e coverage for Projects and Project Detail.
- [x] Add e2e coverage for Reports & Dashboards.
- [x] Add e2e coverage for draft report/dashboard protection.
- [x] Add e2e coverage for Files & Links if implemented.
- [ ] Add e2e coverage for Requests submission/triage if implemented.
- [x] Add e2e coverage for Updates if implemented.
- [x] Run `npx eslint src`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run browser/e2e verification when the mature client-facing workflows are implemented.

Implemented domain coverage so far:

- [x] Client isolation for Action Needed, Projects, and Reports & Dashboards read models.
- [x] Hidden draft/WIP dashboard protection in Reports & Dashboards.
- [x] Hidden draft report protection in Reports & Dashboards.
- [x] Action Needed visibility, due-soon/overdue counts, and action-type mapping.
- [x] Project/work visibility for published client work items only.
- [x] Files/links visibility for explicit client-visible active resources only.
- [x] Admin Files & Links management covers create, edit, archive, client visibility, internal visibility, and unavailable states.
- [x] Admin Reports & Dashboards workspace hub consolidates current performance, source dashboards, and report archive entry points.
- [x] Updates visibility for curated client-visible updates only.
- [x] Admin Updates management covers create, edit, hide, client-visible publishing, and internal-only updates separately from activity logs.
- [x] Mature client navigation route metadata and browser sidebar exclude legacy Dashboard, Performance, and Reports destinations.
- [x] Client users are blocked from admin Client Control Center workspace routes.
- [x] Browser visibility guard covers internal files/links, internal updates, draft reports, draft source dashboards, and draft performance periods on mature client routes.
- [x] Reports & Dashboards trust context covers data freshness, confidence, source mode, source dashboard status, latest report period, source notes, and attribution caveats.
- [x] Dashboard, performance, and report preview routes now render the mature Reports & Dashboards destination instead of separate legacy client pages.
- [x] Client-initiated requests remain separate from agency Action Needed records and do not create internal tasks directly.
- [x] Admin request triage updates client-submitted request status and agency response with audit history.
- [x] Action Needed detail dialog supports client response, approval, request-changes decisions, response history, why-needed, impact, and related links.
- [x] Action Needed approval e2e verifies client approval updates the needed action without mutating linked internal task status.
- [x] Projects read model supports client-facing filters, timeline milestones, client-relevant blockers, related results links, project files, and curated project updates.
- [x] Projects e2e verifies project detail content and hidden internal updates.
- [x] Settings isolation and membership-derived access/profile data.
- [x] Mature client route pages use `runtime.dataClient.read` around domain read models instead of direct repository access.
- [x] Mature dynamic client route headers use `runtime.dataClient.read` around domain read models instead of direct repository access.
- [x] Client read models return composed page data for widgets instead of exposing raw persistence records to route pages.
- [x] Overview cleanup keeps action responses, report archive, source dashboards, and file management on their owning destinations.

## Definition Of Done

- [ ] Client navigation matches the Client Control Center IA.
- [x] Overview is a compact control home.
- [x] Action Needed owns client obligations.
- [x] Projects owns visible workstreams.
- [x] Reports & Dashboards owns current performance, source dashboard, and report archive.
- [x] Files & Links owns deliverables/resources.
- [ ] Requests owns client-initiated asks.
- [ ] Updates owns curated history.
- [ ] Settings owns client account controls.
- [x] No client route exposes internal notes, draft reports, WIP dashboards, internal task noise, workload, time spent, or profitability.
- [x] Domain services provide client-safe read models per page.
- [x] Pages are thin route composition layers.
- [x] Documentation, tests, and build are updated.
