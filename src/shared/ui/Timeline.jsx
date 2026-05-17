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
      className={cn('grid gap-component [&>li:last-child_[data-slot=timeline-rail]]:hidden', className)}
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
      className={cn('grid grid-cols-[80px_minmax(0,1fr)] gap-component sm:grid-cols-[96px_minmax(0,1fr)]', className)}
    >
      <div className="relative flex items-start gap-item pt-tag">
        {date ? <time className="min-w-0 flex-1 text-right text-label font-normal text-text-muted">{date}</time> : null}
        <div className="relative flex w-control-small shrink-0 justify-center">
          <span
            aria-hidden="true"
            className="absolute -bottom-component top-control-small w-px bg-separator"
            data-slot="timeline-rail"
          />
          <span className={cn('relative z-10 flex size-control-small items-center justify-center rounded-full', markerToneClass)}>
            {icon ?? (iconName ? <Icon name={iconName} size={15} /> : null)}
          </span>
        </div>
      </div>

      <article className="rounded-block bg-block p-card shadow-block">
        <div className="flex flex-col gap-item sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <TitleComp className="text-ui font-semibold text-text-primary">{title}</TitleComp> : null}
            {description ? <p className="mt-item max-w-readable text-body text-text-secondary">{description}</p> : null}
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>

        {notice ? <div className="mt-component">{notice}</div> : null}
        {links ? <div className="mt-component">{links}</div> : null}
        {children}
      </article>
    </li>
  )
}
