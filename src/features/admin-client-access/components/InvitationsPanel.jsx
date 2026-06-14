import { useState } from 'react'

import {
  Button,
  ConfirmationDialog,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { FieldError, InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { useInvitationsPanel } from '../useInvitationsPanel'
import { InvitationCard } from './InvitationCard'
import { InvitationDialog } from './InvitationForm'
import { InvitationHistoryDialog } from './InvitationHistoryDialog'

export function InvitationsPanel({ runtime, workspaceId }) {
  const invitationsPanel = useInvitationsPanel({ runtime, workspaceId })
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  return (
    <WorkspaceCard
      action={(
        <div className="flex items-center gap-control">
          <Button
            disabled={invitationsPanel.invitationHistory.length === 0}
            onClick={() => setIsHistoryDialogOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            History
          </Button>
          <Button
            icon={<Icon name="mail" size={14} />}
            onClick={invitationsPanel.openInviteDialog}
            size="sm"
            type="button"
            variant="outline"
          >
            Invite user
          </Button>
        </div>
      )}
      description="Pending portal access requests. Access starts only after acceptance."
      title="Invitations"
    >
      <div className="grid gap-item">
        {invitationsPanel.status === 'loading' ? (
          <div className="rounded-control bg-block-subtle px-card py-component text-ui text-text-muted">Loading invitations...</div>
        ) : invitationsPanel.status === 'error' ? (
          <FieldError>Invitations could not be loaded.</FieldError>
        ) : invitationsPanel.pendingInvitations.length > 0 ? (
          <div className="overflow-hidden rounded-control border border-control-border">
            <div className="hidden border-b border-separator px-component py-item text-label text-text-muted md:grid md:grid-cols-[minmax(240px,1.4fr)_150px_120px_150px_120px_44px]">
              <span>Invitee</span>
              <span>Role</span>
              <span>Status</span>
              <span>Delivery</span>
              <span>Expires</span>
              <span aria-hidden="true" />
            </div>
            <div className="divide-y divide-separator">
              {invitationsPanel.pendingInvitations.map((invitation) => (
                <InvitationCard
                  invitation={invitation}
                  key={invitation.id}
                  onCancel={invitationsPanel.setInvitationPendingCancel}
                  onResend={invitationsPanel.resendInvitation}
                />
              ))}
            </div>
          </div>
        ) : (
          <InlineEmptyState iconName="mail" title="No pending invitations">
            Send an invite when a client user should receive portal access after accepting.
          </InlineEmptyState>
        )}

      </div>
      <InvitationHistoryDialog
        invitations={invitationsPanel.invitationHistory}
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
      <InvitationDialog
        error={invitationsPanel.error}
        form={invitationsPanel.form}
        invitationEmailIssue={invitationsPanel.invitationEmailIssue}
        invitationNameIssue={invitationsPanel.invitationNameIssue}
        isOpen={invitationsPanel.isInviteDialogOpen}
        onClose={invitationsPanel.closeInviteDialog}
        onSubmit={invitationsPanel.createInvitation}
        onUpdateForm={invitationsPanel.updateForm}
        status={invitationsPanel.inviteStatus}
      />
      <ConfirmationDialog
        confirmLabel="Revoke invitation"
        description={
          invitationsPanel.invitationPendingCancel
            ? `${invitationsPanel.invitationPendingCancel.email} will no longer be able to accept this invite link.`
            : ''
        }
        onConfirm={invitationsPanel.cancelInvitation}
        onOpenChange={(open) => {
          if (!open) {
            invitationsPanel.setInvitationPendingCancel(null)
          }
        }}
        open={Boolean(invitationsPanel.invitationPendingCancel)}
        title="Revoke invitation?"
        tone="destructive"
      />
    </WorkspaceCard>
  )
}
