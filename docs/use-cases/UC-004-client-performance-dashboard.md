# UC-004 - Client Performance Dashboard

## Document Status

```text
Document type: Use Case Specification
Product: Agency Client Portal Aggregator
Use case ID: UC-004
Use case name: Client Performance Dashboard
Version: v1.0
Status: MVP-planning-ready
Primary reference: Agency Client Portal Aggregator - MVP Scope & Development Reference
Related use cases: UC-001, UC-002, UC-003
Research reference: docs/research/client-analytics-dashboard-ui-recommendations.md
```

Source basis:

```text
- docs/project-brief.md
- docs/mvp-scope.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- docs/use-cases/UC-002-embedded-marketing-dashboard.md
- docs/use-cases/UC-003-monthly-summary-report-archive.md
- docs/research/client-analytics-dashboard-ui-recommendations.md
- User-provided research summaries about agency client analytics dashboards
```

Client Control Center IA relationship:

```text
UC-004 maps to Reports & Dashboards / Current Performance.
Current Performance should lead with interpreted business value before source dashboards or report archive detail.
Reference: docs/research/client-control-center-information-architecture.md
```

## 1. Purpose

UC-004 defines the client-facing performance analytics experience for the Agency Client Portal Aggregator.

The Client Performance Dashboard gives each client one focused dashboard where they can understand whether marketing work is producing business value.

The dashboard must answer:

```text
1. Did marketing make me money?
2. What did I get from the agency's work?
3. Is my money being used well?
4. Are we on track against agreed goals?
5. Which channels are driving outcomes?
6. Where are leads, sales, or revenue getting stuck?
7. Why did performance change?
8. What did the agency do this period?
9. What will the agency do next?
10. What does the agency need from me?
11. Can I trust the data?
```

This use case exists because UC-001 explains work status, UC-002 embeds external dashboards, and UC-003 explains monthly performance in report form, but the product still needs a native client-facing performance view that can be populated manually, imported from JSON, or later powered by integrations.

## 2. Product Context

The Agency Client Portal Aggregator is a client-facing aggregation and communication layer.

It is not a full BI tool, ad platform clone, CRM, reporting automation engine, or native attribution platform.

UC-004 introduces a native performance dashboard layer, but it must stay consistent with the broader product rule:

```text
The portal helps clients understand agency value.
It should not become a complex analytics platform before the MVP validates client-facing usefulness.
```

In the MVP, UC-004 supports:

```text
- manual analytics data entry
- JSON analytics data import
- client-facing dashboard rendering
- structured narrative around performance
- source labels and confidence labels
- source links to external dashboards
- relationship to current agency work, client blockers, and monthly reports
```

In later versions, UC-004 can support:

```text
- Google Ads integration
- Meta Ads integration
- GA4 integration
- Google Search Console integration
- CRM integrations
- email/SMS integrations
- Shopify / Stripe integrations
- call tracking integrations
- sync health monitoring
```

## 3. Use Case Name

```text
Client Performance Dashboard
```

## 4. One-Sentence Definition

```text
Client Performance Dashboard allows an agency to publish a clear client-facing business-value dashboard that combines outcome metrics, goals, trends, channel performance, narrative context, agency work, next steps, client blockers, and data trust signals.
```

## 5. Core Product Principle

The dashboard is not a raw metric dump.

The dashboard is a client decision surface.

Core principles:

```text
1. Lead with outcomes, not activity.
2. No number without narrative.
3. No bare numbers.
4. No silent staleness.
5. Trust is structural, not stylistic.
6. Executive summary first, detail later.
7. Client overview stays a status hub; performance dashboard becomes the deep analytics page.
```

## 6. Relationship To Existing Use Cases

## 6.1 Relationship To UC-001

UC-001 remains the Client Overview / Status Hub.

UC-004 does not replace UC-001.

UC-001 should show only a compact performance preview and link to the full Client Performance Dashboard.

UC-004 can reference or aggregate UC-001 data:

```text
- current status
- current focus
- client-visible tasks
- needed_from_client items
- latest client-visible update
```

Product rule:

```text
Do not duplicate UC-001 operational records inside UC-004 unless a frozen historical snapshot is explicitly required.
```

## 6.2 Relationship To UC-002

UC-002 remains the Embedded Marketing Dashboard use case.

UC-004 does not replace external dashboard embeds.

UC-004 can use UC-002 dashboard links as:

```text
- source links
- external dashboard links
- fallback links
- embedded supporting dashboard references
```

Product rule:

```text
UC-004 shows native/manual analytics blocks. UC-002 stores and displays external dashboard links.
```

## 6.3 Relationship To UC-003

UC-003 remains Monthly Summary / Report Archive.

UC-004 does not replace monthly summaries.

UC-004 can link to the latest published or archived report.

Product rule:

```text
Dashboard shows numbers and current performance.
Monthly summary explains the period in report form.
```

## 7. Primary Actors

## 7.1 agency_admin

The agency_admin owns the final client-facing performance dashboard.

Responsibilities:

```text
- create performance dashboard periods
- enter manual metrics
- import dashboard JSON
- edit executive summary and insights
- define goals and actuals
- define KPI cards
- define channel breakdown
- define funnel values
- define source links and attribution notes
- preview dashboard as client_user
- publish dashboard period
- archive or hide outdated periods
```

The agency_admin controls what becomes visible to the client.

## 7.2 agency_team

The agency_team contributes performance inputs and operational context.

Responsibilities:

```text
- prepare channel metrics
- validate source data
- provide insights about what changed
- provide activity updates
- provide next-step recommendations
- identify tracking caveats
- flag data confidence issues
```

The agency_team should not publish client-facing dashboard periods unless permission is explicitly granted.

## 7.3 client_user

The client_user consumes the performance dashboard.

Responsibilities:

```text
- view own performance dashboard
- understand business outcomes
- compare performance to goals
- review trends and channel performance
- read insights and next actions
- understand data freshness and source confidence
- open source dashboards or latest monthly reports if needed
- respond to needed-from-client actions through UC-001 workflows
```

The client_user must only see their own client data.

## 8. Client Questions The Dashboard Must Answer

| Client question | Dashboard section |
| --- | --- |
| Did marketing make me money? | Executive Summary / Hero Metric / Primary KPI Cards |
| What did I get? | Business Outcome Scoreboard |
| Is my money being used well? | Spend & Efficiency / Goals vs Actual / Channel Breakdown |
| Are we on track? | Goal Progress / Project Status / Data Confidence |
| Which channel works best? | Channel Breakdown / Cross-channel Comparison |
| Where are leads getting stuck? | Funnel View |
| Why did performance change? | What Changed / Insights / Chart Annotations |
| What did the agency do? | What We Did / Activity Log |
| What happens next? | Next Actions / Recommendations |
| What do you need from me? | Needed From Client / Client Blockers |
| Where is the source dashboard? | Source Links / Embedded Dashboard Links |
| Where is the latest report? | Latest Monthly Report Link |
| Can I trust this data? | Last Updated / Source / Data Mode / Data Confidence / Attribution Note |

## 9. Functional Scope

## 9.1 Must-Have For MVP

```text
- performance dashboard period data model
- manual dashboard data entry
- JSON dashboard data import
- draft / published / archived status model
- client-specific access rules
- client-facing performance dashboard page
- admin performance dashboard list
- admin performance dashboard editor
- preview as client
- executive summary block
- hero metric
- KPI cards
- goals vs actual
- primary trend chart
- funnel view
- channel breakdown
- insights / what changed
- what we did
- next actions / recommendations
- needed from client reference block
- source links / external dashboard links
- latest monthly report link
- data freshness, source, mode, confidence, and attribution note
```

## 9.2 Should-Have For MVP If Feasible

```text
- duplicate previous period
- publish validation checklist
- stale data warning
- JSON schema validation errors
- dashboard period selector
- service-type presets
- KPI definitions / tooltip text
- source labels per KPI
- benchmark fields per KPI
- appendix / drill-down tables
```

## 9.3 Later / Not Required First

```text
- native Google Ads integration
- native Meta Ads integration
- native GA4 integration
- native CRM integration
- native email/SMS integration
- native Google Search Console integration
- custom dashboard builder
- drag-and-drop dashboard layout editor
- attribution engine
- AI insights engine
- scheduled report delivery
- real-time sync
- multi-touch attribution modeling
- automated anomaly detection
- advanced benchmark library
```

## 10. Scope Boundary

Build:

```text
- a structured performance dashboard module
- manual and JSON-entered analytics periods
- client-facing dashboard rendering
- admin editing and publishing
- narrative requirements around analytics
- source and confidence labels
- links to UC-001, UC-002, and UC-003 information
```

Do not build first:

```text
- a BI platform
- raw ad platform clone
- full custom chart builder
- integration infrastructure
- attribution calculation engine
- automatic AI report writer
- real-time analytics system
```

## 11. Core Client Dashboard Layout

The client-facing dashboard should follow the research-backed "summary first, detail later" pattern.

Recommended order:

```text
1. Dashboard Header
2. Executive Summary
3. Hero Metric
4. Primary KPI Cards
5. Goals vs Actual
6. Primary Trend Chart
7. Funnel View
8. Channel Breakdown
9. What Changed / Insights
10. What We Did
11. Next Actions / Recommendations
12. Needed From Client
13. Source Links / External Dashboard Links
14. Latest Monthly Report
15. Appendix / Drill-down Tables
```

## 11.1 Dashboard Header

Required content:

```text
- client name
- reporting period
- last updated timestamp
- data mode: manual / json_import / embedded_dashboard / integration
- data confidence: high / medium / low / estimated
- account manager name if available
- attribution note if available
```

Purpose:

```text
- orient the client
- show freshness
- show data trust context
```

## 11.2 Executive Summary

Required content:

```text
- plain-language summary
- main win
- main issue
- next focus
- needed-from-client summary if relevant
```

Rule:

```text
The executive summary must be human-readable and client-facing.
```

## 11.3 Hero Metric

Required content:

```text
- metric label
- current value
- delta vs prior period
- goal progress if available
- status
```

Possible hero metric by business model:

```text
- e-commerce: revenue / ROAS / blended ROAS
- SaaS: MQL / SQL / pipeline / MRR
- local services: leads / calls / booked appointments / CPL
- lead generation: qualified leads / booked calls / pipeline value
- full-service: total marketing revenue / pipeline / blended ROAS
```

## 11.4 Primary KPI Cards

Required KPI card fields:

```text
- name
- value
- unit
- prior value or comparison
- delta absolute
- delta percent
- goal or benchmark
- status
- definition
- source label
```

MVP card count guidance:

```text
- default: 4-6 primary KPI cards
- maximum executive surface: 10 primary KPIs
- avoid more than 12 visible top-level KPIs
```

Default primary KPI candidates:

```text
- spend
- budget pacing
- leads
- qualified leads
- booked calls
- revenue attributed
- pipeline value
- CPL
- CPA
- CAC
- ROAS
- ROI
- conversion rate
```

## 11.5 Goals Vs Actual

Required content:

```text
- goal name
- target
- actual
- percent complete
- target date
- status
- note
```

Supported statuses:

```text
ahead
on_track
behind
```

Purpose:

```text
Answer whether the client is on track against agreed goals.
```

## 11.6 Primary Trend Chart

Required content:

```text
- metric name
- current period series
- comparison series if available
- granularity: daily / weekly / monthly
- annotations
- goal line if available
```

Purpose:

```text
Show whether the primary outcome is improving or declining over time.
```

## 11.7 Funnel View

Supported stages:

```text
spend
impressions
clicks
visitors
leads
qualified_leads
booked_calls
sales
revenue
```

Purpose:

```text
Show where leads, opportunities, or revenue are leaking.
```

## 11.8 Channel Breakdown

Supported channels:

```text
google_ads
meta_ads
seo
social
email_sms
direct
referral
other
```

Required content per channel:

```text
- channel
- spend if relevant
- leads
- qualified leads
- booked calls
- sales
- revenue
- CPL
- CPA
- ROAS
- conversion rate
- short summary / what changed
```

Purpose:

```text
Show which channels are producing outcomes.
```

## 11.9 Service-Specific Detail Sections

Supported service types:

```text
paid_ads
seo
social
email_sms
lead_generation
cro
full_service
```

Each service section should include:

```text
- service type
- summary
- 3-6 key metrics
- one trend chart or supporting visual
- one performance table if needed
- insights
- next actions
```

## 11.10 What Changed / Insights

Required insight fields:

```text
- title
- body
- severity: info / positive / warning
- chart reference if available
```

Purpose:

```text
Explain performance movement in plain client-facing language.
```

## 11.11 What We Did

Can reference UC-001 tasks and updates or accept manual dashboard-period entries.

Required categories:

```text
- completed
- active
- next
```

Purpose:

```text
Connect agency execution to performance outcomes.
```

## 11.12 Next Actions / Recommendations

Required fields:

```text
- title
- description
- owner
- due date
- priority
```

Purpose:

```text
Make the dashboard forward-looking.
```

## 11.13 Needed From Client

Should reference UC-001 needed_from_client records.

Rules:

```text
- show pending / answered / resolved where useful
- do not show cancelled items
- do not duplicate request records unless a historical snapshot is required
```

Purpose:

```text
Make client blockers visible near performance context.
```

## 11.14 Source Links / External Dashboard Links

Should reference UC-002 dashboard_links.

Required content:

```text
- dashboard name
- provider
- status
- public URL
- embed URL if available
- fallback message if unavailable
```

Purpose:

```text
Let the client open source dashboards when they need more detail.
```

## 11.15 Latest Monthly Report

Should reference UC-003 latest published or archived report.

Rules:

```text
- show latest published report if available
- show latest archived report if no published report exists and archive is valid
- never show draft or ready reports
```

Purpose:

```text
Connect dashboard numbers to the longer monthly narrative.
```

## 11.16 Appendix / Drill-Down Tables

Optional MVP content:

```text
- top campaigns
- top ads
- top pages
- top posts
- top keywords
- creative performance
- campaign performance
```

Rule:

```text
Do not place drill-down tables above executive summary, goals, trends, or core outcome metrics.
```

## 12. Admin Screens

## 12.1 Admin: Performance Dashboards List

Route:

```text
/admin/performance-dashboards
```

Purpose:

```text
Agency admin can manage dashboard periods across clients.
```

Required columns:

```text
- Client
- Dashboard / Period Title
- Reporting Period
- Status
- Data Mode
- Data Confidence
- Last Updated
- Published Date
- Actions
```

Required actions:

```text
- Create Dashboard Period
- Import JSON
- Edit
- Preview as Client
- Publish
- Archive
- Duplicate Previous Period
```

## 12.2 Admin: Create/Edit Performance Dashboard Period

Routes:

```text
/admin/performance-dashboards/new
/admin/performance-dashboards/:id/edit
```

Required editor sections:

```text
- Client and Period
- Data Trust
- Executive Summary
- Hero Metric
- KPI Cards
- Goals vs Actual
- Trend Series
- Funnel
- Channel Breakdown
- Service Sections
- Insights / What Changed
- Next Actions
- Source Links
- Latest Report Selection
- Appendix Tables
```

Required actions:

```text
- Save Draft
- Import JSON
- Validate
- Preview as Client
- Publish
- Archive
```

## 12.3 Admin: JSON Import

Purpose:

```text
Allow agency_admin to populate a dashboard period from a prepared JSON file or pasted JSON before integrations exist.
```

Required behavior:

```text
- accept pasted JSON
- validate schema
- show validation errors
- map values into dashboard period draft
- allow editing after import
- do not publish automatically
```

## 12.4 Client: Performance Dashboard

Route:

```text
/client/performance
```

Required sections:

```text
- Dashboard Header
- Executive Summary
- Hero Metric
- Primary KPI Cards
- Goals vs Actual
- Primary Trend Chart
- Funnel View
- Channel Breakdown
- Service-Specific Detail Sections
- What Changed / Insights
- What We Did
- Next Actions
- Needed From Client
- Source Links
- Latest Monthly Report
- Appendix / Drill-down
```

## 12.5 Client Overview Integration

Route:

```text
/client/overview
```

UC-001 overview should show a compact preview:

```text
- performance status
- hero metric or 2-3 primary KPIs
- last updated timestamp
- data confidence
- button: View Performance Dashboard
```

Product rule:

```text
The Client Overview must not become the full analytics screen.
```

## 13. Data Model

## 13.1 performance_dashboard_periods

Main object for one client-facing analytics period.

Required fields:

```text
id
client_id
title
period_start
period_end
status
data_mode
data_confidence
last_updated_at
published_at
created_at
updated_at
created_by
updated_by
```

Recommended extended fields:

```text
account_manager
agency_contact
attribution_note
source_summary
staleness_status
```

Status enum:

```text
draft
ready
published
archived
```

Data mode enum:

```text
manual
json_import
embedded_dashboard
integration
```

Data confidence enum:

```text
high
medium
low
estimated
```

## 13.2 performance_dashboard_content

Can be stored inline with performance_dashboard_periods for MVP localStorage, or separated later for backend normalization.

Suggested shape:

```json
{
  "executive_summary": {
    "narrative": "string",
    "main_win": "string",
    "main_issue": "string",
    "next_focus": "string"
  },
  "hero_metric": {
    "label": "string",
    "value": "number|string",
    "unit": "string",
    "delta_abs": "number|string",
    "delta_pct": "number",
    "goal_pct": "number",
    "status": "ahead | on_track | behind",
    "definition": "string",
    "source": "string"
  },
  "kpi_cards": [],
  "goals": [],
  "trends": [],
  "funnel": {},
  "channel_breakdown": [],
  "service_sections": [],
  "insights": [],
  "next_steps": [],
  "appendix_tables": []
}
```

## 13.3 kpi_card

```text
id
name
value
unit
prior_value
delta_abs
delta_pct
goal
benchmark
status
sparkline
definition
source
display_order
```

Status enum:

```text
ahead
on_track
behind
neutral
```

## 13.4 goal

```text
id
name
metric
target
actual
target_date
status
note
display_order
```

Status enum:

```text
ahead
on_track
behind
```

## 13.5 trend

```text
id
metric
granularity
series
comparison_series
goal_value
annotations
display_order
```

Granularity enum:

```text
daily
weekly
monthly
```

## 13.6 channel_breakdown_item

```text
id
channel
spend
leads
qualified_leads
booked_calls
sales
revenue
cpl
cpa
roas
conversion_rate
summary
display_order
```

Channel enum:

```text
google_ads
meta_ads
seo
social
email_sms
direct
referral
other
```

## 13.7 service_section

```text
id
service_type
summary
metrics
insights
next_actions
display_order
```

Service type enum:

```text
paid_ads
seo
social
email_sms
lead_generation
cro
full_service
```

## 13.8 insight

```text
id
title
body
severity
chart_ref
display_order
```

Severity enum:

```text
info
positive
warning
```

## 13.9 next_step

```text
id
title
description
owner
due_date
priority
display_order
```

Priority enum:

```text
low
medium
high
```

## 13.10 appendix_table

```text
id
title
columns
rows
display_order
```

## 14. Visibility Rules

## 14.1 Client Isolation

```text
client_user can only see performance_dashboard_periods where period.client_id = client_user.client_id
```

## 14.2 Status Visibility

```text
client_user can only see dashboard periods with status = published or archived
```

## 14.3 Draft Protection

```text
draft and ready dashboard periods are never visible to client_user
```

## 14.4 Internal Notes

```text
internal notes, raw agency QA notes, and unpublished validation errors are never visible to client_user
```

## 14.5 Source Link Protection

```text
client_user can only see source links that are client_visible and linked to their own client_id
```

## 14.6 Report Protection

```text
client_user can only see linked reports with status = published or archived
```

## 15. User Flow A - agency_admin Creates Manual Dashboard Period

Trigger:

```text
The agency needs to publish a client-facing performance dashboard for a reporting period.
```

Flow:

```text
1. agency_admin logs in.
2. agency_admin opens Performance Dashboards.
3. agency_admin clicks Create Dashboard Period.
4. agency_admin selects client.
5. agency_admin selects reporting period.
6. agency_admin sets data mode = manual.
7. agency_admin sets data confidence.
8. agency_admin writes executive summary.
9. agency_admin enters hero metric.
10. agency_admin enters KPI cards.
11. agency_admin enters goals vs actual.
12. agency_admin enters trend data.
13. agency_admin enters funnel values.
14. agency_admin enters channel breakdown.
15. agency_admin writes insights / what changed.
16. agency_admin writes next actions.
17. agency_admin selects source dashboard links if available.
18. agency_admin selects latest monthly report if available.
19. agency_admin validates the dashboard.
20. agency_admin previews as client.
21. agency_admin publishes.
22. client_user can see the dashboard.
```

Success state:

```text
The client can open the performance dashboard and understand outcomes, goals, trends, channels, insights, next actions, and data trust context.
```

## 16. User Flow B - agency_admin Imports Dashboard JSON

Trigger:

```text
The agency has prepared dashboard data as JSON.
```

Flow:

```text
1. agency_admin opens Performance Dashboards.
2. agency_admin clicks Import JSON.
3. agency_admin selects client and period.
4. agency_admin pastes or uploads JSON.
5. System validates JSON.
6. System shows validation errors if present.
7. agency_admin fixes JSON or imports valid data.
8. System creates or updates draft dashboard period.
9. agency_admin reviews mapped dashboard sections.
10. agency_admin edits narrative fields if needed.
11. agency_admin previews as client.
12. agency_admin publishes.
```

Important rule:

```text
JSON import must never publish automatically.
```

## 17. User Flow C - client_user Views Performance Dashboard

Trigger:

```text
Client wants to understand marketing performance.
```

Flow:

```text
1. client_user logs in.
2. client_user opens Client Overview.
3. client_user sees performance preview.
4. client_user clicks View Performance Dashboard.
5. client_user sees dashboard header and freshness.
6. client_user reads executive summary.
7. client_user reviews hero metric and KPI cards.
8. client_user checks goals vs actual.
9. client_user reviews trend and funnel.
10. client_user checks channel breakdown.
11. client_user reads insights and what changed.
12. client_user reviews what the agency did.
13. client_user reviews next actions.
14. client_user checks needed-from-client items.
15. client_user opens source dashboard or latest monthly report if needed.
```

Success state:

```text
The client understands whether marketing is producing business value and what happens next.
```

## 18. User Flow D - Data Is Stale Or Low Confidence

Trigger:

```text
Dashboard data is old, incomplete, manually estimated, or low confidence.
```

Flow:

```text
1. client_user opens Performance Dashboard.
2. System shows last updated timestamp.
3. System shows data confidence.
4. System shows data mode.
5. If stale or low confidence, System shows visible warning.
6. Source links or attribution notes explain the caveat.
```

Success state:

```text
Client sees controlled trust context instead of silently stale or questionable data.
```

## 19. Edge Cases

## 19.1 No Published Dashboard Period

Client sees:

```text
Performance dashboard is being prepared.
```

Optional content:

```text
Latest report or external dashboard link if available.
```

## 19.2 Draft Period Exists

Client sees:

```text
Latest published dashboard period.
```

If no published period exists, show the no published dashboard state.

Never show draft data.

## 19.3 Archived Periods Exist

Client may view archived periods if archive navigation exists.

Default dashboard should show latest published period.

## 19.4 No KPI Cards

Client sees an empty-state message:

```text
Performance metrics are being prepared.
```

But the admin publish validation should warn before publishing a dashboard with no KPI cards.

## 19.5 Missing Narrative

Admin validation should warn when:

```text
- executive summary is empty
- insights are empty
- next actions are empty
- channel summary is empty for active channels
```

Client should not receive a dashboard that is only numbers unless agency_admin intentionally overrides validation.

## 19.6 No Source Links

Client sees:

```text
Source dashboard links are not available yet.
```

## 19.7 Data Confidence Low

Client sees:

```text
Data confidence: Low
```

Also show attribution note or caveat if available.

## 19.8 Data Is Manually Entered

Client sees:

```text
Data mode: Manual
```

Manual data is acceptable in MVP, but it must not pretend to be live integration data.

## 19.9 JSON Import Invalid

Admin sees:

```text
JSON could not be imported.
```

Validation should identify missing or invalid fields.

## 19.10 Wrong Client Access

If client_user tries to access another client's dashboard:

```text
Access denied.
```

Do not reveal the other client's name or dashboard title.

## 20. Acceptance Criteria

UC-004 is complete when:

```text
1. agency_admin can create a performance dashboard period for a client.
2. agency_admin can enter reporting period metadata.
3. agency_admin can set data mode.
4. agency_admin can set data confidence.
5. agency_admin can add an attribution note.
6. agency_admin can write executive summary, main win, main issue, and next focus.
7. agency_admin can define a hero metric.
8. agency_admin can define KPI cards.
9. KPI cards support current value, delta, goal or benchmark, status, definition, and source.
10. agency_admin can define goals vs actual.
11. agency_admin can define trend data and annotations.
12. agency_admin can define funnel values.
13. agency_admin can define channel breakdown.
14. agency_admin can define service-specific sections.
15. agency_admin can define insights / what changed.
16. agency_admin can define next actions.
17. agency_admin can link source dashboards from UC-002.
18. agency_admin can link latest report from UC-003.
19. agency_admin can import dashboard JSON into a draft.
20. invalid JSON import shows validation errors.
21. JSON import never publishes automatically.
22. agency_admin can preview dashboard as client_user.
23. agency_admin can publish dashboard period.
24. client_user can see only published or archived dashboard periods for their own client.
25. client_user cannot see draft or ready dashboard periods.
26. client_user can see dashboard header with period, last updated, data mode, confidence, and attribution note.
27. client_user can read executive summary before detailed charts.
28. client_user can see hero metric and KPI cards above detailed sections.
29. client_user can see goals vs actual.
30. client_user can see trend, funnel, and channel breakdown.
31. client_user can see insights, what changed, what we did, and next actions.
32. client_user can see needed-from-client items without cancelled items.
33. client_user can open source dashboard links if available.
34. client_user can open latest monthly report if available.
35. stale or low-confidence data is visibly labeled.
36. Client Overview shows only a compact performance preview and link to the full dashboard.
37. The dashboard avoids raw platform data as the default top-level experience.
38. The dashboard answers whether marketing is creating business value and what happens next.
```

## 21. Build Order

## Step 1 - Product And Architecture

```text
- finalize UC-004 specification
- create implementation checklist
- define entity ownership and folder structure
- define route ownership
- define how UC-004 references UC-001/002/003 data
```

## Step 2 - Domain Model And Local Repository

```text
- create performance dashboard period model
- create validation helpers
- create localStorage repository adapter
- create seed data
- create domain service
- create client read model
- create admin editor read/write model
```

## Step 3 - Admin Management

```text
- performance dashboard list
- create/edit dashboard period
- JSON import
- validation errors
- preview as client
- publish/archive
```

## Step 4 - Client Performance Dashboard

```text
- client route
- dashboard header
- executive summary
- hero metric
- KPI cards
- goals
- trend
- funnel
- channel breakdown
- insights
- what we did
- next actions
- needed from client
- source links
- latest report
```

## Step 5 - Client Overview Integration

```text
- compact performance preview on UC-001 overview
- View Performance Dashboard action
- no full analytics inside overview
```

## Step 6 - QA And Acceptance

```text
- unit tests for model validation
- service tests for visibility rules
- repository tests for local persistence
- e2e tests for admin publish flow
- e2e tests for client view
- e2e tests for access denied
- e2e tests for draft hidden
- e2e tests for JSON import errors
```

## 22. What Not To Build Yet

Do not build in UC-004 MVP:

```text
- real-time data sync
- native ad platform connectors
- native CRM connectors
- AI-generated insights
- custom BI builder
- drag-and-drop dashboard builder
- advanced attribution engine
- multi-touch attribution
- automated alerts
- scheduled email delivery
- automated PDF generation
- benchmark marketplace
```

## 23. Product Risks

| Risk | Why it matters | MVP response |
| --- | --- | --- |
| Dashboard becomes metric overload | Client cannot identify what matters | Summary first, 4-6 KPI cards, appendix lower down |
| Dashboard leads with vanity metrics | Client questions agency value | Lead with outcomes and business value |
| Dashboard has numbers but no explanation | Client still asks follow-up questions | Require executive summary, insights, and next actions |
| Manual data looks fake or stale | Trust decreases | Show data mode, confidence, source, last updated |
| Draft leaks to client | Severe trust issue | Strict status visibility |
| UC-004 duplicates UC-001/002/003 data | Product becomes inconsistent | Reference related use-case data instead of copying records |
| External dashboard and native dashboard conflict | Client is confused | Use source labels, attribution notes, and dashboard links |
| Client misreads attribution | Revenue trust issue | Show attribution model and caveats |

## 24. Implementation Notes For AI / Developer

Build UC-004 as a native analytics module that starts with manual and JSON data.

Prioritize:

```text
- clean data model
- dashboard period lifecycle
- client isolation
- draft protection
- research-backed dashboard structure
- narrative fields
- data trust labels
- integration-ready abstractions
```

Avoid:

```text
- hardcoding a single service type
- creating one-off chart data structures
- duplicating UC-001 requests/tasks into analytics records
- duplicating UC-002 dashboard link records
- duplicating UC-003 report records
- building raw platform tables first
- building advanced integrations before the manual dashboard is useful
```

## 25. Final Product Behavior

When UC-004 is implemented correctly:

```text
agency_admin can create or import a performance dashboard period
agency_admin can add narrative context and data trust labels
agency_admin can preview and publish the dashboard
client_user can open a business-value dashboard
client_user sees outcomes before activity metrics
client_user sees goals, trends, funnel, channels, insights, agency work, next actions, blockers, and source links
client_user can trust what the data represents because freshness, source, confidence, and attribution are visible
```

## 26. Final Definition

```text
UC-004 Client Performance Dashboard is the native client-facing analytics surface of the Agency Client Portal Aggregator.

It gives clients a clear business-value scoreboard that explains outcomes, goals, trends, channel performance, funnel health, agency work, next actions, client blockers, source links, and data trust context without turning the portal into a full BI platform.
```
