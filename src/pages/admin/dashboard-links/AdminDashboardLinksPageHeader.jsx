import { listAdminClients } from '../../../domain/services/adminClientService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { PageHeader } from '../../../shared/layout/PageHeader'

function getRouteClient(clientId, runtime) {
  if (!clientId) {
    return null
  }

  return listAdminClients({
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }).find((client) => client.id === clientId) ?? null
}

export function AdminDashboardLinksPageHeader({ routeParams = {}, runtime }) {
  const client = getRouteClient(routeParams.clientId, runtime)
  const createHref = client
    ? `/admin/dashboard-links?clientId=${client.id}&newDashboard=true`
    : '/admin/dashboard-links?newDashboard=true'

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="dashboards"
        eyebrow="Client dashboards"
        primaryAction={{ children: 'New Dashboard', to: createHref }}
      />
    )
  }

  return (
    <PageHeader
      primaryAction={{ children: 'New Dashboard', to: createHref }}
      subtitle="Manage external dashboard embeds and links across client portal workspaces."
      title="Dashboard Links"
    />
  )
}
