# Apple Alignment Audit

This audit records the UI-token mismatches found before the Apple-aligned update and the decisions now encoded in the design system.

## Mismatches Found

| Area | Previous state | Issue | Resolution |
| --- | --- | --- | --- |
| Color semantics | `primary` was dark slate and `action` was blue. | Apple-style systems reserve blue for interactive emphasis, while label text is a separate semantic role. | `primary` and `action` now map to system blue; ordinary important text uses `text-text-primary`. |
| Premium neutral depth | Early Apple-aligned tokens still used bright blue and pure black too broadly. | The requested premium direction depends on elevated neutrals, Shark/Athens backgrounds, and restrained Science Blue. | `background`, `surface-*`, `primary`, `action`, `link`, materials, and charts now use premium Apple-inspired neutral and accent roles. |
| Numeric color classes | Components used `text-primary-900` and `text-secondary-900` for text. | These classes tied text hierarchy to palette ramps and would break when `primary` became system blue. | Replaced active usages with `text-text-primary` or `text-primary` where the element is a brand/action mark. |
| Typography docs vs Tailwind | Docs recommended Inter and negative tracking; Tailwind used Poppins and heavier compact sizes. | This did not match Apple system typography or the app rule to avoid negative letter spacing. | `font-sans` now uses the Apple system stack first; type tokens use Dynamic Type-inspired sizes and `letterSpacing: 0`. |
| Spacing docs | `spacing.md` was corrupted and did not document a tappable target token. | Agents could not reliably follow spacing guidance. | Rewritten spacing docs and added `target: 44px`. |
| Interaction sizing | Shared controls used 36-40px defaults. | Apple's iOS/iPadOS recommended tappable target is 44pt. | Shared `Button`, default `IconButton`, `Input`, `Select`, and default `MultiSelect` now use `h-target`/`w-target` where practical. |
| Charts | JS chart colors used Tailwind/Slate-era colors. | Recharts cannot use Tailwind classes and drifted from the semantic palette. | `chartColors.js` now maps to Apple system blue, green, red, yellow, teal, purple, and label gray. |

## Current Token Principle

Use semantic roles by purpose:

- Interactive: `primary`, `action`, `ring`, `premium-blue`
- Text hierarchy: `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-text-quaternary`
- Links: `link`, `link-hover`
- Premium accents: `premium-athens`, `premium-shark`, `premium-graphite`, `premium-indigo`, `premium-purple`
- Surfaces: `background`, `surface`, `surface-elevated`, `surface-raised`, `surface-chrome`, `surface-subtle`, `surface-muted`, `background-grouped`
- Fills: `fill`, `fill-secondary`, `fill-tertiary`, `fill-quaternary`
- Separators: `border`, `border-subtle`, `border-strong`, `separator`, `separator-opaque`, `input`
- Materials: `material-ultra-thin`, `material-thin`, `material-regular`, `material-thick`, `material-liquid`, `material-vibrant`, `material-chrome`, `shadow-premium`
- Status: `success`, `warning`, `destructive`

Do not use palette ramp classes like `text-primary-900` for semantic text hierarchy.
