import { useMemo, useState } from 'react'

import {
  archiveClientFileLink,
  createClientFileLink,
  listAdminClientFileLinksWorkspace,
  updateClientFileLink,
} from '../../domain/services/clientFilesLinksService'
import {
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_TYPES,
} from '../../entities/client-file-link'
import { VISIBILITY } from '../../entities/update'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { filterFileLinks } from '../../widgets/admin-client-files-links'

function createUuid() {
  return crypto.randomUUID()
}

function createFileLinkDraft(clientId = '') {
  return {
    clientId,
    description: '',
    displayOrder: '0',
    fileName: '',
    mimeType: '',
    projectId: '',
    relatedReportId: '',
    relatedWorkItemId: '',
    status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
    title: '',
    type: CLIENT_FILE_LINK_TYPES.SHARED_LINK,
    uploadedByName: '',
    url: '',
    visibility: VISIBILITY.CLIENT_VISIBLE,
  }
}

function createFileLinkDraftFromRecord(fileLink) {
  return {
    clientId: fileLink.clientId,
    description: fileLink.description ?? '',
    displayOrder: String(fileLink.displayOrder ?? 0),
    fileName: fileLink.fileName ?? '',
    mimeType: fileLink.mimeType ?? '',
    projectId: fileLink.projectId ?? '',
    relatedReportId: fileLink.relatedReportId ?? '',
    relatedWorkItemId: fileLink.relatedWorkItemId ?? '',
    status: fileLink.status,
    title: fileLink.title,
    type: fileLink.type,
    uploadedByName: fileLink.uploadedByName ?? '',
    url: fileLink.url,
    visibility: fileLink.visibility,
  }
}

const EMPTY_WORKSPACE = {
  client: null,
  clients: [],
  counts: {
    all: 0,
    archived: 0,
    clientVisible: 0,
    internal: 0,
    unavailable: 0,
  },
  fileLinks: [],
  status: 'ready',
}

export function useAdminClientFilesLinksWorkflow({
  initialCreateOpen = false,
  routeClientId,
  runtime,
}) {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState('client_visible')
  const [isDialogOpen, setIsDialogOpen] = useState(initialCreateOpen)
  const [editingFileLink, setEditingFileLink] = useState(null)
  const [fileLinkDraft, setFileLinkDraft] = useState(() => createFileLinkDraft(routeClientId))
  const [fileLinkError, setFileLinkError] = useState('')
  const [fileLinkSaveState, setFileLinkSaveState] = useState('')
  const fileLinksResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-files-links:${routeClientId ?? ''}`,
    initialData: EMPTY_WORKSPACE,
    load: () => runtime.dataClient.read((repositories) => listAdminClientFileLinksWorkspace({
      clientId: routeClientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const workspace = fileLinksResource.data ?? EMPTY_WORKSPACE
  const client = workspace.client
  const filteredFileLinks = useMemo(
    () => filterFileLinks(workspace.fileLinks, statusFilter),
    [statusFilter, workspace.fileLinks],
  )

  function reloadFileLinks() {
    void fileLinksResource.reload()
  }

  function openCreateDialog() {
    setEditingFileLink(null)
    setFileLinkDraft(createFileLinkDraft(client?.id ?? routeClientId))
    setFileLinkError('')
    setFileLinkSaveState('')
    setIsDialogOpen(true)
  }

  function openEditDialog(fileLink) {
    setEditingFileLink(fileLink)
    setFileLinkDraft(createFileLinkDraftFromRecord(fileLink))
    setFileLinkError('')
    setFileLinkSaveState('')
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingFileLink(null)
    setFileLinkError('')
    setFileLinkSaveState('')
  }

  function submitFileLink(event) {
    event.preventDefault()
    setFileLinkError('')
    setFileLinkSaveState(editingFileLink ? 'Saving...' : 'Creating...')

    const operation = editingFileLink
      ? (repositories) => updateClientFileLink({
          fileLinkId: editingFileLink.id,
          input: fileLinkDraft,
          repositories,
          viewer: runtime.viewer,
        })
      : (repositories) => createClientFileLink({
          idGenerator: createUuid,
          input: fileLinkDraft,
          repositories,
          viewer: runtime.viewer,
        })

    void runtime.dataClient.write(operation)
      .then((savedFileLink) => {
        setFileLinkSaveState('')
        closeDialog()
        reloadFileLinks()
        toast.success(editingFileLink ? 'File/link updated' : 'File/link created', `${savedFileLink.title} was saved.`)
      })
      .catch((caughtError) => {
        setFileLinkError(caughtError.message)
        setFileLinkSaveState('')
        toast.error('File/link was not saved', caughtError.message)
      })
  }

  function archiveFileLink(fileLink) {
    void runtime.dataClient.write((repositories) => archiveClientFileLink({
      fileLinkId: fileLink.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((archivedFileLink) => {
        reloadFileLinks()
        toast.success('File/link archived', `${archivedFileLink.title} was removed from the active client surface.`)
      })
      .catch((caughtError) => {
        toast.error('File/link was not archived', caughtError.message)
      })
  }

  return {
    archiveFileLink,
    client,
    clients: workspace.clients,
    closeDialog,
    counts: workspace.counts,
    editingFileLink,
    fileLinkDraft,
    fileLinkError,
    fileLinksResource,
    fileLinkSaveState,
    filteredFileLinks,
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    setFileLinkDraft,
    setStatusFilter,
    statusFilter,
    submitFileLink,
  }
}
