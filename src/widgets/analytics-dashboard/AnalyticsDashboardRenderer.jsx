import { UnavailableState } from '@/shared/ui'

import { AnalyticsBreakdownWidget } from './AnalyticsBreakdownWidget'
import { AnalyticsFunnelWidget } from './AnalyticsFunnelWidget'
import { AnalyticsMetricGrid } from './AnalyticsMetricGrid'
import { AnalyticsTrendWidget } from './AnalyticsTrendWidget'

const WIDGET_RENDERERS = {
  breakdown: AnalyticsBreakdownWidget,
  funnel: AnalyticsFunnelWidget,
  metric_grid: ({ data }) => <AnalyticsMetricGrid metrics={data} />,
  trend: AnalyticsTrendWidget,
}

export function AnalyticsDashboardRenderer({ widgets = [] }) {
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

        return <Widget data={widget.data} key={widget.id} title={widget.title} />
      })}
    </div>
  )
}
