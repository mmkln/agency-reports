import {
  // BookingsByTrackPanel,
  DentalGrowthReviewState,
  FunnelView,
} from './DentalGrowthReviewBlocks'
import { Icon } from '@/shared/icons'
import { Button } from '@/shared/ui'
import { AcceptedTreatmentValueBreakdown } from './AcceptedTreatmentValueBreakdown'
import { BookedAppointmentsByReplyChannel } from './BookedAppointmentsByReplyChannel'
import { BookingsByTrackComparisonPanel } from './BookingsByTrackComparisonPanel'
import { ReactivationActivityChart } from './ReactivationActivityChart'
import { ReactivationCampaignSummary } from './ReactivationCampaignSummary'
import { WeeklyTrackActivityHeatmap } from './WeeklyTrackActivityHeatmap'
import { buildTrackPerformanceModel } from './reactivationTrackPerformanceModel'

function GrowthReviewUpdateAction({ refresh, secondaryAction }) {
  const isRefreshing = Boolean(refresh?.isRefreshing)
  const canRefresh = Boolean(refresh?.startRefresh)

  if (!canRefresh && !secondaryAction) {
    return null
  }

  function handleRefresh() {
    void refresh?.startRefresh?.()
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-control">
      {canRefresh ? (
        <Button
          disabled={isRefreshing}
          onClick={handleRefresh}
          size="sm"
          type="button"
        >
          <Icon name={isRefreshing ? 'clock' : 'refreshCw'} size={14} />
          {isRefreshing ? 'Updating' : 'Update Review'}
        </Button>
      ) : null}
      {secondaryAction}
    </div>
  )
}

export function DentalGrowthReviewDashboard({
  acceptedTreatmentDrilldown,
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
  const acceptedTreatmentValueBreakdown = page.charts?.acceptedTreatmentValueBreakdown ?? null
  const bookedAppointmentsByReplyChannel = page.charts?.bookedAppointmentsByReplyChannel ?? null
  const reactivationActivity = page.charts?.reactivationActivity ?? null
  const trackPerformance = buildTrackPerformanceModel(funnelChart)
  const weeklyActivity = page.weeklyReporting?.section1Activity ?? null
  const lifecycleEmptyAction = (
    <GrowthReviewUpdateAction
      refresh={refresh}
      secondaryAction={funnelEmptyAction}
    />
  )

  return (
    <>
      <ReactivationCampaignSummary
        campaign={page.campaign}
        chart={reactivationActivity}
        funnelChart={funnelChart}
        period={page.charts?.period ?? page.period}
        acceptedTreatmentDrilldown={acceptedTreatmentDrilldown}
        refresh={refresh}
        updatedAt={page.charts?.last_synced_at || page.charts?.calculated_at}
      />

      <div className="grid gap-4">
        <AcceptedTreatmentValueBreakdown chart={acceptedTreatmentValueBreakdown} />
        <ReactivationActivityChart chart={reactivationActivity} />
        <BookedAppointmentsByReplyChannel chart={bookedAppointmentsByReplyChannel} />
        <WeeklyTrackActivityHeatmap section={weeklyActivity} />
        {/* <BookingsByTrackPanel funnelChart={funnelChart} /> */}
      </div>
      {trackPerformance ? <BookingsByTrackComparisonPanel funnelChart={funnelChart} /> : null}

      <FunnelView
        emptyAction={lifecycleEmptyAction}
        funnel={funnelStages}
        funnelChart={funnelChart}
      />
    </>
  )
}
