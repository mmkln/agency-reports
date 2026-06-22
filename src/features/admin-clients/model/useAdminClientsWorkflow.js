import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createClient as createClientRecord, updateClient } from '@/features/clients'
import { createWorkspaceInvitation } from '@/features/invitations'
import { createWorkspace as createWorkspaceRecord } from '@/features/workspaces'

import {
  createClientEditPayload,
  createClientForm,
  createClientPayload,
  createEditClientForm,
  createInviteClientUserForm,
  createWorkspaceForm,
  createWorkspaceInvitationPayload,
  createWorkspacePayload,
} from './adminClientsForms'
import { normalizeAdminClientPayload } from './adminClientsNormalizers'
import { findClientById, getPrimaryAgencyId, getPrimaryClientWorkspace } from './adminClientsSelectors'
import { getAdminClientsPath } from './adminClientPaths'
import { useAdminClientsResource } from './useAdminClientsResource'

export function useAdminClientsWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const navigate = useNavigate()
  const {
    clients,
    error,
    reloadClients,
    replaceClient,
    status,
  } = useAdminClientsResource({ apiClient })
  const [openClientId, setOpenClientId] = useState('')
  const [editClientId, setEditClientId] = useState('')
  const [inviteClientUserId, setInviteClientUserId] = useState('')
  const [workspaceClientId, setWorkspaceClientId] = useState('')
  const [createForm, setCreateForm] = useState(() => createClientForm())
  const [editForm, setEditForm] = useState(() => createEditClientForm(null))
  const [inviteForm, setInviteForm] = useState(() => createInviteClientUserForm())
  const [workspaceForm, setWorkspaceForm] = useState(() => createWorkspaceForm())
  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const [createStatus, setCreateStatus] = useState('idle')
  const [editStatus, setEditStatus] = useState('idle')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [workspaceStatus, setWorkspaceStatus] = useState('idle')

  const openClient = useMemo(
    () => findClientById(clients, openClientId),
    [clients, openClientId],
  )
  const clientPendingEdit = useMemo(
    () => findClientById(clients, editClientId),
    [clients, editClientId],
  )
  const clientPendingInvite = useMemo(
    () => findClientById(clients, inviteClientUserId),
    [clients, inviteClientUserId],
  )
  const clientPendingWorkspace = useMemo(
    () => findClientById(clients, workspaceClientId),
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
    createClientRecord(apiClient, createClientPayload({
      agencyId,
      name,
    })).then(() => {
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
    updateClient(apiClient, clientPendingEdit.id, createClientEditPayload({
      name,
      status: resolvedEditForm.status,
    })).then((payload) => {
      replaceClient(normalizeAdminClientPayload(payload))
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
    const name = inviteForm.name.trim()
    const workspace = getPrimaryClientWorkspace(clientPendingInvite)

    if (!name) {
      setInviteError('Name is required.')
      return
    }

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
    createWorkspaceInvitation(apiClient, workspace.id, createWorkspaceInvitationPayload({
      email,
      name,
      role: inviteForm.role,
    })).then(() => {
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
    createWorkspaceRecord(apiClient, createWorkspacePayload({
      agencyId,
      clientId: clientPendingWorkspace.id,
      form: workspaceForm,
      name,
    })).then(() => {
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
