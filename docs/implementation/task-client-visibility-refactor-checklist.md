# Task To Client Visibility Refactor Checklist

```text
Document type: Implementation checklist
Product area: Internal tasks, client-facing work, admin review/publish, and client requests
Target direction: Mature separation between internal execution and client-facing truth
Primary research reference: docs/research/agency-task-visibility-and-client-status-research.md
Related IA reference: docs/research/client-control-center-information-architecture.md
Status: Not started
```

## Tracking Rule

Use this checklist as the execution tracker for the mature task/client-visibility refactor.

Mark an item as complete only after the relevant code, tests, and documentation are updated. If an item is intentionally deferred, leave it unchecked and add a short note under that phase.

## Implementation Rule

Before changing task, overview, request, or client-facing work behavior, read:

```text
1. docs/research/agency-task-visibility-and-client-status-research.md
2. docs/research/client-control-center-information-architecture.md
3. docs/use-cases/UC-001-client-overview-status-hub.md
4. docs/use-cases/UC-005-needed-from-client-blockers.md
5. docs/frontend-architecture.md
6. docs/design/README.md
```

## Target Architecture

The mature model is:

```text
Task
= internal agency execution record

ClientWorkItem
= curated client-facing representation of selected work

ClientRequest / NeededFromClient
= explicit client action needed

ClientOverview
= aggregate of published client-facing records

Admin Review
= editorial/control layer between internal work and client view
```

Critical rule:

```text
client_user must not read Task directly as the client-facing work contract.
```

## Phase 0 - Product Contract

**Goal:** Lock the refactor decision before implementation.

**Result:** Docs clearly state that internal task execution and client-facing work are separate domains.

### Tasks

- [x] Confirm `docs/research/agency-task-visibility-and-client-status-research.md` is the product source for this refactor.
- [x] Update `docs/frontend-architecture.md` with the mature ownership model:
  - [x] `Task` = internal execution.
  - [x] `ClientWorkItem` = published client-facing work.
  - [x] `ClientRequest` / `NeededFromClient` = client action needed.
  - [x] `ClientOverview` = aggregate, not task storage.
  - [x] `AdminReview` = review/publish layer.
- [x] Update `docs/use-cases/UC-001-client-overview-status-hub.md` so Active Work references published client-facing work, not raw tasks.
- [x] Update `docs/use-cases/UC-005-needed-from-client-blockers.md` so client actions can link to internal tasks and client work items.
- [x] Update `docs/mvp-scope.md` or add a mature-state note clarifying that task visibility from MVP is being replaced by client-facing work items.
- [x] Document the migration rule:
  - [x] existing `Task.visibility` is legacy/client-facing hint only during migration.
  - [x] `ClientWorkItem.publish_state` becomes the source of truth for client-facing work visibility.

### Completion Criteria

- [x] A developer can explain why `Task` is not the client-facing contract.
- [x] Product docs describe where client-facing active work is owned.
- [x] Product docs describe where client requests/actions are owned.

## Phase 1 - ClientWorkItem Entity

**Goal:** Introduce the curated client-facing work domain.

**Result:** Client-facing work can exist independently from internal tasks.

### Tasks

- [x] Create `src/entities/client-work-item`.
- [x] Add `ClientWorkItem` model exports.
- [ ] Define fields:
  - [x] `id`
  - [x] `client_id`
  - [x] `project_id`
  - [x] `source_task_id`
  - [x] `title`
  - [x] `summary`
  - [x] `status`
  - [x] `target_date`
  - [x] `sort_order`
  - [x] `publish_state`
  - [x] `published_at`
  - [x] `published_by`
  - [x] `last_reviewed_at`
  - [x] `created_at`
  - [x] `updated_at`
- [ ] Define client-facing statuses:
  - [x] `planned`
  - [x] `in_progress`
  - [x] `waiting_client`
  - [x] `needs_attention`
  - [x] `delivered`
- [ ] Define publish states:
  - [x] `draft`
  - [x] `ready_for_review`
  - [x] `published`
  - [x] `archived`
- [x] Add status metadata:
  - [x] label
  - [x] icon
  - [x] tone
  - [x] client-facing label
- [x] Add task-to-client-work status mapping helper.
- [x] Add entity model tests if this repo pattern supports entity tests.

### Completion Criteria

- [x] `ClientWorkItem` can represent work with or without a source task.
- [x] Client-facing statuses do not expose raw internal task status language.
- [x] `publish_state` is explicit and separate from task visibility.

## Phase 2 - Repository And Seed Data

**Goal:** Persist client work items through repository adapters.

**Result:** Client work items are available through the same repository abstraction as the rest of the product.

### Tasks

- [x] Add `clientWorkItems` repository collection.
- [x] Add repository adapter methods:
  - [x] `list`
  - [x] `listByClientId`
  - [x] `findById`
  - [x] `upsert`
  - [ ] `remove` only if existing repository patterns require it.
- [x] Update `src/app/providers/repositories/portalRepository.js`.
- [x] Update `src/app/providers/repositories/createLocalStoragePortalRepository.js`.
- [x] Update localStorage schema/version handling if required.
- [x] Update reset/reseed behavior if required.
- [x] Add seed data examples:
  - [x] internal task with no client work item.
  - [x] internal task linked to draft client work item.
  - [x] internal task linked to ready-for-review client work item.
  - [x] internal task linked to published client work item.
  - [x] standalone published client work item with no source task.
  - [x] archived client work item.
- [x] Add repository tests:
  - [x] client work items are loaded.
  - [x] client work items can be upserted.
  - [x] client work items survive localStorage adapter round trip.
  - [x] reset/reseed includes client work items.

### Completion Criteria

- [x] Repository adapters expose `repositories.clientWorkItems`.
- [x] Seed data allows testing hidden, review, published, and archived states.
- [x] No page or widget reads localStorage directly.

## Phase 3 - Policies

**Goal:** Centralize client work visibility and publishing rules.

**Result:** UI cannot accidentally leak draft or internal work.

### Tasks

- [x] Create `src/domain/policies/clientWorkItemPolicy.js`.
- [x] Add policy rules:
  - [x] client users can see only their own client ID.
  - [x] client users can see only `publish_state = published`.
  - [x] client users cannot see draft, ready-for-review, or archived work items.
  - [x] agency_admin can manage all agency client work items.
  - [x] agency_team can view/update only allowed client work items according to client assignment.
  - [x] agency_team cannot publish by default.
- [x] Add publish transition rules:
  - [x] `draft -> ready_for_review`
  - [x] `draft -> published` only if admin is allowed.
  - [x] `ready_for_review -> published`
  - [x] `published -> archived`
  - [x] `archived -> draft` or reopen only if explicitly supported.
- [x] Decide whether published work can be edited directly or must return to review:
  - [x] document the decision.
  - [x] enforce the decision in policy.
- [ ] Update `visibilityPolicy.js` only where generic helpers are still useful.
- [ ] Update `accessPolicy.js` if agency team/client assignment access is missing.
- [x] Add policy tests:
  - [x] client cannot see another client's work item.
  - [x] client cannot see draft work item.
  - [x] client cannot see ready-for-review work item.
  - [x] client can see published own work item.
  - [x] client cannot see archived work item.
  - [x] team cannot publish by default.
  - [x] admin can publish.

### Completion Criteria

- [x] All client-facing work visibility is policy-backed.
- [x] Publish permissions are tested.
- [x] Legacy task visibility no longer defines client-facing work access.

## Phase 4 - ClientWorkItem Domain Service

**Goal:** Move client-facing work operations into services.

**Result:** Pages and widgets receive safe view models from domain services.

### Tasks

- [x] Create `src/domain/services/clientWorkItemService.js`.
- [x] Add admin operations:
  - [x] `listAdminClientWorkItems`
  - [ ] `getAdminClientWorkItemDetail`
  - [x] `createClientWorkItem`
  - [x] `createClientWorkItemFromTask`
  - [x] `updateClientWorkItem`
  - [x] `markClientWorkItemReadyForReview`
  - [x] `publishClientWorkItem`
  - [x] `archiveClientWorkItem`
- [ ] Add team operations:
  - [x] `suggestClientWorkItemFromTask`
  - [ ] `updateDraftClientWorkItem` if allowed.
  - [x] `markReadyForReview` if allowed.
- [ ] Add client operations:
  - [x] `listPublishedClientWorkItems`
  - [ ] `getPublishedClientWorkItemDetail` if a client detail view exists.
- [x] Add validation:
  - [x] required safe title.
  - [x] required safe summary before publish.
  - [x] valid client ID.
  - [ ] valid related project ID.
  - [ ] valid source task ID if provided.
  - [x] valid target date.
  - [x] valid status.
  - [x] valid publish transition.
- [x] Add read models:
  - [x] admin list item.
  - [ ] admin detail.
  - [ ] review queue item.
  - [x] client active work card.
  - [x] overview active work item.
- [x] Ensure internal task fields do not pass into client read models.
- [x] Add service tests for all operations and read models.

### Completion Criteria

- [x] Client-facing pages can render active work without raw task records.
- [x] Services reject invalid publish and access operations.
- [x] Client read models contain no internal task notes or raw task descriptions unless explicitly copied into safe fields.

## Phase 5 - Admin Review Service

**Goal:** Add the editorial/control layer between internal work and client view.

**Result:** Admin/account manager has a real queue for client-facing truth.

### Tasks

- [x] Create `src/domain/services/adminReviewService.js`.
- [x] Add review queues:
  - [x] ready for review.
  - [x] missing client summary.
  - [x] published but stale.
  - [x] waiting on client without request.
  - [x] blocked work without client-safe explanation.
  - [x] recently published.
  - [x] archived.
- [x] Define stale threshold or make it configurable.
- [x] Add queue view model fields:
  - [x] client.
  - [x] project.
  - [x] source task.
  - [x] current internal status.
  - [x] client-facing status.
  - [x] summary status.
  - [x] publish state.
  - [x] last published.
  - [x] recommended next action.
- [ ] Add actions:
  - [ ] create client work item from task.
  - [ ] edit client-facing title/summary/status/date.
  - [ ] publish.
  - [ ] archive.
  - [ ] create or link client request.
- [x] Add service tests:
  - [x] ready-for-review queue includes correct items.
  - [x] missing-summary queue excludes items with summaries.
  - [x] stale queue includes old published items.
  - [x] waiting-client-without-request queue detects missing client actions.
  - [x] blocked-without-explanation queue detects unsafe missing explanation.

### Completion Criteria

- [x] Admin review is a domain service, not UI-only filtering.
- [x] Queues identify the exact work that needs client-facing editorial action.

## Phase 6 - Task Service Refactor

**Goal:** Make `Task` internal execution only.

**Result:** Task services no longer serve as the client-facing work source of truth.

### Tasks

- [x] Audit task fields currently used for client visibility:
  - [x] `visibility`
  - [x] `client_visible`
  - [x] `client_safe_summary`
  - [x] `client_safe_summary` render paths.
- [ ] Decide migration naming:
  - [x] keep `client_safe_summary` temporarily as proposed text.
  - [ ] or rename in code/read models to `proposed_client_summary`.
- [x] Update `teamTaskService.js`:
  - [x] keep internal task listing.
  - [x] expose linked client work item state if useful.
  - [ ] stop treating task visibility as published client state.
- [ ] Update `taskWorkspaceService.js`:
  - [x] create/update internal tasks.
  - [ ] no direct client publish.
  - [ ] optionally support proposing a client work item.
- [ ] Update task policies:
  - [ ] status transitions remain internal.
  - [ ] waiting-client status does not itself publish anything to client.
- [ ] Update task tests:
  - [ ] task update does not make client work visible.
  - [x] client-safe/proposed summary can be saved without publishing.
  - [ ] only client work item publishing affects client-visible active work.
- [x] Update task seed data to include linked/unlinked work item examples.

### Completion Criteria

- [ ] Internal task changes do not automatically change client-visible active work.
- [x] Team task UI can show whether a client work item exists without making the task itself client-facing.
- [ ] Task visibility is no longer the client-facing access contract.

## Phase 7 - Needed From Client / ClientRequest Integration

**Goal:** Connect waiting-on-client internal work to explicit client action records.

**Result:** Clients act on `NeededFromClient` records, not on internal tasks.

### Tasks

- [x] Extend `needed_from_client` model if needed:
  - [x] `related_task_id`
  - [x] `related_work_item_id`
  - [x] `type`
  - [x] `why_needed`
  - [x] `impact_if_delayed`
  - [x] `client_owner`
  - [x] `agency_owner`
  - [x] `last_reminded_at`
- [x] Add action types:
  - [x] approval.
  - [x] access.
  - [x] asset.
  - [x] feedback.
  - [x] decision.
  - [x] other.
- [ ] Update `neededFromClientService.js`:
  - [x] create request from task.
  - [x] create request from client work item.
  - [x] link existing request to task.
  - [x] link existing request to work item.
  - [x] list open requests for work item.
  - [x] list waiting-client tasks without requests.
- [x] Ensure client response does not mutate internal `Task.status` directly.
- [ ] Add admin/team processing flow:
  - [ ] client responds.
  - [ ] agency reviews/processes response.
  - [ ] agency resolves request.
  - [ ] agency manually updates linked internal task if work can continue.
- [ ] Add tests:
  - [x] waiting-client task can be linked to request.
  - [x] request can be linked to client work item.
  - [x] client sees own pending/answered requests only.
  - [x] client response leaves task status unchanged.
  - [x] resolving request is agency-owned.

### Completion Criteria

- [ ] `waiting_client` is represented to the client through an action/request record.
- [ ] Clients cannot edit internal task status.
- [ ] Client Overview and Action Needed can show linked work/request context.

## Phase 8 - Client Overview Refactor

**Goal:** Make Client Overview aggregate published client-facing records.

**Result:** Overview no longer depends on raw tasks for active work.

### Tasks

- [x] Update `clientOverviewService.js` to read active work from `ClientWorkItem`.
- [x] Ensure overview active work includes only:
  - [x] own client ID.
  - [x] `publish_state = published`.
  - [x] non-archived work.
- [ ] Update overview read model:
  - [ ] current status.
  - [ ] needed-from-client preview.
  - [x] active work from published client work items.
  - [ ] latest update.
  - [ ] dashboard preview.
  - [ ] latest report.
  - [ ] recent activity.
- [ ] Update `ClientOverviewBlocks` or related widgets:
  - [ ] rename task-facing components to active-work language where appropriate.
  - [ ] render `ClientWorkItem` cards.
  - [ ] show linked needed-action indicator.
  - [ ] show target date and last updated.
- [ ] Remove direct task filtering from client overview.
- [ ] Add overview tests:
  - [x] draft client work item hidden.
  - [x] ready-for-review client work item hidden.
  - [x] published client work item visible.
  - [x] archived client work item hidden.
  - [x] raw task without client work item hidden.
  - [ ] internal notes never appear.

### Completion Criteria

- [x] Client Overview active work is sourced from published `ClientWorkItem` records.
- [ ] Client Overview can answer status/progress/action questions without exposing raw task records.

## Phase 9 - Admin Review UI

**Goal:** Give agency_admin/account manager a UI to manage client-facing work.

**Result:** Publishing client-facing work is explicit and reviewable.

### Tasks

- [x] Decide route placement:
  - [ ] `/admin/review`
  - [ ] or `/admin/clients/:id/review`
  - [x] or client-scoped query route consistent with current routing.
- [x] Add route metadata.
- [x] Add client workspace tab if route is client-scoped.
- [x] Create page folder under `src/pages/admin`.
- [x] Build route page as thin composition.
- [x] Build review queue UI:
  - [x] Ready for review.
  - [x] Missing summary.
  - [x] Stale published.
  - [x] Waiting on client without request.
  - [x] Blocked without client-safe explanation.
  - [x] Recently published.
- [x] Build review detail panel/dialog:
  - [x] source task context.
  - [x] internal status context.
  - [x] client-facing title.
  - [x] client-facing summary.
  - [x] client-facing status.
  - [x] target date.
  - [x] linked request.
  - [x] publish state.
- [ ] Add actions:
  - [x] create client work item from task.
  - [x] save draft.
  - [x] mark ready for review.
  - [x] publish.
  - [x] archive.
  - [x] create needed-from-client request.
  - [x] preview as client.
- [x] Use shared `PageHeader`, `PageShell`, controls, and design tokens.
- [x] Add integration coverage:
  - [x] admin publishes client work item.
  - [x] client sees it after publish.
  - [x] client does not see it before publish.
  - [x] client read model excludes source task internals.
- [ ] Add browser/e2e coverage after the parallel client IA routes settle.

### Completion Criteria

- [x] Admin has an explicit client-facing work publishing surface.
- [x] Review UI is connected to domain services, not local component-only state.

## Phase 10 - Team Task UI Integration

**Goal:** Let team members prepare client-facing summaries without publishing directly.

**Result:** Team can contribute to client-facing communication safely.

### Tasks

- [ ] Update task detail panel:
  - [x] show linked client work item state.
  - [x] allow proposed client summary where allowed.
  - [x] allow mark ready for review where allowed.
  - [x] show that admin publishes final client-facing content.
- [ ] Update create task flow:
  - [ ] keep new tasks internal by default.
  - [ ] avoid asking for client-facing lifecycle choices unless creating a client work item intentionally.
- [ ] Add task list indicators:
  - [x] has client work item.
  - [x] ready for review.
  - [x] published.
  - [ ] missing client summary.
  - [ ] waiting on client without request.
- [ ] Update filters:
  - [ ] client work state if useful.
  - [ ] ready for review if available to team.
  - [ ] waiting on client without request if useful.
- [x] Ensure agency_team cannot publish unless explicitly allowed.
- [ ] Add tests:
  - [x] team can draft/propose.
  - [x] team cannot publish by default.
  - [x] admin can publish proposed work.

### Completion Criteria

- [ ] Team task workflow supports client-safe drafting without client exposure.
- [ ] Team task UI makes client-facing state visible but not editable beyond permissions.

## Phase 11 - Client Projects / Active Work Alignment

**Goal:** Align mature client-side Projects/Active Work destination with `ClientWorkItem`.

**Result:** Client projects/work pages use the same published work source as Overview.

### Tasks

- [ ] Coordinate with `docs/implementation/client-control-center-refactor-checklist.md` Phase 5.
- [ ] Build or update client Projects page to use `ClientWorkItem` records.
- [ ] Build project detail active work section from published client work items.
- [ ] Add filters:
  - [ ] Active.
  - [ ] Waiting on me.
  - [ ] Completed.
  - [ ] Archived.
- [ ] Ensure project detail shows linked client requests.
- [ ] Ensure project detail hides raw internal tasks.
- [ ] Add tests for project/work visibility.

### Completion Criteria

- [ ] Client Overview and client Projects use the same client-facing work model.
- [ ] No client project page reads raw internal tasks as its work contract.

## Phase 12 - Activity And Audit

**Goal:** Record publish and client-action lifecycle changes.

**Result:** Admin gets auditability and client gets curated activity.

### Tasks

- [x] Extend activity model or activity service with events:
  - [x] `client_work_item_created`
  - [x] `client_work_item_ready_for_review`
  - [x] `client_work_item_published`
  - [x] `client_work_item_archived`
  - [x] `client_request_created`
  - [x] `client_request_answered`
  - [x] `client_request_resolved`
- [x] Decide which events are client-visible.
- [x] Ensure client activity feed includes only client-visible events.
- [x] Ensure admin activity/audit includes internal publish workflow events.
- [ ] Add tests:
  - [x] publish event created.
  - [x] archive event created.
  - [x] client response event created.
  - [x] internal events hidden from client feed.

### Completion Criteria

- [x] Publish workflow is auditable.
- [x] Client activity remains curated, not a raw internal event log.

## Phase 13 - Legacy Coupling Cleanup

**Goal:** Remove old task/client visibility coupling after the new model is working.

**Result:** There is one mature path for client-facing active work.

**Audit map:** `docs/implementation/task-client-visibility-legacy-coupling-audit.md`

### Tasks

- [x] Search for direct client-facing task usage:
  - [x] `client_visible`
  - [x] `visibility === VISIBILITY.CLIENT_VISIBLE`
  - [x] `client_safe_summary`
  - [x] `ActiveTasksBlock`
  - [x] `VisibleTasksManager`
- [x] Document which legacy references are migration support vs cleanup targets.
- [ ] Remove or migrate client-facing task filters from client services.
- [ ] Rename components where needed:
  - [ ] `ActiveTasksBlock` -> `ActiveWorkBlock` or equivalent.
  - [ ] `VisibleTasksManager` -> review/work-item language.
  - [ ] task cards in client UI -> work item cards.
- [ ] Remove deprecated task visibility assumptions from docs.
  - [x] Mark UC-001 acceptance/implementation docs as historical where they describe task-based client visibility.
- [ ] Keep legacy compatibility only where tests prove it is needed.
- [ ] Add a migration note for localStorage seed/reset behavior.

### Completion Criteria

- [ ] Client UI has no direct dependency on task visibility as client-facing truth.
- [ ] Naming reflects active work/client work items rather than raw tasks.
- [ ] Deprecated paths are removed or explicitly documented as temporary.

## Phase 14 - Verification

**Goal:** Prove the refactor did not break visibility, role, or routing guarantees.

**Result:** Unit, integration, e2e, lint, and build pass.

### Tasks

- [x] Run unit tests.
- [ ] Run e2e tests.
- [x] Run lint.
- [x] Run build.
- [ ] Add or update e2e coverage:
  - [ ] agency_team updates internal task.
  - [ ] agency_team prepares client-facing summary.
  - [ ] agency_admin publishes client work item.
  - [ ] client_user sees published active work.
  - [ ] client_user does not see draft/review/archived work.
  - [ ] client_user never sees internal notes.
  - [ ] waiting-client task links to needed-from-client request.
  - [ ] client response does not mutate task status directly.
- [x] Add domain integration coverage for client-work publish boundary and safe client read models.
- [ ] Update acceptance/implementation docs with final status.
- [ ] Update `docs/implementation/PROJECT-STATUS.md`.

### Completion Criteria

- [x] `npm run lint` passes.
- [x] `npm test -- --run` passes.
- [ ] `npx playwright test` passes.
- [x] `npm run build` passes.
- [ ] Documentation reflects the mature architecture.

## Definition Of Done

This refactor is complete when:

- [ ] `client_user` does not read `Task` directly as client-facing active work.
- [ ] Client Overview active work comes from published `ClientWorkItem` records.
- [ ] Client Projects/Active Work uses published `ClientWorkItem` records.
- [ ] Internal task notes cannot appear in client view models.
- [ ] Agency team can prepare client-facing summaries without publishing by default.
- [ ] Agency admin/account manager controls publish/archive.
- [ ] `waiting_client` internal work is represented to clients through `NeededFromClient` / client requests.
- [ ] Client responses do not directly mutate internal task status.
- [ ] Admin review queues identify stale, missing-summary, waiting-client, blocked, and ready-for-review work.
- [ ] Tests cover role, visibility, publish, and client-request boundaries.
