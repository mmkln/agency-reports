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

function getInviteInitial(invitation) {
  return (invitation.name || invitation.email || 'I').trim().charAt(0).toUpperCase()
}

export function InvitationCard({
  invitation,
  onCancel,
  onResend,
}) {
  const isPending = invitation.status === CLIENT_INVITATION_STATUSES.PENDING
  const canManageInvitation = isPending && onCancel && onResend
  const deliveryMeta = DELIVERY_STATUS_META[invitation.make_delivery_status] ?? DELIVERY_STATUS_META.pending
  const roleLabel = WORKSPACE_ROLE_META[invitation.role]?.label ?? invitation.role

  return (
    <article className="flex flex-col gap-control rounded-control border border-control-border bg-surface-elevated px-component py-control lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-control">
        <span className="flex size-control-large shrink-0 items-center justify-center rounded-full bg-block-subtle text-ui font-medium text-text-primary">
          {getInviteInitial(invitation)}
        </span>
        <div className="min-w-0 space-y-tag">
          <div className="flex flex-wrap items-center gap-item">
            <h3 className="m-0 truncate text-ui font-semibold text-text-primary">
              {invitation.name || 'Unnamed invite'}
            </h3>
            <span className="text-ui text-text-muted">{roleLabel}</span>
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
          </div>
          <div className="flex flex-wrap items-center gap-item text-ui text-text-muted">
            <span>{invitation.email}</span>
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <span>Expires {formatInvitationDate(invitation.expires_at)}</span>
            <span className="text-text-quaternary" aria-hidden="true">{'\u2022'}</span>
            <StatusBadge meta={deliveryMeta} />
            <span>{formatSentCount(invitation.sent_count)}</span>
            {invitation.make_delivery_error ? (
              <span className="min-w-0 truncate text-destructive">{invitation.make_delivery_error}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {canManageInvitation ? (
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
