import { useState } from 'react'

import { normalizeBackendClient } from '@/entities/client'
import { normalizeBackendClientMembership } from '@/entities/client-membership'
import { WORKSPACE_CLIENT_ACCESS_POLICIES } from '@/entities/workspace'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

function normalizeMembershipsPayload(payload = {}) {
  return (payload.memberships ?? []).map(normalizeBackendClientMembership)
}

function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

function createInviteClientUserForm() {
  return {
    email: '',
    role: 'client_team',
  }
}

function createWorkspaceForm() {
  return {
    clientAccessPolicy: WORKSPACE_CLIENT_ACCESS_POLICIES.OWNERS_ADMINS,
    name: '',
    type: 'clinic',
  }
}

function createEditClientForm(client) {
  return {
    clientId: client?.id ?? '',
    name: client?.name ?? '',
    status: client?.status ?? 'active',
  }
}

export function useAdminClientDetailWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const clientId = routeParams.clientId ?? ''
  const [editForm, setEditForm] = useState(() => createEditClientForm(null))
  const [inviteForm, setInviteForm] = useState(() => createInviteClientUserForm())
  const [workspaceForm, setWorkspaceForm] = useState(() => createWorkspaceForm())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false)
  const [membershipPendingRevoke, setMembershipPendingRevoke] = useState(null)
  const [editError, setEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const [revokeError, setRevokeError] = useState('')
  const [editStatus, setEditStatus] = useState('idle')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [workspaceStatus, setWorkspaceStatus] = useState('idle')
  const [revokeStatus, setRevokeStatus] = useState('idle')
  const { data, error, reload, status } = useAsyncResource({
    dependencyKey: `admin-client-detail:${clientId}`,
    initialData: {
      client: null,
      memberships: [],
    },
    load: async () => {
      if (!clientId) {
        return {
          client: null,
          memberships: [],
        }
      }

      const [clientPayload, membershipsPayload] = await Promise.all([
        apiClient.get(`/api/clients/${clientId}/`),
        apiClient.get(`/api/clients/${clientId}/memberships/`),
      ])

      return {
        client: normalizeBackendClient(clientPayload.client),
        memberships: normalizeMembershipsPayload(membershipsPayload),
      }
    },
  })
  const client = data?.client ?? null
  const memberships = data?.memberships ?? []
  const resolvedEditForm = client && editForm.clientId !== client.id
    ? createEditClientForm(client)
    : editForm

  function closeDialog() {
    if (
      editStatus === 'saving'
      || inviteStatus === 'inviting'
      || workspaceStatus === 'creating'
      || revokeStatus === 'revoking'
    ) {
      return
    }

    setIsEditDialogOpen(false)
    setIsInviteDialogOpen(false)
    setIsWorkspaceDialogOpen(false)
    setMembershipPendingRevoke(null)
    setEditError('')
    setInviteError('')
    setWorkspaceError('')
    setRevokeError('')
  }

  function openEditDialog() {
    setEditForm(createEditClientForm(client))
    setEditError('')
    setIsEditDialogOpen(true)
  }

  function openInviteDialog() {
    setInviteForm(createInviteClientUserForm())
    setInviteError('')
    setIsInviteDialogOpen(true)
  }

  function openWorkspaceDialog() {
    setWorkspaceForm(createWorkspaceForm())
    setWorkspaceError('')
    setIsWorkspaceDialogOpen(true)
  }

  function openRevokeDialog(membership) {
    setMembershipPendingRevoke(membership)
    setRevokeError('')
  }

  function saveClientEdit(event) {
    event.preventDefault()

    if (!client) {
      return
    }

    const name = resolvedEditForm.name.trim()

    if (!name) {
      setEditError('Client name is required.')
      return
    }

    setEditStatus('saving')
    setEditError('')
    apiClient.request(`/api/clients/${client.id}/`, {
      body: {
        name,
        status: resolvedEditForm.status,
      },
      method: 'PATCH',
    }).then(() => {
      setEditStatus('idle')
      setIsEditDialogOpen(false)
      void reload()
    }).catch((caughtError) => {
      setEditError(caughtError.message)
      setEditStatus('idle')
    })
  }

  function inviteClientUser(event) {
    event.preventDefault()

    if (!client) {
      return
    }

    const email = inviteForm.email.trim().toLowerCase()

    if (!email) {
      setInviteError('Email is required.')
      return
    }

    setInviteStatus('inviting')
    setInviteError('')
    apiClient.post(`/api/clients/${client.id}/memberships/`, {
      email,
      role: inviteForm.role,
    }).then(() => {
      setInviteStatus('idle')
      setIsInviteDialogOpen(false)
      void reload()
    }).catch((caughtError) => {
      setInviteError(caughtError.message)
      setInviteStatus('idle')
    })
  }

  function createWorkspace(event) {
    event.preventDefault()

    if (!client) {
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
      client_id: client.id,
      name,
      type: workspaceForm.type,
    }).then(() => {
      setWorkspaceStatus('idle')
      setIsWorkspaceDialogOpen(false)
      void reload()
    }).catch((caughtError) => {
      setWorkspaceError(caughtError.message)
      setWorkspaceStatus('idle')
    })
  }

  function revokeClientUserAccess() {
    if (!client || !membershipPendingRevoke) {
      return
    }

    setRevokeStatus('revoking')
    setRevokeError('')
    apiClient.request(`/api/clients/${client.id}/memberships/${membershipPendingRevoke.id}/`, {
      method: 'DELETE',
    }).then(() => {
      setRevokeStatus('idle')
      setMembershipPendingRevoke(null)
      void reload()
    }).catch((caughtError) => {
      setRevokeError(caughtError.message)
      setRevokeStatus('idle')
    })
  }

  return {
    client,
    clientId,
    closeDialog,
    createWorkspace,
    editError,
    editForm: resolvedEditForm,
    editStatus,
    error,
    inviteClientUser,
    inviteError,
    inviteForm,
    inviteStatus,
    isEditDialogOpen,
    isInviteDialogOpen,
    isRevokeDialogOpen: Boolean(membershipPendingRevoke),
    isWorkspaceDialogOpen,
    membershipPendingRevoke,
    memberships,
    openEditDialog,
    openInviteDialog,
    openRevokeDialog,
    openWorkspaceDialog,
    revokeClientUserAccess,
    revokeError,
    revokeStatus,
    reload,
    saveClientEdit,
    setEditError,
    setEditForm,
    setInviteError,
    setInviteForm,
    setRevokeError,
    setWorkspaceError,
    setWorkspaceForm,
    status,
    workspaceError,
    workspaceForm,
    workspaceStatus,
  }
}
