import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_PATHS, withSearchParams } from '@/domain/navigation/routePaths'
import { normalizeBackendClientsPayload } from '@/entities/client'
import { WORKSPACE_CLIENT_ACCESS_POLICIES, normalizeBackendWorkspacesPayload } from '@/entities/workspace'
import { listClients } from '@/features/clients'
import { createWorkspace as createWorkspaceRecord, listWorkspaces } from '@/features/workspaces'

function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

function createWorkspaceForm(clientId = '') {
  return {
    clientAccessPolicy: WORKSPACE_CLIENT_ACCESS_POLICIES.OWNERS_ADMINS,
    clientId,
    name: '',
  }
}

function getWorkspacesPath(clientAccountId = '') {
  return withSearchParams(ROUTE_PATHS.agencyWorkspaces, { clientAccountId })
}

export function useAdminWorkspacesWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const selectedClientAccountId = routeParams.clientAccountId ?? ''
  const isCreateDialogOpen = routeParams.createWorkspace === 'true'
  const [clients, setClients] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [form, setForm] = useState(() => createWorkspaceForm(selectedClientAccountId))
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')

  const filteredWorkspaces = useMemo(() => (
    selectedClientAccountId
      ? workspaces.filter((workspace) => workspace.client_id === selectedClientAccountId)
      : workspaces
  ), [selectedClientAccountId, workspaces])
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientAccountId) ?? null,
    [clients, selectedClientAccountId],
  )

  function applyPayloads(workspacesPayload, clientsPayload) {
    setWorkspaces(normalizeBackendWorkspacesPayload(workspacesPayload).workspaces)
    setClients(normalizeBackendClientsPayload(clientsPayload).clients)
    setStatus('ready')
  }

  function reloadPageData() {
    return Promise.all([
      listWorkspaces(apiClient),
      listClients(apiClient),
    ]).then(([workspacesPayload, clientsPayload]) => {
      applyPayloads(workspacesPayload, clientsPayload)
    }).catch((caughtError) => {
      setError(caughtError.message)
      setStatus('error')
    })
  }

  useEffect(() => {
    let isActive = true

    Promise.all([
      listWorkspaces(apiClient),
      listClients(apiClient),
    ]).then(([workspacesPayload, clientsPayload]) => {
      if (!isActive) {
        return
      }

      applyPayloads(workspacesPayload, clientsPayload)
    }).catch((caughtError) => {
      if (!isActive) {
        return
      }

      setError(caughtError.message)
      setStatus('error')
    })

    return () => {
      isActive = false
    }
  }, [apiClient])

  function closeCreateDialog() {
    if (createStatus === 'creating') {
      return
    }

    setForm(createWorkspaceForm(selectedClientAccountId))
    setCreateError('')
    navigate(getWorkspacesPath(selectedClientAccountId), { replace: true })
  }

  function createWorkspace(event) {
    event.preventDefault()

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const clientId = form.clientId || selectedClientAccountId
    const name = form.name.trim()

    if (!agencyId || !clientId || !name) {
      setCreateError('Agency, client, and workspace name are required.')
      return
    }

    setCreateStatus('creating')
    setCreateError('')
    createWorkspaceRecord(apiClient, {
      agency_id: agencyId,
      client_access_policy: form.clientAccessPolicy,
      client_id: clientId,
      name,
    }).then(() => {
      setForm(createWorkspaceForm(selectedClientAccountId))
      setCreateStatus('idle')
      closeCreateDialog()
      void reloadPageData()
    }).catch((caughtError) => {
      setCreateError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  return {
    clients,
    closeCreateDialog,
    createError,
    createStatus,
    createWorkspace,
    error,
    filteredWorkspaces,
    form,
    isCreateDialogOpen,
    selectedClient,
    selectedClientAccountId,
    setCreateError,
    setForm,
    status,
  }
}
