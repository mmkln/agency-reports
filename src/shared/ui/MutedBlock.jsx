import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function MutedBlock({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('MutedBlock', id)

  return (
    <div
      id={inspectorId}
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
