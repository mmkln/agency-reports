import { useState } from 'react'

import { updateClient } from '@/features/clients'
import {
  cancelWorkspaceInvitation,
  createWorkspaceInvitation,
} from '@/features/invitations'
import { removeWorkspaceMembership } from '@/features/workspace-access'
import { createWorkspace as createWorkspaceRecord } from '@/features/workspaces'
import {
  createClientEditPayload,
  createEditClientForm,
  createInviteClientUserForm,
  createWorkspaceForm,
  createWorkspaceInvitationPayload,
  createWorkspacePayload,
} from './adminClientDetailForms'
import { getPrimaryAgencyId } from './adminClientDetailSelectors'
import { useAdminClientDetailResource } from './useAdminClientDetailResource'

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
  const {
    client,
    error,
    invitations,
    memberships,
    reload,
    status,
    workspace,
  } = useAdminClientDetailResource({ apiClient, clientId })
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
    updateClient(apiClient, client.id, createClientEditPayload({
      name,
      status: resolvedEditForm.status,
    })).then(() => {
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
    const name = inviteForm.name.trim()

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
    createWorkspaceRecord(apiClient, createWorkspacePayload({
      agencyId,
      clientId: client.id,
      form: workspaceForm,
      name,
    })).then(() => {
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

    if (!workspace?.id) {
      setRevokeError('Workspace is required to revoke portal access.')
      return
    }

    setRevokeStatus('revoking')
    setRevokeError('')
    removeWorkspaceMembership(apiClient, workspace.id, membershipPendingRevoke.id).then(() => {
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

    if (!workspace?.id) {
      setCancelInviteError('Workspace is required to cancel this invitation.')
      return
    }

    setCancelInviteStatus('cancelling')
    setCancelInviteError('')
    cancelWorkspaceInvitation(apiClient, workspace.id, invitationPendingCancel.id)
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
