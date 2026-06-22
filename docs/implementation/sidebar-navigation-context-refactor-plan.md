# Sidebar Navigation Context Refactor Plan

```text
Document type: Implementation plan
Status date: 2026-05-20
Scope: route metadata, sidebar navigation policy, agency/client workspace navigation, tests
Goal: make sidebar navigation represent the current container instead of every route a user can access
```

## Current Problem

The sidebar navigation is too close to route access.

Current behavior:

```text
- Agency admin can access all clinic reporting capabilities.
- Navigation filtering includes all role/capability-accessible routes for non-client roles.
- General agency mode can show clinic/client-context destinations such as Growth Review, Clinic Operator, and Daily Operations.
- Admin client workspace navigation is separately generated, but the general fallback navigation still leaks contextual routes.
```

The architectural problem:

```text
allowedRoles / requiredCapabilities answer access.
showInNav currently behaves like global visibility.
The sidebar needs container-aware visibility.
```

Required rule:

```text
The sidebar should show stable destinations for the current container, not every route the user has permission to access.
```

## Target Model

Define navigation as a container-specific projection:

```text
agency:
  Accounts
  Tasks
  Dashboards
  Performance
  Reports

adminClientWorkspace:
  Overview
  Projects
  Actions
  Requests
  Clinic Results / Reports & Dashboards
  Files & Links
  Access
  Activity
  Clinic Setup for clinic clients

clientPortal:
  Overview
  Action Needed
  Projects or clinic-specific performance destinations
  Reports
  Requests
  Files
  Updates
  Settings

teamOps:
  Team Tasks
  Team/clinic operational destinations explicitly owned by agency operations
```

## Architecture Decisions

- [ ] Keep `allowedRoles` and `requiredCapabilities` as route access metadata only.
- [ ] Add explicit navigation context metadata for route-defined sidebar destinations.
- [ ] Use `showInNav: false` only for routes that should never appear in route-defined sidebar lists.
- [ ] Do not make `AppSidebar` infer business context from labels, paths, or role names.
- [ ] Let `RootLayout` or a routing/navigation helper choose the active navigation container.
- [ ] Let `AppSidebar` render prepared items and own only layout, grouping, active state, and shell behavior.
- [ ] Preserve `getClientWorkspaceSidebarItems(...)` as the source for selected admin client workspace navigation.

Recommended route metadata:

```js
navigationScope: 'agency' | 'clientPortal' | 'teamOps'
```

Admin client workspace routes can stay hidden from route-defined nav because they are generated from `clientWorkspaceNavigation.js`.

## Implementation Checklist

### Phase 1 - Baseline

- [ ] Confirm the working tree and identify unrelated dirty files before edits.
- [ ] Read `AGENTS.md`, `src/AGENTS.md`, `src/app/AGENTS.md`, and nearest layer instructions for touched files.
- [ ] Capture current agency admin general nav from `roleAccess.test.js`.
- [ ] Confirm admin client workspace nav still comes from `getClientWorkspaceSidebarItems(...)`.
- [ ] Identify all visible route-defined nav routes and assign intended navigation scope.

### Phase 2 - Route Metadata

- [ ] Add navigation-scope constants in the routing layer.
- [ ] Mark agency-wide routes with `navigationScope: 'agency'`:
  - [ ] `admin-clients`
  - [ ] `admin-tasks`
  - [ ] `admin-dashboard-links`
  - [ ] `admin-performance-dashboards`
  - [ ] `admin-reports`
- [ ] Mark client portal route-defined destinations with `navigationScope: 'clientPortal'`.
- [ ] Mark agency team operational routes with `navigationScope: 'teamOps'` only when they are intended as team operations navigation.
- [ ] Keep admin client workspace routes `showInNav: false`.
- [ ] Keep preview, editor, legacy, auth, and inactive routes hidden from primary navigation.

### Phase 3 - Navigation Policy

- [ ] Split route access helpers from navigation helpers if the file becomes unclear.
- [ ] Update `filterRoutesForNavigation` to accept a `navigationScope` or `container` argument.
- [ ] For general agency mode, return only routes with `navigationScope: 'agency'`.
- [ ] For client portal mode, return only routes with `navigationScope: 'clientPortal'` after role, capability, client type, and membership checks.
- [ ] For team operations mode, return only routes with `navigationScope: 'teamOps'`.
- [ ] Do not show contextual clinic routes in agency nav just because `AGENCY_ADMIN` has default clinic capabilities.
- [ ] Preserve sorting by `navGroup.order`, `navOrder`, and declaration order.

### Phase 4 - App Shell Integration

- [ ] In `RootLayout`, derive the active navigation container from route context:
  - [ ] selected admin client workspace route with selected client = admin client workspace items
  - [ ] agency admin general routes = agency scope
  - [ ] client portal routes = client portal scope
  - [ ] agency team routes = team operations scope
- [ ] Pass the chosen container/scope to the navigation filter.
- [ ] Keep workspace switcher visibility independent from route-defined nav filtering.
- [ ] Ensure exiting a client workspace returns agency admin to the agency sidebar.

### Phase 5 - Tests

- [ ] Update routing unit tests so agency admin general nav equals:
  - [ ] `admin-clients`
  - [ ] `admin-tasks`
  - [ ] `admin-dashboard-links`
  - [ ] `admin-performance-dashboards`
  - [ ] `admin-reports`
- [ ] Add negative assertions that agency admin general nav does not contain:
  - [ ] `dental-growth-review`
  - [ ] `team-clinic-operator`
  - [ ] `clinic-daily-ops`
  - [ ] any `admin-client-*` workspace route
- [ ] Keep or add tests proving direct authorized route access still works where intended.
- [ ] Keep client admin/team navigation tests intact.
- [ ] Add a focused test for team operations nav if `teamOps` is introduced.
- [ ] Add or update e2e coverage only if unit coverage cannot prove the sidebar container behavior.

### Phase 6 - Verification

- [ ] Run focused routing tests:

```text
npx vitest run src/app/routing/roleAccess.test.js
```

- [ ] Run lint for touched source files:

```text
npx eslint src/app/routing src/app/layout
```

- [ ] Run build after source changes:

```text
npm run build
```

- [ ] Do not run browser verification unless explicitly requested.

## Acceptance Criteria

- [ ] General agency sidebar shows only agency-wide destinations.
- [ ] Agency admin can still enter a client workspace and see client workspace navigation there.
- [ ] Client/clinic-context routes do not leak into the general agency sidebar.
- [ ] Authorized direct route access still follows route access policy.
- [ ] Sidebar rendering remains generic and does not hardcode route IDs except for existing settings/footer behavior.
- [ ] Tests document the distinction between access and navigation.

## Non-Goals

- [ ] Do not redesign the sidebar visual style.
- [ ] Do not remove authorized direct access to existing routes unless a product rule requires it.
- [ ] Do not move client workspace navigation into route definitions during this refactor.
- [ ] Do not introduce separate role-specific app shells unless workflows truly diverge.
- [ ] Do not touch account/profile/settings behavior as part of this navigation-scope fix.
