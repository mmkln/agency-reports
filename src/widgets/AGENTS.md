# Widgets Layer Instructions

Widgets are large page sections assembled from features, entities, and shared UI.

Use widgets for:

- Client overview sections.
- Dashboard embed sections.
- Report archive/preview sections.
- Task or request page sections that are bigger than a single feature.

Rules:

- Widgets may know product context, but should not own mutations or domain policies.
- Keep one widget file focused on one visible section or section family.
- Split large multi-section files into named section components.
- Reuse entity UI for repeated domain object rendering.
- Reuse feature components for actions, modals, imports, exports, and editors.
