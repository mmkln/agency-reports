import {
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
        funnelEmptyAction={funnelEmptyAction}
        onRetry={growthReview.reload}
        page={page}
        refresh={refresh}
      />
    </PageShell>
  )
}
