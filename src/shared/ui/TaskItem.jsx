import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../icons'
import { Badge } from './Badge'
import { useInspectorId } from './inspectorId'

export function TaskItem({ completed = false, id, meta, priority, title }) {
  const inspectorId = useInspectorId('TaskItem', id)
  const priorityTone = {
    HIGH: 'rose',
    LOW: 'neutral',
    MEDIUM: 'amber',
  }[priority] ?? 'neutral'
  const stateClass = completed ? 'bg-success-muted/40' : 'bg-block'
  const indicatorClass = completed
    ? 'border-success bg-success after:mt-[-2px] after:h-1.5 after:w-3 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:content-[""]'
    : 'border-control-border bg-control'

  return (
    <Card as="article" id={inspectorId} className={`transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover ${stateClass}`}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${indicatorClass}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className={`m-0 text-base font-medium text-text-primary ${completed ? 'text-text-muted line-through decoration-text-muted' : ''}`}>
              {title}
            </h3>
            {meta ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <Icon name="clock" size={14} />
                {meta}
              </p>
            ) : null}
          </div>
        </div>
        {priority ? <Badge tone={priorityTone}>{priority}</Badge> : null}
      </CardContent>
    </Card>
  )
}
