import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function CodeValue({
  children,
  className,
  emptyValue = '-',
  id,
  ...props
}) {
  const inspectorId = useInspectorId('CodeValue', id)
  const hasValue = children !== null && children !== undefined && children !== ''

  return (
    <code
      id={inspectorId}
      className={cn(
        'inline-flex min-h-control-mini max-w-full items-center rounded-control bg-control px-control py-0 font-mono text-label text-text-secondary',
        !hasValue && 'text-text-muted',
        className,
      )}
      {...props}
    >
      <span className="truncate">{hasValue ? children : emptyValue}</span>
    </code>
  )
}
