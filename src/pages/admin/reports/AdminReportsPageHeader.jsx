import {
  AdminClientWorkspaceHeader,
  useAdminRouteClient,
} from '../../../features/admin-client-workspace'
import { PageHeader } from '@/shared/ui'

export function AdminReportsPageHeader({ routeParams = {}, runtime }) {
  const clientResource = useAdminRouteClient({
    clientId: routeParams.clientId,
    runtime,
  })
  const client = clientResource.data
  const createHref = client
    ? `/admin/reports?clientId=${client.id}&newReport=true`
    : '/admin/reports?newReport=true'

  if (client) {
    return (
      <AdminClientWorkspaceHeader
        client={client}
        currentPage="reports-dashboards"
        eyebrow="Account reports"
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
