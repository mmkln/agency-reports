import { ComposedStackedBarLineChart } from '@/shared/charts'
import { semanticColors } from '@/shared/theme'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui'

const activityBars = [
  {
    color: semanticColors.premiumBlue,
    stroke: semanticColors.block,
    key: 'sms',
    label: 'SMS',
  },
  {
    color: semanticColors.premiumPurple,
    stroke: semanticColors.block,
    key: 'email',
    label: 'Email',
  },
  {
    color: semanticColors.premiumGraphite,
    stroke: semanticColors.block,
    key: 'call',
    label: 'Manager calls',
  },
]

const bookingsLine = {
  color: semanticColors.textPrimary,
  key: 'cumulativeBookings',
  label: 'Cumulative bookings',
  strokeDasharray: '4 4',
  strokeWidth: 3,
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
      <PanelBody>
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
