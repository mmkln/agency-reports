import {
  AdminClientWorkspaceHeader,
  useAdminRouteClient,
} from '../../../features/admin-client-workspace'
import { PageHeader } from '@/shared/ui'

export function AdminDashboardLinksPageHeader({ routeParams = {}, runtime }) {
  const clientResource = useAdminRouteClient({
    clientId: routeParams.clientId,
    runtime,
  })
  const client = clientResource.data
  const createHref = client
    ? `/admin/dashboard-links?clientId=${client.id}&newDashboard=true`
    : '/admin/dashboard-links?newDashboard=true'

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="reports-dashboards"
        eyebrow="Account dashboards"
        primaryAction={{ children: 'New Dashboard', to: createHref }}
      />
    )
  }

  return (
    <PageHeader
      primaryAction={{ children: 'New Dashboard', to: createHref }}
      title="Dashboard Links"
    />
  )
}
