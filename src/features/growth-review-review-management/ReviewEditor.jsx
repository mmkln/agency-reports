import { Icon } from '@/shared/icons'
import {
  Button,
  Label,
  Panel,
  PanelBody,
  PanelHeader,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/shared/ui'

import {
  PipelineOptions,
  ReviewFieldError,
  ReviewSelectField,
  ReviewTextField,
  SourceConnectionOptions,
} from './ReviewFormFields'
import { PipelineRefreshButton } from './PipelineRefreshButton'

function EditorSection({ children, description, title }) {
  return (
    <section className="grid gap-component border-t border-separator pt-card first:border-t-0 first:pt-0">
      <div className="grid gap-tag">
        <h3 className="text-ui font-semibold text-text-primary">{title}</h3>
        {description ? <p className="text-ui text-text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function SignalSummary({ signals }) {
  return (
    <div className="divide-y divide-separator">
      {signals.map((signal) => (
        <div className="flex items-start justify-between gap-component py-item first:pt-0 last:pb-0" key={signal.id}>
          <div className="min-w-0">
            <p className="text-ui font-medium text-text-primary">{signal.label}</p>
            <p className="mt-tag truncate text-label font-normal text-text-muted">
              {signal.expectedValues.join(', ') || 'Configured by the reporting template'}
            </p>
          </div>
          {signal.isActive ? (
            <Icon className="mt-micro shrink-0 text-success" name="checkCircle2" size={16} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function ReviewEditor({
  draft,
  fieldErrors,
  header,
  headerAction,
  isDirty,
  onChangeField,
  onChangeSource,
  onRefreshPipelines,
  onReset,
  onSave,
  operationError,
  operationState,
  options,
  pipelines,
  pipelineSyncState,
  review,
}) {
  const isBusy = operationState !== 'idle'
  const isArchived = review.status === 'archived'
  const editableStatuses = options.statuses.filter((status) => status.value !== 'archived')

  return (
    <Panel className="min-w-0">
      <PanelHeader action={headerAction} divided>
        {header}
      </PanelHeader>
      <form onSubmit={onSave}>
        <PanelBody className="grid gap-card">
          {operationError ? (
            <div className="rounded-control bg-destructive/10 px-component py-item text-ui text-destructive" role="alert">
              {operationError}
            </div>
          ) : null}

          <EditorSection title="Review details">
            <div className="grid gap-component sm:grid-cols-2">
              <ReviewTextField
                error={fieldErrors.name}
                id="review-name"
                label="Review name"
                onChange={(value) => onChangeField('name', value)}
                placeholder="Reactivation Campaign August 2026"
                required
                value={draft.name}
              />
              <div className="grid gap-item">
                <Label htmlFor="review-status">Status</Label>
                <RadixSelect
                  disabled={isArchived}
                  onValueChange={(value) => onChangeField('status', value)}
                  value={draft.status}
                >
                  <SelectTrigger id="review-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {editableStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                    {isArchived ? <SelectItem value="archived">Archived</SelectItem> : null}
                  </SelectContent>
                </RadixSelect>
              </div>
              <ReviewTextField
                error={fieldErrors.activity_start_date ?? fieldErrors.activityStartDate}
                help="Defines W1 and all following campaign weeks."
                id="review-start-date"
                label="Campaign start date"
                onChange={(value) => onChangeField('activityStartDate', value)}
                type="date"
                value={draft.activityStartDate}
              />
              <div className="flex min-h-target items-center justify-between gap-component self-end rounded-control bg-block-subtle px-component py-item">
                <div>
                  <Label htmlFor="review-default">Default review</Label>
                  <p className="mt-tag text-label font-normal text-text-muted">
                    Opens first when no review is selected.
                  </p>
                </div>
                <Switch
                  checked={draft.isDefault}
                  disabled={review.isDefault || isArchived}
                  id="review-default"
                  onCheckedChange={(checked) => onChangeField('isDefault', checked)}
                />
              </div>
            </div>
          </EditorSection>

          <EditorSection
            description="The review reads an existing campaign from this GHL location and pipeline."
            title="GHL source"
          >
            <div className="grid gap-component sm:grid-cols-2">
              <ReviewSelectField
                error={fieldErrors.source_connection_id ?? fieldErrors.sourceConnectionId}
                id="review-source"
                label="Source connection"
                onValueChange={onChangeSource}
                placeholder="Select connection"
                value={draft.sourceConnectionId}
              >
                <SourceConnectionOptions connections={options.sourceConnections} />
              </ReviewSelectField>
              <ReviewSelectField
                action={(
                  <PipelineRefreshButton
                    disabled={!draft.sourceConnectionId}
                    isRefreshing={pipelineSyncState === 'syncing'}
                    onRefresh={() => onRefreshPipelines(draft.sourceConnectionId)}
                  />
                )}
                disabled={!draft.sourceConnectionId}
                error={fieldErrors.pipeline_id ?? fieldErrors.pipelineId}
                id="review-pipeline"
                label="Pipeline"
                onValueChange={(value) => onChangeField('pipelineId', value)}
                placeholder="Select pipeline"
                value={draft.pipelineId}
              >
                <PipelineOptions pipelines={pipelines} />
              </ReviewSelectField>
            </div>
          </EditorSection>

          <EditorSection
            description="This key identifies the campaign cohort in GHL."
            title="Campaign identity"
          >
            <div className="max-w-xl">
              <ReviewTextField
                error={fieldErrors.campaign_key ?? fieldErrors.campaignKey}
                id="review-campaign-key"
                label="Campaign key"
                onChange={(value) => onChangeField('campaignKey', value)}
                placeholder="Reactivation2_aug2026"
                required
                value={draft.campaignKey}
              />
            </div>
          </EditorSection>

          <EditorSection
            description="These reporting signals are maintained by the reactivation review template."
            title="Outcome mapping"
          >
            {review.signals.length > 0 ? (
              <SignalSummary signals={review.signals} />
            ) : (
              <p className="text-ui text-text-muted">No reporting signals are configured.</p>
            )}
          </EditorSection>

          <ReviewFieldError>{fieldErrors.detail}</ReviewFieldError>

          <div className="flex flex-col-reverse gap-item border-t border-separator pt-component sm:flex-row sm:justify-end">
            <Button
              disabled={!isDirty || isBusy}
              onClick={onReset}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
            <Button disabled={!isDirty || isBusy || isArchived} type="submit">
              {operationState === 'saving' ? 'Saving...' : 'Save review'}
            </Button>
          </div>
        </PanelBody>
      </form>
    </Panel>
  )
}
