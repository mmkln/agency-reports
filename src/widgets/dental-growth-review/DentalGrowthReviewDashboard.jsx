import {
  // BookingsByTrackPanel,
  DentalGrowthReviewState,
  FunnelView,
} from './DentalGrowthReviewBlocks'
import { BookingsByTrackComparisonPanel } from './BookingsByTrackComparisonPanel'
import { ReactivationActivityChart } from './ReactivationActivityChart'
import { ReactivationCampaignSummary } from './ReactivationCampaignSummary'
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
        <div className="grid gap-4">
          <ReactivationActivityChart chart={reactivationActivity} />
          {/* <BookingsByTrackPanel funnelChart={funnelChart} /> */}
        </div>
      ) : (
        <ReactivationActivityChart chart={reactivationActivity} />
      )}
      {trackPerformance ? <BookingsByTrackComparisonPanel funnelChart={funnelChart} /> : null}

      <FunnelView
        emptyAction={funnelEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
