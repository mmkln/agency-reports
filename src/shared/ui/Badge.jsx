import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function Badge({ children, className = '', icon, id, tone, variant = 'outline', ...props }) {
  const inspectorId = useInspectorId('Badge', id)
  const resolvedTone = tone ?? (!className && variant === 'outline' ? 'neutral' : null)
  const toneClass = {
    blue: 'border-action/20 bg-action-muted text-action',
    green: 'border-success/20 bg-success-muted text-success-foreground',
    amber: 'border-warning/20 bg-warning-muted text-warning-foreground',
    neutral: 'border-control-border bg-control text-text-secondary',
    purple: 'border-premium-purple/20 bg-premium-purple/10 text-premium-purple',
    rose: 'border-destructive/20 bg-destructive/10 text-destructive',
  }[resolvedTone]

  return (
    <ShadcnBadge
      id={inspectorId}
      className={cn('h-6 gap-1.5 px-2.5 py-0 text-xs font-medium leading-none', toneClass, className)}
      variant={variant}
      {...props}
    >
      {icon ? <span className="flex size-3.5 shrink-0 items-center justify-center leading-none [&>svg]:size-3.5" aria-hidden="true">{icon}</span> : null}
      <span className="flex h-4 items-center leading-none">{children}</span>
    </ShadcnBadge>
  )
}
