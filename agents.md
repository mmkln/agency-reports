# Agent Instructions

## Project Memory

- After every significant resolved question, bug, implementation issue, or workflow problem, update this `agents.md` file with a concise new instruction that prevents the same mistake, confusion, or repeated question in the future.
- Add only instructions that are reusable and specific to this project. Avoid logging one-off details that will not help future work.
- Keep new instructions short, actionable, and placed in the most relevant section. Create a new section only when it improves clarity.
- Before making changes, read this file and follow its current instructions.
- Before UI/style changes, read `docs/design-system.md`; treat DentalFlow Design System as the single canon, with `#landing` as the public/auth reference context and `#crm-dashboard` as the internal app reference context unless the user provides a newer screenshot or snippet.
- When example files are Figma Make HTML exports, do not copy the Figma wrapper DOM into React. Extract reusable visual patterns from the design metadata/thumbnail and implement them as shared UI components.
- If multiple example HTML exports are byte-identical Figma files, derive page modules from the visible navigation/page names and keep them behind a central route registry instead of duplicating page code.
- Keep extracted SVG assets in `src/shared/icons` behind an `Icon` registry/named exports API. Normalize reusable monochrome icons to `currentColor` and preserve brand colors only for brand marks.
- Use route `iconName` values and `src/shared/icons` components for navigation/page icons instead of text abbreviations or inline SVG in page modules.
- Tailwind is installed with the v4 Vite plugin flow: keep `@tailwindcss/vite` in `vite.config.js` and `@import "tailwindcss";` at the top of `src/index.css`; do not add legacy v3 config unless a concrete need appears.
- Component and page styling should use Tailwind utility classes in JSX. Keep `src/index.css` limited to Tailwind import and minimal global base styles; do not reintroduce `App.css` or component-specific global selectors.
- Use design tokens such as `brand`, `brand-hover`, `heading`, and `public-background` in JSX instead of repeating raw brand hex values.
- When fully implementing a page from Figma wrapper HTML, use the visible thumbnail/metadata as the source of truth for above-the-fold structure, then complete the page with coherent domain sections using existing page modules, shared UI, icons, and Tailwind.
- Do not invent full page content when example HTML lacks the actual page DOM. If the files only contain a Figma wrapper/canvas/iframe bootstrap, report that limitation and ask for a real page export, screenshot set, or accessible preview payload before implementing exact pages.
- When the user provides screenshots, treat them as higher-confidence design evidence than Figma wrapper HTML. Update labels, icons, spacing, and active states to match the screenshots before inferring anything else.
- When the user provides exact SVG markup for an icon, preserve its viewBox, geometry, stroke settings, and semantic icon name in `src/shared/icons` instead of using an approximate replacement.
- When the user provides a React reference snippet as a visual target, mirror its layout, spacing, Tailwind states, and component hierarchy using the local architecture and icon registry; do not add new UI dependencies unless the user asks.
- Reuse `src/shared/layout`, `src/shared/ui`, and `src/shared/charts` for shell, page headers, KPI cards, panels, progress rows, legends, activity rows, and charts instead of duplicating those structures inside page modules.
- Use shared `TaskItem` for operational task rows instead of page-local colored task card implementations.
- Task completion indicators should be simple circular checkbox controls; do not place circular check icons inside another circular checkbox.
- Use shared `PhaseCard` for development roadmap phase rows instead of page-local phase card layouts; keep phase rows full-width with shared progress and checklist components.
- Buildout technical documentation sections should stay on the Buildout page and use shared dashboard surfaces (`Panel`, `PanelBody`, icon registry) rather than being mixed into operational CRM pages.
- Use the shared `BrandLogo` component for DentalFlow branding across public, auth, and dashboard layouts instead of recreating logo markup in pages; dashboard navigation should use its static variant without hover motion or logo shadow.
- Auth-only pages such as login should use route metadata `layout: 'auth'` and `showInNav: false` so they render outside `AppShell` and do not appear in dashboard navigation.
- Public marketing pages such as landing should use `layout: 'public'` and `showInNav: false`, rendering outside the dashboard shell while remaining in the central route registry.
- When adding shadcn components, keep generated files compatible with this project's ESLint rules by removing unused React imports and preserving intentional non-component exports only with a narrow file-level exception.
