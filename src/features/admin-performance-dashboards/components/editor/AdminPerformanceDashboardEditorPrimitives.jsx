import {
  Button,
  Input,
  Label,
  NativeSelect,
  Textarea,
} from '@/shared/ui'

import { PERFORMANCE_METRIC_STATUSES } from '../../../../entities/performance-dashboard'
import { FieldError } from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  optionLabel,
  stringValue,
} from '../../model'

export function FormField({ children, error, label }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-label text-text-secondary">{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function SelectField({ children, label, onChange, value }) {
  return (
    <FormField label={label}>
      <NativeSelect onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </NativeSelect>
    </FormField>
  )
}

export function EditorSectionHeader({ action, description, title }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-ui text-text-primary">{title}</h3>
        {description ? <p className="mt-1 text-label font-normal text-text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function IssueList({ issues, title, tone }) {
  if (!issues?.length) {
    return null
  }

  const toneClassName = tone === 'error'
    ? 'border-destructive/20 bg-destructive/10 text-destructive'
    : 'border-warning/30 bg-warning/10 text-warning-foreground'

  return (
    <div className={`rounded-control border px-3 py-2 ${toneClassName}`}>
      <p className="text-label">{title}</p>
      <ul className="mt-2 grid gap-1 text-label">
        {issues.map((issue) => (
          <li key={`${issue.path}-${issue.message}`}>
            <span className="font-mono">{issue.path}</span>: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MetricEditor({ metric, onRemove, onUpdate, title }) {
  return (
    <div className="rounded-control border border-control-border bg-surface-subtle p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-muted">{title}</p>
        {onRemove ? (
          <Button onClick={onRemove} size="sm" type="button" variant="ghost">
            Remove
          </Button>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <FormField label="Label">
          <Input onChange={(event) => onUpdate('label', event.target.value)} value={metric.label ?? ''} />
        </FormField>
        <FormField label="Value">
          <Input onChange={(event) => onUpdate('value', event.target.value)} value={metric.value ?? ''} />
        </FormField>
        <FormField label="Unit">
          <Input onChange={(event) => onUpdate('unit', event.target.value)} placeholder="$, %, leads..." value={metric.unit ?? ''} />
        </FormField>
        <FormField label="Delta %">
          <Input onChange={(event) => onUpdate('delta_pct', event.target.value)} type="number" value={stringValue(metric.delta_pct)} />
        </FormField>
        <FormField label="Goal">
          <Input onChange={(event) => onUpdate('goal', event.target.value)} value={metric.goal ?? ''} />
        </FormField>
        <FormField label="Goal %">
          <Input onChange={(event) => onUpdate('goal_pct', event.target.value)} type="number" value={stringValue(metric.goal_pct)} />
        </FormField>
        <SelectField label="Status" onChange={(value) => onUpdate('status', value)} value={metric.status ?? PERFORMANCE_METRIC_STATUSES.NEUTRAL}>
          {Object.values(PERFORMANCE_METRIC_STATUSES).map((status) => (
            <option key={status} value={status}>{optionLabel(status)}</option>
          ))}
        </SelectField>
        <FormField label="Source">
          <Input onChange={(event) => onUpdate('source', event.target.value)} placeholder="GA4, Meta Ads, Manual..." value={metric.source ?? ''} />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Client-facing definition">
            <Textarea
              onChange={(event) => onUpdate('definition', event.target.value)}
              placeholder="Explain what this metric means in plain language."
              rows={3}
              value={metric.definition ?? ''}
            />
          </FormField>
        </div>
      </div>
    </div>
  )
}
