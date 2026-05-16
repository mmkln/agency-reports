import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from '@/shared/ui'

import {
  cancelClientInvitation,
  createClientInvitation,
  listClientInvitations,
} from '../../../domain/services/clientInviteService'
import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { FieldError, InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { useToast } from '../../../shared/notifications'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createUuid() {
  return crypto.randomUUID()
}

function buildInviteLink(token) {
  if (typeof window === 'undefined') {
    return `/accept-invite?token=${token}`
  }

  return `${window.location.origin}${import.meta.env.BASE_URL}accept-invite?token=${token}`
}

function formatInvitationDate(date) {
  if (!date) {
    return 'No expiration'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function InvitationsPanel({ clientId, runtime }) {
  const toast = useToast()
  const [invitationPendingCancel, setInvitationPendingCancel] = useState(null)
  const [invitations, setInvitations] = useState(() => listClientInvitations({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))
  const [form, setForm] = useState({
    email: '',
    expiresAt: '',
    name: '',
    role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
  })
  const [error, setError] = useState('')
  const trimmedInvitationEmail = form.email.trim()
  const invitationEmailIssue = form.email && !EMAIL_PATTERN.test(trimmedInvitationEmail)
    ? 'Enter a valid email address.'
    : ''

  function refreshInvitations() {
    setInvitations(listClientInvitations({
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

  async function copyInviteLink(invitation) {
    const inviteLink = buildInviteLink(invitation.token)

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied', invitation.email)
    } catch {
      toast.error('Invite link was not copied', inviteLink)
    }
  }

  function handleCreateInvitation(event) {
    event.preventDefault()

    try {
      const invitation = createClientInvitation({
        clientId,
        email: form.email,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.999Z` : null,
        idGenerator: createUuid,
        name: form.name,
        repositories: runtime.repositories,
        role: form.role,
        viewer: runtime.viewer,
      })

      setForm({
        email: '',
        expiresAt: '',
        name: '',
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      })
      refreshInvitations()
      toast.success('Invitation created', `${invitation.email} can accept the portal invite.`)
    } catch (caughtError) {
      setError(caughtError.message)
      toast.error('Invitation was not created', caughtError.message)
    }
  }

  function handleCancelInvitation() {
    if (!invitationPendingCancel) {
      return
    }

    try {
      cancelClientInvitation({
        invitationId: invitationPendingCancel.id,
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      })
      const cancelledEmail = invitationPendingCancel.email
      setInvitationPendingCancel(null)
      refreshInvitations()
      toast.success('Invitation cancelled', cancelledEmail)
    } catch (caughtError) {
      toast.error('Invitation was not cancelled', caughtError.message)
    }
  }

  function handleResendPlaceholder(invitation) {
    toast.info('Email delivery is not connected yet', `Copy the invite link for ${invitation.email}.`)
  }

  return (
    <WorkspaceCard
      description="Create and track local client portal invitations."
      iconName="mail"
      title="Invitations"
    >
      <div className="grid grid-cols-1 gap-4">
        {invitations.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {invitations.map((invitation) => {
              const inviteLink = buildInviteLink(invitation.token)
              const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING

              return (
                <article className="rounded-control bg-block-subtle p-3" key={invitation.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{invitation.email}</p>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {invitation.name || 'Unnamed invite'} | {invitation.role} | expires {formatInvitationDate(invitation.expires_at)}
                      </p>
                    </div>
                    <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
                  </div>

                  <p className="mt-3 truncate rounded-item bg-block px-2 py-1.5 font-mono text-[11px] text-text-muted">
                    {inviteLink}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => copyInviteLink(invitation)} size="sm" type="button" variant="outline">
                      Copy link
                    </Button>
                    <Button asChild size="sm" type="button" variant="outline">
                      <Link to={`/accept-invite?token=${invitation.token}`}>
                        Preview invite page
                        <Icon name="arrowUpRight" size={13} />
                      </Link>
                    </Button>
                    {isPending ? (
                      <>
                        <Button onClick={() => handleResendPlaceholder(invitation)} size="sm" type="button" variant="ghost">
                          Resend
                        </Button>
                        <Button
                          className="text-destructive hover:text-destructive"
                          onClick={() => setInvitationPendingCancel(invitation)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Revoke invite
                        </Button>
                      </>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <InlineEmptyState iconName="mail" title="No invitations yet">
            Create an invitation to generate a local acceptance link. Email delivery remains simulated.
          </InlineEmptyState>
        )}

        <form className="grid grid-cols-1 gap-3 border-t border-separator pt-4" noValidate onSubmit={handleCreateInvitation}>
          <p className="text-xs font-bold tracking-wide text-text-secondary uppercase">Create invitation</p>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Name</span>
            <Input
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Sarah Johnson"
              value={form.name}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Email</span>
            <Input
              aria-invalid={Boolean(invitationEmailIssue)}
              inputMode="email"
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="sarah@client.com"
              required
              type="email"
              value={form.email}
            />
            <FieldError>{invitationEmailIssue}</FieldError>
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
            <Select onValueChange={(role) => updateForm('role', role)} value={form.role}>
              <SelectTrigger className="bg-block">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CLIENT_MEMBERSHIP_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              onChange={(event) => updateForm('expiresAt', event.target.value)}
              type="date"
              value={form.expiresAt}
            />
          </div>
          <Button disabled={Boolean(invitationEmailIssue)} type="submit">Create invitation</Button>
          {error ? (
            <p className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </div>
      <ConfirmationDialog
        confirmLabel="Revoke invitation"
        description={
          invitationPendingCancel
            ? `${invitationPendingCancel.email} will no longer be able to accept this invite link.`
            : ''
        }
        onConfirm={handleCancelInvitation}
        onOpenChange={(open) => {
          if (!open) {
            setInvitationPendingCancel(null)
          }
        }}
        open={Boolean(invitationPendingCancel)}
        title="Revoke invitation?"
        tone="destructive"
      />
    </WorkspaceCard>
  )
}
