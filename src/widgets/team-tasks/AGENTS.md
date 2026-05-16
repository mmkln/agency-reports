# Team Tasks Widget Instructions

This directory owns team task page sections.

Rules:

- Keep task list/inbox section rendering here, not inside route pages.
- Widgets may group and arrange tasks for presentation, but must not own persistence or status-transition policy.
- Reuse task entity UI for badges, metadata, status controls, and task presentation helpers.
- Do not put create/edit/import/export workflows here; those belong in `features/tasks`.
