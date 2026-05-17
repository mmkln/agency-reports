import { useState } from 'react'

import {
  addClientMember,
  listClientMembers,
  removeClientMembership,
  updateClientMembershipRole,
} from '../../domain/services/clientMembershipService'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialMemberForm = Object.freeze({
  email: '',
  name: '',
  role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
})

function createUuid() {
  return crypto.randomUUID()
}

export function useAccessMembersPanel({ clientId, runtime }) {
  const toast = useToast()
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null)
  const [form, setForm] = useState(initialMemberForm)
  const [error, setError] = useState('')
  const membersResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-members:${clientId ?? ''}`,
    initialData: [],
    load: () => runtime.dataClient.read((repositories) => listClientMembers({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const members = membersResource.data ?? []
  const trimmedMemberName = form.name.trim()
  const trimmedMemberEmail = form.email.trim()
  const memberNameIssue = form.name && trimmedMemberName.length < 2
    ? 'Enter at least 2 characters.'
    : ''
  const memberEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedMemberEmail)
    ? 'Enter a valid email address.'
    : ''

  function refreshMembers() {
    void membersResource.reload()
  }

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function addMember(event) {
    event.preventDefault()

    runtime.dataClient.write((repositories) => addClientMember({
      clientId,
      email: form.email,
      idGenerator: createUuid,
      name: form.name,
      repositories,
      role: form.role,
      viewer: runtime.viewer,
    })).then((member) => {
      setForm(initialMemberForm)
      refreshMembers()
      toast.success('Member added', `${member.name} can now access this client portal.`)
    }).catch((caughtError) => {
      setError(caughtError.message)
      toast.error('Member was not added', caughtError.message)
    })
  }

  function changeRole(member, role) {
    runtime.dataClient.write((repositories) => updateClientMembershipRole({
      membershipId: member.id,
      repositories,
      role,
      viewer: runtime.viewer,
    })).then(() => {
      refreshMembers()
      toast.success('Role updated', `${member.name}'s access role was updated.`)
    }).catch((caughtError) => {
      toast.error('Role was not updated', caughtError.message)
    })
  }

  function removeMember() {
    if (!memberPendingRemoval) {
      return
    }

    runtime.dataClient.write((repositories) => removeClientMembership({
      membershipId: memberPendingRemoval.id,
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      const removedMemberName = memberPendingRemoval.name
      setMemberPendingRemoval(null)
      refreshMembers()
      toast.success('Member removed', `${removedMemberName} no longer has access to this client.`)
    }).catch((caughtError) => {
      toast.error('Member was not removed', caughtError.message)
    })
  }

  return {
    addMember,
    changeRole,
    error,
    form,
    memberEmailIssue,
    memberNameIssue,
    memberPendingRemoval,
    members,
    removeMember,
    setMemberPendingRemoval,
    status: membersResource.status,
    updateForm,
  }
}
