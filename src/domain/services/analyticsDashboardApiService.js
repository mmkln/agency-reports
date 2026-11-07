import { normalizeAnalyticsDashboard } from '@/entities/analytics-dashboard'
import { normalizeDashboardExplanation } from '@/entities/dashboard-explanation'

function dashboardPath(workspaceId, dashboardKey) {
  if (!workspaceId || !dashboardKey) {
    throw new Error('Workspace id and dashboard key are required.')
  }

  return `/api/workspaces/${workspaceId}/analytics/dashboards/${dashboardKey}/`
}

function dashboardSettingsPath(workspaceId, dashboardKey) {
  return `${dashboardPath(workspaceId, dashboardKey)}settings/`
}

function dashboardsPath(workspaceId) {
  if (!workspaceId) throw new Error('Workspace id is required.')
  return `/api/workspaces/${workspaceId}/analytics/dashboards/`
}

function dashboardExplanationPath(workspaceId, dashboardKey, explanationKey) {
  if (!explanationKey) throw new Error('Explanation key is required.')
  return `${dashboardPath(workspaceId, dashboardKey)}explanations/${encodeURIComponent(explanationKey)}/`
}

function periodRequest({ periodEnd, periodKey, periodType }) {
  if (periodKey) {
    return { period_key: periodKey }
  }
  return Object.fromEntries(
    Object.entries({
      period_end: periodEnd,
      period_type: periodType,
    }).filter(([, value]) => value),
  )
}

export async function getAnalyticsDashboardFromApi({
  apiClient,
  dashboardKey,
  periodEnd,
  periodKey,
  periodType,
  workspaceId,
}) {
  const payload = await apiClient.get(dashboardPath(workspaceId, dashboardKey), {
    query: periodRequest({ periodEnd, periodKey, periodType }),
  })

  return normalizeAnalyticsDashboard(payload)
}

export async function refreshAnalyticsDashboardFromApi({
  apiClient,
  dashboardKey,
  periodEnd,
  periodKey,
  periodType,
  workspaceId,
}) {
  return apiClient.post(
    `${dashboardPath(workspaceId, dashboardKey)}refresh/`,
    periodRequest({ periodEnd, periodKey, periodType }),
  )
}

export async function getAnalyticsDashboardRefreshFromApi({ apiClient, refreshId, workspaceId }) {
  return apiClient.get(`/api/workspaces/${workspaceId}/analytics/refreshes/${refreshId}/`)
}

export async function getAnalyticsDashboardSettingsFromApi({
  apiClient,
  dashboardKey,
  workspaceId,
}) {
  const payload = await apiClient.get(dashboardSettingsPath(workspaceId, dashboardKey))
  return payload.settings
}

export async function updateAnalyticsDashboardSettingsFromApi({
  apiClient,
  dashboardKey,
  patch,
  workspaceId,
}) {
  const payload = await apiClient.request(dashboardSettingsPath(workspaceId, dashboardKey), {
    body: patch,
    method: 'PATCH',
  })
  return payload
}

export async function getAnalyticsDashboardProvisioningOptionsFromApi({ apiClient, workspaceId }) {
  const [definitionsPayload, connectionsPayload] = await Promise.all([
    apiClient.get(`/api/workspaces/${workspaceId}/analytics/dashboard-definitions/`),
    apiClient.get(`/api/workspaces/${workspaceId}/source-connections/`),
  ])
  return {
    definitions: definitionsPayload.definitions ?? [],
    sourceConnections: connectionsPayload.source_connections ?? [],
  }
}

export async function createAnalyticsDashboardFromApi({
  apiClient,
  definitionKey,
  sourceConnectionId,
  workspaceId,
}) {
  const payload = await apiClient.post(dashboardsPath(workspaceId), {
    definition_key: definitionKey,
    source_connection_id: sourceConnectionId,
  })
  return payload.dashboard
}

export async function updateAnalyticsDashboardExplanation({
  apiClient,
  dashboardKey,
  explanation,
  explanationKey,
  workspaceId,
}) {
  const payload = await apiClient.request(
    dashboardExplanationPath(workspaceId, dashboardKey, explanationKey),
    {
      body: {
        additional_note: explanation.additionalNote,
        calculation_explanation: explanation.calculationExplanation,
        definition: explanation.definition,
        label: explanation.label,
        source: explanation.source,
      },
      method: 'PUT',
    },
  )
  return normalizeDashboardExplanation(payload.explanation, explanationKey)
}

export async function resetAnalyticsDashboardExplanation({
  apiClient,
  dashboardKey,
  explanationKey,
  workspaceId,
}) {
  const payload = await apiClient.request(
    dashboardExplanationPath(workspaceId, dashboardKey, explanationKey),
    { method: 'DELETE' },
  )
  return normalizeDashboardExplanation(payload.explanation, explanationKey)
}
