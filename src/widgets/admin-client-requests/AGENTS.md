# Admin Client Requests Widget Instructions

This widget owns the admin-facing client requests list and filtering workspace.

Rules:

- Keep data loading, mutations, and toast behavior in the page or owning feature hook.
- Keep this widget presentational: it receives already-loaded requests and callback handlers.
- Use `entities/needed-from-client` metadata for status and priority rendering.
- Use shared controls for filters and row actions; do not add raw visible buttons or inputs.
- Split row, toolbar, and empty-state components if this file grows beyond the component-size threshold.
