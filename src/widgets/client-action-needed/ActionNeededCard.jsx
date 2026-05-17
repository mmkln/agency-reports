import { useState } from 'react'

import {
  Button,
  StatusBadge,
  Textarea,
} from '@/shared/ui'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { Icon } from '../../shared/icons'
import { formatActionDate } from './actionNeededFormatting'

const actionTypeMeta = {
  access_needed: {
    iconName: 'lock',
    label: 'Access',
  },
  approval: {
    iconName: 'checkCircle2',
    label: 'Approval',
  },
  confirmation: {
    iconName: 'messageSquare',
    label: 'Confirmation',
  },
  feedback: {
    iconName: 'messageSquare',
    label: 'Feedback',
  },
  file_needed: {
    iconName: 'fileText',
    label: 'File needed',
  },
  question: {
    iconName: 'helpCircle',
    label: 'Question',
  },
}

function ActionTypeLabel({ action }) {
  const meta = actionTypeMeta[action.actionType] ?? actionTypeMeta.question

  return (
    <span className="inline-flex items-center gap-1 rounded-control bg-control px-2 py-1 text-label text-text-secondary">
      <Icon name={meta.iconName} size={13} />
      {meta.label}
    </span>
  )
}

function ActionResponseForm({ action, onAnswer }) {
  const [isResponding, setIsResponding] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canRespond = action.status === NEEDED_ACTION_STATUSES.PENDING

  function submitResponse(event) {
    event.preventDefault()

    try {
      onAnswer(action, message || 'Completed by client')
      setMessage('')
      setError('')
      setIsResponding(false)
    } catch (caughtError) {
      setError(caughtError.message)
    }
  }

  if (!canRespond) {
    return action.clientResponse ? (
      <div className="mt-4 rounded-control border border-action/20 bg-action-muted px-3 py-2 text-ui text-action">
        <p className="font-semibold">Your response</p>
        <p className="mt-1">{action.clientResponse}</p>
        {action.respondedAt ? <p className="mt-1 text-label">Sent {formatActionDate(action.respondedAt)}</p> : null}
      </div>
    ) : null
  }

  if (!isResponding) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {action.relatedLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">
              Open related link
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
        <Button onClick={() => setIsResponding(true)} size="sm" type="button">
          Respond
        </Button>
      </div>
    )
  }

  return (
    <form className="mt-4 grid gap-3" onSubmit={submitResponse}>
      <Textarea
        onChange={(event) => {
          setMessage(event.target.value)
          setError('')
        }}
        placeholder="Write a short response for the agency..."
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

export function ActionNeededCard({ action, onAnswer }) {
  return (
    <article className="rounded-block border border-control-border bg-block p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ActionTypeLabel action={action} />
            {action.isOverdue ? (
              <span className="rounded-control bg-destructive/10 px-2 py-1 text-label text-destructive">
                Overdue
              </span>
            ) : null}
            {action.isDueSoon ? (
              <span className="rounded-control bg-warning-muted px-2 py-1 text-label text-warning-foreground">
                Due soon
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-heading text-text-primary">{action.title}</h2>
          <p className={`mt-2 text-ui ${action.isOverdue ? 'text-destructive' : 'text-text-muted'}`}>
            Due {formatActionDate(action.dueDate)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <StatusBadge meta={action.priorityMeta} />
          <StatusBadge meta={action.statusMeta} />
        </div>
      </div>

      {action.description ? (
        <p className="mt-4 max-w-readable text-body text-text-secondary">{action.description}</p>
      ) : null}

      <ActionResponseForm action={action} onAnswer={onAnswer} />
    </article>
  )
}
