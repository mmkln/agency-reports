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
src/app/providers/repositories/createPortalRepository.js
src/app/providers/repositories/createSnapshotPortalDataClient.js
src/app/providers/repositories/createSnapshotPortalRepository.js
src/app/providers/repositories/portalRepositoryAccessManifest.js
src/app/providers/repositories/portalRepositoryContract.js
src/app/providers/repositories/portalRepositorySchema.js
src/app/providers/repositories/portalRepositoryRlsPolicyManifest.js
src/domain/services/authSessionContractService.js
src/domain/services/serverAuditContractService.js
```

`createPortalRepository.js` is the adapter selection boundary. The app should create repositories through this factory instead of importing a concrete adapter directly.

`createSnapshotPortalRepository.js` is the adapter-neutral synchronous repository workspace. It owns snapshot normalization, seed merging, schema-version repair, collection method construction, and the `profiles.findByUserId` extension. LocalStorage uses it directly, and a future backend adapter should reuse the same snapshot workspace so domain services keep receiving the same repository contract.

`createSnapshotPortalDataClient.js` is the bridge for async backends. A backend adapter can provide:

```text
loadSnapshot()
saveSnapshot(snapshot)
```

The data client then runs existing domain operations against a normalized in-memory repository snapshot and saves the resulting snapshot after writes. This avoids forcing every domain service to become backend-specific.

`loadSnapshot()` may also return a versioned payload:

```text
{ snapshot, version }
```

When a version is provided, `createSnapshotPortalDataClient` passes it to `saveSnapshot(snapshot, { version })` so the real backend adapter can enforce optimistic concurrency with an ETag, revision id, transaction version, or equivalent compare-and-swap guard.

`portalRepositoryContract.js` defines:

```text
- PORTAL_CLINIC_PUBLISH_STATE_TABLES
- PORTAL_REPOSITORY_COLLECTIONS
- PORTAL_TABLE_NAMES
- PORTAL_REPOSITORY_KEYS
- PORTAL_ENTITY_REPOSITORY_METHODS
- PORTAL_REPOSITORY_EXTENSION_METHODS
```

`portalRepositorySchema.js` defines the backend-facing table manifest:

```text
- repository key to table mapping
- global vs optional-client vs required-client scope
- required columns
- expected indexes
- clinic aggregate publish-state tables
```

`portalRepositoryAccessManifest.js` defines the backend/RLS access manifest:

```text
- agency scope required by default
- client membership requirements for client-scoped records
- client-safe visibility filters
- published-state filters for client-facing records
- aggregate-only flags for clinic growth metrics
- token-gated invitation access
- self-or-agency profile access
- server audit requirement markers
```

`portalRepositoryRlsPolicyManifest.js` translates the access manifest into server policy intent for future Supabase/API implementation:

```text
- agency all-operation policies for every table
- client membership select policies only for client-readable tables
- record filters for published/client-visible client reads
- profile owner select/update policies
- token-gated invitation select policy
```

`serverAuditContractService.js` defines critical transition audit obligations that a production backend must persist server-side:

```text
- client work item publish/archive
- client invitation create/cancel/accept
- client action answered/resolved/cancelled
- clinic compliance publish/status changes
- clinic medical approval decisions
```

`authSessionContractService.js` defines the server-side session/viewer contract that must preserve current frontend semantics:

```text
- session claims: session_id, user_id, expires_at
- viewer payload fields expected by read models
- role-specific server checks for agency admin, agency team, and client users
- client users derive access from client_memberships only
- route clientId remains a requested resource, never proof of access
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
```

Local/demo reset is deliberately not part of the production repository contract. The localStorage adapter only exposes `repository.reset()` when `createPortalRepository({ enableDemoReset: true })` opts into dev tooling.

## Adapter Rules

- Keep repository keys stable; pages and domain services should not know table names.
- Keep table names centralized in `portalRepositoryContract.js`.
- Keep adapter selection centralized in `createPortalRepository.js`.
- Keep backend table requirements centralized in `portalRepositorySchema.js`.
- Keep backend/RLS access requirements centralized in `portalRepositoryAccessManifest.js`.
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
src/app/providers/repositories/createPortalRepository.test.js
src/app/providers/repositories/createSnapshotPortalDataClient.test.js
src/app/providers/repositories/createSnapshotPortalRepository.test.js
src/app/providers/repositories/portalRepositoryAccessManifest.test.js
src/app/providers/repositories/portalRepositorySchema.test.js
src/app/providers/repositories/portalRepositoryRlsPolicyManifest.test.js
src/domain/services/authSessionContractService.test.js
src/domain/services/serverAuditContractService.test.js
```

The contract tests verify:

```text
- repository keys are unique
- table names are unique
- localStorage adapter implements every contract collection
- snapshot-backed repository implements every contract collection
- snapshot data client can load, mutate, normalize, and save backend snapshots with optional version/ETag context
- the factory-created default adapter implements the same repository contract
- every collection exposes required entity methods
- every collection can round-trip records through upsert/list/find/listByClientId/deleteById
- extension methods remain explicit
- demo reset stays opt-in and outside the production repository contract
- backend schema manifest covers every repository table
- backend/RLS access manifest covers every repository table
- backend/RLS policy intent covers every repository table
- internal task/activity records are agency-only
- client-facing records require published/client-safe filters
- clinic aggregate tables are marked aggregate-only
- clinic aggregate client policies carry published-state filters
- server auth contract preserves viewer fields and membership-derived client access
- server audit transition manifest covers publish, access, client response, and clinic compliance transitions
- seed records contain required backend columns
```

`portalRepositoryContract.test-support.js` exports a reusable suite. Any future API/Supabase adapter must run through the same suite before product workflows are switched to it.

Current domain audit hooks:

```text
- client work item publish/archive transitions record activity events when an activity repository is configured
- client invitation create/cancel/accept transitions record activity events when an activity repository is configured
- client request and needed-from-client lifecycle changes record activity events when configured
- clinic compliance publish, compliance status change, and medical approval decision transitions record internal activity events when configured
```

These hooks are still repository-backed frontend/domain behavior. The production backend must persist equivalent events server-side and enforce the same access boundaries.

## Next Backend Steps

- [ ] Add a real API/Supabase adapter that implements `PORTAL_REPOSITORY_COLLECTIONS`.
- [x] Add reusable contract tests for repository adapter behavior.
- [x] Centralize repository adapter selection behind `createPortalRepository`.
- [x] Add backend schema manifest for table scope, required columns, indexes, and clinic publish state.
- [x] Add backend access manifest for RLS/API requirements.
- [x] Add backend RLS policy intent manifest derived from repository access rules.
- [x] Add snapshot-backed repository/data-client bridge for future async API adapters.
- [ ] Run the reusable contract suite against both localStorage and the API/Supabase adapter.
- [x] Add server auth/session contract for viewer payload and membership-derived access semantics.
- [ ] Move auth/session validation server-side while preserving `buildViewerFromProfile` semantics in the frontend read model.
- [ ] Implement server-side access policies/RLS for client membership, agency team assignment, draft/published boundaries, and clinic aggregate-only data.
- [x] Add frontend/domain audit hooks for clinic compliance publish/status/approval transitions.
- [x] Add server audit transition contract and frontend/domain hooks for invitation lifecycle transitions.
- [ ] Add server audit logging for publish, archive, invitation, client response, and compliance approval transitions.
- [x] Replace demo reset behavior with environment-gated admin/dev tooling.
