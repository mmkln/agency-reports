# UC-004 Implementation Checklist - Client Performance Dashboard

```text
Document type: Implementation Checklist
Product: Agency Client Portal Aggregator
Use case ID: UC-004
Use case name: Client Performance Dashboard
Status: Ready for implementation planning
Primary use case spec: docs/use-cases/UC-004-client-performance-dashboard.md
Research reference: docs/research/client-analytics-dashboard-ui-recommendations.md
```

## Implementation Rule

Before implementing any UC-004 screen, service, entity, or UI block, read:

```text
1. docs/use-cases/UC-004-client-performance-dashboard.md
2. docs/research/client-analytics-dashboard-ui-recommendations.md
3. docs/frontend-architecture.md
4. docs/design/README.md
```

UC-004 must not duplicate UC-001, UC-002, or UC-003 source records.

It should reference or aggregate:

```text
- UC-001: current status, tasks, needed-from-client, agency work
- UC-002: dashboard/source links
- UC-003: latest monthly report
```

## Stage 1 - Architecture And Data Contract

**Goal:** Define the UC-004 domain model, enums, validation boundaries, JSON contract, and ownership before UI work starts.

**Result:** The project has an implementation-ready analytics dashboard data contract that supports manual data, JSON import, and future integrations.

### Tasks

- [x] Read UC-004 spec and dashboard UI research reference.
- [x] Define entity ownership for `performance_dashboard_period`.
- [x] Decide file/folder placement according to frontend architecture.
- [x] Create or document the route ownership for:
  - [x] admin performance dashboard list
  - [x] admin performance dashboard editor
  - [x] client performance dashboard
  - [ ] client overview performance preview
- [x] Define status enum:
  - [x] `draft`
  - [x] `ready`
  - [x] `published`
  - [x] `archived`
- [x] Define data mode enum:
  - [x] `manual`
  - [x] `json_import`
  - [x] `embedded_dashboard`
  - [x] `integration`
- [x] Define data confidence enum:
  - [x] `high`
  - [x] `medium`
  - [x] `low`
  - [x] `estimated`
- [x] Define KPI status enum:
  - [x] `ahead`
  - [x] `on_track`
  - [x] `behind`
  - [x] `neutral`
- [x] Define goal status enum:
  - [x] `ahead`
  - [x] `on_track`
  - [x] `behind`
- [x] Define channel enum:
  - [x] `google_ads`
  - [x] `meta_ads`
  - [x] `seo`
  - [x] `social`
  - [x] `email_sms`
  - [x] `direct`
  - [x] `referral`
  - [x] `other`
- [x] Define service type enum:
  - [x] `paid_ads`
  - [x] `seo`
  - [x] `social`
  - [x] `email_sms`
  - [x] `lead_generation`
  - [x] `cro`
  - [x] `full_service`
- [x] Define insight severity enum:
  - [x] `info`
  - [x] `positive`
  - [x] `warning`
- [x] Define next step priority enum:
  - [x] `low`
  - [x] `medium`
  - [x] `high`
- [x] Define `performance_dashboard_period` fields:
  - [x] `id`
  - [x] `client_id`
  - [x] `title`
  - [x] `period_start`
  - [x] `period_end`
  - [x] `status`
  - [x] `data_mode`
  - [x] `data_confidence`
  - [x] `last_updated_at`
  - [x] `published_at`
  - [x] `created_at`
  - [x] `updated_at`
  - [x] `created_by`
  - [x] `updated_by`
  - [x] `account_manager`
  - [x] `agency_contact`
  - [x] `attribution_note`
  - [x] `source_summary`
- [x] Define `performance_dashboard_content` structure:
  - [x] executive summary
  - [x] hero metric
  - [x] KPI cards
  - [x] goals
  - [x] trends
  - [x] funnel
  - [x] channel breakdown
  - [x] service sections
  - [x] insights
  - [x] next steps
  - [x] appendix tables
- [x] Define JSON import shape.
- [x] Document JSON import contract in `docs/implementation/UC-004-json-import-contract.md`.
- [x] Define validation rules for required fields.
- [x] Define publish validation rules:
  - [x] period metadata exists
  - [x] executive summary exists
  - [x] hero metric exists
  - [x] KPI cards exist
  - [x] at least one narrative insight exists
  - [x] data confidence exists
  - [x] last updated timestamp exists
- [x] Define soft validation warnings:
  - [ ] no source links
  - [ ] no latest report
  - [ ] no funnel
  - [x] no channel breakdown
  - [x] low data confidence
  - [x] stale data
- [x] Define client visibility policy:
  - [x] client can only see own client_id
  - [x] client can only see `published` or `archived`
  - [x] client cannot see `draft` or `ready`
- [x] Define admin visibility policy.
- [x] Define how Client Overview links to UC-004 without becoming the analytics screen.

### Completion Criteria

- [x] Data contract is documented or implemented in entity model files.
- [x] Enums are centralized.
- [x] Validation shape is defined.
- [x] JSON import schema is defined.
- [x] UC-001/002/003 relationship rules are clear.

## Stage 2 - Local Repository And Domain Services

**Goal:** Implement localStorage-backed persistence and domain services in a backend-ready way.

**Result:** UC-004 can create, read, update, publish, archive, and validate dashboard periods without UI depending on browser storage details.

### Tasks

- [x] Create repository contract for performance dashboard periods.
- [x] Implement localStorage adapter.
- [x] Add storage schema/version handling if needed.
- [x] Add seed data for at least:
  - [x] one published dashboard period
  - [x] one draft dashboard period
  - [x] one archived dashboard period
  - [x] one dashboard for access-denied testing
- [x] Create admin domain service:
  - [x] list dashboard periods
  - [x] get dashboard period
  - [x] create dashboard period
  - [x] update dashboard period
  - [x] save draft
  - [x] publish period
  - [x] archive period
  - [x] duplicate previous period
  - [x] validate period
- [x] Create client domain service:
  - [x] get latest published dashboard period
  - [x] get archived periods
  - [x] get dashboard period by id
  - [x] enforce client isolation
  - [x] hide draft/ready periods
- [x] Create read model for client dashboard page.
- [x] Create read model for client overview performance preview.
- [x] Create read model for admin list.
- [x] Create read model for admin editor.
- [x] Create selectors or helpers for:
  - [x] latest source links from UC-002
  - [x] latest report from UC-003
  - [x] active needed-from-client from UC-001
  - [ ] agency work summaries from UC-001 if needed
- [x] Add unit tests for validation helpers.
- [x] Add service tests for visibility rules.
- [x] Add repository tests for persistence.

### Completion Criteria

- [x] UC-004 services work without React components.
- [x] No page component reads localStorage directly.
- [x] Client isolation is enforced in service layer.
- [x] Draft and ready records are hidden from client read services.
- [x] Seeded demo data supports client and admin flows.

## Stage 3 - Admin Performance Dashboard Periods

**Goal:** Build admin management for dashboard periods.

**Result:** agency_admin can create, edit, preview, publish, archive, and duplicate dashboard periods.

### Tasks

- [x] Add route metadata for admin performance dashboards.
- [x] Add admin performance dashboards page.
- [x] Use canonical app shell and page header.
- [x] Build dashboard periods table/list with columns:
  - [x] client
  - [x] title
  - [x] reporting period
  - [x] status
  - [x] data mode
  - [x] data confidence
  - [x] last updated
  - [x] published date
  - [x] actions
- [x] Add create dashboard period action.
- [x] Add edit dashboard period action.
- [x] Add preview as client action.
- [x] Add publish action.
- [x] Add archive action.
- [x] Add duplicate previous period action.
- [x] Add loading state.
- [x] Add empty state.
- [x] Add access denied/admin-only behavior if existing app patterns require it.
- [x] Build admin editor shell.
- [x] Add editor sections:
  - [x] Client and Period
  - [x] Data Trust
  - [x] Executive Summary
  - [x] Hero Metric
  - [x] KPI Cards
  - [x] Goals vs Actual
  - [x] Trend Series
  - [x] Funnel
  - [x] Channel Breakdown
  - [x] Service Sections
  - [x] Insights / What Changed
  - [x] Next Actions
  - [ ] Source Links
  - [ ] Latest Report
  - [x] Appendix Tables
- [x] Add save draft.
- [x] Add publish validation.
- [x] Add validation error display.
- [x] Add validation warning display.
- [ ] Keep editor sections manageable with progressive disclosure where appropriate.
- [x] Prevent accidental client exposure of drafts.
- [x] Add tests for admin service and route flows.

### Completion Criteria

- [x] agency_admin can create and edit dashboard periods.
- [x] agency_admin can save drafts.
- [x] agency_admin can publish valid periods.
- [x] agency_admin can archive periods.
- [x] agency_admin can preview as client.
- [x] Editor does not mix unrelated access/report/task management into the analytics editor.

## Stage 4 - JSON Import

**Goal:** Allow dashboard periods to be populated from prepared JSON before integrations exist.

**Result:** agency_admin can paste/import JSON, validate it, convert it into a draft, edit it, and publish only after review.

### Tasks

- [x] Define JSON import UI entry point.
- [x] Build import modal or page using project overlay patterns.
- [x] Add JSON paste input.
- [x] Add example JSON or schema reference link.
- [x] Add campaign execution JSON example for reactivation-style dashboards.
- [x] Parse JSON safely.
- [x] Validate required fields.
- [x] Show field-level or path-level validation errors.
- [x] Map valid JSON into dashboard period draft.
- [x] Preserve imported `data_mode = json_import`.
- [x] Preserve imported `last_updated_at`.
- [x] Preserve imported `data_confidence`.
- [x] Never publish automatically after import.
- [x] Allow editing after import.
- [x] Add invalid JSON state.
- [x] Add partial/missing data warning state.
- [x] Add tests:
  - [x] valid JSON imports
  - [x] invalid JSON fails
  - [x] missing required fields show errors
  - [x] import creates draft only

### Completion Criteria

- [x] JSON import creates or updates a draft.
- [x] Invalid JSON cannot corrupt existing data.
- [x] Publish remains an explicit admin action.
- [x] Validation errors are understandable.

## Stage 5 - Client Performance Dashboard

**Goal:** Build the client-facing dashboard according to UC-004 and the research UI reference.

**Result:** client_user can open a published dashboard and understand business value, goals, trends, channels, insights, agency work, next actions, blockers, and data trust.

### Tasks

- [x] Add client performance route.
- [x] Add route link from app/client navigation where appropriate.
- [ ] Build dashboard loading state.
- [x] Build access denied state.
- [x] Build no published dashboard state.
- [x] Build dashboard header:
  - [x] client name
  - [x] reporting period
  - [x] last updated
  - [x] data mode
  - [x] data confidence
  - [x] account manager
  - [x] attribution note
- [ ] Build executive summary block:
  - [x] summary narrative
  - [x] main win
  - [x] main issue
  - [x] next focus
- [x] Build hero metric block.
- [x] Build primary KPI cards.
- [x] Build goals vs actual section.
- [x] Build primary trend chart.
- [x] Build funnel view.
- [x] Build channel breakdown section.
- [x] Build service-specific sections.
- [x] Build insights / what changed section.
- [x] Build what we did section.
- [x] Build next actions / recommendations section.
- [x] Build needed-from-client section using UC-001 source records.
- [x] Build source links section using UC-002 dashboard links.
- [x] Build latest monthly report section using UC-003 reports.
- [x] Build appendix / drill-down section.
- [x] Ensure summary appears before details.
- [x] Ensure vanity/secondary metrics do not dominate the top-level view.
- [x] Ensure data freshness/confidence is visible.
- [x] Ensure draft/ready periods cannot be loaded by client.
- [x] Add tests for client dashboard read behavior.

### Completion Criteria

- [x] Client sees published dashboard only.
- [x] Client cannot see other client dashboards.
- [x] Dashboard starts with summary and outcomes.
- [x] Data trust labels are visible.
- [x] Insights and next actions are visible.
- [x] Source links and report links are present when available.

## Stage 6 - Client Overview Integration

**Goal:** Update UC-001 client overview to reference UC-004 without turning overview into a full analytics dashboard.

**Result:** Client Overview remains a status hub and exposes a compact performance preview plus link to full dashboard.

### Tasks

- [x] Add performance preview read model.
- [x] Add compact performance preview block to Client Overview.
- [x] Include only:
  - [x] performance status or data confidence
  - [x] hero metric
  - [x] 2-3 primary KPIs if appropriate
  - [x] last updated timestamp
  - [x] View Performance Dashboard action
- [x] Do not include full trend/funnel/channel breakdown in overview.
- [x] Add empty state:
  - [x] Performance dashboard is being prepared.
- [x] Add stale/low-confidence compact warning if needed.
- [x] Add tests for overview preview visibility.

### Completion Criteria

- [x] Overview links to performance dashboard.
- [x] Overview does not duplicate the full analytics page.
- [x] Empty state is clear.
- [x] Client still gets UC-001 status hub value immediately.

## Stage 7 - QA And Acceptance

**Goal:** Verify the full UC-004 behavior from data model to client UI.

**Result:** UC-004 can be considered MVP-complete on the frontend/localStorage backend.

### Unit And Service Tests

- [x] Entity validation tests.
- [x] JSON import validation tests.
- [x] Publish validation tests.
- [x] Admin service tests.
- [x] Client read service tests.
- [x] Visibility policy tests.
- [x] Repository persistence tests.
- [x] Client overview preview read model tests.
- [x] Client can navigate published/archived dashboard periods.

### E2E Tests

- [x] agency_admin can create dashboard period.
- [x] agency_admin can save draft.
- [x] agency_admin can import valid JSON.
- [x] invalid JSON shows validation errors.
- [x] JSON import does not publish automatically.
- [x] agency_admin can preview as client.
- [x] agency_admin can publish.
- [x] client_user can view published dashboard.
- [x] client_user cannot view draft dashboard.
- [x] client_user cannot view another client's dashboard.
- [x] no published dashboard shows fallback.
- [x] low confidence state is visible.
- [x] stale data state is visible.
- [x] client overview shows compact performance preview.

### Build Checks

- [x] `npm run lint`
- [x] `npm test -- --run`
- [x] UC-004 e2e spec passes.
- [x] Existing UC-001 e2e spec still passes.
- [x] Existing UC-002 e2e spec still passes.
- [x] Existing UC-003 e2e spec still passes.
- [x] `npm run build`

### Acceptance Report

- [x] Create `docs/implementation/UC-004-acceptance-report.md`.
- [x] Map each UC-004 acceptance criterion to implementation status.
- [x] Document frontend/localStorage limitations.
- [x] Document backend/integration gaps.
- [x] Document any intentionally deferred items.

### Completion Criteria

- [x] UC-004 acceptance criteria are implemented or explicitly deferred.
- [x] Existing use cases are not regressed.
- [x] Client-facing dashboard is useful with manual/JSON data.
- [x] Architecture remains backend-ready.

## Stage 8 - Future Integration Readiness

**Goal:** Prepare UC-004 for future integrations without implementing integrations now.

**Result:** The data and service structure can later support API-backed data sources.

### Tasks

- [x] Keep data source labels on KPI cards and sections.
- [x] Keep data mode separate from UI rendering.
- [x] Keep repository access behind adapters.
- [ ] Keep services async/API-like.
- [ ] Keep dashboard period model compatible with imported/integrated data.
- [x] Document future integration mapping for:
  - [x] Google Ads
  - [x] Meta Ads
  - [x] GA4
  - [x] Google Search Console
  - [x] CRM / GHL / HubSpot / Salesforce
  - [x] Klaviyo / Mailchimp / ActiveCampaign
  - [x] Shopify / Stripe
  - [x] CallRail / WhatConverts
- [ ] Do not hardcode manual-only assumptions in UI.

### Completion Criteria

- [x] Future integrations can populate the same dashboard period contract.
- [x] Manual/JSON data remains first-class.
- [x] UI clearly distinguishes manual, imported, embedded, and integrated data.

## Out Of Scope For UC-004 MVP

Do not build first:

```text
- native Google Ads connector
- native Meta Ads connector
- native GA4 connector
- native CRM connector
- native email/SMS connector
- AI-generated dashboard insights
- custom BI/chart builder
- drag-and-drop layout editor
- multi-touch attribution engine
- real-time data sync
- automated anomaly detection
- scheduled report emails
- PDF generator
```

## Final Delivery Definition

UC-004 frontend/localStorage MVP is complete when:

```text
agency_admin can create, import, edit, preview, publish, and archive a dashboard period;
client_user can view only their own published dashboard;
the dashboard leads with business outcomes, narrative, goals, trends, and trust signals;
the dashboard references UC-001/002/003 data without duplicating source records;
manual and JSON data work now, while future integrations remain possible.
```
