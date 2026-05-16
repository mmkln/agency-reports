import {
  Button,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_CHANNEL_META,
  PERFORMANCE_CHANNELS,
  PERFORMANCE_GOAL_STATUSES,
  PERFORMANCE_INSIGHT_SEVERITIES,
  PERFORMANCE_NEXT_STEP_PRIORITIES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  channelNumberFields,
  createChannelBreakdownItem,
  createGoal,
  createInsight,
  createMetric,
  createNextStep,
  optionLabel,
  stringValue,
} from '../../model'
import {
  FormField,
  MetricEditor,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function ChannelBreakdownSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('channel_breakdown', [
            ...form.content.channel_breakdown,
            createChannelBreakdownItem(),
          ])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Channel
        </Button>
      )}
      description="Compare channels by spend, results, efficiency, revenue, and a plain-language summary."
      iconName="barChart"
      title="Channel Breakdown"
    >
      <div className="grid gap-3">
        {form.content.channel_breakdown.length ? form.content.channel_breakdown.map((channel, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={channel.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Channel {index + 1}</p>
              <Button onClick={() => removeArrayItem('channel_breakdown', channel.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <SelectField label="Channel" onChange={(value) => updateArrayItem('channel_breakdown', channel.id, 'channel', value)} value={channel.channel ?? PERFORMANCE_CHANNELS.OTHER}>
                {Object.values(PERFORMANCE_CHANNELS).map((channelValue) => (
                  <option key={channelValue} value={channelValue}>
                    {PERFORMANCE_CHANNEL_META[channelValue]?.label ?? optionLabel(channelValue)}
                  </option>
                ))}
              </SelectField>
              {channelNumberFields.map(([fieldName, label]) => (
                <FormField key={fieldName} label={label}>
                  <Input
                    onChange={(event) => updateArrayItem('channel_breakdown', channel.id, fieldName, event.target.value)}
                    type="number"
                    value={stringValue(channel[fieldName])}
                  />
                </FormField>
              ))}
              <div className="md:col-span-2">
                <FormField label="What changed / channel summary">
                  <Textarea
                    onChange={(event) => updateArrayItem('channel_breakdown', channel.id, 'summary', event.target.value)}
                    placeholder="Explain the channel result in client-facing language."
                    rows={3}
                    value={channel.summary ?? ''}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="barChart" title="No channels yet">
            Add channel rows for Google Ads, Meta Ads, SEO, Email/SMS, referrals, direct, or other meaningful sources.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

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
