import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { Badge } from './Badge'
import { statusToneClasses } from './statusToneClasses'

export function StatusBadge({
  children,
  className,
  icon,
  label,
  meta,
  tone,
  variant = 'outline',
}) {
  const resolvedIcon = icon ?? meta?.icon
  const resolvedLabel = children ?? label ?? meta?.label
  const resolvedTone = tone ?? meta?.tone ?? 'neutral'

  return (
    <Badge
      className={cn(statusToneClasses[resolvedTone] ?? statusToneClasses.neutral, className)}
      variant={variant}
    >
      {resolvedIcon ? <Icon className="mr-1.5" name={resolvedIcon} size={13} /> : null}
      {resolvedLabel}
    </Badge>
  )
}
