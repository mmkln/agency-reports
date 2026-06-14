import { useState } from 'react'

import {
  Button,
  ConfirmationDialog,
  Panel,
  PanelBody,
  PanelHeader,
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
    <Panel>
      <PanelHeader
        action={(
          <Button
            disabled={membersPanel.memberHistory.length === 0}
            onClick={() => setIsHistoryDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            History
          </Button>
        )}
        divided
        subtitle="People with access to this workspace."
        title="Members"
      />
      <PanelBody className="p-0">
        {membersPanel.status === 'loading' ? (
          <div className="m-card rounded-control bg-block-subtle px-3 py-2 text-ui text-text-muted">Loading members...</div>
        ) : membersPanel.status === 'error' ? (
          <div className="m-card">
            <FieldError>{membersPanel.error || 'Members could not be loaded.'}</FieldError>
          </div>
        ) : membersPanel.activeMembers.length === 0 ? (
          <EmptyState
            className="m-card"
            description="No active members are currently attached to this workspace."
            iconName="users"
            title="No active members"
          />
        ) : (
          <div className="p-card">
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
          </div>
        )}
      </PanelBody>
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
    </Panel>
  )
}
