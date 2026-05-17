# UC-002 - Embedded Marketing Dashboard

## Document Status

```text
Document type: Use Case Specification
Product: Agency Client Portal Aggregator
Use case ID: UC-002
Use case name: Embedded Marketing Dashboard
Version: v1.0
Status: MVP-ready
Primary reference: Agency Client Portal Aggregator - MVP Scope & Development Reference
Depends on: UC-001 - Client Overview / Status Hub
```

Source basis:

```text
- docs/project-brief.md
- docs/mvp-scope.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- User-provided UC-002 specification
```

Client Control Center IA relationship:

```text
UC-002 maps to Reports & Dashboards / Source Dashboard.
The external dashboard embed/link is no longer a competing top-level client navigation item.
Reference: docs/research/client-control-center-information-architecture.md
```

## 0. Document Purpose

This document defines the product flow for UC-002: Embedded Marketing Dashboard inside the Agency Client Portal Aggregator.

This use case is part of a larger multi-use-case product. It should be implemented as a modular feature that connects to the broader portal but does not require future use cases to be completed first.

This document makes clear:

```text
- what the feature does
- what the feature does not do
- which user roles interact with it
- what screens are required
- what data model is needed
- what states and edge cases must be supported
- how to know when the use case is complete
```

## 1. Source Context

The broader product is a client-facing portal layer for marketing agencies. It aggregates project progress, client-visible tasks, current agency work, marketing dashboard embeds, monthly summaries, reports, and client-needed actions.

It sits above external tools and should not replace analytics platforms, CRMs, project management tools, or reporting tools in V1.

UC-002 implements the Marketing Dashboard Embed part of the MVP.

Core rule:

```text
The portal stores and displays dashboard links.
The portal does not calculate marketing analytics in V1.
```

## 2. Use Case Name

```text
Embedded Marketing Dashboard
```

## 3. One-Sentence Definition

```text
Embedded Marketing Dashboard allows an agency to safely show an external marketing dashboard inside the client portal without building a custom analytics platform in V1.
```

## 4. Use Case Summary

The Embedded Marketing Dashboard use case allows a marketing agency to display an external marketing dashboard inside the client portal.

The dashboard itself is created and maintained in an external tool such as:

```text
Looker Studio
AgencyAnalytics
Databox
Whatagraph
DashThis
Swydo
ReportGarden
Oviond
Custom dashboard
```

The portal does not build the dashboard.

The portal does not pull raw marketing data.

The portal does not calculate KPIs in V1.

The portal only stores, manages, displays, and safely exposes dashboard links to the correct client.

## 5. Core Product Principle

```text
External tools generate the dashboard.
The portal makes the dashboard visible inside the client relationship experience.
```

The purpose of this use case is not analytics creation.

The purpose is:

```text
- give the client one place to view marketing results
- avoid manually sending scattered dashboard links
- connect marketing performance visibility with project progress and monthly summaries
- avoid building a custom BI platform too early
```

## 6. Why This Use Case Exists

Clients want to see marketing performance.

Agencies usually manage performance data across many disconnected tools:

```text
Google Ads
Meta Ads
GA4
CRM / GHL
Google Sheets
Looker Studio
AgencyAnalytics
Databox
Other reporting tools
```

Without a portal, the client experience is fragmented:

```text
- dashboard link is sent in email
- monthly report is in Google Drive
- project progress is in chat
- blockers are in Slack / WhatsApp / email
- campaign data lives in a separate reporting tool
```

This use case solves one narrow problem:

```text
Make the current marketing dashboard accessible inside the client portal.
```

## 7. User Roles

UC-002 uses the MVP role model:

```text
agency_admin
agency_team
client_user
```

## 8. Role: agency_admin

The `agency_admin` is responsible for publishing the dashboard to the client portal.

Can do:

```text
- add dashboard link
- edit dashboard link
- select provider
- set dashboard status
- control visibility
- preview dashboard as client
- publish dashboard to client portal
- mark dashboard unavailable
- archive dashboard
```

Cannot ignore:

```text
- dashboard access permissions
- wrong client data risk
- broken iframe states
- fallback messages
- draft dashboard visibility
```

Main responsibility:

```text
Make sure the right client sees the right dashboard safely.
```

## 9. Role: agency_team

The `agency_team` is responsible for preparing or maintaining the dashboard externally.

Can do:

```text
- build dashboard in external tool
- update dashboard in external tool
- validate metrics
- check date ranges
- check source data
- report dashboard issues
- provide dashboard URL / embed URL to agency_admin
```

Should not do in MVP:

```text
- publish dashboard directly to client
- manage client access rules
- expose unfinished reports
- edit portal-level dashboard permissions
```

Main responsibility:

```text
Make sure the external dashboard is accurate and client-ready.
```

## 10. Role: client_user

The `client_user` views the dashboard.

Can do:

```text
- view own dashboard
- open full dashboard link
- view dashboard fallback state
- move from dashboard to latest monthly summary
```

Cannot do:

```text
- edit dashboard
- see dashboards of other clients
- access internal dashboard drafts
- change dashboard status
- change dashboard provider
```

Main responsibility:

```text
Understand marketing performance from inside the client portal.
```

## 11. Functional Scope

### 11.1 Must-Have

```text
- dashboard_links table
- admin dashboard link management
- provider selection
- embed_url field
- public_url field
- dashboard status
- client-specific access
- client dashboard page
- dashboard block on client overview
- iframe rendering
- fallback message if dashboard is unavailable
- open full dashboard button
- preview as client
```

### 11.2 Should-Have / Later

```text
- last_checked_at
- display_order
- show_on_overview toggle
- dashboard description
- dashboard_opened activity event
- dashboard health check
- multiple dashboards per client
```

### 11.3 Not In Scope For This Use Case

```text
- native Google Ads API connector
- native Meta Ads API connector
- GA4 connector
- GHL connector
- custom dashboard builder
- drag-and-drop widgets
- custom BI engine
- real-time analytics
- attribution modeling
- AI insight generation
- metric registry
- raw ad data storage
```

## 12. High-Level Flow

```text
agency_team builds dashboard externally
-> agency_team validates dashboard data
-> agency_team gives embed/public URL to agency_admin
-> agency_admin adds dashboard link to portal
-> agency_admin previews dashboard as client
-> agency_admin publishes dashboard
-> client_user views dashboard inside portal
-> client_user opens monthly summary for interpretation
```

## 13. Flow A - agency_team Prepares Dashboard Externally

### 13.1 Trigger

A client needs a marketing dashboard visible in the portal.

### 13.2 Actor

```text
agency_team
```

### 13.3 Preconditions

```text
- client exists in portal
- external dashboard/reporting tool exists
- dashboard is created or ready to be created externally
```

### 13.4 Flow

```text
agency_team opens external reporting tool
-> connects or verifies data sources externally
-> builds/updates marketing dashboard
-> checks that dashboard contains only this client's data
-> checks reporting period/date range
-> checks main metrics
-> checks dashboard readability
-> confirms dashboard is ready for client view
-> sends embed_url/public_url to agency_admin
```

### 13.5 Required Dashboard QA

```text
- dashboard loads
- correct client data is shown
- no other client data is visible
- date range is correct
- main KPIs are visible
- dashboard is not overloaded
- client can understand high-level results
```

### 13.6 Output

```text
validated external dashboard URL/embed URL
```

## 14. Flow B - agency_admin Adds Dashboard To Portal

### 14.1 Trigger

`agency_team` provides a dashboard URL/embed URL.

### 14.2 Actor

```text
agency_admin
```

### 14.3 Preconditions

```text
- client exists
- agency_admin has access to admin dashboard
- dashboard URL/embed URL is available
```

### 14.4 Flow

```text
agency_admin logs in
-> opens /admin/dashboard-links
-> clicks "Add Dashboard"
-> selects client
-> enters dashboard name
-> selects provider
-> pastes embed_url
-> pastes public_url
-> sets status = draft
-> optionally adds description
-> optionally adds fallback message
-> previews dashboard as client
-> confirms iframe loads correctly
-> confirms only client-specific data is shown
-> sets status = active
-> saves
-> dashboard becomes visible to client_user
```

### 14.5 Decisions

| Decision | Options |
| --- | --- |
| Provider | `looker_studio` / `agencyanalytics` / `databox` / `whatagraph` / `dashthis` / `swydo` / `reportgarden` / `oviond` / `custom` |
| Status | `draft` / `active` / `unavailable` / `archived` |
| Visibility | `internal` / `client_visible` |
| Overview placement | `show_on_overview = true` / `false` |
| Fallback | default fallback / custom fallback |

### 14.6 Output

```text
active client-visible dashboard link
```

## 15. Flow C - client_user Views Dashboard

### 15.1 Trigger

Client wants to see marketing results.

### 15.2 Actor

```text
client_user
```

### 15.3 Preconditions

```text
- client_user is logged in
- client_user belongs to the client_id connected to the dashboard
- dashboard status = active
- dashboard visibility = client_visible
```

### 15.4 Flow

```text
client_user logs in
-> opens /client/overview
-> sees Marketing Dashboard block
-> clicks "View Dashboard"
-> opens /client/dashboard
-> sees embedded dashboard
-> reviews main performance data
-> optionally clicks "Open full dashboard"
-> optionally opens latest monthly summary for explanation
```

### 15.5 Client Questions Answered

| Client question | Portal/dashboard answer |
| --- | --- |
| What are the results? | Embedded dashboard |
| How much did we spend? | Dashboard KPI |
| How many leads/conversions did we get? | Dashboard KPI |
| What is the cost per lead/conversion? | Dashboard KPI |
| Are results improving? | Dashboard trend |
| What does this mean? | Monthly summary |

### 15.6 Output

```text
client_user can see marketing performance inside the portal
```

## 16. Flow D - Dashboard Unavailable

### 16.1 Trigger

Dashboard does not load, external access breaks, or dashboard is not ready.

### 16.2 Actors

```text
client_user
agency_admin
agency_team
```

### 16.3 Flow

```text
dashboard fails to load
-> portal shows fallback state
-> client_user can click "Open full dashboard" if public_url exists
-> agency_admin can set status = unavailable
-> agency_team fixes external dashboard/access issue
-> agency_admin verifies fix
-> agency_admin sets status = active
```

### 16.4 Output

```text
client sees controlled fallback instead of broken/empty dashboard
```

## 17. Dashboard Statuses

```text
draft
active
unavailable
archived
```

| Status | Meaning | Visible to client? |
| --- | --- | --- |
| `draft` | Dashboard added but not ready | No |
| `active` | Dashboard is visible and working | Yes |
| `unavailable` | Dashboard exists but cannot currently be shown | Yes, fallback only |
| `archived` | Old dashboard, no longer primary | No by default |

## 18. Fallback States

### 18.1 Dashboard Not Ready

```text
Marketing dashboard is being prepared.
Expected availability: [date].
```

### 18.2 Access Issue

```text
Dashboard access needs to be updated.
Please contact your agency manager.
```

### 18.3 External Provider Issue

```text
Dashboard is temporarily unavailable.
The latest monthly summary is still available below.
```

### 18.4 No Campaign Data Yet

```text
No campaign data is available yet.
Data will appear after campaigns start running.
```

### 18.5 Iframe Blocked

```text
The embedded dashboard cannot be displayed here.
Open the full dashboard in a new tab.
```

## 19. Required Screens

### 19.1 Admin: Dashboard Links List

Route:

```text
/admin/dashboard-links
```

Purpose:

```text
Manage all dashboard links across clients.
```

Columns:

```text
Client
Dashboard Name
Provider
Status
Visible
Show on Overview
Last Checked
Actions
```

Actions:

```text
Add Dashboard
Edit
Preview as Client
Set Active
Set Unavailable
Archive
Delete
```

### 19.2 Admin: Add/Edit Dashboard Link

Routes:

```text
/admin/dashboard-links/new
/admin/dashboard-links/:id/edit
```

Fields:

```text
Client
Dashboard Name
Provider
Embed URL
Public URL
Status
Visibility
Show on Overview
Description
Fallback Message
Display Order
```

Required fields:

```text
client_id
name
provider
embed_url or public_url
status
```

### 19.3 Client: Dashboard Page

Route:

```text
/client/dashboard
```

Sections:

```text
Dashboard Title
Short Description
Embedded Dashboard
Open Full Dashboard Button
Latest Monthly Summary Link
Fallback State
```

### 19.4 Client: Overview Dashboard Block

Route:

```text
/client/overview
```

Block content:

```text
Marketing Dashboard
Status
Last updated / last checked
Short description
Button: View Dashboard
Button: Open Full Dashboard
```

Product rule:

```text
Do not make the Overview page a full analytics page.
The Overview page should point to the dashboard.
```

## 20. Data Model

### 20.1 Main Table

```text
dashboard_links
```

### 20.2 Required Fields

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

### 20.3 Recommended Extended Fields

```text
description
visibility
fallback_message
last_checked_at
display_order
show_on_overview
created_by
updated_by
```

### 20.4 Suggested Full Schema

```text
dashboard_links
- id
- client_id
- name
- provider
- embed_url
- public_url
- status
- visibility
- description
- fallback_message
- show_on_overview
- display_order
- last_checked_at
- created_by
- updated_by
- created_at
- updated_at
```

### 20.5 Provider Enum

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

### 20.6 Status Enum

```text
draft
active
unavailable
archived
```

### 20.7 Visibility Enum

```text
internal
client_visible
```

## 21. Access Rules

### 21.1 Client Isolation

```text
client_user can only access dashboard_links where dashboard_links.client_id = client_user.client_id
```

### 21.2 Agency Access

```text
agency_admin can access all dashboard_links
agency_team can access only assigned clients or assigned dashboards
client_user can only view active client_visible dashboards for their own client
```

### 21.3 Draft Protection

```text
dashboard_links.status = draft must never be visible to client_user
```

### 21.4 Archived Protection

```text
dashboard_links.status = archived should not appear as the primary client dashboard
```

### 21.5 External Access Warning

Portal access and external dashboard access are separate.

A client may have permission to view the portal but still fail to load a restricted external dashboard.

The product must support fallback and full dashboard link behavior.

## 22. Dashboard Content Guidelines

### 22.1 First Dashboard Should Be Executive-Level

Recommended sections:

```text
Spend
Impressions
Clicks
Leads / Conversions
CPL / CPA
Conversion Rate
Campaign Performance Table
Trend Over Time
Source / Campaign Breakdown
```

### 22.2 Avoid In MVP

```text
too many filters
raw GA4 event tables
audience breakdown overload
technical attribution reports
15-page dashboards
unexplained charts
```

### 22.3 Product Rule

```text
Dashboard shows numbers.
Monthly summary explains numbers.
```

## 23. QA Checklist Before Publishing Dashboard

`agency_admin` or `agency_team` must verify:

```text
1. Dashboard loads inside portal.
2. Dashboard loads in client-like access mode.
3. Dashboard shows only the correct client's data.
4. Date range is correct.
5. Main KPIs are visible above the fold.
6. Dashboard is not overloaded.
7. No draft/internal pages are visible.
8. Full dashboard link works.
9. Fallback message exists.
10. Latest monthly summary is linked.
11. Client can understand dashboard without training.
```

## 24. Acceptance Criteria

UC-002 is complete when:

```text
1. agency_admin can add a dashboard link for a client.
2. agency_admin can select dashboard provider.
3. agency_admin can save embed_url.
4. agency_admin can save public_url.
5. agency_admin can set dashboard status.
6. agency_admin can mark dashboard as visible on overview.
7. agency_admin can preview dashboard as client_user.
8. client_user can see only dashboards linked to their own client_id.
9. active dashboard renders on /client/dashboard.
10. dashboard block appears on /client/overview.
11. client_user can open full dashboard in a new tab.
12. draft dashboard is not visible to client_user.
13. archived dashboard is not shown as primary dashboard.
14. unavailable dashboard shows fallback message.
15. iframe failure does not create a broken blank page.
16. dashboard page links to latest monthly summary.
17. no dashboard exposes another client's data.
```

## 25. Edge Cases

### 25.1 Dashboard Exists But No embed_url

Use `public_url` only.

Client sees:

```text
Open full dashboard
```

No iframe should render.

### 25.2 Dashboard Has embed_url But Iframe Fails

Show fallback:

```text
The embedded dashboard cannot be displayed here.
Open the full dashboard in a new tab.
```

### 25.3 Dashboard Is Not Ready

Status:

```text
draft
```

Client sees nothing.

Optional placeholder:

```text
Marketing dashboard is being prepared.
```

Only show placeholder if `agency_admin` intentionally enables it.

### 25.4 Dashboard Has No Data Yet

Status remains:

```text
active
```

Client sees:

```text
No campaign data is available yet.
Data will appear after campaigns start running.
```

### 25.5 Multiple Dashboards Exist

MVP behavior:

```text
show one primary dashboard
archive or hide the rest
```

V2 behavior:

```text
support dashboard tabs or ordered list
```

### 25.6 Client Accesses Another Dashboard URL

Return:

```text
Access denied
```

Do not reveal other client names or dashboard names.

## 26. Build Order For This Use Case

### Step 1 - Database

Build:

```text
dashboard_links table
provider enum
status enum
visibility field
client_id relationship
```

### Step 2 - Admin CRUD

Build:

```text
/admin/dashboard-links
add/edit dashboard link
select client
select provider
set status
save embed_url/public_url
```

### Step 3 - Access Control

Build:

```text
client_user can only see own client dashboard links
draft dashboards hidden
archived dashboards hidden by default
```

### Step 4 - Client Dashboard Page

Build:

```text
/client/dashboard
iframe renderer
open full dashboard button
fallback state
```

### Step 5 - Overview Integration

Build:

```text
dashboard block on /client/overview
show dashboard status
view dashboard button
open full dashboard button
```

### Step 6 - QA / Preview

Build:

```text
preview as client
status switching
fallback test
```

## 27. Do Not Build First

```text
Google Ads API connector
Meta Ads API connector
GA4 connector
GHL connector
custom dashboard builder
custom chart components
custom attribution
real-time analytics
AI dashboard summary
multi-client benchmark reports
dashboard template marketplace
```

## 28. Relationship To Other Use Cases

Depends on:

```text
UC-001 - Client Overview / Status Hub
```

The dashboard appears as a block inside the overview page.

Enables:

```text
UC-003 - Monthly Summary / Report Archive
```

The dashboard provides numbers.

The monthly summary explains what those numbers mean.

Later connected use cases:

```text
Client Activity Tracking
Dashboard Opened Event
Automated Monthly Report
Lead Quality Feedback
Native Data Connectors
Alerts / Data Source Health
```

## 29. Product Risk Notes

| Risk | Why it matters | MVP response |
| --- | --- | --- |
| Dashboard does not load | Client sees broken portal | fallback + open full dashboard |
| Wrong client data exposed | Critical trust/security failure | client isolation + QA checklist |
| Dashboard too complex | Client gets confused | simple executive dashboard first |
| No explanation | Client misreads data | link monthly summary |
| External access breaks | Portal cannot control provider permissions | status unavailable + fallback |
| Scope creep into BI | Product becomes too complex | embed only in V1 |

## 30. Final Product Behavior

When UC-002 is implemented correctly:

```text
agency_team prepares the dashboard externally
agency_admin publishes it safely inside the portal
client_user views marketing performance inside the portal
client_user can open the full dashboard if needed
client_user can move from dashboard to monthly summary for interpretation
the portal never exposes other clients' data
the portal never tries to become a BI platform in V1
```

## 31. AI Implementation Checklist

Before implementing dashboard embed features, verify:

```text
- The portal stores and displays links; it does not calculate analytics.
- Client users see only active, client_visible dashboards for their own client_id.
- Draft and archived dashboards are hidden from client_user by default.
- Unavailable dashboards render a controlled fallback, not an empty iframe.
- If embed_url is missing or blocked, public_url remains usable.
- The overview block points to the dashboard and does not become a full analytics page.
- Dashboard publishing includes preview-as-client and wrong-client-data QA.
- The dashboard page links to the latest monthly summary for interpretation.
```
