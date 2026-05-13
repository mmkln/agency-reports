import { cn } from '@/lib/utils'

export function NativeSelect({ className, ...props }) {
  return (
    <select
      className={cn(
        'h-target rounded-control border border-control-border bg-control px-component text-ui text-text-primary hover:bg-control-hover focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted',
        className,
      )}
      {...props}
    />
  )
}
