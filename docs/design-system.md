# Agency Client Portal Aggregator - Design System

This document is the visual source of truth for new UI work in this project.

Canonical system:
- Agency Design System is the single project canon for this portal.
- The shared UI foundation is integrated as Tailwind v4 CSS-first semantic tokens in `src/index.css`; use those tokens for shared primitives and application chrome.
- Detailed foundation rules are maintained in `src/index.css` and shared component files; review token definitions before changing primitives, overlays, motion, or app-structure patterns.

Reference contexts:
- `#landing` defines the public marketing and auth expression of the system.
- `#crm-dashboard` defines the internal application and dashboard expression of the system.

## Core Principles

- Use shared components from `src/shared/ui`, `src/shared/layout`, and `src/shared/charts` before creating page-local UI structures.
- Keep styling in Tailwind utility classes in JSX. Do not add component CSS files.
- Use `src/index.css` only for Tailwind imports, shadcn tokens, fonts, and minimal global base rules.
- Prefer calm, workspace-oriented surfaces for dashboard pages and more spacious, brand-led composition for public pages.

## Typography

Canonical font:
- `Geist Variable`

Implementation:
- Use `font-sans`.
- Do not hardcode `Inter`, system stacks, or page-specific font families in components.

Type scale:
- Landing hero: `text-5xl md:text-6xl`, `font-extrabold`, `leading-[1.1]`.
- Landing section heading: `text-3xl`, `font-bold`.
- Dashboard page title: `text-2xl sm:text-3xl`, `font-bold`.
- Panel title: `text-lg`, `font-semibold`.
- KPI value: `text-3xl`, `font-bold`.
- Body text: `text-sm` or `text-base`, `leading-6` or `leading-7`.
- Labels and eyebrows: `text-xs` or `text-sm`, `font-semibold`, uppercase only for short metadata.

## Colors

Brand colors:
- Brand primary is exposed as `bg-brand`, `text-brand`, and `hover:bg-brand-hover`.
- Platform action blue is exposed as `bg-action`, `text-action`, `hover:bg-action-hover`, and `bg-action-muted`.
- Premium neutrals are exposed as `bg-premium-athens`, `bg-premium-shark`, `text-premium-graphite`, and related semantic roles.

Token usage:
- Prefer semantic roles over palette ramps: `bg-background`, `bg-surface`, `bg-surface-subtle`, `bg-block`, `bg-control`, `bg-control-hover`, `bg-control-selected`, `border-separator`, `border-control-border`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, and `text-text-placeholder`.
- Use `bg-action` and `text-action` for platform-native actions; use `bg-primary` only for product-primary shadcn actions.
- Use material tokens only for overlays, menus, tooltips, translucent chrome, and deliberate layered surfaces: `bg-material-liquid`, `bg-material-vibrant`, `bg-material-chrome`, `border-material-border`.
- Do not use `slate`, `gray`, `indigo`, `blue`, `emerald`, `amber`, `orange`, `purple`, or hardcoded hex classes in page or feature JSX when a semantic role exists.

Application palette:
- Page background: `bg-background` or the shared page shell.
- Content surfaces: `bg-block`; subtle grouped areas: `bg-surface-subtle`.
- Standard controls: `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, `border-control-border`.
- Separators: `border-separator`; stronger control edges: `border-border-strong` only when needed.
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-text-quaternary`.

Status and chart colors:
- Success: `bg-success`, `bg-success-muted`, `text-success-foreground`, `border-success/20`.
- Warning: `bg-warning`, `bg-warning-muted`, `text-warning-foreground`, `border-warning/20`.
- Destructive: `bg-destructive`, `text-destructive`, `border-destructive/20`.
- Neutral action/info: `bg-action-muted`, `text-action`, `border-action/20`.
- Chart colors are `chart-1` through `chart-5` in CSS and `chartColors` from `src/shared/theme/chartColors.js` for SVG, canvas, Recharts, and inline style values.

Color rule:
- Public/auth primary actions and brand accents should use semantic brand/action tokens.
- Dashboard data/status UI may use status and chart tokens, not raw Tailwind palette ramps.
- Do not introduce unrelated dominant palettes such as beige, brown, dark slate-heavy, or broad purple gradients outside an approved brand surface.

## Spacing

Page containers:
- Use shared page/layout wrappers where possible.
- Prefer semantic spacing tokens: `p-page`, `gap-section`, `p-card`, `gap-card`, `p-control`, `gap-control`, `gap-item`, and `gap-layout`.
- Keep dashboard shell spacing calm and consistent; do not create hierarchy by adding extra nested bordered blocks.

Component spacing:
- Controls should use control spacing tokens or shared primitive defaults.
- Cards, panels, sheets, dialogs, tables, and form groups should inherit shared primitive spacing before page-local overrides.
- Avoid one-off pixel values unless matching an existing component contract.
- Attached input actions should read as one compound control: shared height, shared border/radius, one control background, and a trailing action segment separated by a subtle divider.

## Radius

Canonical radii:
- Buttons and compact controls: `rounded-control`.
- Content blocks/cards: `rounded-block`.
- Menus, popovers, dialogs, sheets, and raised overlays: `rounded-island`.
- Compact repeated items: `rounded-item`.
- Pills, avatars, and status dots: `rounded-full`.

Avoid:
- Random custom radius values.
- Nested card-on-card compositions unless one card is an actual repeated item, modal, or framed tool.

## Shadows

Application:
- Content cards are borderless by default.
- Use `shadow-none` for flat content, `shadow-block` for subtly raised blocks, and `shadow-premium` for overlays or deliberately elevated public/auth surfaces.
- Add borders only for real separation needs, tables, overlays, controls, or error/alert states.

Landing/auth:
- Prefer `shadow-premium` selectively for the primary shell or raised mockup.
- Avoid arbitrary shadow values and old palette-colored shadows.

Logo:
- Public landing logo may keep the interactive hover/brand shadow.
- Dashboard navigation uses `BrandLogo` with `variant="static"`: no logo shadow and no hover motion.
- Footer/dark logo uses no white glow.

## Components

Component library contract:
- shadcn primitives in `src/components/ui` must inherit project tokens from `src/index.css`.
- Default `Button`, `Input`, `Select`, `Sheet`, `Dialog`, `Card`, `Table`, `Badge`, and `Progress` styles should be usable without page-level corrective classes.
- If a primitive default conflicts with this design system, update the primitive or token once instead of repeating overrides in feature/page components.
- Public design-system components are exported from `src/shared/ui`; prefer that API for reusable structure and controls before adding page-local wrappers.
- Appearance mode is owned by `ThemeProvider` from `src/shared/theme`; components should not toggle `.dark` or read/write theme storage directly.
- Toolbar search should use the shared `SearchField` compound control. Do not hand-place search icons with absolute positioning in feature or page components.
- Dropdowns, selects, and sheets use the shared material/motion tokens. Keep placement, padding, radius, shadow, and close-control behavior in the primitive unless a workflow has a concrete accessibility or layout requirement.
- Filters should expose the domain meaning of the value being filtered. If the available values come from existing records, prefer a select of those values over a raw date/month input.
- Native file inputs should not be visible as polished product UI. Hide the native input, trigger it from a styled control, and render filename, preview, validation, and removal actions explicitly.
- When a value can be provided by URL or upload, use one value field with an attached upload action instead of showing two competing inputs or a mode switch.

Brand:
- Use `BrandLogo` from `src/shared/ui`.
- Do not recreate DentalFlow logo markup in pages.

Dashboard cards:
- Use `KpiCard` for top metrics.
- Use `Panel`, `PanelHeader`, and `PanelBody` for large dashboard sections.
- Use `ChartPanel` for chart blocks.
- Use `DashboardSectionGrid` and `MetricGrid` for dashboard layout rhythm.

Progress and lists:
- Use `ProgressRow` for compact progress rows.
- Use `ProgressBar` for labeled progress bars.
- Use `ChecklistItem` for completion lists.
- Use `TaskItem` for operational task rows; keep task rows mostly white with subtle borders, reserving color for small status indicators and badges.
- Use `PhaseCard` for roadmap phase cards; full-width phase rows should use subtle left accents, contextual icons, light tinted surfaces, shared `ProgressBar`, and `ChecklistItem`.

Tables and metrics:
- Use `TablePanel` and `TableBadge` for analysis tables.
- Use `GoalCard` for goal progress cards.

## Canon Decisions

- Font: `font-sans` / Geist is canonical across public, auth, and app UI.
- Brand/action/status/chart values live in `src/index.css` tokens and `src/shared/theme/chartColors.js`.
- App accent uses semantic action tokens, not Tailwind indigo ramp classes.
- Radius split is semantic: `rounded-control`, `rounded-block`, `rounded-island`, `rounded-item`.
- Shadow split is semantic: `shadow-none`, `shadow-block`, `shadow-premium`.
- Raw hex values should live in tokens or dedicated third-party brand assets, not repeated throughout JSX.

## Before Adding New UI

1. Check if a shared component already exists.
2. Match the page context: public/auth or dashboard.
3. Use this document's tokens and component rules.
4. If a new pattern repeats twice, move it into `src/shared/ui`.
5. If a design decision changes the canon, update this document and `agents.md`.
