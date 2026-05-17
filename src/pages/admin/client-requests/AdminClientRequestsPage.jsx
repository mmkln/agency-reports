import {
  Button,
  CardContent,
  ConfirmationDialog,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import {
  RequestDetailDialog,
  RequestDialog,
  useAdminClientRequestsWorkflow,
} from '../../../features/admin-client-requests'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { AdminClientRequestsWorkspace } from '../../../widgets/admin-client-requests'

export function AdminClientRequestsPage({ routeParams = {}, runtime }) {
  const workflow = useAdminClientRequestsWorkflow({
    initialCreateOpen: routeParams.newRequest === 'true',
    routeClientId: routeParams.clientId,
    runtime,
  })

  if (workflow.requestsResource.status === 'loading') {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <Card className="bg-block shadow-none">
          <CardContent className="min-h-[260px] animate-pulse" />
        </Card>
      </PageShell>
    )
  }

  if (workflow.requestsResource.status === 'error' || !workflow.client) {
    return (
      <PageShell className="px-app-gutter py-content-gutter">
        <Card className="bg-block shadow-none">
          <CardContent className="flex min-h-[260px] items-center justify-center text-ui text-destructive">
            {workflow.requestsResource.error || 'Client was not found.'}
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button onClick={workflow.openCreateDialog} size="sm" type="button">
            <Icon name="plus" size={14} />
            New Request
          </Button>
        )}
        client={workflow.client}
        currentPage="actions"
        eyebrow="Action Needed"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <AdminClientRequestsWorkspace
          filteredActions={workflow.filteredActions}
          onCancel={workflow.setPendingCancel}
          onEdit={workflow.openEditDialog}
          onOpenDetail={workflow.setSelectedAction}
          onReopen={workflow.reopenRequest}
          onResolve={workflow.resolveRequest}
          onStatusFilterChange={workflow.setStatusFilter}
          openCount={workflow.openCount}
          statusFilter={workflow.statusFilter}
        />
      </PageShell>

      <RequestDialog
        client={workflow.client}
        clients={workflow.clients}
        draft={workflow.requestDraft}
        editingAction={workflow.editingAction}
        error={workflow.requestError}
        isOpen={workflow.isCreateOpen}
        onChange={workflow.setRequestDraft}
        onClose={workflow.closeCreateDialog}
        onSubmit={workflow.submitRequest}
        saveState={workflow.requestSaveState}
      />

      <RequestDetailDialog
        action={workflow.selectedAction}
        onCancel={workflow.setPendingCancel}
        onClose={() => workflow.setSelectedAction(null)}
        onEdit={workflow.openEditDialog}
        onReopen={workflow.reopenRequest}
        onResolve={workflow.resolveRequest}
      />

      <ConfirmationDialog
        confirmLabel="Cancel request"
        description={
          workflow.pendingCancel
            ? `${workflow.pendingCancel.title} will no longer appear as an active client request.`
            : ''
        }
        onConfirm={workflow.cancelRequest}
        onOpenChange={(open) => {
          if (!open) {
            workflow.setPendingCancel(null)
          }
        }}
        open={Boolean(workflow.pendingCancel)}
        title="Cancel client request?"
        tone="destructive"
      />
    </>
  )
}
