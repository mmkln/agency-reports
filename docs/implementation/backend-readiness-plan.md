# Backend Readiness Plan

This document records the persistence boundary for moving from localStorage to a real backend.

## Current State

The app currently uses:

```text
src/app/providers/repositories/portalRepository.js
```

That file wires the runtime repository adapter. Today it uses localStorage. Later it can export a Supabase/API adapter with the same repository port.

Product/domain code should not care which adapter is active.

## Repository Boundary

Domain services currently expect repositories with:

```text
findById(id)
list()
listByClientId(clientId)
upsert(record)
```

The adapter owns:

```text
- storage mechanics
- table names
- snapshot/schema validation
- reseeding/reset behavior in dev
- future API/Supabase request details
```

The domain owns:

```text
- access checks
- visibility filtering
- status transitions
- safe view models
- sorting/selecting latest records
```

The UI owns:

```text
- route params
- passing the authenticated viewer unchanged
- calling domain services
- rendering view models and allowed actions
```

## Backend Table Mapping

| Frontend repository | Backend table |
| --- | --- |
| `clients` | `clients` |
| `profiles` | `profiles` |
| `projects` | `projects` |
| `tasks` | `tasks` |
| `updates` | `updates` |
| `neededFromClient` | `needed_from_client` |
| `dashboardLinks` | `dashboard_links` |
| `reports` | `reports` |

## Migration Order

1. Keep the current domain services and policies unchanged.
2. Create a backend adapter that satisfies the current repository port.
3. Replace `portalRepository` wiring at the app provider layer.
4. Add async page/query wrappers only at the page/app layer.
5. Keep client isolation and visibility checks in domain services even if the backend also enforces RLS.
6. Add backend integration tests for the same cases already covered by policy/service unit tests.

## Async Path

Current services are synchronous because localStorage is synchronous.

When backend calls are introduced, do not rewrite policy logic into React components. Use one of these approaches:

```text
Option A:
page/hook fetches records async -> passes hydrated repository-like object to existing domain service

Option B:
async service loads records through async repository -> reuses same pure mapping/filtering helpers
```

The first backend migration should prefer Option A unless backend data volume requires server-side filtering first.

## Non-Negotiable Checks

Before switching adapters:

```text
- No domain service imports localStorage/window.
- No client-facing page mutates viewer identity from route params.
- Internal notes/tasks/updates remain hidden.
- Draft/ready reports remain hidden.
- Draft/archived dashboards are not primary client dashboards.
- Access denied does not leak other client names.
```
