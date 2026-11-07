import { useCallback, useMemo, useState } from 'react'

import {
  filterSourceTags,
  getWorkspaceTagCatalog,
  updateWorkspaceTagDescription,
} from '@/entities/source-tag'
import { syncGhlTags } from '@/entities/ghl-integration'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

export function useWorkspaceTagCatalog({ apiClient, workspaceId }) {
  const [query, setQuery] = useState('')
  const [refreshStatus, setRefreshStatus] = useState('idle')
  const [descriptionEditorTagId, setDescriptionEditorTagId] = useState(null)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [descriptionSaveError, setDescriptionSaveError] = useState('')
  const [descriptionSaveStatus, setDescriptionSaveStatus] = useState('idle')
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
  const descriptionEditorTag = useMemo(
    () => catalog.tags.find((tag) => tag.id === descriptionEditorTagId) ?? null,
    [catalog.tags, descriptionEditorTagId],
  )
  const catalogUpdatedAt = useMemo(() => catalog.tags.reduce((latest, tag) => {
    if (!tag.updatedAt) {
      return latest
    }

    if (!latest || Date.parse(tag.updatedAt) > Date.parse(latest)) {
      return tag.updatedAt
    }

    return latest
  }, ''), [catalog.tags])
  const openDescriptionEditor = useCallback((tagId) => {
    const tag = catalog.tags.find((candidate) => candidate.id === tagId)

    if (!tag) {
      return
    }

    setDescriptionEditorTagId(tag.id)
    setDescriptionDraft(tag.description ?? '')
    setDescriptionSaveError('')
    setDescriptionSaveStatus('idle')
  }, [catalog.tags])
  const closeDescriptionEditor = useCallback(() => {
    setDescriptionEditorTagId(null)
    setDescriptionDraft('')
    setDescriptionSaveError('')
    setDescriptionSaveStatus('idle')
  }, [])

  async function saveDescription() {
    if (!descriptionEditorTag || descriptionSaveStatus === 'saving') {
      return
    }

    setDescriptionSaveStatus('saving')
    setDescriptionSaveError('')

    try {
      await updateWorkspaceTagDescription(
        apiClient,
        workspaceId,
        descriptionEditorTag.id,
        descriptionDraft,
      )
      await resource.reload()
      closeDescriptionEditor()
    } catch (error) {
      console.error('Tag description update failed.', error)
      setDescriptionSaveError(error?.message || 'Description could not be saved.')
      setDescriptionSaveStatus('idle')
    }
  }

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
    catalogUpdatedAt,
    closeDescriptionEditor,
    descriptionDraft,
    descriptionEditorTag,
    descriptionSaveError,
    descriptionSaveStatus,
    filteredTags,
    hasSourceConnections: catalog.sourceConnections.length > 0,
    openDescriptionEditor,
    query,
    refreshStatus,
    refreshTags,
    resource,
    saveDescription,
    setDescriptionDraft,
    setQuery,
    showSourceColumn: catalog.sourceConnections.length > 1,
    tagCount: catalog.tags.length,
  }
}
