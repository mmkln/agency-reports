import { ContactCollectionAction } from '@/features/view-contact-collection'
import { Panel, PanelBody } from '@/shared/ui'

import {
  AnalyticsBookingActivitySummary,
  AnalyticsBookingActivityTable,
} from './AnalyticsBookingActivitySections'
import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'

function formatPeriodDate(value) {
  if (!value) {
    return ''
  }
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatPeriodRange(period) {
  const start = formatPeriodDate(period?.start)
  const end = formatPeriodDate(period?.end)
  return start && end ? `${start} – ${end}` : ''
}

export function AnalyticsBookingActivityWidget({
  data,
  explanationEditor,
  explanations,
  period,
  runtime,
  title,
}) {
  const summary = data?.summary ?? {}
  const cumulative = data?.cumulative
  const showPending = Number(summary.pending ?? 0) > 0
  const visibleSeries = (data?.series ?? []).filter(
    (series) => series.key !== 'pending' || showPending,
  )
  const upcomingHelper = showPending
    ? `scheduled, not yet seen · ${Number(summary.pending).toLocaleString()} pending outcome`
    : 'scheduled, not yet seen'

  function drilldownAction(key, value) {
    const descriptor = data?.drilldowns?.[key]
    if (!descriptor || Number(value ?? 0) <= 0) {
      return null
    }
    return (
      <ContactCollectionAction
        descriptor={descriptor}
        period={period}
        runtime={runtime}
      />
    )
  }

  const explanationKey = data?.explanation_key ?? data?.key

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={explanationKey}
        explanations={explanations}
        title={title}
        trailing={formatPeriodRange(period)}
      />
      <PanelBody className="pt-item">
        <AnalyticsBookingActivitySummary
          cumulative={cumulative}
          drilldownAction={drilldownAction}
          explanationEditor={explanationEditor}
          explanations={explanations}
          keyPrefix={data?.key}
          summary={summary}
          upcomingHelper={upcomingHelper}
        />
        <AnalyticsBookingActivityTable
          cumulative={cumulative}
          data={data}
          explanationEditor={explanationEditor}
          explanations={explanations}
          visibleSeries={visibleSeries}
        />
        {data?.note ? <p className="mt-item text-label text-text-muted">{data.note}</p> : null}
      </PanelBody>
    </Panel>
  )
}
