import { cn } from '@/lib/utils'

export function ReadOnlyField({
  className,
  emptyValue = '-',
  label,
  value,
  ...props
}) {
  return (
    <div
      className={cn('grid grid-cols-[92px_minmax(0,1fr)] gap-item', className)}
      {...props}
    >
      <span className="text-label text-text-muted">{label}</span>
      <span className="truncate text-ui text-text-primary">{value || emptyValue}</span>
    </div>
  )
}
