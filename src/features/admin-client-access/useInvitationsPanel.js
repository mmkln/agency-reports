import { useState } from 'react'

import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { getEmailValidationIssue } from '../../shared/validation/email'

const EMAIL_VALIDATION_ERROR = 'Enter a valid email address.'

const initialInvitationForm = Object.freeze({
  email: '',
  name: '',
  role: WORKSPACE_ROLES.VIEWER,
})

export function useInvitationsPanel({ runtime, workspaceId }) {
  const toast = useToast()
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [form, setForm] = useState(initialInvitationForm)
  const [error, setError] = useState('')
  const invitationsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:workspace-invitations:${workspaceId ?? ''}`,
    initialData: [],
    load: () => {
      if (!workspaceId) {
        return Promise.resolve([])
      }

      return runtime.apiClient
        .get(`/api/workspaces/${workspaceId}/invitations/`)
        .then((payload) => payload.invitations ?? [])
    },
  })
  const invitations = invitationsResource.data ?? []
  const trimmedInvitationEmail = form.email.trim()
  const invitationEmailIssue = form.email
    ? getEmailValidationIssue(trimmedInvitationEmail, EMAIL_VALIDATION_ERROR)
    : ''

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

  function createInvitation(event) {
    event.preventDefault()

    if (!workspaceId || invitationEmailIssue) {
      return
    }

    void runtime.apiClient.post(`/api/workspaces/${workspaceId}/invitations/`, {
      email: form.email.trim(),
      name: form.name.trim(),
      role: form.role,
    }).then((payload) => {
      const invitation = payload.invitation
      setForm(initialInvitationForm)
      refreshInvitations()
      toast.success('Invitation sent', `${invitation.email} will receive a portal invite.`)
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Invitation was not sent', caughtError.message)
    })
  }

  function cancelInvitation() {
    if (!workspaceId || !invitationPendingCancel) {
      return
    }

    void runtime.apiClient
      .post(`/api/workspaces/${workspaceId}/invitations/${invitationPendingCancel.id}/cancel/`, {})
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

    void runtime.apiClient
      .post(`/api/workspaces/${workspaceId}/invitations/${invitation.id}/resend/`, {})
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
    createInvitation,
    error,
    form,
    invitationEmailIssue,
    invitationPendingCancel,
    invitations,
    resendInvitation,
    setInvitationPendingCancel,
    status: invitationsResource.status,
    updateForm,
  }
}
