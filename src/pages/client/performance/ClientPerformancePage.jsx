import { Navigate } from 'react-router-dom'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import { USER_ROLES } from '../../../entities/profile'
import { AccessDeniedState } from '../../../widgets/client-overview'
import { ClientPerformanceDashboard } from '../../../widgets/client-performance'
import { EmptyState } from '@/shared/ui'

export function ClientPerformancePage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const periodId = routeParams.performancePeriodId ?? routeParams.periodId
  const mode = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client'
  const page = getClientPerformanceDashboardPage({
    clientId,
    mode,
    periodId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  if (page.redirectTo) {
    return <Navigate replace to={page.redirectTo} />
  }

  if (!page.performanceDashboard) {
    return (
      <EmptyState
        description="The agency is preparing the performance dashboard for this client. Published analytics will appear here once reviewed."
        iconName="layoutDashboard"
        title="Performance dashboard is being prepared"
      />
    )
  }

  return <ClientPerformanceDashboard mode={mode} page={page} />
}
