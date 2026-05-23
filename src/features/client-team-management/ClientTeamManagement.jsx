import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  ConfirmationDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  ReadOnlyField,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../entities/client-invitation'
import {
  WORKSPACE_ROLES,
  WorkspaceMemberList,
  WorkspaceMembershipRoleSelect,
} from '../../entities/workspace-membership'
import { Icon } from '../../shared/icons'
import { useClientTeamManagement } from './useClientTeamManagement'

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="text-label text-destructive" role="alert">
      {children}
    </p>
  )
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

function InviteForm({
  canSubmit,
  emailIssue,
  error,
  form,
  nameIssue,
  onCancel,
  onSubmit,
  onUpdateForm,
}) {
  return (
    <form className="grid gap-component" noValidate onSubmit={onSubmit}>
      <div className="grid gap-control sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Name</span>
          <Input
            onChange={(event) => onUpdateForm('name', event.target.value)}
            placeholder="Sarah Johnson"
            value={form.name}
          />
          <FieldError>{nameIssue}</FieldError>
        </label>
        <label className="grid gap-1.5">
          <span className="text-label text-text-secondary">Email</span>
          <Input
            aria-invalid={Boolean(emailIssue)}
            inputMode="email"
            onChange={(event) => onUpdateForm('email', event.target.value)}
            placeholder="sarah@client.com"
            required
            type="email"
            value={form.email}
          />
          <FieldError>{emailIssue}</FieldError>
        </label>
      </div>
      <div className="grid gap-control sm:grid-cols-[1fr_auto]">
        <WorkspaceMembershipRoleSelect
          allowedRoles={[WORKSPACE_ROLES.VIEWER]}
          className="bg-block"
          onValueChange={(role) => onUpdateForm('role', role)}
          value={form.role}
        />
      </div>
      <FieldError>{error}</FieldError>
      <div className="flex justify-end gap-control">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={!canSubmit} type="submit">
          Send invite
        </Button>
      </div>
    </form>
  )
}

function EditMemberDialog({
  error,
  member,
  onOpenChange,
  onRoleChange,
  onSubmit,
  role,
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={Boolean(member)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sheet-md gap-component p-panel">
        <DialogHeader className="pr-control-xl">
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>
            Update this user's workspace access.
          </DialogDescription>
        </DialogHeader>
        {member ? (
          <form className="grid gap-component" onSubmit={onSubmit}>
            <div className="grid gap-control sm:grid-cols-2">
              <ReadOnlyField label="Name" value={member.name} />
              <ReadOnlyField label="Email" value={member.email} />
            </div>
            <label className="grid gap-1.5">
              <span className="text-label text-text-secondary">Role</span>
              <WorkspaceMembershipRoleSelect
                className="bg-block"
                onValueChange={onRoleChange}
                value={role}
              />
            </label>
            <FieldError>{error}</FieldError>
            <div className="flex justify-end gap-control">
              <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Save changes
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function InvitationCard({ invitation, onCancel, onCopy }) {
  const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING

  return (
    <article className="rounded-control bg-block-subtle p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-ui text-text-primary">{invitation.email}</p>
          <p className="mt-0.5 truncate text-label font-normal text-text-muted">
            {invitation.name || 'Unnamed invite'} | team member | expires {formatInvitationDate(invitation.expires_at)}
          </p>
        </div>
        <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => onCopy(invitation)} size="sm" type="button" variant="outline">
          Copy link
        </Button>
        <Button asChild size="sm" type="button" variant="outline">
          <Link to={`/accept-invite?token=${invitation.token}`}>
            Preview invite page
            <Icon name="arrowUpRight" size={13} />
          </Link>
        </Button>
        {isPending ? (
          <Button
            className="text-destructive hover:text-destructive"
            onClick={() => onCancel(invitation)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Revoke invite
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function PendingInvitations({ invitations, onCancel, onCopy, status }) {
  if (status === 'loading') {
    return (
      <div className="rounded-control bg-block-subtle px-3 py-2 text-ui text-text-muted">
        Loading invitations...
      </div>
    )
  }

  if (status === 'error') {
    return <FieldError>Invitations could not be loaded.</FieldError>
  }

  if (!invitations.length) {
    return null
  }

  return (
    <div className="grid gap-2" data-testid="client-team-pending-invitations">
      <p className="text-label text-text-secondary uppercase">Pending invitations</p>
      {invitations.map((invitation) => (
        <InvitationCard
          invitation={invitation}
          key={invitation.id}
          onCancel={onCancel}
          onCopy={onCopy}
        />
      ))}
    </div>
  )
}

export function ClientTeamManagement({ clientId, page, runtime }) {
  const canManage = Boolean(page.sections.team?.canManage)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [memberOverrides, setMemberOverrides] = useState({})
  const [memberPendingEdit, setMemberPendingEdit] = useState(null)
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null)
  const [removedMemberIds, setRemovedMemberIds] = useState(() => new Set())
  const [editRole, setEditRole] = useState(WORKSPACE_ROLES.VIEWER)
  const [editError, setEditError] = useState('')
  const teamManagement = useClientTeamManagement({
    canManage,
    clientId,
    onInvitationCreated: () => setIsInviteDialogOpen(false),
    runtime,
  })
  const canSubmitInvite = Boolean(
    teamManagement.form.email.trim()
    && !teamManagement.emailIssue
    && !teamManagement.nameIssue,
  )
  const members = page.members
    .filter((member) => !removedMemberIds.has(member.id))
    .map((member) => ({
      ...member,
      ...(memberOverrides[member.id] ?? {}),
    }))

  function startEditingMember(member) {
    setEditError('')
    setEditRole(member.role)
    setMemberPendingEdit(member)
  }

  function saveMemberEdit(event) {
    event.preventDefault()

    if (!memberPendingEdit) {
      return
    }

    void teamManagement.updateMemberRole({
      member: memberPendingEdit,
      role: editRole,
    }).then((updatedMember) => {
      setMemberOverrides((currentOverrides) => ({
        ...currentOverrides,
        [updatedMember.id]: {
          ...(currentOverrides[updatedMember.id] ?? {}),
          ...updatedMember,
        },
      }))
      setMemberPendingEdit(null)
    }).catch((error) => {
      setEditError(error.message)
    })
  }

  function removeMember() {
    if (!memberPendingRemoval) {
      return
    }

    void teamManagement.removeMember(memberPendingRemoval)
      .then((removedMember) => {
        setRemovedMemberIds((currentIds) => new Set([...currentIds, removedMember.id]))
        setMemberPendingRemoval(null)
      })
      .catch(() => {
        setMemberPendingRemoval(null)
      })
  }

  return (
    <Panel>
      <PanelHeader
        action={canManage ? (
          <Button
            icon={<Icon name="plus" size={14} />}
            onClick={() => setIsInviteDialogOpen(true)}
            size="sm"
            type="button"
          >
            Invite teammate
          </Button>
        ) : null}
        divided
        subtitle={canManage
          ? 'People and pending invites for this workspace.'
          : 'People with access to this workspace.'}
        title="Team Members"
      />
      <PanelBody className="p-0">
        <WorkspaceMemberList
          canEdit={canManage}
          canRemove={canManage}
          emptyDescription="No members are currently attached to this workspace."
          emptyTitle="No team members"
          members={members}
          onEditMember={startEditingMember}
          onRemoveMember={setMemberPendingRemoval}
        />
        {canManage ? (
          <div className="grid gap-card px-card pb-card pt-0">
            <PendingInvitations
              invitations={teamManagement.invitations}
              onCancel={teamManagement.setInvitationPendingCancel}
              onCopy={teamManagement.copyInviteLink}
              status={teamManagement.invitationsStatus}
            />
          </div>
        ) : null}
      </PanelBody>
      {canManage ? (
        <Dialog onOpenChange={setIsInviteDialogOpen} open={isInviteDialogOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-sheet-md gap-component p-panel">
            <DialogHeader className="pr-control-xl">
              <DialogTitle>Invite teammate</DialogTitle>
              <DialogDescription>
                Send a secure invite for this workspace.
              </DialogDescription>
            </DialogHeader>
            <InviteForm
              canSubmit={canSubmitInvite}
              emailIssue={teamManagement.emailIssue}
              error={teamManagement.error}
              form={teamManagement.form}
              nameIssue={teamManagement.nameIssue}
              onCancel={() => setIsInviteDialogOpen(false)}
              onSubmit={teamManagement.createInvitation}
              onUpdateForm={teamManagement.updateForm}
            />
          </DialogContent>
        </Dialog>
      ) : null}
      {canManage ? (
        <EditMemberDialog
          error={editError}
          member={memberPendingEdit}
          onOpenChange={(open) => {
            if (!open) {
              setMemberPendingEdit(null)
            }
          }}
          onRoleChange={setEditRole}
          onSubmit={saveMemberEdit}
          role={editRole}
        />
      ) : null}
      <ConfirmationDialog
        confirmLabel="Revoke invite"
        description={
          teamManagement.invitationPendingCancel
            ? `${teamManagement.invitationPendingCancel.email} will no longer be able to accept this invite link.`
            : ''
        }
        onConfirm={teamManagement.cancelInvitation}
        onOpenChange={(open) => {
          if (!open) {
            teamManagement.setInvitationPendingCancel(null)
          }
        }}
        open={Boolean(teamManagement.invitationPendingCancel)}
        title="Revoke invitation?"
        tone="destructive"
      />
      <ConfirmationDialog
        confirmLabel="Remove access"
        description={
          memberPendingRemoval
            ? `${memberPendingRemoval.name} will lose access to this workspace immediately.`
            : ''
        }
        onConfirm={removeMember}
        onOpenChange={(open) => {
          if (!open) {
            setMemberPendingRemoval(null)
          }
        }}
        open={Boolean(memberPendingRemoval)}
        title="Remove member access?"
        tone="destructive"
      />
    </Panel>
  )
}
