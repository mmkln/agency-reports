# Entity And Access Architecture Refactor Plan

```text
Status: in progress - workspace access storage vocabulary migration implemented
Scope: domain entities, auth viewer shape, memberships, route access, navigation access, settings/deletion boundaries
Last updated: 2026-05-23
Primary source of truth: docs/domain-ownership-model.md
```

## Goal

Rebuild the domain/access foundation around the mature model:

```text
User
Agency
Workspace
AgencyMembership
WorkspaceMembership
AgencyWorkspaceRelationship
```

The refactor should remove the old assumption that one global `profile.role`
or `profile.client_id` can describe everything a person is allowed to do.

This is not a page polish refactor. Pages can stay thin adapters for now. The
important work is to make the data and permission foundation correct so pages,
sidebars, settings, and future clinic workflows can be added safely later.

## Current Architecture Audit

### What is already worth keeping

Keep these foundations:

```text
- layered src structure: app -> pages -> widgets -> features -> entities -> shared
- route metadata centralized in src/app/routing/routeDefinitions.jsx
- dataClient read/write boundary
- localStorage repository as replaceable adapter
- repository schema/access/RLS manifests
- domain services for read models and mutations
- explicit client-facing workflow records such as ClientWorkItem, NeededFromClient, ClientRequest, Report, DashboardLink
- clinic aggregate records and publish-state gates
- account settings separated from workspace settings at UI level
```

These parts are imperfect but directionally compatible with the target
architecture.

### What is architecturally wrong today

The current access model is still legacy role/profile driven:

```text
- `viewer.role` is used as a global role.
- `viewer.clientId` / `viewer.clientIds` are used as access proof.
- `viewer.agencyId` is used as agency scope proof.
- route metadata uses `allowedRoles` / `navAllowedRoles`.
- many domain services contain local `assertAgencyAdmin` or role checks.
- current `clients` records are really workspaces.
- current `workspace_memberships` records are really workspace memberships.
- agency is implicit through `agency_id`; there is no first-class Agency entity.
- agency membership is implicit through profile fields; there is no first-class AgencyMembership entity.
- profile still mixes identity, role, agency, and workspace fallback access.
```

Audit counts from the current codebase, excluding tests:

```text
viewer.role / profile.role / USER_ROLES / allowedRoles references: 268
viewer.clientId/clientIds/profile client fallback/agencyId coupling references: 83
local assert/access helper references in domain/features/pages: 144
clients/workspace_memberships/profiles/client_id/agency_id references in app/domain/entities: 561
```

Conclusion:

```text
This should not be fixed by tweaking sidebar buttons or hiding routes.
The foundation must be changed first.
```

## Refactor Strategy

Do not rewrite the whole product.

Do replace the identity/access abstractions.

Recommended strategy:

```text
Keep:
  - workflow entities
  - clinic read models
  - reports/dashboards/actions/requests records
  - repository/dataClient infrastructure
  - current pages as temporary consumers

Replace:
  - profile-as-role authority
  - client-as-final-domain-name authority
  - workspace_memberships as the only membership vocabulary
  - role-based route gates
  - scattered service-level role assertions

Add:
  - first-class agency model
  - first-class agency membership model
  - first-class workspace model alias/adapter
  - first-class workspace membership model
  - agency-workspace relationship model
  - membership-derived viewer access context
  - capability-based route/nav/action policies
```

It is acceptable to delete or replace the old identity/access entity modules
once compatibility tests are in place. It is not necessary to delete mature
workflow entities like `client-work-item`, `needed-from-client`, `report`,
`dashboard-link`, or clinic aggregate models.

## Target Architecture

### Target viewer shape

The mature runtime viewer should look like this:

```text
viewer:
  user:
    id
    profileId
    name
    email
    status

  agencyMemberships:
    - id
      agencyId
      role
      status
      capabilities[]

  workspaceMemberships:
    - id
      workspaceId
      role
      status
      capabilities[]

  managedWorkspaceRelationships:
    - id
      agencyId
      workspaceId
      status
      capabilities[] or service scope

  activeAgencyId
  activeWorkspaceId
```

Legacy viewer fields such as `role`, `agencyId`, `clientId`, and `clientIds`
must not exist on the runtime viewer. Access is membership-derived only.

### Target route metadata

Move from:

```text
allowedRoles
navAllowedRoles
requiredCapabilities
```

Toward:

```text
access:
  scope: public | account | agency | workspace | agency_workspace | team_ops
  agencyCapabilities[]
  workspaceCapabilities[]
  workspaceTypes[]
  audience: agency | workspace_member | account_owner

navigation:
  scope: agency | clientPortal | teamOps | workspaceAdmin
  visibleWhen
```

Route access and navigation visibility must remain separate.

### Target repository vocabulary

Current workflow storage can stay compatible during migration, but the domain should move
toward:

```text
users / profiles
auth_credentials
agencies
agency_memberships
workspaces
workspace_memberships
agency_workspace_relationships
workspace_invitations
workspace_activity_events
```

Legacy compatibility mapping:

```text
legacy clients -> workspaces migration input only
legacy client_memberships -> workspace_memberships migration input only
legacy client_invitations -> workspace_invitations migration input only
client_id -> workspace_id at domain boundary
agency_id on workspace -> compatibility shortcut until relationships exist
```

## Implementation Plan

### Phase 0 - Refactor guardrails

```text
[x] Keep product pages functionally stable during the foundation refactor.
[x] Avoid UI/sidebar polish unless needed to consume the new access model.
[x] Keep old workflow `client` storage keys working until service migration is complete.
[x] Add tests before deleting old access behavior.
[x] Use `docs/domain-ownership-model.md` as the source of truth for ownership decisions.
```

Deliverables:

```text
[x] This plan exists and is linked from project status.
[x] A short compatibility note is added to backend/integration docs if needed.
```

### Phase 1 - Add mature identity/access entities

Add new entity modules first, then remove legacy authority once consumers are migrated.

```text
[x] Add `src/entities/user/model.js`.
[x] Add `src/entities/agency/model.js`.
[x] Add `src/entities/workspace/model.js`.
[x] Add `src/entities/agency-membership/model.js`.
[x] Add `src/entities/workspace-membership/model.js`.
[x] Add `src/entities/agency-workspace-relationship/model.js`.
[x] Export stable roles, statuses, capabilities, labels, tones, and normalization helpers.
[x] Keep old `client` exports as storage compatibility shims for now.
[x] Replace and delete old `client-membership` exports after workspace membership consumers are migrated.
[x] Remove role/capability authority from `profile`.
```

Implementation notes:

```text
- `User` owns personal identity only.
- `Workspace` should wrap current client status/type metadata initially.
- `WorkspaceMembership` should support clinic roles and generic roles.
- Capabilities should be first-class constants, not implicit role behavior.
```

Verification:

```text
[x] Entity/access tests cover membership-derived capability derivation.
```

### Phase 2 - Extend repository schema and seed data

Add first-class collections while keeping old collections available.

```text
[x] Add `agencies` to repository contract/schema.
[x] Add `agency_memberships` to repository contract/schema.
[x] Add `workspaces` alias or compatibility adapter for `clients`.
[x] Add `workspace_memberships` alias or compatibility adapter for `workspace_memberships`.
[x] Expose `workspaceMemberships` as the repository key for persisted `workspace_memberships`.
[x] Expose `workspaceInvitations` as the repository key for persisted `workspace_invitations`.
[x] Add `agency_workspace_relationships`.
[x] Update repository access/RLS manifests for the new collections.
[x] Seed GrowthLab as an agency record.
[x] Seed current agency admin/team users through `agency_memberships`.
[x] Seed current clients as workspace-compatible records through the workspace adapter.
[x] Seed current `workspace_memberships` as workspace memberships.
[x] Seed current `client.agency_id` relationships as `agency_workspace_relationships`.
```

Decision:

```text
Do not immediately rename every persisted `client_id` column in workflow tables.
Use domain adapters to expose `workspaceId` while storage remains compatible.
```

Verification:

```text
[x] Repository contract tests pass with new collections.
[x] Schema manifest tests cover agency/workspace relationship requirements.
[x] Access/RLS manifest tests cover agency and workspace relationship checks.
```

### Phase 3 - Build membership-derived access context

Create a single domain service responsible for turning a signed-in user into
access context.

```text
[x] Add `src/domain/services/viewerAccessContextService.js`.
[x] Build viewer from user/profile + agency memberships + workspace memberships + agency-workspace relationships.
[x] Expose helper selectors for active agency/workspace.
[x] Expose capability evaluators for agency scope and workspace scope.
[x] Remove legacy viewer authority fields from the runtime viewer.
[x] Update `authService.buildViewerFromProfile` to delegate to the new access context builder.
[x] Update `authRuntime` so `runtime.defaultClientId` becomes compatibility output from active workspace.
```

Target helpers:

```text
getUserId(viewer)
getActiveAgencyId(viewer)
getActiveWorkspaceId(viewer)
listAccessibleWorkspaceIds(viewer)
listManagedWorkspaceIds(viewer)
hasAgencyCapability(viewer, capability, agencyId)
hasWorkspaceCapability(viewer, capability, workspaceId)
canManageWorkspace(viewer, workspaceId)
canViewWorkspacePortal(viewer, workspaceId)
```

Verification:

```text
[x] Tests prove workspace access disappears when workspace membership is removed.
[x] Tests prove agency workspace management requires agency membership plus active relationship.
[x] Tests prove profile fallback fields do not grant client portal access.
[x] Tests preserve current demo login behavior through compatibility mapping.
```

### Phase 4 - Centralize policies

Replace scattered role checks with domain policies.

```text
[x] Replace `accessPolicy.canAccessClient` with workspace-oriented helpers.
[x] Add agency access policy helpers.
[x] Add workspace access policy helpers.
[x] Add route/action capability helpers.
[x] Add `canAccessWorkspaceResource` as the production resource access helper.
[x] Replace local `assertAgencyAdmin` copies in migrated services with shared policy assertions.
[x] Replace `isClientPortalRole(viewer.role)` checks in services/pages with workspace membership/capability checks.
[x] Keep compatibility wrappers named `canAccessClient` only where needed during migration.
```

High-priority services to migrate first:

```text
[x] authService
[x] routeAccessContextService
[x] adminClientService
[x] clientMembershipService
[x] clientSettingsService
[x] accountLifecycleService
[x] taskWorkspaceService
[x] teamTaskService
```

Verification:

```text
[ ] Policy tests cover agency owner/admin/team, clinic owner, doctor reviewer, front desk, finance, viewer.
[x] Mutation services deny access through removed memberships in migrated workflow tests.
[x] Existing service tests are updated to use membership fixtures instead of global role-only viewers where access is asserted.
```

### Phase 5 - Refactor route access and navigation

Do this after the viewer access context is stable.

```text
[x] Introduce access audience policy alongside old route naming.
[x] Update route access to use membership/capability context.
[x] Update `canAccessRouteWithContext` to use workspace access helpers.
[x] Update `getDefaultNavigationScopeForViewer` to use active memberships, not `viewer.role`.
[x] Update `filterRoutesForNavigation` to use navigation scope and capability predicates.
[x] Remove runtime dependency on `allowedRoles` as global user-role authority.
[x] Update `ProtectedRoute` to use access context, not repository/client fallback logic.
[x] Update `RootLayout` to derive workspace switcher availability from agency membership and managed relationships.
[x] Rename route metadata from role vocabulary to `accessAudiences` and `navigationAudiences`.
[x] Remove `ProtectedRoute` compatibility props for legacy role arrays.
```

Navigation rules:

```text
- Account settings must always be reachable for signed-in users.
- Workspace settings must show only inside workspace/client portal context.
- Agency workspace admin navigation must show only for agency users managing a selected workspace.
- Team ops navigation must be based on agency membership/capabilities.
- Route access can be broader than sidebar visibility.
```

Verification:

```text
[x] Route access tests cover account, agency, workspace portal, clinic capability routes, team ops.
[x] Sidebar/navigation tests cover agency admin, agency team, clinic owner, doctor reviewer, front desk, finance, viewer through membership-derived route/navigation tests.
```

### Phase 6 - Migrate domain services from client naming to workspace semantics

Do this service by service, not by bulk rename.

```text
[x] Introduce workspace service aliases for current client services.
[ ] Rename service parameters internally from `clientId` to `workspaceId` where safe.
[ ] Keep route/query params as `clientId` until URLs are deliberately changed.
[x] Keep repository storage methods such as `listByClientId` until storage migration.
[x] Add adapter helpers that map `workspaceId` to persisted `client_id`.
[x] Add `listByWorkspaceId` as the standard repository workspace-scope lookup method.
[x] Move production domain identity lookups from `repositories.clients.findById/list()` to `repositories.workspaces.findById/list()`.
[x] Update domain test repositories to expose explicit workspace adapters instead of relying on client-only fixtures.
[x] Move production domain workspace mutations/listing from `repositories.clients` to `repositories.workspaces`.
[x] Move production domain/feature workspace-scope collection reads from `listByClientId` to `listByWorkspaceId`.
[ ] Update admin client workspace services to say workspace in domain names where possible.
```

Suggested migration order:

```text
[x] clientSettingsService -> workspaceSettingsService or compatibility wrapper.
[x] clientMembershipService consumes workspace membership repositories and workspace role/status constants internally.
[x] adminClientService -> agencyWorkspaceService.
[x] routeAccessContextService consumes workspace repositories internally.
[ ] taskWorkspaceService/teamTaskService -> agency work services with workspace relationship checks.
[x] client-facing read services consume workspace repositories for workspace identity after access policies are stable.
```

Verification:

```text
[ ] No page imports repository data directly.
[x] No domain service grants access from profile fallback fields.
[x] Search count for new `viewer.role` usages is zero outside negative tests.
[x] Search count for production `repositories.clients.findById/list()` usages in domain services is zero.
[x] Search count for production `repositories.clients` usages in domain services is zero.
[x] Search count for production `listByClientId` usages outside repository compatibility is zero.
```

### Phase 7 - Settings and deletion lifecycle hardening

Align account, workspace, and agency lifecycle boundaries.

```text
[x] Account settings uses user-owned services only.
[x] Workspace settings uses workspace membership capabilities.
[ ] Workspace deletion request is separate from account deactivation.
[ ] Agency deletion remains out of scope or isolated behind agency owner capability.
[ ] Removing a member does not delete the user profile.
[ ] Deactivating a user preserves historical actor references.
[x] Last owner/admin protections use memberships, not profile.role.
```

Verification:

```text
[x] Tests cover deactivate own account.
[x] Tests cover leave workspace.
[x] Tests cover request workspace deletion.
[x] Tests cover removing a workspace member.
[x] Tests cover last owner/admin guards.
```

### Phase 8 - Remove old authority

Only do this after tests prove compatibility behavior.

```text
[x] Remove `profile.role` from access policies.
[x] Remove `profile.client_id` and `profile.client_ids` from access policies.
[x] Remove `profile.agency_id` from access policies.
[x] Remove `viewer.role` dependency from route/navigation policies.
[x] Remove `viewer.clientId/clientIds` dependency from route/navigation policies.
[x] Remove global `USER_ROLES` from mature access code.
[x] Remove display-only legacy role values from login profiles.
[x] Remove demo role switcher support from platform shell and auth layout.
[x] Remove route-level `allowedRoles` / `navAllowedRoles` authority vocabulary.
[x] Remove production imports of `CLIENT_MEMBERSHIP_ROLES` / `CLIENT_MEMBERSHIP_STATUSES` from domain services and active UI features.
[x] Add workspace-native member list and role select entity UI primitives.
[x] Delete the legacy `src/entities/client-membership` module after workspace membership replacement.
[x] Rename access/RLS/server auth contract checks from `client_membership` to `workspace_membership`.
```

Possible deletions:

```text
[x] Delete or reduce `src/entities/profile/model.js` role helpers after replacement.
[x] Delete or reduce `src/entities/client-membership/model.js` after final storage/access-manifest naming cleanup.
[x] Delete route role arrays after access metadata migration.
```

Verification:

```text
[x] `rg "viewer\\.role|profile\\.role|USER_ROLES|isClientPortalRole" src -g"!*.test.*"` returns no mature runtime authority references.
[x] `rg "viewer\\.clientId|viewer\\.clientIds|profile\\.client_id|profile\\.client_ids" src -g"!*.test.*"` returns no mature runtime authority references.
```

### Phase 9 - Storage vocabulary cleanup

This is optional for frontend/localStorage, but required before real backend
schema hardening.

```text
[x] Decide whether persisted table name is `workspaces`, `company_workspaces`, or `client_workspaces`.
[x] Rename or alias `clients` storage.
[x] Alias `workspace_memberships` storage behind the `workspaceMemberships` repository key.
[x] Alias `workspace_invitations` storage behind the `workspaceInvitations` repository key.
[x] Decide whether workflow tables keep `client_id` as compatibility or migrate to `workspace_id`.
[x] Add migration tests for legacy `clients` localStorage snapshots.
[x] Add migration tests for legacy `client_memberships` / `client_invitations` localStorage snapshots.
[x] Normalize snapshot output so legacy access table keys are removed after migration.
[x] Normalize snapshot output so legacy `clients` table key is removed after migration.
[x] Verify only migration aliases/tests mention legacy `clients`, `client_memberships`, and `client_invitations` storage names.
```

Recommended timing:

```text
Do not do this before Phases 1-8 unless the code is already stable.
Storage renaming is high-churn and lower product value than fixing access semantics.
```

Decision:

```text
Workflow tables keep persisted `client_id` for now as compatibility schema.
Service and repository boundaries should use `workspaceId` / `listByWorkspaceId`
for new code. A physical workflow-column migration to `workspace_id` should wait
for a backend schema migration plan because it touches reports, dashboards,
tasks, updates, clinic metrics, requests, and audit history at once.
```

### Phase 10 - Final verification

Run after each major phase:

```text
[x] npx eslint src
[x] npm test -- --run
[x] npm run build
```

Run after route/sidebar/access changes:

```text
[x] Add or update e2e coverage for role/membership transitions.
[x] Verify client portal access revocation.
[x] Verify account settings reachability for all signed-in user types.
[x] Verify workspace settings reachability only for allowed workspace members.
[x] Verify agency admin can manage only agency-related workspaces.
```

## Files Expected To Change

High-confidence files:

```text
src/entities/profile/model.js
src/entities/client/model.js
src/entities/client-membership/model.js
src/app/providers/auth/authRuntime.js
src/domain/services/authService.js
src/domain/services/authSessionContractService.js
src/domain/policies/accessPolicy.js
src/app/routing/roleAccess.js
src/app/routing/ProtectedRoute.jsx
src/app/routing/routeDefinitions.jsx
src/app/layout/RootLayout.jsx
src/shared/layout/AppSidebar.jsx
src/domain/services/adminClientService.js
src/domain/services/clientMembershipService.js
src/domain/services/clientSettingsService.js
src/domain/services/accountLifecycleService.js
src/domain/services/taskWorkspaceService.js
src/domain/services/teamTaskService.js
src/app/providers/repositories/portalRepositoryContract.js
src/app/providers/repositories/portalRepositorySchema.js
src/app/providers/repositories/portalRepositoryAccessManifest.js
src/app/providers/repositories/portalRepositoryRlsPolicyManifest.js
src/app/providers/repositories/portalSeedData.js
```

Likely new files:

```text
src/entities/user/model.js
src/entities/agency/model.js
src/entities/workspace/model.js
src/entities/agency-membership/model.js
src/entities/workspace-membership/model.js
src/entities/agency-workspace-relationship/model.js
src/domain/services/viewerAccessContextService.js
src/domain/policies/agencyAccessPolicy.js
src/domain/policies/workspaceAccessPolicy.js
src/domain/policies/routeAccessPolicy.js
```

## What Not To Do First

Do not start with:

```text
- redesigning pages
- polishing sidebar visuals
- renaming every `clientId` string in one bulk patch
- deleting workflow entities that already represent useful business records
- replacing repository/dataClient infrastructure
- moving clinic metrics into user or agency records
- keeping global profile role checks and just adding more special cases
```

## Recommended First Implementation Step

Start with:

```text
Phase 1 + Phase 3 foundation slice:

1. Add mature entity model constants/helpers.
2. Add agency/workspace membership seed compatibility.
3. Add viewerAccessContextService.
4. Update authService to build a membership-derived viewer without legacy authority fields.
5. Add tests proving membership revocation controls access.
```

This gives the rest of the refactor a clean access object to consume. Without
that, route/sidebar/settings changes will keep depending on the old broken
profile-role model.
