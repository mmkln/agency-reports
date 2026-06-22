import { useCallback, useEffect, useRef, useState } from 'react'

const REFRESH_POLL_INTERVAL_MS = 3000

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

  if (refreshRun.status === 'queued' || refreshRun.status === 'running') {
    return refreshRun.status
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
  const completedRefreshIdRef = useRef('')

  const notifyCompleted = useCallback((nextRefreshRun) => {
    const refreshId = nextRefreshRun?.id ?? ''

    if (refreshId && completedRefreshIdRef.current === refreshId) {
      return Promise.resolve(nextRefreshRun)
    }

    completedRefreshIdRef.current = refreshId
    return Promise.resolve(onCompleted?.()).then(() => nextRefreshRun)
  }, [onCompleted])

  const applyRefreshRun = useCallback((payload) => {
    const nextRefreshRun = normalizeRefreshRun(payload)
    const nextStatus = resolveRefreshStatus(nextRefreshRun)

    setRefreshRun(nextRefreshRun)
    setStatus(nextStatus)

    return {
      refreshRun: nextRefreshRun,
      status: nextStatus,
    }
  }, [])

  const loadLatestRefresh = useCallback(() => {
    if (!workspaceId) {
      return Promise.resolve(null)
    }

    return apiClient
      .get(`/api/workspaces/${workspaceId}/growth-review/refresh/latest/`)
      .then((payload) => applyRefreshRun(payload))
  }, [apiClient, applyRefreshRun, workspaceId])

  const startRefresh = useCallback(() => {
    if (!workspaceId || status === 'queued' || status === 'running') {
      return Promise.resolve(null)
    }

    setStatus('queued')
    setError('')
    completedRefreshIdRef.current = ''
    setRefreshRun({
      errorMessage: '',
      id: '',
      status: 'queued',
      steps: [
        { key: 'custom_fields', label: 'Custom fields', status: 'pending' },
        { key: 'opportunities', label: 'Opportunities', status: 'pending' },
        { key: 'contacts', label: 'Contacts', status: 'pending' },
        { key: 'appointments', label: 'Appointments', status: 'pending' },
        { key: 'conversation_messages', label: 'Messages', status: 'pending' },
        { key: 'reactivation_campaign_calculation', label: 'Dashboard calculation', status: 'pending' },
      ],
    })

    return apiClient
      .post(`/api/workspaces/${workspaceId}/growth-review/refresh/`, {})
      .then((payload) => {
        const result = applyRefreshRun(payload)

        if (result.status === 'completed') {
          return notifyCompleted(result.refreshRun)
        }

        return result.refreshRun
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
  }, [apiClient, applyRefreshRun, notifyCompleted, status, workspaceId])

  const refreshRunId = refreshRun?.id ?? ''

  useEffect(() => {
    if (!workspaceId || !refreshRunId || (status !== 'queued' && status !== 'running')) {
      return undefined
    }

    let cancelled = false

    const poll = () => {
      loadLatestRefresh()
        .then((result) => {
          if (cancelled || !result) {
            return
          }

          if (result.status === 'completed') {
            notifyCompleted(result.refreshRun)
          }
        })
        .catch((caughtError) => {
          if (cancelled) {
            return
          }

          setStatus('failed')
          setError(caughtError.message)
        })
    }

    const intervalId = window.setInterval(poll, REFRESH_POLL_INTERVAL_MS)
    poll()

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [loadLatestRefresh, notifyCompleted, refreshRunId, status, workspaceId])

  return {
    error,
    isRefreshing: status === 'queued' || status === 'running',
    loadLatestRefresh,
    refreshRun,
    startRefresh,
    status,
  }
}
