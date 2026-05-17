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

export function AdminReportsPageHeader({ routeParams = {}, runtime }) {
  const client = getRouteClient(routeParams.clientId, runtime)
  const createHref = client
    ? `/admin/reports?clientId=${client.id}&newReport=true`
    : '/admin/reports?newReport=true'

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="reports-dashboards"
        eyebrow="Client reports"
        primaryAction={{ children: 'New Report', to: createHref }}
      />
    )
  }

  return (
    <PageHeader
      primaryAction={{ children: 'New Report', to: createHref }}
      title="Reports"
    />
  )
}
