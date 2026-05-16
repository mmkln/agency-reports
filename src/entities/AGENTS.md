# Entities Layer Instructions

Entities own domain object presentation and metadata.

Use entities for:

- Status metadata, labels, icons, ordering, and tone mapping.
- Reusable display components for one domain object.
- Small selectors/helpers that are tied to one entity concept.

Rules:

- Entity UI may render a task, client, report, dashboard link, invitation, project, or update consistently across screens.
- Do not place workflow forms or modals here; those belong in `features`.
- Do not place page sections here; those belong in `widgets`.
- Keep status and visibility policies centralized so screens do not rebuild allowed values differently.
- Entity code may import `shared`, but must not import `features`, `widgets`, `pages`, or `app`.
