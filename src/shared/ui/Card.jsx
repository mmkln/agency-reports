import { Card as ShadcnCard, CardHeader as ShadcnCardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function Card({ children, className = '', id, tone = 'default', ...props }) {
  const inspectorId = useInspectorId('Card', id)
  const toneClass = {
    default: '',
    blue: 'bg-action-muted text-action',
    green: 'bg-success-muted text-success-foreground',
  }[tone]

  return (
    <ShadcnCard as="section" id={inspectorId} className={cn('p-card', toneClass, className)} {...props}>
      {children}
    </ShadcnCard>
  )
}

export function CardHeader({ action, eyebrow, id, title }) {
  const inspectorId = useInspectorId('CardHeader', id)

  return (
    <ShadcnCardHeader id={inspectorId} className="mb-component flex-row items-center justify-between gap-component px-0 py-0 max-[520px]:flex-col max-[520px]:items-start">
      <div>
        {eyebrow ? <p className="mb-micro text-label text-action uppercase">{eyebrow}</p> : null}
        <h2 className="m-0 text-heading text-text-primary">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </ShadcnCardHeader>
  )
}
