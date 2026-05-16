import { Icon } from '@/shared/icons'

import { TaskVisibilityBadge } from './TaskVisibilityBadge'

export function TaskMetaRow({
  assigneeName,
  clientName,
  dueLabel,
  projectName,
  visibility,
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-label font-normal text-text-muted">
      {clientName ? <span>{clientName}</span> : null}
      {projectName ? <span>{projectName}</span> : null}
      {dueLabel ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="calendar" size={14} />
          {dueLabel}
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <Icon name="user" size={14} />
        {assigneeName || 'Unassigned'}
      </span>
      <TaskVisibilityBadge visibility={visibility} />
    </div>
  )
}
