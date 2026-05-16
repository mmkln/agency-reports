# Shared Theme Instructions

This directory owns theme runtime helpers and semantic visual mappings.

Rules:

- Keep token values in `src/index.css`; use this directory for JS accessors and semantic maps.
- Do not hard-code palette values in components when a semantic token exists.
- Do not toggle theme classes or storage from feature components; use the shared theme provider/hooks.
- Status tone helpers here must stay generic. Entity-specific status policy belongs in `entities`.
