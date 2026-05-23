import { Navigate } from 'react-router-dom'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { AccessDeniedState } from '../../../widgets/client-overview'
import { ClientPerformanceDashboard } from '../../../widgets/client-performance'
import { EmptyState, Skeleton } from '@/shared/ui'
import { getClientPageMode } from '../clientPageAccess'

export function ClientPerformancePage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const periodId = routeParams.performancePeriodId ?? routeParams.periodId
  const mode = getClientPageMode(runtime.viewer)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-performance:${clientId ?? ''}:${periodId ?? ''}:${mode}`,
    load: () => runtime.dataClient.read((repositories) => getClientPerformanceDashboardPage({
      clientId,
      mode,
      periodId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  if (page.redirectTo) {
    return <Navigate replace to={page.redirectTo} />
  }

  if (!page.performanceDashboard) {
    return (
      <EmptyState
        description="The team is preparing the performance dashboard for this account. Published analytics will appear here once reviewed."
        iconName="layoutDashboard"
        title="Performance dashboard is being prepared"
      />
    )
  }

  return <ClientPerformanceDashboard mode={mode} page={page} />
}
