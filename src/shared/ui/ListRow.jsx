import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function ListRow({
  as: Comp = 'article',
  children,
  className,
  description,
  id,
  leading,
  metadata,
  title,
  titleAs: TitleComp = 'p',
  trailing,
  ...props
}) {
  const inspectorId = useInspectorId('ListRow', id)

  return (
    <Comp
      id={inspectorId}
      className={cn(
        'flex min-h-control-xl items-center justify-between gap-component px-card py-component transition-colors duration-motion-fast ease-motion-standard',
        props.onClick && 'cursor-pointer hover:bg-control-hover',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-control">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          {title ? <TitleComp className="truncate text-ui text-text-primary">{title}</TitleComp> : null}
          {description ? <p className="mt-micro truncate text-label font-normal text-text-muted">{description}</p> : null}
          {metadata ? <div className="mt-tag">{metadata}</div> : null}
          {children}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </Comp>
  )
}
