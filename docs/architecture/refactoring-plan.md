# Lean Architecture Refactoring Plan

Prepared: 2026-11-07, from the current architecture maps and review.
Status: baseline and retired frontend/runtime cleanup implemented locally with
automated verification. Authenticated browser verification remains pending.
See `refactor-baseline.md` and `frontend-cleanup.md`. Later stages are proposals.
This plan does not authorize commits, pushes or deployment.

## Objective

Make the active product easier to understand and change by establishing a single
active frontend runtime, consistent module entry points, an explicit source-data
boundary and clear reporting input/result/workflow contracts.

Keep React/Vite, the Django modular monolith, existing URLs, product-specific
Growth Review visuals and the existing generic Analytics direction. Do not build
a universal dashboard builder, DI framework, event-sourcing system or repository
layer around Django ORM as a prerequisite.

Frontend paths below are relative to `agency-reports`; backend paths are relative
to `client_portal`. Proposed files are explicitly identified as new destinations.

## Approved Scope

This is a behavior-preserving structural refactor, not the repair backlog in
`review-2026-11-07.md`. Preserve URLs, HTTP payloads, permissions, formulas,
configuration hashes, source precedence, result selection and job lifecycle.
Do not change CI, release branches or deployment behavior in this work.

Growth Review may be reorganized internally, but its specialized UI, calculations,
stored results and refresh semantics must remain unchanged. Do not migrate it to
Analytics. Existing defects are documented separately, not silently fixed or
promoted into permanent product requirements by characterization tests.

## Working Rules

- One independently verifiable responsibility change per commit.
- Separate mechanical moves from deliberate behavior changes.
- Preserve existing API responses unless a contract change is explicitly tested.
- Capture stable behavior and public API examples before extraction. Known
  incorrect behavior must not silently become a permanent required contract.
- Update callers together and remove superseded implementations; do not leave
  permanent old/new APIs forwarding to each other.
- Do not introduce a generic abstraction just because two files have similar names.
- Extend the same backend application services from UI/MCP/CLI; never duplicate
  formulas or mutation policy in an adapter.
- Delete unused frontend code after proving it has no required runtime, build,
  script, asset, test or public entry-point consumer. Reachability alone is a
  candidate list, not deletion proof.
- Do not remove persisted backend models/migrations as part of source cleanup.
- Each stage must leave the active application usable; do not maintain a second
  frontend or a parallel dashboard implementation during this refactor.

## Stage 0. Establish A Reproducible Verification Baseline

### Work

- Keep fixtures/contracts for login, client/workspace access, Growth Review read
  and setup, Analytics read/settings/refresh, explanation editing and drilldowns.
- Cover agency owner/admin/team and authorized read-only workspace behavior using
  the roles/capabilities actually supported by the backend.
- Record revisions, dirty files, existing test coverage and known failures in
  [the verification baseline](refactor-baseline.md).
- Strengthen the existing display-settings round-trip test and frontend adapter
  assertions; do not introduce another testing framework or duplicate coverage.
- Run tests, lint, Django checks and the existing build modes without changing
  their configuration. Record delivery inconsistencies as separate findings.

### Exit Check

Baseline tests/lint/build and critical browser workflows have evidence or an
explicit unverified status. Tests use isolated data and mocked external effects;
no production refresh or architecture migration has happened. A successful build
is not evidence that a production deployment is configured correctly.

## Stage 1. Remove The Retired Frontend Product/Runtime

Implemented locally: see [source cleanup evidence](frontend-cleanup.md).
API adapter consolidation and other later stages have not been implemented.

### Deletion Candidates

- `src/pages/legacy` and unused old client/admin/team destinations.
- Retired tasks, authored overview, monthly report publishing, external dashboard
  embed, clinic vertical and performance-editor families listed in `frontend.md`.
- Their exclusive widgets, entity models/fixtures, domain services, tests and
  assets. Keep a shared entity/asset if an active consumer still needs it.
- Placeholder feature directories that do not contain an implemented capability.
- `src/app/providers/repositories` once no supported code/test consumes it.

### First Inspect Mixed Imports

Active barrels/services can still import old operations. For example, an API-
backed client workflow must not pull repository-based invite/client operations
through `adminClientService.js`/`clientInviteService.js`. Move any genuinely
needed pure helper to its current owner before deleting the retired module.

### Runtime Cleanup

- Remove `removedLocalDataClient`, `dataClient`, and obsolete repository flags
  from `AuthProvider.jsx`/`authRuntime.js` after all supported consumers are gone.
- Retain JWT token storage, backend auth client and resource loading helpers.
- Retain compatibility URL redirects that still serve old bookmarks; a redirect
  does not require keeping the old page implementation.
- Reconcile `docs/frontend-architecture.md` with the resulting API-only runtime.

### Exit Check

There is one working runtime; unsupported repository operations are not exposed
as throwing compatibility methods. Active routes still work. Tests for deleted
products are removed, not replaced by dummy fixtures. No business API changes.

## Stage 2. Make Active Frontend Responsibilities Consistent

### Chosen Convention

```text
app                composition, session and routing
pages              route context and composition
widgets            product sections/presentation models
features           workflow hooks, drafts, mutations and polling
entities/*/api.js  business-resource HTTP adapters
entities/*/model   payload normalization and entity metadata
domain/policies    reusable frontend access/interaction policy
shared             generic API transport, async state, UI and infrastructure
components/ui      low-level primitive implementations
```

Auth transport/session remains in the existing auth provider boundary. Do not move
it to a business entity just to force uniform directory names.

### Concrete Moves

- Move Analytics request functions from
  `src/domain/services/analyticsDashboardApiService.js` into a new
  `src/entities/analytics-dashboard/api.js`, beside its current model/contract.
- Move Growth dashboard and refresh endpoint calls to a new
  `src/entities/dental-growth-review/api.js`. Split pure payload normalization
  from `growthReviewApiReadService.js`; keep UI card composition in the widget.
- Keep existing `entities/growth-review-review/api.js` and
  `entities/ghl-integration/api.js` as the pattern, not as another API layer.
- Remove raw HTTP calls from `features/growth-review-data/useGrowthReviewRefresh.js`;
  the hook keeps lifecycle/polling, the entity adapter owns endpoints/payloads.
- Apply the same convention to the remaining active client/workspace adapters,
  only after separating any mixed retired service exports.
- Keep plain entity normalization separate from React workflow state.
- Keep shared `MetricTile`, `MetricGrid`, controls and theme wrappers. They are
  not duplicates merely because a primitive and wrapper both exist.
- Add focused import restrictions in `eslint.config.js` for forbidden upward
  imports; handle current app/session consumers deliberately, not via broad disables.

### Exit Check

A developer can identify the owner of an endpoint, payload, workflow and visual
section without reading the entire page. No replacement global state library,
UI redesign, wholesale rename or new wrapper service is necessary.

## Stage 3. Establish Backend Application Entry Points

### Goal

Separate HTTP handling from operations that have real business orchestration.
Do not create an empty application facade for every function.

### Concrete Changes

- In Analytics, extract the read/configure/request-refresh workflows currently
  spread through `views.py` into a new `analytics_dashboards/application.py`.
  Keep lower-level configuration/calculation services as collaborators.
- Extract named read/catalog selectors into `analytics_dashboards/result_selection.py`
  without changing their existing fallback or current/stale/unavailable policies.
  Unifying inconsistent policies is a separate behavior change, not a file move.
- In `workspaces/views.py`, move mutating client/membership/invitation lifecycle
  orchestration to the existing owning services or focused service modules.
  Move repeated response construction to explicit serializers where useful.
- Growth Review already has domain services. Give callers a clear supported
  service entry point; do not add another layer that only forwards its arguments.
- HTTP views own request parsing/status mapping. Application operations own
  workflow validation and transactions. Resource access policy is reused from
  the existing permission modules; adapters must not invent their own rules.
- UI and MCP use the same REST endpoints. Relevant internal commands call the
  same application operation after establishing their trusted scope.

### Exit Check

Existing API shape and permissions are preserved. Endpoints no longer implement
the workflow independently of commands/services. Tests exercise use cases as
well as HTTP authorization. Accounts/agencies are not reorganized gratuitously.

## Stage 4. Separate Source Normalization From Reporting Interpretation

### GHL -> CRM Boundary

- Extract GHL payload parsing/default field maps/transforms from `crm/services.py`
  into focused modules under `integrations`, e.g. the proposed
  `integrations/normalization/ghl_contacts.py` and `ghl_opportunities.py`.
- `integrations/services/ghl_sync.py` fetches/persists raw payloads, invokes the
  normalizer and sends normalized values to CRM upserts.
- CRM upserts own persistence of normalized fields, not GHL payload paths or
  source API calls. Existing model relationships/source identifiers may remain.
- Begin with contacts/opportunities; extend this split to other entities only
  when touching them or when required to remove the same coupling.

### CRM -> Reporting Boundary

- Extract existing Lead Report input preparation into a focused input boundary.
  Preserve existing semantic mapping reads, contact evidence precedence and
  workspace/period policy; do not replace them with new rules during extraction.
- Keep lead attribution and lifecycle interpretation in the Lead Report domain;
  do not move report-specific meanings into a generic CRM normalizer.
- Move existing mapping/source selection into the prepared input/context where
  it removes duplication, preserving query timing, selected values and hashes.
  Do not add persisted rule revisions or alter fingerprints in this stage.

### Exit Check

Changing a GHL payload path touches the integration adapter, changing a lifecycle
rule touches reporting interpretation, and changing a formula touches a calculator.
Tests establish these boundaries. No speculative all-CRM schema or event log.

## Stage 5. Clarify The Existing Analytics Platform Boundary

### Within The Existing Django App

Keep platform infrastructure in `analytics_dashboards`:

```text
models / contracts / configuration / definitions
application / result_selection / refresh_service
serializers / provisioning / explanation mechanisms
```

Move Lead Report-specific code into a package such as the proposed
`analytics_dashboards/reports/weekly_lead_report/`:

```text
inputs / attribution / lead_cohort / booking_activity / calculations
```

The current calculation registry remains an explicit Python registry. If moving
definitions out of `calculations.py` requires a small `registry.py`, use that;
do not introduce dynamic plugin loading, discovery or a formula DSL.

Keep dashboard definition/config composition over code-defined metrics. A new
business metric is code; labels/order/visibility and supported composition are
configuration. The split creates a real platform/product dependency direction
without creating a new Django app or migrating tables.

### Exit Check

Platform lifecycle/configuration does not import Lead Report internals throughout
its files; the registry/definition boundary is explicit. A second definition can
reuse infrastructure without copying Lead Report semantics. Growth Review is
still its own product and has not been migrated.

## Stage 6. Clarify Growth Review Internals Without Migrating Products

### Backend

- Split mixed query, calculation and refresh orchestration responsibilities
  behind the existing Growth Review service entry points where needed.
- Preserve result/snapshot models, mutation order, transaction boundaries,
  fallback selection, deduplication, leases and worker dispatch behavior.
- Keep Growth Review and Analytics separate. No shared job model, new result
  contract, historical reconstruction or Analytics migration is required.

### Frontend And Plugin

- Preserve existing hook state transitions and polling behavior while separating
  transport from workflow state. Do not unify different lifecycles by assumption.
- Verify existing UI and MCP HTTP contracts remain compatible. The plugin gains
  no new capabilities as part of structural cleanup.

### Exit Check

Existing consumers observe unchanged responses and operation semantics. Any
last-good-result, target-identity, liveness or retry-policy defects remain in the
separate repair backlog; passing structural checks does not certify those rules.

## Stage 7. Split Remaining Frontend Hotspots By Responsibility

- Split `DentalGrowthReviewBlocks.jsx` into current chart/section files under
  `widgets/dental-growth-review`; preserve markup, variants and behavior initially.
- Split `useGrowthReviewReviewsWorkflow.js` into coherent loading/draft/mutation
  responsibilities only where it reduces mixed state and repeated effects.
- Keep page shells small. Settings forms and mutations stay in features; widgets
  do not acquire transport code; shared UI does not acquire campaign semantics.
- Frontend formatting/selection is appropriate. Population definitions and
  business conversion formulas belong in backend metric outputs.
- Remove superseded imports/exports/tests after each extraction and update the
  architecture guide and dependency checks to match the actual final state.

### Exit Check

Growth Review still has its different featured/value/activity cards. Lead Report
retains its own composition. Shared infrastructure is reused without forcing
both products into one business component.

## Verification And Stop Conditions

Every stage: import/dead-code check, frontend tests/ESLint/build when frontend
changes, relevant backend tests and Django checks when backend changes. Contract
and role/workspace isolation tests precede deleting old adapters or policy paths.
Browser checks accompany workflow/visual changes when authorized/requested.

No schema migrations are planned. File extraction, package moves and adapter
cleanup must not change tables, IDs or persisted calculation semantics.

Stop after a stage when the active boundary is clear and tested. Do not continue
into genericization merely because a larger theoretical design is possible.

First executable batch: Stage 0 verification baseline, then Stage 1 unused
frontend/runtime deletion. Do not start by moving Growth Review to Analytics.
