import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { Badge } from './Badge'
import { useInspectorId } from './inspectorId'
import { statusToneClasses } from './statusToneClasses'

export function StatusBadge({
  children,
  className,
  icon,
  id,
  label,
  meta,
  tone,
  variant = 'outline',
}) {
  const inspectorId = useInspectorId('StatusBadge', id)
  const resolvedIcon = icon ?? meta?.icon
  const resolvedLabel = children ?? label ?? meta?.label
  const resolvedTone = tone ?? meta?.tone ?? 'neutral'

  return (
    <Badge
      id={inspectorId}
      className={cn(statusToneClasses[resolvedTone] ?? statusToneClasses.neutral, className)}
      icon={resolvedIcon ? <Icon name={resolvedIcon} size={14} /> : null}
      variant={variant}
    >
      {resolvedLabel}
    </Badge>
  )
}
