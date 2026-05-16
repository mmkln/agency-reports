import { ComposedStackedBarLineChart } from '../../shared/charts'
import { chartColors } from '../../shared/theme/chartColors'

import { formatLooseValue } from './formatters'

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

function CampaignKpiCard({ kpi }) {
  return (
    <div className="min-w-0 rounded-control bg-block-subtle px-6 py-4">
      <p className="truncate text-ui text-text-secondary">{kpi.label || 'Metric'}</p>
      <p className={`mt-1 text-data ${getCampaignTextClass(kpi.tone)}`}>
        {formatLooseValue(kpi.value)}{kpi.unit ? ` ${kpi.unit}` : ''}
      </p>
      {kpi.helper_text ? <p className="mt-2 text-label font-normal text-text-muted">{kpi.helper_text}</p> : null}
    </div>
  )
}

function CampaignTracks({ tracks }) {
  if (!tracks?.length) {
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-2 md:grid-cols-[0.55fr_1.65fr_2.35fr_1.3fr]">
        {tracks.map((track, index) => (
          <div
            className={`flex min-h-16 items-center justify-center rounded-control px-4 py-3 text-center text-ui ${getCampaignToneClasses(track.tone).replace('border ', '')}`}
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
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-ui text-text-secondary">
      {bars.map((bar) => (
        <span className="inline-flex items-center gap-2" key={bar.key}>
          <span className="size-4 rounded-sm" style={{ backgroundColor: bar.color }} />
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

export function CampaignExecutionSection({ campaign }) {
  const hasCampaignData = campaign?.kpis?.length
    || campaign?.tracks?.length
    || campaign?.activity_series?.length

  if (!hasCampaignData) {
    return null
  }

  const chartData = campaign.activity_series ?? []
  const bars = [
    { color: chartColors.teal, key: 'sms', label: 'SMS' },
    { color: chartColors.green, key: 'email', label: 'Email' },
    { color: chartColors.rose, key: 'manager_calls', label: 'Manager calls' },
  ]
  const line = {
    color: chartColors.amber,
    key: 'cumulative_bookings',
    label: 'Cumulative bookings',
  }

  return (
    <section className="min-w-0 rounded-block bg-block p-card" aria-labelledby="campaign-execution-title">
      <h2 className="sr-only" id="campaign-execution-title">{campaign.title || 'Campaign Execution'}</h2>
      <div className="grid min-w-0 gap-5">
        {campaign.kpis?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {campaign.kpis.map((kpi, index) => (
              <CampaignKpiCard key={kpi.id || `${kpi.label}-${index}`} kpi={kpi} />
            ))}
          </div>
        ) : null}

        <CampaignTracks tracks={campaign.tracks} />

        {chartData.length ? (
          <div className="min-w-0">
            <div className="mb-4">
              <CampaignChartLegend bars={bars} line={line} />
            </div>
            <div className="w-full max-w-full overflow-x-auto pb-1">
              <div className="min-w-[68rem]">
                <ComposedStackedBarLineChart
                  ariaLabel="Campaign touchpoints and cumulative bookings"
                  barSize={10}
                  bars={bars}
                  data={chartData}
                  height={500}
                  leftAxisLabel={campaign.left_axis_label || 'Touches per day'}
                  leftDomain={[0, 100]}
                  leftTicks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  line={line}
                  margin={{
                    bottom: 58,
                    left: 18,
                    right: 46,
                    top: 8,
                  }}
                  rightAxisLabel={campaign.right_axis_label || 'Cumulative bookings'}
                  rightDomain={[0, 48]}
                  rightTicks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 48]}
                  xKey="label"
                />
              </div>
            </div>
          </div>
        ) : null}

        {campaign.assumptions?.length ? (
          <p className="text-center text-ui text-text-muted">
            {campaign.assumptions.join(' ')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
