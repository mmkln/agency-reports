import { Icon } from '../../shared/icons'
import { Input } from '../../shared/ui'

export function AuthInput({ error = '', iconName, label, ...props }) {
  return (
    <label className="grid gap-item">
      <span className="text-label text-text-secondary">{label}</span>
      <span className="relative block">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-control top-1/2 -translate-y-1/2 text-text-muted"
          name={iconName}
          size={18}
        />
        <Input aria-invalid={error ? 'true' : undefined} className="pl-layout" {...props} />
      </span>
      {error ? <span className="text-label font-normal text-destructive">{error}</span> : null}
    </label>
  )
}
