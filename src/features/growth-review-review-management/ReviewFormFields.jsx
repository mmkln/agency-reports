import {
  Input,
  Label,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

export function ReviewFieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive" role="alert">{children}</p>
}

export function ReviewTextField({
  error,
  help,
  id,
  label,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}) {
  return (
    <div className="grid gap-item">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <Input
        aria-invalid={Boolean(error)}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {help ? <p className="text-label font-normal text-text-muted">{help}</p> : null}
      <ReviewFieldError>{error}</ReviewFieldError>
    </div>
  )
}

export function ReviewSelectField({
  children,
  disabled = false,
  error,
  id,
  label,
  onValueChange,
  placeholder,
  value,
}) {
  return (
    <div className="grid gap-item">
      <Label htmlFor={id}>{label} *</Label>
      <RadixSelect disabled={disabled} onValueChange={onValueChange} value={value}>
        <SelectTrigger aria-invalid={Boolean(error)} id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </RadixSelect>
      <ReviewFieldError>{error}</ReviewFieldError>
    </div>
  )
}

export function SourceConnectionOptions({ connections }) {
  return connections.map((connection) => (
    <SelectItem key={connection.id} value={connection.id}>
      {connection.externalAccountId
        ? `GHL - ${connection.externalAccountId}`
        : 'GHL connection'}
    </SelectItem>
  ))
}

export function PipelineOptions({ pipelines }) {
  return pipelines.map((pipeline) => (
    <SelectItem key={pipeline.id} value={pipeline.id}>
      {pipeline.name}
    </SelectItem>
  ))
}
