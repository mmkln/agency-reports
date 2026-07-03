import { FunnelView } from './DentalGrowthReviewBlocks'
import { AcceptedTreatmentValueBreakdown } from './AcceptedTreatmentValueBreakdown'
import { BookedAppointmentsByReplyChannel } from './BookedAppointmentsByReplyChannel'
import { BookingsByTrackComparisonPanel } from './BookingsByTrackComparisonPanel'
import { ReactivationActivityChart } from './ReactivationActivityChart'
import { WeeklyTrackActivityHeatmap } from './WeeklyTrackActivityHeatmap'

export const growthReviewDashboardWidgetKeys = {
  acceptedTreatmentValueBreakdown: 'accepted_treatment_value_breakdown',
  bookedAppointmentsByReplyChannel: 'booked_appointments_by_reply_channel',
  bookingsByTrack: 'bookings_by_track',
  reactivationActivity: 'reactivation_activity',
  reactivationLifecycle: 'reactivation_lifecycle',
  weeklyTrackActivity: 'weekly_track_activity',
}

export function renderGrowthReviewDashboardWidget(widgetKey, context) {
  if (widgetKey === growthReviewDashboardWidgetKeys.acceptedTreatmentValueBreakdown) {
    return (
      <AcceptedTreatmentValueBreakdown
        chart={context.acceptedTreatmentValueBreakdown}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationActivity) {
    return <ReactivationActivityChart chart={context.reactivationActivity} />
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookedAppointmentsByReplyChannel) {
    return <BookedAppointmentsByReplyChannel chart={context.bookedAppointmentsByReplyChannel} />
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.weeklyTrackActivity) {
    return <WeeklyTrackActivityHeatmap section={context.weeklyActivity} />
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookingsByTrack) {
    return context.trackPerformance
      ? <BookingsByTrackComparisonPanel funnelChart={context.funnelChart} />
      : null
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationLifecycle) {
    return (
      <FunnelView
        emptyAction={context.lifecycleEmptyAction}
        funnel={context.funnelStages}
        funnelChart={context.funnelChart}
      />
    )
  }

  return null
}
