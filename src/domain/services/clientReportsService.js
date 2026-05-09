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
    nextActions: report.next_actions,
    pdfUrl: report.pdf_url,
    periodEnd: report.period_end,
    periodStart: report.period_start,
    problems: report.problems,
    publishedAt: report.published_at,
    status: report.status,
    summary: report.summary,
    title: report.title,
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

  const visibleReports = repositories.reports
    .listByClientId(clientId)
    .filter(isReportVisibleToClient)
    .sort(sortByPeriodDesc)
    .map(mapReport)

  const selectedReport = reportId
    ? visibleReports.find((report) => report.id === reportId) ?? null
    : visibleReports[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    latestReport: visibleReports[0] ?? null,
    reason: reportId && !selectedReport ? 'report_not_found' : null,
    reports: visibleReports,
    selectedReport,
    status: 'ready',
  }
}
