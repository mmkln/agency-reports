import { useCallback, useState } from 'react'

import { getAcceptedTreatmentDrilldownFromApi } from '../../domain/services/growthReviewApiReadService'

export function useAcceptedTreatmentDrilldown({
  apiClient,
  campaignId = '',
  workspaceId,
}) {
  const [dataState, setDataState] = useState({
    campaignId: '',
    data: null,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const data = dataState.campaignId === campaignId ? dataState.data : null

  const load = useCallback(async ({ force = false } = {}) => {
    if (!apiClient || !workspaceId) {
      return null
    }

    if (!force && data) {
      return data
    }

    setIsLoading(true)
    setError('')

    try {
      const payload = await getAcceptedTreatmentDrilldownFromApi({
        apiClient,
        campaignId,
        workspaceId,
      })

      setDataState({
        campaignId,
        data: payload,
      })
      setIsLoading(false)
      return payload
    } catch (requestError) {
      setError(requestError?.message || 'Could not load accepted treatment details.')
      setIsLoading(false)
      return null
    }
  }, [apiClient, campaignId, data, workspaceId])

  return {
    data,
    error,
    isLoading,
    load,
  }
}
