import { useState } from 'react'

import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  cancelWorkspaceInvitation,
  createWorkspaceInvitation,
  listWorkspaceInvitations,
  resendWorkspaceInvitation,
} from '../invitations'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { getEmailValidationIssue } from '../../shared/validation/email'

const EMAIL_REQUIRED_ERROR = 'Email is required.'
const EMAIL_VALIDATION_ERROR = 'Enter a valid email address.'
const NAME_REQUIRED_ERROR = 'Name is required.'

const initialInvitationForm = Object.freeze({
  email: '',
  name: '',
  role: WORKSPACE_ROLES.VIEWER,
})

export function useInvitationsPanel({ runtime, workspaceId }) {
  const toast = useToast()
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [form, setForm] = useState(initialInvitationForm)
  const [error, setError] = useState('')
  const [inviteStatus, setInviteStatus] = useState('idle')
  const invitationsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:workspace-invitations:${workspaceId ?? ''}`,
    initialData: [],
    load: () => {
      if (!workspaceId) {
        return Promise.resolve([])
      }

      return listWorkspaceInvitations(runtime.apiClient, workspaceId)
        .then((payload) => payload.invitations ?? [])
    },
  })
  const invitations = invitationsResource.data ?? []
  const trimmedInvitationName = form.name.trim()
  const trimmedInvitationEmail = form.email.trim()
  const invitationNameIssue = error === NAME_REQUIRED_ERROR ? error : ''
  const invitationEmailIssue = form.email
    ? getEmailValidationIssue(trimmedInvitationEmail, EMAIL_VALIDATION_ERROR)
    : error === EMAIL_REQUIRED_ERROR || error === EMAIL_VALIDATION_ERROR ? error : ''

  function refreshInvitations() {
    void invitationsResource.reload()
  }

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function openInviteDialog() {
    setError('')
    setForm(initialInvitationForm)
    setIsInviteDialogOpen(true)
  }

  function closeInviteDialog() {
    if (inviteStatus === 'inviting') {
      return
    }

    setError('')
    setForm(initialInvitationForm)
    setIsInviteDialogOpen(false)
  }

  function createInvitation(event) {
    event.preventDefault()

    if (!workspaceId) {
      return
    }

    if (!trimmedInvitationName) {
      setError(NAME_REQUIRED_ERROR)
      return
    }

    if (!trimmedInvitationEmail) {
      setError(EMAIL_REQUIRED_ERROR)
      return
    }

    if (invitationEmailIssue) {
      return
    }

    setInviteStatus('inviting')
    void createWorkspaceInvitation(runtime.apiClient, workspaceId, {
      email: trimmedInvitationEmail,
      name: trimmedInvitationName,
      role: form.role,
    }).then((payload) => {
      const invitation = payload.invitation
      setForm(initialInvitationForm)
      setInviteStatus('idle')
      setIsInviteDialogOpen(false)
      refreshInvitations()
      toast.success('Invitation sent', `${invitation.email} will receive a portal invite.`)
    }).catch((caughtError) => {
      setError(caughtError.message)
      setInviteStatus('idle')
      toast.error('Invitation was not sent', caughtError.message)
    })
  }

  function cancelInvitation() {
    if (!workspaceId || !invitationPendingCancel) {
      return
    }

    void cancelWorkspaceInvitation(runtime.apiClient, workspaceId, invitationPendingCancel.id)
      .then(() => {
        const cancelledEmail = invitationPendingCancel.email
        setInvitationPendingCancel(null)
        refreshInvitations()
        toast.success('Invitation cancelled', cancelledEmail)
      })
      .catch((caughtError) => {
        toast.error('Invitation was not cancelled', caughtError.message)
      })
  }

  function resendInvitation(invitation) {
    if (!workspaceId) {
      return
    }

    void resendWorkspaceInvitation(runtime.apiClient, workspaceId, invitation.id)
      .then((payload) => {
        refreshInvitations()
        toast.success('Invitation resent', `${payload.invitation?.email ?? invitation.email} will receive a new link.`)
      })
      .catch((caughtError) => {
        toast.error('Invitation was not resent', caughtError.message)
      })
  }

  return {
    cancelInvitation,
    closeInviteDialog,
    createInvitation,
    error,
    form,
    inviteStatus,
    invitationEmailIssue,
    invitationNameIssue,
    invitationPendingCancel,
    invitations,
    isInviteDialogOpen,
    openInviteDialog,
    resendInvitation,
    setInvitationPendingCancel,
    status: invitationsResource.status,
    updateForm,
  }
}
