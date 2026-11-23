# New Lead Reporting — backend dashboard spec

Frontend status: routes, workspace tab and page are in place (this PR). The page reuses the
existing analytics dashboard stack (`WeeklyLeadReportPage` with `dashboardKey="new-lead-reporting"`),
so the backend only needs a new dashboard definition behind the existing endpoints.

## Endpoints (existing pattern, new key)

| Method | Path |
|---|---|
| GET | `/api/workspaces/<workspace_id>/analytics/dashboards/new-lead-reporting/?period_key=<key>` |
| POST (refresh) | same as `weekly-lead-report` refresh |
| GET | `.../dashboards/` must list `new-lead-reporting` for workspaces that have it |
| GET | contact drilldowns: `contact_collection` endpoints, same as `weekly-lead-report` |

Access: same as `weekly-lead-report` (agency `VIEW_DASHBOARDS`, workspace `VIEW_DASHBOARDS`).
Response shape: identical to `weekly-lead-report` (see `src/entities/analytics-dashboard/model.js`):
`dashboard`, `period`, `period_catalog`, `status`, `calculated_at`, `permissions`, `widgets[]`.
Supported widget types: `metric_grid`, `breakdown`, `table`, `booking_activity`, `trend`, `funnel`, `heatmap`.

## Data source and counting rules (GHL, per workspace)

All counts are **contacts**, filtered by GHL contact tag and contact **Created** date (never
opportunity created date). Contacts whose name contains "test" (any case) are excluded.

| Channel | Lead tag | Booked | Attended (Showed) | Cancelled | Active |
|---|---|---|---|---|---|
| Meta & Google Ads | `$199_fb_ads_campaign_oct2026` | `$199_booked` | `$199_attended` | `$199_cancelled` | `$199_oct2026_active` |
| Google Call Ads | `google_ads_incoming_call` | `google_ads_booked` | `google_ads_attended` | `google_ads_cancelled` | `google_ads_active` |
| Website | `website_form_submission` | `webform_nurture_booked` | `webform_nurture_attended` | `webform_nurture_cancelled` | `website_form_nurture_active` |

- Received = lead tag + Created in period.
- Upcoming = booked tag AND NOT attended tag AND NOT cancelled tag.
- A contact with two lead tags counts once per channel.
- Tags should live in dashboard settings (like the existing "lead cohort, source tags and
  lifecycle mapping"), not hard-coded.

## Periods — frozen weekly snapshots

- A week is snapshotted once, on the Monday morning after it ends, and never recalculated.
  Later GHL changes appear only in later weeks.
- A new week covers every contact created after the previous snapshot (no gaps between weeks).
- Month / Year / To-date and all-time = sums of the frozen weekly contact lists, so every number
  equals the length of its drilldown list.
- Campaign launch (history start) for Inspo Dental: 2026-10-01; leads created 2026-10-01 to
  2026-10-25 form one "pre-report" block.

## Upcoming appointments by days out

For each Upcoming contact, read contact custom field `contact.report_upcoming_appointment`
(text, filled by GHL workflow "Report - Appointment date sync"; also see
`contact.report_appointment_status`, `contact.report_appointment_calendar`). Fallback: the contact's
next GHL calendar appointment. Days = appointment date − snapshot Monday.
Buckets (one `breakdown` widget, each with a `contact_collection` drilldown):
within 30 days, 31–60, 61–90, 91 days–6 months, more than 6 months, no date found.
Buckets must sum to Upcoming.

## Widgets (suggested order)

1. `metric_grid`: Total leads, Booked appointments (with all-time + drilldowns).
2. `breakdown`: Lead volume by channel (Received per channel, share %).
3. `booking_activity`: Booked / Showed / Cancelled / Upcoming per channel.
4. `breakdown`: Upcoming appointments by days out (buckets above).
5. `breakdown`: Active in sequence per channel.

## Seed data

A reference implementation (static) with the frozen weekly contact lists for 2026-10-01 → 2026-11-23
exists and can be sent as JSON to import as the first snapshots, so historical numbers match the
current report exactly.
