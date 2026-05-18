import {
  ConfirmationDialog,
} from '@/shared/ui'

import { InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { useAccessMembersPanel } from '../useAccessMembersPanel'
import { AccessMemberCard } from './AccessMemberCard'
import { AccessMemberForm } from './AccessMemberForm'

export function AccessMembersPanel({ clientId, runtime }) {
  const membersPanel = useAccessMembersPanel({ clientId, runtime })

  return (
    <WorkspaceCard
      description="Manage who can open this client portal."
      iconName="users"
      title="Members"
    >
      <div className="grid grid-cols-1 gap-4">
        {membersPanel.status === 'loading' ? (
          <div className="rounded-control bg-block-subtle px-3 py-2 text-ui text-text-muted">Loading members...</div>
        ) : membersPanel.status === 'error' ? (
          <div className="rounded-control border border-destructive/20 bg-destructive/10 px-3 py-2 text-ui text-destructive">
            Members could not be loaded.
          </div>
        ) : membersPanel.members.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {membersPanel.members.map((member) => (
              <AccessMemberCard
                key={member.id}
                member={member}
                onRemove={membersPanel.setMemberPendingRemoval}
                onRoleChange={membersPanel.changeRole}
              />
            ))}
          </div>
        ) : (
          <InlineEmptyState iconName="users" title="No client users yet">
            Add a member or send an invitation before a client can open this portal.
          </InlineEmptyState>
        )}

        <AccessMemberForm
          error={membersPanel.error}
          form={membersPanel.form}
          memberEmailIssue={membersPanel.memberEmailIssue}
          memberNameIssue={membersPanel.memberNameIssue}
          onSubmit={membersPanel.addMember}
          onUpdateForm={membersPanel.updateForm}
        />
      </div>
      <ConfirmationDialog
        confirmLabel="Remove access"
        description={
          membersPanel.memberPendingRemoval
            ? `${membersPanel.memberPendingRemoval.name} will lose access to this client portal immediately.`
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
