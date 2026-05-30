import { useState } from 'react'

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

import { Icon } from '@/shared/icons'

function toDateInputValue(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function formatPeriodRangeCompact({ end, start }) {
  if (!start || !end) {
    return ''
  }

  const startDate = new Date(start)
  const endDate = new Date(end)
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth()

  if (sameMonth) {
    const month = startDate.toLocaleDateString('en-US', { month: 'short' })

    return `${month} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`
  }

  const startLabel = startDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  })
  const endLabel = endDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${startLabel} - ${endLabel}`
}

export function GrowthReviewDateRangePicker({
  end,
  onCustomApply,
  onPresetSelect,
  presets = [],
  selectedKey,
  start,
}) {
  const [open, setOpen] = useState(false)
  const [customStart, setCustomStart] = useState(toDateInputValue(start))
  const [customEnd, setCustomEnd] = useState(toDateInputValue(end))
  const selectedOption = presets.find((option) => option.key === selectedKey)
  const selectedLabel = selectedOption?.label ?? 'Custom range'
  const selectedPeriodRange = selectedOption?.dateLabel || formatPeriodRangeCompact({ end, start })
  const customRangeIsValid = Boolean(customStart && customEnd && customStart <= customEnd)

  function handleOpenChange(nextOpen) {
    if (nextOpen) {
      setCustomStart(toDateInputValue(start))
      setCustomEnd(toDateInputValue(end))
    }

    setOpen(nextOpen)
  }

  function handlePresetSelect(option) {
    if (option.disabled || !option.periodId) {
      return
    }

    onPresetSelect(option.key)
    setOpen(false)
  }

  function handleCustomApply() {
    if (!customRangeIsValid) {
      return
    }

    onCustomApply?.({
      end: customEnd,
      start: customStart,
    })
    setOpen(false)
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`Change review period. Current period ${selectedLabel}${selectedPeriodRange ? `, ${selectedPeriodRange}` : ''}`}
          className="h-control-small w-full justify-between rounded-control px-control sm:w-auto"
          size="sm"
          type="button"
          variant="ghost"
        >
          <span className="flex min-w-0 items-center gap-tag">
            <Icon className="text-text-muted" name="calendar" size={13} />
            <span className="min-w-0 truncate text-label font-medium text-text-primary">{selectedLabel}</span>
            {selectedPeriodRange ? (
              <>
                <span className="text-text-quaternary" aria-hidden="true">/</span>
                <span className="min-w-0 truncate text-label font-normal text-text-muted">{selectedPeriodRange}</span>
              </>
            ) : null}
          </span>
          <Icon className="text-text-muted" name="chevronDown" size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-card">
        <div className="grid gap-component">
          <p className="text-ui font-semibold text-text-primary">Review Period</p>

          <div className="grid gap-tag">
            {presets.filter((option) => option.key !== 'custom').map((option) => {
              const isSelected = option.key === selectedKey

              return (
                <Button
                  aria-pressed={isSelected}
                  className="w-full justify-between"
                  disabled={option.disabled || !option.periodId}
                  key={option.key}
                  onClick={() => handlePresetSelect(option)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <span className="min-w-0 truncate text-text-primary">{option.label}</span>
                  <span className="flex shrink-0 items-center gap-tag text-text-muted">
                    {option.dateLabel}
                    {isSelected ? <Icon className="text-success" name="checkCircle2" size={14} /> : null}
                  </span>
                </Button>
              )
            })}
          </div>

          <div className="grid gap-control border-t border-separator pt-component">
            <p className="text-label font-medium text-text-secondary">Custom range</p>
            <div className="grid gap-control sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Input
                aria-label="Custom review period start date"
                className="h-control-small px-control text-label"
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
                type="date"
                value={customStart}
              />
              <span className="hidden pb-control text-text-muted sm:block">-</span>
              <Input
                aria-label="Custom review period end date"
                className="h-control-small px-control text-label"
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
                type="date"
                value={customEnd}
              />
            </div>
            <Button
              disabled={!customRangeIsValid}
              onClick={handleCustomApply}
              size="sm"
              type="button"
              variant="secondary"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
