import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const statusClassName = {
  green: 'bg-success-muted text-success',
  grey: 'bg-fill-secondary text-text-muted',
  red: 'bg-destructive-muted text-destructive',
  yellow: 'bg-warning-muted text-warning-foreground',
}

const variantClassName = {
  compact: 'min-h-40',
  hero: 'min-h-52',
}

export function MetricTile({
  className = '',
  helper,
  id,
  meta = [],
  statusLabel,
  statusTone = 'grey',
  title,
  value,
  variant = 'hero',
}) {
  const inspectorId = useInspectorId('MetricTile', id)

  return (
    <article
      className={cn(
        'grid gap-item rounded-block bg-block p-component',
        variantClassName[variant],
        className,
      )}
      id={inspectorId}
    >
      <div className="flex min-w-0 items-start justify-between gap-control">
        <p className="min-w-0 text-label font-normal text-text-muted">{title}</p>
        {statusLabel ? (
          <span className={cn('shrink-0 rounded-full px-control py-tag text-label leading-none', statusClassName[statusTone] ?? statusClassName.grey)}>
            {statusLabel}
          </span>
        ) : null}
      </div>
      <p className="text-data tabular-nums text-text-primary">{value}</p>
      {helper ? <p className="text-label font-normal text-text-secondary">{helper}</p> : null}
      {meta.length ? (
        <div className="grid gap-tag text-label font-normal text-text-muted">
          {meta.map((item, index) => (
            <p key={item.key ?? `${title}-${index}`}>{item.label ?? item}</p>
          ))}
        </div>
      ) : null}
    </article>
  )
}
