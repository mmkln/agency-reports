import {
  Button,
  PageShell,
} from '@/shared/ui'

import {
  FileLinkDialog,
  useAdminClientFilesLinksWorkflow,
} from '../../../features/admin-client-files-links'
import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { AdminClientFilesLinksWorkspace } from '../../../widgets/admin-client-files-links'

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

export function AdminClientFilesLinksPage({ routeParams = {}, runtime }) {
  const workflow = useAdminClientFilesLinksWorkflow({
    initialCreateOpen: routeParams.newFileLink === 'true',
    routeClientId: routeParams.clientId,
    runtime,
  })

  if (workflow.fileLinksResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workflow.fileLinksResource.status === 'error' || !workflow.client) {
    return <WorkspaceErrorState message={workflow.fileLinksResource.error || 'Account was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <Button onClick={workflow.openCreateDialog} size="sm" type="button">
            <Icon name="plus" size={14} />
            New file/link
          </Button>
        )}
        client={workflow.client}
        currentPage="files-links"
        eyebrow="Files & Links"
        width="content"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        <AdminClientFilesLinksWorkspace
          counts={workflow.counts}
          fileLinks={workflow.filteredFileLinks}
          onArchive={workflow.archiveFileLink}
          onEdit={workflow.openEditDialog}
          onStatusFilterChange={workflow.setStatusFilter}
          statusFilter={workflow.statusFilter}
        />
      </PageShell>

      <FileLinkDialog
        clients={workflow.clients}
        draft={workflow.fileLinkDraft}
        editingFileLink={workflow.editingFileLink}
        error={workflow.fileLinkError}
        isOpen={workflow.isDialogOpen}
        onChange={workflow.setFileLinkDraft}
        onClose={workflow.closeDialog}
        onSubmit={workflow.submitFileLink}
        saveState={workflow.fileLinkSaveState}
      />
    </>
  )
}
