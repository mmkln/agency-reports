import { AdminClientWorkspaceFrame, resolveRouteWorkspaceId } from '@/features/admin-client-workspace'
import { NewLeadReportingPage } from '../../dashboards/new-lead-reporting'

export function AgencyWorkspaceNewLeadReportingPage({ routeParams = {}, runtime }) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })

  return (
    <AdminClientWorkspaceFrame currentPage="new-lead-reporting" routeParams={routeParams} runtime={runtime} width="full">
      <NewLeadReportingPage
        routeParams={{ ...routeParams, clientId: workspaceId, workspaceId }}
        runtime={runtime}
      />
    </AdminClientWorkspaceFrame>
  )
}
