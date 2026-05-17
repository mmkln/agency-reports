import {
  Input,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

const NONE_VALUE = '__none'

export function MetricField({ children, label, required = false }) {
  return (
    <label className="grid gap-2">
      <span className="text-label text-text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
      {children}
    </label>
  )
}

export function TextField({ label, onChange, placeholder, required = false, type = 'text', value }) {
  return (
    <MetricField label={label} required={required}>
      <Input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value ?? ''}
      />
    </MetricField>
  )
}

export function NumberField({ label, onChange, placeholder, value }) {
  return (
    <MetricField label={label}>
      <Input
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={value ?? ''}
      />
    </MetricField>
  )
}

export function NotesField({ label, onChange, placeholder, value }) {
  return (
    <MetricField label={label}>
      <Textarea
        className="min-h-20 resize-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </MetricField>
  )
}

export function SelectField({ children, label, onChange, value }) {
  return (
    <MetricField label={label}>
      <Select
        onValueChange={(nextValue) => onChange(nextValue === NONE_VALUE ? '' : nextValue)}
        value={value || NONE_VALUE}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>None</SelectItem>
          {children}
        </SelectContent>
      </Select>
    </MetricField>
  )
}

export { SelectItem }
