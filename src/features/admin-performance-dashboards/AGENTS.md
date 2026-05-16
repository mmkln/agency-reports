# Admin Performance Dashboards Feature Instructions

This feature owns admin performance dashboard periods, editors, imports, tables, and related workflow UI.

Rules:

- Export page-consumed APIs from the feature root `index.js`.
- Pages must not import concrete files from `components`; use the feature root API.
- Keep editor-heavy screens split into root shell, workflow hook/model, section composition, and section files.
- Do not import pages or widgets from this feature.
