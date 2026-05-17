# Clinic Client Portal Information Architecture

```text
Document type: Product direction / vertical IA reference
Product area: Clinic-facing client portal
Target direction: Patient acquisition + booking + compliance + reputation control center
Status: Planning source for the clinic vertical refactor
Related docs:
- docs/research/client-control-center-information-architecture.md
- docs/research/client-analytics-dashboard-ui-recommendations.md
- docs/implementation/clinic-client-portal-refactor-checklist.md
```

## 1. Core Decision

The clinic version of the portal should not be primarily a project-status portal.

For clinics, the product should become a **clinic growth operations portal** focused on:

```text
- patient acquisition
- booking pipeline performance
- call/front-desk leakage
- service line and location performance
- reputation and local trust
- compliance, medical approvals, and platform policy risk
- client actions needed from the clinic
```

The existing Client Control Center foundation remains useful, but the clinic template must shift the center of gravity away from generic agency work visibility and toward the question:

```text
Are we turning online demand into booked patients safely, measurably, and without losing patients in the clinic operation?
```

## 2. Fit With Current Product

Current architecture is directionally useful, but the current product framing is still too generic.

Strong fit:

```text
- Overview as a compact control center.
- Action Needed as the client's operational inbox.
- Reports & Dashboards as the interpreted proof-of-value area.
- Published/draft/client-safe visibility boundaries.
- Files/assets, updates, requests, access, and preview-as-client flows.
- Performance dashboard support for business KPIs, funnel, service sections, and booked calls.
```

Main gaps:

```text
- Projects is too central for clinic users.
- Reports & Dashboards is too generic for healthcare growth operations.
- Calls & Bookings is not first-class.
- Compliance & Approvals is not first-class.
- Reputation/local trust is not first-class.
- Service lines and locations are not first-class analytical dimensions.
- Action Needed does not yet include clinic operations and medical approval action types.
```

The correct interpretation is:

```text
Architecture fit: strong enough to reuse.
Product fit: needs a vertical clinic refactor.
```

## 3. Clinic User Questions

A clinic owner or practice manager enters the portal to answer:

```text
1. How many new patient inquiries, calls, and bookings came in?
2. Where did they come from?
3. How many became booked appointments?
4. Where are we losing patients: ads, landing page, form, call handling, reception, availability, reviews?
5. Which services, locations, and campaigns are working?
6. Are claims, ads, tracking, and patient data handling compliant enough to launch or keep running?
7. What does the clinic need to approve, provide, fix, or confirm?
```

This is broader than marketing reporting. It includes clinic operations because marketing demand often leaks at the booking/front-desk layer.

## 4. Recommended Clinic Sitemap

```text
Clinic Client Portal
├── Overview
├── Patient Acquisition
├── Calls & Bookings
├── Campaigns / Service Lines
├── Reputation
├── Compliance & Approvals
├── Action Needed
├── Reports
├── Files & Assets
└── Settings / Access
```

Relationship to the generic Client Control Center:

| Generic destination | Clinic destination |
| --- | --- |
| Overview | Overview with clinic growth KPIs |
| Action Needed | Action Needed with clinic operations/compliance action types |
| Projects | Campaigns / Service Lines, with project/work status as secondary |
| Reports & Dashboards | Patient Acquisition, Calls & Bookings, Reputation, Compliance context, Reports |
| Files & Links | Files & Assets |
| Requests | Can remain as clinic-initiated asks, but secondary to Action Needed |
| Updates | Can remain as curated history or be folded into Reports/Overview |
| Settings | Settings / Access |

## 5. Page Ownership

### 5.1 Overview

Purpose:

```text
Give the clinic owner/practice manager a 10-20 second business status check.
```

Primary blocks:

```text
- overall status
- new patient inquiries
- booked appointments
- cost per booked appointment
- missed calls
- reviews gained
- top service line
- top location
- compliance issues
- clinic actions needed
- next report date
```

Overview should not become the full analytics page. It should preview acquisition, booking leakage, reputation, compliance risk, and urgent clinic actions.

### 5.2 Patient Acquisition

Purpose:

```text
Show how marketing demand becomes patient demand.
```

Primary funnel:

```text
impressions
→ clicks
→ landing page visits
→ calls / forms / chats
→ qualified inquiries
→ booked appointments
→ attended appointments, optional
→ treatment revenue, optional later
```

Filters:

```text
- location
- service line
- campaign
- channel
- reporting period / date range
```

Core metrics:

```text
- inquiries
- booked appointments
- cost per inquiry
- cost per booked appointment
- booking conversion rate
- inquiry source mix
- leakage insight
```

### 5.3 Calls & Bookings

Purpose:

```text
Expose whether patient demand is being converted by the clinic operation.
```

Primary metrics:

```text
- total calls
- first-time caller calls
- answered calls
- missed calls
- answered rate
- booked from calls
- form leads
- average response time
- no-response leads
- not-booked reasons
- peak call times
```

Product rule:

```text
The portal should identify booking/front-desk leakage without storing patient-level health data in MVP.
```

### 5.4 Campaigns / Service Lines

Purpose:

```text
Show performance by the way clinics think about growth: service lines, locations, and capacity.
```

Example service lines:

```text
- dental implants
- veneers
- IVF consultation
- dermatology treatment
- laser treatment
- urgent care
- podiatry
- physiotherapy
- mental health consultation
```

Per service line:

```text
- status
- spend
- inquiries
- booked appointments
- cost per inquiry
- cost per booked appointment
- conversion rate
- landing page status
- ad approval status
- compliance status
- capacity note
- location breakdown
```

Campaign statuses:

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

### 5.5 Reputation

Purpose:

```text
Show local trust and review health as part of patient acquisition.
```

Primary blocks:

```text
- Google rating
- review count
- reviews gained
- unanswered reviews
- negative reviews
- review response drafts
- review request campaign status
- Google Business Profile updates
- provider profile completeness
- local visibility / map pack notes
```

Reputation should connect to Action Needed when the clinic must approve a response, respond to a negative review, provide proof assets, or improve provider profiles.

### 5.6 Compliance & Approvals

Purpose:

```text
Make medical, legal, privacy, and platform-policy approval state visible and auditable.
```

Approval items:

```text
- medical claims
- ad copy
- landing pages
- doctor bios
- service descriptions
- before/after images
- testimonials
- treatment pricing
- consent language
- privacy/cookie/tracking setup
```

Compliance items:

```text
- claims awaiting doctor approval
- rejected / limited ads
- platform policy risks
- tracking/privacy setup status
- consent/cookie notes
- approved asset history
```

Approval statuses:

```text
pending_medical_review
changes_requested
approved
rejected
expired
```

Compliance statuses:

```text
not_reviewed
in_review
approved
risk_flagged
blocked
limited_by_policy
```

Product rule:

```text
For clinics, approvals are not just design sign-off. They can represent medical accuracy, patient privacy, ad platform eligibility, and legal/compliance risk.
```

### 5.7 Action Needed

Purpose:

```text
Show only clinic-owned actions that unblock growth, compliance, booking, reputation, or access.
```

Clinic action types:

```text
approve_medical_claim
approve_ad_copy
approve_landing_page
send_doctor_photos
send_doctor_bio
send_credentials
confirm_service_pricing
confirm_treatment_capacity
provide_gbp_access
connect_call_tracking
fix_missed_call_follow_up
approve_call_script
respond_to_negative_review
approve_review_response
confirm_appointment_availability
```

Action card fields:

```text
title
type
related service line
related location
related campaign
why needed
patient/business impact
compliance risk if delayed
due date
owner
status
primary action
```

### 5.8 Reports

Purpose:

```text
Human-written monthly/weekly summaries that explain patient acquisition, booking leakage, compliance, reputation, and next actions.
```

Clinic report sections:

```text
- patient acquisition summary
- booked appointments
- cost per booked appointment
- service line winners and losers
- location performance
- missed call / booking leakage
- reputation changes
- compliance issues
- agency work completed
- clinic actions needed
- next month plan
```

## 6. Data Model Direction

Add clinic-specific entities/read models:

```text
ClinicProfile
ClinicLocation
ClinicServiceLine
PatientAcquisitionSnapshot
BookingPipelineSnapshot
CallBookingMetric
ServiceLinePerformance
LocationPerformance
ReputationSnapshot
ComplianceReview
MedicalApproval
ClinicAction
```

MVP data principle:

```text
Use aggregated clinic metrics. Do not store patient-level health data.
```

Allowed MVP examples:

```text
12 calls
7 booked appointments
3 missed calls
cost per booked appointment: 85 EUR
```

Avoid in MVP:

```text
Named patient records
diagnosis-level tracking
patient medical notes
raw PHI
ad-click-to-patient identity attribution
```

## 7. Admin Requirements

Admin clinic setup should support:

```text
- choose client type: clinic
- define clinic specialty
- define locations
- define service lines
- define target services
- set capacity notes
- enter/import monthly clinic metrics
- manage compliance reviews
- manage approval requests
- publish clinic performance snapshot
- preview as clinic client
```

Admin reporting/editor surfaces should support:

```text
- patient acquisition metrics
- calls/bookings metrics
- service line performance
- location performance
- reputation snapshot
- compliance notes
- narrative clinic report
```

## 8. Integration Direction

MVP can be manual/import-first.

Future integration priorities:

```text
1. Google Ads
2. Meta Ads
3. GA4
4. Google Search Console
5. Call tracking: CallRail / Nimbata / WhatConverts
6. Booking/scheduling source
7. Google Business Profile / reviews
8. CRM/practice management only with strict aggregate-data boundaries
```

Do not build early:

```text
- full EHR / EMR integration
- patient medical records
- clinical notes
- diagnosis-level tracking
- raw PHI attribution
- doctor schedule management
- patient portal for patients
- full CRM replacement
- remarketing automation without compliance layer
- automated medical claims generation
```

## 9. Evidence References

Use the following source directions when writing future use cases and acceptance criteria:

```text
- Healthcare agencies position work as patient acquisition, attribution, capacity, and appointment growth.
- HIPAA/GDPR and ad platform healthcare policies make compliance/approval state a first-class product concern.
- Clinic conversion often happens through calls, forms, bookings, and front-desk response, not only web conversions.
- Local SEO, Google Business Profile, and reviews materially affect patient acquisition.
- Clinic MVP should aggregate metrics and avoid patient-level health data.
```

Reference examples provided during product planning:

```text
Cardinal Digital Marketing / Upperline Health case
HHS HIPAA marketing guidance
HHS online tracking technologies guidance
Google Ads Healthcare and medicines policy
Google health in personalized advertising policy
Meta health/wellness advertising policy
EDPS/GDPR health data guidance
Straight North healthcare marketing analytics
Tebra review strategy content
Nimbata healthcare call tracking positioning
Healthcare Success multi-location healthcare marketing positioning
Intrepy healthcare marketing positioning
```

## 10. Final Product Positioning

Do not position the clinic product as:

```text
Client task portal for agencies
```

Position it as:

```text
Client visibility portal for healthcare marketing agencies:
patient acquisition, bookings, reputation, approvals, compliance, and reports in one place.
```

The product promise:

```text
Help clinics turn online demand into booked patients, safely and measurably.
```
