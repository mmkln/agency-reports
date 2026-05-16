# Admin Overview Editor Components Instructions

Components in this directory render editor-specific UI for the admin overview workflow.

Rules:

- Keep section components focused on one editor area, with mutation passed through explicit callbacks.
- Shared local layout primitives such as `EditorCard` may live here, but generic UI belongs in `shared/ui`.
- Avoid adding persistent borders or explanatory text unless the control cannot be understood from label, placeholder, or tooltip.
- Keep root orchestration in `AdminClientOverviewEditor.jsx` or a feature hook, not inside section components.
