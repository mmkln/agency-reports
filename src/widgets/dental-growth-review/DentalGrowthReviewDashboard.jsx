import {
  DentalGrowthReviewState,
  FunnelView,
  HeroMetrics,
} from './DentalGrowthReviewBlocks'

export function DentalGrowthReviewDashboard({ page }) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState page={page} />
  }

  const content = page.period.content
  const heroMetricSeries = page.charts?.hero_metric_series ?? {}
  const funnelStages = page.charts?.funnel?.stages?.length
    ? page.charts.funnel.stages
    : content.funnel

  return (
    <>
      <HeroMetrics heroMetricSeries={heroMetricSeries} metrics={content.hero_metrics} />

      <FunnelView funnel={funnelStages} highlights={content.funnel_highlights} />
    </>
  )
}
