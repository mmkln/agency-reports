import { useCallback, useEffect, useRef, useState } from 'react'

const REFRESH_POLL_INTERVAL_MS = 3000

const NON_FAILURE_STEP_REASONS = new Set([
  'sync_already_running',
])

function normalizeStepMetadata(metadata) {
  return metadata && typeof metadata === 'object' ? metadata : {}
}

function buildCampaignQuery(campaignId) {
  if (!campaignId) {
    return ''
  }

  const params = new URLSearchParams()
  params.set('campaign_id', campaignId)

  return `?${params.toString()}`
}

function buildRefreshRequestBody(campaignId) {
  if (!campaignId) {
    return {}
  }

  return {
    campaign_id: campaignId,
  }
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
    campaignId: refresh.campaign_id ?? refresh.campaignId ?? '',
    completedAt: refresh.completed_at ?? refresh.completedAt ?? '',
    errorMessage: refresh.error_message ?? refresh.errorMessage ?? '',
    id: refresh.id ?? '',
    startedAt: refresh.started_at ?? refresh.startedAt ?? '',
    status: refresh.status ?? '',
    steps,
  }
}

function isRefreshRunForCampaign(refreshRun, campaignId) {
  if (!refreshRun) {
    return false
  }

  if (!campaignId) {
    return true
  }

  return refreshRun.campaignId === campaignId
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
  campaignId = '',
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
      .get(`/api/workspaces/${workspaceId}/growth-review/refresh/latest/${buildCampaignQuery(campaignId)}`)
      .then((payload) => applyRefreshRun(payload))
  }, [apiClient, applyRefreshRun, campaignId, workspaceId])

  const startRefresh = useCallback(() => {
    const hasActiveRefresh = (
      isRefreshRunForCampaign(refreshRun, campaignId)
      && (status === 'queued' || status === 'running')
    )

    if (!workspaceId || hasActiveRefresh) {
      return Promise.resolve(null)
    }

    setStatus('queued')
    setError('')
    completedRefreshIdRef.current = ''
    setRefreshRun({
      campaignId,
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
      .post(`/api/workspaces/${workspaceId}/growth-review/refresh/`, buildRefreshRequestBody(campaignId))
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
  }, [apiClient, applyRefreshRun, campaignId, notifyCompleted, refreshRun, status, workspaceId])

  const activeRefreshRun = isRefreshRunForCampaign(refreshRun, campaignId) ? refreshRun : null
  const activeStatus = activeRefreshRun ? status : 'idle'
  const refreshRunId = activeRefreshRun?.id ?? ''

  useEffect(() => {
    if (!workspaceId || !refreshRunId || (activeStatus !== 'queued' && activeStatus !== 'running')) {
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
  }, [activeStatus, loadLatestRefresh, notifyCompleted, refreshRunId, workspaceId])

  return {
    error: activeRefreshRun ? error : '',
    isRefreshing: activeStatus === 'queued' || activeStatus === 'running',
    loadLatestRefresh,
    refreshRun: activeRefreshRun,
    startRefresh,
    status: activeStatus,
  }
}
