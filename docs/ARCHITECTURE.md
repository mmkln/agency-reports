# Application Architecture

Use these maintained documents instead of a second, conflicting runtime guide:

- [Frontend architecture](frontend-architecture.md): current runtime, layer
  ownership, API boundaries, routing and verification rules.
- [System architecture map](architecture/README.md): frontend/backend/plugin
  boundaries and links to subsystem maps.
- [Domain ownership](domain-ownership-model.md): identity, agencies, clients,
  workspaces and membership semantics.
- [Frontend cleanup](architecture/frontend-cleanup.md): removed legacy source,
  dependency checks and verification limits.

The application is an API-backed React/Vite frontend and a Django modular
monolith with separate background workers. There is no local repository runtime.
Development history routing and production hash routing remain build-selected;
deployment scripts and CI configuration are not changed by the source cleanup.

Older use-case, research and implementation documents describe product direction
or historical work. Consult the current architecture guide before reusing their
source paths, local-storage adapters or routing assumptions.
