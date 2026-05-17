import { useMemo, useState } from 'react'

import {
  createClientUpdate,
  hideClientUpdate,
  listAdminClientUpdatesWorkspace,
  updateClientUpdate,
} from '../../domain/services/clientUpdatesService'
import {
  CLIENT_UPDATE_TYPES,
  VISIBILITY,
} from '../../entities/update'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { filterUpdates } from '../../widgets/admin-client-updates'

function createUuid() {
  return crypto.randomUUID()
}

function createUpdateDraft(clientId = '') {
  return {
    body: '',
    clientActionNeeded: '',
    clientId,
    projectId: '',
    publishedAt: '',
    relatedFileLinkId: '',
    relatedReportId: '',
    title: '',
    type: CLIENT_UPDATE_TYPES.WEEKLY_UPDATE,
    visibility: VISIBILITY.CLIENT_VISIBLE,
    whatChanged: '',
    whatNext: '',
  }
}

function createUpdateDraftFromRecord(update) {
  return {
    body: update.body ?? '',
    clientActionNeeded: update.clientActionNeeded ?? '',
    clientId: update.clientId,
    projectId: update.projectId ?? '',
    publishedAt: update.publishedAt ?? '',
    relatedFileLinkId: update.relatedFileLinkId ?? '',
    relatedReportId: update.relatedReportId ?? '',
    title: update.title,
    type: update.type,
    visibility: update.visibility,
    whatChanged: update.whatChanged ?? '',
    whatNext: update.whatNext ?? '',
  }
}

const EMPTY_WORKSPACE = {
  client: null,
  clients: [],
  counts: {
    all: 0,
    clientVisible: 0,
    internal: 0,
  },
  status: 'ready',
  updates: [],
}

export function useAdminClientUpdatesWorkflow({
  initialCreateOpen = false,
  routeClientId,
  runtime,
}) {
  const toast = useToast()
  const [selectedFilter, setSelectedFilter] = useState('client_visible')
  const [isDialogOpen, setIsDialogOpen] = useState(initialCreateOpen)
  const [editingUpdate, setEditingUpdate] = useState(null)
  const [updateDraft, setUpdateDraft] = useState(() => createUpdateDraft(routeClientId))
  const [updateError, setUpdateError] = useState('')
  const [updateSaveState, setUpdateSaveState] = useState('')
  const updatesResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-updates:${routeClientId ?? ''}`,
    initialData: EMPTY_WORKSPACE,
    load: () => runtime.dataClient.read((repositories) => listAdminClientUpdatesWorkspace({
      clientId: routeClientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const workspace = updatesResource.data ?? EMPTY_WORKSPACE
  const client = workspace.client
  const filteredUpdates = useMemo(
    () => filterUpdates(workspace.updates, selectedFilter),
    [selectedFilter, workspace.updates],
  )

  function reloadUpdates() {
    void updatesResource.reload()
  }

  function openCreateDialog() {
    setEditingUpdate(null)
    setUpdateDraft(createUpdateDraft(client?.id ?? routeClientId))
    setUpdateError('')
    setUpdateSaveState('')
    setIsDialogOpen(true)
  }

  function openEditDialog(update) {
    setEditingUpdate(update)
    setUpdateDraft(createUpdateDraftFromRecord(update))
    setUpdateError('')
    setUpdateSaveState('')
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingUpdate(null)
    setUpdateError('')
    setUpdateSaveState('')
  }

  function submitUpdate(event) {
    event.preventDefault()
    setUpdateError('')
    setUpdateSaveState(editingUpdate ? 'Saving...' : 'Creating...')

    const operation = editingUpdate
      ? (repositories) => updateClientUpdate({
          input: updateDraft,
          repositories,
          updateId: editingUpdate.id,
          viewer: runtime.viewer,
        })
      : (repositories) => createClientUpdate({
          idGenerator: createUuid,
          input: updateDraft,
          repositories,
          viewer: runtime.viewer,
        })

    void runtime.dataClient.write(operation)
      .then((savedUpdate) => {
        setUpdateSaveState('')
        closeDialog()
        reloadUpdates()
        toast.success(editingUpdate ? 'Update saved' : 'Update created', `${savedUpdate.title} was saved.`)
      })
      .catch((caughtError) => {
        setUpdateError(caughtError.message)
        setUpdateSaveState('')
        toast.error('Update was not saved', caughtError.message)
      })
  }

  function hideUpdate(update) {
    void runtime.dataClient.write((repositories) => hideClientUpdate({
      repositories,
      updateId: update.id,
      viewer: runtime.viewer,
    }))
      .then((hiddenUpdate) => {
        reloadUpdates()
        toast.success('Update hidden', `${hiddenUpdate.title} is no longer visible to the client.`)
      })
      .catch((caughtError) => {
        toast.error('Update was not hidden', caughtError.message)
      })
  }

  return {
    client,
    clients: workspace.clients,
    closeDialog,
    counts: workspace.counts,
    editingUpdate,
    filteredUpdates,
    hideUpdate,
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    selectedFilter,
    setSelectedFilter,
    setUpdateDraft,
    submitUpdate,
    updateDraft,
    updateError,
    updatesResource,
    updateSaveState,
  }
}
