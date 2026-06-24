import { Icon } from '@/shared/icons'
import {
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

function ExecutiveOverviewMetric({ metric }) {
  return (
    <div className="grid content-between rounded-block bg-block p-component shadow-block ring-1 ring-separator">
      <div className="grid gap-tag">
        <p className="text-label font-medium uppercase text-text-muted">{metric.label}</p>
        <p className="text-display tabular-nums text-text-primary">{metric.value}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-tag">
        <p className={`min-w-0 text-ui text-text-secondary ${metric.contextTone ? toneTextClass[metric.contextTone] : ''}`}>
          {metric.context}
        </p>
        {metric.badge ? (
          <StatusBadge className="min-h-control-mini" tone={metric.tone}>{metric.badge}</StatusBadge>
        ) : null}
      </div>
    </div>
  )
}

function ExecutiveOverviewHeader({ page }) {
  return (
    <section className="grid gap-card lg:grid-cols-2 lg:items-end">
      <div className="grid gap-control py-component">
        <div className="grid gap-tag">
          <p className="text-label font-medium uppercase text-text-muted">{page.periodContext.eyebrow}</p>
          <h2 className="text-display text-text-primary">{page.periodContext.title}</h2>
          <p className="text-label font-medium uppercase text-text-muted">{page.periodContext.meta}</p>
        </div>
      </div>
      <div className="grid gap-control md:grid-cols-3">
        {page.overviewMetrics.map((metric) => (
          <ExecutiveOverviewMetric key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  )
}

function ZoneHeader({ eyebrow, title }) {
  return (
    <div className="flex items-baseline gap-card border-b border-separator pb-component">
      <p className="text-label font-medium uppercase text-text-muted">{eyebrow}</p>
      <h2 className="text-heading text-text-primary">{title}</h2>
    </div>
  )
}

function ZoneOneColumn({ column }) {
  return (
    <div className="overflow-hidden rounded-block bg-block shadow-block ring-1 ring-separator">
      <div className="flex h-control-large items-center gap-control border-b border-separator px-component">
        <span className={`size-item rounded-item ${toneFillClass[column.tone] ?? toneFillClass.blue}`} />
        <h3 className={`text-label font-medium uppercase ${toneTextClass[column.tone] ?? toneTextClass.blue}`}>
          {column.label}
        </h3>
      </div>
      <div className="grid">
        {column.items.map((item) => (
          <div
            className="flex items-start gap-component border-b border-separator px-component py-control last:border-b-0"
            key={`${column.id}:${item.figure}`}
          >
            <p className={`w-number-field shrink-0 text-heading tabular-nums ${toneTextClass[column.tone] ?? toneTextClass.blue}`}>
              {item.figure}
            </p>
            <p className="text-ui font-normal text-text-secondary">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ZoneOneOverview({ page }) {
  return (
    <section className="grid gap-component">
      <ZoneHeader eyebrow="Zone 1" title="The Month in One Glance" />
      <div className="grid gap-card lg:grid-cols-3">
        {page.intelligence.map((column) => (
          <ZoneOneColumn column={column} key={column.id} />
        ))}
      </div>
    </section>
  )
}

function BenchmarkRange({
  className,
  end = 100,
  start = 0,
}) {
  if (start === undefined || end === undefined) {
    return null
  }

  return (
    <span
      aria-hidden="true"
      className={`absolute top-0 h-full rounded-full ${className}`}
      style={{
        left: `${Math.max(0, Math.min(100, start))}%`,
        width: `${Math.max(0, Math.min(100, end - start))}%`,
      }}
    />
  )
}

function FinancialHealthMetric({ metric }) {
  return (
    <div className="grid gap-control rounded-control bg-block px-component py-control shadow-none ring-1 ring-separator">
      <p className="text-label font-medium uppercase text-text-muted">{metric.label}</p>
      <div className="flex items-end justify-between gap-control">
        <p className="text-display tabular-nums text-text-primary">
          {metric.value}
          {metric.suffix ? <span className="ml-micro text-ui font-semibold text-text-muted">{metric.suffix}</span> : null}
        </p>
        <StatusBadge tone={metric.tone}>{metric.status}</StatusBadge>
      </div>
      <div className="grid gap-tag">
        <div className="relative h-tag rounded-full bg-fill-secondary">
          <BenchmarkRange className="bg-success-muted" end={metric.goodEnd} start={metric.goodStart} />
          <BenchmarkRange className="bg-destructive-muted" end={metric.badEnd} start={metric.badStart} />
          <span
            aria-hidden="true"
            className={`absolute top-1/2 z-10 size-control -translate-x-1/2 -translate-y-1/2 rounded-full ${toneFillClass[metric.tone] ?? toneFillClass.amber}`}
            style={{ left: `${Math.max(0, Math.min(100, metric.marker))}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 z-20 h-control w-micro -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-muted"
            style={{ left: `${Math.max(0, Math.min(100, metric.targetMarker))}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-control text-label font-medium text-text-muted">
          {metric.rangeLabels.map((label) => (
            <span className="first:text-left last:text-right" key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ZoneTwoFinancialHealth({ page }) {
  return (
    <section className="grid gap-component">
      <ZoneHeader eyebrow="Zone 2" title={(
        <>
          Financial Health <span className="ml-control text-ui font-normal text-text-secondary">vs industry benchmarks</span>
        </>
      )}
      />
      <div className="grid gap-component md:grid-cols-2 xl:grid-cols-5">
        {page.financialHealth.map((metric) => (
          <FinancialHealthMetric key={metric.id} metric={metric} />
        ))}
      </div>
      <div className="rounded-control bg-block-subtle px-component py-control text-ui text-text-secondary ring-1 ring-separator">
        <span className="font-semibold text-text-primary">Data note:</span> {page.financialHealthNote}
      </div>
    </section>
  )
}

function EmphasizedText({ emphasis, text }) {
  if (!emphasis || !text.includes(emphasis)) {
    return text
  }

  const [before, after] = text.split(emphasis)

  return (
    <>
      {before}<span className="font-semibold text-text-primary">{emphasis}</span>{after}
    </>
  )
}

function UnitEconomicsRatioCard({ ratio }) {
  return (
    <div className="grid content-between gap-component rounded-block bg-premium-purple/10 p-card shadow-none ring-1 ring-premium-purple/20">
      <div className="grid gap-control">
        <p className="text-label font-medium uppercase text-text-muted">{ratio.label}</p>
        <div className="flex items-end gap-tag">
          <span className="text-display tabular-nums text-success-foreground">{ratio.value}</span>
          <span className="pb-micro text-data tabular-nums text-text-muted">{ratio.suffix}</span>
        </div>
        <p className="max-w-readable text-ui text-text-primary">{ratio.summary}</p>
      </div>
      <div className="grid gap-tag">
        <div className="relative h-tag rounded-full bg-gradient-to-r from-destructive via-warning to-success">
          <span
            aria-hidden="true"
            className="absolute top-1/2 z-10 h-control w-micro -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-primary"
            style={{ left: `${Math.max(0, Math.min(100, ratio.marker))}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-control text-label font-medium text-text-muted">
          {ratio.rangeLabels.map((label) => (
            <span className="first:text-left last:text-right" key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function AcquisitionCostCard({ metric }) {
  return (
    <div className="grid gap-tag rounded-block bg-block p-component shadow-none ring-1 ring-separator">
      <p className="text-label font-medium uppercase text-text-muted">{metric.label}</p>
      <p className={`text-data tabular-nums ${toneTextClass[metric.tone] ?? toneTextClass.blue}`}>{metric.value}</p>
      <div className="grid gap-micro text-ui text-text-secondary">
        <p>{metric.detail}</p>
        <p>{metric.helper}</p>
      </div>
    </div>
  )
}

function UnitEconomicsMetricCard({ metric }) {
  const surfaceClass = metric.featured
    ? 'bg-premium-purple/10 ring-premium-purple/30'
    : 'bg-block ring-separator'

  return (
    <div className={`grid content-between gap-component rounded-block p-component shadow-none ring-1 ${surfaceClass}`}>
      <div className="flex min-w-0 items-center justify-between gap-control">
        <p className="min-w-0 text-label font-medium uppercase text-text-muted">{metric.label}</p>
        <StatusBadge className="shrink-0" tone={metric.tone}>{metric.badge}</StatusBadge>
      </div>
      <div className="grid gap-tag">
        <p className={`text-display tabular-nums ${metric.featured ? 'text-premium-purple' : 'text-text-primary'}`}>
          {metric.value}
        </p>
        <p className="text-ui text-text-secondary">
          <EmphasizedText emphasis={metric.emphasis} text={metric.helper} />
        </p>
      </div>
    </div>
  )
}

function ZoneThreeUnitEconomics({ page }) {
  return (
    <section className="grid gap-component">
      <ZoneHeader eyebrow="Zone 3" title={(
        <>
          Unit Economics <span className="ml-control text-ui font-normal text-text-secondary">what each patient is worth vs what it costs to get them</span>
        </>
      )}
      />
      <div className="grid gap-component xl:grid-cols-2">
        <div className="grid gap-component">
          <UnitEconomicsRatioCard ratio={page.unitEconomics.ratio} />
          <div className="grid gap-component md:grid-cols-2">
            {page.unitEconomics.acquisitionCosts.map((metric) => (
              <AcquisitionCostCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
        <div className="grid gap-component md:grid-cols-2">
          {page.unitEconomics.metrics.map((metric) => (
            <UnitEconomicsMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
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
      <ExecutiveOverviewHeader page={page} />
      <ZoneOneOverview page={page} />

      <ZoneTwoFinancialHealth page={page} />

      <ZoneThreeUnitEconomics page={page} />

      <ChannelMix channels={page.channelMix} />

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
