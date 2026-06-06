import { useState } from 'react'

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FreshnessMiniBar,
  MetricTile,
  NativeSelect,
  Panel,
  PanelBody,
  PanelHeader,
  ReportSection,
  ResourceState,
  SectionJumpNav,
  StickyDashboardToolbar,
  TableBadge,
  TablePanel,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  ViewModeToggle,
} from '@/shared/ui'

import { MetricTrendChart } from '@/shared/charts'
import { Icon } from '@/shared/icons'

import { DENTAL_GROWTH_REVIEW_VIEW_PRESETS } from '../../entities/dental-growth-review'
import {
  formatDate,
  formatLabel,
  formatMetricValue,
  statusClass,
} from './format'
import { createGrowthReviewMetricDetailViewModel } from './metricDetailPresenter'

export function DentalGrowthReviewState({ onRetry, page }) {
  if (page.status === 'error') {
    return (
      <Panel>
        <PanelBody>
          <ResourceState
            errorInfo={page.errorInfo}
            labels={{
              failureDescription: 'We could not load review data right now.',
              failureTitle: 'Growth Review is unavailable',
              networkDescription: 'Check the backend connection and try again.',
              networkTitle: 'Growth Review is unavailable',
              notFoundDescription: 'Connect source data and configure metrics before this workspace can show a review.',
              notFoundTitle: 'Growth Review is not configured yet',
              permissionDescription: 'Ask an admin to update your workspace permissions.',
              permissionTitle: 'You do not have access to this review',
            }}
            onRetry={onRetry}
          />
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
            title="Growth Review is being prepared"
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

function getProblemSources(sources = []) {
  return sources.filter((source) => ['red', 'yellow'].includes(source.freshness_status))
}

function getHeroMetricTitle(metric) {
  return metric.title
}

const statusChevronClass = {
  green: '-rotate-180 text-success',
  grey: '-rotate-90 text-text-muted',
  red: 'text-destructive',
  yellow: 'text-warning',
}

function StatusChevron({
  label = 'View details',
  onClick,
  status = 'grey',
  tooltip = 'View details',
}) {
  const className = statusChevronClass[status] ?? statusChevronClass.grey

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className="rounded-full text-text-secondary hover:bg-control-hover hover:text-text-primary"
          onClick={onClick}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Icon className={className} name="chevronDown" size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export function DataTrustAlert({ sources = [] }) {
  const problemSources = getProblemSources(sources)

  if (!problemSources.length) {
    return null
  }

  const primarySource = problemSources[0]
  return (
    <div className="flex gap-control rounded-block border-l-2 border-destructive bg-block p-component">
      <Icon className="mt-0.5 shrink-0 text-destructive" name="triangleAlert" size={16} />
      <div className="min-w-0 grid gap-tag">
        <div className="flex flex-wrap items-center gap-tag">
          <p className="text-label font-semibold text-text-muted">Data trust alert</p>
          <span className={`rounded-full px-control py-tag text-label leading-none ${statusClass(primarySource.freshness_status)}`}>
            {formatLabel(primarySource.freshness_status)}
          </span>
        </div>
        <p className="text-ui font-semibold text-text-primary">
          {primarySource.source_name}: {primarySource.freshness_note || primarySource.failure_reason}
        </p>
        {primarySource.affected_metrics?.length ? (
          <p className="text-label font-normal text-text-secondary">
            Affects: {primarySource.affected_metrics.join(', ')}.
          </p>
        ) : null}
        {problemSources.length > 1 ? (
          <p className="text-label font-normal text-text-muted">
            {problemSources.length - 1} more source{problemSources.length > 2 ? 's' : ''} need{problemSources.length === 2 ? 's' : ''} attention in the footer.
          </p>
        ) : null}
      </div>
    </div>
  )
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
          <p className="text-label text-text-muted">Growth Review</p>
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
  const heroMetric = Object.values(page.charts?.metrics ?? {})[0]
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
            <div className="mt-control grid gap-tag rounded-control bg-block-subtle p-control text-label text-text-muted sm:grid-cols-2">
              <div>
                <span>Calculated</span>
                <p className="mt-tag font-medium text-text-primary">{formatDate(calculationMeta.calculatedAt)}</p>
              </div>
              <div>
                <span>Calculation version</span>
                <p className="mt-tag font-medium text-text-primary">{calculationMeta.calculationVersion || 'Not versioned'}</p>
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

function getMetricKind(metric) {
  const id = String(metric.id ?? '').toLowerCase()
  const title = String(metric.title ?? '').toLowerCase()

  if (id.includes('projected-revenue') || title.includes('projected 90-day revenue')) {
    return 'revenue_range'
  }

  if (id.includes('marketing-investment') || id === 'investment' || title.includes('marketing investment')) {
    return 'investment'
  }

  if (id.includes('cost-per') || title.includes('cost per')) {
    return 'cost'
  }

  if (id.includes('ltv-cac') || title.includes('ltv:cac')) {
    return 'ltv_cac'
  }

  return 'outcome'
}

function isLowerBetterMetric(metric) {
  return ['cost', 'investment'].includes(getMetricKind(metric)) || metric.target?.comparator === 'lte'
}

function getMetricTargetLabel(metric) {
  if (metric.target?.label) {
    return metric.target.label
  }

  if (typeof metric.target === 'string') {
    return metric.target
  }

  return ''
}

function getMetricTargetMeta(metric) {
  const label = getMetricTargetLabel(metric)

  return label ? [{ label }] : []
}

function getMetricAccent(metric) {
  if (metric.status === 'red') {
    return 'var(--destructive)'
  }

  if (metric.status === 'yellow') {
    return 'var(--warning)'
  }

  if (metric.status === 'green') {
    return 'var(--success)'
  }

  return 'var(--premium-blue)'
}

function getMetricTrendPointDate(point) {
  return point?.date
    ?? point?.period_start
    ?? point?.periodStart
    ?? point?.bucket_date
    ?? point?.bucketDate
    ?? null
}

function getMetricTrendPointRange(point) {
  const sourceText = String(point?.label ?? point?.period ?? '')
  const sourceDates = [...sourceText.matchAll(/\d{4}-\d{2}-\d{2}/g)].map((match) => match[0])
  const start = getMetricTrendPointDate(point) ?? sourceDates[0] ?? null
  const end = point?.period_end
    ?? point?.periodEnd
    ?? point?.end_date
    ?? point?.endDate
    ?? sourceDates[1]
    ?? start

  return { end, start }
}

function formatTrendDate(value, options) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString('en-US', options)
}

function formatTrendDateRange(startValue, endValue, { includeYear = false } = {}) {
  const start = new Date(startValue)
  const end = new Date(endValue ?? startValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return String(startValue)
  }

  const sameDay = start.toDateString() === end.toDateString()
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameDay) {
    return formatTrendDate(startValue, {
      day: 'numeric',
      month: 'short',
      year: includeYear ? 'numeric' : undefined,
    })
  }

  if (sameMonth) {
    const month = start.toLocaleDateString('en-US', { month: 'short' })
    const suffix = includeYear ? `, ${end.getFullYear()}` : ''

    return `${month} ${start.getDate()}-${end.getDate()}${suffix}`
  }

  const startLabel = start.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: includeYear && !sameYear ? 'numeric' : undefined,
  })
  const endLabel = end.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: includeYear ? 'numeric' : undefined,
  })

  return `${startLabel}-${endLabel}`
}

function getMetricTrendData(series) {
  const points = series?.series ?? series?.points

  if (!series?.available || !Array.isArray(points) || !points.length) {
    return []
  }

  return points.map((point, index) => {
    const range = getMetricTrendPointRange(point)
    const date = range.start
    const fallbackLabel = point.label ?? point.period ?? `Point ${index + 1}`

    return {
      date,
      id: point.id ?? `${date ?? fallbackLabel}-${index}`,
      label: date ? formatTrendDateRange(range.start, range.end) : String(fallbackLabel),
      tooltipLabel: date ? formatTrendDateRange(range.start, range.end, { includeYear: true }) : String(fallbackLabel),
      value: point.value,
    }
  })
}

function MetricSparkline({ metric, series }) {
  const title = getHeroMetricTitle(metric)

  return (
    <div className="h-12 min-w-0">
      <MetricTrendChart
        ariaLabel={`${title} trend`}
        color={getMetricAccent(metric)}
        data={getMetricTrendData(series)}
        formatValue={(value) => formatMetricValue({ ...metric, value })}
        hideTooltipLabel={false}
        id={`growth-review-${metric.id}-trend`}
        label={title}
        showActiveDot
        showCursor
        variant="compact"
      />
    </div>
  )
}

function getProgress(metric) {
  const attainmentPercent = Number(metric.target?.attainment_percent)

  if (!Number.isFinite(attainmentPercent)) {
    return null
  }

  return Math.max(0, Math.min(1.2, attainmentPercent / 100))
}

function getProgressLabel(metric) {
  return getMetricTargetLabel(metric)
}

function MetricProgress({ metric }) {
  const progress = getProgress(metric)
  const label = getProgressLabel(metric)

  if (progress == null || !label || getMetricKind(metric) === 'revenue_range') {
    return null
  }

  const percent = Math.round(progress * 100)

  return (
    <div className="grid gap-tag">
      <div className="flex items-center justify-between gap-control text-label font-normal text-text-muted">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-fill-secondary">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: getMetricAccent(metric),
            width: `${Math.min(percent, 120)}%`,
          }}
        />
      </div>
    </div>
  )
}

const statusBadgeTone = {
  green: 'green',
  grey: 'neutral',
  red: 'rose',
  yellow: 'amber',
}

function getStatusExplanation(status, target) {
  if (status === 'green') {
    return target
      ? `On track against ${target}.`
      : 'On track for the selected period.'
  }

  if (status === 'yellow') {
    return target
      ? `Needs attention against ${target}.`
      : 'Needs attention for the selected period.'
  }

  if (status === 'red') {
    return target
      ? `Action required against ${target}.`
      : 'Action required for the selected period.'
  }

  return 'Unavailable or not enough trusted data for this period.'
}

function getStatusSummary(metric) {
  return getStatusExplanation(metric.status)
}

function getMetricDeltaText(metric) {
  const parts = [metric.delta_absolute, metric.delta_percent]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)

  return parts.length ? parts.join(' / ') : ''
}

function DetailRow({ label, value }) {
  const displayValue = value === 0 ? '0' : String(value ?? '').trim()

  return (
    <div className="grid gap-tag py-item sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <dt className="text-label font-normal text-text-muted">{label}</dt>
      <dd className="min-w-0 text-ui text-text-primary">{displayValue || 'Not provided'}</dd>
    </div>
  )
}

function DetailSection({ children, title }) {
  return (
    <section className="grid gap-item">
      <h3 className="text-label font-semibold text-text-secondary">{title}</h3>
      <dl className="rounded-block bg-block-subtle p-component">
        {children}
      </dl>
    </section>
  )
}

function MetricTrendDetail({ metric, series }) {
  const data = getMetricTrendData(series)
  const title = getHeroMetricTitle(metric)

  if (!data.length) {
    return null
  }

  return (
    <section className="grid gap-item">
      <h3 className="text-label font-semibold text-text-secondary">Daily trend</h3>
      <div className="rounded-block bg-block-subtle p-component">
        <MetricTrendChart
          ariaLabel={`${title} daily trend detail`}
          className="h-72"
          color={getMetricAccent(metric)}
          data={data}
          formatTooltipLabel={(point) => point?.tooltipLabel ?? ''}
          formatValue={(value) => formatMetricValue({ ...metric, value })}
          id={`growth-review-${metric.id}-detail-trend`}
          label={title}
          showActiveDot
          showCursor
          showGrid
          showXAxis
          variant="standard"
        />
      </div>
    </section>
  )
}

function MetricDetailSections({ sections }) {
  return sections.map((section) => (
    <DetailSection key={section.id} title={section.title}>
      {section.rows.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.value} />
      ))}
    </DetailSection>
  ))
}

function MetricDrilldownModal({ metric, onClose, series }) {
  const open = Boolean(metric)
  const detail = metric
    ? createGrowthReviewMetricDetailViewModel({
      formatMetricValue,
      getDeltaText: getMetricDeltaText,
      getStatusSummary,
      getTitle: getHeroMetricTitle,
      metric,
    })
    : null

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={open}
    >
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        {detail ? (
          <>
            <DialogHeader className="border-b border-island-border bg-material-chrome px-panel py-card text-left backdrop-blur-2xl">
              <DialogTitle>{detail.title}</DialogTitle>
              <DialogDescription>
                Trend and period comparison.
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-overlay-body gap-component overflow-y-auto px-panel pb-panel">
              <section className="grid gap-item pt-component">
                <div className="flex items-start justify-between gap-component">
                  <div>
                    <p className="text-data tabular-nums text-text-primary">{detail.value}</p>
                    {detail.deltaText ? (
                      <p className={`mt-tag inline-flex items-center gap-tag text-label font-semibold ${getDeltaToneClass(metric)}`}>
                        <Icon name={getDeltaIconName(metric)} size={13} />
                        {detail.deltaText}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone={statusBadgeTone[detail.status] ?? 'neutral'}>
                    {formatLabel(detail.status || 'grey')}
                  </Badge>
                </div>
                <p className="text-ui text-text-secondary">
                  {detail.statusSummary}
                </p>
              </section>

              <MetricTrendDetail metric={metric} series={series} />
              <MetricDetailSections sections={detail.sections} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function formatPriorLine(metric) {
  if (metric.prior_period_value !== 0 && !metric.prior_period_value && !metric.delta_percent && !metric.delta_absolute) {
    return ''
  }

  if (metric.prior_period_value === 0 || metric.prior_period_value) {
    return `from ${metric.prior_period_value} prior`
  }

  return 'from prior period'
}

function getDeltaToneClass(metric) {
  const deltaText = String(metric.delta_percent || metric.delta_absolute || '')
  const isNegative = deltaText.trim().startsWith('-')

  if (isLowerBetterMetric(metric)) {
    return isNegative ? 'text-success' : 'text-warning-foreground'
  }

  if (metric.status === 'red') {
    return 'text-destructive'
  }

  if (metric.status === 'yellow') {
    return 'text-warning-foreground'
  }

  return 'text-success'
}

function getDeltaIconName(metric) {
  const deltaText = String(metric.delta_percent || metric.delta_absolute || '').trim()

  if (deltaText.startsWith('-')) {
    return 'arrowDownRight'
  }

  return 'arrowUpRight'
}

export function MetricCard({ metric, onOpenDetails = () => {}, series }) {
  const statusTooltip = 'View metric details'
  const priorLine = formatPriorLine(metric)

  return (
    <article className="grid min-h-52 gap-component rounded-block bg-block p-component">
      <div className="flex min-w-0 items-start justify-between gap-control">
        <p className="min-w-0 text-label font-normal text-text-muted">{getHeroMetricTitle(metric)}</p>
        <StatusChevron
          label={`View ${getHeroMetricTitle(metric)} details`}
          onClick={() => onOpenDetails(metric)}
          status={metric.status}
          tooltip={statusTooltip}
        />
      </div>
      <div>
        <div className="flex items-end gap-control">
          <p className="text-data tabular-nums text-text-primary">{formatMetricValue(metric)}</p>
          {metric.delta_percent || metric.delta_absolute ? (
            <p className={`inline-flex items-center gap-tag pb-tag text-label font-semibold ${getDeltaToneClass(metric)}`}>
              <Icon
                name={getDeltaIconName(metric)}
                size={13}
              />
              {metric.delta_percent || metric.delta_absolute}
            </p>
          ) : null}
        </div>
        {priorLine ? (
          <p className="mt-item text-label font-normal text-text-muted">{priorLine}</p>
        ) : null}
      </div>
      <MetricSparkline metric={metric} series={series} />
      <MetricProgress metric={metric} />
    </article>
  )
}

export function HeroMetrics({ metrics }) {
  const [selectedMetric, setSelectedMetric] = useState(null)

  return (
    <>
      <section className="grid gap-control md:grid-cols-2 xl:grid-cols-3">
        {metrics.slice(0, 6).map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onOpenDetails={setSelectedMetric}
            series={metric}
          />
        ))}
      </section>
      <MetricDrilldownModal
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
        series={selectedMetric}
      />
    </>
  )
}

const narrativeColumnConfig = {
  win: {
    title: 'What Worked',
    helper: 'Measured improvements worth keeping',
    panelAccent: 'border-t-2 border-success',
    numberClass: 'bg-success-muted text-success-foreground',
  },
  loss: {
    title: 'Needs Attention',
    helper: 'Problems, risks, or leaks to address',
    panelAccent: 'border-t-2 border-warning',
    numberClass: 'bg-warning-muted text-warning-foreground',
  },
  next: {
    title: 'Next Actions',
    helper: 'What changes before the next review',
    panelAccent: 'border-t-2 border-action',
    numberClass: 'bg-action-muted text-action',
  },
}

export function NarrativeColumns({ items }) {
  return (
    <section className="grid gap-card lg:grid-cols-3">
      {Object.entries(narrativeColumnConfig).map(([type, config]) => {
        const columnItems = items.filter((item) => item.type === type).slice(0, 3)

        return (
          <section
            className={`grid content-start gap-component rounded-block bg-block p-component ${config.panelAccent}`}
            key={type}
          >
            <div>
              <p className="text-label font-normal text-text-muted">{config.helper}</p>
              <h3 className="mt-tag text-heading text-text-primary">{config.title}</h3>
            </div>
            {columnItems.length ? (
              <ol className="grid gap-component">
                {columnItems.map((item, index) => (
                  <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-control" key={item.id}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label font-semibold tabular-nums ${config.numberClass}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-ui font-semibold text-text-primary">{item.title}</p>
                      <p className="mt-tag text-ui font-normal text-text-secondary">{item.body}</p>
                      <div className="mt-item flex flex-wrap items-center gap-tag text-label font-normal">
                        {item.metric_delta ? (
                          <span className="rounded-full bg-control px-control py-tag text-text-secondary">
                            {item.metric_delta}
                          </span>
                        ) : null}
                        {item.owner ? <span className="text-text-muted">{item.owner}</span> : null}
                        {item.impact_level ? (
                          <span className="text-text-muted">{formatLabel(item.impact_level)} impact</span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-label font-normal text-text-muted">No items this period.</p>
            )}
          </section>
        )
      })}
    </section>
  )
}

function getStageDisplayName(stage) {
  const sourceName = String(stage.stage_name ?? stage.name ?? '')
  const normalized = sourceName.toLowerCase()
  const stageNameMap = [
    ['lead -> contacted', 'Contacted'],
    ['lead → contacted', 'Contacted'],
    ['lead -> booked', 'Booked'],
    ['lead → booked', 'Booked'],
    ['booked -> confirmed', 'Confirmed'],
    ['booked → confirmed', 'Confirmed'],
    ['confirmed -> attended', 'Attended'],
    ['confirmed → attended', 'Attended'],
    ['attended -> treatment accepted', 'Treatment Accepted'],
    ['attended → treatment accepted', 'Treatment Accepted'],
  ]
  const mappedName = stageNameMap.find(([key]) => normalized.includes(key))?.[1]

  return mappedName ?? sourceName.replace(/\s*->\s*/g, ' → ')
}

function isPipelineStageSnapshot(stage) {
  return stage?.funnel_type === 'pipeline_stage_snapshot'
}

function isReactivationLifecycleSnapshot(stage) {
  return stage?.funnel_type === 'reactivation_lifecycle'
}

function hasFunnelConversion(stage) {
  return stage.conversion_rate !== null && stage.conversion_rate !== ''
}

function createFunnelPoint({ centerY, maxCount, stage, x }) {
  const stageCount = Math.max(Number(stage?.stage_count) || 0, 0)
  const ratio = maxCount > 0 ? stageCount / maxCount : 0
  const minThickness = stageCount > 0 ? 10 : 2
  const maxThickness = 220
  const thickness = minThickness + (ratio * (maxThickness - minThickness))

  return {
    bottom: centerY + (thickness / 2),
    stage,
    thickness,
    top: centerY - (thickness / 2),
    x,
  }
}

function getFunnelGeometry(stages) {
  const width = 1000
  const xStart = 48
  const xEnd = 952
  const centerY = 170
  const maxCount = Math.max(...stages.map((stage) => Number(stage.stage_count) || 0), 1)
  const sectionWidth = (xEnd - xStart) / Math.max(stages.length, 1)
  const points = stages.map((stage, index) => createFunnelPoint({
    centerY,
    maxCount,
    stage,
    x: xStart + (sectionWidth * index),
  }))

  if (stages.length > 0) {
    points.push(createFunnelPoint({
      centerY,
      maxCount,
      stage: stages[stages.length - 1],
      x: xEnd,
    }))
  }

  return {
    centerY,
    points,
    sectionWidth,
    width,
  }
}

function buildFunnelCurvePath(points, getY) {
  if (!points.length) {
    return ''
  }

  if (points.length === 1) {
    const point = points[0]
    const y = getY(point)

    return `M ${point.x - 120} ${y} L ${point.x + 120} ${y}`
  }

  const first = points[0]
  let path = `M ${first.x} ${getY(first)}`

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const previousY = getY(previous)
    const currentY = getY(current)
    const segmentControl = (current.x - previous.x) * 0.32
    const controlOneX = previous.x + segmentControl
    const controlTwoX = current.x - segmentControl

    path += ` C ${controlOneX} ${previousY}, ${controlTwoX} ${currentY}, ${current.x} ${currentY}`
  }

  return path
}

function buildFunnelAreaPath(points) {
  if (!points.length) {
    return ''
  }

  if (points.length === 1) {
    const point = points[0]

    return `M ${point.x - 120} ${point.top} L ${point.x + 120} ${point.top} L ${point.x + 120} ${point.bottom} L ${point.x - 120} ${point.bottom} Z`
  }

  const topPath = buildFunnelCurvePath(points, (point) => point.top)
  const last = points[points.length - 1]
  const bottomPath = buildFunnelCurvePath(
    [...points].reverse(),
    (point) => point.bottom,
  ).replace(/^M\s+[\d.-]+\s+[\d.-]+/, `L ${last.x} ${last.bottom}`)

  return `${topPath} ${bottomPath} Z`
}

function getFunnelAttentionTone(stage) {
  const conversionRate = Number(stage.conversion_rate) || 0
  const target = Number(stage.target) || 0

  if (!target || conversionRate >= target) {
    return null
  }

  return conversionRate >= target * 0.85 ? 'warning' : 'critical'
}

function getFunnelStageStatus(stage) {
  const attentionTone = getFunnelAttentionTone(stage)

  if (attentionTone === 'critical') {
    return 'red'
  }

  if (attentionTone === 'warning') {
    return 'yellow'
  }

  return stage.status ?? 'green'
}

function FunnelStageDrilldownModal({ onClose, stage }) {
  const open = Boolean(stage)
  const status = stage ? getFunnelStageStatus(stage) : 'grey'
  const isPipelineSnapshot = isPipelineStageSnapshot(stage)
  const isReactivationLifecycle = isReactivationLifecycleSnapshot(stage)

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      open={open}
    >
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        {stage ? (
          <>
            <DialogHeader className="border-b border-island-border bg-material-chrome px-panel py-card text-left backdrop-blur-2xl">
              <DialogTitle>{getStageDisplayName(stage)}</DialogTitle>
              <DialogDescription>
                {isReactivationLifecycle
                  ? 'Current workload count from configured reactivation tags and fields.'
                  : isPipelineSnapshot
                  ? 'Current opportunity count in the configured GHL pipeline stage.'
                  : 'Funnel stage conversion, drop-off, target, and confidence.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-overlay-body gap-component overflow-y-auto px-panel pb-panel">
              <section className="grid gap-item pt-component">
                <div className="flex items-start justify-between gap-component">
                  <div>
                    <p className="text-data tabular-nums text-text-primary">{stage.stage_count}</p>
                    <p className="mt-tag text-label font-normal text-text-muted">
                      {isPipelineSnapshot || isReactivationLifecycle ? 'Current records' : `${stage.conversion_rate}% conversion`}
                    </p>
                  </div>
                  {isReactivationLifecycle ? (
                    <Badge tone="neutral">Current state</Badge>
                  ) : isPipelineSnapshot && stage.is_booked_stage ? (
                    <Badge tone="blue">Booked stage</Badge>
                  ) : (
                    <Badge tone={statusBadgeTone[status] ?? 'neutral'}>
                      {formatLabel(status)}
                    </Badge>
                  )}
                </div>
                {!isPipelineSnapshot && !isReactivationLifecycle ? (
                  <p className="text-ui text-text-secondary">
                    {getStatusExplanation(status, `${stage.target}% target`)}
                  </p>
                ) : null}
              </section>

              <DetailSection title={isReactivationLifecycle ? 'Lifecycle stage' : isPipelineSnapshot ? 'Pipeline stage' : 'Stage performance'}>
                <DetailRow label="Stage count" value={stage.stage_count} />
                {isReactivationLifecycle ? (
                  <>
                    <DetailRow label="Mode" value="Current state snapshot" />
                    <DetailRow label="Date range" value="Not applied" />
                    <DetailRow label="Key" value={stage.key} />
                  </>
                ) : isPipelineSnapshot ? (
                  <>
                    <DetailRow label="Pipeline" value={stage.pipeline_name} />
                    <DetailRow label="Calculation mode" value={formatLabel(stage.calculation_mode)} />
                    <DetailRow label="Position" value={stage.position} />
                    <DetailRow label="Booked stage" value={stage.is_booked_stage ? 'Yes' : 'No'} />
                  </>
                ) : (
                  <>
                    <DetailRow label="Input count" value={stage.input_count} />
                    <DetailRow label="Output count" value={stage.output_count} />
                    <DetailRow label="Conversion" value={`${stage.conversion_rate}%`} />
                    <DetailRow label="Drop-off count" value={stage.drop_off_count} />
                    <DetailRow label="Drop-off rate" value={stage.drop_off_rate} />
                    <DetailRow label="Target" value={stage.target ? `${stage.target}%` : ''} />
                  </>
                )}
              </DetailSection>

              <DetailSection title="Calculation">
                <DetailRow
                  label="Formula"
                  value={stage.formula || (isReactivationLifecycle
                    ? 'count current records matching this configured reactivation lifecycle state'
                    : isPipelineSnapshot
                    ? 'count current opportunities in this configured GHL pipeline stage'
                    : 'output count / input count * 100')}
                />
                <DetailRow label="Source" value={stage.source} />
                <DetailRow label="Confidence" value={formatLabel(stage.confidence)} />
                <DetailRow label="Raw stage name" value={stage.stage_name ?? stage.name} />
              </DetailSection>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function FunnelFlowChart({ funnelType, onOpenStageDetails, stages }) {
  const { points } = getFunnelGeometry(stages)
  const path = buildFunnelAreaPath(points)
  const isPipelineSnapshot = funnelType === 'pipeline_stage_snapshot'
  const isReactivationLifecycle = funnelType === 'reactivation_lifecycle'
  const isCurrentStateSnapshot = isPipelineSnapshot || isReactivationLifecycle

  if (!stages.length) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-block">
      <div className="min-w-[760px]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${stages.length}, minmax(120px, 1fr))`,
            paddingInline: '4.8%',
          }}
        >
          {stages.map((stage) => {
            const attentionTone = getFunnelAttentionTone(stage)
            const status = attentionTone === 'critical' ? 'red' : 'yellow'

            return (
              <div className="min-w-0 text-center" key={`${stage.stage_name}-label`}>
                <p className="text-data tabular-nums text-text-primary">{stage.stage_count}</p>
                <p className="mt-tag text-label font-semibold text-text-secondary">
                  <span className="inline-flex items-center justify-center gap-tag">
                    {getStageDisplayName(stage)}
                    {isPipelineSnapshot && stage.is_booked_stage ? (
                      <StatusChevron
                        label={`View ${getStageDisplayName(stage)} details`}
                        onClick={() => onOpenStageDetails(stage)}
                        status="green"
                        tooltip="Configured booked stage"
                      />
                    ) : isReactivationLifecycle ? (
                      <StatusChevron
                        label={`View ${getStageDisplayName(stage)} details`}
                        onClick={() => onOpenStageDetails(stage)}
                        status="grey"
                        tooltip="View stage details"
                      />
                    ) : null}
                    {!isCurrentStateSnapshot && attentionTone ? (
                      <StatusChevron
                        label={`View ${getStageDisplayName(stage)} details`}
                        onClick={() => onOpenStageDetails(stage)}
                        status={status}
                        tooltip="View stage details"
                      />
                    ) : null}
                  </span>
                </p>
                {!isCurrentStateSnapshot && hasFunnelConversion(stage) ? (
                  <p className="mt-tag text-label font-normal text-text-muted">
                    {stage.conversion_rate}% conversion
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>

        <svg
          aria-label="Patient funnel chart"
          className="mt-component h-[260px] w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          viewBox="0 0 1000 300"
        >
          <defs>
            <linearGradient id="patient-funnel-fill" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="var(--premium-blue)" />
              <stop offset="56%" stopColor="var(--premium-indigo)" />
              <stop offset="100%" stopColor="var(--premium-graphite)" />
            </linearGradient>
          </defs>
          <path d={path} fill="url(#patient-funnel-fill)" opacity="0.86" />
          {points.slice(1, -1).map((point) => (
            <line
              className="text-text-primary/15"
              key={`segment-boundary-${point.x}`}
              stroke="currentColor"
              strokeWidth="1"
              x1={point.x}
              x2={point.x}
              y1="10"
              y2="290"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

export function FunnelView({ emptyAction, funnel, funnelChart = null }) {
  const [selectedStage, setSelectedStage] = useState(null)
  const funnelType = funnelChart?.type ?? ''
  const isPipelineSnapshot = funnelType === 'pipeline_stage_snapshot'
  const isReactivationLifecycle = funnelType === 'reactivation_lifecycle'
  const rows = funnel
    .filter((stage) => {
      const isTreatmentStage = String(stage.stage_name ?? '').toLowerCase().includes('treatment accepted')
      const isVelocityStage = stage.unit === 'days' || String(stage.stage_name ?? '').toLowerCase().includes('funnel velocity')

      return !isVelocityStage && (isPipelineSnapshot || isReactivationLifecycle || !isTreatmentStage || !['low', 'unavailable'].includes(stage.confidence))
    })
    .map((stage) => ({
      ...stage,
      id: stage.id ?? stage.stage_name,
      funnel_type: funnelType,
    }))
  const treatmentUnavailable = !isPipelineSnapshot && funnel.some((stage) => (
    String(stage.stage_name ?? '').toLowerCase().includes('treatment accepted')
    && ['low', 'unavailable'].includes(stage.confidence)
  ))
  const treatmentPartial = !isPipelineSnapshot && funnel.some((stage) => (
    String(stage.stage_name ?? '').toLowerCase().includes('treatment accepted')
    && stage.confidence === 'medium'
  ))

  return (
    <>
      <section className="grid gap-component">
        <div className="rounded-block bg-block p-component">
          <div className="pb-component">
            <div>
              <h2 className="text-heading text-text-primary">
                {isReactivationLifecycle ? 'Reactivation Lifecycle' : isPipelineSnapshot ? 'Pipeline Funnel' : 'Patient Funnel'}
              </h2>
            </div>
          </div>
          {rows.length ? (
            <FunnelFlowChart
              funnelType={funnelType}
              onOpenStageDetails={setSelectedStage}
              stages={rows}
            />
          ) : (
            <ResourceState
              action={emptyAction}
              className="min-h-[164px]"
              errorInfo={{ kind: 'not-found' }}
              labels={{
                notFoundDescription: funnelChart?.reason
                  || 'Check Review Setup or calculate this period before the funnel can be shown.',
                notFoundTitle: isReactivationLifecycle
                  ? 'Reactivation lifecycle is not calculated yet'
                  : isPipelineSnapshot
                  ? 'Pipeline funnel is not calculated yet'
                  : 'Patient funnel is not calculated yet',
              }}
            />
          )}
          {(isPipelineSnapshot || isReactivationLifecycle) && funnelChart?.calculation_note ? (
            <p className="mt-component rounded-control bg-block-subtle p-control text-label font-normal text-text-muted">
              {funnelChart.calculation_note}
            </p>
          ) : null}
          {treatmentUnavailable ? (
            <p className="mt-component rounded-control bg-block-subtle p-control text-label font-normal text-text-muted">
              Treatment acceptance data is unavailable for this period, so the funnel stops at attended appointments.
            </p>
          ) : null}
          {treatmentPartial ? (
            <p className="mt-component rounded-control bg-block-subtle p-control text-label font-normal text-text-muted">
              Treatment acceptance is shown with partial PMS data. Treat this stage as directional, not exact.
            </p>
          ) : null}
        </div>
      </section>
      <FunnelStageDrilldownModal
        onClose={() => setSelectedStage(null)}
        stage={selectedStage}
      />
    </>
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
        {getMetricTargetLabel(metric) ? <span>{getMetricTargetLabel(metric)}</span> : null}
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
            {formatMetricValue(metric)}{getMetricTargetLabel(metric) ? ` | ${getMetricTargetLabel(metric)}` : ''}
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
            ...getMetricTargetMeta(metric),
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
                  {channel.bookings} bookings / {channel.leads} leads / ${channel.cost_per_booking || 0} CPB
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-control bg-fill-secondary">
                <div className="h-full rounded-control bg-action" style={{ width }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid gap-tag">
        <p className="text-label font-medium text-text-muted">Exact source numbers</p>
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
      <div className="relative h-2 rounded-full bg-fill-secondary">
        <div className="h-full rounded-full bg-action" style={{ width }} />
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-0.5 bg-text-primary/60"
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
            meta={getMetricTargetMeta(metric)}
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

const decisionStatusConfig = {
  pending: { tone: 'yellow', label: 'Pending' },
  resolved: { tone: 'green', label: 'Resolved' },
  approved: { tone: 'green', label: 'Approved' },
}

export function DecisionCards({ decisions }) {
  return (
    <section className="grid gap-component">
      <div>
        <h2 className="text-heading text-text-primary">Decisions Needed</h2>
      </div>
      <div className="grid gap-card lg:grid-cols-2">
        {decisions.slice(0, 3).map((decision) => {
          const statusCfg = decisionStatusConfig[decision.status] ?? { tone: 'yellow', label: formatLabel(decision.status) }

          return (
            <div
              className="grid content-start gap-component rounded-block bg-block p-component"
              key={decision.id}
            >
              <div className="flex items-start justify-between gap-control">
                <p className="text-ui font-semibold text-text-primary">{decision.title}</p>
                <TableBadge tone={statusCfg.tone}>{statusCfg.label}</TableBadge>
              </div>

              {decision.context ? (
                <p className="text-ui font-normal text-text-secondary">{decision.context}</p>
              ) : null}

              {decision.recommended_decision ? (
                <div className="grid gap-tag">
                  <p className="text-label font-medium text-text-muted">Recommendation</p>
                  <p className="mt-tag text-ui font-medium text-text-primary">{decision.recommended_decision}</p>
                </div>
              ) : null}

              {decision.estimated_impact ? (
                <p className="text-label font-normal text-text-secondary">
                  <span className="text-text-muted">Impact:</span>{' '}
                  {decision.estimated_impact}
                </p>
              ) : null}

              {(decision.owner || decision.decision_due_by) ? (
                <div className="flex flex-wrap items-center gap-x-control gap-y-tag text-label font-normal text-text-muted">
                  {decision.owner ? (
                    <span className="flex items-center gap-tag">
                      <Icon name="user" size={12} />
                      {decision.owner}
                    </span>
                  ) : null}
                  {decision.decision_due_by ? (
                    <span className="flex items-center gap-tag">
                      <Icon name="calendar" size={12} />
                      Due {decision.decision_due_by}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
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
