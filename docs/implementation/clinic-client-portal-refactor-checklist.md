# Clinic Client Portal Refactor Checklist

```text
Document type: Implementation checklist
Product area: Clinic vertical refactor
Target direction: Patient acquisition + booking + compliance + reputation control center
Primary reference: docs/research/clinic-client-portal-information-architecture.md
Status: In progress
```

## Tracking Rule

Use this checklist as the execution tracker for the clinic-first vertical refactor.

Mark items as complete only after code, tests, and documentation for that item are updated. If an item is deliberately deferred, leave it unchecked and add a short note under the relevant phase.

## Foundation Quality Gate

- [x] Confirm `docs/research/clinic-client-portal-information-architecture.md` is the product source for clinic vertical work.
- [x] Preserve existing Client Control Center visibility, publish, preview, and route guard guarantees.
- [x] Keep clinic MVP data aggregate-only; do not introduce patient-level PHI fields.
- [x] Keep route pages thin and clinic read models domain-owned.
- [ ] Keep clinic actions separate from internal agency tasks.
- [x] Add tests before exposing new clinic-safe data to client routes.

## Phase 0 - Product Contract

- [x] Update `docs/frontend-architecture.md` with the clinic vertical destination model.
- [x] Update `docs/mvp-scope.md` to distinguish generic agency MVP from clinic template direction.
- [x] Update `docs/use-cases/README.md` with the clinic capability mapping.
- [x] Decide whether clinic template is selected per client with `client.type = clinic`.
- [x] Define the clinic template navigation:
  - [x] Overview
  - [x] Patient Acquisition
  - [x] Calls & Bookings
  - [x] Campaigns / Service Lines
  - [x] Reputation
  - [x] Compliance & Approvals
  - [x] Action Needed
  - [x] Reports
  - [x] Files & Assets
  - [x] Settings / Access
- [x] Decide which generic destinations remain available for non-clinic clients.
- [x] Document how `Projects` maps to `Campaigns / Service Lines` for clinic clients.
- [x] Document how `Reports & Dashboards` maps to clinic result destinations.

## Phase 1 - Clinic Domain Model

- [x] Add `ClinicProfile`.
- [x] Add `ClinicLocation`.
- [x] Add `ClinicServiceLine`.
- [x] Add `PatientAcquisitionSnapshot`.
- [ ] Add `BookingPipelineSnapshot`.
- [x] Add `CallBookingMetric`.
- [ ] Add `ServiceLinePerformance`.
- [ ] Add `LocationPerformance`.
- [x] Add `ReputationSnapshot`.
- [x] Add `ComplianceReview`.
- [x] Add `MedicalApproval`.
- [ ] Add `ClinicAction` or extend `NeededFromClient` with clinic-specific action metadata.
- [x] Add repository adapter methods for clinic entities.
- [ ] Add seed data for at least one clinic with:
  - [x] multiple service lines
  - [x] at least one location
  - [x] acquisition metrics
  - [x] calls/bookings metrics
  - [x] reputation snapshot
  - [x] compliance review items
  - [ ] clinic action needed items
- [x] Add schema/version migration handling for new localStorage records.

## Phase 2 - Safety And Permissions

- [x] Add product rule tests that clinic MVP data is aggregate-only.
- [x] Ensure client users only see clinic records for their own client membership.
- [ ] Ensure draft clinic metrics are hidden from client users.
- [ ] Ensure draft compliance/approval items are hidden unless assigned as client actions.
- [ ] Ensure admin preview can read draft clinic surfaces for owned clients.
- [ ] Ensure clinic clients cannot mutate internal agency tasks.
- [ ] Ensure approval decisions record actor, timestamp, version, and decision state.
- [ ] Ensure compliance review state is enforced in domain services, not UI-only checks.

## Phase 3 - Clinic Overview

- [x] Update clinic Overview read model.
- [ ] Add overview KPI preview:
  - [x] new patient inquiries
  - [x] booked appointments
  - [x] cost per booked appointment
  - [x] missed calls
  - [x] reviews gained
  - [x] top service line
  - [x] top location
  - [x] compliance issues
  - [x] clinic actions needed
- [x] Reduce `Projects` prominence for clinic clients.
- [x] Add booking leakage preview.
- [x] Add reputation preview.
- [x] Add compliance risk preview.
- [x] Ensure Overview links to owning clinic destinations instead of embedding full workflows.
- [x] Add client-safe empty/unavailable states.

## Phase 4 - Patient Acquisition

- [x] Add `/client/patient-acquisition` route or clinic-template destination mapping.
- [x] Add `getClientPatientAcquisitionPage` domain service.
- [x] Add `widgets/client-patient-acquisition`.
- [x] Build patient acquisition header/KPI summary.
- [ ] Build funnel:
  - [x] impressions
  - [x] clicks
  - [x] landing page visits
  - [x] calls/forms/chats
  - [x] qualified inquiries
  - [x] booked appointments
  - [x] attended appointments, optional
- [ ] Add filters:
  - [ ] location
  - [ ] service line
  - [ ] campaign
  - [ ] channel
  - [ ] date range / reporting period
- [x] Add leakage insight section.
- [ ] Add source/dashboard links when available.
- [ ] Add tests for filtering and client isolation.

## Phase 5 - Calls & Bookings

- [x] Add `/client/calls-bookings` route or clinic-template destination mapping.
- [x] Add `getClientCallsBookingsPage` domain service.
- [x] Add `widgets/client-calls-bookings`.
- [ ] Build metrics:
  - [x] total calls
  - [x] first-time caller calls
  - [x] answered calls
  - [x] missed calls
  - [x] answered rate
  - [x] booked from calls
  - [x] form leads
  - [x] average response time
  - [x] no-response leads
  - [x] not-booked reasons
  - [ ] peak call times
- [x] Add booking leakage summary.
- [ ] Add clinic action creation/linking for missed-call or slow-response issues.
- [ ] Add tests that missed-call insights do not expose patient-level data.

## Phase 6 - Campaigns / Service Lines

- [x] Add `/client/service-lines` or `/client/campaigns-service-lines` route.
- [x] Add `getClientServiceLinesPage` domain service.
- [x] Add `widgets/client-service-lines`.
- [ ] Build service line cards/table with:
  - [x] status
  - [ ] spend
  - [ ] inquiries
  - [ ] booked appointments
  - [ ] cost per inquiry
  - [ ] cost per booked appointment
  - [ ] conversion rate
  - [ ] landing page status
  - [ ] ad approval status
  - [ ] compliance status
  - [x] capacity note
  - [x] location breakdown
- [ ] Add campaign statuses:
  - [ ] planned
  - [ ] waiting_clinic_approval
  - [ ] compliance_review
  - [ ] live
  - [ ] limited_by_policy
  - [ ] optimizing
  - [ ] paused
  - [ ] completed
- [x] Decide whether generic `Projects` remains as secondary detail or redirects for clinic clients.
- [ ] Add tests for service line/location filtering.

## Phase 7 - Reputation

- [x] Add `/client/reputation` route or clinic-template destination mapping.
- [x] Add `getClientReputationPage` domain service.
- [x] Add `widgets/client-reputation`.
- [x] Build reputation metrics:
  - [x] Google rating
  - [x] review count
  - [x] reviews gained
  - [x] unanswered reviews
  - [x] negative reviews
  - [x] review response drafts
  - [x] review request campaign status
  - [x] Google Business Profile updates
  - [x] provider profile completeness
  - [x] local visibility notes
- [ ] Add Action Needed links for review responses and negative review handling.
- [x] Add tests for client-safe reputation data.

## Phase 8 - Compliance & Approvals

- [x] Add `/client/compliance-approvals` route or clinic-template destination mapping.
- [x] Add `getClientComplianceApprovalsPage` domain service.
- [x] Add `widgets/client-compliance-approvals`.
- [x] Add approval item types:
  - [x] medical claims
  - [x] ad copy
  - [x] landing pages
  - [x] doctor bios
  - [x] service descriptions
  - [x] before/after images
  - [x] testimonials
  - [x] treatment pricing
  - [x] consent language
  - [x] privacy/cookie/tracking setup
- [x] Add approval statuses:
  - [x] pending_medical_review
  - [x] changes_requested
  - [x] approved
  - [x] rejected
  - [x] expired
- [x] Add compliance statuses:
  - [x] not_reviewed
  - [x] in_review
  - [x] approved
  - [x] risk_flagged
  - [x] blocked
  - [x] limited_by_policy
- [x] Build approval history with version, approver, timestamp, and decision comment.
- [ ] Add rejected/limited ad policy issue log.
- [x] Add tracking/privacy setup status.
- [ ] Add tests for hidden draft compliance items.

## Phase 9 - Clinic Action Needed

- [ ] Extend Action Needed action types:
  - [ ] approve_medical_claim
  - [ ] approve_ad_copy
  - [ ] approve_landing_page
  - [ ] send_doctor_photos
  - [ ] send_doctor_bio
  - [ ] send_credentials
  - [ ] confirm_service_pricing
  - [ ] confirm_treatment_capacity
  - [ ] provide_gbp_access
  - [ ] connect_call_tracking
  - [ ] fix_missed_call_follow_up
  - [ ] approve_call_script
  - [ ] respond_to_negative_review
  - [ ] approve_review_response
  - [ ] confirm_appointment_availability
- [ ] Add clinic action metadata:
  - [ ] related service line
  - [ ] related location
  - [ ] related campaign
  - [ ] patient/business impact
  - [ ] compliance risk if delayed
- [ ] Update Action Needed filters/categories for clinic actions.
- [ ] Ensure responses do not mutate internal tasks directly.
- [ ] Add e2e for medical approval and missed-call action flows.

## Phase 10 - Clinic Reports

- [ ] Update report model or report content schema for clinic sections.
- [ ] Add clinic report sections:
  - [ ] patient acquisition summary
  - [ ] booked appointments
  - [ ] cost per booked appointment
  - [ ] service line winners and losers
  - [ ] location performance
  - [ ] missed call / booking leakage
  - [ ] reputation changes
  - [ ] compliance issues
  - [ ] agency work completed
  - [ ] clinic actions needed
  - [ ] next month plan
- [ ] Update admin report editor for clinic template content.
- [ ] Update client report reader to render clinic sections.
- [ ] Preserve generic report rendering for non-clinic clients if templates coexist.
- [ ] Add tests for draft/published clinic report visibility.

## Phase 11 - Admin Clinic Setup

- [ ] Add client type selection to client setup/editing.
- [ ] Add clinic specialty fields.
- [ ] Add clinic locations management.
- [ ] Add service lines management.
- [ ] Add capacity notes.
- [ ] Add metric entry/import workflow for patient acquisition.
- [ ] Add metric entry/import workflow for calls/bookings.
- [ ] Add reputation snapshot entry/import workflow.
- [ ] Add compliance review management.
- [ ] Add medical approval request management.
- [ ] Add preview-as-clinic-client actions.

## Phase 12 - Integrations Readiness

- [ ] Keep MVP manual/import-first.
- [ ] Define import contracts for:
  - [ ] patient acquisition metrics
  - [ ] calls/bookings metrics
  - [ ] service line performance
  - [ ] reputation snapshot
  - [ ] compliance review items
- [ ] Add future connector notes for:
  - [ ] Google Ads
  - [ ] Meta Ads
  - [ ] GA4
  - [ ] Google Search Console
  - [ ] CallRail / Nimbata / WhatConverts
  - [ ] booking/scheduling source
  - [ ] Google Business Profile / reviews
  - [ ] CRM/practice management with aggregate-data boundaries
- [ ] Document explicitly deferred integrations:
  - [ ] EHR/EMR
  - [ ] patient records
  - [ ] diagnosis tracking
  - [ ] raw PHI attribution
  - [ ] doctor schedule management
  - [ ] patient portal
  - [ ] automated remarketing without compliance layer

## Phase 13 - Tests And Verification

- [x] Add unit tests for clinic entity normalization.
- [x] Add domain tests for patient acquisition client isolation.
- [x] Add domain tests for calls/bookings aggregate safety.
- [ ] Add domain tests for service line/location filtering.
- [x] Add domain tests for reputation visibility.
- [x] Add domain tests for compliance approval read model and approval history.
- [ ] Add domain tests for compliance approval transitions.
- [ ] Add domain tests for clinic Action Needed type mapping.
- [ ] Add e2e for clinic Overview.
- [ ] Add e2e for Patient Acquisition.
- [ ] Add e2e for Calls & Bookings.
- [ ] Add e2e for Campaigns / Service Lines.
- [ ] Add e2e for Reputation.
- [ ] Add e2e for Compliance & Approvals.
- [ ] Add e2e for clinic Action Needed approval/response.
- [x] Run `npx eslint src`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [ ] Run targeted e2e for clinic workflows.

## Definition Of Done

- [ ] Clinic clients see patient acquisition and booking performance before generic project status.
- [x] Clinic Overview answers new inquiries, bookings, missed calls, reputation, compliance, and actions needed.
- [ ] Calls & Bookings is first-class.
- [ ] Campaigns / Service Lines is first-class.
- [x] Reputation is first-class.
- [x] Compliance & Approvals is first-class.
- [ ] Action Needed includes clinic operations and medical/compliance actions.
- [ ] Reports explain booked appointments, service lines, locations, leakage, reputation, compliance, and next plan.
- [ ] Client users never see patient-level health data, raw PHI, internal notes, draft compliance records, or another clinic's data.
- [ ] Admins can manage clinic setup, service lines, metrics, reputation, compliance, approvals, and preview-as-client.
- [ ] Documentation, tests, and build are updated.
