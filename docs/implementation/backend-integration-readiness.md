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

`createApiPortalDataClient.js` is the API/Supabase-style adapter wrapper. It accepts any transport that implements:

```text
transport.loadSnapshot() -> Promise<{ snapshot, version }>
transport.saveSnapshot(snapshot, { version }) -> Promise<{ version }>
```

`createHttpPortalSnapshotTransport.js` is the first real network transport seam. It expects:

```text
GET  /api/portal-snapshot
  response: { "snapshot": { ... }, "version": "etag-or-revision" }

PUT  /api/portal-snapshot
  body: { "snapshot": { ... }, "version": "etag-or-revision" }
  response: { "version": "next-etag-or-revision" }
```

Runtime/config assumptions:

```text
VITE_PORTAL_API_BASE_URL=https://api.example.com
```

If `VITE_PORTAL_API_BASE_URL` is omitted, the transport uses a relative `/api/portal-snapshot` endpoint. Auth headers are injected through the transport `getHeaders()` option so future Supabase/session tokens stay outside domain services and page code.

`createDevPortalSnapshotMiddleware.js` provides the development/mock backend for the same HTTP contract. Vite registers it as dev middleware, so local development can exercise the real network seam without Supabase:

```text
GET /api/portal-snapshot
PUT /api/portal-snapshot
```

The mock backend stores a normalized in-memory snapshot and returns `409` for stale versions. It is intentionally not production persistence.

Runtime data-client selection:

```text
VITE_PORTAL_DATA_CLIENT_ADAPTER=localRepository  # default
VITE_PORTAL_DATA_CLIENT_ADAPTER=httpSnapshot     # use HTTP snapshot transport
```

Network error mapping:

```text
401/403 -> controlled auth failure
409     -> optimistic snapshot version conflict
other   -> controlled API status error
bad JSON or missing snapshot field -> controlled malformed payload error
```

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
- client users derive access from workspace_memberships only
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
src/app/providers/repositories/createApiPortalDataClient.test.js
src/app/providers/repositories/createDevPortalSnapshotMiddleware.test.js
src/app/providers/repositories/createHttpPortalSnapshotTransport.test.js
src/app/providers/repositories/createPortalDataClient.test.js
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
- API snapshot data client uses a transport seam with `loadSnapshot()` and `saveSnapshot(snapshot, context)`
- dev/mock Vite middleware serves the HTTP snapshot contract with in-memory versioned state
- HTTP snapshot transport maps `/api/portal-snapshot` load/save, auth failures, stale writes, malformed JSON, and malformed payloads into controlled errors
- runtime data-client selection can switch between local repository and HTTP snapshot transport
- API snapshot transport rejects stale writes through optimistic version checks
- API snapshot adapter stub passes the reusable async repository contract suite
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

`portalRepositoryContract.test-support.js` exports reusable sync repository and async data-client suites. Any future API/Supabase adapter must run through the async suite before product workflows are switched to it.

Current domain audit hooks:

```text
- client work item publish/archive transitions record activity events when an activity repository is configured
- client invitation create/cancel/accept transitions record activity events when an activity repository is configured
- client request and needed-from-client lifecycle changes record activity events when configured
- clinic compliance publish, compliance status change, and medical approval decision transitions record internal activity events when configured
```

These hooks are still repository-backed frontend/domain behavior. The production backend must persist equivalent events server-side and enforce the same access boundaries.

Current data-client migration progress:

```text
- Admin client setup create/edit/delete and pending invitation read model now use `runtime.dataClient.read/write`.
- Task workspace loading, task updates, client-work review handoff, and Markdown task import preview/apply now use `runtime.dataClient.read/write`.
- Admin client access, invitation, membership, and activity panels now use `runtime.dataClient.read/write`.
- Route access context, app navigation, route headers, legacy client dashboard/performance routes, and clinic reporting routes now use `runtime.dataClient.read/write` instead of direct `runtime.repositories`.
- Auth UI uses an `authClient` boundary for sign-in, sign-out, demo sessions, current viewer, and login profile reads; the current implementation is still local/demo-backed until a server auth adapter exists.
```

## Next Backend Steps

- [x] Add API/Supabase-style snapshot adapter stub that implements the repository contract through the data-client seam.
- [x] Add HTTP snapshot transport boundary for real network load/save.
- [x] Add Vite dev/mock `/api/portal-snapshot` backend for end-to-end transport testing.
- [x] Add runtime config switch for local repository vs HTTP snapshot data client.
- [ ] Add a real API/Supabase adapter backed by network/database transport.
- [x] Add reusable contract tests for repository adapter behavior.
- [x] Centralize repository adapter selection behind `createPortalRepository`.
- [x] Add backend schema manifest for table scope, required columns, indexes, and clinic publish state.
- [x] Add backend access manifest for RLS/API requirements.
- [x] Add backend RLS policy intent manifest derived from repository access rules.
- [x] Add snapshot-backed repository/data-client bridge for future async API adapters.
- [x] Run the reusable contract suite against both localStorage and the API snapshot adapter stub.
- [ ] Run the reusable contract suite against the real API/Supabase adapter.
- [x] Add server auth/session contract for viewer payload and membership-derived access semantics.
- [x] Add frontend auth client boundary for local/demo auth behavior.
- [ ] Move auth/session validation server-side while preserving `buildViewerFromProfile` semantics in the frontend read model.
- [ ] Implement server-side access policies/RLS for client membership, agency team assignment, draft/published boundaries, and clinic aggregate-only data.
- [x] Add frontend/domain audit hooks for clinic compliance publish/status/approval transitions.
- [x] Add server audit transition contract and frontend/domain hooks for invitation lifecycle transitions.
- [ ] Add server audit logging for publish, archive, invitation, client response, and compliance approval transitions.
- [x] Replace demo reset behavior with environment-gated admin/dev tooling.
- [x] Route the first admin client setup, task workspace, access, and activity workflows through `runtime.dataClient`.
- [x] Migrate remaining navigation/header/legacy client read paths away from direct `runtime.repositories`.
