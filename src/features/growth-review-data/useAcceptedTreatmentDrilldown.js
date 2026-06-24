import { useCallback, useState } from 'react'

import { getAcceptedTreatmentDrilldownFromApi } from '../../domain/services/growthReviewApiReadService'

export function useAcceptedTreatmentDrilldown({
  apiClient,
  workspaceId,
}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        workspaceId,
      })

      setData(payload)
      setIsLoading(false)
      return payload
    } catch (requestError) {
      setError(requestError?.message || 'Could not load accepted treatment details.')
      setIsLoading(false)
      return null
    }
  }, [apiClient, data, workspaceId])

  return {
    data,
    error,
    isLoading,
    load,
  }
}
