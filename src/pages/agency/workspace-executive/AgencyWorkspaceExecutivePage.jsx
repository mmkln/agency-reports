import {
  AdminClientWorkspaceFrame,
  resolveRouteWorkspaceId,
} from '@/features/admin-client-workspace'
import { ExecutiveDashboardPage } from '../../dashboards/executive'

export function AgencyWorkspaceExecutivePage({ routeParams = {}, runtime }) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })

  return (
    <AdminClientWorkspaceFrame
      currentPage="executive"
      routeParams={routeParams}
      runtime={runtime}
      width="full"
    >
      <ExecutiveDashboardPage
        routeParams={{
          ...routeParams,
          clientId: workspaceId,
          workspaceId,
        }}
        runtime={runtime}
      />
    </AdminClientWorkspaceFrame>
  )
}
