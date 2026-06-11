import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { semanticColors } from '@/shared/theme'
import { Panel, PanelBody } from '@/shared/ui'

const referenceColors = {
  booking: '#22c55e',
  bookingDark: '#10b981',
  email: '#a78bfa',
  sms: '#6366f1',
}

const touchSeries = [
  {
    color: referenceColors.sms,
    key: 'sms',
    label: 'SMS sent',
  },
  {
    color: referenceColors.email,
    key: 'email',
    label: 'Emails sent',
  },
]

const bookingLine = {
  color: referenceColors.booking,
  key: 'cumulativeBookings',
  label: 'Bookings cumulative',
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

function getMaxValue(series, keys) {
  return Math.max(
    0,
    ...series.map((point) => keys.reduce((sum, key) => sum + Number(point[key] ?? 0), 0)),
  )
}

function getRightAxisMax(series) {
  const maxBookings = Math.max(0, ...series.map((point) => Number(point.cumulativeBookings ?? 0)))

  if (maxBookings <= 0) {
    return 5
  }

  return Math.ceil((maxBookings + 1) / 2) * 2
}

function TooltipContent({ active, label, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const valuesByKey = new Map(payload.map((item) => [item.dataKey, item.value]))

  return (
    <div className="rounded-island bg-premium-shark px-4 py-3 text-label text-text-on-dark shadow-premium">
      <p className="font-semibold">{label}</p>
      <div className="mt-2 grid gap-1.5">
        {touchSeries.map((item) => (
          <div className="flex min-w-44 items-center justify-between gap-6" key={item.key}>
            <span className="inline-flex items-center gap-2 text-white/70">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-semibold text-white">{valuesByKey.get(item.key) ?? 0}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-white/10 pt-2">
          <span className="inline-flex items-center gap-2 text-white/70">
            <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: bookingLine.color }} />
            {bookingLine.label}
          </span>
          <span className="font-semibold text-white">{valuesByKey.get(bookingLine.key) ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label, line = false }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-label text-text-secondary">
      {line ? (
        <span className="relative inline-flex h-2 w-5 items-center">
          <span className="h-0.5 w-full rounded-full" style={{ backgroundColor: color }} />
          <span className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full" style={{ backgroundColor: color }} />
        </span>
      ) : (
        <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  )
}

export function ReactivationActivityChart({ chart }) {
  if (!chart?.available || !chart.series?.length) {
    return null
  }

  const series = normalizeChartSeries(chart.series)
  const leftAxisMax = Math.ceil(getMaxValue(series, touchSeries.map((item) => item.key)) * 1.12)
  const rightAxisMax = getRightAxisMax(series)
  const xTickInterval = getXAxisTickInterval(series.length)

  return (
    <Panel>
      <PanelBody className="p-6">
        <div className="flex flex-col gap-4 border-b border-separator pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-ui font-semibold text-text-primary">
              {chart.label || 'Reactivation Activity'}
            </h3>
            <p className="mt-1 max-w-2xl text-label font-medium text-text-muted">
              Daily communication volume and cumulative booking growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {touchSeries.map((item) => (
              <LegendItem color={item.color} key={item.key} label={item.label} />
            ))}
            <LegendItem color={bookingLine.color} label={bookingLine.label} line />
          </div>
        </div>

        <div aria-label="Reactivation touches and cumulative bookings" className="mt-6 h-[360px]" role="img">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart
              barCategoryGap="22%"
              barGap={0}
              data={series}
              margin={{
                bottom: 8,
                left: 6,
                right: 10,
                top: 8,
              }}
            >
              <defs>
                <linearGradient id="reactivationBookingLine" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={referenceColors.bookingDark} />
                  <stop offset="100%" stopColor={referenceColors.booking} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={semanticColors.separator}
                strokeDasharray="4 5"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                interval={xTickInterval}
                minTickGap={10}
                tick={{
                  fill: semanticColors.textMuted,
                  fontSize: 12,
                  fontWeight: 600,
                }}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                axisLine={false}
                domain={[0, leftAxisMax || 10]}
                tick={{
                  fill: semanticColors.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                }}
                tickLine={false}
                width={38}
                yAxisId="touches"
              />
              <YAxis
                axisLine={false}
                domain={[0, rightAxisMax]}
                orientation="right"
                tick={{
                  fill: semanticColors.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                }}
                tickLine={false}
                width={34}
                yAxisId="bookings"
              />
              <Tooltip
                content={<TooltipContent />}
                cursor={{ fill: semanticColors.fillQuaternary }}
              />
              {touchSeries.map((item, index) => (
                <Bar
                  dataKey={item.key}
                  fill={item.color}
                  isAnimationActive={false}
                  key={item.key}
                  maxBarSize={44}
                  name={item.label}
                  radius={index === touchSeries.length - 1 ? [7, 7, 0, 0] : [0, 0, 0, 0]}
                  stackId="touches"
                  yAxisId="touches"
                />
              ))}
              <Line
                activeDot={{
                  fill: semanticColors.block,
                  r: 6,
                  stroke: referenceColors.booking,
                  strokeWidth: 3,
                }}
                dataKey={bookingLine.key}
                dot={{
                  fill: semanticColors.block,
                  r: 4,
                  stroke: referenceColors.booking,
                  strokeWidth: 2.5,
                }}
                isAnimationActive={false}
                name={bookingLine.label}
                stroke="url(#reactivationBookingLine)"
                strokeLinecap="round"
                strokeWidth={3.5}
                type="monotone"
                yAxisId="bookings"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </PanelBody>
    </Panel>
  )
}
