import { useMemo, useState } from 'react'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
  Textarea,
} from '@/shared/ui'

import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  answerNeededAction,
  listClientNeededActions,
} from '../../../domain/services/neededFromClientService'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import { Icon } from '../../../shared/icons'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

const filters = [
  { label: 'Open', value: 'open' },
  { label: 'Answered', value: NEEDED_ACTION_STATUSES.ANSWERED },
  { label: 'Resolved', value: NEEDED_ACTION_STATUSES.RESOLVED },
  { label: 'All', value: 'all' },
]

function formatDate(date) {
  if (!date) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function filterActions(actions, activeFilter) {
  if (activeFilter === 'all') {
    return actions
  }

  if (activeFilter === 'open') {
    return actions.filter((action) => action.status === NEEDED_ACTION_STATUSES.PENDING)
  }

  return actions.filter((action) => action.status === activeFilter)
}

function ClientRequestCard({ action, onAnswer }) {
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

  return (
    <article className="rounded-block border border-control-border bg-block p-5 shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-ui text-text-primary">{action.title}</h2>
            <StatusBadge meta={action.priorityMeta} />
            <StatusBadge meta={action.statusMeta} />
          </div>
          <p className="mt-2 text-ui text-text-muted">Due {formatDate(action.dueDate)}</p>
        </div>
        {action.relatedLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={action.relatedLink} rel="noreferrer" target="_blank">
              Open link
              <Icon name="arrowUpRight" size={14} />
            </a>
          </Button>
        ) : null}
      </div>

      {action.description ? (
        <p className="mt-4 max-w-readable text-body text-text-secondary">{action.description}</p>
      ) : null}

      {action.clientResponse ? (
        <div className="mt-4 rounded-control border border-action/20 bg-action-muted px-3 py-2 text-ui text-action">
          <p className="font-semibold">Your response</p>
          <p className="mt-1 text-ui">{action.clientResponse}</p>
          {action.respondedAt ? <p className="mt-1 text-label">Sent {formatDate(action.respondedAt)}</p> : null}
        </div>
      ) : null}

      {canRespond && !isResponding ? (
        <Button className="mt-4" onClick={() => setIsResponding(true)} size="sm" type="button">
          Respond
        </Button>
      ) : null}

      {canRespond && isResponding ? (
        <form className="mt-4 grid gap-3" onSubmit={submitResponse}>
          <Textarea
            onChange={(event) => {
              setMessage(event.target.value)
              setError('')
            }}
            placeholder="Write a short response for the agency..."
            value={message}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsResponding(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Send response</Button>
          </div>
          {error ? <p className="text-ui text-destructive">{error}</p> : null}
        </form>
      ) : null}
    </article>
  )
}

export function ClientRequestsPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const [activeFilter, setActiveFilter] = useState('open')
  const requestsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-requests:${clientId}`,
    initialData: {
      actions: [],
      client: null,
    },
    load: () => runtime.dataClient.read((repositories) => listClientNeededActions({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const data = requestsResource.data
  const filteredActions = useMemo(
    () => filterActions(data.actions ?? [], activeFilter),
    [activeFilter, data.actions],
  )

  function reloadRequests() {
    void requestsResource.reload()
  }

  function answerRequest(action, message) {
    void runtime.dataClient.write((repositories) => answerNeededAction({
      actionId: action.id,
      message,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        reloadRequests()
        toast.success('Response sent', `${action.title} was marked answered.`)
      })
      .catch((caughtError) => {
        toast.error('Response was not sent', caughtError.message)
      })
  }

  if (requestsResource.status === 'error' || data.status === 'error') {
    return <AccessDeniedState />
  }

  if (requestsResource.status === 'loading') {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  return (
    <div className="grid gap-card">
      <Panel>
        <PanelHeader
          subtitle="Review what the agency needs from you and respond to pending requests."
          title="Client Requests"
        />
        <PanelBody className="grid gap-4">
          <div className="inline-flex w-fit rounded-full bg-control p-micro">
            {filters.map((filter) => (
              <button
                className={`h-control-small rounded-full px-control text-label transition-colors ${
                  activeFilter === filter.value
                    ? 'bg-control-selected text-text-primary'
                    : 'text-text-secondary hover:bg-control-hover hover:text-text-primary'
                }`}
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredActions.length ? (
            <div className="grid gap-3">
              {filteredActions.map((action) => (
                <ClientRequestCard action={action} key={action.id} onAnswer={answerRequest} />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No actions need your response in this view."
              iconName="checkCircle2"
              title="No actions needed from you right now"
            />
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
