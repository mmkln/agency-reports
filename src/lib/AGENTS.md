# Library Instructions

Use this directory for small framework-neutral utilities.

Rules:

- Keep utilities generic and dependency-light.
- Do not add domain workflows, UI components, or route-specific helpers here.
- If a helper knows about tasks, clients, reports, dashboards, or permissions, it belongs in `domain`, `entities`, or a feature.
