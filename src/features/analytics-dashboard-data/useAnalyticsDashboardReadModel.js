import { useCallback, useEffect, useState } from 'react'

import { isAnalyticsRefreshFinished } from '@/entities/analytics-dashboard'
import {
  getAnalyticsDashboardFromApi,
  getAnalyticsDashboardRefreshFromApi,
  refreshAnalyticsDashboardFromApi,
} from '@/domain/services/analyticsDashboardApiService'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

const POLL_INTERVAL_MS = 2000

export function useAnalyticsDashboardReadModel({
  dashboardKey,
  periodEnd,
  periodType,
  runtime,
  workspaceId,
}) {
  const contextKey = [dashboardKey, workspaceId, periodType, periodEnd ?? ''].join(':')
  const [refreshState, setRefreshState] = useState({
    contextKey,
    error: '',
    refresh: null,
  })
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

  const reload = resource.reload
  const localRefresh = refreshState.contextKey === contextKey ? refreshState.refresh : null
  const refreshError = refreshState.contextKey === contextKey ? refreshState.error : ''

  const runRefresh = useCallback(async () => {
    setRefreshState({ contextKey, error: '', refresh: null })
    try {
      const started = await refreshAnalyticsDashboardFromApi({
        apiClient: runtime.apiClient,
        dashboardKey,
        periodEnd,
        periodType,
        workspaceId,
      })
      setRefreshState({ contextKey, error: '', refresh: started.refresh })
      return started.refresh
    } catch (error) {
      setRefreshState({ contextKey, error: error.message, refresh: null })
      return null
    }
  }, [contextKey, dashboardKey, periodEnd, periodType, runtime.apiClient, workspaceId])

  const remoteRefresh = resource.data?.activeRefresh ?? null
  const refreshToPoll = localRefresh && !isAnalyticsRefreshFinished(localRefresh)
    ? localRefresh
    : remoteRefresh && !isAnalyticsRefreshFinished(remoteRefresh)
      ? remoteRefresh
      : null

  useEffect(() => {
    if (!refreshToPoll) return undefined
    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      try {
        const payload = await getAnalyticsDashboardRefreshFromApi({
          apiClient: runtime.apiClient,
          refreshId: refreshToPoll.id,
          workspaceId,
        })
        if (cancelled) return
        const current = payload.refresh
        setRefreshState({ contextKey, error: '', refresh: current })
        if (current.status === 'failed') {
          setRefreshState({
            contextKey,
            error: current.error_message || 'Dashboard refresh failed.',
            refresh: current,
          })
        } else if (isAnalyticsRefreshFinished(current)) {
          await reload()
        }
      } catch (error) {
        if (!cancelled) {
          setRefreshState({ contextKey, error: error.message, refresh: { ...refreshToPoll } })
        }
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [contextKey, refreshToPoll, reload, runtime.apiClient, workspaceId])

  const effectiveRefresh = localRefresh ?? remoteRefresh

  return {
    ...resource,
    dashboard: resource.data,
    isUnconfigured: resource.status === 'error' && resource.errorInfo?.kind === 'not-found',
    isRefreshing: Boolean(refreshToPoll),
    refresh: effectiveRefresh,
    refreshError,
    runRefresh,
  }
}
