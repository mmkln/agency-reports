import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function Panel({ children, className = '', id }) {
  const inspectorId = useInspectorId('Panel', id)

  return (
    <Card as="section" id={inspectorId} className={cn('flex flex-col gap-0 py-0', className)}>
      {children}
    </Card>
  )
}

export function PanelHeader({ action, children, divided = false, eyebrow, id, subtitle, title }) {
  const inspectorId = useInspectorId('PanelHeader', id)

  return (
    <CardHeader
      id={inspectorId}
      className={cn(
        'flex-row items-start justify-between gap-component px-card pb-item pt-component',
        divided && 'border-b border-separator',
      )}
    >
      {title ? (
        <div>
          {eyebrow ? <p className="mb-micro text-label text-action uppercase">{eyebrow}</p> : null}
          <h2 className="m-0 text-ui font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-tag text-ui text-text-muted">{subtitle}</p> : null}
        </div>
      ) : (
        children
      )}
      {action ? <div className="shrink-0">{action}</div> : null}
    </CardHeader>
  )
}

export function PanelBody({ children, className = '', id }) {
  const inspectorId = useInspectorId('PanelBody', id)

  return <CardContent id={inspectorId} className={cn('p-card', className)}>{children}</CardContent>
}
