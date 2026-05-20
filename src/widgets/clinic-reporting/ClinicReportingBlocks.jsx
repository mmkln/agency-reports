import {
  EmptyState,
  PageShell,
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  StatusBadge,
  TableBadge,
  TablePanel,
} from '@/shared/ui'

import { CLINIC_REPORTING_PUBLISH_STATE_META } from '../../entities/clinic-reporting'
import { Icon } from '../../shared/icons'
import {
  formatClinicLabel,
  formatClinicValue,
  formatDateTime,
  formatStatusLabel,
  statusTone,
} from './format'

const toneClass = {
  blue: 'bg-action-muted text-action',
  green: 'bg-success-muted text-success',
  orange: 'bg-warning-muted text-warning-foreground',
  rose: 'bg-destructive-muted text-destructive',
}

export function ClinicReportingState({ page }) {
  if (page.status === 'error') {
    return (
      <PageShell className="py-section" width="content">
        <EmptyState iconName="shieldCheck" title="Access denied" />
      </PageShell>
    )
  }

  if (!page.period) {
    return (
      <PageShell className="py-section" width="content">
        <EmptyState
          description="No published reporting period is available for this layer yet."
          iconName="barChart"
          title={`${page.layerMeta?.label ?? 'Clinic reporting'} is being prepared`}
        />
      </PageShell>
    )
  }

  return null
}

export function ClinicReportingHeader({ children, eyebrow, page, title }) {
  const period = page.period

  return (
    <Panel>
      <PanelBody className="flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-label font-normal text-text-muted">{eyebrow ?? page.layerMeta?.label}</p>
          <h1 className="mt-tag text-heading text-text-primary">{title ?? period.title}</h1>
          <p className="mt-tag text-ui text-text-muted">
            {page.client.name} | {period.period_label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-tag">
          <StatusBadge meta={CLINIC_REPORTING_PUBLISH_STATE_META[period.publish_state]} />
          {children}
        </div>
      </PanelBody>
    </Panel>
  )
}

export function TrustStrip({ sources = [] }) {
  if (!sources.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title="Source Trust" />
      <PanelBody className="grid gap-control md:grid-cols-3">
        {sources.map((source, index) => (
          <div className="rounded-control bg-block-subtle p-control" key={source.name || index}>
            <div className="flex items-start justify-between gap-control">
              <p className="text-label font-normal text-text-muted">{formatStatusLabel(source.source_type)}</p>
              <span className={`rounded-control px-2 py-1 text-label ${toneClass[statusTone(source.freshness_status)]}`}>
                {formatStatusLabel(source.freshness_status)}
              </span>
            </div>
            <p className="mt-tag text-ui font-semibold text-text-primary">{source.name}</p>
            <p className="mt-tag text-label font-normal text-text-muted">
              {formatStatusLabel(source.data_mode)} | {formatStatusLabel(source.confidence)} confidence
            </p>
            <p className="mt-tag text-label font-normal text-text-muted">
              Updated {formatDateTime(source.last_updated_at)}
            </p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function MetricCards({ items = [], title }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-control sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const tone = statusTone(item.status ?? item.severity)

          return (
            <div className="rounded-control bg-block-subtle p-control" key={item.id || `${formatClinicLabel(item)}-${index}`}>
              <div className="flex items-start justify-between gap-control">
                <p className="text-label font-normal text-text-muted">{formatClinicLabel(item)}</p>
                {item.status || item.severity ? (
                  <span className={`rounded-control px-2 py-1 text-label ${toneClass[tone]}`}>
                    {item.status ?? item.severity}
                  </span>
                ) : null}
              </div>
              <p className="mt-control text-heading text-text-primary">{formatClinicValue(item)}</p>
              {item.benchmark || item.threshold ? (
                <p className="mt-tag text-label font-normal text-text-muted">{item.benchmark ?? item.threshold}</p>
              ) : null}
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

export function CompactMetricGrid({ items = [], title }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-item">
        {items.map((item, index) => (
          <div className="flex items-center justify-between gap-control rounded-control bg-block-subtle px-control py-item" key={item.id || `${formatClinicLabel(item)}-${index}`}>
            <div className="min-w-0">
              <p className="truncate text-ui font-medium text-text-primary">{formatClinicLabel(item)}</p>
              {item.benchmark ? <p className="text-label font-normal text-text-muted">{item.benchmark}</p> : null}
            </div>
            <strong className="shrink-0 text-ui text-text-primary">{formatClinicValue(item)}</strong>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function SnapshotGrid({ snapshot, title }) {
  const entries = Object.entries(snapshot ?? {})

  if (!entries.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-control sm:grid-cols-2 xl:grid-cols-4">
        {entries.map(([key, value]) => (
          <div className="rounded-control bg-block-subtle p-control" key={key}>
            <p className="text-label font-normal capitalize text-text-muted">{key.replaceAll('_', ' ')}</p>
            <p className="mt-tag text-heading text-text-primary">{value}</p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function QueuePanel({ aggregateMessage, items = [], title }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-item">
        {items.length ? items.map((item) => (
          <div className="flex items-start justify-between gap-control rounded-control bg-block-subtle p-control" key={item.id}>
            <div className="min-w-0">
              <p className="text-ui font-medium text-text-primary">{item.title}</p>
              <p className="mt-tag text-label font-normal text-text-muted">
                {item.channel ? `${item.channel} | ` : ''}{item.status}{item.age_minutes ? ` | ${item.age_minutes} min` : ''}
              </p>
            </div>
            <TableBadge tone={statusTone(item.priority)}>{item.priority ?? 'normal'}</TableBadge>
          </div>
        )) : (
          <div className="rounded-control bg-block-subtle p-control text-ui text-text-muted">
            {aggregateMessage ?? 'No row-level queue items are visible for this viewer.'}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

export function NarrativeBlock({ narrative, title = 'Narrative' }) {
  if (!narrative?.narrative && !narrative?.wins?.length && !narrative?.losses?.length && !narrative?.next?.length) {
    return null
  }

  const groups = [
    ['Wins', narrative.wins],
    ['Losses', narrative.losses],
    ['Watching', narrative.watching],
    ['Decisions Needed', narrative.decisions_needed],
    ['Next', narrative.next],
  ].filter(([, items]) => items?.length)

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-component">
        {narrative.narrative ? <p className="text-body text-text-secondary">{narrative.narrative}</p> : null}
        {groups.length ? (
          <div className="grid gap-control md:grid-cols-3">
            {groups.map(([groupTitle, items]) => (
              <div className="grid gap-tag rounded-control bg-block-subtle p-control" key={groupTitle}>
                <p className="text-label text-text-muted">{groupTitle}</p>
                {items.map((item) => (
                  <p className="text-ui text-text-secondary" key={item}>{item}</p>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

export function FunnelPanel({ items = [], title = 'Funnel Leakage' }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-control">
        {items.map((item) => (
          <ProgressBar
            key={item.id}
            label={`${item.label}${item.benchmark ? ` - ${item.benchmark}` : ''}`}
            tone={statusTone(item.status)}
            value={Number(item.value) || 0}
          />
        ))}
      </PanelBody>
    </Panel>
  )
}

export function TrendPanel({ items = [], title = 'Trend' }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-control">
        {items.map((trend) => {
          const points = Array.isArray(trend.points) ? trend.points : []
          const max = Math.max(...points, 1)

          return (
            <div className="grid gap-item rounded-control bg-block-subtle p-control" key={trend.id ?? trend.label}>
              <div className="flex items-center justify-between gap-control">
                <p className="text-ui font-medium text-text-primary">{trend.label}</p>
                <p className="text-label text-text-muted">{points.at(-1) ?? 'No data'}</p>
              </div>
              <div className="flex h-20 items-end gap-tag">
                {points.map((point, index) => (
                  <span
                    aria-hidden="true"
                    className="min-h-2 flex-1 rounded-control bg-action"
                    key={`${trend.id}-${index}`}
                    style={{ height: `${Math.max(8, (Number(point) / max) * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

export function ChannelTable({ items = [], title = 'Channel ROI' }) {
  if (!items.length) {
    return null
  }

  return (
    <TablePanel
      columns={[
        { key: 'channel', label: 'Channel' },
        { key: 'leads', label: 'Leads', align: 'right' },
        {
          key: 'cost',
          label: 'Cost',
          align: 'right',
          render: (row) => row.cost_per_new_patient
            ? `$${row.cost_per_new_patient} / new patient`
            : row.cost_per_booking
              ? `$${row.cost_per_booking} / booking`
              : row.cost_per_lead
                ? `$${row.cost_per_lead} / lead`
                : 'Not recorded',
        },
        {
          key: 'outcome',
          label: 'Outcome',
          align: 'right',
          render: (row) => row.new_patients
            ? `${row.new_patients} new patients`
            : row.projected_revenue
              ? `$${row.projected_revenue}`
              : row.roi
                ? `${row.roi}% ROI`
                : 'Recorded',
        },
      ]}
      rows={items}
      title={title}
    />
  )
}

export function SectionTitle({ iconName, title }) {
  return (
    <div className="flex items-center gap-control text-text-primary">
      <Icon name={iconName} size={17} />
      <h2 className="text-ui font-semibold">{title}</h2>
    </div>
  )
}
