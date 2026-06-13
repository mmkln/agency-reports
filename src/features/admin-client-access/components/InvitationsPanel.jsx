import {
  ConfirmationDialog,
} from '@/shared/ui'

import { FieldError, InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { useInvitationsPanel } from '../useInvitationsPanel'
import { InvitationCard } from './InvitationCard'
import { InvitationForm } from './InvitationForm'

export function InvitationsPanel({ runtime, workspaceId }) {
  const invitationsPanel = useInvitationsPanel({ runtime, workspaceId })

  return (
    <WorkspaceCard
      description="Pending portal access requests. Access starts only after acceptance."
      iconName="mail"
      title="Invitations"
    >
      <div className="grid grid-cols-1 gap-4">
        {invitationsPanel.status === 'loading' ? (
          <div className="rounded-control bg-block-subtle px-3 py-2 text-ui text-text-muted">Loading invitations...</div>
        ) : invitationsPanel.status === 'error' ? (
          <FieldError>Invitations could not be loaded.</FieldError>
        ) : invitationsPanel.invitations.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {invitationsPanel.invitations.map((invitation) => (
              <InvitationCard
                invitation={invitation}
                key={invitation.id}
                onCancel={invitationsPanel.setInvitationPendingCancel}
                onResend={invitationsPanel.resendInvitation}
              />
            ))}
          </div>
        ) : (
          <InlineEmptyState iconName="mail" title="No invitations yet">
            Send an invite when a client user should receive portal access after accepting.
          </InlineEmptyState>
        )}

        <InvitationForm
          error={invitationsPanel.error}
          form={invitationsPanel.form}
          invitationEmailIssue={invitationsPanel.invitationEmailIssue}
          onSubmit={invitationsPanel.createInvitation}
          onUpdateForm={invitationsPanel.updateForm}
        />
      </div>
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
