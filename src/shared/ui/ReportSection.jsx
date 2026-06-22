import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'

import { useInspectorId } from './inspectorId'

export function ReportSection({
  action,
  children,
  className = '',
  description,
  eyebrow,
  id,
  onToggle,
  open = true,
  title,
}) {
  const inspectorId = useInspectorId('ReportSection', id)
  const canToggle = typeof onToggle === 'function'

  return (
    <section className={cn('scroll-mt-spacious py-card', className)} id={inspectorId}>
      <div className="flex min-w-0 items-start justify-between gap-component">
        <div className="min-w-0">
          {eyebrow ? <p className="text-label text-text-muted">{eyebrow}</p> : null}
          <h2 className="mt-tag text-heading text-text-primary">{title}</h2>
          {description ? <p className="mt-tag max-w-readable text-ui font-normal text-text-secondary">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-control">
          {action}
          {canToggle ? (
            <button
              aria-expanded={open}
              aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
              className="inline-flex h-control-small w-control-small items-center justify-center rounded-full bg-control text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              onClick={onToggle}
              type="button"
            >
              <Icon
                aria-hidden="true"
                className={cn('transition-transform duration-motion-fast', open && 'rotate-180')}
                name="chevronDown"
                size={16}
              />
            </button>
          ) : null}
        </div>
      </div>
      {open ? <div className="mt-component">{children}</div> : null}
    </section>
  )
}
