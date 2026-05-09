import { Badge } from '@/components/ui/badge'

import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { PageHeader } from '../../../shared/layout/PageHeader'

function HeaderAction({ dashboard }) {
  if (!dashboard) {
    return null
  }

  return (
    <Badge
      className={dashboard.isAvailable
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'}
      variant="outline"
    >
      {dashboard.isAvailable ? 'Active dashboard' : 'Dashboard unavailable'}
    </Badge>
  )
}

export function ClientDashboardPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientDashboardPage({
    clientId,
    dashboardId: routeParams.dashboardId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (page.status === 'error') {
    return <PageHeader subtitle="Check the client link or contact your agency manager." title="Access denied" />
  }

  return (
    <PageHeader
      actions={<HeaderAction dashboard={page.dashboard} />}
      subtitle={`Marketing dashboard for ${page.client.name}`}
      title="Marketing Dashboard"
    />
  )
}
