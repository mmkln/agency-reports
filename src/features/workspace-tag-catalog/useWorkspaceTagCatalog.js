import { useMemo, useState } from 'react'

import {
  filterSourceTags,
  getWorkspaceTagCatalog,
} from '@/entities/source-tag'
import { syncGhlTags } from '@/entities/ghl-integration'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

export function useWorkspaceTagCatalog({ apiClient, workspaceId }) {
  const [query, setQuery] = useState('')
  const [refreshStatus, setRefreshStatus] = useState('idle')
  const resource = useAsyncResource({
    dependencyKey: `workspace-tag-catalog:${workspaceId}`,
    initialData: { sourceConnections: [], tags: [] },
    load: () => getWorkspaceTagCatalog(apiClient, workspaceId),
  })
  const catalog = resource.data ?? { sourceConnections: [], tags: [] }
  const filteredTags = useMemo(
    () => filterSourceTags(catalog.tags, query),
    [catalog.tags, query],
  )

  async function refreshTags() {
    if (refreshStatus === 'refreshing' || catalog.sourceConnections.length === 0) {
      return
    }

    setRefreshStatus('refreshing')
    try {
      await Promise.all(catalog.sourceConnections.map((sourceConnection) => (
        syncGhlTags(apiClient, workspaceId, sourceConnection.id)
      )))
      await resource.reload()
    } catch (error) {
      console.error('Tag catalog refresh failed.', error)
    } finally {
      setRefreshStatus('idle')
    }
  }

  return {
    filteredTags,
    hasSourceConnections: catalog.sourceConnections.length > 0,
    query,
    refreshStatus,
    refreshTags,
    resource,
    setQuery,
    tagCount: catalog.tags.length,
  }
}
