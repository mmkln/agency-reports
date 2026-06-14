import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
} from '@/shared/ui'
import { CLIENT_INVITATION_STATUS_META } from '@/entities/client-invitation'
import { WORKSPACE_ROLE_META } from '@/entities/workspace-membership'

import { AccessHistoryRow } from './AccessHistoryRow'

function formatHistoryDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getInvitationHistoryDate(invitation) {
  return invitation.accepted_at
    || invitation.acceptedAt
    || invitation.updated_at
    || invitation.updatedAt
    || invitation.expires_at
    || invitation.expiresAt
}

export function InvitationHistoryDialog({
  invitations,
  isOpen,
  onOpenChange,
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-modal-xl gap-component p-panel">
        <DialogHeader className="pr-control-xl">
          <DialogTitle>Invitation history</DialogTitle>
          <DialogDescription>
            Accepted, cancelled, and expired workspace invitations.
          </DialogDescription>
        </DialogHeader>
        {invitations.length > 0 ? (
          <div className="max-h-overlay-body overflow-y-auto rounded-control border border-control-border bg-surface-elevated">
            <div className="divide-y divide-separator">
              {invitations.map((invitation) => (
                <AccessHistoryRow
                  dateLabel={formatHistoryDate(getInvitationHistoryDate(invitation))}
                  email={invitation.email}
                  key={invitation.id}
                  name={invitation.name || 'Unnamed invite'}
                  role={WORKSPACE_ROLE_META[invitation.role]?.label ?? invitation.role}
                  statusMeta={CLIENT_INVITATION_STATUS_META[invitation.status]}
                  typeLabel="Invitation"
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            description="Accepted, cancelled, and expired invitations will appear here."
            iconName="mail"
            title="No invitation history"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
