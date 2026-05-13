import { cn } from '@/lib/utils'

export function DetailRow({
  className,
  emptyValue = 'Not provided',
  label,
  value,
  ...props
}) {
  return (
    <div
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
