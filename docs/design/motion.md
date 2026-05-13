# Motion

This document maps Apple's current motion guidance to this product's web implementation. Use it before changing transitions, hover behavior, overlay presentation, collapsible navigation, loading feedback, or appearance changes.

Official references:

- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple HIG: Sidebars](https://developer.apple.com/design/Human-Interface-Guidelines/sidebars)
- [WWDC24: Enhance your UI animations and transitions](https://developer.apple.com/videos/play/wwdc2024/10145)
- [SwiftUI Animations](https://developer.apple.com/documentation/swiftui/animations)

## Principles

- Motion must explain state, continuity, or feedback. Do not add motion as decoration.
- Frequent interactions should use brief, precise feedback. Avoid making repeated navigation, filtering, and selection interactions wait for visible animation.
- Preserve spatial continuity. If an object remains the same object across states, keep its anchor stable.
- Avoid animating layout properties that cause text, icons, controls, or row contents to jump.
- Prefer opacity, color, and clipping reveals for appearance and disappearance.
- Use directional movement only when direction communicates where content came from or where it went.
- If a move does not communicate useful meaning, fade out, change layout, then fade in.
- Respect `prefers-reduced-motion`. Reduced motion should remove long movement, zooming, repeated animation, blur motion, and bounce.

## Tailwind Motion Tokens

The values below are web approximations that keep motion short and restrained.

| Token | Value | Use |
| --- | ---: | --- |
| `duration-motion-instant` | `0ms` | State changes that must not animate. |
| `duration-motion-fast` | `120ms` | Hover, press, focus, color, opacity, and tooltip feedback. |
| `duration-motion` | `180ms` | Standard small state changes. |
| `duration-motion-medium` | `220ms` | Dialog and popover enter/exit when a little continuity helps. |
| `duration-motion-disclosure` | `240ms` | Sidebar width and other disclosure transitions. |
| `duration-motion-slow` | `300ms` | Loading/progress feedback where the user is already waiting. |
| `delay-motion-label` | `90ms` | Label reveal after a container has enough width. |
| `ease-motion-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default calm UI transitions. |
| `ease-motion-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter/disclosure transitions that need a softer finish. |
| `ease-motion-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Quick exits and disappearances. |

JS-driven animation can use `src/shared/theme/motion.js`.

## Component Rules

### Controls

- Use `transition-colors duration-motion-fast ease-motion-standard` for buttons, inputs, toggles, menu rows, and hoverable list controls.
- Do not animate control size on hover.
- Do not use bounce or spring-like motion for routine hover/focus states.

### Collapsed Navigation

- Keep icon anchors stable across collapsed and expanded states.
- Reveal labels independently with `max-width` and `opacity`.
- On expand, let the container width open first, then reveal label with `delay-motion-label`.
- On collapse, hide the label immediately and keep the icon at the same anchor. Do not show a wide row with a centered icon.
- Do not animate `justify-content`, padding, or icon position between states.

### Overlays

- Dialogs, sheets, dropdowns, popovers, and tooltips can use short fade and small scale/slide transitions.
- Exits should be faster than enters.
- Avoid animating blur in and out locally; the global reduced-motion rule removes long transitions for users who request it.

### Disappearance

- If an element disappears from the same location, fade or clip it out.
- If the layout must change after disappearance, fade the element first, then let layout change.
- Do not leave invisible text in layout if it changes alignment. Use `max-w-0`, `hidden`, or an equivalent layout-neutral state.

## Reduced Motion

`src/index.css` includes a global `prefers-reduced-motion: reduce` rule that shortens animations and transitions to `1ms`, removes transition delays, and disables smooth scrolling. Component code should still avoid excessive movement by default.
