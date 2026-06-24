import { useExecutiveDashboardReadModel } from '@/features/executive-dashboard-data'
import { PageShell } from '@/shared/ui'
import { ExecutiveDashboard } from '@/widgets/executive-dashboard'

export function ExecutiveDashboardPage({ routeParams = {}, runtime }) {
  const executiveDashboard = useExecutiveDashboardReadModel({
    routeParams,
    runtime,
  })

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <ExecutiveDashboard page={executiveDashboard.page} />
    </PageShell>
  )
}
