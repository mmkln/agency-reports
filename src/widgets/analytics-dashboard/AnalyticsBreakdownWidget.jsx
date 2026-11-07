import { cn } from '@/lib/utils'
import { resolveDashboardDisplayName } from '@/entities/dashboard-explanation'
import { Panel, PanelBody } from '@/shared/ui'

import { AnalyticsBreakdownTable } from './AnalyticsBreakdownTable'
import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import { AnalyticsCumulativeValue } from './AnalyticsCumulativeValue'
import { AnalyticsWidgetHeader } from './AnalyticsWidgetHeader'

function cumulativeValue(cumulative, value) {
  return cumulative ? { ...cumulative, value } : null
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
  const displayLabel = resolveDashboardDisplayName(
    explanations?.[explanationKey],
    label,
  )

  return (
    <span className="inline-flex items-center gap-micro">
      <strong className="font-semibold text-text-primary">
        {Number(value ?? 0).toLocaleString()}
      </strong>
      <span>{displayLabel}</span>
      <AnalyticsExplanationPopover
        explanationEditor={explanationEditor}
        explanationKey={explanationKey}
        explanations={explanations}
        triggerSize="xs"
      />
    </span>
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
  const cumulative = data?.cumulative
  const cumulativeRows = new Map((cumulative?.rows ?? []).map((row) => [row.key, row]))
  const rows = (data?.rows ?? []).map((row) => ({
    ...row,
    cumulative: (() => {
      const cumulativeRow = cumulativeRows.get(row.key)
      return cumulativeRow ? {
        percentage: Number(cumulativeRow.percentage) || 0,
        value: Math.max(Number(cumulativeRow.value) || 0, 0),
      } : null
    })(),
    percentage: Number(row.percentage) || 0,
    value: Math.max(Number(row.value) || 0, 0),
  }))
  const summary = data?.summary ?? {}
  const summaryLabel = summary.label ?? data?.unit_label ?? 'leads'

  return (
    <Panel>
      <AnalyticsWidgetHeader
        explanationEditor={explanationEditor}
        explanationKey={data?.explanation_key ?? data?.key}
        explanations={explanations}
        title={title}
      />
      <PanelBody className="pt-item">
        <div className="flex flex-wrap items-center gap-x-component gap-y-tag">
          <p className="text-[44px] font-semibold leading-none tabular-nums text-text-primary">
            {Number(summary.value ?? total).toLocaleString()}
            <span className="ml-tag text-heading">{summaryLabel}</span>
          </p>
          <SummaryComparison comparison={summary.comparison} />
          <div className="flex flex-wrap items-center gap-tag text-ui text-text-muted">
            <SummaryMetric
              explanationEditor={explanationEditor}
              explanationKey={`${data?.key}.new_patient`}
              explanations={explanations}
              label="new"
              value={summary.new_patient}
            />
            <span aria-hidden="true">·</span>
            <SummaryMetric
              explanationEditor={explanationEditor}
              explanationKey={`${data?.key}.returning_patient`}
              explanations={explanations}
              label="returning"
              value={summary.returning_patient}
            />
          </div>
        </div>
        <AnalyticsCumulativeValue
          className="mt-micro"
          cumulative={cumulativeValue(cumulative, cumulative?.summary?.value)}
        />
        <AnalyticsBreakdownTable
          cumulativeLabel={cumulative?.label}
          explanationEditor={explanationEditor}
          explanations={explanations}
          keyPrefix={data?.key}
          period={period}
          rows={rows}
          showCumulative={Boolean(cumulative)}
        />
      </PanelBody>
    </Panel>
  )
}
