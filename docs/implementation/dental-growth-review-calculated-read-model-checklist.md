# Dental Growth Review Calculated Read Model Checklist

## Summary

Correct the Dental Growth Review architecture so agency users do not manually create dashboards.

The dashboard must be generated from source data supplied by JSON imports, webhook payloads, or future API syncs. Admin users review, preview, explain, and publish the generated draft. They should not hand-author calculated metrics as the normal workflow.

## Product Rule

- [x] Source data creates the dashboard.
- [x] Calculation service creates the draft.
- [x] Agency/admin reviews and publishes the draft.
- [x] Manual editing is limited to narrative/action fields unless an explicit manual override feature is added later.
- [x] No import or webhook publishes automatically.
- [x] Client users only see published/archived dashboard periods.
- [x] Draft preview is agency-admin only.

## Target Architecture

```text
JSON / webhook / API sync
  -> source batch repository
  -> source payload validation
  -> normalization
  -> calculation service
  -> dentalGrowthReviewPeriods draft read model
  -> admin draft preview
  -> publish
  -> client dashboard
```

## Phase 1 - Source Batch Foundation

- [x] Add `dentalGrowthReviewSourceBatches` repository collection.
- [x] Add source batch entity contract:
  - [x] `id`
  - [x] `client_id`
  - [x] `period_start`
  - [x] `period_end`
  - [x] `period_type: weekly | biweekly | custom`
  - [x] `source_type: json_import | webhook | api_sync`
  - [x] `payload`
  - [x] `source_metadata`
  - [x] `validation_state`
  - [x] `validation_errors`
  - [x] `imported_at`
  - [x] `imported_by`
- [x] Add normalizer for source batches.
- [x] Add patient-field rejection for source payloads.
- [x] Add repository manifest/schema entries.
- [x] Add seed source batch for Green Dental.

## Phase 2 - Source Payload Contract

- [x] Define normalized input sections:
  - [x] leads
  - [x] conversations
  - [x] appointments
  - [x] spend
  - [x] reactivation tracks
  - [x] deliverability
  - [x] reviews/referrals
  - [x] source freshness
  - [x] manual assumptions
- [x] Add controlled source vocabulary:
  - [x] `meta`
  - [x] `google_ads`
  - [x] `gbp`
  - [x] `organic`
  - [x] `referral`
  - [x] `reactivation`
  - [x] `walk_in`
  - [x] `email`
  - [x] `sms`
  - [x] `unknown`
- [x] Preserve unknown source values as `unknown`, never hide them.
- [x] Add validation for required period fields.
- [x] Add validation for freshness metadata.
- [x] Add tests for invalid source payloads.

## Phase 3 - Calculation Service

- [x] Add `generateDentalGrowthReviewDraftFromSourceBatch`.
- [ ] Input:
  - [ ] source batch id
  - [ ] client id
  - [ ] viewer
  - [ ] repositories
- [x] Output:
  - [x] validated `dentalGrowthReviewPeriods` draft
  - [x] `calculation_source_batch_id`
  - [x] `calculated_at`
  - [x] `calculation_version`
- [x] Calculate exactly 6 hero metrics:
  - [x] Bookings This Period
  - [x] Attended Appointments
  - [x] Projected 90-Day Revenue Range
  - [x] Total Marketing Investment
  - [x] Cost Per New/Reactivated Patient
  - [x] Biggest Funnel Leak
- [x] Calculate funnel conversion.
- [x] Calculate speed-to-lead and channel attribution.
- [x] Calculate reactivation track performance.
- [x] Calculate deliverability and team health.
- [x] Calculate reputation and referral health.
- [x] Calculate source freshness.
- [x] Generate draft narrative suggestions.
- [x] Generate max 3 draft decisions.
- [x] Never publish from generation.

## Phase 4 - Admin Workflow Correction

- [x] Remove or demote `New Growth Review`.
- [x] Replace primary action with `Import Source Data`.
- [x] Add source import preview:
  - [x] normalized source payload summary
  - [x] validation errors
  - [x] source freshness
  - [x] affected metric groups
  - [x] per-section calculation readiness
- [x] Add `Generate Draft` action after valid source import.
- [x] Show source batch table/status in admin reporting workspace.
- [x] Link generated dashboard records back to the source batch.
- [x] Keep explicit publish/archive actions on generated draft records.

## Phase 5 - Editorial-Only Editing

- [x] Replace current full Growth Review editor with an editorial review editor.
- [x] Editable fields:
  - [x] executive summary
  - [x] top alert copy
  - [x] 3 wins
  - [x] 3 losses
  - [x] 3 next actions
  - [x] decisions
  - [x] watching
  - [x] shipped loops
  - [x] experiment notes
- [x] Read-only calculated fields:
  - [x] hero metrics
  - [x] funnel
  - [x] speed-to-lead
  - [x] channel attribution
  - [x] reactivation metrics
  - [x] deliverability metrics
  - [x] reputation/referral metrics
  - [x] freshness statuses
- [x] Show calculated fields as read-only preview inside the editor.
- [x] Do not allow silent metric changes.
- [ ] If a metric override is introduced later, require:
  - [ ] `override_reason`
  - [ ] `overridden_by`
  - [ ] `overridden_at`
  - [ ] visible `Manual override` label

## Phase 6 - Dashboard Preview And Publish Boundary

- [x] Keep `/dashboards/dental-growth-review?preview=draft` agency-admin only.
- [x] Show source batch and calculation timestamp in draft preview.
- [x] Show `Draft preview` badge.
- [x] Published client dashboard must ignore draft records.
- [x] Archived published records remain readable where supported.

## Phase 7 - Tests

- [x] Source batch import creates source batch only.
- [x] Source batch import does not create a published dashboard.
- [x] Generation creates a `draft` Dental Growth Review period.
- [x] Calculated hero metrics are derived from source payload.
- [x] LTV:CAC is rejected as a weekly hero metric.
- [x] Generated review has exactly 9 zones.
- [x] Generated review has exactly 6 hero metrics.
- [x] Patient-level fields are rejected.
- [x] Editorial save cannot mutate calculated metrics.
- [x] Admin can preview generated draft.
- [x] Client admin cannot preview generated draft by URL.
- [x] Publish is explicit.
- [x] Published dashboard is visible to allowed client users.

## First Implementation Slice

Do this first:

- [x] Add source batch entity and repository collection.
- [x] Add JSON source batch import service.
- [x] Add minimal calculation service for the six hero metrics, source freshness, and period context.
- [x] Replace `New Growth Review` button with `Import Source Data`.
- [x] Make existing Growth Review editor narrative-only.
- [x] Add unit tests proving import -> source batch -> generated draft -> publish boundary.

## Non-Goals For First Slice

- [ ] Do not build API connectors yet.
- [ ] Do not build webhook endpoints yet.
- [ ] Do not implement manual metric override yet.
- [ ] Do not fully automate every diagnostic zone in the first pass.
- [ ] Do not publish automatically from import or generation.
