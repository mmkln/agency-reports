import { Link } from 'react-router-dom'

import {
  ClientWorkItemReviewDialog,
  useAdminClientWorkReviewWorkflow,
} from '../../../features/admin-client-work-review'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { AdminClientWorkReviewWorkspace } from '../../../widgets/admin-client-work-review'
import {
  Button,
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'
import { Icon } from '../../../shared/icons'

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

export function AdminClientWorkReviewPage({ routeParams = {}, runtime }) {
  const workflow = useAdminClientWorkReviewWorkflow({
    routeClientId: routeParams.clientId,
    runtime,
  })

  if (workflow.reviewResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workflow.reviewResource.status === 'error' || !workflow.client) {
    return <WorkspaceErrorState message={workflow.reviewResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button asChild size="sm" type="button" variant="outline">
            <Link to={`/admin/client-preview?clientId=${workflow.client.id}`}>
              <Icon name="eye" size={14} />
              Preview published client version
            </Link>
          </Button>
        )}
        client={workflow.client}
        currentPage="projects"
        eyebrow="Client projects"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <AdminClientWorkReviewWorkspace
          onArchive={workflow.setPendingArchive}
          onArchiveConfirm={workflow.archiveWorkItem}
          onCreateRequest={workflow.createRequestFromReviewItem}
          onCreateWorkItem={workflow.createWorkItemFromTask}
          onEdit={workflow.openEditDialog}
          onMarkReady={workflow.markReadyForReview}
          onPublish={workflow.publishWorkItem}
          onQueueFilterChange={workflow.setQueueFilter}
          pendingArchive={workflow.pendingArchive}
          queueCounts={workflow.queueCounts}
          queueFilter={workflow.queueFilter}
          visibleItems={workflow.visibleItems}
        />
      </PageShell>

      <ClientWorkItemReviewDialog
        draft={workflow.editDraft}
        error={workflow.editError}
        isOpen={Boolean(workflow.editingItem)}
        item={workflow.editingItem}
        onChange={workflow.setEditDraft}
        onClose={workflow.closeEditDialog}
        onSubmit={workflow.submitEdit}
        saveState={workflow.editSaveState}
      />
    </>
  )
}
