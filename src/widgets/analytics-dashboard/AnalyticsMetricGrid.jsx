import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'

function formatMetricValue(metric) {
  if (metric.unit === 'percent') {
    return `${Number(metric.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  }

  return Number(metric.value).toLocaleString()
}

function formatComparison(metric) {
  const delta = Number(metric.comparison?.delta ?? 0)
  const formatted = metric.unit === 'percent'
    ? `${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 1 })} pp`
    : Math.abs(delta).toLocaleString()

  if (delta === 0) {
    return `No change ${metric.comparison?.label ?? ''}`.trim()
  }
  return `${delta > 0 ? '+' : '-'}${formatted} ${metric.comparison?.label ?? ''}`.trim()
}

export function AnalyticsMetricGrid({ metrics = [] }) {
  return (
    <section className="grid grid-cols-1 gap-component md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const delta = Number(metric.comparison?.delta ?? 0)

        return (
          <Card key={metric.key} size="sm">
            <CardHeader>
              <CardTitle className="text-label font-normal text-text-secondary">{metric.label}</CardTitle>
              <CardAction>
                <AnalyticsExplanationPopover explanation={metric.explanation} label={metric.label} />
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-item">
              <p className="text-data tabular-nums text-text-primary">{formatMetricValue(metric)}</p>
              <p className={cn(
                'text-label font-normal',
                delta > 0 && 'text-success-foreground',
                delta < 0 && 'text-destructive',
                delta === 0 && 'text-text-muted',
              )}>
                {formatComparison(metric)}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
