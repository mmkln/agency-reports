# UC-001 - Client Overview / Status Hub

## Document Status

```text
Document type: Use Case Specification
Product: Agency Client Portal Aggregator
Use case ID: UC-001
Use case name: Client Overview / Status Hub
Version: v1.0
Status: MVP-ready
Primary reference: Agency Client Portal Aggregator - MVP Scope & Development Reference
```

Source basis:

```text
- docs/project-brief.md
- docs/mvp-scope.md
- User-provided UC-001 specification
```

## 1. Purpose

UC-001 defines the first core client-facing experience of the Agency Client Portal Aggregator.

The Client Overview / Status Hub gives each client one simple page where they can understand:

```text
1. What the agency is doing now
2. What progress has been made
3. What client-facing work is currently active
4. What is blocked
5. What results are coming from marketing work
6. What the agency needs from the client
7. Where to find the latest dashboard and monthly report
```

This is the first and most important product flow because it validates the core product hypothesis:

```text
Clients value one clear place where they can understand agency work, progress, results, and next actions without asking in chat.
```

## 2. Product Context

The Agency Client Portal Aggregator is not a full analytics platform, project management tool, CRM, chat system, or reporting automation platform.

It is a client-facing aggregation and communication layer.

External tools remain responsible for:

```text
- marketing data collection
- campaign analytics
- dashboards
- file storage
- automations
- ad platform data
- CRM data
- internal project management
```

The portal is responsible for:

```text
- organizing client-facing progress
- showing curated client-facing work items
- displaying current agency work
- showing client blockers / needed actions
- embedding existing dashboards
- publishing monthly summaries
- giving clients one clean status view
```

UC-001 implements the central experience that all other use cases connect to.

## 3. Use Case Summary

```text
As a client user,
I want to open one page and understand the current state of the agency's work,
so that I do not need to ask the agency for status updates, dashboard links, reports, or next actions.
```

```text
As an agency admin,
I want to manually control what the client sees on the overview page,
so that I can present a clean, accurate, client-facing version of current work.
```

```text
As an agency team member,
I want to update task statuses and blockers,
so that the client-facing overview can stay accurate without exposing internal notes or internal work chaos.
```

## 4. Primary Actors

### 4.1 agency_admin

The `agency_admin` manages the client portal and controls what becomes visible to the client.

Responsibilities:

```text
- create clients
- invite client users
- create projects
- create or publish client-facing work items
- publish client-facing updates
- set client status
- add dashboard links
- publish monthly summaries
- add needed-from-client items
- preview the portal as client
```

The `agency_admin` is the owner of the client-facing state.

### 4.2 agency_team

The `agency_team` member updates assigned work.

Responsibilities:

```text
- view assigned tasks
- update task statuses
- add internal notes
- mark blockers
- suggest client-facing summaries for review
- keep delivery progress current
```

The `agency_team` member contributes operational updates but should not control the full client-facing portal unless permission is granted.

### 4.3 client_user

The `client_user` consumes the portal.

Responsibilities:

```text
- log in
- view current status
- understand current agency work
- view progress
- view active client-facing work
- view needed actions
- open dashboard
- open monthly report
- respond to needed actions outside or inside the portal, depending on MVP implementation
```

The `client_user` must only see their own client data.

## 5. Main Client Questions

The overview page must answer:

```text
What are you doing for me?
What has already been completed?
What is currently active?
What is blocked?
What results are we getting?
What do you need from me?
Where is my dashboard or latest report?
```

If the client can answer these questions without messaging the agency, this use case is successful.

## 6. Core Page: Client Overview

### 6.1 Required Sections

The Client Overview page must include:

```text
Client Name
Current Status
Current Focus
Progress Summary
Active Work
Latest Update
Needed From Client
Marketing Dashboard Embed
Latest Monthly Summary
```

### 6.2 Recommended Layout

```text
[Client Name]

Status:
On Track / Needs Attention / Blocked / Waiting Client / Paused

Current Focus:
- Focus item 1
- Focus item 2
- Focus item 3

Progress Summary:
- Project or milestone progress
- Completed work
- Current stage

Active Work:
- Client-facing work title
- Client-safe summary
- Status
- Target date
- Related project or campaign

Latest Update:
Short human-written agency update

Needed From Client:
- Action needed
- Due date
- Related link
- Status

Marketing Dashboard:
Embedded Looker Studio / external dashboard

Latest Monthly Summary:
Latest published report summary + report link
```

### 6.3 Example Client Overview

```text
Client: Green Dental Clinic

Status:
On Track

Current Focus:
- Meta Ads campaign optimization
- Landing page conversion improvements
- Follow-up automation setup

Progress Summary:
- Campaign Setup: 80%
- Landing Page Updates: 60%
- Reporting Setup: 40%

Active Work:
- Review new ad creatives - Waiting for client
- Connect GA4 conversion event - In progress
- Prepare monthly report - In progress

Latest Update:
This week we launched the first campaign structure, connected basic tracking, and started testing 3 ad angles. Early traffic quality looks stable, but we still need more conversion data before making larger budget decisions.

Needed From Client:
- Approve creative batch #2
- Confirm final offer details

Marketing Dashboard:
[Embedded Looker Studio Report]

Latest Monthly Summary:
April 2026 Monthly Summary
```

## 7. Core Flow A - agency_admin Creates Client Overview

### 7.1 Trigger

A new client needs access to the portal, or an existing client needs an updated overview.

### 7.2 Flow

```text
1. agency_admin logs in.
2. agency_admin opens Admin Dashboard.
3. agency_admin creates a new Client.
4. agency_admin adds client name, logo, and portal slug.
5. agency_admin invites client_user.
6. agency_admin creates the first Project.
7. agency_admin adds Milestones.
8. agency_admin creates or publishes client-facing work items from selected internal work.
9. agency_admin writes the Latest Update.
10. agency_admin adds Needed From Client items.
11. agency_admin adds Dashboard Embed link.
12. agency_admin adds Latest Monthly Summary or report placeholder.
13. agency_admin previews the overview as client_user.
14. agency_admin publishes the Client Overview.
15. agency_admin sends portal invite/link to the client.
```

### 7.3 Decisions

| Decision | Options |
| --- | --- |
| Client status | `on_track` / `needs_attention` / `blocked` / `waiting_client` / `paused` |
| Work publish state | `draft` / `ready_for_review` / `published` / `archived` |
| Dashboard provider | `looker_studio` / `agencyanalytics` / `databox` / `whatagraph` / `dashthis` / `swydo` / `reportgarden` / `oviond` / `custom` |
| Report status | `draft` / `ready` / `published` / `archived` |
| Needed action status | `pending` / `answered` / `resolved` / `cancelled` |

### 7.4 Success State

```text
The client can log in and see a clean overview page with status, progress, active work, needed actions, dashboard, and latest summary.
```

## 8. Core Flow B - agency_team Updates Work Status

### 8.1 Trigger

A team member progresses, completes, blocks, or updates an assigned task.

### 8.2 Flow

```text
1. agency_team logs in.
2. agency_team opens assigned tasks.
3. agency_team selects a task.
4. agency_team updates task status.
5. agency_team adds an internal note if needed.
6. agency_team marks blocker if relevant.
7. agency_team adds or suggests a client-facing summary for admin review if allowed.
8. agency_team saves changes.
9. Client Overview updates only after client-facing work is published.
```

### 8.3 Task Status Transitions

```text
todo -> in_progress
in_progress -> done
in_progress -> blocked
in_progress -> waiting_client
waiting_client -> in_progress
blocked -> in_progress
```

### 8.4 Visibility Rule

```text
Internal notes and internal tasks must never appear in the client portal.
Task updates may prepare reviewable client-facing work, but they do not publish client-visible active work by themselves.
```

### 8.5 Success State

```text
The agency can keep the overview accurate without exposing internal operational complexity.
```

## 9. Core Flow C - client_user Views Overview

### 9.1 Trigger

The client wants to check progress, results, blockers, or reports.

### 9.2 Flow

```text
1. client_user opens portal link.
2. client_user logs in.
3. client_user lands on Client Overview.
4. client_user sees Current Status.
5. client_user reads Current Focus.
6. client_user checks Progress Summary.
7. client_user reviews Active Work.
8. client_user reads Latest Update.
9. client_user checks Needed From Client.
10. client_user opens Marketing Dashboard if needed.
11. client_user opens Latest Monthly Summary if needed.
12. client_user responds to needed actions if applicable.
```

### 9.3 Expected Client Understanding

| Client question | Portal section |
| --- | --- |
| What are you doing now? | Current Focus |
| What has been completed? | Progress Summary |
| What is active? | Active Work |
| What is blocked? | Current Status / Needed From Client |
| What results are we getting? | Marketing Dashboard |
| What do you need from me? | Needed From Client |
| Where is the report? | Latest Monthly Summary |

### 9.4 Success State

```text
The client understands current work, progress, results, and next actions without asking the agency in chat.
```

## 10. Full Lifecycle Flow

```text
agency_admin creates and publishes Client Overview
-> agency_team updates task statuses, blockers, and progress
-> agency_admin reviews and controls client-facing state
-> client_user logs in and understands current status
-> client_user responds to needed actions
-> agency_team continues work
-> agency_admin updates latest summary/report
```

## 11. Required Data Objects

### 11.1 clients

```text
id
agency_id
name
logo_url
status
portal_slug
primary_contact_name
primary_contact_email
created_at
updated_at
```

### 11.2 profiles

```text
id
user_id
email
name
role
agency_id
client_id
created_at
updated_at
```

### 11.3 client_memberships

```text
id
client_id
user_id
role
created_at
updated_at
```

### 11.4 projects

```text
id
client_id
name
description
status
progress_percent
start_date
end_date
created_at
updated_at
```

### 11.5 tasks

```text
id
client_id
project_id
title
description
status
assignee_name
due_date
client_visible
visibility
sort_order
created_at
updated_at
```

Tasks are internal execution records. In the mature architecture, client-facing active work is represented by `client_work_items` rather than directly exposing tasks.

### 11.6 client_work_items

```text
id
client_id
project_id
source_task_id
title
summary
status
target_date
sort_order
publish_state
published_at
published_by
last_reviewed_at
created_at
updated_at
```

### 11.7 updates

```text
id
client_id
project_id
title
body
visibility
created_by
created_at
updated_at
```

### 11.7 dashboard_links

```text
id
client_id
name
provider
embed_url
public_url
status
created_at
updated_at
```

### 11.8 reports

```text
id
client_id
period_start
period_end
status
summary
wins
problems
next_actions
client_decisions_needed
dashboard_url
pdf_url
published_at
created_at
updated_at
```

### 11.9 needed_from_client

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

## 12. Status Definitions

### 12.1 Client Status

| Status | Meaning |
| --- | --- |
| `on_track` | Work is progressing normally |
| `needs_attention` | Something requires attention but work is not fully blocked |
| `blocked` | Work cannot move forward due to an issue |
| `waiting_client` | Agency is waiting on client action |
| `paused` | Work is intentionally paused |

### 12.2 Task Status

| Status | Meaning |
| --- | --- |
| `todo` | Task is planned but not started |
| `in_progress` | Task is actively being worked on |
| `waiting_client` | Task is waiting on client input/action |
| `blocked` | Task is blocked by internal or external dependency |
| `done` | Task is completed |

### 12.3 Needed From Client Status

| Status | Meaning |
| --- | --- |
| `pending` | Waiting for client response |
| `answered` | Client responded, agency needs to process |
| `resolved` | Action is completed |
| `cancelled` | Action is no longer needed |

### 12.4 Report Status

| Status | Meaning |
| --- | --- |
| `draft` | Internal draft, not visible to client |
| `ready` | Ready for review/publishing |
| `published` | Visible to client |
| `archived` | Historical report |

## 13. Permission Rules

### 13.1 Client Isolation

```text
client_user can only see data connected to their own client_id.
```

### 13.2 Internal vs Client-Visible

MVP task visibility fields are legacy migration hints during the mature refactor.

In the mature architecture:

```text
Task = internal execution.
ClientWorkItem = client-facing active work.
ClientWorkItem.publish_state controls whether the client can see the work.
```

### 13.3 Client Cannot Edit Agency Work

```text
client_user cannot directly edit task status, project status, internal notes, reports, or dashboard links.
```

### 13.4 Agency Admin Controls Published State

```text
agency_admin controls what appears in the client-facing overview.
```

### 13.5 Drafts Are Hidden

```text
client_user must never see draft reports, draft updates, internal notes, or unfinished dashboard links.
```

## 14. Screen Requirements

### 14.1 Client Screen: `/client/overview`

Required components:

```text
ClientHeader
StatusBadge
CurrentFocusBlock
ProgressSummaryBlock
ActiveWorkBlock
LatestUpdateBlock
NeededFromClientBlock
DashboardEmbedBlock
LatestMonthlySummaryBlock
```

### 14.2 Admin Screen: `/admin/clients/:id/overview`

Editable components:

```text
ClientStatusEditor
CurrentFocusEditor
ProgressSummaryEditor
ClientWorkReviewManager
LatestUpdateEditor
NeededFromClientManager
DashboardLinkManager
LatestReportManager
PreviewAsClientButton
PublishOverviewButton
```

### 14.3 Team Screen: `/team/tasks`

Required components:

```text
AssignedTasksList
TaskStatusEditor
BlockerMarker
InternalNoteEditor
ClientWorkReviewState
```

## 15. Edge Cases

### 15.1 No Dashboard Yet

Show:

```text
Dashboard is being prepared.
Expected availability: [date]
```

Do not render an empty iframe.

### 15.2 No Active Work

Show:

```text
No active client-facing work right now.
```

Do not show an empty task table.

### 15.3 Waiting on Client

If one or more important `needed_from_client` items are pending, the client status can be set to:

```text
waiting_client
```

### 15.4 Internal Blocker

If a blocker is internal and should not be exposed, show a client-safe update:

```text
We are resolving a technical setup issue.
```

Do not expose internal debugging notes.

### 15.5 No Published Report

Show:

```text
No published report yet.
```

or show the latest previous published report.

Do not show draft reports.

### 15.6 Unauthorized Client Access

If a `client_user` tries to access another client's portal, show:

```text
Access denied.
```

Do not leak the existence of other clients.

### 15.7 Broken Dashboard Embed

Show:

```text
Dashboard is temporarily unavailable.
```

Also show a fallback external dashboard link if available.

## 16. Acceptance Criteria

UC-001 is complete when:

```text
1. agency_admin can create a client.
2. agency_admin can invite a client_user.
3. client_user can log in.
4. client_user can only see their own client overview.
5. agency_admin can set client status.
6. agency_admin can add current focus.
7. agency_admin can create projects.
8. agency_admin can publish selected work as client-facing active work.
9. agency_team can update assigned task status.
10. internal tasks are hidden from client_user.
11. internal notes are hidden from client_user.
12. agency_admin can add latest update.
13. agency_admin can add needed_from_client items.
14. client_user can see needed_from_client items.
15. agency_admin can add dashboard embed link.
16. client_user can see embedded dashboard if available.
17. agency_admin can publish latest monthly summary.
18. client_user can see only published reports.
19. agency_admin can preview overview as client.
20. client_user can understand status, progress, results, and next actions without messaging the agency.
```

## 17. Out of Scope for UC-001

Do not build in this use case:

```text
comments
chat
full approval workflow
file manager
email notifications
activity tracking
advanced roles
task dependencies
kanban board
real-time analytics
native Google Ads connector
native Meta Ads connector
native GA4 connector
native GHL connector
custom dashboard builder
AI summary engine
billing
invoicing
mobile app
```

## 18. Dependencies

UC-001 depends on:

```text
authentication
role-based access
client isolation
basic database schema
admin client management
dashboard link storage
report summary storage
task visibility rules
```

UC-001 does not depend on:

```text
native ad platform integrations
custom analytics engine
automated report generation
AI insights
full project management module
```

## 19. Relationship to Future Use Cases

UC-001 is the central hub that future use cases connect to.

Future use cases:

```text
UC-002 - Embedded Marketing Dashboard
UC-003 - Monthly Summary / Report Archive
UC-004 - Client-Facing Work / Progress
UC-005 - Needed From Client / Blockers
UC-006 - Approval Lite
UC-007 - Files & Links Hub
UC-008 - Client Activity Tracking
UC-009 - Lead Feedback / Lead Quality Marking
UC-010 - Native Integrations / Advanced Analytics
```

UC-001 should stay simple and not absorb all future use cases.

## 20. Implementation Notes for AI / Developer

Build the use case as a minimal but functional client-facing overview.

Prioritize:

```text
client isolation
clear overview
manual admin control
client-visible progress
dashboard embed
monthly summary
needed from client
```

Avoid:

```text
custom analytics
complex automation
advanced UI polish
overbuilt permissions
internal project management complexity
```

The first implementation should feel like a reliable client status page, not a full platform.

## 21. Product Logic Summary

```text
agency_admin creates and controls the client-facing overview.
agency_team updates work status and blockers.
client_user consumes the overview to understand progress, results, reports, and needed actions.
```

The overview page is the first product surface because it compresses the agency-client relationship into one understandable view.

## 22. Final Definition

```text
UC-001 Client Overview / Status Hub is the first core use case of the Agency Client Portal Aggregator.

It gives each client one simple page to understand what the agency is doing, what progress has been made, what is active, what is blocked, what results are available, what the agency needs from the client, and where the latest dashboard/report lives.
```

## 23. AI Implementation Checklist

When implementing this use case, verify:

```text
- The client overview answers the seven main client questions.
- Every client-facing work item/update/report has a visibility rule.
- Internal tasks, notes, draft reports, and unfinished dashboard links are never rendered for client_user.
- Empty states are useful and explicit.
- Dashboard blocks do not render empty iframes.
- Admin controls remain manual and explicit.
- The first implementation stays focused on overview/status, not analytics automation.
```
