import { PageShell } from '@/shared/ui'

import {
  ClinicReportingHeader,
  ClinicReportingState,
  CompactMetricGrid,
  QueuePanel,
  TrustStrip,
} from './ClinicReportingBlocks'
import {
  OperationalTriageStrip,
  QueueWorkloadPanel,
} from './DashboardInsightSections'

export function DailyOperationsDashboard({ page }) {
  if (page.status === 'error' || !page.period) {
    return <ClinicReportingState page={page} />
  }

  const content = page.period.content ?? {}
  const rowsVisible = page.operationalRowsVisible === true
  const aggregateMessage = rowsVisible
    ? 'No queue items are visible right now.'
    : 'Operational queue rows are hidden for this viewer. Use the alert counts and scorecards for aggregate status.'

  return (
    <PageShell className="py-section" width="full">
      <ClinicReportingHeader eyebrow="Daily operations" page={page} title="Daily Operational Command Center" />
      <OperationalTriageStrip
        alerts={content.alerts}
        appointmentSnapshot={content.appointment_snapshot}
        workflowAlerts={content.workflow_alerts}
      />
      <QueueWorkloadPanel
        callbackQueue={content.callback_queue}
        callQueue={content.call_queue}
        replyQueue={content.reply_queue}
        rowsVisible={rowsVisible}
      />
      <div className="grid gap-card xl:grid-cols-3">
        <QueuePanel aggregateMessage={aggregateMessage} items={content.reply_queue} title="Reply Queue" />
        <QueuePanel aggregateMessage={aggregateMessage} items={content.call_queue} title="Call Queue" />
        <QueuePanel aggregateMessage={aggregateMessage} items={content.callback_queue} title="Callback Queue" />
      </div>
      <div className="grid gap-card xl:grid-cols-2">
        <CompactMetricGrid items={content.booking_scorecard} title="Booking Scorecard" />
        <CompactMetricGrid items={content.receptionist_scorecard} title="Receptionist Scorecard" />
      </div>
      <div className="grid gap-card xl:grid-cols-2">
        <CompactMetricGrid items={content.data_hygiene} title="Data Hygiene" />
        <CompactMetricGrid items={content.reactivation_tracks} title="Reactivation Tracks" />
      </div>
      <TrustStrip sources={page.period.source_trust} />
    </PageShell>
  )
}
