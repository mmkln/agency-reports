# Routing Mode Adapter Plan

Status: implemented  
Scope: frontend routing infrastructure

## Problem

The app uses React Router browser history routes. That is the right URL model for normal hosting, but GitHub Pages does not serve `index.html` for deep links such as `/agency-reports/login`.

The landing page and other copyable links may also generate full browser URLs. When those URLs point to browser-history paths on GitHub Pages, the browser requests a physical path and GitHub Pages returns its own 404.

## Goal

Create one small routing adapter so the app can switch between:

- `browser` routing for normal SPA hosting.
- `hash` routing for GitHub Pages or other static hosts without history fallback.

Application code should continue to use route paths such as:

```text
/login
/account/settings
/client/growth-review?clientId=abc
```

Only the routing adapter should decide whether those paths become:

```text
browser: /agency-reports/login
hash:    /agency-reports/#/login
```

## Design Rules

- Components must not manually add `#`.
- Internal SPA navigation must keep using `Link`, `Navigate`, and `navigate()`.
- Copyable or external app URLs must use shared routing helpers.
- The deployed base path and routing mode are separate concerns.
- GitHub Pages should use hash routing through build mode configuration.
- Normal hosting should keep browser routing by default.

## Files

### New

- [x] `src/shared/routing/routingMode.js`
- [x] `src/app/routing/createAppRouter.jsx`
- [x] `src/shared/routing/appHref.test.js`
- [x] `vite.config.js`

### Changed

- [x] `src/shared/routing/appHref.js`
- [x] `src/shared/routing/index.js`
- [x] `src/app/routing/router.jsx`
- [x] `src/features/admin-client-access/invitationLinks.js`
- [x] `src/features/client-team-management/useClientTeamManagement.js`
- [x] `src/features/accept-client-invitation/AcceptClientInvitation.jsx`
- [x] `package.json`

## Implementation Plan

### 1. Routing Mode Helper

- [x] Add `ROUTING_MODES.BROWSER`.
- [x] Add `ROUTING_MODES.HASH`.
- [x] Add `getRoutingMode()`.
- [x] Add `isHashRouting()`.
- [x] Default to `browser` unless `VITE_ROUTING_MODE=hash`.

### 2. Router Factory

- [x] Add `createAppRouter(routes)`.
- [x] Use `createHashRouter(routes)` when routing mode is `hash`.
- [x] Use `createBrowserRouter(routes, { basename })` when routing mode is `browser`.
- [x] Keep route definitions unchanged.

### 3. Href Adapter

- [x] Keep `getAppHref(path)` as the public helper for browser-visible app URLs.
- [x] Add `getAbsoluteAppHref(path)` for invitation/email/copy links.
- [x] In browser mode, return base-path URLs.
- [x] In hash mode, return base-path plus hash route URLs.
- [x] Preserve query strings and hash fragments inside the app route path.

### 4. Invite Links

- [x] Replace `window.location.origin + import.meta.env.BASE_URL` link construction.
- [x] Use `getAbsoluteAppHref('/accept-invite?token=...')`.

### 5. GitHub Pages Mode

- [x] Configure `vite.config.js` to use `hash` routing for `--mode github-pages`.
- [x] Make `npm run go` build with `--mode github-pages`.
- [x] Keep default `npm run build` as browser routing.

### 6. Tests

- [x] Test browser-mode root href.
- [x] Test browser-mode nested href.
- [x] Test hash-mode root href.
- [x] Test hash-mode nested href.
- [x] Test query strings.
- [x] Test absolute href generation.

## Acceptance Criteria

- [x] `Link to="/login"` and `navigate('/login')` still work without component changes.
- [x] `getAppHref('/login')` returns browser URL in browser mode.
- [x] `getAppHref('/login')` returns hash URL in hash mode.
- [x] Invitation links use hash URLs in GitHub Pages mode.
- [x] GitHub Pages build can be switched to hash routing without changing source components.
- [x] Normal hosting can use browser routing without changing source components.
