import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

export function StickyDashboardToolbar({
  children,
  className = '',
  controls,
  id,
  nav,
  summary,
}) {
  const inspectorId = useInspectorId('StickyDashboardToolbar', id)

  return (
    <div
      className={cn(
        'sticky top-0 z-20 -mx-app-gutter mb-card border-b border-separator bg-material-chrome px-app-gutter py-control backdrop-blur',
        className,
      )}
      id={inspectorId}
    >
      <div className="grid gap-control">
        <div className="flex min-w-0 flex-col gap-control lg:flex-row lg:items-center lg:justify-between">
          {summary ? <div className="min-w-0">{summary}</div> : null}
          {controls ? <div className="flex shrink-0 flex-wrap items-center gap-control">{controls}</div> : null}
        </div>
        {nav ? <div className="min-w-0">{nav}</div> : null}
        {children}
      </div>
    </div>
  )
}
