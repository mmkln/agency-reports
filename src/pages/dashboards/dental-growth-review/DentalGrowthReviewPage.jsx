import { useGrowthReviewReadModel } from '../../../features/growth-review-data'
import { PageShell, Skeleton } from '@/shared/ui'
import { DentalGrowthReviewDashboard } from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ routeParams = {}, runtime }) {
  const growthReview = useGrowthReviewReadModel({
    routeParams,
    runtime,
  })
  const page = growthReview.page

  if (growthReview.status === 'loading' || !page) {
    return (
      <PageShell className="py-section" width="wide">
        <Skeleton className="h-[420px] w-full" />
      </PageShell>
    )
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <DentalGrowthReviewDashboard page={page} />
    </PageShell>
  )
}
