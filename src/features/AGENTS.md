# Features Layer Instructions

Features own user workflows: forms, modals, imports, exports, editors, mutations, and action flows.

Rules:

- A feature should be named after the capability or workflow, not just the page that uses it.
- Keep workflow state, validation hooks, and modal/form components inside the feature.
- Do not put generic UI primitives here; move those to `shared/ui`.
- Do not put one-object display components here when they are reusable entity presentation; move those to `entities/<entity>/ui`.
- Feature components may import entity metadata and shared UI, but must not import pages or widgets.
- Export through an `index.js` so callers depend on the feature API, not its internal folders.
