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
- For design, UX, page structure, or similar experience work, first check the design documentation and ask how Apple would implement the interaction, hierarchy, spacing, and visual restraint.
- Before changing shared UI primitives, app shell, overlays, motion, tokens, or Apple-inspired layout decisions, read `docs/design/README.md` and the relevant linked topic docs.
- When source materials conflict, prioritize explicit user direction, then product rules, then architecture, then visual examples.
- Treat screenshots and concrete reference snippets as higher-confidence design evidence than inferred intent.
- Use examples and exports as references for patterns, not as code to copy blindly.

## Architecture

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

- Reuse existing shared layout, UI, chart, icon, and primitive components before creating page-local equivalents.
- Prefer shadcn primitives from `src/components/ui` for low-level controls and compose business UI around them.
- Do not build parallel base components when an existing primitive can express the same interaction.
- Treat Apple/HIG-style references as hierarchy and restraint guidance, not as a reason to copy platform chrome literally or redesign the information architecture prematurely.
- Avoid borders when spacing, background, typography, or state color can communicate structure clearly; too many borders make dense admin UI feel overloaded.
- Keep primitive defaults aligned through shared tokens and component defaults instead of repeated page-level corrective classes.
- Let shared primitives own icon/text alignment, size, and line-height; pass icons through the primitive API instead of mixing SVG nodes into text children.
- Keep dropdown list spacing in the primitive itself: select/dropdown content should use consistent popper placement, viewport padding, and item padding.
- Use the project icon registry for navigation and common actions instead of inline SVG or text stand-ins.
- Define reusable entity/status labels, tones, and icons in entity metadata and render them through the project icon registry, so status visuals stay consistent across tables, headers, badges, and editors.
- Use established branding, shell, header, and layout components instead of recreating them inside pages.
- Give every shared UI component root a dev-inspector `id` that starts with the component name, using `useInspectorId('ComponentName', id)` so repeated instances stay unique while caller-provided ids remain respected.
- Keep section header icons unframed by default and align header title, icon, and actions on the same centerline.
- Render status option groups as compact controls with clean, unframed icons, restrained active states, and clear selected markers; omit repeated per-option descriptions when height is constrained.
- Hide creation controls when a hard item limit is already reached; do not leave disabled input rows visible unless they explain an actionable state.
- Avoid duplicate interfaces for the same workflow; when a new interaction model replaces an old one, remove the superseded UI unless the user asks to keep both.

## Page Layout

- Put page-level entity context, primary status, filters, and main actions in the route header when they control the whole screen.
- Keep global navigation quiet and structural. It should orient and switch major destinations, not compete with page content, search, or primary workflow actions.
- Choose top navigation, sidebar, or split navigation from the actual information architecture: use a top nav for a small flat set of destinations, a sidebar for many stable destinations or nested workspaces, and avoid role-specific shells until the role workflows truly diverge.
- Separate navigation destinations from commands, previews, search, account controls, and page actions. A nav item should move to a stable place; commands belong in headers, toolbars, popovers, dialogs, or sheets.
- Define page-level create actions through `PageHeader.primaryAction`, `AdminClientWorkspaceHeader.primaryAction`, or `PagePrimaryAction`; do not hand-style buttons such as New Client, New Task, New Dashboard, or New Report in page code.
- Treat primary create action styling as a design-system responsibility. Pages may provide label, destination, disabled state, and product behavior, but not local color, radius, shadow, size, or icon sizing.
- In editors with auto-save, keep the action bar compact and trust-based: visible save status, preview menu, one primary publish/submit action, and secondary/destructive actions in overflow.
- Separate client-visible/front-stage content from internal/back-stage agency workflow instead of mixing both audiences in one undifferentiated card stack.
- Do not turn audience labels such as "client-facing", "internal", or "agency workspace" into large layout wrappers. Prefer object-based surfaces and sections such as Overview, Tasks, Requests, Reports, Dashboards, Access, and Activity.
- Avoid redundant local headers or top cards that repeat information already owned by the page header.
- Keep filters close to the page-level controls they affect, with accessible hidden headings when the visual title is intentionally omitted.
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

- Keep Tailwind and styling aligned with the project's current setup; do not introduce legacy configuration or global CSS patterns without a concrete need.
- For completed client-facing workflows, add or update browser/e2e coverage for role transitions, publish boundaries, and visibility guards instead of relying only on unit tests.
- For shared UI styling, use the Tailwind v4 semantic foundation tokens in `src/index.css`; do not add a legacy `tailwind.config` or copy Tailwind v3 presets into this project.
- For appearance/theme mode, use `ThemeProvider` and `useTheme` from `src/shared/theme`; do not toggle `.dark` or read/write theme storage from feature components.
- After bulk remapping palette utilities to semantic tokens, audit for malformed opacity suffixes such as `bg-token0` or `bg-token/100` and replace them with the intended semantic class.
- When routing page and feature imports through shared UI wrappers, preserve primitive behavior such as `asChild`, icon children, size variants, and explicit `className` tone overrides so the wrapper does not subtly change existing interactions.
- When overriding shared primitive sizing with semantic Tailwind tokens, confirm `tailwind-merge` understands the custom token group so defaults such as sheet/modal widths do not silently win.
- When changing primitive controls, dropdowns, selects, sheets, or cards, update `src/components/ui` defaults first so page components do not accumulate corrective Tailwind overrides.
- Keep generated or third-party component files compatible with lint rules through minimal, targeted adjustments.
- Avoid broad refactors while implementing a specific user request unless the refactor is necessary to complete it safely.
- Do not verify results in the browser unless the user explicitly asks for browser verification; rely on code review, lint, tests, and builds by default.
