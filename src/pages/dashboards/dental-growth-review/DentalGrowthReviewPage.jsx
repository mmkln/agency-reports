import { useGrowthReviewReadModel } from '../../../features/growth-review-data'
import { PageShell } from '@/shared/ui'
import {
  DentalGrowthReviewDashboard,
  DentalGrowthReviewSkeleton,
} from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ routeParams = {}, runtime }) {
  const growthReview = useGrowthReviewReadModel({
    routeParams,
    runtime,
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
      <DentalGrowthReviewDashboard onRetry={growthReview.reload} page={page} />
    </PageShell>
  )
}
