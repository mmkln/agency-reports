import { useMemo, useState } from 'react'

import { Switch } from '@/shared/ui'

import { LifecyclePipelineDisclosure } from './LifecyclePipelineDisclosure'

export function LifecycleStageMappingSection({
  onChange,
  selectedPipelines,
  stageAssignments,
  unmappedStageCount,
}) {
  const [showUnmappedOnly, setShowUnmappedOnly] = useState(false)
  const visiblePipelines = useMemo(
    () => selectedPipelines.filter((pipeline) => (
      !showUnmappedOnly
      || pipeline.stages.some((stage) => !stageAssignments[stage.id])
    )),
    [selectedPipelines, showUnmappedOnly, stageAssignments],
  )

  return (
    <section className="grid gap-component">
      <div className="flex flex-col gap-item sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-ui font-semibold text-text-primary">Lifecycle mapping</h3>
          <p className="mt-micro text-label text-text-muted">
            Assign each selected pipeline stage to one reporting status.
          </p>
          {unmappedStageCount ? (
            <p className="mt-tag text-label text-warning">
              {unmappedStageCount} {unmappedStageCount === 1 ? 'stage is' : 'stages are'} not mapped.
            </p>
          ) : null}
        </div>
        <label className="flex min-h-target shrink-0 items-center gap-item text-label text-text-secondary">
          <span>Unmapped only</span>
          <Switch
            aria-label="Show unmapped lifecycle stages only"
            checked={showUnmappedOnly}
            onCheckedChange={setShowUnmappedOnly}
          />
        </label>
      </div>
      <div className="divide-y divide-separator">
        {visiblePipelines.map((pipeline) => (
          <LifecyclePipelineDisclosure
            key={pipeline.id}
            onChange={onChange}
            pipeline={pipeline}
            showUnmappedOnly={showUnmappedOnly}
            stageAssignments={stageAssignments}
          />
        ))}
      </div>
      {!selectedPipelines.length ? (
        <p className="text-label text-text-muted">Choose a lead pipeline to map its stages.</p>
      ) : null}
      {selectedPipelines.length && showUnmappedOnly && !visiblePipelines.length ? (
        <p className="text-label text-text-muted">All selected pipeline stages are mapped.</p>
      ) : null}
    </section>
  )
}
