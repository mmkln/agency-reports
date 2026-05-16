# Task Entity Instructions

This directory owns task metadata and reusable task presentation.

Rules:

- Keep task status labels, icons, tones, and fallback metadata centralized in `model.js`.
- Keep task-specific badges, meta rows, and status controls in `ui`.
- Keep the root `entities/task` barrel model-only. Export React UI from `entities/task/ui` so domain services do not pull UI dependencies.
- Do not implement status-transition policy in UI components; callers must pass options derived from the domain policy.
- Do not put task page sections, modals, or create/edit workflows here.
