import {
  Button,
  Input,
} from '@/shared/ui'

import {
  PERFORMANCE_GOAL_STATUSES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createGoal,
  optionLabel,
  stringValue,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function GoalsSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('goals', [...form.content.goals, createGoal()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Goal
        </Button>
      )}
      description="Targets anchor whether each number is good, behind, or ahead."
      iconName="target"
      title="Goals vs Actual"
    >
      <div className="grid gap-3">
        {form.content.goals.length ? form.content.goals.map((goal) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={goal.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Goal</p>
              <Button onClick={() => removeArrayItem('goals', goal.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <FormField label="Name">
                <Input onChange={(event) => updateArrayItem('goals', goal.id, 'name', event.target.value)} value={goal.name ?? ''} />
              </FormField>
              <SelectField label="Status" onChange={(value) => updateArrayItem('goals', goal.id, 'status', value)} value={goal.status ?? PERFORMANCE_GOAL_STATUSES.ON_TRACK}>
                {Object.values(PERFORMANCE_GOAL_STATUSES).map((status) => (
                  <option key={status} value={status}>{optionLabel(status)}</option>
                ))}
              </SelectField>
              <FormField label="Target">
                <Input onChange={(event) => updateArrayItem('goals', goal.id, 'target', event.target.value)} type="number" value={stringValue(goal.target)} />
              </FormField>
              <FormField label="Actual">
                <Input onChange={(event) => updateArrayItem('goals', goal.id, 'actual', event.target.value)} type="number" value={stringValue(goal.actual)} />
              </FormField>
              <FormField label="Target date">
                <Input onChange={(event) => updateArrayItem('goals', goal.id, 'target_date', event.target.value)} type="date" value={goal.target_date ?? ''} />
              </FormField>
              <FormField label="Note">
                <Input onChange={(event) => updateArrayItem('goals', goal.id, 'note', event.target.value)} value={goal.note ?? ''} />
              </FormField>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="target" title="No goals yet">
            Add contract targets so clients can see actual performance against expectations.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}
