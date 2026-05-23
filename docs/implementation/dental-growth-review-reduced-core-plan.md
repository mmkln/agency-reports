# Dental Growth Review Reduced Core Implementation Plan

## Summary

Reduce the Dental Growth Review from a 9-zone dashboard into a focused clinic operating review page.

The product should no longer behave like a full analytics dashboard. It should behave like a short review ritual:

```text
1. What period are we reviewing?
2. Is important data stale or low-confidence?
3. Did marketing create real patient outcomes?
4. Where exactly is the patient funnel leaking?
5. What worked, what needs attention, and what happens next?
6. What decision is needed from the owner/team?
```

The reduced core is:

```text
Header / Period Context
Top Data Trust Alert if needed
6 Hero Metrics
What Worked / Needs Attention / Next Actions
Core Patient Funnel
Funnel Summary
Decisions Needed
Compact Freshness Footer
```

## Product Rule

- [ ] The client-facing Growth Review page must show only the core review experience.
- [ ] The page must not expose a 9-zone KPI wall.
- [ ] Diagnostic details may exist in data contracts or admin/internal tools, but not as first-class client dashboard sections.
- [ ] Client-facing metrics must remain aggregate-only.
- [ ] Revenue and treatment metrics must show confidence and avoid fake precision.
- [ ] Treatment Accepted is conditional and must not render as a fake stage when PMS/treatment data is unavailable.
- [ ] AI/calculated text is draft support; final published narrative and decisions must be reviewable/editable.

## What Stays In The Core Page

### 1. Header / Period Context

- [ ] Render as compact top header, not a large zone.
- [ ] Show dashboard title: `Dental Growth Review`.
- [ ] Show period type: `weekly | biweekly | custom`.
- [ ] Show period label.
- [ ] Show period start and period end.
- [ ] Show comparison period.
- [ ] Show cadence label.
- [ ] Show one-sentence summary.

Required visible shape:

```text
Dental Growth Review
Bi-weekly: May 4-17, 2026
Compare: Apr 20-May 3, 2026

Bookings increased, but confirmed-to-attended dropped below target.
```

### 2. Top Data Trust Alert

- [ ] Render only when a problem exists.
- [ ] Show stale source warnings.
- [ ] Show low-confidence source warnings.
- [ ] Show only sources that affect hero/funnel metrics.
- [ ] Include affected metrics.
- [ ] Do not render a full source audit in the top area.

Required visible shape:

```text
Meta Ads data is 8 days stale. Cost metrics are low-confidence.
Affects: Total Marketing Investment, Cost Per Patient.
```

### 3. Hero Metrics

- [ ] Render exactly 6 cards maximum.
- [ ] Use 2 rows x 3 cards on desktop where space allows.
- [ ] Keep cards visually quiet and compact.

Keep these 6 metrics:

- [ ] Bookings This Period
- [ ] Attended Appointments
- [ ] Projected 90-Day Revenue Range
- [ ] Total Marketing Investment
- [ ] Cost Per Attended / New Patient
- [ ] Biggest Funnel Leak

Each card shows:

- [ ] Title
- [ ] Big value
- [ ] Delta vs prior period
- [ ] Status
- [ ] Confidence chip only when confidence is `medium`, `low`, or `unavailable`

Each card hides by default:

- [ ] Full source text
- [ ] Formula
- [ ] Long calculation note
- [ ] Benchmark paragraph

Source/formula details may appear in:

- [ ] Tooltip
- [ ] Details drawer
- [ ] Compact freshness footer
- [ ] Admin/internal view

### 4. Narrative Block

- [ ] Rename from `3 Wins / 3 Losses / 3 Next`.
- [ ] Use:

```text
What Worked
Needs Attention
Next Actions
```

- [ ] Render as three narrative columns.
- [ ] Limit each column to max 3 items.

Each item shows:

- [ ] Short title
- [ ] Evidence metric
- [ ] Why it matters
- [ ] Owner
- [ ] Impact level

Generation/editing rules:

- [ ] Initial items may be generated from metric deltas and backlog/action rules.
- [ ] Generated items are draft suggestions.
- [ ] Admin/operator can edit before publish.
- [ ] Published client-visible copy must be reviewable and not treated as immutable AI truth.

### 5. Core Patient Funnel

- [ ] Render one horizontal patient funnel.
- [ ] Keep the funnel as the main diagnostic section.

Core stages:

- [ ] Lead -> Contacted
- [ ] Lead -> Booked
- [ ] Booked -> Confirmed
- [ ] Confirmed -> Attended
- [ ] Attended -> Treatment Accepted, only when treatment data exists

Each stage shows:

- [ ] Stage name
- [ ] Count
- [ ] Conversion percentage
- [ ] Drop-off count
- [ ] Target
- [ ] Status

Treatment Accepted behavior:

- [ ] If PMS/treatment data exists, show the stage.
- [ ] If PMS/treatment data is unavailable, hide the stage or show a compact unavailable note.
- [ ] Do not show fake precision for treatment acceptance.

### 6. Funnel Summary

- [ ] Render as compact summary under the funnel.
- [ ] Do not render as a separate large dashboard block.

Show:

- [ ] Biggest leak
- [ ] Worst change vs prior period
- [ ] Best improvement vs prior period

Required visible shape:

```text
Biggest leak: Confirmed -> Attended
Worst change: Show rate -14 pts
Best improvement: Lead -> Contacted +8 pts
```

### 7. Decisions Needed

- [ ] Render as the strongest bottom section.
- [ ] Show max 3 decision cards.

Each decision card shows:

- [ ] Title
- [ ] Context
- [ ] Recommended decision
- [ ] Estimated impact
- [ ] Owner
- [ ] Due date
- [ ] Status

Decision rules:

- [ ] AI/calculation may suggest a decision draft.
- [ ] Admin/operator can edit decision copy before publish.
- [ ] Do not present AI-generated decisions as final automatic truth.
- [ ] Do not show more than 3 decisions in the client-facing core page.

### 8. Compact Freshness Footer

- [ ] Render as technical detail footer.
- [ ] Do not duplicate the top data trust alert.

Show:

- [ ] Source name
- [ ] Last updated
- [ ] Freshness status
- [ ] Affected metrics

Top alert vs footer:

- [ ] Top alert summarizes only important problems.
- [ ] Footer provides source details.

## What Gets Removed From The Core Page

### 1. Full 9-Zone Structure

Remove as client-facing main page structure:

- [ ] Zone 5 as a first-class section
- [ ] Zone 6 as a first-class section
- [ ] Zone 7 as a first-class section
- [ ] Zone 8 as a first-class section
- [ ] Zone 9 sub-sections except `Decisions Needed`

### 2. Zone 5: Speed-to-Lead & Channel Attribution

Remove from the main client Growth Review:

- [ ] Full speed-to-lead metric grid
- [ ] Full channel attribution table
- [ ] Cost per lead by every source
- [ ] Cost per booking by every source
- [ ] New patients by channel detail
- [ ] Inbound volume by channel detail

Allowed only as supporting data:

- [ ] A source/speed issue may appear in `Needs Attention`.
- [ ] A source/speed issue may trigger `Decisions Needed`.
- [ ] Details may move later to internal/operator diagnostics.

### 3. Zone 6: Reactivation Track Performance

Remove from the main client Growth Review:

- [ ] Track R/A/B/C detailed table
- [ ] Reply rate by track/touch heatmap
- [ ] Email open heatmap
- [ ] A/B test table
- [ ] Cost per booking by track
- [ ] Saturday slot fill rate
- [ ] Cumulative reactivated chart

Allowed only as supporting data:

- [ ] A track winner may appear in `What Worked`.
- [ ] A track leak may appear in `Needs Attention`.
- [ ] A track expansion question may appear in `Decisions Needed`.

### 4. Zone 7: Deliverability & Team Health

Remove from the main client Growth Review:

- [ ] SMS deliverability detail
- [ ] SMS opt-out detail
- [ ] Email deliverability detail
- [ ] Front desk health board
- [ ] Calls made vs target
- [ ] Disposition completion
- [ ] Callback completion
- [ ] Operations health chips

Allowed only as supporting data:

- [ ] A broken workflow may appear in the data trust alert.
- [ ] A contact/response failure may affect funnel stage status.
- [ ] A front desk issue may appear in `Needs Attention` only when it explains the funnel leak.

### 5. Zone 8: Reputation & Referral Health

Remove from core v1:

- [ ] Star rating
- [ ] New reviews
- [ ] Review response rate
- [ ] Patient referrals received
- [ ] Referral trend

Reason:

- [ ] Useful for growth, but not essential to the reduced bi-weekly operating review core.

### 6. Secondary Action Sections

Remove from the main client Growth Review:

- [ ] Watching
- [ ] Recently Shipped / Closed Loops
- [ ] Experiments table

Allowed only when promoted:

- [ ] A watching item may become `Needs Attention`.
- [ ] An experiment may become a `Decision Needed`.
- [ ] A shipped item may become `What Worked` only if it produced measurable impact.

### 7. Heavy Metric Details

Remove from visible hero/funnel UI:

- [ ] Formula text
- [ ] Full source text
- [ ] Long benchmark notes
- [ ] Raw calculation notes
- [ ] Full source audit on every card

Move to:

- [ ] Tooltip
- [ ] Details drawer
- [ ] Compact freshness footer
- [ ] Admin/internal view

### 8. Exact Tables By Default

Remove from default client view:

- [ ] Exact funnel table
- [ ] Full channel table
- [ ] Full source table
- [ ] Detailed diagnostic tables

Keep:

- [ ] Compact summaries only.

## Data And Contract Preparation

- [ ] Keep existing calculated read model until UI reduction is complete.
- [ ] Do not delete repository data fields in the first UI reduction pass.
- [ ] Add reduced page selector/mapper if needed so the widget receives a smaller view model.
- [ ] Preserve diagnostic data in admin/import calculations for future internal diagnostics.
- [ ] Add a clear boundary between `clientCoreReview` and `diagnosticDetails`.
- [ ] Ensure client-facing service never returns patient-level fields.
- [ ] Ensure hidden diagnostics do not render through the client page by accident.

## Implementation Phases

### Phase 1 - Reduced View Model

- [ ] Add reduced core mapper for Dental Growth Review page.
- [ ] Map header/period context.
- [ ] Map top trust alert from stale/low-confidence sources.
- [ ] Map exactly 6 hero metrics.
- [ ] Map narrative groups with renamed labels.
- [ ] Map core funnel stages.
- [ ] Conditionally include Treatment Accepted.
- [ ] Map funnel summary.
- [ ] Map max 3 decisions.
- [ ] Map compact freshness footer.
- [ ] Keep diagnostics out of the client-facing page model.

### Phase 2 - Client Page UI Reduction

- [ ] Remove 9-zone rendering from `/client/growth-review`.
- [ ] Remove zone jump navigation.
- [ ] Remove Executive/Operator mode toggle from the client-facing core page.
- [ ] Render compact header.
- [ ] Render top data trust alert only when needed.
- [ ] Render simplified hero metrics.
- [ ] Render `What Worked / Needs Attention / Next Actions`.
- [ ] Render core funnel.
- [ ] Render compact funnel summary.
- [ ] Render Decisions Needed as bottom action section.
- [ ] Render compact freshness footer.

### Phase 3 - Remove Or Relocate Diagnostic UI

- [ ] Remove Zone 5 client UI from the Growth Review page.
- [ ] Remove Zone 6 client UI from the Growth Review page.
- [ ] Remove Zone 7 client UI from the Growth Review page.
- [ ] Remove Zone 8 client UI from the Growth Review page.
- [ ] Remove Watching/Shipped/Experiments from the main client page.
- [ ] Decide whether diagnostic components stay unused for future internal route or are deleted.
- [ ] If keeping diagnostics, document that they are not part of client core v1.

### Phase 4 - Editorial/Admin Alignment

- [ ] Rename narrative editor labels from `wins/losses/next` to `worked/needs attention/next`.
- [ ] Keep underlying type compatibility if migration is not worth doing yet.
- [ ] Ensure admin can edit summary, alert, narrative, and decisions before publish.
- [ ] Ensure calculated metric fields remain read-only.
- [ ] Keep source import/generate/publish workflow unchanged.

### Phase 5 - Tests

- [ ] Client admin can access `/client/growth-review`.
- [ ] Client sidebar shows `Dental Growth Review`.
- [ ] Client Growth Review no longer renders 9 zone sections.
- [ ] Client Growth Review renders 6 hero metrics max.
- [ ] Client Growth Review renders `What Worked`, `Needs Attention`, and `Next Actions`.
- [ ] Client Growth Review renders core funnel.
- [ ] Treatment Accepted is hidden or marked unavailable when treatment data is unavailable.
- [ ] Decisions Needed renders max 3 decisions.
- [ ] Zone 5/6/7/8 diagnostic text does not render on the client core page.
- [ ] Patient-level fields never render on the client page.
- [ ] Draft preview remains agency-admin only.
- [ ] Published client dashboard ignores draft records.

### Phase 6 - Verification

- [ ] Run `npm run lint`.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Add browser/e2e coverage if the reduced client page becomes final for v1.

## Non-Goals

- [ ] Do not build API connectors in this pass.
- [ ] Do not build webhook endpoints in this pass.
- [ ] Do not delete source batch/import architecture.
- [ ] Do not delete calculated diagnostic data from repositories until the reduced UI is stable.
- [ ] Do not add manual metric override.
- [ ] Do not expose patient-level drilldowns.
- [ ] Do not turn this into a generic AgencyAnalytics/Databox style dashboard.

## Final Target Page

```text
Dental Growth Review
Period + comparison + summary
Data trust alert if needed

6 Hero Metrics

What Worked | Needs Attention | Next Actions

Core Patient Funnel
Biggest leak | Worst change | Best improvement

Decisions Needed

Compact Freshness Footer
```
