import {
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
  PERFORMANCE_DATA_MODES,
} from '../../../../entities/performance-dashboard'
import { WorkspaceCard } from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  funnelFields,
  optionLabel,
  stringValue,
} from '../../model'
import {
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
      description="These fields define the period and the data trust labels portal users see before reading any metric."
      iconName="layoutDashboard"
      title="Account, Period & Data Trust"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Dashboard title">
          <Input onChange={(event) => updateForm({ title: event.target.value })} value={form.title} />
        </FormField>
        <SelectField label="Account" onChange={(value) => updateForm({ clientId: value })} value={form.clientId}>
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
        <FormField label="Team contact">
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
      description="Research rule: no number without narrative. This is the portal-ready interpretation of the month."
      iconName="messageSquare"
      title="Executive Summary"
    >
      <div className="grid gap-4">
        <FormField label="Narrative">
          <Textarea
            onChange={(event) => updateExecutiveSummary('narrative', event.target.value)}
            placeholder="Plain-language summary of what happened, why it matters, and what the team is doing next."
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
