import { cn } from '@/lib/utils'

import { PagePrimaryAction } from './PagePrimaryAction'
import { useInspectorId } from './inspectorId'

function HeaderContent({
  actions,
  eyebrow,
  primaryAction,
  primaryActionContext,
  title,
  titleScale,
}) {
  const resolvedPrimaryAction = primaryAction
    ? { context: primaryActionContext, ...primaryAction }
    : null
  const titleClassName = titleScale === 'display'
    ? 'text-display text-text-primary'
    : 'm-0 text-heading text-text-primary transition-colors sm:truncate'

  return (
    <>
      <div className="min-w-[min(18rem,100%)] flex-1">
        <div className="max-w-readable space-y-micro">
          {eyebrow ? <div className="text-label text-text-muted">{eyebrow}</div> : null}
          <h1 className={titleClassName}>{title}</h1>
        </div>
      </div>
      {actions || resolvedPrimaryAction ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-control lg:w-auto lg:justify-end">
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
  subtitle: _subtitle,
  title,
  titleScale,
  variant = 'shell',
  ...props
}) {
  void _subtitle

  const inspectorId = useInspectorId('PageHeader', id)
  const isInline = variant === 'inline'
  const resolvedTitleScale = titleScale ?? 'title'

  const content = (
    <HeaderContent
      actions={actions}
      eyebrow={eyebrow}
      primaryAction={primaryAction}
      primaryActionContext={primaryActionContext}
      title={title}
      titleScale={resolvedTitleScale}
    />
  )

  if (isInline) {
    return (
      <header
        className={cn(
          'flex flex-col gap-control lg:flex-row lg:items-center lg:justify-between',
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
    <header className={cn('sticky top-0 z-20 border-b border-separator bg-surface', className)} id={inspectorId} {...props}>
      <div
        className={cn(
          'flex w-full flex-col gap-control px-app-gutter py-control lg:flex-row lg:items-center lg:justify-between',
          contentClassName,
        )}
      >
        {content}
      </div>
    </header>
  )
}
