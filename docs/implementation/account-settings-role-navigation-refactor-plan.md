# Account Settings, Role Navigation, and Lifecycle Refactor Plan

```text
Document type: Implementation plan
Status date: 2026-05-20
Scope: roles, routes, sidebar, account settings, workspace settings, profile lifecycle, business lifecycle
Goal: every authenticated user can reach the pages and actions they generally need without leaking admin/client-only workflows
```

## Current Problem

The app already has a mature client portal and admin client workspace, but identity, workspace settings, and lifecycle actions are still mixed or incomplete.

Current shape:

```text
- /client/settings owns profile, company, team, notification placeholders, and security placeholders.
- Sidebar footer exposes Settings only by finding the client-settings route.
- Agency admin and agency team users have no real account/profile settings page.
- Client users can update profile name/email but cannot deactivate/delete their profile.
- Client team users can be removed by an admin, but cannot leave a workspace themselves.
- Client admins can manage teammates, but cannot request business/account deletion from client settings.
- Admins can delete a client account from /admin/clients.
- Route guards check role/capability, but client type availability is mostly navigation-only.
```

The architectural issue is not only missing buttons. The issue is ownership:

```text
Account settings = user identity and security.
Client settings = selected client workspace/company/team preferences.
Admin account management = agency-owned client lifecycle.
```

These must be separated before adding more role-specific pages.

## Target Product Model

```text
Authenticated App
+-- Account Settings
|   +-- Profile
|   +-- Security
|   +-- Appearance
|   +-- Notifications
|   +-- Deactivate account
|
+-- Client Workspace Settings
|   +-- Company
|   +-- Team
|   +-- Access / leave workspace
|   +-- Business deletion request
|
+-- Admin Client Management
    +-- Create account
    +-- Edit account
    +-- Manage access
    +-- Delete account
```

## Role Requirements

| Role | Must reach | Must be able to do |
| --- | --- | --- |
| Agency admin | Admin accounts, tasks, reports, dashboards, client workspaces, own account settings | Manage clients, delete client accounts, manage client access, update own profile/security |
| Agency team | Team tasks, allowed clinic operational dashboards, own account settings | Update assigned tasks, prepare client-safe summaries, update own profile/security |
| Client admin | Client portal, client workspace settings, own account settings | Update own profile, manage client teammates, request business deletion, leave workspace only if not last owner |
| Client team | Allowed client portal surfaces, own account settings, limited client workspace settings | Update own profile, leave workspace, view company/team context, no teammate invite unless promoted |
| Capability-limited clinic staff | Capability-specific surfaces, own account settings | Use assigned operational workflows, update own profile, leave workspace |

## Implementation Checklist

### Phase 0 - Baseline And Safety

- [x] Confirm current working tree state before implementation and avoid unrelated dirty files.
- [x] Run focused baseline tests for routing and account profile access.
- [x] Record current role navigation behavior in the plan before changing it.
- [x] Identify all existing direct links to `/client/settings` and decide whether they mean account settings or workspace settings.

Verification:

```text
npx vitest run src/app/routing/roleAccess.test.js src/domain/services/clientSettingsService.test.js src/domain/policies/clientTeamPolicy.test.js src/domain/services/clientMembershipService.test.js
```

### Phase 1 - Account Settings Route For All Roles

- [x] Add `/account/settings` route metadata.
- [x] Allow `AGENCY_ADMIN`, `AGENCY_TEAM`, `CLIENT_ADMIN`, and `CLIENT_TEAM`.
- [x] Add route page shell under `src/pages/account/settings`.
- [x] Add widget ownership under `src/widgets/account-settings`.
- [x] Keep profile update workflow in `src/features/account-profile-settings`.
- [x] Add domain service ownership under `src/domain/services/accountProfileService.js`.
- [x] Route page must use `runtime.dataClient.read/write`.
- [x] Reuse existing profile form behavior instead of duplicating validation locally.
- [x] Mirror appearance controls without duplicate state logic by using shared `useTheme`.
- [x] Add sidebar/footer account settings entry that is available for authenticated non-client workspace roles.
- [x] Keep logout in account menu.

Target sections:

```text
Profile
Security
Appearance
Notifications
Danger zone
```

Acceptance:

- [x] Agency admin can open account settings from sidebar/footer or account menu.
- [x] Agency team can open account settings.
- [x] Client admin can open account settings.
- [x] Client team can open account settings, including capability-limited clinic staff.
- [x] Name/email update persists for all roles.
- [x] Account settings never shows client business/team management controls.

### Phase 2 - Separate Client Workspace Settings

- [x] Remove profile editing from `/client/settings`.
- [x] Keep `/client/settings` focused on selected client workspace.
- [x] Rename visible sections if needed:
  - [x] Company
  - [x] Team
  - [x] Hide workspace notifications until workspace-level preferences exist
  - [x] Access
  - [x] Business deletion request
- [x] Ensure client settings reads selected `clientId` through domain access checks.
- [x] Keep client team management only in workspace settings.
- [x] Keep client profile/security only in `/account/settings`.

Acceptance:

- [x] `/client/settings` no longer edits personal profile.
- [x] `/client/settings` still shows company/workspace context.
- [x] Client admin can invite teammate from workspace settings.
- [x] Client team can view team/company context but cannot invite teammates.
- [x] Client settings never exposes agency admin controls.

### Phase 3 - Role Navigation Policy Cleanup

- [x] Replace capability-presence-based client navigation filtering with explicit role navigation presets.
- [x] Define nav policy for `CLIENT_ADMIN`.
- [x] Define nav policy for default `CLIENT_TEAM`.
- [x] Define nav policy for capability-limited clinic staff.
- [x] Ensure account settings is always reachable outside capability filtering.
- [x] Keep client workspace settings reachable according to role policy.
- [x] Update `roleAccess.test.js` with explicit expected nav ids for each role shape.

Target behavior:

```text
CLIENT_ADMIN:
  Full client portal + client workspace settings + account settings.

CLIENT_TEAM:
  Limited client portal + client workspace settings read context + account settings.

CLIENT_TEAM with DENTAL_GROWTH_REVIEW_VIEW:
  Growth Review + account settings + minimal workspace context.
```

Acceptance:

- [x] Plain client team member does not accidentally receive full client admin navigation.
- [x] Capability-limited clinic staff do not lose account/workspace settings.
- [x] Client admin keeps full expected client portal navigation.
- [x] Agency team/admin navigation remains stable.

### Phase 4 - Route Context Guard

- [x] Extend route access beyond role/capability to include route context where needed.
- [x] Enforce `clientTypes` and `excludeClientTypes` at access level, not just sidebar filtering.
- [x] Ensure client-facing routes verify membership for the requested `clientId`.
- [x] Ensure capability route access still depends on capabilities after direct URL entry.
- [x] Keep admin preview routes admin-only.
- [x] Add route guard tests for direct URL access.

Acceptance:

- [x] Generic client cannot directly open clinic-only client routes.
- [x] Clinic client cannot directly open generic-only client routes.
- [x] Client user cannot open another client by changing URL params.
- [x] Capability-limited user cannot open unassigned capability routes by direct URL.
- [x] Admin preview routes remain inaccessible to clients.

### Phase 5 - Profile Deactivation / Deletion

- [x] Decide product behavior: soft deactivate first, hard delete later.
- [x] Add account lifecycle domain service.
- [x] Add `deactivateOwnProfile`.
- [x] Clear auth session after successful deactivation.
- [x] Preserve audit/history references without exposing deactivated user PII unnecessarily.
- [x] Prevent deactivation if it would leave a client workspace without an owner, unless ownership is transferred first.
- [x] Add confirmation dialog in `/account/settings` danger zone.
- [x] Add tests for deactivation permissions and session clearing.

Recommended first implementation:

```text
Soft deactivate:
- set profile.status = inactive
- optionally anonymize display fields later
- remove active memberships only when explicitly leaving workspaces
- block login for inactive profile
```

Acceptance:

- [x] User can deactivate own account from account settings.
- [x] User is signed out after deactivation.
- [x] Deactivated user cannot sign in.
- [x] Last client owner cannot deactivate without transfer/explicit admin intervention.
- [x] Agency admin cannot accidentally delete their own profile if it is the only agency admin.

### Phase 6 - Leave Workspace

- [x] Add `leaveClientWorkspace({ clientId, viewer })`.
- [x] Allow client team users to leave their workspace.
- [x] Allow client admins to leave only if another owner remains.
- [x] Remove active membership access, not historical records.
- [x] Clear or redirect session if the user no longer has any accessible client.
- [x] Add UI in `/client/settings` Access section or `/account/settings` workspace memberships section.

Acceptance:

- [x] Client team user can leave workspace.
- [x] Client admin cannot leave if they are the last owner.
- [x] Client admin can leave if another owner exists.
- [x] Leaving workspace immediately removes access to that client.
- [x] User with no remaining client memberships lands on a controlled no-access state.

### Phase 7 - Business Deletion Request

- [x] Add client-side business deletion request, not immediate destructive delete.
- [x] Put request in `/client/settings` for client admins only.
- [x] Create a request/action visible to agency admin.
- [x] Do not delete client records automatically from client-side UI.
- [x] Keep existing admin destructive delete in `/admin/clients`.
- [x] Add audit event for business deletion request.

Acceptance:

- [x] Client admin can request account/business deletion.
- [x] Client team cannot request business deletion.
- [x] Agency admin sees the request in admin client requests/activity.
- [x] No records are deleted until agency admin performs destructive delete.

### Phase 8 - Security And Notifications

- [x] Replace unavailable Security placeholder with minimum password change flow.
- [x] Add current password + new password + confirm password validation.
- [x] Keep credential logic in auth/domain service.
- [x] Replace unavailable Notifications placeholder with explicit preference model or hide the section.
- [x] Store notification preferences through persisted profile records.
- [x] Hide unavailable Sessions placeholder until session metadata exists.

Acceptance:

- [x] User can change password.
- [x] Old password no longer works.
- [x] New password works.
- [x] Notification section either works or is not visible.

### Phase 9 - E2E Coverage

- [x] Add e2e: agency admin reaches account settings and updates profile.
- [x] Add e2e: agency team reaches account settings and updates profile.
- [x] Add e2e: client admin account settings and client workspace settings are separate.
- [x] Add e2e: client team cannot invite teammates but can reach account settings.
- [x] Add e2e: capability-limited clinic staff can reach account settings.
- [x] Add e2e: direct route access blocks wrong client type.
- [x] Add e2e: leave workspace removes access.
- [x] Add e2e: client admin business deletion request creates admin-visible request.
- [x] Add e2e: deactivate own account signs user out and blocks future login.
- [x] Add e2e: user can save account notification preferences.

Full verification:

```text
npm run lint
npm test -- --run
npm run build
npx playwright test --workers=1
```

## File Ownership Plan

Expected new files:

```text
src/pages/account/settings/AccountSettingsPage.jsx
src/pages/account/settings/AccountSettingsPageHeader.jsx
src/widgets/account-settings/index.js
src/widgets/account-settings/AccountSettingsWorkspace.jsx
src/features/account-profile-settings/index.js
src/features/account-profile-settings/AccountProfileSettings.jsx
src/domain/services/accountProfileService.js
src/domain/services/accountProfileService.test.js
```

Expected changed files:

```text
src/app/routing/routeDefinitions.jsx
src/app/routing/roleAccess.js
src/app/routing/roleAccess.test.js
src/app/routing/ProtectedRoute.jsx
src/shared/layout/AppSidebar.jsx
src/shared/layout/AccountMenu.jsx
src/widgets/client-settings/ClientSettingsSections.jsx
src/domain/services/clientSettingsService.js
src/domain/services/clientSettingsService.test.js
src/domain/services/clientMembershipService.js
src/domain/services/clientMembershipService.test.js
src/domain/services/authService.js
src/domain/services/authService.test.js
src/app/providers/repositories/portalRepositorySchema.js
src/app/providers/repositories/portalRepositoryAccessManifest.js
src/app/providers/repositories/portalRepositoryRlsPolicyManifest.js
```

## Data Model Additions

Preferred profile lifecycle fields:

```json
{
  "status": "active | inactive",
  "deactivated_at": "datetime | null",
  "deactivated_by": "user_id | null"
}
```

Implemented profile lifecycle fields:

```json
{
  "status": "active | inactive",
  "deactivated_at": "datetime | null",
  "deactivated_by": "user_id | null",
  "updated_at": "datetime"
}
```

Preferred account preferences object:

```json
{
  "user_id": "string",
  "notification_preferences": {
    "email_updates": true,
    "action_needed": true,
    "weekly_summary": false
  }
}
```

Preferred client membership lifecycle fields:

```json
{
  "status": "active | removed",
  "removed_at": "datetime | null",
  "removed_by": "user_id | null"
}
```

Preferred business deletion request object:

```json
{
  "client_id": "string",
  "requested_by": "user_id",
  "reason": "string",
  "status": "open | acknowledged | cancelled | completed",
  "created_at": "datetime"
}
```

Implemented business deletion requests are stored as `client_requests` with:

```json
{
  "request_type": "business_deletion",
  "status": "submitted",
  "submitted_by": "user_id",
  "response_history": [
    {
      "type": "client_submitted"
    }
  ]
}
```

## Non-Goals For This Refactor

- [ ] Do not build billing.
- [ ] Do not implement hard database deletion before backend/RLS is real.
- [ ] Do not turn client settings into admin client management.
- [ ] Do not expose agency-only activity/audit logs to clients.
- [ ] Do not add patient-level clinic data.
- [ ] Do not redesign the whole app shell visually.

## Implementation Order I Will Follow

1. [x] Add account settings domain service and tests.
2. [x] Add `/account/settings` route/page/widget/feature composition.
3. [x] Update sidebar/account menu to make account settings reachable for all authenticated roles.
4. [x] Move personal profile editing out of `/client/settings`.
5. [x] Clean role navigation policy for client admin/team/capability-limited users.
6. [x] Add route context guard tests and implementation.
7. [x] Add leave workspace.
8. [x] Add soft deactivate account.
9. [x] Add business deletion request.
10. [x] Finish or hide remaining notification/session placeholders.
11. [x] Add e2e coverage.
12. [x] Run full verification and update this checklist.
