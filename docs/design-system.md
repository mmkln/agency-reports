# DentalFlow Design System

This document is the visual source of truth for new UI work in this project.

Canonical system:
- DentalFlow Design System is the single project canon.

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
- Brand primary: `#5A45FF`
- Brand hover: `#4836E0`
- Heading navy: `#0A1128`
- Public page background: `#F8FAFF`

Token usage:
- Prefer `bg-brand`, `text-brand`, `hover:bg-brand-hover`, and `text-heading` over repeated arbitrary brand hex values.
- shadcn `primary` is mapped to the DentalFlow brand color.

Dashboard palette:
- Page background: `bg-slate-50`
- Surfaces: `bg-white`
- Borders: `border-slate-100` for light cards, `border-slate-200` for panels and shell separators
- Text strong: `text-slate-900`
- Text body: `text-slate-600`
- Text muted: `text-slate-500`

Status and chart colors:
- Indigo: `text-indigo-600`, `bg-indigo-50`, `#4f46e5`
- Emerald: `text-emerald-600`, `bg-emerald-50`, `#10b981`
- Purple/Violet: `text-purple-600`, `bg-purple-50`, `#8b5cf6`
- Amber: `text-amber-600`, `bg-amber-50`, `#f59e0b`
- Rose only for destructive or alert states.

Color rule:
- Public/auth primary actions and brand accents should use `#5A45FF`.
- Dashboard data/status UI may use Tailwind semantic palettes, with indigo as the primary app accent.
- Do not introduce unrelated dominant palettes such as beige, brown, dark slate-heavy, or broad purple gradients outside the existing landing/buildout hero patterns.

## Spacing

Page containers:
- Use `max-w-7xl mx-auto`.
- Dashboard shell padding: `px-4 sm:px-6 lg:px-8`.
- Landing/public padding: `px-6`.
- Main dashboard vertical rhythm: `py-8 space/gap-6`.

Component spacing:
- KPI cards: `p-6`, grid `gap-6`.
- Panels: header `px-6 py-5`, body `p-6`.
- Feature cards: `p-8`, grid `gap-8`.
- Form fields: `gap-2` inside labels, `gap-5` between fields.
- Use Tailwind spacing scale. Avoid one-off pixel values unless matching an existing component contract.

## Radius

Canonical radii:
- Buttons and compact controls: `rounded-lg` or `rounded-xl`.
- KPI cards and dashboard panels: `rounded-2xl`.
- Landing mockups and auth shell: `rounded-3xl`.
- Icons inside cards: `rounded-xl` or `rounded-2xl`.
- Pills and badges: `rounded-full`.

Avoid:
- Random custom radius values.
- Nested card-on-card compositions unless one card is an actual repeated item, modal, or framed tool.

## Shadows

Dashboard:
- Default cards and panels: `shadow-xs`.
- Hover cards: `hover:shadow-sm`.
- Avoid heavy shadows in dense application views.

Landing/auth:
- CTA buttons may use `shadow-md shadow-indigo-100`.
- Large mockups may use `shadow-2xl`.
- Auth shell may use a soft brand shadow such as `shadow-[0_24px_70px_rgba(90,69,255,0.08)]`.

Logo:
- Public landing logo may keep the interactive hover/brand shadow.
- Dashboard navigation uses `BrandLogo` with `variant="static"`: no logo shadow and no hover motion.
- Footer/dark logo uses no white glow.

## Components

Component library contract:
- shadcn primitives in `src/components/ui` must inherit DentalFlow tokens from `src/index.css`.
- Default `Button`, `Input`, `Select`, `Sheet`, `Card`, `Table`, `Badge`, and `Progress` styles should be usable without page-level corrective classes.
- If a primitive default conflicts with this design system, update the primitive or token once instead of repeating overrides in feature/page components.

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
- Brand color: `#5A45FF` is exposed as `brand` and mapped to shadcn `primary`.
- App accent: Tailwind indigo remains acceptable for internal dashboard data/status UI.
- Radius split: landing/auth may use `rounded-3xl` for large brand surfaces; dashboard cards and panels use `rounded-2xl`.
- Shadow split: dashboard remains low-shadow; public/auth can use stronger brand shadows selectively.
- Raw brand hex values should live in `src/index.css` tokens, not repeated throughout JSX.

## Before Adding New UI

1. Check if a shared component already exists.
2. Match the page context: public/auth or dashboard.
3. Use this document's tokens and component rules.
4. If a new pattern repeats twice, move it into `src/shared/ui`.
5. If a design decision changes the canon, update this document and `agents.md`.
