import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'
import { ProgressBar } from './ProgressBar'

export function GoalCard({ barColor, color, icon, id, label, progress, suffix, value }) {
  const inspectorId = useInspectorId('GoalCard', id)
  const tone = barColor?.includes('success') ? 'green'
    : barColor?.includes('warning') ? 'orange'
      : barColor?.includes('chart-4') ? 'purple'
        : 'blue'

  return (
    <Card as="article" id={inspectorId} size="sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Icon className={color} name={icon} size={20} />
          <span className="text-xs leading-5 text-text-secondary">{progress}% Complete</span>
        </div>
        <p className="mt-3 text-sm leading-5 text-text-secondary">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <strong className="text-2xl leading-8 text-text-primary">{value}</strong>
          <span className="text-sm font-semibold text-text-muted">{suffix}</span>
        </div>
        <ProgressBar label={`${label} progress`} showLabel={false} tone={tone} value={Math.min(progress, 100)} />
      </CardContent>
    </Card>
  )
}
