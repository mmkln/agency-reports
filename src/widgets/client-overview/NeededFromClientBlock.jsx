import { Link } from 'react-router-dom'

import { Button, StatusBadge } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { SectionCard } from './_shared'
import { formatDate } from './formatters'

export function NeededFromClientBlock({ actions, requestsHref = '/client/action-needed' }) {
  if (actions.length === 0) {
    return null
  }

  return (
    <SectionCard
      contentClassName="grid gap-3"
      description="These items are blocking or slowing current work."
      iconName="bell"
      action={(
        <Button asChild size="sm" variant="ghost">
          <Link to={requestsHref}>
            View all actions
            <Icon name="arrowUpRight" size={13} />
          </Link>
        </Button>
      )}
      title="Action needed from you"
    >
      {actions.slice(0, 3).map((action) => (
        <article className="rounded-control border border-control-border bg-block-subtle p-4" key={action.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary">{action.title}</h3>
              <p className={`mt-1 text-ui ${action.isOverdue ? 'text-destructive' : 'text-text-muted'}`}>
                Due: {formatDate(action.dueDate) || 'No due date'}{action.isOverdue ? ' - Overdue' : ''}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <StatusBadge meta={action.priorityMeta} />
              <StatusBadge meta={action.statusMeta} />
            </div>
          </div>
          {action.description ? <p className="mt-3 text-body text-text-secondary">{action.description}</p> : null}
          {action.relatedLink ? (
            <Button asChild className="mt-4" size="sm" variant="outline">
              <a href={action.relatedLink} rel="noreferrer" target="_blank">Open related link</a>
            </Button>
          ) : null}
        </article>
      ))}
    </SectionCard>
  )
}
