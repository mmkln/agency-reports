import { Progress } from '@/components/ui/progress'

export function ProgressBar({ label, showLabel = true, value, tone = 'blue' }) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const toneClass = {
    blue: '[&_[data-slot=progress-indicator]]:bg-indigo-600',
    green: '[&_[data-slot=progress-indicator]]:bg-emerald-600',
    orange: '[&_[data-slot=progress-indicator]]:bg-orange-600',
    purple: '[&_[data-slot=progress-indicator]]:bg-purple-600',
    rose: '[&_[data-slot=progress-indicator]]:bg-rose-600',
  }[tone]

  return (
    <div className="grid gap-2" aria-label={label}>
      {showLabel ? (
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-500">
          <span>{label}</span>
          <strong className="font-semibold text-slate-900">{normalizedValue}%</strong>
        </div>
      ) : null}
      <Progress className={toneClass} value={normalizedValue} />
    </div>
  )
}
