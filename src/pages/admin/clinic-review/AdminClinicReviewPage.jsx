import { AdminClientWorkspaceFrame, resolveRouteWorkspaceId } from '@/features/admin-client-workspace'
import { DentalGrowthReviewPage } from '../../dashboards/dental-growth-review'

export function AdminClinicReviewPage({ routeParams = {}, runtime }) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })

  return (
    <AdminClientWorkspaceFrame
      currentPage="clinic-review"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      <DentalGrowthReviewPage
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
