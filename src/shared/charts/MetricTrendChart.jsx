import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

import { useInspectorId } from '../ui/inspectorId'

function sanitizeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '')
}

function normalizeTrendData(data, valueKey) {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .map((point, index) => {
      const value = Number(point?.[valueKey])

      if (!Number.isFinite(value)) {
        return null
      }

      return {
        ...point,
        __trendIndex: index,
        [valueKey]: value,
      }
    })
    .filter(Boolean)
}

function defaultValueFormatter(value) {
  return value
}

function defaultTooltipLabelFormatter(point, label) {
  return point?.tooltipLabel ?? label
}

function defaultXAxisTickFormatter(value) {
  return value
}

export function MetricTrendChart({
  ariaLabel,
  chartId,
  className,
  color = 'var(--chart-1)',
  data,
  formatTooltipLabel = defaultTooltipLabelFormatter,
  formatValue = defaultValueFormatter,
  formatXAxisTick = defaultXAxisTickFormatter,
  hideTooltipLabel,
  id,
  label = 'Value',
  showActiveDot,
  showCursor,
  showGrid = false,
  showTooltip = true,
  showXAxis,
  valueKey = 'value',
  variant = 'standard',
  xKey = 'label',
}) {
  const inspectorId = useInspectorId('MetricTrendChart', id)
  const uniqueId = useId()
  const resolvedChartId = sanitizeId(chartId ?? id ?? uniqueId)
  const gradientId = `metric-trend-gradient-${resolvedChartId}`
  const chartData = useMemo(() => normalizeTrendData(data, valueKey), [data, valueKey])
  const isCompact = variant === 'compact'
  const resolvedHideTooltipLabel = hideTooltipLabel ?? isCompact
  const resolvedShowActiveDot = showActiveDot ?? !isCompact
  const resolvedShowCursor = showCursor ?? !isCompact
  const resolvedShowXAxis = showXAxis ?? !isCompact

  if (!chartData.length) {
    return (
      <div
        aria-label={ariaLabel ?? `${label} trend unavailable`}
        className={cn(isCompact ? 'h-12' : 'h-64', 'w-full min-w-0')}
        id={inspectorId}
        role="img"
      />
    )
  }

  return (
    <div
      aria-label={ariaLabel ?? `${label} trend`}
      className={cn(isCompact ? 'h-12' : 'h-64', 'w-full min-w-0', className)}
      id={inspectorId}
      role="img"
    >
      <ChartContainer
        className="h-full w-full"
        config={{
          [valueKey]: {
            color,
            label,
          },
        }}
        id={resolvedChartId}
      >
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={isCompact
            ? { bottom: 2, left: 0, right: 0, top: 4 }
            : { bottom: 28, left: 8, right: 8, top: 12 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.24} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {showGrid && !isCompact ? (
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
          ) : null}
          <XAxis
            axisLine={false}
            dataKey={xKey}
            hide={!resolvedShowXAxis}
            interval="preserveStartEnd"
            minTickGap={16}
            tick={{
              fill: 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 500,
            }}
            tickFormatter={formatXAxisTick}
            tickLine={false}
            tickMargin={14}
          />
          <YAxis
            axisLine={false}
            domain={['auto', 'auto']}
            hide
            tickLine={false}
            width={0}
          />
          {showTooltip ? (
            <ChartTooltip
              content={(
                <ChartTooltipContent
                  formatter={(value, name, item) => formatValue(value, item?.payload)}
                  hideLabel={resolvedHideTooltipLabel}
                  labelFormatter={(value, payload) => formatTooltipLabel(payload?.[0]?.payload, value)}
                />
              )}
              cursor={resolvedShowCursor ? { stroke: 'var(--separator)', strokeWidth: 1 } : false}
            />
          ) : null}
          <Area
            activeDot={resolvedShowActiveDot ? {
              fill: color,
              r: isCompact ? 3 : 4,
              stroke: 'var(--block)',
              strokeWidth: 2,
            } : false}
            dataKey={valueKey}
            dot={false}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={false}
            name={label}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isCompact ? 2.25 : 2.5}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
