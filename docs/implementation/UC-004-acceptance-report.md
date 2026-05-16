# UC-004 Acceptance Report - Client Performance Dashboard

```text
Document type: Acceptance Report
Product: Agency Client Portal Aggregator
Use case ID: UC-004
Use case name: Client Performance Dashboard
Status: Frontend/localStorage MVP implemented
Last verified: 2026-05-16
```

## Scope Verified

UC-004 is implemented as a frontend MVP with localStorage-backed repositories.

The current implementation supports:

```text
- agency_admin performance dashboard management
- draft / published / archived lifecycle
- manual editor sections
- JSON import as draft
- campaign execution dashboard rendering
- client-facing performance page
- client overview performance preview
- client isolation and draft protection in domain services
- published/archived period navigation on the client page
```

## Acceptance Criteria

| # | Criterion | Status | Notes |
| --- | --- | --- | --- |
| 1 | agency_admin can create a performance dashboard period for a client. | Done | Admin list supports creation. |
| 2 | agency_admin can enter reporting period metadata. | Done | Client, title, start/end, source, attribution are editable. |
| 3 | agency_admin can set data mode. | Done | Manual, JSON import, embedded, integration modes exist. |
| 4 | agency_admin can set data confidence. | Done | High, medium, low, estimated are supported. |
| 5 | agency_admin can add an attribution note. | Done | Visible in data trust strip. |
| 6 | agency_admin can write executive summary, main win, main issue, and next focus. | Done | Editor and client rendering support all fields. |
| 7 | agency_admin can define a hero metric. | Done | Hero metric is required before publish. |
| 8 | agency_admin can define KPI cards. | Done | KPI cards render on client dashboard. |
| 9 | KPI cards support value, delta, goal/benchmark, status, definition, and source. | Done | Normalized model supports these fields. |
| 10 | agency_admin can define goals vs actual. | Done | Goals render with progress. |
| 11 | agency_admin can define trend data and annotations. | Done | Trend series, comparison series, and annotations are editable and rendered. |
| 12 | agency_admin can define funnel values. | Done | Funnel renders as a staged progress view. |
| 13 | agency_admin can define channel breakdown. | Done | Channel section supports spend, leads, revenue, CPL, ROAS, and summary. |
| 14 | agency_admin can define service-specific sections. | Done | Service metrics, insights, and next actions are editable and rendered. |
| 15 | agency_admin can define insights / what changed. | Done | Insights render as narrative cards. |
| 16 | agency_admin can define next actions. | Done | Next actions render with owner, due date, and priority. |
| 17 | agency_admin can link source dashboards from UC-002. | Done | Client page reads client-visible dashboard links from UC-002 records. |
| 18 | agency_admin can link latest report from UC-003. | Done | Client page reads latest visible report from UC-003 records. |
| 19 | agency_admin can import dashboard JSON into a draft. | Done | JSON import modal saves imported data as draft. |
| 20 | invalid JSON import shows validation errors. | Done | Invalid JSON remains in modal with error messages. |
| 21 | JSON import never publishes automatically. | Done | Imported records are forced to draft. |
| 22 | agency_admin can preview dashboard as client_user. | Done | Admin preview route supports draft preview. |
| 23 | agency_admin can publish dashboard period. | Done | Publish runs validation first. |
| 24 | client_user can see only published or archived dashboard periods for their own client. | Done | Enforced by client read service. |
| 25 | client_user cannot see draft or ready dashboard periods. | Done | Draft/ready are hidden from client mode. |
| 26 | client_user can see dashboard header with period, last updated, data mode, confidence, and attribution note. | Done | Context bar and trust strip expose these fields. |
| 27 | client_user can read executive summary before detailed charts. | Done | Executive summary and hero metric lead the page. |
| 28 | client_user can see hero metric and KPI cards above detailed sections. | Done | KPI section appears before campaign/trends/funnel details. |
| 29 | client_user can see goals vs actual. | Done | Goals section renders when data exists. |
| 30 | client_user can see trend, funnel, and channel breakdown. | Done | All three sections are implemented. |
| 31 | client_user can see insights, what changed, what we did, and next actions. | Partial | Insights and next actions are implemented. "What we did" is still represented indirectly through service sections and UC-001 references; a dedicated block is deferred. |
| 32 | client_user can see needed-from-client items without cancelled items. | Done | Reads UC-001 source records with visibility filtering. |
| 33 | client_user can open source dashboard links if available. | Done | Source link buttons render from UC-002 links. |
| 34 | client_user can open latest monthly report if available. | Done | Latest report link renders from UC-003 reports. |
| 35 | stale or low-confidence data is visibly labeled. | Partial | Low/estimated confidence is visible. Automatic stale-data detection is deferred. |
| 36 | Client Overview shows only a compact performance preview and link to the full dashboard. | Done | Overview block avoids full analytics. |
| 37 | The dashboard avoids raw platform data as the default top-level experience. | Done | Page leads with summary, hero metric, KPIs, and narrative. |
| 38 | The dashboard answers whether marketing is creating business value and what happens next. | Done | Supported by hero metric, KPIs, goals, insights, and next actions. |

## Campaign Execution Dashboard

The screenshot-style campaign execution dashboard is implemented as `content.campaign_execution`.

It supports:

```text
- top KPI strip
- campaign tracks
- stacked outreach bars
- cumulative bookings projection line
- planning assumptions
```

Primary implementation files:

```text
src/shared/charts/StackedBarLineChart.jsx
src/pages/client/performance/ClientPerformancePage.jsx
src/entities/performance-dashboard/model.js
docs/implementation/UC-004-json-import-contract.md
```

## Verified Tests

Latest local verification:

```text
npm run lint
npm test -- --run
npx playwright test e2e/uc004.spec.js
npx playwright test
npm run build
```

Results:

```text
Unit tests: 132 passed
Lint: passed
Full e2e: 20 passed
Build: passed
```

Build note:

```text
Vite reports the existing large chunk warning. This is not a UC-004 functional failure.
```

## Frontend/localStorage Limitations

The current implementation is intentionally not backend-backed.

Known limitations:

```text
- no server-side access enforcement
- no real database persistence
- no real integration sync
- no scheduled refresh
- no server-side JSON schema validation
- no dashboard version history
- no automated stale-data monitor
- no integration health checks
```

The business logic is still kept behind repositories and domain services so a backend adapter can replace localStorage later.

## Deferred For Backend / Integration Phase

Deferred items:

```text
- native Google Ads connector
- native Meta Ads connector
- native GA4 connector
- CRM / GHL / HubSpot / Salesforce connectors
- email/SMS platform connectors
- call tracking connectors
- server-side RLS or equivalent authorization
- automatic stale-data warnings
- historical dashboard versioning
- integration status and sync health
```

## Remaining Frontend Polish

Recommended before moving deeply into integrations:

```text
1. Add a dedicated "What We Did" block that references UC-001 completed client-visible work.
2. Add explicit stale-data warning logic based on last_updated_at.
3. Add admin-side help link to the JSON contract document.
4. Review responsive layout of campaign execution chart on narrow screens.
5. Decide if archived periods should be a selector only or a richer archive list.
```

## Delivery Summary

UC-004 is usable as a frontend/localStorage MVP.

The dashboard can now be created, imported, reviewed, published, viewed by the client, linked from overview, and used for campaign execution planning dashboards while preserving backend-ready architecture.
