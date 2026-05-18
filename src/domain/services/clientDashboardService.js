import { CLIENT_TYPES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META } from '../../entities/dashboard-link'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import { isDashboardVisibleToClient, isReportVisibleToClient } from '../policies/visibilityPolicy'

function sortByDateDesc(a, b, fieldName) {
  return new Date(b[fieldName]).getTime() - new Date(a[fieldName]).getTime()
}

function mapDashboard(dashboardLink) {
  return {
    description: dashboardLink.description ?? '',
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

function canAccessDashboardClient({ client, clientId, viewer }) {
  if (viewer?.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId) && client.agency_id === viewer.agencyId
  }

  return canAccessClient(viewer, clientId)
}

function isDashboardVisibleForMode(dashboardLink, mode) {
  if (mode === 'admin_preview') {
    return dashboardLink.status !== DASHBOARD_LINK_STATUSES.ARCHIVED
  }

  return isDashboardVisibleToClient(dashboardLink)
}

function buildClinicResultsRedirect({ clientId, dashboard }) {
  const search = new URLSearchParams({ clientId })

  if (dashboard?.id) {
    search.set('dashboardId', dashboard.id)
  }

  return `/client/reports-dashboards?${search.toString()}#source-dashboard`
}

export function getClientDashboardPage({
  clientId,
  dashboardId,
  mode = 'client',
  repositories,
  viewer,
}) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessDashboardClient({ client, clientId, viewer })) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const visibleDashboards = repositories.dashboardLinks
    .listByClientId(clientId)
    .filter((dashboardLink) => isDashboardVisibleForMode(dashboardLink, mode))
    .sort((a, b) => (
      Number(b.show_on_overview) - Number(a.show_on_overview)
      || (a.display_order ?? 0) - (b.display_order ?? 0)
      || new Date(b.updated_at ?? b.created_at ?? 0).getTime() - new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    ))

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
      type: client.type ?? CLIENT_TYPES.GENERIC,
    },
    dashboard: dashboard ? mapDashboard(dashboard) : null,
    latestReport: latestReport ? mapReport(latestReport) : null,
    redirectTo: client.type === CLIENT_TYPES.CLINIC
      ? buildClinicResultsRedirect({ clientId, dashboard })
      : null,
    reason: dashboardId && !dashboard ? 'dashboard_not_found' : null,
    status: 'ready',
  }
}
