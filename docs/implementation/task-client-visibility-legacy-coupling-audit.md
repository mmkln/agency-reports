# Task Client Visibility Legacy Coupling Audit

Document type: implementation audit
Product area: task/client visibility refactor
Date: 2026-05-17
Status: Phase 13 discovery complete
Source checklist: `docs/implementation/task-client-visibility-refactor-checklist.md`

## Summary

The refactor has a mature client-facing path now: published `ClientWorkItem` records are the source for active work visible to clients. Legacy task visibility references still exist, but they are not all defects. They fall into four groups:

1. Internal task workspace support.
2. Generic visibility helpers reused by non-task domains.
3. Temporary migration fields that help create or review `ClientWorkItem` records.
4. Client-facing aliases or old docs that should be removed after the parallel client-control-center work settles.

The important boundary remains unchanged: task fields such as `visibility`, `client_visible`, and `client_safe_summary` may help the agency prepare client-safe communication, but they must not be the client-facing access contract.

## Keep For Now

These references are acceptable during the migration and should not be removed blindly.

- `src/domain/policies/visibilityPolicy.js`: still provides generic visibility helpers for updates, reports, dashboards, files, and legacy migration checks.
- `src/domain/services/taskWorkspaceService.js` and `src/domain/services/teamTaskService.js`: still own internal task workflow and may expose linked client work item state.
- `src/entities/task/ui/TaskVisibilityBadge.jsx` and task workspace filters: still useful as internal affordances while the team prepares client-facing work.
- `client_safe_summary`: keep temporarily as the proposed client-facing text that can seed a `ClientWorkItem`; later rename to `proposed_client_summary` if we want the code to state the boundary more clearly.

## Migrate After Parallel IA Settles

These references are the remaining cleanup targets for Phase 13. They should be changed only after the client-control-center branch/workflow stabilizes, because several of these files are currently being edited in parallel.

- `src/domain/services/clientOverviewService.js`: remove fallback filtering from raw tasks and require published `ClientWorkItem` records for active work.
- `src/domain/services/clientOverviewService.js`: remove the legacy `activeTasks` alias once client widgets consume `activeWorkItems`.
- `src/widgets/client-overview/ActiveTasksBlock.jsx`: rename to `ActiveWorkBlock` or equivalent and make the naming match published client work.
- `src/widgets/client-overview/ClientOverviewBlocks.jsx` and `src/pages/client/overview/ClientOverviewPage.jsx`: switch props and labels away from task language.
- `src/domain/services/clientPerformanceDashboardService.js` and `src/widgets/client-performance/SupportingSections.jsx`: decide whether performance context should use published work items or a separate reporting source; do not keep raw task visibility as the client-facing contract.
- `src/features/admin-overview-editor/components/ConnectedWorkflowSummary.jsx`: replace client-visible task counts with client work item or review-queue language.
- `src/features/tasks/create-task/CreateTaskDialog.jsx`: stop presenting "Client visible" as a task creation lifecycle choice unless the user is intentionally creating a client work item.

## Documentation Cleanup

Some older implementation and acceptance docs still describe the previous task-based approach. Treat those sections as historical until they are updated.

- `docs/implementation/UC-001-acceptance-report.md`: still describes admin-created client-visible tasks in the overview editor.
- `docs/implementation/UC-001-implementation-checklist.md`: still references `VisibleTasksManager` and task-based active work.
- `docs/mvp-scope.md` and older use-case language: review for wording that implies raw tasks are client-facing truth.
- `docs/frontend-architecture.md`: already contains the correct mature direction and should remain the architecture source for this boundary.

## Audit Table

| Pattern | Current locations | Classification | Next action | Conflict risk |
| --- | --- | --- | --- | --- |
| `client_visible` / `VISIBILITY.CLIENT_VISIBLE` in task services | `taskWorkspaceService`, `teamTaskService`, task tests, task UI | Internal migration support | Keep until task UI has explicit client work item state everywhere | Medium |
| `client_safe_summary` | Task services, task detail UI, admin review preparation | Proposed client text | Keep now; consider renaming to `proposed_client_summary` later | Medium |
| `activeTasks` in overview read models | `clientOverviewService`, client overview widgets/page | Legacy client-facing alias | Migrate consumers to `activeWorkItems`, then remove alias | High |
| `ActiveTasksBlock` | `src/widgets/client-overview/ActiveTasksBlock.jsx` | Legacy naming | Rename to active-work language after parallel UI settles | High |
| Raw task fallback in overview | `clientOverviewService` | Legacy compatibility | Remove once repositories always expose `clientWorkItems` | Medium |
| Performance active tasks | `clientPerformanceDashboardService`, `SupportingSections` | Unresolved product ownership | Align to published work items or explicit reporting model | Medium |
| Admin overview visible task summary | `ConnectedWorkflowSummary` | Old overview-editor ownership | Replace with review/work-item summary | Medium |
| `visibilityPolicy` task helpers | `visibilityPolicy.js` and tests | Generic plus legacy helper | Keep until all task consumers move off it; then narrow or mark legacy-only | Low |
| `VisibleTasksManager` docs | UC-001 implementation docs | Historical docs | Update docs after code cleanup | Low |

## Proposed Cleanup Order

1. Wait for the client-control-center files to settle enough to avoid overwriting parallel work.
2. Update `clientOverviewService` to require `ClientWorkItem` for client active work and remove raw task fallback.
3. Rename overview UI from task language to work-item language.
4. Align performance dashboard support sections to published work items or document a separate reporting source.
5. Replace admin overview task visibility summaries with review/work-item summaries.
6. Update old UC-001 implementation docs and mark any remaining task visibility helpers as migration-only.
7. Add localStorage migration notes only if persisted task visibility semantics change.

## Guardrail

Do not delete task visibility fields just because they are legacy. Remove them only when all client-facing reads are proven to use published `ClientWorkItem` records and internal task workflows still have a clear way to draft or propose client-safe summaries.
