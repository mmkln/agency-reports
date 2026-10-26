import { cn } from '@/lib/utils'
import { Panel, PanelBody } from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'
import { getAnalyticsToneColor } from './analyticsWidgetColors'

function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`
}

function formatSourceDetails(details = []) {
  return details.map((detail) => detail.label).filter(Boolean).join(' · ')
}

function formatPeriodLabel(period) {
  if (period?.type === 'month_to_date') {
    return 'Month to date'
  }
  if (period?.type === 'year_to_date') {
    return 'Year to date'
  }
  return 'Last week'
}

function SummaryComparison({ comparison }) {
  const delta = Number(comparison?.delta ?? 0)
  const deltaPercent = comparison?.delta_percent
  const priorValue = Number(comparison?.prior_value ?? 0)
  const toneClass = delta > 0
    ? 'bg-success/10 text-success'
    : delta < 0 ? 'bg-destructive/10 text-destructive' : 'bg-fill-secondary text-text-muted'
  const deltaLabel = `${delta > 0 ? '+' : ''}${delta.toLocaleString()}`
  const percentLabel = deltaPercent == null
    ? ''
    : ` (${deltaPercent > 0 ? '+' : ''}${Number(deltaPercent).toLocaleString()}%)`

  return (
    <div className="flex flex-wrap items-center gap-tag text-label">
      <span className={cn('rounded-full px-item py-micro font-semibold', toneClass)}>
        {deltaLabel}{percentLabel}
      </span>
      <span className="text-text-muted">
        {comparison?.label ?? 'vs prior period'} ({priorValue.toLocaleString()})
      </span>
    </div>
  )
}

function SummaryMetric({
  explanationEditor,
  explanationKey,
  explanations,
  label,
  value,
}) {
  return (
    <span className="inline-flex items-center gap-micro">
      <strong className="font-semibold text-text-primary">
        {Number(value ?? 0).toLocaleString()}
      </strong>
      <span>{label}</span>
      <AnalyticsExplanationPopover
        explanationEditor={explanationEditor}
        explanationKey={explanationKey}
        explanations={explanations}
        triggerSize="xs"
      />
    </span>
  )
}

function SourceDistributionBar({ rows, total }) {
  return (
    <div
      aria-label="Lead source distribution"
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-fill-secondary"
      role="img"
    >
      {total > 0 ? rows.map((row) => (
        row.value > 0 ? (
          <span
            aria-label={`${row.label}: ${row.value}`}
            className="border-r-2 border-block last:border-r-0"
            key={row.key}
            style={{
              backgroundColor: getAnalyticsToneColor(row.tone),
              width: `${row.percentage}%`,
            }}
          />
        ) : null
      )) : null}
    </div>
  )
}

function SourceRow({ row }) {
  const detail = formatSourceDetails(row.details)

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-item border-t border-separator py-component md:grid-cols-[minmax(180px,1fr)_minmax(240px,3fr)_auto_auto]">
      <div className="col-span-3 flex min-w-0 items-start gap-item md:col-span-1">
        <span
          aria-hidden="true"
          className="mt-micro size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: getAnalyticsToneColor(row.tone) }}
        />
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">{row.label}</p>
          {detail ? <p className="truncate text-label text-text-muted" title={detail}>{detail}</p> : null}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-fill-secondary">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: getAnalyticsToneColor(row.tone),
            width: `${row.percentage}%`,
          }}
        />
      </div>
      <span className="w-10 text-right font-semibold tabular-nums text-text-primary">
        {row.value.toLocaleString()}
      </span>
      <span className="w-12 text-right tabular-nums text-text-muted">
        {formatPercent(row.percentage)}
      </span>
    </li>
  )
}

export function AnalyticsBreakdownWidget({
  data,
  explanationEditor,
  explanations,
  period,
  title,
}) {
  const total = Math.max(Number(data?.total) || 0, 0)
  const rows = (data?.rows ?? []).map((row) => ({
    ...row,
    percentage: Number(row.percentage) || 0,
    value: Math.max(Number(row.value) || 0, 0),
  }))
  const summary = data?.summary ?? {}

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={data?.explanation_key ?? data?.key}
        explanations={explanations}
        title={title}
        trailing={formatPeriodLabel(period)}
      />
      <PanelBody className="pt-item">
        <div className="flex flex-wrap items-end gap-x-component gap-y-tag">
          <p className="text-[44px] font-semibold leading-none tabular-nums text-text-primary">
            {Number(summary.value ?? total).toLocaleString()}
          </p>
          <SummaryComparison comparison={summary.comparison} />
        </div>
        <div className="mt-tag flex flex-wrap items-center gap-x-control gap-y-micro text-ui text-text-muted">
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.new_patient`}
            explanations={explanations}
            label="new patients"
            value={summary.new_patient}
          />
          <SummaryMetric
            explanationEditor={explanationEditor}
            explanationKey={`${data?.key}.returning_patient`}
            explanations={explanations}
            label="returning patients"
            value={summary.returning_patient}
          />
        </div>

        <div className="mt-component">
          <SourceDistributionBar rows={rows} total={total} />
          <ul className="mt-item">
            {rows.map((row) => <SourceRow key={row.key} row={row} />)}
          </ul>
        </div>
      </PanelBody>
    </Panel>
  )
}
