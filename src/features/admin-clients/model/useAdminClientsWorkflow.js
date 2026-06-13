import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { normalizeBackendClient, normalizeBackendClientsPayload } from '@/entities/client'
import { WORKSPACE_CLIENT_ACCESS_POLICIES } from '@/entities/workspace'
import { WORKSPACE_ROLES } from '@/entities/workspace-membership'

import { getAdminClientsPath } from './adminClientPaths'

function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

function createClientForm() {
  return {
    name: '',
  }
}

function createEditClientForm(client) {
  return {
    clientId: client?.id ?? '',
    name: client?.name ?? '',
    status: client?.status ?? 'active',
  }
}

function createInviteClientUserForm() {
  return {
    email: '',
    name: '',
    role: WORKSPACE_ROLES.VIEWER,
  }
}

function getPrimaryClientWorkspace(client) {
  return (client?.workspaces ?? []).find((workspace) => workspace.status === 'active')
    ?? client?.workspaces?.[0]
    ?? null
}

function createWorkspaceForm() {
  return {
    clientAccessPolicy: WORKSPACE_CLIENT_ACCESS_POLICIES.OWNERS_ADMINS,
    name: '',
    type: 'clinic',
  }
}

export function useAdminClientsWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [openClientId, setOpenClientId] = useState('')
  const [editClientId, setEditClientId] = useState('')
  const [inviteClientUserId, setInviteClientUserId] = useState('')
  const [workspaceClientId, setWorkspaceClientId] = useState('')
  const [createForm, setCreateForm] = useState(() => createClientForm())
  const [editForm, setEditForm] = useState(() => createEditClientForm(null))
  const [inviteForm, setInviteForm] = useState(() => createInviteClientUserForm())
  const [workspaceForm, setWorkspaceForm] = useState(() => createWorkspaceForm())
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')
  const [editStatus, setEditStatus] = useState('idle')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [workspaceStatus, setWorkspaceStatus] = useState('idle')

  const openClient = useMemo(
    () => clients.find((client) => client.id === openClientId) ?? null,
    [clients, openClientId],
  )
  const clientPendingEdit = useMemo(
    () => clients.find((client) => client.id === editClientId) ?? null,
    [clients, editClientId],
  )
  const clientPendingInvite = useMemo(
    () => clients.find((client) => client.id === inviteClientUserId) ?? null,
    [clients, inviteClientUserId],
  )
  const clientPendingWorkspace = useMemo(
    () => clients.find((client) => client.id === workspaceClientId) ?? null,
    [clients, workspaceClientId],
  )

  const isCreateDialogOpen = routeParams.createClient === 'true'
  const isDetailDialogOpen = Boolean(openClient)
  const isEditDialogOpen = Boolean(clientPendingEdit)
  const isInviteDialogOpen = Boolean(clientPendingInvite)
  const isWorkspaceDialogOpen = Boolean(clientPendingWorkspace)
  const resolvedEditForm = clientPendingEdit && editForm.clientId !== clientPendingEdit.id
    ? createEditClientForm(clientPendingEdit)
    : editForm

  function applyClientsPayload(payload) {
    setClients(normalizeBackendClientsPayload(payload).clients)
    setStatus('ready')
  }

  function reloadClients() {
    return apiClient.get('/api/clients/')
      .then((payload) => {
        applyClientsPayload(payload)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    let isActive = true

    apiClient.get('/api/clients/')
      .then((payload) => {
        if (!isActive) {
          return
        }

        applyClientsPayload(payload)
      })
      .catch((caughtError) => {
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

  function openCreateDialog() {
    navigate(getAdminClientsPath({ createClient: 'true' }))
  }

  function openClientDetail(client) {
    setOpenClientId(client.id)
  }

  function openEditDialog(client) {
    setEditForm(createEditClientForm(client))
    setEditError('')
    setEditClientId(client.id)
  }

  function openInviteDialog(client) {
    setInviteError('')
    setInviteClientUserId(client.id)
  }

  function openWorkspaceDialog(client) {
    setWorkspaceClientId(client.id)
    setWorkspaceForm(createWorkspaceForm())
    setWorkspaceError('')
  }

  function closeDialog() {
    if (
      createStatus === 'creating'
      || editStatus === 'saving'
      || inviteStatus === 'inviting'
      || workspaceStatus === 'creating'
    ) {
      return
    }

    setOpenClientId('')
    setEditClientId('')
    setInviteClientUserId('')
    setWorkspaceClientId('')
    setCreateForm(createClientForm())
    setEditForm(createEditClientForm(null))
    setInviteForm(createInviteClientUserForm())
    setWorkspaceForm(createWorkspaceForm())
    setCreateError('')
    setEditError('')
    setInviteError('')
    setWorkspaceError('')

    if (isCreateDialogOpen) {
      navigate(getAdminClientsPath(), { replace: true })
    }
  }

  function createClient(event) {
    event.preventDefault()

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const name = createForm.name.trim()

    if (!agencyId || !name) {
      setCreateError('Agency and client name are required.')
      return
    }

    setCreateStatus('creating')
    setCreateError('')
    apiClient.post('/api/clients/', {
      agency_id: agencyId,
      name,
    }).then(() => {
      setCreateForm(createClientForm())
      setCreateStatus('idle')
      void reloadClients()
      navigate(getAdminClientsPath(), { replace: true })
    }).catch((caughtError) => {
      setCreateError(caughtError.message)
      setCreateStatus('idle')
    })
  }

  function saveClientEdit(event) {
    event.preventDefault()

    if (!clientPendingEdit) {
      return
    }

    const name = resolvedEditForm.name.trim()
    if (!name) {
      setEditError('Client name is required.')
      return
    }

    setEditStatus('saving')
    setEditError('')
    apiClient.request(`/api/clients/${clientPendingEdit.id}/`, {
      body: {
        name,
        status: resolvedEditForm.status,
      },
      method: 'PATCH',
    }).then((payload) => {
      const updatedClient = normalizeBackendClient(payload.client)
      setClients((current) => current.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
      setEditStatus('idle')
      setEditClientId('')
    }).catch((caughtError) => {
      setEditError(caughtError.message)
      setEditStatus('idle')
    })
  }

  function inviteClientUser(event) {
    event.preventDefault()

    if (!clientPendingInvite) {
      return
    }

    const email = inviteForm.email.trim().toLowerCase()
    const workspace = getPrimaryClientWorkspace(clientPendingInvite)

    if (!email) {
      setInviteError('Email is required.')
      return
    }

    if (!workspace?.id) {
      setInviteError('Create a workspace before inviting client users.')
      return
    }

    setInviteStatus('inviting')
    setInviteError('')
    apiClient.post(`/api/workspaces/${workspace.id}/invitations/`, {
      email,
      name: inviteForm.name.trim(),
      role: inviteForm.role,
    }).then(() => {
      setInviteForm(createInviteClientUserForm())
      setInviteStatus('idle')
      setInviteClientUserId('')
      void reloadClients()
    }).catch((caughtError) => {
      setInviteError(caughtError.message)
      setInviteStatus('idle')
    })
  }

  function createWorkspace(event) {
    event.preventDefault()

    if (!clientPendingWorkspace) {
      return
    }

    const agencyId = getPrimaryAgencyId(runtime.viewer)
    const name = workspaceForm.name.trim()

    if (!agencyId || !name) {
      setWorkspaceError('Agency and workspace name are required.')
      return
    }

    setWorkspaceStatus('creating')
    setWorkspaceError('')
    apiClient.post('/api/workspaces/', {
      agency_id: agencyId,
      client_access_policy: workspaceForm.clientAccessPolicy,
      client_id: clientPendingWorkspace.id,
      name,
      type: workspaceForm.type,
    }).then(() => {
      setWorkspaceForm(createWorkspaceForm())
      setWorkspaceClientId('')
      setWorkspaceStatus('idle')
      void reloadClients()
    }).catch((caughtError) => {
      setWorkspaceError(caughtError.message)
      setWorkspaceStatus('idle')
    })
  }

  return {
    clients,
    closeDialog,
    clientPendingEdit,
    clientPendingInvite,
    clientPendingWorkspace,
    createClient,
    createError,
    createForm,
    createStatus,
    createWorkspace,
    editError,
    editForm: resolvedEditForm,
    editStatus,
    error,
    inviteClientUser,
    inviteError,
    inviteForm,
    inviteStatus,
    isCreateDialogOpen,
    isDetailDialogOpen,
    isEditDialogOpen,
    isInviteDialogOpen,
    isWorkspaceDialogOpen,
    openClient,
    openClientDetail,
    openCreateDialog,
    openEditDialog,
    openInviteDialog,
    openWorkspaceDialog,
    reloadClients,
    saveClientEdit,
    setCreateError,
    setCreateForm,
    setEditError,
    setEditForm,
    setInviteError,
    setInviteForm,
    setWorkspaceError,
    setWorkspaceForm,
    status,
    workspaceError,
    workspaceForm,
    workspaceStatus,
  }
}
