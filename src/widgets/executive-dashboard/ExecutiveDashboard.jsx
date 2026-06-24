import {
  StatusBadge,
} from '@/shared/ui'

const toneTextClass = {
  amber: 'text-warning-foreground',
  blue: 'text-action',
  green: 'text-success-foreground',
  neutral: 'text-text-muted',
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

const toneVariableName = {
  blue: '--color-action',
  green: '--color-success',
  purple: '--color-premium-purple',
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

function ZoneCard({ children, className = '' }) {
  return (
    <div className={`rounded-block bg-block p-component shadow-none ring-1 ring-separator ${className}`}>
      {children}
    </div>
  )
}

function SourceDonut({ sources, total }) {
  const { segments } = sources.reduce((accumulator, source) => {
    const start = accumulator.cursor
    const end = accumulator.cursor + (source.value / total) * 100

    return {
      cursor: end,
      segments: [
        ...accumulator.segments,
        `var(${toneVariableName[source.tone] ?? toneVariableName.blue}) ${start}% ${end}%`,
      ],
    }
  }, {
    cursor: 0,
    segments: [],
  })

  return (
    <div
      aria-label={`${total} booked patients by source`}
      className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
      role="img"
      style={{ background: `conic-gradient(${segments.join(', ')})` }}
    >
      <div className="grid h-control-xl w-control-xl place-items-center rounded-full bg-block text-center">
        <div>
          <p className="text-heading tabular-nums text-text-primary">{total}</p>
          <p className="text-indicator font-medium uppercase text-text-muted">Booked</p>
        </div>
      </div>
    </div>
  )
}

function BookingsBySourceCard({ className = '', source }) {
  return (
    <ZoneCard className={`grid gap-component ${className}`}>
      <div className="flex items-center justify-between gap-control">
        <h3 className="text-ui font-semibold text-text-primary">Bookings by source</h3>
        <StatusBadge tone="green">{source.badge}</StatusBadge>
      </div>
      <div className="flex flex-col gap-component sm:flex-row sm:items-center">
        <SourceDonut sources={source.sources} total={source.total} />
        <div className="grid min-w-0 flex-1 gap-tag">
          {source.sources.map((item) => (
            <div className="flex items-center justify-between gap-control text-ui" key={item.id}>
              <div className="flex min-w-0 items-center gap-tag">
                <span className={`size-control rounded-item ${toneFillClass[item.tone] ?? toneFillClass.blue}`} />
                <span className="min-w-0 text-text-secondary">{item.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-control">
                <span className="font-semibold tabular-nums text-text-primary">{item.value}</span>
                <span className="w-control-small tabular-nums text-text-muted">{item.share}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-tag border-t border-separator pt-component">
        <p className="text-label font-medium uppercase text-text-muted">Revenue by source</p>
        {source.revenue.map((item) => (
          <div className="flex items-center justify-between gap-control text-ui" key={item.id}>
            <span className="text-text-secondary">{item.label}</span>
            <span className="font-mono text-text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </ZoneCard>
  )
}

function ReactivationFunnelCard({ className = '', funnel }) {
  return (
    <ZoneCard className={`grid gap-component ${className}`}>
      <div className="flex flex-wrap items-center gap-tag">
        <h3 className="text-ui font-semibold text-text-primary">Reactivation funnel</h3>
        <StatusBadge tone="green">{funnel.badge}</StatusBadge>
        <span className="text-ui text-text-muted">· {funnel.note}</span>
      </div>
      <div className="grid gap-control">
        {funnel.stages.map((stage) => (
          <div className="flex items-center gap-control" key={stage.id}>
            <div className="min-w-0 flex-1">
              <div className="h-control-small rounded-control bg-fill-secondary">
                <div
                  className={`flex h-full items-center justify-end rounded-control px-control text-label font-semibold tabular-nums text-action-foreground ${toneFillClass[stage.tone] ?? toneFillClass.blue}`}
                  style={{ width: `${Math.max(10, Math.min(100, stage.progress))}%` }}
                >
                  {stage.value}
                </div>
              </div>
            </div>
            <p className="w-number-field shrink-0 text-ui font-semibold text-text-primary">
              {stage.label}
              {stage.conversion ? (
                <span className={`ml-tag font-normal ${stage.tone === 'rose' ? 'text-destructive' : 'text-success-foreground'}`}>
                  {stage.conversion}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-control bg-block-subtle px-component py-control text-ui text-text-secondary">
        <EmphasizedText emphasis={funnel.footerEmphasis} text={funnel.footer} />
      </div>
    </ZoneCard>
  )
}

function MetaFlowStep({ step }) {
  return (
    <div className="grid min-w-0 flex-1 place-items-center gap-tag rounded-control bg-block-subtle p-component text-center">
      <p className={`text-data tabular-nums ${toneTextClass[step.tone] ?? 'text-text-primary'}`}>{step.value}</p>
      <p className="text-indicator font-medium uppercase text-text-muted">{step.label}</p>
      {step.helper ? <p className={toneTextClass[step.tone] ?? 'text-text-secondary'}>{step.helper}</p> : null}
    </div>
  )
}

function SignalPill({ signal }) {
  const className = signal.tone === 'rose'
    ? 'bg-destructive-muted text-destructive'
    : 'bg-success-muted text-success-foreground'

  return (
    <span className={`inline-flex min-h-control-mini items-center rounded-control px-control text-label font-medium ${className}`}>
      {signal.label}
    </span>
  )
}

function MetaPaidAdsCard({ ads, className = '' }) {
  return (
    <ZoneCard className={`grid gap-component ${className}`}>
      <div className="flex items-center justify-between gap-control">
        <h3 className="text-ui font-semibold text-text-primary">Meta paid ads</h3>
        <StatusBadge tone="amber">{ads.badge}</StatusBadge>
      </div>
      <div className="flex items-center gap-control">
        {ads.flow.map((step, index) => (
          <div className="flex min-w-0 flex-1 items-center gap-control" key={step.id}>
            <MetaFlowStep step={step} />
            {index < ads.flow.length - 1 ? <span className="shrink-0 text-text-muted">→</span> : null}
          </div>
        ))}
      </div>
      <div className="grid gap-tag">
        <p className="text-label font-medium uppercase text-text-muted">CAC by channel</p>
        <div className="grid">
          {ads.cacByChannel.map((item) => (
            <div className="grid grid-cols-3 items-center gap-control border-b border-separator py-tag text-ui last:border-b-0" key={item.id}>
              <span className="text-text-secondary">{item.label}</span>
              <span className={`font-semibold tabular-nums ${toneTextClass[item.tone] ?? toneTextClass.neutral}`}>{item.value}</span>
              <span className="text-right font-mono text-label text-text-muted">{item.helper}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-tag">
        {ads.signals.map((signal) => (
          <SignalPill key={signal.id} signal={signal} />
        ))}
      </div>
      <p className="border-t border-separator pt-control text-ui text-text-secondary">
        <span className="font-semibold text-warning-foreground">Missing:</span> {ads.missing}
      </p>
    </ZoneCard>
  )
}

function ZoneFourLeadConversion({ page }) {
  return (
    <section className="grid gap-component">
      <ZoneHeader eyebrow="Zone 4" title="Where Leads Come From & How They Convert" />
      <div className="grid gap-component xl:grid-cols-7">
        <BookingsBySourceCard className="xl:col-span-2" source={page.leadConversion.bookingsBySource} />
        <ReactivationFunnelCard className="xl:col-span-3" funnel={page.leadConversion.reactivationFunnel} />
        <MetaPaidAdsCard ads={page.leadConversion.metaPaidAds} className="xl:col-span-2" />
      </div>
    </section>
  )
}

function DecisionCard({ decision }) {
  return (
    <div className="overflow-hidden rounded-block bg-block shadow-none ring-1 ring-separator">
      <div className="grid gap-tag p-component">
        <h3 className="text-ui font-semibold text-text-primary">{decision.title}</h3>
        <p className="text-ui text-text-secondary">
          <EmphasizedText emphasis={decision.emphasis} text={decision.evidence} />
        </p>
      </div>
      <div className="grid gap-tag bg-block-subtle p-component">
        <p className="text-label font-medium uppercase text-success-foreground">Recommend</p>
        <p className="text-ui text-text-primary">{decision.recommendation}</p>
      </div>
      <div className="flex items-center justify-between gap-control px-component py-control text-label font-medium text-text-muted">
        <span>{decision.owner} · {decision.due}</span>
        <span className={toneTextClass[decision.tone] ?? toneTextClass.green}>{decision.outcome}</span>
      </div>
    </div>
  )
}

const decisionLegend = [
  { label: 'on / above target', tone: 'green' },
  { label: 'watch', tone: 'amber' },
  { label: 'below target', tone: 'rose' },
  { label: 'room to invest', tone: 'purple' },
]

function ZoneFiveDecisions({ page }) {
  return (
    <section className="grid gap-component">
      <ZoneHeader eyebrow="Zone 5" title={(
        <>
          Decisions This Month <span className="ml-control text-ui font-normal text-text-secondary">evidence · recommendation · owner · deadline</span>
        </>
      )}
      />
      <div className="grid gap-component lg:grid-cols-3">
        {page.decisions.map((decision) => (
          <DecisionCard decision={decision} key={decision.id} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-component text-label font-medium text-text-muted">
        {decisionLegend.map((item) => (
          <div className="flex items-center gap-tag" key={item.label}>
            <span className={`size-item rounded-full ${toneFillClass[item.tone] ?? toneFillClass.green}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ExecutiveDashboardFooter({ note }) {
  return (
    <footer className="border-t border-separator pt-component text-ui text-text-secondary">
      <p>
        <span className="font-semibold text-text-primary">{note.liveLabel}</span> {note.liveText}{' '}
        <span className="font-semibold text-text-primary">{note.estimatedLabel}</span> {note.estimatedText}
      </p>
    </footer>
  )
}

export function ExecutiveDashboard({ page }) {
  return (
    <div className="grid gap-section">
      <ExecutiveOverviewHeader page={page} />
      <ZoneOneOverview page={page} />

      <ZoneTwoFinancialHealth page={page} />

      <ZoneThreeUnitEconomics page={page} />

      <ZoneFourLeadConversion page={page} />

      <ZoneFiveDecisions page={page} />

      <ExecutiveDashboardFooter note={page.footerNote} />
    </div>
  )
}
