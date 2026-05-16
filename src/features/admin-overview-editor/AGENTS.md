# Admin Overview Editor Feature Instructions

This feature owns the admin workflow for editing, saving, previewing, restoring, and publishing a client overview.

Rules:

- Keep publish, restore, discard, autosave, and draft orchestration inside this feature.
- Keep editor page sections as separate components under `components`; the root editor should compose sections and workflow state.
- Do not mix structural refactors with visual redesign unless the user explicitly asks for both in the same step.
- Do not duplicate status, report, dashboard, or task metadata. Import canonical entity metadata instead.
- Do not import pages or widgets from this feature.
