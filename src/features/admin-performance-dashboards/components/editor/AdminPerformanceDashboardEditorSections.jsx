import { Link } from 'react-router-dom'

import {
  Button,
  Input,
  StatusBadge,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_CHANNEL_META,
  PERFORMANCE_CHANNELS,
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
  PERFORMANCE_DATA_MODES,
  PERFORMANCE_GOAL_STATUSES,
  PERFORMANCE_INSIGHT_SEVERITIES,
  PERFORMANCE_NEXT_STEP_PRIORITIES,
  PERFORMANCE_SERVICE_TYPE_META,
  PERFORMANCE_SERVICE_TYPES,
  PERFORMANCE_TREND_GRANULARITIES,
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
  createAppendixTable,
  createServiceMetricEntry,
  createServiceSection,
  createServiceTextItem,
  createTrend,
  createTrendAnnotation,
  createTrendPoint,
  funnelFields,
  optionLabel,
  stringValue,
} from '../../model'
import {
  EditorSectionHeader,
  FormField,
  MetricEditor,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function ClientPeriodDataTrustSection({
  clients,
  form,
  updateForm,
}) {
  return (
    <WorkspaceCard
      description="These fields define the period and the data trust labels clients see before reading any metric."
      iconName="layoutDashboard"
      title="Client, Period & Data Trust"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Dashboard title">
          <Input onChange={(event) => updateForm({ title: event.target.value })} value={form.title} />
        </FormField>
        <SelectField label="Client" onChange={(value) => updateForm({ clientId: value })} value={form.clientId}>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </SelectField>
        <FormField label="Period start">
          <Input onChange={(event) => updateForm({ periodStart: event.target.value })} type="date" value={form.periodStart} />
        </FormField>
        <FormField label="Period end">
          <Input onChange={(event) => updateForm({ periodEnd: event.target.value })} type="date" value={form.periodEnd} />
        </FormField>
        <SelectField label="Data mode" onChange={(value) => updateForm({ dataMode: value })} value={form.dataMode}>
          {Object.values(PERFORMANCE_DATA_MODES).map((mode) => (
            <option key={mode} value={mode}>{PERFORMANCE_DATA_MODE_META[mode]?.label ?? optionLabel(mode)}</option>
          ))}
        </SelectField>
        <SelectField label="Data confidence" onChange={(value) => updateForm({ dataConfidence: value })} value={form.dataConfidence}>
          {Object.values(PERFORMANCE_DATA_CONFIDENCE).map((confidence) => (
            <option key={confidence} value={confidence}>{PERFORMANCE_DATA_CONFIDENCE_META[confidence]?.label ?? optionLabel(confidence)}</option>
          ))}
        </SelectField>
        <FormField label="Last updated">
          <Input onChange={(event) => updateForm({ lastUpdatedAt: event.target.value })} type="datetime-local" value={form.lastUpdatedAt} />
        </FormField>
        <FormField label="Source summary">
          <Input onChange={(event) => updateForm({ sourceSummary: event.target.value })} placeholder="Manual import from GA4 and ad platforms" value={form.sourceSummary} />
        </FormField>
        <FormField label="Account manager">
          <Input onChange={(event) => updateForm({ accountManager: event.target.value })} value={form.accountManager} />
        </FormField>
        <FormField label="Agency contact">
          <Input onChange={(event) => updateForm({ agencyContact: event.target.value })} value={form.agencyContact} />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Attribution note">
            <Textarea
              onChange={(event) => updateForm({ attributionNote: event.target.value })}
              placeholder="Explain attribution window, manual assumptions, or tracking caveats."
              rows={3}
              value={form.attributionNote}
            />
          </FormField>
        </div>
      </div>
    </WorkspaceCard>
  )
}

export function ExecutiveSummarySection({
  form,
  updateExecutiveSummary,
}) {
  return (
    <WorkspaceCard
      description="Research rule: no number without narrative. This is the client-facing interpretation of the month."
      iconName="messageSquare"
      title="Executive Summary"
    >
      <div className="grid gap-4">
        <FormField label="Narrative">
          <Textarea
            onChange={(event) => updateExecutiveSummary('narrative', event.target.value)}
            placeholder="Plain-language summary of what happened, why it matters, and what the agency is doing next."
            rows={5}
            value={form.content.executive_summary.narrative}
          />
        </FormField>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Main win">
            <Textarea
              onChange={(event) => updateExecutiveSummary('main_win', event.target.value)}
              rows={3}
              value={form.content.executive_summary.main_win}
            />
          </FormField>
          <FormField label="Main issue">
            <Textarea
              onChange={(event) => updateExecutiveSummary('main_issue', event.target.value)}
              rows={3}
              value={form.content.executive_summary.main_issue}
            />
          </FormField>
          <FormField label="Next focus">
            <Textarea
              onChange={(event) => updateExecutiveSummary('next_focus', event.target.value)}
              rows={3}
              value={form.content.executive_summary.next_focus}
            />
          </FormField>
        </div>
      </div>
    </WorkspaceCard>
  )
}

export function HeroMetricSection({
  form,
  updateHeroMetric,
}) {
  return (
    <WorkspaceCard
      description="One oversized outcome metric that answers whether marketing created business value."
      iconName="trendingUp"
      title="Hero Metric"
    >
      <MetricEditor
        metric={form.content.hero_metric}
        onUpdate={updateHeroMetric}
        title="Primary business outcome"
      />
    </WorkspaceCard>
  )
}

export function FunnelSection({
  form,
  updateContent,
}) {
  return (
    <WorkspaceCard
      description="Show where leads, opportunities, or revenue are leaking across the client journey."
      iconName="gitMerge"
      title="Funnel"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {funnelFields.map(([fieldName, label]) => (
          <FormField key={fieldName} label={label}>
            <Input
              onChange={(event) => updateContent('funnel', {
                ...form.content.funnel,
                [fieldName]: event.target.value,
              })}
              type="number"
              value={stringValue(form.content.funnel[fieldName])}
            />
          </FormField>
        ))}
      </div>
    </WorkspaceCard>
  )
}

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
              <p className="text-xs font-semibold text-text-muted">Channel {index + 1}</p>
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
              <p className="text-xs font-semibold text-text-muted">Goal</p>
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
              <p className="text-xs font-semibold text-text-muted">Insight</p>
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
              <p className="text-xs font-semibold text-text-muted">Next step</p>
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
              <p className="text-xs font-semibold text-text-muted">Trend {index + 1}</p>
              <Button onClick={() => removeArrayItem('trends', trend.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <FormField label="Metric key">
                <Input onChange={(event) => updateArrayItem('trends', trend.id, 'metric', event.target.value)} placeholder="qualified_leads" value={trend.metric ?? ''} />
              </FormField>
              <SelectField label="Granularity" onChange={(value) => updateArrayItem('trends', trend.id, 'granularity', value)} value={trend.granularity ?? PERFORMANCE_TREND_GRANULARITIES.MONTHLY}>
                {Object.values(PERFORMANCE_TREND_GRANULARITIES).map((granularity) => (
                  <option key={granularity} value={granularity}>{optionLabel(granularity)}</option>
                ))}
              </SelectField>
              <FormField label="Goal value">
                <Input onChange={(event) => updateArrayItem('trends', trend.id, 'goal_value', event.target.value)} type="number" value={stringValue(trend.goal_value)} />
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
        <p className="text-xs font-semibold text-text-secondary">{title}</p>
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
        <p className="text-xs font-semibold text-text-secondary">Annotations</p>
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

export function ServiceSectionsSection({
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
          onClick={() => updateContent('service_sections', [...form.content.service_sections, createServiceSection()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Service
        </Button>
      )}
      description="Service-specific client detail for paid ads, SEO, social, email/SMS, lead generation, CRO, or full-service work."
      iconName="grid"
      title="Service Detail Sections"
    >
      <div className="grid gap-3">
        {form.content.service_sections.length ? form.content.service_sections.map((section, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={section.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-text-muted">Service {index + 1}</p>
              <Button onClick={() => removeArrayItem('service_sections', section.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3">
              <SelectField label="Service type" onChange={(value) => updateArrayItem('service_sections', section.id, 'service_type', value)} value={section.service_type ?? PERFORMANCE_SERVICE_TYPES.FULL_SERVICE}>
                {Object.values(PERFORMANCE_SERVICE_TYPES).map((serviceType) => (
                  <option key={serviceType} value={serviceType}>
                    {PERFORMANCE_SERVICE_TYPE_META[serviceType]?.label ?? optionLabel(serviceType)}
                  </option>
                ))}
              </SelectField>
              <FormField label="Summary">
                <Textarea
                  onChange={(event) => updateArrayItem('service_sections', section.id, 'summary', event.target.value)}
                  rows={3}
                  value={section.summary ?? ''}
                />
              </FormField>
              <ServiceMetricsEditor
                items={section.metrics_entries ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'metrics_entries', createServiceMetricEntry())}
                onRemove={(entryId) => removeNestedArrayItem('service_sections', section.id, 'metrics_entries', entryId)}
                onUpdate={(entryId, field, value) => updateNestedArrayItem('service_sections', section.id, 'metrics_entries', entryId, field, value)}
              />
              <TextListEditor
                addLabel="Add Insight"
                emptyText="Add at least one plain-language note explaining what changed for this service."
                emptyTitle="No service insights"
                items={section.insights ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'insights', createServiceTextItem())}
                onRemove={(itemId) => removeNestedArrayItem('service_sections', section.id, 'insights', itemId)}
                onUpdate={(itemId, value) => updateNestedArrayItem('service_sections', section.id, 'insights', itemId, 'text', value)}
                placeholder="Google Ads drove the most reliable appointment requests."
                title="Service insights"
              />
              <TextListEditor
                addLabel="Add Action"
                emptyText="Add the next optimization, test, or recommendation for this service."
                emptyTitle="No service next actions"
                items={section.next_actions ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'next_actions', createServiceTextItem())}
                onRemove={(itemId) => removeNestedArrayItem('service_sections', section.id, 'next_actions', itemId)}
                onUpdate={(itemId, value) => updateNestedArrayItem('service_sections', section.id, 'next_actions', itemId, 'text', value)}
                placeholder="Increase exact-match search budget gradually."
                title="Service next actions"
              />
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No service sections yet">
            Add service detail only when a channel needs more explanation than the executive view.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

function ServiceMetricsEditor({
  items,
  onAdd,
  onRemove,
  onUpdate,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-secondary">Service metrics</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          Add Metric
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((entry) => (
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={entry.id}>
            <Input
              aria-label="Metric key"
              onChange={(event) => onUpdate(entry.id, 'key', event.target.value)}
              placeholder="qualified_leads"
              value={entry.key ?? ''}
            />
            <Input
              aria-label="Metric value"
              onChange={(event) => onUpdate(entry.id, 'value', event.target.value)}
              placeholder="63"
              value={stringValue(entry.value)}
            />
            <Button onClick={() => onRemove(entry.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="barChart" title="No service metrics">
            Add a small set of service-specific metrics only when they help explain the channel.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

function TextListEditor({
  addLabel,
  emptyText,
  emptyTitle,
  items,
  onAdd,
  onRemove,
  onUpdate,
  placeholder,
  title,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-secondary">{title}</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          {addLabel}
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => (
          <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={item.id}>
            <Input
              aria-label={title}
              onChange={(event) => onUpdate(item.id, event.target.value)}
              placeholder={placeholder}
              value={item.text ?? ''}
            />
            <Button onClick={() => onRemove(item.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="messageSquare" title={emptyTitle}>
            {emptyText}
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

export function AppendixTablesSection({
  addAppendixColumn,
  addAppendixRow,
  form,
  removeAppendixColumn,
  removeAppendixRow,
  removeArrayItem,
  updateAppendixCell,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('appendix_tables', [...form.content.appendix_tables, createAppendixTable()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Table
        </Button>
      )}
      description="Optional drill-down tables for top campaigns, pages, ads, keywords, or other appendix detail."
      iconName="grid"
      title="Appendix / Top Performer Tables"
    >
      <div className="grid gap-3">
        {form.content.appendix_tables.length ? form.content.appendix_tables.map((table, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={table.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-text-muted">Table {index + 1}</p>
              <Button onClick={() => removeArrayItem('appendix_tables', table.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3">
              <FormField label="Title">
                <Input onChange={(event) => updateArrayItem('appendix_tables', table.id, 'title', event.target.value)} value={table.title ?? ''} />
              </FormField>
              <AppendixColumnsEditor
                columns={table.columns ?? []}
                onAdd={() => addAppendixColumn(table.id)}
                onRemove={(columnId) => removeAppendixColumn(table.id, columnId)}
                onUpdate={(columnId, value) => updateNestedAppendixColumn({
                  form,
                  tableId: table.id,
                  columnId,
                  updateContent,
                  value,
                })}
              />
              <AppendixRowsEditor
                columns={table.columns ?? []}
                onAddRow={() => addAppendixRow(table.id)}
                onRemoveRow={(rowId) => removeAppendixRow(table.id, rowId)}
                onUpdateCell={(rowId, cellId, value) => updateAppendixCell(table.id, rowId, cellId, value)}
                rows={table.rows ?? []}
              />
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No appendix tables yet">
            Add drill-down tables only when the client needs detail below the executive dashboard.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

function updateNestedAppendixColumn({
  columnId,
  form,
  tableId,
  updateContent,
  value,
}) {
  updateContent(
    'appendix_tables',
    form.content.appendix_tables.map((table) => (
      table.id === tableId
        ? {
          ...table,
          columns: table.columns.map((column) => (
            column.id === columnId ? { ...column, label: value } : column
          )),
        }
        : table
    )),
  )
}

function AppendixColumnsEditor({
  columns,
  onAdd,
  onRemove,
  onUpdate,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-secondary">Columns</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          Add Column
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {columns.length ? columns.map((column) => (
          <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={column.id}>
            <Input
              aria-label="Column label"
              onChange={(event) => onUpdate(column.id, event.target.value)}
              placeholder="Campaign"
              value={column.label ?? ''}
            />
            <Button onClick={() => onRemove(column.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No columns yet">
            Add column names before entering table rows.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

function AppendixRowsEditor({
  columns,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
  rows,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-secondary">Rows</p>
        <Button disabled={!columns.length} onClick={onAddRow} size="sm" type="button" variant="outline">
          Add Row
        </Button>
      </div>
      <div className="mt-3 grid gap-3">
        {!columns.length ? (
          <InlineEmptyState iconName="grid" title="Columns required">
            Create at least one column before adding appendix rows.
          </InlineEmptyState>
        ) : rows.length ? rows.map((row, rowIndex) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-text-muted">Row {rowIndex + 1}</p>
              <Button onClick={() => onRemoveRow(row.id)} size="sm" type="button" variant="ghost">
                Remove
              </Button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {columns.map((column, columnIndex) => {
                const cell = row.cells[columnIndex] ?? {
                  id: `${row.id}-${column.id}`,
                  value: '',
                }

                return (
                  <FormField key={`${row.id}-${column.id}`} label={column.label || `Column ${columnIndex + 1}`}>
                    <Input
                      onChange={(event) => onUpdateCell(row.id, cell.id, event.target.value)}
                      value={cell.value ?? ''}
                    />
                  </FormField>
                )
              })}
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No rows yet">
            Add rows for top campaigns, pages, ads, keywords, or other useful client detail.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

export function EditorInspector({
  form,
  selectedClient,
}) {
  return (
    <aside className="grid h-fit gap-6 lg:sticky lg:top-24">
      <WorkspaceCard iconName="checkCircle2" title="Publish Readiness">
        <div className="grid gap-3 text-sm">
          <StatusBadge meta={PERFORMANCE_DASHBOARD_STATUS_META[form.status]} />
          <StatusBadge meta={PERFORMANCE_DATA_CONFIDENCE_META[form.dataConfidence]} />
          <StatusBadge meta={PERFORMANCE_DATA_MODE_META[form.dataMode]} />
          <div className="rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-muted">
            Publish requires metadata, data freshness, executive narrative, hero metric, KPI cards, at least one insight, and at least one next action.
          </div>
        </div>
      </WorkspaceCard>

      <WorkspaceCard iconName="users" title="Client Context">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold text-text-muted">Client</p>
            <p className="mt-1 font-semibold text-text-primary">{selectedClient?.name ?? 'Unknown client'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted">Portal slug</p>
            <p className="mt-1 text-text-secondary">/{selectedClient?.portalSlug ?? selectedClient?.portal_slug ?? 'unknown'}</p>
          </div>
          <Button asChild size="sm" type="button" variant="outline">
            <Link to={`/admin/client-overview?clientId=${form.clientId}`}>
              Open Overview Editor
            </Link>
          </Button>
        </div>
      </WorkspaceCard>

      <WorkspaceCard iconName="fileText" title="Detail Coverage">
        <div className="grid gap-3">
          <EditorSectionHeader
            description="These sections are optional detail. Keep them focused so the executive view remains readable."
            title="Additional dashboard depth"
          />
          <ul className="grid gap-2 text-xs text-text-muted">
            <li>{form.content.trends.length} trend series</li>
            <li>{form.content.service_sections.length} service sections</li>
            <li>{form.content.appendix_tables.length} appendix tables</li>
          </ul>
        </div>
      </WorkspaceCard>
    </aside>
  )
}
