import { Card as ShadcnCard, CardHeader as ShadcnCardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = {
    default: '',
    blue: 'border-l-4 border-l-indigo-600 bg-indigo-50',
    green: 'border-l-4 border-l-emerald-600 bg-emerald-50',
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
        {eyebrow ? <p className="mb-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">{eyebrow}</p> : null}
        <h2 className="m-0 text-lg font-semibold leading-7 text-slate-800">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </ShadcnCardHeader>
  )
}
