# Design System

This directory is the canonical transferred foundation design system documentation for Agency Reports UI work.

Before changing UI components, layouts, copy, tables, metrics, charts, or page structure, start here and then read the relevant topic documents.

## Required Reading

- [Spacing](./spacing.md): layout rhythm, 8pt grid, whitespace, component proximity, and density rules.
- [Typography](./typography.md): Apple-inspired system type scale, text hierarchy, labels, metrics, and numeric data rules.
- [Colors](./colors.md): Apple-inspired semantic color roles, Tailwind tokens, and chart color usage.
- [Motion](./motion.md): Apple-inspired motion, transition, disappearance, disclosure, and reduced-motion rules.
- [App Organization And UX Structure](./app-organization.md): Apple 2025-2026 app anatomy, page structure, navigation, toolbar, search, split/detail, and presentation rules.
- [Component Structure](./component-structure.md): Apple-inspired composition rules for pages, sidebars, toolbars, lists, tables, forms, panels, and overlays.
- [Apple 2025-2026 Guardrails](./apple-2025-26-guardrails.md): current Liquid Glass, sidebar, navigation, overlay, control, and anti-pattern rules.
- [Blocks, Islands, And Sidebars](./blocks-islands-sidebars.md): Apple 2025-2026 content blocks, transient functional islands, standard sidebars, spacing, and token mapping.
- [Apple Alignment](./apple-alignment.md): known mismatches found in the previous UI token system and the current resolution.
- [UI Component Audit](./ui-component-audit.md): current component-level mismatches against the Apple-aligned tokens and structure rules.
- [Component Implementation Audit](./component-implementation-audit.md): current component inventory, structural hotspots, primitive/token drift, and future component checklist.
- [React Project Adoption](./react-project-adoption.md): how to move this design system into other React projects without direct-copy drift.

## Research References

- [Client Analytics Dashboard UI Recommendations](../research/client-analytics-dashboard-ui-recommendations.md): required research-derived reference before designing or implementing client-facing analytics dashboards, KPI cards, goal progress, funnel views, channel sections, dashboard insights, and dashboard drill-downs.

## Product Principles

- The interface should feel light, structured, platform-native, precise, and premium through restraint rather than saturation.
- Use hierarchy through spacing, alignment, typography, and restrained color.
- Prefer elevated white surfaces on Athens Gray in light mode and layered Shark/Graphite neutrals in dark mode.
- Use label text tokens for structure and important text.
- Use Science Blue only where the user should notice, act, focus, or select.
- Use Graphite, Indigo, and Purple only as restrained secondary accents.
- Use liquid/vibrant material tokens for overlays and temporary floating UI, not ordinary page sections or persistent app chrome.
- Treat persistent header/sidebar navigation as standard app shell, and controls, sheets, popovers, and menus as functional UI above content.
- Use motion to clarify state change, not to decorate. Frequent controls should use fast color/opacity feedback and avoid layout jumps.
- Keep pages on a consistent anatomy: `PageShell`, `PageHeader`, `ContentToolbar`, `ContentRegion`, and optional detail/overlay region.
- Reveal primary content quickly. A page should not make users pass through passive setup blocks, counter strips, or explanatory chrome before they reach the table, list, board, or form they came to use.
- Treat the top of a page as a decision area, not a storage area. Each persistent block before primary content must support an immediate user action; otherwise move it into progressive disclosure, settings, an inspector, or the content region.
- Treat content cards, tables, charts, forms, and metrics as solid blocks, not Liquid Glass.
- Match metric prominence to user value: primary decision-driving metrics can be cards; passive counters belong in compact metadata rows near the table, filter, or toolbar they describe.
- Treat cards as borderless by default; use grouped backgrounds, spacing, curvature, and only occasional `shadow-block` elevation before adding a border.
- Do not add decorative active bars, rails, strips, or accent ornaments to selected navigation items.
- Avoid nested bordered/background blocks when spacing and typography can communicate structure.
- Do not hardcode visual values that already exist as design tokens.

## Implementation Map

- Color tokens and Tailwind v4 theme mapping: `src/index.css`
- Typography Tailwind tokens: `text-display`, `text-heading`, `text-body`, `text-ui`, `text-label`, `text-data`
- Spacing Tailwind tokens: `micro`, `tag`, `item`, `control`, `component`, `card`, `panel`, `page`, `section`, `control-mini`, `control-small`, `target`, `control-large`, `layout`, `control-xl`, `spacious`, `app-gutter`, `content-gutter`, `app-rail`, `sidebar-collapsed`, `sidebar-expanded`, `search`, `search-compact`, `number-field`, `inspector`, `menu`, `popover`
- Motion Tailwind tokens: `duration-motion-fast`, `duration-motion`, `duration-motion-medium`, `duration-motion-disclosure`, `duration-motion-slow`, `delay-motion-label`, `ease-motion-standard`, `ease-motion-emphasized`, and `ease-motion-exit`
- Layout Tailwind tokens: `max-w-content`, `max-w-readable`, `max-w-form`, `max-w-inspector`, `max-w-detail-value`, `max-w-title`, `max-w-chip`, `max-w-sheet-sm`, `max-w-sheet-md`, `max-w-modal-lg`, `max-w-modal-xl`, `max-w-viewport-safe`, `max-h-overlay`, `max-h-overlay-body`, `max-h-overlay-detail-body`, `min-w-table-sm`, `min-w-table-lg`, `min-w-status-trigger`, `min-w-status-menu`, `grid-cols-overview`, `grid-cols-inspector`, `grid-cols-job-detail`
- Additional Apple-inspired tokens: `text-text-quaternary`, `text-link`, `bg-fill`, `bg-fill-secondary`, `bg-background-grouped`, `bg-surface-elevated`, `bg-surface-raised`, `bg-surface-chrome`, `bg-premium-blue`, `bg-premium-indigo`, `bg-premium-purple`, `bg-premium-graphite`, `border-separator`, `bg-material-liquid`, `bg-material-vibrant`, `bg-material-chrome`, `bg-scrim`, `shadow-material`, `shadow-premium`
- Block/control/island/sidebar tokens: `bg-block`, `bg-block-subtle`, `border-block-border`, `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, `border-control-border`, `bg-island`, `hover:bg-island-hover`, `bg-island-selected`, `border-island-border`, `bg-sidebar`, `border-sidebar-border`, `rounded-block`, `rounded-island`, `rounded-control`, `rounded-item`, `p-block`, `p-island`, `shadow-block`
- JS/inline theme helpers: `src/shared/theme`
- Motion JS helper: `src/shared/theme/motion.js`
- Appearance runtime: `ThemeProvider` and `useTheme` from `src/shared/theme`
- Product UI wrappers: `src/shared/ui`
- Page structure wrappers: `PageShell`, `PageHeader`, `ContentToolbar` from `src/shared/ui`
- Overlay structure wrappers: `OverlayHeader`, `OverlayBody`, `OverlayFooter` from `src/shared/ui`
- shadcn/Radix primitives: `src/components/ui`

## Working Rule

If a UI decision conflicts with local code style, keep the implementation consistent with the component architecture, but preserve the intent of these design documents.
