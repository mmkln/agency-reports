import {
  Button,
  ConfirmationDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'
import { WorkspaceMemberList } from '@/entities/workspace-membership/ui'
import { Icon } from '@/shared/icons'

import { FieldError } from '../../admin-client-workspace'
import { useAccessMembersPanel } from '../useAccessMembersPanel'
import { AccessMemberEditDialog } from './AccessMemberEditDialog'
import { AccessMemberForm } from './AccessMemberForm'

export function AccessMembersPanel({ clientId, runtime }) {
  const membersPanel = useAccessMembersPanel({ clientId, runtime })
  const canSubmitMember = Boolean(
    membersPanel.form.name.trim()
    && membersPanel.form.email.trim()
    && !membersPanel.memberNameIssue
    && !membersPanel.memberEmailIssue,
  )

  return (
    <Panel>
      <PanelHeader
        action={(
          <Button
            icon={<Icon name="plus" size={14} />}
            onClick={() => membersPanel.setIsMemberFormOpen(true)}
            size="sm"
            type="button"
          >
            Add client user
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
            <FieldError>Members could not be loaded.</FieldError>
          </div>
        ) : (
          <WorkspaceMemberList
            canEdit
            canRemove
            emptyDescription="No members are currently attached to this workspace."
            emptyTitle="No members"
            members={membersPanel.members}
            onEditMember={membersPanel.startEditingMember}
            onRemoveMember={membersPanel.setMemberPendingRemoval}
          />
        )}
      </PanelBody>
      <Dialog onOpenChange={membersPanel.setIsMemberFormOpen} open={membersPanel.isMemberFormOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sheet-md gap-component p-panel">
          <DialogHeader className="pr-control-xl">
            <DialogTitle>Add client user</DialogTitle>
            <DialogDescription>
              Add a user who can open this workspace.
            </DialogDescription>
          </DialogHeader>
          <AccessMemberForm
            canSubmit={canSubmitMember}
            error={membersPanel.error}
            form={membersPanel.form}
            memberEmailIssue={membersPanel.memberEmailIssue}
            memberNameIssue={membersPanel.memberNameIssue}
            onCancel={() => membersPanel.setIsMemberFormOpen(false)}
            onSubmit={membersPanel.addMember}
            onUpdateForm={membersPanel.updateForm}
          />
        </DialogContent>
      </Dialog>
      <AccessMemberEditDialog
        error={membersPanel.error}
        member={membersPanel.memberPendingEdit}
        onOpenChange={(open) => {
          if (!open) {
            membersPanel.setMemberPendingEdit(null)
          }
        }}
        onRoleChange={membersPanel.setEditRole}
        onSubmit={membersPanel.saveMemberEdit}
        role={membersPanel.editRole}
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
