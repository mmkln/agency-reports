# UC-003 Acceptance Report - Monthly Summary / Report Archive

Status: MVP-complete

Date: 2026-05-14

## Scope

UC-003 delivers a report module for creating, managing, publishing, previewing, and reading client-facing monthly summaries.

The implementation keeps reports as human-written summaries. It does not build AI report generation, a custom report builder, chart editing, native PDF generation, scheduled delivery, comments, approvals, native analytics connectors, or custom metric calculations.

Reports are persisted through the current repository adapter. In this project state, that adapter is localStorage; the domain services are written so a backend adapter can replace it later without changing report business logic.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/admin/reports` | Admin list for monthly reports across client workspaces |
| `/admin/reports?newReport=true` | Admin modal for creating a monthly report |
| `/admin/reports?clientId=...` | Client-scoped admin reports workspace |
| `/admin/client-report-preview?clientId=...&reportId=...` | Admin preview of a report, including draft and ready reports |
| `/client/reports?clientId=...` | Client-facing report archive and latest report reader |
| `/client/reports?clientId=...&reportId=...` | Client-facing single report reader |
| `/client/overview` | Latest Monthly Summary entry point on the client status hub |

## Main Implementation Files

| Area | Files |
| --- | --- |
| Entity model | `src/entities/report/model.js` |
| Domain services | `src/domain/services/adminReportService.js`, `src/domain/services/clientReportsService.js`, `src/domain/services/clientOverviewService.js` |
| Visibility policy | `src/domain/policies/visibilityPolicy.js` |
| Domain tests | `src/domain/services/adminReportService.test.js`, `src/domain/services/clientReportsService.test.js`, `src/domain/services/clientOverviewService.test.js`, `src/domain/policies/visibilityPolicy.test.js` |
| Admin UI | `src/pages/admin/reports/*`, `src/features/admin-reports/*` |
| Client UI | `src/pages/client/reports/*`, `src/widgets/client-overview/ClientOverviewBlocks.jsx` |
| Routing | `src/app/routing/routeDefinitions.jsx`, `src/app/routing/router.jsx` |
| Browser tests | `e2e/uc003.spec.js` |

## Acceptance Mapping

| UC-003 criterion | Implementation evidence |
| --- | --- |
| `agency_admin` can create a monthly report | `AdminReportsPage` opens `ReportModal`; `saveAdminReport` persists through the repository adapter. |
| `agency_admin` can select client and reporting period | `ReportModal` includes client, period start, and period end fields. Domain validation requires valid client and valid date order. |
| `agency_admin` can save report as draft | Draft is the default report status; `REPORT_STATUSES.DRAFT` is accepted and hidden from client users. |
| Draft reports are not visible to `client_user` | `isReportVisibleToClient` only allows `published` and `archived`. `clientReportsService` filters client reads through that rule. |
| `agency_admin` can fill summary, wins, problems, next actions, and client decisions needed | `ReportModal` maps these sections to the report object and `ReportReader` renders them as the client-facing narrative. |
| `agency_admin` can attach `dashboard_url` | `ReportModal` captures Dashboard URL; `saveAdminReport` validates http(s) URLs; client reader renders an Open dashboard action when present. |
| `agency_admin` can attach `pdf_url` | `ReportModal` captures PDF / full report URL; `saveAdminReport` validates http(s) URLs; client reader renders an Open PDF action when present. |
| `agency_admin` can preview report as `client_user` | Reports table provides Preview report for every status. `/admin/client-report-preview` can load draft/ready reports and shows a Preview only notice for hidden reports. |
| `agency_admin` can publish report | Reports table status actions call `updateAdminReportStatus`; published reports receive `published_at` and become client-visible. |
| Published report appears in Client Overview as Latest Monthly Summary | `clientOverviewService` selects visible reports by period and the overview block links to the report. |
| Published report appears in Reports Archive | `ClientReportsPage` lists published/archived reports in the archive. |
| `client_user` can open report | `/client/reports?clientId=...&reportId=...` renders the selected report when visible and accessible. |
| `client_user` can only see reports for their own `client_id` | `clientReportsService` calls `canAccessClient`; tests cover cross-client denial indirectly through the same client access policy. |
| Archived reports remain accessible in archive | `archived` is client-visible. E2E covers archiving a published report and reading it from the client archive. |
| `client_user` can understand what happened, why it matters, and what happens next | `ReportReader` groups content into Executive summary, What happened, Performance context, Next steps, Dashboard, and PDF/file fallback sections. |

## UX Decisions

| Decision | Rationale |
| --- | --- |
| Create/edit report uses a modal | Monthly report editing is a bounded admin operation with a fixed template, not a separate layout-builder workflow. |
| Draft and ready reports can be previewed only by admin | Admins need to review client-facing wording before publish, but hidden report statuses must never leak to clients. |
| Archive items show summary previews and quick links | Clients can scan historical reports without opening every item and can jump to dashboard/PDF assets when present. |
| Missing dashboard/PDF links render controlled fallbacks | A report must remain readable even when supporting assets are unavailable. |
| Latest report is based on client-visible reports only | Draft/ready reports should not change what the client sees on overview or reports landing. |

## Verification

Automated checks used for this acceptance pass:

```text
npm run lint
npm test -- --run
npx playwright test e2e/uc001.spec.js
npx playwright test e2e/uc003.spec.js
npm run build
```

UC-003 browser coverage includes:

```text
- admin creates and publishes a monthly report
- admin previews a published report
- admin previews a draft report without exposing it to clients
- client report archive hides draft reports
- client report reader shows narrative hierarchy and link fallbacks
- admin duplicates a published report into a hidden draft
- admin filters monthly reports
- admin archives a published report and client can still read it in the archive
```

## Backend-Only / Future Notes

The following are intentionally not implemented in the frontend/localStorage MVP:

```text
- server-side RLS and database constraints
- real email delivery for report publication
- scheduled report generation or scheduled delivery
- PDF generation
- version history
- multi-step review/approval workflow
- native analytics connectors
- AI-generated report summaries
```

Backend migration should preserve the current domain contracts:

```text
- clients can read only reports for their own client_id
- client_user can read only published/archived reports
- draft/ready reports and internal_notes never render in client-facing read models
- admin can manage all reports for agency-owned clients
```

## Residual Risk

The main remaining risk is operational, not architectural: an agency admin can still publish weak or incomplete report content. The MVP response is a fixed, plain-language report template plus preview-before-publish behavior. A later version can add stricter editorial checks, review workflow, or version history if product usage proves it is needed.

