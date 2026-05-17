# UC-003 - Monthly Summary / Report Archive

## Document Status

```text
Document type: Use Case Specification
Product: Agency Client Portal Aggregator
Use case ID: UC-003
Use case name: Monthly Summary / Report Archive
Version: v1.0
Status: MVP-ready
Primary reference: Agency Client Portal Aggregator - MVP Scope & Development Reference
Related use cases: UC-001, UC-002
```

Source basis:

```text
- docs/project-brief.md
- docs/mvp-scope.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- docs/use-cases/UC-002-embedded-marketing-dashboard.md
- User-provided UC-003 specification
```

Client Control Center IA relationship:

```text
UC-003 maps to Reports & Dashboards / Report Archive.
Published monthly summaries and reports live beside current performance and source dashboards.
Reference: docs/research/client-control-center-information-architecture.md
```

## 1. Purpose

UC-003 defines the product flow for Monthly Summary / Report Archive inside the Agency Client Portal Aggregator.

This use case exists because dashboards show numbers, but clients need a clear explanation of what happened, what it means, what the agency did, and what happens next.

This document covers only UC-003. UC-001 and UC-002 are documented separately.

## 2. Use Case Name

```text
Monthly Summary / Report Archive
```

## 3. Product Context

The Agency Client Portal Aggregator is a client-facing portal for marketing agencies.

The portal aggregates:

```text
- project progress
- client-visible tasks
- current agency work
- marketing dashboard embeds
- monthly summaries
- reports
- client blockers / needed actions
```

The product is not a full reporting platform, analytics platform, CRM, project management system, or BI tool.

The portal sits above external tools and gives the client one clean place to understand agency work, progress, results, blockers, needed actions, dashboards, and reports.

## 4. Why This Use Case Exists

A marketing client may see campaign metrics, charts, spend, leads, CPL, conversions, and traffic inside a dashboard, but still not understand:

```text
- whether the month was good or bad
- what the agency actually did
- what changed compared to the previous period
- what worked
- what did not work
- what the agency will do next
- what decision or action is needed from the client
```

UC-003 converts marketing activity and dashboard data into a clear client-facing narrative.

## 5. Core User Problem

The client asks:

```text
What happened this month?
What did you do?
What results did we get?
What worked?
What did not work?
What happens next?
What do you need from me?
Where is the dashboard or full report?
```

The agency needs a repeatable way to answer these questions every reporting period without rebuilding the report structure from scratch.

## 6. Product Goal

The goal is to let the agency publish a simple, structured monthly report inside the client portal.

The client should be able to open the report and understand:

```text
1. What the agency did.
2. What results were achieved.
3. What went well.
4. What problems or blockers appeared.
5. What the agency will do next.
6. What is needed from the client.
7. Where to find the dashboard or full PDF report.
```

## 7. Scope Boundary

Build:

```text
- report creation
- report draft state
- report publishing
- report archive
- report visibility by client
- report preview as client
- latest report block on client overview
- dashboard link inside report
- PDF/report link inside report
```

Do not build:

```text
- automatic AI report writer
- full report builder
- custom chart builder
- PDF generator
- scheduled email automation
- native Google Ads connector
- native Meta Ads connector
- GA4 connector
- real-time analytics
- advanced attribution
- multi-step approval workflow
```

## 8. Primary Roles

Use only the MVP roles:

```text
agency_admin
agency_team
client_user
```

## 9. Role Responsibilities

### 9.1 agency_admin

The agency admin owns the final client-facing report.

Can:

```text
- create monthly report
- edit report draft
- select client
- select reporting period
- write summary
- add what was done
- add results
- add wins
- add problems / blockers
- add next actions
- add client decisions needed
- add dashboard URL
- add PDF/report URL
- preview report as client
- publish report
- archive report
```

The agency admin controls what becomes client-facing.

### 9.2 agency_team

The agency team contributes internal inputs.

Can:

```text
- review completed work
- provide performance notes
- provide task updates
- identify blockers
- suggest next actions
- add internal notes for the report
```

The agency team should not directly publish client-facing reports in MVP.

### 9.3 client_user

The client reads the published report.

Can:

```text
- view latest published report
- view report archive
- open dashboard link
- open PDF/report link
- read summary, wins, problems, next actions, and needed actions
```

Cannot:

```text
- view draft reports
- view ready/internal reports
- edit reports
- see reports from another client
- see internal notes
```

## 10. Main Object

```text
Report
```

A report is a structured client-facing summary for a specific client and reporting period.

## 11. Report Fields

Required fields:

```text
id
client_id
period_start
period_end
status
summary
what_we_did
results
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

Recommended additional fields:

```text
title
created_by
reviewed_by
internal_notes
summary_preview
```

## 12. Report Statuses

Use a simple state model:

```text
draft
ready
published
archived
```

| Status | Meaning | Visible to client? |
| --- | --- | --- |
| `draft` | Report is being written | No |
| `ready` | Report is ready for final agency review | No |
| `published` | Report is visible to client | Yes |
| `archived` | Old report remains available in archive | Yes |

## 13. Status Rules

```text
draft reports are internal only
ready reports are internal only
published reports are client-visible
archived reports are client-visible in report archive
```

Important rule:

```text
Never expose draft or ready reports to client_user.
```

## 14. Report Template

Every report should follow the same stable structure:

```text
# Monthly Summary - [Month Year]

## Executive Summary
Short plain-language overview of the month.

## What We Did
- Work item 1
- Work item 2
- Work item 3

## Results
- Spend:
- Leads:
- CPL:
- Booked Calls:
- Conversion Rate:
- Revenue, if available:

## Wins
- Win 1
- Win 2

## Problems / Blockers
- Problem 1
- Problem 2

## Next Actions
- Action 1
- Action 2
- Action 3

## Needed From Client
- Decision / approval / access needed

## Dashboard
[Open dashboard]

## Full Report / PDF
[Open PDF]
```

The report template should remain stable so the agency can repeat the reporting process every month.

## 15. User Flow A - agency_admin Creates Monthly Report

Scenario:

```text
The month has ended. The agency wants to publish a client-facing monthly summary.
```

Flow:

```text
agency_admin logs in
-> opens Admin Dashboard
-> opens Reports
-> clicks "Create Monthly Report"
-> selects client
-> selects reporting period
-> adds dashboard link
-> adds PDF/report link if available
-> writes Executive Summary
-> fills What We Did
-> fills Results
-> fills Wins
-> fills Problems / Blockers
-> fills Next Actions
-> fills Needed From Client
-> saves report as draft
-> previews as client_user
-> marks report as ready or publishes directly
-> published report appears in Client Overview
-> published report appears in Report Archive
```

## 16. User Flow B - agency_team Provides Report Inputs

Scenario:

```text
The agency team needs to give context for the report.
```

Flow:

```text
agency_team logs in
-> opens assigned client/project
-> reviews completed tasks
-> reviews blockers
-> reviews dashboard metrics
-> adds internal report notes
-> suggests wins
-> suggests problems
-> suggests next actions
-> agency_admin reviews the inputs
-> agency_admin turns inputs into client-facing language
```

## 17. User Flow C - client_user Reads Monthly Report

Scenario:

```text
The client wants to understand the month's progress and results.
```

Flow:

```text
client_user logs in
-> opens Client Overview
-> sees Latest Monthly Summary
-> clicks "Read Report"
-> opens full report page
-> reads Executive Summary
-> reads What We Did
-> reads Results
-> reads Wins
-> reads Problems / Blockers
-> reads Next Actions
-> checks Needed From Client
-> opens Dashboard if needed
-> opens PDF if needed
```

## 18. Client Questions Mapped To Report Sections

| Client Question | Report Section |
| --- | --- |
| What did you do this month? | What We Did |
| What results did we get? | Results |
| What went well? | Wins |
| What went wrong? | Problems / Blockers |
| What will you do next? | Next Actions |
| What do you need from me? | Needed From Client |
| Where are the numbers? | Dashboard Link |
| Where is the formal report? | PDF / Report Link |

## 19. Full Lifecycle

```text
agency_team completes work during the month
-> agency_team provides internal report inputs
-> agency_admin creates monthly report draft
-> agency_admin writes client-facing summary
-> agency_admin adds dashboard/PDF links
-> agency_admin previews report as client_user
-> agency_admin publishes report
-> client_user sees report in Overview and Reports Archive
-> client_user reads report and understands results, next actions, and needed decisions
```

## 20. Required Screens

### 20.1 Admin: Report List

Path:

```text
/admin/reports
```

Purpose:

```text
Agency admin can view, filter, create, edit, publish, and archive reports.
```

Required columns:

```text
Client
Report Title
Period
Status
Published Date
Author
Actions
```

Required actions:

```text
Create Report
Edit Draft
Preview as Client
Publish
Archive
Duplicate Previous Report
```

### 20.2 Admin: Report Editor

Path:

```text
/admin/reports/:id/edit
```

Purpose:

```text
Agency admin writes and prepares the report.
```

Required fields:

```text
Client
Period Start
Period End
Status
Executive Summary
What We Did
Results
Wins
Problems / Blockers
Next Actions
Needed From Client
Dashboard URL
PDF URL
Internal Notes
```

Required actions:

```text
Save Draft
Mark Ready
Preview as Client
Publish
Archive
```

### 20.3 Client: Reports Archive

Path:

```text
/client/reports
```

Purpose:

```text
Client can view latest report and historical reports.
```

Required sections:

```text
Latest Report
Report Archive
Dashboard Links
PDF Links
```

Archive should sort reports by latest period first.

Client should only see:

```text
published reports
archived reports
```

### 20.4 Client: Single Report Page

Path:

```text
/client/reports/:id
```

Purpose:

```text
Client reads the full monthly summary.
```

Required sections:

```text
Report Title
Period
Executive Summary
What We Did
Results
Wins
Problems / Blockers
Next Actions
Needed From Client
Dashboard Link
PDF Link
```

### 20.5 Client Overview Block

Path:

```text
/client/overview
```

The Overview page should show only the latest published report preview.

Required block:

```text
Latest Monthly Summary
- Report title
- Period
- Short summary preview
- Button: Read Report
- Button: Open Dashboard
```

## 21. Visibility Rules

### 21.1 Client Isolation

```text
client_user can only see reports where report.client_id = client_user.client_id
```

### 21.2 Report Status Visibility

```text
client_user can only see reports with status = published or archived
```

### 21.3 Draft Protection

```text
draft and ready reports are never visible to client_user
```

### 21.4 Internal Notes

```text
internal_notes are never visible to client_user
```

### 21.5 Agency Admin Access

```text
agency_admin can view and manage all reports
```

## 22. Edge Cases

### 22.1 No Report Published Yet

Client sees:

```text
No monthly report has been published yet.
The first report will appear here after the reporting period ends.
```

### 22.2 Current Report Is Still Draft

Client sees previous published report.

Example:

```text
Latest published report: April 2026
May report: in preparation
```

### 22.3 Dashboard Exists But Report Is Not Ready

Client sees:

```text
Dashboard is available.
Monthly summary is being prepared.
```

### 22.4 PDF Is Not Available

Client sees:

```text
PDF version is not available yet.
View the summary inside the portal.
```

### 22.5 Client Action Is Needed

Report shows:

```text
Needed From Client:
- Approve new budget
- Confirm offer details
- Send missing assets
```

The same needed actions may also appear on the Client Overview page.

### 22.6 Bad Performance Month

Do not hide bad performance.

Use clear language.

Example:

```text
Performance declined this month mainly because lead quality dropped from Campaign A and landing page conversion rate decreased. Next month we will test a new offer angle and adjust audience targeting.
```

### 22.7 Report Was Published By Mistake

MVP option:

```text
agency_admin changes status back to draft or archived
```

Later option:

```text
version history
```

Do not build version history in MVP.

## 23. Admin QA Checklist Before Publishing

Before publishing a monthly report, `agency_admin` should check:

```text
1. Correct client selected.
2. Correct reporting period selected.
3. Summary is written in plain client-facing language.
4. Wins are specific.
5. Problems are clear but professionally framed.
6. Next actions are concrete.
7. Needed client decisions are visible.
8. Dashboard URL works.
9. PDF URL works if provided.
10. No internal notes are visible.
11. Draft preview looks correct as client_user.
12. Report status is changed to published only after review.
```

## 24. Acceptance Criteria

UC-003 is complete when:

```text
1. agency_admin can create a monthly report.
2. agency_admin can select client and reporting period.
3. agency_admin can save report as draft.
4. draft reports are not visible to client_user.
5. agency_admin can fill summary, wins, problems, next actions, and client decisions needed.
6. agency_admin can attach dashboard_url.
7. agency_admin can attach pdf_url.
8. agency_admin can preview report as client_user.
9. agency_admin can publish report.
10. published report appears in Client Overview as Latest Monthly Summary.
11. published report appears in Reports Archive.
12. client_user can open report.
13. client_user can only see reports for their own client_id.
14. archived reports remain accessible in archive.
15. client_user can understand what happened, why it matters, and what happens next.
```

## 25. What Not To Build Yet

Do not build in this use case:

```text
automatic AI report writer
auto-send before human approval
complex report builder
drag-and-drop report layout editor
chart editor
native PDF generator
advanced email automation
report comments
e-signature approval
multi-level report review workflow
scheduled report delivery
custom analytics calculations
```

## 26. Product Risks

| Risk | Why It Matters | MVP Solution |
| --- | --- | --- |
| Report becomes too long | Client will not read it | Use fixed sections and concise summary |
| Report is just copied metrics | No strategic value | Include wins, problems, next actions |
| Report has wrong numbers | Trust damage | Preview + QA before publish |
| Draft leaks to client | Severe communication issue | Strict status visibility |
| AI writes generic insights | Low client trust | Human-written summary first |
| Client ignores dashboard | Common problem | Summary explains key takeaways |
| Archive becomes messy | Client cannot find history | Sort by period and show latest first |

## 27. Implementation Notes For AI Builder

Build UC-003 as a self-contained report module.

Minimum required objects:

```text
reports
clients
profiles
```

Optional related objects:

```text
dashboard_links
needed_from_client
tasks
updates
```

The report module should not depend on native analytics integrations.

The report module should be usable even if the dashboard is only an external link.

The report module should be usable even if the PDF is not available.

The client-facing report must be readable without the dashboard.

## 28. Minimal Database Schema

```sql
reports (
  id uuid primary key,
  client_id uuid not null,
  title text,
  period_start date not null,
  period_end date not null,
  status text not null,
  summary text,
  what_we_did text,
  results text,
  wins text,
  problems text,
  next_actions text,
  client_decisions_needed text,
  dashboard_url text,
  pdf_url text,
  internal_notes text,
  created_by uuid,
  reviewed_by uuid,
  published_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
)
```

Recommended status constraint:

```sql
status in ('draft', 'ready', 'published', 'archived')
```

Recommended visibility rule:

```text
client_user can only read reports where:
reports.client_id = client_user.client_id
AND reports.status in ('published', 'archived')
```

## 29. Minimal UI Components

```text
ReportCard
ReportStatusBadge
ReportEditorForm
ReportArchiveList
ReportPreviewAsClient
LatestReportOverviewBlock
DashboardLinkButton
PDFLinkButton
```

## 30. Final Flow Summary

```text
agency_team provides work/performance inputs
-> agency_admin creates monthly report draft
-> agency_admin writes human summary and links dashboard/PDF
-> agency_admin previews and publishes report
-> client_user reads summary and opens dashboard if needed
-> client_user understands results, next actions, and needed decisions
```

## 31. Core Insight

```text
UC-003 is not "generate a PDF."

UC-003 is "turn marketing activity and dashboard numbers into a clear client-facing narrative."
```

The product should help the agency explain the month, not just store the report.

## 32. AI Implementation Checklist

Before implementing report features, verify:

```text
- Published/archived reports are the only reports visible to client_user.
- Draft/ready reports and internal_notes never render for client_user.
- Reports are sorted by latest reporting period first in archive views.
- Latest Monthly Summary on overview points to the latest published report only.
- Dashboard/PDF links are optional and have useful fallback states.
- Bad performance is communicated clearly, not hidden.
- Report content remains human-written in MVP; no automatic AI writer is required.
- The report page is readable without opening the dashboard.
```
