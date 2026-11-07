import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getGrowthReviewCampaignsFromApi } from '../../domain/services/growthReviewApiReadService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

function resolveRequestedCampaignId(routeParams = {}) {
  return routeParams.campaign
    ?? routeParams.campaignId
    ?? ''
}

export function useGrowthReviewCampaignSelection({
  apiClient,
  routeParams = {},
  workspaceId,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCampaignId = resolveRequestedCampaignId(routeParams)
  const resource = useAsyncResource({
    dependencyKey: ['growth-review-campaigns', workspaceId ?? ''].join(':'),
    load: () => getGrowthReviewCampaignsFromApi({
      apiClient,
      workspaceId,
    }),
  })
  const campaigns = useMemo(() => resource.data?.campaigns ?? [], [resource.data?.campaigns])
  const defaultCampaignId = resource.data?.defaultCampaignId ?? ''
  const selectedCampaignId = requestedCampaignId || defaultCampaignId
  const selectedCampaign = useMemo(() => (
    campaigns.find((campaign) => campaign.id === selectedCampaignId)
    ?? campaigns.find((campaign) => campaign.id === defaultCampaignId)
    ?? campaigns[0]
    ?? null
  ), [campaigns, defaultCampaignId, selectedCampaignId])

  const selectCampaign = useCallback((campaignId) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (campaignId) {
      nextSearchParams.set('campaign', campaignId)
    } else {
      nextSearchParams.delete('campaign')
    }

    setSearchParams(nextSearchParams)
  }, [searchParams, setSearchParams])

  return {
    campaigns,
    defaultCampaignId,
    error: resource.error,
    isLoading: resource.status === 'loading',
    reload: resource.reload,
    selectedCampaign,
    selectedCampaignId: selectedCampaign?.id ?? selectedCampaignId,
    selectCampaign,
    status: resource.status,
  }
}
