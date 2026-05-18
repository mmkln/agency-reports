import {
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import {
  ClientRequestTriageDialog,
  useAdminClientSubmittedRequestsWorkflow,
} from '../../../features/admin-client-submitted-requests'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { AdminClientSubmittedRequestsWorkspace } from '../../../widgets/admin-client-submitted-requests'

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <Card className="bg-block shadow-none">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <Card className="bg-block shadow-none">
        <CardContent className="flex min-h-[260px] items-center justify-center text-ui text-destructive">
          {message}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function AdminClientSubmittedRequestsPage({ routeParams = {}, runtime }) {
  const workflow = useAdminClientSubmittedRequestsWorkflow({
    routeClientId: routeParams.clientId,
    runtime,
  })

  if (workflow.requestsResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workflow.requestsResource.status === 'error' || !workflow.client) {
    return <WorkspaceErrorState message={workflow.requestsResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={workflow.client}
        currentPage="requests"
        eyebrow="Client-submitted requests"
        width="content"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        <AdminClientSubmittedRequestsWorkspace
          counts={workflow.counts}
          filteredRequests={workflow.filteredRequests}
          onOpenTriage={workflow.openTriageDialog}
          onStatusFilterChange={workflow.setStatusFilter}
          statusFilter={workflow.statusFilter}
        />
      </PageShell>

      <ClientRequestTriageDialog
        draft={workflow.triageDraft}
        error={workflow.triageError}
        isOpen={Boolean(workflow.selectedRequest)}
        onChange={workflow.setTriageDraft}
        onClose={workflow.closeTriageDialog}
        onSubmit={workflow.submitTriage}
        request={workflow.selectedRequest}
        saveState={workflow.triageSaveState}
      />
    </>
  )
}
