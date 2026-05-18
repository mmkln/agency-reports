import { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  EmptyState,
  FilterTabs,
  LabeledNote,
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
  const items = filters.map((filter) => ({
    count: getFilterCount({
      counts,
      value: filter.value,
    }) ?? 0,
    label: filter.label,
    value: filter.value,
  }))

  return (
    <FilterTabs
      ariaLabel="Request status filters"
      items={items}
      onValueChange={onChange}
      value={activeFilter}
    />
  )
}

function ClientRequestCard({ request }) {
  return (
    <article className="rounded-block bg-block px-card py-component shadow-none">
      <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-item flex flex-wrap items-center gap-item">
            <StatusBadge meta={request.requestTypeMeta} />
          </div>
          <h2 className="text-ui font-semibold text-text-primary">{request.title}</h2>
          {request.description ? (
            <p className="mt-item line-clamp-3 max-w-readable text-ui font-normal text-text-secondary">{request.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-item">
          <StatusBadge meta={request.statusMeta} />
        </div>
      </div>

      {request.agencyResponse ? (
        <LabeledNote className="mt-component" label="Agency response">
          <p>{request.agencyResponse}</p>
        </LabeledNote>
      ) : null}

      <div className="mt-component flex flex-col gap-item sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-label font-normal text-text-muted">
          <span>Submitted {formatDate(request.createdAt)}</span>
          <span>Desired {formatDate(request.desiredDueDate)}</span>
          {request.submittedByName ? <span>By {request.submittedByName}</span> : null}
        </div>
        {request.referenceLink ? (
          <Button asChild className="shrink-0" size="sm" variant="ghost">
            <a href={request.referenceLink} rel="noreferrer" target="_blank">
              Reference
              <Icon name="arrowUpRight" size={13} />
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  )
}

export function ClientRequestsList({ counts, requests }) {
  const [activeFilter, setActiveFilter] = useState('open')
  const filteredRequests = useMemo(
    () => filterRequests(requests, activeFilter),
    [activeFilter, requests],
  )

  return (
    <section className="grid gap-card">
      <div className="flex flex-col gap-component sm:flex-row sm:items-center sm:justify-between">
        <RequestFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />
        <Badge className="w-fit" tone="neutral">{requests.length} request{requests.length === 1 ? '' : 's'}</Badge>
      </div>

      {filteredRequests.length ? (
        <div className="grid gap-card">
          {filteredRequests.map((request) => (
            <ClientRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="bg-block-subtle"
          description="No client-submitted requests match this view."
          iconName="messageSquare"
          title="No requests here"
        />
      )}
    </section>
  )
}
