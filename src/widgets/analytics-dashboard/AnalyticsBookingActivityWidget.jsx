import {
  Panel,
  PanelBody,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'
import { getAnalyticsToneColor } from './analyticsWidgetColors'

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

function MetricLabel({
  children,
  explanationEditor,
  explanationKey,
  explanations,
}) {
  return (
    <span className="inline-flex items-center gap-micro">
      {children}
      <AnalyticsExplanationPopover
        explanationEditor={explanationEditor}
        explanationKey={explanationKey}
        explanations={explanations}
        triggerSize="xs"
      />
    </span>
  )
}

function SummaryMetric({
  explanationEditor,
  explanationKey,
  explanations,
  helper,
  label,
  value,
}) {
  return (
    <div className="min-w-0 bg-block px-component py-component">
      <p className="text-ui text-text-muted">
        <MetricLabel
          explanationEditor={explanationEditor}
          explanationKey={explanationKey}
          explanations={explanations}
        >
          {label}
        </MetricLabel>
      </p>
      <p className="mt-micro text-data tabular-nums text-text-primary">
        {Number(value ?? 0).toLocaleString()}
      </p>
      {helper ? (
        <p className="mt-micro truncate text-ui text-text-muted" title={helper}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}

function NumericCell({ children, strong = false }) {
  return (
    <TableCell className={`text-right tabular-nums text-text-primary ${strong ? 'font-semibold' : ''}`}>
      {Number(children ?? 0).toLocaleString()}
    </TableCell>
  )
}

function ColumnHeading({
  children,
  explanationEditor,
  explanationKey,
  explanations,
}) {
  return (
    <MetricLabel
      explanationEditor={explanationEditor}
      explanationKey={explanationKey}
      explanations={explanations}
    >
      {children}
    </MetricLabel>
  )
}

export function AnalyticsBookingActivityWidget({
  data,
  explanationEditor,
  explanations,
  period,
  title,
}) {
  const rows = data?.rows ?? []
  const summary = data?.summary ?? {}
  const totals = data?.totals ?? {}
  const showPending = Number(summary.pending ?? 0) > 0
  const visibleSeries = (data?.series ?? []).filter(
    (series) => series.key !== 'pending' || showPending,
  )
  const upcomingHelper = showPending
    ? `scheduled, not yet seen · ${Number(summary.pending).toLocaleString()} pending outcome`
    : 'scheduled, not yet seen'

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={data?.explanation_key ?? data?.key}
        explanations={explanations}
        title={title}
        trailing={formatPeriodRange(period)}
      />
      <PanelBody className="pt-item">
        <div className="grid gap-px overflow-hidden rounded-block border border-separator bg-separator sm:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.booked`}
            explanations={explanations}
            helper={`${Number(summary.from_new_leads ?? 0).toLocaleString()} new · ${Number(summary.from_earlier_leads ?? 0).toLocaleString()} from earlier leads`}
            label="Booked"
            value={summary.booked}
          />
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.showed`}
            explanations={explanations}
            label="Showed"
            value={summary.showed}
          />
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.cancelled`}
            explanations={explanations}
            label="Cancelled"
            value={summary.cancelled}
          />
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.upcoming`}
            explanations={explanations}
            helper={upcomingHelper}
            label="Upcoming"
            value={summary.upcoming}
          />
        </div>

        <div className="mt-component overflow-hidden rounded-block border border-separator">
          <Table className="min-w-table-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">
                  <ColumnHeading
                    explanationEditor={explanationEditor}
                    explanationKey={`${data?.key}.booked`}
                    explanations={explanations}
                  >
                    Booked
                  </ColumnHeading>
                </TableHead>
                {visibleSeries.map((series) => (
                  <TableHead className="text-right" key={series.key}>
                    <ColumnHeading
                      explanationEditor={explanationEditor}
                      explanationKey={`${data?.key}.${series.key}`}
                      explanations={explanations}
                    >
                      {series.label}
                    </ColumnHeading>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-semibold text-text-primary">
                    <span className="inline-flex items-center gap-item">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getAnalyticsToneColor(row.tone) }}
                      />
                      {row.label}
                    </span>
                  </TableCell>
                  <NumericCell strong>{row.booked}</NumericCell>
                  {visibleSeries.map((series) => (
                    <NumericCell key={series.key}>{row.values?.[series.key]}</NumericCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell
                    className="py-card text-center text-text-muted"
                    colSpan={visibleSeries.length + 2}
                  >
                    No eligible bookings in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-text-primary">Total</TableCell>
                <NumericCell strong>{data?.total}</NumericCell>
                {visibleSeries.map((series) => (
                  <NumericCell key={series.key} strong>{totals[series.key]}</NumericCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {data?.note ? <p className="mt-item text-label text-text-muted">{data.note}</p> : null}
      </PanelBody>
    </Panel>
  )
}
