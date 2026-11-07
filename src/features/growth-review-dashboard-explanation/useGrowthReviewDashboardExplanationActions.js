import { useCallback } from 'react'

import {
  resetGrowthReviewDashboardExplanation,
  updateGrowthReviewDashboardExplanation,
} from '@/domain/services/growthReviewApiReadService'

export function useGrowthReviewDashboardExplanationActions({
  apiClient,
  campaignId,
  onSaved,
  workspaceId,
}) {
  const onSave = useCallback(async ({ explanation, explanationKey }) => {
    const saved = await updateGrowthReviewDashboardExplanation({
      apiClient,
      campaignId,
      explanation,
      explanationKey,
      workspaceId,
    })
    await onSaved?.(saved)
    return saved
  }, [apiClient, campaignId, onSaved, workspaceId])

  const onReset = useCallback(async ({ explanationKey }) => {
    const saved = await resetGrowthReviewDashboardExplanation({
      apiClient,
      campaignId,
      explanationKey,
      workspaceId,
    })
    await onSaved?.(saved)
    return saved
  }, [apiClient, campaignId, onSaved, workspaceId])

  return { onReset, onSave }
}
