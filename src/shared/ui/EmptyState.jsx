import { cn } from '@/lib/utils'

export function EmptyState({
  action,
  className = '',
  description,
  title,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-item rounded-block bg-block-subtle p-component',
        className,
      )}
    >
      <p className="text-ui text-text-primary">{title}</p>
      {description ? <p className="text-body text-text-muted">{description}</p> : null}
      {action ? <div className="pt-micro">{action}</div> : null}
    </div>
  )
}
