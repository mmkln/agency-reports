import { cn } from '@/lib/utils'

import { PagePrimaryAction } from './PagePrimaryAction'
import { useInspectorId } from './inspectorId'

function HeaderContent({
  actions,
  eyebrow,
  primaryAction,
  primaryActionContext,
  subtitle,
  title,
  titleScale,
}) {
  const resolvedPrimaryAction = primaryAction
    ? { context: primaryActionContext, ...primaryAction }
    : null
  const titleClassName = titleScale === 'display'
    ? 'text-display text-text-primary'
    : 'm-0 text-2xl leading-7 font-bold text-text-primary transition-all sm:truncate sm:text-3xl'

  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="max-w-readable space-y-item">
          {eyebrow ? <div className="text-label text-text-muted">{eyebrow}</div> : null}
          <h1 className={titleClassName}>{title}</h1>
          {subtitle ? <p className="m-0 text-ui text-text-secondary">{subtitle}</p> : null}
        </div>
      </div>
      {actions || resolvedPrimaryAction ? (
        <div className="flex shrink-0 flex-wrap items-center gap-control">
          {actions}
          {resolvedPrimaryAction ? <PagePrimaryAction {...resolvedPrimaryAction} /> : null}
        </div>
      ) : null}
    </>
  )
}

export function PageHeader({
  actions,
  className,
  contentClassName,
  eyebrow,
  id,
  primaryAction,
  primaryActionContext = 'page',
  subtitle,
  title,
  titleScale,
  variant = 'shell',
  ...props
}) {
  const inspectorId = useInspectorId('PageHeader', id)
  const isInline = variant === 'inline'
  const resolvedTitleScale = titleScale ?? (isInline ? 'display' : 'title')

  const content = (
    <HeaderContent
      actions={actions}
      eyebrow={eyebrow}
      primaryAction={primaryAction}
      primaryActionContext={primaryActionContext}
      subtitle={subtitle}
      title={title}
      titleScale={resolvedTitleScale}
    />
  )

  if (isInline) {
    return (
      <header
        className={cn(
          'flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between',
          className,
        )}
        id={inspectorId}
        {...props}
      >
        {content}
      </header>
    )
  }

  return (
    <header className={cn('border-b border-separator bg-surface', className)} id={inspectorId} {...props}>
      <div
        className={cn(
          'mx-auto flex max-w-7xl flex-col gap-component px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8',
          contentClassName,
        )}
      >
        {content}
      </div>
    </header>
  )
}
