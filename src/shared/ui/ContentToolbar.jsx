import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function ContentToolbar({ children, className, id, ...props }) {
  const inspectorId = useInspectorId('ContentToolbar', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'flex flex-col gap-component rounded-block bg-block-subtle p-component',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
