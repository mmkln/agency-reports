import { describe, expect, it, vi } from 'vitest'

import {
  getAnalyticsDashboardFromApi,
  refreshAnalyticsDashboardFromApi,
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
})
