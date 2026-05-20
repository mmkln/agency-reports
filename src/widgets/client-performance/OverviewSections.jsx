import { useLocation, useNavigate } from 'react-router-dom'

import {
  NativeSelect,
  Panel,
  PanelBody,
  PrimitiveCard as Card,
  ProgressBar,
  StatusBadge,
} from '@/shared/ui'

import { Icon } from '../../shared/icons'
import {
  formatDate,
  formatDateTime,
  formatMetricLabel,
  formatMetricValue,
  formatLooseValue,
  getMetricStatusTone,
} from './formatters'

export function MetricCard({ metric }) {
  const deltaIsPositive = typeof metric.delta_pct === 'number' && metric.delta_pct >= 0

  return (
    <Card as="article" className="border-control-border bg-block shadow-none transition-colors hover:bg-block-subtle">
      <div className="p-card">
        <div className="flex items-start justify-between gap-3">
          <p className="text-ui text-text-secondary">{metric.label || metric.name || 'Metric'}</p>
          {metric.status ? <StatusBadge label={formatMetricLabel(metric.status)} tone={getMetricStatusTone(metric.status)} /> : null}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <strong className="text-data text-text-primary">{formatMetricValue(metric)}</strong>
          {typeof metric.delta_pct === 'number' ? (
            <span className={deltaIsPositive ? 'text-ui text-success-foreground' : 'text-ui text-destructive'}>
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
          <p className="mt-3 text-label text-text-muted">
            {metric.goal ? `Goal: ${formatLooseValue(metric.goal)}` : metric.benchmark}
          </p>
        ) : null}
        {metric.definition ? (
          <p className="mt-3 text-label font-normal text-text-muted">{metric.definition}</p>
        ) : null}
        {metric.source ? (
          <p className="mt-3 text-label text-text-quaternary">Source: {metric.source}</p>
        ) : null}
      </div>
    </Card>
  )
}

export function ExecutiveSummaryHero({ dashboard, executiveSummary, heroMetric }) {
  return (
    <Panel className="bg-action-muted">
      <PanelBody className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
        <div className="rounded-block bg-block p-5 shadow-block">
          <p className="text-label text-action">{heroMetric?.label || 'Hero metric'}</p>
          <strong className="mt-3 block text-display text-text-primary">{formatMetricValue(heroMetric)}</strong>
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
          {heroMetric?.definition ? <p className="mt-4 text-body text-text-secondary">{heroMetric.definition}</p> : null}
        </div>

        <div className="grid content-between gap-5">
          <div>
            <p className="text-label text-text-muted">
              {formatDate(dashboard.periodStart)} - {formatDate(dashboard.periodEnd)}
            </p>
            <h2 className="mt-2 text-heading text-text-primary">{dashboard.title}</h2>
            <p className="mt-3 max-w-readable text-body text-text-secondary">
              {executiveSummary.narrative || 'The team has not published an executive summary for this period yet.'}
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
    amber: 'bg-warning-muted',
    blue: 'bg-block',
    green: 'bg-success-muted',
  }[tone]

  return (
    <div className={`rounded-control p-4 ${toneClass}`}>
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-2 text-body text-text-primary">{value}</p>
    </div>
  )
}

export function TrustSignalStrip({ dashboard }) {
  return (
    <section className="grid gap-3 rounded-block border border-control-border bg-block px-4 py-3 text-ui text-text-secondary md:grid-cols-3">
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

export function StaleDataWarning({ freshness }) {
  if (!freshness?.isStale) {
    return null
  }

  return (
    <section className="flex items-start gap-3 rounded-block bg-warning-muted px-4 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-warning/15 text-warning-foreground">
        <Icon name="triangleAlert" size={16} />
      </span>
      <div>
        <h2 className="text-ui text-text-primary">Data may be stale</h2>
        <p className="mt-1 text-body text-text-secondary">
          This dashboard was last updated {freshness.label}. Review it with current source dashboards before making budget or operational decisions.
        </p>
      </div>
    </section>
  )
}

export function DashboardContextBar({ client, dashboard, mode, periods }) {
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
            <h2 className="text-data leading-tight text-text-primary">{client.name}</h2>
            <StatusBadge meta={dashboard.statusMeta} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-ui text-text-muted">
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
          <p className="text-label font-normal text-text-muted">
            {hasMultiplePeriods
              ? 'Published and archived dashboards are available here.'
              : 'Only one published dashboard is available.'}
          </p>
        </div>
      </div>
    </section>
  )
}
