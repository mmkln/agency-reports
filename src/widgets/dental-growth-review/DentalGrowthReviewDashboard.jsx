import {
  DentalGrowthReviewState,
  FunnelView,
  HeroMetrics,
} from './DentalGrowthReviewBlocks'

export function DentalGrowthReviewDashboard({ onRetry, page }) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState onRetry={onRetry} page={page} />
  }

  const content = page.period.content
  const heroMetricSeries = page.charts?.hero_metric_series ?? {}
  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages?.length
    ? page.charts.funnel.stages
    : content.funnel

  return (
    <>
      <HeroMetrics heroMetricSeries={heroMetricSeries} metrics={content.hero_metrics} />

      <FunnelView funnel={funnelStages} funnelChart={funnelChart} highlights={content.funnel_highlights} />
    </>
  )
}
