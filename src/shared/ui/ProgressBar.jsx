export function ProgressBar({ label, showLabel = true, value, tone = 'blue' }) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const toneClass = {
    blue: 'bg-indigo-600',
    green: 'bg-emerald-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    rose: 'bg-rose-600',
  }[tone]

  return (
    <div className="grid gap-2" aria-label={label}>
      {showLabel ? (
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-500">
          <span>{label}</span>
          <strong className="font-semibold text-slate-900">{normalizedValue}%</strong>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <span
          className={`block h-2.5 rounded-full transition-all duration-500 ease-in-out ${toneClass}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  )
}
