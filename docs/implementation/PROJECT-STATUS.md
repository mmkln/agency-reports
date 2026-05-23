# Project Status

```text
Product: Agency Client Portal Aggregator
Status date: 2026-05-18
Current storage mode: frontend/localStorage MVP
```

## Current Product Direction

This project is a client-facing portal layer for marketing agencies.

It should help each client understand:

```text
- current agency work
- progress
- marketing results
- monthly summaries
- dashboard links
- needed client actions
- blockers
```

It is not intended to become a full analytics platform, CRM, project management tool, chat system, or file manager during the MVP stage.

Clinic vertical product direction:

```text
Clinics are now treated as the primary ICP for the client-facing experience.
The client portal prioritizes patient acquisition, calls/bookings, service lines,
reputation, compliance, approvals, and reports over generic project/task status.
```

Primary clinic planning references:

```text
docs/research/clinic-client-portal-information-architecture.md
docs/implementation/clinic-client-portal-refactor-checklist.md
docs/domain-ownership-model.md
```

## Implemented Use Cases

| Use case | Status | Main implementation docs |
| --- | --- | --- |
| UC-001 - Client Overview / Status Hub | Frontend/localStorage MVP implemented | `docs/implementation/UC-001-acceptance-report.md` |
| UC-002 - Embedded Marketing Dashboard | Frontend/localStorage MVP implemented | `docs/implementation/UC-002-acceptance-report.md` |
| UC-003 - Monthly Summary / Report Archive | Frontend/localStorage MVP implemented | `docs/implementation/UC-003-acceptance-report.md` |
| UC-004 - Client Performance Dashboard | Frontend/localStorage MVP implemented | `docs/implementation/UC-004-acceptance-report.md` |
| UC-005 - Needed From Client / Blockers | Frontend/localStorage MVP implemented | `docs/implementation/UC-005-acceptance-report.md` |

## Current Verification Baseline

Latest full verification recorded after the backend-readiness data-client boundary refactor:

```text
npm run lint
npm test -- --run
npx playwright test
npm run build
```

Current baseline from the latest verification run:

```text
Lint: passed
Unit tests: 420 passed
Full e2e: 46 passed with `npx playwright test --workers=1`
Build: passed
```

Note: the full serial Playwright run is the current baseline for mature client visibility, clinic vertical routes, reports, imports, and role boundaries.

## Current Client IA Status

The client-facing portal has been refactored from separate use-case routes into the mature Client Control Center destinations:

```text
- Overview
- Action Needed
- Projects
- Reports & Dashboards
- Files & Links
- Requests
- Updates
- Settings
```

Legacy client Dashboard, Performance, and Reports routes remain hidden/deep-link compatible, while top-level client navigation points to the mature destinations.

For clinic clients, the mature navigation emphasizes:

```text
- Overview as the clinic control center
- Patient Acquisition
- Calls & Bookings
- Service Lines
- Reputation
- Compliance & Approvals
- Action Needed
- Reports
```

## Architecture Baseline

The current frontend architecture expects:

```text
- domain logic in services and policies
- persistence through repository adapters
- route pages using runtime data clients
- localStorage as a replaceable adapter
- string UUIDs for entity IDs
- `User`, `Agency`, and `Company Workspace` to be treated as separate business entities
- user access to be derived from agency/workspace memberships rather than profile fallback fields
- client-facing visibility enforced in domain services
- internal notes/drafts hidden from client read models
- internal `Task` records are not the client-facing active-work contract
- published `ClientWorkItem` records own client-visible active work
- `NeededFromClient` owns client actions and client responses
```

## Next Recommended Work

Recommended next step:

```text
Continue backend/integration readiness and harden the clinic growth-operations workflows.
```

Reason:

```text
The UC-001 through UC-005 frontend/localStorage MVP path is implemented, the mature Client Control Center model is in place, clinic client routes are implemented, and task-to-client visibility has been refactored around explicit `ClientWorkItem` publishing.
The next major product move is replacing localStorage with backend-ready persistence/access enforcement, adding real integrations for clinic acquisition data, or expanding clinic operational workflows such as call handling and compliance approvals.
```

Primary planning tracker:

```text
docs/implementation/backend-integration-readiness.md
docs/implementation/clinic-client-portal-refactor-checklist.md
docs/implementation/client-control-center-refactor-checklist.md
docs/implementation/task-client-visibility-refactor-checklist.md
```

## Known Backend/Integration Deferrals

The current app intentionally does not yet include:

```text
- real database persistence
- server-side RLS/access enforcement
- email invite delivery
- real notification delivery
- third-party analytics connectors
- scheduled dashboard sync
- file storage
- AI-generated report writing
- real-time collaboration
```

The frontend should continue to model these as domain-ready abstractions while using localStorage for the current MVP.
