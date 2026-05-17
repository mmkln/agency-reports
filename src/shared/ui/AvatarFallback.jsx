import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const toneClasses = {
  amber: 'bg-warning-muted text-warning-foreground',
  blue: 'bg-action-muted text-action',
  green: 'bg-success-muted text-success-foreground',
  neutral: 'bg-control-selected text-text-secondary',
  purple: 'bg-premium-purple/10 text-premium-purple',
  rose: 'bg-destructive/10 text-destructive',
}

const generatedTones = ['blue', 'green', 'amber', 'purple', 'rose', 'neutral']

const sizeClasses = {
  sm: 'size-control-small text-label',
  md: 'size-target text-ui',
  lg: 'size-control-large text-ui',
}

function hashString(value) {
  return Array.from(value).reduce((hash, character) => hash + character.charCodeAt(0), 0)
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return '?'
  }

  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function AvatarFallback({
  className,
  id,
  name,
  size = 'sm',
  tone,
  ...props
}) {
  const inspectorId = useInspectorId('AvatarFallback', id)
  const resolvedName = String(name ?? '').trim()
  const generatedTone = generatedTones[hashString(resolvedName) % generatedTones.length]
  const toneClass = toneClasses[tone ?? generatedTone] ?? tone

  return (
    <span
      aria-label={resolvedName ? `${resolvedName} avatar` : 'Avatar'}
      id={inspectorId}
      role="img"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none',
        sizeClasses[size] ?? sizeClasses.sm,
        toneClass,
        className,
      )}
      {...props}
    >
      {getInitials(resolvedName)}
    </span>
  )
}
