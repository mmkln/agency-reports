import { useState } from 'react'

import {
  removeClientMembership,
  updateClientMembershipRole,
} from '../../domain/services/clientMembershipService'
import {
  cancelClientTeamInvitation,
  createClientTeamInvitation,
  listClientTeamInvitations,
} from '../../domain/services/clientInviteService'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialInviteForm = Object.freeze({
  email: '',
  name: '',
  role: WORKSPACE_ROLES.VIEWER,
})

function createUuid() {
  return crypto.randomUUID()
}

function buildInviteLink(token) {
  if (typeof window === 'undefined') {
    return `/accept-invite?token=${token}`
  }

  return `${window.location.origin}${import.meta.env.BASE_URL}accept-invite?token=${token}`
}

export function useClientTeamManagement({ canManage, clientId, onInvitationCreated = () => {}, runtime }) {
  const toast = useToast()
  const [form, setForm] = useState(initialInviteForm)
  const [error, setError] = useState('')
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const invitationsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-team-invitations:${clientId ?? ''}:${canManage ? 'manage' : 'read'}`,
    initialData: [],
    load: () => {
      if (!canManage) {
        return Promise.resolve([])
      }

      return runtime.dataClient.read((repositories) => listClientTeamInvitations({
        clientId,
        repositories,
        viewer: runtime.viewer,
      }))
    },
  })
  const invitations = invitationsResource.data ?? []
  const trimmedEmail = form.email.trim()
  const trimmedName = form.name.trim()
  const emailIssue = form.email && !EMAIL_PATTERN.test(trimmedEmail)
    ? 'Enter a valid email address.'
    : ''
  const nameIssue = form.name && trimmedName.length < 2
    ? 'Enter at least 2 characters.'
    : ''

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function refreshInvitations() {
    void invitationsResource.reload()
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

    void runtime.dataClient.write((repositories) => createClientTeamInvitation({
      activityIdGenerator: createUuid,
      clientId,
      email: form.email,
      idGenerator: createUuid,
      name: form.name,
      repositories,
      role: form.role,
      viewer: runtime.viewer,
    })).then((invitation) => {
      setForm(initialInviteForm)
      refreshInvitations()
      onInvitationCreated(invitation)
      toast.success('Invitation created', `${invitation.email} can accept the portal invite.`)
      toast.info('Secure invite link', buildInviteLink(invitation.token), {
        duration: 12000,
      })
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Invitation was not created', caughtError.message)
    })
  }

  function cancelInvitation() {
    if (!invitationPendingCancel) {
      return
    }

    void runtime.dataClient.write((repositories) => cancelClientTeamInvitation({
      activityIdGenerator: createUuid,
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

  function updateMemberRole({ member, role }) {
    return runtime.dataClient.write((repositories) => updateClientMembershipRole({
      membershipId: member.id,
      repositories,
      role,
      viewer: runtime.viewer,
    })).then((updatedMember) => {
      toast.success('Member updated', `${updatedMember.name}'s access role was updated.`)
      return updatedMember
    }).catch((caughtError) => {
      toast.error('Member was not updated', caughtError.message)
      throw caughtError
    })
  }

  function removeMember(member) {
    return runtime.dataClient.write((repositories) => removeClientMembership({
      membershipId: member.id,
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      toast.success('Member removed', `${member.name} no longer has access to this workspace.`)
      return member
    }).catch((caughtError) => {
      toast.error('Member was not removed', caughtError.message)
      throw caughtError
    })
  }

  return {
    cancelInvitation,
    copyInviteLink,
    createInvitation,
    emailIssue,
    error,
    form,
    invitations,
    invitationsStatus: invitationsResource.status,
    invitationPendingCancel,
    nameIssue,
    removeMember,
    setInvitationPendingCancel,
    updateMemberRole,
    updateForm,
  }
}
