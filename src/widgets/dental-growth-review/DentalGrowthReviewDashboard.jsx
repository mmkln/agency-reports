import {
  DentalGrowthReviewState,
  FunnelView,
} from './DentalGrowthReviewBlocks'
import { ReactivationActivityChart } from './ReactivationActivityChart'
import { ReactivationCampaignSummary } from './ReactivationCampaignSummary'
import { ReactivationTrackPerformanceCard } from './ReactivationTrackPerformanceCard'
import { buildTrackPerformanceModel } from './reactivationTrackPerformanceModel'

export function DentalGrowthReviewDashboard({
  funnelEmptyAction,
  onRetry,
  page,
  refresh,
}) {
  if (page.status === 'error' || !page.period) {
    return <DentalGrowthReviewState onRetry={onRetry} page={page} />
  }

  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages ?? []
  const reactivationActivity = page.charts?.reactivationActivity ?? null
  const trackPerformance = buildTrackPerformanceModel(funnelChart)

  return (
    <>
      <ReactivationCampaignSummary
        campaign={page.campaign}
        chart={reactivationActivity}
        funnelChart={funnelChart}
        period={page.charts?.period ?? page.period}
        refresh={refresh}
        updatedAt={page.charts?.last_synced_at || page.charts?.calculated_at}
      />

      {trackPerformance ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <ReactivationActivityChart chart={reactivationActivity} />
          <ReactivationTrackPerformanceCard model={trackPerformance} />
        </div>
      ) : (
        <ReactivationActivityChart chart={reactivationActivity} />
      )}

      <FunnelView
        emptyAction={funnelEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
