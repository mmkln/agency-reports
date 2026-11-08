# Frontend Architecture Map

Updated after the local source cleanup on baseline `a055546`, 2026-11-07.
See [system map](README.md) and [cleanup evidence](frontend-cleanup.md).

## 1. Runtime Composition

```text
src/main.jsx -> src/App.jsx -> src/app/App.jsx
  BrandProvider + SiteDocumentMetadata
    ThemeProvider
      ToastProvider
        AuthProvider
          RouterProvider -> RootLayout -> route adapter -> page
```

`app/config/siteDefinition.js` chooses Alpine/Campaign-Level branding and public
landing behavior. The site variants share the application, not separate product
implementations.

`AuthProvider` constructs:

```text
browserAuthTokenStorage
  localStorage, with legacy sessionStorage migration/fallback
             |
tokenAuthenticatedApiClient
  shared/api/backendApiClient + bearer interceptor
  401 -> one shared refresh promise -> retry -> expire session on failure
             |
backendAuthClient
  login, email-code login, logout, /api/auth/me/ viewer normalization
             |
runtime = { apiClient, viewer, defaultClientId }
```

The retired `dataClient`, repository adapters/manifests and error stubs have been
removed. JWT/token storage, backend authentication, theme persistence and the
`defaultClientId` compatibility field remain unchanged.

Sources: `app/providers/auth/{AuthProvider,authRuntime,backendAuthClient,
tokenAuthenticatedApiClient,browserAuthTokenStorage}` and `shared/api`.

## 2. Layer Responsibilities And Actual Dependency Direction

| Layer | Owns | Main dependencies observed |
| --- | --- | --- |
| `app` | Providers, router, route guards, site selection and root layout | pages, domain, entities, shared |
| `pages` | Route composition, workspace wrappers and dashboard orchestration | features, widgets, domain, entities, shared; some auth pages import app hooks |
| `widgets` | Dashboard sections and complete screen blocks | features, entities, shared; some direct primitives/utilities |
| `features` | Settings, mutations, refresh/polling, selection and editors | domain services, entity API adapters/models, shared |
| `domain` | Existing API-facing services, frontend helpers and paths | entities; no React components |
| `entities` | Normalization/contracts, metadata, selectors and some API adapters | entity-local code and shared infrastructure |
| `shared` | UI wrappers, generic charts/layout, API, resource state, theme and icons | low-level primitives and generic helpers |
| `components/ui` | shadcn/Radix/Base UI control implementations | `lib/utils`, `hooks/use-mobile`, external UI libraries |
| `lib`, `hooks` | Low-level utility and mobile helper | generic dependencies |

The practical graph is not only `app -> pages -> widgets -> features -> entities
-> shared`: `domain` is a parallel service/policy branch. API adapters are split
between `domain/services` and `entities/*/api.js`.

Examples of current adapter ownership:

- Analytics: `domain/services/analyticsDashboardApiService.js`.
- Growth dashboard reads: `domain/services/growthReviewApiReadService.js`.
- Campaign configuration: `entities/growth-review-review/api.js`.
- GHL sync controls: `entities/ghl-integration/api.js`.
- Refresh for Growth Review: HTTP requests inside `useGrowthReviewRefresh`.

Seven direct upward import edges from auth/system pages into `app` were found:
`useAuth` and the login redirect helper. This is observed coupling, not a claim
that every such edge is a defect. ESLint currently has no import-boundary rules.

## 3. Routes And Navigation

```text
domain/navigation/routePaths.js       stable path constants/builders
app/routing/routeAccessMetadata.js    access requirements
app/routing/routeDefinitions.jsx      elements, labels and route metadata
app/routing/RoutePages.jsx            runtime, route and query prop adapters
app/routing/roleAccess.js             route access and nav policy
app/routing/ProtectedRoute.jsx        session/permission redirects
shared/layout                        app shell rendering
features/admin-client-workspace      selected workspace header/tabs
```

Local history routing and production hash routing are selected through router
configuration/Vite build mode. Agency workspace and portal routes wrap the same
dashboard page implementations with different navigation context.

Stable workspace destinations are Setup, Data, Access, Review, Lead Report and
Executive. Tag Catalog is owned by Data; Review Setup is owned by Review.
Lead Report settings are a fullscreen workflow inside its dashboard route.
See the [sitemap](../product-sitemap.md) for exact URLs.

## 4. Active Feature Families

Source imports from `src/main.jsx` reach the following feature families. This
includes barrel exports and is not proof that every exported component renders.

| Family | Feature folders |
| --- | --- |
| Authentication | `auth-login`, `password-reset`, `accept-workspace-invitation`, `plugin-authorization` |
| Clients/workspaces | `clients`, `workspaces`, `admin-clients`, `admin-workspaces`, `admin-client-detail`, `admin-client-workspace` |
| Access and invitation | `admin-client-access`, `client-access-overview`, `invitations` |
| Source administration | `workspace-tag-catalog`; source controls also live inside workspace/campaign features |
| Growth Review | `growth-review-data`, `growth-review-campaign-selection`, `growth-review-layout`, `growth-review-dashboard-explanation`, `growth-review-review-management` |
| Analytics | `analytics-dashboard-data`, `analytics-dashboard-settings`, `analytics-dashboard-provisioning`, `analytics-dashboard-period-selection`, `analytics-dashboard-explanation` |
| Executive | `executive-dashboard-data` |
| Cross-reporting workflows | `dashboard-explanation`, `view-contact-collection` |

The active widget families are `dental-growth-review`, `analytics-dashboard` and
`executive-dashboard`. Generic shell/UI lives in shared, not in these widgets.

## 5. Removed Retired Source

Unused legacy pages, task/overview/report-publishing/clinic-demo flows, old account
forms, external embed and performance-editor implementations were removed with
their exclusive services, entities and widgets. Current routes, access metadata,
redirects, API-backed client management and reporting workflows remain intact.

The cleanup removed one dead export from an active feature barrel before pruning
its obsolete hook/dependencies. Local-runtime/password-stub tests were removed
with the stubs; tests for active workflows remain. Shared UI primitives and all
branding/media assets were retained. See the cleanup report for method and limits.

No remaining non-test JS/JSX/TS/TSX file is outside the conservative entry-point
graph. This is a file-level result, not proof that every export is used or that
all components and architectural boundaries are clean.

## 6. Data And State Ownership

| State | Owner |
| --- | --- |
| Viewer/session | AuthProvider and auth client/token adapter |
| Request loading/error/data | `shared/data/useAsyncResource` and owning workflow hooks |
| Selected campaign | Growth campaign-selection feature and route/search context |
| Selected report | Analytics period-selection hook's local React state, scoped to workspace/dashboard |
| Calendar rows | `entities/analytics-dashboard/reportPeriods.js` from backend calendar policy |
| Refresh progress | Product-specific refresh hooks polling backend run state |
| Settings draft | `useAnalyticsDashboardSettings` or campaign configuration workflow |
| Saved settings/results | Backend, not browser storage |
| Explanation edit draft | Shared reporting explanation feature hook |
| Theme | `shared/theme` provider/adapter |

There is no Redux/TanStack Query dependency. Server state is managed with React
hooks and local resource abstractions. Server data is accessed through the
existing API adapters; there is no local portal repository runtime.

The selected Analytics period is not URL-persisted by the current hook. A page
reload returns to the backend-selected default report rather than preserving an
unpersisted local selection.

## 7. Presentation Abstractions

```text
index.css semantic tokens + theme
  -> components/ui primitives
    -> shared/ui wrappers and layout/chart patterns
      -> product widgets and workflow UI
```

Reporting products share `MetricTile`, `MetricGrid`, `DashboardSettingsMenu`,
`DashboardToolbarActions`, panels/tables and controls. They do not share one
business metric-card model. Growth Review retains purpose-specific featured,
value and activity presentations; Analytics supplies metric presentation data.

`features/dashboard-explanation` is the common explanation view/edit workflow.
Growth/Analytics features adapt its save/reset actions to different endpoints.
`entities/dashboard-explanation` owns normalization/display-name resolution.

`shared/ui` has both wrappers and re-exports of primitives. Source count includes
both and should not be interpreted as a count of distinct design patterns.

## 8. Measured Inventory And Hotspots

Method: JS/JSX/TS/TSX under `src`; line count includes blanks/comments. Reachability
follows relative/`@/` literal imports/re-exports and literal dynamic imports.
It excludes external packages, CSS, build output and dynamic runtime evaluation.

| Area | Source files including tests | Entry-point reachable |
| --- | ---: | ---: |
| app | 28 | 22 |
| pages | 37 | 37 |
| widgets | 56 | 46 |
| features | 167 | 157 |
| entities | 53 | 41 |
| domain | 10 | 6 |
| shared | 124 | 119 |
| components | 22 | 22 |
| root entry/re-export files, hooks and lib | 4 | 4 |
| **Total** | **501** | **454** |

There are 47 `*.test.*` files in this inventory. The count is not coverage.

Active-import hotspots worth responsibility analysis:

| File | Lines | Why inspect |
| --- | ---: | --- |
| `widgets/dental-growth-review/DentalGrowthReviewBlocks.jsx` | 1,560 | Many distinct sections/presentation concerns |
| `shared/icons/iconRegistry.jsx` | 1,412 | Shared infrastructure; size alone does not imply mixed behavior |
| `widgets/dental-growth-review/StackedFunnelFlowChart.jsx` | 894 | Specialized visualization and interaction |
| `features/growth-review-review-management/useGrowthReviewReviewsWorkflow.js` | 630 | Configuration workflow/state orchestration |
| `entities/dental-growth-review/apiContract.js` | 613 | Payload normalization and compatibility |
| `widgets/executive-dashboard/ExecutiveDashboard.jsx` | 574 | Product sections in one widget |
| `app/routing/routeDefinitions.jsx` | 488 | Route composition and metadata |
| `domain/services/growthReviewApiReadService.js` | 461 | Backend-to-product projection |

The earlier retained local-repository service hotspots were removed, not moved
into new wrappers. Responsibility analysis of the active hotspots is still pending.

## 9. Tests And Delivery

- Vitest covers models, API adapters, permission/routing helpers and selected UI.
  Some UI tests use static rendering; they do not establish browser interaction.
- ESLint covers JS/React/hooks, not architectural import direction.
- No current Playwright dependency/script/config was found in `package.json`;
  existing `test-results` artifacts do not establish maintained e2e coverage.
- Vite build modes select remote API, site variant, base path and hash routing.
- `deploy:github-pages` builds `github-pages` mode and publishes `dist`.
- `deploy:campaign-level-pages` builds its own mode and publishes to Campaign-Level.
- CI `static.yml` runs on `main` and uses plain `npm run build`, unlike the manual
  GitHub Pages command. Campaign-Level CI tracks `main` and
  `feature/executive-dashboard`, not current `dev`.

Build/deploy differences are verified configuration differences, not a claim
about which hosting workflow is currently selected in production.
