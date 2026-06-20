import { useCallback, useState } from 'react'

const NON_FAILURE_STEP_REASONS = new Set([
  'sync_already_running',
])

function normalizeStepMetadata(metadata) {
  return metadata && typeof metadata === 'object' ? metadata : {}
}

function normalizeStepStatus(step, metadata) {
  const status = step.status ?? ''
  const reason = metadata.reason ?? ''

  if (status === 'failed' && NON_FAILURE_STEP_REASONS.has(reason)) {
    return reason
  }

  return status
}

function normalizeRefreshRun(payload) {
  const refresh = payload?.refresh ?? payload

  if (!refresh) {
    return null
  }

  const steps = Array.isArray(refresh.steps)
    ? refresh.steps.map((step) => {
      const metadata = normalizeStepMetadata(step.metadata)

      return {
        completedAt: step.completed_at ?? step.completedAt ?? '',
        detail: metadata.detail ?? step.error_message ?? step.errorMessage ?? '',
        errorMessage: step.error_message ?? step.errorMessage ?? '',
        id: step.id ?? step.key ?? '',
        key: step.key ?? '',
        label: step.label ?? step.key ?? '',
        metadata,
        reason: metadata.reason ?? '',
        startedAt: step.started_at ?? step.startedAt ?? '',
        status: normalizeStepStatus(step, metadata),
      }
    })
    : []

  return {
    completedAt: refresh.completed_at ?? refresh.completedAt ?? '',
    errorMessage: refresh.error_message ?? refresh.errorMessage ?? '',
    id: refresh.id ?? '',
    startedAt: refresh.started_at ?? refresh.startedAt ?? '',
    status: refresh.status ?? '',
    steps,
  }
}

function resolveRefreshStatus(refreshRun) {
  if (!refreshRun) {
    return 'failed'
  }

  const hasBlockingFailure = refreshRun.steps.some((step) => step.status === 'failed')
  const hasAlreadyRunningStep = refreshRun.steps.some((step) => step.status === 'sync_already_running')

  if (hasBlockingFailure) {
    return 'failed'
  }

  if (refreshRun.status === 'failed' && hasAlreadyRunningStep) {
    return 'already_running'
  }

  return refreshRun.status === 'failed' ? 'failed' : 'completed'
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
        const nextStatus = resolveRefreshStatus(nextRefreshRun)

        setRefreshRun(nextRefreshRun)
        setStatus(nextStatus)

        if (nextStatus === 'completed') {
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
