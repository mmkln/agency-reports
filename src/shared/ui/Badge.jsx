import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Badge({ children, className = '', icon, tone = 'neutral' }) {
  const toneClass = {
    blue: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    neutral: 'border-slate-200 bg-slate-100 text-slate-600',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  }[tone]

  return (
    <ShadcnBadge className={cn('min-h-6 gap-1.5 px-2.5 font-bold', toneClass, className)} variant="outline">
      {icon ? <span className="inline-flex" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </ShadcnBadge>
  )
}
