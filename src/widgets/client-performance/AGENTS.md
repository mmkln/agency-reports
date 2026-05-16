# Client Performance Widget Instructions

This widget renders the client-facing performance dashboard from already-resolved page data.

Rules:

- Keep route loading, access checks, and empty states in the page layer.
- Keep this widget presentational: it may compose sections, charts, entity metadata, links, and shared UI, but it should not call repositories or domain services.
- Split dashboard sections into focused files when this widget changes; do not add more local component declarations to `ClientPerformanceDashboard.jsx`.
- Use `entities/performance-dashboard` metadata for channel, service, status, and metric presentation.
- Use shared chart and UI primitives instead of local controls or hardcoded chrome.
