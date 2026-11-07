import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  createAnalyticsDashboardFromApi,
  getAnalyticsDashboardProvisioningOptionsFromApi,
} from '@/domain/services/analyticsDashboardApiService'

export function useAnalyticsDashboardProvisioning({ dashboardKey, runtime, workspaceId }) {
  const [state, setState] = useState({
    definitions: [],
    error: '',
    sourceConnectionId: '',
    sourceConnections: [],
    status: 'loading',
  })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, error: '', status: 'loading' }))
    try {
      const payload = await getAnalyticsDashboardProvisioningOptionsFromApi({
        apiClient: runtime.apiClient,
        workspaceId,
      })
      const definitions = payload.definitions.filter(
        (definition) => definition.dashboard_key === dashboardKey,
      )
      const provider = definitions[0]?.required_provider
      const sourceConnections = payload.sourceConnections.filter(
        (connection) => connection.status === 'active' && (!provider || connection.provider === provider),
      )
      setState({
        definitions,
        error: '',
        sourceConnectionId: sourceConnections[0]?.id ?? '',
        sourceConnections,
        status: 'ready',
      })
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
    }
  }, [dashboardKey, runtime.apiClient, workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  const definition = useMemo(() => state.definitions[0] ?? null, [state.definitions])

  const create = useCallback(async () => {
    if (!definition || !state.sourceConnectionId) return null
    setState((current) => ({ ...current, error: '', status: 'creating' }))
    try {
      const dashboard = await createAnalyticsDashboardFromApi({
        apiClient: runtime.apiClient,
        definitionKey: definition.key,
        sourceConnectionId: state.sourceConnectionId,
        workspaceId,
      })
      setState((current) => ({ ...current, status: 'ready' }))
      return dashboard
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, status: 'error' }))
      return null
    }
  }, [definition, runtime.apiClient, state.sourceConnectionId, workspaceId])

  return {
    ...state,
    create,
    definition,
    load,
    setSourceConnectionId: (sourceConnectionId) => setState((current) => ({
      ...current,
      sourceConnectionId,
    })),
  }
}
