import { useMemo, useState } from 'react'

import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

import { CLIENT_UPDATE_TYPES } from '../../entities/update'
import { Icon } from '../../shared/icons'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Weekly', value: CLIENT_UPDATE_TYPES.WEEKLY_UPDATE },
  { label: 'Milestones', value: CLIENT_UPDATE_TYPES.MILESTONE_UPDATE },
  { label: 'Launches', value: CLIENT_UPDATE_TYPES.LAUNCH_UPDATE },
  { label: 'Issues', value: CLIENT_UPDATE_TYPES.ISSUE_UPDATE },
  { label: 'Reports', value: CLIENT_UPDATE_TYPES.REPORT_PUBLISHED },
  { label: 'Approvals', value: CLIENT_UPDATE_TYPES.APPROVAL_COMPLETED },
  { label: 'Decisions', value: CLIENT_UPDATE_TYPES.DECISION_RECORDED },
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

function getFilterCount({ counts, value }) {
  return value === 'all' ? counts.all : counts[value]
}

function UpdateFilters({ activeFilter, counts, onChange }) {
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

function RelatedLinks({ update }) {
  const relatedItems = [
    update.projectName ? update.projectName : null,
    update.relatedReportTitle ? update.relatedReportTitle : null,
    update.relatedFileLinkTitle ? update.relatedFileLinkTitle : null,
  ].filter(Boolean)

  if (!relatedItems.length) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 text-label font-normal text-text-muted">
      {relatedItems.map((item) => (
        <span className="rounded-control bg-control px-2 py-1" key={item}>{item}</span>
      ))}
    </div>
  )
}

function UpdateCard({ update }) {
  return (
    <article className="rounded-block border border-control-border bg-block-subtle p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={update.typeMeta} />
            <span className="text-label font-normal text-text-muted">{formatDate(update.publishedAt)}</span>
          </div>
          <h2 className="mt-3 text-heading text-text-primary">{update.title}</h2>
          {update.body ? <p className="mt-2 max-w-readable text-body text-text-secondary">{update.body}</p> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-label text-text-muted">What changed</p>
          <p className="mt-1 text-body text-text-secondary">{update.whatChanged || 'No details published yet.'}</p>
        </div>
        <div>
          <p className="text-label text-text-muted">What happens next</p>
          <p className="mt-1 text-body text-text-secondary">{update.whatNext || 'Next step pending.'}</p>
        </div>
      </div>

      {update.clientActionNeeded ? (
        <div className="mt-5 rounded-control bg-warning-muted px-3 py-2 text-ui text-warning-foreground">
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 shrink-0" name="bell" size={15} />
            <p>{update.clientActionNeeded}</p>
          </div>
        </div>
      ) : null}

      <RelatedLinks update={update} />
    </article>
  )
}

export function UpdatesSummary({ latestUpdate, updateCount }) {
  return (
    <Panel>
      <PanelBody className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="text-label text-text-muted">Updates</p>
          <h2 className="mt-2 text-heading text-text-primary">
            {latestUpdate ? latestUpdate.title : 'No client-facing updates yet'}
          </h2>
          <p className="mt-2 max-w-readable text-body text-text-secondary">
            Curated account history: what changed, what happens next, and what the client needs to know.
          </p>
        </div>
        <div className="rounded-control bg-control px-3 py-2 text-label text-text-secondary">
          {updateCount} update{updateCount === 1 ? '' : 's'}
        </div>
      </PanelBody>
    </Panel>
  )
}

export function UpdatesTimeline({ counts, updates }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredUpdates = useMemo(() => (
    activeFilter === 'all'
      ? updates
      : updates.filter((update) => update.type === activeFilter)
  ), [activeFilter, updates])

  return (
    <Panel>
      <PanelHeader
        subtitle="Curated published updates only. Internal activity and operational notes stay hidden."
        title="Update History"
      />
      <PanelBody className="grid gap-4">
        <UpdateFilters
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        {filteredUpdates.length ? (
          <div className="grid gap-3">
            {filteredUpdates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="No published client updates match this view."
            iconName="target"
            title="No updates here"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
