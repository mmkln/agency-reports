import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { getAnalyticsToneColor } from './analyticsWidgetColors'

export function AnalyticsSeriesLegend({
  explanationEditor,
  explanationKey,
  explanations,
  series = [],
  seriesColors,
}) {
  return (
    <div className="flex min-w-max flex-wrap items-center gap-component">
      {series.map((item, index) => (
        <span className="inline-flex items-center gap-tag" key={item.key}>
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{
              backgroundColor: seriesColors?.[index]
                ?? getAnalyticsToneColor(item.tone),
            }}
          />
          <span className="font-medium text-text-primary">{item.label}</span>
          <AnalyticsExplanationPopover
            explanationEditor={explanationEditor}
            explanationKey={`${explanationKey}.${item.key}`}
            explanations={explanations}
            triggerSize="xs"
          />
        </span>
      ))}
    </div>
  )
}
