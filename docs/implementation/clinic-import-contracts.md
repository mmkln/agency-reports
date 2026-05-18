# Clinic Import Contracts

```text
Document type: Implementation Contract
Product area: Clinic client portal
Status: Frontend/localStorage MVP
Runtime normalizer: src/domain/services/clinicImportContractService.js
Primary reference: docs/research/clinic-client-portal-information-architecture.md
```

## Purpose

Clinic imports provide one stable aggregate-data contract for manual CSV/JSON imports and future connectors.

The contract feeds:

```text
- Patient Acquisition
- Calls & Bookings
- Campaigns / Service Lines
- Reputation
- Compliance & Approvals
```

Imports must never publish records automatically. Normalized imported rows are draft-only until an agency admin explicitly publishes them from the owning admin workspace.

## Hard Safety Rule

Clinic MVP imports are aggregate-only.

Allowed:

```text
12 calls
7 booked appointments
3 missed calls
cost per booked appointment: 85
Google rating: 4.8
open compliance issues: 3
```

Rejected anywhere in the payload:

```text
patient_name
patient_email
patient_phone
patient_id
date_of_birth / dob
diagnosis
medical_record / medical_record_number / mrn
```

The domain normalizer rejects these keys recursively before connector data can reach admin save workflows.

## Top-Level Shape

```json
{
  "contract_version": "clinic-import-v1",
  "client_id": "33333333-3333-4333-8333-333333333333",
  "imported_at": "2026-06-01T09:00:00.000Z",
  "source_summary": "Google Ads, CallRail, GBP, and compliance spreadsheet.",
  "reporting_period": {
    "start_date": "2026-05-01",
    "end_date": "2026-05-31",
    "label": "May 2026"
  },
  "patient_acquisition_metrics": [],
  "calls_bookings_metrics": [],
  "service_line_performance": [],
  "reputation_snapshots": [],
  "compliance_reviews": []
}
```

The normalizer also accepts connector-style grouped sections. Use this shape when source adapters export one grouped object instead of separate top-level arrays:

```json
{
  "contract_version": "clinic-import-v1",
  "client_id": "33333333-3333-4333-8333-333333333333",
  "metrics": {
    "patient_acquisition": [],
    "calls_bookings": [],
    "service_lines": []
  },
  "reputation": {
    "reputation_snapshots": []
  },
  "compliance": {
    "compliance_reviews": []
  }
}
```

`reporting_period` may be top-level or repeated per row. Period-based rows require:

```text
period_start / start_date
period_end / end_date
period_label / label
```

## Patient Acquisition Metrics

Use this for demand and acquisition funnel rollups.

```json
{
  "id": "optional-stable-row-id",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "period_label": "May 2026",
  "channel": "google_ads",
  "service_line_id": "service-line-id",
  "location_id": "location-id",
  "impressions": 12800,
  "clicks": 310,
  "landing_page_visits": 250,
  "calls": 22,
  "forms": 8,
  "chats": 3,
  "qualified_inquiries": 19,
  "booked_appointments": 14,
  "attended_appointments": 11,
  "spend": 2400,
  "summary": "Implants drove the strongest booking volume.",
  "insight": "Search traffic converted better after landing page copy changes.",
  "data_source": "Google Ads + booking rollup"
}
```

Supported channels:

```text
google_ads
meta_ads
organic
referral
direct
other
```

Normalized output maps to `saveAdminClinicMetrics().input.patientAcquisitionSnapshots`.

## Calls & Bookings Metrics

Use this for call handling, front-desk leakage, and booking conversion.

```json
{
  "id": "optional-stable-row-id",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "period_label": "May 2026",
  "service_line_id": "service-line-id",
  "location_id": "location-id",
  "total_calls": 41,
  "first_time_calls": 31,
  "answered_calls": 36,
  "missed_calls": 5,
  "booked_from_calls": 19,
  "form_leads": 8,
  "average_response_seconds": 82,
  "no_response_leads": 2,
  "follow_up_needed_count": 4,
  "not_booked_reasons": [
    {
      "reason": "No suitable appointment slot",
      "count": 3
    }
  ],
  "peak_call_times": [
    {
      "label": "Weekdays 9-11 AM",
      "call_count": 12,
      "missed_calls": 2,
      "booked_from_calls": 5
    }
  ],
  "summary": "Missed calls remain the main booking leakage.",
  "insight": "Front desk response improved, but peak-hour coverage is still thin.",
  "data_source": "CallRail aggregate export"
}
```

Normalized output maps to `saveAdminClinicMetrics().input.callBookingMetrics`.

## Service Line Performance

Use this for Campaigns / Service Lines reporting. It is aggregate-only and persists as the `ServiceLinePerformance` source record.

```json
{
  "id": "optional-stable-row-id",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "period_label": "May 2026",
  "service_line_id": "service-line-id",
  "location_id": "location-id",
  "campaign_name": "Implants search",
  "campaign_status": "live",
  "spend": 2400,
  "inquiries": 19,
  "booked_appointments": 14,
  "cost_per_inquiry": 126.32,
  "cost_per_booked_appointment": 171.43,
  "landing_page_status": "Live",
  "ad_approval_status": "Approved",
  "compliance_status": "approved",
  "capacity_note": "Three consult slots available weekly.",
  "summary": "Implants are on target for May."
}
```

Supported campaign statuses:

```text
planned
waiting_clinic_approval
compliance_review
live
limited_by_policy
optimizing
paused
completed
```

Supported compliance statuses:

```text
not_reviewed
in_review
approved
risk_flagged
blocked
limited_by_policy
```

## Reputation Snapshots

Use this for Google Business Profile and local trust rollups.

```json
{
  "id": "optional-stable-row-id",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "period_label": "May 2026",
  "location_id": "location-id",
  "google_rating": 4.8,
  "review_count": 318,
  "reviews_gained": 16,
  "unanswered_reviews": 2,
  "negative_reviews": 1,
  "review_response_drafts": 3,
  "review_request_sent": 120,
  "gbp_updates": 4,
  "provider_profile_completeness": 92,
  "local_visibility_note": "Map visibility improved for implants near downtown.",
  "summary": "Review velocity improved.",
  "insight": "Negative review response still needs clinic approval.",
  "data_source": "Google Business Profile export"
}
```

Normalized output maps to `saveAdminClinicReputation().input.reputationSnapshots`.

## Compliance Review Items

Use this for policy, privacy, tracking, and approval risk rollups.

```json
{
  "id": "optional-stable-row-id",
  "title": "Implants campaign policy review",
  "platform": "Google Ads",
  "service_line_id": "service-line-id",
  "location_id": "location-id",
  "status": "risk_flagged",
  "open_issues": 3,
  "blocked_items": 0,
  "limited_ads": 2,
  "pending_approvals": 1,
  "summary": "Two ads are limited by policy pending claim edits.",
  "risk_note": "Avoid before/after claims until medical approval is recorded.",
  "next_action": "Doctor approval needed for revised landing page claim.",
  "data_source": "Manual compliance review"
}
```

Normalized output maps to `saveAdminClinicCompliance().input.complianceReviews`.

## Future Connector Mapping

```text
Google Ads:
- patient_acquisition_metrics: spend, impressions, clicks, channel, campaign/service line mapping
- service_line_performance: campaign status, spend, inquiries/bookings after offline import
- compliance_reviews: limited ads, disapproved ads, policy risk summaries

Meta Ads:
- patient_acquisition_metrics: spend, impressions, clicks, inquiries where compliant
- service_line_performance: campaign status and creative/service-line rollup
- compliance_reviews: health/wellness policy risk and limited delivery summaries

GA4:
- patient_acquisition_metrics: landing page visits, forms/chats, source/channel context
- service_line_performance: landing page status and service-line conversion context

Google Search Console:
- patient_acquisition_metrics: organic visibility context where mapped to service pages
- service_line_performance: service-line search visibility rollups

CallRail / Nimbata / WhatConverts:
- calls_bookings_metrics: total calls, first-time calls, answered/missed calls, booked-from-call rollup
- calls_bookings_metrics: peak call windows when the call platform provides aggregate time buckets
- patient_acquisition_metrics: calls and qualified inquiries after aggregate source mapping

Booking / scheduling source:
- patient_acquisition_metrics: booked appointments and attended appointments
- calls_bookings_metrics: booked-from-call and no-response/follow-up rollups

Google Business Profile / reviews:
- reputation_snapshots: rating, review count, new reviews, unanswered/negative reviews, GBP updates

CRM / practice management:
- aggregate booked appointments, attended appointments, show rates, and treatment revenue only when a compliant aggregate export is available
- no patient identifiers, diagnoses, appointment notes, or patient-level attribution in MVP
```

## Explicitly Deferred Integrations

Do not build these into the MVP import contract:

```text
- EHR / EMR integration
- patient medical records
- clinical notes
- diagnosis-level tracking
- raw PHI attribution
- doctor schedule management
- patient portal for patients
- automated remarketing without compliance review
```

## Implementation Notes

The domain normalizer:

```text
- rejects PHI-like patient-level keys recursively
- normalizes numbers and enums before data reaches admin save workflows
- forces imported rows to draft publish state
- produces admin workflow input shapes for metrics, reputation, and compliance
- normalizes service-line performance for the `service_line_performance` repository
```
