import {
  Button,
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import {
  ClientUpdateDialog,
  useAdminClientUpdatesWorkflow,
} from '../../../features/admin-client-updates'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { AdminClientUpdatesWorkspace } from '../../../widgets/admin-client-updates'

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="flex min-h-[260px] items-center justify-center text-ui text-destructive">
          {message}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function AdminClientUpdatesPage({ routeParams = {}, runtime }) {
  const workflow = useAdminClientUpdatesWorkflow({
    initialCreateOpen: routeParams.newUpdate === 'true',
    routeClientId: routeParams.clientId,
    runtime,
  })

  if (workflow.updatesResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workflow.updatesResource.status === 'error' || !workflow.client) {
    return <WorkspaceErrorState message={workflow.updatesResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button onClick={workflow.openCreateDialog} size="sm" type="button">
            <Icon name="plus" size={14} />
            New update
          </Button>
        )}
        client={workflow.client}
        currentPage="updates"
        eyebrow="Client updates"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <AdminClientUpdatesWorkspace
          counts={workflow.counts}
          onEdit={workflow.openEditDialog}
          onFilterChange={workflow.setSelectedFilter}
          onHide={workflow.hideUpdate}
          selectedFilter={workflow.selectedFilter}
          updates={workflow.filteredUpdates}
        />
      </PageShell>

      <ClientUpdateDialog
        clients={workflow.clients}
        draft={workflow.updateDraft}
        editingUpdate={workflow.editingUpdate}
        error={workflow.updateError}
        isOpen={workflow.isDialogOpen}
        onChange={workflow.setUpdateDraft}
        onClose={workflow.closeDialog}
        onSubmit={workflow.submitUpdate}
        saveState={workflow.updateSaveState}
      />
    </>
  )
}
