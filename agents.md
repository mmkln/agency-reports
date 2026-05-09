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
- When source materials conflict, prioritize explicit user direction, then product rules, then architecture, then visual examples.
- Treat screenshots and concrete reference snippets as higher-confidence design evidence than inferred intent.
- Use examples and exports as references for patterns, not as code to copy blindly.

## Architecture

- Keep domain behavior in services and policies; page components should orchestrate data and compose UI.
- Access persisted data through repository adapters, not direct browser storage calls from pages, widgets, or domain code.
- Keep persistence schema/version validation and reset/reseed behavior inside repository adapters and implementation docs; do not add page-level storage repair logic.
- Keep entity identifiers stable string IDs in fixtures, repositories, and tests.
- Add product pages deliberately from a use case or requested workflow, not as placeholder shells.
- Centralize routing and route metadata instead of scattering navigation behavior across pages.
- Keep shared infrastructure generic and product-specific behavior near the feature or domain that owns it.

## UI Composition

- Reuse existing shared layout, UI, chart, icon, and primitive components before creating page-local equivalents.
- Prefer shadcn primitives from `src/components/ui` for low-level controls and compose business UI around them.
- Do not build parallel base components when an existing primitive can express the same interaction.
- Avoid borders when spacing, background, typography, or state color can communicate structure clearly; too many borders make dense admin UI feel overloaded.
- Keep primitive defaults aligned through shared tokens and component defaults instead of repeated page-level corrective classes.
- Keep dropdown list spacing in the primitive itself: select/dropdown content should use consistent popper placement, viewport padding, and item padding.
- Use the project icon registry for navigation and common actions instead of inline SVG or text stand-ins.
- Use established branding, shell, header, and layout components instead of recreating them inside pages.
- Keep section header icons unframed by default and align header title, icon, and actions on the same centerline.
- Render status option groups as compact controls with clean, unframed icons, restrained active states, and clear selected markers; omit repeated per-option descriptions when height is constrained.
- Hide creation controls when a hard item limit is already reached; do not leave disabled input rows visible unless they explain an actionable state.
- Avoid duplicate interfaces for the same workflow; when a new interaction model replaces an old one, remove the superseded UI unless the user asks to keep both.

## Page Layout

- Put page-level entity context, primary status, filters, and main actions in the route header when they control the whole screen.
- Avoid redundant local headers or top cards that repeat information already owned by the page header.
- Keep filters close to the page-level controls they affect, with accessible hidden headings when the visual title is intentionally omitted.
- Keep page-header status metadata inline and unboxed; do not put status labels inside bordered containers.
- Do not wrap header toggles in input-like bordered containers; render them as lightweight label-and-switch controls aligned with the header actions.
- Keep toggle labels stable across on/off states; use the switch state to express the value instead of changing adjacent label text.
- Use compact, task-focused layouts for internal tools; avoid decorative or marketing-style composition in operational screens.
- Avoid nested card-on-card structures unless the inner card is a repeated item, modal, or genuinely framed tool.

## Forms And Inputs

- Keep field rendering, upload behavior, overlay content, table rows, and native input details in feature/shared components or hooks rather than large page components.
- Use native HTML constraints for immediate field feedback, while keeping business validation and normalization in domain services.
- Auto-derived editable values may auto-fill until the user edits them; after that, preserve user control while continuing validation.
- Put file parsing, preview, size/type checks, and `FileReader` behavior in dedicated inputs or feature hooks.
- Keep internal notes, client-visible text, and reusable summaries as separate fields when they have different audiences.

## Data Visibility And Permissions

- Enforce access, visibility, and status-transition rules in domain policies/services, then reflect only allowed actions in UI.
- Never expose internal-only records, notes, draft content, or hidden workflow state through client-facing surfaces.
- Treat contact metadata, account identity, assignee information, and viewer identity as separate concepts.
- On client-facing routes, treat route `clientId` as the requested resource only; pass the authenticated viewer/session unchanged into domain services so access checks cannot be bypassed by URL params.
- Preserve controlled fallback states for unavailable external resources, but do not use fallback UI as a reason to duplicate an active workflow.

## Product Behavior

- Keep dashboard integrations embed/link oriented unless a use case explicitly requires custom analytics.
- Keep report and summary content human-authored unless a use case explicitly requires generated content.
- Link overview blocks to dedicated surfaces for deeper workflows instead of embedding full secondary experiences inside summaries.
- In task detail drawers, keep the structure workflow-first: entity badges and meta, status actions, conditional status reason panel, private/internal notes, client-safe summary, and primary actions in the actual drawer footer.
- Preserve empty, loading, unavailable, and permission-denied states as intentional product behavior rather than accidental blanks.

## Implementation Hygiene

- Keep Tailwind and styling aligned with the project's current setup; do not introduce legacy configuration or global CSS patterns without a concrete need.
- Keep generated or third-party component files compatible with lint rules through minimal, targeted adjustments.
- Avoid broad refactors while implementing a specific user request unless the refactor is necessary to complete it safely.
- Do not verify results in the browser unless the user explicitly asks for browser verification; rely on code review, lint, tests, and builds by default.
