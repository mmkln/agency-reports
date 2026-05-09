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

- [ ] Add client members section to admin client area.
- [ ] Show current members for selected client.
- [ ] Show member name.
- [ ] Show member email.
- [ ] Show member role.
- [ ] Show member status if available.
- [ ] Support membership roles:
  - [ ] `owner`
  - [ ] `viewer`
- [ ] Add manual member creation flow.
- [ ] Validate member email.
- [ ] Prevent duplicate membership for the same `client_id + user_id`.
- [ ] Allow changing membership role.
- [ ] Allow removing membership from a client.
- [ ] Ensure removed member can no longer access that client overview.
- [ ] Keep `client_memberships` as the source of access, not only `profile.client_id`.
- [ ] Add tests for membership access.

**Acceptance check:**

- [ ] Admin can answer: “Who has access to this client portal?”
- [ ] Client user access changes immediately after membership update.

---

## Stage 2 - Invitation Management

**Result:** Invitations become a real local workflow instead of a single generated link.

- [ ] Add invitation list for each client.
- [ ] Show invitation email.
- [ ] Show invitation status:
  - [ ] `pending`
  - [ ] `accepted`
  - [ ] `cancelled`
  - [ ] `expired`
- [ ] Show invitation token/link.
- [ ] Add create invitation form.
- [ ] Generate UUID string id for invitation.
- [ ] Generate local token.
- [ ] Support invitation role selection:
  - [ ] `owner`
  - [ ] `viewer`
- [ ] Add copy invite link action.
- [ ] Add open invite link action.
- [ ] Add cancel/revoke invitation action.
- [ ] Add resend placeholder action.
- [ ] Add local expiration date field.
- [ ] Prevent accepting cancelled invitations.
- [ ] Prevent accepting expired invitations.
- [ ] Prevent accepting already accepted invitations.
- [ ] Add tests for invitation states.

**Acceptance check:**

- [ ] Admin can create, view, copy, revoke, and track local invitations.
- [ ] Client can only accept active pending invitations.

---

## Stage 3 - Stronger Simulated Auth

**Result:** Auth still remains simulated, but behaves closer to real product flows.

- [ ] Keep auth logic inside domain services.
- [ ] Keep UI away from direct `localStorage` access.
- [ ] Add password mock validation rule.
- [ ] Add invalid password state.
- [ ] Add unknown email state.
- [ ] Add session expiry field in local session.
- [ ] Add expired session redirect to login.
- [ ] Add current user display in account dropdown.
- [ ] Add account role display.
- [ ] Add logout confirmation only if unsaved editor changes exist.
- [ ] Add access denied route for invalid role/client access.
- [ ] Add tests for session expiry.
- [ ] Add tests for unknown user login.

**Acceptance check:**

- [ ] Simulated login/logout/session behavior is predictable enough for product QA.
- [ ] Auth can later be replaced by backend auth without rewriting page components.

---

## Stage 4 - Admin CRUD Refinement

**Result:** Admin can manage UC-001 records clearly, not only through broad upsert forms.

### Projects / Progress

- [ ] Add clearer project list controls.
- [ ] Add create project action.
- [ ] Add edit project action.
- [ ] Add delete project action.
- [ ] Add progress validation from `0` to `100`.
- [ ] Add project status field if needed.
- [ ] Preserve project ordering.

### Tasks

- [ ] Add create task action.
- [ ] Add edit task action.
- [ ] Add delete task action.
- [ ] Add client visibility toggle.
- [ ] Add internal/client-visible visual distinction.
- [ ] Add due date validation.
- [ ] Add assignee field validation.
- [ ] Add task status selector.

### Updates

- [ ] Add create update action.
- [ ] Add edit latest update action.
- [ ] Add delete update action.
- [ ] Add visibility selector.
- [ ] Prevent empty client-visible updates.

### Dashboard Link

- [ ] Add dashboard link create/edit controls.
- [ ] Add dashboard status selector.
- [ ] Add dashboard provider selector.
- [ ] Add `show_on_overview` toggle.
- [ ] Add unavailable fallback message editor.
- [ ] Add URL validation for public/embed URL.

### Latest Monthly Summary

- [ ] Add report selector.
- [ ] Add local report create placeholder.
- [ ] Allow selecting only `published` or `archived` reports for client preview.
- [ ] Prevent `draft` and `ready` reports from appearing in overview.

**Acceptance check:**

- [ ] Admin can create, edit, and remove UC-001 overview records without seed-data edits.
- [ ] Client preview reflects only client-safe records.

---

## Stage 5 - Needed From Client Lifecycle

**Result:** `Needed From Client` becomes a complete local workflow.

- [ ] Client can respond to a pending action.
- [ ] Client response stores:
  - [ ] `client_response`
  - [ ] `responded_at`
  - [ ] `responded_by`
- [ ] Action status changes from `pending` to `answered`.
- [ ] Admin can see answered actions.
- [ ] Admin can mark answered action as `resolved`.
- [ ] Admin can mark action as `cancelled`.
- [ ] Cancelled actions do not render on client overview.
- [ ] Resolved actions can remain visible with resolved state or move to history.
- [ ] Add response history/timeline locally.
- [ ] Add related link display for client.
- [ ] Add due date overdue state.
- [ ] Add tests for each status transition.

**Acceptance check:**

- [ ] Client can complete a request.
- [ ] Admin can process the answer.
- [ ] Client overview no longer treats answered/resolved items as active blockers.

---

## Stage 6 - Draft / Publish Simulation

**Result:** Local editor distinguishes draft changes from published client-facing state.

- [ ] Introduce local published snapshot for overview.
- [ ] Save Draft writes draft data only.
- [ ] Publish copies draft data into published snapshot.
- [ ] Client overview reads published snapshot, not unsaved draft.
- [ ] Preview can show:
  - [ ] current draft preview
  - [ ] current published client view
- [ ] Add “discard draft changes” action.
- [ ] Add “restore from published” action.
- [ ] Add unsaved changes warning before leaving editor.
- [ ] Add simple local publish metadata:
  - [ ] `published_at`
  - [ ] `published_by`
- [ ] Add tests for draft vs published visibility.

**Acceptance check:**

- [ ] Admin can safely edit without immediately changing what the client sees.
- [ ] Published client view is stable until explicit publish.

---

## Stage 7 - Local Activity Tracking

**Result:** Admin can see basic client activity inside the local simulated environment.

- [ ] Add `activity_events` local table.
- [ ] Record `overview_opened`.
- [ ] Record `dashboard_opened`.
- [ ] Record `report_opened`.
- [ ] Record `needed_action_answered`.
- [ ] Store:
  - [ ] event id
  - [ ] client id
  - [ ] user id
  - [ ] event type
  - [ ] created at
  - [ ] metadata
- [ ] Add admin “Recent Client Activity” block.
- [ ] Filter events by client.
- [ ] Hide activity events from client user unless explicitly needed later.
- [ ] Add tests for activity event creation.

**Acceptance check:**

- [ ] Admin can tell whether a client has opened the overview/dashboard/report in local QA.

---

## Stage 8 - Async-Ready Repository Simulation

**Result:** The frontend behaves like it talks to an API, even though persistence is still local.

- [ ] Add async repository facade.
- [ ] Keep domain services storage-agnostic.
- [ ] Add loading states for admin clients.
- [ ] Add loading states for overview editor.
- [ ] Add loading states for client overview.
- [ ] Add error states for failed repository calls.
- [ ] Add optional fake latency toggle for QA.
- [ ] Add optional fake failure toggle for QA.
- [ ] Avoid direct synchronous assumptions in page components.
- [ ] Document migration path to Supabase/API adapter.

**Acceptance check:**

- [ ] Replacing local storage with API calls requires adapter/service changes, not page rewrites.

---

## Stage 9 - E2E / Browser Flow Tests

**Result:** Core UC-001 flows are tested as user workflows, not only unit tests.

- [ ] Add e2e test for admin login.
- [ ] Add e2e test for client creation.
- [ ] Add e2e test for invite creation.
- [ ] Add e2e test for invite acceptance.
- [ ] Add e2e test for client overview access.
- [ ] Add e2e test for denied cross-client access.
- [ ] Add e2e test for admin overview editor save.
- [ ] Add e2e test for admin publish.
- [ ] Add e2e test for client response to needed action.
- [ ] Add e2e test for admin resolving needed action.
- [ ] Add e2e test proving internal task is hidden from client.
- [ ] Add e2e test proving internal note is hidden from client.

**Acceptance check:**

- [ ] UC-001 can be regression-tested through realistic browser flows.

---

## Stage 10 - UX Hardening

**Result:** Existing functionality is easier to use and harder to break.

- [ ] Add empty states for member lists.
- [ ] Add empty states for invitation lists.
- [ ] Add validation messages beside fields.
- [ ] Add destructive action confirmation.
- [ ] Add success/error toasts or inline messages.
- [ ] Add consistent button naming.
- [ ] Add consistent status badge colors.
- [ ] Add clear distinction between admin-only and client-visible data.
- [ ] Add mobile responsive pass for:
  - [ ] login
  - [ ] accept invite
  - [ ] admin clients
  - [ ] overview editor
  - [ ] client overview
- [ ] Add keyboard-friendly form behavior.

**Acceptance check:**

- [ ] UC-001 can be used end-to-end without developer explanation.

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

