# Task Entity UI Instructions

This directory owns reusable visual presentation for task objects.

Rules:

- Components here may render task status, visibility, metadata, and compact task properties.
- Do not calculate allowed status transitions here; callers must pass options from the domain task policy.
- Do not add task creation, editing, modal, list-section, or page workflow logic here.
- Use task metadata from `../model.js` and shared UI primitives only.
