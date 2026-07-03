import {
  useAcceptedTreatmentDrilldown,
  useGrowthReviewReadModel,
  useGrowthReviewRefresh,
} from '../../../features/growth-review-data'
import { PageShell } from '@/shared/ui'
import {
  DentalGrowthReviewDashboard,
  DentalGrowthReviewSkeleton,
} from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ funnelEmptyAction, routeParams = {}, runtime }) {
  const growthReview = useGrowthReviewReadModel({
    routeParams,
    runtime,
  })
  const refresh = useGrowthReviewRefresh({
    apiClient: runtime.apiClient,
    onCompleted: growthReview.reload,
    workspaceId: growthReview.workspaceId,
  })
  const acceptedTreatmentDrilldown = useAcceptedTreatmentDrilldown({
    apiClient: runtime.apiClient,
    workspaceId: growthReview.workspaceId,
  })
  const page = growthReview.page

  if (growthReview.status === 'loading' || !page) {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <DentalGrowthReviewSkeleton />
      </PageShell>
    )
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <DentalGrowthReviewDashboard
        acceptedTreatmentDrilldown={acceptedTreatmentDrilldown}
        apiClient={runtime.apiClient}
        funnelEmptyAction={funnelEmptyAction}
        onLayoutSaved={growthReview.reload}
        onRetry={growthReview.reload}
        page={page}
        refresh={refresh}
        viewer={runtime.viewer}
        workspaceId={growthReview.workspaceId}
      />
    </PageShell>
  )
}
