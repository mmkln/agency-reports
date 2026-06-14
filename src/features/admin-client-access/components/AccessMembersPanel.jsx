import { useState } from 'react'

import {
  Button,
  ConfirmationDialog,
  EmptyState,
} from '@/shared/ui'

import { FieldError } from '../../admin-client-workspace'
import { useAccessMembersPanel } from '../useAccessMembersPanel'
import { AccessMemberCard } from './AccessMemberCard'
import { AccessMemberHistoryDialog } from './AccessMemberHistoryDialog'

export function AccessMembersPanel({ workspaceId, runtime }) {
  const membersPanel = useAccessMembersPanel({ workspaceId, runtime })
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  return (
    <section className="grid gap-control rounded-block bg-block p-component">
      <div className="flex items-center justify-between gap-control">
        <div className="min-w-0">
          <h2 className="m-0 truncate text-ui font-semibold text-text-primary">Members</h2>
          <p className="mt-tag text-ui text-text-muted">People with access to this workspace.</p>
        </div>
        <div>
          <Button
            disabled={membersPanel.memberHistory.length === 0}
            onClick={() => setIsHistoryDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            History
          </Button>
        </div>
      </div>
      <div className="grid gap-item">
        {membersPanel.status === 'loading' ? (
          <div className="rounded-control bg-block-subtle px-card py-component text-ui text-text-muted">Loading members...</div>
        ) : membersPanel.status === 'error' ? (
          <FieldError>{membersPanel.error || 'Members could not be loaded.'}</FieldError>
        ) : membersPanel.activeMembers.length === 0 ? (
          <EmptyState
            description="No active members are currently attached to this workspace."
            iconName="users"
            title="No active members"
          />
        ) : (
          <div className="overflow-hidden rounded-control border border-control-border">
            <div className="hidden border-b border-separator px-component py-item text-label text-text-muted md:grid md:grid-cols-[minmax(240px,1.4fr)_160px_120px_44px]">
              <span>Person</span>
              <span>Role</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>
            <div className="divide-y divide-separator">
              {membersPanel.activeMembers.map((member) => (
                <AccessMemberCard
                  key={member.id}
                  member={member}
                  onRemove={membersPanel.setMemberPendingRemoval}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <AccessMemberHistoryDialog
        isOpen={isHistoryDialogOpen}
        members={membersPanel.memberHistory}
        onOpenChange={setIsHistoryDialogOpen}
      />
      <ConfirmationDialog
        confirmLabel="Remove access"
        description={
          membersPanel.memberPendingRemoval
            ? `${membersPanel.memberPendingRemoval.name} will lose access to this workspace immediately.`
            : ''
        }
        onConfirm={membersPanel.removeMember}
        onOpenChange={(open) => {
          if (!open) {
            membersPanel.setMemberPendingRemoval(null)
          }
        }}
        open={Boolean(membersPanel.memberPendingRemoval)}
        title="Remove member access?"
        tone="destructive"
      />
    </section>
  )
}
