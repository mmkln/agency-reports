import {
  Checkbox,
  Input,
  Label,
  RadixSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function ClinicField({ children, label, required = false }) {
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

export function TextField({ label, onChange, placeholder, required = false, value }) {
  return (
    <ClinicField label={label} required={required}>
      <Input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type="text"
        value={value ?? ''}
      />
    </ClinicField>
  )
}

export function NumberField({ label, onChange, placeholder, value }) {
  return (
    <ClinicField label={label}>
      <Input
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={value ?? ''}
      />
    </ClinicField>
  )
}

export function NotesField({ label, onChange, placeholder, value }) {
  return (
    <ClinicField label={label}>
      <Textarea
        className="min-h-24 resize-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </ClinicField>
  )
}

export function SelectField({ children, label, onChange, value }) {
  return (
    <ClinicField label={label}>
      <Select onValueChange={onChange} value={value ?? ''}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </ClinicField>
  )
}

export function CheckboxField({ checked, disabled = false, label, onChange }) {
  return (
    <Label className={`flex min-h-control-small items-center gap-2 text-ui ${
      disabled ? 'text-text-quaternary' : 'text-text-secondary'
    }`}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextValue) => onChange(Boolean(nextValue))}
      />
      {label}
    </Label>
  )
}

export function SectionEmptyState({ children, iconName = 'helpCircle', title }) {
  return (
    <div className="flex items-start gap-3 rounded-control bg-surface-subtle px-3 py-4 text-ui text-text-muted">
      <Icon className="mt-0.5 text-text-quaternary" name={iconName} size={16} />
      <div>
        <p className="font-semibold text-text-secondary">{title}</p>
        <p className="mt-1">{children}</p>
      </div>
    </div>
  )
}

export function OptionItem({ iconName, label, value }) {
  return (
    <SelectItem value={value}>
      <span className="inline-flex items-center gap-2">
        {iconName ? <Icon name={iconName} size={15} /> : null}
        {label}
      </span>
    </SelectItem>
  )
}
