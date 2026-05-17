# Component Implementation Audit

Date: 2026-05-16

This audit checks whether React components follow the current project structure, shared primitive usage, semantic tokens, and decomposition rules. It is intentionally static-code-first: browser verification is not part of this audit unless explicitly requested.

## Current Inventory

| Measure | Count |
| --- | ---: |
| `.jsx/.tsx` files under `src` | 181 |
| Component-like files in component layers | 158 |
| React component declarations detected | 404 |
| Raw lowercase form/control tags outside primitive layers | 5 |
| Unit test files | 28 |
| Unit tests passing in latest audit run | 150 |

Layer file distribution:

| Layer | `.jsx/.tsx` files |
| --- | ---: |
| `src/shared/ui` | 47 |
| `src/features` | 42 |
| `src/pages` | 34 |
| `src/components` | 16 |
| `src/widgets` | 14 |
| `src/app` | 9 |
| `src/entities` | 4 |

## Checks Run

- Largest `.jsx/.tsx` files by line count.
- Files with many local React component declarations.
- Raw `<button>`, `<input>`, `<textarea>`, and `<select>` usage outside `src/components/ui` and `src/shared/ui`.
- Direct imports from `features/*/components` outside the owning feature.
- Hardcoded palette classes and hex colors outside `src/components/ui`.
- Arbitrary Tailwind utilities such as `w-[...]`, `h-[...]`, and `grid-cols-[...]`.
- Typography drift from raw `text-sm`, `text-xs`, `font-semibold`, etc.
- Spacing/chrome drift from raw numeric spacing, borders, radius, and shadow utilities.
- Domain leakage into `shared/ui` and `components/ui`.

Validation run after the recent structural refactors:

```text
npm test
28 files passed, 150 tests passed

npx eslint src
passed

npm run build
passed with the existing Vite large chunk warning
```

Latest structural cleanup status:

- `AdminPerformanceDashboardEditorSections.jsx` was split from a 1171-line implementation file into an 18-line section export facade.
- Performance dashboard editor sections now live in focused files: `BasicPerformanceSections`, `PerformanceCollectionSections`, `TrendSeriesSection`, `ServiceSectionsSection`, `AgencyWorkSection`, `AppendixTablesSection`, and `EditorInspector`.
- `ClientPerformancePage.jsx` was reduced from a 1142-line route/UI hybrid to a 34-line route shell.
- Client performance dashboard presentation now lives in `widgets/client-performance`, split into focused section files under 220 lines each.
- `AdminClientRequestsPage.jsx` was reduced from a 780-line route/UI/workflow mix to a 116-line route shell.
- Admin client request list UI now lives in `widgets/admin-client-requests`; request dialogs and workflow state live in `features/admin-client-requests`.
- Visible lowercase raw controls outside primitive layers are now limited to legacy pages only.
- Page/app/widget import boundary checks currently show no direct imports from `features/*/components`.

## Findings

### 1. Import Boundary Issues

`admin-overview-editor` now follows the intended boundary: external pages import only from `features/admin-overview-editor`.

Latest status: resolved for pages/app/widgets in the 2026-05-16 cleanup. Pages now import the affected features from feature root APIs.

Previously found direct page imports from feature internals:

| File | Issue |
| --- | --- |
| `src/pages/admin/clients/AdminClientsPage.jsx` | Imports from `features/admin-client-setup/components`. |
| `src/pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPage.jsx` | Imports a concrete component file from `features/admin-performance-dashboards/components`. |

Fix direction:

- Export page-consumed feature APIs from each feature root `index.js`.
- Pages should import feature modules from `features/<feature-name>`, not `features/<feature-name>/components`.
- Internal feature components may use direct local imports.

### 2. Oversized Components And Files

High-risk files by size and local component count:

| File | Lines | Component declarations | Recommended action |
| --- | ---: | ---: | --- |
No active high-risk UI component files remain in this specific audit list. Continue checking large files before adding behavior.

Recently resolved:

| File | Previous state | Current state |
| --- | --- | --- |
| `src/features/admin-performance-dashboards/components/editor/AdminPerformanceDashboardEditorSections.jsx` | 1171 lines, 21 local components | 18-line export facade plus focused section files. |
| `src/pages/client/performance/ClientPerformancePage.jsx` | 1142-line route/UI hybrid with 38 local components | 34-line route shell plus `widgets/client-performance` section files. |
| `src/pages/admin/client-requests/AdminClientRequestsPage.jsx` | 780-line route/UI/workflow mix with 11 local components | 116-line route shell plus request widget, feature dialogs, and feature workflow hook. |
| `src/pages/client/reports/ClientReportsPage.jsx` | 651-line duplicate archive/reader implementation | 27-line legacy redirect bridge into mature Reports & Dashboards. |
| `src/widgets/client-reports-dashboards/ReportsDashboardsSections.jsx` | 477-line multi-section widget | 6-line export facade plus focused section files. |
| `src/widgets/client-projects/ClientProjectsSections.jsx` | 379-line list/detail widget | 2-line export facade plus focused list/detail files. |
| `src/features/admin-performance-dashboards/components/AdminPerformanceDashboardEditor.jsx` | 361-line editor shell with local workflow state | 203-line composition shell plus `useAdminPerformanceDashboardEditorWorkflow`. |
| `src/features/admin-performance-dashboards/components/PerformanceDashboardJsonImportModal.jsx` | 405-line modal with embedded JSON examples | 171-line modal plus model-owned import examples. |
| `src/features/admin-client-setup/components/CreateClientModal.jsx` | 359-line modal with 10 local components | 149-line modal shell plus field components and model validation helpers. |
| `src/features/admin-reports/components/ReportModal.jsx` | 318-line report editor modal | 84-line modal shell plus report section components. |
| `src/pages/admin/reports/AdminReportsPage.jsx` | 356-line route/workflow mix with local filters, mutations, and modal orchestration | 5-line route shell plus `AdminReportsWorkspace`, `useAdminReportsWorkspace`, and model-owned report filter helpers. |
| `src/features/admin-performance-dashboards/components/editor/PerformanceCollectionSections.jsx` | 327-line collection section bundle | 5-line section export facade plus focused KPI, goal, insight, channel, and next-action section files. |
| `src/shared/layout/AppSidebar.jsx` | 318-line app shell component with config, row styling, navigation, search, notifications, account, and theme menu in one file | 59-line shell composition plus focused shared layout files for styles/config, nav item, search, notifications, and account menu. |
| `src/features/tasks/import-task-markdown/components/TaskMarkdownImportModal.jsx` | 328-line modal with local FileReader, form state, fields, warnings, and preview rendering | 82-line modal shell plus feature hook, field component, preview component, and model-owned example Markdown. |

Fix direction:

- Root page files over roughly 250-300 lines need review.
- Files with more than 4-5 local components need review.
- Use the `admin-overview-editor` pattern:

```text
Root component = route/feature shell
Workflow hook = load, autosave, mutation, confirmation state
Sections component = page section layout and callback wiring
Section files = one editor/list/detail area each
Local primitive files = editor-specific cards/rows only
```

### 3. Primitive Usage Drift

Lowercase raw controls outside primitive layers are now limited to legacy pages:

| File | Raw control tags |
| --- | ---: |
| `src/pages/legacy/marketing-process/MarketingProcessPage.jsx` | 1 |
| `src/pages/legacy/landing/LandingPage.jsx` | 1 |
| `src/pages/legacy/daily-activities/DailyActivitiesPage.jsx` | 2 |
| `src/pages/legacy/build-board/BuildBoardPage.jsx` | 1 |

Not every raw tag is wrong. Acceptable cases include hidden file inputs, low-level primitives, and rare accessibility-specific markup. But raw visible controls in pages/features should usually become:

- `Button`
- `Input`
- `Textarea`
- `RadixSelect` / select wrappers
- `Checkbox`
- `Switch`
- `SearchField`
- `Dialog`, `Sheet`, `Popover`, `DropdownMenu`

Fix direction:

- During refactors, replace visible raw controls with shared primitives.
- If a repeated control pattern needs heavy local styling, create a feature-local component first.
- Promote to `shared/ui` only after the same generic pattern appears in at least two features.

### 4. Token Drift

Hardcoded palette classes and hex colors are mostly in legacy pages. Active non-legacy hotspots:

| File | Color literals |
| --- | ---: |
| `src/shared/icons/iconRegistry.jsx` | 4 |
| `src/shared/theme/ThemeProvider.jsx` | 2 |

Arbitrary Tailwind utilities are expected in some primitive files, but active feature/page hotspots include:

| File | Arbitrary utilities |
| --- | ---: |
| `src/widgets/client-performance/*` | 4 |
| `src/features/admin-performance-dashboards/components/editor/*` | 7 |
| `src/features/tasks/import-task-markdown/components/TaskMarkdownImportModal.jsx` | 4 |
| `src/features/admin-reports/components/ReportModal.jsx` | 3 |

The previous typography and spacing/chrome drift in `src/pages/client/reports/ClientReportsPage.jsx` is resolved by routing the legacy page to the mature Reports & Dashboards destination.

Fix direction:

- Replace raw typography with semantic tokens such as `text-heading`, `text-ui`, `text-body`, `text-label`, and semantic text colors.
- Replace repeated spacing with tokens such as `gap-card`, `gap-component`, `p-card`, `px-card`, `py-component`, and layout wrappers.
- Avoid local `border`, `rounded-*`, and `shadow-*` when shared primitives or semantic tokens can express the surface.
- Use semantic color tokens from `src/index.css`; do not introduce palette utilities in active product UI unless visual data encoding requires it.

### 5. Shared UI Domain Leakage

No meaningful domain logic was found in `src/shared/ui` or `src/components/ui`. The only product-specific exception is `BrandLogo`, which is acceptable app branding, not workflow logic.

Keep this invariant:

- `shared/ui` may own generic structures, controls, layout primitives, and feedback states.
- `shared/ui` must not know task, client, report, dashboard, request, campaign, or overview business rules.

## Priority Backlog

### P0: Prevent New Drift

- Add AI instructions that require component placement decisions before implementation.
- Require new visible controls to use existing primitives first.
- Require pages to import feature roots, not feature internals.
- Require token audit for any UI change that introduces raw palette, spacing, border, shadow, or typography utilities.

### P1: Structural Cleanup

The previous P1 client reports duplication is resolved. Continue applying the same split-or-redirect rule when hidden legacy routes start owning duplicated mature-destination UI.

### P2: Primitive Extraction Candidates

Promote only after confirming reuse in at least two active product features:

- `FieldGroup` / `FormSection`
- `EditorSectionCard` or a more generic `SectionPanel`
- `InlineMetaRow`
- `EmptyState` / `ErrorState` / `LoadingState`
- `IssueList` for import/validation previews
- `FileImportField`
- `VisibilitySelect`
- `StatusSelect` variants backed by entity metadata
- `FormFooterActions`

### P3: Token Cleanup

- Convert active non-legacy pages away from palette utilities.
- Reduce arbitrary layout values in product pages and feature components.
- Revisit `widgets/client-performance` only for the remaining justified chart width/grid arbitrary utilities.

## Review Checklist For Future Component Work

Before adding or changing a component:

1. Decide ownership: `page`, `widget`, `feature`, `entity/ui`, or `shared/ui`.
2. Check whether an existing primitive or wrapper already solves the interaction.
3. Use shared controls for visible buttons, inputs, selects, textareas, dialogs, sheets, popovers, dropdowns, tabs, switches, and badges.
4. Keep route pages thin; move workflow state into feature hooks and screen blocks into widgets/features.
5. Use entity metadata for labels, tones, icons, and status/visibility display.
6. Use semantic tokens for typography, spacing, color, radius, shadow, and motion.
7. Avoid adding borders/chrome unless hierarchy cannot be expressed with layout, spacing, background, or typography.
8. Export feature APIs from feature root `index.js`; do not make pages import `features/*/components/*`.
9. If a file grows past 250-300 lines or accumulates more than 4-5 local components, split it before adding more behavior.
10. Run `npx eslint src`, `npm test`, and `npm run build` after structural refactors.
