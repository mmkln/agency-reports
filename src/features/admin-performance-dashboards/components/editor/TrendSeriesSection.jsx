import {
  Button,
  Input,
} from '@/shared/ui'

import {
  PERFORMANCE_TREND_GRANULARITIES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createTrend,
  createTrendAnnotation,
  createTrendPoint,
  optionLabel,
  stringValue,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function TrendSeriesSection({
  addNestedArrayItem,
  form,
  removeNestedArrayItem,
  removeArrayItem,
  updateArrayItem,
  updateContent,
  updateNestedArrayItem,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('trends', [...form.content.trends, createTrend()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Trend
        </Button>
      )}
      description="Primary movement over time. Add points and annotations directly so manual data stays readable before integrations exist."
      iconName="trendingUp"
      title="Trend Series"
    >
      <div className="grid gap-3">
        {form.content.trends.length ? form.content.trends.map((trend, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={trend.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Trend {index + 1}</p>
              <Button onClick={() => removeArrayItem('trends', trend.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <FormField label="Metric key">
                <Input
                  aria-label="Trend metric key"
                  onChange={(event) => updateArrayItem('trends', trend.id, 'metric', event.target.value)}
                  placeholder="qualified_leads"
                  value={trend.metric ?? ''}
                />
              </FormField>
              <SelectField label="Granularity" onChange={(value) => updateArrayItem('trends', trend.id, 'granularity', value)} value={trend.granularity ?? PERFORMANCE_TREND_GRANULARITIES.MONTHLY}>
                {Object.values(PERFORMANCE_TREND_GRANULARITIES).map((granularity) => (
                  <option key={granularity} value={granularity}>{optionLabel(granularity)}</option>
                ))}
              </SelectField>
              <FormField label="Goal value">
                <Input
                  aria-label="Trend goal value"
                  onChange={(event) => updateArrayItem('trends', trend.id, 'goal_value', event.target.value)}
                  type="number"
                  value={stringValue(trend.goal_value)}
                />
              </FormField>
              <div className="md:col-span-2">
                <SeriesEditor
                  addLabel="Add Point"
                  emptyTitle="No primary series points"
                  items={trend.series}
                  onAdd={() => addNestedArrayItem('trends', trend.id, 'series', createTrendPoint())}
                  onRemove={(pointId) => removeNestedArrayItem('trends', trend.id, 'series', pointId)}
                  onUpdate={(pointId, field, value) => updateNestedArrayItem('trends', trend.id, 'series', pointId, field, value)}
                  title="Primary series"
                />
              </div>
              <div className="md:col-span-2">
                <SeriesEditor
                  addLabel="Add Comparison Point"
                  emptyTitle="No comparison points"
                  items={trend.comparison_series}
                  onAdd={() => addNestedArrayItem('trends', trend.id, 'comparison_series', createTrendPoint())}
                  onRemove={(pointId) => removeNestedArrayItem('trends', trend.id, 'comparison_series', pointId)}
                  onUpdate={(pointId, field, value) => updateNestedArrayItem('trends', trend.id, 'comparison_series', pointId, field, value)}
                  title="Comparison series"
                />
              </div>
              <div className="md:col-span-2">
                <AnnotationEditor
                  items={trend.annotations}
                  onAdd={() => addNestedArrayItem('trends', trend.id, 'annotations', createTrendAnnotation())}
                  onRemove={(annotationId) => removeNestedArrayItem('trends', trend.id, 'annotations', annotationId)}
                  onUpdate={(annotationId, field, value) => updateNestedArrayItem('trends', trend.id, 'annotations', annotationId, field, value)}
                />
              </div>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="trendingUp" title="No trend series yet">
            Add a trend for the primary outcome metric so clients can see direction over time.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

function SeriesEditor({
  addLabel,
  emptyTitle,
  items,
  onAdd,
  onRemove,
  onUpdate,
  title,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">{title}</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          {addLabel}
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((point) => (
          <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]" key={point.id}>
            <Input
              aria-label={`${title} date`}
              onChange={(event) => onUpdate(point.id, 'date', event.target.value)}
              type="date"
              value={point.date ?? ''}
            />
            <Input
              aria-label={`${title} value`}
              onChange={(event) => onUpdate(point.id, 'value', event.target.value)}
              placeholder="Value"
              type="number"
              value={stringValue(point.value)}
            />
            <Button onClick={() => onRemove(point.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="trendingUp" title={emptyTitle}>
            Add dated values to render this trend for clients.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

function AnnotationEditor({
  items,
  onAdd,
  onRemove,
  onUpdate,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">Annotations</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          Add Annotation
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((annotation) => (
          <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]" key={annotation.id}>
            <Input
              aria-label="Annotation date"
              onChange={(event) => onUpdate(annotation.id, 'date', event.target.value)}
              type="date"
              value={annotation.date ?? ''}
            />
            <Input
              aria-label="Annotation label"
              onChange={(event) => onUpdate(annotation.id, 'label', event.target.value)}
              placeholder="Campaign launch, tracking fix, offer test..."
              value={annotation.label ?? ''}
            />
            <Button onClick={() => onRemove(annotation.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="messageSquare" title="No annotations yet">
            Add notes for campaign launches, tracking fixes, budget changes, or other events that explain movement.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}
