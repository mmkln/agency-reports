# UC-005 Implementation Checklist - Needed From Client / Blockers

```text
Document type: Implementation Checklist
Product: Agency Client Portal Aggregator
Use case ID: UC-005
Use case name: Needed From Client / Blockers
Status: Ready for implementation planning
Primary use case spec: docs/use-cases/UC-005-needed-from-client-blockers.md
Related use cases: UC-001, UC-004
```

## Implementation Rule

Before implementing any UC-005 screen, service, entity, or UI block, read:

```text
1. docs/use-cases/UC-005-needed-from-client-blockers.md
2. docs/use-cases/UC-001-client-overview-status-hub.md
3. docs/frontend-architecture.md
4. docs/design/README.md
```

UC-005 owns the `needed_from_client` lifecycle.

UC-001 and UC-004 may display summaries of these records, but must not own the request workflow.

## Current Technical Assumption

The project does not connect to a real backend yet.

Until backend integration exists:

```text
- data is stored in localStorage
- domain logic must not know about localStorage
- pages/widgets must not read localStorage directly
- domain services receive repository dependencies
- route pages should use runtime data clients around domain services
- entity IDs must be string UUIDs
```

## Stage 0 - Scope And Ownership

**Goal:** Prevent UC-005 from drifting into chat, approvals, file management, or generic task management.

**Result:** The team knows exactly what UC-005 owns and what it only references.

### Tasks

- [x] Create UC-005 use case spec.
- [x] Define UC-005 as the owner of `needed_from_client` lifecycle.
- [x] Keep Client Overview as a compact summary only.
- [x] Keep Client Performance Dashboard as an analytics context surface only.
- [ ] Update navigation/product docs after routes are implemented.
- [ ] Confirm whether agency_team can create requests or only update assigned/request-related requests.

### Completion Criteria

- [ ] A developer can explain where request lifecycle editing belongs.
- [ ] Overview and analytics pages do not duplicate request lifecycle controls.

## Stage 1 - Entity Model And Policies

**Goal:** Make request lifecycle, status transitions, and visibility explicit in domain code.

**Result:** UC-005 can be tested without rendering React.

### Tasks

- [ ] Extend `needed_from_client` model with backend-ready optional fields:
  - [ ] `priority`
  - [ ] `owner_name`
  - [ ] `client_response`
  - [ ] `client_responded_at`
  - [ ] `client_responded_by`
  - [ ] `resolved_at`
  - [ ] `resolved_by`
  - [ ] `cancelled_at`
  - [ ] `cancelled_by`
  - [ ] `internal_notes`
- [ ] Keep existing MVP fields compatible:
  - [ ] `id`
  - [ ] `client_id`
  - [ ] `title`
  - [ ] `description`
  - [ ] `status`
  - [ ] `due_date`
  - [ ] `related_link`
  - [ ] `created_at`
  - [ ] `updated_at`
- [ ] Ensure IDs are string UUIDs.
- [ ] Centralize request status metadata:
  - [ ] `pending`
  - [ ] `answered`
  - [ ] `resolved`
  - [ ] `cancelled`
- [ ] Add priority metadata if needed:
  - [ ] `low`
  - [ ] `medium`
  - [ ] `high`
- [ ] Add request status transition policy:
  - [ ] `pending -> answered`
  - [ ] `pending -> resolved`
  - [ ] `pending -> cancelled`
  - [ ] `answered -> resolved`
  - [ ] `answered -> pending`
  - [ ] `answered -> cancelled`
  - [ ] `resolved -> pending`
  - [ ] `cancelled -> pending`
- [ ] Add client response policy:
  - [ ] client can only respond to own pending requests
  - [ ] client response moves status to `answered`
  - [ ] client cannot resolve or cancel directly
- [ ] Update visibility policy:
  - [ ] cancelled hidden from client active summaries
  - [ ] internal notes hidden from client routes
  - [ ] access denial uses existing client isolation behavior
- [ ] Add unit tests for statuses, transitions, and visibility.

### Completion Criteria

- [ ] Domain tests prove client isolation.
- [ ] Domain tests prove internal notes are hidden.
- [ ] Domain tests prove cancelled records are not shown in client summaries.
- [ ] Domain tests prove client response changes status to `answered`.

## Stage 2 - Repository And Seed Data

**Goal:** Make the localStorage adapter support the full UC-005 data shape without leaking storage details upward.

**Result:** Request data can be created, updated, resolved, cancelled, and rendered through repository-backed services.

### Tasks

- [ ] Confirm repository adapter supports `neededFromClient` CRUD/upsert.
- [ ] Add repository methods if missing:
  - [ ] `listByClientId`
  - [ ] `findById`
  - [ ] `upsert`
  - [ ] `remove` only if needed
- [ ] Add localStorage schema migration if new fields require normalization.
- [ ] Add seed data examples:
  - [ ] pending request
  - [ ] answered request
  - [ ] resolved request
  - [ ] cancelled request
  - [ ] internal notes on admin-only request
- [ ] Ensure reset/reseed dev utility handles new fields.

### Completion Criteria

- [ ] Existing UC-001 and UC-004 pages still render active requests.
- [ ] Repository adapter can later be replaced by API/Supabase without page rewrites.

## Stage 3 - Domain Services

**Goal:** Put request workflow logic behind domain services.

**Result:** UI components call explicit use-case operations rather than mutating records directly.

### Tasks

- [ ] Create or extend admin request service:
  - [ ] list client requests
  - [ ] create request
  - [ ] update request
  - [ ] resolve request
  - [ ] cancel request
  - [ ] reopen request
- [ ] Create client request service:
  - [ ] list visible own requests
  - [ ] get request detail
  - [ ] submit response
- [ ] Add validation:
  - [ ] required title
  - [ ] safe client-facing description
  - [ ] valid status transition
  - [ ] valid due date
  - [ ] valid related URL
  - [ ] no client response to non-pending request
- [ ] Add read models:
  - [ ] admin list item
  - [ ] admin detail
  - [ ] client list item
  - [ ] client detail
  - [ ] overview summary item
- [ ] Add activity events if current activity service supports it.

### Completion Criteria

- [ ] UI can render admin/client request pages from service read models.
- [ ] Services reject unauthorized or invalid operations.
- [ ] Services never return internal notes to client read models.

## Stage 4 - Admin Client Requests Surface

**Goal:** Give agency_admin a dedicated place to manage client requests.

**Result:** Request lifecycle moves out of overview editor and into an owning client workspace surface.

### Tasks

- [ ] Add route:
  - [ ] `#admin-client-requests?clientId=...`
- [ ] Register route metadata with `showInNav: false`.
- [ ] Add route tab to `AdminClientWorkspaceHeader`.
- [ ] Build `AdminClientRequestsPage`.
- [ ] Use canonical `PageHeader` / client workspace header patterns.
- [ ] Build request filters:
  - [ ] all
  - [ ] pending
  - [ ] answered
  - [ ] resolved
  - [ ] cancelled
- [ ] Build requests list:
  - [ ] title
  - [ ] status
  - [ ] priority
  - [ ] due date
  - [ ] owner
  - [ ] updated time
- [ ] Build create/edit modal:
  - [ ] title
  - [ ] description
  - [ ] due date
  - [ ] related link
  - [ ] priority
  - [ ] owner
  - [ ] internal notes
- [ ] Build detail modal:
  - [ ] request title as modal title
  - [ ] compact metadata
  - [ ] client-facing description
  - [ ] client response panel
  - [ ] internal notes panel
  - [ ] lifecycle actions in footer/overflow
- [ ] Add actions:
  - [ ] save draft/update
  - [ ] mark resolved
  - [ ] cancel
  - [ ] reopen
- [ ] Add empty state.
- [ ] Add loading/error states through runtime data client.

### Completion Criteria

- [ ] agency_admin can create, edit, resolve, cancel, and reopen requests.
- [ ] admin page uses existing workspace/navigation patterns.
- [ ] no request lifecycle editing remains embedded in unrelated editors.

## Stage 5 - Client Requests Surface

**Goal:** Let client_user see and respond to requests in a focused client-facing workflow.

**Result:** Client can answer agency requests without using chat or email.

### Tasks

- [ ] Add route:
  - [ ] `#client-requests`
- [ ] Add route metadata.
- [ ] Add client navigation entry only if IA supports it.
- [ ] Build `ClientRequestsPage`.
- [ ] List requests grouped or filtered by:
  - [ ] pending
  - [ ] answered
  - [ ] resolved
- [ ] Hide cancelled requests by default.
- [ ] Build request detail panel/card:
  - [ ] title
  - [ ] due date
  - [ ] related link
  - [ ] description
  - [ ] status
  - [ ] response state
- [ ] Build response form:
  - [ ] response textarea
  - [ ] submit response
  - [ ] disabled state for non-pending requests
- [ ] Add client empty state:
  - [ ] "No actions needed from you right now."
- [ ] Add access denied state.

### Completion Criteria

- [ ] client_user can respond to pending requests.
- [ ] response changes request to `answered`.
- [ ] client_user cannot see another client's requests.
- [ ] client_user cannot see internal notes.

## Stage 6 - Overview And Performance Integration

**Goal:** Keep request summaries visible in existing client-facing surfaces without duplicating the owning workflow.

**Result:** UC-001 and UC-004 link to the dedicated request surface.

### Tasks

- [ ] Update Client Overview Needed From Client block:
  - [ ] show active pending/answered requests
  - [ ] hide cancelled requests
  - [ ] show due date and status
  - [ ] link to request detail/page
  - [ ] do not expose internal notes
- [ ] Update Client Performance Needed From Client block:
  - [ ] show active requests as analytics blockers/context
  - [ ] link to request detail/page
  - [ ] do not duplicate response form unless product explicitly wants it
- [ ] Update Admin Client Overview Editor:
  - [ ] remove any duplicated full request management if present
  - [ ] link to Admin Client Requests surface
- [ ] Ensure active request count/status can influence client status if manually set by admin.

### Completion Criteria

- [ ] Client Overview remains a status hub.
- [ ] Client Performance remains an analytics dashboard.
- [ ] Requests page owns request lifecycle.

## Stage 7 - Activity And Audit Trail

**Goal:** Make request changes auditable in frontend/localStorage.

**Result:** Important request actions create activity events where current app architecture supports them.

### Tasks

- [ ] Add activity events for:
  - [ ] request created
  - [ ] request updated
  - [ ] client responded
  - [ ] request resolved
  - [ ] request cancelled
  - [ ] request reopened
- [ ] Include actor metadata.
- [ ] Keep admin/team activity feed private.
- [ ] Do not expose internal notes to client activity.

### Completion Criteria

- [ ] Admin can inspect request lifecycle context through existing activity surfaces.
- [ ] Client-facing views remain client-safe.

## Stage 8 - Tests And Acceptance

**Goal:** Prove UC-005 is safe and complete for frontend/localStorage MVP.

**Result:** Role boundaries, lifecycle transitions, and client isolation are covered.

### Tests

- [ ] Unit tests:
  - [ ] status metadata
  - [ ] transition policy
  - [ ] visibility policy
  - [ ] admin service operations
  - [ ] client response operation
  - [ ] access denial
- [ ] E2E tests:
  - [ ] agency_admin creates request
  - [ ] client_user sees own request
  - [ ] client_user submits response
  - [ ] agency_admin marks request resolved
  - [ ] agency_admin cancels request and client summary hides it
  - [ ] client_user cannot access another client's request
  - [ ] internal notes never appear client-side
- [ ] Regression checks:
  - [ ] UC-001 overview still works
  - [ ] UC-004 performance dashboard still works

### Build Checks

- [ ] `npm run lint`
- [ ] `npm test -- --run`
- [ ] `npx playwright test`
- [ ] `npm run build`

## Stage 9 - Acceptance Report

**Goal:** Record what is implemented, verified, and deferred.

**Result:** UC-005 can be handed off or used as a baseline for backend implementation.

### Tasks

- [ ] Create `docs/implementation/UC-005-acceptance-report.md`.
- [ ] Mark acceptance criteria complete/deferred.
- [ ] Document frontend/localStorage limitations.
- [ ] Document backend deferred items:
  - [ ] server-side access enforcement
  - [ ] real notification delivery
  - [ ] email reminders
  - [ ] file upload/storage
  - [ ] approval workflow
  - [ ] audit log persistence

## Final Completion Definition

UC-005 is complete when:

```text
agency_admin can create and manage client requests;
client_user can respond to their own pending requests;
the agency can resolve or cancel requests;
overview/performance pages show active request context without owning lifecycle;
internal notes and other-client records never leak to client-facing routes;
all behavior is backed by domain services and e2e coverage.
```
