import {
  Button,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_INVITATION_STATUSES, CLIENT_INVITATION_STATUS_META } from '../../../entities/client-invitation'
import { WORKSPACE_ROLE_META } from '../../../entities/workspace-membership'

const DELIVERY_STATUS_META = {
  failed: { label: 'Email failed', tone: 'rose' },
  pending: { label: 'Email pending', tone: 'amber' },
  sent: { label: 'Email sent', tone: 'green' },
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

function formatSentCount(count) {
  const normalizedCount = Number(count || 0)

  if (normalizedCount === 0) {
    return 'Not sent yet'
  }

  return normalizedCount === 1 ? 'Sent once' : `Sent ${normalizedCount} times`
}

export function InvitationCard({
  invitation,
  onCancel,
  onResend,
}) {
  const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING
  const deliveryMeta = DELIVERY_STATUS_META[invitation.make_delivery_status] ?? DELIVERY_STATUS_META.pending
  const roleLabel = WORKSPACE_ROLE_META[invitation.role]?.label ?? invitation.role

  return (
    <article className="rounded-control bg-block-subtle p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-ui text-text-primary">{invitation.email}</p>
          <p className="mt-0.5 truncate text-label font-normal text-text-muted">
            {invitation.name || 'Unnamed invite'} | {roleLabel} | expires {formatInvitationDate(invitation.expires_at)}
          </p>
        </div>
        <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-label font-normal text-text-muted">
        <StatusBadge meta={deliveryMeta} />
        <span>{formatSentCount(invitation.sent_count)}</span>
        {invitation.make_delivery_error ? (
          <span className="min-w-0 truncate text-destructive">{invitation.make_delivery_error}</span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isPending ? (
          <>
            <Button onClick={() => onResend(invitation)} size="sm" type="button" variant="outline">
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
