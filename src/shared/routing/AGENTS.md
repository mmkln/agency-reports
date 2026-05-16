# Shared Routing Instructions

This directory owns generic routing helpers.

Rules:

- Keep helpers framework/app-shell aware but domain-light.
- Do not define page-specific UI or workflow behavior here.
- Route metadata ownership belongs in `app/routing`; generic URL helpers can live here.
