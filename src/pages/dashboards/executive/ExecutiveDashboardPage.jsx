import { useExecutiveDashboardReadModel } from '@/features/executive-dashboard-data'
import { PageShell, Skeleton } from '@/shared/ui'
import { ExecutiveDashboard } from '@/widgets/executive-dashboard'

export function ExecutiveDashboardPage({ routeParams = {}, runtime }) {
  const executiveDashboard = useExecutiveDashboardReadModel({
    routeParams,
    runtime,
  })

  if (executiveDashboard.status === 'error') {
    throw new Error(executiveDashboard.error || 'Executive Dashboard could not be loaded.')
  }

  if (executiveDashboard.status === 'loading' || !executiveDashboard.page) {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <Skeleton className="min-h-screen w-full" />
      </PageShell>
    )
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <ExecutiveDashboard page={executiveDashboard.page} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 grid place-items-center"
      >
        <svg
          className="absolute inset-0 size-full text-destructive opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <line
            stroke="currentColor"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            x1="5"
            x2="95"
            y1="10"
            y2="95"
          />
          <line
            stroke="currentColor"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            x1="95"
            x2="5"
            y1="10"
            y2="95"
          />
        </svg>

        <div className="select-none scale-125 text-center text-display uppercase text-text-primary opacity-10 sm:scale-150">
          <div>In Development</div>
          <div>Sample Data</div>
        </div>
      </div>
    </PageShell>
  )
}
