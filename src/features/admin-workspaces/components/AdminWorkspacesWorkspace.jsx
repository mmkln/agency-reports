import { ErrorBlock } from '@/shared/ui'

import { useAdminWorkspacesWorkflow } from '../model/useAdminWorkspacesWorkflow'
import { WorkspaceCreateDialog } from './WorkspaceCreateDialog'
import { WorkspacesTable } from './WorkspacesTable'

export function AdminWorkspacesWorkspace({ routeParams = {}, runtime }) {
  const workflow = useAdminWorkspacesWorkflow({ routeParams, runtime })

  return (
    <div className="grid gap-card">
      <WorkspaceCreateDialog
        clients={workflow.clients}
        createStatus={workflow.createStatus}
        error={workflow.createError}
        form={{
          ...workflow.form,
          clientId: workflow.form.clientId || workflow.selectedClientAccountId,
        }}
        isOpen={workflow.isCreateDialogOpen}
        onClose={workflow.closeCreateDialog}
        onSubmit={workflow.createWorkspace}
        onUpdateForm={(patch) => {
          workflow.setCreateError('')
          workflow.setForm((current) => ({ ...current, ...patch }))
        }}
      />

      {workflow.error ? (
        <ErrorBlock title="Workspaces request failed">
          {workflow.error}
        </ErrorBlock>
      ) : null}

      <WorkspacesTable
        error={workflow.error}
        selectedClient={workflow.selectedClient}
        status={workflow.status}
        workspaces={workflow.filteredWorkspaces}
      />
    </div>
  )
}
