import { useState } from 'react'

import { normalizeBackendClient } from '@/entities/client'
import { WORKSPACE_CLIENT_ACCESS_POLICIES } from '@/entities/workspace'
import { WORKSPACE_ROLES } from '@/entities/workspace-membership'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

function normalizeWorkspaceMembership(source = {}) {
  return {
    createdAt: source.created_at ?? source.createdAt ?? '',
    email: source.email ?? '',
    id: String(source.id ?? ''),
    name: source.name ?? '',
    role: source.role ?? '',
    status: source.status ?? 'active',
    userId: String(source.user_id ?? source.userId ?? ''),
    workspaceId: String(source.workspace_id ?? source.workspaceId ?? ''),
  }
}

function normalizeWorkspaceMembershipsPayload(payload = {}) {
  return (payload.memberships ?? []).map(normalizeWorkspaceMembership)
}

function normalizeWorkspaceInvitation(source = {}) {
  return {
    createdAt: source.created_at ?? source.createdAt ?? '',
    email: source.email ?? '',
    expiresAt: source.expires_at ?? source.expiresAt ?? '',
    id: String(source.id ?? ''),
    makeDeliveryError: source.make_delivery_error ?? source.makeDeliveryError ?? '',
    makeDeliveryStatus: source.make_delivery_status ?? source.makeDeliveryStatus ?? 'pending',
    name: source.name ?? '',
    role: source.role ?? '',
    sentCount: Number(source.sent_count ?? source.sentCount ?? 0),
    status: source.status ?? 'pending',
  }
}

function normalizeWorkspaceInvitationsPayload(payload = {}) {
  return (payload.invitations ?? []).map(normalizeWorkspaceInvitation)
}

function getPrimaryAgencyId(viewer) {
  return viewer?.activeAgencyId ?? viewer?.agencyMemberships?.[0]?.agencyId ?? ''
}

function createInviteClientUserForm() {
  return {
    email: '',
    name: '',
    role: WORKSPACE_ROLES.VIEWER,
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

function getPrimaryWorkspace(client) {
  return (client?.workspaces ?? []).find((workspace) => workspace.status === 'active')
    ?? client?.workspaces?.[0]
    ?? null
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
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [editError, setEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const [revokeError, setRevokeError] = useState('')
  const [cancelInviteError, setCancelInviteError] = useState('')
  const [editStatus, setEditStatus] = useState('idle')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const [workspaceStatus, setWorkspaceStatus] = useState('idle')
  const [revokeStatus, setRevokeStatus] = useState('idle')
  const [cancelInviteStatus, setCancelInviteStatus] = useState('idle')
  const { data, error, reload, status } = useAsyncResource({
    dependencyKey: `admin-client-detail:${clientId}`,
    initialData: {
      client: null,
      invitations: [],
      memberships: [],
    },
    load: async () => {
      if (!clientId) {
        return {
          client: null,
          invitations: [],
          memberships: [],
        }
      }

      const clientPayload = await apiClient.get(`/api/clients/${clientId}/`)
      const nextClient = normalizeBackendClient(clientPayload.client)
      const primaryWorkspace = getPrimaryWorkspace(nextClient)

      if (!primaryWorkspace?.id) {
        return {
          client: nextClient,
          invitations: [],
          memberships: [],
        }
      }

      const [membershipsPayload, invitationsPayload] = await Promise.all([
        apiClient.get(`/api/workspaces/${primaryWorkspace.id}/memberships/`),
        apiClient.get(`/api/workspaces/${primaryWorkspace.id}/invitations/`),
      ])

      return {
        client: nextClient,
        invitations: normalizeWorkspaceInvitationsPayload(invitationsPayload),
        memberships: normalizeWorkspaceMembershipsPayload(membershipsPayload),
      }
    },
  })
  const client = data?.client ?? null
  const memberships = (data?.memberships ?? []).filter((membership) => membership.status === 'active')
  const invitations = (data?.invitations ?? []).filter((invitation) => invitation.status === 'pending')
  const resolvedEditForm = client && editForm.clientId !== client.id
    ? createEditClientForm(client)
    : editForm

  function closeDialog() {
    if (
      editStatus === 'saving'
      || inviteStatus === 'inviting'
      || workspaceStatus === 'creating'
      || revokeStatus === 'revoking'
      || cancelInviteStatus === 'cancelling'
    ) {
      return
    }

    setIsEditDialogOpen(false)
    setIsInviteDialogOpen(false)
    setIsWorkspaceDialogOpen(false)
    setMembershipPendingRevoke(null)
    setInvitationPendingCancel(null)
    setEditError('')
    setInviteError('')
    setWorkspaceError('')
    setRevokeError('')
    setCancelInviteError('')
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

  function openCancelInvitationDialog(invitation) {
    setInvitationPendingCancel(invitation)
    setCancelInviteError('')
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
    const workspace = getPrimaryWorkspace(client)

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

    const workspace = getPrimaryWorkspace(client)
    if (!workspace?.id) {
      setRevokeError('Workspace is required to revoke portal access.')
      return
    }

    setRevokeStatus('revoking')
    setRevokeError('')
    apiClient.request(`/api/workspaces/${workspace.id}/memberships/${membershipPendingRevoke.id}/`, {
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

  function cancelInvitation() {
    if (!client || !invitationPendingCancel) {
      return
    }

    const workspace = getPrimaryWorkspace(client)
    if (!workspace?.id) {
      setCancelInviteError('Workspace is required to cancel this invitation.')
      return
    }

    setCancelInviteStatus('cancelling')
    setCancelInviteError('')
    apiClient.post(`/api/workspaces/${workspace.id}/invitations/${invitationPendingCancel.id}/cancel/`, {})
      .then(() => {
        setCancelInviteStatus('idle')
        setInvitationPendingCancel(null)
        void reload()
      })
      .catch((caughtError) => {
        setCancelInviteError(caughtError.message)
        setCancelInviteStatus('idle')
      })
  }

  return {
    cancelInvitation,
    cancelInviteError,
    cancelInviteStatus,
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
    invitationPendingCancel,
    invitations,
    isCancelInviteDialogOpen: Boolean(invitationPendingCancel),
    isEditDialogOpen,
    isInviteDialogOpen,
    isRevokeDialogOpen: Boolean(membershipPendingRevoke),
    isWorkspaceDialogOpen,
    membershipPendingRevoke,
    memberships,
    openCancelInvitationDialog,
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
    setInvitationPendingCancel,
    setRevokeError,
    setWorkspaceError,
    setWorkspaceForm,
    status,
    workspaceError,
    workspaceForm,
    workspaceStatus,
  }
}
