import { cn } from '@/lib/utils'

export function FoundationPageHeader({
  actions,
  className,
  eyebrow,
  title,
  ...props
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
      {...props}
    >
      <div className="max-w-readable space-y-item">
        {eyebrow ? <div className="text-label text-text-muted">{eyebrow}</div> : null}
        <h1 className="text-display text-text-primary">{title}</h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-control">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
