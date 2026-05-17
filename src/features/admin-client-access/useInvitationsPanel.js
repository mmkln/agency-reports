import { useState } from 'react'

import {
  cancelClientInvitation,
  createClientInvitation,
  listClientInvitations,
} from '../../domain/services/clientInviteService'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'
import { buildInviteLink } from './invitationLinks'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialInvitationForm = Object.freeze({
  email: '',
  expiresAt: '',
  name: '',
  role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
})

function createUuid() {
  return crypto.randomUUID()
}

export function useInvitationsPanel({ clientId, runtime }) {
  const toast = useToast()
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [form, setForm] = useState(initialInvitationForm)
  const [error, setError] = useState('')
  const invitationsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-invitations:${clientId ?? ''}`,
    initialData: [],
    load: () => runtime.dataClient.read((repositories) => listClientInvitations({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const invitations = invitationsResource.data ?? []
  const trimmedInvitationEmail = form.email.trim()
  const invitationEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedInvitationEmail)
    ? 'Enter a valid email address.'
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

  async function copyInviteLink(invitation) {
    const inviteLink = buildInviteLink(invitation.token)

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied', invitation.email)
    } catch {
      toast.error('Invite link was not copied', inviteLink)
    }
  }

  function createInvitation(event) {
    event.preventDefault()

    runtime.dataClient.write((repositories) => createClientInvitation({
      clientId,
      email: form.email,
      expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.999Z` : null,
      idGenerator: createUuid,
      name: form.name,
      repositories,
      role: form.role,
      viewer: runtime.viewer,
    })).then((invitation) => {
      setForm(initialInvitationForm)
      refreshInvitations()
      toast.success('Invitation created', `${invitation.email} can accept the portal invite.`)
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Invitation was not created', caughtError.message)
    })
  }

  function cancelInvitation() {
    if (!invitationPendingCancel) {
      return
    }

    runtime.dataClient.write((repositories) => cancelClientInvitation({
      invitationId: invitationPendingCancel.id,
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      const cancelledEmail = invitationPendingCancel.email
      setInvitationPendingCancel(null)
      refreshInvitations()
      toast.success('Invitation cancelled', cancelledEmail)
    }).catch((caughtError) => {
      toast.error('Invitation was not cancelled', caughtError.message)
    })
  }

  function resendPlaceholder(invitation) {
    toast.info('Email delivery is not connected yet', `Copy the invite link for ${invitation.email}.`)
  }

  return {
    cancelInvitation,
    copyInviteLink,
    createInvitation,
    error,
    form,
    invitationEmailIssue,
    invitationPendingCancel,
    invitations,
    resendPlaceholder,
    setInvitationPendingCancel,
    status: invitationsResource.status,
    updateForm,
  }
}
