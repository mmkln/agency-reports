import {
  Badge,
  Button,
  EmptyState,
  NativeSelect,
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  TableBadge,
  TablePanel,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import {
  formatDate,
  formatLabel,
  formatMetricValue,
  statusClass,
} from './format'

export function DentalGrowthReviewState({ page }) {
  if (page.status === 'error') {
    return (
      <Panel>
        <PanelBody>
          <EmptyState iconName="shieldCheck" title="Access denied" />
        </PanelBody>
      </Panel>
    )
  }

  if (!page.period) {
    return (
      <Panel>
        <PanelBody>
          <EmptyState
            description="No published dental growth review period is available yet."
            iconName="barChart"
            title="Dental Growth Review is being prepared"
          />
        </PanelBody>
      </Panel>
    )
  }

  return null
}

export function ReviewHeader({ onPeriodChange, page, selectedPeriodOptionKey }) {
  const period = page.period
  const context = period.content.period_context
  const heroMetric = period.content.hero_metrics[0]

  return (
    <Panel>
      <PanelBody className="grid gap-component xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0">
          <p className="text-label font-normal text-text-muted">Dental growth operating review | {page.preset} preset</p>
          <div className="mt-tag flex flex-wrap items-center gap-tag">
            <h1 className="text-heading text-text-primary">{period.title}</h1>
            {page.source === 'draft' ? <Badge tone="amber">Draft preview</Badge> : null}
          </div>
          <p className="mt-tag text-ui text-text-muted">
            {page.client.name} | {period.label}
          </p>
          <div className="mt-component grid gap-control lg:grid-cols-[1fr_220px]">
            <div>
              <p className="text-label text-text-muted">This period</p>
              <p className="mt-tag max-w-readable text-body text-text-primary">{context.auto_summary}</p>
            </div>
            {heroMetric ? (
              <div className="rounded-control bg-block-subtle p-control">
                <p className="text-label text-text-muted">{heroMetric.title}</p>
                <p className="mt-tag text-heading text-text-primary">{formatMetricValue(heroMetric)}</p>
                <p className="mt-tag text-label font-normal text-text-muted">
                  {heroMetric.delta_absolute}{heroMetric.delta_percent ? ` / ${heroMetric.delta_percent}` : ''} vs prior
                </p>
              </div>
            ) : null}
          </div>
          <div className={`mt-component rounded-control px-control py-item text-ui font-medium ${statusClass(context.top_alert_status)}`}>
            {context.top_alert_message}
          </div>
        </div>
        <div className="grid gap-control">
          <label className="grid gap-tag text-label text-text-muted">
            Review period
            <NativeSelect onChange={(event) => onPeriodChange(event.target.value)} value={selectedPeriodOptionKey}>
              {page.reviewPeriodOptions.map((option) => (
                <option disabled={option.disabled} key={option.key} value={option.key}>
                  {option.label} - {option.periodLabel}
                </option>
              ))}
            </NativeSelect>
          </label>
          <div className="grid gap-control sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-control bg-block-subtle p-control">
              <p className="text-label text-text-muted">Cadence</p>
              <p className="mt-tag text-ui font-semibold text-text-primary">{context.cadence_label}</p>
            </div>
            <div className="rounded-control bg-block-subtle p-control">
              <p className="text-label text-text-muted">Data trust</p>
              <p className="mt-tag text-ui text-text-primary">{context.freshness_summary}</p>
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function MetricCard({ metric }) {
  return (
    <div className="grid min-h-52 gap-item rounded-control bg-block-subtle p-control">
      <div className="flex items-start justify-between gap-control">
        <p className="text-label font-normal text-text-muted">{metric.title}</p>
        <span className={`rounded-control px-2 py-1 text-label ${statusClass(metric.status)}`}>
          {formatLabel(metric.status)}
        </span>
      </div>
      <p className="text-heading text-text-primary">{formatMetricValue(metric)}</p>
      <div className="grid gap-tag text-label font-normal text-text-muted">
        <div className="flex flex-wrap gap-tag">
          <span className="rounded-control bg-control px-2 py-1">Prior {metric.prior_period_value}</span>
          <span className="rounded-control bg-control px-2 py-1">
            {metric.delta_absolute}{metric.delta_percent ? ` / ${metric.delta_percent}` : ''}
          </span>
        </div>
        <p>Target: {metric.target}</p>
        <p>{metric.source}</p>
        <p>Updated {formatDate(metric.last_updated_at)} | {formatLabel(metric.confidence)} confidence</p>
      </div>
    </div>
  )
}

export function HeroMetrics({ metrics }) {
  return (
    <div className="grid gap-control md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric, index) => (
        <div className={index === 0 ? 'md:col-span-2 xl:col-span-1' : ''} key={metric.id}>
          <MetricCard metric={metric} />
        </div>
      ))}
    </div>
  )
}

export function NarrativeColumns({ items }) {
  const groups = [
    ['3 Wins', 'win'],
    ['3 Losses', 'loss'],
    ['3 Next', 'next'],
  ]

  return (
    <div className="grid gap-control lg:grid-cols-3">
      {groups.map(([title, type]) => (
        <div className="grid gap-item rounded-control bg-block-subtle p-control" key={type}>
          <p className="text-ui font-semibold text-text-primary">{title}</p>
          {items.filter((item) => item.type === type).slice(0, 3).map((item) => (
            <div className="grid gap-tag" key={item.id}>
              <p className="text-ui font-medium text-text-primary">{item.title}</p>
              <p className="text-label font-normal text-text-secondary">{item.body}</p>
              <p className="text-label font-normal text-text-muted">{item.metric_delta} | {item.owner}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function FunnelView({ funnel, highlights }) {
  const rows = funnel.map((stage) => ({
    ...stage,
    id: stage.id ?? stage.stage_name,
  }))

  return (
    <div className="grid gap-component">
      <div className="grid gap-control">
        {rows.map((stage) => (
          <ProgressBar
            key={stage.stage_name}
            label={`${stage.stage_name} | ${stage.stage_count || stage.conversion_rate}${stage.unit ? ` ${stage.unit}` : '%'}`}
            tone={stage.conversion_rate >= stage.target ? 'green' : 'orange'}
            value={Math.min(Number(stage.unit === 'days' ? stage.target : stage.conversion_rate) || 0, 100)}
          />
        ))}
      </div>
      <div className="grid gap-control md:grid-cols-3">
        {[
          ['Biggest leak this period', highlights.biggest_leak],
          ['Worst change vs prior period', highlights.worst_change],
          ['Best improvement vs prior period', highlights.best_improvement],
        ].map(([label, value]) => (
          <div className="rounded-control bg-block-subtle p-control" key={label}>
            <p className="text-label text-text-muted">{label}</p>
            <p className="mt-tag text-ui text-text-primary">{value}</p>
          </div>
        ))}
      </div>
      <TablePanel
        columns={[
          { key: 'stage_name', label: 'Stage' },
          { key: 'stage_count', label: 'Count', align: 'right' },
          { key: 'conversion_rate', label: 'Conversion', align: 'right', render: (row) => `${row.conversion_rate}${row.unit ? ` ${row.unit}` : '%'}` },
          { key: 'drop_off_count', label: 'Drop-off', align: 'right' },
          { key: 'target', label: 'Target', align: 'right', render: (row) => `${row.target}${row.unit ? ` ${row.unit}` : '%'}` },
        ]}
        rows={rows}
        title="Exact Funnel Numbers"
      />
    </div>
  )
}

export function MetricList({ metrics }) {
  return (
    <div className="grid gap-control md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
    </div>
  )
}

export function ChannelTable({ channels }) {
  const maxBookings = Math.max(...channels.map((channel) => Number(channel.bookings) || 0), 1)

  return (
    <div className="grid gap-card">
      <Panel>
        <PanelHeader title="Channel Booking Yield" />
        <PanelBody className="grid gap-control">
          {channels.map((channel) => {
            const width = `${Math.max(6, ((Number(channel.bookings) || 0) / maxBookings) * 100)}%`

            return (
              <div className="grid gap-tag" key={channel.channel}>
                <div className="flex items-center justify-between gap-control text-label">
                  <span className="font-medium text-text-primary">{channel.channel}</span>
                  <span className="text-text-muted">{channel.bookings} bookings | ${channel.cost_per_booking || 0} CPB</span>
                </div>
                <div className="h-3 overflow-hidden rounded-control bg-fill-secondary">
                  <div className="h-full rounded-control bg-action" style={{ width }} />
                </div>
              </div>
            )
          })}
        </PanelBody>
      </Panel>
      <TablePanel
        columns={[
          { key: 'channel', label: 'Channel' },
          { key: 'leads', label: 'Leads', align: 'right' },
          { key: 'bookings', label: 'Bookings', align: 'right' },
          { key: 'new_patients', label: 'New patients', align: 'right' },
          { key: 'cost_per_lead', label: 'CPL', align: 'right', render: (row) => row.cost_per_lead ? `$${row.cost_per_lead}` : '$0' },
          { key: 'cost_per_booking', label: 'CPB', align: 'right', render: (row) => row.cost_per_booking ? `$${row.cost_per_booking}` : '$0' },
        ]}
        rows={channels}
        title="Channel Attribution"
      />
    </div>
  )
}

function heatmapTone(value) {
  if (value >= 15) {
    return 'bg-success-muted text-success'
  }

  if (value >= 8) {
    return 'bg-warning-muted text-warning-foreground'
  }

  return 'bg-fill-secondary text-text-muted'
}

export function HeatmapTable({ rows = [], title }) {
  if (!rows.length) {
    return null
  }

  const touchKeys = Object.keys(rows[0]).filter((key) => key !== 'track' && key !== 'id')

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-control">
        <div className="grid gap-tag" style={{ gridTemplateColumns: `minmax(88px, 0.8fr) repeat(${touchKeys.length}, minmax(72px, 1fr))` }}>
          <span className="text-label text-text-muted">Track</span>
          {touchKeys.map((key) => (
            <span className="text-label text-text-muted" key={key}>{formatLabel(key)}</span>
          ))}
          {rows.flatMap((row) => [
            <span className="flex items-center text-label font-medium text-text-primary" key={`${row.track}-label`}>{row.track}</span>,
            ...touchKeys.map((key) => (
              <span className={`rounded-control px-control py-item text-center text-label ${heatmapTone(Number(row[key]))}`} key={`${row.track}-${key}`}>
                {row[key]}%
              </span>
            )),
          ])}
        </div>
      </PanelBody>
    </Panel>
  )
}

export function ReactivationTrackTable({ tracks }) {
  const rows = tracks.map((track) => ({
    ...track,
    id: track.id ?? track.track,
  }))

  return (
    <TablePanel
      columns={[
        { key: 'track', label: 'Track' },
        { key: 'bookings', label: 'Bookings', align: 'right' },
        { key: 'reply_rate', label: 'Reply rate', align: 'right', render: (row) => `${row.reply_rate}%` },
        { key: 'cost_per_booking', label: 'CPB', align: 'right', render: (row) => `$${row.cost_per_booking}` },
        { key: 'saturday_slot_fill_rate', label: 'Saturday fill', align: 'right', render: (row) => `${row.saturday_slot_fill_rate}%` },
        { key: 'cumulative_reactivated', label: 'Cumulative', align: 'right' },
      ]}
      rows={rows}
      title="Track Performance"
    />
  )
}

export function DecisionCards({ decisions }) {
  return (
    <div className="grid gap-control lg:grid-cols-2">
      {decisions.map((decision) => (
        <div className="grid gap-item rounded-control bg-block-subtle p-control" key={decision.id}>
          <div className="flex items-start justify-between gap-control">
            <p className="text-ui font-semibold text-text-primary">{decision.title}</p>
            <TableBadge tone={decision.status === 'pending' ? 'yellow' : 'green'}>{decision.status}</TableBadge>
          </div>
          <p className="text-ui text-text-secondary">{decision.context}</p>
          <p className="text-label font-normal text-text-primary">Recommendation: {decision.recommended_decision}</p>
          <p className="text-label font-normal text-text-muted">Impact: {decision.estimated_impact}</p>
          <p className="text-label font-normal text-text-muted">Owner: {decision.owner} | Due {decision.decision_due_by}</p>
        </div>
      ))}
    </div>
  )
}

export function SimpleListCards({ items, title }) {
  if (!items.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody className="grid gap-item">
        {items.map((item, index) => (
          <div className="rounded-control bg-block-subtle p-control" key={item.id ?? `${title}-${index}`}>
            <p className="text-ui font-medium text-text-primary">
              {item.title ?? item.name ?? item.previous_commitment}
            </p>
            <p className="mt-tag text-label font-normal text-text-secondary">
              {item.why_watch ?? item.result ?? item.current_result ?? item.body}
            </p>
            {item.next_action || item.related_metric_delta ? (
              <p className="mt-tag text-label font-normal text-text-muted">
                {item.next_action ?? item.related_metric_delta}
              </p>
            ) : null}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

export function FreshnessFooter({ sources }) {
  return (
    <TablePanel
      columns={[
        { key: 'source_name', label: 'Source' },
        { key: 'last_updated_at', label: 'Last Updated', render: (row) => formatDate(row.last_updated_at) },
        {
          key: 'freshness_status',
          label: 'Status',
          render: (row) => (
            <span className={`rounded-control px-2 py-1 text-label ${statusClass(row.freshness_status)}`}>
              {formatLabel(row.freshness_status)}
            </span>
          ),
        },
        { key: 'affected_metrics', label: 'Affected Metrics', render: (row) => row.affected_metrics.join(', ') },
      ]}
      rows={sources}
      title="Data Freshness"
    />
  )
}

export function ZonePanel({ children, onToggle, open, zone }) {
  return (
    <Panel>
      <PanelHeader
        action={(
          <Button onClick={onToggle} size="sm" type="button" variant="ghost">
            <Icon
              className={`transition-transform duration-motion-fast ${open ? 'rotate-180' : ''}`}
              name="chevronDown"
              size={15}
            />
            {open ? 'Collapse' : 'Expand'}
          </Button>
        )}
        eyebrow={`Zone ${zone.number}`}
        subtitle={open ? zone.description : `Collapsed | ${zone.description}`}
        title={zone.name}
      />
      {open ? <PanelBody>{children}</PanelBody> : null}
    </Panel>
  )
}
