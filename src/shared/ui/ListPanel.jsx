import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function ListPanel({
  children,
  className,
  id,
  ...props
}) {
  const inspectorId = useInspectorId('ListPanel', id)

  return (
    <div id={inspectorId} className={cn('divide-y divide-separator', className)} {...props}>
      {children}
    </div>
  )
}
