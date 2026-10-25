import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'

const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function AnalyticsTrendWidget({ data, title }) {
  const series = data?.series ?? []
  const chartConfig = Object.fromEntries(series.map((item, index) => [
    item.key,
    {
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      label: item.label,
    },
  ]))

  return (
    <Panel>
      <PanelHeader
        action={<AnalyticsExplanationPopover explanation={data?.explanation} label={title} />}
        title={title}
      />
      <PanelBody>
        <ChartContainer className="h-72 w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={data?.rows ?? []} margin={{ bottom: 8, left: 0, right: 0, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={12} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            {series.map((item) => (
              <Bar
                dataKey={item.key}
                fill={`var(--color-${item.key})`}
                key={item.key}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </PanelBody>
    </Panel>
  )
}
