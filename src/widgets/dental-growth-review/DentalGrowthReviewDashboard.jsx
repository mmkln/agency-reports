import {
  DentalGrowthReviewState,
  FunnelView,
} from './DentalGrowthReviewBlocks'
import { ReactivationActivityChart } from './ReactivationActivityChart'

export function DentalGrowthReviewDashboard({ funnelEmptyAction, onRetry, page }) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState onRetry={onRetry} page={page} />
  }

  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages ?? []
  const reactivationActivity = page.charts?.reactivationActivity ?? null

  return (
    <>
      <ReactivationActivityChart chart={reactivationActivity} />

      <FunnelView
        emptyAction={funnelEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
