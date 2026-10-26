import { MetricGrid, MetricTile } from '@/shared/ui'
import { ContactCollectionAction } from '@/features/view-contact-collection'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

function formatMetricValue(metric) {
  if (metric.unit === 'percent') {
    return `${Number(metric.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  }
  if (metric.unit === 'currency') {
    return currencyFormatter.format(Number(metric.value) || 0)
  }

  return Number(metric.value).toLocaleString()
}

function formatComparison(metric) {
  const delta = Number(metric.comparison?.delta ?? 0)
  const formatted = metric.unit === 'percent'
    ? `${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 1 })} pp`
    : metric.unit === 'currency'
      ? currencyFormatter.format(Math.abs(delta))
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
  if (supporting.kind === 'text') {
    return supporting.label ?? ''
  }

  return formatComparison(metric)
}

export function AnalyticsMetricGrid({
  explanationEditor,
  explanations,
  metrics = [],
  period,
  runtime,
}) {
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
              <span className="flex items-center gap-micro">
                <AnalyticsExplanationPopover
                  explanationEditor={explanationEditor}
                  explanationKey={metric.explanation_key ?? metric.key}
                  explanations={explanations}
                />
                {metric.drilldown ? (
                  <ContactCollectionAction
                    descriptor={metric.drilldown}
                    period={period}
                    runtime={runtime}
                  />
                ) : null}
              </span>
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
