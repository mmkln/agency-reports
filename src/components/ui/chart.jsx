import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

const THEMES = {
  dark: '.dark',
  light: '',
}

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function sanitizeChartId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '')
}

function ChartContainer({
  children,
  className,
  config,
  id,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${sanitizeChartId(id ?? uniqueId)}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          'flex min-h-0 min-w-0 justify-center text-label',
          '[&_.recharts-cartesian-axis-tick_text]:fill-text-muted',
          '[&_.recharts-cartesian-grid_line]:stroke-separator',
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-separator',
          '[&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
          className
        )}
        data-chart={chartId}
        data-slot="chart"
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ config, id }) {
  const colorConfig = Object.entries(config ?? {}).filter(([, itemConfig]) => (
    itemConfig.theme || itemConfig.color
  ))

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] ?? itemConfig.color

    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join('\n')}
}
`)
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip
const ChartLegend = RechartsPrimitive.Legend

function getPayloadConfig(config, item, key) {
  if (!item || !config) {
    return undefined
  }

  const payload = item.payload && typeof item.payload === 'object' ? item.payload : {}
  const payloadConfig = payload[key]

  if (typeof payloadConfig === 'string') {
    return config[payloadConfig]
  }

  return config[key] ?? config[item.dataKey] ?? config[item.name]
}

function ChartTooltipContent({
  active,
  className,
  formatter,
  hideLabel = false,
  label,
  labelFormatter,
  labelKey,
  nameKey,
  payload,
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const tooltipLabel = hideLabel
    ? null
    : (() => {
      const item = payload[0]

      if (!item) {
        return null
      }

      const key = `${labelKey ?? item.dataKey ?? item.name ?? 'value'}`
      const itemConfig = getPayloadConfig(config, item, key)
      const value = labelKey ? (itemConfig?.label ?? label) : label

      if (labelFormatter) {
        return labelFormatter(value, payload)
      }

      return value
    })()

  return (
    <div
      className={cn(
        'grid min-w-36 gap-tag rounded-control border border-control-border bg-block px-control py-item text-label text-text-primary shadow-block',
        className
      )}
    >
      {tooltipLabel ? (
        <p className="font-medium text-text-primary">{tooltipLabel}</p>
      ) : null}
      <div className="grid gap-tag">
        {payload.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
          const itemConfig = getPayloadConfig(config, item, key)
          const indicatorColor = item.color ?? item.payload?.fill ?? itemConfig?.color
          const name = itemConfig?.label ?? item.name ?? key
          const value = formatter
            ? formatter(item.value, name, item, index, payload)
            : item.value

          return (
            <div className="flex items-center justify-between gap-control" key={`${item.dataKey}-${index}`}>
              <span className="inline-flex min-w-0 items-center gap-tag text-text-secondary">
                {indicatorColor ? (
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: indicatorColor }} />
                ) : null}
                <span className="truncate">{name}</span>
              </span>
              <span className="font-medium tabular-nums text-text-primary">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartLegendContent({
  className,
  nameKey,
  payload,
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-center gap-component text-label text-text-secondary', className)}>
      {payload.map((item) => {
        const key = `${nameKey ?? item.dataKey ?? item.value ?? 'value'}`
        const itemConfig = getPayloadConfig(config, item, key)

        return (
          <div className="flex items-center gap-tag" key={item.value}>
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {itemConfig?.label ?? item.value}
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
}
