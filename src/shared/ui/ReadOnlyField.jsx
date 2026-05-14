import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function ReadOnlyField({
  className,
  emptyValue = '-',
  id,
  label,
  value,
  ...props
}) {
  const inspectorId = useInspectorId('ReadOnlyField', id)

  return (
    <div
      id={inspectorId}
      className={cn('grid grid-cols-[92px_minmax(0,1fr)] gap-item', className)}
      {...props}
    >
      <span className="text-label text-text-muted">{label}</span>
      <span className="truncate text-ui text-text-primary">{value || emptyValue}</span>
    </div>
  )
}
