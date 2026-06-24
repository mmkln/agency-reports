import { Icon } from '@/shared/icons'
import {
  DashboardSectionGrid,
  MetricGrid,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from '@/shared/ui'

const toneTextClass = {
  amber: 'text-warning-foreground',
  blue: 'text-action',
  green: 'text-success-foreground',
  purple: 'text-premium-purple',
  rose: 'text-destructive',
}

const toneFillClass = {
  amber: 'bg-warning',
  blue: 'bg-action',
  green: 'bg-success',
  purple: 'bg-premium-purple',
  rose: 'bg-destructive',
}

const toneMutedClass = {
  amber: 'bg-warning-muted',
  blue: 'bg-action-muted',
  green: 'bg-success-muted',
  purple: 'bg-premium-purple/10',
  rose: 'bg-destructive-muted',
}

function ExecutiveSummary({ page }) {
  return (
    <Panel>
      <PanelBody>
        <div className="grid gap-card lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
          <div className="grid gap-component">
            <div className="flex flex-wrap items-center gap-control">
              <StatusBadge icon="barChart" tone="blue">{page.sourceLabel}</StatusBadge>
              <StatusBadge tone="neutral">{page.updatedAtLabel}</StatusBadge>
            </div>
            <div className="grid gap-item">
              <p className="text-label text-text-muted">{page.audienceLabel}</p>
              <h2 className="max-w-title text-display text-text-primary">{page.title}</h2>
              <p className="max-w-readable text-body text-text-secondary">{page.summary.narrative}</p>
            </div>
          </div>
          <div className="grid content-start gap-control rounded-block bg-block-subtle p-card">
            <p className="text-label text-text-muted">Reporting period</p>
            <p className="text-data tabular-nums text-text-primary">{page.periodLabel}</p>
            <div className="grid gap-tag text-ui text-text-secondary">
              <p><span className="font-semibold text-text-primary">Main win:</span> {page.summary.mainWin}</p>
              <p><span className="font-semibold text-text-primary">Main issue:</span> {page.summary.mainIssue}</p>
              <p><span className="font-semibold text-text-primary">Next focus:</span> {page.summary.nextFocus}</p>
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}

function HeadlineMetricCard({ metric }) {
  return (
    <Panel>
      <PanelBody className="grid gap-component">
        <div className="flex items-start justify-between gap-control">
          <div className="min-w-0">
            <p className="text-label text-text-muted">{metric.label}</p>
            <p className="mt-tag text-data tabular-nums text-text-primary">{metric.value}</p>
          </div>
          <StatusBadge tone={metric.tone}>{metric.status}</StatusBadge>
        </div>
        <p className="text-ui text-text-secondary">{metric.context}</p>
      </PanelBody>
    </Panel>
  )
}

function IntelligenceColumn({ column }) {
  return (
    <Panel>
      <PanelHeader
        divided
        iconName={column.id === 'worked' ? 'checkCircle2' : column.id === 'failed' ? 'triangleAlert' : 'target'}
        title={column.label}
      />
      <PanelBody className="grid gap-0 py-control">
        {column.items.map((item) => (
          <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-control border-b border-separator py-control last:border-b-0" key={`${column.id}:${item.figure}`}>
            <p className={`text-heading tabular-nums ${toneTextClass[column.tone]}`}>{item.figure}</p>
            <p className="text-ui text-text-secondary">{item.text}</p>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function ProgressMetric({ metric }) {
  return (
    <Panel>
      <PanelBody className="grid gap-component">
        <div className="flex items-start justify-between gap-control">
          <div className="min-w-0">
            <p className="text-label text-text-muted">{metric.label}</p>
            <p className="mt-tag text-data tabular-nums text-text-primary">{metric.value}</p>
          </div>
          <StatusBadge tone={metric.tone}>{metric.status}</StatusBadge>
        </div>
        <div className="grid gap-tag">
          <div className="h-2 overflow-hidden rounded-full bg-fill-secondary">
            <div
              className={`h-full rounded-full ${toneFillClass[metric.tone] ?? toneFillClass.blue}`}
              style={{ width: `${Math.max(0, Math.min(100, metric.progress))}%` }}
            />
          </div>
          <p className="text-label text-text-muted">{metric.helper}</p>
        </div>
      </PanelBody>
    </Panel>
  )
}

function UnitEconomicsCard({ metric }) {
  return (
    <div className={`grid gap-tag rounded-block p-component ${toneMutedClass[metric.tone] ?? toneMutedClass.blue}`}>
      <p className="text-label text-text-muted">{metric.label}</p>
      <p className={`text-data tabular-nums ${toneTextClass[metric.tone] ?? toneTextClass.blue}`}>{metric.value}</p>
      <p className="text-ui text-text-secondary">{metric.helper}</p>
    </div>
  )
}

function ChannelMix({ channels }) {
  const maxValue = Math.max(...channels.map((channel) => channel.value), 1)

  return (
    <Panel>
      <PanelHeader
        divided
        iconName="chartColumn"
        subtitle="Static source mix until backend attribution is connected."
        title="Lead Source Mix"
      />
      <PanelBody className="grid gap-component">
        {channels.map((channel) => (
          <div className="grid gap-tag" key={channel.id}>
            <div className="flex items-center justify-between gap-control text-ui">
              <span className="font-semibold text-text-primary">{channel.label}</span>
              <span className="tabular-nums text-text-secondary">{channel.value} | {channel.share}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-fill-secondary">
              <div
                className={`h-full rounded-full ${toneFillClass[channel.tone] ?? toneFillClass.blue}`}
                style={{ width: `${Math.max(8, (channel.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function Funnel({ funnel }) {
  return (
    <Panel>
      <PanelHeader
        divided
        iconName="gitMerge"
        subtitle="Reactivation lifecycle with current static benchmark values."
        title="Reactivation Funnel"
      />
      <PanelBody className="grid gap-control">
        {funnel.map((stage) => (
          <div className="grid gap-tag" key={stage.id}>
            <div className="flex items-center justify-between gap-control">
              <div className="min-w-0">
                <p className="text-ui font-semibold text-text-primary">{stage.label}</p>
                <p className="text-label text-text-muted">{stage.conversion}</p>
              </div>
              <p className="text-data tabular-nums text-text-primary">{stage.value}</p>
            </div>
            <div className="h-control-small overflow-hidden rounded-control bg-fill-secondary">
              <div
                className={`flex h-full items-center justify-end rounded-control px-control text-label text-action-foreground ${toneFillClass[stage.tone] ?? toneFillClass.blue}`}
                style={{ width: `${Math.max(12, Math.min(100, stage.progress))}%` }}
              >
                {stage.conversion}
              </div>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function DecisionCard({ decision }) {
  return (
    <div className="grid gap-component rounded-block bg-block p-component shadow-block">
      <div className="flex items-start justify-between gap-control">
        <h3 className="text-ui font-semibold text-text-primary">{decision.title}</h3>
        <StatusBadge tone={decision.tone}>{decision.owner}</StatusBadge>
      </div>
      <p className="text-ui text-text-secondary">{decision.recommendation}</p>
      <div className="flex items-center gap-tag text-label text-text-muted">
        <Icon name="calendar" size={14} />
        <span>{decision.due}</span>
      </div>
    </div>
  )
}

export function ExecutiveDashboard({ page }) {
  return (
    <div className="grid gap-section">
      <ExecutiveSummary page={page} />

      <MetricGrid className="lg:grid-cols-4">
        {page.headlineMetrics.map((metric) => (
          <HeadlineMetricCard key={metric.id} metric={metric} />
        ))}
      </MetricGrid>

      <section className="grid gap-card lg:grid-cols-3">
        {page.intelligence.map((column) => (
          <IntelligenceColumn column={column} key={column.id} />
        ))}
      </section>

      <section className="grid gap-card">
        <div className="grid gap-tag">
          <h2 className="text-heading text-text-primary">Financial Health</h2>
          <p className="max-w-readable text-ui text-text-secondary">
            Primary executive metrics stay focused on revenue, acquisition efficiency, and the handoff constraint.
          </p>
        </div>
        <MetricGrid className="lg:grid-cols-4">
          {page.financialHealth.map((metric) => (
            <ProgressMetric key={metric.id} metric={metric} />
          ))}
        </MetricGrid>
      </section>

      <DashboardSectionGrid>
        <Panel>
          <PanelHeader
            divided
            iconName="dollarSign"
            subtitle="What each patient is worth compared with what it costs to acquire."
            title="Unit Economics"
          />
          <PanelBody className="grid gap-control md:grid-cols-3">
            {page.unitEconomics.map((metric) => (
              <UnitEconomicsCard key={metric.id} metric={metric} />
            ))}
          </PanelBody>
        </Panel>
        <ChannelMix channels={page.channelMix} />
      </DashboardSectionGrid>

      <Funnel funnel={page.funnel} />

      <section className="grid gap-card">
        <div className="grid gap-tag">
          <h2 className="text-heading text-text-primary">Decisions This Month</h2>
          <p className="max-w-readable text-ui text-text-secondary">
            Each decision is phrased as an owner-ready management action, not a raw analytics observation.
          </p>
        </div>
        <div className="grid gap-card lg:grid-cols-3">
          {page.decisions.map((decision) => (
            <DecisionCard decision={decision} key={decision.id} />
          ))}
        </div>
      </section>
    </div>
  )
}
