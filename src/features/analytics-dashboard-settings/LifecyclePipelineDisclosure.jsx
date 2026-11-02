import { useMemo, useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui'

import { LifecycleStageRow } from './LifecycleStageRow'

export function LifecyclePipelineDisclosure({
  onChange,
  pipeline,
  showUnmappedOnly,
  stageAssignments,
}) {
  const unmappedCount = pipeline.stages.filter(
    (stage) => !stageAssignments[stage.id],
  ).length
  const [isOpen, setIsOpen] = useState(unmappedCount > 0)
  const visibleStages = useMemo(
    () => pipeline.stages.filter(
      (stage) => !showUnmappedOnly || !stageAssignments[stage.id],
    ),
    [pipeline.stages, showUnmappedOnly, stageAssignments],
  )

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger asChild>
        <Button
          className="h-auto w-full justify-between rounded-none px-0 py-item text-left"
          type="button"
          variant="ghost"
        >
          <span className="min-w-0 truncate text-ui font-medium text-text-primary">
            {pipeline.label}
          </span>
          <span className="flex shrink-0 items-center gap-item text-label font-normal text-text-muted">
            {pipeline.stages.length - unmappedCount} of {pipeline.stages.length} mapped
            <Icon
              className={`transition-transform duration-motion-fast ${isOpen ? 'rotate-180' : ''}`}
              name="chevronDown"
              size={16}
            />
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y divide-separator pl-component">
          {visibleStages.map((stage) => (
            <LifecycleStageRow
              assignment={stageAssignments[stage.id]}
              key={stage.id}
              onChange={onChange}
              stage={stage}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
