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
  barSize = 10,
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

  return (
    <div aria-label={ariaLabel} className="h-full min-h-[30rem] w-full" role="img">
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
              barSize={bar.barSize ?? barSize}
              dataKey={bar.key}
              fill={bar.color}
              isAnimationActive={false}
              key={bar.key}
              name={bar.label}
              radius={0}
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
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeWidth={2.5}
              type="monotone"
              yAxisId="right"
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
