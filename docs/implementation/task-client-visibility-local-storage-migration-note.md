# Task Client Visibility Local Storage Migration Note

Document type: implementation note
Product area: task/client visibility refactor
Date: 2026-05-17
Status: active guidance

## Summary

The mature client-facing active work path is:

```text
Task -> ClientWorkItem draft/review -> published ClientWorkItem -> client overview/projects
```

LocalStorage seed/reset data may still include task `visibility` and `client_visible` fields for internal task filters, legacy tests, and migration examples. Those fields are no longer the client-facing publish contract.

## Migration Rule

When localStorage data is reset or reseeded:

1. Preserve task records as internal execution records.
2. Preserve task `visibility` and `client_visible` only as legacy/internal metadata until task imports and filters no longer need them.
3. Seed `clientWorkItems` for every client-facing active-work example that should appear to the client.
4. Use `clientWorkItems.publish_state = published` as the only source for client-visible active work.
5. Do not recreate client overview active work from task visibility during reset, repair, or schema migration.

## Compatibility

Old localStorage payloads may contain client-visible tasks without matching `ClientWorkItem` records. Mature client routes should not surface those tasks directly. A future data migration may optionally create draft or ready-for-review `ClientWorkItem` records from those legacy tasks, but that migration should keep publishing as an explicit admin-owned action unless the product intentionally supports automatic backfill publishing.

## Verification Targets

After localStorage seed/reset changes, verify:

- raw tasks without `ClientWorkItem` records do not appear in client active work.
- draft, ready-for-review, and archived `ClientWorkItem` records do not appear in client active work.
- published, non-delivered `ClientWorkItem` records do appear in client active work.
- internal task notes and raw task descriptions do not appear in client read models.
