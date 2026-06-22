import { useEffect, useRef, useState } from 'react'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function defaultTickFormatter(value) {
  return value
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) {
      return undefined
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

function getResponsiveBarSize({ pointCount, width }) {
  if (!pointCount || !width) {
    return 10
  }

  const plotWidth = Math.max(0, width - 96)
  const slotWidth = plotWidth / pointCount

  return clamp(slotWidth * 0.58, 3, 42)
}

function DefaultTooltip({ active, bars, label, line, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const valuesByKey = new Map(payload.map((item) => [item.dataKey, item.value]))

  return (
    <div className="rounded-control border border-control-border bg-block px-3 py-2 text-label shadow-block">
      <p className="font-semibold text-text-primary">{label}</p>
      <div className="mt-2 grid gap-1">
        {bars.map((bar) => (
          <div className="flex items-center justify-between gap-5" key={bar.key}>
            <span className="inline-flex items-center gap-2 text-text-secondary">
              <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: bar.color }} />
              {bar.label}
            </span>
            <span className="font-medium text-text-primary">{valuesByKey.get(bar.key) ?? 0}</span>
          </div>
        ))}
        {line ? (
          <div className="flex items-center justify-between gap-5 border-t border-separator pt-1" key={line.key}>
            <span className="inline-flex items-center gap-2 text-text-secondary">
              <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: line.color }} />
              {line.label}
            </span>
            <span className="font-medium text-text-primary">{valuesByKey.get(line.key) ?? 0}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ComposedStackedBarLineChart({
  ariaLabel,
  barSize,
  bars,
  data,
  height = 480,
  leftAxisLabel,
  leftDomain,
  leftTicks,
  line,
  margin = {
    bottom: 52,
    left: 16,
    right: 34,
    top: 8,
  },
  rightAxisLabel,
  rightDomain,
  rightTicks,
  tickFormatter = defaultTickFormatter,
  xKey = 'label',
  xTickInterval = 4,
}) {
  const normalizedData = Array.isArray(data) ? data : []
  const [containerRef, containerWidth] = useElementWidth()
  const resolvedBarSize = barSize ?? getResponsiveBarSize({
    pointCount: normalizedData.length,
    width: containerWidth,
  })

  return (
    <div ref={containerRef} aria-label={ariaLabel} className="h-full min-h-[30rem] w-full" role="img">
      <ResponsiveContainer height={height} width="100%">
        <ComposedChart
          barCategoryGap={1}
          barGap={0}
          data={normalizedData}
          margin={margin}
        >
          <CartesianGrid
            horizontal
            stroke="var(--separator)"
            strokeDasharray="3 3"
            vertical
          />
          <XAxis
            axisLine={{ stroke: 'var(--text-quaternary)' }}
            dataKey={xKey}
            interval={xTickInterval}
            minTickGap={8}
            tick={{
              fill: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 500,
            }}
            tickFormatter={tickFormatter}
            tickLine={false}
            tickMargin={14}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            axisLine={{ stroke: 'var(--text-quaternary)' }}
            domain={leftDomain}
            tick={{
              fill: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 500,
            }}
            tickLine={false}
            ticks={leftTicks}
            type="number"
            yAxisId="left"
          >
            {leftAxisLabel ? (
              <Label
                angle={-90}
                fill="var(--text-secondary)"
                fontSize={14}
                fontWeight={500}
                offset={-4}
                position="insideLeft"
                value={leftAxisLabel}
              />
            ) : null}
          </YAxis>
          <YAxis
            axisLine={{ stroke: 'var(--text-quaternary)' }}
            domain={rightDomain}
            orientation="right"
            tick={{
              fill: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 500,
            }}
            tickLine={false}
            ticks={rightTicks}
            type="number"
            yAxisId="right"
          >
            {rightAxisLabel ? (
              <Label
                angle={90}
                fill="var(--text-secondary)"
                fontSize={14}
                fontWeight={500}
                offset={-2}
                position="insideRight"
                value={rightAxisLabel}
              />
            ) : null}
          </YAxis>
          <Tooltip
            content={(tooltipProps) => (
              <DefaultTooltip
                {...tooltipProps}
                bars={bars}
                line={line}
              />
            )}
            cursor={{ fill: 'var(--fill-secondary)' }}
          />
          {bars.map((bar) => (
            <Bar
              barSize={bar.barSize ?? resolvedBarSize}
              dataKey={bar.key}
              fill={bar.color}
              isAnimationActive={false}
              key={bar.key}
              name={bar.label}
              radius={0}
              stroke={bar.stroke}
              strokeWidth={bar.stroke ? 1.5 : 0}
              stackId="touches"
              yAxisId="left"
            />
          ))}
          {line ? (
            <Line
              activeDot={false}
              dataKey={line.key}
              dot={false}
              isAnimationActive={false}
              name={line.label}
              stroke={line.color}
              strokeDasharray={line.strokeDasharray ?? '6 5'}
              strokeLinecap="round"
              strokeWidth={line.strokeWidth ?? 2.5}
              type="monotone"
              yAxisId="right"
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
