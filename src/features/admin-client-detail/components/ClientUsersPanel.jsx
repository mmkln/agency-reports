import { WORKSPACE_ROLE_META } from '@/entities/workspace-membership'
import { Icon } from '@/shared/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ErrorBlock,
} from '@/shared/ui'

import { formatDetailDate } from '../model/clientDetailPresentation'

function formatStatusLabel(value) {
  if (!value) {
    return 'Unknown'
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function getPrincipalName(principal) {
  return principal.name || principal.email || (principal.kind === 'invitation' ? 'Pending invite' : 'Unnamed user')
}

function getGrantStatusTone(grant) {
  if (grant.kind === 'workspace_invitation') {
    return 'bg-warning'
  }

  return grant.status === 'active' ? 'bg-success' : 'bg-fill-secondary'
}

function getGrantActionLabel(grant) {
  return grant.kind === 'workspace_invitation' ? 'Cancel invite' : 'Revoke access'
}

function getGrantStatusLabel(grant) {
  return grant.kind === 'workspace_invitation' ? 'Pending' : formatStatusLabel(grant.status)
}

function buildAccessRows(principals = []) {
  return principals.flatMap((principal) => (
    (principal.access ?? []).map((grant) => ({
      grant,
      id: `${grant.kind}:${grant.id}`,
      principal,
    }))
  ))
}

function AccessActionsMenu({
  grant,
  onCancelInvitation,
  onRevokeAccess,
  payload,
}) {
  const isInvitation = grant.kind === 'workspace_invitation'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Access actions"
          icon={<Icon name="ellipsis" size={16} />}
          size="icon-sm"
          type="button"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (isInvitation) {
              onCancelInvitation(payload)
              return
            }

            onRevokeAccess(payload)
          }}
        >
          {getGrantActionLabel(grant)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AccessRow({
  onCancelInvitation,
  onRevokeAccess,
  row,
}) {
  const { grant, principal } = row
  const roleMeta = WORKSPACE_ROLE_META[grant.role]
  const actionPayload = {
    ...grant,
    email: principal.email,
    name: principal.name,
    userId: principal.userId,
  }

  return (
    <div className="grid gap-control px-component py-control md:grid-cols-[minmax(220px,1.4fr)_minmax(220px,1.2fr)_140px_120px_120px_44px] md:items-center">
      <div className="min-w-0">
        <p className="m-0 truncate text-ui font-semibold text-text-primary">{getPrincipalName(principal)}</p>
        {principal.email ? (
          <p className="m-0 truncate text-ui text-text-muted">{principal.email}</p>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="m-0 truncate text-ui font-semibold text-text-primary">{grant.workspaceName || 'Workspace'}</p>
        <p className="m-0 text-label text-text-muted md:hidden">{roleMeta?.label ?? grant.role}</p>
      </div>
      <span className="hidden truncate text-ui text-text-muted md:block">{roleMeta?.label ?? grant.role}</span>
      <span className="inline-flex items-center gap-tag text-ui text-text-secondary">
        <span className={`size-1.5 rounded-full ${getGrantStatusTone(grant)}`} aria-hidden="true" />
        {getGrantStatusLabel(grant)}
      </span>
      <span className="text-ui text-text-muted">
        {formatDetailDate(grant.createdAt)}
      </span>
      <div className="flex justify-start md:justify-end">
        <AccessActionsMenu
          grant={grant}
          onCancelInvitation={onCancelInvitation}
          onRevokeAccess={onRevokeAccess}
          payload={actionPayload}
        />
      </div>
    </div>
  )
}

export function ClientUsersPanel({
  accessPrincipals = [],
  cancelInviteError,
  onCancelInvitation,
  onInviteUser,
  onRevokeAccess,
  revokeError,
}) {
  const accessRows = buildAccessRows(accessPrincipals)
  const hasAccessRecords = accessRows.length > 0

  return (
    <section className="grid gap-control rounded-block bg-block p-component">
      <div className="flex items-center justify-between gap-control">
        <h2 className="m-0 text-ui font-semibold text-text-primary">Client access</h2>
        {hasAccessRecords ? (
          <Button icon={<Icon name="mail" size={16} />} onClick={onInviteUser} size="sm" type="button" variant="outline">
            Invite user
          </Button>
        ) : null}
      </div>
      <div className="grid gap-item">
        {revokeError ? (
          <ErrorBlock title="Client access could not be updated">
            {revokeError}
          </ErrorBlock>
        ) : null}
        {cancelInviteError ? (
          <ErrorBlock title="Invitation could not be cancelled">
            {cancelInviteError}
          </ErrorBlock>
        ) : null}
        {hasAccessRecords ? (
          <div className="overflow-hidden rounded-control border border-control-border">
            <div className="hidden border-b border-separator px-component py-item text-label text-text-muted md:grid md:grid-cols-[minmax(220px,1.4fr)_minmax(220px,1.2fr)_140px_120px_120px_44px]">
              <span>Person</span>
              <span>Workspace</span>
              <span>Role</span>
              <span>Status</span>
              <span>Added</span>
              <span aria-hidden="true" />
            </div>
            <div className="divide-y divide-separator">
              {accessRows.map((row) => (
                <AccessRow
                  key={row.id}
                  onCancelInvitation={onCancelInvitation}
                  onRevokeAccess={onRevokeAccess}
                  row={row}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-control rounded-control bg-block-subtle px-card py-component sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-tag">
              <h3 className="m-0 text-ui font-semibold text-text-primary">No client users yet</h3>
              <p className="m-0 text-ui text-text-muted">
                Invite a client user when you are ready to give access.
              </p>
            </div>
            <Button icon={<Icon name="mail" size={16} />} onClick={onInviteUser} size="sm" type="button">
              Invite user
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
