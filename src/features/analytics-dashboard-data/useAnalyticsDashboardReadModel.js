import { useCallback, useState } from 'react'

import { isAnalyticsRefreshFinished } from '@/entities/analytics-dashboard'
import {
  getAnalyticsDashboardFromApi,
  getAnalyticsDashboardRefreshFromApi,
  refreshAnalyticsDashboardFromApi,
} from '@/domain/services/analyticsDashboardApiService'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

const POLL_INTERVAL_MS = 2000
const POLL_LIMIT = 450

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

export function useAnalyticsDashboardReadModel({
  dashboardKey,
  periodEnd,
  periodType,
  runtime,
  workspaceId,
}) {
  const [refresh, setRefresh] = useState(null)
  const [refreshError, setRefreshError] = useState('')
  const resource = useAsyncResource({
    dependencyKey: [
      runtime.viewer?.userId ?? '',
      workspaceId ?? '',
      dashboardKey,
      periodType,
      periodEnd ?? '',
    ].join(':'),
    load: () => getAnalyticsDashboardFromApi({
      apiClient: runtime.apiClient,
      dashboardKey,
      periodEnd,
      periodType,
      workspaceId,
    }),
  })

  const runRefresh = useCallback(async () => {
    setRefreshError('')
    try {
      const started = await refreshAnalyticsDashboardFromApi({
        apiClient: runtime.apiClient,
        dashboardKey,
        periodEnd,
        periodType,
        workspaceId,
      })
      let current = started.refresh
      setRefresh(current)

      for (let attempt = 0; attempt < POLL_LIMIT && !isAnalyticsRefreshFinished(current); attempt += 1) {
        await wait(POLL_INTERVAL_MS)
        const payload = await getAnalyticsDashboardRefreshFromApi({
          apiClient: runtime.apiClient,
          refreshId: current.id,
          workspaceId,
        })
        current = payload.refresh
        setRefresh(current)
      }

      if (!isAnalyticsRefreshFinished(current)) {
        throw new Error('Dashboard refresh is still running. Check again shortly.')
      }
      if (current.status === 'failed') {
        throw new Error(current.error_message || 'Dashboard refresh failed.')
      }
      await resource.reload()
      return current
    } catch (error) {
      setRefreshError(error.message)
      return null
    }
  }, [dashboardKey, periodEnd, periodType, resource, runtime.apiClient, workspaceId])

  return {
    ...resource,
    dashboard: resource.data,
    isUnconfigured: resource.status === 'error' && resource.errorInfo?.kind === 'not-found',
    isRefreshing: Boolean(refresh && !isAnalyticsRefreshFinished(refresh)),
    refresh,
    refreshError,
    runRefresh,
  }
}
