# Agency Client Portal Aggregator — MVP Scope & Development Reference

## 1. Product Positioning

This product is **not** an AgencyAnalytics / Whatagraph / Databox clone.

It is a **client-facing portal layer** for a marketing agency that aggregates:

* project progress
* published client-facing work items
* current agency work
* marketing dashboard embeds
* monthly summaries
* reports
* client blockers / needed actions

The product should sit **above external tools**, not replace them.

External tools remain responsible for:

* marketing data collection
* campaign analytics
* dashboards
* file storage
* automations
* ad platform data
* CRM data

The custom site is responsible for giving the client **one clean place** to understand:

```text
1. What is the agency doing?
2. What progress has been made?
3. What results are we getting?
4. What is blocked?
5. What is needed from the client?
6. Where are the dashboard and monthly report?
```

Existing reporting platforms mainly compete around data connectors, reusable templates, branded dashboards/reports, client-facing reporting, and automated/scheduled delivery; the MVP should use that market signal without trying to rebuild the full platform layer first. ([AgencyAnalytics][1])

---

## 2. Core Product Principle

Build the portal as an **aggregation and communication layer**, not as a full analytics platform.

```text
External tools generate or store the data.
The portal organizes the client-facing experience.
```

The first version should prioritize:

```text
clarity > automation
client understanding > internal complexity
manual input > premature integrations
embedded dashboards > custom BI
monthly summaries > real-time analytics
client-visible progress > full project management
```

Reddit patterns confirm that many agencies rely on Looker Studio / connectors / Sheets / monthly PDFs / manual notes rather than building full reporting infrastructure immediately; recurring pain is usually pulling data from many platforms, formatting for clients, and writing commentary. ([Reddit][2])

---

## 3. MVP Definition

### MVP Name

```text
Agency Client Overview Portal
```

### MVP Promise

```text
Give each client one simple portal where they can see current work, progress, marketing results, latest report, and what the agency needs from them.
```

### MVP Must Answer

```text
What are you doing for me?
What has been completed?
What is currently active?
What is blocked?
What are the results?
What do you need from me?
Where is my dashboard/report?
```

---

## 4. MVP User Roles

Start with only 3 roles.

### 1. agency_admin

Can manage everything inside the agency portal.

Permissions:

```text
- create clients
- manage users
- create projects
- create tasks
- create updates
- create reports
- add dashboard links
- manage files/links
- publish client-visible content
- view all clients
```

### 2. agency_team

Can update assigned work.

Permissions:

```text
- view assigned clients/projects/tasks
- update task status
- add internal notes
- add client-visible updates if allowed
- mark blockers
```

### 3. client_user

Can only access their own client portal.

Permissions:

```text
- view own overview
- view own progress
- view own published client-facing work
- view own dashboard
- view own reports
- view own files/links
- see needed actions
```

### Later Role Split

Do not implement in MVP unless necessary.

```text
agency_owner
account_manager
team_member
client_admin
client_viewer
external_contractor
```

---

## 5. MVP Pages

### Client-Facing Pages

```text
/client/overview
/client/progress
/client/dashboard
/client/reports
```

### Admin Pages

```text
/admin/clients
/admin/projects
/admin/tasks
/admin/updates
/admin/reports
/admin/dashboard-links
```

### Not Required in MVP

```text
/client/chat
/client/billing
/client/invoices
/client/settings
/client/advanced-analytics
/client/custom-dashboard-builder
```

---

## 6. Client Overview Page

This is the most important page.

The client should understand the current state within 30 seconds.

### Required Sections

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

### Status Values

```text
on_track
needs_attention
blocked
waiting_client
paused
```

### Example Structure

```text
Status:
On Track

Current Focus:
- Meta Ads optimization
- Landing page improvements
- Reporting setup

Progress:
- Campaign Setup: 80%
- Landing Page Updates: 60%
- Reporting: 40%

Active Work:
- Review new ad creatives — Waiting for client
- Connect GA4 conversion event — In progress
- Prepare monthly report — In progress

Latest Update:
This week we launched the first campaign structure, connected tracking, and started testing 3 ad angles.

Needed From Client:
- Approve creative batch #2
- Confirm final offer details

Marketing Dashboard:
[Embedded Looker Studio Report]

Latest Monthly Summary:
April 2026 Monthly Summary
```

---

## 7. Project Progress / Tasks Scope

This is **not** a full ClickUp / Asana replacement.

Only implement client-visible progress.

Mature refactor note:

```text
Task is the internal execution record.
ClientWorkItem is the curated client-facing representation of selected work.
Task.visibility / client_visible are legacy migration hints during the refactor.
ClientWorkItem.publish_state is the mature source of truth for client-facing active work.
```

### Required Entities

```text
Project
Milestone
Task
ClientWorkItem
Update
```

### Project Fields

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

### Task Fields

```text
id
project_id
client_id
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

### ClientWorkItem Fields

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

### Task Statuses

```text
todo
in_progress
waiting_client
blocked
done
```

### Visibility Values

Legacy task visibility migration values:

```text
internal
client_visible
```

### MVP Rule

```text
Client users must never see internal tasks or internal notes.
```

### Do Not Build Yet

```text
kanban board
sprints
time tracking
workload management
task dependencies
advanced comments
internal team PM
```

---

## 8. Dashboard Embed Scope

Use embedded external dashboards first.

### MVP Approach

```text
Looker Studio report
→ iframe embed
→ client portal dashboard page
```

Looker Studio supports embedding reports into any site or app that supports iframe embedding, including public and private reports. ([Google Cloud Documentation][3])

### Dashboard Link Fields

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

### Provider Values

```text
looker_studio
agencyanalytics
databox
whatagraph
dashthis
swydo
reportgarden
oviond
custom
```

### MVP Rule

```text
The portal stores and displays dashboard links.
The portal does not calculate marketing analytics in V1.
```

---

## 9. Monthly Reports Scope

Monthly summaries are more important than complex live analytics.

### Report Fields

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

### Report Statuses

```text
draft
ready
published
archived
```

### Report Template

```text
What We Did
Results
Wins
Problems / Blockers
Next Actions
Needed From Client
Dashboard Link
PDF / Report Link
```

### MVP Rule

```text
Write summaries manually first.
AI-generated insights are not part of MVP.
```

Swydo’s reporting guidance emphasizes that an untouched automated dashboard without commentary is closer to a data feed than useful client reporting, which supports prioritizing a human-written summary layer before AI insights. ([Swydo][4])

---

## 10. Needed From Client / Blockers

This is essential.

The portal should clearly show what is waiting on the client.

### MVP Implementation

Use a simple section on the Overview page.

Fields:

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

Status values:

```text
pending
answered
resolved
cancelled
```

### Examples

```text
Approve new ad creatives
Confirm final offer
Send access to Google Ads
Review landing page copy
Approve monthly report
Send missing brand assets
```

### Do Not Build Yet

```text
full approval workflow
e-signature
multi-step review
creative annotation
version history
```

---

## 11. Files & Links

Do not build file storage in MVP.

### MVP Approach

```text
Google Drive stores files.
Portal stores important links.
```

### Fields

```text
id
client_id
title
url
category
visible_to_client
created_at
updated_at
```

### Categories

```text
drive_folder
brand_assets
reports
creatives
contracts
briefs
meeting_recordings
landing_pages
```

### Priority

```text
Should-have, not must-have.
```

---

## 12. Activity Tracking

Useful, but not required for MVP launch.

### Later Events

```text
portal_viewed
dashboard_opened
report_opened
file_clicked
needed_action_viewed
```

### Purpose

```text
Know whether clients actually use the portal.
Know which sections matter.
Know whether reports are opened.
```

### Priority

```text
V2
```

---

## 13. MVP Data Model

### Required Tables

```text
profiles
clients
client_memberships
projects
tasks
client_work_items
updates
dashboard_links
reports
needed_from_client
```

### Optional V2 Tables

```text
files_links
activity_events
approval_requests
comments
notifications
```

### profiles

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

### clients

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

### client_memberships

```text
id
client_id
user_id
role
created_at
updated_at
```

### projects

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

### tasks

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

### client_work_items

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

### updates

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

### dashboard_links

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

### reports

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

### needed_from_client

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

---

## 14. Access Rules

### Rule 1: Client Isolation

```text
Client users can only see rows connected to their own client_id.
```

### Rule 2: Internal vs Client-Visible

```text
Every task, update, file, or report-related item must support visibility rules.
```

### Rule 3: Agency Access

```text
agency_admin can manage all clients.
agency_team can only manage assigned work.
client_user can only view their own portal.
```

### Rule 4: Client Cannot Edit Agency Work

Client users can view and respond to needed actions, but they cannot directly change agency task status.

---

## 15. Recommended Stack

### MVP Stack

```text
Frontend:
Next.js / React

Backend:
Supabase

Auth:
Supabase Auth

Database:
Supabase Postgres

Permissions:
Supabase Row Level Security

Dashboard:
Looker Studio embed

Automation:
n8n or Make

Files:
Google Drive links

Reports:
Manual summary + Google Docs / Slides / PDF links
```

Supabase provides authentication and authorization tooling, and Supabase/Postgres Row Level Security can enforce row-level access so clients only see their own data. ([Google Cloud Documentation][3])

### Alternative No-Code MVP

```text
Softr
Airtable / Google Sheets
Looker Studio
Make / n8n
Google Drive
Google Docs / Slides
```

Use this if speed matters more than product ownership.

### Later Custom Product Stack

```text
Django
PostgreSQL
Django Admin
Celery + Redis
Custom API connectors
Custom analytics tables
Custom dashboard frontend
```

---

## 16. Build Order

### Step 1 — Auth + Client Isolation

Build:

```text
login
roles
client-specific access
agency admin access
```

Done when:

```text
client_user can only see their own client portal
agency_admin can see all clients
```

### Step 2 — Client Overview Page

Build:

```text
status
current focus
progress summary
active tasks
latest update
needed from client
dashboard embed block
latest report block
```

Done when:

```text
one client can log in and understand current agency work in 30 seconds
```

### Step 3 — Admin CRUD

Build:

```text
clients
projects
tasks
updates
reports
dashboard links
needed from client
```

Done when:

```text
agency_admin can manually update the entire portal without developer help
```

### Step 4 — Looker Studio Embed

Build:

```text
save embed URL
render iframe
show dashboard per client
```

Done when:

```text
each client sees their own embedded marketing dashboard
```

### Step 5 — Monthly Summary / Reports

Build:

```text
report archive
manual summary fields
dashboard link
PDF/report link
published status
```

Done when:

```text
agency can publish a monthly report inside the portal
```

### Step 6 — Needed From Client

Build:

```text
pending client actions
status updates
related links
due dates
```

Done when:

```text
client blockers are visible and no longer lost in chats
```

---

## 17. Must-Have vs Later vs Skip

### Must-Have

```text
client login
client isolation
client overview page
project progress
published client-facing work
latest update
needed from client
embedded dashboard
monthly summary/report archive
basic agency admin
```

### Should-Have / V2

```text
files and links
approval requests
email notifications
client activity tracking
basic KPI cards inside portal
PDF generation
client comments
simple branding
```

### Later / V3

```text
Google Ads API connector
Meta Ads API connector
GA4 connector
GHL connector
sync logs
data source health checks
alerts
AI draft summaries
custom analytics tables
```

### Skip for MVP

```text
custom dashboard builder
native BI system
full project management system
chat/messaging system
billing/invoicing
mobile app
advanced permissions
custom attribution engine
template marketplace
real-time analytics
```

---

## 18. Sacrifice Rules

If scope gets too large, sacrifice in this order:

### Sacrifice First

```text
custom UI polish
PDF generation
email notifications
client comments
files module
activity tracking
```

### Sacrifice Next

```text
approval workflow
basic KPI cards inside portal
advanced reports archive
team member permissions
```

### Do Not Sacrifice

```text
client isolation
overview page
progress/tasks
latest update
needed from client
dashboard embed
monthly summary
```

### Never Build First

```text
native ad connectors
custom dashboard builder
AI insights engine
full PM system
chat
billing
```

---

## 19. MVP Success Criteria

The MVP is successful if:

```text
1. Agency can create a client.
2. Agency can invite a client user.
3. Client sees only their own portal.
4. Agency can add project progress manually.
5. Agency can publish client-facing work items.
6. Agency can add latest updates.
7. Agency can show what is needed from the client.
8. Agency can embed a Looker Studio dashboard.
9. Agency can publish a monthly summary.
10. Client can understand status, progress, results, and next actions without asking in chat.
```

---

## 20. Core Product Statement

```text
A branded client portal for marketing agencies that aggregates project progress, published client-facing work, marketing dashboard embeds, monthly summaries, and client-needed actions into one simple client-facing experience.
```

The product should not try to replace reporting platforms, analytics tools, project management tools, or CRMs in V1.

The product should create value by making agency-client communication clearer, reducing repetitive status/reporting work, and giving clients one place to understand progress, results, and next actions.

[1]: https://agencyanalytics.com/?utm_source=chatgpt.com "AgencyAnalytics: Automated Client Reporting for Marketing ..."
[2]: https://www.reddit.com/r/agency/comments/1j7cnac/client_reporting/?utm_source=chatgpt.com "Client Reporting : r/agency"
[3]: https://docs.cloud.google.com/data-studio/embed-a-report?utm_source=chatgpt.com "Embed a report | Data Studio"
[4]: https://www.swydo.com/features/overview/?utm_source=chatgpt.com "Check All Swydo's Features"
