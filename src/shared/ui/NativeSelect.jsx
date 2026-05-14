import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function NativeSelect({ className, id, ...props }) {
  const inspectorId = useInspectorId('NativeSelect', id)

  return (
    <select
      id={inspectorId}
      className={cn(
        'h-target rounded-control border border-control-border bg-control px-component text-ui text-text-primary hover:bg-control-hover focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted',
        className,
      )}
      {...props}
    />
  )
}
