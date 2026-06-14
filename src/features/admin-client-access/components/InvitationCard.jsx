import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  StatusBadge,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

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
  const canManageInvitation = isPending && onCancel && onResend
  const deliveryMeta = DELIVERY_STATUS_META[invitation.make_delivery_status] ?? DELIVERY_STATUS_META.pending
  const roleLabel = WORKSPACE_ROLE_META[invitation.role]?.label ?? invitation.role

  return (
    <article className="grid gap-control px-component py-control md:grid-cols-[minmax(240px,1.4fr)_150px_120px_150px_120px_44px] md:items-center">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-ui font-semibold text-text-primary">
          {invitation.name || 'Unnamed invite'}
        </h3>
        <p className="m-0 truncate text-ui text-text-muted">{invitation.email}</p>
        {invitation.make_delivery_error ? (
          <p className="m-0 truncate text-label text-destructive">{invitation.make_delivery_error}</p>
        ) : null}
      </div>

      <span className="truncate text-ui text-text-muted">{roleLabel}</span>
      <StatusBadge meta={CLIENT_INVITATION_STATUS_META[invitation.status]} />
      <div className="flex min-w-0 flex-wrap items-center gap-tag">
        <StatusBadge meta={deliveryMeta} />
        <span className="truncate text-ui text-text-muted">{formatSentCount(invitation.sent_count)}</span>
      </div>
      <span className="text-ui text-text-muted">{formatInvitationDate(invitation.expires_at)}</span>
      {canManageInvitation ? (
        <div className="flex justify-start md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Invitation actions"
                icon={<Icon name="ellipsis" size={16} />}
                size="icon-sm"
                type="button"
                variant="ghost"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onResend(invitation)}>
                Resend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onCancel(invitation)}
              >
                Revoke invite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
    </article>
  )
}
