import { USER_ROLES } from '../../entities/profile'
import { getClientDashboardPage } from './clientDashboardService'
import { getClientPerformanceDashboardPage } from './clientPerformanceDashboardService'
import { getClientReportsPage } from './clientReportsService'

function createTrustContext({ dashboardPage, performancePage, reportsPage }) {
  const performanceDashboard = performancePage.performanceDashboard
  const sourceDashboard = dashboardPage.dashboard
  const latestReport = reportsPage.latestReport
  const caveats = []

  if (performanceDashboard?.sourceSummary) {
    caveats.push({
      id: 'source-summary',
      label: 'Source note',
      value: performanceDashboard.sourceSummary,
    })
  }

  if (performanceDashboard?.attributionNote) {
    caveats.push({
      id: 'attribution',
      label: 'Attribution caveat',
      value: performanceDashboard.attributionNote,
    })
  }

  if (sourceDashboard && !sourceDashboard.isAvailable) {
    caveats.push({
      id: 'source-dashboard-unavailable',
      label: 'Source dashboard',
      value: sourceDashboard.fallbackMessage || 'The source dashboard is temporarily unavailable.',
    })
  }

  return {
    attributionNote: performanceDashboard?.attributionNote ?? '',
    caveats,
    dataConfidence: performanceDashboard?.dataConfidence ?? null,
    dataConfidenceMeta: performanceDashboard?.dataConfidenceMeta ?? null,
    dataFreshness: performanceDashboard?.freshness ?? null,
    dataMode: performanceDashboard?.dataMode ?? null,
    dataModeMeta: performanceDashboard?.dataModeMeta ?? null,
    hasPublishedPerformance: Boolean(performanceDashboard),
    latestReport: latestReport
      ? {
          id: latestReport.id,
          periodEnd: latestReport.periodEnd,
          periodStart: latestReport.periodStart,
          status: latestReport.status,
          statusMeta: latestReport.statusMeta,
          title: latestReport.title,
        }
      : null,
    lastUpdatedAt: performanceDashboard?.lastUpdatedAt ?? null,
    performancePeriod: performanceDashboard
      ? {
          id: performanceDashboard.id,
          periodEnd: performanceDashboard.periodEnd,
          periodStart: performanceDashboard.periodStart,
          status: performanceDashboard.status,
          statusMeta: performanceDashboard.statusMeta,
          title: performanceDashboard.title,
        }
      : null,
    sourceDashboard: sourceDashboard
      ? {
          id: sourceDashboard.id,
          isAvailable: sourceDashboard.isAvailable,
          name: sourceDashboard.name,
          provider: sourceDashboard.provider,
          status: sourceDashboard.status,
          statusMeta: sourceDashboard.statusMeta,
        }
      : null,
    sourceSummary: performanceDashboard?.sourceSummary ?? '',
  }
}

export function getClientReportsDashboardsPage({
  clientId,
  dashboardId,
  mode,
  now,
  performancePeriodId,
  reportId,
  repositories,
  viewer,
}) {
  const resolvedMode = mode ?? (viewer?.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client')
  const performancePage = getClientPerformanceDashboardPage({
    clientId,
    mode: resolvedMode,
    now,
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
    trustContext: createTrustContext({
      dashboardPage,
      performancePage,
      reportsPage,
    }),
  }
}
