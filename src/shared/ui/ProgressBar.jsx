import { Progress } from '@/components/ui/progress'

import { useInspectorId } from './inspectorId'

export function ProgressBar({ id, label, showLabel = true, value, tone = 'blue' }) {
  const inspectorId = useInspectorId('ProgressBar', id)
  const normalizedValue = Math.max(0, Math.min(100, value))
  const toneClass = {
    blue: '[&_[data-slot=progress-indicator]]:bg-action',
    green: '[&_[data-slot=progress-indicator]]:bg-success',
    orange: '[&_[data-slot=progress-indicator]]:bg-warning',
    purple: '[&_[data-slot=progress-indicator]]:bg-chart-4',
    rose: '[&_[data-slot=progress-indicator]]:bg-destructive',
  }[tone]

  return (
    <div className="grid gap-item" aria-label={label} id={inspectorId}>
      {showLabel ? (
        <div className="flex items-center justify-between gap-control text-ui text-text-secondary">
          <span>{label}</span>
          <strong className="font-semibold text-text-primary">{normalizedValue}%</strong>
        </div>
      ) : null}
      <Progress className={toneClass} value={normalizedValue} />
    </div>
  )
}
