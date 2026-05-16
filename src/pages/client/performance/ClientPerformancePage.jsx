import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import {
  PERFORMANCE_CHANNEL_META,
  PERFORMANCE_SERVICE_TYPE_META,
} from '../../../entities/performance-dashboard'
import { USER_ROLES } from '../../../entities/profile'
import { AccessDeniedState } from '../../../widgets/client-overview'
import { StackedBarLineChart } from '../../../shared/charts'
import {
  Button,
  EmptyState,
  NativeSelect,
  Panel,
  PanelBody,
  PanelHeader,
  PrimitiveCard as Card,
  StatusBadge,
  ProgressBar,
} from '@/shared/ui'
import { Icon } from '../../../shared/icons'
import { chartColors } from '../../../shared/theme'

function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function formatDateTime(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function formatMetricValue(metric) {
  if (!metric) {
    return 'Not set'
  }

  return `${metric.value ?? ''}${metric.unit ? ` ${metric.unit}` : ''}`.trim() || 'Not set'
}

function formatMetricLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatNumber(value, suffix = '') {
  if (typeof value !== 'number') {
    return 'n/a'
  }

  return `${new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`
}

function getMetricStatusTone(status) {
  return {
    ahead: 'green',
    behind: 'amber',
    neutral: 'neutral',
    on_track: 'blue',
  }[status] ?? 'neutral'
}

function getInsightTone(severity) {
  return {
    info: 'blue',
    positive: 'green',
    warning: 'amber',
  }[severity] ?? 'blue'
}

function formatLooseValue(value) {
  if (typeof value === 'number') {
    return formatNumber(value)
  }

  if (value === null || value === undefined || value === '') {
    return 'n/a'
  }

  return String(value)
}

function getGoalProgress(goal) {
  if (typeof goal?.target !== 'number' || typeof goal?.actual !== 'number' || goal.target <= 0) {
    return 0
  }

  return Math.round((goal.actual / goal.target) * 100)
}

function MetricCard({ metric }) {
  const deltaIsPositive = typeof metric.delta_pct === 'number' && metric.delta_pct >= 0

  return (
    <Card as="article" className="border-control-border bg-block shadow-none transition-colors hover:bg-block-subtle">
      <div className="p-card">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-text-secondary">{metric.label || metric.name || 'Metric'}</p>
          {metric.status ? <StatusBadge label={formatMetricLabel(metric.status)} tone={getMetricStatusTone(metric.status)} /> : null}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <strong className="text-3xl leading-9 text-text-primary">{formatMetricValue(metric)}</strong>
          {typeof metric.delta_pct === 'number' ? (
            <span className={deltaIsPositive ? 'text-sm font-semibold text-success-foreground' : 'text-sm font-semibold text-destructive'}>
              {metric.delta_pct >= 0 ? '+' : ''}{metric.delta_pct}%
            </span>
          ) : null}
        </div>
        {typeof metric.goal_pct === 'number' ? (
          <div className="mt-4">
            <ProgressBar label="Goal progress" value={metric.goal_pct} />
          </div>
        ) : null}
        {metric.goal || metric.benchmark ? (
          <p className="mt-3 text-xs font-medium text-text-muted">
            {metric.goal ? `Goal: ${formatLooseValue(metric.goal)}` : metric.benchmark}
          </p>
        ) : null}
        {metric.definition ? (
          <p className="mt-3 text-xs leading-5 text-text-muted">{metric.definition}</p>
        ) : null}
        {metric.source ? (
          <p className="mt-3 text-xs font-medium text-text-quaternary">Source: {metric.source}</p>
        ) : null}
      </div>
    </Card>
  )
}

function ExecutiveSummaryHero({ dashboard, executiveSummary, heroMetric }) {
  return (
    <Panel className="border-action/20 bg-action-muted">
      <PanelBody className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.35fr]">
        <div className="rounded-block border border-action/20 bg-block p-5 shadow-none">
          <p className="text-label text-action">{heroMetric?.label || 'Hero metric'}</p>
          <strong className="mt-3 block text-5xl leading-tight text-text-primary">{formatMetricValue(heroMetric)}</strong>
          <div className="mt-4 flex flex-wrap gap-tag">
            {typeof heroMetric?.delta_pct === 'number' ? (
              <StatusBadge
                label={`${heroMetric.delta_pct >= 0 ? '+' : ''}${heroMetric.delta_pct}% vs prior period`}
                tone={heroMetric.delta_pct >= 0 ? 'green' : 'amber'}
              />
            ) : null}
            {typeof heroMetric?.goal_pct === 'number' ? (
              <StatusBadge label={`${heroMetric.goal_pct}% of goal`} tone={heroMetric.goal_pct >= 100 ? 'green' : 'amber'} />
            ) : null}
          </div>
          {typeof heroMetric?.goal_pct === 'number' ? (
            <div className="mt-5">
              <ProgressBar label="Hero metric goal progress" tone={heroMetric.goal_pct >= 100 ? 'green' : 'blue'} value={heroMetric.goal_pct} />
            </div>
          ) : null}
          {heroMetric?.definition ? <p className="mt-4 text-sm leading-6 text-text-secondary">{heroMetric.definition}</p> : null}
        </div>

        <div className="grid content-between gap-5">
          <div>
            <p className="text-label text-text-muted">
              {formatDate(dashboard.periodStart)} - {formatDate(dashboard.periodEnd)}
            </p>
            <h2 className="mt-2 text-heading text-text-primary">{dashboard.title}</h2>
            <p className="mt-3 max-w-readable text-base leading-7 text-text-secondary">
              {executiveSummary.narrative || 'The agency has not published an executive summary for this period yet.'}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SummaryPoint label="Main win" tone="green" value={executiveSummary.main_win || 'Not provided yet.'} />
            <SummaryPoint label="Main issue" tone="amber" value={executiveSummary.main_issue || 'No issue noted.'} />
            <SummaryPoint label="Next focus" tone="blue" value={executiveSummary.next_focus || 'Not provided yet.'} />
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

function SummaryPoint({ label, tone, value }) {
  const toneClass = {
    amber: 'border-warning/20 bg-warning/10',
    blue: 'border-action/20 bg-block',
    green: 'border-success/20 bg-success/10',
  }[tone]

  return (
    <div className={`rounded-control border p-4 ${toneClass}`}>
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-2 text-sm leading-6 text-text-primary">{value}</p>
    </div>
  )
}

function TrustSignalStrip({ dashboard }) {
  return (
    <section className="grid gap-3 rounded-block border border-control-border bg-block px-4 py-3 text-sm text-text-secondary md:grid-cols-3">
      <div>
        <p className="text-label text-text-muted">Last updated</p>
        <p className="mt-1 font-medium text-text-primary">{formatDateTime(dashboard.lastUpdatedAt)}</p>
      </div>
      <div>
        <p className="text-label text-text-muted">Sources</p>
        <p className="mt-1 font-medium text-text-primary">{dashboard.sourceSummary || 'Not provided'}</p>
      </div>
      <div>
        <p className="text-label text-text-muted">Attribution</p>
        <p className="mt-1 font-medium text-text-primary">{dashboard.attributionNote || 'No attribution note provided'}</p>
      </div>
    </section>
  )
}

function StaleDataWarning({ freshness }) {
  if (!freshness?.isStale) {
    return null
  }

  return (
    <section className="flex items-start gap-3 rounded-block border border-warning/25 bg-warning/10 px-4 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-warning/15 text-warning-foreground">
        <Icon name="triangleAlert" size={16} />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Data may be stale</h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          This dashboard was last updated {freshness.label}. Review it with current source dashboards before making budget or operational decisions.
        </p>
      </div>
    </section>
  )
}

function DashboardContextBar({ client, dashboard, mode, periods }) {
  const location = useLocation()
  const navigate = useNavigate()
  const hasMultiplePeriods = periods.length > 1

  function changePeriod(event) {
    const params = new URLSearchParams(location.search)
    params.set('clientId', client.id)
    params.set('performancePeriodId', event.target.value)
    navigate(`${location.pathname}?${params.toString()}`)
  }

  return (
    <section className="rounded-block border border-control-border bg-block p-5 shadow-none">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-label text-text-muted">{mode === 'admin_preview' ? 'Client preview' : 'Client performance'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold leading-tight text-text-primary">{client.name}</h2>
            <StatusBadge meta={dashboard.statusMeta} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-muted">
            <span>{formatDate(dashboard.periodStart)} - {formatDate(dashboard.periodEnd)}</span>
            {dashboard.accountManager ? <span>Account manager: {dashboard.accountManager}</span> : null}
            {dashboard.publishedAt ? <span>Published {formatDate(dashboard.publishedAt)}</span> : null}
          </div>
        </div>

        <div className="grid gap-2 lg:min-w-72">
          <label className="text-label text-text-muted" htmlFor="performance-period-selector">
            Dashboard period
          </label>
          <NativeSelect
            disabled={!hasMultiplePeriods}
            id="performance-period-selector"
            onChange={changePeriod}
            value={dashboard.id}
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.title} ({formatDate(period.periodStart)} - {formatDate(period.periodEnd)})
              </option>
            ))}
          </NativeSelect>
          <p className="text-xs leading-5 text-text-muted">
            {hasMultiplePeriods
              ? 'Published and archived dashboards are available here.'
              : 'Only one client-visible dashboard is available.'}
          </p>
        </div>
      </div>
    </section>
  )
}

function GoalsSection({ goals }) {
  if (!goals?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Targets anchor performance so numbers are not shown without context."
        title="Goals vs Actual"
      />
      <PanelBody className="grid gap-component md:grid-cols-2">
        {goals.map((goal, index) => {
          const progress = getGoalProgress(goal)

          return (
            <div className="grid gap-3 rounded-control border border-control-border bg-block-subtle p-4" key={goal.id || `${goal.name}-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">{goal.name || goal.metric}</p>
                  {goal.note ? <p className="mt-1 text-sm leading-5 text-text-secondary">{goal.note}</p> : null}
                </div>
                <StatusBadge label={formatMetricLabel(goal.status ?? 'on_track')} tone={getMetricStatusTone(goal.status)} />
              </div>
              <ProgressBar
                label={`${goal.name || goal.metric} progress`}
                tone={progress >= 100 ? 'green' : goal.status === 'behind' ? 'orange' : 'blue'}
                value={progress}
              />
              <p className="text-xs text-text-muted">
                Actual {goal.actual ?? 'n/a'} / Target {goal.target ?? 'n/a'}
              </p>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

const funnelFields = [
  ['spend', 'Spend'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['visitors', 'Visitors'],
  ['leads', 'Leads'],
  ['qualified_leads', 'Qualified leads'],
  ['booked_calls', 'Booked calls'],
  ['sales', 'Sales'],
  ['revenue', 'Revenue'],
]

function FunnelSection({ funnel }) {
  const populatedStages = funnelFields
    .map(([fieldName, label]) => ({
      label,
      value: funnel?.[fieldName],
    }))
    .filter((stage) => typeof stage.value === 'number')

  if (!populatedStages.length) {
    return null
  }

  const maxValue = Math.max(...populatedStages.map((stage) => stage.value), 1)

  return (
    <Panel>
      <PanelHeader
        subtitle="Shows where attention turns into leads, sales, or revenue."
        title="Funnel"
      />
      <PanelBody className="grid gap-3">
        {populatedStages.map((stage) => (
          <div className="grid gap-2 rounded-control bg-block-subtle p-3" key={stage.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-text-primary">{stage.label}</span>
              <span className="font-semibold text-text-secondary">{formatNumber(stage.value)}</span>
            </div>
            <ProgressBar
              label={`${stage.label} funnel value`}
              value={Math.max(4, Math.round((stage.value / maxValue) * 100))}
            />
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function ChannelBreakdownSection({ channels }) {
  if (!channels?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Channel-level outcomes and efficiency, with client-facing context."
        title="Channel Breakdown"
      />
      <PanelBody className="grid gap-component">
        {channels.map((channel, index) => (
          <div className="rounded-block border border-control-border bg-block p-4 shadow-none" key={channel.id || `${channel.channel}-${index}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {PERFORMANCE_CHANNEL_META[channel.channel]?.label ?? channel.channel ?? 'Channel'}
                </h3>
                {channel.summary ? (
                  <p className="mt-2 max-w-readable text-sm leading-6 text-text-secondary">{channel.summary}</p>
                ) : null}
              </div>
              {typeof channel.roas === 'number' ? (
                <StatusBadge label={`${formatNumber(channel.roas)} ROAS`} tone={channel.roas >= 2 ? 'green' : 'amber'} />
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <SmallMetric label="Spend" value={formatNumber(channel.spend)} />
              <SmallMetric label="Qualified leads" value={formatNumber(channel.qualified_leads)} />
              <SmallMetric label="Revenue" value={formatNumber(channel.revenue)} />
              <SmallMetric label="CPL" value={formatNumber(channel.cpl)} />
              <SmallMetric label="CVR" value={formatNumber(channel.conversion_rate, '%')} />
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-control bg-surface-subtle px-3 py-2">
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-1 font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function getCampaignToneClasses(tone) {
  return {
    amber: 'border-warning/20 bg-warning/10 text-warning-foreground',
    blue: 'border-action/20 bg-action-muted text-action',
    green: 'border-success/20 bg-success/10 text-success-foreground',
    neutral: 'border-control-border bg-surface-subtle text-text-secondary',
    orange: 'border-warning/20 bg-warning/10 text-warning-foreground',
    purple: 'border-accent/20 bg-accent/10 text-accent-foreground',
    red: 'border-destructive/20 bg-destructive/10 text-destructive',
  }[tone] ?? 'border-control-border bg-surface-subtle text-text-secondary'
}

function getCampaignTextClass(tone) {
  return {
    amber: 'text-warning-foreground',
    blue: 'text-action',
    green: 'text-success-foreground',
    neutral: 'text-text-primary',
    orange: 'text-warning-foreground',
    purple: 'text-accent-foreground',
    red: 'text-destructive',
  }[tone] ?? 'text-text-primary'
}

function getCampaignTotals(series = []) {
  return series.reduce((totals, point) => ({
    bookings: Number(point.cumulative_bookings) || totals.bookings,
    email: totals.email + (Number(point.email) || 0),
    managerCalls: totals.managerCalls + (Number(point.manager_calls) || 0),
    sms: totals.sms + (Number(point.sms) || 0),
  }), {
    bookings: 0,
    email: 0,
    managerCalls: 0,
    sms: 0,
  })
}

function findCampaignKpi(kpis = [], keyword) {
  return kpis.find((kpi) => String(kpi.label ?? '').toLowerCase().includes(keyword)) ?? null
}

function CampaignKpiCard({ kpi }) {
  return (
    <div className="rounded-block border border-control-border bg-block p-4 shadow-none">
      <p className="text-sm font-medium text-text-secondary">{kpi.label || 'Metric'}</p>
      <p className={`mt-2 text-3xl font-semibold leading-none ${getCampaignTextClass(kpi.tone)}`}>
        {formatLooseValue(kpi.value)}{kpi.unit ? ` ${kpi.unit}` : ''}
      </p>
      {kpi.helper_text ? <p className="mt-2 text-xs leading-5 text-text-muted">{kpi.helper_text}</p> : null}
    </div>
  )
}

function CampaignPlanSummary({ campaign, totals }) {
  const bookingsKpi = findCampaignKpi(campaign.kpis, 'booking')
  const durationKpi = findCampaignKpi(campaign.kpis, 'duration')
  const totalTouches = totals.sms + totals.email + totals.managerCalls

  return (
    <div className="grid gap-4 rounded-block border border-action/20 bg-action-muted p-5 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-label text-action">Campaign model</p>
        <h3 className="mt-2 text-xl font-semibold text-text-primary">
          {campaign.title || 'Campaign Execution'}
        </h3>
        <p className="mt-2 max-w-readable text-sm leading-6 text-text-secondary">
          {campaign.subtitle || 'Planned outreach volume, phased campaign execution, and projected bookings over time.'}
        </p>
      </div>
      <div className="grid min-w-60 gap-3 rounded-control border border-action/15 bg-block p-4">
        <div>
          <p className="text-label text-text-muted">Projected outcome</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {bookingsKpi ? formatLooseValue(bookingsKpi.value) : formatNumber(totals.bookings)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-separator pt-3">
          <SmallMetric label="Total touches" value={formatNumber(totalTouches)} />
          <SmallMetric label="Duration" value={durationKpi ? formatLooseValue(durationKpi.value) : `${campaign.activity_series?.length ?? 0} days`} />
        </div>
      </div>
    </div>
  )
}

function CampaignTracks({ tracks }) {
  if (!tracks?.length) {
    return null
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Execution tracks</h3>
        <p className="text-xs text-text-muted">{tracks.length} stages</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {tracks.map((track, index) => (
          <div
            className={`rounded-control border px-4 py-3 text-center text-sm font-semibold ${getCampaignToneClasses(track.tone)}`}
            key={track.id || `${track.label}-${index}`}
          >
            {track.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function CampaignChartLegend({ bars, line }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
      {bars.map((bar) => (
        <span className="inline-flex items-center gap-2" key={bar.key}>
          <span className="size-3 rounded-[3px]" style={{ backgroundColor: bar.color }} />
          {bar.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-2">
        <span className="h-0 w-7 border-t-2 border-dashed" style={{ borderColor: line.color }} />
        {line.label}
      </span>
    </div>
  )
}

function CampaignExecutionSection({ campaign }) {
  const hasCampaignData = campaign?.kpis?.length
    || campaign?.tracks?.length
    || campaign?.activity_series?.length

  if (!hasCampaignData) {
    return null
  }

  const chartData = campaign.activity_series ?? []
  const maxTouches = Math.max(
    1,
    ...chartData.map((point) => (
      (Number(point.sms) || 0)
      + (Number(point.email) || 0)
      + (Number(point.manager_calls) || 0)
    )),
  )
  const maxBookings = Math.max(
    1,
    ...chartData.map((point) => Number(point.cumulative_bookings) || 0),
  )
  const bars = [
    { color: chartColors.primary, key: 'sms', label: 'SMS' },
    { color: chartColors.teal, key: 'email', label: 'Email' },
    { color: chartColors.rose, key: 'manager_calls', label: 'Manager calls' },
  ]
  const line = {
    color: chartColors.amber,
    key: 'cumulative_bookings',
    label: 'Cumulative bookings',
  }
  const totals = getCampaignTotals(chartData)

  return (
    <Panel className="min-w-0">
      <PanelHeader
        subtitle="A client-readable view of campaign volume, staged outreach, and expected booking lift."
        title="Campaign Execution"
      />
      <PanelBody className="grid min-w-0 gap-6">
        <CampaignPlanSummary campaign={campaign} totals={totals} />

        {campaign.kpis?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {campaign.kpis.map((kpi, index) => (
              <CampaignKpiCard key={kpi.id || `${kpi.label}-${index}`} kpi={kpi} />
            ))}
          </div>
        ) : null}

        <CampaignTracks tracks={campaign.tracks} />

        {chartData.length ? (
          <div className="min-w-0 rounded-block border border-control-border bg-block p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Touch volume and booking projection</h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  Bars show daily outreach volume. The dashed line shows cumulative projected bookings.
                </p>
              </div>
              <CampaignChartLegend bars={bars} line={line} />
            </div>
            <div className="w-full max-w-full overflow-x-auto pb-2">
              <StackedBarLineChart
                ariaLabel="Campaign touchpoints and cumulative bookings"
                bars={bars}
                data={chartData}
                leftAxisLabel={campaign.left_axis_label || 'Touches per day'}
                line={line}
                rightAxisLabel={campaign.right_axis_label || 'Cumulative bookings'}
                xKey="label"
                yLeftMax={Math.ceil(maxTouches / 10) * 10}
                yRightMax={Math.ceil(maxBookings / 5) * 5}
              />
            </div>
          </div>
        ) : null}

        {campaign.assumptions?.length ? (
          <div className="flex items-start gap-3 rounded-control border border-control-border bg-surface-subtle px-4 py-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-control bg-block text-text-quaternary ring-1 ring-control-border">
              <Icon name="circleAlert" size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Planning assumptions</p>
              <div className="mt-1 grid gap-1">
                {campaign.assumptions.map((assumption) => (
                  <p className="text-sm leading-6 text-text-muted" key={assumption}>{assumption}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

function TrendSeriesSection({ trends }) {
  if (!trends?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Shows direction over time with prior-period context and key change annotations."
        title="Performance Trends"
      />
      <PanelBody className="grid gap-component">
        {trends.map((trend, index) => {
          const latestPoint = trend.series?.at?.(-1)

          return (
            <div className="rounded-control border border-control-border bg-block-subtle p-4" key={trend.id || `${trend.metric}-${index}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{trend.metric || 'Trend metric'}</h3>
                  <p className="mt-1 text-xs text-text-muted">{trend.granularity ?? 'period'} trend</p>
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">{formatLooseValue(latestPoint?.value)}</span>
                  {typeof trend.goal_value === 'number' ? <span> / goal {formatNumber(trend.goal_value)}</span> : null}
                </div>
              </div>
              {trend.series?.length ? <TrendBars series={trend.series} /> : null}
              {trend.annotations?.length ? (
                <div className="mt-4 grid gap-2 border-t border-separator pt-3">
                  {trend.annotations.map((annotation) => (
                    <p className="text-xs leading-5 text-text-secondary" key={`${annotation.date}-${annotation.label}`}>
                      <strong className="text-text-primary">{formatDate(annotation.date)}:</strong> {annotation.label}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}

function TrendBars({ series }) {
  const numericValues = series
    .map((point) => point.value)
    .filter((value) => typeof value === 'number')
  const maxValue = Math.max(...numericValues, 1)

  return (
    <div className="mt-4 grid gap-2">
      {series.map((point) => {
        const barValue = typeof point.value === 'number'
          ? Math.max(4, Math.round((point.value / maxValue) * 100))
          : 0

        return (
          <div className="grid gap-1.5" key={`${point.date}-${point.value}`}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-text-muted">{formatDate(point.date)}</span>
              <span className="font-medium text-text-primary">{formatLooseValue(point.value)}</span>
            </div>
            <ProgressBar label={`${point.date} trend value`} showLabel={false} value={barValue} />
          </div>
        )
      })}
    </div>
  )
}

function ServiceSectionsSection({ sections }) {
  if (!sections?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Service-specific interpretation for clients who need a deeper channel read."
        title="Service Details"
      />
      <PanelBody className="grid gap-component">
        {sections.map((section, index) => (
          <div className="rounded-control border border-control-border bg-block-subtle p-4" key={section.id || `${section.service_type}-${index}`}>
            <h3 className="text-sm font-semibold text-text-primary">
              {PERFORMANCE_SERVICE_TYPE_META[section.service_type]?.label ?? section.service_type ?? 'Service'}
            </h3>
            {section.summary ? <p className="mt-2 text-sm leading-6 text-text-secondary">{section.summary}</p> : null}
            {section.metrics && Object.keys(section.metrics).length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(section.metrics).map(([metricName, value]) => (
                  <div key={metricName}>
                    <p className="text-label text-text-muted">{metricName.replaceAll('_', ' ')}</p>
                    <p className="mt-1 font-semibold text-text-primary">{formatLooseValue(value)}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {section.insights?.length ? (
              <div className="mt-4 grid gap-2">
                {section.insights.map((insight) => (
                  <p className="text-sm leading-6 text-text-secondary" key={insight}>- {insight}</p>
                ))}
              </div>
            ) : null}
            {section.next_actions?.length ? (
              <div className="mt-4 border-t border-separator pt-3">
                <p className="text-label text-text-muted">Next actions</p>
                <div className="mt-2 grid gap-2">
                  {section.next_actions.map((action) => (
                    <p className="text-sm leading-6 text-text-secondary" key={action}>- {action}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function AppendixTablesSection({ tables }) {
  if (!tables?.length) {
    return null
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Optional drill-down detail for top performers and supporting evidence."
        title="Appendix"
      />
      <PanelBody className="grid gap-component">
        {tables.map((table, index) => (
          <div className="overflow-hidden rounded-control border border-control-border" key={table.id || `${table.title}-${index}`}>
            <div className="border-b border-separator bg-block-subtle px-4 py-3">
              <h3 className="text-sm font-semibold text-text-primary">{table.title || 'Appendix table'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                {table.columns?.length ? (
                  <thead className="bg-surface-subtle text-xs uppercase text-text-muted">
                    <tr>
                      {table.columns.map((column) => (
                        <th className="px-4 py-3 font-semibold" key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody className="divide-y divide-separator">
                  {table.rows?.length ? table.rows.map((row, rowIndex) => (
                    <tr key={`${table.id || table.title}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td className="px-4 py-3 text-text-secondary" key={`${cell}-${cellIndex}`}>{formatLooseValue(cell)}</td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-4 py-3 text-text-muted" colSpan={table.columns?.length || 1}>No rows added.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function WorkTaskRow({ task }) {
  return (
    <article className="flex items-start justify-between gap-4 rounded-control border border-control-border bg-block-subtle p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{task.title}</h3>
          <StatusBadge meta={task.statusMeta} />
        </div>
        <p className="mt-2 text-xs leading-5 text-text-muted">
          {task.assigneeName ? `Owner: ${task.assigneeName}` : 'Owner not set'}
          {task.dueDate ? ` - Due ${formatDate(task.dueDate)}` : ''}
        </p>
      </div>
    </article>
  )
}

function WorkTextRow({ text }) {
  return (
    <article className="flex items-start gap-3 rounded-control border border-control-border bg-block-subtle p-4">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name="checkCircle2" size={13} />
      </span>
      <p className="text-sm leading-6 text-text-primary">{text}</p>
    </article>
  )
}

function UpdateSummaryRow({ update }) {
  return (
    <article className="rounded-control border border-control-border bg-block-subtle p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{update.title}</h3>
        <span className="shrink-0 text-xs text-text-muted">{formatDate(update.updatedAt)}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{update.body}</p>
    </article>
  )
}

function WhatWeDidSection({ agencyWork, workSummary }) {
  const manualCompleted = agencyWork?.completed ?? []
  const manualActive = agencyWork?.active ?? []
  const manualNext = agencyWork?.next ?? []
  const recentUpdates = workSummary?.recentUpdates ?? []
  const completedTasks = workSummary?.completedTasks ?? []
  const activeTasks = workSummary?.activeTasks ?? []
  const hasWork = recentUpdates.length
    || completedTasks.length
    || activeTasks.length
    || manualCompleted.length
    || manualActive.length
    || manualNext.length

  if (!hasWork) {
    return (
      <Panel>
        <PanelHeader
          subtitle="Client-visible agency execution will appear here once the team publishes updates or completed work."
          title="What We Did"
        />
        <PanelBody>
          <p className="text-sm text-text-muted">No client-visible work summary has been published yet.</p>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader
        subtitle="Client-visible execution context from the status hub, shown beside performance outcomes."
        title="What We Did"
      />
      <PanelBody className="grid gap-6">
        {recentUpdates.length ? (
          <div className="grid gap-3">
            <h3 className="text-label text-text-muted">Latest client-visible portal updates</h3>
            {recentUpdates.map((update) => (
              <UpdateSummaryRow key={update.id} update={update} />
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-3">
            <h3 className="text-label text-text-muted">Completed this period</h3>
            {manualCompleted.map((item) => (
              <WorkTextRow key={item} text={item} />
            ))}
            {completedTasks.map((task) => (
              <WorkTaskRow key={task.id} task={task} />
            ))}
            {!manualCompleted.length && !completedTasks.length ? (
              <p className="rounded-control border border-control-border bg-block-subtle p-4 text-sm text-text-muted">
                No completed client-visible tasks are available for this period.
              </p>
            ) : null}
          </div>
          <div className="grid content-start gap-3">
            <h3 className="text-label text-text-muted">Active now</h3>
            {manualActive.map((item) => (
              <WorkTextRow key={item} text={item} />
            ))}
            {activeTasks.map((task) => (
              <WorkTaskRow key={task.id} task={task} />
            ))}
            {!manualActive.length && !activeTasks.length ? (
              <p className="rounded-control border border-control-border bg-block-subtle p-4 text-sm text-text-muted">
                No active client-visible tasks are open right now.
              </p>
            ) : null}
          </div>
        </div>

        {manualNext.length ? (
          <div className="grid gap-3">
            <h3 className="text-label text-text-muted">Planned next</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {manualNext.map((item) => (
                <WorkTextRow key={item} text={item} />
              ))}
            </div>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}

function BulletPanel({ items, title, emptyText, renderItem }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        {items?.length ? (
          <div className="grid gap-component">
            {items.map(renderItem)}
          </div>
        ) : (
          <p className="text-sm text-text-muted">{emptyText}</p>
        )}
      </PanelBody>
    </Panel>
  )
}

function InsightCard({ insight, index }) {
  return (
    <div className="rounded-control border border-control-border bg-block-subtle p-4" key={insight.id || `${insight.title}-${index}`}>
      <div className="flex items-center gap-2">
        <StatusBadge label={formatMetricLabel(insight.severity ?? 'info')} tone={getInsightTone(insight.severity)} />
        <h3 className="text-sm font-semibold text-text-primary">{insight.title || 'Insight'}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{insight.body}</p>
      {insight.chart_ref ? <p className="mt-3 text-xs text-text-muted">Related: {insight.chart_ref}</p> : null}
    </div>
  )
}

function NextStepCard({ step, index }) {
  return (
    <div className="rounded-control border border-control-border bg-block-subtle p-4" key={step.id || `${step.title}-${index}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">{step.title || 'Next action'}</h3>
        <StatusBadge label={formatMetricLabel(step.priority ?? 'medium')} tone={step.priority === 'high' ? 'amber' : 'neutral'} />
      </div>
      {step.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p> : null}
      <p className="mt-3 text-xs text-text-muted">
        {step.owner ? `Owner: ${step.owner}` : 'Owner not set'}
        {step.due_date ? ` - Due ${formatDate(step.due_date)}` : ''}
      </p>
    </div>
  )
}

function ClientActionCard({ action }) {
  return (
    <div className="rounded-control border border-warning/20 bg-warning/10 p-4" key={action.id}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-control bg-warning/20 text-warning-foreground">
          <Icon name="warning" size={15} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{action.title}</h3>
          {action.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{action.description}</p> : null}
          <p className="mt-3 text-xs font-medium text-warning-foreground">Due {formatDate(action.dueDate)}</p>
        </div>
      </div>
    </div>
  )
}

export function ClientPerformancePage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const periodId = routeParams.performancePeriodId ?? routeParams.periodId
  const mode = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client'
  const page = getClientPerformanceDashboardPage({
    clientId,
    mode,
    periodId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  const dashboard = page.performanceDashboard

  if (!dashboard) {
    return (
      <EmptyState
        description="The agency is preparing the performance dashboard for this client. Published analytics will appear here once reviewed."
        iconName="layoutDashboard"
        title="Performance dashboard is being prepared"
      />
    )
  }

  const content = dashboard.content ?? {}
  const executiveSummary = content.executive_summary ?? {}
  const heroMetric = content.hero_metric ?? null
  const kpiCards = content.kpi_cards ?? []
  const insights = content.insights ?? []
  const nextSteps = content.next_steps ?? []

  return (
    <div className="grid gap-6">
      <DashboardContextBar
        client={page.client}
        dashboard={dashboard}
        mode={mode}
        periods={page.periods}
      />

      <div className="flex flex-wrap gap-tag">
        <StatusBadge meta={dashboard.dataConfidenceMeta} />
        <StatusBadge meta={dashboard.dataModeMeta} />
      </div>

      <ExecutiveSummaryHero
        dashboard={dashboard}
        executiveSummary={executiveSummary}
        heroMetric={heroMetric}
      />

      <TrustSignalStrip dashboard={dashboard} />

      <StaleDataWarning freshness={dashboard.freshness} />

      {kpiCards.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((metric, index) => (
            <MetricCard key={metric.id || `${metric.label}-${index}`} metric={metric} />
          ))}
        </section>
      ) : null}

      <CampaignExecutionSection campaign={content.campaign_execution} />

      <GoalsSection goals={content.goals} />

      <TrendSeriesSection trends={content.trends} />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <FunnelSection funnel={content.funnel} />
        <ChannelBreakdownSection channels={content.channel_breakdown} />
      </div>

      <ServiceSectionsSection sections={content.service_sections} />

      <WhatWeDidSection agencyWork={content.agency_work} workSummary={page.workSummary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No insights have been added yet."
          items={insights}
          renderItem={(insight, index) => <InsightCard index={index} insight={insight} key={insight.id || `${insight.title}-${index}`} />}
          title="What Changed"
        />

        <BulletPanel
          emptyText="No next actions have been added yet."
          items={nextSteps}
          renderItem={(step, index) => <NextStepCard index={index} key={step.id || `${step.title}-${index}`} step={step} />}
          title="Next Actions"
        />
      </div>

      <AppendixTablesSection tables={content.appendix_tables} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No client actions are open right now."
          items={page.neededFromClient}
          renderItem={(action) => <ClientActionCard action={action} key={action.id} />}
          title="Needed From Client"
        />

        <Panel>
          <PanelHeader title="Source Links & Latest Report" />
          <PanelBody className="grid gap-component">
            {page.sourceLinks?.length ? (
              <div className="grid gap-2">
                {page.sourceLinks.map((sourceLink) => (
                  <Button asChild key={sourceLink.id} variant="outline">
                    <a href={sourceLink.publicUrl || sourceLink.embedUrl} rel="noreferrer" target="_blank">
                      <Icon name="layoutDashboard" size={15} />
                      {sourceLink.name}
                    </a>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No external source links are published yet.</p>
            )}

            {page.latestReport ? (
              <div className="rounded-control border border-control-border bg-block-subtle p-4">
                <p className="text-sm font-semibold text-text-primary">{page.latestReport.title}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(page.latestReport.periodStart)} - {formatDate(page.latestReport.periodEnd)}
                </p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{page.latestReport.summary}</p>
                <Button asChild className="mt-3" size="sm" variant="outline">
                  <Link to={`/client/reports?clientId=${clientId}&reportId=${page.latestReport.id}`}>
                    Read report
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-text-muted">No published report yet.</p>
            )}
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
