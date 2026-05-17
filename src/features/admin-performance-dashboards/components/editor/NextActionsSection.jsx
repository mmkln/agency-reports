import {
  Button,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_NEXT_STEP_PRIORITIES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createNextStep,
  optionLabel,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function NextActionsSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('next_steps', [...form.content.next_steps, createNextStep()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Next Step
        </Button>
      )}
      description="Reports should not be purely backward-looking. Tell the client what happens next."
      iconName="arrowRight"
      title="Next Actions"
    >
      <div className="grid gap-3">
        {form.content.next_steps.length ? form.content.next_steps.map((step) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={step.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Next step</p>
              <Button onClick={() => removeArrayItem('next_steps', step.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <FormField label="Title">
                <Input onChange={(event) => updateArrayItem('next_steps', step.id, 'title', event.target.value)} value={step.title ?? ''} />
              </FormField>
              <SelectField label="Priority" onChange={(value) => updateArrayItem('next_steps', step.id, 'priority', value)} value={step.priority ?? PERFORMANCE_NEXT_STEP_PRIORITIES.MEDIUM}>
                {Object.values(PERFORMANCE_NEXT_STEP_PRIORITIES).map((priority) => (
                  <option key={priority} value={priority}>{optionLabel(priority)}</option>
                ))}
              </SelectField>
              <FormField label="Owner">
                <Input onChange={(event) => updateArrayItem('next_steps', step.id, 'owner', event.target.value)} value={step.owner ?? ''} />
              </FormField>
              <FormField label="Due date">
                <Input onChange={(event) => updateArrayItem('next_steps', step.id, 'due_date', event.target.value)} type="date" value={step.due_date ?? ''} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Description">
                  <Textarea onChange={(event) => updateArrayItem('next_steps', step.id, 'description', event.target.value)} rows={3} value={step.description ?? ''} />
                </FormField>
              </div>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="arrowRight" title="No next actions yet">
            Publish validation requires at least one next action.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}
