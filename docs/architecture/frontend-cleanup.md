# Retired Frontend And Runtime Cleanup

Date: 2026-11-07. Baseline: `a055546` on frontend `dev`.
Status: source cleanup implemented locally; automated checks recorded below.
No commit, push or deployment is authorized by this report.

## Scope And Result

- Removed 459 unused JS/JSX/TS/TSX files, including two obsolete test files, and
  15 instruction files that belonged exclusively to removed modules.
- Source inventory changed from 959 to 501 files, including tests. One new auth
  runtime test file was added. There are now 47 test files and 155 passing tests.
- Removed legacy pages and the retired task, authored overview/report-publishing,
  clinic-demo, embed, performance-editor and old account/client form families
  with their exclusive services, models, widgets and local repository stubs.
- Preserved the active route registry, access metadata and compatibility redirects,
  API-backed client/workspace/access workflows, and all three dashboard products.
- Preserved shared UI primitives, branding/media assets, package dependencies,
  build/deploy configuration, JWT storage/rotation and theme persistence.

Backend application code, schemas, formulas, job behavior and HTTP contracts were
not edited in this step. Earlier uncommitted backend baseline-test work remains
separate and was not reset. Existing frontend baseline tests, sitemap changes,
architecture documents and the unrelated reference image were preserved.

## Dependency Evidence

The audit used the already installed Babel parser/traversal packages; no new
dependency, tracked audit framework or runtime abstraction was introduced.
Local audit data and command output are git-ignored under
`test-results/frontend-cleanup/`:

- `dependency-audit-before.json`: parsed import/re-export graph and source hashes.
- `deletion-manifest.json`: exact deletion list, surviving test roots and inbound
  dependency checks before applying deletions.
- `dependency-audit-after.json`: surviving imports, source hashes and inventory.

Entry points included `src/main.jsx`, Vite/ESLint configuration and the tracked
scripts. The audit followed relative and `@/` imports, re-exports, literal dynamic
imports/require calls and imported assets. No computed module imports or glob
loaders were found. The Vite alias's directory URL was inspected separately;
all surviving local module imports resolve.

Supported test imports were protected as additional roots. The repository is a
private application without package exports; HTML/public/reference/script entry
points were checked for additional source consumers. All branding/media files
were retained rather than treating unused runtime imports as permission to remove
design source assets.

The one active feature barrel that pulled retired code was
`features/admin-client-workspace/index.js`: its `useAdminRouteClient` export
retained the repository-based admin/invitation service chain. After removing that
unused export, the chain had no surviving production consumer. The old
`admin-client-setup` create/edit hooks and validation/UI were also unused by the
current API-backed client workflow, so no helper relocation was necessary.

Before deletion, targets were checked against the repository's `src` boundary,
tracked-file inventory, dirty-file list, pre-audit hashes and retained imports.
Deletion was applied by explicit file patches, not recursive directory removal.

The post-audit confirms that the only modified surviving production source files
are `AuthProvider.jsx`, `authRuntime.js` and the feature barrel above. All other
surviving source hashes match the pre-cleanup audit, including dashboard widgets,
route/access metadata and existing auth/token transport code.

The remaining 454 non-test source files are reachable in the conservative
entry-point graph. This includes all barrel exports: it does not prove that every
export is used or that the remaining component system/import boundaries are ideal.

## Runtime Contract

```js
runtime = { apiClient, viewer, defaultClientId }
```

Removed `removedLocalDataClient`, `runtime.dataClient`, the duplicate auth-context
`dataClient` and `skipRepositoryRouteContext`. No source references to these or
the removed repository runtime remain. `defaultClientId` keeps its previous
explicit-value / active-workspace / null precedence.

Added `app/providers/auth/authRuntime.test.js` to protect API-client/viewer
identity, active-workspace fallback, an explicit default and signed-out/no-workspace
handling. Removed only the tests for throwing repository/password stubs; the
backend-backed authentication, routing, settings, periods, all-time values,
explanations and dashboard presentation tests remain.

## Verification

Commands run from `agency-reports`; full logs remain in the ignored directory.

| Check | Result | Log |
| --- | --- | --- |
| `npm test` | PASS: 47 files, 155 tests | `tests.log` |
| `npx eslint src` | PASS, no diagnostics | `eslint.log` |
| `npm run build` | PASS | `build.log` |
| `npm run build:github-pages` | PASS | `build-github-pages.log` |
| `npm run build:campaign-level-pages` | PASS | `build-campaign-level-pages.log` |
| Post-cleanup dependency/hash audit | PASS: no missing imports or unexpected source edits | `dependency-audit-after.json` |

Normal-build output changed from 3518 to 3505 transformed modules, approximately
143.61 to 115.16 kB CSS and 1525.96 to 1524.06 kB JavaScript. The CSS reduction
reflects removal of old markup from Tailwind's scan, not a UI redesign or a
measured runtime-performance improvement. The existing large-JavaScript-chunk
warning remains; no code splitting or warning suppression was added.

The in-app local tab renders the login screen and requires authentication for
the requested Lead Report route. Authenticated dashboard, role, responsive-layout
and Display/refresh interaction checks remain **unverified**. No password was
reset and no dashboard settings, source synchronization or refresh was changed
through the browser. Unit/static-render tests and successful builds do not replace
those checks.

## Documentation And Next Boundary

`docs/frontend-architecture.md` is the current API-only working guide;
`docs/ARCHITECTURE.md` points to it instead of maintaining a conflicting runtime
description. The root agent rule now uses API-backed feature workflows rather
than the removed data client. Historical product/research documents remain.

API adapter consolidation, import-boundary enforcement, active component splitting
and backend refactoring are later stages, not completed by this cleanup.
