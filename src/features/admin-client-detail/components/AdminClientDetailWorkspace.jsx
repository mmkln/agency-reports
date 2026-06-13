import {
  ConfirmationDialog,
  ErrorBlock,
  Panel,
  PanelBody,
  PanelHeader,
  UnavailableState,
} from '@/shared/ui'

import { useAdminClientDetailWorkflow } from '../model/useAdminClientDetailWorkflow'
import { AdminClientDetailHeader } from './AdminClientDetailHeader'
import { ClientOverviewPanel } from './ClientOverviewPanel'
import { ClientUsersPanel } from './ClientUsersPanel'
import { ClientWorkspacesPanel } from './ClientWorkspacesPanel'
import {
  ClientInviteUserDialog,
  ClientQuickEditDialog,
  ClientWorkspaceCreateDialog,
} from './ClientDetailActionDialogs'

export function AdminClientDetailWorkspace({ routeParams = {}, runtime }) {
  const workflow = useAdminClientDetailWorkflow({ routeParams, runtime })

  if (!workflow.clientId) {
    return (
      <UnavailableState
        iconName="users"
        title="Client was not selected"
      />
    )
  }

  if (workflow.status === 'loading') {
    return (
      <Panel>
        <PanelHeader divided title="Client" />
        <PanelBody>
          <div className="min-h-[220px] animate-pulse rounded-block bg-fill" />
        </PanelBody>
      </Panel>
    )
  }

  if (workflow.status === 'error') {
    return (
      <ErrorBlock title="Client could not be loaded">
        {workflow.error}
      </ErrorBlock>
    )
  }

  if (!workflow.client) {
    return (
      <UnavailableState
        iconName="users"
        title="Client was not found"
      />
    )
  }

  return (
    <div className="flex flex-col gap-card">
      <ClientQuickEditDialog
        client={workflow.client}
        error={workflow.editError}
        form={workflow.editForm}
        isOpen={workflow.isEditDialogOpen}
        onClose={workflow.closeDialog}
        onSubmit={workflow.saveClientEdit}
        onUpdateForm={(patch) => {
          workflow.setEditError('')
          workflow.setEditForm((current) => ({
            ...(current.clientId === workflow.editForm.clientId ? current : workflow.editForm),
            ...patch,
          }))
        }}
        status={workflow.editStatus}
      />
      <ClientInviteUserDialog
        client={workflow.client}
        error={workflow.inviteError}
        form={workflow.inviteForm}
        isOpen={workflow.isInviteDialogOpen}
        onClose={workflow.closeDialog}
        onSubmit={workflow.inviteClientUser}
        onUpdateForm={(patch) => {
          workflow.setInviteError('')
          workflow.setInviteForm((current) => ({ ...current, ...patch }))
        }}
        status={workflow.inviteStatus}
      />
      <ClientWorkspaceCreateDialog
        client={workflow.client}
        error={workflow.workspaceError}
        form={workflow.workspaceForm}
        isOpen={workflow.isWorkspaceDialogOpen}
        onClose={workflow.closeDialog}
        onSubmit={workflow.createWorkspace}
        onUpdateForm={(patch) => {
          workflow.setWorkspaceError('')
          workflow.setWorkspaceForm((current) => ({ ...current, ...patch }))
        }}
        status={workflow.workspaceStatus}
      />
      <ConfirmationDialog
        confirmLabel={workflow.revokeStatus === 'revoking' ? 'Revoking...' : 'Revoke access'}
        description={`This will remove ${workflow.membershipPendingRevoke?.email || workflow.membershipPendingRevoke?.name || 'this user'} from this client.`}
        isConfirming={workflow.revokeStatus === 'revoking'}
        onConfirm={workflow.revokeClientUserAccess}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            workflow.closeDialog()
          }
        }}
        open={workflow.isRevokeDialogOpen}
        title="Revoke client access?"
        tone="destructive"
      />

      <AdminClientDetailHeader
        client={workflow.client}
        onAddWorkspace={workflow.openWorkspaceDialog}
        onEditClient={workflow.openEditDialog}
      />
      <ClientOverviewPanel client={workflow.client} />
      <ClientWorkspacesPanel workspaces={workflow.client.workspaces} />
      <ClientUsersPanel
        memberships={workflow.memberships}
        onInviteUser={workflow.openInviteDialog}
        onRevokeAccess={workflow.openRevokeDialog}
        revokeError={workflow.revokeError}
      />
    </div>
  )
}
