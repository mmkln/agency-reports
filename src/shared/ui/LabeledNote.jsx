import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function LabeledNote({
  children,
  className,
  id,
  label,
  ...props
}) {
  const inspectorId = useInspectorId('LabeledNote', id)

  return (
    <div
      id={inspectorId}
      className={cn(
        'grid w-fit max-w-readable gap-tag border-l border-action py-micro pl-control text-ui',
        className,
      )}
      {...props}
    >
      {label ? (
        <p className="text-label font-semibold uppercase text-action">{label}</p>
      ) : null}
      <div className="font-normal text-text-secondary">
        {children}
      </div>
    </div>
  )
}
