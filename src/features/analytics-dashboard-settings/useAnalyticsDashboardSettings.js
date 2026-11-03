import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  buildAnalyticsDashboardSettingsPatch,
  normalizeAnalyticsDashboardSettings,
} from '@/entities/analytics-dashboard'
import {
  getAnalyticsDashboardSettingsFromApi,
  updateAnalyticsDashboardSettingsFromApi,
} from '@/domain/services/analyticsDashboardApiService'

const EMPTY_SETTINGS = normalizeAnalyticsDashboardSettings()

export function useAnalyticsDashboardSettings({ dashboardKey, open, runtime, workspaceId }) {
  const [initialSettings, setInitialSettings] = useState(EMPTY_SETTINGS)
  const [state, setState] = useState({
    ...EMPTY_SETTINGS,
    error: '',
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
      const normalized = normalizeAnalyticsDashboardSettings(settings)
      setInitialSettings(normalized)
      setState({ ...normalized, error: '', status: 'ready' })
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
    }
  }, [dashboardKey, runtime.apiClient, workspaceId])

  useEffect(() => {
    if (open) void load()
  }, [load, open])

  const selectedPipelines = useMemo(
    () => state.pipelineOptions.filter((pipeline) => state.pipelineIds.includes(pipeline.id)),
    [state.pipelineIds, state.pipelineOptions],
  )
  const availableStageIds = useMemo(
    () => new Set(selectedPipelines.flatMap((pipeline) => pipeline.stages.map((stage) => stage.id))),
    [selectedPipelines],
  )
  const unmappedStageCount = useMemo(
    () => [...availableStageIds].filter((stageId) => !state.stageAssignments[stageId]).length,
    [availableStageIds, state.stageAssignments],
  )
  const visibleItemCount = useMemo(
    () => [...state.sections, ...state.overviewMetrics].filter((item) => item.isVisible).length,
    [state.overviewMetrics, state.sections],
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
        pipelineIds,
        stageAssignments: Object.fromEntries(
          Object.entries(current.stageAssignments)
            .filter(([stageId]) => validStageIds.has(stageId)),
        ),
      }
    })
  }, [])

  const setStageAssignment = useCallback((stageId, statusKey) => {
    setState((current) => {
      const stageAssignments = { ...current.stageAssignments }
      if (statusKey) stageAssignments[stageId] = statusKey
      else delete stageAssignments[stageId]
      return { ...current, stageAssignments }
    })
  }, [])

  const setSequenceActiveTagNames = useCallback((sequenceActiveTagNames) => {
    setState((current) => ({ ...current, sequenceActiveTagNames }))
  }, [])

  const setSourceMappingTagNames = useCallback((mappingKey, tagNames) => {
    setState((current) => ({
      ...current,
      sourceMappings: current.sourceMappings.map((mapping) => (
        mapping.key === mappingKey ? { ...mapping, tagNames } : mapping
      )),
    }))
  }, [])

  const setVisibility = useCallback((collectionKey, itemId, isVisible) => {
    setState((current) => ({
      ...current,
      [collectionKey]: current[collectionKey].map((item) => (
        item.id === itemId ? { ...item, isVisible } : item
      )),
    }))
  }, [])

  const save = useCallback(async () => {
    if (!visibleItemCount) {
      setState((current) => ({
        ...current,
        error: 'Keep at least one overview metric or report section visible.',
      }))
      return false
    }
    setState((current) => ({ ...current, error: '', status: 'saving' }))
    try {
      const patch = buildAnalyticsDashboardSettingsPatch(initialSettings, state)
      if (!Object.keys(patch).length) {
        setState((current) => ({ ...current, status: 'ready' }))
        return { impact: 'unchanged', settings: initialSettings }
      }
      const payload = await updateAnalyticsDashboardSettingsFromApi({
        apiClient: runtime.apiClient,
        dashboardKey,
        patch,
        workspaceId,
      })
      const normalized = normalizeAnalyticsDashboardSettings(payload.settings)
      setInitialSettings(normalized)
      setState({ ...normalized, error: '', status: 'ready' })
      return { impact: payload.impact ?? 'unchanged', settings: normalized }
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
      return false
    }
  }, [
    dashboardKey,
    initialSettings,
    runtime.apiClient,
    state,
    visibleItemCount,
    workspaceId,
  ])

  return {
    ...state,
    load,
    save,
    selectedPipelines,
    setPipelineIds,
    setSequenceActiveTagNames,
    setSourceMappingTagNames,
    setStageAssignment,
    setVisibility,
    unmappedStageCount,
    visibleItemCount,
  }
}
