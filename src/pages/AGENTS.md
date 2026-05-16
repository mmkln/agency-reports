# Pages Layer Instructions

Pages are route composition files. They connect data, headers, widgets, and features for one URL.

Rules:

- Keep pages thin: no large reusable UI components, no domain policy logic, no storage repair logic.
- Page-local components are allowed only when they are truly route-specific and small.
- If a page-local component grows, repeats, or represents a reusable section, move it to `widgets`.
- If it performs a user action or workflow, move it to `features`.
- If it renders one domain object consistently, move it to `entities/<entity>/ui`.
- Use canonical page/workspace headers from `shared/ui`; do not recreate header chrome locally.
