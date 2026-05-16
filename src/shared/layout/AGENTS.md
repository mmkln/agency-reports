# Shared Layout Instructions

This directory owns app shell and layout infrastructure.

Rules:

- Keep navigation, sidebars, shell regions, and app-level layout geometry here.
- Do not add page-specific workflow actions or domain forms to layout components.
- Preserve stable sidebar geometry for collapsed and expanded states.
- Navigation items should be destinations, not commands.
- Page and workspace actions belong in headers, toolbars, popovers, dialogs, or features.
