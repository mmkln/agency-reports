# UC-004 JSON Import Contract

```text
Document type: Implementation Contract
Product: Agency Client Portal Aggregator
Use case ID: UC-004
Use case name: Client Performance Dashboard
Status: Frontend/localStorage MVP
```

## Purpose

This document defines the JSON shape that can be imported into the UC-004 Performance Dashboard module.

The current implementation supports:

```text
- manual admin entry
- prepared JSON import
- future integration adapters that write the same normalized contract
```

The frontend must treat imported JSON as a draft. Import must never publish a dashboard automatically.

## Top-Level Object

```json
{
  "client_id": "string uuid",
  "title": "June 2026 Marketing Performance",
  "period_start": "2026-06-01",
  "period_end": "2026-06-30",
  "data_confidence": "high | medium | low | estimated",
  "last_updated_at": "2026-07-01T09:00:00.000Z",
  "attribution_note": "Manual import from source systems.",
  "source_summary": "GA4, Google Ads, CRM export",
  "content": {}
}
```

Required before publishing:

```text
client_id
title
period_start
period_end
data_confidence
last_updated_at
content.executive_summary.narrative
content.hero_metric.label
content.hero_metric.value
content.kpi_cards[0]
content.insights[0]
content.next_steps[0]
```

Import behavior:

```text
- imported records are normalized
- status is forced to draft
- data_mode is forced to json_import
- selected admin client overrides/controls client assignment in the import UI
- invalid JSON cannot overwrite existing dashboard data
```

## Core Content Shape

```json
{
  "content": {
    "executive_summary": {
      "narrative": "Plain-language client-facing summary.",
      "main_win": "Primary positive result.",
      "main_issue": "Primary caveat or issue.",
      "next_focus": "What the agency will focus on next."
    },
    "hero_metric": {
      "label": "Qualified Leads",
      "value": 81,
      "unit": "",
      "delta_pct": 18,
      "goal_pct": 108,
      "status": "ahead | on_track | behind | neutral",
      "source": "CRM export",
      "definition": "What this metric means."
    },
    "kpi_cards": [],
    "goals": [],
    "trends": [],
    "funnel": {},
    "channel_breakdown": [],
    "service_sections": [],
    "agency_work": {
      "completed": [],
      "active": [],
      "next": []
    },
    "insights": [],
    "next_steps": [],
    "appendix_tables": [],
    "campaign_execution": {}
  }
}
```

## Agency Work Shape

Use `content.agency_work` when the dashboard needs period-specific manual "what we did" notes.

The client performance page also reads client-visible tasks and updates from UC-001 source records. `agency_work` is for concise dashboard-period context that should live with the analytics period.

```json
{
  "agency_work": {
    "completed": [
      "Launched Meta retargeting campaign",
      "Connected CRM conversion event baseline"
    ],
    "active": [
      "Optimizing landing page conversion path"
    ],
    "next": [
      "Prepare next creative testing batch"
    ]
  }
}
```

Rules:

```text
- keep each item short and client-facing
- do not include internal notes
- do not duplicate long task descriptions from UC-001
- use this only when a dashboard-period snapshot is useful
```

## Campaign Execution Shape

Use `content.campaign_execution` for campaign plans like patient reactivation, win-back, nurture sequences, launch timelines, or any dashboard where the client needs to see planned operational volume over time.

This is the data structure used for the SMS/email/manager-call stacked chart with cumulative booking projection.

```json
{
  "campaign_execution": {
    "title": "Patient Reactivation Campaign Plan",
    "subtitle": "Planned reactivation touches across SMS, email, and manager calls.",
    "left_axis_label": "Touches per day",
    "right_axis_label": "Cumulative bookings",
    "kpis": [],
    "tracks": [],
    "activity_series": [],
    "assumptions": []
  }
}
```

### Campaign KPI

```json
{
  "id": "sms-sent",
  "label": "SMS sent",
  "value": "~1,660",
  "unit": "",
  "tone": "blue",
  "helper_text": "Optional short explanation",
  "display_order": 2
}
```

Supported tones are UI conventions, not domain enums:

```text
neutral
blue
green
orange
amber
purple
red
```

### Campaign Track

```json
{
  "id": "track-a",
  "label": "Track A - gentle reactivation (wk 2-7)",
  "start_week": 2,
  "end_week": 7,
  "start_date": "2026-06-08",
  "end_date": "2026-07-17",
  "tone": "green",
  "display_order": 2
}
```

Use week fields for planning models and date fields when exact campaign dates are known.

### Activity Series Point

```json
{
  "date": "2026-06-08",
  "label": "06-08",
  "sms": 27,
  "email": 13,
  "manager_calls": 0,
  "cumulative_bookings": 1
}
```

Rules:

```text
- sms, email, and manager_calls render as stacked daily touch volume
- cumulative_bookings renders as the dashed projection line on the right axis
- use business-day points for operational plans
- if the source only has weekly data, use one point per week and label it clearly
```

### Assumptions

```json
[
  "Business days only. Dates are illustrative and assume a Monday June 1, 2026 start.",
  "Volumes are planning estimates after approximately 5% touch attrition."
]
```

Assumptions are client-facing. They should explain trust and caveats, not expose internal notes.

## Minimal Campaign Execution Example

```json
{
  "client_id": "00000000-0000-4000-8000-000000000000",
  "title": "June 2026 Patient Reactivation Campaign",
  "period_start": "2026-06-01",
  "period_end": "2026-09-11",
  "data_confidence": "estimated",
  "last_updated_at": "2026-05-16T09:00:00.000Z",
  "attribution_note": "Planning model based on patient list size, business-day touch limits, and estimated booking response rates.",
  "source_summary": "Manual campaign plan and CRM patient count.",
  "content": {
    "executive_summary": {
      "narrative": "This dashboard models a 15-week patient reactivation campaign.",
      "main_win": "The client can see expected outreach volume and booking lift before execution starts.",
      "main_issue": "Bookings are projections until campaign responses begin.",
      "next_focus": "Launch the pilot track and monitor early response quality."
    },
    "hero_metric": {
      "label": "Projected Bookings",
      "value": "38-42",
      "goal_pct": 100,
      "status": "on_track",
      "source": "Manual planning model",
      "definition": "Estimated cumulative bookings from the full reactivation sequence."
    },
    "kpi_cards": [
      {
        "id": "patients",
        "label": "Patients",
        "value": 804,
        "status": "neutral",
        "source": "CRM list export"
      }
    ],
    "campaign_execution": {
      "title": "Patient Reactivation Campaign Plan",
      "subtitle": "Planned reactivation touches with cumulative booking projection.",
      "left_axis_label": "Touches per day",
      "right_axis_label": "Cumulative bookings",
      "kpis": [
        { "id": "patients", "label": "Patients", "value": 804, "tone": "neutral" },
        { "id": "sms-sent", "label": "SMS sent", "value": "~1,660", "tone": "blue" },
        { "id": "emails-sent", "label": "Emails sent", "value": "~1,580", "tone": "green" },
        { "id": "manager-calls", "label": "Manager calls", "value": "~870", "tone": "orange" },
        { "id": "projected-bookings", "label": "Proj. bookings", "value": "38-42", "tone": "amber" },
        { "id": "duration", "label": "Duration", "value": "~15 wk", "tone": "neutral" }
      ],
      "tracks": [
        { "id": "track-r", "label": "Track R - pilot (wk 1-2)", "start_week": 1, "end_week": 2, "tone": "orange" },
        { "id": "track-a", "label": "Track A - gentle reactivation (wk 2-7)", "start_week": 2, "end_week": 7, "tone": "green" },
        { "id": "track-b", "label": "Track B - core reactivation (wk 5-13)", "start_week": 5, "end_week": 13, "tone": "blue" },
        { "id": "track-c", "label": "Track C - win-back (wk 10-15)", "start_week": 10, "end_week": 15, "tone": "purple" }
      ],
      "activity_series": [
        { "date": "2026-06-01", "label": "06-01", "sms": 14, "email": 0, "manager_calls": 0, "cumulative_bookings": 0 },
        { "date": "2026-06-08", "label": "06-08", "sms": 27, "email": 13, "manager_calls": 0, "cumulative_bookings": 1 },
        { "date": "2026-06-15", "label": "06-15", "sms": 27, "email": 13, "manager_calls": 0, "cumulative_bookings": 2 }
      ],
      "assumptions": [
        "Business days only.",
        "Volumes are planning estimates."
      ]
    },
    "insights": [
      {
        "id": "campaign-structure",
        "title": "Reactivation sequence is staged by patient responsiveness",
        "body": "The campaign starts with lower-friction SMS/email touches and adds manager calls once warmer patient segments have been identified.",
        "severity": "positive"
      }
    ],
    "next_steps": [
      {
        "id": "launch-pilot",
        "title": "Launch pilot track and monitor early response quality",
        "description": "Run the first two weeks with conservative volume, then adjust call capacity before scaling.",
        "owner": "Agency",
        "due_date": "2026-06-01",
        "priority": "high"
      }
    ]
  }
}
```

## Future Integration Mapping

Future integrations should write into this same contract instead of creating integration-specific UI data shapes.

```text
Google Ads / Meta Ads:
- kpi_cards
- trends
- channel_breakdown
- appendix_tables

GA4 / Search Console:
- funnel
- trends
- service_sections
- appendix_tables

CRM / GHL / HubSpot / Salesforce:
- hero_metric
- kpi_cards
- funnel
- campaign_execution.activity_series.cumulative_bookings

Klaviyo / Mailchimp / ActiveCampaign / Twilio:
- campaign_execution.activity_series.email
- campaign_execution.activity_series.sms
- service_sections

CallRail / WhatConverts:
- kpi_cards
- funnel.booked_calls
- campaign_execution.activity_series.manager_calls
```

## Implementation Files

```text
src/entities/performance-dashboard/model.js
src/domain/services/adminPerformanceDashboardService.js
src/domain/services/clientPerformanceDashboardService.js
src/features/admin-performance-dashboards/components/PerformanceDashboardJsonImportModal.jsx
src/pages/client/performance/ClientPerformancePage.jsx
src/shared/charts/StackedBarLineChart.jsx
```
