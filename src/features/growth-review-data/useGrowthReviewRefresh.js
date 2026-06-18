import { useCallback, useState } from 'react'

function normalizeRefreshRun(payload) {
  const refresh = payload?.refresh ?? payload

  if (!refresh) {
    return null
  }

  return {
    completedAt: refresh.completed_at ?? refresh.completedAt ?? '',
    errorMessage: refresh.error_message ?? refresh.errorMessage ?? '',
    id: refresh.id ?? '',
    startedAt: refresh.started_at ?? refresh.startedAt ?? '',
    status: refresh.status ?? '',
    steps: Array.isArray(refresh.steps)
      ? refresh.steps.map((step) => ({
        completedAt: step.completed_at ?? step.completedAt ?? '',
        errorMessage: step.error_message ?? step.errorMessage ?? '',
        id: step.id ?? step.key ?? '',
        key: step.key ?? '',
        label: step.label ?? step.key ?? '',
        startedAt: step.started_at ?? step.startedAt ?? '',
        status: step.status ?? '',
      }))
      : [],
  }
}

export function useGrowthReviewRefresh({
  apiClient,
  onCompleted,
  workspaceId,
}) {
  const [refreshRun, setRefreshRun] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const startRefresh = useCallback(() => {
    if (!workspaceId || status === 'running') {
      return Promise.resolve(null)
    }

    setStatus('running')
    setError('')
    setRefreshRun({
      errorMessage: '',
      id: '',
      status: 'running',
      steps: [
        { key: 'contacts', label: 'Contacts', status: 'running' },
        { key: 'opportunities', label: 'Opportunities', status: 'pending' },
        { key: 'appointments', label: 'Appointments', status: 'pending' },
        { key: 'conversation_messages', label: 'Messages', status: 'pending' },
        { key: 'custom_fields', label: 'Custom fields', status: 'pending' },
        { key: 'reactivation_campaign_calculation', label: 'Dashboard calculation', status: 'pending' },
      ],
    })

    return apiClient
      .post(`/api/workspaces/${workspaceId}/growth-review/refresh/`, {})
      .then((payload) => {
        const nextRefreshRun = normalizeRefreshRun(payload)

        setRefreshRun(nextRefreshRun)
        setStatus(nextRefreshRun?.status === 'failed' ? 'failed' : 'completed')

        if (nextRefreshRun?.status !== 'failed') {
          return Promise.resolve(onCompleted?.()).then(() => nextRefreshRun)
        }

        return nextRefreshRun
      })
      .catch((caughtError) => {
        setStatus('failed')
        setError(caughtError.message)
        setRefreshRun((current) => ({
          ...(current ?? {}),
          errorMessage: caughtError.message,
          status: 'failed',
        }))
        return null
      })
  }, [apiClient, onCompleted, status, workspaceId])

  return {
    error,
    isRefreshing: status === 'running',
    refreshRun,
    startRefresh,
    status,
  }
}
