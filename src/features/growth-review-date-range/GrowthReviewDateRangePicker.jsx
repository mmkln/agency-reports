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

function ReviewPeriodOption({
  dateLabel,
  disabled,
  label,
  onSelect,
  selected,
}) {
  return (
    <Button
      aria-pressed={selected}
      className={[
        'grid h-control-large w-full grid-cols-[18px_minmax(0,1fr)_auto] justify-normal gap-control rounded-control px-control text-left',
        selected ? 'text-text-primary' : 'text-text-secondary',
      ].join(' ')}
      disabled={disabled}
      onClick={onSelect}
      size="sm"
      type="button"
      variant="ghost"
    >
      <span className="flex justify-center">
        {selected ? <Icon className="text-success" name="checkCircle2" size={14} /> : null}
      </span>
      <span className="min-w-0 truncate text-label font-medium">{label}</span>
      <span className="shrink-0 text-label font-normal text-text-muted">{dateLabel}</span>
    </Button>
  )
}

function CustomRangeEditor({
  customEnd,
  customRangeIsValid,
  customStart,
  onApply,
  onEndChange,
  onStartChange,
}) {
  return (
    <div className="grid gap-control border-t border-separator/70 pt-control">
      <p className="px-control text-label font-medium text-text-muted">Custom range</p>
      <div className="grid gap-control sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-center">
        <Input
          aria-label="Custom review period start date"
          className="h-control-small rounded-control bg-fill-secondary px-control text-label"
          max={customEnd || undefined}
          onChange={(event) => onStartChange(event.target.value)}
          type="date"
          value={customStart}
        />
        <span className="hidden text-label text-text-quaternary sm:block">-</span>
        <Input
          aria-label="Custom review period end date"
          className="h-control-small rounded-control bg-fill-secondary px-control text-label"
          min={customStart || undefined}
          onChange={(event) => onEndChange(event.target.value)}
          type="date"
          value={customEnd}
        />
        <Button
          className="justify-self-end"
          disabled={!customRangeIsValid}
          onClick={onApply}
          size="sm"
          type="button"
          variant="ghost"
        >
          Apply
        </Button>
      </div>
    </div>
  )
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
      <PopoverContent align="end" className="w-[360px] p-control">
        <div className="grid gap-control">
          <p className="px-control pt-tag text-label font-medium text-text-muted">Review period</p>

          <div className="grid gap-micro">
            {presets.filter((option) => option.key !== 'custom').map((option) => (
              <ReviewPeriodOption
                dateLabel={option.dateLabel}
                disabled={option.disabled || !option.periodId}
                key={option.key}
                label={option.label}
                onSelect={() => handlePresetSelect(option)}
                selected={option.key === selectedKey}
              />
            ))}
          </div>

          <CustomRangeEditor
            customEnd={customEnd}
            customRangeIsValid={customRangeIsValid}
            customStart={customStart}
            onApply={handleCustomApply}
            onEndChange={setCustomEnd}
            onStartChange={setCustomStart}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
