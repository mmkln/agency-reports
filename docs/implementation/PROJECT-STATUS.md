# Project Status

```text
Product: Agency Client Portal Aggregator
Status date: 2026-05-17
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

## Implemented Use Cases

| Use case | Status | Main implementation docs |
| --- | --- | --- |
| UC-001 - Client Overview / Status Hub | Frontend/localStorage MVP implemented | `docs/implementation/UC-001-acceptance-report.md` |
| UC-002 - Embedded Marketing Dashboard | Frontend/localStorage MVP implemented | `docs/implementation/UC-002-acceptance-report.md` |
| UC-003 - Monthly Summary / Report Archive | Frontend/localStorage MVP implemented | `docs/implementation/UC-003-acceptance-report.md` |
| UC-004 - Client Performance Dashboard | Frontend/localStorage MVP implemented | `docs/implementation/UC-004-acceptance-report.md` |
| UC-005 - Needed From Client / Blockers | Frontend/localStorage MVP implemented | `docs/implementation/UC-005-acceptance-report.md` |

## Current Verification Baseline

Latest full verification recorded after the Client Control Center refactor:

```text
npm run lint
npm test -- --run
npx playwright test
npm run build
```

Current baseline from the latest verification run:

```text
Unit tests: 229 passed
Full e2e: 32 passed with `npx playwright test --workers=1`
Build: passed
```

Note: the default parallel `npm run e2e` run hit timing flakes in older admin import/report/performance specs; each failed spec passed when rerun individually, and the full serial run passed.

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

## Architecture Baseline

The current frontend architecture expects:

```text
- domain logic in services and policies
- persistence through repository adapters
- route pages using runtime data clients
- localStorage as a replaceable adapter
- string UUIDs for entity IDs
- client-facing visibility enforced in domain services
- internal notes/drafts hidden from client read models
```

## Next Recommended Work

Recommended next step:

```text
Start the next refactor track from the backend/integration readiness plan or harden the remaining flaky parallel e2e admin specs.
```

Reason:

```text
The UC-001 through UC-005 frontend/localStorage MVP path is implemented, the mature Client Control Center checklist is closed, and the client/admin surfaces now use the mature destination model.
The next major product move is either replacing localStorage with backend-ready adapters or reducing parallel e2e flake in legacy admin flows.
```

Primary planning tracker:

```text
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
