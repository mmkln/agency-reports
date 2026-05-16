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
- [x] Update navigation/product docs after routes are implemented.
- [x] Confirm whether agency_team can create requests or only update assigned/request-related requests.

### Completion Criteria

- [x] A developer can explain where request lifecycle editing belongs.
- [x] Overview and analytics pages do not duplicate request lifecycle controls.

## Stage 1 - Entity Model And Policies

**Goal:** Make request lifecycle, status transitions, and visibility explicit in domain code.

**Result:** UC-005 can be tested without rendering React.

### Tasks

- [x] Extend `needed_from_client` model with backend-ready optional fields:
  - [x] `priority`
  - [x] `owner_name`
  - [x] `client_response`
  - [x] `client_responded_at`
  - [x] `client_responded_by`
  - [x] `resolved_at`
  - [x] `resolved_by`
  - [x] `cancelled_at`
  - [x] `cancelled_by`
  - [x] `internal_notes`
- [x] Keep existing MVP fields compatible:
  - [x] `id`
  - [x] `client_id`
  - [x] `title`
  - [x] `description`
  - [x] `status`
  - [x] `due_date`
  - [x] `related_link`
  - [x] `created_at`
  - [x] `updated_at`
- [x] Ensure IDs are string UUIDs.
- [x] Centralize request status metadata:
  - [x] `pending`
  - [x] `answered`
  - [x] `resolved`
  - [x] `cancelled`
- [x] Add priority metadata if needed:
  - [x] `low`
  - [x] `medium`
  - [x] `high`
- [x] Add request status transition policy:
  - [x] `pending -> answered`
  - [x] `pending -> resolved`
  - [x] `pending -> cancelled`
  - [x] `answered -> resolved`
  - [x] `answered -> pending`
  - [x] `answered -> cancelled`
  - [x] `resolved -> pending`
  - [x] `cancelled -> pending`
- [x] Add client response policy:
  - [x] client can only respond to own pending requests
  - [x] client response moves status to `answered`
  - [x] client cannot resolve or cancel directly
- [x] Update visibility policy:
  - [x] cancelled hidden from client active summaries
  - [x] internal notes hidden from client routes
  - [x] access denial uses existing client isolation behavior
- [x] Add unit tests for statuses, transitions, and visibility.

### Completion Criteria

- [x] Domain tests prove client isolation.
- [x] Domain tests prove internal notes are hidden.
- [x] Domain tests prove cancelled records are not shown in client summaries.
- [x] Domain tests prove client response changes status to `answered`.

## Stage 2 - Repository And Seed Data

**Goal:** Make the localStorage adapter support the full UC-005 data shape without leaking storage details upward.

**Result:** Request data can be created, updated, resolved, cancelled, and rendered through repository-backed services.

### Tasks

- [x] Confirm repository adapter supports `neededFromClient` CRUD/upsert.
- [x] Add repository methods if missing:
  - [x] `listByClientId`
  - [x] `findById`
  - [x] `upsert`
  - [x] `remove` only if needed
- [x] Confirm no localStorage schema migration is required because new fields are normalized at service/model boundaries.
- [x] Add seed/runtime test data examples:
  - [x] pending request
  - [x] answered request
  - [x] resolved request
  - [x] cancelled request
  - [x] internal notes on admin-only request
- [x] Ensure reset/reseed dev utility handles new fields.

### Completion Criteria

- [x] Existing UC-001 and UC-004 pages still render active requests.
- [x] Repository adapter can later be replaced by API/Supabase without page rewrites.

## Stage 3 - Domain Services

**Goal:** Put request workflow logic behind domain services.

**Result:** UI components call explicit use-case operations rather than mutating records directly.

### Tasks

- [x] Create or extend admin request service:
  - [x] list client requests
  - [x] create request
  - [x] update request
  - [x] resolve request
  - [x] cancel request
  - [x] reopen request
- [x] Create client request service:
  - [x] list visible own requests
  - [x] get request detail
  - [x] submit response
- [x] Add validation:
  - [x] required title
  - [x] safe client-facing description
  - [x] valid status transition
  - [x] valid due date
  - [x] valid related URL
  - [x] no client response to non-pending request
- [x] Add read models:
  - [x] admin list item
  - [x] admin detail
  - [x] client list item
  - [x] client detail
  - [x] overview summary item
- [x] Add activity events if current activity service supports it.

### Completion Criteria

- [x] UI can render admin/client request pages from service read models.
- [x] Services reject unauthorized or invalid operations.
- [x] Services never return internal notes to client read models.

## Stage 4 - Admin Client Requests Surface

**Goal:** Give agency_admin a dedicated place to manage client requests.

**Result:** Request lifecycle moves out of overview editor and into an owning client workspace surface.

### Tasks

- [x] Add route:
  - [x] `/admin/client-requests?clientId=...`
- [x] Register route metadata with `showInNav: false`.
- [x] Add route tab to `AdminClientWorkspaceHeader`.
- [x] Build `AdminClientRequestsPage`.
- [x] Use canonical `PageHeader` / client workspace header patterns.
- [x] Build request filters:
  - [x] all
  - [x] pending
  - [x] answered
  - [x] resolved
  - [x] cancelled
- [x] Build requests list:
  - [x] title
  - [x] status
  - [x] priority
  - [x] due date
  - [x] owner
  - [x] updated time
- [x] Build create/edit modal:
  - [x] title
  - [x] description
  - [x] due date
  - [x] related link
  - [x] priority
  - [x] owner
  - [x] internal notes
- [x] Build detail modal:
  - [x] request title as modal title
  - [x] compact metadata
  - [x] client-facing description
  - [x] client response panel
  - [x] internal notes panel
  - [x] lifecycle actions in footer/overflow
- [x] Add actions:
  - [x] save draft/update
  - [x] mark resolved
  - [x] cancel
  - [x] reopen
- [x] Add empty state.
- [x] Add loading/error states through runtime data client.

### Completion Criteria

- [x] agency_admin can create, edit, resolve, cancel, and reopen requests.
- [x] admin page uses existing workspace/navigation patterns.
- [x] no request lifecycle editing remains embedded in unrelated editors.

## Stage 5 - Client Requests Surface

**Goal:** Let client_user see and respond to requests in a focused client-facing workflow.

**Result:** Client can answer agency requests without using chat or email.

### Tasks

- [x] Add route:
  - [x] `/client/requests`
- [x] Add route metadata.
- [x] Add client navigation entry only if IA supports it.
- [x] Build `ClientRequestsPage`.
- [x] List requests grouped or filtered by:
  - [x] pending
  - [x] answered
  - [x] resolved
- [x] Hide cancelled requests by default.
- [x] Build request detail panel/card:
  - [x] title
  - [x] due date
  - [x] related link
  - [x] description
  - [x] status
  - [x] response state
- [x] Build response form:
  - [x] response textarea
  - [x] submit response
  - [x] disabled state for non-pending requests
- [x] Add client empty state:
  - [x] "No actions needed from you right now."
- [x] Add access denied state.

### Completion Criteria

- [x] client_user can respond to pending requests.
- [x] response changes request to `answered`.
- [x] client_user cannot see another client's requests.
- [x] client_user cannot see internal notes.

## Stage 6 - Overview And Performance Integration

**Goal:** Keep request summaries visible in existing client-facing surfaces without duplicating the owning workflow.

**Result:** UC-001 and UC-004 link to the dedicated request surface.

### Tasks

- [x] Update Client Overview Needed From Client block:
  - [x] show active pending/answered requests
  - [x] hide cancelled requests
  - [x] show due date and status
  - [x] link to request detail/page
  - [x] do not expose internal notes
- [x] Update Client Performance Needed From Client block:
  - [x] show active requests as analytics blockers/context
  - [x] link to request detail/page
  - [x] do not duplicate response form unless product explicitly wants it
- [x] Update Admin Client Overview Editor:
  - [x] remove any duplicated full request management if present
  - [x] link to Admin Client Requests surface
- [x] Ensure active request count/status can influence client status if manually set by admin.

### Completion Criteria

- [x] Client Overview remains a status hub.
- [x] Client Performance remains an analytics dashboard.
- [x] Requests page owns request lifecycle.

## Stage 7 - Activity And Audit Trail

**Goal:** Make request changes auditable in frontend/localStorage.

**Result:** Important request actions create activity events where current app architecture supports them.

### Tasks

- [x] Add activity events for:
  - [x] request created
  - [x] request updated
  - [x] client responded
  - [x] request resolved
  - [x] request cancelled
  - [x] request reopened
- [x] Include actor metadata.
- [x] Keep admin/team activity feed private.
- [x] Do not expose internal notes to client activity.

### Completion Criteria

- [x] Admin can inspect request lifecycle context through existing activity surfaces.
- [x] Client-facing views remain client-safe.

## Stage 8 - Tests And Acceptance

**Goal:** Prove UC-005 is safe and complete for frontend/localStorage MVP.

**Result:** Role boundaries, lifecycle transitions, and client isolation are covered.

### Tests

- [x] Unit tests:
  - [x] status metadata
  - [x] transition policy
  - [x] visibility policy
  - [x] admin service operations
  - [x] client response operation
  - [x] access denial
- [x] E2E tests:
  - [x] agency_admin creates request
  - [x] client_user sees own request
  - [x] client_user submits response
  - [x] agency_admin marks request resolved
  - [x] agency_admin cancels request and client summary hides it
  - [x] client_user cannot access another client's request
  - [x] internal notes never appear client-side
- [x] Regression checks:
  - [x] UC-001 overview still works
  - [x] UC-004 performance dashboard still works

### Build Checks

- [x] `npm run lint`
- [x] `npm test -- --run`
- [x] `npx playwright test`
- [x] `npm run build`

## Stage 9 - Acceptance Report

**Goal:** Record what is implemented, verified, and deferred.

**Result:** UC-005 can be handed off or used as a baseline for backend implementation.

### Tasks

- [x] Create `docs/implementation/UC-005-acceptance-report.md`.
- [x] Mark acceptance criteria complete/deferred.
- [x] Document frontend/localStorage limitations.
- [x] Document backend deferred items:
  - [x] server-side access enforcement
  - [x] real notification delivery
  - [x] email reminders
  - [x] file upload/storage
  - [x] approval workflow
  - [x] audit log persistence

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

