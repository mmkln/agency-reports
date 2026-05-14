import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function PageShell({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('PageShell', id)

  return (
    <div
      id={inspectorId}
      className={cn('flex w-full flex-col gap-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}
