# UC-005 - Needed From Client / Blockers

## Document Status

```text
Document type: Use Case Specification
Product: Agency Client Portal Aggregator
Use case ID: UC-005
Use case name: Needed From Client / Blockers
Version: v1.0
Status: MVP-planning-ready
Primary reference: Agency Client Portal Aggregator - MVP Scope & Development Reference
Related use cases: UC-001, UC-004
```

Source basis:

```text
- docs/project-brief.md
- docs/mvp-scope.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- docs/use-cases/UC-004-client-performance-dashboard.md
```

Client Control Center IA relationship:

```text
UC-005 maps to Action Needed.
Overview and Reports & Dashboards may preview blockers, but client obligations and responses are owned by Action Needed.
Reference: docs/research/client-control-center-information-architecture.md
```

## 1. Purpose

UC-005 defines the workflow for client actions, agency blockers, and client responses.

The portal already shows "Needed From Client" in UC-001 and UC-004. UC-005 turns that concept into a dedicated workflow so the agency can clearly track:

```text
1. what is needed from the client
2. why it matters
3. when it is due
4. what workflow it affects
5. whether the client has responded
6. whether the agency has processed the response
7. whether the request is resolved, cancelled, or still pending
```

This use case exists because client blockers are one of the main reasons agency work stalls, but those blockers are often hidden in chat, email, or calls.

## 2. Product Context

The Agency Client Portal Aggregator is a client-facing aggregation and communication layer.

UC-005 must not become a full chat system, ticketing system, approval workflow, or file manager.

It is a lightweight request and blocker workflow connected to the client status hub.

The portal is responsible for:

```text
- showing client-visible requested actions
- linking requested actions to internal tasks or client-facing work items when useful
- collecting simple client responses
- showing status and due dates
- keeping internal notes private
- helping agency_admin and agency_team process responses
- making blockers visible in the client overview
```

External tools may still handle:

```text
- file delivery
- email notifications
- contract approvals
- ad platform permissions
- CRM access
- document signatures
```

## 3. Use Case Name

```text
Needed From Client / Blockers
```

## 4. One-Sentence Definition

```text
Needed From Client / Blockers lets the agency request specific client actions, receive client responses, and resolve or cancel blockers without exposing internal agency notes.
```

## 5. Core Product Principle

```text
The client should always know what the agency needs from them, and the agency should always know whether the client has answered.
```

UC-005 should make responsibility visible without turning the portal into chat.

## 6. User Roles

Use the MVP roles:

```text
agency_admin
agency_team
client_user
```

## 7. Role Responsibilities

## 7.1 agency_admin

The agency_admin controls client-facing requests.

Can:

```text
- create a needed-from-client request
- edit request title, description, due date, and related link
- set priority
- assign owner / responsible agency member
- mark request as pending, answered, resolved, or cancelled
- add internal notes
- review client responses
- process responses
- cancel stale or no-longer-needed requests
- preview the client-facing view
```

Must not expose:

```text
- internal notes
- internal blocker details
- private agency reasoning
```

## 7.2 agency_team

The agency_team can contribute operational updates.

Can:

```text
- create or suggest a needed request if allowed by permissions
- update request status when work is blocked
- add internal notes
- review client responses
- mark a response as processed if allowed
```

Default MVP assumption:

```text
agency_team can update assigned/request-related records, but agency_admin controls final client-facing state.
```

## 7.3 client_user

The client_user consumes and responds to requests.

Can:

```text
- view pending and answered requests for their own client
- open related links
- submit a response
- mark that they have provided information
- see whether the agency has resolved the request
```

Cannot:

```text
- see internal notes
- see requests for another client
- edit agency-owned request metadata
- change request status directly to resolved or cancelled
- see cancelled requests by default
```

## 8. Required Client Questions

UC-005 must answer:

```text
What do you need from me?
Why do you need it?
When is it due?
What happens if I do not respond?
Where do I provide the answer or asset?
Have you received my response?
Is this blocker resolved?
```

## 9. Core Object

```text
needed_from_client
```

The object exists in UC-001 already. UC-005 formalizes its lifecycle and workflow.

## 10. Required Data Fields

```text
id
client_id
related_task_id
related_work_item_id
type
title
description
why_needed
impact_if_delayed
status
priority
due_date
related_link
agency_owner
client_owner
owner_name
last_reminded_at
client_response
client_responded_at
client_responded_by
resolved_at
resolved_by
cancelled_at
cancelled_by
internal_notes
created_at
updated_at
```

MVP-compatible existing fields:

```text
id
client_id
title
description
status
due_date
related_link
created_at
updated_at
```

New frontend/localStorage fields can be added incrementally without changing the workflow ownership.

`related_task_id` references internal agency execution. `related_work_item_id` references a published or draft client-facing work item. Client users interact with the request record, not the internal task.

## 11. Statuses

```text
pending
answered
resolved
cancelled
```

| Status | Meaning | Client-visible by default? |
| --- | --- | --- |
| pending | Waiting for client action. | Yes |
| answered | Client responded; agency needs to process. | Yes |
| resolved | Request is complete. | Yes, in history/detail contexts |
| cancelled | Request is no longer needed. | No |

## 12. Status Transition Rules

Allowed transitions:

```text
pending -> answered
pending -> resolved
pending -> cancelled
answered -> resolved
answered -> pending
answered -> cancelled
resolved -> pending
cancelled -> pending
```

Rules:

```text
- client_user can move pending -> answered only by submitting a response
- agency_admin can move any active request to resolved or cancelled
- agency_team may resolve/process only if allowed by permissions
- client responses do not directly mutate linked internal task status
- cancelled requests are hidden from client-facing summary blocks
- internal notes never change client-visible status copy
```

## 13. Visibility Rules

## 13.1 Client Isolation

```text
client_user can only see needed_from_client records where needed_from_client.client_id belongs to their active membership.
```

## 13.2 Cancelled Requests

```text
cancelled requests do not appear in client overview or performance dashboard summary blocks.
```

They may appear in admin history.

## 13.3 Internal Notes

```text
internal_notes are admin/team-only.
```

## 13.4 Client Response

```text
client_response is visible to agency_admin, agency_team, and the responding client_user context.
```

## 14. Core Flow A - agency_admin Creates Request

Trigger:

```text
The agency needs a client action, approval, asset, access, answer, or decision.
```

Flow:

```text
1. agency_admin opens the client workspace.
2. agency_admin opens Requests / Needed From Client.
3. agency_admin clicks New Request.
4. agency_admin enters title.
5. agency_admin enters client-facing description.
6. agency_admin optionally adds due date.
7. agency_admin optionally adds related link.
8. agency_admin optionally sets priority.
9. agency_admin optionally adds internal note.
10. agency_admin saves request.
11. Request status is pending.
12. Request appears on client overview and request page.
```

Success state:

```text
The client can clearly see what the agency needs and by when.
```

## 15. Core Flow B - client_user Responds

Trigger:

```text
The client sees a pending request and wants to answer it.
```

Flow:

```text
1. client_user opens client overview or requests page.
2. client_user selects a pending request.
3. client_user reads the request details.
4. client_user opens the related link if needed.
5. client_user enters a response.
6. client_user submits response.
7. Request status changes from pending to answered.
8. client_response and client_responded_at are saved.
9. Linked internal tasks remain unchanged until the agency processes the response.
10. Agency can process the response and update internal work deliberately.
```

Success state:

```text
The agency can see the client answered, and the client can see the response was received.
```

## 16. Core Flow C - agency_admin Processes Response

Trigger:

```text
The client has answered a request.
```

Flow:

```text
1. agency_admin opens Requests.
2. agency_admin filters by answered.
3. agency_admin reviews the response.
4. agency_admin updates internal notes if needed.
5. agency_admin marks request as resolved.
6. Resolved request can appear in history but no longer blocks current work.
```

Success state:

```text
The blocker is removed from active client-facing surfaces.
```

## 17. Core Flow D - agency_admin Cancels Request

Trigger:

```text
The request is no longer needed.
```

Flow:

```text
1. agency_admin opens request detail.
2. agency_admin chooses Cancel Request.
3. agency_admin optionally adds internal reason.
4. Request status changes to cancelled.
5. Request is hidden from client-facing active blocks.
```

Success state:

```text
The client does not see stale/no-longer-needed work.
```

## 18. Required Screens

## 18.1 Admin: Client Requests Page

Route:

```text
/admin/client-requests?clientId=...
```

Purpose:

```text
Manage needed-from-client records for one client workspace.
```

Required components:

```text
AdminClientWorkspaceHeader
RequestStatusFilters
RequestsList
RequestDetailModal
RequestCreateEditModal
InternalNotesPanel
ClientResponsePanel
```

## 18.2 Client: Requests Page

Route:

```text
/client/requests
```

Purpose:

```text
Let the client see and respond to pending/answered/resolved requests.
```

Required components:

```text
ClientRequestsHeader
ClientRequestsList
ClientRequestDetail
ClientResponseForm
EmptyRequestsState
```

## 18.3 Client Overview Block

Route:

```text
/client/overview
```

Behavior:

```text
Show only active needed-from-client requests.
Do not show cancelled requests.
Do not turn the overview into the full request manager.
Link to /client/requests for detail.
```

## 18.4 Client Performance Dashboard Block

Route:

```text
/client/performance
```

Behavior:

```text
Show current active client actions as context for analytics blockers.
Do not duplicate request lifecycle management inside the analytics dashboard.
```

## 19. Empty And Fallback States

## 19.1 No Active Requests

Client sees:

```text
No actions needed from you right now.
```

## 19.2 Request Already Resolved

Client sees:

```text
This request has been resolved.
```

## 19.3 Request Cancelled

Admin sees:

```text
This request was cancelled.
```

Client summary blocks do not show it.

## 19.4 Unauthorized Client Access

Client sees:

```text
Access denied.
```

Do not leak the existence of other clients or requests.

## 20. Acceptance Criteria

UC-005 is complete when:

```text
1. agency_admin can create a needed-from-client request.
2. agency_admin can edit request title, description, due date, related link, priority, and owner.
3. agency_admin can add internal notes that client_user cannot see.
4. request IDs are string UUIDs.
5. client_user can only see requests for their own client.
6. client_user cannot see cancelled requests in active summary blocks.
7. client_user can submit a response to a pending request.
8. submitting a response changes request status to answered.
9. agency_admin can review answered requests.
10. agency_admin can mark answered requests resolved.
11. agency_admin can cancel requests.
12. resolved requests no longer appear as active blockers.
13. Client Overview shows active requests compactly.
14. Client Performance Dashboard can reference active requests without owning the workflow.
15. internal notes never appear in client-facing routes.
16. linked internal task status is not changed directly by a client response.
17. e2e tests cover create, client response, resolve, cancel, and access denial.
```

## 21. Out Of Scope For UC-005

Do not build:

```text
chat
comments thread
file manager
approval-lite signatures
email notifications
SMS reminders
calendar reminders
multi-step approval workflow
document versioning
real-time collaboration
external storage integrations
```

## 22. Relationship To Other Use Cases

## UC-001

UC-001 shows a compact Needed From Client block on the overview.

UC-005 owns the lifecycle of those records.

## UC-004

UC-004 shows needed-from-client items as analytics context.

UC-004 must not become the request workflow manager.

## Future Use Cases

UC-005 may later connect to:

```text
UC-006 - Approval Lite
UC-007 - Files & Links Hub
UC-008 - Client Activity Tracking
notifications/reminders
```

## 23. Implementation Notes

Build UC-005 as a lightweight workflow module.

Prioritize:

```text
- client isolation
- clear active request visibility
- simple client response
- internal note protection
- status transitions
- dedicated admin/client request surfaces
```

Avoid:

```text
- chat
- approval overbuild
- duplicated request editing inside overview/dashboard pages
- exposing internal blocker detail to clients
```

## 24. Final Definition

```text
UC-005 Needed From Client / Blockers gives the agency and client one controlled workflow for client actions that unblock agency work.

It turns "what do you need from me?" into a visible, trackable, client-safe workflow.
```
