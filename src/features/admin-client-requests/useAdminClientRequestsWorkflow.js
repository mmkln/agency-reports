import { useMemo, useState } from 'react'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
} from '../../entities/needed-from-client'
import {
  cancelNeededAction,
  createNeededAction,
  listNeededActionsWorkspace,
  reopenNeededAction,
  resolveNeededAction,
  updateNeededAction,
} from '../../domain/services/neededFromClientService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { filterActions } from '../../widgets/admin-client-requests'

function createUuid() {
  return crypto.randomUUID()
}

function createInitialRequestDraft(clientId = '') {
  return {
    clientId,
    description: '',
    dueDate: '',
    internalNotes: '',
    ownerName: '',
    priority: NEEDED_ACTION_PRIORITIES.MEDIUM,
    relatedLink: '',
    title: '',
  }
}

function createRequestDraftFromAction(action) {
  return {
    clientId: action.clientId,
    description: action.description ?? '',
    dueDate: action.dueDate ?? '',
    internalNotes: action.internalNotes ?? '',
    ownerName: action.ownerName ?? '',
    priority: action.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
    relatedLink: action.relatedLink ?? '',
    title: action.title ?? '',
  }
}

export function useAdminClientRequestsWorkflow({
  initialCreateOpen = false,
  routeClientId,
  runtime,
}) {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState('open')
  const [isCreateOpen, setIsCreateOpen] = useState(initialCreateOpen)
  const [requestDraft, setRequestDraft] = useState(() => createInitialRequestDraft(routeClientId))
  const [requestError, setRequestError] = useState('')
  const [requestSaveState, setRequestSaveState] = useState('')
  const [editingAction, setEditingAction] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [pendingCancel, setPendingCancel] = useState(null)
  const requestsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-requests:${routeClientId ?? ''}`,
    initialData: {
      actions: [],
      clients: [],
    },
    load: () => runtime.dataClient.read((repositories) => listNeededActionsWorkspace({
      filters: {
        clientId: routeClientId || 'all',
      },
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const requestData = requestsResource.data ?? { actions: [], clients: [] }
  const clients = requestData.clients
  const client = clients.find((item) => item.id === routeClientId) ?? clients[0] ?? null
  const actions = requestData.actions
  const filteredActions = useMemo(() => filterActions(actions, statusFilter), [actions, statusFilter])
  const openCount = actions.filter((action) => [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status)).length

  function openCreateDialog() {
    setEditingAction(null)
    setRequestDraft(createInitialRequestDraft(client?.id ?? routeClientId))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function openEditDialog(action) {
    setSelectedAction(null)
    setEditingAction(action)
    setRequestDraft(createRequestDraftFromAction(action))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function closeCreateDialog() {
    setIsCreateOpen(false)
    setEditingAction(null)
    setRequestError('')
    setRequestSaveState('')
  }

  function reloadRequests() {
    void requestsResource.reload()
  }

  function submitRequest(event) {
    event.preventDefault()
    setRequestError('')
    setRequestSaveState(editingAction ? 'Saving...' : 'Creating...')

    const operation = editingAction
      ? (repositories) => updateNeededAction({
          actionId: editingAction.id,
          input: requestDraft,
          repositories,
          viewer: runtime.viewer,
        })
      : (repositories) => createNeededAction({
          idGenerator: createUuid,
          input: requestDraft,
          repositories,
          viewer: runtime.viewer,
        })

    runtime.dataClient.write(operation)
      .then((savedAction) => {
        setRequestSaveState('')
        setEditingAction(null)
        setSelectedAction(null)
        setIsCreateOpen(false)
        reloadRequests()
        toast.success(editingAction ? 'Request updated' : 'Request created', `${savedAction.title} was saved.`)
      })
      .catch((caughtError) => {
        setRequestError(caughtError.message)
        setRequestSaveState('')
        toast.error('Request was not created', caughtError.message)
      })
  }

  function reopenRequest(action) {
    void runtime.dataClient.write((repositories) => reopenNeededAction({
      actionId: action.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request reopened', `${action.title} is pending again.`)
      })
      .catch((caughtError) => {
        toast.error('Request was not reopened', caughtError.message)
      })
  }

  function resolveRequest(action) {
    void runtime.dataClient.write((repositories) => resolveNeededAction({
      actionId: action.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request resolved', `${action.title} was marked resolved.`)
      })
      .catch((caughtError) => {
        toast.error('Request was not resolved', caughtError.message)
      })
  }

  function cancelRequest() {
    if (!pendingCancel) {
      return
    }

    void runtime.dataClient.write((repositories) => cancelNeededAction({
      actionId: pendingCancel.id,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSelectedAction(null)
        reloadRequests()
        toast.success('Request cancelled', `${pendingCancel.title} was cancelled.`)
        setPendingCancel(null)
      })
      .catch((caughtError) => {
        toast.error('Request was not cancelled', caughtError.message)
        setPendingCancel(null)
      })
  }

  return {
    cancelRequest,
    client,
    clients,
    closeCreateDialog,
    editingAction,
    filteredActions,
    isCreateOpen,
    openCount,
    openCreateDialog,
    openEditDialog,
    pendingCancel,
    reopenRequest,
    requestDraft,
    requestError,
    requestsResource,
    requestSaveState,
    resolveRequest,
    selectedAction,
    setPendingCancel,
    setRequestDraft,
    setSelectedAction,
    setStatusFilter,
    statusFilter,
    submitRequest,
  }
}
