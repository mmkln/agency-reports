# Refactoring Verification Baseline

Recorded: 2026-11-07 (Europe/Budapest).
Status: automated baseline complete; authenticated browser checks blocked.

## Purpose And Limits

Record the starting point for the behavior-preserving structural refactor in
[the plan](refactoring-plan.md). This is verification evidence, not a claim that
the architecture or all business rules are correct. No production application
code, formulas, API shape, permissions, schema, build or deploy configuration was
changed in this step. No commit, push or deployment was performed.

## Repository State Before This Step

| Repository | Branch | HEAD |
| --- | --- | --- |
| `agency-reports` | `dev` | `a055546cd7f939a55c6cbf487c2b7d5f10754852` (`Update Campaign Level logos`) |
| `client_portal` | `main` | `0cbfd1570d2d827f030380c79d91985af2393a12` (`Add analytics report period catalog`) |

Existing frontend changes were `docs/product-sitemap.md`, untracked
`docs/architecture/`, and `reference/campaign-level-landing-concept.png`.
Existing backend changes were untracked `docs/architecture/`. These were not
reset, staged or discarded. The architecture plan is intentionally refined by
this step; the unrelated reference image and sitemap changes are preserved.

The earlier architecture map records an older frontend revision, `54740b1`.
Use the revisions in this report when reproducing this verification run.

## Commands And Evidence

Run frontend commands from `agency-reports`, backend commands from `client_portal`.
Complete output is local-only under the git-ignored frontend directory
`test-results/refactor-baseline/`. Logs are not API fixtures or production data.

| Command | Result | Local log |
| --- | --- | --- |
| `npm test` before edits | PASS: 48 files, 155 tests | `frontend-tests-before.log` |
| `npm test` after edits | PASS: 48 files, 155 tests | `frontend-tests-after.log` |
| `npx eslint src` | PASS, no diagnostics | `eslint.log` |
| `npm run build` | PASS, bundle-size warning | `build.log` |
| `npm run build:github-pages` | PASS, bundle-size warning | `build-github-pages.log` |
| `npm run build:campaign-level-pages` | PASS, bundle-size warning | `build-campaign-level-pages.log` |
| `.\.venv\Scripts\python.exe manage.py check` | PASS: no issues | `django-check.log` |
| `.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run` | PASS: no changes detected | `migrations-check.log` |
| `.\.venv\Scripts\python.exe manage.py test --noinput` before edits | PASS: 371 tests (1385.344 s) | `backend-tests-before.log` |
| `.\.venv\Scripts\python.exe -u manage.py test analytics_dashboards.tests.DashboardApiAndRefreshTests.test_display_patch_filters_existing_snapshot_without_recalculation --noinput` after edits | PASS: 1 test | `display-round-trip.log` |

Django tests use isolated test databases and synthetic records, not the running
development database. External synchronization in existing refresh tests is
mocked. No real GHL synchronization, production refresh or outbound delivery was
requested by this verification step.

The full backend suite was started before test edits; the extended test was then
run separately against the final code. No runtime application code changed.
For visible progress on future full runs, use Python `-u` and Django
`--verbosity 2`; the captured default run completed successfully but provided
little intermediate output through the PowerShell pipeline.

## Coverage And Changes

| Concern | Existing test owners | Verification boundary |
| --- | --- | --- |
| Login, viewer, token rotation/logout | Backend `accounts/test_auth_context.py`; frontend auth provider tests | Authentication contracts, not browser session longevity |
| Membership and workspace isolation | Backend `workspaces`/`agencies` tests; frontend `app/routing/roleAccess.test.js` | Server authorization and route policy |
| Calendar periods, calculated/unavailable results | Backend Analytics contract/catalog/API tests; frontend `entities/analytics-dashboard` tests | Canonical keys and current payload normalization |
| All-time values and point-in-time metrics | Backend Analytics calculation tests; frontend Analytics widget tests | Existing values, context and rendering assertions |
| Display visibility | Extended backend `test_display_patch_filters_existing_snapshot_without_recalculation`; frontend API service test | Persisted visibility, unchanged calculations and no refresh job |
| Explanations, display names and per-source hints | Backend Analytics/Growth explanation tests; frontend explanation/Analytics widget tests | Save/reset, labels, scope and accessible hint controls |
| Growth Review card variants and layout | Backend layout tests; frontend `ReactivationCampaignSummary.test.jsx` and dashboard tests | Existing specialized cards; not a universal replacement layout |
| Refresh and drilldowns | Backend Analytics/Growth/worker tests | Mocked sync, status, authorization and snapshot-bound collections |

The existing backend Display test is extended, not duplicated. It hides Weekly
Activity and one overview metric, reads settings/dashboard through a fresh test
client, restores both, and checks all remaining widgets/settings against the
original response. It also checks the same snapshot ID, unchanged stored payload
and calculation timestamp, and no new refresh runs or snapshots.

The frontend API adapter test additionally asserts exactly one PATCH request and
no POST call. It does not prove that a React effect or polling hook cannot start
refresh; that requires the browser workflow check below.

No new framework, test helper architecture, full-response snapshot files or
runtime fixture exports were introduced. Existing widget tests largely use
server-side markup rendering; they do not exercise clicks, effects or layout.

## HTTP Scenario

The extended backend test exercises in-process Django API requests, not browser
Network traffic:

1. GET dashboard and GET settings establish the original response.
2. PATCH settings hides the requested section/metric.
3. A fresh authenticated test client GETs settings and dashboard.
4. PATCH settings restores visibility; GET dashboard and GET settings verify it.

That is two settings PATCH requests, three dashboard GET requests and three
settings GET requests. There is no refresh POST in this test; unchanged refresh
run and snapshot counts also detect settings handlers starting work indirectly.

## Browser Verification

Both local ports were listening: Vite at `127.0.0.1:5174`, Django at
`127.0.0.1:8000`. The in-app browser opened the existing local Lead Report tab,
which was redirected to login for workspace
`29e5a41e-2638-46a7-8d2d-17b0aad2a5c2`.

Authenticated checks are **not verified**: manager/read-only dashboard access,
Display hide/save/reload/restore, Refresh button state, explanation interaction,
drilldowns, campaign/period selection, Executive and desktop/mobile screenshots.
No settings PATCH or refresh POST was exercised through the browser. No account
password was reset and no workspace settings were changed for browser testing.

To complete this evidence: sign in locally, run the Display round trip with
Network/backend-log capture, confirm no `/refresh/` POST or Updating state, restore
original settings, then record role-specific desktop/mobile checks here.

## Known Issues And Follow-Up

- All three builds report a JavaScript chunk over the 500 kB warning threshold
  (approximately 1.526 MB minified / 431 kB gzip). No bundle optimization or
  warning suppression is included in this step.
- A successful build does not establish the correct production API URL,
  deployment branch, routing mode or worker availability. Delivery findings in
  [the architecture review](review-2026-11-07.md) remain a separate backlog.
- Previously diagnosed calculation, source-selection, fallback and job-identity
  issues are not fixed or newly certified here. Tests must not silently turn
  known incorrect outcomes into desired product behavior.
- Authenticated browser evidence is still required before treating the complete
  manual verification matrix as passed. Automated test success is not a visual
  or interactive regression guarantee.
