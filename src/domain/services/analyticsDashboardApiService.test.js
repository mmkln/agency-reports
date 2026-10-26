import { describe, expect, it, vi } from 'vitest'

import {
  getAnalyticsDashboardFromApi,
  getAnalyticsDashboardSettingsFromApi,
  refreshAnalyticsDashboardFromApi,
  resetAnalyticsDashboardExplanation,
  updateAnalyticsDashboardExplanation,
  updateAnalyticsDashboardSettingsFromApi,
} from './analyticsDashboardApiService'

const payload = {
  dashboard: { key: 'weekly-lead-report', title: 'Weekly Lead Report' },
  period: { end: '2026-10-25', start: '2026-10-19', type: 'week' },
  status: 'not_calculated',
  widgets: [],
}

describe('analyticsDashboardApiService', () => {
  it('loads a dashboard for an explicit period', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(payload) }

    const result = await getAnalyticsDashboardFromApi({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      periodEnd: '2026-10-25',
      periodType: 'week',
      workspaceId: 'workspace-1',
    })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/analytics/dashboards/weekly-lead-report/',
      { query: { period_end: '2026-10-25', period_type: 'week' } },
    )
    expect(result.status).toBe('not_calculated')
  })

  it('starts refresh through the same generic dashboard endpoint', async () => {
    const apiClient = { post: vi.fn().mockResolvedValue({ refresh: { id: 'run-1' } }) }

    await refreshAnalyticsDashboardFromApi({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      periodEnd: '2026-10-25',
      periodType: 'week',
      workspaceId: 'workspace-1',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/analytics/dashboards/weekly-lead-report/refresh/',
      { period_end: '2026-10-25', period_type: 'week' },
    )
  })

  it('loads and updates dashboard-owned settings', async () => {
    const settings = {
      lifecycle_stage_ids: { booked: ['stage-1'] },
      pipeline_ids: ['pipeline-1'],
    }
    const apiClient = {
      get: vi.fn().mockResolvedValue({ settings }),
      patch: vi.fn().mockResolvedValue({ settings }),
    }

    const loaded = await getAnalyticsDashboardSettingsFromApi({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      workspaceId: 'workspace-1',
    })
    const updated = await updateAnalyticsDashboardSettingsFromApi({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      lifecycleStageIds: settings.lifecycle_stage_ids,
      pipelineIds: settings.pipeline_ids,
      workspaceId: 'workspace-1',
    })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/analytics/dashboards/weekly-lead-report/settings/',
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/analytics/dashboards/weekly-lead-report/settings/',
      {
        lifecycle_stage_ids: settings.lifecycle_stage_ids,
        pipeline_ids: settings.pipeline_ids,
      },
    )
    expect(loaded).toEqual(settings)
    expect(updated).toEqual(settings)
  })

  it('updates and resets dashboard-owned explanations', async () => {
    const explanation = {
      calculationExplanation: 'Count each lead once.',
      definition: 'Leads created in the reporting period.',
      additionalNote: '',
      label: 'Total leads',
      source: 'GHL opportunities',
    }
    const response = {
      explanation: {
        calculation_explanation: explanation.calculationExplanation,
        definition: explanation.definition,
        explanation_key: 'leads.created',
        kind: 'metric',
        label: explanation.label,
        source: explanation.source,
      },
    }
    const apiClient = {
      request: vi.fn().mockResolvedValue(response),
    }

    const updated = await updateAnalyticsDashboardExplanation({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      explanation,
      explanationKey: 'leads.created',
      workspaceId: 'workspace-1',
    })
    const reset = await resetAnalyticsDashboardExplanation({
      apiClient,
      dashboardKey: 'weekly-lead-report',
      explanationKey: 'leads.created',
      workspaceId: 'workspace-1',
    })

    const endpoint = '/api/workspaces/workspace-1/analytics/dashboards/weekly-lead-report/explanations/leads.created/'
    expect(apiClient.request).toHaveBeenNthCalledWith(1, endpoint, {
      body: {
        additional_note: '',
        calculation_explanation: explanation.calculationExplanation,
        definition: explanation.definition,
        label: explanation.label,
        source: explanation.source,
      },
      method: 'PUT',
    })
    expect(apiClient.request).toHaveBeenNthCalledWith(2, endpoint, { method: 'DELETE' })
    expect(updated.explanationKey).toBe('leads.created')
    expect(reset.label).toBe('Total leads')
  })
})
