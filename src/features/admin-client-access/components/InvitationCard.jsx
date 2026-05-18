import { Link } from 'react-router-dom'

import {
  Button,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../../entities/client-invitation'
import { Icon } from '../../../shared/icons'
import { buildInviteLink } from '../invitationLinks'

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

export function InvitationCard({
  invitation,
  onCancel,
  onCopy,
  onResend,
}) {
  const inviteLink = buildInviteLink(invitation.token)
  const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING

  return (
    <article className="rounded-control bg-block-subtle p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-ui text-text-primary">{invitation.email}</p>
          <p className="mt-0.5 truncate text-label font-normal text-text-muted">
            {invitation.name || 'Unnamed invite'} | {invitation.role} | expires {formatInvitationDate(invitation.expires_at)}
          </p>
        </div>
        <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
      </div>

      <p className="mt-3 truncate rounded-item bg-block px-2 py-1.5 font-mono text-label font-normal text-text-muted">
        {inviteLink}
      </p>

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
          <>
            <Button onClick={() => onResend(invitation)} size="sm" type="button" variant="ghost">
              Resend
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              onClick={() => onCancel(invitation)}
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
}
