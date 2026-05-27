# Frontend Session Auth Implementation Plan

## Goal

Connect the React frontend to the Django session auth API without breaking the existing demo/local auth flow.

Backend contract already exists:

```text
GET  /api/auth/csrf/
POST /api/auth/login/
POST /api/auth/logout/
GET  /api/auth/me/
```

Every request must use:

```ts
credentials: "include"
```

## Current Frontend State

- `AuthProvider` currently builds a local auth client from repository seed data.
- `LoginPage` uses email/password demo login and demo profile buttons.
- `ProtectedRoute` expects a synchronous `viewer`.
- Route access policies expect the rich local viewer shape:
  - agency memberships
  - workspace memberships
  - capabilities
  - active workspace id
- Django `/api/auth/me/` currently returns a simpler user/workspace membership contract.

## Architecture Decision

Add a separate Django session auth adapter instead of deleting local auth immediately.

```text
AuthProvider
  -> local demo auth client OR django session auth client
```

Runtime mode should be selected with an env var:

```text
VITE_AUTH_ADAPTER=local
VITE_AUTH_ADAPTER=django-session
```

Default remains local until the Django-backed frontend path is verified.

## Backend Base URL

Add frontend env var:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For same-origin deployment later, this can become empty or relative.

## Required New Frontend Pieces

- [x] `src/app/providers/auth/djangoSessionAuthClient.js`
  - `getCurrentViewer()`
  - `signInWithEmail({ email, password })`
  - `signOut()`
  - `listLoginProfiles()`
  - `fetchCsrf()`

- [x] `src/app/providers/auth/authApiClient.js`
  - small fetch wrapper
  - base URL handling
  - `credentials: "include"`
  - JSON parsing
  - error handling

- [x] Async-aware `AuthProvider`
  - initial state:
    ```text
    isAuthLoading = true
    viewer = null
    ```
  - bootstrap:
    ```text
    GET /api/auth/me/
    ```
  - anonymous response keeps viewer null.

- [x] Update `ProtectedRoute`
  - if auth loading: show loading state
  - if no viewer after loading: redirect to login
  - preserve current access-denied behavior after viewer exists

- [x] Update `LoginPage`
  - keep existing visual design
  - call `authClient.signInWithEmail`
  - for Django mode, label field as username/email if needed
  - hide demo profile buttons when auth adapter is `django-session`
  - remove demo password hint in Django mode

## Viewer Mapping

Django `/me` response:

```json
{
  "id": "1",
  "username": "admin",
  "email": "admin@example.com",
  "workspaces": [
    {
      "id": "workspace-uuid",
      "name": "Dental Growth Review",
      "slug": "dental-growth-review",
      "role": "owner"
    }
  ]
}
```

Frontend viewer adapter should map this into the minimum shape existing routes expect:

```ts
{
  activeWorkspaceId: firstWorkspace.id,
  email,
  name: username,
  userId: id,
  workspaceMemberships: [
    {
      role,
      workspaceId: workspace.id,
    }
  ],
}
```

For first pass, route capability checks may still need a conservative mapping:

```text
owner -> workspace admin style access
```

If this is not enough for current route policy, add a small compatibility mapper rather than rewriting policies.

## Login Flow

```text
1. User opens frontend.
2. AuthProvider calls GET /api/auth/me/.
3. If 401, viewer remains null.
4. ProtectedRoute redirects to /login.
5. LoginPage calls GET /api/auth/csrf/.
6. LoginPage calls POST /api/auth/login/.
7. Backend sets sessionid cookie.
8. AuthProvider refreshes /me.
9. User is redirected to home route.
```

## Logout Flow

```text
1. User clicks sign out.
2. Frontend calls POST /api/auth/logout/.
3. Backend clears session.
4. AuthProvider clears viewer.
5. Frontend routes to /login.
```

## Tests

- [x] `authApiClient` sends `credentials: "include"`.
- [x] `djangoSessionAuthClient.signInWithEmail` calls CSRF then login.
- [x] `djangoSessionAuthClient.getCurrentViewer` maps `/me` to viewer shape.
- [x] `djangoSessionAuthClient.getCurrentViewer` returns `null` on 401.
- [x] `AuthProvider` shows loading state during bootstrap.
- [x] `ProtectedRoute` does not redirect while auth is loading.
- [x] `LoginPage` hides demo profiles in Django mode.

## Not In This Pass

- [ ] Frontend integration settings UI.
- [ ] CRM contacts UI.
- [ ] Growth Review API integration.
- [ ] JWT.
- [ ] OAuth.
- [ ] Invite/signup/password reset.
- [ ] Full route policy redesign.

## Implementation Order

- [x] Add `authApiClient`.
- [x] Add `djangoSessionAuthClient`.
- [x] Add auth adapter selection in `AuthProvider`.
- [x] Make `AuthProvider` bootstrap async auth state.
- [x] Update `ProtectedRoute` for auth loading.
- [x] Update `LoginPage` for Django mode.
- [x] Add tests.
- [x] Run:
  ```bash
  npm test -- --run
  npm run lint
  npm run build
  ```
