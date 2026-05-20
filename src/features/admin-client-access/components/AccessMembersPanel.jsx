import {
  Button,
  ConfirmationDialog,
  ListPanel,
} from '@/shared/ui'

import { FieldError, InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { useAccessMembersPanel } from '../useAccessMembersPanel'
import { AccessMemberCard } from './AccessMemberCard'
import { AccessMemberForm } from './AccessMemberForm'

export function AccessMembersPanel({ clientId, runtime }) {
  const membersPanel = useAccessMembersPanel({ clientId, runtime })

  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => membersPanel.setIsMemberFormOpen((isOpen) => !isOpen)}
          size="sm"
          type="button"
          variant={membersPanel.isMemberFormOpen ? 'ghost' : 'outline'}
        >
          {membersPanel.isMemberFormOpen ? 'Cancel' : 'Add member'}
        </Button>
      )}
      description="Manage who can open this workspace."
      iconName="users"
      title="Members"
    >
      <div className="grid grid-cols-1 gap-4">
        {membersPanel.status === 'loading' ? (
          <div className="rounded-control bg-block-subtle px-3 py-2 text-ui text-text-muted">Loading members...</div>
        ) : membersPanel.status === 'error' ? (
          <FieldError>Members could not be loaded.</FieldError>
        ) : membersPanel.members.length > 0 ? (
          <ListPanel className="rounded-control">
            {membersPanel.members.map((member) => (
              <AccessMemberCard
                key={member.id}
                member={member}
                onRemove={membersPanel.setMemberPendingRemoval}
                onRoleChange={membersPanel.changeRole}
              />
            ))}
          </ListPanel>
        ) : (
          <InlineEmptyState iconName="users" title="No workspace users yet">
            Add a member or send an invitation before a client can open this portal.
          </InlineEmptyState>
        )}

        {membersPanel.isMemberFormOpen ? (
          <AccessMemberForm
            error={membersPanel.error}
            form={membersPanel.form}
            memberEmailIssue={membersPanel.memberEmailIssue}
            memberNameIssue={membersPanel.memberNameIssue}
            onSubmit={membersPanel.addMember}
            onUpdateForm={membersPanel.updateForm}
          />
        ) : null}
      </div>
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
    </WorkspaceCard>
  )
}
