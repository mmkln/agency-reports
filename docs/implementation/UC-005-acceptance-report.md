# UC-005 Acceptance Report - Needed From Client / Blockers

```text
Document type: Acceptance Report
Product: Agency Client Portal Aggregator
Use case ID: UC-005
Use case name: Needed From Client / Blockers
Implementation status: Frontend/localStorage MVP complete
Acceptance date: 2026-05-16
Primary spec: docs/use-cases/UC-005-needed-from-client-blockers.md
Implementation checklist: docs/implementation/UC-005-implementation-checklist.md
```

## Summary

UC-005 is implemented as a lightweight request workflow for client actions that unblock agency work.

The implemented flow supports:

```text
agency_admin creates a client request
agency_admin edits request details and internal notes
client_user sees only their own client-visible requests
client_user responds to pending requests
agency_admin reviews the client response
agency_admin resolves, cancels, or reopens the request
overview/performance pages show request context but do not own lifecycle
```

The implementation is backend-ready in shape but currently uses the localStorage repository adapter.

## Implemented Surfaces

### Admin Client Requests

Route:

```text
/admin/client-requests?clientId=...
```

Implemented:

```text
- client workspace header integration
- request filters
- request list
- create/edit modal
- detail modal
- status and priority metadata
- due date, owner, related link, updated timestamp
- client response panel
- internal notes panel
- lifecycle history timeline
- actions: resolve, cancel, reopen
```

### Client Requests

Route:

```text
/client/requests?clientId=...
```

Implemented:

```text
- client navigation entry
- pending/answered/resolved filters
- hidden cancelled requests
- client-safe request cards
- response form for pending requests
- no response controls for non-pending requests
- access denied state
- empty state
```

### Client Overview Integration

Implemented:

```text
- Needed From Client remains a compact summary
- cancelled requests remain hidden
- internal notes are not exposed
- block links to Client Requests
- overview does not own request lifecycle
```

### Client Performance Integration

Implemented:

```text
- Needed From Client appears as analytics context/blocker context
- block links to Client Requests
- no duplicated response workflow
- internal notes are not exposed
```

## Implemented Domain Behavior

### Entity Fields

The `needed_from_client` model supports:

```text
id
client_id
title
description
status
priority
owner_name
due_date
related_link
client_response
client_responded_at
client_responded_by
resolved_at
resolved_by
cancelled_at
cancelled_by
internal_notes
response_history
created_at
updated_at
```

### Statuses

Implemented statuses:

```text
pending
answered
resolved
cancelled
```

### Priorities

Implemented priorities:

```text
low
medium
high
```

### Transitions

Implemented transitions:

```text
pending -> answered
pending -> resolved
pending -> cancelled
answered -> pending
answered -> resolved
answered -> cancelled
resolved -> pending
cancelled -> pending
```

### Visibility Rules

Implemented:

```text
client_user can only see records for their own client
client_user cannot see cancelled requests in active client-facing surfaces
client_user cannot see internal notes
client_user can respond only to pending requests
client_user cannot resolve, cancel, or reopen requests
agency_admin owns request lifecycle management
```

## Acceptance Criteria Status

| Criterion | Status |
| --- | --- |
| agency_admin can create request | Complete |
| agency_admin can edit request | Complete |
| agency_admin can resolve request | Complete |
| agency_admin can cancel request | Complete |
| agency_admin can reopen request | Complete |
| client_user can see own requests | Complete |
| client_user can respond to pending requests | Complete |
| response changes status to `answered` | Complete |
| client_user cannot see another client's requests | Complete |
| client_user cannot see internal notes | Complete |
| cancelled requests are hidden from client active surfaces | Complete |
| overview/performance pages do not own lifecycle | Complete |
| request lifecycle is accessible from a dedicated route | Complete |
| lifecycle history is visible to admin | Complete |
| backend/server-side enforcement exists | Deferred |
| real notifications/email reminders exist | Deferred |

## Verification

The following checks were run during implementation:

```text
npm run lint
npm test -- --run
npm run build
npx playwright test e2e/uc001.spec.js
npx playwright test e2e/uc005.spec.js
npx playwright test
```

Final verification result:

```text
npm run lint: passed
npm test -- --run: 27 files passed, 150 tests passed
npx playwright test: 22 tests passed
npm run build: passed
```

E2E coverage includes:

```text
agency_admin creates request
client_user sees own request
client_user does not see internal notes
client_user submits response
agency_admin sees response
agency_admin marks request resolved
UC-001 overview regression
```

## Frontend/localStorage Limitations

Current implementation intentionally runs without a real backend.

Known limitations:

```text
access control is enforced in frontend/domain services, not server-side
localStorage can be modified by a browser user
activity history is stored inside the request record as response_history
there is no durable audit log table yet
there are no real notifications
there are no email reminders
there is no file upload or asset storage
there is no approval workflow
there is no real invitation/email delivery tied to requests
```

These limitations are acceptable for the current frontend/localStorage MVP but must be replaced before production.

## Backend Deferred Items

Deferred until API/Supabase/backend implementation:

```text
server-side access enforcement
row-level security / client isolation
durable audit log persistence
request notification delivery
email reminders
file upload/storage
approval workflow
assignment workflows for agency_team
request detail endpoints
request activity endpoints
```

## Agency Team Scope Decision

For the MVP, request lifecycle ownership stays with:

```text
agency_admin
```

`agency_team` request permissions are deferred.

Recommended future decision:

```text
agency_team may update assigned/request-related context, but should not publish or cancel client-facing requests unless explicitly granted permission.
```

## Final Acceptance

UC-005 is accepted as complete for the frontend/localStorage MVP.

The use case is ready to serve as the baseline for backend implementation.

