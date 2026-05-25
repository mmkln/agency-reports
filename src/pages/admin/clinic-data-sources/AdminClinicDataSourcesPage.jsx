import { AdminClinicDataSourcesWorkspace } from '../../../features/admin-clinic-data-sources'
import { useAdminRouteClient } from '../../../features/admin-client-workspace'

export function AdminClinicDataSourcesPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const clientResource = useAdminRouteClient({ clientId, runtime })

  return (
    <AdminClinicDataSourcesWorkspace
      clientId={clientId}
      clientResource={clientResource}
    />
  )
}
