import { useState } from 'react'

import { PERFORMANCE_DASHBOARD_STATUSES } from '../../../entities/performance-dashboard'
import {
  saveAdminPerformanceDashboardPeriod,
  updateAdminPerformanceDashboardPeriodStatus,
  validateAdminPerformanceDashboardPeriod,
} from '../../../domain/services/adminPerformanceDashboardService'
import {
  createUuid,
  periodToForm,
  serializeForm,
} from './performanceDashboardEditorForm'

export function useAdminPerformanceDashboardEditorActions({
  form,
  runtime,
  setForm,
  setValidation,
  toast,
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  async function saveDraft({ silent = false } = {}) {
    setIsSaving(true)

    try {
      const savedPeriod = await runtime.dataClient.write((repositories) => saveAdminPerformanceDashboardPeriod({
        idGenerator: createUuid,
        input: serializeForm({
          ...form,
          status: form.status === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED
            ? PERFORMANCE_DASHBOARD_STATUSES.READY
            : form.status,
        }),
        repositories,
        viewer: runtime.viewer,
      }))

      setForm(periodToForm(savedPeriod))

      if (!silent) {
        toast.success('Performance dashboard saved', `${savedPeriod.title} was saved as ${savedPeriod.statusMeta.label}.`)
      }

      return savedPeriod
    } catch (error) {
      toast.error('Dashboard was not saved', error.message)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function validateDraft() {
    const savedPeriod = await saveDraft({ silent: true })
    const validation = await runtime.dataClient.read((repositories) => validateAdminPerformanceDashboardPeriod({
      periodId: savedPeriod.id,
      repositories,
      viewer: runtime.viewer,
    }))

    setValidation(validation)

    if (validation.isValid) {
      toast.success('Dashboard is publishable', 'Required narrative, KPI, insight, and freshness fields are complete.')
    } else {
      toast.warning('Dashboard needs attention', 'Fix required fields before publishing.')
    }
  }

  async function publishDraft() {
    setIsPublishing(true)

    try {
      const savedPeriod = await saveDraft({ silent: true })
      const publishedPeriod = await runtime.dataClient.write((repositories) => updateAdminPerformanceDashboardPeriodStatus({
        periodId: savedPeriod.id,
        repositories,
        status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
        viewer: runtime.viewer,
      }))

      setForm(periodToForm(publishedPeriod))
      setValidation(null)
      toast.success('Performance dashboard published', `${publishedPeriod.title} is now visible to the client.`)
    } catch (error) {
      toast.error('Dashboard was not published', error.message)
    } finally {
      setIsPublishing(false)
    }
  }

  return {
    isPublishing,
    isSaving,
    publishDraft,
    saveDraft,
    validateDraft,
  }
}
