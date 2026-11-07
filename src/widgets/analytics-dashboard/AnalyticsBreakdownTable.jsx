import { resolveDashboardDisplayName } from '@/entities/dashboard-explanation'
import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'
import { TooltipIconButton } from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'
import {
  formatAnalyticsPeriodRange,
  formatAnalyticsValue,
} from './analyticsValueFormatting'
import { getAnalyticsToneColor } from './analyticsWidgetColors'

function formatSourceDetails(details = []) {
  return details.map((detail) => detail.label).filter(Boolean).join(' · ')
}

function SourceCell({ explanationEditor, explanationKey, explanations, row }) {
  const detail = formatSourceDetails(row.details)
  const displayLabel = resolveDashboardDisplayName(
    explanations?.[explanationKey],
    row.label,
  )

  return (
    <div className="col-span-2 flex min-w-0 items-start gap-item md:col-span-1" role="rowheader">
      <span
        aria-hidden="true"
        className="mt-micro size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: getAnalyticsToneColor(row.tone) }}
      />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-micro">
          <p className="font-semibold text-text-primary">{displayLabel}</p>
          <AnalyticsExplanationPopover
            explanationEditor={explanationEditor}
            explanationKey={explanationKey}
            explanations={explanations}
            triggerSize="xs"
          />
        </div>
        {detail ? <p className="break-words text-label text-text-muted">{detail}</p> : null}
      </div>
    </div>
  )
}

function PeriodValue({ percentage, value }) {
  return (
    <div className="text-right tabular-nums" role="cell">
      <p className="mb-micro text-label text-text-muted md:hidden">This period</p>
      <div className="flex items-baseline justify-end gap-tag">
        <strong className="font-semibold text-text-primary">
          {formatAnalyticsValue(value)}
        </strong>
        <span className="text-label font-medium text-text-muted">
          {formatAnalyticsValue(percentage, 'percent')}
        </span>
      </div>
    </div>
  )
}

function AllTimeValue({ value }) {
  return (
    <div className="text-right tabular-nums" role="cell">
      <p className="mb-micro text-label text-text-muted md:hidden">All-time</p>
      <p className="font-medium text-text-muted">
        {value == null ? '—' : formatAnalyticsValue(value)}
      </p>
    </div>
  )
}

function BreakdownRow({
  explanationEditor,
  explanations,
  gridClass,
  keyPrefix,
  row,
  showCumulative,
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 items-center gap-x-component gap-y-item border-b border-separator py-component last:border-b-0',
        gridClass,
      )}
      role="row"
    >
      <SourceCell
        explanationEditor={explanationEditor}
        explanationKey={`${keyPrefix}.sources.${row.key}`}
        explanations={explanations}
        row={row}
      />
      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-fill-secondary md:col-span-1" role="cell">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: getAnalyticsToneColor(row.tone),
            width: `${Math.min(Math.max(row.percentage, 0), 100)}%`,
          }}
        />
      </div>
      <PeriodValue
        percentage={row.percentage}
        value={row.value}
      />
      {showCumulative ? (
        <AllTimeValue value={row.cumulative?.value} />
      ) : null}
    </div>
  )
}

export function AnalyticsBreakdownTable({
  cumulativeLabel = 'All-time',
  explanationEditor,
  explanations,
  keyPrefix,
  period,
  rows,
  showCumulative,
}) {
  const gridClass = showCumulative
    ? 'md:grid-cols-[minmax(180px,1fr)_minmax(240px,3fr)_minmax(96px,auto)_minmax(96px,auto)]'
    : 'md:grid-cols-[minmax(180px,1fr)_minmax(240px,3fr)_minmax(96px,auto)]'

  return (
    <div aria-label="Source comparison" className="mt-component" role="table">
      <div
        className={cn(
          'hidden items-end gap-component border-b border-separator pb-item text-label text-text-muted md:grid',
          gridClass,
        )}
        role="row"
      >
        <div role="columnheader">Source</div>
        <div role="columnheader">Period distribution</div>
        <div className="text-right" role="columnheader">
          <p className="font-semibold text-text-primary">This period</p>
          <p>{formatAnalyticsPeriodRange(period)}</p>
        </div>
        {showCumulative ? (
          <div className="flex items-center justify-end gap-micro" role="columnheader">
            <span className="font-semibold text-text-primary">{cumulativeLabel}</span>
            <TooltipIconButton
              className="text-text-quaternary hover:text-text-secondary"
              label="About all-time values"
              size="xs"
              tooltipContent="Total leads across the complete available history."
            >
              <Icon name="infoCircle" size={13} />
            </TooltipIconButton>
          </div>
        ) : null}
      </div>
      <div role="rowgroup">
        {rows.map((row) => (
          <BreakdownRow
            explanationEditor={explanationEditor}
            explanations={explanations}
            gridClass={gridClass}
            key={row.key}
            keyPrefix={keyPrefix}
            row={row}
            showCumulative={showCumulative}
          />
        ))}
      </div>
    </div>
  )
}
