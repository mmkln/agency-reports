import { UnavailableState } from '@/shared/ui'

import { AnalyticsBreakdownWidget } from './AnalyticsBreakdownWidget'
import { AnalyticsBookingActivityWidget } from './AnalyticsBookingActivityWidget'
import { AnalyticsFunnelWidget } from './AnalyticsFunnelWidget'
import { AnalyticsMetricGrid } from './AnalyticsMetricGrid'
import { AnalyticsSegmentedTableWidget } from './AnalyticsSegmentedTableWidget'
import { AnalyticsTrendWidget } from './AnalyticsTrendWidget'

const WIDGET_RENDERERS = {
  booking_activity: AnalyticsBookingActivityWidget,
  breakdown: AnalyticsBreakdownWidget,
  funnel: AnalyticsFunnelWidget,
  metric_grid: ({ data, ...props }) => (
    <AnalyticsMetricGrid metrics={data} {...props} />
  ),
  table: AnalyticsSegmentedTableWidget,
  trend: AnalyticsTrendWidget,
}

export function AnalyticsDashboardRenderer({
  explanationEditor,
  explanations,
  period,
  runtime,
  widgets = [],
}) {
  return (
    <div className="grid gap-card">
      {widgets.map((widget) => {
        const Widget = WIDGET_RENDERERS[widget.type]

        if (!Widget) {
          return (
            <UnavailableState
              description={`The ${widget.type} widget is not supported by this client yet.`}
              key={widget.id}
              title={widget.title || 'Widget unavailable'}
            />
          )
        }

        return (
          <Widget
            data={widget.data}
            explanationEditor={explanationEditor}
            explanations={explanations}
            key={widget.id}
            period={period}
            runtime={runtime}
            title={widget.title}
          />
        )
      })}
    </div>
  )
}
