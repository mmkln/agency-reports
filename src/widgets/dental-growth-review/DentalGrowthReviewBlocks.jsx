import {
  Badge,
  EmptyState,
  FreshnessMiniBar,
  MetricTile,
  NativeSelect,
  Panel,
  PanelBody,
  PanelHeader,
  ReportSection,
  SectionJumpNav,
  StickyDashboardToolbar,
  TableBadge,
  TablePanel,
  ViewModeToggle,
} from '@/shared/ui'

import { DENTAL_GROWTH_REVIEW_VIEW_PRESETS } from '../../entities/dental-growth-review'
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

function createFreshnessItems(sources = []) {
  return sources.slice(0, 5).map((source) => ({
    id: source.id ?? source.source_name,
    label: `${source.source_name}: ${formatLabel(source.freshness_status)}`,
    status: source.freshness_status,
    title: `${source.source_name} updated ${formatDate(source.last_updated_at)}`,
  }))
}

export function GrowthReviewToolbar({
  onPeriodChange,
  onViewModeChange,
  page,
  selectedPeriodOptionKey,
  viewMode,
  zoneNavItems,
}) {
  const period = page.period
  const context = period.content.period_context

  return (
    <StickyDashboardToolbar
      controls={(
        <>
          <label className="grid min-w-search-compact gap-tag text-label text-text-muted">
            Review period
            <NativeSelect
              className="h-control-small text-label"
              onChange={(event) => onPeriodChange(event.target.value)}
              value={selectedPeriodOptionKey}
            >
              {page.reviewPeriodOptions.map((option) => (
                <option disabled={option.disabled} key={option.key} value={option.key}>
                  {option.label} - {option.periodLabel}
                </option>
              ))}
            </NativeSelect>
          </label>
          <ViewModeToggle
            ariaLabel="Growth review view mode"
            items={[
              { label: 'Executive View', value: DENTAL_GROWTH_REVIEW_VIEW_PRESETS.EXECUTIVE },
              { label: 'Operator View', value: DENTAL_GROWTH_REVIEW_VIEW_PRESETS.OPERATOR },
            ]}
            onChange={onViewModeChange}
            value={viewMode}
          />
        </>
      )}
      nav={<SectionJumpNav items={zoneNavItems} />}
      summary={(
        <div className="grid gap-tag">
          <p className="text-label text-text-muted">Dental Growth Review</p>
          <div className="flex min-w-0 flex-wrap items-center gap-tag">
            <p className="text-ui font-semibold text-text-primary">{period.label}</p>
            <span className="text-label font-normal text-text-muted">{context.cadence_label}</span>
          </div>
          <FreshnessMiniBar items={createFreshnessItems(period.data_sources)} />
        </div>
      )}
    />
  )
}

export function GrowthReviewExecutiveSummary({ page }) {
  const period = page.period
  const context = period.content.period_context
  const heroMetric = period.content.hero_metrics[0]
  const calculationMeta = page.calculationMeta

  return (
    <section className="py-card">
      <div className="grid gap-card xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0">
          <p className="text-label font-normal text-text-muted">Dental growth operating review | {page.preset} preset</p>
          <div className="mt-tag flex flex-wrap items-center gap-tag">
            <h1 className="text-display text-text-primary">{period.title}</h1>
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
              <MetricTile
                helper={`${heroMetric.delta_absolute}${heroMetric.delta_percent ? ` / ${heroMetric.delta_percent}` : ''} vs prior`}
                meta={[{ label: `Updated ${formatDate(heroMetric.last_updated_at)}` }]}
                statusLabel={formatLabel(heroMetric.status)}
                statusTone={heroMetric.status}
                title={heroMetric.title}
                value={formatMetricValue(heroMetric)}
                variant="compact"
              />
            ) : null}
          </div>
          <div className={`mt-component rounded-control px-control py-item text-ui font-medium ${statusClass(context.top_alert_status)}`}>
            {context.top_alert_message}
          </div>
          {calculationMeta ? (
            <div className="mt-control grid gap-tag rounded-control bg-block-subtle p-control text-label text-text-muted sm:grid-cols-3">
              <div>
                <span>Source batch</span>
                <p className="mt-tag font-medium text-text-primary">{calculationMeta.sourceBatchId || 'Not linked'}</p>
              </div>
              <div>
                <span>Calculated</span>
                <p className="mt-tag font-medium text-text-primary">{formatDate(calculationMeta.calculatedAt)}</p>
              </div>
              <div>
                <span>Validation</span>
                <p className="mt-tag font-medium text-text-primary">{formatLabel(calculationMeta.validationState || 'unknown')}</p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-control">
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
      </div>
    </section>
  )
}

export function MetricCard({ metric }) {
  return (
    <MetricTile
      helper={`${metric.delta_absolute}${metric.delta_percent ? ` / ${metric.delta_percent}` : ''}`}
      meta={[
        { label: `Prior ${metric.prior_period_value}` },
        { label: `Target: ${metric.target}` },
        { label: metric.source },
        { label: `Updated ${formatDate(metric.last_updated_at)} | ${formatLabel(metric.confidence)} confidence` },
      ]}
      statusLabel={formatLabel(metric.status)}
      statusTone={metric.status}
      title={metric.title}
      value={formatMetricValue(metric)}
    />
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
    ['3 Wins', 'win', 'What worked'],
    ['3 Losses', 'loss', 'What leaked'],
    ['3 Next', 'next', 'What changes next'],
  ]

  return (
    <div className="grid gap-card lg:grid-cols-3">
      {groups.map(([title, type, helper]) => (
        <section className="grid content-start gap-component" key={type}>
          <div>
            <p className="text-label text-text-muted">{helper}</p>
            <h3 className="mt-tag text-heading text-text-primary">{title}</h3>
          </div>
          <ol className="grid gap-component">
            {items.filter((item) => item.type === type).slice(0, 3).map((item, index) => (
              <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-control" key={item.id}>
                <span className="flex h-control-small w-control-small items-center justify-center rounded-full bg-control text-label tabular-nums text-text-secondary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-ui font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-tag text-ui font-normal text-text-secondary">{item.body}</p>
                  <div className="mt-item flex flex-wrap items-center gap-tag text-label font-normal text-text-muted">
                    {item.metric_delta ? <span className="rounded-full bg-control px-control py-tag">{item.metric_delta}</span> : null}
                    {item.owner ? <span>{item.owner}</span> : null}
                    {item.impact_level ? <span>{formatLabel(item.impact_level)} impact</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

function getFunnelTone(stage) {
  if (stage.unit === 'days') {
    return Number(stage.conversion_rate) <= Number(stage.target) ? 'green' : 'yellow'
  }

  if (Number(stage.conversion_rate) >= Number(stage.target)) {
    return 'green'
  }

  if (Number(stage.conversion_rate) >= Number(stage.target) * 0.85) {
    return 'yellow'
  }

  return 'red'
}

function getFunnelBarWidth(stage) {
  if (stage.unit === 'days') {
    const target = Math.max(Number(stage.target) || 1, 1)
    const value = Math.max(Number(stage.conversion_rate) || 0, 0)

    return `${Math.max(18, Math.min(100, (target / Math.max(value, target)) * 100))}%`
  }

  return `${Math.max(18, Math.min(100, Number(stage.conversion_rate) || 0))}%`
}

function getFunnelTargetOffset(stage) {
  if (stage.unit === 'days') {
    return '100%'
  }

  return `${Math.max(0, Math.min(100, Number(stage.target) || 0))}%`
}

function FunnelStage({ stage }) {
  const tone = getFunnelTone(stage)
  const barToneClass = {
    green: 'bg-success',
    red: 'bg-destructive',
    yellow: 'bg-warning',
  }[tone]
  const chipToneClass = {
    green: 'bg-success-muted text-success',
    red: 'bg-destructive-muted text-destructive',
    yellow: 'bg-warning-muted text-warning-foreground',
  }[tone]
  const valueLabel = `${stage.conversion_rate}${stage.unit ? ` ${stage.unit}` : '%'}`
  const targetLabel = `${stage.target}${stage.unit ? ` ${stage.unit}` : '%'}`

  return (
    <div className="grid gap-item">
      <div className="flex flex-wrap items-end justify-between gap-control">
        <div className="min-w-0">
          <p className="text-ui font-semibold text-text-primary">{stage.stage_name}</p>
          <p className="mt-tag text-label font-normal text-text-muted">
            {stage.stage_count} in stage | {stage.drop_off_count} drop-off
            {stage.drop_off_rate ? ` | ${stage.drop_off_rate}% drop-off` : ''}
          </p>
        </div>
        <div className="flex items-center gap-tag">
          <span className={`rounded-full px-control py-tag text-label leading-none ${chipToneClass}`}>
            {valueLabel}
          </span>
          <span className="text-label font-normal text-text-muted">Target {targetLabel}</span>
        </div>
      </div>
      <div className="relative h-control-small overflow-hidden rounded-full bg-fill-secondary">
        <div
          className={`h-full rounded-full ${barToneClass}`}
          style={{ width: getFunnelBarWidth(stage) }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-px bg-text-primary/60"
          style={{ left: getFunnelTargetOffset(stage) }}
        />
      </div>
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
      <div className="grid gap-component rounded-block bg-block p-component">
        <div className="flex flex-wrap items-start justify-between gap-control">
          <div>
            <h3 className="text-heading text-text-primary">Where the funnel leaks</h3>
            <p className="mt-tag max-w-readable text-ui font-normal text-text-secondary">
              Each stage shows current conversion against target, with drop-off count kept visible for the operator scan.
            </p>
          </div>
          <div className="flex items-center gap-tag text-label font-normal text-text-muted">
            <span className="inline-flex h-control-small items-center rounded-full bg-control px-control">Current</span>
            <span className="inline-flex h-control-small items-center rounded-full bg-control px-control">Target marker</span>
          </div>
        </div>
        <div className="grid gap-component">
          {rows.map((stage) => <FunnelStage key={stage.stage_name} stage={stage} />)}
        </div>
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

function getMetricById(metrics = [], id) {
  return metrics.find((metric) => metric.id === id)
}

function MetricStatusRow({ metric }) {
  if (!metric) {
    return null
  }

  return (
    <div className="grid gap-tag border-b border-separator py-control last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-control">
        <div className="min-w-0">
          <p className="text-ui font-semibold text-text-primary">{metric.title}</p>
          <p className="mt-tag text-label font-normal text-text-muted">{metric.source}</p>
        </div>
        <div className="flex shrink-0 items-center gap-tag">
          <span className="text-data tabular-nums text-text-primary">{formatMetricValue(metric)}</span>
          <span className={`rounded-full px-control py-tag text-label leading-none ${statusClass(metric.status)}`}>
            {formatLabel(metric.status)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-tag text-label font-normal text-text-muted">
        <span>Prior {metric.prior_period_value}</span>
        <span>{metric.delta_absolute}{metric.delta_percent ? ` / ${metric.delta_percent}` : ''}</span>
        <span>Target {metric.target}</span>
        <span>{formatLabel(metric.confidence)} confidence</span>
      </div>
    </div>
  )
}

function MetricStatusRows({ metrics = [], title }) {
  return (
    <section className="rounded-block bg-block p-component">
      <h3 className="text-heading text-text-primary">{title}</h3>
      <div className="mt-control grid">
        {metrics.map((metric) => <MetricStatusRow key={metric.id} metric={metric} />)}
      </div>
    </section>
  )
}

function SpeedAlertStrip({ metrics = [] }) {
  const alerts = metrics
    .filter((metric) => ['red', 'yellow'].includes(metric.status))
    .slice(0, 3)

  if (!alerts.length) {
    return null
  }

  return (
    <div className="grid gap-control rounded-block bg-block p-component md:grid-cols-3">
      {alerts.map((metric) => (
        <div className="min-w-0" key={metric.id}>
          <p className={`inline-flex rounded-full px-control py-tag text-label leading-none ${statusClass(metric.status)}`}>
            {formatLabel(metric.status)}
          </p>
          <p className="mt-item text-ui font-semibold text-text-primary">{metric.title}</p>
          <p className="mt-tag text-label font-normal text-text-muted">
            {formatMetricValue(metric)} | Target {metric.target}
          </p>
        </div>
      ))}
    </div>
  )
}

function ResponseSummary({ metrics = [] }) {
  const responseMetrics = [
    getMetricById(metrics, 'median-time-first-reply'),
    getMetricById(metrics, 'replies-under-five'),
    getMetricById(metrics, 'leads-never-contacted'),
  ].filter(Boolean)

  return (
    <div className="grid gap-control md:grid-cols-3">
      {responseMetrics.map((metric) => (
        <MetricTile
          helper={`${metric.delta_absolute}${metric.delta_percent ? ` / ${metric.delta_percent}` : ''} vs prior`}
          key={metric.id}
          meta={[
            { label: `Target ${metric.target}` },
            { label: metric.source },
          ]}
          statusLabel={formatLabel(metric.status)}
          statusTone={metric.status}
          title={metric.title}
          value={formatMetricValue(metric)}
          variant="compact"
        />
      ))}
    </div>
  )
}

export function SpeedChannelDiagnostics({ channels = [], metrics = [] }) {
  return (
    <div className="grid gap-card">
      <ResponseSummary metrics={metrics} />
      <SpeedAlertStrip metrics={metrics} />
      <div className="grid gap-card xl:grid-cols-[minmax(0,1fr)_420px]">
        <ChannelTable channels={channels} />
        <MetricStatusRows
          metrics={metrics.filter((metric) => ![
            'median-time-first-reply',
            'replies-under-five',
            'leads-never-contacted',
          ].includes(metric.id))}
          title="Cost and patient quality"
        />
      </div>
    </div>
  )
}

export function ChannelTable({ channels }) {
  const maxBookings = Math.max(...channels.map((channel) => Number(channel.bookings) || 0), 1)

  return (
    <section className="grid gap-card rounded-block bg-block p-component">
      <div>
        <h3 className="text-heading text-text-primary">Source quality</h3>
        <p className="mt-tag text-ui font-normal text-text-secondary">
          Booking yield is shown before lead volume so weak sources do not hide behind cheap form fills.
        </p>
      </div>
      <div className="grid gap-component">
          {channels.map((channel) => {
            const width = `${Math.max(6, ((Number(channel.bookings) || 0) / maxBookings) * 100)}%`

            return (
              <div className="grid gap-tag" key={channel.channel}>
                <div className="flex flex-wrap items-center justify-between gap-control text-label">
                  <span className="font-semibold text-text-primary">{channel.channel}</span>
                  <span className="font-normal text-text-muted">
                    {channel.bookings} bookings | {channel.leads} leads | ${channel.cost_per_booking || 0} CPB
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-control bg-fill-secondary">
                  <div className="h-full rounded-control bg-action" style={{ width }} />
                </div>
              </div>
            )
          })}
      </div>
      <div className="grid gap-tag">
        <p className="text-label text-text-muted">Exact source numbers</p>
        <div className="grid gap-tag text-label">
          {channels.map((channel) => (
            <div
              className="grid gap-tag rounded-control bg-block-subtle p-control md:grid-cols-[minmax(120px,1fr)_repeat(5,minmax(72px,auto))] md:items-center"
              key={`${channel.channel}-exact`}
            >
              <span className="font-semibold text-text-primary">{channel.channel}</span>
              <span className="text-text-muted">Leads {channel.leads}</span>
              <span className="text-text-muted">Bookings {channel.bookings}</span>
              <span className="text-text-muted">New {channel.new_patients}</span>
              <span className="text-text-muted">CPL ${channel.cost_per_lead || 0}</span>
              <span className="text-text-muted">CPB ${channel.cost_per_booking || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <section className="grid gap-control rounded-block bg-block p-component">
      <div>
        <h3 className="text-heading text-text-primary">{title}</h3>
        <p className="mt-tag text-label font-normal text-text-muted">Track by touch. Values stay secondary unless they point to a campaign decision.</p>
      </div>
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
    </section>
  )
}

function TrackPerformanceRow({ maxBookings, track }) {
  const bookings = Number(track.bookings) || 0
  const target = Number(track.target) || 0
  const width = `${Math.max(8, Math.min(100, (bookings / Math.max(maxBookings, 1)) * 100))}%`
  const targetOffset = `${Math.max(0, Math.min(100, (target / Math.max(maxBookings, 1)) * 100))}%`
  const onTarget = bookings >= target

  return (
    <div className="grid gap-item border-b border-separator py-control last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-control">
        <div>
          <p className="text-ui font-semibold text-text-primary">{track.track}</p>
          <p className="mt-tag text-label font-normal text-text-muted">
            {bookings} bookings vs {target} target | {track.cumulative_reactivated} cumulative reactivated
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-tag text-label font-normal text-text-muted">
          <span className={onTarget ? 'text-success' : 'text-warning-foreground'}>{onTarget ? 'On target' : 'Below target'}</span>
          <span>{track.reply_rate}% reply</span>
          <span>${track.cost_per_booking} CPB</span>
          <span>{track.saturday_slot_fill_rate}% Saturday fill</span>
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-fill-secondary">
        <div className="h-full rounded-full bg-action" style={{ width }} />
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-px bg-text-primary/60"
          style={{ left: targetOffset }}
        />
      </div>
    </div>
  )
}

export function ReactivationPerformance({ tracks = [] }) {
  const maxBookings = Math.max(
    ...tracks.flatMap((track) => [Number(track.bookings) || 0, Number(track.target) || 0]),
    1,
  )

  return (
    <section className="grid gap-component rounded-block bg-block p-component">
      <div className="flex flex-wrap items-start justify-between gap-control">
        <div>
          <h3 className="text-heading text-text-primary">Track performance</h3>
          <p className="mt-tag max-w-readable text-ui font-normal text-text-secondary">
            Tracks are compared against booking target first, then reply quality, cost per booking, and Saturday capacity fill.
          </p>
        </div>
        <span className="rounded-full bg-control px-control py-tag text-label text-text-muted">Target marker shown on each bar</span>
      </div>
      <div className="grid">
        {tracks.map((track) => (
          <TrackPerformanceRow key={track.track} maxBookings={maxBookings} track={track} />
        ))}
      </div>
    </section>
  )
}

function OperationsChipList({ metrics = [] }) {
  return (
    <section className="rounded-block bg-block p-component">
      <h3 className="text-heading text-text-primary">Operations health chips</h3>
      <div className="mt-control grid gap-control md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricTile
            helper={`${metric.delta_absolute}${metric.delta_percent ? ` / ${metric.delta_percent}` : ''}`}
            key={metric.id}
            meta={[{ label: `Target ${metric.target}` }]}
            statusLabel={formatLabel(metric.status)}
            statusTone={metric.status}
            title={metric.title}
            value={formatMetricValue(metric)}
            variant="compact"
          />
        ))}
      </div>
    </section>
  )
}

export function TeamHealthDiagnostics({
  deliverabilityMetrics = [],
  frontDeskHealth = [],
  operationsChips = [],
}) {
  return (
    <div className="grid gap-card">
      <MetricStatusRows metrics={deliverabilityMetrics} title="Deliverability health" />
      <MetricStatusRows metrics={frontDeskHealth} title="Front desk health components" />
      <OperationsChipList metrics={operationsChips} />
    </div>
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

export function GrowthReviewSection({ children, id, onToggle, open, zone }) {
  return (
    <ReportSection
      description={zone.description}
      eyebrow={`Zone ${zone.number}`}
      id={id}
      onToggle={onToggle}
      open={open}
      title={zone.name}
    >
      {children}
    </ReportSection>
  )
}
