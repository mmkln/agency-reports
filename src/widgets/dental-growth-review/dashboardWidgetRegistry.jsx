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
        explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.acceptedTreatmentValueBreakdown]}
        explanationEditor={context.chartExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationActivity) {
    return (
      <ReactivationActivityChart
        chart={context.reactivationActivity}
        explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.reactivationActivity]}
        explanationEditor={context.chartExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookedAppointmentsByReplyChannel) {
    return (
      <BookedAppointmentsByReplyChannel
        chart={context.bookedAppointmentsByReplyChannel}
        explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.bookedAppointmentsByReplyChannel]}
        explanationEditor={context.chartExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.weeklyTrackActivity) {
    return (
      <WeeklyTrackActivityHeatmap
        explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.weeklyTrackActivity]}
        explanationEditor={context.chartExplanationEditor}
        section={context.weeklyActivity}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookingsByTrack) {
    return context.trackPerformance
      ? (
          <BookingsByTrackComparisonPanel
            explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.bookingsByTrack]}
            explanationEditor={context.chartExplanationEditor}
            funnelChart={context.funnelChart}
          />
        )
      : null
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationLifecycle) {
    return (
      <FunnelView
        emptyAction={context.lifecycleEmptyAction}
        explanation={context.chartExplanations?.[growthReviewDashboardWidgetKeys.reactivationLifecycle]}
        explanationEditor={context.chartExplanationEditor}
        funnel={context.funnelStages}
        funnelChart={context.funnelChart}
      />
    )
  }

  return null
}
