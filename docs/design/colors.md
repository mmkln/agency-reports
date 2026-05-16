# Design Colors

This product uses Apple-inspired semantic color roles. Implement with semantic Tailwind tokens, not hardcoded hex values in pages or shared UI components.

Apple documents system colors as dynamic values that adapt by appearance and contrast. The values below are web approximations for this app, aligned to current Apple Human Interface Guidelines color references.

The premium direction is intentionally neutral-first: Athens Gray and Shark/Graphite create the base mood, Science Blue is reserved for action, and liquid/vibrant materials create depth for overlays.

## Core Roles

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| App background | `#F5F5F7` | `#1D1D1F` | `bg-background` | Main page background; premium neutral base. |
| Surface | `#FFFFFF` | `#2C2C2E` | `bg-surface`, `bg-card` | Base content surfaces. |
| Elevated surface | `#FFFFFF` | `#3A3A3C` | `bg-surface-elevated` | Cards, inputs, and content surfaces lifted from the app background. |
| Raised surface | `#F9F9FA` | `#48484A` | `bg-surface-raised` | Rare higher-emphasis neutral surface. |
| Chrome surface | `#EFEFF2` | `#222224` | `bg-surface-chrome` | Control backing, quiet blocks, segmented controls, and premium neutral fills. |
| Subtle surface | `#F2F2F7` | `#3A3A3C` | `bg-surface-subtle` | Quiet grouped areas and hover-adjacent surfaces. |
| Muted surface | `#E5E5EA` | `#48484A` | `bg-surface-muted` | Disabled backing fills and low-emphasis skeletons. |
| Primary action | `#0066CC` | `#0A84FF` | `bg-primary`, `text-primary`, `bg-action`, `text-action`, `bg-premium-blue` | Main actions, selected controls, links, focus. |
| Primary hover | `#0055B8` | `#2997FF` | `bg-primary-hover`, `bg-action-hover` | Hover and pressed states. |

## Premium Accent Roles

Use these sparingly. They exist to support elegance and information hierarchy, not to make the UI colorful.

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| Athens Gray | `#F5F5F7` | `#F5F5F7` | `bg-premium-athens` | Premium light neutral reference. |
| Shark | `#1D1D1F` | `#1D1D1F` | `bg-premium-shark`, `text-premium-shark` | Premium near-black reference; dark-mode base and strong text. |
| Graphite | `#636366` | `#8E8E93` | `text-premium-graphite`, `bg-premium-graphite` | Restrained secondary emphasis and chrome-like accents. |
| Science Blue | `#0066CC` | `#0A84FF` | `text-premium-blue`, `bg-premium-blue` | Apple-style reliable technology accent. |
| Indigo | `#5856D6` | `#5E5CE6` | `text-premium-indigo`, `bg-premium-indigo` | Rare secondary accent for categorization. |
| Purple | `#AF52DE` | `#BF5AF2` | `text-premium-purple`, `bg-premium-purple` | Rare elegant accent for special states or grouping. |

## Text Roles

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| Label | `#1D1D1F` | `#F5F5F7` | `text-text-primary`, `text-foreground` | Primary content, headings, important data. |
| Secondary label | `#636366` | `#A1A1A6` | `text-text-secondary` | Descriptions, metadata, table body support text. |
| Tertiary label | `#8E8E93` | `#8E8E93` | `text-text-muted` | Hints, captions, low-priority labels. |
| Quaternary label | `#B6B6BC` | `#636366` | `text-text-quaternary` | Disabled, watermark, and lowest-priority text. |
| Placeholder | `#8E8E93` | `#636366` | `text-text-placeholder` | Input and textarea placeholders. |
| On color | `#FFFFFF` | `#FFFFFF` | `text-primary-foreground`, `text-action-foreground` | Text and symbols on system blue. |
| Link | `#0066CC` | `#0A84FF` | `text-link` | Inline links and text-only actions. |
| Link hover | `#0055B8` | `#2997FF` | `hover:text-link-hover` | Hover state for inline links and text-only actions. |

## Background Hierarchy

Use grouped backgrounds for dashboard pages and table-like grouped content.

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| System grouped background | `#F5F5F7` | `#1D1D1F` | `bg-background-grouped`, `bg-grouped` | Main grouped page background. |
| Secondary grouped background | `#FFFFFF` | `#2C2C2E` | `bg-background-grouped-secondary`, `bg-grouped-secondary` | Cards, rows, grouped content surfaces. |
| Tertiary grouped background | `#EFEFF2` | `#3A3A3C` | `bg-background-grouped-tertiary`, `bg-grouped-tertiary` | Nested grouped content when needed. |

## Blocks, Islands, And Sidebars

Apple's 2025-2026 Liquid Glass direction separates content blocks from the functional layer. Use these semantic roles instead of mixing `surface`, `material`, and `fill` classes manually.

| Role | Token | Use |
| --- | --- | --- |
| Content block | `bg-block` | Cards, charts, forms, tables, static metrics, and other content surfaces. |
| Subtle block fill | `bg-block-subtle` | Secondary zones inside a block when spacing alone is not enough. |
| Block border | `border-block-border` | Exception-only hairline for dense data regions; not the default card treatment. |
| Block elevation | `shadow-block` | Subtle raised block shadow for hover, overlap, or emphasis. |
| Control fill | `bg-control` | Buttons, text inputs, selects, textareas, segmented controls, checkbox backing, range tracks, and routine control shells. |
| Control hover | `hover:bg-control-hover` | Hover on standard controls that are not floating material islands. |
| Control selected | `bg-control-selected` | Pressed/selected/disabled neutral control fill where a control needs a stronger state. |
| Control border | `border-control-border` | Subtle control boundary for inputs and outlined controls. |
| Functional island | `bg-island` | Temporary toolbar groups, segmented controls, compact action groups, and floating controls. |
| Island hover | `hover:bg-island-hover` | Hover on the outer floating island shell or island-owned chrome. Use `hover:bg-control-hover` for controls inside the island. |
| Island selected | `bg-island-selected` | Selected state for island-owned chrome. Use `bg-control-selected` for sidebar rows and standard controls inside an island. |
| Island border | `border-island-border` | Border around floating functional islands. |
| Sidebar material | `bg-sidebar` | Standard anchored sidebar shell. |
| Sidebar border | `border-sidebar-border` | Separator on the standard anchored sidebar shell. |

## Fill Roles

Apple uses fill colors as overlays for shapes that sit on top of a background. Use these for chips, selected cells, switch-like controls, skeletons, and disabled backing fills.

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| System fill | `#E6E6EA` | `#2B2B2E` | `bg-fill` | Thin/small shapes with visible emphasis. |
| Secondary system fill | `#EBEBEE` | `#262629` | `bg-fill-secondary` | Medium shapes, segmented control backing. |
| Tertiary system fill | `#F0F0F2` | `#1D1D1F` | `bg-fill-tertiary` | Large shapes. |
| Quaternary system fill | `#F5F5F6` | `#161618` | `bg-fill-quaternary` | Large complex areas with subtle emphasis. |

## Borders And Separators

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| Separator | `#D1D1D6` | `#3A3A3C` | `border-border` | Default component and table separators. |
| Subtle separator | `#E5E5EA` | `#2C2C2E` | `border-border-subtle` | Low-emphasis dividers. |
| Strong separator | `#C6C6C8` | `#48484A` | `border-border-strong` | Inputs, selected surfaces, stronger dividers. |
| Semantic separator | `#E5E5EA` | `#2C2C2E` | `border-separator` | Apple-style translucent divider role. |
| Opaque separator | `#C6C6C8` | `#48484A` | `border-separator-opaque` | Divider role that must fully hide content behind it. |
| Input border | `#C6C6C8` | `#48484A` | `border-input` | Low-level fallback input border; prefer `border-control-border` in shared UI controls. |
| Focus ring | `#0066CC` | `#0A84FF` | `ring-ring`, `focus:border-action` | Keyboard focus and active control emphasis. |

## Material Roles

Use material tokens sparingly for overlays that should feel elevated without becoming heavy: popovers, menus, floating filters, sticky headers, and drawers. Pair them with `backdrop-blur-*` utilities.

| Role | Token | Use |
| --- | --- | --- |
| Ultra thin material | `bg-material-ultra-thin` | Lightest overlay over visible content. |
| Thin material | `bg-material-thin` | Light overlay for toolbars and small menus. |
| Regular material | `bg-material-regular` | Default overlay for popovers and floating panels. |
| Thick material | `bg-material-thick` | High-contrast overlay where readability matters. |
| Material border | `border-material-border` | Borders around material surfaces. |
| Material shadow | `shadow-material` | Shadow for material popovers and overlays. |
| Liquid material | `bg-material-liquid` | Frosted-glass floating surfaces such as menus, popovers, and command panels. |
| Vibrant material | `bg-material-vibrant` | Higher-readability glass layer for dialogs, sheets, and tooltips. |
| Chrome material | `bg-material-chrome` | Subtle translucent chrome-like strips and floating bars. |
| Premium shadow | `shadow-premium` | Deeper, softer elevation for liquid/vibrant overlays. |
| Scrim | `bg-scrim` | Modal, dialog, sheet, and blocking overlay backdrops. |

## Status Roles

| Role | Light | Dark | Token | Use |
| --- | --- | --- | --- | --- |
| Success | `#34C759` | `#30D158` | `text-success`, `bg-success` | Positive status and positive movement. |
| Success muted | `#E8F8ED` | `#12351D` | `bg-success-muted` | Success badge background. |
| Warning | `#FFCC00` | `#FFD60A` | `text-warning`, `bg-warning` | Warning and review-needed states. |
| Warning muted | `#FFF7D6` | `#3D3200` | `bg-warning-muted` | Warning badge background. |
| Destructive | `#FF383C` | `#FF4245` | `text-destructive`, `bg-destructive` | Critical states and destructive actions. |
| Destructive muted | `#FFECEF` | `#3A1214` | `bg-destructive-muted` | Error badge and alert background. |

## Chart Palette

Use `src/shared/theme/chartColors.js` for Recharts and inline chart styles:

- `primary`: Science Blue, `#0066CC`
- `base`: label black, `#1D1D1F`
- `green`: Apple green, `#34C759`
- `rose`: Apple red, `#FF383C`
- `teal`: Apple teal, `#00C3D0`
- `amber`: Apple yellow, `#FFCC00`
- `violet`: Apple purple, `#AF52DE`
- `indigo`: Apple indigo, `#5856D6`
- `slate`: Apple secondary label, `#636366`

## Implementation Rules

- Use semantic roles first: `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-text-quaternary`, `border-border`, `bg-action`, `text-action`.
- Theme switching is owned by `ThemeProvider` from `src/shared/theme`. Do not toggle `.dark` from page or feature components.
- Use `light`, `dark`, and `system` as the only appearance modes. `system` must resolve from `prefers-color-scheme` and continue responding to OS changes.
- Treat `primary` and `action` as interactive Science Blue. Do not use `text-primary-900` for ordinary dark text.
- Use `text-text-primary` for label text and important data.
- Use `bg-surface-elevated` for content surfaces and `bg-control` for premium neutral control backing.
- Use control tokens for interactive primitives and fill tokens for chips, row highlights, and non-control backing fills.
- Use `bg-material-liquid` and `bg-material-vibrant` only for overlays; do not make ordinary cards look glassy.
- Use `bg-scrim` for blocking overlay backdrops instead of hardcoded black opacity classes.
- Use `src/shared/theme/chartColors.js` when Tailwind classes cannot drive the color.
- Add a new semantic role when a new purpose appears; do not add one-off arbitrary hex values.
