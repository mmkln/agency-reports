import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function DashboardToolbarActions({
  className,
  id,
  refreshAction,
  settingsAction,
  updatedLabel,
}) {
  const inspectorId = useInspectorId('DashboardToolbarActions', id)

  return (
    <div
      className={cn('flex shrink-0 flex-wrap items-center gap-control', className)}
      id={inspectorId}
    >
      {updatedLabel ? (
        <p className="text-label font-medium text-text-muted">{updatedLabel}</p>
      ) : null}
      {settingsAction}
      {refreshAction}
    </div>
  )
}
