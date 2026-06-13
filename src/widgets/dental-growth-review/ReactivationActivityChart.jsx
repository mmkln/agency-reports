import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { semanticColors } from '@/shared/theme'

import { ReactivationChartPanel } from './ReactivationChartPanel'
import {
  activityChartLayout,
  bookingLine,
  buildActivityChartModel,
  getStackedBarRadius,
  touchSeries,
} from './reactivationActivityChartModel'
import { reactivationColors } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'

const referenceColors = {
  booking: reactivationColors.booking,
  bookingDark: reactivationColors.bookingDark,
  email: reactivationColors.email,
  sms: reactivationColors.sms,
}

const touchSeriesColors = {
  email: referenceColors.email,
  sms: referenceColors.sms,
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
              <span
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: touchSeriesColors[item.key] }}
              />
              {item.label}
            </span>
            <span className="font-semibold text-white">{valuesByKey.get(item.key) ?? '-'}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-white/10 pt-2">
          <span className="inline-flex items-center gap-2 text-white/70">
            <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: referenceColors.booking }} />
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
    <span className={`inline-flex items-center gap-2 whitespace-nowrap ${reactivationText.chartLegend}`}>
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

function createLastPointLabel(lastIndex) {
  return function LastPointLabel({ index, value, x, y }) {
    if (index !== lastIndex || !Number.isFinite(x) || !Number.isFinite(y)) {
      return null
    }

    return (
      <text
        fill={referenceColors.booking}
        fontSize={12}
        fontWeight={600}
        textAnchor="middle"
        x={x}
        y={y - 12}
      >
        {value}
      </text>
    )
  }
}

export function ReactivationActivityChart({ chart }) {
  const model = buildActivityChartModel(chart)

  if (!model) {
    return null
  }

  const legend = (
    <>
      {touchSeries.map((item) => (
        <LegendItem color={touchSeriesColors[item.key]} key={item.key} label={item.label} />
      ))}
      <LegendItem color={referenceColors.booking} label={bookingLine.label} line />
    </>
  )

  return (
    <ReactivationChartPanel
      rightSlot={legend}
      title={model.title}
    >
      <div
        aria-label="Reactivation touches and cumulative bookings"
        className={`relative ${activityChartLayout.chartHeightClassName}`}
        role="img"
      >
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            barCategoryGap={activityChartLayout.barCategoryGap}
            barGap={0}
            data={model.series}
            margin={activityChartLayout.margin}
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
              interval={model.xTickInterval}
              minTickGap={10}
              tick={{
                fill: semanticColors.textMuted,
                fontSize: 12,
                fontWeight: 600,
              }}
              tickLine={false}
              tickMargin={activityChartLayout.xTickMargin}
            />
            <YAxis
              axisLine={false}
              domain={[0, model.leftAxisMax]}
              tick={{
                fill: semanticColors.textMuted,
                fontSize: 12,
                fontWeight: 500,
              }}
              tickLine={false}
              width={activityChartLayout.leftAxisWidth}
              yAxisId="touches"
            />
            <YAxis
              axisLine={false}
              domain={[0, model.rightAxisMax]}
              orientation="right"
              tick={{
                fill: referenceColors.booking,
                fontSize: 12,
                fontWeight: 600,
              }}
              tickLine={false}
              width={activityChartLayout.rightAxisWidth}
              yAxisId="bookings"
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ fill: semanticColors.fillQuaternary }}
            />
            {touchSeries.map((item) => (
              <Bar
                dataKey={item.key}
                fill={touchSeriesColors[item.key]}
                isAnimationActive={false}
                key={item.key}
                maxBarSize={activityChartLayout.maxBarSize}
                name={item.label}
                stackId="touches"
                yAxisId="touches"
              >
                {model.series.map((point) => (
                  <Cell
                    key={`${item.key}-${point.date || point.label}`}
                    radius={getStackedBarRadius({ point, seriesKey: item.key })}
                  />
                ))}
              </Bar>
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
              label={createLastPointLabel(model.series.length - 1)}
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
    </ReactivationChartPanel>
  )
}
