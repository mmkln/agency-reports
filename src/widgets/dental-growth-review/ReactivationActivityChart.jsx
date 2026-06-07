import { ComposedStackedBarLineChart } from '@/shared/charts'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui'

const activityBars = [
  {
    color: 'var(--chart-5)',
    key: 'sms',
    label: 'SMS',
  },
  {
    color: 'var(--chart-2)',
    key: 'email',
    label: 'Email',
  },
  {
    color: 'var(--chart-3)',
    key: 'call',
    label: 'Manager calls',
  },
]

const bookingsLine = {
  color: 'var(--text-muted)',
  key: 'cumulativeBookings',
  label: 'Cumulative bookings',
}

function formatCardValue(card) {
  if (card.displayValue) {
    return card.displayValue
  }

  if (card.unit === 'days') {
    return `${card.value} days`
  }

  return card.value
}

function formatDateLabel(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function normalizeChartSeries(series = []) {
  return series.map((point) => ({
    ...point,
    label: formatDateLabel(point.date || point.label),
  }))
}

function getXAxisTickInterval(pointCount) {
  if (pointCount <= 14) {
    return 0
  }

  return Math.max(1, Math.ceil(pointCount / 12) - 1)
}

export function ReactivationActivityChart({ chart }) {
  if (!chart?.available || !chart.series?.length) {
    return null
  }

  const series = normalizeChartSeries(chart.series)

  return (
    <Panel>
      <PanelHeader title={chart.label || 'Reactivation Activity'} />
      <PanelBody className="grid gap-component">
        {chart.cards?.length ? (
          <div className="grid gap-control md:grid-cols-3 xl:grid-cols-6">
            {chart.cards.map((card) => (
              <div className="rounded-control bg-fill-quaternary p-control" key={card.key}>
                <p className="text-label font-medium text-text-muted">{card.label}</p>
                <p className="mt-1 text-data tabular-nums text-text-primary">
                  {formatCardValue(card)}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <ComposedStackedBarLineChart
          ariaLabel="Reactivation activity by day"
          bars={activityBars}
          data={series}
          height={420}
          leftAxisLabel="Touches per day"
          line={bookingsLine}
          rightAxisLabel="Cumulative bookings"
          xKey="label"
          xTickInterval={getXAxisTickInterval(series.length)}
        />
      </PanelBody>
    </Panel>
  )
}
