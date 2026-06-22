import { AdminClientWorkspaceFrame } from '@/features/admin-client-workspace'
import { GrowthReviewSetupWorkspace } from '@/features/growth-review-setup'

export function AgencyWorkspaceReviewSetupPage({ routeParams = {}, runtime }) {
  return (
    <AdminClientWorkspaceFrame
      currentPage="review-setup"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      {({ workspaceId }) => (
        <GrowthReviewSetupWorkspace
          apiClient={runtime.apiClient}
          workspaceId={workspaceId}
        />
      )}
    </AdminClientWorkspaceFrame>
  )
}
