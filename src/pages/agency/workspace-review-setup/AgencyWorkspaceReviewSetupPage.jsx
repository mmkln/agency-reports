import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'
import { GrowthReviewReviewManagement } from '@/features/growth-review-review-management'

export function AgencyWorkspaceReviewSetupPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="review-setup"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      {({ workspaceId }) => (
        <GrowthReviewReviewManagement
          apiClient={runtime.apiClient}
          workspaceId={workspaceId}
        />
      )}
    </AdminClientWorkspaceFrame>
  )
}
