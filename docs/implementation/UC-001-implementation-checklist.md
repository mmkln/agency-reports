# UC-001 Implementation Checklist - Client Overview / Status Hub

## Purpose

This document breaks UC-001 into implementation stages with explicit outcomes.

Use this checklist as the working delivery plan for:

```text
UC-001 - Client Overview / Status Hub
```

Source of truth:

```text
docs/use-cases/UC-001-client-overview-status-hub.md
docs/frontend-architecture.md
docs/implementation/UC-001-local-storage-architecture.md
```

## Current Technical Assumption

The project does not connect to a real backend yet.

Until backend integration exists:

```text
- data is stored in localStorage
- domain logic must not know about localStorage
- pages/widgets must not read localStorage directly
- domain services receive repository dependencies
- the repository adapter can later be replaced by Supabase/API without rewriting business logic
```

---

## Stage 0 - Product Scope And Architecture Baseline

**Result:** UC-001 scope is clear, and implementation cannot drift into dashboards, reports, chat, approvals, or project-management overbuild.

- [x] Keep UC-001 source spec in `docs/use-cases/UC-001-client-overview-status-hub.md`.
- [x] Keep frontend architecture rules in `docs/frontend-architecture.md`.
- [x] Document localStorage-as-adapter approach in `docs/implementation/UC-001-local-storage-architecture.md`.
- [x] Preserve rule: UC-001 is a status hub, not a BI/reporting/task-management platform.
- [x] Add a short product README section linking UC-001, UC-002, and UC-003 implementation docs.

**Acceptance check:**

- [x] A developer can identify what belongs to UC-001 and what belongs to future use cases without asking.

---

## Stage 1 - Domain Models, Statuses, And Visibility Rules

**Result:** The app has explicit domain vocabulary for UC-001 before UI workflows are built.

- [x] Add `client` status model.
- [x] Add `profile` role model.
- [x] Add `task` status model.
- [x] Add `update` visibility model.
- [x] Add `needed_from_client` status model.
- [x] Add `dashboard_link` status/provider model.
- [x] Add `report` status model.
- [x] Add `accessPolicy` for client isolation.
- [x] Add `visibilityPolicy` for client-visible records.
- [x] Add `taskPolicy` for allowed task status transitions.
- [x] Add lightweight unit tests for access, visibility, and task status transitions.
- [ ] Add a single exported domain model barrel only if imports become noisy.

**Acceptance check:**

- [x] Client-facing filtering can be tested without rendering React.
- [x] Internal records, draft reports, and hidden dashboard links have explicit rules.

---

## Stage 2 - Repository Port And Local Storage Adapter

**Result:** Business logic reads from repositories, not browser APIs.

- [x] Create localStorage repository adapter.
- [x] Create seed data for clients, projects, tasks, updates, dashboard links, reports, and needed actions.
- [x] Expose repositories through `portalRepository`.
- [x] Add simulated auth session for current local-storage viewer.
- [x] Define repository interface expectations in a README or JSDoc near the adapter.
- [x] Add reset/reseed dev utility for predictable manual QA.
- [x] Add validation for malformed localStorage payloads.
- [x] Add migration/version strategy for localStorage schema changes.

**Acceptance check:**

- [x] Replacing `portalRepository` with an API adapter requires no changes inside domain services.
- [x] No domain service imports `window`, `localStorage`, or browser storage helpers.

---

## Stage 3 - Client Overview Read Model

**Result:** A safe client-facing view model is produced from raw records.

- [x] Implement `clientOverviewService`.
- [x] Apply `canAccessClient` before returning overview data.
- [x] Filter active client-visible tasks.
- [x] Hide internal tasks.
- [x] Hide internal updates.
- [x] Select latest client-visible update.
- [x] Select visible needed-from-client items.
- [x] Select visible dashboard link.
- [x] Select latest published/archived report.
- [x] Add explicit handling for `dashboard.status = unavailable`.
- [x] Add explicit handling for missing client.
- [x] Add explicit handling for unauthorized client access.
- [x] Add tests proving draft/internal data never appears in the read model.

**Acceptance check:**

- [x] `clientOverviewService` answers all seven client questions from UC-001.
- [x] The service returns a complete empty-state-safe model even when optional data is missing.

---

## Stage 4 - Client Overview Page

**Result:** `client_user` can open one overview page and understand current status without chat.

Route:

```text
/client/overview
current browser route: /client/overview
```

Required UI sections:

- [x] `ClientOverviewHeader`
- [x] `CurrentFocusBlock`
- [x] `ProgressSummaryBlock`
- [x] `ActiveTasksBlock`
- [x] `LatestUpdateBlock`
- [x] `NeededFromClientBlock`
- [x] `DashboardOverviewBlock`
- [x] `LatestMonthlySummaryBlock`
- [x] Add final production-grade responsive layout pass.
- [x] Add loading state for future async repository/API usage.
- [x] Add access denied state.
- [x] Add dashboard unavailable state.
- [x] Add no dashboard yet state with expected availability copy.
- [x] Add no active tasks state.
- [x] Add no published report state.
- [x] Add dedicated empty overview state for newly created clients.
- [x] Add visual review against internal dashboard design canon.

**Acceptance check:**

- [x] A client can answer:
  - What are you doing now?
  - What has been completed?
  - What is active?
  - What is blocked?
  - What results are available?
  - What do you need from me?
  - Where is the dashboard/report?

---

## Stage 5 - Admin Client Setup Flow

**Result:** `agency_admin` can create the minimum client/account/project data needed for an overview.

Route target:

```text
/admin/clients
/admin/clients/new
```

- [x] Create admin clients list page.
- [x] Create new client form.
- [x] Store client name.
- [x] Store client logo URL.
- [x] Store portal slug.
- [x] Store primary contact name.
- [x] Store primary contact email.
- [x] Add client status selector.
- [x] Add local invitation token flow for client users.
- [x] Persist created client through repository adapter.
- [x] Show created client in admin list.

**Acceptance check:**

- [x] `agency_admin` can create a client without touching seed data manually.
- [x] New client records can later be consumed by `/client/overview`.

---

## Stage 6 - Admin Overview Editor

**Result:** `agency_admin` manually controls the client-facing overview state.

Route target:

```text
/admin/clients/:id/overview
```

Required editor blocks:

- [x] `ClientStatusEditor`
- [x] `CurrentFocusEditor`
- [x] `ProgressSummaryEditor`
- [x] `VisibleTasksManager`
- [x] `LatestUpdateEditor`
- [x] `NeededFromClientManager`
- [x] `DashboardLinkManager`
- [x] `LatestReportManager`
- [x] `PreviewAsClientButton`
- [x] `PublishOverviewButton`

Implementation tasks:

- [x] Admin can set client status.
- [x] Admin can add/edit/remove current focus items.
- [x] Admin can create projects.
- [x] Admin can set project progress.
- [x] Admin can create client-visible tasks.
- [x] Admin can create internal tasks that are hidden from client.
- [x] Admin can write latest client-facing update.
- [x] Admin can add needed-from-client items.
- [x] Admin can attach dashboard link placeholder.
- [x] Admin can attach latest published report placeholder.
- [x] Admin can preview exact client-safe read model.
- [x] Admin can publish overview state.

**Acceptance check:**

- [x] Admin preview matches what `client_user` sees.
- [x] Internal fields and draft records are unavailable in preview output.

---

## Stage 7 - Team Task Update Flow

**Result:** `agency_team` can update work status without controlling the whole client portal.

Route target:

```text
/team/tasks
```

Required components:

- [x] `AssignedTasksList`
- [x] `TaskStatusEditor`
- [x] `BlockerMarker`
- [x] `InternalNoteEditor`
- [x] `ClientVisibleToggle`

Implementation tasks:

- [x] Team member can see assigned tasks.
- [x] Team member can update allowed task statuses.
- [x] Disallowed status transitions are blocked by `taskPolicy`.
- [x] Team member can add internal notes.
- [x] Internal notes never render to client overview.
- [x] Team member can mark a task as blocked.
- [x] Team member can mark a task as waiting on client.
- [x] Team member can suggest a client-visible update.
- [x] Admin still controls final published client-facing state.

**Acceptance check:**

- [x] Task updates can change overview progress/status only through approved client-visible fields.
- [x] Internal operational complexity remains hidden.

---

## Stage 8 - Dashboard And Report Integration Boundaries

**Result:** UC-001 connects to dashboard/report records without absorbing UC-002 or UC-003.

Dashboard block:

- [x] Show dashboard name/status on overview.
- [x] Show `View Dashboard` action.
- [x] Show `Open Full Dashboard` action when `public_url` exists.
- [x] Do not render an empty iframe.
- [x] Show fallback when dashboard is unavailable.
- [x] Keep full dashboard page implementation inside UC-002.

Monthly summary block:

- [x] Show latest published report preview.
- [x] Link to report detail/archive route.
- [x] Hide draft and ready reports.
- [x] Show no published report state.
- [x] Keep full report archive implementation inside UC-003.

**Acceptance check:**

- [x] UC-001 overview references dashboard/report surfaces without becoming a dashboard/report module.

---

## Stage 9 - Permission And Security QA

**Result:** Client isolation and visibility rules are verified before expanding features.

Required checks:

- [x] `client_user` sees only records for their own `client_id`.
- [x] `client_user` cannot access another client's overview.
- [x] Internal tasks do not render.
- [x] Internal updates do not render.
- [x] Internal notes do not render.
- [x] Draft reports do not render.
- [x] Ready reports do not render.
- [x] Draft dashboards do not render.
- [x] Archived dashboards are not primary overview dashboards.
- [x] Access denied state does not leak another client name.

Test types:

- [x] Unit tests for policies.
- [x] Unit tests for `clientOverviewService`.
- [x] Unit tests for client dashboard/report boundary services.
- [x] Browser smoke test for `/client/overview`.
- [x] Manual/browser QA using a second seeded client id.

**Acceptance check:**

- [x] No client-facing route can leak internal or cross-client data from current repository data.

---

## Stage 10 - Persistence And Backend-Readiness

**Result:** The local implementation is ready to swap persistence later.

- [x] Keep repository adapter boundary stable.
- [x] Add API/Supabase adapter plan.
- [x] Map frontend entities to backend table names.
- [x] Confirm all writes go through repository methods.
- [x] Avoid localStorage-specific assumptions in UI.
- [x] Add async-compatible service path before backend migration if needed.
- [x] Document localStorage data reset behavior for QA.

**Acceptance check:**

- [x] Backend migration is mostly adapter work, not page/widget/domain rewrite.

---

## Stage 11 - Final UC-001 Acceptance

**Result:** UC-001 is MVP-complete.

Acceptance checklist from the use case:

- [x] `agency_admin` can create a client.
- [x] `agency_admin` can invite a `client_user` through a local invitation token.
- [x] `client_user` can log in through the simulated auth session.
- [x] `client_user` can only see their own client overview.
- [x] `agency_admin` can set client status.
- [x] `agency_admin` can add current focus.
- [x] `agency_admin` can create projects.
- [x] `agency_admin` can create client-visible tasks.
- [x] `agency_team` can update assigned task status.
- [x] Internal tasks are hidden from `client_user`.
- [x] Internal notes are hidden from `client_user`.
- [x] `agency_admin` can add latest update.
- [x] `agency_admin` can add needed-from-client items.
- [x] `client_user` can see needed-from-client items.
- [x] `client_user` can respond to needed-from-client items.
- [x] `agency_admin` can add dashboard embed/public link.
- [x] `client_user` can see dashboard block if available.
- [x] `agency_admin` can publish latest monthly summary.
- [x] `client_user` can see only published/archived reports.
- [x] `agency_admin` can preview overview as client.
- [x] `client_user` can understand status, progress, results, and next actions without messaging the agency.

---

## Do Not Build In UC-001

Keep these out of the UC-001 implementation:

- [ ] Chat/comments.
- [ ] Full approval workflow.
- [ ] File manager.
- [ ] Email notifications.
- [ ] Activity tracking.
- [ ] Advanced roles.
- [ ] Task dependencies.
- [ ] Kanban board.
- [ ] Native analytics integrations.
- [ ] Custom dashboard builder.
- [ ] AI summary engine.
- [ ] Billing/invoicing.
- [ ] Mobile app.

---

## Recommended Next Build Order

1. Finish Stage 1-3 tests.
2. Polish Stage 4 client overview.
3. Build Stage 5 admin client setup.
4. Build Stage 6 admin overview editor.
5. Build Stage 7 team task updates.
6. Complete Stage 8 dashboard/report overview boundaries.
7. Run Stage 9 security QA.
8. Confirm Stage 11 final acceptance.

