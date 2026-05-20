import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'

import { useInspectorId } from './inspectorId'

export function Panel({ children, className = '', id, ...props }) {
  const inspectorId = useInspectorId('Panel', id)

  return (
    <Card as="section" id={inspectorId} className={cn('flex flex-col gap-0 py-0', className)} {...props}>
      {children}
    </Card>
  )
}

export function PanelHeader({ action, children, divided = false, eyebrow, iconName, id, subtitle, title }) {
  const inspectorId = useInspectorId('PanelHeader', id)

  return (
    <CardHeader
      id={inspectorId}
      className={cn(
        'gap-component px-card pb-item pt-component',
        divided && 'border-b border-separator',
      )}
    >
      {title ? (
        <div className="flex min-w-0 items-start gap-control">
          {iconName ? (
            <span className="mt-micro flex shrink-0 text-text-quaternary">
              <Icon name={iconName} size={17} />
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? <p className="mb-micro text-label text-action uppercase">{eyebrow}</p> : null}
            <h2 className="m-0 truncate text-ui font-semibold text-text-primary">{title}</h2>
            {subtitle ? <p className="mt-tag text-ui text-text-muted">{subtitle}</p> : null}
          </div>
        </div>
      ) : (
        children
      )}
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
  )
}

export function PanelBody({ children, className = '', id }) {
  const inspectorId = useInspectorId('PanelBody', id)

  return <CardContent id={inspectorId} className={cn('px-card py-card', className)}>{children}</CardContent>
}
