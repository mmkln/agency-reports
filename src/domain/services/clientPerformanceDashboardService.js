import {
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
} from '../../entities/performance-dashboard'
import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
  CLIENT_WORK_ITEM_STATUS_META,
} from '../../entities/client-work-item'
import {
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUS_META,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import { REPORT_STATUS_META } from '../../entities/report'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import {
  isDashboardVisibleToClient,
  isNeededActionVisibleToClient,
  isPerformanceDashboardPeriodVisibleToClient,
  isReportVisibleToClient,
  isUpdateVisibleToClient,
} from '../policies/visibilityPolicy'

const STALE_DATA_THRESHOLD_DAYS = 14

function sortByPeriodDesc(a, b) {
  return new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
}

function sortByUpdatedDesc(a, b) {
  return new Date(b.updated_at ?? b.created_at ?? 0).getTime()
    - new Date(a.updated_at ?? a.created_at ?? 0).getTime()
}

function getStatusMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getDataFreshness(lastUpdatedAt, now) {
  const updatedDate = new Date(lastUpdatedAt)

  if (!lastUpdatedAt || Number.isNaN(updatedDate.getTime())) {
    return {
      ageDays: null,
      isStale: true,
      label: 'Update date unavailable',
      thresholdDays: STALE_DATA_THRESHOLD_DAYS,
    }
  }

  const ageMs = now.getTime() - updatedDate.getTime()
  const ageDays = Math.max(0, Math.floor(ageMs / 86_400_000))

  return {
    ageDays,
    isStale: ageDays > STALE_DATA_THRESHOLD_DAYS,
    label: `${ageDays} day${ageDays === 1 ? '' : 's'} old`,
    thresholdDays: STALE_DATA_THRESHOLD_DAYS,
  }
}

function mapPerformanceDashboardPeriod(period, { now }) {
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
    freshness: getDataFreshness(period.last_updated_at, now),
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
  const normalizedAction = normalizeNeededAction(action)

  return {
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    priority: normalizedAction.priority,
    priorityMeta: getStatusMeta(normalizedAction.priority, NEEDED_ACTION_PRIORITY_META),
    relatedLink: normalizedAction.related_link,
    status: normalizedAction.status,
    statusMeta: getStatusMeta(normalizedAction.status, NEEDED_ACTION_STATUS_META),
    title: normalizedAction.title,
  }
}

function mapWorkItem(item) {
  return {
    dueDate: item.target_date ?? '',
    id: item.id,
    status: item.status,
    statusMeta: getStatusMeta(item.status, CLIENT_WORK_ITEM_STATUS_META),
    title: item.title,
    updatedAt: item.updated_at ?? item.created_at ?? '',
  }
}

function mapClientVisibleUpdate(update) {
  return {
    body: update.body ?? '',
    id: update.id,
    title: update.title,
    updatedAt: update.updated_at ?? update.created_at ?? '',
  }
}

function createWorkSummary({ repositories, clientId }) {
  const publishedWorkItems = (repositories.clientWorkItems?.listByClientId(clientId) ?? [])
    .filter((item) => item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)
    .sort(sortByUpdatedDesc)
  const completedTasks = publishedWorkItems
    .filter((item) => item.status === CLIENT_WORK_ITEM_STATUSES.DELIVERED)
    .slice(0, 5)
    .map(mapWorkItem)
  const activeTasks = publishedWorkItems
    .filter((item) => item.status !== CLIENT_WORK_ITEM_STATUSES.DELIVERED)
    .slice(0, 5)
    .map(mapWorkItem)
  const recentUpdates = (repositories.updates?.listByClientId(clientId) ?? [])
    .filter(isUpdateVisibleToClient)
    .sort(sortByUpdatedDesc)
    .slice(0, 3)
    .map(mapClientVisibleUpdate)

  return {
    activeTasks,
    completedTasks,
    recentUpdates,
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
  now = () => new Date(),
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
  const resolvedNow = now()

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      status: client.status,
    },
    latestReport: latestReport ? mapReport(latestReport) : null,
    neededFromClient,
    performanceDashboard: selectedPeriod ? mapPerformanceDashboardPeriod(selectedPeriod, { now: resolvedNow }) : null,
    periods: periods.map((period) => mapPerformanceDashboardPeriod(period, { now: resolvedNow })),
    reason: periodId && !selectedPeriod ? 'performance_dashboard_not_found' : null,
    sourceLinks,
    status: 'ready',
    workSummary: createWorkSummary({ clientId, repositories }),
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
