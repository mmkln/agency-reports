import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

import {
  PipelineOptions,
  ReviewFieldError,
  ReviewSelectField,
  ReviewTextField,
  SourceConnectionOptions,
} from './ReviewFormFields'

export function ReviewCreateDialog({
  draft,
  fieldErrors,
  isOpen,
  onChangeField,
  onChangeSource,
  onClose,
  onSubmit,
  operationError,
  operationState,
  options,
  pipelines,
}) {
  const isCreating = operationState === 'creating'

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }} open={isOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        <form onSubmit={onSubmit}>
          <div className="grid gap-item border-b border-separator px-panel py-component pr-control-xl">
            <DialogHeader>
              <DialogTitle>New campaign review</DialogTitle>
              <DialogDescription>
                Connect an existing GHL reactivation campaign to reporting.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid max-h-overlay gap-component overflow-y-auto px-panel py-card">
            {operationError ? (
              <div className="rounded-control bg-destructive/10 px-component py-item text-ui text-destructive" role="alert">
                {operationError}
              </div>
            ) : null}
            <ReviewTextField
              error={fieldErrors.name}
              id="new-review-name"
              label="Review name"
              onChange={(value) => onChangeField('name', value)}
              placeholder="Reactivation Campaign August 2026"
              required
              value={draft.name}
            />
            <div className="grid gap-component sm:grid-cols-2">
              <ReviewSelectField
                error={fieldErrors.source_connection_id ?? fieldErrors.sourceConnectionId}
                id="new-review-source"
                label="Source connection"
                onValueChange={onChangeSource}
                placeholder="Select connection"
                value={draft.sourceConnectionId}
              >
                <SourceConnectionOptions connections={options.sourceConnections} />
              </ReviewSelectField>
              <ReviewSelectField
                disabled={!draft.sourceConnectionId}
                error={fieldErrors.pipeline_id ?? fieldErrors.pipelineId}
                id="new-review-pipeline"
                label="Pipeline"
                onValueChange={(value) => onChangeField('pipelineId', value)}
                placeholder="Select pipeline"
                value={draft.pipelineId}
              >
                <PipelineOptions pipelines={pipelines} />
              </ReviewSelectField>
            </div>
            <div className="grid gap-component sm:grid-cols-2">
              <ReviewTextField
                error={fieldErrors.campaign_key ?? fieldErrors.campaignKey}
                help="Matches the campaign cohort identifier used in GHL."
                id="new-review-campaign-key"
                label="Campaign key"
                onChange={(value) => onChangeField('campaignKey', value)}
                placeholder="Reactivation2_aug2026"
                required
                value={draft.campaignKey}
              />
              <ReviewTextField
                error={fieldErrors.activity_start_date ?? fieldErrors.activityStartDate}
                help="Used as the start of W1."
                id="new-review-start-date"
                label="Campaign start date"
                onChange={(value) => onChangeField('activityStartDate', value)}
                type="date"
                value={draft.activityStartDate}
              />
            </div>
            <ReviewFieldError>{fieldErrors.detail}</ReviewFieldError>
          </div>

          <DialogFooter className="border-t border-separator bg-material-chrome px-panel py-component">
            <Button disabled={isCreating} onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isCreating} type="submit">
              {isCreating ? 'Creating...' : 'Create review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
