# Agent Instructions

## Project Memory

- Keep this file as a compact set of reusable working rules, not a changelog of individual fixes.
- Add or refine an instruction after a user-corrected issue only when the lesson applies across multiple future cases.
- Prefer abstract, actionable wording over references to one component, page, bug, or conversation.
- Before making changes, read this file and follow its current instructions.

## Sources Of Truth

- Read the relevant use-case document before changing product flow, permissions, data shape, or screen behavior.
- Read the frontend architecture guide before changing structure, ownership boundaries, or cross-layer responsibilities.
- Read the design system before UI or styling work, and treat it as the baseline unless the user provides newer visual evidence.
- Before designing or implementing client-facing analytics dashboards, read `docs/research/client-analytics-dashboard-ui-recommendations.md` and use only research-backed dashboard UI patterns unless the user explicitly changes the product direction.
- For design, UX, page structure, or similar experience work, first check the design documentation and ask how Apple would implement the interaction, hierarchy, spacing, and visual restraint.
- Before changing shared UI primitives, app shell, overlays, motion, tokens, or Apple-inspired layout decisions, read `docs/design/README.md` and the relevant linked topic docs.
- When source materials conflict, prioritize explicit user direction, then product rules, then architecture, then visual examples.
- Treat screenshots and concrete reference snippets as higher-confidence design evidence than inferred intent.
- Use examples and exports as references for patterns, not as code to copy blindly.
- When asked to match another screen's UI pattern, inspect that screen's actual component structure and classes before creating a local approximation.

## Architecture

- Before changing code under `src`, read the nearest layer `AGENTS.md` file. Layer-local instructions define ownership and import boundaries for `app`, `pages`, `widgets`, `features`, `entities`, `shared`, and primitives.
- Keep domain behavior in services and policies; page components should orchestrate data and compose UI.
- Access persisted data through repository adapters, not direct browser storage calls from pages, widgets, or domain code.
- Route pages should prefer `runtime.dataClient.read/write` around domain services for API-like loading/error behavior; keep direct repository access inside adapters and domain service boundaries.
- Keep persistence schema/version validation and reset/reseed behavior inside repository adapters and implementation docs; do not add page-level storage repair logic.
- Keep entity identifiers stable string IDs in fixtures, repositories, and tests.
- Add product pages deliberately from a use case or requested workflow, not as placeholder shells.
- Centralize routing and route metadata instead of scattering navigation behavior across pages.
- Keep shared infrastructure generic and product-specific behavior near the feature or domain that owns it.
- Resolve product ownership before layout: if a page mixes publishing, operations, access, reports, and activity, split or link the workflows instead of adding visual groups.
- Treat client-scoped admin work as a client workspace. Reuse the shared client workspace header/tabs for client-specific overview, tasks, requests, dashboards, reports, access, and activity instead of making isolated query-param pages feel unrelated.

## UI Composition

- Before adding or changing a component, decide and state its ownership layer: `page`, `widget`, `feature`, `entity/ui`, or `shared/ui`. Do not implement first and choose a location afterward.
- Use the component audit checklist in `docs/design/component-implementation-audit.md` before large UI refactors or when touching files already identified as structural hotspots.
- Treat pages as route shells. If a page starts owning local sections, field rendering, mutation workflows, or more than a small amount of UI state, extract to widgets, features, entity UI, or feature hooks before adding new behavior.
- Keep feature public APIs explicit. Pages should import from `features/<feature-name>`; avoid importing `features/<feature-name>/components/*` from pages or app code.
- A feature root component should compose workflow hooks, headers, dialogs, and section components. Load/autosave/mutation state belongs in feature hooks; dense section markup belongs in section files.
- Reuse existing shared layout, UI, chart, icon, and primitive components before creating page-local equivalents.
- Prefer shadcn primitives from `src/components/ui` for low-level controls and compose business UI around them.
- Do not build parallel base components when an existing primitive can express the same interaction.
- For visible controls, use project primitives first: `Button`, `Input`, `Textarea`, `RadixSelect`/select wrappers, `Checkbox`, `Switch`, `SearchField`, `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs`, and `Badge`. Raw lowercase `<button>`, `<input>`, `<textarea>`, and `<select>` are acceptable mainly inside primitives, hidden file inputs, or rare accessibility-specific cases.
- Promote a repeated pattern to `shared/ui` only when it is generic and appears in at least two active product features. Keep domain-specific variants in `features` or `entities/*/ui`.
- If a component file exceeds roughly 250-300 lines or contains more than 4-5 local React components, stop and split it before adding more behavior.
- Treat Apple/HIG-style references as hierarchy and restraint guidance, not as a reason to copy platform chrome literally or redesign the information architecture prematurely.
- Avoid borders when spacing, background, typography, or state color can communicate structure clearly; too many borders make dense admin UI feel overloaded.
- Keep primitive defaults aligned through shared tokens and component defaults instead of repeated page-level corrective classes.
- Let shared primitives own icon/text alignment, size, and line-height; pass icons through the primitive API instead of mixing SVG nodes into text children.
- Treat icon+input search as a shared compound control. Reuse the shared search field so icon position, height, focus ring, label behavior, and spacing do not drift across pages.
- Keep dropdown list spacing in the primitive itself: select/dropdown content should use consistent popper placement, viewport padding, and item padding.
- Use the project icon registry for navigation and common actions instead of inline SVG or text stand-ins.
- Define reusable entity/status labels, tones, and icons in entity metadata and render them through the project icon registry, so status visuals stay consistent across tables, headers, badges, and editors.
- Use established branding, shell, header, and layout components instead of recreating them inside pages.
- Give every shared UI component root a dev-inspector `id` that starts with the component name, using `useInspectorId('ComponentName', id)` so repeated instances stay unique while caller-provided ids remain respected.
- When extracting repeated controls into shared UI, preserve existing accessible labels, input IDs, and test-facing selectors unless there is a deliberate migration.
- Keep section header icons unframed by default and align header title, icon, and actions on the same centerline.
- Render status option groups as compact controls with clean, unframed icons, restrained active states, and clear selected markers; omit repeated per-option descriptions when height is constrained.
- Hide creation controls when a hard item limit is already reached; do not leave disabled input rows visible unless they explain an actionable state.
- Avoid duplicate interfaces for the same workflow; when a new interaction model replaces an old one, remove the superseded UI unless the user asks to keep both.

## Page Layout

- Put page-level entity context, primary status, filters, and main actions in the route header when they control the whole screen.
- Keep global navigation quiet and structural. It should orient and switch major destinations, not compete with page content, search, or primary workflow actions.
- The sidebar should show stable destinations for the current container, not every route the user has permission to access.
- Choose top navigation, sidebar, or split navigation from the actual information architecture: use a top nav for a small flat set of destinations, a sidebar for many stable destinations or nested workspaces, and avoid role-specific shells until the role workflows truly diverge.
- Separate navigation destinations from commands, previews, search, account controls, and page actions. A nav item should move to a stable place; commands belong in headers, toolbars, popovers, dialogs, or sheets.
- Before changing navigation, identify the exact navigation layer: app shell navigation, workspace tabs, page tabs, table actions, or command buttons. Do not edit nearby navigation-looking UI by assumption.
- For sidebar navigation, preserve stable collapsed/expanded geometry: icon anchors must not move, collapsed rows must be true icon targets, and vertical regions such as search, nav, utility, and account controls must not jump during expansion.
- Sidebar navigation should use list/sidebar selection styling rather than generic button or control fills; communicate state with neutral fill, text/icon contrast, and focus before stronger color.
- Sidebar search should remain a stable slot: icon-only when collapsed and input content revealed when expanded.
- Use the canonical `PageHeader` from `src/shared/ui` for page and workspace headers. Feature-specific headers may wrap it, but must not recreate title/action/tabs/header spacing locally.
- Keep page headers thin: title, essential metadata, and primary controls only. Do not render descriptive subtitles under page titles.
- In the sidebar app shell, page headers should behave as compact sticky app chrome: surface background, thin separator, compact title, essential metadata/actions only, and no descriptive subtitles by default.
- Make headers thinner by reducing chrome, padding, redundant rows, and subtitle copy; do not weaken the page title hierarchy unless explicitly requested.
- Treat header density as a structural problem, not a typography problem. Before changing title size or weight, audit wrapper padding, gap, breadcrumbs, subtitles, metadata rows, duplicated toolbars, and unnecessary borders.
- Define page-level create actions through `PageHeader.primaryAction`, `AdminClientWorkspaceHeader.primaryAction`, or `PagePrimaryAction`; do not hand-style buttons such as New Client, New Task, New Dashboard, or New Report in page code.
- Treat primary create action styling as a design-system responsibility. Pages may provide label, destination, disabled state, and product behavior, but not local color, radius, shadow, size, or icon sizing.
- In editors with auto-save, keep the action bar compact and trust-based: visible save status, preview menu, one primary publish/submit action, and secondary/destructive actions in overflow.
- Separate client-visible/front-stage content from internal/back-stage agency workflow instead of mixing both audiences in one undifferentiated card stack.
- Do not turn audience labels such as "client-facing", "internal", or "agency workspace" into large layout wrappers. Prefer object-based surfaces and sections such as Overview, Tasks, Requests, Reports, Dashboards, Access, and Activity.
- Avoid redundant local headers or top cards that repeat information already owned by the page header.
- Keep filters close to the page-level controls they affect, with accessible hidden headings when the visual title is intentionally omitted.
- Name filters after the domain value they actually filter, such as reporting month, published date, owner, or status; avoid vague labels such as period or date when multiple interpretations are possible.
- Before adding or changing a date/period filter, identify whether it filters creation date, publication date, due date, reporting range, or another domain field, then make that semantics visible in the label, options, and empty-state copy.
- Keep page-header status metadata inline and unboxed; do not put status labels inside bordered containers.
- Do not wrap header toggles in input-like bordered containers; render them as lightweight label-and-switch controls aligned with the header actions.
- Keep toggle labels stable across on/off states; use the switch state to express the value instead of changing adjacent label text.
- Use compact, task-focused layouts for internal tools; avoid decorative or marketing-style composition in operational screens.
- Avoid nested card-on-card structures unless the inner card is a repeated item, modal, or genuinely framed tool.

## Forms And Inputs

- Keep field rendering, upload behavior, overlay content, table rows, and native input details in feature/shared components or hooks rather than large page components.
- Use editable card lists instead of dense tables when each row contains nested controls, visibility toggles, long descriptions, and per-item actions.
- Use native HTML constraints for immediate field feedback, while keeping business validation and normalization in domain services.
- Show field-level validation next to the affected input for admin CRUD forms; keep page-level errors for save/load failures, not routine input mistakes.
- Gate destructive admin actions behind the shared confirmation dialog and phrase the consequence in terms of draft/published/client access impact.
- Keep confirmation dialogs text-first and consistent: no icons in dialog action buttons, no decorative decision icons, shared primary/destructive tone mapping only.
- Keep create/edit modals focused on fields and decisions required before submission; move explanatory future-state guidance into post-success states or follow-up actions.
- Do not ask for lifecycle/status choices during creation when a safe default can be assigned in the domain and edited later in the owning workflow.
- Treat multiple ways of setting the same value, such as upload or URL, as one field with a trailing action rather than separate inputs or mode switches unless the modes create genuinely different workflows.
- Do not expose native file inputs as visible UI; use a hidden file input, a styled trigger, explicit filename/preview text, and shared validation handling.
- Auto-derived editable values may auto-fill until the user edits them; after that, preserve user control while continuing validation.
- Put file parsing, preview, size/type checks, and `FileReader` behavior in dedicated inputs or feature hooks.
- Keep internal notes, client-visible text, and reusable summaries as separate fields when they have different audiences.

## Data Visibility And Permissions

- Enforce access, visibility, and status-transition rules in domain policies/services, then reflect only allowed actions in UI.
- Centralize workflow status selection policy in domain policies: allowed transitions, selectable options, ordering, and selected-state behavior should not be rebuilt inside page components.
- Never expose internal-only records, notes, draft content, or hidden workflow state through client-facing surfaces.
- Treat contact metadata, account identity, assignee information, and viewer identity as separate concepts.
- On client-facing routes, treat route `clientId` as the requested resource only; pass the authenticated viewer/session unchanged into domain services so access checks cannot be bypassed by URL params.
- Keep auth session lifecycle, expiry checks, and credential validation inside auth services; UI should pass credentials and react to viewer/null states.
- For client users, derive client portal access from memberships rather than profile fallback fields, so removing a membership actually revokes access.
- Treat invitations as lifecycle records: only pending, unexpired invites may be accepted; cancelled, expired, or accepted invites must render controlled inactive states and be blocked in domain services.
- Validate client-facing admin records in domain services before saving: required safe text, valid dates/URLs, visibility rules, and ordering must not depend on UI-only checks.
- Model client-request workflows as explicit status transitions with actor, timestamp, and history metadata so client responses and admin processing remain auditable when persistence changes.
- Keep admin draft state separate from published client-facing state; client routes must read published data unless an authorized admin explicitly requests a draft preview.
- Keep workflow records as live source records owned by their workflow surfaces. Do not copy tasks, client requests, activity, access, dashboards, or reports into an overview draft/publish snapshot unless the product explicitly needs a historical frozen artifact.
- Record client activity through a domain activity service and keep activity feeds admin/team-only unless a use case explicitly exposes them to clients.
- Preserve controlled fallback states for unavailable external resources, but do not use fallback UI as a reason to duplicate an active workflow.

## Product Behavior

- Keep dashboard integrations embed/link oriented unless a use case explicitly requires custom analytics.
- Keep report and summary content human-authored unless a use case explicitly requires generated content.
- Link overview blocks to dedicated surfaces for deeper workflows instead of embedding full secondary experiences inside summaries.
- Do not expose a choice unless each option produces a distinct, useful behavior or data source. If two options lead to the same result, collapse them into one action or implement the missing distinction first.
- Prefer finite selectors built from real available domain values over raw date/month inputs when the user is choosing from existing records rather than entering a new value.
- Label cross-role previews by what the user will actually see and who can see it, such as published client version or saved draft preview, instead of vague implementation labels.
- Before adding a dropdown, segmented control, or mode switch, verify that the use case defines multiple states the user can meaningfully choose between.
- Treat overview editors as publishing surfaces for authored communication. They may summarize related live workflows, but full task, request, report, dashboard, access, and activity management belongs on the owning surface.
- When a workflow has lifecycle, status, response/history, filters, or create/edit actions, give it a dedicated surface or detail flow instead of embedding it inside another editor.
- Keep row actions pointed at admin-owned management surfaces; do not send admins into client-facing acceptance or consumption flows unless the action is explicitly labeled as a preview.
- Put lifecycle actions for secondary records, such as invitations, in the surface that owns that lifecycle instead of duplicating shortcut actions in parent tables.
- In task detail overlays, keep the structure workflow-first: entity badges and meta, status control, conditional status reason panel, private/internal notes, client-safe summary, and primary actions in the actual overlay footer.
- In task detail status sections, present status as a compact property where the current status value itself opens the status menu; avoid separate "Change" buttons and visible transition button banks.
- Single status menus should behave like selection controls: include the current value and only domain-allowed target statuses, with the current draft value visibly selected.
- Use the status icon from entity metadata for workflow status controls; avoid generic colored dots when the state has a specific meaning.
- In item detail modals, make the item title the modal title, keep metadata compact and unbadged in the header, put longer descriptions in the body, prefer a single-column flow, and avoid nested card sections.
- In modals, keep text fields visually calm and consistent: use label/help hierarchy, neutral control surfaces, no colored textarea chrome, and no resize handles unless resizing is explicitly useful.
- Preserve empty, loading, unavailable, and permission-denied states as intentional product behavior rather than accidental blanks.

## Implementation Hygiene

- During component audits, report counts and hotspots separately from fixes. Do not claim the whole component system is clean just because lint/build pass.
- After component structure refactors, verify import boundaries, run `npx eslint src`, run `npm test` when domain/workflow behavior moved, and run `npm run build`.
- When introducing Tailwind classes in active product UI, prefer semantic project tokens over raw palette, numeric spacing, arbitrary values, border, radius, shadow, or typography utilities. If raw utilities are necessary, keep them local and explain why the existing token/primitive does not fit.
- Always run shell commands with the resolved project `workdir`, and use absolute paths for `apply_patch` when the environment cwd differs from the active repository, so edits never land in an old or adjacent workspace.
- Keep Tailwind and styling aligned with the project's current setup; do not introduce legacy configuration or global CSS patterns without a concrete need.
- For completed client-facing workflows, add or update browser/e2e coverage for role transitions, publish boundaries, and visibility guards instead of relying only on unit tests.
- In e2e tests, assert against stable semantic targets such as role, heading, label, row, or dialog scope; avoid raw page-wide text assertions when the same content can appear in inputs, previews, toasts, or hidden UI.
- After responsive shell, primitive, table, or dense admin layout changes, audit mobile and desktop routes for horizontal overflow and clipped interactive controls before treating tests as sufficient.
- For shared UI styling, use the Tailwind v4 semantic foundation tokens in `src/index.css`; do not add a legacy `tailwind.config` or copy Tailwind v3 presets into this project.
- For appearance/theme mode, use `ThemeProvider` and `useTheme` from `src/shared/theme`; do not toggle `.dark` or read/write theme storage from feature components.
- After bulk remapping palette utilities to semantic tokens, audit for malformed opacity suffixes such as `bg-token0` or `bg-token/100` and replace them with the intended semantic class.
- When routing page and feature imports through shared UI wrappers, preserve primitive behavior such as `asChild`, icon children, size variants, and explicit `className` tone overrides so the wrapper does not subtly change existing interactions.
- When overriding shared primitive sizing with semantic Tailwind tokens, confirm `tailwind-merge` understands the custom token group so defaults such as sheet/modal widths do not silently win.
- When changing primitive controls, dropdowns, selects, sheets, or cards, update `src/components/ui` defaults first so page components do not accumulate corrective Tailwind overrides.
- Keep generated or third-party component files compatible with lint rules through minimal, targeted adjustments.
- Avoid broad refactors while implementing a specific user request unless the refactor is necessary to complete it safely.
- Do not verify results in the browser unless the user explicitly asks for browser verification; rely on code review, lint, tests, and builds by default.
