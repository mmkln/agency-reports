import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META } from '../../entities/dashboard-link'
import { canAccessClient } from '../policies/accessPolicy'
import { isDashboardVisibleToClient, isReportVisibleToClient } from '../policies/visibilityPolicy'

function sortByDateDesc(a, b, fieldName) {
  return new Date(b[fieldName]).getTime() - new Date(a[fieldName]).getTime()
}

function mapDashboard(dashboardLink) {
  return {
    embedUrl: dashboardLink.embed_url,
    fallbackMessage: dashboardLink.fallback_message,
    id: dashboardLink.id,
    isAvailable: dashboardLink.status === DASHBOARD_LINK_STATUSES.ACTIVE,
    name: dashboardLink.name,
    provider: dashboardLink.provider,
    publicUrl: dashboardLink.public_url,
    status: dashboardLink.status,
    statusMeta: DASHBOARD_LINK_STATUS_META[dashboardLink.status] ?? {
      label: dashboardLink.status,
      tone: 'neutral',
    },
  }
}

function mapReport(report) {
  return {
    dashboardUrl: report.dashboard_url,
    id: report.id,
    periodEnd: report.period_end,
    periodStart: report.period_start,
    summary: report.summary,
    title: report.title,
  }
}

export function getClientDashboardPage({ clientId, dashboardId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const visibleDashboards = repositories.dashboardLinks
    .listByClientId(clientId)
    .filter(isDashboardVisibleToClient)
    .sort((a, b) => Number(b.show_on_overview) - Number(a.show_on_overview))

  const dashboard = dashboardId
    ? visibleDashboards.find((item) => item.id === dashboardId) ?? null
    : visibleDashboards[0] ?? null

  const latestReport = repositories.reports
    .listByClientId(clientId)
    .filter(isReportVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'period_end'))[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    dashboard: dashboard ? mapDashboard(dashboard) : null,
    latestReport: latestReport ? mapReport(latestReport) : null,
    reason: dashboardId && !dashboard ? 'dashboard_not_found' : null,
    status: 'ready',
  }
}
