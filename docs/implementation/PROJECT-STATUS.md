# Project Status

```text
Product: Agency Client Portal Aggregator
Status date: 2026-05-16
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
| UC-005 - Needed From Client / Blockers | Planning ready | `docs/implementation/UC-005-implementation-checklist.md` |

## Current Verification Baseline

Latest full verification recorded after UC-004:

```text
npm run lint
npm test -- --run
npx playwright test
npm run build
```

Expected current baseline from the last UC-004 run:

```text
Unit tests: 133 passed
Full e2e: 21 passed
Build: passed
```

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

Recommended next use case:

```text
UC-005 - Needed From Client / Blockers
```

Reason:

```text
UC-001 and UC-004 already display needed-from-client records.
UC-005 should now turn those records into a dedicated lifecycle workflow:
create request, client response, agency review, resolve, cancel, and audit.
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
