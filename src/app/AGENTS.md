# App Layer Instructions

Own application bootstrap only: providers, routing, app shell integration, route metadata, and global runtime wiring.

Rules:

- Do not put page sections, feature forms, entity cards, or reusable product UI here.
- Keep route metadata centralized; do not scatter navigation labels, icons, or access rules through pages.
- App components may compose shared shell components, but should not contain domain workflow UI.
- If code needs business rules, move it to `domain`, `entities`, or the owning `feature`.
