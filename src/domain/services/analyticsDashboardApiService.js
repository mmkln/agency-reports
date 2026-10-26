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

function dashboardExplanationPath(workspaceId, dashboardKey, explanationKey) {
  if (!explanationKey) throw new Error('Explanation key is required.')
  return `${dashboardPath(workspaceId, dashboardKey)}explanations/${encodeURIComponent(explanationKey)}/`
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
  lifecycleStageIds,
  pipelineIds,
  workspaceId,
}) {
  const payload = await apiClient.patch(dashboardSettingsPath(workspaceId, dashboardKey), {
    lifecycle_stage_ids: lifecycleStageIds,
    pipeline_ids: pipelineIds,
  })
  return payload.settings
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
