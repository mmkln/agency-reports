import { CLIENT_TYPES } from '../../entities/client'
import { assertClinicAggregateRecord } from '../../entities/clinic'
import { REPORT_STATUS_META } from '../../entities/report'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import { isReportVisibleToClient } from '../policies/visibilityPolicy'

function sortByPeriodDesc(a, b) {
  return new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
}

function normalizeList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
    : []
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function mapClinicReportSections(report) {
  if (!report.clinic_sections) {
    return null
  }

  assertClinicAggregateRecord(report.clinic_sections, 'Clinic report sections')

  const sections = report.clinic_sections

  return {
    agencyWorkCompleted: normalizeList(sections.agency_work_completed),
    bookingLeakage: {
      followUpNeeded: normalizeNumber(sections.booking_leakage?.follow_up_needed),
      missedCalls: normalizeNumber(sections.booking_leakage?.missed_calls),
      noResponseLeads: normalizeNumber(sections.booking_leakage?.no_response_leads),
      summary: normalizeText(sections.booking_leakage?.summary),
    },
    clinicActionsNeeded: normalizeList(sections.clinic_actions_needed),
    compliance: {
      limitedAds: normalizeNumber(sections.compliance?.limited_ads),
      openIssues: normalizeNumber(sections.compliance?.open_issues),
      pendingApprovals: normalizeNumber(sections.compliance?.pending_approvals),
      summary: normalizeText(sections.compliance?.summary),
    },
    nextMonthPlan: normalizeList(sections.next_month_plan),
    patientAcquisition: {
      bookedAppointments: normalizeNumber(sections.patient_acquisition?.booked_appointments),
      costPerBookedAppointment: normalizeNumber(sections.patient_acquisition?.cost_per_booked_appointment),
      inquiries: normalizeNumber(sections.patient_acquisition?.inquiries),
      summary: normalizeText(sections.patient_acquisition?.summary),
      topLocations: normalizeList(sections.patient_acquisition?.top_locations),
      topServiceLines: normalizeList(sections.patient_acquisition?.top_service_lines),
    },
    reputation: {
      googleRating: normalizeNumber(sections.reputation?.google_rating),
      reviewsGained: normalizeNumber(sections.reputation?.reviews_gained),
      summary: normalizeText(sections.reputation?.summary),
      unansweredReviews: normalizeNumber(sections.reputation?.unanswered_reviews),
    },
  }
}

function mapReport(report, { client }) {
  const clinicSections = client?.type === CLIENT_TYPES.CLINIC ? mapClinicReportSections(report) : null

  return {
    clientDecisionsNeeded: report.client_decisions_needed,
    clinicSections,
    dashboardUrl: report.dashboard_url,
    id: report.id,
    isClientVisible: isReportVisibleToClient(report),
    nextActions: report.next_actions,
    pdfUrl: report.pdf_url,
    periodEnd: report.period_end,
    periodStart: report.period_start,
    problems: report.problems,
    publishedAt: report.published_at,
    status: report.status,
    statusMeta: REPORT_STATUS_META[report.status] ?? {
      label: report.status,
      tone: 'neutral',
    },
    summary: report.summary,
    template: clinicSections ? CLIENT_TYPES.CLINIC : CLIENT_TYPES.GENERIC,
    title: report.title,
    whatWeDid: report.what_we_did,
    results: report.results,
    wins: report.wins,
  }
}

export function getClientReportsPage({ clientId, reportId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const canPreviewAllClientReports = viewer?.role === USER_ROLES.AGENCY_ADMIN
  const reports = repositories.reports
    .listByClientId(clientId)
    .filter((report) => canPreviewAllClientReports || isReportVisibleToClient(report))
    .sort(sortByPeriodDesc)
    .map((report) => mapReport({ ...report }, { client }))
  const latestClientVisibleReport = reports.find((report) => report.isClientVisible) ?? null

  const selectedReport = reportId
    ? reports.find((report) => report.id === reportId) ?? null
    : latestClientVisibleReport ?? reports[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      type: client.type ?? CLIENT_TYPES.GENERIC,
    },
    latestReport: latestClientVisibleReport,
    reason: reportId && !selectedReport ? 'report_not_found' : null,
    reports,
    selectedReport,
    status: 'ready',
  }
}
