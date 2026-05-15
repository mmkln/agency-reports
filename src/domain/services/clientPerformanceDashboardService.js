import {
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
} from '../../entities/performance-dashboard'
import { REPORT_STATUS_META } from '../../entities/report'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import {
  isDashboardVisibleToClient,
  isNeededActionVisibleToClient,
  isPerformanceDashboardPeriodVisibleToClient,
  isReportVisibleToClient,
} from '../policies/visibilityPolicy'

function sortByPeriodDesc(a, b) {
  return new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
}

function mapPerformanceDashboardPeriod(period) {
  return {
    accountManager: period.account_manager ?? '',
    agencyContact: period.agency_contact ?? '',
    attributionNote: period.attribution_note ?? '',
    content: period.content,
    dataConfidence: period.data_confidence,
    dataConfidenceMeta: PERFORMANCE_DATA_CONFIDENCE_META[period.data_confidence] ?? {
      label: period.data_confidence,
      tone: 'neutral',
    },
    dataMode: period.data_mode,
    dataModeMeta: PERFORMANCE_DATA_MODE_META[period.data_mode] ?? {
      label: period.data_mode,
      tone: 'neutral',
    },
    id: period.id,
    lastUpdatedAt: period.last_updated_at,
    periodEnd: period.period_end,
    periodStart: period.period_start,
    publishedAt: period.published_at,
    sourceSummary: period.source_summary ?? '',
    status: period.status,
    statusMeta: PERFORMANCE_DASHBOARD_STATUS_META[period.status] ?? {
      label: period.status,
      tone: 'neutral',
    },
    title: period.title,
  }
}

function mapDashboardLink(dashboardLink) {
  return {
    description: dashboardLink.description ?? '',
    embedUrl: dashboardLink.embed_url ?? '',
    fallbackMessage: dashboardLink.fallback_message ?? '',
    id: dashboardLink.id,
    name: dashboardLink.name,
    provider: dashboardLink.provider,
    publicUrl: dashboardLink.public_url ?? '',
    status: dashboardLink.status,
  }
}

function mapReport(report) {
  return {
    dashboardUrl: report.dashboard_url ?? '',
    id: report.id,
    pdfUrl: report.pdf_url ?? '',
    periodEnd: report.period_end,
    periodStart: report.period_start,
    publishedAt: report.published_at ?? null,
    status: report.status,
    statusMeta: REPORT_STATUS_META[report.status] ?? {
      label: report.status,
      tone: 'neutral',
    },
    summary: report.summary ?? '',
    title: report.title,
  }
}

function mapNeededAction(action) {
  return {
    description: action.description ?? '',
    dueDate: action.due_date ?? '',
    id: action.id,
    relatedLink: action.related_link ?? '',
    status: action.status,
    title: action.title,
  }
}

function canAccessDashboardClient({ client, clientId, viewer }) {
  if (viewer?.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId) && client.agency_id === viewer.agencyId
  }

  return canAccessClient(viewer, clientId)
}

function isDashboardPeriodVisibleForMode(period, mode) {
  if (mode === 'admin_preview') {
    return true
  }

  return isPerformanceDashboardPeriodVisibleToClient(period)
}

export function getClientPerformanceDashboardPage({
  clientId,
  mode = 'client',
  periodId,
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

  const periods = repositories.performanceDashboardPeriods
    .listByClientId(clientId)
    .filter((period) => isDashboardPeriodVisibleForMode(period, mode))
    .sort(sortByPeriodDesc)
  const latestClientVisiblePeriod = periods.find(isPerformanceDashboardPeriodVisibleToClient) ?? null
  const selectedPeriod = periodId
    ? periods.find((period) => period.id === periodId) ?? null
    : latestClientVisiblePeriod ?? periods[0] ?? null
  const sourceLinks = repositories.dashboardLinks
    .listByClientId(clientId)
    .filter(isDashboardVisibleToClient)
    .map(mapDashboardLink)
  const latestReport = repositories.reports
    .listByClientId(clientId)
    .filter(isReportVisibleToClient)
    .sort(sortByPeriodDesc)[0] ?? null
  const neededFromClient = repositories.neededFromClient
    .listByClientId(clientId)
    .filter(isNeededActionVisibleToClient)
    .map(mapNeededAction)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      status: client.status,
    },
    latestReport: latestReport ? mapReport(latestReport) : null,
    neededFromClient,
    performanceDashboard: selectedPeriod ? mapPerformanceDashboardPeriod(selectedPeriod) : null,
    periods: periods.map(mapPerformanceDashboardPeriod),
    reason: periodId && !selectedPeriod ? 'performance_dashboard_not_found' : null,
    sourceLinks,
    status: 'ready',
  }
}

export function getClientPerformanceOverviewPreview({ clientId, repositories, viewer }) {
  const page = getClientPerformanceDashboardPage({
    clientId,
    repositories,
    viewer,
  })

  if (page.status !== 'ready') {
    return page
  }

  const dashboard = page.performanceDashboard

  if (!dashboard) {
    return {
      client: page.client,
      performanceDashboard: null,
      reason: 'performance_dashboard_not_published',
      status: 'empty',
    }
  }

  return {
    client: page.client,
    performanceDashboard: {
      dataConfidence: dashboard.dataConfidence,
      dataConfidenceMeta: dashboard.dataConfidenceMeta,
      heroMetric: dashboard.content?.hero_metric ?? null,
      id: dashboard.id,
      kpiCards: dashboard.content?.kpi_cards?.slice(0, 3) ?? [],
      lastUpdatedAt: dashboard.lastUpdatedAt,
      periodEnd: dashboard.periodEnd,
      periodStart: dashboard.periodStart,
      title: dashboard.title,
    },
    status: 'ready',
  }
}
