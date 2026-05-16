import { useInspectorId } from './inspectorId'

export function ProgressRow({
  color = 'bg-action',
  count,
  id,
  label,
  progress,
  rightLabel,
  value,
}) {
  const inspectorId = useInspectorId('ProgressRow', id)

  return (
    <div id={inspectorId} className="flex flex-col border-b border-separator py-component first:pt-0 last:border-0 last:pb-0">
      <div className="mb-item flex items-end justify-between">
        <span className="block text-ui text-text-secondary">{label}</span>
        <div className="text-right">
          {count ? <span className="block text-ui text-text-secondary">{count}</span> : null}
          {rightLabel ? <span className="block text-label text-success-foreground">{rightLabel}</span> : null}
        </div>
      </div>
      <div className="mb-micro h-2.5 w-full overflow-hidden rounded-full bg-control">
        <div className={`h-2.5 rounded-full transition-[width] duration-motion-medium ease-motion-standard ${color}`} style={{ width: `${progress}%` }} />
      </div>
      {value ? <span className="text-ui text-text-secondary">{value}</span> : null}
    </div>
  )
}
