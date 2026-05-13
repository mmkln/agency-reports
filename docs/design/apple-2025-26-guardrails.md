# Apple 2025-2026 Guardrails

This document turns current Apple Human Interface Guidelines and Liquid Glass guidance into project rules. Use it when a task asks for Apple-inspired UI, premium UI, navigation, overlays, controls, sidebars, toolbars, forms, lists, or visual polish.

Official sources checked:

- [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars), updated June 9, 2025.
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials), updated for Liquid Glass in 2025.
- [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color), current Liquid Glass color guidance.
- [Apple HIG: Layout](https://developer.apple.com/design/Human-Interface-Guidelines/layout), current Liquid Glass layout guidance.
- [Apple Developer: Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass), current platform design overview.
- [Apple: What's new in iOS 26](https://developer.apple.com/ios/whats-new/), current design direction overview.

## Missing Instructions That Caused Bad Output

The previous project docs were too broad. They said "Apple-inspired" and "premium", but did not explicitly block common web admin dashboard habits.

Add these constraints to every Apple-inspired UI decision:

- Do not translate "selected" into decorative rails, colored left bars, pill strips, timeline markers, or custom status slivers.
- Do not add custom navigation chrome when a material layer, rounded selection fill, text contrast, and focus state can communicate the state.
- Do not use Science Blue as a decorative brand accent. Reserve it for primary actions, links, selected text/icons when appropriate, and focus.
- Do not apply Liquid Glass or material effects to ordinary content cards, list rows, tables, or dashboards.
- Do not put borders on every card by default. Apple-style grouped content should lean on background, spacing, rounded corners, and occasional subtle elevation.
- Do not hard-code custom backgrounds for navigation, controls, sheets, popovers, or toolbars when the shared primitive already owns the shell.
- Do not create extra bordered containers just to make a component feel designed.
- Do not use all-caps section headers by default. Prefer title-style labels for section headers.
- Do not force fixed icon colors across an entire sidebar. Use semantic current-color unless a specific status meaning requires color.
- Do not animate icon alignment, padding, or justification in collapsed navigation. Keep the icon anchor stable and reveal labels independently.
- Do not turn the top of a page into a control junk drawer. Passive summaries, setup state, explanatory copy, and counters should not compete with search, filters, and the primary content.
- Do not answer clutter with prettier clutter. If a page reads as a pile of adjacent blocks, remove or disclose secondary regions before changing borders, shadows, radius, or color.
- Do not evaluate a component in isolation when it lives near other page chrome. Apple-style restraint depends on the whole sequence from header to toolbar to content.

## Core 2025-2026 Direction

Apple's current direction is not "more blue" or "more decoration". It is a clearer separation between:

- content layer: ordinary app content, lists, tables, cards, forms, data, and page backgrounds;
- functional layer: navigation, controls, toolbars, tab bars, sidebars, popovers, sheets, and menus.

Liquid Glass belongs to the functional layer. Standard surfaces belong to content.

For project tokens and implementation details, also read [Blocks, Islands, And Sidebars](./blocks-islands-sidebars.md).

## Sidebar And Navigation Rules

The primary app sidebar should stay in a standard anchored app-shell position unless a product requirement explicitly asks for floating chrome.

Use:

- `bg-sidebar` and `border-sidebar-border` for the persistent sidebar shell.
- `inset-y-0 left-0`, `border-r`, `w-sidebar-collapsed`, and `hover:w-sidebar-expanded` for the app sidebar.
- rounded row selection fills like `bg-fill-secondary` or a similar neutral semantic fill.
- `text-text-primary` for selected labels and icons.
- `text-text-secondary` for unselected labels and icons.
- `hover:bg-fill-tertiary` or `hover:bg-fill-secondary` for hover.
- focus rings for keyboard navigation.
- familiar symbols from the project icon system.

Avoid:

- inset floating primary sidebars without an explicit product requirement.
- shadow, blur, rounded outer shells, or glass treatment on persistent app navigation.
- active left bars, colored rails, side strips, dot markers, or any decorative selected-item ornament.
- strong colored icon sets in the sidebar.
- more than two hierarchy levels.
- hiding important actions at the bottom of a sidebar.
- fixed-color icon styling unless the icon communicates status.

If a sidebar needs stronger selection, increase the opacity or contrast of the rounded fill before adding any new visual object.

## Materials Rules

Use Liquid Glass or material tokens only when the element floats above, controls, or navigates content.

Good uses:

- transient navigation surfaces;
- temporary header/toolbar chrome;
- popovers;
- dropdown menus;
- command menus;
- sheets and dialogs;
- floating action groups.

Bad uses:

- table rows;
- ordinary cards;
- static dashboard panels;
- metric cards;
- content list backgrounds;
- nested content blocks.

If the interface starts to look busy, remove custom backgrounds first.

## Controls Rules

Controls should use shared primitives before local styling.

Use:

- `Button`, `IconButton`, `Input`, `Select`, `Checkbox`, `ToggleGroup`, `DropdownMenu`, `Popover`, `Dialog`, and `Sheet` through `src/shared/ui`.
- semantic sizes: `h-target`, `h-control-small`, `h-control-large`, and matching spacing tokens.
- semantic control colors: `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, and `border-control-border`.
- rounded shapes that follow the existing system radius.
- semantic colors and focus rings.

Avoid:

- arbitrary heights like `h-9`, `h-10`, or custom px values when a semantic control size exists.
- local `bg-*`, border, or shadow overrides on shared controls unless the component variant is missing.
- using content block tokens like `bg-block` for inputs, selects, buttons, or segmented controls.
- crowding controls or stacking multiple material surfaces on top of each other.
- color as the only state cue.

## Windows, Sheets, Dialogs, And Drawers

Use shared overlay architecture:

- primitive shell owns material, radius, border, shadow, blur, focus behavior, escape handling, and close affordance;
- `OverlayHeader`, `OverlayBody`, and `OverlayFooter` own internal chrome, spacing, and separators;
- page code owns only content and behavior.

Avoid:

- hand-built `fixed` drawers;
- local modal shells with `bg-white`, `bg-surface`, `border-0`, `shadow-xl`, or hardcoded hex values;
- content pushed too close to rounded sheet/dialog corners;
- full-height forms that should be pages or split views.

## Lists, Tables, Forms, And Sections

Apple's current direction gives list-based layouts more room and stronger curvature.

Use:

- larger row height and padding when scanability benefits;
- section spacing and title-style labels;
- separators before adding row backgrounds;
- grouped backgrounds only for actual grouping;
- `FormField` or equivalent label/control/help/error structure.

Avoid:

- all-caps headers unless they match a local product convention that is already documented;
- dense rows with cramped actions;
- nested cards inside cards;
- decorative containers that do not map to a real task boundary.

## Color Rules

Color is for meaning and action, not decoration.

Use:

- neutral surfaces and fills for most UI;
- Science Blue for primary actions, links, focus, and selected text/icons when a platform-like selected state needs color;
- dynamic semantic tokens with light and dark variants;
- foreground tokens that match semantic backgrounds.

Avoid:

- stained-glass color effects unless emphasizing a primary action;
- fixed color across all navigation icons;
- similar foreground/background colors on material layers;
- one-off hex classes in page or shared UI component class names.

## Pre-Commit Design Checklist

Before finishing an Apple-inspired UI change, answer these:

- Is this based on current 2025-2026 Apple guidance, not an old iOS/macOS mental model?
- Is navigation visually a functional layer above content?
- Did I avoid decorative active bars, rails, strips, and unnecessary accent objects?
- Are shared primitives owning controls, overlays, and navigation shells?
- Is Liquid Glass/material used only for functional layers?
- Are content surfaces standard, calm, and non-glassy?
- Are cards borderless by default, with `shadow-block` used only for real elevation?
- Does the page reveal primary content quickly, with no passive setup/counter/explanation stack before the content?
- Does every persistent top-of-page block support an immediate user action? If not, is it behind disclosure or inside the relevant content/detail region?
- Did I review neighboring header, toolbar, filter, counter, and content regions together instead of polishing one component alone?
- Are state changes communicated by fill, text/icon contrast, focus, and clear labels before color decoration?
- Are spacing and sizes semantic rather than arbitrary?
- Are motion durations/easing semantic, brief, and respectful of reduced motion?
- Did I remove custom styling before adding new styling?
