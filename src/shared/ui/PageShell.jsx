import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function PageShell({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('PageShell', id)

  return (
    <div
      id={inspectorId}
      className={cn('mx-auto flex w-full max-w-content flex-col gap-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}
