import { USER_ROLES } from '../../entities/profile'
import { getClientDashboardPage } from './clientDashboardService'
import { getClientPerformanceDashboardPage } from './clientPerformanceDashboardService'
import { getClientReportsPage } from './clientReportsService'

export function getClientReportsDashboardsPage({
  clientId,
  dashboardId,
  mode,
  performancePeriodId,
  reportId,
  repositories,
  viewer,
}) {
  const resolvedMode = mode ?? (viewer?.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client')
  const performancePage = getClientPerformanceDashboardPage({
    clientId,
    mode: resolvedMode,
    periodId: performancePeriodId,
    repositories,
    viewer,
  })
  const dashboardPage = getClientDashboardPage({
    clientId,
    dashboardId,
    mode: resolvedMode,
    repositories,
    viewer,
  })
  const reportsPage = getClientReportsPage({
    clientId,
    reportId,
    repositories,
    viewer,
  })

  if (
    performancePage.status === 'error'
    || dashboardPage.status === 'error'
    || reportsPage.status === 'error'
  ) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  return {
    client: performancePage.client ?? dashboardPage.client ?? reportsPage.client,
    dashboardPage,
    performancePage,
    reportsPage,
    status: 'ready',
  }
}
