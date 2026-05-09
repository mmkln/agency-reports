import { Badge } from '@/components/ui/badge'

import { CLIENT_STATUS_META } from '../../../entities/client'

const toneClasses = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function ClientStatusBadge({ status }) {
  const meta = CLIENT_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }

  return (
    <Badge className={toneClasses[meta.tone]} variant="outline">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}
