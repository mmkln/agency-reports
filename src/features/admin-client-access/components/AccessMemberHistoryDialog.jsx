import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
} from '@/shared/ui'
import { WORKSPACE_ROLE_META } from '@/entities/workspace-membership'

import { AccessHistoryRow } from './AccessHistoryRow'

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

function getMembershipStatusMeta(status) {
  return {
    label: formatStatusLabel(status),
    tone: status === 'removed' ? 'neutral' : 'amber',
  }
}

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
          <div className="max-h-overlay-body overflow-y-auto rounded-control border border-control-border bg-surface-elevated">
            <div className="divide-y divide-separator">
              {members.map((member) => (
                <AccessHistoryRow
                  dateLabel={formatHistoryDate(member.removedAt || member.updatedAt)}
                  email={member.email}
                  key={member.id}
                  name={member.name}
                  role={WORKSPACE_ROLE_META[member.role]?.label ?? member.role}
                  statusMeta={getMembershipStatusMeta(member.status)}
                  typeLabel="Membership"
                />
              ))}
            </div>
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
