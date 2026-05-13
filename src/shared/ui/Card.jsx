import { Card as ShadcnCard, CardHeader as ShadcnCardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = {
    default: '',
    blue: 'bg-action-muted text-action',
    green: 'bg-success-muted text-success-foreground',
  }[tone]

  return (
    <ShadcnCard as="section" className={cn('p-6', toneClass, className)} {...props}>
      {children}
    </ShadcnCard>
  )
}

export function CardHeader({ action, eyebrow, title }) {
  return (
    <ShadcnCardHeader className="mb-[18px] flex-row items-center justify-between gap-4 px-0 py-0 max-[520px]:flex-col max-[520px]:items-start">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-semibold text-action uppercase">{eyebrow}</p> : null}
        <h2 className="m-0 text-lg font-semibold leading-7 text-text-primary">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </ShadcnCardHeader>
  )
}
