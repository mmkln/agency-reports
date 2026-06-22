import { useMemo } from 'react'

import {
  GROWTH_REVIEW_FUNNEL_CALCULATION_MODES,
} from '@/entities/growth-review-settings'
import {
  Button,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  RadixSelect,
  ResourceState,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/shared/ui'

import { useGrowthReviewSetupWorkflow } from './useGrowthReviewSetupWorkflow'

function findPipeline(options, pipelineId) {
  return options.pipelines.find((pipeline) => pipeline.id === pipelineId) ?? null
}

function findBookedStage(pipeline, bookedStageId) {
  return pipeline?.stages.find((stage) => stage.id === bookedStageId) ?? null
}

function getPipelinesForSource(options, sourceConnectionId) {
  return options.pipelines.filter((pipeline) => pipeline.sourceConnectionId === sourceConnectionId)
}

function buildStepDraftFromPipeline(pipeline, bookedStageId) {
  return (pipeline?.stages ?? []).map((stage, index) => ({
    calculationMode: GROWTH_REVIEW_FUNNEL_CALCULATION_MODES.CURRENT_STAGE_COUNT,
    displayOrder: index,
    id: null,
    isBookedStep: stage.id === bookedStageId,
    isVisible: true,
    key: stage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: stage.name,
    stageIds: [stage.id],
  }))
}

function SelectField({ children, disabled, label, onValueChange, placeholder, value }) {
  return (
    <label className="grid gap-item">
      <span className="text-label text-text-muted">{label}</span>
      <RadixSelect disabled={disabled} onValueChange={onValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </RadixSelect>
    </label>
  )
}

function CampaignSection({ draft, onUpdate }) {
  function updateActivityStartDate(event) {
    onUpdate((current) => ({
      ...current,
      reactivationActivityStartDate: event.target.value,
    }))
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Activity charts use this date as the start of the configured reactivation campaign."
        title="Reactivation campaign"
      />
      <PanelBody>
        <label className="grid max-w-sm gap-item">
          <span className="text-label text-text-muted">Activity start date</span>
          <Input
            onChange={updateActivityStartDate}
            type="date"
            value={draft.reactivationActivityStartDate}
          />
        </label>
      </PanelBody>
    </Panel>
  )
}

function SourceConnectionSection({ draft, onUpdate, options }) {
  function selectSourceConnection(sourceConnectionId) {
    const pipelines = getPipelinesForSource(options, sourceConnectionId)
    const pipeline = pipelines[0] ?? null
    const bookedStage = pipeline?.stages.find((stage) => /booked/i.test(stage.name)) ?? pipeline?.stages[0] ?? null

    onUpdate({
      bookedStageId: bookedStage?.id ?? '',
      funnelPipelineId: pipeline?.id ?? '',
      funnelSteps: buildStepDraftFromPipeline(pipeline, bookedStage?.id),
      sourceConnectionId,
    })
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Choose the GHL location that owns the pipeline and appointment data."
        title="Data source"
      />
      <PanelBody>
        {options.sourceConnections.length === 0 ? (
          <ResourceState
            errorInfo={{ kind: 'not-found' }}
            labels={{
              notFoundDescription: 'Connect a GHL source on the Data tab before configuring Growth Review.',
              notFoundTitle: 'No GHL connection',
            }}
          />
        ) : (
          <SelectField
            label="GHL connection"
            onValueChange={selectSourceConnection}
            placeholder="Choose connection"
            value={draft.sourceConnectionId}
          >
            {options.sourceConnections.map((connection) => (
              <SelectItem key={connection.id} value={connection.id}>
                {connection.externalAccountId || connection.id}
                {connection.credential.hasToken ? ' - token stored' : ' - no token'}
              </SelectItem>
            ))}
          </SelectField>
        )}
      </PanelBody>
    </Panel>
  )
}

function PipelineSection({ draft, onUpdate, options }) {
  const availablePipelines = useMemo(
    () => getPipelinesForSource(options, draft.sourceConnectionId),
    [draft.sourceConnectionId, options],
  )
  const selectedPipeline = findPipeline(options, draft.funnelPipelineId)

  function selectPipeline(pipelineId) {
    const pipeline = findPipeline(options, pipelineId)
    const bookedStage = pipeline?.stages.find((stage) => /booked/i.test(stage.name)) ?? pipeline?.stages[0] ?? null

    onUpdate((current) => ({
      ...current,
      bookedStageId: bookedStage?.id ?? '',
      funnelPipelineId: pipelineId,
      funnelSteps: buildStepDraftFromPipeline(pipeline, bookedStage?.id),
    }))
  }

  function selectBookedStage(bookedStageId) {
    onUpdate((current) => ({
      ...current,
      bookedStageId,
      funnelSteps: current.funnelSteps.map((step) => ({
        ...step,
        isBookedStep: step.stageIds.includes(bookedStageId),
      })),
    }))
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Growth Review uses one configured GHL pipeline for bookings and pipeline-dependent charts."
        title="Pipeline"
      />
      <PanelBody>
        <div className="grid gap-control md:grid-cols-2">
          <SelectField
            disabled={!draft.sourceConnectionId || availablePipelines.length === 0}
            label="Review pipeline"
            onValueChange={selectPipeline}
            placeholder="Choose pipeline"
            value={draft.funnelPipelineId}
          >
            {availablePipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectField>

          <SelectField
            disabled={!selectedPipeline}
            label="Booked stage"
            onValueChange={selectBookedStage}
            placeholder="Choose booked stage"
            value={draft.bookedStageId}
          >
            {(selectedPipeline?.stages ?? []).map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectField>
        </div>
      </PanelBody>
    </Panel>
  )
}

function FunnelSection({ draft, onUpdate, options }) {
  const selectedPipeline = findPipeline(options, draft.funnelPipelineId)
  const stageById = new Map((selectedPipeline?.stages ?? []).map((stage) => [stage.id, stage]))

  function toggleStepVisibility(index) {
    onUpdate((current) => ({
      ...current,
      funnelSteps: current.funnelSteps.map((step, stepIndex) => (
        stepIndex === index ? { ...step, isVisible: !step.isVisible } : step
      )),
    }))
  }

  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="Steps are derived from the selected pipeline and can be hidden from the client dashboard."
        title="Funnel"
      />
      <PanelBody>
        {!selectedPipeline ? (
          <ResourceState
            errorInfo={{ kind: 'not-found' }}
            labels={{
              notFoundDescription: 'Choose a pipeline before editing funnel steps.',
              notFoundTitle: 'Pipeline required',
            }}
          />
        ) : (
          <div className="divide-y divide-separator">
            {draft.funnelSteps.map((step, index) => {
              const mappedStageNames = step.stageIds
                .map((stageId) => stageById.get(stageId)?.name)
                .filter(Boolean)
                .join(', ')

              return (
                <div
                  className="grid gap-control py-control md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                  key={`${step.key}-${index}`}
                >
                  <div className="min-w-0">
                    <p className="text-ui font-semibold text-text-primary">
                      {step.label}
                      {step.isBookedStep ? <span className="ml-2 text-label text-success">Booked</span> : null}
                    </p>
                    <p className="mt-1 text-label text-text-muted">
                      {mappedStageNames || 'No mapped stage'}
                    </p>
                  </div>
                  <Button
                    onClick={() => toggleStepVisibility(index)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {step.isVisible ? 'Visible' : 'Hidden'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

function PreviewSection({ draft, options }) {
  const pipeline = findPipeline(options, draft.funnelPipelineId)
  const bookedStage = findBookedStage(pipeline, draft.bookedStageId)
  const visibleSteps = draft.funnelSteps.filter((step) => step.isVisible)

  return (
    <Panel>
      <PanelHeader divided title="Review readiness" />
      <PanelBody>
        <div className="grid gap-control md:grid-cols-3">
          <div>
            <p className="text-label text-text-muted">Pipeline</p>
            <p className="mt-1 text-ui font-semibold text-text-primary">{pipeline?.name || 'Not configured'}</p>
          </div>
          <div>
            <p className="text-label text-text-muted">Booked stage</p>
            <p className="mt-1 text-ui font-semibold text-text-primary">{bookedStage?.name || 'Not configured'}</p>
          </div>
          <div>
            <p className="text-label text-text-muted">Visible steps</p>
            <p className="mt-1 text-ui font-semibold text-text-primary">{visibleSteps.length}</p>
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

function SetupState({ message, status = 'loading' }) {
  return (
    <Panel>
      <PanelBody className="flex min-h-[260px] items-center justify-center">
        {status === 'loading' ? (
          <div className="grid w-full max-w-md gap-component">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <ResourceState
            errorInfo={{ kind: 'network', message }}
            labels={{
              networkDescription: message || 'Growth Review setup could not be loaded.',
              networkTitle: 'Setup unavailable',
            }}
          />
        )}
      </PanelBody>
    </Panel>
  )
}

export function GrowthReviewSetupWorkspace({ apiClient, workspaceId }) {
  const {
    draft,
    isDirty,
    resetDraft,
    resource,
    saveDraft,
    saveState,
    updateDraft,
  } = useGrowthReviewSetupWorkflow({ apiClient, workspaceId })

  if (resource.status === 'error') {
    return <SetupState message={resource.error} status="error" />
  }

  if (resource.status === 'loading' || !draft) {
    return <SetupState status="loading" />
  }

  const options = resource.data.options

  return (
    <div className="grid gap-card">
      <SourceConnectionSection draft={draft} onUpdate={updateDraft} options={options} />
      <CampaignSection draft={draft} onUpdate={updateDraft} />
      <PipelineSection draft={draft} onUpdate={updateDraft} options={options} />
      <FunnelSection draft={draft} onUpdate={updateDraft} options={options} />
      <PreviewSection draft={draft} options={options} />

      <div className="flex items-center justify-end gap-control">
        {saveState ? <span className="text-label text-text-muted">{saveState}</span> : null}
        <Button disabled={!isDirty} onClick={resetDraft} type="button" variant="outline">
          Reset
        </Button>
        <Button disabled={!isDirty} onClick={saveDraft} type="button">
          Save setup
        </Button>
      </div>
    </div>
  )
}
