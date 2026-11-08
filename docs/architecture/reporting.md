# Reporting Architecture Map

Verified: 2026-11-07. Frontend `54740b1`; backend `0cbfd15`.
Paths in the backend sections are relative to `client_portal`.
See [system map](README.md) and [frontend map](frontend.md).

## 1. Three Products, Not One Engine

| Concern | Growth Review | Lead Report | Executive |
| --- | --- | --- | --- |
| Backend owner | `growth_reviews` | `analytics_dashboards` | `executive_dashboards` |
| Domain scope | Campaign, tracks and signals | Workspace dashboard; generic model also has campaign scope fields | Workspace/current month |
| Configuration | Relational campaign/track/signal models and settings | Validated versioned JSON config from a Python-registered definition/JSON template | No generic dashboard config |
| Calculation | Specialized funnel/chart/weekly-report builders | Calculation registry resolved from configured widget keys | Live appointment query |
| Result | Campaign calculation result; separate period snapshot path also exists | New snapshot per completed calculation plus snapshot record collections | No persisted dashboard snapshot model |
| UI composition | Specialized campaign widgets plus saved layout | Backend widget descriptors plus frontend renderer registry | Specialized mostly static frontend data/widget |
| Explanation editing | Campaign overrides | Dashboard overrides | Not the same explanation/config platform |
| Refresh | Growth-specific run/steps | Analytics-specific run/steps | Does not have its own equivalent queue here |
| Period selection | Campaign dates/selection | Calendar Week/Month plus calculated report catalog | Current month |

Shared UI and a shared worker do not erase these differences.

## 2. Analytics Abstraction Stack

```text
DashboardDefinition (Python registry, currently weekly_lead_report)
  -> template JSON loaded and validated
    -> AnalyticsDashboard (workspace, source, key, scope, config JSON/version)
      -> calculation keys for configured widgets
        -> CALCULATION_REGISTRY -> Python calculator(context)
          -> result payload and snapshot record collections
            -> snapshot serializer + current permissions/display/explanations
              -> frontend normalizer
                -> renderer registry -> metric/chart/table widgets
```

Key backend files:

| File | Responsibility |
| --- | --- |
| `definitions.py` | Supported definitions and provider/source mapping catalog |
| `templates/weekly_lead_report.v1.json` | Widget composition, presentation, defaults and supported period types |
| `provisioning.py` | Workspace/source validation and unique dashboard creation |
| `configuration.py` | Validation, calculation keys/dependencies, display filtering and config hash |
| `contracts.py` | DateRange, canonical ReportPeriod, CalculationContext/cache and cumulative range |
| `period_catalog.py` | Calendar policy and real snapshot metadata |
| `attribution.py` | Tag evidence, mapping priority, source candidates and selected source |
| `lead_cohort.py` | Eligible lead records, deduplication, patient type and lifecycle interpretation |
| `booking_activity.py` | Appointment-booking activity grain and outcomes |
| `calculations.py` | Registered metrics and chart datasets |
| `services.py` | Calculation orchestration and atomic snapshot/record persistence |
| `drilldowns.py` | Materialized record membership, pagination/search and current contact hydration |
| `settings.py` | Settings options, validation, patch application and impact |
| `explanation_registry.py`, `explanation_service.py` | Defaults, dynamic source explanations and saved overrides |
| `refresh_service.py` | Queue, dependency sync plan, execution and recovery |
| `views.py`, `serializers.py` | Access, snapshot selection and API projection |

The platform is configuration-driven composition over **code-defined** metrics,
not an arbitrary formula builder or a user-designed dashboard canvas. Only one
definition is registered. Adding a new formula requires Python code; selecting
existing metrics/layout data can be configured within the supported contract.

Frontend presentation is not entirely passive: metric/summary models derive
formatted percentages, comparison text and some ratios from payload fields.
The authoritative datasets/calculations are backend-owned, but an audit of a
visible number must follow the presentation model too, especially Growth Review
summary models and `widgets/analytics-dashboard/AnalyticsMetricGrid.jsx`.

## 3. Lead Report Read Flow

```text
agency/portal route wrapper
  -> WeeklyLeadReportPage
    -> useAnalyticsDashboardPeriodSelection (local selected period key)
    -> useAnalyticsDashboardReadModel
      -> analyticsDashboardApiService.getAnalyticsDashboardFromApi
        -> authenticated GET /api/workspaces/:id/analytics/dashboards/:key/
          -> authorize workspace/dashboard
          -> resolve canonical period/default period
          -> choose completed snapshot by range/version/config hash
          -> attach active refresh, permissions, period catalog, explanations
          -> filter visible widgets/metrics using current display config
        -> entities/analytics-dashboard/model.js normalization
      -> AnalyticsDashboardRenderer
        -> MetricGrid / Breakdown / BookingActivity / SegmentedTable / Trend
```

GET does not synchronize GHL or calculate a missing report. The response can be
`not_calculated`, a current result, or a stale result according to selection rules.

`AnalyticsDashboardRenderer` currently supports `metric_grid`, `breakdown`,
`funnel`, `booking_activity`, `table`, and `trend`. Backend validation also lists
`heatmap`, which has no renderer entry. Unsupported widgets render a controlled
unavailable state. Registry support is therefore not identical across layers.

## 4. Periods, Snapshots And Time Semantics

These are separate concepts:

| Concept | Meaning | Owner |
| --- | --- | --- |
| Calendar period | Monday-Sunday week or complete calendar month | Backend canonical contract; frontend calendar generation |
| Calculated report | Completed snapshot metadata for a canonical period | Backend period catalog |
| Selection | Period key the viewer wants to read/calculate | Frontend workspace/dashboard-scoped React state |
| Calculation instant | When current normalized records were evaluated | Snapshot `calculated_at`, metric `temporal.as_of` |
| Reporting history | Earliest date for cumulative values | Config `reporting_history.start_date` |

Backend sends `types`, `history_start`, workspace-local `current_date`, `timezone`,
`reports` and `default_period_key`. Frontend `reportPeriods.js` generates missing
weeks/months and overlays real snapshots. No row is written to the DB just to
display an uncalculated week. No separate persistent `Report` entity exists.

Canonical keys are `week:YYYY-MM-DD` (Monday) and `month:YYYY-MM`. Existing legacy
`period_type`/`period_end` API parameters remain accepted; those can describe
noncanonical ranges that do not appear as canonical catalog reports.
`month_to_date` remains the internal type name even for a full calendar month.

The list starts at the week/month containing configured history start. If absent,
the backend falls back to the oldest canonical report start or current date.
This date is not automatically the earliest record date in GHL.

The current selection hook does not persist the key in the URL or browser
storage. Reload selects the backend default again. The API's `period_key` query
parameter is a request contract, not proof of a shareable frontend URL filter.

Calculation freshness is based on calculation version plus calculation-config
hash. Source watermarks are separate metadata, not a complete reconstruction of
every source transition. `display`, supported period list and default period are
excluded from the relevant calculation hash logic.

One observed contract mismatch for the next audit: the catalog retains snapshots
from older calculation versions as stale, while dashboard GET's fallback still
filters to the current calculation version. A stale catalog entry does not always
mean the old payload can currently be opened. Do not assume these selectors have
the same policy.

## 5. Metrics Are Not All The Same Grain

| Dataset | Input grain / date semantics |
| --- | --- |
| Lead volume/source/lifecycle cohort | Eligible configured-pipeline opportunities, grouped into lead records by contact identity (opportunity fallback); created-at period filtering |
| Booking activity | Eligible appointments by `booked_at`, linked to eligible earlier leads/opportunities; can include leads created in previous periods |
| Showed/cancelled/upcoming/pending | Outcome interpretation of booking activity; upcoming/pending also depends on calculation `as_of` |
| In sequence | Current configured active-tag state evaluated at calculation instant, marked `point_in_time` |
| Weekly communication activity | Locally synchronized conversation messages and channel/date interpretation |
| Expected value | Semantic/custom-field and opportunity interpretation in the calculator; not an independent source-of-truth financial ledger |

Configured source attribution uses contact tag evidence on opportunity snapshots,
ordered source mappings, and evidence/candidate fields. Patient type uses a
configured Dentrix patient-ID semantic mapping on the contact. Lifecycle uses
configured pipeline stage groups. These interpretations are not all delegated
to the same mapping subsystem.

`All-time` is computed with the same relevant calculation logic over configured
history start through selected report end and stored with the period result.
It is not a sum of weekly results. Point-in-time metrics are a different temporal
kind and should not acquire a historical meaning just because the page shows an
earlier reporting week.

Persisting a snapshot freezes that calculation's output. Recalculating an old
period uses current normalized tags/stages/statuses where no event history is
available. Raw payload retention is not itself an as-of reconstruction engine.

## 6. Refresh And Settings Are Different Commands

### Refresh

```text
Calculate/Refresh
  -> POST .../refresh/ (period key)
    -> lock dashboard / find existing active run
    -> persist frozen calculation config/hash + ordered dependency sync plan
    -> return 202 with run (does not wait for worker completion)
      -> process_background_jobs
        -> sync pipelines/opportunities/contacts/calendars/appointments/messages
           as required by selected calculation dependencies
        -> calculate_dashboard
        -> atomic snapshot + record persistence
      -> poll GET .../analytics/refreshes/:id/
      -> GET dashboard after terminal completion
```

There is one active Analytics refresh per dashboard, not one per period. A second
request can receive the existing run for another period. Frontend and backend
status/target-period semantics must be reviewed together. Polling is two seconds
in the Analytics hook; Growth Review uses its own three-second polling workflow.

### Settings

```text
Settings dialog -> load backend options -> local draft
  -> settingsModel builds changed display/calculation patch
  -> PATCH .../settings/
    -> validate and persist config
    -> impact: unchanged | display_only | recalculation_required
  -> GET dashboard
```

Display visibility takes effect on reads against the existing stored payload.
PATCH does not enqueue refresh. Calculation changes make the old result stale
through the hash; the current page reloads rather than automatically refreshing.
Explanation save/reset uses its own PUT/DELETE endpoints and likewise does not
recalculate metrics. Display labels are resolved from live explanation metadata
instead of requiring a calculation to update stored widget titles.

## 7. Growth Review's Separate Stack

```text
WorkspaceCampaign + signals + tracks/track signals
  + SourceFieldMapping + touch custom-object contract
  -> review_config_service validates calculation readiness
  -> reactivation_dashboard_service calculates campaign read model
    -> funnels / charts / weekly_reporting / metric helpers
    -> GrowthReviewCalculationResult
  -> live campaign metadata + saved layout + explanation overlays
  -> growthReviewApiReadService + dental-growth-review contracts/models
  -> DentalGrowthReviewDashboard and specialized sections
```

`GrowthReviewCalculationResult` uses `update_or_create` for the campaign result
key and calculation version: it is not the same append-only lifecycle as Analytics
snapshots. There is also a separate `GrowthReviewSnapshot`/`snapshot_service.py`
period path. These two storage mechanisms must not be conflated.

`GrowthReviewDashboardLayout` owns saved widget visibility/order separately from
calculated data. `GrowthReviewDashboardExplanation` owns campaign overrides.
Campaign setup is a route/workflow with relational drafts/status, signal mapping
validation and source option synchronization, not the Analytics settings JSON.

`ReactivationTouch` is owned by Growth Review, synchronized through its custom
object contract. Generic CRM messaging and touch records are separate activity
sources. Specialized activity builders decide how to use them; a shared activity
abstraction covering both products does not exist today.

The refresh service has its own fixed/configured steps, failure/warning handling,
source resolution, queue claiming and serializers. The shared worker calls it;
it does not translate it into the Analytics refresh model.

## 8. Executive Stack

`executive_dashboards/services.py` queries normalized appointments for current
workspace calendar-month bookings, excluding cancelled/invalid appointments.
Frontend `useExecutiveDashboardReadModel` merges this metric into
`executiveDashboardStaticData` and the specialized Executive widget.

The other displayed content is not evidence of a fully source-backed Executive
dashboard. This product is neither a Growth campaign nor an Analytics definition.

## 9. Explanations And Drilldowns

Explanations share a frontend workflow, but separate backend registries/models:

```text
default explanation registry + per-dashboard/per-campaign overrides
  -> resolved explanation API metadata
    -> entities/dashboard-explanation normalization/display-name resolution
      -> features/dashboard-explanation view/edit popover
        -> owning Analytics/Growth endpoint adapter
```

An administrator can edit explanatory text without changing calculation code.
Therefore authored explanations can diverge from formula semantics; they are
communication metadata, not executable specifications.

Analytics drilldowns persist snapshot record keys/dimensions, then hydrate current
contact names/destinations at read time. Membership of the collection can be
frozen while contact display details remain live. Growth accepted-treatment
drilldowns use their own service/endpoint. The frontend contact collection feature
shares interaction/presentation rather than assuming identical query semantics.

## 10. MCP Client Boundary

The sibling plugin uses typed tool schemas -> backend HTTP client -> the same
provisioning/read/settings/refresh APIs. Backend owns validation and permissions;
the plugin does not own a second calculator or DB connection.

Current `0.6.1` plugin source supports definition/dashboard discovery, provisioning,
inspection, selected settings updates and refresh inspection/start. It does not
yet match all current frontend settings:

- Settings schema exposes pipelines, lifecycle groups, sequence tags and hidden
  widget/metric lists, but not source mappings/history start.
- Period schema still exposes `year_to_date` and type/end parameters, not canonical
  `period_key` calendar selection.
- Settings update does GET/merge/PATCH/read-back and supplies pipeline/lifecycle
  fields even for some narrower changes.

These are adapter/version parity gaps, not evidence that the backend lacks the
underlying settings mechanism.

## 11. Seams For Subsequent Analysis

Compare these responsibilities individually before proposing unification:

- Calculation contracts and temporal/grain semantics.
- Snapshot/result lifecycle and reproducibility requirements.
- Settings persistence, invalidation and display overlays.
- Refresh command target, deduplication, polling, worker availability and recovery.
- Registry coverage across backend, frontend and MCP.
- Source normalization versus report-specific interpretation.
- Generic presentation primitives versus domain-specific visual variants.

The current platform contains useful reusable pieces. This map does not conclude
that Growth Review should be moved immediately or that every product should use
one universal card/calculator/component.
