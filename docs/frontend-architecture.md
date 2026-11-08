# Frontend Architecture

Updated: 2026-11-07. This is the working guide for the active API-backed frontend.
See [the system map](architecture/README.md) for implementation details and
[the cleanup report](architecture/frontend-cleanup.md) for deletion evidence.
Older use-case and implementation documents retain product/research history;
they do not establish that an old local-storage workflow is still implemented.

## Runtime And Data Authority

```text
src/main.jsx -> src/App.jsx -> src/app/App.jsx
  branding / metadata / theme / notifications
    AuthProvider -> router -> route adapter -> page

runtime = { apiClient, viewer, defaultClientId }
```

`app/providers/auth` owns login, logout, viewer loading, token rotation and session
expiry. Its browser token adapter persists JWTs in localStorage and supports
legacy sessionStorage migration. Removing the old product repository does not
remove this token adapter or the theme persistence adapter.

`defaultClientId` is a compatibility name used by active route/dashboard code.
An explicit value takes precedence; otherwise it derives from the viewer's
`activeWorkspaceId`. Do not rename it or alter that precedence during cleanup.

Django is authoritative for membership/capabilities, CRM records, dashboard
configuration, explanations, calculations, snapshots and refresh jobs. There is
no local portal repository, snapshot data client or `runtime.dataClient`.

## Layer Ownership

| Layer | Responsibility |
| --- | --- |
| `app` | Composition, auth/session, routing, guards, site variant and root layout |
| `pages` | Route/workspace context and feature/widget composition |
| `widgets` | Product sections and dashboard presentation |
| `features` | Workflow state, forms, drafts, API loading, mutations and polling |
| `entities` | Payload normalization, entity metadata and existing resource API adapters |
| `domain` | Existing API-facing services, frontend policies and route builders |
| `shared` | Generic transport, async resources, UI, charts, layout, icons and theme |
| `components/ui` | Low-level control implementations |

The main dependency direction is `app -> pages -> widgets -> features -> entities
-> shared`, with `domain` as the existing service/policy branch. Follow local
`AGENTS.md` instructions. Do not add upward dependencies for convenience.

API adapters currently exist in `domain/services`, `entities/*/api.js` and some
features. Their consolidation is a later refactoring stage, not already completed.
Use the existing owner for a workflow; do not introduce a second adapter or put
direct HTTP calls into route-page markup.

Pages compose owning features. Feature hooks use `runtime.apiClient` through API
adapters and own loading/error/draft/mutation state. Generic request state may use
`shared/data/useAsyncResource`. Domain models and widgets do not access browser
storage directly. The frontend reflects allowed actions; backend authorization
remains mandatory for every resource and mutation.

## Active Product Areas

- Authentication, account settings, password reset and invitation acceptance.
- Agency clients, client details, workspaces, memberships and invitations.
- Workspace Setup, Data, Access, Review, Lead Report and Executive destinations.
- Campaign configuration and specialized Growth Review dashboards.
- Config-driven Analytics dashboards and Lead Report settings/period selection.
- Executive dashboard and common explanation/contact-collection workflows.

The retired tasks, authored overview/report publishing, clinic demo, external
embed and legacy account flows are not alternative runtimes. Their unused source
was removed; product/research documents describing them are not proof of a live
route. Do not recreate placeholder pages without a requested product workflow.

## Routing And Presentation

`domain/navigation/routePaths.js` owns stable paths and compatibility redirects.
`app/routing` owns route definitions, access metadata, route adapters and guards.
Navigation visibility and resource authorization are separate concerns. Keep
agency/portal resource scope explicit and preserve authorized legacy redirects.

Alpine and Campaign-Level use the same application with build-selected branding,
landing behavior and routing configuration. Do not change build/deploy behavior
as a side effect of moving source files.

Reuse `shared/ui` and low-level primitives rather than making page-local copies.
Keep Growth Review's featured booking, value and activity card variants distinct;
shared metric primitives do not imply one universal business card or dashboard.
Dashboard explanation editing is shared infrastructure with product-owned API
adapters. Settings and display overrides remain backend-owned.

## Verification

After source structure changes, check surviving imports and run:

```powershell
npm test
npx eslint src
npm run build
npm run build:github-pages
npm run build:campaign-level-pages
```

Vitest includes model/API tests and static-rendering UI tests. Static rendering
does not verify clicks, effects, polling, CSS layout or network requests. Do not
claim browser/e2e coverage from those tests. No maintained Playwright runner is
currently configured in this repository.

Delete a module only after checking its active routes, imports/re-exports,
scripts/configuration, tests, dynamic loading and asset/public entry points.
Remove tests for retired implementations with those implementations; preserve
tests for active workflows. Keep known behavior defects separate from structural
refactoring and preserve unrelated worktree changes.
