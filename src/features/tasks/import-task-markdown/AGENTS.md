# Import Task Markdown Feature Instructions

This feature owns task Markdown import parsing, preview, modal UI, and import workflow state.

Rules:

- Keep Markdown parsing and import preview logic in `model`.
- Keep import modal layout in `components`.
- Keep import orchestration hooks here when they are specific to this workflow.
- Do not import pages or widgets from this feature.
