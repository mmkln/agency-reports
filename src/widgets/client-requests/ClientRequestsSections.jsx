import { useMemo, useState } from 'react'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_REQUEST_STATUSES } from '../../entities/client-request'
import { Icon } from '../../shared/icons'

const filters = [
  { label: 'Open', value: 'open' },
  { label: 'Submitted', value: CLIENT_REQUEST_STATUSES.SUBMITTED },
  { label: 'Under review', value: CLIENT_REQUEST_STATUSES.UNDER_REVIEW },
  { label: 'Waiting on agency', value: CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY },
  { label: 'Waiting on me', value: CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT },
  { label: 'Completed', value: CLIENT_REQUEST_STATUSES.COMPLETED },
  { label: 'All', value: 'all' },
]

function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function filterRequests(requests, activeFilter) {
  if (activeFilter === 'all') {
    return requests
  }

  if (activeFilter === 'open') {
    return requests.filter((request) => ![
      CLIENT_REQUEST_STATUSES.ARCHIVED,
      CLIENT_REQUEST_STATUSES.COMPLETED,
      CLIENT_REQUEST_STATUSES.DECLINED,
    ].includes(request.status))
  }

  return requests.filter((request) => request.status === activeFilter)
}

function getFilterCount({ counts, value }) {
  return {
    all: counts.all,
    completed: counts.completed,
    open: counts.open,
    submitted: counts.submitted,
    under_review: counts.underReview,
    waiting_on_agency: counts.waitingOnAgency,
    waiting_on_client: counts.waitingOnClient,
  }[value]
}

function RequestFilters({ activeFilter, counts, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max items-center gap-tag">
        {filters.map((filter) => {
          const selected = activeFilter === filter.value
          const count = getFilterCount({
            counts,
            value: filter.value,
          })

          return (
            <Button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              size="sm"
              type="button"
              variant={selected ? 'primary' : 'ghost'}
            >
              {filter.label}
              <span className="ml-1 text-label font-normal opacity-75">{count ?? 0}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function ClientRequestCard({ request }) {
  return (
    <article className="rounded-block border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={request.requestTypeMeta} />
            <StatusBadge meta={request.statusMeta} />
          </div>
          <h2 className="mt-3 text-ui text-text-primary">{request.title}</h2>
          {request.description ? (
            <p className="mt-2 line-clamp-3 text-body text-text-secondary">{request.description}</p>
          ) : null}
        </div>
        {request.referenceLink ? (
          <Button asChild className="shrink-0" size="sm" variant="outline">
            <a href={request.referenceLink} rel="noreferrer" target="_blank">
              Reference
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
      </div>

      {request.agencyResponse ? (
        <div className="mt-4 rounded-control bg-action-muted px-3 py-2 text-ui text-action">
          <p className="font-medium">Agency response</p>
          <p className="mt-1">{request.agencyResponse}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-label font-normal text-text-muted">
        <span>Submitted {formatDate(request.createdAt)}</span>
        <span>Desired {formatDate(request.desiredDueDate)}</span>
        {request.submittedByName ? <span>By {request.submittedByName}</span> : null}
      </div>
    </article>
  )
}

export function ClientRequestsSummary({ counts, onCreate }) {
  return (
    <Panel>
      <PanelBody className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="text-label text-text-muted">Requests</p>
          <h2 className="mt-2 text-heading text-text-primary">{counts.open} open request{counts.open === 1 ? '' : 's'}</h2>
          <p className="mt-2 max-w-readable text-body text-text-secondary">
            Client-initiated work requests, questions, changes, and support items for agency review.
          </p>
        </div>
        <Button onClick={onCreate} type="button">
          New request
        </Button>
      </PanelBody>
    </Panel>
  )
}

export function ClientRequestsList({ counts, requests }) {
  const [activeFilter, setActiveFilter] = useState('open')
  const filteredRequests = useMemo(
    () => filterRequests(requests, activeFilter),
    [activeFilter, requests],
  )

  return (
    <Panel>
      <PanelHeader
        subtitle="Requests you submitted to the agency. Agency action items for you live under Action Needed."
        title="Request History"
      />
      <PanelBody className="grid gap-4">
        <RequestFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        {filteredRequests.length ? (
          <div className="grid gap-3">
            {filteredRequests.map((request) => (
              <ClientRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="No client-submitted requests match this view."
            iconName="messageSquare"
            title="No requests here"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
