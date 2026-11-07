import { AdminClientWorkspaceFrame, resolveRouteWorkspaceId } from '@/features/admin-client-workspace'
import { WeeklyLeadReportPage } from '../../dashboards/weekly-lead-report'

export function AgencyWorkspaceLeadReportPage({ routeParams = {}, runtime }) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })

  return (
    <AdminClientWorkspaceFrame currentPage="lead-report" routeParams={routeParams} runtime={runtime} width="full">
      <WeeklyLeadReportPage
        routeParams={{ ...routeParams, clientId: workspaceId, workspaceId }}
        runtime={runtime}
      />
    </AdminClientWorkspaceFrame>
  )
}
