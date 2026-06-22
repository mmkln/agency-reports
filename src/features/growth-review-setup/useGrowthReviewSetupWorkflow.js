import { useMemo, useState } from 'react'

import {
  GROWTH_REVIEW_FUNNEL_CALCULATION_MODES,
  normalizeGrowthReviewSettingsPayload,
  toGrowthReviewSettingsApiInput,
} from '@/entities/growth-review-settings'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

function isBookedStage(stage) {
  return /booked|appointment booked|booked appointment/i.test(stage?.name ?? '')
}

function createStepsFromPipeline(pipeline, bookedStageId = '') {
  return (pipeline?.stages ?? []).map((stage, index) => ({
    calculationMode: GROWTH_REVIEW_FUNNEL_CALCULATION_MODES.CURRENT_STAGE_COUNT,
    displayOrder: index,
    id: null,
    isBookedStep: stage.id === bookedStageId,
    isVisible: true,
    key: stage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: stage.name,
    stageIds: [stage.id],
  }))
}

function createDraftFromPayload(payload) {
  const connections = payload.options.sourceConnections
  const pipelines = payload.options.pipelines

  if (payload.settings) {
    return {
      bookedStageId: payload.settings.bookedStageId,
      funnelPipelineId: payload.settings.funnelPipelineId,
      funnelSteps: payload.settings.funnelSteps,
      reactivationActivityStartDate: payload.settings.reactivationActivityStartDate,
      sourceConnectionId: payload.settings.sourceConnectionId,
    }
  }

  const sourceConnection = connections[0] ?? null
  const pipeline = pipelines.find((item) => item.sourceConnectionId === sourceConnection?.id) ?? pipelines[0] ?? null
  const bookedStage = pipeline?.stages.find(isBookedStage) ?? pipeline?.stages[0] ?? null

  return {
    bookedStageId: bookedStage?.id ?? '',
    funnelPipelineId: pipeline?.id ?? '',
    funnelSteps: createStepsFromPipeline(pipeline, bookedStage?.id),
    reactivationActivityStartDate: '',
    sourceConnectionId: sourceConnection?.id ?? '',
  }
}

function serializeDraft(draft) {
  return JSON.stringify(draft ?? {})
}

export function useGrowthReviewSetupWorkflow({ apiClient, workspaceId }) {
  const [draftOverride, setDraftOverride] = useState({ draft: null, workspaceId: null })
  const [saveState, setSaveState] = useState('')
  const resource = useAsyncResource({
    dependencyKey: `growth-review-setup:${workspaceId}`,
    initialData: null,
    load: () => apiClient
      .get(`/api/workspaces/${workspaceId}/growth-review/settings/`)
      .then(normalizeGrowthReviewSettingsPayload),
  })
  const initialDraft = useMemo(
    () => (resource.data ? createDraftFromPayload(resource.data) : null),
    [resource.data],
  )
  const draft = draftOverride.workspaceId === workspaceId
    ? draftOverride.draft
    : null
  const currentDraft = draft ?? initialDraft
  const isDirty = draft !== null && serializeDraft(draft) !== serializeDraft(initialDraft)

  function resetDraft() {
    setDraftOverride({ draft: null, workspaceId })
    setSaveState('')
  }

  function updateDraft(updater) {
    setDraftOverride((current) => {
      const baseDraft = current.workspaceId === workspaceId && current.draft
        ? current.draft
        : initialDraft
      const nextDraft = typeof updater === 'function' ? updater(baseDraft) : updater
      return { draft: nextDraft, workspaceId }
    })
  }

  async function saveDraft() {
    if (!currentDraft) {
      return
    }

    setSaveState('Saving...')
    await apiClient.request(`/api/workspaces/${workspaceId}/growth-review/settings/`, {
      body: toGrowthReviewSettingsApiInput(currentDraft),
      method: 'PUT',
    })
    setSaveState('Saved')
    setDraftOverride({ draft: null, workspaceId })
    await resource.reload()
  }

  return {
    draft: currentDraft,
    isDirty,
    resetDraft,
    resource,
    saveDraft,
    saveState,
    updateDraft,
  }
}
