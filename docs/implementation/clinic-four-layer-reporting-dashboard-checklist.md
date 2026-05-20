# Clinic Four-Layer Reporting Dashboard Checklist

## Summary

Build the Inspo Dental reporting product as four capability-gated clinic dashboard layers. The dashboard implementation is now backed by role/capability policy, aggregate-safe data contracts, repository adapters, read services, import/publish workflows, protected routes, and role-specific UI.

## Phase 0 - Stabilize Foundation

- [x] Add `client_admin` and `client_team` roles.
- [x] Normalize legacy `client_user` to `client_admin`.
- [x] Add clinic reporting capabilities.
- [x] Add four reporting layer contracts.
- [x] Add repositories and seed data for all layers.
- [x] Add read services for all layers.
- [x] Add admin import/publish foundation.
- [x] Add hidden protected routes.
- [x] Add route, service, import, and visibility tests.
- [x] Verify `npm run lint`.
- [x] Verify `npm test -- --run`.
- [x] Verify `npm run build`.

## Phase 1 - Daily Operations UI

Route: `/clinic/daily-ops`

Audience: agency admins, agency team, explicitly capable clinic staff.

- [x] Replace foundation renderer with a dedicated Daily Operational Command Center.
- [x] Add top alert strip for unanswered replies, workflow errors, pending confirmations, and stale callbacks.
- [x] Add reply queue.
- [x] Add call queue.
- [x] Add callback queue.
- [x] Add appointment control snapshot.
- [x] Add booking scorecard.
- [x] Add data hygiene panel.
- [x] Add reactivation track strip.
- [x] Add receptionist scorecard.
- [x] Hide row-level queues unless viewer has `clinic_operational_rows_view`.
- [x] Show aggregate-only fallback for capable client-side users without row permission.
- [x] Add Playwright and service tests for staff access, denied client admin access, and row redaction.

## Phase 2 - Weekly Operator UI

Route: `/team/clinic-operator`

Audience: agency admins and agency operators.

- [x] Build Weekly Operator Dashboard.
- [x] Add weekly headline summary.
- [x] Add funnel leakage panel.
- [x] Add response performance panel.
- [x] Add source diagnostics.
- [x] Add reactivation diagnostics.
- [x] Add deliverability/workflow health.
- [x] Add pipeline health.
- [x] Add experiments/results section.
- [x] Add 3 wins / losses / next actions operator narrative.
- [x] Keep route internal to agency roles.
- [x] Add tests for assigned clinic access, unassigned clinic denial, and diagnostics rendering.

## Phase 3 - Executive Performance UI

Route: `/client/executive-performance`

Audience: client admins by default, finance/team users only when explicitly capable.

- [x] Replace generic client performance dashboard with clinic executive dashboard.
- [x] Put executive narrative before metrics.
- [x] Add hero metric row.
- [x] Add trend section.
- [x] Add channel ROI section.
- [x] Add practice quality section.
- [x] Add decisions needed section.
- [x] Add source trust/freshness strip.
- [x] Keep the route aggregate-only.
- [x] Prevent Layer 1 queues, patient fields, internal notes, and operational rows from rendering.
- [x] Add tests for default client admin access, narrative order, and queue exclusion.

## Phase 4 - Monthly Strategy UI

Route: `/client/monthly-strategy`

Audience: finance-capable client users and agency admins.

- [x] Build finance/strategy dashboard.
- [x] Add monthly financials.
- [x] Add unit economics.
- [x] Add retention/cohort metrics.
- [x] Add 12-month channel trend series.
- [x] Add strategic decision panel.
- [x] Add source trust/freshness strip.
- [x] Gate route behind `clinic_layer_monthly_finance_view`.
- [x] Keep route aggregate-only.
- [x] Add tests for finance gating, dashboard content, and patient-field import rejection.

## Phase 5 - Admin Import / Publish UI

Audience: agency admins.

- [x] Add admin clinic reporting import surface under the clinic admin workspace.
- [x] Support layer selection for daily operations, weekly operator, executive performance, and monthly strategy.
- [x] Support JSON paste/import.
- [x] Preview normalized record before save.
- [x] Show validation errors before save.
- [x] Save imports as `draft` only.
- [x] Add explicit publish action.
- [x] Add explicit archive action.
- [x] Show layer, client, period, status, freshness, and validation state.
- [x] Add tests for draft import, explicit publish/archive, and prohibited patient fields.

## Phase 6 - Navigation And Product Wiring

- [x] Keep routes hidden from main nav until their UI pass is complete.
- [x] Link client executive dashboard from the clinic client overview.
- [x] Show monthly strategy link only for finance-capable users.
- [x] Add internal/admin entry point for operational users.
- [x] Demote the old generic client performance entry where it conflicts with the clinic executive view.
- [x] Keep route access capability-based, not role-name-only.

## Final Verification

- [x] `npm run lint`
- [x] `npm test -- --run`
- [x] `npm run build`
- [x] `npx playwright test e2e/clinic-admin-workspaces.spec.js e2e/clinic-client-portal.spec.js --workers=1`
- [x] `npx playwright test e2e/uc004.spec.js`

## Dashboard Hardening Pass

- [x] Add Daily Ops operational triage above queues.
- [x] Add Daily Ops queue workload summary before row-level queues.
- [x] Move Daily Ops row visibility into the service read model instead of inferring from empty arrays.
- [x] Keep Daily Ops row redaction visible and explicit for client-side capable users.
- [x] Add Weekly Operator focus strip for win, risk, and next action.
- [x] Add Executive focus strip before metrics.
- [x] Add explicit Executive decisions-needed section.
- [x] Add explicit Monthly strategy decisions-needed section.
- [x] Add explicit source freshness status to the data contract, admin table, import preview, and dashboard trust strips.
- [x] Add e2e assertions for the hardened dashboard hierarchy.

## Demo Role Routing And Sidebar Pass

- [x] Add seeded finance-capable client admin demo user.
- [x] Add seeded daily-ops-capable front-desk demo user.
- [x] Add demo role switcher entries for Client Admin, Finance, and Front Desk.
- [x] Route front-desk demo login directly to Daily Ops instead of inaccessible client overview.
- [x] Show Executive Performance in clinic client admin sidebar.
- [x] Show Monthly Strategy only for finance-capable client users.
- [x] Show Daily Operations for operational roles, including front-desk staff.
- [x] Keep client finance routes out of agency sidebar navigation.
- [x] Add routing/sidebar unit and e2e coverage for role-specific navigation.

## Notes

- `agency_team` remains the agency operator role.
- `client_admin` replaces `client_user`; legacy values are normalized, not hard-migrated.
- `client_team` receives no clinic layer access unless capabilities are explicitly granted.
- Layer 1 row-level operational data is staff/internal only.
- Layer 3 and Layer 4 are client-facing and aggregate-only.
- No import publishes automatically.
