import {
  FormField,
  NativeSelect,
  Textarea,
} from '@/shared/ui'

import {
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_STATUSES,
} from '../../../entities/dental-growth-review'

const PERIOD_TYPE_LABELS = Object.freeze({
  [DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY]: 'Bi-weekly',
  [DENTAL_GROWTH_REVIEW_PERIOD_TYPES.CUSTOM]: 'Custom',
  [DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY]: 'Weekly',
})

const DECISION_STATUSES = Object.freeze([
  'pending',
  'approved',
  'rejected',
  'deferred',
])

function formatStatusLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function FieldLabel({ children }) {
  return <span className="text-label text-text-muted">{children}</span>
}

function SectionHeader({ helper, title }) {
  return (
    <div className="grid gap-micro">
      <h3 className="text-ui font-semibold text-text-primary">{title}</h3>
      {helper ? <p className="text-label font-normal text-text-muted">{helper}</p> : null}
    </div>
  )
}

function TextAreaField({ label, onChange, value }) {
  return (
    <label className="grid gap-item">
      <FieldLabel>{label}</FieldLabel>
      <Textarea className="resize-none" onChange={(event) => onChange(event.target.value)} value={value ?? ''} />
    </label>
  )
}

function SelectField({ children, label, onChange, value }) {
  return (
    <label className="grid gap-item">
      <FieldLabel>{label}</FieldLabel>
      <NativeSelect onChange={(event) => onChange(event.target.value)} value={value ?? ''}>
        {children}
      </NativeSelect>
    </label>
  )
}

export function PeriodFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="Controls which review period this draft will appear under."
        title="Period"
      />
      <div className="grid gap-control md:grid-cols-2">
        <FormField label="Dashboard title" onValueChange={(value) => updateDraft((next) => { next.title = value })} value={draft.title} />
        <FormField label="Period label" onValueChange={(value) => updateDraft((next) => { next.label = value })} value={draft.label} />
        <FormField label="Start date" onValueChange={(value) => updateDraft((next) => { next.period_start = value })} type="date" value={draft.period_start} />
        <FormField label="End date" onValueChange={(value) => updateDraft((next) => { next.period_end = value })} type="date" value={draft.period_end} />
        <SelectField label="Cadence" onChange={(value) => updateDraft((next) => { next.period_type = value })} value={draft.period_type}>
          {Object.values(DENTAL_GROWTH_REVIEW_PERIOD_TYPES).map((periodType) => (
            <option key={periodType} value={periodType}>{PERIOD_TYPE_LABELS[periodType]}</option>
          ))}
        </SelectField>
      </div>
    </section>
  )
}

export function ContextFields({ draft, updateDraft }) {
  const context = draft.content.period_context

  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="This is the first read Mike sees before any diagnostic zone."
        title="Executive context"
      />
      <TextAreaField label="One-sentence summary" onChange={(value) => updateDraft((next) => { next.content.period_context.auto_summary = value })} value={context.auto_summary} />
      <div className="grid gap-control md:grid-cols-2">
        <TextAreaField label="Top alert message" onChange={(value) => updateDraft((next) => { next.content.period_context.top_alert_message = value })} value={context.top_alert_message} />
        <div className="grid gap-control">
          <SelectField label="Top alert status" onChange={(value) => updateDraft((next) => { next.content.period_context.top_alert_status = value })} value={context.top_alert_status}>
            {Object.values(DENTAL_GROWTH_REVIEW_STATUSES).map((status) => (
              <option key={status} value={status}>{formatStatusLabel(status)}</option>
            ))}
          </SelectField>
          <FormField label="Freshness summary" onValueChange={(value) => updateDraft((next) => { next.content.period_context.freshness_summary = value })} value={context.freshness_summary} />
        </div>
      </div>
    </section>
  )
}

export function HeroMetricFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="Keep this to exactly six outcome metrics. LTV:CAC does not belong here."
        title="Hero metrics"
      />
      <div className="grid gap-control md:grid-cols-2">
        {draft.content.hero_metrics.map((metric, index) => (
          <div className="grid gap-item rounded-control bg-block p-control" key={metric.id || index}>
            <FormField label="Metric title" onValueChange={(value) => updateDraft((next) => { next.content.hero_metrics[index].title = value })} value={metric.title} />
            <div className="grid gap-item sm:grid-cols-2">
              <FormField label="Value" onValueChange={(value) => updateDraft((next) => { next.content.hero_metrics[index].value = value })} value={metric.value} />
              <SelectField label="Status" onChange={(value) => updateDraft((next) => { next.content.hero_metrics[index].status = value })} value={metric.status}>
                {Object.values(DENTAL_GROWTH_REVIEW_STATUSES).map((status) => (
                  <option key={status} value={status}>{formatStatusLabel(status)}</option>
                ))}
              </SelectField>
            </div>
            <FormField label="Source" onValueChange={(value) => updateDraft((next) => { next.content.hero_metrics[index].source = value })} value={metric.source} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function NarrativeFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="Narrative must explain the operating meaning, not repeat the numbers."
        title="3 wins / 3 losses / 3 next"
      />
      <div className="grid gap-control lg:grid-cols-3">
        {['win', 'loss', 'next'].map((type) => (
          <div className="grid gap-item" key={type}>
            <p className="text-label text-text-muted">{type}</p>
            {draft.content.narrative_items
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => item.type === type)
              .slice(0, 3)
              .map(({ item, index }) => (
                <div className="grid gap-item rounded-control bg-block p-control" key={item.id || index}>
                  <FormField label="Title" onValueChange={(value) => updateDraft((next) => { next.content.narrative_items[index].title = value })} value={item.title} />
                  <TextAreaField label="Evidence and implication" onChange={(value) => updateDraft((next) => { next.content.narrative_items[index].body = value })} value={item.body} />
                  <FormField label="Owner" onValueChange={(value) => updateDraft((next) => { next.content.narrative_items[index].owner = value })} value={item.owner} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export function DecisionFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="Keep this capped at three decisions so the review ends with action."
        title="Decisions needed"
      />
      {draft.content.decisions.slice(0, 3).map((decision, index) => (
        <div className="grid gap-item rounded-control bg-block p-control" key={decision.id || index}>
          <FormField label="Decision title" onValueChange={(value) => updateDraft((next) => { next.content.decisions[index].title = value })} value={decision.title} />
          <TextAreaField label="Context" onChange={(value) => updateDraft((next) => { next.content.decisions[index].context = value })} value={decision.context} />
          <FormField label="Recommended decision" onValueChange={(value) => updateDraft((next) => { next.content.decisions[index].recommended_decision = value })} value={decision.recommended_decision} />
          <div className="grid gap-item md:grid-cols-3">
            <FormField label="Owner" onValueChange={(value) => updateDraft((next) => { next.content.decisions[index].owner = value })} value={decision.owner} />
            <FormField label="Due date" onValueChange={(value) => updateDraft((next) => { next.content.decisions[index].decision_due_by = value })} type="date" value={decision.decision_due_by} />
            <SelectField label="Status" onChange={(value) => updateDraft((next) => { next.content.decisions[index].status = value })} value={decision.status}>
              {DECISION_STATUSES.map((status) => (
                <option key={status} value={status}>{formatStatusLabel(status)}</option>
              ))}
            </SelectField>
          </div>
        </div>
      ))}
    </section>
  )
}

export function DataSourceFields({ draft, updateDraft }) {
  return (
    <section className="grid gap-control rounded-control bg-block-subtle p-control">
      <SectionHeader
        helper="These warnings determine which metrics should be trusted before publishing."
        title="Data freshness"
      />
      {draft.data_sources.slice(0, 4).map((source, index) => (
        <div className="grid gap-item rounded-control bg-block p-control md:grid-cols-3" key={source.id || index}>
          <FormField label="Source" onValueChange={(value) => updateDraft((next) => { next.data_sources[index].source_name = value })} value={source.source_name} />
          <FormField label="Last updated" onValueChange={(value) => updateDraft((next) => { next.data_sources[index].last_updated_at = value })} value={source.last_updated_at} />
          <SelectField label="Freshness" onChange={(value) => updateDraft((next) => { next.data_sources[index].freshness_status = value })} value={source.freshness_status}>
            {Object.values(DENTAL_GROWTH_REVIEW_STATUSES).map((status) => (
              <option key={status} value={status}>{formatStatusLabel(status)}</option>
            ))}
          </SelectField>
        </div>
      ))}
    </section>
  )
}
