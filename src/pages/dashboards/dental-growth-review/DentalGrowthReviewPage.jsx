import { useGrowthReviewReadModel } from '../../../features/growth-review-data'
import { Skeleton } from '@/shared/ui'
import { DentalGrowthReviewDashboard } from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ routeParams = {}, runtime }) {
  const growthReview = useGrowthReviewReadModel({
    routeParams,
    runtime,
  })
  const page = growthReview.page

  if (growthReview.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  return <DentalGrowthReviewDashboard page={page} />
}
