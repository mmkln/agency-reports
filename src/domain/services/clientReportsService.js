import { REPORT_STATUS_META } from '../../entities/report'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import { isReportVisibleToClient } from '../policies/visibilityPolicy'

function sortByPeriodDesc(a, b) {
  return new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
}

function mapReport(report) {
  return {
    clientDecisionsNeeded: report.client_decisions_needed,
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
    .map(mapReport)
  const latestClientVisibleReport = reports.find((report) => report.isClientVisible) ?? null

  const selectedReport = reportId
    ? reports.find((report) => report.id === reportId) ?? null
    : latestClientVisibleReport ?? reports[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    latestReport: latestClientVisibleReport,
    reason: reportId && !selectedReport ? 'report_not_found' : null,
    reports,
    selectedReport,
    status: 'ready',
  }
}
