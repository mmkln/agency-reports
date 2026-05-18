# Backend Integration Readiness

```text
Document type: Implementation contract
Status date: 2026-05-18
Current adapter: localStorage repository
Target adapter: API/Supabase-ready repository with the same domain-facing contract
```

## Current Boundary

Domain services must continue to depend on `runtime.dataClient.read/write` and repository adapters, not browser storage.

The canonical frontend repository contract is now:

```text
src/app/providers/repositories/portalRepositoryContract.js
```

That file defines:

```text
- PORTAL_CLINIC_PUBLISH_STATE_TABLES
- PORTAL_REPOSITORY_COLLECTIONS
- PORTAL_TABLE_NAMES
- PORTAL_REPOSITORY_KEYS
- PORTAL_ENTITY_REPOSITORY_METHODS
- PORTAL_REPOSITORY_EXTENSION_METHODS
```

## Required Collection Methods

Every entity collection exposed by a backend adapter should implement:

```text
list()
findById(id)
listByClientId(clientId)
upsert(record)
deleteById(id)
```

Current extension methods:

```text
profiles.findByUserId(userId)
repository.reset() for local/demo environments only
```

## Adapter Rules

- Keep repository keys stable; pages and domain services should not know table names.
- Keep table names centralized in `portalRepositoryContract.js`.
- Keep client visibility, publish states, and workflow permissions in domain policies/services.
- Do not move visibility filtering into UI code.
- Client routes must read published/client-safe records only.
- Admin draft preview must be explicit and permission-checked.
- Clinic records must remain aggregate-only; do not add patient-level fields for integrations.
- Clinic aggregate tables listed in `PORTAL_CLINIC_PUBLISH_STATE_TABLES` must preserve draft/published boundaries.
- Client responses must update `NeededFromClient` / request records, not internal `Task.status`.

## Verification

Current contract coverage:

```text
src/app/providers/repositories/portalRepositoryContract.test.js
src/app/providers/repositories/portalRepositoryContract.test-support.js
```

The contract tests verify:

```text
- repository keys are unique
- table names are unique
- localStorage adapter implements every contract collection
- every collection exposes required entity methods
- every collection can round-trip records through upsert/list/find/listByClientId/deleteById
- extension methods remain explicit
```

`portalRepositoryContract.test-support.js` exports a reusable suite. Any future API/Supabase adapter must run through the same suite before product workflows are switched to it.

## Next Backend Steps

- [ ] Add a real API/Supabase adapter that implements `PORTAL_REPOSITORY_COLLECTIONS`.
- [x] Add reusable contract tests for repository adapter behavior.
- [ ] Run the reusable contract suite against both localStorage and the API/Supabase adapter.
- [ ] Move auth/session validation server-side while preserving `buildViewerFromProfile` semantics in the frontend read model.
- [ ] Implement server-side access policies/RLS for client membership, agency team assignment, draft/published boundaries, and clinic aggregate-only data.
- [ ] Add server audit logging for publish, archive, invitation, client response, and compliance approval transitions.
- [ ] Replace demo reset behavior with environment-gated admin/dev tooling.
