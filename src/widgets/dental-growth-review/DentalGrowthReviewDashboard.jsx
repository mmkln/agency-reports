import {
  DentalGrowthReviewState,
  FunnelView,
  HeroMetrics,
} from './DentalGrowthReviewBlocks'

function getDashboardMetrics(metrics = {}) {
  return Object.values(metrics).slice(0, 6)
}

export function DentalGrowthReviewDashboard({ funnelEmptyAction, onRetry, page }) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState onRetry={onRetry} page={page} />
  }

  const metrics = getDashboardMetrics(page.charts?.metrics)
  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages ?? []

  return (
    <>
      <HeroMetrics metrics={metrics} />

      <FunnelView
        emptyAction={funnelEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
