import { resolveDashboardDisplayName } from '@/entities/dashboard-explanation'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { AnalyticsCumulativeValue } from './AnalyticsCumulativeValue'
import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { getAnalyticsToneColor } from './analyticsWidgetColors'

function cumulativeValue(cumulative, value) {
  return cumulative ? { ...cumulative, value } : null
}

function MetricLabel({ children, explanationEditor, explanationKey, explanations }) {
  const displayLabel = resolveDashboardDisplayName(
    explanations?.[explanationKey],
    children,
  )

  return (
    <span className="inline-flex items-center gap-micro">
      {displayLabel}
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
  action,
  cumulative,
  explanationEditor,
  explanationKey,
  explanations,
  helper,
  label,
  value,
}) {
  return (
    <div className="min-w-0 bg-block px-component py-component">
      <div className="flex min-h-control-sm items-center justify-between gap-item">
        <p className="text-ui text-text-muted">
          <MetricLabel
            explanationEditor={explanationEditor}
            explanationKey={explanationKey}
            explanations={explanations}
          >
            {label}
          </MetricLabel>
        </p>
        {action}
      </div>
      <p className="mt-micro text-data tabular-nums text-text-primary">
        {Number(value ?? 0).toLocaleString()}
      </p>
      <AnalyticsCumulativeValue className="mt-micro" cumulative={cumulative} />
      {helper ? (
        <p className="mt-micro truncate text-ui text-text-muted" title={helper}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}

function NumericCell({ children, cumulative, strong = false }) {
  return (
    <TableCell className={`text-right tabular-nums text-text-primary ${strong ? 'font-semibold' : ''}`}>
      <p>{Number(children ?? 0).toLocaleString()}</p>
      <AnalyticsCumulativeValue cumulative={cumulative} />
    </TableCell>
  )
}

function ColumnHeading({ children, explanationEditor, explanationKey, explanations }) {
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

export function AnalyticsBookingActivitySummary({
  cumulative,
  drilldownAction,
  explanationEditor,
  explanations,
  keyPrefix,
  summary,
  upcomingHelper,
}) {
  const metrics = [
    {
      helper: `${Number(summary.from_new_leads ?? 0).toLocaleString()} new · ${Number(summary.from_earlier_leads ?? 0).toLocaleString()} from earlier leads`,
      key: 'booked',
      label: 'Booked',
    },
    { key: 'showed', label: 'Showed' },
    { key: 'cancelled', label: 'Cancelled' },
    { helper: upcomingHelper, key: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div className="grid gap-px overflow-hidden rounded-block border border-separator bg-separator sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <SummaryMetric
          action={drilldownAction(metric.key, summary[metric.key])}
          cumulative={cumulativeValue(cumulative, cumulative?.summary?.[metric.key])}
          explanationEditor={explanationEditor}
          explanationKey={`${keyPrefix}.${metric.key}`}
          explanations={explanations}
          helper={metric.helper}
          key={metric.key}
          label={metric.label}
          value={summary[metric.key]}
        />
      ))}
    </div>
  )
}

export function AnalyticsBookingActivityTable({
  cumulative,
  data,
  explanationEditor,
  explanations,
  visibleSeries,
}) {
  const rows = data?.rows ?? []
  const totals = data?.totals ?? {}
  const cumulativeRows = new Map((cumulative?.rows ?? []).map((row) => [row.key, row]))

  return (
    <div className="mt-component overflow-hidden rounded-block border border-separator">
      <Table className="min-w-table-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            {['booked', ...visibleSeries.map((series) => series.key)].map((key) => {
              const series = visibleSeries.find((item) => item.key === key)
              return (
                <TableHead className="text-right" key={key}>
                  <ColumnHeading
                    explanationEditor={explanationEditor}
                    explanationKey={`${data?.key}.${key}`}
                    explanations={explanations}
                  >
                    {series?.label ?? 'Booked'}
                  </ColumnHeading>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? rows.map((row) => {
            const cumulativeRow = cumulativeRows.get(row.key)
            return (
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
                <NumericCell cumulative={cumulativeValue(cumulative, cumulativeRow?.booked)} strong>
                  {row.booked}
                </NumericCell>
                {visibleSeries.map((series) => (
                  <NumericCell
                    cumulative={cumulativeValue(cumulative, cumulativeRow?.values?.[series.key])}
                    key={series.key}
                  >
                    {row.values?.[series.key]}
                  </NumericCell>
                ))}
              </TableRow>
            )
          }) : (
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
            <NumericCell cumulative={cumulativeValue(cumulative, cumulative?.total)} strong>
              {data?.total}
            </NumericCell>
            {visibleSeries.map((series) => (
              <NumericCell
                cumulative={cumulativeValue(cumulative, cumulative?.totals?.[series.key])}
                key={series.key}
                strong
              >
                {totals[series.key]}
              </NumericCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
