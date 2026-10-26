import { useCallback } from 'react'

import {
  resetAnalyticsDashboardExplanation,
  updateAnalyticsDashboardExplanation,
} from '@/domain/services/analyticsDashboardApiService'

export function useAnalyticsDashboardExplanationActions({
  apiClient,
  dashboardKey,
  onSaved,
  workspaceId,
}) {
  const onSave = useCallback(async ({ explanation, explanationKey }) => {
    const saved = await updateAnalyticsDashboardExplanation({
      apiClient,
      dashboardKey,
      explanation,
      explanationKey,
      workspaceId,
    })
    await onSaved?.(saved)
    return saved
  }, [apiClient, dashboardKey, onSaved, workspaceId])

  const onReset = useCallback(async ({ explanationKey }) => {
    const saved = await resetAnalyticsDashboardExplanation({
      apiClient,
      dashboardKey,
      explanationKey,
      workspaceId,
    })
    await onSaved?.(saved)
    return saved
  }, [apiClient, dashboardKey, onSaved, workspaceId])

  return { onReset, onSave }
}
