# UC-001 Frontend Gap Closure Checklist

## Purpose

This document tracks everything that can still be completed for **UC-001 - Client Overview / Status Hub** on the frontend while the project uses a simulated backend through `localStorage`.

The goal is to close product/workflow gaps before connecting a real backend.

## Scope

In scope:

- simulated auth improvements
- client membership management
- invitation lifecycle
- admin CRUD refinement
- needed-from-client workflow
- local draft/publish behavior
- local activity tracking
- async-ready repository behavior
- browser/e2e flow tests

Out of scope until backend:

- real password auth
- secure sessions/tokens
- email delivery
- server-side RLS
- production audit log
- multi-device persistence

---

## Stage 1 - Admin Access And Membership Management

**Result:** `agency_admin` can see and manage who has access to a client workspace.

- [x] Add client members section to admin client area.
- [x] Show current members for selected client.
- [x] Show member name.
- [x] Show member email.
- [x] Show member role.
- [ ] Show member status if available.
- [ ] Support membership roles:
  - [x] `owner`
  - [x] `viewer`
- [x] Add manual member creation flow.
- [x] Validate member email.
- [x] Prevent duplicate membership for the same `client_id + user_id`.
- [x] Allow changing membership role.
- [x] Allow removing membership from a client.
- [x] Ensure removed member can no longer access that client overview.
- [x] Keep `client_memberships` as the source of access, not only `profile.client_id`.
- [x] Add tests for membership access.

**Acceptance check:**

- [x] Admin can answer: “Who has access to this client portal?”
- [x] Client user access changes immediately after membership update.

---

## Stage 2 - Invitation Management

**Result:** Invitations become a real local workflow instead of a single generated link.

- [x] Add invitation list for each client.
- [x] Show invitation email.
- [x] Show invitation status:
  - [x] `pending`
  - [x] `accepted`
  - [x] `cancelled`
  - [x] `expired`
- [x] Show invitation token/link.
- [x] Add create invitation form.
- [x] Generate UUID string id for invitation.
- [x] Generate local token.
- [x] Support invitation role selection:
  - [x] `owner`
  - [x] `viewer`
- [x] Add copy invite link action.
- [x] Add open invite link action.
- [x] Add cancel/revoke invitation action.
- [x] Add resend placeholder action.
- [x] Add local expiration date field.
- [x] Prevent accepting cancelled invitations.
- [x] Prevent accepting expired invitations.
- [x] Prevent accepting already accepted invitations.
- [x] Add tests for invitation states.

**Acceptance check:**

- [x] Admin can create, view, copy, revoke, and track local invitations.
- [x] Client can only accept active pending invitations.

---

## Stage 3 - Stronger Simulated Auth

**Result:** Auth still remains simulated, but behaves closer to real product flows.

- [x] Keep auth logic inside domain services.
- [x] Keep UI away from direct `localStorage` access.
- [x] Add password mock validation rule.
- [x] Add invalid password state.
- [x] Add unknown email state.
- [x] Add session expiry field in local session.
- [x] Add expired session redirect to login.
- [x] Add current user display in account dropdown.
- [x] Add account role display.
- [x] Add logout confirmation only if unsaved editor changes exist.
- [x] Add access denied route for invalid role/client access.
- [x] Add tests for session expiry.
- [x] Add tests for unknown user login.

**Acceptance check:**

- [x] Simulated login/logout/session behavior is predictable enough for product QA.
- [x] Auth can later be replaced by backend auth without rewriting page components.

---

## Stage 4 - Admin CRUD Refinement

**Result:** Admin can manage UC-001 records clearly, not only through broad upsert forms.

### Projects / Progress

- [x] Add clearer project list controls.
- [x] Add create project action.
- [x] Add edit project action.
- [x] Add delete project action.
- [x] Add progress validation from `0` to `100`.
- [x] Add project status field if needed.
- [x] Preserve project ordering.

### Tasks

- [x] Add create task action.
- [x] Add edit task action.
- [x] Add delete task action.
- [x] Add client visibility toggle.
- [x] Add internal/client-visible visual distinction.
- [x] Add due date validation.
- [x] Add assignee field validation.
- [x] Add task status selector.

### Updates

- [x] Add create update action.
- [x] Add edit latest update action.
- [x] Add delete update action.
- [x] Add visibility selector.
- [x] Prevent empty client-visible updates.

### Dashboard Link

- [x] Add dashboard link create/edit controls.
- [x] Add dashboard status selector.
- [x] Add dashboard provider selector.
- [x] Add `show_on_overview` toggle.
- [x] Add unavailable fallback message editor.
- [x] Add URL validation for public/embed URL.

### Latest Monthly Summary

- [x] Add report selector.
- [x] Add local report create placeholder.
- [x] Allow selecting only `published` or `archived` reports for client preview.
- [x] Prevent `draft` and `ready` reports from appearing in overview.

**Acceptance check:**

- [x] Admin can create, edit, and remove UC-001 overview records without seed-data edits.
- [x] Client preview reflects only client-safe records.

---

## Stage 5 - Needed From Client Lifecycle

**Result:** `Needed From Client` becomes a complete local workflow.

- [x] Client can respond to a pending action.
- [x] Client response stores:
  - [x] `client_response`
  - [x] `responded_at`
  - [x] `responded_by`
- [x] Action status changes from `pending` to `answered`.
- [x] Admin can see answered actions.
- [x] Admin can mark answered action as `resolved`.
- [x] Admin can mark action as `cancelled`.
- [x] Cancelled actions do not render on client overview.
- [x] Resolved actions can remain visible with resolved state or move to history.
- [x] Add response history/timeline locally.
- [x] Add related link display for client.
- [x] Add due date overdue state.
- [x] Add tests for each status transition.

**Acceptance check:**

- [x] Client can complete a request.
- [x] Admin can process the answer.
- [x] Client overview no longer treats answered/resolved items as active blockers.

---

## Stage 6 - Draft / Publish Simulation

**Result:** Local editor distinguishes draft changes from published client-facing state.

- [x] Introduce local published snapshot for overview.
- [x] Save Draft writes draft data only.
- [x] Publish copies draft data into published snapshot.
- [x] Client overview reads published snapshot, not unsaved draft.
- [x] Preview can show:
  - [x] current draft preview
  - [x] current published client view
- [x] Add "discard draft changes" action.
- [x] Add "restore from published" action.
- [x] Add unsaved changes warning before leaving editor.
- [x] Add simple local publish metadata:
  - [x] `published_at`
  - [x] `published_by`
- [x] Add tests for draft vs published visibility.

**Acceptance check:**

- [x] Admin can safely edit without immediately changing what the client sees.
- [x] Published client view is stable until explicit publish.

---

## Stage 7 - Local Activity Tracking

**Result:** Admin can see basic client activity inside the local simulated environment.

- [x] Add `activity_events` local table.
- [x] Record `overview_opened`.
- [x] Record `dashboard_opened`.
- [x] Record `report_opened`.
- [x] Record `needed_action_answered`.
- [x] Store:
  - [x] event id
  - [x] client id
  - [x] user id
  - [x] event type
  - [x] created at
  - [x] metadata
- [x] Add admin "Recent Client Activity" block.
- [x] Filter events by client.
- [x] Hide activity events from client user unless explicitly needed later.
- [x] Add tests for activity event creation.

**Acceptance check:**

- [x] Admin can tell whether a client has opened the overview/dashboard/report in local QA.

---

## Stage 8 - Async-Ready Repository Simulation

**Result:** The frontend behaves like it talks to an API, even though persistence is still local.

- [x] Add async repository facade.
- [x] Keep domain services storage-agnostic.
- [x] Add loading states for admin clients.
- [x] Add loading states for overview editor.
- [x] Add loading states for client overview.
- [x] Add error states for failed repository calls.
- [x] Add optional fake latency toggle for QA.
- [x] Add optional fake failure toggle for QA.
- [x] Avoid direct synchronous assumptions in page components.
- [x] Document migration path to Supabase/API adapter.

**Acceptance check:**

- [x] Replacing local storage with API calls requires adapter/service changes, not page rewrites.

---

## Stage 9 - E2E / Browser Flow Tests

**Result:** Core UC-001 flows are tested as user workflows, not only unit tests.

- [x] Add e2e test for admin login.
- [x] Add e2e test for client creation.
- [x] Add e2e test for invite creation.
- [x] Add e2e test for invite acceptance.
- [x] Add e2e test for client overview access.
- [x] Add e2e test for denied cross-client access.
- [x] Add e2e test for admin overview editor save.
- [x] Add e2e test for admin publish.
- [x] Add e2e test for client response to needed action.
- [x] Add e2e test for admin resolving needed action.
- [x] Add e2e test proving internal task is hidden from client.
- [x] Add e2e test proving internal note is hidden from client.

**Acceptance check:**

- [x] UC-001 can be regression-tested through realistic browser flows.

---

## Stage 10 - UX Hardening

**Result:** Existing functionality is easier to use and harder to break.

- [x] Add empty states for member lists.
- [x] Add empty states for invitation lists.
- [x] Add validation messages beside fields.
- [x] Add destructive action confirmation.
- [x] Add success/error toasts or inline messages.
- [x] Add consistent button naming.
- [x] Add consistent status badge colors.
- [x] Add clear distinction between admin-only and client-visible data.
- [x] Add mobile responsive pass for:
  - [x] login
  - [x] accept invite
  - [x] admin clients
  - [x] overview editor
  - [x] client overview
- [x] Add keyboard-friendly form behavior.

**Acceptance check:**

- [x] UC-001 can be used end-to-end without developer explanation.

---

## Stage 11 - Documentation And Handoff

**Result:** The project clearly states what is complete locally and what still needs backend work.

- [ ] Update UC-001 implementation checklist after each completed stage.
- [ ] Add “frontend complete / backend pending” report.
- [ ] Document local tables used by UC-001.
- [ ] Document local fake backend limitations.
- [ ] Document required backend tables.
- [ ] Document required backend policies/RLS.
- [ ] Document required API/Supabase adapter methods.
- [ ] Document manual QA flow.
- [ ] Document demo users.
- [ ] Document reset/reseed local storage behavior.

**Acceptance check:**

- [ ] A backend developer can start API/Supabase implementation without reverse-engineering the frontend.

---

## Backend-Only Items

These must remain unchecked until a real backend exists:

- [ ] Real password authentication.
- [ ] Secure session/token refresh.
- [ ] Server-side authorization.
- [ ] Supabase RLS or equivalent.
- [ ] Email invitation delivery.
- [ ] Password reset emails.
- [ ] Multi-device persistence.
- [ ] Server audit log.
- [ ] Production monitoring/logging.
