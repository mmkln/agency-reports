import { useMemo, useState } from 'react'

import {
  listAdminClientRequestsWorkspace,
  updateClientRequestTriage,
} from '../../domain/services/clientRequestsService'
import { CLIENT_REQUEST_STATUSES } from '../../entities/client-request'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { filterRequests } from '../../widgets/admin-client-submitted-requests'

function createTriageDraft(request = {}) {
  return {
    agencyResponse: request.agencyResponse ?? '',
    status: request.status === CLIENT_REQUEST_STATUSES.SUBMITTED
      ? CLIENT_REQUEST_STATUSES.UNDER_REVIEW
      : request.status ?? CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
  }
}

const EMPTY_WORKSPACE = {
  clients: [],
  counts: {
    all: 0,
    archived: 0,
    completed: 0,
    needsReview: 0,
    open: 0,
    waitingOnAgency: 0,
    waitingOnClient: 0,
  },
  requests: [],
  status: 'ready',
}

export function useAdminClientSubmittedRequestsWorkflow({
  routeClientId,
  runtime,
}) {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState('open')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [triageDraft, setTriageDraft] = useState(() => createTriageDraft())
  const [triageError, setTriageError] = useState('')
  const [triageSaveState, setTriageSaveState] = useState('')
  const requestsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-submitted-requests:${routeClientId ?? ''}`,
    initialData: EMPTY_WORKSPACE,
    load: () => runtime.dataClient.read((repositories) => listAdminClientRequestsWorkspace({
      clientId: routeClientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const workspace = requestsResource.data ?? EMPTY_WORKSPACE
  const client = workspace.clients.find((item) => item.id === routeClientId) ?? workspace.clients[0] ?? null
  const filteredRequests = useMemo(
    () => filterRequests(workspace.requests, statusFilter),
    [statusFilter, workspace.requests],
  )

  function reloadRequests() {
    void requestsResource.reload()
  }

  function openTriageDialog(request) {
    setSelectedRequest(request)
    setTriageDraft(createTriageDraft(request))
    setTriageError('')
    setTriageSaveState('')
  }

  function closeTriageDialog() {
    setSelectedRequest(null)
    setTriageDraft(createTriageDraft())
    setTriageError('')
    setTriageSaveState('')
  }

  function submitTriage(event) {
    event.preventDefault()

    if (!selectedRequest) {
      return
    }

    setTriageError('')
    setTriageSaveState('Saving...')

    void runtime.dataClient.write((repositories) => updateClientRequestTriage({
      input: triageDraft,
      repositories,
      requestId: selectedRequest.id,
      viewer: runtime.viewer,
    }))
      .then((updatedRequest) => {
        setTriageSaveState('')
        closeTriageDialog()
        reloadRequests()
        toast.success('Client request updated', `${updatedRequest.title} is now ${updatedRequest.statusMeta.label.toLowerCase()}.`)
      })
      .catch((caughtError) => {
        setTriageError(caughtError.message)
        setTriageSaveState('')
        toast.error('Client request was not updated', caughtError.message)
      })
  }

  return {
    client,
    closeTriageDialog,
    counts: workspace.counts,
    filteredRequests,
    openTriageDialog,
    requestsResource,
    selectedRequest,
    setStatusFilter,
    setTriageDraft,
    statusFilter,
    submitTriage,
    triageDraft,
    triageError,
    triageSaveState,
  }
}
