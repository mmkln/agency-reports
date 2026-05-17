import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function DataTableSurface({ children, className = '', id }) {
  const inspectorId = useInspectorId('DataTableSurface', id)

  return (
    <section
      id={inspectorId}
      className={cn('min-w-0 overflow-hidden rounded-block bg-block text-ui text-text-primary shadow-none', className)}
    >
      {children}
    </section>
  )
}
