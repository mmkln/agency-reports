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

const explanationKeyByWidgetKey = {
  [growthReviewDashboardWidgetKeys.acceptedTreatmentValueBreakdown]: 'chart.accepted_treatment_value',
  [growthReviewDashboardWidgetKeys.bookedAppointmentsByReplyChannel]: 'chart.reply_channel_breakdown',
  [growthReviewDashboardWidgetKeys.bookingsByTrack]: 'chart.bookings_by_track',
  [growthReviewDashboardWidgetKeys.reactivationActivity]: 'chart.reactivation_activity',
  [growthReviewDashboardWidgetKeys.reactivationLifecycle]: 'chart.reactivation_lifecycle',
  [growthReviewDashboardWidgetKeys.weeklyTrackActivity]: 'chart.weekly_track_activity',
}

function getWidgetExplanation(context, widgetKey) {
  return context.dashboardExplanations?.[explanationKeyByWidgetKey[widgetKey]]
}

export function renderGrowthReviewDashboardWidget(widgetKey, context) {
  if (widgetKey === growthReviewDashboardWidgetKeys.acceptedTreatmentValueBreakdown) {
    return (
      <AcceptedTreatmentValueBreakdown
        chart={context.acceptedTreatmentValueBreakdown}
        explanation={getWidgetExplanation(context, widgetKey)}
        explanationEditor={context.dashboardExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationActivity) {
    return (
      <ReactivationActivityChart
        chart={context.reactivationActivity}
        explanation={getWidgetExplanation(context, widgetKey)}
        explanationEditor={context.dashboardExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookedAppointmentsByReplyChannel) {
    return (
      <BookedAppointmentsByReplyChannel
        chart={context.bookedAppointmentsByReplyChannel}
        explanation={getWidgetExplanation(context, widgetKey)}
        explanationEditor={context.dashboardExplanationEditor}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.weeklyTrackActivity) {
    return (
      <WeeklyTrackActivityHeatmap
        explanation={getWidgetExplanation(context, widgetKey)}
        explanationEditor={context.dashboardExplanationEditor}
        section={context.weeklyActivity}
      />
    )
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.bookingsByTrack) {
    return context.trackPerformance
      ? (
          <BookingsByTrackComparisonPanel
            explanation={getWidgetExplanation(context, widgetKey)}
            explanationEditor={context.dashboardExplanationEditor}
            funnelChart={context.funnelChart}
          />
        )
      : null
  }

  if (widgetKey === growthReviewDashboardWidgetKeys.reactivationLifecycle) {
    return (
      <FunnelView
        emptyAction={context.lifecycleEmptyAction}
        explanation={getWidgetExplanation(context, widgetKey)}
        explanationEditor={context.dashboardExplanationEditor}
        funnel={context.funnelStages}
        funnelChart={context.funnelChart}
      />
    )
  }

  return null
}
