# Growth Review Metric Layer Implementation Plan

## Goal

Build the Growth Review dashboard around a stable metric contract.

The dashboard should not depend on GHL payloads, sync implementation details, pipeline stage IDs, or frontend-side business calculations. Backend owns metric meaning and calculation. Frontend owns presentation and interaction. Dashboard owns layout and story.

Target data flow:

```text
GHL API / webhooks
-> raw incoming events
-> normalized CRM domain models
-> Growth Review metric definitions
-> metric calculators
-> canonical Growth Review read model API
-> frontend dashboard charts
```

## Core Principle

The chart layer must be dumb.

Charts receive:

```text
metric_key
label
series
total
prior_total
delta
confidence
source
last_synced_at
calculation_note
available
unavailable_reason
```

Charts must not know:

```text
GHL payload shape
pipelineStageId
appointment.dateAdded
CRM table names
sync method
webhook vs API pull
business formula
timezone rules
status exclusion rules
```

## Phase 1: Stabilize Metric Contract

### Objective

Create one backend response shape for every dashboard metric.

### Implementation

Create a small backend contract layer, for example:

```text
growth_reviews/metrics/contracts.py
```

Every metric result should support:

```text
metric_key
label
definition
unit
date_field
source
calculation_method
confidence
calculation_note
last_synced_at
series
total
prior_total
delta
available
unavailable_reason
```

### Acceptance Criteria

- [ ] Every dashboard chart can render from the same metric object shape.
- [ ] Frontend does not need raw CRM, GHL, appointment, or opportunity details.
- [ ] Missing/unavailable metrics are represented by the same contract, not custom UI fallbacks.

## Phase 2: Define Business Metric Keys

### Objective

Remove ambiguous metric names such as `bookings`.

### Metric Keys

Use business-semantic keys:

```text
booked_appointments_created
leads_received
opportunities_created
lead_to_booked_rate
known_source_rate
attended_appointments
pipeline_funnel_snapshot
```

Avoid source/implementation names:

```text
ghl_bookings_chart
ghl_pipeline_booked
calendar_events_chart
```

### Important Distinction

These are different metrics and must not share one `bookings` key:

```text
booked_appointments_created
= appointments where booked_at is inside selected period, excluding cancelled/invalid

booked_opportunities_reached
= opportunities that reached configured booked stage
```

### Acceptance Criteria

- [ ] Each metric has one meaning.
- [ ] Each metric has one primary date field.
- [ ] Each metric has one primary source.
- [ ] `Bookings` on the dashboard maps to an explicit metric key, not a vague label.

## Phase 3: Create Metric Definitions Registry

### Objective

Centralize metric meaning in one place.

### Implementation

Create:

```text
growth_reviews/metrics/definitions.py
growth_reviews/metrics/registry.py
```

Each metric definition should include:

```text
key
label
definition
formula
date_field
source
required_models
required_settings
default_confidence
```

### Acceptance Criteria

- [ ] All Growth Review dashboard metrics are visible in one registry.
- [ ] Formula text is not scattered across unrelated service functions.
- [ ] Frontend labels can be derived from metric definitions or stable API fields.

## Phase 4: Unify Date Range And Timezone

### Objective

Make every metric use the same period semantics.

### Rules

Use:

```text
inclusive start
exclusive end
workspace / clinic timezone
zero-filled daily buckets
same previous-period logic
```

Avoid:

```text
time.max
__lte end_at
frontend UTC period math as source of truth
different date range utilities per metric
```

### Implementation

Use one shared date range service:

```text
growth_reviews/metrics/date_ranges.py
```

It should own:

```text
workspace timezone
start_at
end_at_exclusive
previous period
daily buckets
zero-fill date iteration
```

### Acceptance Criteria

- [ ] Every metric calculator receives the same `DateRange` object.
- [ ] No Growth Review metric uses `time.max` or `__lte` for period end.
- [ ] Daily series return every day in the selected period.
- [ ] Backend, not frontend, owns calculation timezone.

## Phase 5: Rewrite Calculators Around Metric Results

### Objective

Make calculators return standardized metric result objects.

### Suggested Structure

```text
growth_reviews/metrics/calculators/appointments.py
growth_reviews/metrics/calculators/contacts.py
growth_reviews/metrics/calculators/opportunities.py
growth_reviews/metrics/calculators/funnel.py
```

### First Metrics

Implement or refactor in this order:

```text
booked_appointments_created
leads_received
opportunities_created
known_source_rate
attended_appointments
pipeline_funnel_snapshot
```

Handle carefully:

```text
lead_to_booked_rate
```

because it must be cohort-based and should not mix unrelated date fields.

### Acceptance Criteria

- [ ] Calculators do not know about frontend cards or chart components.
- [ ] Calculators return metric result objects.
- [ ] Calculators expose formula, source, date field, confidence, and calculation note.

## Phase 6: Fix Bookings Semantics

### Objective

Make `Bookings` mean one thing.

### Decision

For the clinic Growth Review dashboard:

```text
Bookings = booked_appointments_created
```

Formula:

```text
count appointments where booked_at is inside selected period
and normalized_status is not cancelled/invalid
```

Pipeline stage `Booked` should be used for:

```text
Lead -> Booked
Pipeline Funnel
Booked opportunity proxy, if explicitly needed
```

### Acceptance Criteria

- [ ] `Bookings` card no longer counts opportunity stage changes.
- [ ] Opportunity-stage booked logic has its own explicit metric key if used.
- [ ] API metadata explains the source as GHL calendar events / appointments.

## Phase 7: Fix Lead To Booked

### Objective

Make `Lead -> Booked` a real conversion metric, not a mixed-period ratio.

### Problem To Avoid

Do not calculate:

```text
booked stage changes during selected period / contacts created during selected period
```

This mixes two unrelated date fields and can produce misleading conversion.

### Lean V1 Direction

Use a cohort-based definition:

```text
leads created in selected period that eventually reached booked state
/
leads created in selected period
```

If the required links are not reliable yet, return:

```text
available = false
```

or:

```text
confidence = low / medium
calculation_note = explains proxy limitation
```

### Acceptance Criteria

- [ ] Numerator and denominator are tied to the same lead cohort.
- [ ] Metric metadata clearly states whether it is exact or proxy.
- [ ] The frontend does not infer conversion logic.

## Phase 8: Build One Canonical Growth Review API Payload

### Objective

Remove duplicate read model semantics.

### Endpoint

Keep one endpoint:

```text
GET /api/workspaces/:id/growth-review/?start=YYYY-MM-DD&end=YYYY-MM-DD
```

### Canonical Payload

The endpoint should return:

```text
workspace
period
metrics
funnel
data_freshness
settings_status
```

Avoid parallel sources of truth:

```text
hero_metrics
charts.hero_metric_series
old funnel
charts.funnel
```

### Acceptance Criteria

- [ ] Frontend reads one canonical read model.
- [ ] Old `hero_metrics` / fallback `content.funnel` paths are removed after migration.
- [ ] API payload is stable enough to survive a future webhook-based backend.

## Phase 9: Keep Frontend As Adapter And Presentation

### Objective

Frontend normalizes and renders. It does not calculate business metrics.

### Frontend Responsibilities

```text
entities/dental-growth-review/apiContract.js
-> normalize backend payload

features/growth-review-data
-> fetch read model

widgets/dental-growth-review
-> compose dashboard sections

shared/charts
-> render series visually
```

### Frontend Must Not Do

```text
filter raw appointments
calculate conversion
choose source date field
exclude statuses
decide confidence
derive metric definitions
```

### Acceptance Criteria

- [ ] Widgets receive clean metric objects.
- [ ] Chart components receive only presentation-ready series and metadata.
- [ ] Frontend does not know whether the data came from API pull or webhooks.

## Phase 10: Map Existing Dashboard Cards To Metric Keys

### Objective

Wire current UI to explicit metric keys.

### Mapping

```text
Bookings -> booked_appointments_created
Leads Received -> leads_received
Opportunities -> opportunities_created
Lead -> Booked -> lead_to_booked_rate
Known Source Rate -> known_source_rate
Attended Appointments -> attended_appointments
Pipeline Funnel -> pipeline_funnel_snapshot
```

### Acceptance Criteria

- [ ] Each visible dashboard block reads one explicit metric key.
- [ ] No chart depends on old label matching such as `Bookings This Period`.
- [ ] No chart has GHL-specific logic.

## Phase 11: Backend Settings And Availability

### Objective

Backend owns whether a metric can be calculated.

### Settings Status

The API should expose states such as:

```text
pipeline_configured
booked_stage_configured
appointments_synced
source_connection_configured
```

Metric unavailable state:

```text
available = false
unavailable_reason = "Growth Review pipeline is not configured for this workspace."
```

### Acceptance Criteria

- [ ] UI does not invent setup errors.
- [ ] Backend determines metric availability.
- [ ] Unavailable metrics still use the standard metric contract.

## Phase 12: Keep Webhook Compatibility

### Objective

Allow future webhook ingestion without rewriting the dashboard UI.

### Current Path

```text
GHL API pull
-> normalized CRM models
-> metric result
```

### Future Path

```text
GHL webhooks
-> event tables
-> metric result
```

### Stable Contract

This must not change:

```text
metric_key
series
total
confidence
source
last_synced_at
calculation_note
available
```

### Acceptance Criteria

- [ ] Webhooks can change ingestion and calculators without changing chart components.
- [ ] Metric keys remain business-semantic, not source-semantic.
- [ ] Current calculation method is exposed as metadata, not encoded into component names.

## Recommended Implementation Order

- [ ] Phase 1: Stabilize metric contract.
- [ ] Phase 2: Define business metric keys.
- [ ] Phase 3: Create metric definitions registry.
- [ ] Phase 4: Unify date range and timezone.
- [ ] Phase 5: Rewrite calculators around metric results.
- [ ] Phase 6: Fix `Bookings` semantics.
- [ ] Phase 7: Fix `Lead -> Booked` cohort logic.
- [ ] Phase 8: Build one canonical Growth Review API payload.
- [ ] Phase 9: Keep frontend as adapter and presentation.
- [ ] Phase 10: Map existing dashboard cards to metric keys.
- [ ] Phase 11: Backend settings and availability.
- [ ] Phase 12: Keep webhook compatibility.

## Definition Of Done

- [ ] Backend owns all metric meaning and calculation.
- [ ] Frontend owns only presentation and interaction.
- [ ] Dashboard owns only layout and review story.
- [ ] Every metric has one key, one definition, one formula, one date field, and one source.
- [ ] The Growth Review API returns stable metric results.
- [ ] Existing frontend charts render from the stable metric contract.
- [ ] Future webhook ingestion can improve data quality without changing dashboard UI.

## Implementation Status

Updated: 2026-06-03

- [x] Backend metric definitions registry added.
- [x] Backend metric contract helper added for available and unavailable metric objects.
- [x] Workspace timezone field added for backend-owned period interpretation.
- [x] Growth Review date ranges moved to inclusive start / exclusive end.
- [x] Daily metric series return every day in the selected period.
- [x] Bookings metric now uses GHL calendar appointment creation data, not opportunity stage changes.
- [x] Leads Received, Opportunities Created, Known Source Rate, Attended Appointments, and Lead -> Booked are returned through the same metric contract.
- [x] Lead -> Booked is marked as a current-state cohort proxy until webhook stage history exists.
- [x] Pipeline funnel response includes metric metadata and remains a separate current snapshot.
- [x] Pipeline funnel defaults to the selected GHL pipeline stages when custom Growth Review funnel steps are not configured.
- [x] Growth Review endpoint returns one canonical payload with `metrics`, `funnel`, `period`, `data_freshness`, and `settings_status`.
- [x] Frontend API adapter accepts canonical backend `metrics` and maps them to existing dashboard cards/charts.
- [x] Dashboard no longer depends on the old `content.funnel` fallback for the funnel.
- [x] Remove remaining legacy frontend label compatibility once no old payloads are needed.
- [x] Delete old backend helper modules after the new contract replaced them.
- [ ] Add workspace timezone editing to the correct setup surface when the product needs non-UTC workspace control.

## Current Code Audit

### Backend: Existing Layers

Current backend repo:

```text
C:/Users/GOD/Documents/GitHub/client_portal
```

Relevant current files:

```text
crm/models.py
integrations/services/ghl_sync.py
growth_reviews/models.py
growth_reviews/services.py
growth_reviews/chart_services.py
growth_reviews/settings_service.py
growth_reviews/views.py
growth_reviews/metrics/date_ranges.py
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/pipeline_funnel.py
growth_reviews/metrics/zero_fill.py
```

What already exists:

```text
Source/sync layer:
- integrations.SourceConnection
- integrations.ConnectionCredential
- integrations.IncomingEvent
- integrations/services/ghl_sync.py
- GHL sync commands for contacts, opportunities, pipelines, calendars, calendar events

Domain layer:
- crm.Contact
- crm.Pipeline
- crm.PipelineStage
- crm.Calendar
- crm.Appointment
- crm.Opportunity
- crm.Conversation
- crm.ConversationMessage

Growth Review configuration:
- growth_reviews.GrowthReviewSettings
- growth_reviews.GrowthReviewFunnelStep
- growth_reviews.GrowthReviewFunnelStepStage
- growth_reviews/settings_service.py

Metric/chart layer:
- growth_reviews/services.py builds the older hero_metrics/funnel read model
- growth_reviews/chart_services.py builds newer charts.* payload
- growth_reviews/metrics/appointment_metrics.py calculates appointment chart metrics
- growth_reviews/metrics/hero_metric_series.py calculates card sparkline series
- growth_reviews/metrics/pipeline_funnel.py calculates pipeline funnel snapshot
```

Main backend issues to fix:

```text
1. There are two Growth Review read models:
   - growth_reviews/services.py
   - growth_reviews/chart_services.py

2. Bookings is ambiguous:
   - services.py and hero_metric_series.py use opportunity booked stage
   - appointment_metrics.py already has appointment booking logic via booked_at

3. Lead -> Booked is currently mixed-period:
   - numerator uses opportunity last_stage_change_at
   - denominator uses contact date_added

4. Date range logic is split:
   - services.py uses time.max and __lte
   - metrics/date_ranges.py uses end_at_exclusive

5. Timezone is global Django timezone:
   - workspace/clinic timezone does not exist on Workspace or GrowthReviewSettings yet

6. Metric definitions are implicit:
   - formula, source, confidence, and labels are scattered across services
```

### Frontend: Existing Layers

Current frontend repo:

```text
C:/Users/GOD/Documents/GitHub/agency-reports
```

Relevant current files:

```text
src/entities/dental-growth-review/apiContract.js
src/domain/services/growthReviewApiReadService.js
src/features/growth-review-data/useGrowthReviewReadModel.js
src/widgets/dental-growth-review/DentalGrowthReviewDashboard.jsx
src/widgets/dental-growth-review/DentalGrowthReviewBlocks.jsx
src/pages/dashboards/dental-growth-review/DentalGrowthReviewPage.jsx
src/pages/dashboards/dental-growth-review/DentalGrowthReviewPageHeader.jsx
src/features/growth-review-setup/
```

What already exists:

```text
API adapter:
- apiContract.js normalizes old hero_metrics/funnel and newer charts.*

Data feature:
- useGrowthReviewReadModel fetches backend Growth Review API

Dashboard widget:
- DentalGrowthReviewDashboard passes heroMetricSeries and funnelChart into UI blocks

Chart rendering:
- DentalGrowthReviewBlocks renders MetricCard, MetricTrendChart, FunnelView
```

Main frontend issues to fix after backend contract is stable:

```text
1. Frontend still normalizes two payload shapes:
   - old hero_metrics/funnel
   - new charts.hero_metric_series/charts.funnel

2. Hero cards still depend on old metric IDs:
   - bookings
   - leads-received
   - opportunities-created
   - lead-booked-rate
   - known-source-rate
   - attended-appointments

3. There is legacy label patching:
   - Bookings This Period -> Bookings

4. Dashboard fallback still uses content.funnel if charts.funnel is missing.

5. Frontend date range presets are computed in UTC; backend should own calculation timezone.
```

## Detailed Implementation Map

### Step 1: Add Metric Contract Objects

Backend files to add:

```text
growth_reviews/metrics/contracts.py
```

Backend files to update:

```text
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/pipeline_funnel.py
```

Implementation detail:

```text
Create one helper or dataclass-style factory for:
- available metric result
- unavailable metric result
- count metric result
- rate metric result
- funnel metric result
```

This contract should support both card summary and chart series from the same object.

Do not change frontend first. Backend contract comes first.

Completion checklist:

- [ ] `contracts.py` exists.
- [ ] It can produce available and unavailable metric objects.
- [ ] It includes stable fields: metric_key, label, definition, formula, date_field, source, confidence, calculation_note, series, total, prior_total, delta.
- [ ] Existing calculators can call the contract helper without UI-specific formatting.

### Step 2: Add Metric Definitions Registry

Backend files to add:

```text
growth_reviews/metrics/definitions.py
growth_reviews/metrics/registry.py
```

Backend files to update:

```text
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
growth_reviews/chart_services.py
```

Implementation detail:

Definitions should be simple constants or frozen dataclasses. Avoid a large BI engine.

Minimum definitions:

```text
booked_appointments_created
leads_received
opportunities_created
lead_to_booked_rate
known_source_rate
attended_appointments
pipeline_funnel_snapshot
```

Each definition should include:

```text
key
label
definition
formula
date_field
source
unit
default_confidence
required_settings
```

Completion checklist:

- [ ] All visible dashboard metrics have definitions.
- [ ] Formula strings are removed from ad hoc response builders.
- [ ] Metric labels are no longer derived from frontend label patches.

### Step 3: Unify Date Range Handling

Backend files to update:

```text
growth_reviews/metrics/date_ranges.py
growth_reviews/services.py
growth_reviews/chart_services.py
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
```

Potential backend model update:

```text
workspaces/models.py
```

or:

```text
growth_reviews/models.py
```

Current state:

```text
Workspace has no timezone field.
GrowthReviewSettings has no timezone field.
date_ranges.py uses django.utils.timezone.get_current_timezone().
services.py uses time.max and __lte.
```

Lean decision:

```text
Add timezone to Workspace if it should apply to all workspace reporting.
Add timezone to GrowthReviewSettings only if it is specific to Growth Review.
```

Recommended:

```text
Workspace.timezone = CharField(default="UTC")
```

because timezone affects all future workspace analytics, not only Growth Review.

Completion checklist:

- [ ] `DateRange` accepts workspace timezone.
- [ ] All Growth Review metrics use inclusive start / exclusive end.
- [ ] Old `time.max` and `__lte` period filters are removed from Growth Review metric code.
- [ ] Daily buckets use the same timezone as the metric query.
- [ ] Frontend can still send `start` and `end`, but backend owns timezone interpretation.

### Step 4: Replace Old Hero Metric Service With Canonical Metrics

Backend files to update:

```text
growth_reviews/services.py
growth_reviews/chart_services.py
growth_reviews/views.py
```

Current state:

```text
views.py builds payload with:
1. build_growth_review_read_model(...)
2. payload["charts"] = build_growth_review_charts_read_model(...)
```

Target state:

```text
views.py calls one canonical builder.
```

Suggested new file:

```text
growth_reviews/read_model.py
```

or keep:

```text
growth_reviews/chart_services.py
```

but make it the single read model builder.

Completion checklist:

- [ ] `workspace_growth_review` endpoint uses one canonical builder.
- [ ] Old `hero_metrics` and old `funnel` are no longer independent sources of truth.
- [ ] Existing permission logic in `views.py` remains unchanged.
- [ ] Settings endpoints remain unchanged.

### Step 5: Fix Bookings Metric

Backend files to update:

```text
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/definitions.py
growth_reviews/metrics/registry.py
```

Current state:

```text
appointment_metrics.py has correct appointment booking logic:
- metric_key = booked_appointments_by_day
- date_field = booked_at
- excludes cancelled/invalid

hero_metric_series.py currently uses:
- metric_key = bookings
- model = Opportunity
- date_field = last_stage_change_at
```

Target state:

```text
Bookings card uses booked_appointments_created.
It counts crm.Appointment by booked_at.
```

Opportunity booked stage should move to a separate metric only if needed:

```text
booked_opportunities_reached
```

Completion checklist:

- [ ] Dashboard `Bookings` no longer counts opportunity stage changes.
- [ ] `booked_appointments_created` returns total, prior_total, delta, and daily series.
- [ ] Source metadata says GHL Calendar Events / appointments.

### Step 6: Fix Leads And Opportunities Metrics

Backend files to update:

```text
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/calculators/contacts.py
growth_reviews/metrics/calculators/opportunities.py
```

Suggested files to add:

```text
growth_reviews/metrics/calculators/contacts.py
growth_reviews/metrics/calculators/opportunities.py
```

Current state:

```text
leads_received uses crm.Contact.date_added.
opportunities_created uses crm.Opportunity.created_at_source and selected pipeline.
```

Target state:

```text
Keep the same domain fields, but return canonical metric results.
```

Completion checklist:

- [ ] `leads_received` uses Contact.date_added.
- [ ] `opportunities_created` uses Opportunity.created_at_source.
- [ ] `opportunities_created` is unavailable when Growth Review pipeline is not configured.
- [ ] Both metrics return zero-filled daily series and prior-period summary.

### Step 7: Fix Known Source Rate

Backend files to update:

```text
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/calculators/contacts.py
```

Current state:

```text
known_source_rate uses Contact.date_added for numerator and denominator.
This is structurally acceptable.
```

Target state:

```text
Return canonical rate metric:
known contacts created in period / contacts created in period
```

Completion checklist:

- [ ] Uses same date field for numerator and denominator.
- [ ] Handles zero denominator.
- [ ] Returns confidence and calculation note.

### Step 8: Fix Attended Appointments

Backend files to update:

```text
growth_reviews/metrics/appointment_metrics.py
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/calculators/appointments.py
```

Current state:

```text
appointment_metrics.py uses appointment_start_at and attended status correctly.
hero_metric_series.py also uses appointment_start_at but returns a different response shape.
```

Target state:

```text
One attended_appointments metric result powers both card and detail chart.
```

Completion checklist:

- [ ] Uses Appointment.appointment_start_at.
- [ ] Uses normalized_status = attended.
- [ ] Returns daily series, total, prior_total, delta, confidence.
- [ ] No duplicated attended appointment logic remains.

### Step 9: Fix Lead To Booked Rate

Backend files to update:

```text
growth_reviews/metrics/hero_metric_series.py
growth_reviews/metrics/definitions.py
growth_reviews/metrics/registry.py
```

Suggested file to add:

```text
growth_reviews/metrics/calculators/conversions.py
```

Current state:

```text
lead_to_booked_rate uses:
- numerator: booked opportunities filtered by last_stage_change_at
- denominator: contacts filtered by date_added
```

This is not cohort-based.

Target state:

```text
V1 exact enough:
- denominator: opportunities created in selected pipeline during selected period
- numerator: those same opportunities whose current stage is configured booked stage or a later mapped booked/reached stage
- group by opportunity created date
```

Important limitation:

```text
This is a current-state cohort proxy, not true historical stage movement.
```

Metadata should say:

```text
calculation_method = current_state_cohort_proxy
confidence = medium
calculation_note = uses current opportunity stage for the selected opportunity-created cohort
```

Future webhook path:

```text
Use opportunity stage events to know when each lead reached booked.
```

Completion checklist:

- [ ] Numerator and denominator are from the same opportunity-created cohort.
- [ ] Metric no longer divides booked stage changes by contacts.
- [ ] Metric clearly marks current-state proxy confidence.
- [ ] Recent-period limitation is documented in calculation_note.

### Step 10: Keep Pipeline Funnel Snapshot Separate

Backend files to update:

```text
growth_reviews/metrics/pipeline_funnel.py
growth_reviews/metrics/definitions.py
growth_reviews/metrics/registry.py
```

Current state:

```text
pipeline_funnel.py returns date_range_applied = False.
It counts current opportunities in configured funnel step mappings.
```

Target state:

```text
Keep it separate from period metrics.
Expose it as pipeline_funnel_snapshot.
```

Completion checklist:

- [ ] Funnel response is explicit that it is current snapshot.
- [ ] Funnel does not pretend to be selected-period historical conversion.
- [ ] Dashboard title/metadata can distinguish Pipeline Funnel from period cards.

### Step 11: Update Frontend API Contract After Backend Stabilizes

Frontend files to update:

```text
src/entities/dental-growth-review/apiContract.js
src/domain/services/growthReviewApiReadService.js
src/widgets/dental-growth-review/DentalGrowthReviewDashboard.jsx
src/widgets/dental-growth-review/DentalGrowthReviewBlocks.jsx
```

Current state:

```text
apiContract.js normalizes:
- old hero_metrics/funnel
- charts.hero_metric_series
- charts.metrics

DentalGrowthReviewDashboard falls back from charts.funnel to content.funnel.
HeroMetrics indexes series by old metric.id.
```

Target state:

```text
apiContract.js normalizes canonical metrics.
Dashboard maps cards by metric_key.
No old fallback logic.
```

Completion checklist:

- [ ] Frontend expects canonical `metrics`.
- [ ] Existing cards map to explicit metric keys.
- [ ] `Bookings This Period` label patch is removed.
- [ ] `content.funnel` fallback is removed.
- [ ] Chart components still only render series and metadata.

### Step 12: Update Growth Review Setup Only If Needed

Frontend files likely involved:

```text
src/features/growth-review-setup/
src/pages/admin/clinic-review-setup/
```

Backend files likely involved:

```text
growth_reviews/settings_service.py
growth_reviews/models.py
growth_reviews/views.py
```

Current state:

```text
Setup already handles:
- source_connection_id
- funnel_pipeline_id
- booked_stage_id
- funnel_steps
```

Potential addition:

```text
workspace timezone
```

Only add timezone UI if timezone is added to Workspace or GrowthReviewSettings.

Completion checklist:

- [ ] Setup still configures selected GHL source connection.
- [ ] Setup still configures selected funnel pipeline and booked stage.
- [ ] If timezone is added, it is configured in the correct setup surface.
- [ ] Metric availability comes from backend settings status, not frontend guesses.

## Implementation Guardrails

Use this order during implementation:

```text
1. Backend contract and definitions.
2. Backend date range and timezone.
3. Backend calculators.
4. Backend canonical read model.
5. Frontend API contract normalization.
6. Frontend dashboard remap.
7. Remove old fallback paths.
```

Do not start with frontend chart changes.

Do not create new visual chart components unless the existing presentation layer cannot render the canonical metric result.

Do not calculate business metrics in:

```text
src/widgets/dental-growth-review/*
src/pages/dashboards/dental-growth-review/*
src/shared/charts/*
```

Do calculate business metrics in:

```text
growth_reviews/metrics/*
```

Do keep GHL sync details in:

```text
integrations/*
crm/services.py
```
