import { useMemo, useState } from 'react'

import {
  createEmptyPerformanceDashboardContent,
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
} from '../../../entities/performance-dashboard'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function createInitialForm({ clientId = '', period = null } = {}) {
  const content = period?.content ?? createEmptyPerformanceDashboardContent()

  return {
    accountManager: period?.accountManager ?? '',
    agencyContact: period?.agencyContact ?? '',
    attributionNote: period?.attributionNote ?? '',
    clientId: period?.clientId ?? period?.client_id ?? clientId,
    content,
    dataConfidence: period?.dataConfidence ?? period?.data_confidence ?? PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
    dataMode: period?.dataMode ?? period?.data_mode ?? PERFORMANCE_DATA_MODES.MANUAL,
    id: period?.id ?? '',
    lastUpdatedAt: period?.lastUpdatedAt ?? period?.last_updated_at ?? new Date().toISOString(),
    periodEnd: period?.periodEnd ?? period?.period_end ?? todayIsoDate(),
    periodStart: period?.periodStart ?? period?.period_start ?? todayIsoDate(),
    sourceSummary: period?.sourceSummary ?? period?.source_summary ?? '',
    status: period?.status ?? PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    title: period?.title ?? 'Marketing Performance Dashboard',
  }
}

export function usePerformanceDashboardPeriodForm({ clientId, onSubmit, period }) {
  const initialForm = useMemo(() => createInitialForm({ clientId, period }), [clientId, period])
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  function updateField(fieldName, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    return Promise.resolve(onSubmit({
      ...form,
    })).catch((caughtError) => {
      setError(caughtError.message)
    })
  }

  return {
    error,
    form,
    handleSubmit,
    updateField,
  }
}
