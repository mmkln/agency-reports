import { listAdminClients } from '../../../domain/services/adminClientService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { PageHeader } from '@/shared/ui'

function getRouteClient(clientId, runtime) {
  if (!clientId) {
    return null
  }

  return listAdminClients({
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }).find((client) => client.id === clientId) ?? null
}

export function AdminPerformanceDashboardsPageHeader({ routeParams = {}, runtime }) {
  const client = getRouteClient(routeParams.clientId, runtime)
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
