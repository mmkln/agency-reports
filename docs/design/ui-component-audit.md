# UI Component Audit

This audit tracks the transferred foundation design-system coverage inside Agency Reports.

| Area | Project location | Status | Notes |
| --- | --- | --- | --- |
| Tailwind v4 semantic tokens | `src/index.css` | Complete | Foundation color, surface, control, material, typography, spacing, radius, shadow, and motion tokens live in the CSS-first Tailwind v4 setup. |
| Class merging | `src/lib/utils.js` | Complete | `tailwind-merge` knows the transferred text, color, spacing, shadow, radius, duration, ease, and delay tokens. |
| Theme runtime | `src/shared/theme` | Complete | `ThemeProvider`, `useTheme`, appearance persistence, system mode, chart colors, spacing, typography, and motion helpers are present. |
| Low-level primitives | `src/components/ui` | Complete | Button, input, badge, card, dropdown, select, sheet, dialog, table, progress, switch, checkbox, textarea, separator, label, and skeleton align to semantic tokens or local primitive roles. |
| Public UI API | `src/shared/ui` | Complete | Foundation wrappers include page structure, overlays, fields, dropdowns, popovers, tooltips, virtual grid, toggles, multi-select, read-only rows, and existing product UI wrappers. |
| Overlay architecture | `src/components/ui`, `src/shared/ui` | Complete | Dialog, sheet, dropdown, popover, and tooltip keep Radix portal/focus behavior while using material, radius, shadow, and motion tokens. |
| App shell integration | `src/shared/layout`, `src/app/App.jsx` | Complete | App shell uses background/sidebar tokens and wraps the app in `ThemeProvider`; user dropdown owns Light/Dark/System selection. |
| Auth surfaces | `src/pages/auth` | Complete | Login and invitation pages use shared primitives, material surfaces, semantic text, and theme-aware tokens. |

## Follow-Up Rule

Feature pages may still contain product-specific `slate`, `indigo`, or status palette classes for local data visualization. Replace those opportunistically when touching a feature, but keep design-system defaults centralized in `src/components/ui`, `src/shared/ui`, `src/shared/theme`, and `src/index.css`.
