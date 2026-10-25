import { MetricGrid, MetricTile } from '@/shared/ui'

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

function formatSupporting(metric) {
  const supporting = metric.supporting
  if (!supporting) {
    return formatComparison(metric)
  }

  const numerator = Number(supporting.numerator ?? 0)
  const denominator = Number(supporting.denominator ?? 0)
  if (supporting.kind === 'percentage') {
    const percentage = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
    return `${percentage}% ${supporting.label ?? ''}`.trim()
  }
  if (supporting.kind === 'fraction') {
    return `${numerator.toLocaleString()} of ${denominator.toLocaleString()} ${supporting.label ?? ''}`.trim()
  }

  return formatComparison(metric)
}

export function AnalyticsMetricGrid({ metrics = [] }) {
  return (
    <MetricGrid variant="comfortable">
      {metrics.map((metric) => {
        const delta = Number(metric.comparison?.delta ?? 0)
        const helperTone = metric.supporting
          ? 'muted'
          : delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'muted'
        const label = metric.presentation?.label ?? metric.label

        return (
          <MetricTile
            action={(
              <AnalyticsExplanationPopover explanation={metric.explanation} label={label} />
            )}
            helper={formatSupporting(metric)}
            helperTone={helperTone}
            id={`analytics-metric-${metric.key}`}
            iconName={metric.presentation?.icon_name}
            key={metric.key}
            label={label}
            tone={metric.presentation?.tone ?? 'neutral'}
            value={formatMetricValue(metric)}
            valueTone={metric.presentation?.value_tone}
            variant="standard"
          />
        )
      })}
    </MetricGrid>
  )
}
