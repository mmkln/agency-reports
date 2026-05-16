# Shared Layer Instructions

Shared code must stay generic and domain-agnostic.

Use shared for:

- Product UI primitives and wrappers.
- Layout shell components.
- Theme tokens and semantic utility mappings.
- Icons, routing helpers, data helpers, notifications, and charts that do not know a specific workflow.

Rules:

- Shared must not import from `entities`, `features`, `widgets`, `pages`, or `app`.
- Do not add task/client/report/dashboard-specific behavior here.
- If a shared component needs domain labels or statuses, pass them in as props or move the component down to `entities` or `features`.
- Prefer semantic design tokens over local Tailwind values.
- Keep shared components small, predictable, accessible, and documented by their props.
