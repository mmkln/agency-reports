# Minimal Permissions And Routing Architecture Plan

```text
Status: planned
Scope: frontend agency-reports + backend client_portal
Frontend repo: C:\Users\GOD\Documents\GitHub\agency-reports
Backend repo: C:\Users\GOD\Documents\GitHub\client_portal
```

## Goal

Build the smallest clean permission and routing foundation needed for the real backend API contract.

The target is not a broad RBAC platform. The target is enough structure for:

- Django to be the source of truth for session identity and access context.
- Frontend routes and navigation to use backend-provided access context.
- Backend API endpoints to enforce their own permissions.
- Dental Growth Review and workspace-scoped integrations to work without demo/local access fallbacks.

## Current State Summary

### Backend current state

Already exists:

- `accounts.User`
- `workspaces.Workspace`
- `workspaces.WorkspaceMembership`
- workspace roles/capabilities in `workspaces.permissions`
- session auth endpoints:
  - `GET /api/auth/csrf/`
  - `POST /api/auth/login/`
  - `POST /api/auth/logout/`
  - `GET /api/auth/me/`
- workspace-protected Growth Review endpoint:
  - `GET /api/workspaces/<workspace_id>/growth-review/`
- workspace-scoped GHL source connection models:
  - `SourceConnection`
  - `ConnectionCredential`
  - `IncomingEvent`
  - normalized CRM models

Missing:

- `Agency`
- `AgencyMembership`
- `AgencyWorkspaceRelationship`
- agency capabilities
- agency-to-workspace permission helpers
- `/api/auth/me/` access context with agency memberships and managed workspace relationships
- endpoint permissions that support agency operators managing a workspace

### Frontend current state

Already exists:

- Django session auth adapter.
- `mapDjangoUserToViewer()`.
- centralized route metadata.
- `ProtectedRoute`.
- audience/capability-oriented route policy.
- login `next` redirect handling.

Missing or needs correction:

- no demo/local fallback in auth/routing/read models.
- route capability checks must be scoped to workspace or agency, not global `viewer.capabilities`.
- client/workspace route checks must know workspace type.
- route guards should use the backend access contract directly.
- e2e tests must stop depending on local demo login.

## Non-Goals

Do not implement these in this pass:

- full RBAC management UI.
- billing/subscription permissions.
- multi-agency workspace management UI.
- patient-level data access model.
- frontend-only authorization.
- JWT/OAuth.
- direct frontend access to GHL.
- complex custom Django permission tables.

## Target Business Model

```text
User
  identity/login only

Agency
  provider organization / internal operator side

AgencyMembership
  user + agency + role + capabilities

Workspace
  client/clinic/business workspace

WorkspaceMembership
  user + workspace + role + capabilities

AgencyWorkspaceRelationship
  agency + workspace + status
```

## Access Rules

### Agency user managing a workspace

Allowed only if all are true:

```text
1. User is authenticated.
2. User has active AgencyMembership.
3. Agency has active AgencyWorkspaceRelationship with the workspace.
4. User's agency membership grants the required agency capability.
```

### Workspace user opening client portal

Allowed only if all are true:

```text
1. User is authenticated.
2. User has active WorkspaceMembership for the requested workspace.
3. User's workspace membership grants the required workspace capability.
```

### Universal rules

```text
User identity alone grants no business access.
Route query params are requested resource ids, not proof of access.
Frontend guards improve UX but are not the security boundary.
Every backend endpoint must enforce permission independently.
```

## Backend API Contract

### `GET /api/auth/me/`

Return a session access context, not only user identity.

Minimum target shape:

```json
{
  "user": {
    "id": "1",
    "username": "mike",
    "email": "mike@example.com",
    "name": "Mike"
  },
  "agency_memberships": [
    {
      "id": "am_1",
      "agency_id": "agency_1",
      "agency_name": "GrowthLab",
      "role": "agency_admin",
      "status": "active",
      "capabilities": [
        "workspace.manage_relationships",
        "workspace.manage_access",
        "growth_review.view"
      ]
    }
  ],
  "workspace_memberships": [
    {
      "id": "wm_1",
      "workspace_id": "workspace_green_dental",
      "workspace_name": "Green Dental",
      "workspace_slug": "green-dental",
      "workspace_type": "clinic",
      "role": "clinic_owner",
      "status": "active",
      "capabilities": [
        "workspace.view_portal",
        "workspace.manage_settings",
        "dental_growth_review_view"
      ]
    }
  ],
  "managed_workspace_relationships": [
    {
      "id": "awr_1",
      "agency_id": "agency_1",
      "workspace_id": "workspace_green_dental",
      "workspace_name": "Green Dental",
      "workspace_slug": "green-dental",
      "workspace_type": "clinic",
      "status": "active"
    }
  ]
}
```

Important detail:

```text
Capabilities are scoped to memberships.
Frontend may derive a flat list for display only, but access checks must use the scoped membership capability.
```

## Minimal Capability Names

### Agency capabilities

```text
workspace.create
workspace.manage_relationships
workspace.manage_access
growth_review.view
integrations.manage
```

### Workspace capabilities

```text
workspace.view_portal
workspace.manage_settings
workspace.manage_members
workspace.request_deletion
dental_growth_review_view
integrations.view
integrations.manage
```

Keep these as plain strings for now. Do not introduce a database permission table unless real product needs force it.

## Backend Implementation Plan

### Phase 1 - Agency foundation

- [ ] Create `agencies` Django app.
- [ ] Add `Agency` model.
- [ ] Add `AgencyMembership` model.
- [ ] Add `AgencyWorkspaceRelationship` model.
- [ ] Register agency models in Django admin.
- [ ] Add migrations.
- [ ] Add model tests for active/inactive relationships and memberships.

Recommended models:

```python
class Agency(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

```python
class AgencyMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agency_memberships")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    capabilities = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
```

```python
class AgencyWorkspaceRelationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name="workspace_relationships")
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE, related_name="agency_relationships")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
```

### Phase 2 - Workspace metadata

- [ ] Add `Workspace.type`.
- [ ] Define initial workspace types:
  - `clinic`
  - `generic`
- [ ] Include workspace type in admin.
- [ ] Include workspace type in `/api/auth/me/`.
- [ ] Add tests proving clinic-only access context can be derived.

### Phase 3 - Backend permission helpers

- [ ] Add agency capability constants.
- [ ] Add role default capability mapping for agency roles.
- [ ] Add `get_agency_membership_capabilities(membership)`.
- [ ] Add `user_has_agency_capability(user, agency, capability)`.
- [ ] Add `user_can_manage_workspace(user, workspace, capability)`.
- [ ] Keep `user_has_workspace_capability(user, workspace, capability)`.
- [ ] Add tests for:
  - no login -> denied.
  - no agency membership -> denied.
  - inactive agency membership -> denied.
  - inactive agency-workspace relationship -> denied.
  - missing capability -> denied.
  - active membership + relationship + capability -> allowed.

Recommended permission helper:

```python
def user_can_manage_workspace(user, workspace, capability):
    if not user or not user.is_authenticated:
        return False

    relationships = AgencyWorkspaceRelationship.objects.filter(
        workspace=workspace,
        status=AgencyWorkspaceRelationship.STATUS_ACTIVE,
        agency__memberships__user=user,
        agency__memberships__status=AgencyMembership.STATUS_ACTIVE,
    ).select_related("agency")

    return any(
        capability in get_agency_membership_capabilities(relationship.agency.memberships.get(user=user))
        for relationship in relationships
    )
```

Implementation can be optimized later; correctness matters first.

### Phase 4 - `/api/auth/me/` access context

- [ ] Replace current `serialize_user()` shape with explicit `user`, `agency_memberships`, `workspace_memberships`, `managed_workspace_relationships`.
- [ ] Keep frontend-compatible aliases only if needed during one transition commit.
- [ ] Do not return inactive memberships.
- [ ] Do not return removed workspace memberships.
- [ ] Include scoped capabilities on every membership.
- [ ] Include workspace metadata needed for routing:
  - id
  - name
  - slug
  - type
- [ ] Add tests for `/me`:
  - anonymous returns 401.
  - workspace member receives workspace membership with capabilities.
  - agency member receives agency memberships.
  - agency member receives only active managed workspace relationships.
  - inactive/removed memberships are omitted.

### Phase 5 - Endpoint permission contract

- [ ] Keep Growth Review workspace-member permission.
- [ ] Add agency-management permission path to Growth Review.
- [ ] Define Growth Review required agency capability:
  - `growth_review.view`
- [ ] Define Growth Review required workspace capability:
  - `dental_growth_review_view`
- [ ] Add tests:
  - workspace member with capability can read.
  - workspace member without capability gets 403.
  - agency member with relationship + capability can read.
  - agency member without relationship gets 403.
  - agency member with relationship but without capability gets 403.
- [ ] Apply the same permission pattern to integration management endpoints:
  - workspace member with `integrations.manage`
  - or agency member with relationship + `integrations.manage`

## Frontend Implementation Plan

### Phase 6 - Viewer adapter contract

- [x] Update `mapDjangoUserToViewer()` to consume the final `/api/auth/me/` shape.
- [x] Preserve only real API fields, not demo/local profiles.
- [x] Store membership capabilities scoped on memberships.
- [x] Keep derived `viewer.capabilities` only for display/legacy compatibility during transition.
- [x] Include workspace metadata in mapped memberships/relationships:
  - workspace name
  - workspace slug
  - workspace type
- [ ] Add unit tests for:
  - workspace-only user.
  - agency-only user.
  - user with agency management relationship.
  - inactive or missing arrays.

Recommended frontend viewer shape:

```js
{
  userId,
  user: { id, username, email, name },
  agencyMemberships: [
    { id, agencyId, agencyName, role, status, capabilities }
  ],
  workspaceMemberships: [
    { id, workspaceId, workspaceName, workspaceSlug, workspaceType, role, status, capabilities }
  ],
  managedWorkspaceRelationships: [
    { id, agencyId, workspaceId, workspaceName, workspaceSlug, workspaceType, status }
  ],
  activeAgencyId,
  activeWorkspaceId
}
```

### Phase 7 - Route metadata cleanup

- [x] Replace audience-heavy route definitions with minimal route access metadata.
- [x] Keep routes centralized in `routeDefinitions.jsx`.
- [x] Use three access scopes:
  - `public`
  - `account`
  - `agency`
  - `workspace`
- [x] Keep `workspaceTypes` for clinic-only routes.
- [x] Keep scoped route capabilities.

Target examples:

```js
{
  path: '/admin/clients',
  id: 'admin-clients',
  access: {
    scope: 'agency',
    capability: 'workspace.manage_relationships',
  },
}
```

```js
{
  path: '/client/growth-review',
  id: 'dental-growth-review',
  access: {
    scope: 'workspace',
    workspaceTypes: ['clinic'],
    workspaceCapability: 'dental_growth_review_view',
    agencyCapability: 'growth_review.view',
  },
}
```

### Phase 8 - Frontend route policy

- [x] Create one small route policy module.
- [x] Resolve workspace id from:
  1. `routeParams.clientId`
  2. `viewer.activeWorkspaceId`
- [x] Check account routes by `viewer.userId`.
- [x] Check agency routes by active agency membership + scoped agency capability.
- [x] Check workspace routes by:
  - workspace membership + scoped workspace capability
  - OR agency relationship + scoped agency capability
- [x] Check workspace type against membership/relationship metadata.
- [x] If workspace id is missing for a workspace route, deny.
- [x] Do not use local repositories for route authority.
- [x] Do not use global `viewer.capabilities` for route authority.

### Phase 9 - ProtectedRoute behavior

- [x] Keep `ProtectedRoute` thin.
- [x] Behavior:

```text
auth loading -> loading state
no viewer -> /login?next=<current path + query>
route denied -> /access-denied
route allowed -> render children
```

- [x] Avoid backend data reads inside `ProtectedRoute` unless the `/me` contract cannot carry enough access context.
- [x] Remove repository route context fallback.
- [ ] Add tests for:
  - anonymous protected route redirects to login with next.
  - authenticated denied route redirects to access denied.
  - workspace member can open own workspace.
  - workspace member cannot open another workspace by changing `clientId`.
  - agency member can open managed workspace.
  - agency member cannot open unrelated workspace.
  - clinic-only route denies generic workspace.

### Phase 10 - Login redirect policy

- [x] Move home redirect selection into a small pure function.
- [x] Rules:

```text
agency admin/manager/owner with workspace.manage_relationships
  -> /admin/clients

workspace user with dental_growth_review_view on first clinic workspace
  -> /client/growth-review?clientId=<workspace_id>

workspace user without Dental Growth Review
  -> /client/settings?clientId=<workspace_id>

otherwise
  -> /account/settings
```

- [x] `next` param still wins if it is safe.
- [x] Verify `next` target is allowed before navigating.
- [ ] If `next` points to a route the user cannot access, fall back to home route.
- [ ] Add tests for safe next, unsafe next, denied next.

### Phase 11 - Remove demo/local access fallbacks

- [x] Remove Growth Review `demo` data source fallback from production path.
- [x] Remove auth service demo password fallback from active app path.
- [x] Remove localStorage as auth/access authority.
- [ ] Remove demo sessions.
- [ ] Rewrite e2e tests to use backend API contract or mocked backend responses.

## Testing Plan

### Backend tests

- [ ] Agency model tests.
- [ ] Agency membership capability tests.
- [ ] Agency workspace relationship tests.
- [ ] `/api/auth/me/` access context tests.
- [ ] Growth Review permission matrix tests.
- [ ] Integration management permission matrix tests.

### Frontend tests

- [ ] `mapDjangoUserToViewer()` tests.
- [ ] route policy tests.
- [ ] `ProtectedRoute` redirect tests.
- [ ] login redirect tests.
- [ ] e2e smoke test with real backend or controlled API mock:
  - login.
  - access Dental Growth Review.
  - deny unrelated workspace URL.
  - logout.

## Implementation Order

```text
1. Backend agency models.
2. Backend permissions helpers.
3. Backend /api/auth/me/ access context.
4. Backend endpoint permission matrix.
5. Frontend viewer adapter.
6. Frontend scoped route policy.
7. Frontend ProtectedRoute simplification.
8. Frontend login redirect policy.
9. Remove demo/local access fallbacks.
10. Rebuild e2e around real API contract.
```

## Acceptance Criteria

- [ ] Backend `/api/auth/me/` is the frontend source of truth for viewer access context.
- [ ] Frontend does not infer access from username, email, localStorage, seed data, or demo roles.
- [ ] Direct URL access is denied when the viewer lacks scoped workspace/agency access.
- [ ] Clinic-only routes require a clinic workspace type.
- [ ] Growth Review works for authorized workspace members.
- [ ] Growth Review works for authorized agency operators with agency relationship + capability.
- [ ] Backend endpoint permissions pass even if frontend guards are bypassed.
- [ ] Tests cover both allowed and denied route/API paths.

## Key Design Decision

The minimum clean foundation is:

```text
Backend owns access.
Frontend adapts backend viewer context.
Route guards are UX protection.
API permissions are real protection.
Capabilities are scoped to memberships.
No demo/local fallback is treated as authority.
```
