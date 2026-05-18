import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'
import { getPageShellWidthClass } from './pageShellWidth'

export function PageShell({ children, className, id, width = 'full', ...props }) {
  const inspectorId = useInspectorId('PageShell', id)

  return (
    <div
      id={inspectorId}
      className={cn('flex w-full flex-col gap-card', getPageShellWidthClass(width), className)}
      {...props}
    >
      {children}
    </div>
  )
}
