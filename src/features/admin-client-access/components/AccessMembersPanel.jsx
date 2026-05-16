import { useState } from 'react'

import {
  Button,
  ConfirmationDialog,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

import {
  addClientMember,
  listClientMembers,
  removeClientMembership,
  updateClientMembershipRole,
} from '../../../domain/services/clientMembershipService'
import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { FieldError, InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createUuid() {
  return crypto.randomUUID()
}

export function AccessMembersPanel({ clientId, runtime }) {
  const toast = useToast()
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null)
  const [members, setMembers] = useState(() => listClientMembers({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
  })
  const [error, setError] = useState('')
  const trimmedMemberName = form.name.trim()
  const trimmedMemberEmail = form.email.trim()
  const memberNameIssue = form.name && trimmedMemberName.length < 2
    ? 'Enter at least 2 characters.'
    : ''
  const memberEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedMemberEmail)
    ? 'Enter a valid email address.'
    : ''

  function refreshMembers() {
    setMembers(listClientMembers({
      clientId,
      repositories: runtime.repositories,
      viewer: runtime.viewer,
    }))
  }

  function updateForm(fieldName, value) {
    setError('')
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function handleAddMember(event) {
    event.preventDefault()

    try {
      const member = addClientMember({
        clientId,
        email: form.email,
        idGenerator: createUuid,
        name: form.name,
        repositories: runtime.repositories,
        role: form.role,
        viewer: runtime.viewer,
      })

      setForm({
        email: '',
        name: '',
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      })
      refreshMembers()
      toast.success('Member added', `${member.name} can now access this client portal.`)
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Member was not added', caughtError.message)
    }
  }

  function handleRoleChange(member, role) {
    try {
      updateClientMembershipRole({
        membershipId: member.id,
        repositories: runtime.repositories,
        role,
        viewer: runtime.viewer,
      })
      refreshMembers()
      toast.success('Role updated', `${member.name}'s access role was updated.`)
    } catch (caughtError) {
      toast.error('Role was not updated', caughtError.message)
    }
  }

  function handleRemoveMember() {
    if (!memberPendingRemoval) {
      return
    }

    try {
      removeClientMembership({
        membershipId: memberPendingRemoval.id,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })
      const removedMemberName = memberPendingRemoval.name
      setMemberPendingRemoval(null)
      refreshMembers()
      toast.success('Member removed', `${removedMemberName} no longer has access to this client.`)
    } catch (caughtError) {
      toast.error('Member was not removed', caughtError.message)
    }
  }

  return (
    <WorkspaceCard
      description="Manage who can open this client portal."
      iconName="users"
      title="Members"
    >
      <div className="grid grid-cols-1 gap-4">
        {members.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {members.map((member) => (
              <article className="rounded-control bg-block-subtle p-3" key={member.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action-muted text-sm font-semibold text-action">
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{member.name}</p>
                    <p className="truncate text-xs text-text-muted">{member.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Select
                        onValueChange={(role) => handleRoleChange(member, role)}
                        value={member.role}
                      >
                        <SelectTrigger className="h-8 w-[130px] bg-block text-xs">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="text-text-quaternary hover:text-destructive"
                        onClick={() => setMemberPendingRemoval(member)}
                        size="icon-sm"
                        title="Remove member"
                        type="button"
                        variant="ghost"
                      >
                        <Icon name="close" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <InlineEmptyState iconName="users" title="No client users yet">
            Add a member or send an invitation before a client can open this portal.
          </InlineEmptyState>
        )}

        <form className="grid grid-cols-1 gap-3 border-t border-separator pt-4" noValidate onSubmit={handleAddMember}>
          <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Add client user</p>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Name</span>
            <Input
              aria-invalid={Boolean(memberNameIssue)}
              minLength={2}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Sarah Johnson"
              required
              value={form.name}
            />
            <FieldError>{memberNameIssue}</FieldError>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(memberEmailIssue)}
              inputMode="email"
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="sarah@client.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{memberEmailIssue}</FieldError>
          </label>
          <div className="flex gap-2">
            <Select onValueChange={(role) => updateForm('role', role)} value={form.role}>
              <SelectTrigger className="min-w-0 flex-1 bg-block">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={Boolean(memberNameIssue || memberEmailIssue)} type="submit">Add member</Button>
          </div>
          {error ? (
            <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </div>
      <ConfirmationDialog
        confirmLabel="Remove access"
        description={
          memberPendingRemoval
            ? `${memberPendingRemoval.name} will lose access to this client portal immediately.`
            : ''
        }
        onConfirm={handleRemoveMember}
        onOpenChange={(open) => {
          if (!open) {
            setMemberPendingRemoval(null)
          }
        }}
        open={Boolean(memberPendingRemoval)}
        title="Remove member access?"
        tone="destructive"
      />
    </WorkspaceCard>
  )
}
