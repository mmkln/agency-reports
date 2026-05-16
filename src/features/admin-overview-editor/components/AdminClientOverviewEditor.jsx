import {
  ConfirmationDialog,
} from '@/shared/ui'

import { AdminClientWorkspaceHeader } from '../../admin-client-workspace'
import { useAdminOverviewEditorWorkflow } from '../useAdminOverviewEditorWorkflow'
import {
  AdminOverviewEditorErrorState,
  AdminOverviewEditorLoadingState,
} from './AdminOverviewEditorStates'
import { EditorActionToolbar } from './EditorActionToolbar'
import { OverviewEditorSections } from './OverviewEditorSections'

export function AdminClientOverviewEditor({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const {
    clearPendingDeletion,
    confirmDeletion,
    discardDraft,
    draft,
    editor,
    error,
    isDirty,
    isPublishConfirmationOpen,
    pageState,
    pendingDeletion,
    publishDraft,
    requestDeletion,
    restorePublished,
    saveState,
    setIsPublishConfirmationOpen,
    updateDraft,
  } = useAdminOverviewEditorWorkflow({ clientId, runtime })

  if (pageState.status === 'error' && error && !editor) {
    return <AdminOverviewEditorErrorState message={error} />
  }

  if (pageState.status === 'loading' || !editor || !draft) {
    return <AdminOverviewEditorLoadingState />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={{
          ...editor.client,
          status: draft.client.status,
        }}
        currentPage="overview"
        eyebrow="Client overview editor"
        actions={(
          <EditorActionToolbar
            editor={editor}
            isDirty={isDirty}
            onDiscardDraft={discardDraft}
            onPublish={() => setIsPublishConfirmationOpen(true)}
            onRestorePublished={restorePublished}
            saveState={saveState}
          />
        )}
        onStatusChange={(status) => updateDraft((currentDraft) => ({
          ...currentDraft,
          client: {
            ...currentDraft.client,
            status,
          },
        }))}
      />

      <ConfirmationDialog
        confirmLabel="Publish overview"
        description={`This will save the current draft and publish ${editor.client.name}'s overview to the client portal.`}
        onConfirm={publishDraft}
        onOpenChange={setIsPublishConfirmationOpen}
        open={isPublishConfirmationOpen}
        title="Publish client overview?"
        tone="primary"
      />

      <ConfirmationDialog
        confirmLabel="Delete"
        description={
          pendingDeletion
            ? `${pendingDeletion.label || 'This item'} will be removed from the current draft. Save or publish after deletion to persist the change.`
            : ''
        }
        onConfirm={confirmDeletion}
        onOpenChange={(open) => {
          if (!open) {
            clearPendingDeletion()
          }
        }}
        open={Boolean(pendingDeletion)}
        title="Delete draft item?"
        tone="destructive"
      />

      <OverviewEditorSections
        draft={draft}
        editor={editor}
        onRequestDeletion={requestDeletion}
        onUpdateDraft={updateDraft}
      />
    </>
  )
}
