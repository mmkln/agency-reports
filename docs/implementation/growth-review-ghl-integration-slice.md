# Growth Review GHL Integration Slice

## Purpose

The Growth Review dashboard must be calculated from integration events, not hand-authored reporting records.

This slice implements the first local/backend-ready path:

```text
GHL / Make event
-> POST /api/integrations/ghl/events
-> raw_ghl_events
-> normalized clinic records
-> calculated dental_growth_review_periods record
-> /client/growth-review reads the calculated period
```

## Dev Endpoints

```text
POST /api/integrations/ghl/events
GET  /api/client/growth-review?clientId=:id&start=YYYY-MM-DD&end=YYYY-MM-DD
```

These are Vite dev middleware endpoints backed by the existing snapshot repository store.

To make the frontend read the same dev API store, run with:

```text
VITE_PORTAL_DATA_CLIENT_ADAPTER=httpSnapshot
```

## Added Repository Tables

```text
raw_ghl_events
normalized_leads
normalized_contact_events
normalized_bookings
growth_review_snapshots
```

The current UI still consumes `dental_growth_review_periods`; the calculation service writes a calculated published period there for compatibility.

## First Calculated Metrics

GHL-safe metrics:

```text
Bookings
Leads Received
Lead -> Contacted
Lead -> Booked
Median First Reply
```

Explicit unavailable metric:

```text
Attended Appointments
```

Reason:

```text
GHL is not the source of truth for attendance unless PMS/Weave attendance is synced back into GHL.
```

## What Make Should Send First

Minimum event types:

```text
contact_created
opportunity_created
opportunity_stage_changed
appointment_created
conversation_message
workflow_touch_event
```

Minimum payload shape:

```json
{
  "client_id": "client-1",
  "location_id": "ghl-location-1",
  "event_id": "ghl-event-id",
  "event_type": "appointment_created",
  "occurred_at": "2026-05-12T09:00:00.000Z",
  "contact_id": "ghl-contact-id",
  "appointment_id": "ghl-appointment-id",
  "source": "facebook lead",
  "tags": ["Track A"],
  "period_start": "2026-05-11",
  "period_end": "2026-05-17"
}
```

## Current Non-Goals

```text
No direct GHL OAuth/API connector yet.
No PMS/Weave/Dentrix metrics yet.
No marketing spend import yet.
No manual dashboard admin editor.
No patient-level data.
```
