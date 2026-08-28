import {
  DentalGrowthReviewState,
} from './DentalGrowthReviewBlocks'
import {
  GrowthReviewLayoutModal,
  useGrowthReviewLayoutEditor,
} from '@/features/growth-review-layout'
import { Icon } from '@/shared/icons'
import { Button, SectionRailNav } from '@/shared/ui'
import { GrowthReviewCampaignContextToolbar } from './GrowthReviewCampaignContextToolbar'
import { ReactivationCampaignSummary } from './ReactivationCampaignSummary'
import { renderGrowthReviewDashboardWidget } from './dashboardWidgetRegistry'
import { buildTrackPerformanceModel } from './reactivationTrackPerformanceModel'

const SUMMARY_SECTION_ID = 'growth-review-summary'
const sectionRailLabelByWidgetKey = {
  accepted_treatment_value_breakdown: 'Treatment Value',
  booked_appointments_by_reply_channel: 'Booked by Channel',
  bookings_by_track: 'Bookings by Track',
  reactivation_activity: 'Activity',
  reactivation_lifecycle: 'Lifecycle',
  weekly_track_activity: 'Weekly Activity',
}

function getWidgetSectionId(widgetKey) {
  return `growth-review-${widgetKey}`
}

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
  apiClient,
  campaignId,
  campaignSelector,
  funnelEmptyAction,
  onLayoutSaved,
  onRetry,
  page,
  refresh,
  workspaceId,
}) {
  const layoutEditor = useGrowthReviewLayoutEditor({
    apiClient,
    campaignId,
    layout: page.layout,
    onSaved: onLayoutSaved,
    workspaceId,
  })
  const funnelChart = page.charts?.funnel ?? null
  const funnelStages = page.charts?.funnel?.stages ?? []
  const acceptedTreatmentValueBreakdown = page.charts?.acceptedTreatmentValueBreakdown ?? null
  const bookedAppointmentsByReplyChannel = page.charts?.bookedAppointmentsByReplyChannel ?? null
  const reactivationActivity = page.charts?.reactivationActivity ?? null
  const trackPerformance = buildTrackPerformanceModel(funnelChart)
  const weeklyActivity = page.weeklyReporting?.section1Activity ?? null
  const canCustomizeLayout = page.permissions?.canCustomizeLayout === true
  const lifecycleEmptyAction = (
    <GrowthReviewUpdateAction
      refresh={refresh}
      secondaryAction={funnelEmptyAction}
    />
  )
  const layoutAction = canCustomizeLayout ? (
    <Button
      onClick={layoutEditor.open}
      type="button"
      variant="secondary"
    >
      Customize
    </Button>
  ) : null
  const campaignContextToolbar = (
    <GrowthReviewCampaignContextToolbar
      campaign={page.campaign}
      campaignSelector={campaignSelector}
      funnelChart={funnelChart}
      period={page.charts?.period ?? page.period}
      refresh={refresh}
      secondaryAction={layoutAction}
      updatedAt={page.charts?.last_synced_at || page.charts?.calculated_at}
    />
  )

  if (page.status === 'error' || !page.period) {
    return (
      <div className="grid gap-component">
        {campaignContextToolbar}
        <DentalGrowthReviewState onRetry={onRetry} page={page} />
        <GrowthReviewLayoutModal editor={layoutEditor} />
      </div>
    )
  }

  const renderedWidgets = (page.layout?.items ?? [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({
      item,
      widget: renderGrowthReviewDashboardWidget(item.widgetKey, {
        acceptedTreatmentValueBreakdown,
        bookedAppointmentsByReplyChannel,
        funnelChart,
        funnelStages,
        lifecycleEmptyAction,
        reactivationActivity,
        trackPerformance,
        weeklyActivity,
      }),
    }))
    .filter(({ widget }) => widget)
  const sectionNavItems = [
    { id: SUMMARY_SECTION_ID, label: 'Summary' },
    ...renderedWidgets.map(({ item }) => ({
      id: getWidgetSectionId(item.widgetKey),
      label: sectionRailLabelByWidgetKey[item.widgetKey] ?? item.label,
    })),
  ]

  return (
    <>
      <SectionRailNav items={sectionNavItems} />

      <section className="grid scroll-mt-24 gap-component" id={SUMMARY_SECTION_ID}>
        {campaignContextToolbar}
        <ReactivationCampaignSummary
          acceptedTreatmentDrilldown={acceptedTreatmentDrilldown}
          chart={reactivationActivity}
          funnelChart={funnelChart}
        />
      </section>

      <div className="grid gap-4">
        {renderedWidgets.map(({ item, widget }) => (
          <section
            className="scroll-mt-24"
            id={getWidgetSectionId(item.widgetKey)}
            key={item.widgetKey}
          >
            {widget}
          </section>
        ))}
      </div>
      <GrowthReviewLayoutModal editor={layoutEditor} />
    </>
  )
}
