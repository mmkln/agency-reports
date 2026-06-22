import { Link } from 'react-router-dom'

import {
  ClientWorkItemReviewDialog,
  useAdminClientWorkReviewWorkflow,
} from '../../../features/admin-client-work-review'
import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../../features/admin-client-workspace'
import { AdminClientWorkReviewWorkspace } from '../../../widgets/admin-client-work-review'
import {
  Button,
  PageShell,
} from '@/shared/ui'
import { Icon } from '../../../shared/icons'

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message} status="error" />
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
    return <WorkspaceErrorState message={workflow.reviewResource.error || 'Account was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button asChild size="sm" type="button" variant="outline">
            <Link to={`/admin/client-preview?clientId=${workflow.client.id}`}>
              <Icon name="eye" size={14} />
              Preview published portal version
            </Link>
          </Button>
        )}
        client={workflow.client}
        currentPage="projects"
        eyebrow="Account projects"
        width="content"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
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
