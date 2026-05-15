import { listAdminClients } from '../../../domain/services/adminClientService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { Button, PageHeader } from '@/shared/ui'
import { Icon } from '../../../shared/icons'
import { Link } from 'react-router-dom'

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
    ? `/admin/performance-dashboards?clientId=${client.id}&newPerformanceDashboard=true`
    : '/admin/performance-dashboards?newPerformanceDashboard=true'
  const importHref = client
    ? `/admin/performance-dashboards?clientId=${client.id}&importPerformanceDashboard=true`
    : '/admin/performance-dashboards?importPerformanceDashboard=true'
  const importAction = (
    <Button asChild variant="outline">
      <Link to={importHref}>
        <Icon name="fileJson" size={15} />
        Import JSON
      </Link>
    </Button>
  )

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="performance"
        eyebrow="Client analytics"
        actions={importAction}
        primaryAction={{ children: 'New Dashboard', to: createHref }}
      />
    )
  }

  return (
    <PageHeader
      actions={importAction}
      primaryAction={{ children: 'New Dashboard', to: createHref }}
      title="Performance Dashboards"
    />
  )
}
