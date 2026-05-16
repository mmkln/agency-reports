import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button, StatusBadge, Textarea } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { SectionCard } from './_shared'
import { formatDate } from './formatters'

function NeededActionResponse({ action, onAnswerAction }) {
  const [isResponding, setIsResponding] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canRespond = Boolean(onAnswerAction) && action.status === 'pending'

  if (!canRespond) {
    return (
      <>
        {action.relatedLink ? (
          <div className="mt-4">
            <Button asChild size="sm" variant="outline">
              <a href={action.relatedLink} rel="noreferrer" target="_blank">Open related link</a>
            </Button>
          </div>
        ) : null}
        {action.clientResponse ? (
          <div className="mt-3 rounded-control border border-action/20 bg-action-muted px-3 py-2 text-ui text-action">
            <span className="font-semibold">Your response:</span> {action.clientResponse}
            {action.respondedAt ? (
              <span className="mt-1 block text-label font-normal text-action">Sent {formatDate(action.respondedAt)}</span>
            ) : null}
          </div>
        ) : null}
        {action.status === 'resolved' ? (
          <div className="mt-3 rounded-control border border-success/20 bg-success-muted px-3 py-2 text-ui text-success-foreground">
            This request has been resolved by the agency.
          </div>
        ) : null}
      </>
    )
  }

  if (!isResponding) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {action.relatedLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">Open related link</a>
          </Button>
        ) : null}
        <Button onClick={() => setIsResponding(true)} size="sm" type="button">
          Mark as answered
        </Button>
      </div>
    )
  }

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()

        try {
          onAnswerAction(action.id, message || 'Completed by client')
          setIsResponding(false)
          setMessage('')
          setError('')
        } catch (caughtError) {
          setError(caughtError.message)
        }
      }}
    >
      <Textarea
        onChange={(event) => {
          setMessage(event.target.value)
          setError('')
        }}
        placeholder="Add a short note for the agency..."
        value={message}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={() => setIsResponding(false)} size="sm" type="button" variant="outline">
          Cancel
        </Button>
        <Button size="sm" type="submit">
          Send response
        </Button>
      </div>
      {error ? <p className="text-ui text-destructive">{error}</p> : null}
    </form>
  )
}

function NeededActionTimeline({ action }) {
  if (!action.responseHistory?.length) {
    return null
  }

  return (
    <div className="mt-4 border-t border-separator pt-3">
      <p className="text-label text-text-quaternary uppercase">Activity</p>
      <ol className="mt-2 grid gap-2 text-label font-normal text-text-muted">
        {action.responseHistory.map((event, index) => (
          <li className="flex items-start gap-2" key={`${event.type}-${event.created_at}-${index}`}>
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-quaternary" />
            <span>
              <span className="font-medium text-text-secondary">{event.type.replaceAll('_', ' ')}</span>
              {event.created_at ? ` - ${formatDate(event.created_at)}` : ''}
              {event.metadata?.note ? <span className="block">{event.metadata.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function NeededFromClientBlock({ actions, onAnswerAction, requestsHref = '/client/requests' }) {
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
            View requests
            <Icon name="arrowUpRight" size={13} />
          </Link>
        </Button>
      )}
      title="Action needed from you"
    >
      {actions.map((action) => (
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
          <NeededActionResponse action={action} onAnswerAction={onAnswerAction} />
          <NeededActionTimeline action={action} />
        </article>
      ))}
    </SectionCard>
  )
}
