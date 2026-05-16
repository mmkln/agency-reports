# Client Overview Widget Instructions

This directory owns client-facing overview sections and their loading/empty/error states.

Rules:

- Keep one visible overview section per file.
- Keep shared section chrome in `_shared.jsx`; do not duplicate card header structure in each block.
- Keep formatting helpers in `formatters.js` unless the formatting belongs to an entity.
- Preserve `ClientOverviewBlocks.jsx` as a compatibility barrel only; do not add implementation back into it.
- Do not put editor-only or admin workflow controls in client-facing overview blocks.
