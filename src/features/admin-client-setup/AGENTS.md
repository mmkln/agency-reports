# Admin Client Setup Feature Instructions

This feature owns admin client creation, editing, listing helpers, and client setup UI.

Rules:

- Export page-consumed APIs from the feature root `index.js`.
- Pages must not import directly from `components` or `model`; keep those as internal implementation folders.
- Keep create/edit form workflow hooks in `model` until they need a dedicated workflow folder.
- Do not import pages or widgets from this feature.
