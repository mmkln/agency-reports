import { CLIENT_ROLE_META } from '@/entities/client-membership'
import { Icon } from '@/shared/icons'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ErrorBlock,
  StatusBadge,
} from '@/shared/ui'

import { formatDetailDate } from '../model/clientDetailPresentation'

function getMembershipStatusMeta(membership) {
  return {
    icon: membership.status === 'active' ? 'checkCircle2' : 'circleX',
    label: membership.status || 'Unknown',
    tone: membership.status === 'active' ? 'green' : 'neutral',
  }
}

function ClientAccessListItem({ membership, onRevokeAccess }) {
  const roleMeta = CLIENT_ROLE_META[membership.role]
  const canRevoke = membership.status === 'active'

  return (
    <div className="flex flex-col gap-control rounded-control px-control py-control lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-tag">
        <div className="flex flex-wrap items-center gap-tag">
          <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{membership.name || 'Unnamed user'}</h3>
          <Badge tone={roleMeta?.tone ?? 'neutral'}>
            {roleMeta?.label ?? membership.role}
          </Badge>
          <StatusBadge meta={getMembershipStatusMeta(membership)} />
        </div>
        <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
          {membership.email ? (
            <span>{membership.email}</span>
          ) : (
            <span className="text-text-quaternary">Missing email</span>
          )}
          <span className="text-text-quaternary" aria-hidden="true">/</span>
          <span>Added {formatDetailDate(membership.createdAt)}</span>
        </div>
      </div>
      {canRevoke ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Client access actions" size="icon-sm" type="button" variant="ghost">
              <Icon name="ellipsis" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onRevokeAccess(membership)} variant="destructive">
              <Icon name="circleX" size={16} />
              Revoke access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

export function ClientUsersPanel({
  memberships,
  onInviteUser,
  onRevokeAccess,
  revokeError,
}) {
  const hasMemberships = memberships.length > 0

  return (
    <section className="grid gap-component rounded-block bg-block p-card">
      <div className="flex items-center justify-between gap-control">
        <h2 className="m-0 text-ui font-semibold text-text-primary">Client access</h2>
        {hasMemberships ? (
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
        {hasMemberships ? (
          memberships.map((membership) => (
            <ClientAccessListItem
              key={membership.id}
              membership={membership}
              onRevokeAccess={onRevokeAccess}
            />
          ))
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
