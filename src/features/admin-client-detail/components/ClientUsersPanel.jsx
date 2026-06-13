import { CLIENT_ROLE_META } from '@/entities/client-membership'
import { Icon } from '@/shared/icons'
import {
  Button,
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

function getMemberInitial(membership) {
  return (membership.name || membership.email || 'C').trim().charAt(0).toUpperCase()
}

function ClientAccessListItem({ membership, onRevokeAccess }) {
  const roleMeta = CLIENT_ROLE_META[membership.role]
  const canRevoke = membership.status === 'active'
  const initial = getMemberInitial(membership)
  const isActive = membership.status === 'active'
  const statusClassName = 'text-text-secondary'
  const statusDotClassName = isActive ? 'bg-success' : 'bg-fill-secondary'

  return (
    <div className="flex flex-col gap-control rounded-control border border-control-border px-component py-control lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-control">
        <span className="flex size-control-large shrink-0 items-center justify-center rounded-full bg-block-subtle text-ui font-medium text-text-primary">
          {initial}
        </span>
        <div className="min-w-0 space-y-tag">
          <div className="flex flex-wrap items-center gap-item">
            <h3 className="m-0 truncate text-ui font-semibold text-text-primary">{membership.name || 'Unnamed user'}</h3>
            <span className="text-ui text-text-muted">{roleMeta?.label ?? membership.role}</span>
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <span className={`inline-flex items-center gap-tag text-ui ${statusClassName}`}>
              <span className={`size-1.5 rounded-full ${statusDotClassName}`} aria-hidden="true" />
              {formatStatusLabel(membership.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
            {membership.email ? (
              <span>{membership.email}</span>
            ) : (
              <span className="text-text-quaternary">Missing email</span>
            )}
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <span>Added {formatDetailDate(membership.createdAt)}</span>
          </div>
        </div>
      </div>
      {canRevoke ? (
        <Button
          className="justify-start px-0 text-label font-normal text-destructive hover:bg-transparent hover:text-destructive lg:justify-center"
          onClick={() => onRevokeAccess(membership)}
          size="sm"
          type="button"
          variant="ghost"
        >
          Revoke access
        </Button>
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
    <section className="grid gap-control rounded-block bg-block p-component">
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
