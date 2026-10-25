import { normalizeAnalyticsDashboard } from '@/entities/analytics-dashboard'

function dashboardPath(workspaceId, dashboardKey) {
  if (!workspaceId || !dashboardKey) {
    throw new Error('Workspace id and dashboard key are required.')
  }

  return `/api/workspaces/${workspaceId}/analytics/dashboards/${dashboardKey}/`
}

export async function getAnalyticsDashboardFromApi({
  apiClient,
  dashboardKey,
  periodEnd,
  periodType,
  workspaceId,
}) {
  const payload = await apiClient.get(dashboardPath(workspaceId, dashboardKey), {
    query: {
      period_end: periodEnd,
      period_type: periodType,
    },
  })

  return normalizeAnalyticsDashboard(payload)
}

export async function refreshAnalyticsDashboardFromApi({
  apiClient,
  dashboardKey,
  periodEnd,
  periodType,
  workspaceId,
}) {
  return apiClient.post(`${dashboardPath(workspaceId, dashboardKey)}refresh/`, {
    period_end: periodEnd,
    period_type: periodType,
  })
}

export async function getAnalyticsDashboardRefreshFromApi({ apiClient, refreshId, workspaceId }) {
  return apiClient.get(`/api/workspaces/${workspaceId}/analytics/refreshes/${refreshId}/`)
}
