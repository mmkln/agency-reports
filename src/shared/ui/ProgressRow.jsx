export function ProgressRow({
  color = 'bg-action',
  count,
  label,
  progress,
  rightLabel,
  value,
}) {
  return (
    <div className="flex flex-col border-b border-separator py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-2 flex items-end justify-between">
        <span className="block text-sm font-medium text-text-secondary">{label}</span>
        <div className="text-right">
          {count ? <span className="block text-sm text-text-secondary">{count}</span> : null}
          {rightLabel ? <span className="block text-sm font-semibold text-success-foreground">{rightLabel}</span> : null}
        </div>
      </div>
      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-control">
        <div className={`h-2.5 rounded-full transition-all duration-motion-medium ease-motion-standard ${color}`} style={{ width: `${progress}%` }} />
      </div>
      {value ? <span className="text-sm text-text-secondary">{value}</span> : null}
    </div>
  )
}
