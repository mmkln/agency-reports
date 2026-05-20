import {
  AdminClientWorkspaceHeader,
  useAdminRouteClient,
} from '../../../features/admin-client-workspace'
import { PageHeader } from '@/shared/ui'

export function AdminPerformanceDashboardsPageHeader({ routeParams = {}, runtime }) {
  const clientResource = useAdminRouteClient({
    clientId: routeParams.clientId,
    runtime,
  })
  const client = clientResource.data
  const createHref = client
    ? `/admin/performance-dashboards?clientId=${client.id}&createPerformanceDashboard=true`
    : '/admin/performance-dashboards?createPerformanceDashboard=true'

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="reports-dashboards"
        eyebrow="Account analytics"
        primaryAction={{ children: 'New Dashboard', to: createHref }}
      />
    )
  }

  return (
    <PageHeader
      primaryAction={{ children: 'New Dashboard', to: createHref }}
      title="Performance Dashboards"
    />
  )
}
