import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const statusClassName = {
  green: 'bg-success-muted text-success',
  grey: 'bg-fill-secondary text-text-muted',
  red: 'bg-destructive-muted text-destructive',
  yellow: 'bg-warning-muted text-warning-foreground',
}

export function FreshnessMiniBar({
  ariaLabel = 'Data freshness',
  className = '',
  id,
  items,
}) {
  const inspectorId = useInspectorId('FreshnessMiniBar', id)

  if (!items?.length) {
    return null
  }

  return (
    <div aria-label={ariaLabel} className={cn('flex max-w-full flex-wrap items-center gap-tag', className)} id={inspectorId}>
      {items.map((item) => (
        <span
          className={cn(
            'inline-flex min-h-control-mini max-w-full items-center gap-tag rounded-full px-control py-0 text-label leading-none',
            statusClassName[item.status] ?? statusClassName.grey,
          )}
          key={item.id ?? item.label}
          title={item.title}
        >
          <span className="truncate">{item.label}</span>
        </span>
      ))}
    </div>
  )
}
