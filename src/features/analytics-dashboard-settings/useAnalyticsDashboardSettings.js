import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getAnalyticsDashboardSettingsFromApi,
  updateAnalyticsDashboardSettingsFromApi,
} from '@/domain/services/analyticsDashboardApiService'

const EMPTY_LIFECYCLE_STAGE_IDS = {
  active_nurture: [],
  booked: [],
  closed_out: [],
  long_term_nurture: [],
}

function normalizeSettings(settings) {
  return {
    lifecycleStageIds: {
      ...EMPTY_LIFECYCLE_STAGE_IDS,
      ...(settings?.lifecycle_stage_ids ?? {}),
    },
    pipelineIds: settings?.pipeline_ids ?? [],
    pipelineOptions: settings?.pipeline_options ?? [],
  }
}

export function useAnalyticsDashboardSettings({ dashboardKey, open, runtime, workspaceId }) {
  const [state, setState] = useState({
    error: '',
    lifecycleStageIds: EMPTY_LIFECYCLE_STAGE_IDS,
    pipelineIds: [],
    pipelineOptions: [],
    status: 'idle',
  })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, error: '', status: 'loading' }))
    try {
      const settings = await getAnalyticsDashboardSettingsFromApi({
        apiClient: runtime.apiClient,
        dashboardKey,
        workspaceId,
      })
      setState({ ...normalizeSettings(settings), error: '', status: 'ready' })
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
    }
  }, [dashboardKey, runtime.apiClient, workspaceId])

  useEffect(() => {
    if (open) {
      void load()
    }
  }, [load, open])

  const selectedPipelines = useMemo(
    () => state.pipelineOptions.filter((pipeline) => state.pipelineIds.includes(pipeline.id)),
    [state.pipelineIds, state.pipelineOptions],
  )
  const availableStages = useMemo(
    () => selectedPipelines.flatMap((pipeline) => pipeline.stages.map((stage) => ({
      label: `${pipeline.label} · ${stage.label}`,
      value: stage.id,
    }))),
    [selectedPipelines],
  )

  const setPipelineIds = useCallback((pipelineIds) => {
    setState((current) => {
      const validStageIds = new Set(
        current.pipelineOptions
          .filter((pipeline) => pipelineIds.includes(pipeline.id))
          .flatMap((pipeline) => pipeline.stages.map((stage) => stage.id)),
      )
      return {
        ...current,
        lifecycleStageIds: Object.fromEntries(
          Object.entries(current.lifecycleStageIds).map(([key, stageIds]) => [
            key,
            stageIds.filter((stageId) => validStageIds.has(stageId)),
          ]),
        ),
        pipelineIds,
      }
    })
  }, [])

  const setLifecycleStageIds = useCallback((groupKey, stageIds) => {
    setState((current) => ({
      ...current,
      lifecycleStageIds: Object.fromEntries(
        Object.entries(current.lifecycleStageIds).map(([key, currentStageIds]) => [
          key,
          key === groupKey
            ? stageIds
            : currentStageIds.filter((stageId) => !stageIds.includes(stageId)),
        ]),
      ),
    }))
  }, [])

  const save = useCallback(async () => {
    setState((current) => ({ ...current, error: '', status: 'saving' }))
    try {
      const settings = await updateAnalyticsDashboardSettingsFromApi({
        apiClient: runtime.apiClient,
        dashboardKey,
        lifecycleStageIds: state.lifecycleStageIds,
        pipelineIds: state.pipelineIds,
        workspaceId,
      })
      setState({ ...normalizeSettings(settings), error: '', status: 'ready' })
      return true
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
      return false
    }
  }, [dashboardKey, runtime.apiClient, state.lifecycleStageIds, state.pipelineIds, workspaceId])

  return {
    ...state,
    availableStages,
    load,
    save,
    setLifecycleStageIds,
    setPipelineIds,
  }
}
