import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function DetailRow({
  className,
  emptyValue = 'Not provided',
  id,
  label,
  value,
  ...props
}) {
  const inspectorId = useInspectorId('DetailRow', id)

  return (
    <div
      id={inspectorId}
      className={cn('flex items-start justify-between gap-control py-item', className)}
      {...props}
    >
      <p className="text-label text-text-muted">{label}</p>
      <div className="max-w-detail-value text-right text-ui text-text-primary">
        {value || <span className="text-ui text-text-muted">{emptyValue}</span>}
      </div>
    </div>
  )
}
