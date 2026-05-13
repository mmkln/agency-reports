# React Project Adoption

Use this guide when moving the design system practices and components into another React project.

## Source Of Truth In This Project

The transferred foundation now lives directly in this Vite/Tailwind v4 project.

It contains:

- Tailwind v4 CSS theme, CSS variables, dark mode, and reduced-motion base layer: `src/index.css`
- Theme helpers and `ThemeProvider`: `src/shared/theme`
- `cn` with Tailwind merge config: `src/lib/utils.js`
- Product UI wrappers: `src/shared/ui`
- Adapted shadcn/Radix primitives: `src/components/ui`

## Do Not Direct-Copy Everything

Do not directly copy page layouts, app headers, sidebars, auth menus, routing containers, API code, charts, or feature-specific cards into another project.

Move the foundation in layers:

1. Tokens and Tailwind integration: CSS-first Tailwind v4 tokens in `src/index.css`.
2. Base CSS variables and dark mode.
3. `cn` and theme helpers.
4. Primitive UI wrappers: `Button`, `Input`, `Badge`, `Card`.
5. Overlay wrappers: `Dialog`, `Sheet`, `DropdownMenu`, `Popover`, `Tooltip`.
6. Structure wrappers: `PageShell`, `PageHeader`, `ContentToolbar`, `OverlayHeader`, `OverlayBody`, `OverlayFooter`.
7. Local app shell implementation for the target project.

## React Project Audit

Before migration, check:

- React version and bundler: CRA, Vite, Next.js, Remix, or custom.
- Tailwind version and whether package source files are scanned by `content`.
- Existing shadcn/Radix primitives and their versions.
- Existing semantic token names that may conflict.
- Current dark-theme strategy.
- Current modal/drawer architecture.
- Whether the app should consume a package or copy the JS wrappers directly.

## Minimum Integration

For another target project that already has Tailwind v4:

```css
@import "tailwindcss";
/* Copy or import the foundation token section from this project's src/index.css. */
```

Tailwind v3 projects should migrate to Tailwind v4 before adopting this implementation. Do not add a legacy Tailwind config to this repo.

Use the public UI API:

```tsx
import { Button, Card, FormField, PageShell } from "@/shared/ui";
```

## Migration Rule

If a target project fights the foundation, do not patch random one-off styles into pages. Add or adjust a semantic token, shared primitive, or local wrapper first.

## Keeping Projects Aligned

Tailwind v4 consuming projects should prefer this CSS-first token model. Tailwind v3 projects should migrate instead of adding a new legacy config to Agency Reports.
