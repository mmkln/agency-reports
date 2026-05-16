# Low-Level Component Instructions

This directory contains low-level UI primitives, mostly Radix/shadcn-style building blocks.

Rules:

- Treat these as primitives, not product components.
- Keep behavior generic: no client, task, report, dashboard, or admin workflow knowledge.
- Prefer updating primitive defaults here when many pages need the same correction.
- Pages and features should normally import from `src/shared/ui`; direct primitive imports are acceptable only when no product wrapper exists.
- Preserve primitive capabilities such as `asChild`, controlled state, accessibility props, and variant APIs.
