# Current System Architecture

Verified: 2026-11-07. Original frontend map baseline: `54740b1` on `dev`;
subsequent local cleanup is based on `a055546` (see the cleanup report).
Backend baseline: `0cbfd15` on `main`.

This is an **as-implemented map**, not a target architecture or a refactoring
proposal. It records the seams that a later audit must examine. It does not
certify correctness, security, performance, or production deployment state.

## Map Index

| Map | Contents |
| --- | --- |
| [Frontend](frontend.md) | Runtime, layers, active modules, source cleanup, routing, state and UI infrastructure |
| [Reporting](reporting.md) | Lead Report, Growth Review and Executive, from source records to rendering |
| [Backend](../../../client_portal/docs/architecture/current-state.md) | Django apps, entities, authorization, ingestion, persistence and workers |
| [Product sitemap](../product-sitemap.md) | User-facing destinations and navigation ownership |
| [Architecture review](review-2026-11-07.md) | Prioritized findings, reproduced failures and lean repair directions |
| [Lean refactoring plan](refactoring-plan.md) | Proposed stages, concrete file ownership, checks and stop conditions |
| [Verification baseline](refactor-baseline.md) | Executed checks, strengthened tests, known limitations and browser verification status |
| [Frontend cleanup](frontend-cleanup.md) | Removed legacy source, retained runtime contracts, dependency evidence and checks |

The backend link assumes the repositories are sibling checkouts. Its canonical
repository-relative path is `client_portal/docs/architecture/current-state.md`.

## 1. System Boundary

```text
Browser SPA: agency-reports
  React / React Router / Tailwind / Recharts
                  | HTTP JSON + JWT
                  v
Django modular monolith: client_portal
  accounts + agencies + workspaces
  integrations <-> crm
  growth_reviews | analytics_dashboards | executive_dashboards
                  |
                  +-- SQLite: identity, configuration, CRM, snapshots, job queues
                  +-- GHL API: source data and metadata
                  +-- Make webhooks: invitation/login/reset delivery

Separate Django management-command process
  background_jobs -> Growth Review and Analytics refresh processors
  shares application code and database with the HTTP process

AI host -> local MCP plugin -> same Django HTTP API
  separate client, not a separate calculation engine
```

The application is not a microservice system. Django apps share one database
and make direct Python calls and ORM queries across app boundaries. The worker
is a separate process, not a separate service with its own data ownership.

## 2. Repository And Runtime Inventory

| Repository/component | Responsibility | Execution |
| --- | --- | --- |
| `agency-reports` | Agency and portal UI, API adapters, rendering and interactions | Vite locally; static production build |
| `client_portal` | Authoritative identity, permissions, configuration, synchronization and calculations | Django HTTP application plus management commands |
| `alpine-growth-review-assistant` | MCP tools, portal authorization, backend API client and host packaging | Local Node/TypeScript MCP runtime |
| GHL | External contacts, opportunities, appointments, messages, custom objects and catalogs | External API |
| Make | Outbound delivery integration for identity/access flows | External webhook consumer |

The plugin source checkout inspected here declares version `0.6.1`. That is not
proof that the same version is installed in every AI host.

## 3. Product Modules Actually In The Active Route Tree

| Area | Frontend owners | Backend owners |
| --- | --- | --- |
| Authentication and account | `app/providers/auth`, auth features/pages, account settings | `accounts` |
| Clients and workspace administration | Admin client/workspace features and route wrappers | `agencies`, `workspaces` |
| Memberships and invitations | Access, invitation and client-detail features | `workspaces`, `agencies`, `accounts` |
| Connections and source catalogs | Workspace Data, tag catalog, GHL integration adapters | `integrations`, `crm`, `workspaces/tag_catalog_service.py` |
| Campaign setup | `growth-review-review-management` | `growth_reviews/review_config_service.py` |
| Growth Review | `growth-review-*`, `widgets/dental-growth-review` | `growth_reviews` |
| Lead Report | `analytics-dashboard-*`, `widgets/analytics-dashboard` | `analytics_dashboards` |
| Executive | `executive-dashboard-data`, `widgets/executive-dashboard` | `executive_dashboards` |

The unused task, overview, report-publishing, clinic-demo and external embed source
was removed during frontend cleanup. Product/research documents for those areas
are historical direction, not proof that these are active product modules.

## 4. Ownership And Abstraction Levels

```text
Business containers
  User identity
  Agency -> Client -> Workspace
  Memberships + agency/workspace relationship authorize access

Source layer
  SourceConnection + credential
  raw records + sync cursors/runs + reference catalogs
  normalized CRM records

Reporting interpretation
  semantic field mappings, campaign signals, source attribution, lifecycle rules

Calculation
  Python calculators consume local normalized records
  config + period + calculation version determine result validity

Materialized outputs
  Growth Review result/snapshot OR Analytics snapshot/record collection

Read projection
  authorization + result selection + live display/explanation overrides

Presentation
  frontend normalization -> product widgets -> common UI primitives
```

These are observed responsibilities, not separately enforced architectural
layers everywhere. For example, Django services query ORM models directly;
there is no project-wide repository interface underneath them.

## 5. Source Of Truth By Concern

| Concern | Actual authority |
| --- | --- |
| Authentication | Django user, JWT/PAT validation; browser token adapter persists JWTs |
| Resource access | Django membership/capability policies and endpoint authorization |
| Route visibility | Frontend route metadata and membership-aware routing rules |
| Source operational state | GHL; local CRM is the synchronized copy |
| Historical aggregate output | Stored calculation result/snapshot, subject to its product-specific lifecycle |
| Calculation semantics | Backend calculator code and validated calculation configuration |
| Lead Report composition | Backend dashboard definition/config and frontend renderer registry |
| Growth Review composition | Specialized payload plus saved dashboard layout and frontend product widgets |
| Display names and explanatory text | Resolved backend defaults/overrides; frontend display-name resolver |
| Generic visual treatment | `shared/ui`, `components/ui`, tokens, icons and theme provider |
| Deployment state | Hosting/runtime, not local branch name or a successful source push |

## 6. Important Distinctions For An Audit

1. There is no single dashboard engine covering all three dashboard products.
2. A refresh is source synchronization **and** calculation, not just a GET.
3. A calendar period exists without a snapshot. No separate `Report` model was
   introduced for the Lead Report calendar selector.
4. A frozen aggregate is not a complete historical reconstruction of CRM state.
5. `All-time` means the configured history start through the report cutoff, not
   necessarily every record ever present in GHL.
6. Display settings and explanation overrides are applied independently of
   recalculation in Analytics.
7. A similar-looking UI does not imply the same backend lifecycle.
8. A folder in `src` does not prove the feature is reachable or API-backed.
9. Frontend authorization hides controls; it does not replace backend checks.
10. The MCP plugin is another API consumer and currently has narrower settings
    and period contracts than the newest frontend.

## 7. Documentation Versus Runtime

`docs/frontend-architecture.md`, `docs/domain-ownership-model.md` and the use-case
documents mix intended direction with earlier implementation descriptions.
They remain product/design inputs, but cannot alone establish runtime behavior.

Concrete examples verified in code:

- The frontend architecture guide now describes the API-only runtime. Local
  repository/dataClient adapters and throwing compatibility stubs were removed.
  Older implementation documents retain their historical local-storage examples.
- The ownership guide describes some agency/client memberships as future work;
  Django already has `AgencyMembership`, `ClientMembership`,
  `WorkspaceMembership` and `AgencyWorkspaceRelationship`.
- The original aggregate-only clinic direction does not describe current CRM
  persistence and authorized contact drilldowns: these store/read contact-level
  data. Privacy requirements need an explicit reconciliation, not an assumption.

Do not silently rewrite product constraints to match current code. A later audit
must identify which requirement or implementation should change.

## 8. Basis For The Next Audit

Review these questions before choosing a refactoring scope:

| Boundary | Question to answer | Inspect |
| --- | --- | --- |
| Product scope | Which future workflows are actually requested products? | Active routes, use cases and explicit product intent |
| Reporting platform | Which concepts should be shared without merging different business semantics? | Reporting comparison map |
| Historical truth | What must remain reproducible after CRM tags/stages/statuses change? | Raw records, snapshot dimensions, calculators |
| Source normalization | Where should mapping and source attribution be authoritative? | CRM normalizers, semantic mappings, reporting attribution |
| Authorization | Are capability checks consistently resource-scoped across UI, API and plugin? | Viewer normalization, policies, view guards |
| Jobs | What guarantees are required for deduplication, failure recovery and worker availability? | Refresh services, DB constraints, worker |
| Module coupling | Which cross-app dependencies are intended and which are accidental? | Backend import graph |
| Contracts | How are backend, frontend and plugin versions rolled out together? | Serializer/model/tool schemas |
| Maintenance | Which large files combine distinct responsibilities? | Hotspot lists in maps |
| Delivery | Which branch/build mode actually reaches each site? | Vite config, npm scripts, CI workflows |

These are an audit agenda, not a conclusion that the project needs a rewrite.

## 9. Verification Scope

- Inspected local tracked source, route composition, runtime providers, endpoint
  handlers, Django models/services, templates, worker commands and build config.
- Counted source files and direct imports with a read-only static scan.
- Inspected the separate plugin checkout at its API/authorization boundary.
- Did not change application behavior, run a production refresh, access customer
  data, or inspect production configuration in this mapping task.
- The original mapping did not rerun tests or benchmark the application. Later
  test/build evidence is recorded in the baseline and frontend cleanup reports.
- Static reachability includes imports and barrel exports; it is not an exact
  bundler tree-shaking or runtime execution trace.
