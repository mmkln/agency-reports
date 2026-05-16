# Shared UI Instructions

This directory owns product-level reusable UI components.

Rules:

- Use semantic tokens from `src/index.css` for typography, spacing, radius, shadow, motion, and color.
- Do not add domain-specific status logic, task logic, client logic, report logic, or dashboard logic here.
- Product wrappers may compose primitives from `src/components/ui`, but callers should prefer importing from `src/shared/ui`.
- Keep component defaults strong enough that pages do not need corrective Tailwind overrides.
- Every shared UI component root should support a dev-inspector id through `useInspectorId`.
- Avoid adding borders by default when spacing, typography, background, or state color can create enough structure.
- Do not create a second version of an existing primitive or wrapper; improve the existing component instead.
