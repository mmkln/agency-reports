import { PageHeader, StatusBadge } from '@/shared/ui'

import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { USER_ROLES } from '../../../entities/profile'

function HeaderAction({ dashboard }) {
  if (!dashboard) {
    return null
  }

  return <StatusBadge meta={dashboard.statusMeta} />
}

export function ClientDashboardPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientDashboardPage({
    clientId,
    dashboardId: routeParams.dashboardId,
    mode: runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client',
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  if (page.redirectTo) {
    return <PageHeader title="Clinic Results" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<HeaderAction dashboard={page.dashboard} />}
      title="Marketing Dashboard"
      width={activeRoute?.contentWidth}
    />
  )
}
