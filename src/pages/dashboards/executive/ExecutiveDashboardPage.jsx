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
    </PageShell>
  )
}
