import {
  Button,
  ConfirmationDialog,
  EmptyState,
  Panel,
  PanelBody,
  ResourceState,
  Skeleton,
} from '@/shared/ui'

import { ReviewCreateDialog } from './ReviewCreateDialog'
import { ReviewEditor } from './ReviewEditor'
import { ReviewActionsMenu } from './ReviewActionsMenu'
import { ReviewSwitcher } from './ReviewSwitcher'
import { useGrowthReviewReviewsWorkflow } from './useGrowthReviewReviewsWorkflow'

function ReviewManagementLoadingState() {
  return (
    <Panel>
      <PanelBody className="grid gap-component">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </PanelBody>
    </Panel>
  )
}

export function GrowthReviewReviewManagement({ apiClient, workspaceId }) {
  const workflow = useGrowthReviewReviewsWorkflow({ apiClient, workspaceId })

  if (workflow.resource.status === 'loading') {
    return <ReviewManagementLoadingState />
  }

  if (workflow.resource.status === 'error') {
    return (
      <ResourceState
        errorInfo={workflow.resource.errorInfo}
        labels={{ failureTitle: 'Campaign reviews could not be loaded' }}
        onRetry={workflow.resource.reload}
      />
    )
  }

  return (
    <>
      {workflow.reviews.length === 0 ? (
        <EmptyState
          action={<Button onClick={workflow.openCreateDialog}>Add campaign review</Button>}
          description="Add an existing GHL reactivation campaign to make it available for reporting."
          iconName="settings"
          title="No campaign reviews yet"
        />
      ) : workflow.selectedReview ? (
        <ReviewEditor
          draft={workflow.reviewDraft}
          fieldErrors={workflow.fieldErrors}
          header={(
            <ReviewSwitcher
              onCreate={workflow.openCreateDialog}
              onSelect={workflow.selectReview}
              reviews={workflow.reviews}
              selectedReview={workflow.selectedReview}
            />
          )}
          headerAction={(
            <ReviewActionsMenu
              onArchive={workflow.requestArchive}
              review={workflow.selectedReview}
            />
          )}
          isDirty={workflow.isDirty}
          onAddSignal={workflow.addReviewSignal}
          onAddTrack={workflow.addReviewTrack}
          onAddTrackSignal={workflow.addReviewTrackSignal}
          onChangeField={workflow.changeReviewField}
          onChangeSignal={workflow.changeReviewSignal}
          onChangeTrack={workflow.changeReviewTrack}
          onChangeTrackSignal={workflow.changeReviewTrackSignal}
          onChangeSource={workflow.changeReviewSource}
          onRemoveSignal={workflow.removeReviewSignal}
          onRemoveTrack={workflow.removeReviewTrack}
          onRemoveTrackSignal={workflow.removeReviewTrackSignal}
          onRefreshPipelines={workflow.refreshPipelines}
          onRefreshTags={workflow.refreshTags}
          onReset={workflow.resetReviewDraft}
          onSave={workflow.saveReview}
          onValidate={workflow.validateReview}
          operationError={workflow.operationError}
          operationState={workflow.operationState}
          options={workflow.options}
          pipelines={workflow.pipelinesForReviewSource}
          pipelineSyncState={workflow.pipelineSyncState}
          review={workflow.selectedReview}
          tagSyncState={workflow.tagSyncState}
          validationResult={workflow.validationResult}
          validationState={workflow.validationState}
        />
      ) : (
        <EmptyState
          action={<Button onClick={workflow.openCreateDialog}>Add campaign review</Button>}
          description="Add an existing GHL reactivation campaign to make it available for reporting."
          iconName="settings"
          title="No campaign reviews yet"
        />
      )}

      <ReviewCreateDialog
        draft={workflow.createDraft}
        fieldErrors={workflow.fieldErrors}
        isOpen={workflow.isCreateOpen}
        onChangeField={workflow.changeCreateField}
        onChangeSource={workflow.changeCreateSource}
        onClose={workflow.closeCreateDialog}
        onRefreshPipelines={workflow.refreshPipelines}
        onSubmit={workflow.createReview}
        operationError={workflow.operationError}
        operationState={workflow.operationState}
        options={workflow.options}
        pipelines={workflow.pipelinesForCreateSource}
        pipelineSyncState={workflow.pipelineSyncState}
      />

      <ConfirmationDialog
        confirmLabel="Archive review"
        description={workflow.reviewPendingArchive
          ? `${workflow.reviewPendingArchive.name} will no longer appear as an active reporting review.`
          : ''}
        isConfirming={workflow.operationState === 'archiving'}
        onConfirm={workflow.confirmArchive}
        onOpenChange={(open) => {
          if (!open) {
            workflow.requestArchive(null)
          }
        }}
        open={Boolean(workflow.reviewPendingArchive)}
        title="Archive campaign review?"
        tone="destructive"
      />
    </>
  )
}
