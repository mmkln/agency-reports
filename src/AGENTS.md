# Source Architecture Instructions

Use this directory as a layered frontend architecture, not as a dumping ground.

Layer order:

```txt
app -> pages -> widgets -> features -> entities -> shared
```

Allowed imports go downward only:

- `pages` may import `widgets`, `features`, `entities`, and `shared`.
- `widgets` may import `features`, `entities`, and `shared`.
- `features` may import `entities` and `shared`.
- `entities` may import `shared`.
- `shared` must not import from `entities`, `features`, `widgets`, `pages`, or `app`.

Rules:

- Put reusable product components in the lowest layer that still understands their domain.
- Do not move domain-specific UI into `shared` just because it appears twice.
- Keep route files thin. Pages compose, they do not own reusable UI systems.
- Prefer extraction before duplication when a page-local component becomes useful across screens.
- Do not add new cross-layer imports to solve local convenience.
