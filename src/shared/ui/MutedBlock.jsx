import { cn } from '@/lib/utils'

export function MutedBlock({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-control bg-block-subtle px-control py-item text-body text-text-muted',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
