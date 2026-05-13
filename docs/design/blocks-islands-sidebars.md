# Blocks, Islands, And Sidebars

This document captures the current Apple 2025-2026 direction for content blocks, transient Liquid Glass islands, and standard app sidebars, then maps it to this project.

Official references:

- [Apple Developer: Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)
- [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [WWDC25: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Apple HIG: Layout](https://developer.apple.com/design/Human-Interface-Guidelines/layout)
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple HIG: Focus and Selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection)
- [Apple HIG: Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets)

## Apple Direction

Apple's current model separates UI into two layers:

- Content layer: blocks, cards, tables, lists, forms, metrics, charts, and page content.
- Functional layer: persistent app chrome, toolbars, popovers, menus, sheets, controls, and action groups.

Liquid Glass belongs to transient or elevated functional UI. Persistent app chrome should stay familiar and anchored unless the product explicitly calls for floating chrome. Content blocks stay calmer and more solid so data remains legible. In Apple examples, grouped content is usually separated by background, spacing, curvature, and occasional elevation, not by default card borders.

## Blocks

Blocks are ordinary content containers. They should not look glassy.

Use:

- `bg-block`
- `rounded-block`
- `p-block`
- normal `shadow-none`
- `shadow-block` only when the block is intentionally raised or overlapping nearby content

Avoid:

- `bg-material-*`
- `shadow-premium`
- default borders on every card
- nested card-in-card structures
- extra borders when spacing can separate content
- decorative gradients or colored rails

Blocks should hold actual content: charts, tables, forms, grouped metrics, detail sections. A block is not a toolbar and not a navigation item.

Use `border-block-border` only as an exception for dense data regions where spacing, background, and separators are not enough. It is a hairline fallback, not the default card treatment.

## Islands

Islands are floating functional groups. They sit above content and can use translucent material.

Use:

- `bg-island`
- `hover:bg-island-hover`
- `bg-island-selected`
- `border-island-border`
- `rounded-island` for larger bars and floating containers
- `rounded-control` for controls inside islands
- `rounded-item` for compact menu rows, tooltip shells, avatars, and small chips
- `shadow-material` only when the island floats above content

Good island examples:

- grouped toolbar controls
- account menu trigger
- segmented controls
- floating action groups
- compact filter bars

Avoid:

- using islands for static cards or metrics
- putting an island inside another visible island
- hard dividers when blur/spacing can communicate the boundary
- mixing text buttons and icon buttons inside one shared island background unless the actions are clearly grouped

## Sidebars

In this product, the primary app sidebar is a standard anchored shell region. It stays attached to the left viewport edge, spans the app height, and separates from content with a quiet semantic background and a single separator. Do not turn the persistent sidebar into an inset floating island unless the product explicitly asks for that behavior.

Use:

- `bg-sidebar`
- `border-sidebar-border`
- `inset-y-0 left-0`
- `border-r`
- `w-sidebar-collapsed` and `hover:w-sidebar-expanded`
- rounded neutral selection fills like `bg-control-selected`

Avoid:

- inset floating primary sidebars without an explicit product requirement
- shadow, blur, or glass treatment on the persistent app sidebar
- active bars, colored rails, side strips, dots, or timeline-like selection indicators
- fixed icon colors across the whole sidebar
- more than two sidebar hierarchy levels

## Spacing And Shape Tokens

Use these tokens instead of one-off values:

| Token | Value | Use |
| --- | ---: | --- |
| `p-block` | 24px | Content block padding. |
| `p-island` | 14px | Internal padding for compact floating islands. |
| `app-rail` | 72px | Content offset for the collapsed standard sidebar. |
| `sidebar-collapsed` | 72px | Default anchored sidebar width. |
| `sidebar-expanded` | 288px | Expanded sidebar width on hover. |
| `rounded-block` | 16px | Content block radius. |
| `rounded-island` | 20px | Transient island and overlay radius. |
| `rounded-control` | 12px | Controls nested inside islands. |
| `rounded-item` | 8px | Compact rows and small nested elements. |
| `shadow-block` | subtle two-layer shadow | Raised content block shadow for overlap, hover, or emphasis. |

Keep shapes concentric: inner children should have a smaller radius than the parent and should align to the parent's padding.

## Component Mapping

| Component role | Project implementation |
| --- | --- |
| Content blocks | `Card` uses `bg-block`, `rounded-block`, `p-block`, and no border by default. |
| Raised content blocks | `Card elevation="raised"` or legacy `Card shadow` uses `shadow-block`. |
| Standard header | `Header` uses `bg-surface`, `border-separator`, and a fixed app-header height without radius or shadow. |
| Standard sidebar | `Sidebar` uses `bg-sidebar`, `border-sidebar-border`, `border-r`, and anchored positioning. |
| Sidebar item selection | `SidebarItem` uses `bg-control-selected`, `hover:bg-control-hover`, capsule geometry, and text/icon contrast. |
| Standard controls | Buttons, inputs, selects, textareas, checkboxes, range inputs, and segmented controls use `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, and `border-control-border`. |
| Floating control islands | Temporary toolbars and grouped action clusters can use `bg-island` / `bg-island-hover` when the whole group floats above content. |
| Overlays | `Dialog`, `Sheet`, dropdowns, popovers use material/vibrant primitives and overlay wrappers. |

## Review Checklist

Before finishing a component:

- Is this content or functional UI?
- If content, is it a solid block instead of Liquid Glass?
- If functional, is it persistent app chrome, a standard control, or a temporary island/overlay?
- Does the primary sidebar stay anchored and avoid decorative selection rails?
- Are radii concentric: island > block/control > inner item?
- Did spacing come from semantic tokens rather than arbitrary pixel values?
- Did the component use shared UI primitives before local class composition?
