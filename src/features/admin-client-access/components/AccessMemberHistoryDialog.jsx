import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
} from '@/shared/ui'

import { AccessMemberCard } from './AccessMemberCard'

export function AccessMemberHistoryDialog({
  isOpen,
  members,
  onOpenChange,
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-modal-xl gap-component p-panel">
        <DialogHeader className="pr-control-xl">
          <DialogTitle>Access history</DialogTitle>
          <DialogDescription>
            Removed and inactive workspace memberships.
          </DialogDescription>
        </DialogHeader>
        {members.length > 0 ? (
          <div className="grid max-h-overlay-body gap-item overflow-y-auto pr-1">
            {members.map((member) => (
              <AccessMemberCard
                key={member.id}
                member={member}
                readOnly
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description="Removed and inactive memberships will appear here."
            iconName="users"
            title="No access history"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
