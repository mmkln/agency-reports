# UC-002 Acceptance Report - Embedded Marketing Dashboard

Status: MVP-complete

Date: 2026-05-14

## Scope

UC-002 delivers external dashboard link management and a client-facing dashboard surface. The portal stores provider metadata, embed URLs, public URLs, dashboard status, visibility, fallback text, and overview placement.

The implementation intentionally does not build native analytics connectors, custom charts, attribution logic, AI insights, or a BI layer. External tools remain responsible for dashboard data and visualization.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/admin/dashboard-links` | Admin list for dashboard links across client workspaces |
| `/admin/dashboard-links?newDashboard=true` | Admin modal for adding a dashboard link |
| `/admin/client-dashboard-preview?clientId=...&dashboardId=...` | Admin preview of a client dashboard, including draft dashboards |
| `/client/dashboard?clientId=...&dashboardId=...` | Client-facing embedded dashboard page |
| `/client/overview` | Client overview dashboard block entry point |

## Main Implementation Files

| Area | Files |
| --- | --- |
| Domain service | `src/domain/services/dashboardLinkService.js`, `src/domain/services/clientDashboardService.js` |
| Domain tests | `src/domain/services/dashboardLinkService.test.js`, `src/domain/services/clientDashboardService.test.js` |
| Entity model | `src/entities/dashboard-link/model.js` |
| Admin UI | `src/pages/admin/dashboard-links/*`, `src/features/admin-dashboard-links/*` |
| Client UI | `src/pages/client/dashboard/*`, `src/widgets/dashboard-embed/*` |
| Overview integration | `src/widgets/client-overview/ClientOverviewBlocks.jsx`, `src/domain/services/clientOverviewService.js` |
| Routing | `src/app/routing/routeDefinitions.jsx`, `src/app/routing/router.jsx` |

## Acceptance Mapping

| UC-002 criterion | Implementation evidence |
| --- | --- |
| `agency_admin` can add a dashboard link for a client | `saveAdminDashboardLink` persists dashboard links through the repository adapter. `AdminDashboardLinksPage` opens `DashboardLinkModal` for creation. |
| `agency_admin` can select dashboard provider | `DashboardLinkModal` uses `DASHBOARD_PROVIDERS` and provider metadata. |
| `agency_admin` can save `embed_url` | Domain validation accepts valid http(s) embed URLs and maps them to `embed_url`. |
| `agency_admin` can save `public_url` | Domain validation accepts valid http(s) public URLs and maps them to `public_url`. |
| `agency_admin` can set dashboard status | Admin table status actions call `updateAdminDashboardLinkStatus`; modal can set status during create/edit. |
| `agency_admin` can mark dashboard as visible on overview | `showOnOverview` is stored as `show_on_overview`; service clears other primary dashboards for the same client. |
| `agency_admin` can preview dashboard as `client_user` | `/admin/client-dashboard-preview` uses `admin_preview` mode and can show draft dashboards without exposing them to clients. |
| `client_user` can see only dashboards linked to their own `client_id` | `clientDashboardService` checks `canAccessClient`; tests cover cross-client denial. |
| Active dashboard renders on `/client/dashboard` | `ClientDashboardPage` renders `DashboardEmbedFrame` for active dashboards. |
| Dashboard block appears on `/client/overview` | `DashboardOverviewBlock` consumes the same visible dashboard rules through `clientOverviewService`. |
| `client_user` can open full dashboard in a new tab | `DashboardEmbedFrame`, `DashboardUnavailableState`, and overview block render full dashboard links when `public_url` exists. |
| Draft dashboard is not visible to `client_user` | `isDashboardVisibleToClient` hides `draft`; tests assert draft dashboards are absent. |
| Archived dashboard is not shown as primary dashboard | Client mode filters archived dashboards. Admin preview also excludes archived dashboards. |
| Unavailable dashboard shows fallback message | `DashboardUnavailableState` and overview fallback render `fallback_message`. |
| Iframe failure does not create a broken blank page | Dashboards without `embed_url` use public-link fallback; unavailable status uses controlled fallback. Actual external iframe permission failures still depend on provider behavior. |
| Dashboard page links to latest monthly summary | `DashboardPageSummary` links to the latest published/archived report when one exists. |
| No dashboard exposes another client's data | Services scope all reads by `client_id` and viewer access. Domain tests cover cross-client access denial. |

## UX Decisions

| Decision | Rationale |
| --- | --- |
| Add/edit dashboard uses a modal | Dashboard link editing is a focused bounded task, not a full-page or side-drawer workflow. |
| No-client state points to client creation | A dashboard must belong to a client workspace. The UI now avoids sending the admin into a dead-end save error. |
| Overview remains a link-out surface | UC-002 keeps analytics detail inside `/client/dashboard`; UC-001 overview only summarizes and links. |
| Fallback is explicit | External dashboard access can fail independently from portal access, so the client sees a controlled message. |

## Verification

Automated checks:

```text
npx vitest run src/domain/services/dashboardLinkService.test.js src/domain/services/clientDashboardService.test.js src/domain/services/clientOverviewService.test.js
npx playwright test e2e/uc002.spec.js
npm run build
```

Manual/browser smoke targets:

```text
http://127.0.0.1:5173/admin/dashboard-links
http://127.0.0.1:5173/admin/dashboard-links?newDashboard=true
http://127.0.0.1:5173/admin/client-dashboard-preview?clientId=22222222-2222-4222-8222-222222222222
http://127.0.0.1:5173/client/dashboard?clientId=22222222-2222-4222-8222-222222222222
http://127.0.0.1:5173/client/overview
```

Playwright browser smoke covers:

```text
- admin creates a dashboard link through the modal
- admin opens dashboard preview
- client opens their active dashboard
- client cannot open another client's dashboard
- unavailable dashboards render controlled fallback UI
```

## Residual Notes

The current persistence layer is still localStorage through repository adapters. Backend migration should preserve the current domain service contracts.

External iframe blocking cannot be fully simulated by the portal. The MVP handles controllable cases: missing embed URL, unavailable dashboard status, and full-dashboard fallback link.

