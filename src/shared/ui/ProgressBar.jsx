import { Progress } from '@/components/ui/progress'

export function ProgressBar({ label, showLabel = true, value, tone = 'blue' }) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const toneClass = {
    blue: '[&_[data-slot=progress-indicator]]:bg-action',
    green: '[&_[data-slot=progress-indicator]]:bg-success',
    orange: '[&_[data-slot=progress-indicator]]:bg-warning',
    purple: '[&_[data-slot=progress-indicator]]:bg-chart-4',
    rose: '[&_[data-slot=progress-indicator]]:bg-rose-600',
  }[tone]

  return (
    <div className="grid gap-2" aria-label={label}>
      {showLabel ? (
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-text-secondary">
          <span>{label}</span>
          <strong className="font-semibold text-text-primary">{normalizedValue}%</strong>
        </div>
      ) : null}
      <Progress className={toneClass} value={normalizedValue} />
    </div>
  )
}
