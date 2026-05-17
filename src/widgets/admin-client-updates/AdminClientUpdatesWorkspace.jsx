import {
  Badge,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_UPDATE_TYPES } from '../../entities/update'
import { formatDateTime } from './updateFormatters'

const filters = [
  { label: 'Client-visible', value: 'client_visible' },
  { label: 'Internal', value: 'internal' },
  { label: 'Weekly', value: CLIENT_UPDATE_TYPES.WEEKLY_UPDATE },
  { label: 'Milestones', value: CLIENT_UPDATE_TYPES.MILESTONE_UPDATE },
  { label: 'Issues', value: CLIENT_UPDATE_TYPES.ISSUE_UPDATE },
  { label: 'All', value: 'all' },
]

function getFilterCount(counts, value) {
  if (value === 'client_visible') {
    return counts.clientVisible
  }

  return counts[value] ?? 0
}

function UpdateCard({ onEdit, onHide, update }) {
  const isClientVisible = update.visibility === 'client_visible'

  return (
    <article className="rounded-block bg-block p-4 shadow-block">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-ui text-text-primary">{update.title}</h2>
            <StatusBadge meta={update.typeMeta} />
            <Badge className="bg-control text-text-secondary" variant="outline">
              {isClientVisible ? 'Client-visible' : 'Internal'}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-normal text-text-muted">
            <span>Published {formatDateTime(update.publishedAt)}</span>
            {update.projectName ? (
              <>
                <span aria-hidden="true">-</span>
                <span>{update.projectName}</span>
              </>
            ) : null}
          </div>

          {update.body ? (
            <p className="mt-3 max-w-readable text-body text-text-secondary">{update.body}</p>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-label text-text-muted">What changed</p>
              <p className="mt-1 text-ui text-text-secondary">{update.whatChanged || 'No change note.'}</p>
            </div>
            <div>
              <p className="text-label text-text-muted">What next</p>
              <p className="mt-1 text-ui text-text-secondary">{update.whatNext || 'No next step.'}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Button onClick={() => onEdit(update)} size="sm" type="button" variant="outline">
            Edit
          </Button>
          {isClientVisible ? (
            <Button onClick={() => onHide(update)} size="sm" type="button" variant="ghost">
              Hide
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function AdminClientUpdatesWorkspace({
  counts,
  onEdit,
  onFilterChange,
  onHide,
  selectedFilter,
  updates,
}) {
  return (
    <div className="grid grid-cols-1 gap-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-micro">
          {filters.map((filter) => (
            <Button
              aria-pressed={selectedFilter === filter.value}
              className={selectedFilter === filter.value ? 'bg-control-selected text-text-primary' : 'text-text-secondary'}
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
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
          {counts.clientVisible} visible to client
        </Badge>
      </div>

      {updates.length > 0 ? (
        <div className="grid gap-2">
          {updates.map((update) => (
            <UpdateCard
              key={update.id}
              onEdit={onEdit}
              onHide={onHide}
              update={update}
            />
          ))}
        </div>
      ) : (
        <Panel>
          <PanelBody>
            <EmptyState
              description="Curated weekly, milestone, launch, issue, report, approval, and decision updates will appear here."
              iconName="clock"
              title="No curated updates"
            />
          </PanelBody>
        </Panel>
      )}
    </div>
  )
}
