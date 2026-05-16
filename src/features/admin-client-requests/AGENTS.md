# Admin Client Requests Feature Instructions

This feature owns admin workflows for creating, editing, inspecting, and changing client requests.

Rules:

- Keep request lifecycle rules in `domain/services/neededFromClientService` and `entities/needed-from-client`.
- Feature components may render forms and detail dialogs, but should receive persistence handlers from a page or workflow hook.
- Use `entities/needed-from-client` metadata for statuses, priorities, labels, icons, and tones.
- Keep dialog action styling consistent with shared confirmation/dialog rules: no icons in confirm buttons and destructive tone only for destructive actions.
- Move repeated request form state into a feature hook if more request workflows are added.
