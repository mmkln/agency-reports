import { MetricGrid, MetricTile } from '@/shared/ui'
import { ContactCollectionAction } from '@/features/view-contact-collection'
import { resolveDashboardDisplayName } from '@/entities/dashboard-explanation'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { formatAnalyticsCumulativeLabel, formatAnalyticsValue } from './analyticsValueFormatting'

function formatMetricValue(metric) {
  return formatAnalyticsValue(metric.value, metric.unit)
}

function formatComparison(metric) {
  const delta = Number(metric.comparison?.delta ?? 0)
  const formatted = metric.unit === 'percent'
    ? `${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 1 })} pp`
    : metric.unit === 'currency'
      ? formatAnalyticsValue(Math.abs(delta), 'currency')
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

function formatPointInTime(metric) {
  if (metric.temporal?.kind !== 'point_in_time') {
    return null
  }

  const date = new Date(metric.temporal.as_of)
  if (Number.isNaN(date.getTime())) {
    return 'Current state'
  }

  return `As of ${date.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
}

function formatMetricHelper(metric) {
  return formatPointInTime(metric) ?? formatSupporting(metric)
}

export function AnalyticsMetricGrid({
  explanationEditor,
  explanations,
  metrics = [],
  period,
  runtime,
}) {
  return (
    <MetricGrid columns={Math.max(1, Math.min(metrics.length, 4))} variant="comfortable">
      {metrics.map((metric) => {
        const delta = Number(metric.comparison?.delta ?? 0)
        const helperTone = metric.temporal?.kind === 'point_in_time' || metric.supporting
          ? 'muted'
          : delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'muted'
        const explanationKey = metric.explanation_key ?? metric.key
        const label = resolveDashboardDisplayName(
          explanations?.[explanationKey],
          metric.presentation?.label ?? metric.label,
        )

        return (
          <MetricTile
            action={(
              <>
                <AnalyticsExplanationPopover
                  explanationEditor={explanationEditor}
                  explanationKey={explanationKey}
                  explanations={explanations}
                />
                {metric.drilldown ? (
                  <span className="ml-auto">
                    <ContactCollectionAction
                      descriptor={metric.drilldown}
                      period={period}
                      runtime={runtime}
                    />
                  </span>
                ) : null}
              </>
            )}
            helper={formatMetricHelper(metric)}
            helperTone={helperTone}
            id={`analytics-metric-${metric.key}`}
            iconName={metric.presentation?.icon_name}
            key={metric.key}
            label={label}
            meta={metric.cumulative ? [{
              key: 'cumulative',
              label: formatAnalyticsCumulativeLabel(metric.cumulative, metric.unit),
            }] : []}
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
