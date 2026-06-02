import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { normalizeBackendClient, normalizeBackendClientsPayload } from '@/entities/client'
import { normalizeBackendClientMembership } from '@/entities/client-membership'

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
    role: 'client_team',
  }
}

export function useAdminClientsWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [createForm, setCreateForm] = useState(() => createClientForm())
  const [editForm, setEditForm] = useState(() => createEditClientForm(null))
  const [inviteForm, setInviteForm] = useState(() => createInviteClientUserForm())
  const [memberships, setMemberships] = useState([])
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [status, setStatus] = useState('loading')
  const [createStatus, setCreateStatus] = useState('idle')
  const [editStatus, setEditStatus] = useState('idle')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [membershipsStatus, setMembershipsStatus] = useState('idle')

  const openClient = useMemo(
    () => clients.find((client) => client.id === routeParams.openClient) ?? null,
    [clients, routeParams.openClient],
  )
  const clientPendingEdit = useMemo(
    () => clients.find((client) => client.id === routeParams.editClient) ?? null,
    [clients, routeParams.editClient],
  )
  const clientPendingInvite = useMemo(
    () => clients.find((client) => client.id === routeParams.inviteClientUser) ?? null,
    [clients, routeParams.inviteClientUser],
  )

  const isCreateDialogOpen = routeParams.createClient === 'true'
  const isDetailDialogOpen = Boolean(openClient)
  const isEditDialogOpen = Boolean(clientPendingEdit)
  const isInviteDialogOpen = Boolean(clientPendingInvite)
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

  useEffect(() => {
    if (!clientPendingInvite) {
      return
    }

    let isActive = true
    apiClient.get(`/api/clients/${clientPendingInvite.id}/memberships/`)
      .then((payload) => {
        if (!isActive) {
          return
        }

        setMemberships((payload.memberships ?? []).map(normalizeBackendClientMembership))
        setMembershipsStatus('ready')
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setInviteError(caughtError.message)
        setMembershipsStatus('error')
      })

    return () => {
      isActive = false
    }
  }, [apiClient, clientPendingInvite])

  function openCreateDialog() {
    navigate(getAdminClientsPath({ createClient: 'true' }))
  }

  function openClientDetail(client) {
    navigate(getAdminClientsPath({ openClient: client.id }))
  }

  function openEditDialog(client) {
    setEditForm(createEditClientForm(client))
    setEditError('')
    navigate(getAdminClientsPath({ editClient: client.id }))
  }

  function openInviteDialog(client) {
    setMemberships([])
    setMembershipsStatus('loading')
    setInviteError('')
    navigate(getAdminClientsPath({ inviteClientUser: client.id }))
  }

  function closeDialog() {
    if (createStatus === 'creating' || editStatus === 'saving' || inviteStatus === 'inviting') {
      return
    }

    setCreateForm(createClientForm())
    setEditForm(createEditClientForm(null))
    setInviteForm(createInviteClientUserForm())
    setCreateError('')
    setEditError('')
    setInviteError('')
    navigate('/admin/clients', { replace: true })
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
      navigate('/admin/clients', { replace: true })
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
      navigate('/admin/clients', { replace: true })
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
    if (!email) {
      setInviteError('Email is required.')
      return
    }

    setInviteStatus('inviting')
    setInviteError('')
    apiClient.post(`/api/clients/${clientPendingInvite.id}/memberships/`, {
      email,
      role: inviteForm.role,
    }).then((payload) => {
      const membership = normalizeBackendClientMembership(payload.membership)
      setMemberships((current) => [
        membership,
        ...current.filter((item) => item.id !== membership.id),
      ])
      setInviteForm(createInviteClientUserForm())
      setInviteStatus('idle')
      void reloadClients()
    }).catch((caughtError) => {
      setInviteError(caughtError.message)
      setInviteStatus('idle')
    })
  }

  return {
    clients,
    closeDialog,
    clientPendingEdit,
    clientPendingInvite,
    createClient,
    createError,
    createForm,
    createStatus,
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
    memberships,
    membershipsStatus,
    openClient,
    openClientDetail,
    openCreateDialog,
    openEditDialog,
    openInviteDialog,
    reloadClients,
    saveClientEdit,
    setCreateError,
    setCreateForm,
    setEditError,
    setEditForm,
    setInviteError,
    setInviteForm,
    status,
  }
}
