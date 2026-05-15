import { Link } from 'react-router-dom'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import { PERFORMANCE_CHANNEL_META } from '../../../entities/performance-dashboard'
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

function formatNumber(value, suffix = '') {
  if (typeof value !== 'number') {
    return 'n/a'
  }

  return `${new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`
}

function getGoalProgress(goal) {
  if (typeof goal?.target !== 'number' || typeof goal?.actual !== 'number' || goal.target <= 0) {
    return 0
  }

  return Math.round((goal.actual / goal.target) * 100)
}

function MetricCard({ metric }) {
  return (
    <Card as="article" className="border-control-border bg-block shadow-none">
      <div className="p-card">
        <p className="text-sm font-medium text-text-secondary">{metric.label || metric.name || 'Metric'}</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <strong className="text-3xl leading-9 text-text-primary">{formatMetricValue(metric)}</strong>
          {typeof metric.delta_pct === 'number' ? (
            <span className={metric.delta_pct >= 0 ? 'text-sm font-semibold text-success-foreground' : 'text-sm font-semibold text-destructive'}>
              {metric.delta_pct >= 0 ? '+' : ''}{metric.delta_pct}%
            </span>
          ) : null}
        </div>
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
      <PanelBody className="grid gap-component">
        {goals.map((goal, index) => {
          const progress = getGoalProgress(goal)

          return (
            <div className="grid gap-2" key={goal.id || `${goal.name}-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">{goal.name || goal.metric}</p>
                  {goal.note ? <p className="mt-1 text-sm leading-5 text-text-secondary">{goal.note}</p> : null}
                </div>
                <StatusBadge label={goal.status?.replaceAll('_', ' ') ?? 'On track'} tone={goal.status === 'behind' ? 'amber' : 'green'} />
              </div>
              <ProgressBar label={`${goal.name || goal.metric} progress`} value={progress} />
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
          <div className="grid gap-2" key={stage.label}>
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
          <div className="rounded-control border border-control-border bg-block-subtle p-4" key={channel.id || `${channel.channel}-${index}`}>
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
              <div>
                <p className="text-label text-text-muted">Spend</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(channel.spend)}</p>
              </div>
              <div>
                <p className="text-label text-text-muted">Qualified leads</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(channel.qualified_leads)}</p>
              </div>
              <div>
                <p className="text-label text-text-muted">Revenue</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(channel.revenue)}</p>
              </div>
              <div>
                <p className="text-label text-text-muted">CPL</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(channel.cpl)}</p>
              </div>
              <div>
                <p className="text-label text-text-muted">CVR</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(channel.conversion_rate, '%')}</p>
              </div>
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
      <Panel>
        <PanelBody className="grid gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-label text-text-muted">
                {formatDate(dashboard.periodStart)} - {formatDate(dashboard.periodEnd)}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-text-primary">{dashboard.title}</h2>
              {executiveSummary.narrative ? (
                <p className="mt-3 max-w-readable text-base leading-7 text-text-secondary">{executiveSummary.narrative}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-tag lg:justify-end">
              <StatusBadge meta={dashboard.statusMeta} />
              <StatusBadge meta={dashboard.dataConfidenceMeta} />
              <StatusBadge meta={dashboard.dataModeMeta} />
            </div>
          </div>

          <div className="grid gap-component lg:grid-cols-[1.1fr_2fr]">
            <Card className="border-action/20 bg-action-muted shadow-none">
              <div className="p-card">
                <p className="text-sm font-medium text-action">{heroMetric?.label || 'Hero metric'}</p>
                <strong className="mt-2 block text-4xl leading-tight text-text-primary">{formatMetricValue(heroMetric)}</strong>
                {typeof heroMetric?.goal_pct === 'number' ? (
                  <p className="mt-2 text-sm text-text-secondary">{heroMetric.goal_pct}% of goal</p>
                ) : null}
              </div>
            </Card>

            <div className="grid gap-component md:grid-cols-3">
              <div className="rounded-block border border-control-border bg-block p-card">
                <p className="text-label text-text-muted">Main win</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{executiveSummary.main_win || 'Not provided yet.'}</p>
              </div>
              <div className="rounded-block border border-control-border bg-block p-card">
                <p className="text-label text-text-muted">Main issue</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{executiveSummary.main_issue || 'No issue noted.'}</p>
              </div>
              <div className="rounded-block border border-control-border bg-block p-card">
                <p className="text-label text-text-muted">Next focus</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{executiveSummary.next_focus || 'Not provided yet.'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 rounded-control border border-control-border bg-surface-subtle p-3 text-sm text-text-secondary">
            <p><strong className="text-text-primary">Last updated:</strong> {formatDateTime(dashboard.lastUpdatedAt)}</p>
            {dashboard.sourceSummary ? <p><strong className="text-text-primary">Sources:</strong> {dashboard.sourceSummary}</p> : null}
            {dashboard.attributionNote ? <p><strong className="text-text-primary">Attribution:</strong> {dashboard.attributionNote}</p> : null}
          </div>
        </PanelBody>
      </Panel>

      {kpiCards.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((metric, index) => (
            <MetricCard key={metric.id || `${metric.label}-${index}`} metric={metric} />
          ))}
        </section>
      ) : null}

      <GoalsSection goals={content.goals} />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <FunnelSection funnel={content.funnel} />
        <ChannelBreakdownSection channels={content.channel_breakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No insights have been added yet."
          items={insights}
          renderItem={(insight, index) => (
            <div className="rounded-control border border-control-border bg-block-subtle p-4" key={insight.id || `${insight.title}-${index}`}>
              <div className="flex items-center gap-2">
                <StatusBadge label={insight.severity ?? 'info'} tone={insight.severity === 'warning' ? 'amber' : insight.severity === 'positive' ? 'green' : 'blue'} />
                <h3 className="text-sm font-semibold text-text-primary">{insight.title || 'Insight'}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{insight.body}</p>
            </div>
          )}
          title="What Changed"
        />

        <BulletPanel
          emptyText="No next actions have been added yet."
          items={nextSteps}
          renderItem={(step, index) => (
            <div className="rounded-control border border-control-border bg-block-subtle p-4" key={step.id || `${step.title}-${index}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-text-primary">{step.title || 'Next action'}</h3>
                <StatusBadge label={step.priority ?? 'medium'} tone={step.priority === 'high' ? 'amber' : 'neutral'} />
              </div>
              {step.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p> : null}
              <p className="mt-3 text-xs text-text-muted">
                {step.owner ? `Owner: ${step.owner}` : 'Owner not set'}
                {step.due_date ? ` · Due ${formatDate(step.due_date)}` : ''}
              </p>
            </div>
          )}
          title="Next Actions"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BulletPanel
          emptyText="No client actions are open right now."
          items={page.neededFromClient}
          renderItem={(action) => (
            <div className="rounded-control border border-warning/20 bg-warning/10 p-4" key={action.id}>
              <h3 className="text-sm font-semibold text-text-primary">{action.title}</h3>
              {action.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{action.description}</p> : null}
              <p className="mt-3 text-xs text-warning-foreground">Due {formatDate(action.dueDate)}</p>
            </div>
          )}
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
