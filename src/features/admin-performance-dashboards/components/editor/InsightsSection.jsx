import {
  Button,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_INSIGHT_SEVERITIES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createInsight,
  optionLabel,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function InsightsSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('insights', [...form.content.insights, createInsight()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Insight
        </Button>
      )}
      description="Explain what changed, why it changed, and what it means."
      iconName="sparkles"
      title="Insights / What Changed"
    >
      <div className="grid gap-3">
        {form.content.insights.length ? form.content.insights.map((insight) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={insight.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Insight</p>
              <Button onClick={() => removeArrayItem('insights', insight.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                <FormField label="Title">
                  <Input onChange={(event) => updateArrayItem('insights', insight.id, 'title', event.target.value)} value={insight.title ?? ''} />
                </FormField>
                <SelectField label="Severity" onChange={(value) => updateArrayItem('insights', insight.id, 'severity', value)} value={insight.severity ?? PERFORMANCE_INSIGHT_SEVERITIES.INFO}>
                  {Object.values(PERFORMANCE_INSIGHT_SEVERITIES).map((severity) => (
                    <option key={severity} value={severity}>{optionLabel(severity)}</option>
                  ))}
                </SelectField>
              </div>
              <FormField label="Body">
                <Textarea onChange={(event) => updateArrayItem('insights', insight.id, 'body', event.target.value)} rows={3} value={insight.body ?? ''} />
              </FormField>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="sparkles" title="No insights yet">
            Publish validation requires at least one narrative insight.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}
