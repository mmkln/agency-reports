import { DataTableSurface, ErrorBlock } from '@/shared/ui'

import { getClientActionPermissions } from '../model/clientActionPermissions'
import { useAdminClientsWorkflow } from '../model/useAdminClientsWorkflow'
import { ClientCreateDialog } from './ClientCreateDialog'
import { ClientDetailDialog } from './ClientDetailDialog'
import { ClientInviteUserDialog } from './ClientInviteUserDialog'
import { ClientQuickEditDialog } from './ClientQuickEditDialog'
import { ClientsTable } from './ClientsTable'

export function AdminClientsWorkspace({ routeParams = {}, runtime }) {
  const workflow = useAdminClientsWorkflow({ routeParams, runtime })
  const openClientPermissions = workflow.openClient
    ? getClientActionPermissions(runtime.viewer, workflow.openClient)
    : null

  return (
    <div className="grid gap-card">
      <ClientCreateDialog
        createStatus={workflow.createStatus}
        error={workflow.createError}
        form={workflow.createForm}
        isOpen={workflow.isCreateDialogOpen}
        onClose={workflow.closeDialog}
        onSubmit={workflow.createClient}
        onUpdateName={(name) => {
          workflow.setCreateError('')
          workflow.setCreateForm((current) => ({ ...current, name }))
        }}
      />
      <ClientDetailDialog
        client={workflow.openClient}
        isOpen={workflow.isDetailDialogOpen}
        onClose={workflow.closeDialog}
        onEditClient={workflow.openEditDialog}
        onInviteClientUser={workflow.openInviteDialog}
        permissions={openClientPermissions}
      />
      <ClientQuickEditDialog
        client={workflow.clientPendingEdit}
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
        client={workflow.clientPendingInvite}
        error={workflow.inviteError}
        form={workflow.inviteForm}
        isOpen={workflow.isInviteDialogOpen}
        memberships={workflow.memberships}
        membershipsStatus={
          workflow.isInviteDialogOpen && workflow.membershipsStatus === 'idle'
            ? 'loading'
            : workflow.membershipsStatus
        }
        onClose={workflow.closeDialog}
        onSubmit={workflow.inviteClientUser}
        onUpdateForm={(patch) => {
          workflow.setInviteError('')
          workflow.setInviteForm((current) => ({ ...current, ...patch }))
        }}
        status={workflow.inviteStatus}
      />

      {workflow.error ? (
        <ErrorBlock title="Clients request failed">
          {workflow.error}
        </ErrorBlock>
      ) : null}

      {workflow.status === 'loading' ? (
        <DataTableSurface>
          <div className="min-h-[220px] animate-pulse" />
        </DataTableSurface>
      ) : workflow.status === 'error' ? (
        <DataTableSurface className="p-card">
          <ErrorBlock title="Clients could not be loaded">
            {workflow.error}
          </ErrorBlock>
        </DataTableSurface>
      ) : (
        <ClientsTable
          clients={workflow.clients}
          onEditClient={workflow.openEditDialog}
          onInviteClientUser={workflow.openInviteDialog}
          onOpenClient={workflow.openClientDetail}
          viewer={runtime.viewer}
        />
      )}
    </div>
  )
}
