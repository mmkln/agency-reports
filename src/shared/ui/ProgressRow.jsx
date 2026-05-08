export function ProgressRow({
  color = 'bg-indigo-600',
  count,
  label,
  progress,
  rightLabel,
  value,
}) {
  return (
    <div className="flex flex-col border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-2 flex items-end justify-between">
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        <div className="text-right">
          {count ? <span className="block text-sm text-slate-500">{count}</span> : null}
          {rightLabel ? <span className="block text-sm font-semibold text-emerald-600">{rightLabel}</span> : null}
        </div>
      </div>
      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${color}`} style={{ width: `${progress}%` }} />
      </div>
      {value ? <span className="text-sm text-slate-500">{value}</span> : null}
    </div>
  )
}
