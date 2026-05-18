import { useState } from 'react'

import { CLIENT_REQUEST_TYPES } from '../../entities/client-request'
import { createClientRequest } from '../../domain/services/clientRequestsService'
import { useToast } from '../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function createInitialDraft(clientId = '') {
  return {
    clientId,
    description: '',
    desiredDueDate: '',
    referenceLink: '',
    requestType: CLIENT_REQUEST_TYPES.NEW_WORK,
    title: '',
  }
}

export function useClientRequestsWorkflow({
  clientId,
  initiallyOpen = false,
  onCreated,
  runtime,
}) {
  const toast = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(() => initiallyOpen)
  const [requestDraft, setRequestDraft] = useState(() => createInitialDraft(clientId))
  const [requestError, setRequestError] = useState('')
  const [requestSaveState, setRequestSaveState] = useState('')

  function openCreateDialog() {
    setRequestDraft(createInitialDraft(clientId))
    setRequestError('')
    setRequestSaveState('')
    setIsCreateOpen(true)
  }

  function closeCreateDialog() {
    setIsCreateOpen(false)
    setRequestError('')
    setRequestSaveState('')
  }

  function submitRequest(event) {
    event.preventDefault()
    setRequestError('')
    setRequestSaveState('Submitting...')

    void runtime.dataClient.write((repositories) => createClientRequest({
      idGenerator: createUuid,
      input: {
        ...requestDraft,
        clientId,
      },
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdRequest) => {
        setRequestSaveState('')
        setIsCreateOpen(false)
        setRequestDraft(createInitialDraft(clientId))
        onCreated?.()
        toast.success('Request submitted', `${createdRequest.title} was sent to the agency.`)
      })
      .catch((caughtError) => {
        setRequestError(caughtError.message)
        setRequestSaveState('')
        toast.error('Request was not submitted', caughtError.message)
      })
  }

  return {
    closeCreateDialog,
    isCreateOpen,
    openCreateDialog,
    requestDraft,
    requestError,
    requestSaveState,
    setRequestDraft,
    submitRequest,
  }
}
