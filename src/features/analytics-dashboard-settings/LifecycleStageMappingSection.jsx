import { LifecycleStageRow } from './LifecycleStageRow'

export function LifecycleStageMappingSection({
  onChange,
  selectedPipelines,
  stageAssignments,
  unmappedStageCount,
}) {
  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Lifecycle mapping</h3>
        <p className="mt-micro text-label text-text-muted">
          Assign each selected pipeline stage to one reporting status.
        </p>
      </div>
      {unmappedStageCount ? (
        <p className="text-label text-warning">
          {unmappedStageCount} {unmappedStageCount === 1 ? 'stage is' : 'stages are'} not mapped.
        </p>
      ) : null}
      {selectedPipelines.map((pipeline) => (
        <div className="divide-y divide-separator" key={pipeline.id}>
          <p className="pb-tag text-label font-medium text-text-secondary">{pipeline.label}</p>
          {pipeline.stages.map((stage) => (
            <LifecycleStageRow
              assignment={stageAssignments[stage.id]}
              key={stage.id}
              onChange={onChange}
              stage={stage}
            />
          ))}
        </div>
      ))}
      {!selectedPipelines.length ? (
        <p className="text-label text-text-muted">Choose a lead pipeline to map its stages.</p>
      ) : null}
    </section>
  )
}
