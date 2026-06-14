import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
} from '@/shared/ui'

import { InvitationCard } from './InvitationCard'

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
          <div className="grid max-h-overlay-body gap-item overflow-y-auto pr-1">
            {invitations.map((invitation) => (
              <InvitationCard
                invitation={invitation}
                key={invitation.id}
              />
            ))}
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
