import { Link } from 'react-router-dom'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import {
  PERFORMANCE_CHANNEL_META,
  PERFORMANCE_SERVICE_TYPE_META,
} from '../../../entities/performance-dashboard'
import { USER_ROLES } from '../../../entities/profile'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PrimitiveCard as Card,
  StatusBadge,
  ProgressBar,
} from '@/shared/ui'
import { Icon } from '../../../shared/icons'

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
      <div className="flex flex-wrap gap-tag">
        <StatusBadge meta={dashboard.statusMeta} />
        <StatusBadge meta={dashboard.dataConfidenceMeta} />
        <StatusBadge meta={dashboard.dataModeMeta} />
      </div>

      <ExecutiveSummaryHero
        dashboard={dashboard}
        executiveSummary={executiveSummary}
        heroMetric={heroMetric}
      />

      <TrustSignalStrip dashboard={dashboard} />

      {kpiCards.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((metric, index) => (
            <MetricCard key={metric.id || `${metric.label}-${index}`} metric={metric} />
          ))}
        </section>
      ) : null}

      <GoalsSection goals={content.goals} />

      <TrendSeriesSection trends={content.trends} />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <FunnelSection funnel={content.funnel} />
        <ChannelBreakdownSection channels={content.channel_breakdown} />
      </div>

      <ServiceSectionsSection sections={content.service_sections} />

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
