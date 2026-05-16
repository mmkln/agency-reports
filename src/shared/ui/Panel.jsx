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

export function PanelHeader({ action, children, eyebrow, id, subtitle, title }) {
  const inspectorId = useInspectorId('PanelHeader', id)

  return (
    <CardHeader id={inspectorId} className="flex-row items-start justify-between gap-component border-b border-separator bg-surface-subtle px-card py-component">
      {title ? (
        <div>
          {eyebrow ? <p className="mb-1 text-label text-action uppercase">{eyebrow}</p> : null}
          <h2 className="m-0 text-heading text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-1 text-body text-text-secondary">{subtitle}</p> : null}
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
