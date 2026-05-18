import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

const markerToneClasses = {
  amber: 'bg-warning-muted text-warning-foreground',
  blue: 'bg-action-muted text-action',
  green: 'bg-success-muted text-success-foreground',
  neutral: 'bg-control text-text-secondary',
  purple: 'bg-premium-purple/10 text-premium-purple',
  rose: 'bg-destructive/10 text-destructive',
}

export function Timeline({
  ariaLabel = 'Timeline',
  children,
  className,
  id,
  ...props
}) {
  const inspectorId = useInspectorId('Timeline', id)

  return (
    <ol
      aria-label={ariaLabel}
      id={inspectorId}
      className={cn(
        'grid gap-card',
        '[&>li:first-child_[data-slot=timeline-rail-before]]:hidden',
        '[&>li:last-child_[data-slot=timeline-rail-after]]:hidden',
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  )
}

export function TimelineItem({
  badge,
  children,
  className,
  date,
  description,
  icon,
  iconName,
  iconTone = 'neutral',
  id,
  links,
  notice,
  title,
  titleAs: TitleComp = 'h3',
}) {
  const inspectorId = useInspectorId('TimelineItem', id)
  const markerToneClass = markerToneClasses[iconTone] ?? markerToneClasses.neutral

  return (
    <li
      id={inspectorId}
      className={cn('relative grid grid-cols-[104px_minmax(0,1fr)] gap-control sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-component', className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-[calc(var(--spacing-card)*-1)] bottom-[calc(100%-var(--spacing-component)-var(--spacing-control))] left-[calc(var(--spacing-control-small)/2)] w-px bg-separator"
        data-slot="timeline-rail-before"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[calc(var(--spacing-card)*-1)] top-[calc(var(--spacing-component)+var(--spacing-control))] left-[calc(var(--spacing-control-small)/2)] w-px bg-separator"
        data-slot="timeline-rail-after"
      />
      <div className="relative flex items-start gap-item">
        <div className="relative flex w-control-small shrink-0 justify-center">
          <span className={cn('relative z-10 mt-component flex size-control-small items-center justify-center rounded-full ring-4 ring-background', markerToneClass)}>
            {icon ?? (iconName ? <Icon name={iconName} size={15} /> : null)}
          </span>
        </div>
        {date ? <time className="mt-[calc(var(--spacing-component)+var(--spacing-tag))] min-w-0 text-label font-normal text-text-muted">{date}</time> : null}
      </div>

      <article className="rounded-block bg-block px-card py-component shadow-none">
        <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <TitleComp className="text-ui font-semibold text-text-primary">{title}</TitleComp> : null}
            {description ? <p className="mt-item max-w-readable text-ui font-normal text-text-secondary">{description}</p> : null}
          </div>
          {badge ? (
            <div className="flex shrink-0 items-center gap-item">
              {badge}
            </div>
          ) : null}
        </div>

        {notice ? <div className="mt-component">{notice}</div> : null}
        {links ? <div className="mt-component">{links}</div> : null}
        {children}
      </article>
    </li>
  )
}
