import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Badge({ children, className = '', icon, tone, variant = 'outline', ...props }) {
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
    <ShadcnBadge className={cn('min-h-6 gap-tag px-control font-bold', toneClass, className)} variant={variant} {...props}>
      {icon ? <span className="inline-flex" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </ShadcnBadge>
  )
}
