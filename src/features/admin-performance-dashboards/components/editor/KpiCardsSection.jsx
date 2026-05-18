import { Button } from '@/shared/ui'

import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createMetric,
} from '../../model'
import {
  MetricEditor,
} from './AdminPerformanceDashboardEditorPrimitives'

export function KpiCardsSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('kpi_cards', [...form.content.kpi_cards, createMetric()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add KPI
        </Button>
      )}
      description="Keep the executive dashboard focused. Use 4-6 primary metrics before adding detail sections."
      iconName="barChart"
      title="Primary KPI Cards"
    >
      <div className="grid gap-3">
        {form.content.kpi_cards.length ? form.content.kpi_cards.map((metric, index) => (
          <MetricEditor
            key={metric.id}
            metric={metric}
            onRemove={() => removeArrayItem('kpi_cards', metric.id)}
            onUpdate={(field, value) => updateArrayItem('kpi_cards', metric.id, field, value)}
            title={`KPI ${index + 1}`}
          />
        )) : (
          <InlineEmptyState iconName="barChart" title="No KPI cards yet">
            Add business outcome KPIs such as revenue, qualified leads, booked calls, CPL, ROAS, or conversion rate.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}
