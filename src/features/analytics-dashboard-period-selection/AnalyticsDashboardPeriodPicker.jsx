import { useMemo, useState } from 'react'

import { buildReportPeriods } from '@/entities/analytics-dashboard'
import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ViewModeToggle,
} from '@/shared/ui'

const EMPTY_ITEMS = []

function toUtcDate(value) {
  const date = new Date(`${String(value ?? '').slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatShortDate(value) {
  const date = toUtcDate(value)
  return date?.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }) ?? ''
}

function formatPeriodLabel(period) {
  if (period?.type === 'month_to_date') {
    const date = toUtcDate(period.start)
    return date?.toLocaleDateString('en-US', {
      month: 'long',
      timeZone: 'UTC',
      year: 'numeric',
    }) ?? 'Month'
  }
  const start = formatShortDate(period?.start)
  const end = formatShortDate(period?.end)
  return start && end ? `${start} – ${end}` : 'Choose report'
}

function formatUpdatedLabel(period) {
  if (period.calculationStatus === 'not_calculated') return 'Not calculated'
  if (period.calculationStatus === 'stale') return 'Needs recalculation'
  const date = new Date(period.calculatedAt)
  if (Number.isNaN(date.getTime())) return 'Calculated'
  return `Updated ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
}

function calculationActionLabel(period) {
  return period.calculationStatus === 'stale' ? 'Recalculate' : 'Calculate'
}

function needsCalculation(period) {
  return ['not_calculated', 'stale'].includes(period.calculationStatus)
}

function groupByYear(periods) {
  return periods.reduce((groups, period) => {
    const year = String(period.start ?? '').slice(0, 4) || 'Reports'
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year).push(period)
    return groups
  }, new Map())
}

function PeriodRow({
  canCalculate,
  isRefreshing,
  label,
  onCalculate,
  onSelect,
  period,
  selected,
}) {
  return (
    <div
      className={cn(
        'flex min-h-target items-center gap-item rounded-item px-item transition-colors duration-motion-fast',
        selected ? 'bg-control-selected' : 'hover:bg-control-hover',
      )}
    >
      <Button
        aria-current={selected ? 'true' : undefined}
        className="h-auto min-h-target min-w-0 flex-1 justify-start gap-item rounded-item px-0 py-0 text-left hover:bg-transparent"
        onClick={() => onSelect(period)}
        size="sm"
        type="button"
        variant="ghost"
      >
        <span className="inline-flex w-component shrink-0 justify-center">
          {selected ? <Icon className="text-text-primary" name="checkCircle2" size={15} /> : null}
        </span>
        <span className="min-w-0 flex-1 truncate text-ui font-medium text-text-primary">
          {label ?? formatPeriodLabel(period)}
        </span>
        <span className="shrink-0 text-label font-normal text-text-muted">
          {formatUpdatedLabel(period)}
        </span>
      </Button>
      {needsCalculation(period) && canCalculate ? (
        <Button
          disabled={isRefreshing}
          onClick={() => onCalculate(period)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {calculationActionLabel(period)}
        </Button>
      ) : null}
    </div>
  )
}

export function AnalyticsDashboardPeriodPicker({
  canCalculate = false,
  isRefreshing = false,
  onCalculate,
  onSelect,
  periodCatalog,
  selectedPeriod,
}) {
  const types = periodCatalog?.types ?? EMPTY_ITEMS
  const selectedType = selectedPeriod?.type ?? types[0]?.key ?? 'week'
  const [requestedType, setRequestedType] = useState(null)
  const [open, setOpen] = useState(false)
  const activeType = types.some((item) => item.key === requestedType)
    ? requestedType
    : selectedType
  const periods = useMemo(() => buildReportPeriods({
    currentDate: periodCatalog?.currentDate,
    historyStart: periodCatalog?.historyStart,
    periodType: activeType,
    reports: periodCatalog?.reports ?? EMPTY_ITEMS,
  }), [activeType, periodCatalog])
  const currentPeriod = periods.find((period) => period.isCurrent) ?? null
  const historicalPeriods = periods.filter((period) => !period.isCurrent)
  const groups = useMemo(() => groupByYear(historicalPeriods), [historicalPeriods])

  function selectPeriod(period) {
    onSelect?.(period.key)
    setOpen(false)
  }

  function calculatePeriod(period) {
    onCalculate?.(period.key)
    setOpen(false)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Choose report"
          className="-mx-item mt-tag h-8 w-fit px-item text-label font-medium text-text-muted"
          size="sm"
          type="button"
          variant="ghost"
        >
          {formatPeriodLabel(selectedPeriod)}
          <Icon className="text-text-quaternary" name="chevronDown" size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-popover-wide max-w-viewport-safe p-component">
        <p className="text-ui font-semibold text-text-primary">Reports</p>
        <ViewModeToggle
          ariaLabel="Report period"
          className="mt-control w-full [&>button]:flex-1"
          items={types.map((item) => ({ label: item.label, value: item.key }))}
          onChange={setRequestedType}
          value={activeType}
        />

        <div className="mt-control max-h-popover overflow-y-auto">
          {historicalPeriods.length ? Array.from(groups.entries()).map(([year, items]) => (
            <section className="mt-control first:mt-0" key={year}>
              <h3 className="px-item text-label font-medium text-text-muted">{year}</h3>
              <div className="mt-micro grid gap-micro">
                {items.map((period) => (
                  <PeriodRow
                    canCalculate={canCalculate}
                    isRefreshing={isRefreshing}
                    key={period.key}
                    onCalculate={calculatePeriod}
                    onSelect={selectPeriod}
                    period={period}
                    selected={period.key === selectedPeriod?.key}
                  />
                ))}
              </div>
            </section>
          )) : (
            <p className="px-item py-control text-label text-text-muted">No previous periods available.</p>
          )}
        </div>
        {currentPeriod ? (
          <div className="mt-control border-t border-separator pt-control">
            <PeriodRow
              canCalculate={canCalculate}
              isRefreshing={isRefreshing}
              label={activeType === 'month_to_date' ? 'Current month' : 'Current week'}
              onCalculate={calculatePeriod}
              onSelect={selectPeriod}
              period={currentPeriod}
              selected={currentPeriod.key === selectedPeriod?.key}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
