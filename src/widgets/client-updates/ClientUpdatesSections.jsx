import { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  EmptyState,
  ListPanel,
  ListRow,
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
              aria-pressed={selected}
              key={filter.value}
              onClick={() => onChange(filter.value)}
              size="sm"
              type="button"
              variant={selected ? 'secondary' : 'ghost'}
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
    <div className="flex flex-wrap gap-2 text-label font-normal text-text-muted">
      {relatedItems.map((item) => (
        <span className="rounded-control bg-control px-2 py-1" key={item}>{item}</span>
      ))}
    </div>
  )
}

function UpdateMetadata({ update }) {
  return (
    <div className="grid gap-item">
      {update.whatNext ? (
        <p className="text-label font-normal text-text-muted">
          Next: <span className="text-text-secondary">{update.whatNext}</span>
        </p>
      ) : null}

      {update.clientActionNeeded ? (
        <div className="rounded-control bg-warning-muted px-3 py-2 text-label font-normal text-warning-foreground">
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 shrink-0" name="bell" size={14} />
            <p>{update.clientActionNeeded}</p>
          </div>
        </div>
      ) : null}

      <RelatedLinks update={update} />
    </div>
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
        action={<Badge tone="neutral">{updates.length} update{updates.length === 1 ? '' : 's'}</Badge>}
        divided
        title="Update History"
      />
      <PanelBody className="p-0">
        <div className="px-card py-component">
          <UpdateFilters
            activeFilter={activeFilter}
            counts={counts}
            onChange={setActiveFilter}
          />
        </div>

        {filteredUpdates.length ? (
          <ListPanel className="border-t border-separator">
            {filteredUpdates.map((update) => (
              <ListRow
                description={update.body || update.whatChanged || 'No details published yet.'}
                key={update.id}
                leading={<StatusBadge meta={update.typeMeta} />}
                metadata={<UpdateMetadata update={update} />}
                title={update.title}
                titleAs="h2"
                trailing={<span className="text-label font-normal text-text-muted">{formatDate(update.publishedAt)}</span>}
              />
            ))}
          </ListPanel>
        ) : (
          <EmptyState
            className="m-card"
            description="No published client updates match this view."
            iconName="target"
            title="No updates here"
          />
        )}
      </PanelBody>
    </Panel>
  )
}
