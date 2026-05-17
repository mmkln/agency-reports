# Client Control Center Information Architecture

```text
Document type: Research-backed product IA synthesis
Product area: Agency Client Portal Aggregator
Focus: Client-facing navigation, page ownership, and analytics/reporting placement
Status: Product direction reference for future sitemap and use-case revisions
Related docs:
- docs/research/client-analytics-dashboard-ui-recommendations.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- docs/use-cases/UC-002-embedded-marketing-dashboard.md
- docs/use-cases/UC-003-monthly-summary-report-archive.md
- docs/use-cases/UC-004-client-performance-dashboard.md
- docs/use-cases/UC-005-needed-from-client-blockers.md
```

## 1. Core Decision

The client-facing product should be treated as a **Client Control Center**, not as a client task manager, raw analytics tool, or agency operations mirror.

A client enters the portal to answer six questions quickly:

```text
1. What is the current status?
2. What is the agency working on?
3. Is anything blocked?
4. What do they need from me?
5. What results / reports / dashboards can I see?
6. What was approved, delivered, or decided?
```

The product should therefore organize around client understanding, client action, visible work, deliverables, and proof of value. It should not expose the agency's internal task system as the main client experience.

## 2. How This Relates To Analytics Research

The Client Control Center research and the analytics dashboard research are compatible.

The Client Control Center defines the full client-side portal model:

```text
status + work visibility + client actions + deliverables + updates + results
```

The analytics research defines the correct treatment of the results area:

```text
business-value interpretation first, raw/source dashboard second
```

Combined product rule:

```text
Reports & Dashboards is the proof-of-value area inside the Client Control Center.
Performance analytics is the interpreted layer.
Source dashboards are the underlying external data layer.
Monthly reports are the period-based narrative archive.
```

Do not treat `Performance`, `Dashboard`, and `Reports` as three unrelated top-level client destinations. Clients think in terms of results, latest report, dashboard, and interpretation, not internal product modules.

## 3. Recommended Client-Side Sitemap

Recommended long-term client navigation:

```text
Client Portal
├── Overview
├── Action Needed
├── Projects
│   └── Project Detail
├── Reports & Dashboards
├── Files & Links
├── Requests
├── Updates
└── Settings
```

Later or optional areas:

```text
├── Approvals
├── Messages
├── Billing
├── Meetings
└── Knowledge Base / FAQ
```

For MVP, do not add a top-level `Tasks` page for clients. Use `Projects`, `Work`, or project detail surfaces where client-visible work items are shown in context.

## 4. Page Ownership

### 4.1 Overview

Purpose:

```text
Give the client a 10-20 second answer to:
- Where are we?
- What changed?
- What needs my attention?
- Are results visible?
- Is anything delayed?
```

Recommended sections:

```text
Header:
- client name / brand
- account manager
- last updated
- next meeting or next review date

Status:
- overall status
- short client-safe summary

Action Needed:
- approvals waiting
- files needed
- access needed
- feedback needed
- overdue client actions

Active Work:
- 3-5 active client-visible work/project cards

Recent Updates:
- latest curated agency updates
- weekly or milestone summary

Reports & Dashboards Preview:
- latest report
- main dashboard link
- 1 hero KPI or 2-3 KPI snapshot
- short account-manager interpretation

Files & Links Preview:
- important shared links
- recent deliverables

Contact:
- primary contact
- ask a question action
```

Overview must not become the full analytics page. It may show only a compact performance preview and links to deeper results.

### 4.2 Action Needed

Purpose:

```text
Act as the client's operational inbox.
Show only items where the client must act.
```

Included item types:

```text
- approvals
- feedback
- files needed
- access needed
- questions to answer
- budget or scope confirmations
```

Recommended card fields:

```text
title
type
project
due date
why needed
impact if delayed
primary action
status
last update or reminder
```

Important rule:

```text
An internal `waiting_client` state should create or reference a client-facing Action Needed item.
The client should not need to inspect or edit the internal agency task.
```

### 4.3 Projects

Purpose:

```text
Show active client-visible workstreams without exposing the agency's internal task system.
```

Project card fields:

```text
project name
objective
current phase
health/status
progress summary
target date
last updated
open client actions
view project
```

Client filters should stay simple:

```text
Active
Waiting on me
Completed
Archived
```

Do not expose internal assignee filters, internal labels, sprint structure, team workload, or internal priority.

### 4.4 Project Detail

Purpose:

```text
Explain what is happening inside a client-visible workstream.
```

Recommended structure:

```text
Project header:
- name
- objective
- status
- progress
- target date
- last updated
- account owner

Client-safe summary
Milestones / timeline
Active client-visible work
Waiting on you
Client-relevant blockers
Deliverables
Related dashboard or report links
Curated updates
Client-safe questions / comments
```

Do not show:

```text
internal task descriptions
internal notes
internal assignee discussion
team workload
time spent
profitability
internal QA notes
internal blockers that create anxiety without a client action
```

### 4.5 Reports & Dashboards

Purpose:

```text
Answer whether the agency is creating business value and preserve the reporting archive.
```

This page should combine three layers:

```text
1. Current Performance / interpreted analytics
2. Source Dashboard / external dashboard embed or link
3. Report Archive / monthly or campaign narrative reports
```

Recommended layout:

```text
Top:
- latest report
- current reporting period
- last updated
- data confidence
- next report date

Executive Summary:
- what happened
- why it matters
- what the agency is doing next

Primary KPI Cards:
- 3-6 business-value metrics
- goal / delta / status where available

Goal Progress:
- goal vs actual
- on track / behind / ahead

Trend:
- one main business outcome trend

Channel Breakdown:
- paid / SEO / social / email / other active services

What Changed:
- plain-language insights
- likely cause
- business impact

What We Did:
- agency actions connected to performance movement

Source Dashboard:
- embedded external dashboard if available
- secure external link fallback

Report Archive:
- published monthly reports
- PDFs or external report links
- published dates
```

Product rule:

```text
The current UC-004 Performance Dashboard should be treated as the Current Performance layer of Reports & Dashboards when the client IA is revised.
```

It can remain technically separate during implementation, but the client mental model should be one results area, not multiple competing dashboard pages.

### 4.6 Files & Links

Purpose:

```text
Give the client one place for deliverables, shared links, uploads, reports, brand assets, and admin files.
```

Recommended tabs:

```text
Deliverables
Client uploads
Reports
Brand assets
Shared links
Contracts / admin
Archived
```

Visibility rule:

```text
Internal files are never visible by default.
Client-visible files and client-uploaded files are explicit records.
Published deliverables are visible.
Archived deliverables remain available in archive when appropriate.
```

### 4.7 Requests

Purpose:

```text
Let clients submit new work, support, or service requests without using scattered Slack/email messages.
```

Requests are not the same as agency tasks.

Recommended flow:

```text
client submits request
-> agency_admin reviews
-> agency accepts / clarifies / rejects / converts to internal work
-> client sees request status
```

Do not automatically turn client-created requests into internal execution tasks without agency review.

### 4.8 Updates

Purpose:

```text
Preserve curated status history and decision history.
```

Updates should not be a raw activity feed.

Recommended update types:

```text
weekly update
milestone update
launch update
issue update
report published
approval completed
decision recorded
```

Update card fields:

```text
title
date
agency author
summary
what changed
what is next
client action if any
related project
related file/report/dashboard
```

### 4.9 Settings

Purpose:

```text
Own client-side account controls only.
```

Recommended settings:

```text
profile
company / team members
notification preferences
billing details if billing exists
language
security / password
```

## 5. Naming And Mental Model Rules

Avoid exposing multiple top-level pages that sound like the same client job:

```text
Performance
Dashboard
Reports
Analytics
```

If all are needed technically, group them under `Reports & Dashboards` in the client-facing IA.

Preferred mental model:

```text
Overview = status and control
Action Needed = client responsibility inbox
Projects = visible workstreams
Reports & Dashboards = results and proof of value
Files & Links = deliverables and shared resources
Requests = new asks from the client
Updates = curated history
Settings = account controls
```

## 6. Analytics Placement Rules

### 6.1 Overview Analytics Preview

Overview may show:

```text
1 hero metric
2-3 supporting KPIs max
last updated
data confidence/source label
link to Reports & Dashboards or Current Performance
```

Overview should not show:

```text
full funnel
channel tables
appendix tables
raw dashboard embeds as the main content
technical diagnostics
keyword/ad-level detail
```

### 6.2 Reports & Dashboards Analytics

Reports & Dashboards should show:

```text
plain-language executive summary
business-value KPI cards
goals vs actual
trend
funnel or channel breakdown when useful
what changed / why
what the agency did
next actions
data freshness / source / confidence
source dashboard link/embed
report archive
```

### 6.3 Source Dashboard

Source dashboards are external reporting tools such as Looker Studio, AgencyAnalytics, Databox, Whatagraph, DashThis, Swydo, ReportGarden, Oviond, or custom dashboards.

They should be visible only after the agency has intentionally made them client-visible.

Source dashboards should not replace the interpreted analytics layer.

## 7. What The Client Should Not See

Never show these by default:

```text
internal notes
internal comments
internal assignees unless intentionally exposed
internal priorities
time spent
profitability
internal estimates
internal QA notes
internal blockers without a client-facing reason
unpublished dashboards
draft reports
work-in-progress deliverables
internal project templates
internal team workload
raw activity feed
```

Client visibility is a controlled permission and publishing problem. The client should see a curated operating layer, not the agency's internal workspace.

## 8. Client-Facing Object Model

### 8.1 ClientVisibleWorkItem

```text
id
client_id
project_id
title
client_safe_summary
status
target_date
last_updated_at
visibility = client_visible
related_action_id
related_approval_id
related_files
related_dashboard_url
```

### 8.2 ClientAction

```text
id
client_id
project_id
type: approval / feedback / file_needed / access_needed / question / confirmation
title
description
why_needed
impact_if_delayed
due_date
status
cta_label
related_work_item_id
related_file_id
completed_at
```

### 8.3 ClientApproval

```text
id
client_id
project_id
title
file_or_link
version
instructions
status: pending / needs_changes / approved / overdue
due_date
requested_by
approver
decision_comment
approved_at
changes_requested_at
```

### 8.4 ClientUpdate

```text
id
client_id
project_id
title
summary
what_changed
what_next
client_action_needed
published_by
published_at
related_items
```

### 8.5 ClientReport

```text
id
client_id
title
period_start
period_end
type: monthly / weekly / campaign / custom
summary
dashboard_url
file_url
published_at
approved_by_admin
```

## 9. MVP Priority

Recommended build order for this IA:

```text
1. Overview
2. Action Needed
3. Projects + Project Detail
4. Reports & Dashboards
5. Files & Links
6. Updates
```

Second wave:

```text
7. Requests
8. Approvals as a separate page if the agency does heavy creative/content approval
9. Messages / Q&A
10. Billing
```

Do not build first:

```text
full client task manager
client kanban board as main UI
complex table view for clients
client editing internal agency tasks
full chat replacement
deep permission matrix
raw activity feed
time tracking / profitability / workload views
```

## 10. Relationship To Current Use Cases

### UC-001 - Client Overview / Status Hub

UC-001 remains the entry surface. It should be considered the Overview/Home surface of the Client Control Center.

Required future alignment:

```text
Keep UC-001 compact.
Keep action-needed, active work, recent updates, report preview, dashboard preview, and file/link preview summary-level only.
Do not let UC-001 absorb the full analytics, project detail, request, report archive, or file manager workflows.
```

### UC-002 - Embedded Marketing Dashboard

UC-002 should be treated as the Source Dashboard capability.

Required future alignment:

```text
External dashboards are source/detail surfaces.
They should sit inside or be linked from Reports & Dashboards.
They should not be the first or only explanation of performance.
```

### UC-003 - Monthly Summary / Report Archive

UC-003 should be treated as the Report Archive and narrative reporting capability inside Reports & Dashboards.

Required future alignment:

```text
Reports remain human-written narrative records.
Reports explain completed periods.
Reports do not replace current performance analytics.
```

### UC-004 - Client Performance Dashboard

UC-004 should be treated as Current Performance / interpreted analytics inside Reports & Dashboards.

Required future alignment:

```text
UC-004 can remain a technical route/module.
Client-facing navigation should eventually group it with reports and dashboards.
UC-004 should lead with business outcomes, goals, trends, interpretation, next actions, and trust signals.
```

### UC-005 - Needed From Client / Blockers

UC-005 should own the Action Needed model.

Required future alignment:

```text
Overview can preview urgent actions.
Reports & Dashboards can reference performance-affecting actions.
Projects can show project-specific actions.
The full lifecycle belongs in Action Needed or Requests/Approvals, not duplicated everywhere.
```

## 11. Source Basis

This synthesis is based on the supplied client portal research and the analytics dashboard research, plus verification of the cited platform documentation.

Relevant source signals:

```text
- Teamwork client users are designed for client visibility, contextual collaboration, approvals, comments, and files, but with reduced permissions and no access to profitability, planning/workload/portfolio, templates, or people areas.
- Teamwork proofing supports invited review/approval flows with comments, versions, pending / needs changes / approved decisions.
- AgencyAnalytics Client Portal centralizes client branding, user access, and dashboard visibility; it explicitly supports hiding work-in-progress/test dashboards from clients.
- ManyRequests client view focuses on requests, invoices, services, users, storage, settings, and notifications, not internal agency task management.
- Analytics/reporting research recommends business-value summary first, 3-6 or 5-10 focused KPIs, narrative context, next actions, data freshness, source/confidence labels, and optional raw/source dashboards below the interpretation layer.
```

Sources:

```text
- Teamwork client users: https://support.teamwork.com/projects/using-teamwork/working-with-client-users
- Teamwork proofing: https://support.teamwork.com/projects/proofing/review-and-approve-proofs
- AgencyAnalytics Client Portal: https://help.agencyanalytics.com/en/articles/12558038-manage-the-client-experience-with-the-client-portal
- ManyRequests client view: https://help.manyrequests.com/en/articles/5440247-client-experience-and-client-view
- Client analytics dashboard recommendations: docs/research/client-analytics-dashboard-ui-recommendations.md
```

## 12. Final Product Statement

```text
The client portal is a Client Control Center.

It should help the client understand current status, agency work, blockers, required client actions, results, reports, dashboards, delivered assets, and decisions without exposing internal agency operations.

Reports & Dashboards is the proof-of-value area.
Performance analytics is the interpreted current-results layer.
External dashboards are source/detail views.
Monthly reports are narrative archives.
```
