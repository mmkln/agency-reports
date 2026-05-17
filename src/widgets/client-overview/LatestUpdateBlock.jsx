import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { EmptyState, SectionCard } from './_shared'
import { formatDate } from './formatters'

export function LatestUpdateBlock({ clientId, focusItems, update }) {
  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="outline">
          <Link to={`/client/updates?clientId=${clientId}`}>
            View updates
          </Link>
        </Button>
      )}
      iconName="target"
      title="Latest updates and focus"
    >
      {update ? (
        <article className="rounded-control border border-control-border bg-block-subtle p-4">
          <p className="text-ui text-text-secondary">{update.title}</p>
          <p className="mt-2 text-body text-text-secondary">{update.body}</p>
          <p className="mt-3 text-label text-text-quaternary">Updated {formatDate(update.updatedAt)}</p>
        </article>
      ) : (
        <EmptyState>No client-facing update has been published yet.</EmptyState>
      )}

      <div className="mt-5">
        <p className="text-label text-text-muted uppercase">Current team focus</p>
        {focusItems.length > 0 ? (
          <ul className="mt-3 grid gap-3">
            {focusItems.map((item) => (
              <li className="flex gap-3 text-ui text-text-secondary" key={item}>
                <Icon className="mt-0.5 text-action" name="arrowRight" size={16} />
                <span className="text-body">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState>No current focus has been published yet.</EmptyState>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
