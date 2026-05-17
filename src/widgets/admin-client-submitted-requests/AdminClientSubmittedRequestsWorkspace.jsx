import {
  Badge,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '@/shared/icons'

import { formatDate, formatDateTime } from './requestFormatters'

const filters = [
  { label: 'Open', value: 'open' },
  { label: 'Needs review', value: 'needs_review' },
  { label: 'Waiting on agency', value: 'waiting_on_agency' },
  { label: 'Waiting on client', value: 'waiting_on_client' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' },
]

function getFilterCount(counts, value) {
  if (value === 'needs_review') {
    return counts.needsReview
  }

  if (value === 'waiting_on_agency') {
    return counts.waitingOnAgency
  }

  if (value === 'waiting_on_client') {
    return counts.waitingOnClient
  }

  return counts[value] ?? 0
}

function RequestCard({ onOpenTriage, request }) {
  return (
    <article className="rounded-block bg-block p-4 shadow-block">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-ui text-text-primary">{request.title}</h2>
            <StatusBadge meta={request.statusMeta} />
            <StatusBadge meta={request.requestTypeMeta} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-normal text-text-muted">
            <span>{request.clientName}</span>
            <span aria-hidden="true">-</span>
            <span>Submitted by {request.submittedByName || 'Client'}</span>
            <span aria-hidden="true">-</span>
            <span>Updated {formatDateTime(request.updatedAt)}</span>
            {request.desiredDueDate ? (
              <>
                <span aria-hidden="true">-</span>
                <span>Desired {formatDate(request.desiredDueDate)}</span>
              </>
            ) : null}
          </div>

          <p className="mt-3 max-w-readable text-body text-text-secondary">
            {request.description || 'No request details provided.'}
          </p>

          {request.agencyResponse ? (
            <div className="mt-3 rounded-control bg-control px-3 py-2 text-ui text-text-secondary">
              <p className="text-label text-text-muted">Agency response</p>
              <p className="mt-1">{request.agencyResponse}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {request.referenceLink ? (
            <Button asChild size="sm" type="button" variant="outline">
              <a href={request.referenceLink} rel="noreferrer" target="_blank">
                <Icon name="arrowUpRight" size={14} />
                Reference
              </a>
            </Button>
          ) : null}
          <Button onClick={() => onOpenTriage(request)} size="sm" type="button">
            Review
          </Button>
        </div>
      </div>
    </article>
  )
}

export function AdminClientSubmittedRequestsWorkspace({
  counts,
  filteredRequests,
  onOpenTriage,
  onStatusFilterChange,
  statusFilter,
}) {
  return (
    <div className="grid grid-cols-1 gap-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-micro">
          {filters.map((filter) => (
            <Button
              aria-pressed={statusFilter === filter.value}
              className={statusFilter === filter.value ? 'bg-control-selected text-text-primary' : 'text-text-secondary'}
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {filter.label}
              <span className="ml-1 text-text-muted">{getFilterCount(counts, filter.value)}</span>
            </Button>
          ))}
        </div>
        <Badge className="w-fit bg-control text-text-secondary" variant="outline">
          {counts.needsReview} need review
        </Badge>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              onOpenTriage={onOpenTriage}
              request={request}
            />
          ))}
        </div>
      ) : (
        <Panel>
          <PanelBody>
            <EmptyState
              description="Client-submitted requests will appear here after a client creates them from the portal."
              iconName="messageSquare"
              title="No client requests"
            />
          </PanelBody>
        </Panel>
      )}
    </div>
  )
}
