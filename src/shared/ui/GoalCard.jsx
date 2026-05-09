import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../icons'
import { ProgressBar } from './ProgressBar'

export function GoalCard({ barColor, color, icon, label, progress, suffix, value }) {
  const tone = barColor?.includes('green') ? 'green'
    : barColor?.includes('orange') ? 'orange'
      : barColor?.includes('purple') ? 'purple'
        : 'blue'

  return (
    <Card as="article" size="sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Icon className={color} name={icon} size={20} />
          <span className="text-xs leading-5 text-slate-700">{progress}% Complete</span>
        </div>
        <p className="mt-3 text-sm leading-5 text-slate-600">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <strong className="text-2xl leading-8 text-slate-900">{value}</strong>
          <span className="text-sm font-semibold text-slate-500">{suffix}</span>
        </div>
        <ProgressBar label={`${label} progress`} showLabel={false} tone={tone} value={Math.min(progress, 100)} />
      </CardContent>
    </Card>
  )
}
