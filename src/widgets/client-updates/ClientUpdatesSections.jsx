import { useMemo, useState } from 'react'

import {
  Badge,
  EmptyState,
  FilterTabs,
  StatusBadge,
  Timeline,
  TimelineItem,
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

function RelatedLinks({ update }) {
  const relatedItems = getRelatedItems(update)

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

function getRelatedItems(update) {
  return [
    update.projectName ? update.projectName : null,
    update.relatedReportTitle ? update.relatedReportTitle : null,
    update.relatedFileLinkTitle ? update.relatedFileLinkTitle : null,
  ].filter(Boolean)
}

function hasUpdateMetadata(update) {
  return Boolean(update.whatNext || getRelatedItems(update).length)
}

function UpdateMetadata({ update }) {
  return (
    <div className="grid gap-item">
      {update.whatNext ? (
        <p className="text-label font-normal text-text-muted">
          Next: <span className="text-text-secondary">{update.whatNext}</span>
        </p>
      ) : null}

      <RelatedLinks update={update} />
    </div>
  )
}

function UpdateNotice({ update }) {
  if (!update.clientActionNeeded) {
    return null
  }

  return (
    <div className="rounded-control bg-warning-muted px-3 py-2 text-label font-normal text-warning-foreground">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 shrink-0" name="bell" size={14} />
        <p>{update.clientActionNeeded}</p>
      </div>
    </div>
  )
}

export function UpdatesTimeline({ counts, updates }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const hasUpdates = updates.length > 0
  const filterItems = useMemo(() => filters.map((filter) => ({
    count: getFilterCount({
      counts,
      value: filter.value,
    }) ?? 0,
    label: filter.label,
    value: filter.value,
  })), [counts])
  const filteredUpdates = useMemo(() => (
    activeFilter === 'all'
      ? updates
      : updates.filter((update) => update.type === activeFilter)
  ), [activeFilter, updates])

  return (
    <section className="grid gap-card">
      <div className="flex flex-col gap-component sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <FilterTabs
            ariaLabel="Update type filters"
            items={filterItems}
            onValueChange={setActiveFilter}
            value={activeFilter}
          />
        </div>
        <Badge className="w-fit" tone="neutral">{updates.length} update{updates.length === 1 ? '' : 's'}</Badge>
      </div>

      {filteredUpdates.length ? (
        <Timeline ariaLabel="Published updates">
          {filteredUpdates.map((update) => (
            <TimelineItem
              badge={<StatusBadge meta={update.typeMeta} />}
              date={formatDate(update.publishedAt)}
              description={update.body || update.whatChanged || 'No details published yet.'}
              iconName={update.typeMeta.icon}
              iconTone={update.typeMeta.tone}
              key={update.id}
              links={hasUpdateMetadata(update) ? <UpdateMetadata update={update} /> : null}
              notice={update.clientActionNeeded ? <UpdateNotice update={update} /> : null}
              title={update.title}
              titleAs="h2"
            />
          ))}
        </Timeline>
      ) : (
        <EmptyState
          className="bg-block-subtle"
          description={hasUpdates
            ? 'No published client updates match this view.'
            : 'Published client updates will appear here when the agency shares them.'}
          iconName="target"
          title={hasUpdates ? 'No updates here' : 'No updates yet'}
        />
      )}
    </section>
  )
}
